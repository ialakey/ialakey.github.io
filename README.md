# ialakey.github.io

Personal portfolio of **Ilia Alakov** — Senior Backend Engineer.
Live at **https://ialakey.github.io**

## What this is

A single static page. No framework, no build step, no dependencies to install —
`index.html` plus a handful of files in `assets/`. GitHub Pages serves it straight from `main`.

```
index.html                    the whole page
404.html                      redirects stray URLs back to /
assets/styles.css             design system (CSS variables, dark + light themes)
assets/main.js                rendering, counters, scroll reveal, theme toggle
assets/projects-lib.js        which repos appear in the grid, and in what order
assets/projects.json          generated daily from the GitHub API — do not edit
assets/og.png                 social preview card (1200×630)
assets/favicon.svg
scripts/update-projects.js    regenerates assets/projects.json
.github/workflows/update-projects.yml
```

## Running it locally

Any static server works:

```bash
python -m http.server 8000
# then open http://localhost:8000
```

Opening `index.html` directly via `file://` also works: `assets/projects.json`
can't be fetched from a `file://` origin, so the page falls back to asking the
GitHub API for the repository list and builds the same grid in the browser.

## The project grid updates itself

Nothing about a new repository has to be typed into this site.

`.github/workflows/update-projects.yml` runs `scripts/update-projects.js` every day
at 04:17 UTC (and on demand from the Actions tab), asks the GitHub API for the
profile's repositories, writes `assets/projects.json` and commits it only if the
result changed. Pushing that commit rebuilds Pages, so the site follows GitHub on
its own. Star counts are also refreshed live in the browser on every visit.

A repository shows up automatically when it is public, not a fork, not archived and
**has a GitHub description** — the description becomes the card text, so that one
field is the only thing worth keeping tidy. Repos without one are skipped.

## Editing

- **Projects** — `CONFIG` at the top of `assets/projects-lib.js`, the single source of
  truth for both the workflow and the browser fallback:
  - `limit` — how many cards the grid shows (currently 14).
  - `exclude` — repos that never appear.
  - `pinned` — repos shown first, in that order. Everything else fills the remaining
    slots by stars, then by most recently pushed.
  - `repos` — per-repo overrides: `title`, `desc`, `lang`, `color`, `badge`, `hide`.
    Anything left out comes from the GitHub API.

  After editing it, either wait for the daily run, hit **Run workflow** on the
  *Update projects* action, or regenerate locally:

  ```bash
  node scripts/update-projects.js
  ```

  (A `GITHUB_TOKEN` env var is optional locally — it only raises the API rate limit.)
- **Experience, stack, contacts** — plain markup in `index.html`. The repo count in the
  Projects lede is filled in from `projects.json` at runtime, and the three counters
  above the grid (repos, stars, languages) are recomputed from the live API in
  `assets/main.js` — the numbers in the markup are only the pre-JS fallback.
- **Colors, spacing, radii** — CSS variables in the `:root` block of `assets/styles.css`.
  The light theme overrides the same variables under `html[data-theme="light"]`.
- **Social card** — `assets/og.png`, 1200×630.

## Deploying

Push to `main`. GitHub Pages is configured to build from the `main` branch, root folder.

## Previous contents

This repository used to host *LinguoMe*, a React flashcards app. It was replaced by the
portfolio; the full source is still in this repository's git history.
