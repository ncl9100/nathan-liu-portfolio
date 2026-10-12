// Contact page: fills in my links from the shared content file (the only place they live).

import { profile } from '../../content/portfolio.js';

const show = (id, href, text) => {
  const link = document.getElementById(id);
  link.href = href;
  link.textContent = text;
};
// Show addresses without the "https://www." part.
const shortUrl = url => url.replace(/^https?:\/\/(www\.)?/, '').replace(/\/$/, '');

show('contact-email', 'mailto:' + profile.email, profile.email);
show('contact-linkedin', profile.linkedin, shortUrl(profile.linkedin));
show('contact-github', profile.github, shortUrl(profile.github));

const copyButton = document.getElementById('copy-email');
copyButton.addEventListener('click', async () => {
  try {
    await navigator.clipboard.writeText(profile.email);
    copyButton.textContent = 'Copied';
  } catch {
    copyButton.textContent = 'Try again';
  }
  setTimeout(() => { copyButton.textContent = 'Copy'; }, 2000);
});
