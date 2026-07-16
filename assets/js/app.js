/* =========================================================================
   Portfolio engine · app.js · v4.0
   Renders the whole site from assets/js/config.js (CONFIG).
   You normally don't need to touch this file — edit config.js instead.
   Vanilla JS, no dependencies, no build step.
   ========================================================================= */
'use strict';

/* Small helpers ---------------------------------------------------------- */
const $ = (sel) => document.querySelector(sel);
const esc = (s) => String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
const telHref = (p) => 'tel:' + String(p).replace(/[^\d+]/g, '');
/* WhatsApp deep link: pass a full https URL through, else build wa.me from digits */
const waHref = (v) => { const s = String(v).trim(); return /^https?:\/\//.test(s) ? s : 'https://wa.me/' + s.replace(/\D/g, ''); };
/* CONFIG.links.phone / .resume accept one value or a list — normalize to arrays */
const phoneList = (L) => Array.isArray(L.phone) ? L.phone : L.phone ? [L.phone] : [];
const resumeList = (L) => (Array.isArray(L.resume) ? L.resume : L.resume ? [{ file: L.resume }] : [])
  .map(r => `<a href="${r.file}" class="tlink js-file-link" target="_blank" rel="noopener">Résumé${r.label ? ` (${esc(r.label)})` : ''} <span class="arr" aria-hidden="true">↗</span></a>`);
const reduced = () => window.matchMedia('(prefers-reduced-motion: reduce)').matches;
const noHover = () => window.matchMedia('(hover: none)').matches;

/* Focus trap for modals (demos / game). One modal at a time.
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
const SVG_PLAY = '<svg viewBox="0 0 10 12" aria-hidden="true"><path d="M0 0l10 6-10 6z"/></svg>';
const SVG_ARROW_NE = '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M7 17L17 7M9 7h8v8"/></svg>';
const SVG_GAMEPAD = '<svg viewBox="0 0 24 24" aria-hidden="true"><rect x="2" y="7" width="20" height="10" rx="5"/><path d="M7 12h3M8.5 10.5v3"/><circle cx="15.5" cy="11.5" r=".7" fill="currentColor" stroke="none"/><circle cx="18" cy="13" r=".7" fill="currentColor" stroke="none"/></svg>';

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
    <button class="mri__toggle" id="mri-run">${SVG_PLAY.replace('<svg', '<svg width="9" height="11" fill="currentColor"')} Run pipeline</button>
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
    // Branded tile: ink rounded square + paper-white text (1–3 chars).
    const t = String(m.favicon);
    const size = t.length === 1 ? 58 : t.length === 2 ? 46 : 32;
    const svg = `<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 100 100'>` +
      `<rect width='100' height='100' rx='22' fill='#0a0a0b'/>` +
      `<text x='50' y='53' dominant-baseline='central' text-anchor='middle' ` +
      `font-family='Archivo, Segoe UI, Arial, sans-serif' font-weight='800' font-size='${size}' fill='#fafaf9'>${esc(t)}</text></svg>`;
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
  // Minimal wordmark: "Mohammed Dasouqi." with an accent full stop.
  $('#nav-logo').innerHTML =
    `<span class="nav__name">${esc(b.pre || '')} ${esc(b.post || '')}<span class="accent">.</span></span>`;
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
 *  Render: hero — oversized masked name lines + choreographed load-in.
 *  Stagger is driven by inline --hd (animation-delay) per element.
 * ================================================================== */
function renderHero() {
  const h = CONFIG.hero || {}, L = CONFIG.links || {}, c = CONFIG.contact || {};
  const meta = (h.meta || []).map((m, i) =>
    `${i ? '<span class="sep">/</span>' : ''}<span>${HERO_ICONS[m.icon] || m.icon || ''} ${m.text}</span>`).join('');

  // One masked line per word of the name ("Mohammed" / "Dasouqi").
  const words = String(h.name || '').split(' ');
  const lines = words.map((w, i) =>
    `<span class="hline"><span class="hline__inner" style="--hd:${140 + i * 110}ms">${esc(w)}${i === words.length - 1 ? '<span class="accent">.</span>' : ''}</span></span>`
  ).join('');

  // Short availability chip: first clause of contact.availability.
  const avail = (c.availability || '').split('—')[0].trim();

  $('#hero-inner').innerHTML = `
    ${avail ? `<p class="hero__status h-rev" style="--hd:40ms"><span class="dot"></span> ${esc(avail)}</p>` : ''}
    <h1 class="hero__title"><span aria-hidden="true">${lines}</span><span class="sr-only">${esc(h.name || '')}</span></h1>
    <p class="hero__role h-rev" style="--hd:420ms"><span class="role-mask"><span class="role-word" id="role-word"></span></span></p>
    <p class="hero__tag h-rev" style="--hd:520ms">${h.tagline || ''}</p>
    <div class="hero__cta h-rev" style="--hd:620ms">
      <a href="#projects" class="btn btn--primary">View projects <span class="btn__arr" aria-hidden="true">↓</span></a>
      ${L.github ? `<a href="${L.github}" target="_blank" rel="noopener" class="tlink">GitHub <span class="arr" aria-hidden="true">↗</span></a>` : ''}
      ${resumeList(L).join('')}
    </div>
    ${meta ? `<div class="hero__meta h-rev" style="--hd:720ms">${meta}</div>` : ''}
    <div class="hero__bored h-rev" style="--hd:850ms">
      <button type="button" class="bored-btn" data-play="brick">
        ${SVG_GAMEPAD}
        <span>Bored? Play a game</span>
        <span class="bored-btn__arr" aria-hidden="true">→</span>
      </button>
    </div>`;
}

/* Rotating role word — masked vertical swap every few seconds (WAAPI,
   so start/end states are explicit and can never get stuck mid-swap) */
function roleRotator() {
  const el = $('#role-word');
  if (!el) return;
  const roles = (CONFIG.hero && CONFIG.hero.roles && CONFIG.hero.roles.length) ? CONFIG.hero.roles : [''];
  let i = 0;
  el.textContent = roles[0];
  if (reduced() || roles.length < 2 || !el.animate) return;
  setInterval(() => {
    if (document.hidden) return; // don't swap in background tabs
    const out = el.animate(
      [{ transform: 'translateY(0)', opacity: 1 }, { transform: 'translateY(-115%)', opacity: 0 }],
      { duration: 420, easing: 'cubic-bezier(.65,0,.35,1)', fill: 'forwards' }
    );
    out.onfinish = () => {
      i = (i + 1) % roles.length;
      el.textContent = roles[i];
      el.animate(
        [{ transform: 'translateY(115%)', opacity: 0 }, { transform: 'translateY(0)', opacity: 1 }],
        { duration: 500, easing: 'cubic-bezier(.16,1,.3,1)' }
      );
      out.cancel(); // drop the exit fill so the base (visible) style shows through
    };
  }, 3400);
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
      <div class="terminal reveal" style="--rd:120ms" aria-hidden="true">
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
 *  Render: skills — hairline rows
 * ================================================================== */
function renderSkills() {
  $('#skills-grid').innerHTML = (CONFIG.skills || []).map((s, i) => `
    <div class="skill-row reveal" style="--rd:${i * 60}ms">
      <h3>${esc(s.group)}</h3>
      <div class="skill-tags">${(s.items || []).map(t => `<span>${esc(t)}</span>`).join('')}</div>
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
      ${f.metrics.map(m => `<div class="metric" data-value="${m.value}"><span class="metric__num">0%</span><span class="metric__label">${esc(m.label)}</span></div>`).join('')}
    </div>
    ${f.metricsCaption ? `<p class="metrics__cap">${esc(f.metricsCaption)}</p>` : ''}` : '';

  const links = [];
  if (f.repo) links.push(`<a class="tlink" href="${f.repo}" target="_blank" rel="noopener">Source on GitHub <span class="arr" aria-hidden="true">↗</span></a>`);
  if (f.paper) links.push(`<a class="tlink js-file-link" href="${f.paper}" target="_blank" rel="noopener">Read the report <span class="arr" aria-hidden="true">↗</span></a>`);

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
 *  Render: project rows (editorial list — no cards, no covers)
 * ================================================================== */
function renderProjects() {
  $('#proj-grid').innerHTML =
    `<div class="wiggle" aria-hidden="true"><svg class="wiggle__svg">
      <path class="wiggle__track" d="" /><path class="wiggle__fill" d="" />
    </svg></div>` + (CONFIG.projects || []).map((p, i) => `
    <article class="prow reveal" style="--rd:${i * 60}ms">
      <span class="prow__idx" aria-hidden="true">${String(i + 1).padStart(2, '0')}</span>
      <div class="prow__body">
        ${p.kicker ? `<p class="prow__kicker">${esc(p.kicker)}</p>` : ''}
        <h3 class="prow__title">${esc(p.title)}</h3>
        <p class="prow__desc">${p.desc || ''}</p>
        <div class="prow__tags">${(p.tags || []).map(t => `<span>${esc(t)}</span>`).join('')}</div>
        <div class="prow__links">${projectLinks(p)}</div>
      </div>
      <span class="prow__arrow" aria-hidden="true">${SVG_ARROW_NE}</span>
    </article>`).join('');
}

function projectLinks(p) {
  const out = [];
  if (p.play) out.push(`<button type="button" class="prow__play" data-play="${p.play}">${SVG_PLAY} Play</button>`);
  if (p.demo) out.push(`<button type="button" class="prow__play" data-demo="${p.demo}">${SVG_PLAY} Live demo</button>`);
  if (p.repo) out.push(`<a class="tlink" href="${p.repo}" target="_blank" rel="noopener">Source <span class="arr" aria-hidden="true">↗</span></a>`);
  if (p.paper) out.push(`<a class="tlink js-file-link" href="${p.paper}" target="_blank" rel="noopener">Report <span class="arr" aria-hidden="true">↗</span></a>`);
  if (!out.length) out.push(`<span class="prow__muted">Team / academic project — no public source</span>`);
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
  const items = (CONFIG.timeline || []).map((t, i) => {
    const years = String(t.when).match(/\d{4}/g) || ['']; // last year in "when" → ghost watermark
    const year = years[years.length - 1];
    return `
    <div class="tl-item reveal" style="--rd:${i * 80}ms">
      ${year ? `<span class="tl-item__ghost" aria-hidden="true">${year}</span>` : ''}
      <span class="tl-item__node" aria-hidden="true"></span>
      <p class="tl-item__when">${esc(t.when)}</p>
      <div>
        <p class="tl-item__role">${esc(t.role)}</p>
        <p class="tl-item__org">${esc(t.org)}</p>
        <p class="tl-item__desc">${t.desc || ''}</p>
      </div>
    </div>`;
  }).join('');
  $('#timeline').innerHTML =
    `<div class="tl-spine" aria-hidden="true"><i class="tl-spine__fill"></i></div>` + items;
}

/* Timeline spine draws itself as the section scrolls through the viewport;
   nodes fill in as the line passes them, ghost years drift slightly slower
   than the page (parallax). Reduced motion: everything just shown complete. */
function timelineFx() {
  const tl = $('#timeline');
  if (!tl) return;
  const items = [...tl.querySelectorAll('.tl-item')];
  if (!items.length) return;
  if (reduced()) {
    tl.style.setProperty('--tl-progress', 1);
    items.forEach(it => it.querySelector('.tl-item__node').classList.add('on'));
    return;
  }
  let ticking = false;
  function update() {
    ticking = false;
    const rect = tl.getBoundingClientRect();
    const vh = window.innerHeight;
    if (!vh || !rect.height) return; // degenerate viewport — keep last good state
    // the spine tip tracks a line at 72% of the viewport height
    const p = Math.min(Math.max((vh * 0.72 - rect.top) / rect.height, 0), 1);
    tl.style.setProperty('--tl-progress', p.toFixed(4));
    const drawn = p * rect.height;
    items.forEach(it => {
      const node = it.querySelector('.tl-item__node');
      node.classList.toggle('on', drawn >= it.offsetTop + node.offsetTop + 6);
      const ghost = it.querySelector('.tl-item__ghost');
      if (ghost) {
        const r = it.getBoundingClientRect();
        const c = (r.top + r.height / 2 - vh / 2) / vh; // -0.5 … 0.5 across the viewport
        ghost.style.setProperty('--gy', (c * 46).toFixed(1) + 'px');
      }
    });
  }
  function onScroll() { if (!ticking) { ticking = true; requestAnimationFrame(update); } }
  window.addEventListener('scroll', onScroll, { passive: true });
  window.addEventListener('resize', onScroll, { passive: true });
  update();
}

/* Projects wiggle — a sinuous line down the left of the project rows that
   draws itself with scroll (stroke-dashoffset). Path is generated to match
   the rendered height and rebuilt on resize. Reduced motion: fully drawn. */
function projectsWiggle() {
  const grid = $('#proj-grid');
  const svg = grid && grid.querySelector('.wiggle__svg');
  if (!svg) return;
  const track = svg.querySelector('.wiggle__track');
  const fill = svg.querySelector('.wiggle__fill');
  let len = 0;

  function build() {
    const h = grid.getBoundingClientRect().height;
    if (!h) return;
    svg.setAttribute('viewBox', `0 0 22 ${Math.round(h)}`);
    // vertical wave: cubic segments bulging alternately left/right.
    // Amplitude tapers over `ramp` px at both ends so the line emerges from
    // (and hands off to) the straight thread segments without a kink.
    const cx = 11, amp = 10, seg = 54, ramp = 150;
    let d = `M ${cx} 0`, dir = 1;
    for (let y = 0; y < h; y += seg) {
      const y2 = Math.min(y + seg, h), s = y2 - y, mid = y + s / 2;
      const bx = (cx + amp * Math.min(1, mid / ramp, (h - mid) / ramp) * dir).toFixed(1);
      d += ` C ${bx} ${(y + s * .35).toFixed(1)}, ${bx} ${(y2 - s * .35).toFixed(1)}, ${cx} ${y2.toFixed(1)}`;
      dir = -dir;
    }
    track.setAttribute('d', d);
    fill.setAttribute('d', d);
    len = fill.getTotalLength();
    fill.style.strokeDasharray = len;
  }

  if (reduced()) { build(); fill.style.strokeDashoffset = 0; return; }

  let ticking = false;
  function update() {
    ticking = false;
    const rect = grid.getBoundingClientRect();
    const vh = window.innerHeight;
    if (!vh || !rect.height || !len) return; // degenerate viewport — keep last good state
    // same trigger line as the timeline spine: 72% of the viewport height
    const p = Math.min(Math.max((vh * 0.72 - rect.top) / rect.height, 0), 1);
    fill.style.strokeDashoffset = (len * (1 - p)).toFixed(1);
  }
  function onScroll() { if (!ticking) { ticking = true; requestAnimationFrame(update); } }
  window.addEventListener('scroll', onScroll, { passive: true });
  window.addEventListener('resize', () => { build(); onScroll(); }, { passive: true });
  window.addEventListener('load', () => { build(); update(); }); // heights settle after fonts/images
  build();
  update();
}

/* The thread — connectors that join the projects wiggle to the timeline
   spine and carry the line on into Contact. Each section handoff is marked
   by a diamond joint that lights up as the fill passes through it. In
   Contact the line elbows sideways and sweeps toward the kicker, where it
   terminates in a big accent full stop (the brand period) that pops in with
   a ring ripple. Segments share the 72%-viewport trigger, so the tip hands
   off seamlessly: wiggle → joint → connector → spine → joint → elbow → dot. */
function threadFx() {
  const c1 = document.querySelector('#experience > .thread');
  const c2 = document.querySelector('#contact > .thread');
  const tl = $('#timeline'), mount = $('#contact-mount');
  if (!c1 || !c2 || !tl || !mount) return;
  const j1 = c1.querySelector('.thread__joint'), j2 = c2.querySelector('.thread__joint');
  const svg = c2.querySelector('.thread__svg');
  const track = c2.querySelector('.thread__track');
  const path = c2.querySelector('.thread__path');
  const dot = c2.querySelector('.thread__dot');
  const rule = mount.querySelector('.contact__kicker-rule'); // continues past the label to the edge
  const PATH_DONE = 0.72; // elbow+dot draw over [0, PATH_DONE]; rule over [PATH_DONE, 1]
  const RULE_STRETCH = 1.8; // rule needs this much more scroll distance than the elbow/dot to feel less twitchy
  const RULE_EASE = 0.15;   // lerp factor smoothing the rule toward its target each frame
  let len = 0;
  let ruleTarget = 0, ruleShown = 0, ruleRafId = null;

  function size() {
    c1.style.height = tl.offsetTop + 'px'; // section top → spine top

    // End path: drop from the section top, elbow right, sweep toward the
    // kicker ("05 — Get in touch"), ending where the full stop lands.
    const kicker = mount.querySelector('.contact__kicker');
    let d, ex, ey;
    if (kicker) {
      // kicker centre measured via rect deltas so the .reveal transform
      // (mount sits 30px low until revealed) can't skew the layout numbers
      const mr = mount.getBoundingClientRect(), kr = kicker.getBoundingClientRect();
      ey = mount.offsetTop + (kr.top - mr.top) + kr.height / 2;
      ex = 56;
      d = `M 11 0 V ${(ey - 14).toFixed(1)} Q 11 ${ey.toFixed(1)} 25 ${ey.toFixed(1)} H ${ex}`;
    } else {
      // kicker hidden in config — fall back to a plain vertical ending
      ey = Math.max(mount.offsetTop - 26, 0); ex = 11;
      d = `M 11 0 V ${ey.toFixed(1)}`;
    }
    c2.style.height = Math.ceil(ey + 2) + 'px';
    svg.setAttribute('viewBox', `0 0 90 ${Math.ceil(ey + 2)}`);
    track.setAttribute('d', d);
    path.setAttribute('d', d);
    len = path.getTotalLength();
    path.style.strokeDasharray = len;
    dot.style.left = (ex + 10 - 9) + 'px'; // dot centre 10px past the line end
    dot.style.top = (ey - 9) + 'px';
  }

  if (reduced()) {
    size();
    c1.style.setProperty('--th-progress', 1);
    path.style.strokeDashoffset = 0;
    if (rule) rule.style.transform = 'scaleX(1)';
    j1.classList.add('on'); j2.classList.add('on');
    c2.classList.add('pop');
    window.addEventListener('resize', size, { passive: true });
    return;
  }

  let ticking = false;
  function progress(el, stretch = 1) {
    const r = el.getBoundingClientRect();
    const vh = window.innerHeight;
    if (!vh || !r.height) return null; // degenerate viewport — keep last good state
    return Math.min(Math.max((vh * 0.72 - r.top) / (r.height * stretch), 0), 1);
  }
  // eases the rule's displayed scaleX toward its scroll-derived target instead of
  // snapping every scroll tick — keeps fast/trackpad scrolling from looking jerky
  function animateRule() {
    ruleRafId = null;
    ruleShown += (ruleTarget - ruleShown) * RULE_EASE;
    if (Math.abs(ruleTarget - ruleShown) < 0.001) ruleShown = ruleTarget;
    rule.style.transform = `scaleX(${ruleShown.toFixed(4)})`;
    if (ruleShown !== ruleTarget) ruleRafId = requestAnimationFrame(animateRule);
  }
  function update() {
    ticking = false;
    const p1 = progress(c1), p2 = progress(c2);
    if (p1 !== null) {
      c1.style.setProperty('--th-progress', p1.toFixed(4));
      j1.classList.toggle('on', p1 > 0.01);
    }
    if (p2 !== null && len) {
      // line + elbow + dot draw over the first PATH_DONE of the scroll...
      const pp = Math.min(1, p2 / PATH_DONE);
      path.style.strokeDashoffset = (len * (1 - pp)).toFixed(1);
      j2.classList.toggle('on', p2 > 0.01);
      if (pp >= 0.999) c2.classList.add('pop'); // one-shot — the full stop lands
      // ...then the rule continues past the label to the edge over the rest.
      // It gets its own (stretched) progress so it takes noticeably more
      // scrolling to draw, and eases toward that target rather than tracking
      // the raw scroll position 1:1.
      if (rule) {
        const p2Rule = progress(c2, RULE_STRETCH);
        ruleTarget = Math.min(1, Math.max(0, (p2Rule - PATH_DONE) / (1 - PATH_DONE)));
        if (ruleRafId === null) ruleRafId = requestAnimationFrame(animateRule);
      }
    }
  }
  function onScroll() { if (!ticking) { ticking = true; requestAnimationFrame(update); } }
  window.addEventListener('scroll', onScroll, { passive: true });
  window.addEventListener('resize', () => { size(); onScroll(); }, { passive: true });
  window.addEventListener('load', () => { size(); update(); });
  size();
  update();
}

/* ================================================================== *
 *  Render: contact
 * ================================================================== */
function renderContact() {
  const c = CONFIG.contact || {}, L = CONFIG.links || {};
  const links = [];
  if (L.github) links.push(`<a class="tlink" href="${L.github}" target="_blank" rel="noopener">GitHub <span class="arr" aria-hidden="true">↗</span></a>`);
  if (L.linkedin) links.push(`<a class="tlink" href="${L.linkedin}" target="_blank" rel="noopener">LinkedIn <span class="arr" aria-hidden="true">↗</span></a>`);
  links.push(...resumeList(L));
  phoneList(L).forEach(p => links.push(`<a class="tlink" href="${telHref(p)}">${esc(p)}</a>`));
  // WhatsApp — explicit CONFIG.links.whatsapp, else derived from the first phone number
  const wa = L.whatsapp || phoneList(L)[0];
  if (wa) links.push(`<a class="tlink" href="${waHref(wa)}" target="_blank" rel="noopener">WhatsApp <span class="arr" aria-hidden="true">↗</span></a>`);
  $('#contact-mount').innerHTML = `
    ${c.kicker ? `<p class="contact__kicker"><span>05 — ${esc(c.kicker)}</span><i class="contact__kicker-rule" aria-hidden="true"></i></p>` : ''}
    <h2 class="contact__title">${c.title || ''}</h2>
    ${c.sub ? `<p class="contact__sub">${c.sub}</p>` : ''}
    ${L.email ? `<a href="mailto:${L.email}" class="contact__mail">${esc(L.email)}</a>` : ''}
    ${links.length ? `<div class="contact__links">${links.join('')}</div>` : ''}
    ${c.extra ? `<p class="contact__langs">${esc(c.extra)}</p>` : ''}
    ${c.availability ? `<p class="contact__status"><span class="dot"></span> ${esc(c.availability)}</p>` : ''}`;
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
  if (reduced()) { el.innerHTML = lines.join('\n'); return; }
  let i = 0;
  const card = el.closest('.terminal');
  const io = new IntersectionObserver((entries) => {
    if (entries[0].isIntersecting) {
      io.disconnect();
      (function next() {
        if (i >= lines.length) return;
        el.innerHTML = lines.slice(0, i + 1).join('\n'); i++;
        setTimeout(next, 200);
      })();
    }
  }, { threshold: 0.3 });
  io.observe(card);
}

/* ================================================================== *
 *  Metrics — big stat numbers count up when scrolled into view
 * ================================================================== */
function animateMetrics() {
  const wrap = $('#metrics');
  if (!wrap) return;
  const io = new IntersectionObserver((entries) => {
    if (!entries[0].isIntersecting) return;
    io.disconnect();
    wrap.querySelectorAll('.metric').forEach(m => {
      const target = parseFloat(m.dataset.value);
      const num = m.querySelector('.metric__num');
      if (reduced()) { num.textContent = (target * 100).toFixed(2) + '%'; return; }
      const dur = 1500, start = performance.now();
      function step(now) {
        const t = Math.min((now - start) / dur, 1);
        const val = target * (1 - Math.pow(1 - t, 3));
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
  let timers = [];

  function setStage(n) {
    demo.dataset.stage = n;
    steps.forEach(s => s.classList.toggle('on', +s.dataset.step <= n));
  }
  function label(txt) { btn.innerHTML = btn.innerHTML.replace(/Run pipeline|Replay pipeline/, txt); }
  function run() {
    timers.forEach(clearTimeout); timers = [];
    demo.classList.add('notrans'); // snap back to stage 0 without reverse animation
    setStage(0);
    if (reduced()) { demo.classList.remove('notrans'); setStage(3); label('Replay pipeline'); return; }
    void demo.offsetWidth; // reflow so stage transitions restart cleanly
    demo.classList.remove('notrans');
    timers.push(setTimeout(() => setStage(1), 200));
    timers.push(setTimeout(() => setStage(2), 1500));
    timers.push(setTimeout(() => setStage(3), 2500));
    timers.push(setTimeout(() => label('Replay pipeline'), 3300));
  }
  btn.addEventListener('click', run);
  const io = new IntersectionObserver((entries) => {
    if (entries[0].isIntersecting) { io.disconnect(); run(); }
  }, { threshold: 0.45 });
  io.observe(demo);
}

/* ================================================================== *
 *  Scroll: reveals, progress hairline, active nav link,
 *  hide-on-scroll-down nav, back-to-top
 * ================================================================== */
function scrollFx() {
  const io = new IntersectionObserver((entries) => {
    entries.forEach(e => { if (e.isIntersecting) { e.target.classList.add('in'); io.unobserve(e.target); } });
  }, { threshold: 0.12 });
  document.querySelectorAll('.reveal, .section__head').forEach(el => io.observe(el));

  const nav = $('#nav');
  const bar = $('#progress');
  const toTop = $('#to-top');
  const sections = [...document.querySelectorAll('main section[id]')];
  const links = [...document.querySelectorAll('.nav__links a')];
  let lastY = window.scrollY;

  if (toTop) toTop.addEventListener('click', () => window.scrollTo({ top: 0, behavior: 'smooth' }));

  function onScroll() {
    const st = window.scrollY;
    const docH = document.documentElement.scrollHeight - window.innerHeight;
    if (bar) bar.style.transform = `scaleX(${docH > 0 ? st / docH : 0})`;
    if (toTop) toTop.classList.toggle('show', st > 500);
    nav.classList.toggle('scrolled', st > 20);
    // hide nav scrolling down, reveal scrolling up (never while menu is open)
    const menuOpen = $('#nav-links').classList.contains('open');
    nav.classList.toggle('hide', !menuOpen && st > 140 && st > lastY + 2);
    lastY = st;
    let current = sections[0]?.id;
    for (const s of sections) { if (st >= s.offsetTop - 160) current = s.id; }
    links.forEach(a => a.classList.toggle('active', a.getAttribute('href') === '#' + current));
  }
  window.addEventListener('scroll', onScroll, { passive: true });
  onScroll();
}

/* ================================================================== *
 *  Cursor ring — trails the pointer, grows over interactive elements.
 *  Desktop pointers only; reduced-motion users never see it.
 * ================================================================== */
function cursorRing() {
  if (noHover() || reduced()) return;
  const ring = document.createElement('div');
  ring.className = 'cursor';
  ring.setAttribute('aria-hidden', 'true');
  document.body.appendChild(ring);
  let tx = -100, ty = -100, x = -100, y = -100, raf = 0;
  function loop() {
    x += (tx - x) * 0.16; y += (ty - y) * 0.16;   // lerp = the trailing "flow"
    ring.style.translate = `${x.toFixed(1)}px ${y.toFixed(1)}px`;
    raf = requestAnimationFrame(loop);
  }
  window.addEventListener('pointermove', (e) => {
    tx = e.clientX; ty = e.clientY;
    document.body.classList.add('cursor-on');
    if (!raf) loop();
  });
  document.addEventListener('mouseleave', () => document.body.classList.remove('cursor-on'));
  document.addEventListener('pointerover', (e) => {
    ring.classList.toggle('is-link', !!e.target.closest('a, button, input, [role="option"]'));
  });
  document.addEventListener('pointerdown', () => ring.classList.add('is-down'));
  document.addEventListener('pointerup', () => ring.classList.remove('is-down'));
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
  const grp = `<div class="marquee__grp">${items.map(t => `<span>${esc(t)}</span><i></i>`).join('')}</div>`;
  track.innerHTML = grp + grp; // duplicated for a seamless -50% loop
  track.style.setProperty('--marquee-dur', Math.max(24, items.length * 2.6) + 's');
}

/* ================================================================== *
 *  Magnetic primary button — leans toward the cursor (desktop only)
 * ================================================================== */
function magneticButtons() {
  if (noHover() || reduced()) return;
  document.querySelectorAll('.btn--primary').forEach(el => {
    el.addEventListener('pointermove', (e) => {
      const r = el.getBoundingClientRect();
      const x = (e.clientX - r.left - r.width / 2) * .14;
      const y = (e.clientY - r.top - r.height / 2) * .28;
      el.style.transform = `translate(${x.toFixed(1)}px, ${y.toFixed(1)}px)`;
    });
    el.addEventListener('pointerleave', () => { el.style.transform = ''; });
  });
}

/* ================================================================== *
 *  Theme — light/dark toggle, persisted to localStorage.
 * ================================================================== */
function fallbackTheme() {
  return CONFIG.defaultTheme === 'dark' ? 'dark' : 'light';
}
function currentTheme() {
  const t = document.documentElement.getAttribute('data-theme');
  return t === 'light' || t === 'dark' ? t : fallbackTheme();
}
function applyTheme(id) {
  if (id !== 'light' && id !== 'dark') id = fallbackTheme();
  document.documentElement.setAttribute('data-theme', id);
  try { localStorage.setItem('mdtheme', id); } catch (e) {}
  // keep the mobile browser chrome (address bar) tinted to match the theme
  const bg = getComputedStyle(document.documentElement).getPropertyValue('--bg').trim();
  if (bg) setAttr('#meta-theme-color', 'content', bg);
  const btn = $('#theme-toggle');
  if (btn) btn.setAttribute('aria-label', id === 'light' ? 'Switch to dark mode' : 'Switch to light mode');
}
function themeToggle() {
  applyTheme(currentTheme());
  $('#theme-toggle').addEventListener('click', () => {
    applyTheme(currentTheme() === 'light' ? 'dark' : 'light');
  });
}

/* ================================================================== *
 *  Mobile nav — full-screen overlay with staggered links
 * ================================================================== */
function mobileNav() {
  const burger = $('#nav-burger'), links = $('#nav-links');
  links.querySelectorAll('a').forEach((a, i) => a.style.setProperty('--i', i));
  function setOpen(open) {
    links.classList.toggle('open', open);
    burger.setAttribute('aria-expanded', String(open));
    burger.setAttribute('aria-label', open ? 'Close menu' : 'Open menu');
    document.body.style.overflow = open ? 'hidden' : '';
  }
  burger.addEventListener('click', () => setOpen(!links.classList.contains('open')));
  links.querySelectorAll('a').forEach(a => a.addEventListener('click', () => setOpen(false)));
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && links.classList.contains('open')) setOpen(false);
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
  roleRotator();
  terminalIntro();
  animateMetrics();
  mriDemo();
  scrollFx();
  timelineFx();
  projectsWiggle();
  threadFx();
  cursorRing();
  magneticButtons();
  themeToggle();
  mobileNav();
  checkFiles();
  wirePlayButtons();
  analytics();
});
