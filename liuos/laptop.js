// LiuOS: the laptop desktop.
//
// For now this only loads LiuOS's markup into the page. LiuOS's behavior still
// lives in index.html's main script, which imports this file so the markup is
// guaranteed to exist before that code looks it up. Step 5b moves the behavior here.

const markup = await fetch(new URL('laptop.html', import.meta.url)).then(response => response.text());
document.body.insertAdjacentHTML('beforeend', markup);
