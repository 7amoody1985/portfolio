# Portfolio Template

A fast, single-page developer/engineer portfolio — built from scratch with **vanilla HTML, CSS and JavaScript**. No framework, no build step, no dependencies.

**The whole site is driven by one file: [`assets/js/config.js`](assets/js/config.js).** Fork it, fill in your details, drop in your PDFs/screenshots, and you have your own portfolio.

> Currently configured for **Mohammed Dasouqi**.
> 🔗 **Live:** dasouqi.com

## Features

- One-file configuration — edit `config.js`, nothing else
- **Minimal ink-on-paper design** — oversized display typography (Archivo / Space Grotesk), hairline dividers, one blue accent
- **Light / dark themes** with a single toggle, saved between visits (`defaultTheme` in config — dark by default)
- **AI chatbot** that answers visitor questions about the CV/projects only — backed by Claude via a Cloudflare Worker, grounded in a knowledge base plus per-project report digests, and protected by rate limits, daily cost caps, and Turnstile (see `chatbot-worker/`)
- **Interactive in-browser project demos** (all vanilla JS, no network calls):
  - an animated two-stage **MRI pipeline** (detect → crop → segment) on the featured project
  - a live **web-crawler simulation** — semantic-priority vs breadth-first, with a relevance comparison
  - a mock **natural-language → SQL chat** whose results are genuinely computed in the browser
- **Flowy motion throughout** — masked hero name reveal, rotating role word, scroll reveals, a self-drawing experience timeline (with parallax year watermarks) and a wiggling scroll-drawn line beside the projects, hide-on-scroll nav, trailing cursor ring, magnetic CTA, count-up metrics, tech marquee
- Editorial project rows with source-code and PDF-report links (auto-dimmed if a file is missing)
- Optional playable mini-game popup (vanilla `<canvas>`) — attach to any project with a `play` flag
- SEO & a11y built in: JSON-LD Person schema, `theme-color` synced to the active theme, focus-trapped modals, fully responsive, respects `prefers-reduced-motion`

---

## Make it your own

1. **Edit `assets/js/config.js`** — it's one well-commented object holding everything: your name, links, hero, about, skills, projects, experience and contact. Set any optional field to `''` or `false` to hide it.
2. **Add your files:**
   - Résumé → `assets/files/` (then point `links.resume` at it)
   - Project reports (PDF) → `assets/files/reports/` (then set a project's `paper`)
   - A screenshot for the featured project → `assets/img/projects/` (set `featured.image`; regular project rows are text-only by design)
   - Any link to a file that doesn't exist yet is automatically dimmed on the live site — nothing shows as broken.
3. **(Optional) Theme colours & fonts** live as CSS variables at the top of `assets/css/style.css`.

That's it — no other file needs editing for normal use.

> After editing `config.js`, `style.css`, `app.js` or `demos.js`, bump the `?v=` number on their tags in `index.html` so browsers fetch the new version instead of a cached copy.

## Run locally

No build needed. Serve the folder with any static server:

```bash
python -m http.server 8000   # then open http://localhost:8000
```

Opening `index.html` directly also works (the only thing that needs a server is the "is this PDF present?" check, which is skipped on `file://`).

## Deploy (GitHub Pages)

1. Push this folder to a GitHub repo.
2. **Settings → Pages → Source: Deploy from a branch**, branch `main`, folder `/ (root)`.
3. Live at `https://<username>.github.io/<repo>/` (name the repo `<username>.github.io` for a clean root URL).

Also works as-is on Netlify or Vercel.

## Project structure

```
.
├─ index.html              # thin template (mount points only)
├─ assets/
│  ├─ css/style.css        # styles + theme variables
│  ├─ js/
│  │  ├─ config.js         # ← all your content lives here
│  │  ├─ app.js            # rendering engine (rarely needs editing)
│  │  ├─ demos.js          # interactive project demos (crawler sim, NL→SQL chat)
│  │  ├─ brickbreaker.js   # the mini-game popup
│  │  └─ chatbot.js        # AI chat widget (talks to chatbot-worker/)
│  ├─ files/               # résumé + project reports (PDF)
│  └─ img/                 # favicon.svg, og.png, projects/ screenshots
├─ chatbot-worker/         # Cloudflare Worker backing the AI chatbot (Claude API)
└─ README.md
```

## AI chatbot (optional)

The chat widget calls a small Cloudflare Worker in `chatbot-worker/` that proxies the Claude API, so the Anthropic key never reaches the browser. It answers from a hand-written knowledge base (`chatbot-worker/src/knowledge.js`) built from `config.js` + your CV. When a visitor asks about a specific project, the worker also injects a detailed digest of that project's report (`chatbot-worker/src/reports.js` — condensed summaries of the PDFs in `assets/files/reports/`, keyed by project) so it can answer in depth. Only the relevant digest is sent, so ordinary chats stay cheap. Update the matching digest in `reports.js` and redeploy whenever a report PDF changes.

To reuse it for your own fork:
1. `cd chatbot-worker && npm install`
2. Edit `src/knowledge.js` with your own background.
3. `npx wrangler secret put ANTHROPIC_API_KEY --config wrangler.toml`, then `npx wrangler deploy --config wrangler.toml` (always pass `--config`, or wrangler mis-detects the whole repo as static assets).
4. Point `CONFIG.chatbot.endpoint` in `config.js` at your deployed Worker URL, and add that URL to the CSP `connect-src` in `index.html`.

To skip it entirely, leave `CONFIG.chatbot.endpoint` empty — the widget won't render.

### Abuse & cost protection

The worker layers several defences so the chat can't be scraped or used to run up the Anthropic bill:
- **Origin allowlist + CORS** — only the site's own origins may call `/chat`.
- **Per-IP burst limit** — 10 requests / 60 s via the `RATE_LIMITER` binding.
- **Daily cost caps** — a hard backstop in the `USAGE` KV namespace: 800 accepted messages/day globally and 40/day per IP (UTC, tunable at the top of `src/index.js`). Fails open on KV errors so a hiccup never takes the chat down.
- **Cloudflare Turnstile** — an invisible bot challenge. It's enforced only when the `TURNSTILE_SECRET` worker secret is set, so the worker stays working before it's configured.

To turn Turnstile on:
1. In the Cloudflare dashboard, **Turnstile → Add widget** (mode: Managed) for your domain ex:`dasouqi.com`. Note the **site key** (public) and **secret key** (private).
2. Set `CONFIG.chatbot.turnstileSiteKey` in `config.js` to the site key.
3. Set the secret on the worker: `npx wrangler secret put TURNSTILE_SECRET --config wrangler.toml` (paste the secret key).
4. **Go-live order matters:** deploy the front-end (site key live) *before* setting the worker secret, or set the secret only once the new `chatbot.js` is live — otherwise the live page sends no token and every request is rejected. Turnstile is skipped automatically on localhost.

## License

Free to use and adapt for your own portfolio.
