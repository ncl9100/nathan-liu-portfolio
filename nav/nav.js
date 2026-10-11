// Nav: the bar across the top (name, portfolio links, floor-plan button, mobile menu).
//
// The nav doesn't touch the room, LiuOS, or the résumé viewer. It asks through announcements:
//   Announces:    room:go {view}               "Nathan Liu" → overview, floor-plan icon → floor plan
//                 room:open-resume {opener}    Résumé button
//                 room:open-app {name,opener}  About, Experience, Projects, Contact
//   Listens for:  room:view {view}                         highlight the floor-plan button
//                 resume:opened / resume:closed            highlight Résumé
//                 laptop:apps-changed {active}             highlight the app in front
//                 laptop:closed / resume:closed            close the mobile menu

const markup = await fetch(new URL('nav.html', import.meta.url)).then(response => response.text());
document.body.insertAdjacentHTML('afterbegin', markup);

const nav = document.querySelector('.room-nav');
const menuToggle = document.getElementById('room-menu-toggle');
const announce = (name, detail) => document.dispatchEvent(new CustomEvent(name, { detail }));
let resumeOpen = false, activeApp = null;

function closeMenu() {
  nav.classList.remove('menu-open');
  menuToggle.setAttribute('aria-expanded', 'false');
}

function updateHighlights() {
  for (const button of document.querySelectorAll('[data-os-route]'))
    button.setAttribute('aria-pressed', String(button.dataset.osRoute === activeApp));
  document.getElementById('nav-resume').setAttribute('aria-pressed', String(resumeOpen || activeApp === 'resume'));
  document.querySelector('.room-wordmark').removeAttribute('aria-pressed');
}

// Mobile menu
menuToggle.addEventListener('click', () => {
  const open = menuToggle.getAttribute('aria-expanded') !== 'true';
  menuToggle.setAttribute('aria-expanded', String(open));
  nav.classList.toggle('menu-open', open);
});
nav.addEventListener('click', event => { if (event.target.closest('[data-view]')) closeMenu(); });
document.addEventListener('pointerdown', event => { if (!nav.contains(event.target)) closeMenu(); });
window.addEventListener('resize', () => { if (innerWidth > 600) closeMenu(); });

// Buttons → requests
for (const button of document.querySelectorAll('[data-view]'))
  button.addEventListener('click', () => announce('room:go', { view: button.dataset.view }));
for (const button of document.querySelectorAll('[data-os-route]'))
  button.addEventListener('click', () => {
    const opener = document.activeElement;
    closeMenu();
    announce('room:open-app', { name: button.dataset.osRoute, opener });
  });
document.getElementById('nav-resume').addEventListener('click', () => {
  closeMenu();
  announce('room:open-resume', { opener: document.activeElement });
});

// Announcements → highlights
document.addEventListener('room:view', ({ detail: { view } }) => {
  for (const button of document.querySelectorAll('[data-view]'))
    button.setAttribute('aria-pressed', String(button.dataset.view === 'front' && view === 'front'));
  updateHighlights();
});
document.addEventListener('resume:opened', () => { resumeOpen = true; updateHighlights(); });
document.addEventListener('resume:closed', () => { resumeOpen = false; closeMenu(); updateHighlights(); });
document.addEventListener('laptop:apps-changed', ({ detail: { active } }) => { activeApp = active; updateHighlights(); });
document.addEventListener('laptop:closed', closeMenu);

updateHighlights();
