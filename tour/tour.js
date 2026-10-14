// Tour: a short guided walk through the room, one card per stop (Back / Next / Skip tour).
// The first time a visitor leaves the hero (remembered in their browser), the room dims and a big
// "Take the tour" invite rises at the bottom, with "or explore on my own" under it. After that,
// "Take the tour" replays it from the overview. Escape ends it.
//
// Listens for:  hero:hidden        first visit: show the invite
//               hero:show          the cover came back, so stop
//               room:view {view}   only offer "Take the tour" from the overview
// Announces:    room:go {view}     fly the camera to each stop
//               tour:started / tour:ended   the room hides its captions and back button meanwhile
//                                           (the invite counts as part of the tour)

import { TOUR_CONFIG } from './settings.js';

const markup = await fetch(new URL('tour.html', import.meta.url)).then(response => response.text());
document.body.insertAdjacentHTML('beforeend', markup);

const card = document.getElementById('tour-card');
const stepLabel = card.querySelector('.tour-step');
const text = card.querySelector('.tour-text');
const back = card.querySelector('.tour-back');
const next = card.querySelector('.tour-next');
const invite = document.getElementById('tour-invite');
const replay = document.getElementById('tour-replay');
const announce = (name, detail) => document.dispatchEvent(new CustomEvent(name, { detail }));
const touch = matchMedia('(pointer: coarse)').matches;
const steps = TOUR_CONFIG.steps;
let index = -1;      // the stop on screen, or -1 when the card is closed
let active = false;  // the invite or the card is up
let roomView = 'angle';
const inOverview = () => ['angle', 'front', 'custom'].includes(roomView);

// Private browsing in some browsers throws on storage, so treat that as "not seen".
const seen = () => { try { return localStorage.getItem(TOUR_CONFIG.storageKey) === '1'; } catch { return false; } };
const markSeen = () => { try { localStorage.setItem(TOUR_CONFIG.storageKey, '1'); } catch {} };

function activate() {
  replay.hidden = true;
  if (!active) { active = true; announce('tour:started'); }
}

function showInvite() {
  activate();
  invite.hidden = false;
  invite.querySelector('.tour-invite-start').focus({ preventScroll: true });
}

function show(i) {
  index = i;
  const step = steps[i];
  stepLabel.textContent = `${step.label || 'Tour'} · ${i + 1} of ${steps.length}`;
  text.textContent = touch ? (step.touchText || step.text.replaceAll('Click', 'Tap')) : step.text;
  back.disabled = i === 0;
  next.textContent = i === steps.length - 1 ? 'Start exploring' : 'Next';
  announce('room:go', { view: step.view });
}

function start() {
  activate();
  invite.hidden = true;
  card.hidden = false;
  show(0);
  next.focus({ preventScroll: true });
}

function end() {
  if (!active) return;
  active = false;
  index = -1;
  invite.hidden = card.hidden = true;
  replay.hidden = !inOverview();
  markSeen();
  announce('tour:ended');
}

next.addEventListener('click', () => index === steps.length - 1 ? end() : show(index + 1));
back.addEventListener('click', () => { if (index > 0) show(index - 1); });
card.querySelector('.tour-skip').addEventListener('click', end);
replay.addEventListener('click', start);
invite.querySelector('.tour-invite-start').addEventListener('click', start);
invite.querySelector('.tour-invite-skip').addEventListener('click', end);
// Clicking the dimmed room counts as "explore on my own".
invite.addEventListener('click', event => { if (event.target === invite) end(); });

document.addEventListener('keydown', event => {
  if (event.key === 'Escape' && active && !event.target.closest?.('dialog')) end();
});
document.addEventListener('hero:hidden', () => { if (!seen() && !active) showInvite(); });
document.addEventListener('hero:show', end);
document.addEventListener('room:view', ({ detail: { view } }) => {
  roomView = view;
  if (!active) replay.hidden = !inOverview();
});
replay.hidden = false;
