# Nathan Liu — room portfolio

A measured 3D model of my NYU dorm, drawn like an architectural drafting sheet. Click around the room, sit at the desk, and open **LiuOS**, a custom in-browser desktop for my work.

This is not a scroll of project cards with a headshot on top. I wanted a portfolio that feels like a place you can walk into!

**Repo:** [ncl9100/nathan-liu-portfolio](https://github.com/ncl9100/nathan-liu-portfolio)

---

## Why this exists

Most student portfolios are interchangeable: a template, three cards, a résumé link. I live in a real room at Carlyle Court. I measured it. I wanted visitors — especially recruiters for ML and data roles — to land somewhere that is obviously mine.

The visual language is an architect's sheet: ink on paper, a title block, dimension lines in meters, a floor-plan view. The room is built in inches as scene units, from a mix of tape-measure readings and photo estimates. Comments in the scene code say which is which, and a few pieces (the stools, the kitchen pass-through) assert their sizes at runtime so a later edit cannot silently drift.

The laptop is a second layer. The career pages (About, Experience, Projects, Contact) are the fast path if someone does not want to orbit a 3D dorm. Same facts, two ways in.

---

## What you can do

- **Walk the drawing.** An intro draws the grid, then the dimension lines, then the room. Drag to orbit, scroll to zoom, click an object to fly the camera there. A floor-plan view looks straight down. After a few seconds of idle, the overview sways slightly, like a sheet on a desk.
- **Use the room.** The lamp toggles. The faucet runs and, after a few seconds, cleans the roommate's dishes. Photos on the kitchen counter sit you on a stool. The paper on the desk is a real résumé texture; clicking it zooms in and opens a readable copy.
- **Open LiuOS.** Lock screen, a small password puzzle (or guest sign-in), a dock, overlapping windows, search, and a terminal that can list projects and open them. The 3D laptop screen shows a still of that desktop — not a live iframe — so the room stays cheap to render.
- **Read the pages.** The same nav is on every page. Résumé opens the PDF in a new tab. About types the bio (or shows it all at once if you prefer reduced motion).

Phones, tablets, and desktops are all first-class. Touch and mouse both work. `prefers-reduced-motion` skips the intro, the sway, the water, and the typewriter.

---

## Tech stack

| Layer | Choice | Why |
|---|---|---|
| Language | Vanilla JavaScript (ES modules), HTML, CSS | No framework tax. The site is the thing I built, not a wrapper around a starter. |
| 3D | [Three.js](https://threejs.org/) 0.180.0 from jsDelivr | One CDN URL, imported by both the room and LiuOS so the browser loads the library once. |
| Shaders | GLSL (`ShaderMaterial`, `onBeforeCompile`) | Drafting-paper grid, LiuOS wallpaper, and a cheap water stream. |
| Content | `content/portfolio.js` | Profile, projects, experience, and photo list live in one file. Pages and LiuOS both read it. |
| Résumé | LaTeX PDF + hand-made HTML sheet + desk PNG | One visual résumé, three surfaces. The HTML copy is what the in-room viewer and LiuOS both show. |
| Hosting | Vercel, static, no build | `index.html` and the component folders are the site. No npm, no bundler, no `node_modules`. |

---

## Architecture

```
Browser
  │
  ├─ index.html          shell: meta tags, stylesheets, one <script type="module"> per component
  │
  ├─ nav/                same bar on every page
  ├─ room/               Three.js scene, camera, picking, intro
  ├─ liuos/              lock screen, window manager, apps, wallpaper
  └─ resume-viewer/      the desk-paper pop-up
          │
          │  CustomEvents on document
          │  (components never import each other's logic)
          ▼
  laptop:open / laptop:closed / laptop:screen
  resume:open / resume:closed
  room:go / room:view

Career pages (pages/about, experience, projects, contact)
  └─ same nav, same content/portfolio.js, no Three.js
```

`index.html` is only a shell. Each component fetches its own `.html`, owns its `.css` and `.js`, and starts itself. Tunable values live in that component's `settings.js`.

The one allowed exception: the room may read `LIUOS_CONFIG` for the 3D screen's brightness. It does not import LiuOS behavior.

### How the pieces talk

Components announce what happened, or ask for something to happen, on `document`. They do not call each other. The comment at the top of each component's `.js` lists what it listens for and what it announces.

```
click laptop on desk
  room checks the camera is at the desk
  room announces laptop:open
  LiuOS opens, announces laptop:opened
  room pauses its render loop (the overlay covers the canvas)
  LiuOS paints a canvas and announces laptop:screen
  room maps that canvas onto the 3D display

click résumé paper
  room flies to the paper, then announces resume:open
  viewer opens
  close → resume:closed → room returns to the shelves

nav "floor plan" (room page only)
  nav announces room:go { view: "front" }
  room owns the camera, so it decides how to get there
```

If LiuOS is not listening yet when the room first paints, the room can ask again with `laptop:screen-request`. That is the load-order problem you get when modules start themselves instead of a boot script wiring them together.

### Two paths, one set of facts

| Path | For | How |
|---|---|---|
| The room | People who will click | Camera presets, hotspots, LiuOS apps |
| The pages | People who will scan | Ordinary HTML, shared drafting-paper theme |

Both read `content/portfolio.js`. I do not copy project text into LiuOS or into the pages.

---

## Project structure

```
index.html                 shell
css/
  base.css                 drafting-paper theme, shared chrome
  resume-sheet.css         the HTML résumé (Computer Modern)
room/
  room.html / room.js / room.css
  settings.js              DRAFTING_CONFIG — colors, intro timing, camera, callouts
liuos/
  laptop.html / laptop.js / laptop.css
  settings.js              LIUOS_CONFIG — apps, puzzle, windows, wording
  wallpaper.js             separate Three.js shader; swap the module to change the paper
resume-viewer/
  viewer.html / viewer.js / viewer.css
nav/
  nav.html / nav.js / nav.css
pages/
  pages.css, reveal.js     shared page sheet + scroll fade-in
  about/ experience/ projects/ contact/
content/
  portfolio.js             the only place facts about me live
assets/
  photos/                  portrait, friends-and-family prints
  resume/                  PDF, desk PNG, HTML sheet
  projects/                card screenshots
```

Scene units are inches. `DRAFTING_CONFIG` is room-only. Career pages do not have to match the room's ink values; they share the CSS variables in `base.css` so the site still reads as one drawing.

---

## Decisions I can walk through

These are the choices I would start with in an interview.

**A portfolio as a place.** A list of projects tells you what I shipped. A room tells you how I notice things — the title block, the measured stools, the dishes in the sink. The 3D model is the argument; LiuOS and the pages are how you get the facts.

**No build step, on purpose.** A bundler would hide the file graph. Here, a component is a folder you can open. The cost is that we cannot tree-shake Three.js and we fetch HTML at runtime, so the site has to be served over HTTP. I accepted that trade for a codebase I can explain without a config file.

**Announce, don't import.** Direct calls would make the room depend on LiuOS and LiuOS depend on the room. Events keep a one-way story: the room does not know how the desktop works; LiuOS does not know a camera exists. The failure mode is a silent no-op if a listener is late, which is why the screen has an explicit request event.

**Measured vs estimated.** I did not photogrammetry the dorm. I measured what I could and estimated the rest from photos, and I left that distinction in the code. A few invariants (`15 × 15 × 31` stools, `17.5"` pass-through) throw if they break. That is closer to how I treat data at the eLab than a pretty mesh from a marketplace.

**Keep the room cheap while LiuOS is open.** The room stops rendering when the laptop dialog covers it. The live wallpaper shader stays on the visible LiuOS surface and pauses when a maximized window covers it, or when the tab is hidden, or when the visitor asked for reduced motion. Water does not use `transmission` — that re-rendered the whole room and took seconds to compile — so the stream is a tinted cylinder with a time uniform instead.

**One résumé, three files.** Changing the résumé means updating the PDF, the desk texture (`resume.png`), and `assets/resume/resume.html`. Painful on purpose: there is no generated pipeline, so I cannot forget that recruiters see all three.

**Compatibility as a constraint, not a polish pass.** The seated photo view picks a different eye height and FOV on narrow screens so the pile still fits. Overview and floor-plan radii scale with aspect ratio. Callouts move on small viewports so they do not sit on the laptop glass. If a motion cannot be skipped, it is not shipped.

---

## Room internals (the 3D side)

The scene is authored in code, not imported from Blender.

- **Furniture from boxes, then exceptions.** Desks, shelves, walls, and cabinets are `BoxGeometry`. The faucet is a `CatmullRomCurve3` tube. Beds get a lathed-looking pillow and a subdivided blanket with sine folds. Caps, mugs, protein tubs, and book covers are canvas textures painted in JavaScript and wrapped onto meshes.
- **Oak is synthesized.** Growth rings and fibers come from a hash-and-noise function on a 512² canvas, not from a photo of the real desk. Wood materials pick a grain direction per face.
- **The paper is a shader.** One transparent plane under the room. Screen-space derivatives keep the grid lines one pixel thick. The intro reveals it from the center outward.
- **Walls hide themselves.** Each wall stores a facing normal. If the camera is on the far side, that wall drops out so you can see in — a drafting cutaway, not a collision world.
- **Picking is raycasting plus intent.** A click that barely moves is a pick; a drag is an orbit. Hits map to named views (`desk`, `faucet`, `seated`, …) or to a generic close-up zoom. The laptop only unlocks if you are already at the desk.
- **Camera presets are spherical.** Yaw, pitch, radius, target. Moves ease over 900ms. Escape cancels a fly-to and leaves you in a free `custom` view.

---

## LiuOS internals (the desktop)

LiuOS is a `<dialog>` that thinks it is an operating system.

- **Lock screen → sign-in → desktop.** Guest works immediately. The password is a small riddle (hint: a comedy group and a snake). Wrong answers shake; the right one celebrates in the popup before the desktop fades in.
- **Window manager.** Open, focus, minimize, maximize, close, drag, cascade. The dock bounces like macOS before a new app opens. Empty desktop clicks clear focus.
- **Apps read the content file.** Projects, Experience, About, Contact, Résumé, Terminal. The AI guide is a labeled placeholder — not a backend.
- **Wallpaper is a module.** `createWallpaper(THREE, config, motionPreference, colors)` returns `mount` / `setState` / `dispose`. The default shader is ruled paper that drifts; an alternate mode is graph paper. Replacing the file is how you would restyle the OS background without touching the window manager.

---

## What this is not

- Not a game engine and not a walkable character (that is a later idea, not started).
- Not a CMS. Facts change in `content/portfolio.js`.
- Not a Three.js tutorial repo. The interesting part is the component contract and the drafting-sheet constraints, not a spinning cube.
- Not connected to an AI backend. The guide app is honest about that.
