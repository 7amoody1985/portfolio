/* =========================================================================
   PORTFOLIO CONFIG  —  THIS IS THE ONLY FILE YOU NEED TO EDIT.
   -------------------------------------------------------------------------
   Fill in your own details below and the whole site updates itself.
   No build step, no install — just edit, save, and refresh the page.

   Tips:
   • Text marked "HTML allowed" can include tags like <strong>…</strong>.
   • Set any optional field to '' (empty) or false to hide that piece.
   • Put PDFs in assets/files/  and screenshots in assets/img/projects/.
   • A link to a file that doesn't exist yet is auto-dimmed on the live site,
     so nothing ever shows as broken.
   ========================================================================= */

const CONFIG = {

  /* ---- Browser tab + social share preview ---- */
  meta: {
    title: 'Mohammed Dasouqi — AI / ML Engineer',
    description: 'Mohammed Dasouqi — AI/ML Engineer building production-grade intelligent systems: deep learning for medical imaging, NLP & semantic-search pipelines, and data-driven backends.',
    favicon: 'MD', // 1–3 characters, rendered as a gold-on-graphite tile in the browser tab
    // Extra facts for the JSON-LD Person schema (richer Google results).
    // Any field can be '' to omit it.
    schema: {
      university: 'University of Nottingham',
      locality: 'Riyadh',
      country: 'SA',
    },
  },

  /* ---- Top-left logo ---- */
  brand: {
    monogram: 'MD',        // 1–3 letters shown as the gold tile logo before your name ('' to hide)
    pre: 'Mohammed',       // text before the accent space
    post: 'Dasouqi',       // text after the accent space
  },

  /* ---- Default colour theme ---- 'light' or 'dark' */
  defaultTheme: 'light',

  /* ---- Tech marquee (the scrolling strip under the hero). [] to hide. ---- */
  marquee: ['PyTorch', 'FastAPI', 'YOLO', 'Sentence-BERT', 'LlamaIndex', 'Ollama', 'Python', 'Kotlin', 'SQL', 'CUDA', 'Jetpack Compose', 'Firestore', 'TensorBoard', 'asyncio'],

  /* ---- Analytics (optional, privacy-friendly — no cookies) ----
     GoatCounter: sign up free at https://www.goatcounter.com/signup and pick a
     "code" — your dashboard becomes <code>.goatcounter.com. Put that code below
     to enable visitor counts, REFERRERS (where people come from), top pages, plus
     outbound-link and file-download events. Leave '' to disable analytics. */
  analytics: {
    goatcounter: '7amoody1985', // (just the code; not the full URL)
  },

  /* ---- Links (reused in the hero, contact section and command palette) ---- */
  links: {
    github:   'https://github.com/7amoody1985',
    linkedin: 'https://linkedin.com/in/mohammeddasouqi',
    email:    'mohammeddasouqi@hotmail.com',
    phone:    '+966 53 862 2526',          // '' to hide
    whatsapp: '',                          // WhatsApp number or full wa.me/chat URL; '' = auto-use the phone number above
    resume:   'assets/files/Mohammed_Dasouqi_CV.pdf', // '' to hide résumé buttons
  },

  /* ---- Hero (the first screen) ---- */
  hero: {
    name: 'Mohammed Dasouqi',
    roles: ['AI / ML Engineer', 'Data Engineer', 'Deep-Learning Builder', 'Backend Developer'], // typed out one by one
    tagline: 'I build <strong>production-grade intelligent systems</strong> — from deep-learning pipelines for medical imaging to NLP agents and data-driven backends. BSc (Hons) Software Engineering, University of Nottingham.', // HTML allowed
    // Small facts under the buttons. icon: 'pin' | 'cap' | 'chip' (or use any emoji)
    meta: [
      { icon: 'pin',  text: 'Riyadh, Saudi Arabia' },
      { icon: 'cap',  text: '2:1 Honours, University of Nottingham' },
      { icon: 'chip', text: 'AI / ML & Data Engineering' },
    ],
  },

  /* ---- About ---- */
  about: {
    paragraphs: [ // each string is one paragraph. HTML allowed.
      "I'm an <strong>AI/ML Engineer</strong> with a Software Engineering degree (BSc Hons, University of Nottingham) and hands-on, end-to-end experience across the <strong>machine-learning lifecycle</strong> — data preprocessing, model training, evaluation, and deployment.",
      "I've built deep-learning systems for medical image analysis (PyTorch, YOLO, EfficientUNet++), NLP and semantic-search pipelines (Sentence-BERT, LlamaIndex, local LLM deployment), and data-driven backends (FastAPI, SQL). I care about systems that actually ship: reproducible pipelines, measurable results, and clean, maintainable architecture.",
      "I'm looking for an <strong>AI/ML Engineer</strong> or <strong>Data Engineer</strong> role where I can build scalable, intelligent systems end to end.",
    ],
    // The little terminal card beside the about text. Set show:false to hide it.
    terminal: {
      show: true,
      title: 'mohammed@portfolio: ~',
      user: 'mohammed_dasouqi',
      // These render as a fake profile.json. Strings → "value", arrays → ["a","b"].
      fields: {
        role: 'AI / ML & Data Engineer',
        degree: 'BSc Hons, Nottingham (2:1)',
        focus: ['deep learning', 'NLP agents', 'backends'],
        stack: ['PyTorch', 'FastAPI', 'Kotlin'],
        location: 'Riyadh, SA',
        status: 'available_to_hire',
      },
    },
  },

  /* ---- Skills (each card is a group with a list of tags) ---- */
  skills: [
    { group: 'Machine Learning & AI', items: ['PyTorch', 'YOLO', 'EfficientUNet++', 'Sentence-BERT', 'LlamaIndex', 'Ollama (local LLM)', 'NLP / QA models', 'Semantic embeddings', 'Eval: Dice · IoU · F1'] },
    { group: 'Languages', items: ['Python', 'Java', 'Kotlin', 'C++', 'PHP', 'JavaScript', 'SQL', 'HTML/CSS'] },
    { group: 'Backend & Data', items: ['FastAPI', 'SQLAlchemy', 'REST API design', 'asyncio / aiohttp', 'Retrofit', 'MySQL', 'Firebase / Firestore'] },
    { group: 'Foundations', items: ['Data structures & algorithms', 'OOP design', 'SDLC', 'Observer · Repository · MVVM'] },
    { group: 'Tools & Platforms', items: ['Git / GitHub', 'TensorBoard', 'CUDA', 'Maven', 'JUnit 5', 'VS Code', 'JetBrains IDEs', 'Google Maps/Places APIs'] },
  ],

  /* ---- Featured project (the large highlighted one). Set show:false to skip it. ---- */
  featured: {
    show: true,
    kicker: 'Final-Year Project · Deep Learning',
    title: 'Brain Tumor Detection & Segmentation',
    desc: 'A two-stage deep-learning pipeline on the BR35H MRI dataset (800 scans): a custom <strong>RepVGG-GELAN</strong> detector feeds a nested <strong>EfficientUNet++</strong> segmentation network. Trained entirely from scratch — no pretrained detection weights. I built the whole ML-engineering pipeline: YOLO-format conversion, a detection-to-segmentation cropping bridge, joint augmentation, TensorBoard logging, and per-epoch visual validation.', // HTML allowed
    // Circular metric gauges. value is 0–1 and is shown as a percentage.
    metrics: [
      { label: 'Dice', value: 0.9375 },
      { label: 'IoU', value: 0.8944 },
      { label: 'Precision', value: 0.9509 },
      { label: 'Recall', value: 0.9592 },
    ],
    metricsCaption: 'Held-out test set · BR35H (800 MRI scans)', // '' to hide
    note: 'Detection met or beat the original RepVGG-GELAN paper (Precision 98.6% vs 98.2%, AP<sub>50:95</sub> 73.0% vs 72.3%). Annotation-quality filtering improved Dice by 1.5% and removed a systematic "circular effect" bias in predicted masks.', // HTML allowed, '' to hide
    tags: ['PyTorch 2.6', 'YOLO', 'RepVGG-GELAN', 'EfficientUNet++', 'EfficientNet-B0', 'CUDA'],
    repo: 'https://github.com/7amoody1985/Brain-Tumor-Detection-Segmentation', // '' to hide
    paper: 'assets/files/reports/brain-tumor-detection-segmentation.pdf',       // '' to hide
    // Left-hand visual. Options:
    //   demo: 'mri'  → the built-in animated two-stage pipeline demo
    //                  (detect → crop → segment; auto-plays on scroll, replayable)
    //   image: 'assets/img/projects/foo.png' → your own screenshot
    //   both empty   → no visual (the card becomes single-column)
    demo: 'mri',
    image: null,
  },

  /* ---- Project cards ----
     Per project:
       repo  : GitHub URL, or null to hide the Source link
       paper : PDF path, or null to hide the report link
       image : screenshot path, or null to use generated cover art
       glyph : cover art icon when no image — 'crawler' | 'database' | 'phone' | 'calendar' | 'code'
       demo  : 'crawler' | 'sql' — adds a "▶ Live demo" button that opens the
               built-in interactive in-browser demo (see assets/js/demos.js)
       size  : 'lg' | 'sm' — makes the card wider or narrower than its
               neighbours in the grid (omit for a normal card)
     A project with neither repo nor paper shows a small muted note instead. */
  projects: [
    {
      title: 'Intelligent Web Crawler',
      kicker: 'AI Agent',
      glyph: 'crawler',
      image: 'assets/img/projects/web-crawler.png', // drop this file in (or set null for the glyph)
      repo: 'https://github.com/7amoody1985/intelligent-web-crawler',
      paper: 'assets/files/reports/intelligent-web-crawler.pdf',
      demo: 'crawler',   // "▶ Live demo": in-browser crawl simulation (semantic vs BFS)
      size: 'lg',        // wider card — flagship project after the featured one
      desc: 'A budget-aware async crawler that prioritises URLs dynamically — combining Sentence-BERT semantic scoring, anchor-text relevance weighting and a BERT-based QA snippet-extraction pipeline — to replace static breadth-first traversal. A closed-loop online fine-tuning system periodically re-trains both the embedding and snippet models on data collected mid-crawl, improving relevance in 80% of runs. Across 25 runs it averaged 95.4% precision, 85.6% recall and 90.1% F1 — beating breadth-first and TF-IDF baselines while holding semantic diversity above 60%.',
      tags: ['Python', 'asyncio / aiohttp', 'Sentence-BERT', 'BERT QA', 'Online fine-tuning'],
    },
    {
      title: 'Chat SQL Agent',
      kicker: 'AI-Powered Web App',
      glyph: 'database',
      image: 'assets/img/projects/chat-sql.png',
      repo: 'https://github.com/7amoody1985/chat-sql-agent',
      paper: null,
      demo: 'sql',       // "▶ Live demo": mock NL→SQL chat over an in-browser table
      desc: 'A natural-language-to-SQL app that lets non-technical users query relational databases over a FastAPI backend. LlamaIndex + a locally hosted Ollama LLM handle schema reasoning and adaptive SQL generation — fully offline, context-aware, and with zero per-query API cost.',
      tags: ['Python', 'FastAPI', 'LlamaIndex', 'Ollama', 'SQLAlchemy'],
    },
    {
      title: 'AutoConnect',
      kicker: 'Android App',
      glyph: 'phone',
      image: 'assets/img/projects/autoconnect.png',
      repo: 'https://github.com/7amoody1985/AutoConnect',
      paper: 'assets/files/reports/autoconnect.pdf',
      desc: 'A feature-complete roadside-assistance app with a 4-layer service-oriented architecture, 8 screens and role-based access for customers, drivers and admins. Real-time driver tracking via Firestore listeners (Observer), 30s background sync, push notifications, and Google Directions/Places/Maps via a Repository pattern. Full Jetpack Compose UI.',
      tags: ['Kotlin', 'Jetpack Compose', 'Firestore', 'Retrofit', 'Google Maps API'],
    },
    {
      title: 'Personal Portfolio Website',
      kicker: 'Web · Built from scratch',
      glyph: 'code',
      image: 'assets/img/projects/portfolio.png',
      repo: 'https://github.com/7amoody1985/portfolio', // ← update if your repo name differs
      paper: null,
      size: 'sm',        // narrower card
      desc: 'This site — vanilla HTML/CSS/JS, no frameworks, no build step. One config file drives everything: three themes, a command palette (Ctrl/Cmd+K), scroll-driven section transitions, and interactive in-browser demos of my projects (MRI pipeline, crawler simulation, NL→SQL chat).',
      tags: ['Vanilla JS', 'HTML / CSS', 'No frameworks', 'Responsive', 'a11y'],
    },
    {
      title: 'Brick Breaker Game',
      kicker: 'Refactor & Extension',
      glyph: 'game',
      image: 'assets/img/projects/brick-breaker.png',
      repo: 'https://github.com/7amoody1985/Basic-Brick-Breaker-Game',
      paper: null,
      play: 'brick',   // adds a "▶ Play" button that opens the in-browser mini-game (brickbreaker.js)
      desc: 'Inherited a buggy JavaFX codebase and resolved 40+ bugs — race conditions on simultaneous block destruction, inconsistent ball physics, and broken hitbox detection at high speeds. Refactored a monolithic structure into a focused package architecture, added JUnit 5 test coverage and thread synchronisation, and extended the game with a full UI system: menus, sound, and save/load persistence.',
      tags: ['Java 17', 'JavaFX', 'Maven', 'JUnit 5'],
    },
  ],

  /* ---- Experience & education timeline (newest or most relevant first) ---- */
  timeline: [
    {
      when: 'May 2026',
      role: 'Automotive Diagnostics Technician',
      org: 'Digital Engineering · Riyadh, Saudi Arabia',
      desc: 'Diagnosed vehicle electronic/software faults with OBD-II tools and manufacturer software; performed ECU calibration and updates. A systematic, evidence-based troubleshooting methodology that transfers directly to debugging and root-cause analysis in software and ML systems.',
    },
    {
      when: 'Sep 2021 — Jul 2025',
      role: 'BSc (Hons) Software Engineering',
      org: 'University of Nottingham · Upper Second Class Honours (2:1)',
      desc: 'End-to-end software & ML engineering: deep learning, NLP, full-stack and mobile development, data structures & algorithms.',
    },
  ],

  /* ---- Contact section ---- */
  contact: {
    kicker: 'Get in touch',
    title: 'Let\'s build something <span class="accent">intelligent</span>.', // HTML allowed
    sub: 'Open to AI/ML Engineer and Data Engineer roles. The fastest way to reach me is email.',
    extra: 'Arabic — Native · English — Fluent (bilingual)', // small line under the links; '' to hide
    availability: 'Available to join — Transferable Iqama, no new visa sponsorship needed', // status pill at the very bottom; '' to hide
  },

  /* ---- Footer (left side is automatically "© YEAR — your name") ---- */
  footer: {
    right: '<span class="mono">Riyadh, SA</span> · AI / ML Engineer', // HTML allowed, '' to hide
  },

  /* ---- Section headings (numbered automatically) ---- */
  sections: {
    about: 'About',
    skills: 'Skills & Tooling',
    projects: 'Selected Projects',
    experience: 'Experience & Education',
  },
};
