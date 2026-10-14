// About page: types out the About paragraphs from content/portfolio.js, one after another.
// Clicking the text (or "Show all") finishes it instantly. Visitors who turned on
// "reduce motion" see the full text right away. Screen readers always get the full text.

import { profile } from '../../content/portfolio.js';
import { reveal } from '../reveal.js';

const paragraphs = profile.about;
const typed = document.getElementById('about-typed');
const skip = document.getElementById('about-skip');

// The full bio, for screen readers.
const full = document.getElementById('about-full');
for (const text of paragraphs) full.append(Object.assign(document.createElement('p'), { textContent: text }));

const MS_PER_PARAGRAPH = 2500; // fast: each paragraph takes about two and a half seconds
let timer = 0;
let finished = false;

// Every paragraph is placed up front with its text invisible, so the layout never jumps;
// typing just reveals characters. Each <p> holds a visible part and a not-yet-typed part.
const rows = paragraphs.map(text => {
  const p = document.createElement('p');
  const shown = document.createElement('span');
  const rest = Object.assign(document.createElement('span'), { className: 'untyped', textContent: text });
  p.append(shown, rest);
  typed.append(p);
  return { text, p, shown, rest };
});

function showAll() {
  clearTimeout(timer);
  finished = true;
  for (const row of rows) { row.shown.textContent = row.text; row.rest.textContent = ''; row.p.classList.remove('typing'); }
  skip.hidden = true;
}

function typeParagraph(index) {
  if (finished || index >= rows.length) { showAll(); return; }
  const row = rows[index];
  row.p.classList.add('typing');
  const delay = MS_PER_PARAGRAPH / row.text.length;
  let count = 0;
  const step = () => {
    if (finished) return;
    // Two characters per tick keeps it fast even on slow devices.
    count = Math.min(row.text.length, count + 2);
    row.shown.textContent = row.text.slice(0, count);
    row.rest.textContent = row.text.slice(count);
    if (count < row.text.length) timer = setTimeout(step, delay * 2);
    else { row.p.classList.remove('typing'); timer = setTimeout(() => typeParagraph(index + 1), 200); }
  };
  step();
}

if (matchMedia('(prefers-reduced-motion: reduce)').matches) showAll();
else typeParagraph(0);

skip.addEventListener('click', event => { event.stopPropagation(); showAll(); });
document.querySelector('.about-text').addEventListener('click', () => { if (!finished) showAll(); });

// Fade the whole page in on load, like the other pages.
reveal(document.querySelectorAll('.page > *'));
