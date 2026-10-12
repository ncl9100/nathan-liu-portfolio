// Nav: the bar across the top (name, portfolio links, floor-plan button, mobile menu).
// The same nav appears on every page. Each page names itself with <body data-page="...">.
//
// Ordinary links (work on every page):
//   Experience, Projects, Contact → their pages in pages/.  Résumé → the PDF in a new tab.
//   "Nathan Liu" → the room.
//   Pages other than the room put their own "Back to the room" button below their content.
//
// On the room page only, the nav also asks the room through announcements:
//   Announces:    room:go {view}               "Nathan Liu" → overview, floor-plan icon → floor plan
//                 room:open-app {name,opener}  About (LiuOS, until its page exists)
//   Listens for:  room:view {view}                         highlight the floor-plan button
//                 laptop:apps-changed {active}             highlight the app in front
//                 laptop:closed / resume:closed            close the mobile menu
// On other pages, About goes back to the room.

const markup = await fetch(new URL('nav.html', import.meta.url)).then(response => response.text());
document.body.insertAdjacentHTML('afterbegin', markup);

const page = document.body.dataset.page;
const onRoomPage = page === 'room';
const nav = document.querySelector('.room-nav');
const menuToggle = document.getElementById('room-menu-toggle');
const floorPlan = nav.querySelector('.floor-plan-button');
const announce = (name, detail) => document.dispatchEvent(new CustomEvent(name, { detail }));
let activeApp = null;

function closeMenu() {
  nav.classList.remove('menu-open');
  menuToggle.setAttribute('aria-expanded', 'false');
}

function updateHighlights() {
  for (const button of document.querySelectorAll('[data-os-route]'))
    button.setAttribute('aria-pressed', String(button.dataset.osRoute === activeApp));
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

if (onRoomPage) {
  // Camera links: stay on the page and ask the room to move instead of reloading.
  for (const link of nav.querySelectorAll('[data-view]'))
    link.addEventListener('click', event => {
      event.preventDefault();
      announce('room:go', { view: link.dataset.view });
    });
  for (const button of document.querySelectorAll('[data-os-route]'))
    button.addEventListener('click', () => {
      const opener = document.activeElement;
      closeMenu();
      announce('room:open-app', { name: button.dataset.osRoute, opener });
    });

  // Announcements → highlights
  document.addEventListener('room:view', ({ detail: { view } }) => {
    floorPlan.setAttribute('aria-pressed', String(view === 'front'));
  });
  document.addEventListener('resume:closed', closeMenu);
  document.addEventListener('laptop:apps-changed', ({ detail: { active } }) => { activeApp = active; updateHighlights(); });
  document.addEventListener('laptop:closed', closeMenu);
} else {
  // No room here: the floor plan means nothing, and LiuOS (About, for now) lives in the room.
  floorPlan.hidden = true;
  for (const button of document.querySelectorAll('[data-os-route]'))
    button.addEventListener('click', () => { location.href = '/'; });
}

updateHighlights();
