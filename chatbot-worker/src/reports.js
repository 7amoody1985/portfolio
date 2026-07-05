/* =========================================================================
   reports.js — detailed digests of the project report PDFs, bundled for the
   chatbot so it can answer in depth when a visitor asks about a specific
   project or its report.

   These are hand-written condensed summaries of the reports in
   assets/files/reports/ (not the raw PDF text) — dense with the
   architecture, methods, and metrics a recruiter or interviewer asks about,
   but a fraction of the tokens. When a report PDF changes, update the
   matching digest here and redeploy.

   Only the digest matching the current question is injected into the prompt
   (see selectReports) — base chats never carry this text.
   ========================================================================= */

export const REPORTS = [
  {
    id: 'brain-tumor',
    project: 'Brain Tumor Detection & Segmentation',
    pdf: 'assets/files/reports/brain-tumor-detection-segmentation.pdf',
    aliases: [
      'brain tumor', 'brain-tumor', 'brain tumour', 'tumor', 'tumour', 'mri', 'segmentation',
      'detection', 'yolo', 'unet', 'efficientunet', 'repvgg', 'gelan', 'dice', 'iou', 'br35h',
      'dissertation', 'final year', 'final-year', 'fyp', 'flagship', 'medical imaging', 'brain scan',
    ],
    text: `Brain Tumor Detection & Segmentation — final-year BSc (Software Engineering) dissertation, University of Nottingham (Malaysia campus), 2025, supervised by Dr Iman Liao. Mohammed's solo project; he started it with no prior machine-learning experience and built the whole pipeline, training, and evaluation from the ground up. Full title: "Hybrid YOLO-UNet++ Framework for Efficient Brain Tumor Localization and Segmentation in MRI Scans."

Approach — a two-stage (decoupled) deep-learning pipeline: a YOLO-style detector first localizes the tumor and crops it out, then a segmentation network produces a pixel-level mask on that crop. Decoupling lets each model be optimized, debugged, and swapped independently while keeping inference efficient.
- Stage 1, detection: RepVGG-GELAN-C, a YOLOv9-era detector (Balakrishnan & Sengar, 2024) — a RepVGG reparameterized backbone plus a GELAN detection head, with SPPELAN and RepNCSPELAN4 blocks over P3/P4/P5 feature maps. Trained entirely from scratch, no pretrained detection weights (config models/detect/rcs-gelan-c.yaml).
- Detection-to-segmentation bridge (custom logic in detect.py): each predicted box is padded (default 10 px) to keep peritumoral context, cropped from the full-resolution MRI, and saved with a matching binary mask; nested tumors are separated out and not segmented.
- Stage 2, segmentation: a custom EfficientUNet++ — an EfficientNet-B0 encoder (ImageNet-pretrained via timm, all layers trainable) feeding a nested U-Net++ decoder with dense skip pathways; the final node x0_3 goes through a 1x1 conv, sigmoid, and a 0.5 threshold to a binary mask. Deep supervision was implemented and tested but gave no gain, so it was removed to keep the model simple.

Data — the BR35H brain-tumor dataset (Ahmed Hamada, Kaggle): grayscale 2D MRI, 800 scans pre-split into 500 train / 200 validation / 100 test.
- Annotation quality control: BR35H labels come as polygons, circles, and ellipses. The circular/elliptical masks are imprecise and caused a "circular effect" bias where predicted masks turned rounded even for irregular tumors. Excluding the non-polygon annotations (--exclude-circles / --exclude-ellipses) improved Dice by 1.5% and removed that bias.

Training details:
- Detection: 640x640 input, 150 epochs, batch 8, SGD (momentum 0.937, weight decay 0.0005), LR 0.01 to 0.0001 (OneCycle), mosaic for the first 135 epochs, mixup 0.15, copy-paste 0.3; loss = CIoU box + objectness + classification + DFL.
- Segmentation: 256x256 input, 50 epochs, Adam (LR 0.0005, weight decay 0.0001), loss = BCE + 5x Dice, LR warmup then CosineAnnealing, early stopping (patience 5), joint image/mask augmentation (flips, +/-15 degree rotation, colour jitter).
- Environment: Python 3.9.13, PyTorch 2.6.0, CUDA 12.6, a single NVIDIA RTX 3070 Laptop GPU (8 GB). Detection inference is about 86 ms plus 166 ms NMS per image.

Results:
- Segmentation (held-out test set, 133 tumor crops): Dice 0.9375, IoU 0.8944, Precision 0.9509, Recall 0.9592, Pixel accuracy 0.9372.
- Detection vs the original RepVGG-GELAN paper: Precision 0.986 (paper 0.982), Recall 0.907 (paper 0.890), AP50:95 0.730 (paper 0.723); AP50 was 0.959 (paper 0.970). So the from-scratch reimplementation met or slightly beat the paper on precision, recall, and AP50:95.
- Notable qualitative finding: in some cases the model's boxes/masks fit the tumor better than the dataset's ground truth (which was sometimes oversized or oversimplified), yet were still scored as wrong against those imperfect labels.

Limitations and future work: small or faint low-contrast tumors are sometimes missed by the detector or under-segmented; results depend on the detector (if detection fails, segmentation gets bad input); it was evaluated only on BR35H. Future work: broader multi-dataset evaluation, better low-contrast handling, and confidence/uncertainty maps for clinical trust.

Source: github.com/7amoody1985/Brain-Tumor-Detection-Segmentation.`,
  },
  {
    id: 'web-crawler',
    project: 'Intelligent Web Crawler',
    pdf: 'assets/files/reports/intelligent-web-crawler.pdf',
    aliases: [
      'web crawler', 'crawler', 'crawling', 'spider', 'sentence-bert', 'sbert', 'embedding',
      'semantic search', 'snippet', 'breadth-first', 'harvest rate', 'focused crawl', 'budgeted crawler',
    ],
    text: `Intelligent Web Crawler — an academic project/paper at the University of Nottingham titled "An Intelligent, Budgeted Web Crawler Using Active Embedding-Based Adaptation." It is a two-author paper co-written by Asif Ahamed Siddique (Computer Science with AI) and Mohammed Dasouqi (Software Engineering); the work and implementation were shared between them.

Goal — an AI-powered crawler that autonomously navigates the web to extract high-quality, topic-relevant snippets within a fixed page budget, instead of blindly following static breadth-first or depth-first heuristics that fetch many irrelevant pages.

How it works:
- The crawl is modelled as a budgeted sequential decision process (an episodic MDP) over the hyperlink graph: states are visited pages plus frontier priorities, actions pick the next URL, reward is a page's relevance to the query, and the horizon is the page budget B.
- Query-focused snippet extraction: a pretrained BERT question-answering model (BERT fine-tuned on SQuAD) pulls the span most relevant to the topic from each page, falling back to embedding-based summarization on failure or thin content. This denoises pages before scoring.
- Semantic relevance scoring: the topic and each snippet are embedded with Sentence-BERT and compared by cosine similarity. Each discovered link gets a composite priority = alpha * content relevance + (1 - alpha) * anchor-text similarity, and is pushed onto a max-heap frontier.
- Online adaptation (active learning): every B pages, visited snippets are labelled by a relevance threshold and the embedding model, QA extractor, and summarizer are periodically fine-tuned on the collected data (embedder 3 epochs, QA 2 epochs, summarizer 3 epochs), so relevance estimates improve mid-crawl.
- Theory: because the cumulative-relevance objective is monotone and submodular, greedy frontier selection has the classic (1 - 1/e) near-optimality guarantee (Nemhauser et al.).

Implementation: Python with asyncio for concurrent fetching. An AsyncCrawler class manages a heapq max-heap frontier, a visited set, and content-hash deduplication; fetch retries up to 3 times with rotating user-agents. Seed URLs come from Google Custom Search. Modules: Webcrawl.py (crawler), embed_finetune.py, question_finetune.py, summarize_finetune.py.

Evaluation (25 runs, 20-page budget), benchmarked against breadth-first and TF-IDF focused crawlers:
- Average precision 0.954, recall 0.856, F1 0.901. Precision stayed above 0.88 in every run and hit 1.00 in ten runs.
- Semantic diversity averaged about 0.68 and never dropped below 0.60 — it kept exploring varied subtopics rather than fetching near-duplicates.
- The online fine-tuning loop helped: second-half relevance beat first-half relevance in 80% of runs (mean gains 0.02-0.06).
- Robustness: timeout / HTTP / parsing errors stayed below 5% of fetches.

Limitations and future work: recall varies on early runs / cold starts with weak seed URLs; results depend on seed quality; embedding plus QA add latency under high concurrency; no content-freshness evaluation; error handling is uniform; no user-centric success metrics. Future ideas: a reinforcement-learning (deep Q-learning) policy for long-term objectives, lighter/faster embeddings, and human-in-the-loop feedback.

Source: github.com/7amoody1985/intelligent-web-crawler (the repo excludes the fine-tuned model weights due to GitHub's 25 MB per-file limit).`,
  },
  {
    id: 'autoconnect',
    project: 'AutoConnect',
    pdf: 'assets/files/reports/autoconnect.pdf',
    aliases: [
      'autoconnect', 'auto connect', 'roadside', 'tow', 'towing', 'android', 'kotlin',
      'jetpack compose', 'firebase', 'firestore', 'retrofit', 'mdp', 'google maps',
    ],
    text: `AutoConnect — an Android mobile app built for Mohammed's Mobile Device Programming coursework (MDP Coursework 2), University of Nottingham, 2024. Solo project.

What it is: a roadside-assistance / tow-service app that connects vehicle owners with nearby workshops and tow drivers, including a workshop catalogue. The idea is convenience towing — your car doesn't have to be undrivable; you can have someone tow it to a workshop and back.

Architecture — a modular, service-oriented design with four layers and clear separation of concerns:
- Data layer: data models (DirectionsResponse, Workshop, Order), a remote subpackage using Retrofit for external APIs, and a repository (e.g. WorkshopRepository) as a single source of truth.
- Service layer: AuthenticationService, DirectionsService, LocationServices, LocationUpdateService (background location updates while a tow is active), NotificationService, PlacesSdkService, and TowService (all tow-request operations, real-time updates, and Firestore persistence for both customer and driver).
- UI layer (Jetpack Compose, no XML): reusable components (CustomTopAppBar, MapViewComponent, ProfileDrawer, TechnicianGrid, WorkshopDetailsBottomBar), 8 screens (Driver, Home, Login, Order, SignUp, Tow, WorkshopBrowse, WorkshopDetails), and a theme package; a WorkshopViewModel sits in a separate viewmodel layer.
- Utility layer: NavigationUtils (hands navigation off to Google Maps or Waze), OpeningHoursFormatter, and RouteUtils (polyline decoding, distance formatting).

External services: Firebase Authentication (accounts/profiles), Firebase Firestore (users, workshops, tow requests, completed orders, and live driver-location tracking), Google Maps SDK (maps in TowScreen/DriverScreen), Google Places API (workshop details like ratings and hours, plus location autocomplete), and Google Directions API (ETAs, distances, route polylines). Retrofit handles the REST calls.

Design patterns and behaviour:
- Modular architecture for maintainability and scalability.
- Component-based, declarative Jetpack Compose UI with reactive state management.
- Observer pattern via Firestore listeners for real-time updates — tow-request status and driver location. Live tracking reads the driver's location from Firestore every 30 seconds; role-based screens serve customers vs drivers.

Testing: manual only — functional, UI, and integration testing across features; core features worked reliably and testers found the UI intuitive. Automated unit/integration/UI tests were not built (time constraints) and are the main planned future work.

Challenges and lessons (from the report): Mohammed underestimated the project's scope and handled it by breaking the app into modules with micro-deadlines; integrating Google Maps + location + live tracking was the hardest part and was solved incrementally; adding background services late forced rework, and the key lesson was to plan such features from the start.

Source: github.com/7amoody1985/AutoConnect.`,
  },
];

/* Pick the report digest(s) relevant to the recent user turns.
   Scores each report by how many of its alias phrases appear in the last
   few user messages; returns the best matches, capped by count + a total
   character budget so the injected block stays bounded. */
const MAX_REPORTS = 3;
const CHAR_BUDGET = 24000;

export function selectReports(messages) {
  const recent = messages
    .filter((m) => m.role === 'user')
    .slice(-3)
    .map((m) => m.content.toLowerCase())
    .join(' \n ');
  if (!recent) return '';

  const scored = REPORTS
    .map((r) => ({ r, score: r.aliases.reduce((n, a) => (recent.includes(a) ? n + 1 : n), 0) }))
    .filter((x) => x.score > 0)
    .sort((a, b) => b.score - a.score);

  const chosen = [];
  let budget = CHAR_BUDGET;
  for (const { r } of scored) {
    if (chosen.length >= MAX_REPORTS) break;
    if (r.text.length > budget) continue;
    chosen.push(r);
    budget -= r.text.length;
  }
  if (!chosen.length) return '';

  return (
    '================ PROJECT REPORT SUMMARIES ================\n' +
    'A detailed summary of the report(s) below is provided because the visitor is asking ' +
    'about the related project. Use it to answer accurately and in more depth; still ' +
    'follow the plain-text and on-topic rules above.\n\n' +
    chosen
      .map((r) => `----- REPORT SUMMARY: ${r.project} (${r.pdf}) -----\n${r.text}`)
      .join('\n\n') +
    '\n================ END PROJECT REPORT SUMMARIES ================'
  );
}
