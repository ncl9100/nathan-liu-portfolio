// Projects page: one card per project, built from content/portfolio.js (already newest first).
// Clicking the card opens the live site; the GitHub link sits at the bottom of the card.

import { projects } from '../../content/portfolio.js';
import { reveal } from '../reveal.js';

const list = document.getElementById('project-list');

function element(tag, className, text) {
  const el = document.createElement(tag);
  if (className) el.className = className;
  if (text) el.textContent = text;
  return el;
}

for (const project of projects) {
  const live = project.links.find(link => link.label.startsWith('Live') && link.url);
  const github = project.links.find(link => link.label === 'GitHub' && link.url);
  if (!live) continue; // only deployed projects get a card

  const card = element('article', 'project-card');

  // The main area is one big link to the live site. External sites open in a new tab.
  const main = element('a', 'card-main');
  main.href = live.url;
  if (live.url.startsWith('http')) { main.target = '_blank'; main.rel = 'noopener'; }

  const frame = element('div', 'card-image');
  if (project.image) {
    const img = element('img');
    img.src = '/' + project.image;
    img.alt = 'Screenshot of ' + project.title;
    img.loading = 'lazy';
    frame.append(img);
  }

  const body = element('div', 'card-body');
  if (project.date) body.append(element('small', 'card-date', project.date));
  body.append(element('h2', 'card-title', project.title));
  if (project.badge) body.append(element('span', 'card-badge', project.badge));
  body.append(element('p', 'card-summary', project.summary));
  body.append(element('span', 'card-visit', live.url === '/' ? 'Open the room' : 'Visit site'));

  main.append(frame, body);
  card.append(main);

  // A link can't sit inside another link, so GitHub is its own link below the main one.
  if (github) {
    const footer = element('a', 'card-github', 'GitHub repo');
    footer.href = github.url;
    footer.target = '_blank';
    footer.rel = 'noopener';
    card.append(footer);
  }
  list.append(card);
}

reveal(list.querySelectorAll('.project-card'));
