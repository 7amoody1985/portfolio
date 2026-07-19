/* =========================================================================
   AI chatbot widget · chatbot.js
   Floating assistant that answers questions about the CV & projects.
   Talks to the Cloudflare Worker in chatbot-worker/ (which holds the
   Claude API key); the worker streams the reply back as ND-JSON events.
   Configured via CONFIG.chatbot — vanilla JS, no dependencies.
   ========================================================================= */
'use strict';

(function () {
  /* CONFIG is a top-level `const` (not a window property) — feature-detect it */
  const cfg = (typeof CONFIG !== 'undefined' && CONFIG.chatbot) || null;
  if (!cfg || !cfg.show) return;

  /* On localhost, talk to the local `wrangler dev` worker automatically. */
  const isLocal = /^(localhost|127\.0\.0\.1)$/.test(location.hostname);
  const ENDPOINT = isLocal ? 'http://127.0.0.1:8787/chat' : (cfg.endpoint || '');
  if (!ENDPOINT) return; // not deployed yet — render nothing

  const esc = (s) => String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
  const EMAIL = (typeof CONFIG !== 'undefined' && CONFIG.links && CONFIG.links.email) || '';
  const MAX_INPUT = 500;   // matches the worker's per-message cap
  const MAX_TURNS = 16;    // matches the worker's history cap

  /* Cloudflare Turnstile (bot protection). Only in production and only when a
     site key is configured — skipped on localhost so `wrangler dev` is easy. */
  const SITE_KEY = (!isLocal && cfg.turnstileSiteKey) || '';

  const FALLBACK_MSG = 'The assistant is unavailable right now — please email Mohammed directly instead.';
  const RATE_MSG = "You're sending messages a little too fast — give it a minute and try again.";
  const DAILY_MSG = "The assistant has reached today's usage limit — please email Mohammed directly instead.";
  const CHALLENGE_MSG = "Couldn't verify you're human — please try sending your message again.";

  /* ---------------- DOM ---------------- */
  const root = document.createElement('div');
  root.className = 'aichat';
  root.innerHTML = `
    <button class="aichat__launcher" aria-label="Open AI assistant" aria-expanded="false" title="${esc(cfg.title || 'AI assistant')}">
      <svg class="aichat__ic-chat" viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
        <path d="M21 11.5a8.4 8.4 0 0 1-8.5 8.3c-1.3 0-2.6-.3-3.7-.8L3 20l1.1-5A8.3 8.3 0 1 1 21 11.5z"/>
        <path d="M8.5 10.5h.01M12.5 10.5h.01M16.5 10.5h.01" stroke-width="2.4"/>
      </svg>
      <svg class="aichat__ic-close" viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" aria-hidden="true">
        <path d="M6 6l12 12M18 6L6 18"/>
      </svg>
    </button>
    <section class="aichat__panel" role="dialog" aria-modal="false" aria-label="${esc(cfg.title || 'AI assistant')}" hidden>
      <header class="aichat__head">
        <span class="aichat__dot" aria-hidden="true"></span>
        <span class="aichat__title">${esc(cfg.title || 'AI assistant')}</span>
        <button class="aichat__close" aria-label="Close chat">✕</button>
      </header>
      <div class="aichat__log" data-log aria-live="polite"></div>
      <div class="aichat__chips" data-chips></div>
      <form class="aichat__form" data-form>
        <input class="aichat__input" type="text" name="q" autocomplete="off"
               maxlength="${MAX_INPUT}" placeholder="Ask about Mohammed…" aria-label="Your question" />
        <button class="aichat__send" type="submit" aria-label="Send">
          <svg viewBox="0 0 24 24" width="17" height="17" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M5 12h13M13 6l6 6-6 6"/></svg>
        </button>
      </form>
      <div class="aichat__foot mono">AI answers from Mohammed's CV — may be imperfect.</div>
    </section>`;
  document.body.appendChild(root);
  document.body.classList.add('has-aichat');

  const launcher = root.querySelector('.aichat__launcher');
  const panel = root.querySelector('.aichat__panel');
  const log = root.querySelector('[data-log]');
  const chips = root.querySelector('[data-chips]');
  const form = root.querySelector('[data-form]');
  const input = form.querySelector('input');
  const closeBtn = root.querySelector('.aichat__close');

  /* ---------------- state ---------------- */
  const history = []; // [{role, content}] — what we send to the worker
  let busy = false;
  let opened = false;

  /* ---------------- rendering ---------------- */
  function addBubble(kind, text) {
    const el = document.createElement('div');
    el.className = 'aichat__msg aichat__msg--' + kind;
    el.textContent = text;
    log.appendChild(el);
    log.scrollTop = log.scrollHeight;
    return el;
  }

  function addTyping() {
    const el = document.createElement('div');
    el.className = 'aichat__msg aichat__msg--bot aichat__typing';
    el.innerHTML = '<span></span><span></span><span></span>';
    el.setAttribute('aria-label', 'Assistant is typing');
    log.appendChild(el);
    log.scrollTop = log.scrollHeight;
    return el;
  }

  function errorBubble(text) {
    const el = addBubble('bot', text);
    if (EMAIL && (text === FALLBACK_MSG || text === DAILY_MSG)) {
      el.appendChild(document.createTextNode(' '));
      const a = document.createElement('a');
      a.href = 'mailto:' + EMAIL;
      a.textContent = EMAIL;
      el.appendChild(a);
    }
    el.classList.add('aichat__msg--err');
  }

  /* ---------------- Turnstile (bot gate) ----------------
     Loads the Cloudflare Turnstile script on demand and mints a fresh,
     single-use token per message. Runs silently for most visitors
     (`appearance: 'interaction-only'`), but when Cloudflare can't verify a
     browser passively (VPNs, locked-down corporate browsers) it escalates to
     a visible checkbox challenge rendered inside the chat panel — the widget
     for the site key must be "Managed" mode in the Cloudflare dashboard for
     this to work. Returns null when Turnstile isn't configured (localhost or
     no site key), in which case the worker doesn't require a token either. */
  let tsWidgetId = null;
  let tsPending = null;       // { resolve, reject } for the in-flight execute()
  let tsScriptPromise = null;
  let tsGate = null;          // panel slot the interactive challenge renders into
  let tsTimer = 0;
  const TS_SCRIPT_TIMEOUT_MS = 15000;
  const TS_SILENT_TIMEOUT_MS = 25000;
  const TS_INTERACTIVE_TIMEOUT_MS = 180000;

  function loadTurnstileScript() {
    if (window.turnstile) return Promise.resolve();
    if (tsScriptPromise) return tsScriptPromise;
    tsScriptPromise = new Promise((resolve, reject) => {
      const s = document.createElement('script');
      let done = false;
      const finish = (fn, value) => {
        if (done) return;
        done = true;
        clearTimeout(timer);
        s.onload = null;
        s.onerror = null;
        fn(value);
      };
      const timer = setTimeout(() => finish(reject, new Error('turnstile_script_timeout')), TS_SCRIPT_TIMEOUT_MS);
      s.src = 'https://challenges.cloudflare.com/turnstile/v0/api.js?render=explicit';
      s.async = true;
      s.defer = true;
      s.onload = () => finish(resolve);
      s.onerror = () => finish(reject, new Error('turnstile_script'));
      document.head.appendChild(s);
    }).catch((e) => {
      tsScriptPromise = null;
      throw e;
    });
    return tsScriptPromise;
  }

  function showGate() {
    if (tsGate) { tsGate.classList.add('is-active'); log.scrollTop = log.scrollHeight; }
  }
  function hideGate() {
    if (tsGate) tsGate.classList.remove('is-active');
  }

  /* (Re)arm the token timeout. Short while the check is silent; extended when
     an interactive challenge appears so the visitor has time to solve it. */
  function armTimeout(ms) {
    clearTimeout(tsTimer);
    tsTimer = setTimeout(() => {
      if (tsPending) { const p = tsPending; tsPending = null; hideGate(); p.reject(new Error('turnstile_timeout')); }
    }, ms);
  }

  function ensureTurnstileWidget() {
    if (tsWidgetId !== null) return;
    tsGate = document.createElement('div');
    tsGate.className = 'aichat__gate';
    tsGate.innerHTML = '<div class="aichat__gate-note">Quick security check — verify below to continue.</div>';
    const holder = document.createElement('div');
    tsGate.appendChild(holder);
    panel.insertBefore(tsGate, form);
    tsWidgetId = window.turnstile.render(holder, {
      sitekey: SITE_KEY,
      size: 'flexible',
      execution: 'execute',              // run only when we call execute()
      appearance: 'interaction-only',    // invisible unless a challenge is needed
      callback: (token) => {
        hideGate();
        if (tsPending) {
          if (token) tsPending.resolve(token);
          else tsPending.reject(new Error('turnstile_empty_token'));
          tsPending = null;
        }
      },
      'error-callback': () => { hideGate(); if (tsPending) { tsPending.reject(new Error('turnstile_error')); tsPending = null; } },
      'expired-callback': () => { hideGate(); if (tsPending) { tsPending.reject(new Error('turnstile_expired')); tsPending = null; } },
      'timeout-callback': () => { hideGate(); if (tsPending) { tsPending.reject(new Error('turnstile_interactive_timeout')); tsPending = null; } },
      'before-interactive-callback': () => { showGate(); armTimeout(TS_INTERACTIVE_TIMEOUT_MS); },
      'after-interactive-callback': hideGate,
      'unsupported-callback': () => { hideGate(); if (tsPending) { tsPending.reject(new Error('turnstile_unsupported')); tsPending = null; } },
    });
    if (tsWidgetId === undefined || tsWidgetId === null) throw new Error('turnstile_render');
  }

  function getTurnstileToken() {
    if (!SITE_KEY) return Promise.resolve(null);
    return loadTurnstileScript().then(() => {
      ensureTurnstileWidget();
      return new Promise((resolve, reject) => {
        armTimeout(TS_SILENT_TIMEOUT_MS);
        tsPending = {
          resolve: (t) => { clearTimeout(tsTimer); resolve(t); },
          reject: (e) => { clearTimeout(tsTimer); reject(e); },
        };
        try {
          window.turnstile.reset(tsWidgetId);
          window.turnstile.execute(tsWidgetId);
        } catch (e) {
          clearTimeout(tsTimer);
          tsPending = null;
          hideGate();
          reject(e);
        }
      });
    });
  }

  function postChat(token) {
    return fetch(ENDPOINT, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ messages: history.slice(-MAX_TURNS), turnstileToken: token }),
    });
  }

  async function readErrorCode(res) {
    try { return (await res.json()).error || ''; } catch (e) { return ''; }
  }

  /* ---------------- open / close ---------------- */
  function open() {
    if (opened) return;
    opened = true;
    panel.hidden = false;
    launcher.setAttribute('aria-expanded', 'true');
    root.classList.add('is-open');
    if (!log.childElementCount && cfg.greeting) addBubble('bot', cfg.greeting);
    renderChips();
    if (window.FocusTrap) window.FocusTrap.activate(panel);
    input.focus();
  }

  function close() {
    if (!opened) return;
    opened = false;
    panel.hidden = true;
    launcher.setAttribute('aria-expanded', 'false');
    root.classList.remove('is-open');
    if (window.FocusTrap) window.FocusTrap.release();
  }

  launcher.addEventListener('click', () => (opened ? close() : open()));
  closeBtn.addEventListener('click', close);
  document.addEventListener('keydown', (e) => { if (e.key === 'Escape' && opened) close(); });

  /* ---------------- suggestion chips ---------------- */
  function renderChips() {
    const list = Array.isArray(cfg.suggestions) ? cfg.suggestions : [];
    if (history.length || !list.length) { chips.innerHTML = ''; return; }
    chips.innerHTML = list.map((s) => `<button type="button" class="aichat__chip">${esc(s)}</button>`).join('');
    chips.querySelectorAll('button').forEach((b) =>
      b.addEventListener('click', () => send(b.textContent)));
  }

  /* ---------------- send + stream ---------------- */
  async function send(text) {
    const q = String(text || '').trim().slice(0, MAX_INPUT);
    if (!q || busy) return;
    busy = true;
    input.value = '';
    chips.innerHTML = '';
    history.push({ role: 'user', content: q });
    addBubble('user', q);
    const typing = addTyping();

    let bubble = null;
    let answer = '';
    try {
      /* Mint a fresh bot-gate token first (no-op when Turnstile isn't set up). */
      let token = null;
      try {
        token = await getTurnstileToken();
      } catch (e) {
        typing.remove();
        errorBubble(CHALLENGE_MSG);
        history.pop();
        return;
      }

      let res = await postChat(token);

      if (!res.ok) {
        let code = await readErrorCode(res);
        if (code === 'failed_challenge') {
          try {
            token = await getTurnstileToken();
            res = await postChat(token);
            code = res.ok ? '' : await readErrorCode(res);
          } catch (e) {}
        }
        if (res.ok) {
          // Continue into the normal stream reader below after a fresh token succeeds.
        } else {
          typing.remove();
          let msg = FALLBACK_MSG;
          if (code === 'daily_limit') msg = DAILY_MSG;
          else if (code === 'failed_challenge') msg = CHALLENGE_MSG;
          else if (res.status === 429 || code === 'rate_limited') msg = RATE_MSG;
          errorBubble(msg);
          history.pop(); // let the visitor retry the same question later
          return;
        }
      }

      /* ND-JSON stream: one raw Anthropic event per line. */
      const reader = res.body.getReader();
      const decoder = new TextDecoder();
      let buf = '';
      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        buf += decoder.decode(value, { stream: true });
        const lines = buf.split('\n');
        buf = lines.pop(); // keep the trailing partial line
        for (const line of lines) {
          if (!line.trim()) continue;
          let ev;
          try { ev = JSON.parse(line); } catch (e) { continue; }
          if (ev.type === 'content_block_delta' && ev.delta && ev.delta.type === 'text_delta') {
            if (!bubble) { typing.remove(); bubble = addBubble('bot', ''); }
            answer += ev.delta.text;
            bubble.textContent = answer;
            log.scrollTop = log.scrollHeight;
          }
        }
      }

      typing.remove();
      if (answer) {
        history.push({ role: 'assistant', content: answer });
      } else {
        errorBubble(FALLBACK_MSG);
        history.pop();
      }
    } catch (e) {
      typing.remove();
      if (bubble) bubble.remove();
      errorBubble(FALLBACK_MSG);
      history.pop();
    } finally {
      /* keep client history bounded like the server */
      if (history.length > MAX_TURNS) history.splice(0, history.length - MAX_TURNS);
      busy = false;
      if (opened) input.focus();
    }
  }

  form.addEventListener('submit', (e) => { e.preventDefault(); send(input.value); });
})();
