// Scroll fade-in, shared by the pages in pages/. Each element fades in once it scrolls into view.
// Visitors who turned on "reduce motion" (or older browsers) just see everything right away.

const reduceMotion = matchMedia('(prefers-reduced-motion: reduce)').matches;

export function reveal(elements) {
  if (reduceMotion || !('IntersectionObserver' in window)) return;
  const observer = new IntersectionObserver(entries => {
    for (const entry of entries) {
      if (!entry.isIntersecting) continue;
      entry.target.classList.add('is-visible');
      observer.unobserve(entry.target);
    }
  }, { threshold: 0.15 });
  for (const element of elements) {
    element.classList.add('reveal');
    observer.observe(element);
  }
}
