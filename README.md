# Nathan Liu portfolio

An interactive Three.js model of my room, with LiuOS, a custom browser desktop for projects and experience.

## Run locally

Serve this directory over HTTP (for example, `python -m http.server 8000`) and open localhost:8000. There is no build step or npm dependency installation. Three.js 0.180.0 loads from jsDelivr; the portrait and resume are embedded in the page.

## Deploy to Vercel

Import this repository into Vercel. Choose **Other** for the framework, use the repository root, and leave the build command and output directory empty. The root index.html is the site.

## Edit

The page source, styles, and JavaScript are in index.html. LIUOS_CONFIG contains profile, contact, project, experience, typography, and OS settings. Existing drawing and screen configuration controls the room presentation.

## Metadata remaining

- Supply an actual **1200 x 630 screenshot** named `og-image.png` in this directory. That path is intentionally reserved; no screenshot has been supplied yet.
- Replace `https://YOUR-DOMAIN.example/` in og:url with the final production URL. For social previews, make og:image and twitter:image absolute URLs on that domain when the image is ready.

The AI guide is currently a UI placeholder, not a deployed AI backend. Existing content TODOs remain editable in LIUOS_CONFIG.
