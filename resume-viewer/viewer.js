// Résumé viewer: the pop-up that shows the résumé.
//
// Listens for:   resume:open    → open the pop-up
//                resume:close   → close it
// Announces:     resume:opened  → it is now open
//                resume:closed  → it is now closed (button, Escape key, or resume:close)

const markup = await fetch(new URL('viewer.html', import.meta.url)).then(response => response.text());
document.body.insertAdjacentHTML('beforeend', markup);

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
