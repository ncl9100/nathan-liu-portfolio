# Nathan Liu — room portfolio

An interactive 3D model of my room (Three.js), drawn like an architectural drafting sheet, that
showcases my experience. Audience: recruiters and hiring managers for ML / data roles.

## Core features
- **Moving around the room** — exists: click objects to fly the camera there, drag to orbit,
  scroll to zoom, floor-plan view. Planned: a character you walk around with Minecraft-style
  views (first person, third person behind, third person front).
- **The room and its objects** — exists: desk, laptop, résumé paper, lamp, faucet, measurements,
  callouts, title block.
- **LiuOS** (the laptop's desktop) — exists: lock screen, apps, windows, dock. Planned: redesign
  it to match my real laptop.
- **Career content** — exists: nav opens LiuOS apps and the résumé pop-up. Planned: nav links go
  to their own About / Experience / Projects / Résumé pages, not LiuOS.

"Planned" items are context only. Don't start them, or build toward them, unless I ask.

## How the code is organized
- `index.html` is only a shell: meta tags, stylesheet links, one `<script type="module">` per component.
- One folder per component, each with its own `.html`, `.css`, `.js` (the `.js` fetches its `.html`):
  `room/room.*`, `liuos/laptop.*`, `resume-viewer/viewer.*`, `nav/nav.*`. A component's tunable
  values live in its own `settings.js` (room and LiuOS have one).
- Components never call each other. They talk with announcements (`CustomEvent`s on `document`),
  e.g. `laptop:open`, `resume:closed`, `room:go`. The comment at the top of each component's `.js`
  lists what it listens for and announces. Keep that comment up to date, and follow the pattern
  for new components.
  - One allowed exception: a component may read another component's `settings.js` (the room
    reads `LIUOS_CONFIG` for the 3D screen's brightness). Never import another component's logic.
- Facts about me (profile, projects, experience) live only in `content/portfolio.js`. Update them
  there; don't copy them elsewhere.
- Shared styles: `css/base.css`. Shared files: `assets/`.
- CSS order matters: `nav/nav.css` loads last on purpose (see the comment in `index.html`).
- Three.js is imported by URL in both `room/room.js` and `liuos/laptop.js`. The URLs must match
  exactly so the browser loads it once. If you change the version, change it in both files.

## Quality bar
- Keep it working on phones (the nav has a mobile menu) and with `prefers-reduced-motion`.
- No console errors.

## Run, test, and deploy
- Run locally: `python -m http.server 8000`, then open http://localhost:8000. It must be served
  over HTTP (not opened as a file) because components fetch their `.html`.
- No build step, no npm. Three.js loads from jsDelivr.
- Browser check after any change:
  1. Intro plays; clicking objects flies the camera there; floor-plan view works.
  2. Laptop: opens → lock screen → sign in → open an app → close.
  3. Every nav link works, on desktop and in the mobile menu.
  4. Résumé opens and closes (button and Esc), and the camera returns.
  5. Console has no errors.
- Vercel deploys the `main` branch as-is, so `main` is the live site. Work on a branch and
  merge through a PR. Don't push, open PRs, or merge unless I ask.

## Working with me
- I'm learning. Explain what you change and why, in plain language.
- Ask me before making design decisions. That means both:
  - visual: colors, layout, wording, animations, what a feature looks like
  - code: new files or folders, new announcements, changing how components fit together
- When reorganizing or refactoring, the site should look and behave the same; check it in the
  browser using the checklist above.