# Learning Progress

## Pending decision
- Decision: none pending. Next (learner, in Cursor): LiuOS revamp to match site design system.
- Stage: idle
- Stage: awaiting reasoning (Build checkpoint)
- Asked: what pieces they'd separate, how they'd group them into files/folders, and why
- Learner's initial direction: "maybe by components"; unsure how multi-file organization works
- Learner's components (2026-10-11): 3D room (interactive objects: bed, desk, kitchen…),
  nav bar, LiuOS, room settings, "other minor components"
- New requirement from learner: nav links should go to separate pages (About etc.) with a way
  back to the room, instead of opening the laptop. Not designed yet.
- Learner chose: reorganize existing site first, nav revamp after (reasoning not stated yet)
- LIUOS_CONFIG resolved via CLAUDE.md decision: content moves to its own file the site reads
- Still asked: where unassigned pieces go (résumé dialog, captions/hotspots, title
  block/dimension labels, wallpaper, images/PDF)
- Learner found the "inside a component vs shared" framing unclear; rephrased with a folder
  analogy and narrowed to one item at a time (starting with the portrait/résumé files)
- Learner decided: portrait goes in a separate photos/pictures folder (shared, not in a
  component); tentative ("not sure"). Folder name not final.
- Learner decided: résumé PDF/PNG in a separate résumé folder; résumé dialog in "another
  folder too" (effectively a 4th component). Unclear whether files + dialog share one folder.
- Learner decided: two separate folders — résumé files (alongside photos) and résumé-dialog
  component. Reasoning not stated.
- Learner proposed: room extras in their own folder; LiuOS wallpaper in another folder.
  Claude challenged: both are used by only one component (contradicts "who uses it?" test);
  explained cohesion and nested folders. Learner then asked Claude to decide.
- Claude's recommendation (learner asked Claude to decide): room extras inside room/,
  wallpaper inside liuos/, no subfolders yet. Learner confirmed after clarification.
- Next asked: where DRAFTING_CONFIG (room settings) goes
- Learner: future nav pages might need it if project expands (no placement given yet).
  Claude explained YAGNI-style tradeoff (design for known needs; move later) and noted
  DRAFTING_CONFIG mixes room-only values (camera, intro, callouts) with possibly shared
  colors. Asked which parts nav pages would need, and placement.
- Learner: nav pages don't need to match room colors → implies DRAFTING_CONFIG stays room-only
  (inside room/). Claude stated this conclusion back; learner to correct if wrong.
- Next asked: how to split the CSS
- Learner leaning: one main css folder (by type), unsure; noted React/Tailwind colocate.
  Claude clarified Tailwind (utility classes in HTML, needs build step) vs React colocated CSS;
  explained tradeoffs.
- Learner decided: CSS lives in each component's folder; reason: faster to open the component
  folder when tweaking appearance (consistent with workflow).
- Next asked: where page-wide/shared CSS rules go
- Learner decided: page-wide/shared CSS in a css folder
- Next asked: where each component's HTML markup lives (no native HTML include without JS/build)
- Learner: "not sure". Claude showed concrete side-by-side examples and narrowed to a priority
  question (low risk/less rewriting now vs fully self-contained components).
- Learner chose: complete separation (each component owns its markup).
- Claude flagged risk (big rewrite vs "site unchanged" goal) and explained a variant: component
  keeps its markup in its own .html file and its JS loads it with fetch(). Asked: JS-built vs
  fetched .html file.
- Learner chose: each component has its own .html file loaded by its JS (reason not stated).
- Folder structure CONFIRMED (Design checkpoint, 2026-10-11), incl. Claude's proposed names,
  assets/ parent, content/portfolio.js, and keeping no build tools. Not implemented.
- Next asked: how components connect (who starts each component; how room opens laptop /
  résumé viewer). Then: migration order, verification.
- Learner: tentatively "each component starts itself"; unsure on talking/dependencies; asked
  for help thinking. Claude listed verified current interactions (room→LiuOS open, room→résumé
  viewer open + camera return on close, nav→LiuOS app, LiuOS open pauses room) and explained
  direct-call vs event/message styles. Asked learner to pick for the room→LiuOS arrow.
- Learner: after nav revamp, only the room needs to open LiuOS (premise; style not yet chosen).
- Learner unclear on tradeoffs of direct call vs events after two rephrasings; Claude gave a
  concrete side-by-side tradeoff list for this exact case.
- Needs reinforcement: coupling/dependency tradeoffs between modules (direct call vs events).
- Learner chose: announcement (custom event) for room → LiuOS. Reason not stated yet.
  Claude flagged risk: silent failure if LiuOS not loaded yet when the event fires.
- Next asked: reason for the choice; same style for remaining arrows (room→résumé viewer,
  viewer close→room camera back, LiuOS open→room pauses) or a mix?
- Learner asked how to decide. Claude gave heuristics: command ("do this", one known doer) →
  direct call; report ("this happened", others may react) → announcement; plus consistency and
  dependency direction (avoid two-way dependencies) as criteria.
- Learner "not sure" applying heuristic. Claude gave a worked example (LiuOS open → room pauses
  = report → announcement) and offered a simple choice: all announcements vs mix.
- Learner decided (2026-10-11): announcements (custom events) for ALL cross-component
  connections; components start themselves. Reasoning given: consistency (chose the
  one-pattern option). Known risk: event fired before a listener has loaded.
- Next asked: migration order (incremental vs all at once) and how to verify nothing changed.
- Learner decided: piece by piece; work on a separate branch (own idea, for safety); unsure
  one branch vs many. Claude explained one-branch-with-commit-per-piece vs branch-per-piece
  (pieces build on each other). Still asked: which branch approach, first piece, checklist.
- Learner unclear on commits vs branches. Claude explained with diagrams; narrowed to the
  branch question only (first piece + checklist deferred).
- Needs reinforcement: git basics (commit vs branch).
- Learner decided: one branch, commit per piece; reason: avoid merge conflicts (connected the
  explained risk to the choice).
- Next asked: first piece to move (given facts on size/connections per piece)
- Learner decided: order simplest → most complex; first piece = assets.
- Next asked: what to check after moving assets (checklist scoped to this step)
- Learner unsure; Claude explained what broken paths look like and proposed a 5-item checklist.
- Step 1 APPROVED and implemented (2026-10-11) on branch `reorganize`: 3 base64 assets
  extracted to assets/photos/portrait.jpg, assets/resume/resume.png, assets/resume/resume.pdf;
  3 lines of index.html changed (2.48 MB → 174 KB). Verified: byte-identical files; browser
  loads all three (200/304), PDF served, no console errors. NOT yet verified visually (the
  automated tab reports document.hidden, so the room does not render there).
- Learner ran visual checklist: all 5 items pass. Committed 15a278e "Move embedded assets
  into assets/" on `reorganize`.
- Next: choose step 2 (remaining order simplest→complex: content file, page-wide CSS,
  résumé viewer, nav, LiuOS, room). Learner may write some pieces (coding pref: a mix).
- Learner chose step 2 = page-wide CSS → css/base.css, learner writes it (Claude guides/reviews).
- Claude found: CSS is minified; global rules are scattered and later rules override earlier
  ones (dialog, :root, h1 appear multiple times); `header` rules target no element (dead CSS);
  some :root/body rules are really component-specific (--os-* vars, body .hint).
- Introduced (Claude explained): CSS cascade order (later rule wins at equal specificity), so
  link placement and which rules move matter.
- Now asked: which candidate rules are page-wide; where the <link> goes relative to <style>.
- Learner asked how to decide; Claude gave the "blank About page" test with worked examples
  (#2 page-wide, #12 LiuOS, #7 leftover).
- Learner still "not sure". Claude narrowed to single yes/no questions and offered alternatives
  (Claude sorts + explains, learner reviews/writes the file).
- Needs reinforcement: classifying CSS rules by scope; repeated "not sure" on abstract sorting.
- Learner answered #9 ([hidden]) → stay hidden (page-wide). Still unsure on #3/#5/#13.
- Claude switched to Option A: proposed full sort with one-line reasons (Claude's proposal,
  not learner decision): page-wide 1,2,3,4,5,8,9,13; room 10,11; LiuOS 12; résumé 6 (h1 only
  in résumé text); leftover 7. Asked learner to flag disagreements + answer link placement.
- Claude corrected own bad example (id selector beats element regardless of order =
  specificity). Learner asked if being tested; Claude acknowledged and offered answer.
- Learner asked "is it order A?" — correct (base.css <link> before <style>). Partial
  demonstration: chose right answer as a question, reasoning not stated.
- Proposed split for step 2: learner creates css/base.css, pastes rules, adds <link> before
  <style>; Claude removes originals from minified <style> and verifies computed styles
  unchanged. APPROVED.
- Learner wrote css/base.css (one truncated rule `button:hover { background` — Claude flagged
  that it swallows the next rule; learner fixed) and added the <link> (typo rel=""stylesheet —
  Claude flagged silent skip; learner fixed). Claude removed the originals from <style>.
- Verified: computed styles of all 1,044 element/pseudo-element entries identical before vs
  after; negative control (base.css disabled) shows 706 diffs, so the check detects breaks.
  Learner side-by-side visual check (8001 before / 8000 after): all match. Committed 9c6f874.
- Learner note: site "not the most aesthetic" — visual redesign is a possible later goal,
  separate from the reorganization.
- Next: step 3 choice (content file, résumé viewer, nav, LiuOS, room).
- Learner chose step 3 = content file; asked Claude to write it and walk them through.
- Claude explained LIUOS_CONFIG's 3 groups (facts about Nathan / LiuOS wording / LiuOS settings).
- Learner: on a nav page they'd want a heading (worded for that page), not LiuOS's exact
  "Workspace / Projects" text → conclusion: LiuOS wording stays with LiuOS; content file =
  profile, projects, experience only. APPROVED incl. proposed additions (avatarSelector +
  aboutHeading stay in LIUOS_CONFIG via {...profile, ...}; TODO placeholders move with projects).
- Implemented: content/portfolio.js (export profile/projects/experience); index.html imports it.
  Verified: Node deep-compare old vs new LIUOS_CONFIG identical; same-window style compare
  0 diffs (an earlier 510 came from a different window size); no console errors. Could not
  open LiuOS apps in the automated (hidden) tab. Learner said "commit" without explicitly
  reporting the app check. Committed 1db940c.
- Pushed `reorganize` to origin; learner chose a draft PR → PR #1 (draft) into main. Plan:
  keep committing to the branch, merge once at the end. Installed GitHub CLI (winget).
- Introduced (Claude explained): commit vs push vs merge; pull requests and draft PRs.
- Next: step 4 choice (résumé viewer, nav, LiuOS, room) — first step needing announcements.
- Learner chose step 4 = résumé viewer, Claude writes with walkthrough.
- Claude found résumé viewer is entangled: room/nav code ask "is résumé open?" in ~7 places;
  room moves the nav INTO the dialog while open; LiuOS reads the PDF link from the viewer's
  markup; résumé text exists twice (dialog article + <template> used by LiuOS).
- Introduced: "asking" (state queries) vs "telling" (announcements) — new kind of connection
  not covered by the announcements decision. Asked learner: how others find out if it's open
  (A check page directly / B viewer exports isOpen() / C each tracks via events).
- Learner chose C (each tracks its own flag via announcements); reason: consistency with the
  announcements-everywhere decision. Claude noted stale-flag risk; viewer will announce on every
  close path.
- Step 4 APPROVED: resume-viewer/{viewer.html,viewer.css,viewer.js}; events resume:open,
  resume:close (requests) and resume:opened, resume:closed (announcements); main script uses
  a resumeOpen flag. Additions accepted: LiuOS PDF link → assets path; duplicate résumé text
  left for later; viewer keeps moving the nav into the dialog.
- Implemented (uncommitted): resume-viewer/viewer.{html,css,js}; index.html links viewer.css
  after base.css and loads viewer.js before the main module; main script uses resumeOpen flag.
  .resume-text and .windowbar styles left in <style> (shared with LiuOS).
- Verified: closed-state styles 0 diffs; open via resume:open works (nav moves in, Résumé
  highlighted, focus on close button); resume:close closes; PDF 200; no console errors; close
  path works when close event fired manually. Hidden test tab withholds dialog 'close' events
  (old version too), so learner must test real closing + camera return.
- Learner tested on localhost (servers restarted after memory-pressure stop): "everything is
  working as intended". Committed a8c3faf and pushed to PR #1.
- Next: step 5 choice (nav, LiuOS, room).
- Learner decided order: LiuOS → room → nav rebuild last (nav will be rebuilt, so don't move it).
- 3D laptop screen ownership: Claude used TV/console analogy; learner chose B (LiuOS paints its
  own screen picture, room just displays it). Reason (own words): LiuOS shouldn't be
  connected/dependent on the room; redesigning LiuOS should only touch liuos/. Dependency
  direction room → LiuOS only.
- Step 5 split: 5a markup/CSS/wallpaper (APPROVED, Claude writes); 5b LiuOS JS (plan together).
- 5a implemented (uncommitted): liuos/laptop.html, laptop.css (241 rule blocks, one per line),
  wallpaper.js (was a text/plain script read via Blob URL; now a real module, config
  wallpaper.module), laptop.js (fetches markup; main script imports it so markup exists first —
  temporary until 5b). Verified 0 style diffs in 3 states (closed, lock screen, desktop),
  wallpaper loads, 7 desktop icons, no console errors. App windows not covered (JS-created).
  Learner click-through: everything works as before. Committed + pushed (5a).
- 5b design CONFIRMED (Claude's plan derived from learner's prior decisions): events
  laptop:open (room, only at desk), laptop:opened/closed (+ room laptopOpen flag),
  laptop:screen (LiuOS sends screen picture; room displays), laptop:open-app {name} (nav),
  laptop:apps-changed (nav highlights); LIUOS_CONFIG → liuos/settings.js. Two commits:
  (1) settings + screen picture + events, (2) move remaining LiuOS code to liuos/laptop.js.
  Commit 1 APPROVED + implemented (uncommitted): liuos/settings.js; room/nav use flags
  laptopOpen, laptopActiveApp, laptopScreenPowered; room requestLaptop() (desk check) dispatches
  laptop:open; LiuOS handles laptop:open/close/open-app/screen-request and announces
  laptop:opened/closed/apps-changed/screen. Room builds the THREE texture from LiuOS's canvas.
  Deliberate tiny change: nav button while laptop open on lock screen launches immediately
  (old code re-ran a ~0.9s camera move to the same spot first).
  Verified: 0 style diffs at 10s (8 diffs at 4s were the timed hint caption); event flows OK
  (open-app → About window + nav highlight + nav moved in; power off → closed, nav back);
  screen canvas 2048x1072 drawn; no console errors. Learner click-through: all working.
  Committed + pushed (5b commit 1).
- 5b commit 2 APPROVED + implemented (uncommitted): 133 lines moved into liuos/laptop.js
  (header documents its events); own THREE import (same URL), own reduce-motion check;
  index.html loads it as its own <script type=module>; wallpaper path now './wallpaper.js';
  LiuOS sends first screen picture at startup and on laptop:screen-request.
  Verified: index.html has no LiuOS internals; laptop.js has no room identifiers; 0 style diffs
  closed AND with About open (vs previous commit); events OK; no console errors.
  index.html now 88 KB. Learner click-through: works. Committed + pushed.
- Next: step 6 = room (last piece of the reorganization), then CLAUDE.md, then nav rebuild.
- Learner decided: move current nav code into nav/ as-is during step 6 (rebuild happens inside
  nav/). Reason (own words): more organized, no searching inside index.html; index.html should
  be simple, not contain messy random code.
- 6a APPROVED + implemented (uncommitted): nav/nav.html, nav.css (11 blocks; mixed reduced-motion
  rule split), nav.js (own resumeOpen/activeApp flags). Events: nav → room:go {view},
  room:open-resume {opener}, room:open-app {name,opener}; room → room:view {view}. Room no longer
  calls updateNavState/closeRoomMenu.
- Regression caught by style compare: highlighted floor-plan icon turned white — cascade order
  (button[aria-pressed=true] in <style> vs .room-nav button, equal specificity). Fixed by loading
  nav.css AFTER <style>. Explained to learner as the step-2 cascade lesson.
  Verified after fix: 0 diffs in 4 states (closed, floor plan, overview, LiuOS app open);
  no console errors. Learner tested all but mobile; Claude tested mobile via 420px iframe:
  0 diffs menu closed/open. Committed + pushed.
- Next: 6b room markup + CSS → room/, 6c room JS → room/room.js (+ settings), then CLAUDE.md.
- Leftovers decided: delete dead CSS (learner); shared .windowbar/.resume-text → css/base.css
  (learner: "same grouping" as the shared dialog rule, after Claude pointed to their step-2 rule).
- 6b APPROVED + implemented (uncommitted): room/room.html, room/room.css (69 blocks); 13 shared
  blocks → base.css; .dock-divider (3) → laptop.css; 38 dead blocks deleted (found by whole-word
  search of markup + JS); resume-text-template → liuos/laptop.html; inline <style> gone. Main
  script fetches room.html first (temporary until 6c).
  Verified: 0 style diffs in 8 states (rest, floor plan, résumé open, LiuOS app; at 1400px and
  420px). Learner click-through OK. Committed + pushed.
- Learner asked to run /design:design-critique (visual design review) before continuing to 6c.
  Ran it (findings in project-map). Learner decided: design fixes later; finish reorganization.
- 6c APPROVED (Claude writes): room/settings.js (DRAFTING_CONFIG), room/room.js (room code, loads
  own markup); room keeps reading screen brightness from LiuOS settings (accepted addition).
- 6c implemented (uncommitted): room/room.js (511 lines + header listing its events),
  room/settings.js; index.html is now a 2.3 KB shell (head + 4 module scripts).
  Verified: 0 style diffs in 8 states (desktop + phone); room loaded (canvas, status hidden,
  3 callouts); no console errors. Learner sent "commit" (via a pasted localhost URL; took it
  as tests passing). Committed + pushed. REORGANIZATION CODE MOVES COMPLETE.
- CLAUDE.md: learner brainstormed core features (movement w/ future Minecraft-style character
  + camera modes; room objects; LiuOS redesign to match real laptop; career pages via nav, not
  LiuOS). Chose: features listed current + planned; include organization section; Claude drafts,
  learner edits. Draft written at repo root (uncommitted); paths/events verified. Awaiting edits.
- README.md updated (learner asked): run note, deploy note, folder table, TODO location.
- Learner edited CLAUDE.md (added: planned items are context only; settings.js exception;
  matching Three.js URLs; quality bar; browser checklist; don't push/PR/merge unless asked;
  visual + code design decisions need asking). Committed c859925 + pushed (learner chose);
  PR #1 description updated: all steps done. REORGANIZATION COMPLETE (PR still draft).
- Workflow change: per CLAUDE.md, only push/open PRs/merge when the learner asks.
- Coding scope: none authorized yet

## Splitting a web page into files
- Introduced (Claude explained): browser loads CSS via `<link rel="stylesheet" href>`, JS via
  `<script type="module" src>`, and JS files can `import`/`export` from each other; images/PDFs
  can be referenced by path instead of base64 data URIs.
- Introduced (Claude explained): why split files (find things, change one part safely, reuse);
  "organize by type" vs "organize by feature/component" as two common strategies.
- Learner reasoning: intuition that one file doesn't make sense; suggested grouping by components.
- Introduced (Claude explained): cohesion (things that change together live together), cost of
  over-splitting, nested folders inside a component.
- Needs reinforcement: tends to give each piece its own top-level folder regardless of who uses it.
- Learner asked for big-picture clarification ("what exactly we're doing, how do we determine
  the folder/architecture"). Claude explained: goal of a pure reorganization (same site,
  different file layout) and a 3-question method (what is it? who uses it? what changes with it?).
- Needs reinforcement: overall picture of what reorganization means and how structure is derived.

## CLAUDE.md
- Introduced (Claude explained): what CLAUDE.md is (auto-loaded briefing; durable facts only);
  single source of truth / avoiding duplicated facts.
- Demonstrated reasoning: chose to keep experiences in one content file and have CLAUDE.md point
  to it rather than copy them (applied single-source-of-truth idea after explanation).
- Confirmed design (2026-10-11): write CLAUDE.md after the reorganization; include purpose,
  "learner — explain changes" rule, pointer to content file, run/deploy steps (Claude's
  proposed addition, accepted). Core features: undecided, revisit after reorganization.
  Not implemented.

## Nav rebuild (started 2026-10-11)
- Learner merged PR #1 (reorganization live). Priorities (learner): nav rebuild now; design fixes
  important too (small UI/UX tweaks); character movement = bonus "if I ever have time".
- Branch `nav-pages` created from main.
- Introduced (Claude): separate HTML files vs one page swapping views (URL/back button/sharing vs
  instant return to room).
- Learner brainstorm: About → interactive cartoon character (details TBD); Experience/Projects TBD;
  Résumé → open the PDF in a new tab (not download); Contact → page with GitHub, LinkedIn, email.
  Chose separate HTML files (reason not stated yet).
- Asked: why separate files; what "interact" means for the About character and what a recruiter
  should learn from it quickly.
- Learner: separate files because pages' functionality can differ (own reasoning). About
  character v1: animated, speaks facts to the user, no user input. Experience/Projects: undecided.
- Asked: build order (clear pieces first?) and where page files live.
- Learner decided: all pages under one pages/ folder; first build only the Résumé link (PDF new
  tab), the Contact page, and a back-to-room link. (Reason not stated; deferring unclear pieces.)
- Raised: today's nav only works with the room (sends room:go etc.), so on the Contact page it
  would do nothing. Asked how the nav should work on other pages + Contact page look.
- Learner decided: same nav bar on every page (About, Résumé, Projects, Experience, Contact);
  Contact = its own page with socials. Projects/Experience (later): scroll fade-in animation,
  chronological order, each project its own card. Look of pages: not answered yet.
- Learner: pages keep the drafting-paper theme. Slice 1 APPROVED (Claude writes): link-based nav
  (data-page on body; room page intercepts camera links), theme vars → css/base.css,
  pages/contact/{index.html,contact.css,contact.js}; additions accepted (placeholder wording,
  mailto + Copy, paper colors duplication left for later).
- Slice 1 implemented (uncommitted, branch nav-pages): nav.html wordmark → <a href="/">, Résumé →
  <a> PDF new tab, Contact → <a> /pages/contact/; About/Exp/Projects stay buttons (LiuOS on room
  page; go to "/" elsewhere); floor plan hidden off the room page; aria-current on Contact page.
  nav.css selectors cover a+button. Theme vars + body paper background → css/base.css.
  index.html <body data-page="room">. pages/contact/{index.html,contact.css,contact.js}.
  Side effect: nav Résumé no longer highlights when the desk résumé pop-up is open (it's a link now).
  Verified: room page 0 style diffs outside nav; nav items identical position/size/font/colors;
  wordmark/floor plan still move camera without reload; Contact page renders (desktop + 390px, no
  horizontal scroll), links from content file, no console errors. Awaiting learner check.
- Learner spotted UX problem (own observation): visitors won't know clicking "Nathan Liu" returns to
  the room. Claude introduced discoverability/affordance; asked learner's approach.
- Learner chose back-button placement A (left of nav, before name); reason: must work on all
  devices — "compatibility is a common theme". Asked to add compatibility to CLAUDE.md.
- Implemented (uncommitted): .nav-home wrapper with outlined "← Back to room" (→ "← Room" ≤380px),
  hidden on room page; CLAUDE.md quality bar now "Compatibility is a priority..." + checklist item 6.
  Verified: room-page nav identical (all rects); Contact fits at 1482/390/320px, no sideways scroll.
- Learner: back-to-room should be more visible near the contact info; keep nav button + add a
  full-width dark button below the sheet ("← Back to the room"). Implemented; verified desktop and
  390px (52px tall, no sideways scroll). Awaiting learner OK + commit/push decision.
- Learner: remove the nav's back-to-room button (below-sheet one is enough). Removed; nav files back
  to the verified slice-1 state. Committed 6a8b11e + pushed branch nav-pages (no PR yet).
  Note: future non-room pages need their own below-content "Back to the room" button.
- Next options: About page (animated character speaking facts), Experience/Projects pages (scroll
  fade-in, chronological, project cards — design TBD), design-critique fixes.

## Experience & Projects pages (started 2026-10-11)
- Learner chose these next (reason: simpler than the others).
- Decided: newest first; project card hover animation, click opens project's link; Experience =
  timeline layout. Unclear on "which fields on the card" — Claude re-explaining.
- Raised: hover doesn't exist on phones (ties to learner's compatibility value); which link when a
  project has both GitHub and demo; Personal Room project has no date and no GitHub URL.
- Learner decided project card: visual (screenshot of the web app), name, short description, links;
  clicking the card opens the live site; GitHub repo linked at the bottom of the card.
- Asked: image source, show award badge/date?, card behavior when no live site.
- Learner: show the 2nd-place badge; "it was like october" (date); Personal Room card links to the
  landing page; only include deployed projects (all 3 qualify). Asked how to supply screenshots.
- Learner: Personal Room also Oct 2026; HotTakes first; added screenshots to assets/projects/.
  Claude flagged HotTakes screenshot titled "ChelseaHeat" (name mismatch, learner's call).
- Projects/Experience APPROVED (Claude writes) with additions: pages/projects/, pages/experience/,
  content data (date, image paths, Personal Room live "/"), shared pages/reveal.js (reduced-motion
  safe), hover lift + always-visible "Visit site ↗", timeline (dates/role/org/bullets/tech tags),
  nav Experience/Projects → links, back button below content.
- Implemented (uncommitted): pages/projects/ (cards: screenshot, date, title, badge, summary,
  "Visit site ↗"/"Open the room ↗", GitHub footer; hover lift on hover-capable devices),
  pages/experience/ (timeline: dates, role, org, bullets, tech tags), shared pages/pages.css
  (sheet header, back button, fade-in) + pages/reveal.js; contact.css trimmed to use pages.css.
  content/portfolio.js: images, Personal Room date + GitHub (repo public) + Live site "/", newest-first
  comment. LiuOS: skip links with no openable URL and no TODO. Nav: Experience/Projects → links,
  aria-current per page.
  Verified (Windows browser; Mac browser couldn't reach the local server): both pages render at
  desktop + 390px, no sideways scroll, correct links/new tabs, no console errors; room-page nav
  identical; Contact header styles unchanged after move. Awaiting learner check + commit/push call.
- Learner feedback: Experience page — remove "Sheet" label and caption; back button lighter and
  consistent with design system. Done: Experience header is just the h1; back button (shared, all
  pages) now paper-edge #ded7ca bg + ink border/text (Claude's color choice, learner asked).
  Projects/Contact still have "Sheet" + caption — asked whether to match.
- Learner: remove "Sheet" + caption on Projects and Contact too (done; unused CSS removed); nav
  full width touching top/sides on every page (done: top/left/right 0, bottom border only).
  Verified: room page, LiuOS open, Projects desktop, Contact 390px with menu open — no sideways scroll.
  Awaiting commit/push decision.
- Committed 2f61577 + pushed (nav-pages). CLAUDE.md/README don't yet describe pages/ (offered update).
- Remaining nav rebuild: About page (animated character speaking facts). Then design-critique fixes.

## About page (started 2026-10-11)
- Learner decided: 3D model character; speech bubbles; sound = robot-style blips (changed from real
  voice); 4 points in order: background → relevant experience → fun facts.
- Inspiration: friend's site github.com/yuyanghu06/yuyang-site. Claude read it: avatar generated
  with Meshy (AI photo→3D), rigged in Blender (54 bones), Quaternius animation library retargeted,
  exported GLB clips (idle, wave, talk, nod...), rendered in Three.js; a 2D illustrated face on
  the 3D head; dialogue "blip" sound (CC0 Freesound, 120 ms) replayed while caption text types out.
  Heavy pipeline (many iterations).
- Asked: which route for the model (AI-generated + rig, low-poly/voxel built simpler, ready-made
  rigged character customized).
- Effort estimate given: Tier 1 (Meshy + auto-rig + library animations, Claude wires it up) ~1–2
  days spread out; friend's level weeks. Learner leaning to AI-generated "me"; asked how + cost.
- Researched (2026-10-11): Meshy free plan ~100–200 credits/month (sources disagree), image→3D ~20
  credits (Meshy 6) / 10 (Meshy 5); rigging + animation listed at 0 credits but free-tier access
  unclear; free outputs CC BY 4.0 (attribution). Pro ~$20/mo. Mixamo free w/ Adobe account but in
  maintenance mode, login issues reported; Quaternius CC0 animations as backup.
- Learner wants free, non-realistic; disputed Meshy (Claude cited AGENTS.md line). Options given:
  A code-built, B VRoid, C ready-made. Learner: "try making one yourself first; scrap if not great".
- Learner provided full-body reference assets/photos/nathan.jpg (gray tee, charcoal pants). Claude
  flagged privacy: do NOT commit it (would be public); learner to move it out or gitignore later.
- Draft built (uncommitted): pages/about/{index.html,about.css,about.js,character.js}. Code-built
  chibi figure with ink outlines (inverted hull), breathing/sway/blink/wave/talking mouth+head bob;
  speech bubble types 4 DRAFT lines (from profile About text); WebAudio square-wave blips (no file);
  Start/Next/Sound buttons; reduced-motion shows text instantly. Nav unchanged (About → LiuOS).
  Iterated: hair (bumpy → smooth cap + fringe + strands), neck gap, egg torso → tapered.
  Verified: renders desktop + 390px, dialogue advances 1→2/4, no console errors. NOT verified:
  typing/blips/animations (test browser has reduce-motion on + hidden tab). Awaiting learner verdict.
- Learner asked to "literally copy" Yuyang's avatar. Claude declined copying (his likeness; repo has
  no license = all rights reserved); offered his approach instead (2D face on 3D body), CC0
  Quaternius animations, or asking him. Learner chose: 2D drawn face with talking + blinking.
- Implemented (uncommitted): canvas-drawn face texture on a front sphere patch (eyes w/ highlight,
  brows, blush, mouth shapes smile/closed/half/open), blink swap, talking cycles mouth every 90 ms;
  camera framed waist-up; ?debug hook (window.aboutDebug). Verified: rest smile + blink visually;
  open-mouth frame verified via canvas pixels (screenshots overwritten by reduced-motion loop).
  Wave + real-time typing/blips not visually verified (reduce-motion test browser).
- Learner: scrap all character work, revert to previous About. Deleted pages/about/ (never committed).
  Nav About still opens LiuOS (unchanged). CLAUDE.md still says "Planned: About page with animated
  character" — asked whether to change. nathan.jpg still untracked (learner's file, not committed).
- CLAUDE.md About line → "design TBD (animated character is one idea worth exploring)". Uncommitted with pages/ doc updates; awaiting commit/push call.
- Committed 6bb21e5 + pushed (nav-pages). Branch not yet merged to main / no PR. Next: design-critique fixes or About design.
- About ideas brainstormed (Claude offered: spec sheet, room objects, scroll story, "currently"+bio,
  character later). Learner's idea: a photo of me + typewriter animation that types out text about
  me. Open: which photo, what text, speed/skip, sound?, build now or later.
- Learner decided About: fast typing; order background → experience → fun facts; headshot (portrait.jpg); silent for now.
- About page APPROVED (Claude writes): types profile.about paragraphs (~5s each), click/tap finishes, reduced-motion + screen-reader full text, headshot left/top, nav About → link.
- About implemented (uncommitted): pages/about/{index.html,about.css,about.js}: headshot + types
  profile.about (~5s/paragraph, 2 chars/tick), invisible reserved text (no layout jump), blinking
  cursor, click/Show all finishes, reduced-motion = full text, visually-hidden full text for screen
  readers. Nav About → /pages/about/; nav.js simplified (no LiuOS/app logic); room's unused
  room:open-app/open-resume listeners removed; LiuOS comments note unused events; CLAUDE.md/README
  updated. Verified: desktop + 390px, typing advances, height stable, click finishes, room nav links,
  no console errors. Awaiting learner check + commit/push.
- Committed d317e4e + pushed. Nav rebuild COMPLETE on nav-pages (About/Experience/Projects/Contact pages, Résumé PDF). Not merged; no PR yet. Remaining: PR/merge, design-critique fixes, nathan.jpg cleanup.

## Polish round (started 2026-10-11)
- Learner's list: (1) line up the four pages, (2) one résumé experience, (3) room's small text,
  (4) remove floor labels in the room (e.g. sleep/study), (5) BUG: résumé "Back to desk" returns
  to the previous view, not the desk, (6) LiuOS design system doesn't match the site — revamp.
- Note: CLAUDE.md said LiuOS redesign = "match my real laptop"; now learner says match the site.
- Asked: résumé choice (PDF vs pop-up), LiuOS direction, order/branching.
- Learner: LiuOS revamp should match the website's design system (paper/ink/serif), not the real
  laptop (update CLAUDE.md later). Merged nav-pages via PR #2 (c17f3e2, learner asked). New branch
  `polish` from main. Still open: résumé choice (PDF everywhere vs pop-up everywhere).
- Learner chose PDF everywhere (reason: cleaner, easier for recruiters). Explained popup-blocker
  constraint (must open on the click). Batch 1 APPROVED: résumé → PDF immediately + delete
  resume-viewer/; shared 980px page width/top spacing; room text ≥11px; remove 4 floor labels; docs.
- Batch 1 implemented (uncommitted, branch polish): résumé paper/hotspot → window.open PDF on the
  click; resume-viewer/ deleted (git rm) + room/nav/index refs removed; 4 floor labels + label()
  removed; room.css font sizes <11px → 11px (8 rules); shared .page layout in pages.css (980px,
  90px top) + scrollbar-gutter: stable + body min-height; Contact title moved above its sheet;
  experience timeline max 860px. Docs: no resume-viewer, LiuOS → match site design, checklist #4.
  Verified: PDF opens on click, viewer gone, min room text 11px, floor labels gone, all 4 titles at
  (217,96) desktop / (16,96) phone, no sideways scroll, no console errors. Caught + fixed: short
  pages lost the paper background. Browser cache caused confusing stale results during testing.
  Awaiting learner check + commit/push.
- Learner worried the desk (sitting-at-desk) view was gone. Verified it still works (screenshot: laptop + résumé paper callouts). No change needed.
- Learner's missing view = 'details' camera preset (wide desk-area shot: shelves, monkey, laptop, résumé). Previously only reachable as the résumé-close return view; now unreachable after PDF change. Showed screenshot; asked how to make it reachable.
- Learner chose a shelves callout for the 'details' view. Implemented: hotspot 'details' ("B / Shelves",
  "Take a closer look"), position on the shelves; callouts re-lettered A Desk, B Shelves, C Résumé,
  D Laptop (removed unused bed/side entries); first placement overlapped A → moved right.
  Verified with a real click: B flies to the details view. Uncommitted with batch 1.
- Learner reversed résumé decision (2026-10-12): keep in-room experience — click paper → camera zooms
  to résumé on desk → readable résumé view (desk visible behind, résumé main focus); "Back to desk"
  → shelves/details view; nav Résumé stays PDF. Problem was the old pop-up's look.
- New requirement: recreate résumé in HTML matching Jake's LaTeX template as identically as possible
  (not an image). Learner offered the .tex — Claude asked for it (treat as private, don't commit).
- Found: résumé has entries not in content/portfolio.js (Outreach Coordinator, Ad CTR project) →
  résumé is its own document; .tex is its source. Computer Modern available as web font:
  jsDelivr computer-modern@0.1.2 cmu-serif.css (CMU Serif).
- Awaiting: .tex file, then implementation approval.
- Read Liu_Nathan_Resume (1).tex (Jake's template). Cover letter .tex was removed by learner.
- Résumé view APPROVED (Claude writes): restore resume-viewer/, HTML recreation in CMU Serif with
  container-relative sizes (exact on desktop; readable reflow on phones), drafting header with
  Download PDF + Back to desk (→ details view), room zoom-then-open restored; nav PDF unchanged;
  CLAUDE.md upkeep note; .gitignore *.tex + assets/photos/nathan.jpg (approved).
- Résumé view implemented (uncommitted, polish): resume-viewer restored; viewer.html = HTML recreation
  of the .tex (Jake's template); viewer.css: own @font-face for CMU Serif (package CSS invalid),
  sizes in LaTeX pt scaled by container width (--pt = 100cqw/612), phone fallback --pt 1.25px with
  wrap; full-screen transparent dialog, light backdrop, drafting header (Download PDF, ← Back to
  desk). Room: zoom to résumé then open; close → 'details'. Name not small caps (CM lacks bold sc —
  matches PDF). Font preloaded in viewer.js. .gitignore: *.tex, assets/photos/nathan.jpg. Docs updated.
  Verified: line breaks identical to PDF, CMU loaded, Back to desk → shelves view (real click),
  phone 12.5px no sideways scroll. Awaiting learner check + commit/push of batch 1 + résumé.
- Learner approved résumé; committed 30f254d + pushed `polish` (no PR yet).
- Learner asked for .cursorrules + Antigravity agents file (for when Claude credits run out) + README update.
  Researched: AGENTS.md is read by Cursor, Antigravity (v1.20.3+), Claude Code, Copilot, Codex;
  .cursorrules deprecated in Cursor (reportedly ignored in Agent mode); Antigravity also reads
  GEMINI.md (wins on conflicts) and .agent/rules/. Proposed AGENTS.md as single source.
- Learner chose AGENTS.md as single source (reason: deprecations of other options); CLAUDE.md = one-line
  `@AGENTS.md` import; no .cursorrules/GEMINI.md; README not updated (learner's call). Done (staged,
  not committed). Demonstrated: applied single-source-of-truth reasoning to tooling files.
- Committed bd53345 (AGENTS.md) + pushed; PR #3 (polish → main) merged 1473190 (learner asked).
  Local main up to date. Learner will do the LiuOS revamp with Cursor agent (outside this session).
