# Nathan Liu portfolio

An interactive Three.js model of my room, with LiuOS, a custom browser desktop for projects and experience.

## Run locally

Serve this directory over HTTP (for example, `python -m http.server 8000`) and open localhost:8000. There is no build step or npm dependency installation. Three.js 0.180.0 loads from jsDelivr; the portrait and résumé files are in `assets/`. Opening index.html directly as a file won't work, because each component fetches its own HTML.

## Deploy to Vercel

Import this repository into Vercel. Choose **Other** for the framework, use the repository root, and leave the build command and output directory empty. The root index.html is the entry point; the component folders next to it are served as-is.

## Edit

index.html is a shell that loads one folder per component. Each folder has its own HTML, CSS, and JavaScript:

| Folder | What it is |
|---|---|
| `room/` | The 3D room (scene, camera, intro, hotspots). Look and motion settings are in `room/settings.js`. |
| `liuos/` | LiuOS, the laptop desktop. OS settings (colors, apps, puzzle, wording) are in `liuos/settings.js`. |
| `resume-viewer/` | The résumé pop-up. |
| `nav/` | The bar across the top, shared by every page. |
| `pages/` | The career pages: `about/`, `experience/`, `projects/`, `contact/`. Shared styles in `pages.css`. |
| `content/portfolio.js` | Profile, projects, and experience. Edit these facts here; LiuOS and the pages read them from this file. Keep projects newest first. |
| `css/base.css` | Styles shared across components. |
| `assets/` | Portrait and résumé PDF/PNG. |

Components talk to each other only through events on `document`; the comment at the top of each component's `.js` lists them. See CLAUDE.md for more detail.

## Metadata remaining

- Supply an actual **1200 x 630 screenshot** named `og-image.png` in this directory. That path is intentionally reserved; no screenshot has been supplied yet.
- Replace `https://YOUR-DOMAIN.example/` in og:url with the final production URL. For social previews, make og:image and twitter:image absolute URLs on that domain when the image is ready.

The AI guide is currently a UI placeholder, not a deployed AI backend. Content TODOs (such as project images) remain editable in `content/portfolio.js`.
