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

  // Touch screens have no hover, so the photocopied polaroids come back to
  // colour while they cross the middle of the screen instead.
  if (matchMedia('(hover: none)').matches && 'IntersectionObserver' in window) {
    const live = new IntersectionObserver(entries => {
      entries.forEach(entry => entry.target.classList.toggle('e-live', entry.isIntersecting));
    }, { rootMargin: '-38% 0px -38% 0px' });
    document.querySelectorAll('.e-fan .e-snap').forEach(el => live.observe(el));
  }

  // Contents: a photo follows the pointer over each entry (fine pointers only).
  const peek = document.querySelector('.e-peek');
  if (peek && matchMedia('(hover: hover) and (pointer: fine)').matches) {
    const img = peek.querySelector('img');
    let x = 0, y = 0, raf = 0;
    const move = () => { peek.style.left = x + 'px'; peek.style.top = y + 'px'; raf = 0; };
    document.querySelectorAll('.e-toc a').forEach(link => {
      link.addEventListener('pointerenter', () => {
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
