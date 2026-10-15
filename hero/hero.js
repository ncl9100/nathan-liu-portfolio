// Hero: the cover over the room on the home page (name, rotating roles, photo, Resume and Contact).
// Scrolling down, swiping up, the arrow keys, or "Scroll to explore my room" slide it away.
// Visitors who arrive at /#room (the pages' "Back to the room" button) skip it.
// Visitors who turned on "reduce motion" see all the roles at once and no slide.
//
// Listens for:  room:ready         the room finished loading, so start typing the roles
//               hero:show          slide back in (nav: "Nathan Liu")
//               room:go {view}     the floor-plan button moved the camera, so get out of the way
//                                  (the overview, "angle", comes with hero:show instead)
// Announces:    hero:hidden        the cover slid away and the room is in view

import { profile } from '../content/portfolio.js';

const markup = await fetch(new URL('hero.html', import.meta.url)).then(response => response.text());
document.body.insertAdjacentHTML('beforeend', markup);

const hero = document.getElementById('hero');
const roleText = hero.querySelector('.hero-role-text');
const [first, ...rest] = profile.name.split(' ');
hero.querySelector('.hero-kicker').textContent = `${profile.year} · ${profile.education} · Minor in ${profile.minor}`;
hero.querySelector('.hero-first').textContent = first;
hero.querySelector('.hero-last').textContent = rest.join(' ');
hero.querySelector('.hero-roles-all').textContent = profile.roles.join(', ');
if (matchMedia('(pointer: coarse)').matches) hero.querySelector('.hero-explore-text').textContent = 'Swipe up to explore my room';

const reducedMotion = matchMedia('(prefers-reduced-motion: reduce)');
const TYPE_MS = 70, DELETE_MS = 35, HOLD_MS = 1600;
let timer = 0;

// Types a role, holds it, deletes it, then moves to the next one.
function cycleRoles(index = 0, count = 0, deleting = false) {
  clearTimeout(timer);
  if (reducedMotion.matches) { roleText.textContent = profile.roles.join(' · '); hero.classList.add('roles-static'); return; }
  hero.classList.remove('roles-static');
  const role = profile.roles[index % profile.roles.length];
  roleText.textContent = role.slice(0, count);
  if (!deleting && count < role.length) timer = setTimeout(() => cycleRoles(index, count + 1), TYPE_MS);
  else if (!deleting) timer = setTimeout(() => cycleRoles(index, count, true), HOLD_MS);
  else if (count > 0) timer = setTimeout(() => cycleRoles(index, count - 1, true), DELETE_MS);
  else timer = setTimeout(() => cycleRoles(index + 1), TYPE_MS * 4);
}

const isAway = () => hero.classList.contains('is-away');

function hide({ announce = true } = {}) {
  if (isAway()) return;
  clearTimeout(timer);
  hero.classList.add('is-away');
  hero.inert = true;
  if (announce) document.dispatchEvent(new CustomEvent('hero:hidden'));
}

function show() {
  if (!isAway()) return;
  hero.classList.remove('is-away');
  hero.inert = false;
  cycleRoles();
}

// The room's 3D setup freezes the page for a second or two, which would stall the typing, so the
// first role starts fully written and the typing waits for room:ready (or 8 seconds, just in case).
let roomReady = false;
function startTyping() {
  if (roomReady) return;
  roomReady = true;
  if (!isAway()) cycleRoles(0, profile.roles[0].length);
}
document.addEventListener('room:ready', startTyping, { once: true });
setTimeout(startTyping, 8000);

if (location.hash === '#room') {
  hero.classList.add('no-slide');
  hide({ announce: false });
  requestAnimationFrame(() => requestAnimationFrame(() => hero.classList.remove('no-slide')));
} else if (reducedMotion.matches) cycleRoles();
else roleText.textContent = profile.roles[0];

hero.querySelector('.hero-explore').addEventListener('click', () => hide());

// Trackpads send many tiny wheel events, so wait for a real downward scroll.
let wheelTotal = 0, wheelReset = 0;
hero.addEventListener('wheel', event => {
  event.preventDefault();
  clearTimeout(wheelReset);
  wheelReset = setTimeout(() => wheelTotal = 0, 200);
  wheelTotal += event.deltaY;
  if (wheelTotal > 40) hide();
}, { passive: false });

let touchY = null;
hero.addEventListener('touchstart', event => { touchY = event.touches[0].clientY; }, { passive: true });
hero.addEventListener('touchend', event => {
  if (touchY !== null && touchY - event.changedTouches[0].clientY > 40) hide();
  touchY = null;
});

document.addEventListener('keydown', event => {
  if (isAway() || event.target.closest?.('a, button, input, textarea')) return;
  if (['ArrowDown', 'PageDown', ' ', 'Spacebar'].includes(event.key)) { event.preventDefault(); hide(); }
});

document.addEventListener('hero:show', show);
document.addEventListener('room:go', ({ detail: { view } }) => { if (view !== 'angle') hide(); });
reducedMotion.addEventListener('change', () => { if (!isAway()) cycleRoles(); });
