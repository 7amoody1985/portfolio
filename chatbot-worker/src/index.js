/* =========================================================================
   Portfolio chatbot proxy — Cloudflare Worker.

   POST /chat  { messages: [{role:'user'|'assistant', content:'...'}, ...],
                 turnstileToken?: '...' }
   → streams the assistant reply as newline-delimited JSON events
     (the Anthropic SDK's raw stream event format; the widget reads
     content_block_delta / text_delta events).

   Abuse defences (layered):
     1. Origin allowlist + CORS.
     2. Per-IP burst limit (10 req / 60 s) via the RATE_LIMITER binding.
     3. Cloudflare Turnstile — proves a human/real browser. Enforced only
        when the TURNSTILE_SECRET is set, so the worker stays backward
        compatible until the front-end widget is configured.
     4. Daily cost caps (global + per-IP) in the USAGE KV namespace — a hard
        backstop on spend regardless of who is calling.

   Secrets live in Worker secrets (never in the repo):
     npx wrangler secret put ANTHROPIC_API_KEY
     npx wrangler secret put TURNSTILE_SECRET     (set once Turnstile is ready)
   ========================================================================= */
import Anthropic from '@anthropic-ai/sdk';
import { SYSTEM_PROMPT } from './knowledge.js';
import { selectReports } from './reports.js';

const MODEL = 'claude-haiku-4-5';
const MAX_OUTPUT_TOKENS = 1024;

/* Abuse limits */
const MAX_TURNS = 16;          // messages kept per request (8 exchanges)
const MAX_MESSAGE_CHARS = 500; // per user message

/* Daily cost caps (UTC day) — a wallet backstop, enforced via KV. */
const DAILY_GLOBAL_CAP = 800;  // total accepted messages/day across everyone
const DAILY_IP_CAP = 40;       // accepted messages/day from a single IP
const DAY_TTL_SECONDS = 172800; // counters self-expire after 2 days

const TURNSTILE_VERIFY_URL = 'https://challenges.cloudflare.com/turnstile/v0/siteverify';

const ALLOWED_ORIGINS = [
  'https://dasouqi.com',
  'https://www.dasouqi.com',
  'http://localhost:8000',
  'http://127.0.0.1:8000',
];

/* Current UTC date as YYYY-MM-DD, used to bucket the daily counters. */
function utcDay() {
  return new Date().toISOString().slice(0, 10);
}

/* Read today's global + per-IP counters. Returns { ok, code?, keys, vals } so
   the caller can enforce first and only write (bump) once the request is
   actually accepted. Fails OPEN on KV errors — a KV hiccup must not take the
   chat down; the per-minute limiter still bounds bursts. */
async function checkDailyCaps(env, ip) {
  if (!env.USAGE) return { ok: true }; // KV not bound (e.g. local dev) → skip
  const day = utcDay();
  const gKey = `g:${day}`;
  const ipKey = `ip:${day}:${ip}`;
  try {
    const [g, i] = await Promise.all([env.USAGE.get(gKey), env.USAGE.get(ipKey)]);
    const gVal = parseInt(g || '0', 10);
    const iVal = parseInt(i || '0', 10);
    if (gVal >= DAILY_GLOBAL_CAP) return { ok: false, code: 'daily_global' };
    if (iVal >= DAILY_IP_CAP) return { ok: false, code: 'daily_ip' };
    return { ok: true, gKey, ipKey, gVal, iVal };
  } catch (e) {
    console.error('KV read failed', e);
    return { ok: true }; // fail open
  }
}

/* Increment the counters for an accepted request. Best-effort; never blocks. */
async function bumpDailyCaps(env, info) {
  if (!env.USAGE || !info.gKey) return;
  try {
    await Promise.all([
      env.USAGE.put(info.gKey, String(info.gVal + 1), { expirationTtl: DAY_TTL_SECONDS }),
      env.USAGE.put(info.ipKey, String(info.iVal + 1), { expirationTtl: DAY_TTL_SECONDS }),
    ]);
  } catch (e) {
    console.error('KV write failed', e);
  }
}

/* Verify a Cloudflare Turnstile token. Disabled (returns true) until the
   TURNSTILE_SECRET is configured, so deploying the worker never breaks a
   front-end that isn't sending tokens yet. Once enabled: a missing token or an
   explicit failure is rejected; a network error to siteverify fails OPEN (the
   daily cap still protects spend) to avoid outages on Cloudflare hiccups. */
async function verifyTurnstile(env, token, ip) {
  if (!env.TURNSTILE_SECRET) return true; // not configured → skip
  if (!token || typeof token !== 'string') return false;
  try {
    const form = new URLSearchParams();
    form.append('secret', env.TURNSTILE_SECRET);
    form.append('response', token);
    if (ip) form.append('remoteip', ip);
    const res = await fetch(TURNSTILE_VERIFY_URL, { method: 'POST', body: form });
    const data = await res.json();
    if (data.success === true) return true;
    console.warn('Turnstile validation rejected', {
      errorCodes: data['error-codes'] || [],
      hostname: data.hostname || '',
      action: data.action || '',
    });
    return false;
  } catch (e) {
    console.error('Turnstile verify failed', e);
    return true; // fail open on infra error
  }
}

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

    const ip = request.headers.get('CF-Connecting-IP') || 'unknown';

    /* Per-IP burst limit (10 req / 60 s) */
    if (env.RATE_LIMITER) {
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

    /* Daily cost caps first (cheap KV reads) — a request over budget is
       rejected before we spend a Turnstile verify or an Anthropic call. */
    const daily = await checkDailyCaps(env, ip);
    if (!daily.ok) return json(429, { error: 'daily_limit' }, origin);

    /* Bot gate: prove a real browser via Turnstile (no-op until configured). */
    const human = await verifyTurnstile(env, body.turnstileToken, ip);
    if (!human) return json(403, { error: 'failed_challenge' }, origin);

    /* Accepted — count it against today's budget, then call the model. */
    await bumpDailyCaps(env, daily);

    const client = new Anthropic({ apiKey: env.ANTHROPIC_API_KEY });

    /* When the visitor is asking about a specific project, append a detailed
       digest of that project's report as a second system block. Kept separate
       (and separately cached) so the stable SYSTEM_PROMPT prefix keeps its own
       cache hit, and base chats never carry the report tokens. */
    const system = [
      {
        type: 'text',
        text: SYSTEM_PROMPT,
        cache_control: { type: 'ephemeral' }, // prompt caching (prefix must stay byte-stable)
      },
    ];
    const reports = selectReports(messages);
    if (reports) {
      system.push({ type: 'text', text: reports, cache_control: { type: 'ephemeral' } });
    }

    try {
      /* create({stream:true}) awaits the response headers, so upstream HTTP
         errors (bad key, rate limit, overload) reject here and reach the
         catch below as clean JSON — instead of dying inside an empty 200. */
      const stream = await client.messages.create({
        stream: true,
        model: MODEL,
        max_tokens: MAX_OUTPUT_TOKENS,
        system,
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
