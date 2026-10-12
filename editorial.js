/* Editorial motion: scroll reveals, the marker circle, and the contents
   preview that follows the pointer. Everything degrades to a static page. */
(() => {
  const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;
  const targets = document.querySelectorAll('[data-reveal], .e-mark, .e-cover');

  if (reduce || !('IntersectionObserver' in window)) {
    targets.forEach(el => el.classList.add('in'));
  } else {
    // A wiped element starts fully clipped, which hides it from the observer,
    // so its parent is watched on its behalf.
    const watched = new Map();
    const io = new IntersectionObserver(entries => {
      entries.forEach(entry => {
        if (!entry.isIntersecting) return;
        (watched.get(entry.target) || []).forEach(el => el.classList.add('in'));
        io.unobserve(entry.target);
      });
    }, { rootMargin: '0px 0px -12% 0px', threshold: 0.01 });
    targets.forEach(el => {
      const host = el.dataset.reveal === 'wipe' ? el.parentElement : el;
      if (!watched.has(host)) watched.set(host, []);
      watched.get(host).push(el);
      io.observe(host);
    });
  }

  // Contents: a photo follows the pointer over each entry (desktop with a mouse only).
  const peek = document.querySelector('.e-peek');
  if (peek && matchMedia('(hover: hover) and (pointer: fine)').matches) {
    const img = peek.querySelector('img');
    const wide = matchMedia('(min-width: 1025px)');
    let x = 0, y = 0, raf = 0;
    const move = () => { peek.style.left = x + 'px'; peek.style.top = y + 'px'; raf = 0; };
    document.querySelectorAll('.e-toc a').forEach(link => {
      link.addEventListener('pointerenter', () => {
        if (!wide.matches) return;
        img.src = link.dataset.peek;
        peek.classList.add('on');
      });
      link.addEventListener('pointerleave', () => peek.classList.remove('on'));
      link.addEventListener('pointermove', event => {
        x = event.clientX + 140; y = event.clientY;
        if (!raf) raf = requestAnimationFrame(move);
      });
    });
  }
})();
