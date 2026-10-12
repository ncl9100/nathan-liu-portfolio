// Résumé viewer: the pop-up that shows the résumé.
//
// Listens for:   resume:open    → open the pop-up
//                resume:close   → close it
// Announces:     resume:opened  → it is now open
//                resume:closed  → it is now closed (button, Escape key, or resume:close)

// Start downloading the résumé's font (Computer Modern) now, so it's ready before anyone opens it.
for (const style of ['400 11px', 'italic 400 11px', '700 11px', 'italic 700 11px']) document.fonts.load(`${style} "CMU Serif"`);

const markup = await fetch(new URL('viewer.html', import.meta.url)).then(response => response.text());
document.body.insertAdjacentHTML('beforeend', markup);

// The résumé itself is a shared file (LiuOS shows the same one).
const sheet = await fetch(new URL('../assets/resume/resume.html', import.meta.url)).then(response => response.text());
document.querySelector('#resume-window .sheet-frame').innerHTML = sheet;

const dialog = document.getElementById('resume-window');
const closeButton = document.getElementById('close-resume');
const announce = name => document.dispatchEvent(new CustomEvent(name));

document.addEventListener('resume:open', () => {
  if (dialog.open) return;
  // Move the nav bar inside the pop-up so it stays clickable above the dimmed backdrop.
  dialog.prepend(document.querySelector('.room-nav'));
  dialog.showModal();
  announce('resume:opened');
  closeButton.focus();
});

document.addEventListener('resume:close', () => {
  if (dialog.open) dialog.close();
});

closeButton.addEventListener('click', () => dialog.close());

// Every way of closing (the button, the Escape key, resume:close) ends up here.
dialog.addEventListener('close', () => {
  document.body.prepend(document.querySelector('.room-nav'));
  announce('resume:closed');
});
