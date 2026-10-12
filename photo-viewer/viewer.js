// Photo viewer: the pop-up that holds a kitchen-counter photo up close over the blurred room.
//
// Listens for:   photo:open {src, thumb, caption, rect}  → grow the photo from rect (its spot on screen) to the middle
//                photo:close                             → shrink it back and close
// Announces:     photo:opened  → it is now open
//                photo:closed  → it is now closed (button, Escape key, click outside, or photo:close)

const markup = await fetch(new URL('viewer.html', import.meta.url)).then(response => response.text());
document.body.insertAdjacentHTML('beforeend', markup);

const dialog = document.getElementById('photo-window');
const print = dialog.querySelector('.photo-print');
const image = document.getElementById('photo-image');
const caption = document.getElementById('photo-caption');
const closeButton = document.getElementById('close-photo');
const announce = name => document.dispatchEvent(new CustomEvent(name));
const motion = matchMedia('(prefers-reduced-motion: reduce)');
const easing = 'cubic-bezier(.2, .7, .2, 1)';

let startRect = null, closing = false, opened = 0;

// The transform that puts the print exactly over the photo's spot on the counter.
function fromStart() {
  const end = print.getBoundingClientRect();
  if (!startRect || !end.width || !end.height) return 'none';
  return `translate(${startRect.left - end.left}px, ${startRect.top - end.top}px) scale(${startRect.width / end.width}, ${startRect.height / end.height})`;
}

function loadImage(src) {
  const loader = new Image();
  loader.src = src;
  return loader.decode().then(() => loader, () => null);
}

document.addEventListener('photo:open', async ({ detail }) => {
  if (dialog.open) return;
  const token = ++opened;
  startRect = detail.rect;
  closing = false;

  // The small copy is already loaded for the counter, so show it right away and swap in the full photo when it arrives.
  const thumb = await loadImage(detail.thumb);
  if (token !== opened) return;
  if (thumb) print.style.setProperty('--aspect', thumb.naturalWidth / thumb.naturalHeight);
  image.src = detail.thumb;
  caption.textContent = detail.caption || '';
  caption.hidden = !detail.caption;
  print.style.setProperty('--reserve', detail.caption ? '200px' : '150px');

  // Move the nav bar inside the pop-up so it stays clickable above the blurred backdrop.
  dialog.prepend(document.querySelector('.room-nav'));
  dialog.showModal();
  announce('photo:opened');
  closeButton.focus({ preventScroll: true });
  if (!motion.matches) print.animate([{ transform: fromStart() }, { transform: 'none' }], { duration: 450, easing });

  const full = await loadImage(detail.src);
  if (full && token === opened && dialog.open) image.src = detail.src;
});

async function closePhoto() {
  if (!dialog.open || closing) return;
  closing = true;
  if (!motion.matches) {
    dialog.classList.add('closing');
    const shrink = print.animate([{ transform: 'none' }, { transform: fromStart() }], { duration: 350, easing: 'ease-in', fill: 'forwards' });
    await shrink.finished.catch(() => {});
    dialog.close();
    shrink.cancel();
  } else dialog.close();
}

document.addEventListener('photo:close', closePhoto);
closeButton.addEventListener('click', closePhoto);
// Escape normally closes a dialog instantly; route it through the shrink animation instead.
dialog.addEventListener('cancel', event => { event.preventDefault(); closePhoto(); });
dialog.addEventListener('click', event => {
  if (!print.contains(event.target) && !event.target.closest('.room-nav')) closePhoto();
});

// Every way of closing ends up here.
dialog.addEventListener('close', () => {
  opened++;
  closing = false;
  dialog.classList.remove('closing');
  document.body.prepend(document.querySelector('.room-nav'));
  announce('photo:closed');
});
