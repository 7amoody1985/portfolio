# Portfolio Template

A fast, single-page developer/engineer portfolio — built from scratch with **vanilla HTML, CSS and JavaScript**. No framework, no build step, no dependencies.

**The whole site is driven by one file: [`assets/js/config.js`](assets/js/config.js).** Fork it, fill in your details, drop in your PDFs/screenshots, and you have your own portfolio.

> Currently configured for **Mohammed Dasouqi**.
> 🔗 **Live:** dasouqi.com

## Features

- One-file configuration — edit `config.js`, nothing else
- Three colour themes, saved between visits — **Graphite Gold** (default, graphite + champagne gold), **Porcelain** (warm light), **Aurora** (teal→blue→fuchsia dark)
- **Interactive in-browser project demos** (all vanilla JS, no network calls):
  - an animated two-stage **MRI pipeline** (detect → crop → segment) on the featured project
  - a live **web-crawler simulation** — semantic-priority vs breadth-first, with a relevance comparison
  - a mock **natural-language → SQL chat** whose results are genuinely computed in the browser
- Command palette (`Ctrl` / `Cmd` + `K`) — navigation, themes, demos and the game
- **Scroll-reactive neural-network background** — depth-based parallax layers that stretch into "warp" motion streaks while you scroll
- Scroll-driven section transitions, per-letter gradient hero animation, tech marquee, 3D-tilt project cards, magnetic buttons
- Consistent brand mark from one config value — monogram tile in the nav, favicon and OG share the same design
- Optional animated metric rings for the featured project
- Optional playable mini-game popup (vanilla `<canvas>`) — attach to any project with a `play` flag
- Project cards with source-code and PDF-report links (auto-dimmed if a file is missing), and per-card sizing (`size: 'lg' | 'sm'`)
- SEO & a11y built in: JSON-LD Person schema, `theme-color` synced to the active theme, focus-trapped modals, fully responsive, respects `prefers-reduced-motion`

---

## Make it your own

1. **Edit `assets/js/config.js`** — it's one well-commented object holding everything: your name, links, hero, about, skills, projects, experience and contact. Set any optional field to `''` or `false` to hide it.
2. **Add your files:**
   - Résumé → `assets/files/` (then point `links.resume` at it)
   - Project reports (PDF) → `assets/files/reports/` (then set a project's `paper`)
   - Screenshots → `assets/img/projects/` (then set a project's `image`)
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
