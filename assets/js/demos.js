/* =========================================================================
   Interactive project demos · demos.js
   In-browser simulations of the crawler and Chat-SQL projects, plus the
   shared demo window they open in. Opened via [data-demo] buttons on the
   project rows (or programmatically via window.Demos.open(kind)).
   Vanilla JS, no dependencies — everything runs locally, no network calls.
   ========================================================================= */
'use strict';

(function () {
  const reduced = () => window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const cssVar = (name) => getComputedStyle(document.documentElement).getPropertyValue(name).trim();
  const escT = (s) => String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');

  /* ---------------- Shared modal shell (mirrors the game window) -------- */
  let modal, stageEl, titleEl, cleanup = null;

  function ensureModal() {
    if (modal) return;
    modal = document.createElement('div');
    modal.className = 'demo-modal';
    modal.hidden = true;
    modal.innerHTML = `
      <div class="demo-modal__backdrop" data-close></div>
      <div class="demo-win" role="dialog" aria-modal="true" aria-label="Interactive demo">
        <div class="demo-win__bar">
          <span class="demo-win__dot"></span><span class="demo-win__dot"></span><span class="demo-win__dot"></span>
          <span class="demo-win__title" data-title></span>
          <button class="demo-win__close" data-close aria-label="Close demo">✕</button>
        </div>
        <div class="demo-win__stage" data-stage></div>
      </div>`;
    document.body.appendChild(modal);
    titleEl = modal.querySelector('[data-title]');
    stageEl = modal.querySelector('[data-stage]');
    modal.addEventListener('click', (e) => { if (e.target.closest('[data-close]')) close(); });
    document.addEventListener('keydown', (e) => { if (e.key === 'Escape' && !modal.hidden) close(); });
  }

  function open(kind) {
    const demo = DEMOS[kind];
    if (!demo) return;
    ensureModal();
    close(); // stop anything already running
    titleEl.textContent = demo.title;
    stageEl.innerHTML = '';
    cleanup = demo.mount(stageEl) || null;
    modal.hidden = false;
    document.body.style.overflow = 'hidden';
    if (window.FocusTrap) window.FocusTrap.activate(modal.querySelector('.demo-win'));
    modal.querySelector('.demo-win__close').focus();
  }

  function close() {
    if (cleanup) { try { cleanup(); } catch (e) {} cleanup = null; }
    if (!modal || modal.hidden) return;
    modal.hidden = true;
    stageEl.innerHTML = '';
    document.body.style.overflow = '';
    if (window.FocusTrap) window.FocusTrap.release();
  }

  /* ================================================================== *
   *  DEMO 1 — Intelligent Web Crawler: frontier simulation
   *  Each dot is a page. "Semantic priority" spends the crawl budget on
   *  the highest-scored frontier pages (what the real project does with
   *  Sentence-BERT + anchor-text weighting); "Breadth-first" crawls in
   *  discovery order. Brighter node = more relevant.
   * ================================================================== */
  function mountCrawler(root) {
    root.innerHTML = `
      <div class="crawl">
        <div class="crawl__ctrl">
          <div class="seg" role="group" aria-label="Crawl strategy">
            <button class="seg__btn is-on" data-mode="semantic">Semantic priority</button>
            <button class="seg__btn" data-mode="bfs">Breadth-first</button>
          </div>
          <button class="demo-btn" data-restart>↻ Restart</button>
        </div>
        <canvas class="crawl__canvas" aria-label="Crawler frontier simulation"></canvas>
        <div class="crawl__stats">
          <span>crawled <b data-crawled>0</b> / <b>40</b></span>
          <span>avg relevance <b data-avg>—</b></span>
          <span class="crawl__cmp" data-compare></span>
        </div>
        <p class="demo-note">Each dot is a discovered page — <b>brighter = more semantically relevant</b> to the
          query. <b>Semantic priority</b> spends its 40-page budget on the pages the embedding model scores highest;
          <b>breadth-first</b> crawls in discovery order. Run both and compare the average relevance.
          Simplified simulation of the real project (Sentence-BERT scoring + anchor-text weighting + online fine-tuning).</p>
      </div>`;

    const canvas = root.querySelector('canvas');
    const ctx = canvas.getContext('2d');
    const W = 640, H = 400, BUDGET = 40, MAXN = 130;
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    canvas.width = W * dpr; canvas.height = H * dpr;
    ctx.scale(dpr, dpr);

    const elCrawled = root.querySelector('[data-crawled]');
    const elAvg = root.querySelector('[data-avg]');
    const elCmp = root.querySelector('[data-compare]');
    const results = {}; // mode → final avg relevance

    let mode = 'semantic', nodes, order, crawled, sumRel, last = -1, timer = null, raf = 0;

    const rand = (a, b) => a + Math.random() * (b - a);
    const clampRel = (v) => Math.max(0.03, Math.min(0.97, v));
    const hex = (c) => { c = c.replace('#', ''); if (c.length === 3) c = c.split('').map(x => x + x).join(''); return [0, 2, 4].map(i => parseInt(c.slice(i, i + 2), 16)); };
    const lerpC = (a, b, t) => `rgb(${a.map((v, i) => Math.round(v + (b[i] - v) * t)).join(',')})`;

    function reset() {
      stopSim();
      nodes = [{ x: W / 2, y: H / 2, rel: .9, state: 'frontier', parent: -1, found: 0 }];
      order = 0; crawled = 0; sumRel = 0; last = -1;
      updateStats();
      draw();
      timer = setInterval(step, 440);
    }
    function stopSim() { if (timer) { clearInterval(timer); timer = null; } }

    function spawn(pi) {
      const p = nodes[pi];
      const kids = 2 + (Math.random() * 2 | 0); // 2–3 outgoing links
      for (let k = 0; k < kids && nodes.length < MAXN; k++) {
        const a = rand(0, Math.PI * 2), d = rand(48, 92);
        const offTopic = Math.random() < .18; // some links lead to irrelevant clusters
        nodes.push({
          x: Math.max(14, Math.min(W - 14, p.x + Math.cos(a) * d)),
          y: Math.max(14, Math.min(H - 14, p.y + Math.sin(a) * d)),
          rel: clampRel(offTopic ? p.rel * .25 + rand(0, .12) : p.rel * .8 + rand(-.08, .22)),
          state: 'frontier', parent: pi, found: ++order,
        });
      }
    }

    function pickNext() {
      let best = -1;
      for (let i = 0; i < nodes.length; i++) {
        const n = nodes[i];
        if (n.state !== 'frontier') continue;
        if (best === -1) { best = i; continue; }
        if (mode === 'semantic' ? n.rel > nodes[best].rel : n.found < nodes[best].found) best = i;
      }
      return best;
    }

    function step() {
      const i = pickNext();
      if (i === -1 || crawled >= BUDGET) { finish(); return; }
      nodes[i].state = 'crawled';
      last = i;
      crawled++; sumRel += nodes[i].rel;
      spawn(i);
      updateStats();
      draw();
      if (crawled >= BUDGET) finish();
    }

    function finish() {
      stopSim();
      if (crawled) results[mode] = sumRel / crawled;
      updateStats();
    }

    function updateStats() {
      elCrawled.textContent = crawled;
      elAvg.textContent = crawled ? Math.round(sumRel / crawled * 100) + '%' : '—';
      if (results.semantic != null && results.bfs != null) {
        elCmp.textContent = `⚡ semantic ${Math.round(results.semantic * 100)}% vs BFS ${Math.round(results.bfs * 100)}%`;
      }
    }

    function draw() {
      ctx.clearRect(0, 0, W, H);
      const A = hex(cssVar('--accent') || '#22d3ee');
      const F = hex(cssVar('--faint') || '#65718f');
      ctx.lineWidth = 1;
      for (const n of nodes) {
        if (n.parent < 0) continue;
        const p = nodes[n.parent];
        ctx.strokeStyle = lerpC(F, A, n.state === 'crawled' ? n.rel : 0);
        ctx.globalAlpha = n.state === 'crawled' ? .5 : .16;
        ctx.beginPath(); ctx.moveTo(p.x, p.y); ctx.lineTo(n.x, n.y); ctx.stroke();
      }
      ctx.globalAlpha = 1;
      for (const n of nodes) {
        ctx.beginPath();
        if (n.state === 'crawled') {
          ctx.fillStyle = lerpC(F, A, n.rel);
          ctx.arc(n.x, n.y, 4 + n.rel * 3, 0, 7);
          ctx.fill();
        } else {
          ctx.strokeStyle = lerpC(F, A, .15);
          ctx.globalAlpha = .7;
          ctx.arc(n.x, n.y, 3, 0, 7);
          ctx.stroke();
          ctx.globalAlpha = 1;
        }
      }
      // pulse ring on the page just fetched
      if (last >= 0 && !reduced()) {
        const ph = (performance.now() % 1100) / 1100;
        ctx.beginPath();
        ctx.strokeStyle = lerpC(F, A, 1);
        ctx.globalAlpha = (1 - ph) * .55;
        ctx.arc(nodes[last].x, nodes[last].y, 7 + ph * 12, 0, 7);
        ctx.stroke();
        ctx.globalAlpha = 1;
      }
    }

    function loop() { draw(); raf = requestAnimationFrame(loop); }

    root.querySelectorAll('.seg__btn').forEach(btn => btn.addEventListener('click', () => {
      root.querySelectorAll('.seg__btn').forEach(b => b.classList.toggle('is-on', b === btn));
      mode = btn.dataset.mode;
      reset();
    }));
    root.querySelector('[data-restart]').addEventListener('click', reset);

    reset();
    if (!reduced()) loop();
    return () => { stopSim(); cancelAnimationFrame(raf); };
  }

  /* ================================================================== *
   *  DEMO 2 — Chat SQL Agent: mock NL→SQL over an in-browser table
   *  Scripted question → SQL → result flow; the result rows are genuinely
   *  computed from the mock data below (the "query" really runs, in JS).
   * ================================================================== */
  const SQL_ROWS = [
    { id: 1,  name: 'Sara Al-Harbi', dept: 'Engineering', salary: 98000,  hired: 2021 },
    { id: 2,  name: 'Omar Khan',     dept: 'Data',        salary: 91000,  hired: 2022 },
    { id: 3,  name: 'Lina Haddad',   dept: 'Engineering', salary: 104000, hired: 2019 },
    { id: 4,  name: 'Yusuf Ali',     dept: 'Sales',       salary: 62000,  hired: 2023 },
    { id: 5,  name: 'Mona Farsi',    dept: 'Data',        salary: 88000,  hired: 2020 },
    { id: 6,  name: 'Adam Noor',     dept: 'Design',      salary: 71000,  hired: 2022 },
    { id: 7,  name: 'Huda Salem',    dept: 'Engineering', salary: 95500,  hired: 2023 },
    { id: 8,  name: 'Faisal Amin',   dept: 'Sales',       salary: 58000,  hired: 2021 },
    { id: 9,  name: 'Reem Qassim',   dept: 'Design',      salary: 76000,  hired: 2024 },
    { id: 10, name: 'Tariq Aziz',    dept: 'Data',        salary: 99000,  hired: 2024 },
  ];
  const fmt = (n) => n.toLocaleString('en-US');

  const SQL_PRESETS = [
    {
      q: 'Who are the top 3 highest-paid employees?',
      kw: ['top', 'highest', 'paid', 'earn', 'earning', 'earners', 'best', '3', 'three', 'most'],
      sql: 'SELECT name, dept, salary\nFROM employees\nORDER BY salary DESC\nLIMIT 3;',
      run: () => ({
        cols: ['name', 'dept', 'salary'],
        rows: [...SQL_ROWS].sort((a, b) => b.salary - a.salary).slice(0, 3).map(r => [r.name, r.dept, fmt(r.salary)]),
      }),
    },
    {
      q: 'What is the average salary per department?',
      kw: ['average', 'avg', 'mean', 'salary', 'per', 'department', 'dept', 'each'],
      sql: 'SELECT dept, ROUND(AVG(salary)) AS avg_salary\nFROM employees\nGROUP BY dept\nORDER BY avg_salary DESC;',
      run: () => {
        const g = {};
        SQL_ROWS.forEach(r => { (g[r.dept] = g[r.dept] || []).push(r.salary); });
        const rows = Object.entries(g)
          .map(([d, s]) => [d, Math.round(s.reduce((a, b) => a + b, 0) / s.length)])
          .sort((a, b) => b[1] - a[1])
          .map(([d, v]) => [d, fmt(v)]);
        return { cols: ['dept', 'avg_salary'], rows };
      },
    },
    {
      q: 'How many people were hired after 2021?',
      kw: ['how', 'many', 'count', 'number', 'hired', 'joined', 'after', 'since', '2021', 'recent'],
      sql: 'SELECT COUNT(*) AS hired_after_2021\nFROM employees\nWHERE hired > 2021;',
      run: () => ({ cols: ['hired_after_2021'], rows: [[SQL_ROWS.filter(r => r.hired > 2021).length]] }),
    },
    {
      q: 'Which engineers earn above 90k?',
      kw: ['engineer', 'engineers', 'engineering', 'earn', 'above', 'over', 'more', '90', '90k', '90000'],
      sql: "SELECT name, salary\nFROM employees\nWHERE dept = 'Engineering'\n  AND salary > 90000;",
      run: () => ({
        cols: ['name', 'salary'],
        rows: SQL_ROWS.filter(r => r.dept === 'Engineering' && r.salary > 90000).map(r => [r.name, fmt(r.salary)]),
      }),
    },
  ];

  function matchPreset(text) {
    const words = text.toLowerCase().split(/[^a-z0-9]+/).filter(Boolean);
    let best = null, bestScore = 0;
    for (const p of SQL_PRESETS) {
      const score = words.reduce((s, w) => s + (p.kw.includes(w) ? 1 : 0), 0);
      if (score > bestScore) { best = p; bestScore = score; }
    }
    return bestScore >= 2 ? best : null;
  }

  function mountSql(root) {
    root.innerHTML = `
      <div class="sqlchat">
        <div class="sqlchat__schema mono">employees(id, name, dept, salary, hired) · ${SQL_ROWS.length} rows · mock in-browser DB</div>
        <div class="sqlchat__log" data-log aria-live="polite"></div>
        <div class="sqlchat__chips" data-chips></div>
        <form class="sqlchat__form" data-form>
          <input type="text" placeholder="Ask in plain English…" aria-label="Your question" autocomplete="off" />
          <button class="demo-btn" type="submit">Ask</button>
        </form>
        <p class="demo-note">Scripted demo — the SQL and results are computed live in your browser against the mock
          table above. The real project sends your question to <b>LlamaIndex + a locally hosted Ollama LLM</b> over
          FastAPI, so it handles arbitrary schemas and free-form questions.</p>
      </div>`;

    const log = root.querySelector('[data-log]');
    const chips = root.querySelector('[data-chips]');
    const form = root.querySelector('[data-form]');
    const input = form.querySelector('input');
    const timers = [];
    const later = (fn, ms) => timers.push(setTimeout(fn, ms));
    let busy = false;

    function addBubble(who, html) {
      const b = document.createElement('div');
      b.className = 'bubble bubble--' + who;
      b.innerHTML = html;
      log.appendChild(b);
      log.scrollTop = log.scrollHeight;
      return b;
    }
    function typeText(el, text, done) {
      if (reduced()) { el.textContent = text; log.scrollTop = log.scrollHeight; done(); return; }
      let i = 0;
      (function t() {
        el.textContent = text.slice(0, ++i);
        log.scrollTop = log.scrollHeight;
        if (i < text.length) later(t, 13); else done();
      })();
    }
    function resultTable({ cols, rows }) {
      return `<table class="sqlres"><thead><tr>${cols.map(c => `<th>${escT(c)}</th>`).join('')}</tr></thead>
        <tbody>${rows.map(r => `<tr>${r.map(c => `<td>${escT(c)}</td>`).join('')}</tr>`).join('')}</tbody></table>
        <span class="sqlres__meta">${rows.length} row${rows.length === 1 ? '' : 's'} · 0.02 s · executed locally</span>`;
    }

    function ask(text, preset) {
      if (busy || !text.trim()) return;
      busy = true;
      addBubble('user', escT(text));
      const p = preset || matchPreset(text);
      const bot = addBubble('bot', '<span class="dots" aria-label="thinking"><i></i><i></i><i></i></span>');
      later(() => {
        if (!p) {
          bot.innerHTML = 'I\'m a small scripted demo, so I only know a few questions — try one of the suggestions below. <span class="bubble__aside">(The real agent sends your question to a local LLM, so it can answer anything about the schema.)</span>';
          log.scrollTop = log.scrollHeight;
          busy = false;
          return;
        }
        bot.innerHTML = '<pre class="bubble__sql" data-sql></pre>';
        typeText(bot.querySelector('[data-sql]'), p.sql, () => {
          later(() => {
            bot.insertAdjacentHTML('beforeend', resultTable(p.run()));
            log.scrollTop = log.scrollHeight;
            busy = false;
          }, 250);
        });
      }, 700);
    }

    chips.innerHTML = SQL_PRESETS.map((p, i) => `<button type="button" class="chip" data-q="${i}">${escT(p.q)}</button>`).join('');
    chips.addEventListener('click', (e) => {
      const c = e.target.closest('[data-q]');
      if (c) ask(SQL_PRESETS[+c.dataset.q].q, SQL_PRESETS[+c.dataset.q]);
    });
    form.addEventListener('submit', (e) => { e.preventDefault(); ask(input.value); input.value = ''; });

    addBubble('bot', 'Hi! Ask me anything about the <b>employees</b> table — or tap a suggested question below. 👇');
    return () => timers.forEach(clearTimeout);
  }

  /* ---------------- Registry + public API ------------------------------ */
  const DEMOS = {
    crawler: { title: 'demo — intelligent-web-crawler · simulation', mount: mountCrawler },
    sql:     { title: 'demo — chat-sql-agent · mock, runs in your browser', mount: mountSql },
  };

  window.Demos = { open, close };
})();
