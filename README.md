# Portfolio Template

A fast, single-page developer/engineer portfolio — built from scratch with **vanilla HTML, CSS and JavaScript**. No framework, no build step, no dependencies.

**The whole site is driven by one file: [`assets/js/config.js`](assets/js/config.js).** Fork it, fill in your details, drop in your PDFs/screenshots, and you have your own portfolio.

> Currently configured for **Mohammed Dasouqi**.
> 🔗 **Live:** dasouqi.com

## Features

- One-file configuration — edit `config.js`, nothing else
- Three colour themes — **Light** (default), **Subtle Dark**, **Colorful Dark** — saved between visits
- Command palette (`Ctrl` / `Cmd` + `K`) for quick navigation
- Animated neural-network background, typed hero role, scroll reveals
- Optional animated metric rings + an interactive MRI segmentation demo for a featured project
- Project cards with source-code and PDF-report links (auto-dimmed if a file is missing)
- Fully responsive; respects `prefers-reduced-motion`

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

> After editing `config.js`, `style.css` or `app.js`, bump the `?v=` number on their tags in `index.html` so browsers fetch the new version instead of a cached copy.

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
│  │  └─ app.js            # rendering engine (rarely needs editing)
│  ├─ files/               # résumé + project reports (PDF)
│  └─ img/projects/        # project screenshots (optional)
└─ README.md
```

## License

Free to use and adapt for your own portfolio.
