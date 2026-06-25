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
};

/* The built-in interactive MRI segmentation demo (featured.demo === 'mri') */
function mriDemoHTML() {
  return `
  <div class="mri" id="mri-demo">
    <svg viewBox="0 0 320 320" class="mri__svg" role="img" aria-label="Illustrative MRI segmentation demo">
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
      <g class="mri__overlay">
        <circle cx="205" cy="135" r="28" fill="#22d3ee" opacity=".32"/>
        <circle cx="205" cy="135" r="28" fill="none" stroke="#22d3ee" stroke-width="2"/>
        <rect x="168" y="98" width="74" height="74" fill="none" stroke="#c084fc" stroke-width="2" stroke-dasharray="5 4"/>
        <text x="168" y="92" class="mri__label" fill="#c084fc">tumor 0.98</text>
      </g>
    </svg>
    <button class="mri__toggle" id="mri-toggle" aria-pressed="true">Hide prediction</button>
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
    const svg = `<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 100 100'><text y='.9em' font-size='90' font-family='monospace'>${m.favicon}</text></svg>`;
    setAttr('#favicon', 'href', 'data:image/svg+xml,' + encodeURIComponent(svg));
  }
}
function setAttr(sel, attr, val) { const el = $(sel); if (el) el.setAttribute(attr, val); }

function renderBrand() {
  const b = CONFIG.brand || {};
  $('#nav-logo').innerHTML =
    `${b.monogram ? `<span class="nav__mono">${b.monogram}</span> ` : ''}${b.pre || ''}<span class="accent">.</span>${b.post || ''}`;
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
function renderHero() {
  const h = CONFIG.hero || {}, L = CONFIG.links || {};
  const meta = (h.meta || []).map((m, i) =>
    `${i ? '<span class="sep">/</span>' : ''}<span>${HERO_ICONS[m.icon] || m.icon || ''} ${m.text}</span>`).join('');
  $('#hero-inner').innerHTML = `
    ${h.status ? `<p class="hero__status"><span class="dot"></span> ${h.status}</p>` : ''}
    <h1 class="hero__title">${esc(h.name || '')}</h1>
    <p class="hero__role"><span id="typed-role"></span><span class="caret">▌</span></p>
    <p class="hero__tag">${h.tagline || ''}</p>
    <div class="hero__cta">
      <a href="#projects" class="btn btn--primary">View Projects <span aria-hidden="true">↓</span></a>
      ${L.github ? `<a href="${L.github}" target="_blank" rel="noopener" class="btn btn--ghost">GitHub</a>` : ''}
      ${L.resume ? `<a href="${L.resume}" class="btn btn--ghost js-file-link" id="resume-link" target="_blank" rel="noopener">Résumé (PDF)</a>` : ''}
    </div>
    ${meta ? `<div class="hero__meta">${meta}</div>` : ''}`;
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
  $('#skills-grid').innerHTML = (CONFIG.skills || []).map(s => `
    <div class="skill-card reveal">
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
  else if (f.image) media = `<img class="featured__img" src="${f.image}" alt="${esc(f.title)} screenshot" loading="lazy" />`;

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
  $('#proj-grid').innerHTML = (CONFIG.projects || []).map(p => {
    const cover = p.image
      ? `<img src="${p.image}" alt="${esc(p.title)} screenshot" loading="lazy" />`
      : `<div class="pcard__glyph" style="color:var(--accent-2)">${GLYPHS[p.glyph] || GLYPHS.code}</div>`;
    const coverBg = p.image ? '' : 'background:linear-gradient(150deg,var(--card-2),var(--card));';
    return `
    <article class="pcard reveal">
      <div class="pcard__cover" style="${coverBg}">${cover}</div>
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
  if (p.repo) out.push(`<a href="${p.repo}" target="_blank" rel="noopener">Source ↗</a>`);
  if (p.paper) out.push(`<a class="js-file-link" href="${p.paper}" target="_blank" rel="noopener">Read report ↗</a>`);
  if (!out.length) out.push(`<span class="pcard__muted">Team / academic project — no public source</span>`);
  return out.join('');
}

/* ================================================================== *
 *  Render: timeline
 * ================================================================== */
function renderTimeline() {
  $('#timeline').innerHTML = (CONFIG.timeline || []).map(t => `
    <div class="tl-item reveal">
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
    ${c.extra ? `<p class="contact__langs">${c.extra}</p>` : ''}`;
}

/* ================================================================== *
 *  Neural-network background
 * ================================================================== */
function neuralBackground() {
  const canvas = $('#neural-bg');
  const ctx = canvas.getContext('2d');
  const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  let w, h, nodes, mouse = { x: -9999, y: -9999 }, raf;

  function resize() {
    w = canvas.width = window.innerWidth;
    h = canvas.height = window.innerHeight;
    const density = Math.min(90, Math.floor((w * h) / 16000));
    nodes = Array.from({ length: density }, () => ({
      x: Math.random() * w, y: Math.random() * h,
      vx: (Math.random() - 0.5) * 0.4, vy: (Math.random() - 0.5) * 0.4,
      r: Math.random() * 1.6 + 0.6,
    }));
  }
  function accentRGB() {
    return getComputedStyle(document.documentElement).getPropertyValue('--accent').trim() || '#22d3ee';
  }
  function tick() {
    ctx.clearRect(0, 0, w, h);
    const col = accentRGB();
    for (let i = 0; i < nodes.length; i++) {
      const n = nodes[i];
      n.x += n.vx; n.y += n.vy;
      if (n.x < 0 || n.x > w) n.vx *= -1;
      if (n.y < 0 || n.y > h) n.vy *= -1;
      const dx = n.x - mouse.x, dy = n.y - mouse.y, md = Math.hypot(dx, dy);
      if (md < 120) { n.x += dx / md * 1.1; n.y += dy / md * 1.1; }
      ctx.beginPath(); ctx.arc(n.x, n.y, n.r, 0, Math.PI * 2);
      ctx.fillStyle = col; ctx.globalAlpha = 0.8; ctx.fill();
      for (let j = i + 1; j < nodes.length; j++) {
        const m = nodes[j], d = Math.hypot(n.x - m.x, n.y - m.y);
        if (d < 130) {
          ctx.beginPath(); ctx.moveTo(n.x, n.y); ctx.lineTo(m.x, m.y);
          ctx.strokeStyle = col; ctx.globalAlpha = (1 - d / 130) * 0.25; ctx.lineWidth = 1; ctx.stroke();
        }
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
 *  MRI demo toggle
 * ================================================================== */
function mriDemo() {
  const demo = $('#mri-demo'), btn = $('#mri-toggle');
  if (!demo || !btn) return;
  btn.addEventListener('click', () => {
    const hidden = demo.classList.toggle('hidden');
    btn.textContent = hidden ? 'Show prediction' : 'Hide prediction';
    btn.setAttribute('aria-pressed', String(!hidden));
  });
}

/* ================================================================== *
 *  Scroll reveal + progress + active nav + nav style
 * ================================================================== */
function scrollFx() {
  const io = new IntersectionObserver((entries) => {
    entries.forEach(e => { if (e.isIntersecting) { e.target.classList.add('in'); io.unobserve(e.target); } });
  }, { threshold: 0.12 });
  document.querySelectorAll('.reveal').forEach(el => io.observe(el));

  const bar = $('#scroll-progress'), nav = $('#nav');
  const sections = [...document.querySelectorAll('main section[id]')];
  const links = [...document.querySelectorAll('.nav__links a')];
  function onScroll() {
    const st = window.scrollY;
    const docH = document.documentElement.scrollHeight - window.innerHeight;
    bar.style.width = (docH > 0 ? st / docH * 100 : 0) + '%';
    nav.classList.toggle('scrolled', st > 20);
    let current = sections[0]?.id;
    for (const s of sections) { if (st >= s.offsetTop - 140) current = s.id; }
    links.forEach(a => a.classList.toggle('active', a.getAttribute('href') === '#' + current));
  }
  window.addEventListener('scroll', onScroll, { passive: true });
  onScroll();
}

/* ================================================================== *
 *  Themes (persisted) + dropdown menu
 * ================================================================== */
const THEMES = [
  { id: 'light', label: 'Light' },
  { id: 'professional', label: 'Subtle Dark' },
  { id: 'neural', label: 'Colorful Dark' },
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
  const open = (url) => { close(); window.open(url, url.startsWith('http') ? '_blank' : '_self'); };

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
    { icon: '○', label: 'Theme: Light', hint: 'theme', action: () => { close(); applyTheme('light'); } },
    { icon: '◐', label: 'Theme: Subtle Dark', hint: 'theme', action: () => { close(); applyTheme('professional'); } },
    { icon: '◑', label: 'Theme: Colorful Dark', hint: 'theme', action: () => { close(); applyTheme('neural'); } },
  );

  let filtered = COMMANDS, sel = 0;
  function render() {
    list.innerHTML = filtered.map((c, i) => `
      <li data-i="${i}" class="${i === sel ? 'sel' : ''}">
        <span class="pi">${c.icon}</span>${c.label}<small>${c.hint}</small>
      </li>`).join('') || '<li style="color:var(--faint);cursor:default">No matches</li>';
  }
  function openPalette() { palette.hidden = false; input.value = ''; filtered = COMMANDS; sel = 0; render(); setTimeout(() => input.focus(), 30); }
  function close() { palette.hidden = true; }

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
 *  Init  —  render content first, then wire up behaviours
 * ================================================================== */
document.addEventListener('DOMContentLoaded', () => {
  if (typeof CONFIG === 'undefined') { console.error('config.js failed to load — check assets/js/config.js'); return; }

  // Content
  renderMeta();
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

  // Behaviours
  neuralBackground();
  typeRole();
  terminalIntro();
  animateMetrics();
  mriDemo();
  scrollFx();
  themeMenu();
  mobileNav();
  commandPalette();
  checkFiles();
});
