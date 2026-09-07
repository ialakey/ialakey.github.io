# ialakey.github.io

Personal portfolio of **Ilia Alakov** — Senior Backend Engineer.
Live at **https://ialakey.github.io**

## What this is

A single static page. No framework, no build step, no dependencies to install —
`index.html` plus three files in `assets/`. GitHub Pages serves it straight from `main`.

```
index.html            the whole page
404.html              redirects stray URLs back to /
assets/styles.css     design system (CSS variables, dark + light themes)
assets/main.js        project grid, live GitHub stars, counters, scroll reveal
assets/og.png         social preview card (1200×630)
assets/favicon.svg
```

## Running it locally

Any static server works:

```bash
python -m http.server 8000
# then open http://localhost:8000
```

Opening `index.html` directly via `file://` also works, except the live star
counts (the GitHub API call needs an http origin). The page falls back to
hard-coded counts when the request fails, so nothing looks broken.

## Editing

- **Projects** — the `PROJECTS` array at the top of `assets/main.js`. Each entry has
  `repo`, `title`, `desc`, `lang`, `color`, a fallback `stars` count and an optional `badge`.
  Star counts are refreshed at runtime from the GitHub API; the static value is only a fallback.
- **Experience, stack, contacts** — plain markup in `index.html`.
- **Colors, spacing, radii** — CSS variables in the `:root` block of `assets/styles.css`.
  The light theme overrides the same variables under `html[data-theme="light"]`.
- **Social card** — `assets/og.png`, 1200×630.

## Deploying

Push to `main`. GitHub Pages is configured to build from the `main` branch, root folder.

## Previous contents

This repository used to host *LinguoMe*, a React flashcards app. It was replaced by the
portfolio; the full source is still in this repository's git history.
