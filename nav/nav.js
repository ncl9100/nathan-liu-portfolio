// Nav: the bar across the top (name, portfolio links, floor-plan button, mobile menu).
// The same nav appears on every page. Each page names itself with <body data-page="...">.
//
// Ordinary links (work on every page):
//   About, Experience, Projects, Contact → their pages in pages/.  Résumé → the PDF in a new tab.
//   "Nathan Liu" → the room.
//   Pages other than the room put their own "Back to the room" button below their content.
//
// On the room page only, the nav also talks to the room through announcements:
//   Announces:    room:go {view}                 "Nathan Liu" → overview, floor-plan icon → floor plan
//                 hero:show                      "Nathan Liu" → bring the intro cover back
//   Listens for:  room:view {view}               highlight the floor-plan button
//                 laptop:closed / resume:closed  close the mobile menu
//                 room:ready                     on the room page, leftover Resume / Contact
//                                                taps from loading are thrown away

const markup = await fetch(new URL('nav.html', import.meta.url)).then(response => response.text());
document.body.insertAdjacentHTML('afterbegin', markup);

const page = document.body.dataset.page;
const nav = document.querySelector('.room-nav');
const menuToggle = document.getElementById('room-menu-toggle');
const floorPlan = nav.querySelector('.floor-plan-button');
const announce = (name, detail) => document.dispatchEvent(new CustomEvent(name, { detail }));

function closeMenu() {
  nav.classList.remove('menu-open');
  menuToggle.setAttribute('aria-expanded', 'false');
}

// Mark the link for the page we're on.
document.getElementById('nav-' + page)?.setAttribute('aria-current', 'page');

// Mobile menu
menuToggle.addEventListener('click', () => {
  const open = menuToggle.getAttribute('aria-expanded') !== 'true';
  menuToggle.setAttribute('aria-expanded', String(open));
  nav.classList.toggle('menu-open', open);
});
nav.addEventListener('click', event => { if (event.target.closest('[data-view], a')) closeMenu(); });
document.addEventListener('pointerdown', event => { if (!nav.contains(event.target)) closeMenu(); });
window.addEventListener('resize', () => { if (innerWidth > 600) closeMenu(); });

if (page === 'room') {
  // Same leftover-tap rule as the cover: a Resume / Contact click during loading
  // must not open the PDF or the contact page the instant the room is ready.
  let linksOpen = location.hash === '#room', ignoreUntil = 0;
  document.addEventListener('room:ready', () => { linksOpen = true; ignoreUntil = performance.now() + 500; }, { once: true });
  for (const id of ['nav-resume', 'nav-contact']) {
    document.getElementById(id)?.addEventListener('click', event => {
      if (!linksOpen || performance.now() < ignoreUntil) event.preventDefault();
    }, true);
  }
  // Camera links: stay on the page and ask the room to move instead of reloading.
  for (const link of nav.querySelectorAll('[data-view]'))
    link.addEventListener('click', event => {
      event.preventDefault();
      announce('room:go', { view: link.dataset.view });
      if (link.classList.contains('room-wordmark')) announce('hero:show');
    });
  document.addEventListener('room:view', ({ detail: { view } }) => {
    floorPlan.setAttribute('aria-pressed', String(view === 'front'));
  });
  document.addEventListener('resume:closed', closeMenu);
  document.addEventListener('laptop:closed', closeMenu);
} else {
  // No room here, so the floor-plan button means nothing.
  floorPlan.hidden = true;
}
