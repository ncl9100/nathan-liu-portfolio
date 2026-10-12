// Experience page: a timeline built from content/portfolio.js (newest first, in the file's order).

import { experience } from '../../content/portfolio.js';
import { reveal } from '../reveal.js';

const timeline = document.getElementById('timeline');

function element(tag, className, text) {
  const el = document.createElement(tag);
  if (className) el.className = className;
  if (text) el.textContent = text;
  return el;
}

for (const job of experience) {
  const item = element('li', 'timeline-item');
  item.append(element('p', 'timeline-dates', job.dates));

  const body = element('div', 'timeline-body');
  body.append(element('h2', 'timeline-role', job.role));
  body.append(element('p', 'timeline-org', job.organization));

  const bullets = element('ul', 'timeline-bullets');
  for (const text of job.bullets) bullets.append(element('li', null, text));
  body.append(bullets);

  const tags = element('ul', 'timeline-tags');
  tags.setAttribute('aria-label', 'Tools used');
  for (const tool of job.tech) tags.append(element('li', null, tool));
  body.append(tags);

  item.append(body);
  timeline.append(item);
}

reveal(timeline.querySelectorAll('.timeline-item'));
