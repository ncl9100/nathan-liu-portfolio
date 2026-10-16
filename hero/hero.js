// Hero: the cover over the room on the home page (name, rotating roles, photo, Resume and Contact).
// Scrolling down, swiping, the arrow keys, or "Scroll to explore my room" slide it away,
// but only after the 3D room has finished loading. Until then the hint reads "Loading the room".
// A flick started during loading is thrown away, so it cannot fire the moment the room is ready.
// Visitors who arrive at /#room (the pages' "Back to the room" button) skip it.
// Visitors who turned on "reduce motion" see all the roles at once and no slide.
//
// Listens for:  room:ready         the room finished loading, so offer explore and start typing
//               hero:show          slide back in (nav: "Nathan Liu")
//               room:go {view}     the floor-plan button moved the camera, so get out of the way
//                                  (the overview, "angle", comes with hero:show instead)
// Announces:    hero:hidden        the cover slid away and the room is in view

import { profile } from '../content/portfolio.js';

// iPads often claim a mouse. Mark those as "save GPU" so the cover never blurs the room.
if (matchMedia('(pointer: coarse)').matches || matchMedia('(hover: none)').matches || (navigator.maxTouchPoints > 1 && matchMedia('(max-width: 1366px)').matches)) {
  document.documentElement.dataset.gpu = 'save';
}

const markup = await fetch(new URL('hero.html', import.meta.url)).then(response => response.text());
document.body.insertAdjacentHTML('beforeend', markup);

const hero = document.getElementById('hero');
const roleText = hero.querySelector('.hero-role-text');
const [first, ...rest] = profile.name.split(' ');
hero.querySelector('.hero-kicker').textContent = `${profile.year} · ${profile.education} · Minor in ${profile.minor}`;
hero.querySelector('.hero-first').textContent = first;
hero.querySelector('.hero-last').textContent = rest.join(' ');
hero.querySelector('.hero-roles-all').textContent = profile.roles.join(', ');
const explore = hero.querySelector('.hero-explore');
const exploreText = hero.querySelector('.hero-explore-text');
const exploreHint = matchMedia('(pointer: coarse)').matches ? 'Swipe up to explore my room' : 'Scroll to explore my room';

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
  // /#room still skips the cover before the room is ready. Everyone else waits.
  if (!roomOpen && announce !== false) return;
  clearTimeout(timer);
  hero.classList.add('is-clear');
  hero.style.willChange = 'transform';
  requestAnimationFrame(() => {
    hero.classList.add('is-away');
    hero.inert = true;
    if (announce) document.dispatchEvent(new CustomEvent('hero:hidden'));
  });
}

function show() {
  if (!isAway()) return;
  hero.style.willChange = '';
  hero.classList.remove('is-away', 'is-clear');
  hero.inert = false;
  cycleRoles();
}

// The room's 3D setup freezes the page for a second or two, which would stall the typing, so the
// first role starts fully written and the typing waits for room:ready (or 8 seconds, just in case).
// Explore stays locked until the room is actually ready, even if typing starts first.
// A swipe or trackpad flick started during loading must not fire the moment we unlock.
let roomReady = false, roomOpen = location.hash === '#room';
let wheelTotal = 0, wheelReset = 0, touchY = null, ignoreUntil = 0;
const gestureOk = () => roomOpen && performance.now() >= ignoreUntil;
function startTyping() {
  if (roomReady) return;
  roomReady = true;
  if (!isAway()) cycleRoles(0, profile.roles[0].length);
}
function allowExplore() {
  roomOpen = true;
  wheelTotal = 0;
  touchY = null;
  ignoreUntil = performance.now() + 500;
  explore.disabled = false;
  explore.classList.remove('is-waiting');
  exploreText.textContent = exploreHint;
  startTyping();
}
document.addEventListener('room:ready', allowExplore, { once: true });
setTimeout(startTyping, 8000);

if (location.hash === '#room') {
  hero.classList.add('no-slide');
  hide({ announce: false });
  requestAnimationFrame(() => requestAnimationFrame(() => hero.classList.remove('no-slide')));
} else if (reducedMotion.matches) cycleRoles();
else roleText.textContent = profile.roles[0];

explore.addEventListener('click', () => hide());

// Trackpads send many tiny wheel events, so wait for a real downward scroll.
hero.addEventListener('wheel', event => {
  event.preventDefault();
  if (!gestureOk()) { wheelTotal = 0; return; }
  clearTimeout(wheelReset);
  wheelReset = setTimeout(() => wheelTotal = 0, 200);
  wheelTotal += event.deltaY;
  if (wheelTotal > 40) hide();
}, { passive: false });

hero.addEventListener('touchstart', event => {
  if (!gestureOk()) { touchY = null; return; }
  touchY = event.touches[0].clientY;
}, { passive: true });
hero.addEventListener('touchend', event => {
  if (!gestureOk()) { touchY = null; return; }
  if (touchY !== null && Math.abs(touchY - event.changedTouches[0].clientY) > 40) hide();
  touchY = null;
});

document.addEventListener('keydown', event => {
  if (!gestureOk() || isAway() || event.target.closest?.('a, button, input, textarea')) return;
  if (['ArrowDown', 'PageDown', ' ', 'Spacebar'].includes(event.key)) { event.preventDefault(); hide(); }
});

document.addEventListener('hero:show', show);
document.addEventListener('room:go', ({ detail: { view } }) => { if (view !== 'angle') hide(); });
reducedMotion.addEventListener('change', () => { if (!isAway()) cycleRoles(); });
