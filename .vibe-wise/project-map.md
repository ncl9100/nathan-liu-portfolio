# Project Map

## Purpose
Personal portfolio site: an interactive Three.js 3D model of Nathan's room. Clicking objects
(desk, laptop, résumé, lamp, kitchen faucet) moves the camera; the laptop opens "LiuOS", a
fake browser desktop with apps for About, Experience, Projects, Contact, Résumé, Terminal.

## Requirements
- Learner goal (2026-10-11): reorganize the codebase. Everything currently lives in one
  `index.html`; they want more organization. Target structure not yet decided.
- Existing constraints (from README): no build step, no npm install; deployed on Vercel as a
  static site from repo root.
- Learner requirement (2026-10-11): nav bar items (About, Experience, Projects…) become
  separate pages with a way back to the room, instead of opening the laptop/LiuOS.
  Page mechanism not decided.
- Learner's proposed components (not final): 3D room (interactive objects), nav bar, LiuOS,
  room settings, minor components (unspecified).

## Components (verified, all inside index.html, ~1146 lines / ~2.5 MB)
- Lines 22–191: one `<style>` block (room page + LiuOS styles; some very long minified lines).
- Lines 193–234: HTML markup — room nav, `#stage` (3D canvas host), drawing labels, title block,
  hotspot buttons, `#laptop-window` dialog (LiuOS lock screen, desktop, dock, start menu, search),
  `#resume-window` dialog, `<template id="resume-text-template">`.
- Embedded binary assets as base64 data URIs (most of the 2.5 MB): portrait JPEG (line 215,
  ~737 KB), résumé PDF (line 227, ~145 KB), résumé PNG (line 233, ~1.4 MB).
- Lines 235–279: `<script type="text/plain" id="liuos-wallpaper-gradient">` — wallpaper module
  source as text (contract: mount/setState/dispose), loaded dynamically by the main script.
- Lines 280–1134: one `<script type="module">`:
  - `DRAFTING_CONFIG` (room look/motion), `LIUOS_CONFIG` (profile, content, projects, OS settings).
  - Three.js imported from jsDelivr CDN (v0.180.0).
  - Room geometry builders (desk, walls, bed, kitchen, faucet water, mug, labels, dimensions).
  - Drafting intro animation, parallax, camera navigation between views, hotspots, picking.
  - Laptop screen drawing, lock screen / puzzle unlock.
  - LiuOS window manager (focus/minimize/maximize/place), app renderers, dock, search.
  - Résumé dialog, nav menu, zoom.

## Main Flow
Browser → index.html → inline CSS + markup
  → module script → import Three.js (CDN) → build room scene → render loop on #stage
  → user click → pick object → navigate camera → (desk/laptop) open #laptop-window → LiuOS
       → app renderers read LIUOS_CONFIG → windows in #os-windows
  → résumé hotspot → #resume-window (embedded PDF/PNG)

## Data and Trust Boundaries
- No backend. Content in LIUOS_CONFIG and markup; images/PDF in assets/. AI guide is a UI placeholder (README).
- External: Three.js from cdn.jsdelivr.net.

## Build and Deployment
- Local: serve directory over HTTP (`python -m http.server 8000`).
- Vercel: `vercel.json` with `framework: null`; root index.html is the site. Deploys from main.
- Reorganization in progress on branch `reorganize`, draft PR #1:
  https://github.com/ncl9100/nathan-liu-portfolio/pull/1
- GitHub CLI installed at "C:\Program Files\GitHub CLI\gh.exe" (may not be on PATH in old sessions).

## Implemented
- CLAUDE.md + README describe the component layout (commit c859925). Reorganization complete on `reorganize` (PR #1, draft).
- Branch `reorganize`: assets/photos/portrait.jpg, assets/resume/resume.png, assets/resume/resume.pdf
  extracted from index.html (commit 15a278e). index.html now ~174 KB.
- css/base.css: page-wide rules, linked before inline <style> (commit 9c6f874).
- content/portfolio.js: exports profile, projects, experience; imported by the inline module;
  LIUOS_CONFIG.profile = {...profile, avatarSelector, aboutHeading} (commit 1db940c).
- resume-viewer/: viewer.html (dialog markup), viewer.css, viewer.js (fetches its HTML; listens
  resume:open / resume:close; announces resume:opened / resume:closed; moves .room-nav into the
  dialog while open). Main script keeps a resumeOpen flag from the announcements (commit a8c3faf).
  Known leftovers: résumé text duplicated in <template id="resume-text-template"> (LiuOS);
  .resume-text/.windowbar styles still inline (shared with LiuOS).
- liuos/: laptop.html, laptop.css, wallpaper.js, settings.js (LIUOS_CONFIG; imports content),
  laptop.js (all LiuOS behavior; own <script type=module>). Events — listens: laptop:open
  {opener}, laptop:close, laptop:open-app {name,opener}, laptop:screen-request; announces:
  laptop:opened/closed, laptop:apps-changed {active}, laptop:screen {canvas,redrawn,powered}.
  Room keeps laptopOpen/laptopScreenPowered flags; requestLaptop() checks desk.
- nav/: nav.html, nav.css (linked AFTER inline <style> — cascade), nav.js. Announces room:go
  {view}, room:open-resume {opener}, room:open-app {name,opener}; listens room:view, resume:*,
  laptop:apps-changed, laptop:closed. Will be rebuilt into separate pages later.

- Branch nav-pages (6a8b11e): link-based nav on every page (<body data-page>), theme in
  css/base.css, pages/contact/ (reads content/portfolio.js; "Back to the room" button below sheet).
  Nav: Résumé → PDF new tab; Contact → /pages/contact/; About/Experience/Projects still open LiuOS
  on the room page (go to "/" elsewhere) until their pages exist.

- nav-pages (d317e4e): pages/about (headshot + typed bio from content), all nav items are links;
  nav no longer opens LiuOS. Nav rebuild complete; branch pushed, not merged.

- main (1473190): everything from polish merged; AGENTS.md is the agent rules file (CLAUDE.md imports it).

## Confirmed (not implemented)
- Portfolio content (profile/experience/projects, currently LIUOS_CONFIG) moves to its own file
  that the site reads; single source of truth.
- CLAUDE.md written after the reorganization (purpose, learner rule, content-file pointer,
  run/deploy steps).
- Folder structure (confirmed 2026-10-11, not implemented; file names inside folders may change):
    index.html                 short page that loads everything
    css/base.css               page-wide/shared styles
    room/                      room.html, room.js, room.css, settings (DRAFTING_CONFIG), extras
    nav/                       nav.html, nav.js, nav.css
    liuos/                     laptop.html, laptop.js, laptop.css, wallpaper
    resume-viewer/             viewer.html, viewer.js, viewer.css
    assets/photos/portrait.jpg, assets/resume/resume.pdf + resume.png (extracted from base64)
    content/portfolio.js       profile/experience/projects (single source of truth)
  Each component's JS loads its own .html via fetch(). No build tools; plain static files.
- Connections (decided, not implemented): each component starts itself (loads its own .html);
  all cross-component communication uses announcements (browser custom events), e.g.
  room announces laptop click → LiuOS opens; LiuOS announces opened → room pauses;
  room announces résumé click → viewer opens; viewer announces closed → room camera returns.
  Open: event names, and handling events fired before a listener's component has loaded.
- Order: reorganize existing site first (behavior unchanged), nav-pages revamp afterward.

## Design critique (2026-10-11, Claude via /design:design-critique; not yet acted on)
- Landing doesn't say who Nathan is / what role he wants; no primary call to action.
- Portfolio content buried inside LiuOS (modal → bezel → window); nav-pages plan addresses it.
- Three visual languages (drafting paper serif / dark LiuOS sans / résumé pop-up); clock format
  mismatch (18:26 lock screen vs 06:26 PM dock).
- Callout letters skip B, C (only A Desk, D Résumé; E Laptop at desk). Tiny text: title-block
  labels 8px, callout actions 9px. Nav touch targets ~31px tall (< 44px guideline).
- Contrast passes (ink on paper 5.4:1; nav 12:1).

## Scrapped
- Code-built 3D "me" character + drawn face for the About page (2026-10-11): learner scrapped it.

## Ideas (not decided)
- About page: photo of Nathan + typewriter animation typing text about him (learner's idea, 2026-10-11).

## Design critique #2 (2026-10-11, after nav rebuild; not acted on)
- Page titles jump between pages: h1 at (224,96) About, (277,116) Experience, (217,116) Projects,
  (443,291) Contact (vertically centered); content widths 980/860/980/560.
- Two résumé experiences: nav Résumé = PDF tab; desk résumé = in-site pop-up.
- Still open from #1: no headline/role on landing; callouts A and D only; 8px/9px room text;
  HotTakes screenshot titled "ChelseaHeat".
- Passing: contrast (5.5:1+ muted text, 12:1 nav), touch targets on pages 48–52px, no text <11px on pages.

## Unknowns
- Visual redesign (learner finds current look "not the most aesthetic"); after reorganization.
- Migration order and verification method.
- og-image.png and production URL still pending (README).
