// Tour: a short guided walk through the room, one card per stop (Back / Next / Skip tour).
// Every time the cover slides away, the room dims and a big "Take the tour" invite rises at the
// bottom, with "or explore on my own" under it. Closing it on this page leaves the smaller
// "Take the tour" button. A new tab starts the invite over. Escape ends it.
//
// Listens for:  hero:hidden        the cover left: show the invite
//               hero:show          the cover came back, so stop
//               room:view {view}   only offer "Take the tour" from the overview
// Announces:    room:go {view}     fly the camera to each stop
//               tour:started / tour:ended {finished}   the room hides its captions and back button meanwhile
//                                           (the invite counts as part of the tour); finished = "Start exploring"

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
let dismissed = false; // this page only; a new tab starts over
let roomView = 'angle';
let leaveTimer = 0;
const reducedMotion = matchMedia('(prefers-reduced-motion: reduce)');
const inOverview = () => ['angle', 'front', 'custom'].includes(roomView);

function activate() {
  replay.hidden = true;
  if (!active) { active = true; announce('tour:started'); }
}

function showInvite() {
  if (dismissed) return;
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
  clearTimeout(leaveTimer);
  card.classList.remove('is-leaving');
  replay.classList.remove('is-arriving');
  invite.hidden = true;
  card.hidden = false;
  show(0);
  next.focus({ preventScroll: true });
}

// finished: they clicked "Start exploring" on the last stop, so the room gives the camera a gentle settle.
function end({ finished = false } = {}) {
  if (!active) return;
  active = false;
  dismissed = true;
  index = -1;
  invite.hidden = true;
  announce('tour:ended', { finished });
  const close = () => {
    card.hidden = true;
    card.classList.remove('is-leaving');
    replay.classList.add('is-arriving');
    replay.hidden = !inOverview();
  };
  if (card.hidden || reducedMotion.matches) { close(); return; }
  card.classList.add('is-leaving');
  leaveTimer = setTimeout(close, 350);
}

next.addEventListener('click', () => index === steps.length - 1 ? end({ finished: true }) : show(index + 1));
back.addEventListener('click', () => { if (index > 0) show(index - 1); });
card.querySelector('.tour-skip').addEventListener('click', () => end());
replay.addEventListener('click', start);
replay.addEventListener('animationend', () => replay.classList.remove('is-arriving'));
invite.querySelector('.tour-invite-start').addEventListener('click', start);
invite.querySelector('.tour-invite-skip').addEventListener('click', () => end());
// Clicking the dimmed room counts as "explore on my own".
invite.addEventListener('click', event => { if (event.target === invite) end(); });

document.addEventListener('keydown', event => {
  if (event.key === 'Escape' && active && !event.target.closest?.('dialog')) end();
});
document.addEventListener('hero:hidden', () => { if (!dismissed && !active) showInvite(); });
// The cover can slide away before this file finishes loading. /#room skips the cover on purpose.
if (location.hash !== '#room' && document.getElementById('hero')?.classList.contains('is-away')) showInvite();
document.addEventListener('hero:show', end);
document.addEventListener('room:view', ({ detail: { view } }) => {
  roomView = view;
  if (!active) replay.hidden = !inOverview();
});
replay.hidden = active;
