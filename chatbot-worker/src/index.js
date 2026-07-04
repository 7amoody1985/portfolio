/* =========================================================================
   Portfolio chatbot proxy — Cloudflare Worker.

   POST /chat  { messages: [{role:'user'|'assistant', content:'...'}, ...] }
   → streams the assistant reply as newline-delimited JSON events
     (the Anthropic SDK's raw stream event format; the widget reads
     content_block_delta / text_delta events).

   The Anthropic API key lives in a Worker secret (never in the repo):
     npx wrangler secret put ANTHROPIC_API_KEY
   ========================================================================= */
import Anthropic from '@anthropic-ai/sdk';
import { SYSTEM_PROMPT } from './knowledge.js';

const MODEL = 'claude-haiku-4-5';
const MAX_OUTPUT_TOKENS = 1024;

/* Abuse limits */
const MAX_TURNS = 16;          // messages kept per request (8 exchanges)
const MAX_MESSAGE_CHARS = 500; // per user message
const ALLOWED_ORIGINS = [
  'https://dasouqi.com',
  'https://www.dasouqi.com',
  'http://localhost:8000',
  'http://127.0.0.1:8000',
];

function corsHeaders(origin) {
  const allowed = ALLOWED_ORIGINS.includes(origin) ? origin : ALLOWED_ORIGINS[0];
  return {
    'Access-Control-Allow-Origin': allowed,
    'Access-Control-Allow-Methods': 'POST, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type',
    'Access-Control-Max-Age': '86400',
    'Vary': 'Origin',
  };
}

function json(status, body, origin) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { 'Content-Type': 'application/json', ...corsHeaders(origin) },
  });
}

/* Validate and normalise the client-sent history into clean API messages. */
function sanitizeMessages(raw) {
  if (!Array.isArray(raw) || raw.length === 0) return null;
  const msgs = raw
    .filter((m) => m && (m.role === 'user' || m.role === 'assistant') && typeof m.content === 'string')
    .map((m) => ({ role: m.role, content: m.content.trim().slice(0, m.role === 'user' ? MAX_MESSAGE_CHARS : 4000) }))
    .filter((m) => m.content.length > 0)
    .slice(-MAX_TURNS);
  if (msgs.length === 0) return null;
  if (msgs[0].role !== 'user') msgs.shift();            // history must start with a user turn
  if (msgs.length === 0 || msgs[msgs.length - 1].role !== 'user') return null; // must end with the new user message
  return msgs;
}

export default {
  async fetch(request, env) {
    const origin = request.headers.get('Origin') || '';
    const url = new URL(request.url);

    if (request.method === 'OPTIONS') {
      return new Response(null, { status: 204, headers: corsHeaders(origin) });
    }
    if (request.method !== 'POST' || url.pathname !== '/chat') {
      return json(404, { error: 'not_found' }, origin);
    }
    if (!ALLOWED_ORIGINS.includes(origin)) {
      return json(403, { error: 'forbidden_origin' }, origin);
    }

    /* Per-IP rate limit (10 req / 60 s) */
    if (env.RATE_LIMITER) {
      const ip = request.headers.get('CF-Connecting-IP') || 'unknown';
      const { success } = await env.RATE_LIMITER.limit({ key: ip });
      if (!success) return json(429, { error: 'rate_limited' }, origin);
    }

    let body;
    try {
      body = await request.json();
    } catch {
      return json(400, { error: 'invalid_json' }, origin);
    }

    const messages = sanitizeMessages(body.messages);
    if (!messages) return json(400, { error: 'invalid_messages' }, origin);

    const client = new Anthropic({ apiKey: env.ANTHROPIC_API_KEY });

    try {
      /* create({stream:true}) awaits the response headers, so upstream HTTP
         errors (bad key, rate limit, overload) reject here and reach the
         catch below as clean JSON — instead of dying inside an empty 200. */
      const stream = await client.messages.create({
        stream: true,
        model: MODEL,
        max_tokens: MAX_OUTPUT_TOKENS,
        system: [
          {
            type: 'text',
            text: SYSTEM_PROMPT,
            cache_control: { type: 'ephemeral' }, // prompt caching (prefix must stay byte-stable)
          },
        ],
        messages,
      });

      /* Newline-delimited JSON of raw stream events, piped straight through. */
      return new Response(stream.toReadableStream(), {
        headers: {
          'Content-Type': 'application/x-ndjson; charset=utf-8',
          'Cache-Control': 'no-store',
          ...corsHeaders(origin),
        },
      });
    } catch (err) {
      /* Typed SDK errors → clean JSON the widget can message on. */
      if (err instanceof Anthropic.RateLimitError) {
        return json(429, { error: 'upstream_rate_limited' }, origin);
      }
      if (err instanceof Anthropic.APIError) {
        console.error('Anthropic API error', err.status, err.message);
        return json(502, { error: 'upstream_error' }, origin);
      }
      console.error('Worker error', err);
      return json(500, { error: 'server_error' }, origin);
    }
  },
};
