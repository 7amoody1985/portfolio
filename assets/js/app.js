/* =========================================================================
   Portfolio engine · app.js
   Renders the whole site from assets/js/config.js (CONFIG).
   You normally don't need to touch this file — edit config.js instead.
   Vanilla JS, no dependencies, no build step.
   ========================================================================= */
'use strict';

/* Small helpers ---------------------------------------------------------- */
const $ = (sel) => document.querySelector(sel);
const esc = (s) => String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
const telHref = (p) => 'tel:' + String(p).replace(/[^\d+]/g, '');

/* Focus trap for modals (palette / demos / game). One modal at a time.
   activate(root) keeps Tab inside root and remembers the previously focused
   element; release() removes the trap and restores focus. */
const FocusTrap = (() => {
  let root = null, prev = null;
  function onKey(e) {
    if (e.key !== 'Tab' || !root) return;
    const list = [...root.querySelectorAll(
      'a[href], button:not([disabled]), input:not([disabled]), select, textarea, [tabindex]:not([tabindex="-1"])'
    )].filter(el => el.offsetWidth || el.offsetHeight || el.getClientRects().length);
    if (!list.length) return;
    const first = list[0], last = list[list.length - 1];
    if (e.shiftKey && (document.activeElement === first || !root.contains(document.activeElement))) {
      e.preventDefault(); last.focus();
    } else if (!e.shiftKey && (document.activeElement === last || !root.contains(document.activeElement))) {
      e.preventDefault(); first.focus();
    }
  }
  return {
    activate(el) { root = el; prev = document.activeElement; document.addEventListener('keydown', onKey, true); },
    release() {
      if (!root) return;
      document.removeEventListener('keydown', onKey, true);
      root = null;
      if (prev && typeof prev.focus === 'function') { try { prev.focus(); } catch (e) {} }
      prev = null;
    },
  };
})();
window.FocusTrap = FocusTrap; // used by demos.js and brickbreaker.js

/* Inline SVGs ------------------------------------------------------------ */
const HERO_ICONS = {
  pin:  '<svg class="hm-ic" viewBox="0 0 24 24" aria-hidden="true"><path d="M12 21s7-6.4 7-12a7 7 0 1 0-14 0c0 5.6 7 12 7 12z"/><circle cx="12" cy="9" r="2.6"/></svg>',
  cap:  '<svg class="hm-ic" viewBox="0 0 24 24" aria-hidden="true"><path d="M3 9l9-4 9 4-9 4-9-4z"/><path d="M7 11.5V16c0 1.4 2.2 2.5 5 2.5s5-1.1 5-2.5v-4.5"/></svg>',
  chip: '<svg class="hm-ic" viewBox="0 0 24 24" aria-hidden="true"><rect x="7" y="7" width="10" height="10" rx="1.5"/><path d="M10 3v3M14 3v3M10 18v3M14 18v3M3 10h3M3 14h3M18 10h3M18 14h3"/></svg>',
};

const GLYPHS = {
  crawler:  '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.4"><circle cx="12" cy="12" r="9"/><path d="M3 12h18M12 3c3 3 3 15 0 18M12 3c-3 3-3 15 0 18"/></svg>',
  database: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.4"><ellipse cx="12" cy="5" rx="8" ry="3"/><path d="M4 5v14c0 1.7 3.6 3 8 3s8-1.3 8-3V5M4 12c0 1.7 3.6 3 8 3s8-1.3 8-3"/></svg>',
  phone:    '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.4"><rect x="6" y="2" width="12" height="20" rx="3"/><path d="M11 18h2"/></svg>',
  calendar: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.4"><rect x="3" y="5" width="18" height="16" rx="2"/><path d="M3 9h18M8 3v4M16 3v4M8 14h.01M12 14h.01M16 14h.01"/></svg>',
  code:     '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.4"><path d="M8 9l-4 3 4 3M16 9l4 3-4 3M13 6l-2 12"/></svg>',
  game:     '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.4"><rect x="2" y="7" width="20" height="10" rx="5"/><path d="M7 12h3M8.5 10.5v3"/><circle cx="15.5" cy="11.5" r=".7" fill="currentColor" stroke="none"/><circle cx="18" cy="13" r=".7" fill="currentColor" stroke="none"/></svg>',
};

/* The built-in animated two-stage pipeline demo (featured.demo === 'mri').
   Plays detect → crop → segment; stages are driven by [data-stage] + CSS. */
function mriDemoHTML() {
  return `
  <div class="mri" id="mri-demo" data-stage="0">
    <div class="mri__steps" aria-hidden="true">
      <span data-step="1">01 detect</span><i></i>
      <span data-step="2">02 crop</span><i></i>
      <span data-step="3">03 segment</span>
    </div>
    <svg viewBox="0 0 320 320" class="mri__svg" role="img" aria-label="Illustrative two-stage MRI pipeline demo: detection, crop, segmentation">
      <defs>
        <radialGradient id="brainGrad" cx="50%" cy="45%" r="60%">
          <stop offset="0%" stop-color="#3a4256"/><stop offset="70%" stop-color="#222838"/><stop offset="100%" stop-color="#141824"/>
        </radialGradient>
        <radialGradient id="tumorGrad" cx="50%" cy="50%" r="50%">
          <stop offset="0%" stop-color="#f0f4ff"/><stop offset="60%" stop-color="#aab4d4"/><stop offset="100%" stop-color="#5b6c9c"/>
        </radialGradient>
        <filter id="soft"><feGaussianBlur stdDeviation="2.2"/></filter>
      </defs>
      <circle cx="160" cy="160" r="150" fill="#0a0d16"/>
      <path d="M160 35 C 235 35 285 95 285 165 C 285 235 230 290 160 290 C 90 290 35 235 35 165 C 35 95 85 35 160 35 Z" fill="url(#brainGrad)"/>
      <g stroke="#454c63" stroke-width="1.4" fill="none" opacity=".55" filter="url(#soft)">
        <path d="M80 110 q30 -20 60 0 t60 0"/><path d="M70 150 q40 20 80 0 t80 0"/>
        <path d="M85 195 q35 -25 70 0 t70 0"/><path d="M100 235 q30 18 60 0 t60 0"/>
      </g>
      <circle class="mri__tumor" cx="205" cy="135" r="26" fill="url(#tumorGrad)" filter="url(#soft)"/>
      <!-- stage 2: everything outside the detected box dims (evenodd hole) -->
      <path class="mri__dim" d="M0 0 H320 V320 H0 Z M168 98 h74 v74 h-74 Z" fill="#04060c" fill-rule="evenodd"/>
      <!-- stage 1: detection box draws itself (dashoffset = box perimeter 296) -->
      <rect class="mri__box" x="168" y="98" width="74" height="74" fill="none" stroke="var(--accent-3)" stroke-width="2" stroke-dasharray="296" stroke-dashoffset="296"/>
      <text class="mri__boxlabel" x="168" y="92" fill="var(--accent-3)">tumor 0.98</text>
      <!-- stage 3: segmentation mask paints in -->
      <g class="mri__mask">
        <circle cx="205" cy="135" r="28" fill="var(--accent)" opacity=".35"/>
        <circle cx="205" cy="135" r="28" fill="none" stroke="var(--accent)" stroke-width="2"/>
      </g>
      <text class="mri__dice" x="205" y="192" fill="var(--accent)" text-anchor="middle">Dice 0.94</text>
    </svg>
    <button class="mri__toggle" id="mri-run">▶ Run pipeline</button>
    <span class="mri__caption">Illustrative demo — not real patient data</span>
  </div>`;
}

/* ================================================================== *
 *  Render: meta, brand, section titles, footer
 * ================================================================== */
function renderMeta() {
  const m = CONFIG.meta || {};
  if (m.title) { document.title = m.title; setAttr('#og-title', 'content', m.title); }
  if (m.description) { setAttr('#meta-description', 'content', m.description); setAttr('#og-description', 'content', m.description); }
  if (m.favicon) {
    // Branded tile: dark rounded square + gold-gradient text (1–3 chars).
    const t = String(m.favicon);
    const size = t.length === 1 ? 58 : t.length === 2 ? 46 : 32;
    const svg = `<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 100 100'>` +
      `<defs><linearGradient id='g' x1='0' y1='0' x2='1' y2='1'>` +
      `<stop offset='0' stop-color='#d6a84e'/><stop offset='1' stop-color='#f4e5bd'/></linearGradient></defs>` +
      `<rect width='100' height='100' rx='22' fill='#16181d'/>` +
      `<text x='50' y='52' dominant-baseline='central' text-anchor='middle' ` +
      `font-family='Segoe UI, Arial, sans-serif' font-weight='800' font-size='${size}' fill='url(#g)'>${esc(t)}</text></svg>`;
    setAttr('#favicon', 'href', 'data:image/svg+xml,' + encodeURIComponent(svg));
  }
}

/* JSON-LD Person schema for richer search results. Built from CONFIG:
   name/roles/description/links + the optional CONFIG.meta.schema block. */
function injectJsonLd() {
  const h = CONFIG.hero || {}, L = CONFIG.links || {}, m = CONFIG.meta || {}, x = m.schema || {};
  const canonical = document.querySelector('link[rel="canonical"]');
  const sameAs = [L.github, L.linkedin].filter(Boolean);
  const data = {
    '@context': 'https://schema.org',
    '@type': 'Person',
    name: h.name || undefined,
    url: (canonical && canonical.href) || undefined,
    jobTitle: (h.roles && h.roles[0]) || undefined,
    description: m.description || undefined,
    email: L.email ? 'mailto:' + L.email : undefined,
    sameAs: sameAs.length ? sameAs : undefined,
    alumniOf: x.university ? { '@type': 'CollegeOrUniversity', name: x.university } : undefined,
    address: x.locality ? { '@type': 'PostalAddress', addressLocality: x.locality, addressCountry: x.country || undefined } : undefined,
  };
  const s = document.createElement('script');
  s.type = 'application/ld+json';
  s.textContent = JSON.stringify(data); // stringify drops undefined fields
  document.head.appendChild(s);
}
function setAttr(sel, attr, val) { const el = $(sel); if (el) el.setAttribute(attr, val); }

function renderBrand() {
  const b = CONFIG.brand || {};
  let mark = '';
  if (b.monogram) {
    // Same gold-on-graphite tile as the favicon, inline in the nav.
    const t = String(b.monogram);
    const size = t.length === 1 ? 58 : t.length === 2 ? 46 : 32;
    mark = `<svg class="nav__mark" viewBox="0 0 100 100" aria-hidden="true">
      <defs><linearGradient id="nav-mark-g" x1="0" y1="0" x2="1" y2="1">
        <stop offset="0" stop-color="#d6a84e"/><stop offset="1" stop-color="#f4e5bd"/>
      </linearGradient></defs>
      <rect width="100" height="100" rx="24" fill="#16181d"/>
      <text x="50" y="52" dominant-baseline="central" text-anchor="middle" font-weight="800" font-size="${size}" fill="url(#nav-mark-g)">${esc(t)}</text>
    </svg>`;
  }
  $('#nav-logo').innerHTML = `${mark}<span class="nav__name">${b.pre || ''}<span class="accent"> </span>${b.post || ''}</span>`;
}

function renderSectionTitles() {
  const s = CONFIG.sections || {};
  const map = { 'title-about': s.about, 'title-skills': s.skills, 'title-projects': s.projects, 'title-experience': s.experience };
  Object.entries(map).forEach(([id, val]) => { const el = document.getElementById(id); if (el && val) el.textContent = val; });
}

function renderFooter() {
  $('#footer-left').innerHTML = `© ${new Date().getFullYear()} ${esc(CONFIG.hero?.name || '')}`;
  $('#footer-right').innerHTML = (CONFIG.footer && CONFIG.footer.right) || '';
}

/* ================================================================== *
 *  Render: hero
 * ================================================================== */
/* Split the name into per-letter spans: each gets a stagger index (--ci) and a
   solid colour sampled along the accent gradient (robust with animation, unlike
   background-clip:text). Screen readers get the plain name via .sr-only. */
function heroLetters(name) {
  const chars = String(name).split('');
  return chars.map((ch, i) => {
    const f = chars.length > 1 ? i / (chars.length - 1) : 0;
    const seg = f < .5
      ? `--c1:var(--accent);--c2:var(--accent-2);--p:${(f * 2).toFixed(3)}`
      : `--c1:var(--accent-2);--c2:var(--accent-3);--p:${((f - .5) * 2).toFixed(3)}`;
    return `<span class="ht-ch" style="--ci:${i};${seg}">${ch === ' ' ? '&nbsp;' : esc(ch)}</span>`;
  }).join('');
}

function renderHero() {
  const h = CONFIG.hero || {}, L = CONFIG.links || {};
  const meta = (h.meta || []).map((m, i) =>
    `${i ? '<span class="sep">/</span>' : ''}<span>${HERO_ICONS[m.icon] || m.icon || ''} ${m.text}</span>`).join('');
  $('#hero-inner').innerHTML = `
    <h1 class="hero__title reveal" style="--rd:60ms"><span aria-hidden="true">${heroLetters(h.name || '')}</span><span class="sr-only">${esc(h.name || '')}</span></h1>
    <p class="hero__role reveal" style="--rd:160ms"><span id="typed-role"></span><span class="caret">▌</span></p>
    <p class="hero__tag reveal" style="--rd:260ms">${h.tagline || ''}</p>
    <div class="hero__cta reveal" style="--rd:360ms">
      <a href="#projects" class="btn btn--primary">View Projects <span aria-hidden="true">↓</span></a>
      ${L.github ? `<a href="${L.github}" target="_blank" rel="noopener" class="btn btn--ghost">GitHub</a>` : ''}
      ${L.resume ? `<a href="${L.resume}" class="btn btn--ghost js-file-link" id="resume-link" target="_blank" rel="noopener">Résumé (PDF)</a>` : ''}
    </div>
    ${meta ? `<div class="hero__meta reveal" style="--rd:460ms">${meta}</div>` : ''}
    <div class="hero__bored reveal" style="--rd:580ms">
      <button type="button" class="bored-btn" data-play="brick" aria-label="Play Brick Breaker game">
        <span class="bored-btn__ring" aria-hidden="true"></span>
        <span class="bored-btn__icon" aria-hidden="true">🎮</span>
        <span>Are you bored? Play a game</span>
        <span class="bored-btn__arr" aria-hidden="true">→</span>
      </button>
    </div>`;
}

/* ================================================================== *
 *  Render: about (+ optional terminal)
 * ================================================================== */
function renderAbout() {
  const a = CONFIG.about || {};
  const text = `<div class="about__text reveal">${(a.paragraphs || []).map(p => `<p>${p}</p>`).join('')}</div>`;
  let terminal = '';
  const t = a.terminal;
  if (t && t.show !== false) {
    terminal = `
      <div class="terminal reveal" aria-hidden="true">
        <div class="terminal__bar">
          <span class="terminal__dot"></span><span class="terminal__dot"></span><span class="terminal__dot"></span>
          <span class="terminal__title">${esc(t.title || '~')}</span>
        </div>
        <pre class="terminal__body" id="terminal-body"></pre>
      </div>`;
  }
  const mount = $('#about-mount');
  mount.innerHTML = text + terminal;
  if (!terminal) mount.classList.add('about--single');
}

/* ================================================================== *
 *  Render: skills
 * ================================================================== */
function renderSkills() {
  $('#skills-grid').innerHTML = (CONFIG.skills || []).map((s, i) => `
    <div class="skill-card reveal" style="--rd:${i * 70}ms">
      <h3>${esc(s.group)}</h3>
      <div class="skill-tags">${(s.items || []).map(i => `<span>${esc(i)}</span>`).join('')}</div>
    </div>`).join('');
}

/* ================================================================== *
 *  Render: featured project
 * ================================================================== */
function renderFeatured() {
  const f = CONFIG.featured;
  const mount = $('#featured-mount');
  if (!f || f.show === false) { mount.remove(); return; }

  let media = '';
  if (f.demo === 'mri') media = mriDemoHTML();
  else if (f.image) media = `<img class="featured__img" src="${f.image}" alt="${esc(f.title)} screenshot" loading="lazy" decoding="async" />`;

  const metrics = (f.metrics && f.metrics.length) ? `
    <div class="metrics" id="metrics">
      ${f.metrics.map(m => `<div class="metric" data-value="${m.value}"><div class="metric__ring"><span class="metric__num">0%</span></div><span class="metric__label">${esc(m.label)}</span></div>`).join('')}
    </div>
    ${f.metricsCaption ? `<p class="metrics__cap">${esc(f.metricsCaption)}</p>` : ''}` : '';

  const links = [];
  if (f.repo) links.push(`<a class="btn btn--primary btn--sm" href="${f.repo}" target="_blank" rel="noopener">Source on GitHub →</a>`);
  if (f.paper) links.push(`<a class="btn btn--ghost btn--sm js-file-link" href="${f.paper}" target="_blank" rel="noopener">Read the report (PDF)</a>`);

  mount.innerHTML = `
    <article class="featured reveal${media ? '' : ' featured--nomedia'}">
      ${media ? `<div class="featured__media">${media}</div>` : ''}
      <div class="featured__body">
        ${f.kicker ? `<p class="featured__kicker">${esc(f.kicker)}</p>` : ''}
        <h3 class="featured__title">${esc(f.title)}</h3>
        <p class="featured__desc">${f.desc || ''}</p>
        ${metrics}
        ${f.note ? `<p class="featured__note">${f.note}</p>` : ''}
        ${(f.tags && f.tags.length) ? `<div class="featured__tags">${f.tags.map(t => `<span>${esc(t)}</span>`).join('')}</div>` : ''}
        ${links.length ? `<div class="featured__links">${links.join('')}</div>` : ''}
      </div>
    </article>`;
}

/* ================================================================== *
 *  Render: project grid
 * ================================================================== */
function renderProjects() {
  $('#proj-grid').innerHTML = (CONFIG.projects || []).map((p, i) => {
    // Glyph sits behind; the screenshot (if any) layers on top. If the image
    // is missing/fails to load, wireImageFallbacks() removes it → glyph shows.
    const glyph = `<div class="pcard__glyph" style="color:var(--accent-2)">${GLYPHS[p.glyph] || GLYPHS.code}</div>`;
    const img = p.image ? `<img src="${p.image}" alt="${esc(p.title)} screenshot" loading="lazy" decoding="async" />` : '';
    const size = p.size === 'lg' || p.size === 'sm' ? ` pcard--${p.size}` : '';
    return `
    <article class="pcard${size} reveal" style="--rd:${i * 80}ms">
      <div class="pcard__cover" style="background:linear-gradient(150deg,var(--card-2),var(--card));">${glyph}${img}</div>
      <div class="pcard__body">
        ${p.kicker ? `<p class="featured__kicker">${esc(p.kicker)}</p>` : ''}
        <h3 class="pcard__title">${esc(p.title)}</h3>
        <p class="pcard__desc">${p.desc || ''}</p>
        <div class="pcard__tags">${(p.tags || []).map(t => `<span>${esc(t)}</span>`).join('')}</div>
        <div class="pcard__links">${projectLinks(p)}</div>
      </div>
    </article>`;
  }).join('');
}

function projectLinks(p) {
  const out = [];
  if (p.play) out.push(`<button type="button" class="pcard__play" data-play="${p.play}">▶ Play</button>`);
  if (p.demo) out.push(`<button type="button" class="pcard__play" data-demo="${p.demo}">▶ Live demo</button>`);
  if (p.repo) out.push(`<a href="${p.repo}" target="_blank" rel="noopener">Source <span class="arr">↗</span></a>`);
  if (p.paper) out.push(`<a class="js-file-link" href="${p.paper}" target="_blank" rel="noopener">Read report <span class="arr">↗</span></a>`);
  if (!out.length) out.push(`<span class="pcard__muted">Team / academic project — no public source</span>`);
  return out.join('');
}

/* Wire up [data-play] (game) and [data-demo] (interactive demos) buttons */
function wirePlayButtons() {
  document.addEventListener('click', (e) => {
    const play = e.target.closest('[data-play]');
    if (play) { if (play.dataset.play === 'brick' && window.BrickGame) window.BrickGame.open(); return; }
    const demo = e.target.closest('[data-demo]');
    if (demo && window.Demos) window.Demos.open(demo.dataset.demo);
  });
}

/* ================================================================== *
 *  Render: timeline
 * ================================================================== */
function renderTimeline() {
  $('#timeline').innerHTML = (CONFIG.timeline || []).map((t, i) => `
    <div class="tl-item reveal" style="--rd:${i * 90}ms">
      <p class="tl-item__when">${esc(t.when)}</p>
      <p class="tl-item__role">${esc(t.role)}</p>
      <p class="tl-item__org">${esc(t.org)}</p>
      <p class="tl-item__desc">${t.desc || ''}</p>
    </div>`).join('');
}

/* ================================================================== *
 *  Render: contact
 * ================================================================== */
function renderContact() {
  const c = CONFIG.contact || {}, L = CONFIG.links || {};
  const links = [];
  if (L.github) links.push(`<a href="${L.github}" target="_blank" rel="noopener">GitHub ↗</a>`);
  if (L.linkedin) links.push(`<a href="${L.linkedin}" target="_blank" rel="noopener">LinkedIn ↗</a>`);
  if (L.phone) links.push(`<a href="${telHref(L.phone)}">${esc(L.phone)}</a>`);
  $('#contact-mount').innerHTML = `
    ${c.kicker ? `<p class="contact__kicker">05 — ${esc(c.kicker)}</p>` : ''}
    <h2 class="contact__title">${c.title || ''}</h2>
    ${c.sub ? `<p class="contact__sub">${c.sub}</p>` : ''}
    ${L.email ? `<a href="mailto:${L.email}" class="contact__mail">${esc(L.email)}</a>` : ''}
    ${links.length ? `<div class="contact__links">${links.join('')}</div>` : ''}
    ${c.extra ? `<p class="contact__langs">${c.extra}</p>` : ''}
    ${c.availability ? `<p class="hero__status contact__status"><span class="dot"></span> ${c.availability}</p>` : ''}`;
}

/* ================================================================== *
 *  Neural-network background — scroll-reactive depth field.
 *  Every node has a depth (z). Scrolling parallax-shifts nodes by depth
 *  (deep nodes drift slower), and fast scrolling stretches them into
 *  "warp" motion streaks whose length follows the scroll velocity.
 * ================================================================== */
function neuralBackground() {
  const canvas = $('#neural-bg');
  const ctx = canvas.getContext('2d');
  const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const PARA = 0.22;          // parallax strength (× node depth)
  let w, h, nodes, mouse = { x: -9999, y: -9999 }, raf;
  let scrollVel = 0, lastY = window.scrollY;

  function resize() {
    w = canvas.width = window.innerWidth;
    h = canvas.height = window.innerHeight;
    const density = Math.min(90, Math.floor((w * h) / 16000));
    nodes = Array.from({ length: density }, () => ({
      x: Math.random() * w, y: Math.random() * h,
      vx: (Math.random() - 0.5) * 0.4, vy: (Math.random() - 0.5) * 0.4,
      r: Math.random() * 1.6 + 0.6,
      z: 0.35 + Math.random() * 0.65,   // depth: 0.35 (far) … 1 (near)
    }));
  }
  function accentRGB() {
    return getComputedStyle(document.documentElement).getPropertyValue('--accent').trim() || '#22d3ee';
  }
  const wrapY = (v) => ((v % h) + h) % h;

  function tick() {
    ctx.clearRect(0, 0, w, h);
    const col = accentRGB();

    // smoothed scroll velocity → warp-streak factor
    const yNow = window.scrollY;
    scrollVel += ((yNow - lastY) - scrollVel) * 0.12;
    lastY = yNow;
    const streak = Math.max(-46, Math.min(46, scrollVel));
    const speed = Math.min(Math.abs(streak) / 46, 1);

    // advance the simulation and compute parallax render positions
    const px = [], py = [];
    for (let i = 0; i < nodes.length; i++) {
      const n = nodes[i];
      n.x += n.vx; n.y += n.vy;
      if (n.x < 0 || n.x > w) n.vx *= -1;
      if (n.y < 0 || n.y > h) n.vy *= -1;
      px[i] = n.x;
      py[i] = wrapY(n.y - yNow * PARA * n.z);
      const dx = px[i] - mouse.x, dy = py[i] - mouse.y, md = Math.hypot(dx, dy);
      if (md > 0 && md < 120) { n.x += dx / md * 1.1; n.y += dy / md * 1.1; px[i] = n.x; }
    }

    for (let i = 0; i < nodes.length; i++) {
      const n = nodes[i];
      // links between render positions (slightly brighter while scrolling fast)
      for (let j = i + 1; j < nodes.length; j++) {
        const d = Math.hypot(px[i] - px[j], py[i] - py[j]);
        if (d < 130) {
          ctx.beginPath(); ctx.moveTo(px[i], py[i]); ctx.lineTo(px[j], py[j]);
          ctx.strokeStyle = col; ctx.globalAlpha = (1 - d / 130) * (0.25 + speed * 0.15);
          ctx.lineWidth = 1; ctx.stroke();
        }
      }
      // node: a dot at rest, a depth-scaled motion streak while scrolling
      ctx.strokeStyle = ctx.fillStyle = col;
      ctx.globalAlpha = 0.35 + n.z * 0.45;
      if (Math.abs(streak) > 2.5) {
        ctx.beginPath();
        ctx.lineWidth = Math.max(1, n.r * 1.6 * n.z);
        ctx.lineCap = 'round';
        ctx.moveTo(px[i], py[i]);
        ctx.lineTo(px[i], py[i] + streak * n.z * 1.4); // trail opposite to motion
        ctx.stroke();
      } else {
        ctx.beginPath();
        ctx.arc(px[i], py[i], n.r * (0.6 + n.z * 0.8), 0, Math.PI * 2);
        ctx.fill();
      }
    }
    ctx.globalAlpha = 1;
    raf = requestAnimationFrame(tick);
  }
  resize();
  window.addEventListener('resize', resize);
  window.addEventListener('mousemove', e => { mouse.x = e.clientX; mouse.y = e.clientY; });
  window.addEventListener('mouseout', () => { mouse.x = mouse.y = -9999; });
  if (!reduce) tick();
  else { tick(); cancelAnimationFrame(raf); }
}

/* ================================================================== *
 *  Typing effect for hero role
 * ================================================================== */
function typeRole() {
  const el = $('#typed-role');
  if (!el) return;
  const roles = (CONFIG.hero && CONFIG.hero.roles && CONFIG.hero.roles.length) ? CONFIG.hero.roles : [''];
  let ri = 0, ci = 0, deleting = false;
  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) { el.textContent = roles[0]; return; }
  function loop() {
    const word = roles[ri];
    el.textContent = word.slice(0, ci);
    if (!deleting && ci < word.length) { ci++; setTimeout(loop, 75); }
    else if (!deleting && ci === word.length) { deleting = true; setTimeout(loop, 1600); }
    else if (deleting && ci > 0) { ci--; setTimeout(loop, 38); }
    else { deleting = false; ri = (ri + 1) % roles.length; setTimeout(loop, 350); }
  }
  loop();
}

/* ================================================================== *
 *  Terminal typing (built from config.about.terminal)
 * ================================================================== */
function terminalIntro() {
  const el = $('#terminal-body');
  if (!el) return;
  const t = (CONFIG.about && CONFIG.about.terminal) || {};
  const val = (v) => Array.isArray(v)
    ? '[' + v.map(x => `<span class="tv">"${esc(x)}"</span>`).join(', ') + ']'
    : `<span class="tv">"${esc(v)}"</span>`;
  const fields = Object.entries(t.fields || {});
  const lines = [
    '<span class="tc">$</span> whoami',
    `<span class="tv">${esc(t.user || 'me')}</span>`,
    '<span class="tc">$</span> cat profile.json',
    '<span class="tp">{</span>',
    ...fields.map(([k, v], i) => `  <span class="tk">"${esc(k)}"</span>: ${val(v)}${i < fields.length - 1 ? ',' : ''}`),
    '<span class="tp">}</span>',
    '<span class="tc">$</span> <span class="caret">▌</span>',
  ];
  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) { el.innerHTML = lines.join('\n'); return; }
  let i = 0;
  const card = el.closest('.terminal');
  const io = new IntersectionObserver((entries) => {
    if (entries[0].isIntersecting) {
      io.disconnect();
      (function next() {
        if (i >= lines.length) return;
        el.innerHTML = lines.slice(0, i + 1).join('\n'); i++;
        setTimeout(next, 220);
      })();
    }
  }, { threshold: 0.3 });
  io.observe(card);
}

/* ================================================================== *
 *  Metric rings — animate when scrolled into view
 * ================================================================== */
function animateMetrics() {
  const wrap = $('#metrics');
  if (!wrap) return;
  const io = new IntersectionObserver((entries) => {
    if (!entries[0].isIntersecting) return;
    io.disconnect();
    wrap.querySelectorAll('.metric').forEach(m => {
      const target = parseFloat(m.dataset.value);
      const ring = m.querySelector('.metric__ring');
      const num = m.querySelector('.metric__num');
      const dur = 1400, start = performance.now();
      function step(now) {
        const t = Math.min((now - start) / dur, 1);
        const val = target * (1 - Math.pow(1 - t, 3));
        ring.style.setProperty('--deg', (val * 360) + 'deg');
        num.textContent = (val * 100).toFixed(1) + '%';
        if (t < 1) requestAnimationFrame(step);
        else num.textContent = (target * 100).toFixed(2) + '%';
      }
      requestAnimationFrame(step);
    });
  }, { threshold: 0.4 });
  io.observe(wrap);
}

/* ================================================================== *
 *  MRI pipeline demo — staged animation (detect → crop → segment).
 *  Auto-plays once when scrolled into view; replayable via the button.
 * ================================================================== */
function mriDemo() {
  const demo = $('#mri-demo'), btn = $('#mri-run');
  if (!demo || !btn) return;
  const steps = demo.querySelectorAll('.mri__steps [data-step]');
  const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  let timers = [];

  function setStage(n) {
    demo.dataset.stage = n;
    steps.forEach(s => s.classList.toggle('on', +s.dataset.step <= n));
  }
  function run() {
    timers.forEach(clearTimeout); timers = [];
    demo.classList.add('notrans'); // snap back to stage 0 without reverse animation
    setStage(0);
    if (reduce) { demo.classList.remove('notrans'); setStage(3); btn.textContent = '↻ Replay pipeline'; return; }
    void demo.offsetWidth; // reflow so stage transitions restart cleanly
    demo.classList.remove('notrans');
    timers.push(setTimeout(() => setStage(1), 200));
    timers.push(setTimeout(() => setStage(2), 1500));
    timers.push(setTimeout(() => setStage(3), 2500));
    timers.push(setTimeout(() => { btn.textContent = '↻ Replay pipeline'; }, 3300));
  }
  btn.addEventListener('click', run);
  const io = new IntersectionObserver((entries) => {
    if (entries[0].isIntersecting) { io.disconnect(); run(); }
  }, { threshold: 0.45 });
  io.observe(demo);
  window.__runMri = run; // used by the command palette
}

/* ================================================================== *
 *  Scroll reveal + progress + active nav + nav style
 * ================================================================== */
function scrollFx() {
  const io = new IntersectionObserver((entries) => {
    entries.forEach(e => { if (e.isIntersecting) { e.target.classList.add('in'); io.unobserve(e.target); } });
  }, { threshold: 0.12 });
  document.querySelectorAll('.reveal').forEach(el => io.observe(el));

  const nav = $('#nav');
  const sections = [...document.querySelectorAll('main section[id]')];
  const links = [...document.querySelectorAll('.nav__links a')];

  // Back-to-top button with circular scroll-progress ring
  const toTop = $('#to-top');
  const ring = toTop && toTop.querySelector('.to-top__bar');
  const C = 2 * Math.PI * 19;
  if (ring) { ring.style.strokeDasharray = C; ring.style.strokeDashoffset = C; }
  if (toTop) toTop.addEventListener('click', () => window.scrollTo({ top: 0, behavior: 'smooth' }));

  function onScroll() {
    const st = window.scrollY;
    const docH = document.documentElement.scrollHeight - window.innerHeight;
    const p = docH > 0 ? st / docH : 0;
    if (ring) ring.style.strokeDashoffset = C * (1 - p);
    if (toTop) toTop.classList.toggle('show', st > 400);
    nav.classList.toggle('scrolled', st > 20);
    let current = sections[0]?.id;
    for (const s of sections) { if (st >= s.offsetTop - 140) current = s.id; }
    links.forEach(a => a.classList.toggle('active', a.getAttribute('href') === '#' + current));
  }
  window.addEventListener('scroll', onScroll, { passive: true });
  onScroll();
}

/* ================================================================== *
 *  Cursor-follow glow — site-wide (desktop pointers only)
 * ================================================================== */
function cursorGlow() {
  const glow = $('#cursor-glow');
  if (!glow) return;
  if (window.matchMedia('(hover: none)').matches) return;            // skip touch
  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
  let raf = 0, x = 0, y = 0;
  window.addEventListener('pointermove', (e) => {
    x = e.clientX; y = e.clientY;                                    // viewport coords (glow is position:fixed)
    document.body.classList.add('glow-on');
    if (!raf) raf = requestAnimationFrame(() => {
      glow.style.setProperty('--mx', x + 'px');
      glow.style.setProperty('--my', y + 'px');
      raf = 0;
    });
  });
  document.addEventListener('mouseleave', () => document.body.classList.remove('glow-on'));
}

/* ================================================================== *
 *  Tech marquee — infinite scrolling strip under the hero.
 *  Items come from CONFIG.marquee ([] hides the strip); if the key is
 *  absent entirely, short skill tags are used as a fallback.
 * ================================================================== */
function renderMarquee() {
  const strip = $('#marquee'), track = $('#marquee-track');
  if (!strip || !track) return;
  let items = CONFIG.marquee;
  if (!Array.isArray(items)) items = (CONFIG.skills || []).flatMap(s => s.items || []).filter(t => t.length <= 16).slice(0, 16);
  if (!items.length) { strip.remove(); return; }
  const grp = `<div class="marquee__grp">${items.map(t => `<span>${esc(t)}</span><i>◆</i>`).join('')}</div>`;
  track.innerHTML = grp + grp; // duplicated for a seamless -50% loop
  track.style.setProperty('--marquee-dur', Math.max(18, items.length * 2.4) + 's');
}

/* ================================================================== *
 *  Magnetic buttons — main CTAs lean toward the cursor (desktop only)
 * ================================================================== */
function magneticButtons() {
  if (window.matchMedia('(hover: none)').matches) return;
  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
  document.querySelectorAll('.btn, .bored-btn').forEach(el => {
    el.addEventListener('pointermove', (e) => {
      const r = el.getBoundingClientRect();
      const x = (e.clientX - r.left - r.width / 2) * .16;
      const y = (e.clientY - r.top - r.height / 2) * .3;
      el.style.transform = `translate(${x.toFixed(1)}px, ${y.toFixed(1)}px)`;
    });
    el.addEventListener('pointerleave', () => { el.style.transform = ''; });
  });
}

/* ================================================================== *
 *  3D tilt + cursor glare on project cards (desktop only)
 * ================================================================== */
function tiltCards() {
  if (window.matchMedia('(hover: none)').matches) return;
  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
  document.querySelectorAll('.pcard').forEach(card => {
    card.addEventListener('pointermove', (e) => {
      const r = card.getBoundingClientRect();
      const px = (e.clientX - r.left) / r.width, py = (e.clientY - r.top) / r.height;
      card.style.setProperty('--px', (px * 100).toFixed(1) + '%');
      card.style.setProperty('--py', (py * 100).toFixed(1) + '%');
      card.style.transform =
        `perspective(900px) rotateX(${((.5 - py) * 5).toFixed(2)}deg) rotateY(${((px - .5) * 6).toFixed(2)}deg) translateY(-6px)`;
    });
    card.addEventListener('pointerleave', () => { card.style.transform = ''; });
  });
}

/* ================================================================== *
 *  Project screenshots: drop to the generated glyph if the image is missing
 * ================================================================== */
function wireImageFallbacks() {
  document.querySelectorAll('.pcard__cover img').forEach((img) => {
    img.addEventListener('error', () => img.remove());
    if (img.complete && img.naturalWidth === 0) img.remove(); // already failed before listener
  });
}

/* ================================================================== *
 *  Themes (persisted) + dropdown menu
 * ================================================================== */
const THEMES = [
  { id: 'light', label: 'Porcelain' },
  { id: 'professional', label: 'Graphite Gold' },
  { id: 'neural', label: 'Aurora' },
];
function fallbackTheme() {
  const d = CONFIG.defaultTheme;
  return THEMES.some(t => t.id === d) ? d : 'light';
}
function currentTheme() {
  const t = document.documentElement.getAttribute('data-theme');
  return THEMES.some(x => x.id === t) ? t : fallbackTheme();
}
function applyTheme(id) {
  if (!THEMES.some(t => t.id === id)) id = fallbackTheme();
  document.documentElement.setAttribute('data-theme', id);
  try { localStorage.setItem('mdtheme', id); } catch (e) {}
  // keep the mobile browser chrome (address bar) tinted to match the theme
  const bg = getComputedStyle(document.documentElement).getPropertyValue('--bg').trim();
  if (bg) setAttr('#meta-theme-color', 'content', bg);
  const btn = $('#theme-btn');
  if (btn) {
    btn.querySelector('[data-label]').textContent = THEMES.find(t => t.id === id).label;
    btn.querySelector('[data-sw]').className = 'theme-swatch sw-' + id;
  }
  document.querySelectorAll('#theme-list [data-theme-value]').forEach(li => {
    li.setAttribute('aria-selected', String(li.dataset.themeValue === id));
  });
}
function themeMenu() {
  const menu = $('#theme-menu'), btn = $('#theme-btn'), list = $('#theme-list');
  applyTheme(currentTheme());
  btn.addEventListener('click', (e) => {
    e.stopPropagation();
    const open = menu.classList.toggle('open');
    btn.setAttribute('aria-expanded', String(open));
  });
  list.addEventListener('click', (e) => {
    const li = e.target.closest('[data-theme-value]');
    if (!li) return;
    applyTheme(li.dataset.themeValue);
    menu.classList.remove('open'); btn.setAttribute('aria-expanded', 'false');
  });
  document.addEventListener('click', (e) => {
    if (!menu.contains(e.target)) { menu.classList.remove('open'); btn.setAttribute('aria-expanded', 'false'); }
  });
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && menu.classList.contains('open')) {
      menu.classList.remove('open'); btn.setAttribute('aria-expanded', 'false');
    }
  });
}

/* ================================================================== *
 *  Mobile nav
 * ================================================================== */
function mobileNav() {
  const burger = $('#nav-burger'), links = $('.nav__links');
  burger.addEventListener('click', () => links.classList.toggle('open'));
  links.querySelectorAll('a').forEach(a => a.addEventListener('click', () => links.classList.remove('open')));
}

/* ================================================================== *
 *  Command palette (Ctrl/Cmd + K)
 * ================================================================== */
function commandPalette() {
  const palette = $('#palette'), input = $('#palette-input'), list = $('#palette-list'), openBtn = $('#open-palette');
  const L = CONFIG.links || {};

  const go = (hash) => { close(); document.querySelector(hash)?.scrollIntoView({ behavior: 'smooth' }); };
  const open = (url) => {
    close();
    const external = url.startsWith('http');
    // 'noopener,noreferrer' prevents the opened page from accessing window.opener (reverse tabnabbing)
    window.open(url, external ? '_blank' : '_self', external ? 'noopener,noreferrer' : '');
  };

  const COMMANDS = [
    { icon: '◇', label: 'Go to About', hint: '01', action: () => go('#about') },
    { icon: '◇', label: 'Go to Skills', hint: '02', action: () => go('#skills') },
    { icon: '◇', label: 'Go to Projects', hint: '03', action: () => go('#projects') },
    { icon: '◇', label: 'Go to Experience', hint: '04', action: () => go('#experience') },
    { icon: '◇', label: 'Go to Contact', hint: '05', action: () => go('#contact') },
  ];
  if (L.github) COMMANDS.push({ icon: '↗', label: 'Open GitHub', hint: 'link', action: () => open(L.github) });
  if (L.linkedin) COMMANDS.push({ icon: '↗', label: 'Open LinkedIn', hint: 'link', action: () => open(L.linkedin) });
  if (L.email) COMMANDS.push({ icon: '✉', label: 'Send an email', hint: 'mail', action: () => open('mailto:' + L.email) });
  if (L.resume) COMMANDS.push({ icon: '⤓', label: 'Download résumé (PDF)', hint: 'file', action: () => open(L.resume) });
  COMMANDS.push(
    { icon: '▶', label: 'Demo: Intelligent web crawler', hint: 'demo', action: () => { close(); window.Demos && window.Demos.open('crawler'); } },
    { icon: '▶', label: 'Demo: Chat SQL agent', hint: 'demo', action: () => { close(); window.Demos && window.Demos.open('sql'); } },
    { icon: '▶', label: 'Demo: MRI pipeline (featured project)', hint: 'demo', action: () => { close(); go('#projects'); setTimeout(() => window.__runMri && window.__runMri(), 700); } },
    { icon: '◒', label: 'Play Brick Breaker', hint: 'game', action: () => { close(); window.BrickGame && window.BrickGame.open(); } },
    { icon: '○', label: 'Theme: Porcelain (light)', hint: 'theme', action: () => { close(); applyTheme('light'); } },
    { icon: '◐', label: 'Theme: Graphite Gold (dark)', hint: 'theme', action: () => { close(); applyTheme('professional'); } },
    { icon: '◑', label: 'Theme: Aurora (dark)', hint: 'theme', action: () => { close(); applyTheme('neural'); } },
  );

  let filtered = COMMANDS, sel = 0;
  function render() {
    list.innerHTML = filtered.map((c, i) => `
      <li data-i="${i}" class="${i === sel ? 'sel' : ''}">
        <span class="pi">${c.icon}</span>${c.label}<small>${c.hint}</small>
      </li>`).join('') || '<li style="color:var(--faint);cursor:default">No matches</li>';
  }
  function openPalette() {
    palette.hidden = false; input.value = ''; filtered = COMMANDS; sel = 0; render();
    FocusTrap.activate(palette.querySelector('.palette__box'));
    setTimeout(() => input.focus(), 30);
  }
  function close() {
    if (palette.hidden) return;
    palette.hidden = true;
    FocusTrap.release();
  }

  input.addEventListener('input', () => {
    const q = input.value.toLowerCase();
    filtered = COMMANDS.filter(c => c.label.toLowerCase().includes(q));
    sel = 0; render();
  });
  input.addEventListener('keydown', (e) => {
    if (e.key === 'ArrowDown') { e.preventDefault(); sel = Math.min(sel + 1, filtered.length - 1); render(); }
    else if (e.key === 'ArrowUp') { e.preventDefault(); sel = Math.max(sel - 1, 0); render(); }
    else if (e.key === 'Enter') { e.preventDefault(); filtered[sel]?.action(); }
  });
  list.addEventListener('click', (e) => { const li = e.target.closest('li[data-i]'); if (li) filtered[+li.dataset.i]?.action(); });
  palette.querySelector('[data-close]').addEventListener('click', close);
  openBtn.addEventListener('click', openPalette);
  document.addEventListener('keydown', (e) => {
    if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'k') { e.preventDefault(); palette.hidden ? openPalette() : close(); }
    else if (e.key === 'Escape' && !palette.hidden) close();
  });
}

/* ================================================================== *
 *  File links (résumé + reports): dim gracefully if the file is
 *  missing, so the layout never shows a broken/404 link.
 * ================================================================== */
function checkFiles() {
  if (location.protocol === 'file:') return; // fetch is blocked on file:// — skip the check
  document.querySelectorAll('a.js-file-link').forEach(link => {
    const href = link.getAttribute('href');
    fetch(href, { method: 'HEAD' }).then(r => { if (!r.ok) markMissing(link, href); }).catch(() => markMissing(link, href));
  });
  function markMissing(a, href) {
    a.classList.add('is-missing');
    a.title = 'Add ' + href + ' to enable this link';
    a.setAttribute('aria-disabled', 'true');
    a.addEventListener('click', e => e.preventDefault());
  }
}

/* ================================================================== *
 *  Analytics (GoatCounter) — optional, privacy-friendly.
 *  Enabled by setting CONFIG.analytics.goatcounter. Gives visitors,
 *  referrers (where people come from), top pages, plus outbound-link
 *  and file-download events.
 * ================================================================== */
function analytics() {
  const code = CONFIG.analytics && CONFIG.analytics.goatcounter;
  if (!code) return;
  const endpoint = /^https?:\/\//.test(code) ? code : `https://${code}.goatcounter.com/count`;

  // Load the counter (auto-records the pageview)
  const s = document.createElement('script');
  s.async = true;
  s.src = 'https://gc.zgo.at/count.js';
  s.setAttribute('data-goatcounter', endpoint);
  document.body.appendChild(s);

  // Outbound links, file downloads and email clicks → custom events
  document.addEventListener('click', (e) => {
    const a = e.target.closest('a[href]');
    if (!a || !window.goatcounter || typeof window.goatcounter.count !== 'function') return;
    const href = a.getAttribute('href') || '';
    let path = null;
    if (/^https?:\/\//.test(a.href) && a.hostname !== location.hostname) path = 'out: ' + a.hostname + a.pathname;
    else if (/\.pdf($|\?)/i.test(href)) path = 'file: ' + href.split('/').pop();
    else if (href.startsWith('mailto:')) path = 'email';
    if (path) window.goatcounter.count({ path, title: 'event', event: true });
  }, true);
}

/* ================================================================== *
 *  Init  —  render content first, then wire up behaviours
 * ================================================================== */
document.addEventListener('DOMContentLoaded', () => {
  if (typeof CONFIG === 'undefined') { console.error('config.js failed to load — check assets/js/config.js'); return; }

  // Content
  renderMeta();
  injectJsonLd();
  renderBrand();
  renderSectionTitles();
  renderHero();
  renderAbout();
  renderSkills();
  renderFeatured();
  renderProjects();
  renderTimeline();
  renderContact();
  renderFooter();
  renderMarquee();

  // Behaviours
  neuralBackground();
  typeRole();
  terminalIntro();
  animateMetrics();
  mriDemo();
  scrollFx();
  cursorGlow();
  magneticButtons();
  tiltCards();
  wireImageFallbacks();
  themeMenu();
  mobileNav();
  commandPalette();
  checkFiles();
  wirePlayButtons();
  analytics();
});
