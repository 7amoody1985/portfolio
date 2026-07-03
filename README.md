# Portfolio Template

A fast, single-page developer/engineer portfolio — built from scratch with **vanilla HTML, CSS and JavaScript**. No framework, no build step, no dependencies.

**The whole site is driven by one file: [`assets/js/config.js`](assets/js/config.js).** Fork it, fill in your details, drop in your PDFs/screenshots, and you have your own portfolio.

> Currently configured for **Mohammed Dasouqi**.
> 🔗 **Live:** dasouqi.com

## Features

- One-file configuration — edit `config.js`, nothing else
- **Minimal ink-on-paper design** — oversized display typography (Archivo / Space Grotesk), hairline dividers, one blue accent
- **Light / dark themes** with a single toggle, saved between visits (`defaultTheme` in config)
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
│  │  └─ brickbreaker.js   # the mini-game popup
│  ├─ files/               # résumé + project reports (PDF)
│  └─ img/                 # favicon.svg, og.png, projects/ screenshots
└─ README.md
```

## License

Free to use and adapt for your own portfolio.
