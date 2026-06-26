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
    favicon: '◈', // one character/emoji used as the browser-tab icon
  },

  /* ---- Top-left logo ---- */
  brand: {
    monogram: '◈',         // small symbol before your name ('' to hide)
    pre: 'Mohammed',       // text before the accent dot
    post: 'Dasouqi',       // text after the accent dot
  },

  /* ---- Default colour theme: 'light' | 'professional' | 'neural' ---- */
  defaultTheme: 'light',

  /* ---- Links (reused in the hero, contact section and command palette) ---- */
  links: {
    github:   'https://github.com/7amoody1985',
    linkedin: 'https://linkedin.com/in/mohammeddasouqi',
    email:    'mohammeddasouqi@hotmail.com',
    phone:    '+966 53 862 2526',          // '' to hide
    resume:   'assets/files/Mohammed_Dasouqi_CV.pdf', // '' to hide résumé buttons
  },

  /* ---- Hero (the first screen) ---- */
  hero: {
    status: 'Available to join — Transferable Iqama, no new visa sponsorship needed', // '' to hide the pill
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
    { group: 'Languages', items: ['Python', 'Kotlin', 'C++', 'PHP', 'JavaScript', 'SQL', 'HTML/CSS'] },
    { group: 'Backend & Data', items: ['FastAPI', 'SQLAlchemy', 'REST API design', 'asyncio / aiohttp', 'Retrofit', 'MySQL', 'Firebase / Firestore'] },
    { group: 'Foundations', items: ['Data structures & algorithms', 'OOP design', 'SDLC', 'Observer · Repository · MVVM'] },
    { group: 'Tools & Platforms', items: ['Git / GitHub', 'TensorBoard', 'CUDA', 'VS Code', 'JetBrains IDEs', 'Google Maps/Places APIs'] },
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
    note: '↳ Detection met or beat the original RepVGG-GELAN paper (Precision 98.6% vs 98.2%, AP<sub>50:95</sub> 73.0% vs 72.3%). Annotation-quality filtering improved Dice by 1.5% and removed a systematic "circular effect" bias in predicted masks.', // HTML allowed, '' to hide
    tags: ['PyTorch 2.6', 'YOLO', 'RepVGG-GELAN', 'EfficientUNet++', 'EfficientNet-B0', 'CUDA'],
    repo: 'https://github.com/7amoody1985/Brain-Tumor-Detection-Segmentation', // '' to hide
    paper: 'assets/files/reports/brain-tumor-detection-segmentation.pdf',       // '' to hide
    // Left-hand visual. Options:
    //   demo: 'mri'  → the built-in interactive MRI segmentation demo
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
     A project with neither repo nor paper shows a small muted note instead. */
  projects: [
    {
      title: 'Intelligent Web Crawler',
      kicker: 'AI Agent',
      glyph: 'crawler',
      image: null,
      repo: 'https://github.com/7amoody1985/intelligent-web-crawler',
      paper: 'assets/files/reports/intelligent-web-crawler.pdf',
      desc: 'A budget-aware async crawler that prioritises URLs dynamically — combining Sentence-BERT semantic scoring, anchor-text relevance weighting and a BERT-based QA snippet-extraction pipeline — to replace static breadth-first traversal. A closed-loop online fine-tuning system periodically re-trains both the embedding and snippet models on data collected mid-crawl, improving relevance in 80% of runs. Across 25 runs it averaged 95.4% precision, 85.6% recall and 90.1% F1 — beating breadth-first and TF-IDF baselines while holding semantic diversity above 60%.',
      tags: ['Python', 'asyncio / aiohttp', 'Sentence-BERT', 'BERT QA', 'Online fine-tuning'],
    },
    {
      title: 'Chat SQL Agent',
      kicker: 'AI-Powered Web App',
      glyph: 'database',
      image: null,
      repo: 'https://github.com/7amoody1985/chat-sql-agent',
      paper: null,
      desc: 'A natural-language-to-SQL app that lets non-technical users query relational databases over a FastAPI backend. LlamaIndex + a locally hosted Ollama LLM handle schema reasoning and adaptive SQL generation — fully offline, context-aware, and with zero per-query API cost.',
      tags: ['Python', 'FastAPI', 'LlamaIndex', 'Ollama', 'SQLAlchemy'],
    },
    {
      title: 'AutoConnect',
      kicker: 'Android App',
      glyph: 'phone',
      image: null,
      repo: 'https://github.com/7amoody1985/AutoConnect',
      paper: 'assets/files/reports/autoconnect.pdf',
      desc: 'A feature-complete roadside-assistance app with a 4-layer service-oriented architecture, 8 screens and role-based access for customers, drivers and admins. Real-time driver tracking via Firestore listeners (Observer), 30s background sync, push notifications, and Google Directions/Places/Maps via a Repository pattern. Full Jetpack Compose UI.',
      tags: ['Kotlin', 'Jetpack Compose', 'Firestore', 'Retrofit', 'Google Maps API'],
    },
    {
      title: 'Personal Portfolio Website',
      kicker: 'Web · Built from scratch',
      glyph: 'code',
      image: null,
      repo: 'https://github.com/7amoody1985/portfolio', // ← update if your repo name differs
      paper: null,
      desc: 'A fully custom single-page portfolio built from scratch with vanilla HTML, CSS and JavaScript — no frameworks, no build step, no dependencies. Features a command palette (Ctrl/Cmd+K), an animated neural-network background, scroll-reveal animations, and three switchable themes with localStorage persistence, all driven by a single data-driven config file. Includes an interactive MRI segmentation demo that visualises the Brain Tumor FYP pipeline for non-technical audiences. You\'re looking at it.',
      tags: ['Vanilla JS', 'HTML / CSS', 'No frameworks', 'Responsive', 'a11y'],
    },
    {
      title: 'Online Booking System',
      kicker: 'Full-Stack Web App',
      glyph: 'calendar',
      image: null,
      repo: null,   // no public source code for this project
      paper: null,
      desc: 'A full-stack booking platform with user authentication, payment processing and role-based admin management. Built with reusable backend and frontend components to cut duplication, delivered iteratively within a cross-functional team.',
      tags: ['PHP', 'MySQL', 'HTML/CSS'],
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
