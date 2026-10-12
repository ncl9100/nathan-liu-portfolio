# Nathan Liu — room portfolio

These are the instructions for every AI coding agent working in this repo (Claude Code, Cursor,
Antigravity, and others). This is the only rules file: `CLAUDE.md` just imports it. Put new rules here.

An interactive 3D model of my room (Three.js), drawn like an architectural drafting sheet, that
showcases my experience. Audience: recruiters and hiring managers for ML / data roles.

## Core features
- **Moving around the room** — exists: click objects to fly the camera there, drag to orbit,
  scroll to zoom, floor-plan view. Planned: a character you walk around with Minecraft-style
  views (first person, third person behind, third person front).
- **The room and its objects** — exists: desk, laptop, résumé paper, lamp, faucet, measurements,
  callouts, title block.
- **LiuOS** (the laptop's desktop) — exists: lock screen, apps, windows, dock. Planned: redesign
  it to match the website's design system (drafting paper, ink, serif type).
- **Career content** — exists: the same nav on every page links to About, Experience, Projects,
  and Contact pages (in `pages/`), and Résumé opens the PDF in a new tab. About shows my headshot
  and types out my bio. Idea for later: an animated character that speaks facts about me.

"Planned" items are context only. Don't start them, or build toward them, unless I ask.

## How the code is organized
- `index.html` is only a shell: meta tags, stylesheet links, one `<script type="module">` per component.
- One folder per component, each with its own `.html`, `.css`, `.js` (the `.js` fetches its `.html`):
  `room/room.*`, `liuos/laptop.*`, `resume-viewer/viewer.*`, `nav/nav.*`. A component's tunable
  values live in its own `settings.js` (room and LiuOS have one).
- Components never call each other. They talk with announcements (`CustomEvent`s on `document`),
  e.g. `laptop:open`, `laptop:closed`, `room:go`. The comment at the top of each component's `.js`
  lists what it listens for and announces. Keep that comment up to date, and follow the pattern
  for new components.
  - One allowed exception: a component may read another component's `settings.js` (the room
    reads `LIUOS_CONFIG` for the 3D screen's brightness). Never import another component's logic.
- Facts about me (profile, projects, experience) live only in `content/portfolio.js`. Update them
  there; don't copy them elsewhere.
- Career pages live in `pages/<name>/index.html` with their own `.css` and `.js`. Shared page
  styles are in `pages/pages.css` and the scroll fade-in is `pages/reveal.js`. Every page sets
  `<body data-page="...">` (the nav uses it) and ends with a "Back to the room" button.
- Shared styles: `css/base.css` (including the drafting-paper theme). Shared files: `assets/`
  (project screenshots in `assets/projects/`).
- CSS order matters: `nav/nav.css` loads last on purpose (see the comment in `index.html`).
- `resume-viewer/viewer.html` is a hand-made web copy of my LaTeX résumé (Jake's template, set in
  Computer Modern). When the résumé changes, update the PDF, `resume.png` (the desk texture), and this copy.
- Three.js is imported by URL in both `room/room.js` and `liuos/laptop.js`. The URLs must match
  exactly so the browser loads it once. If you change the version, change it in both files.

## Quality bar
- **Compatibility is a priority.** Every change must work on phones, tablets, and desktops: touch and
  mouse, screens from about 320px wide up, and current Chrome, Safari, Firefox, and Edge. Respect
  `prefers-reduced-motion`. Check the phone layout before calling anything done.
- No console errors.

## Run, test, and deploy
- Run locally: `python -m http.server 8000`, then open http://localhost:8000. It must be served
  over HTTP (not opened as a file) because components fetch their `.html`.
- No build step, no npm. Three.js loads from jsDelivr.
- Browser check after any change:
  1. Intro plays; clicking objects flies the camera there; floor-plan view works.
  2. Laptop: opens → lock screen → sign in → open an app → close.
  3. Every nav link works, on desktop and in the mobile menu.
  4. Résumé: the nav link opens the PDF in a new tab; the paper on the desk zooms in and opens the
     in-room résumé, and "Back to desk" goes to the shelves view.
  5. Console has no errors.
  6. Check every page at phone width (about 390px) and desktop width.
- Vercel deploys the `main` branch as-is, so `main` is the live site. Work on a branch and
  merge through a PR. Don't push, open PRs, or merge unless I ask.

## Working with me
- I'm learning. Explain what you change and why, in plain language.
- Ask me before making design decisions. That means both:
  - visual: colors, layout, wording, animations, what a feature looks like
  - code: new files or folders, new announcements, changing how components fit together
- When reorganizing or refactoring, the site should look and behave the same; check it in the
  browser using the checklist above.