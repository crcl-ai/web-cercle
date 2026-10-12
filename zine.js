/* Circle — the zine layer.
   1. On desktop, the cover and closing photos are two-plate photocopies (pink +
      black halftone). On the cover a marker circle brings what's inside it back
      to colour, and on both the cursor sprays more colour wherever it goes.
   2. A GET bar that waits at the bottom of small screens once the cover's own
      GET has scrolled away.
   On phones, tablets and without JavaScript the photos stay in colour and the bar never shows. */
(() => {
  const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;
  const fine = matchMedia('(hover: hover) and (pointer: fine)').matches;

  /* ---------- 1. photocopies ---------- */
  const PINK = '#ff7acd', INK = '#111', PAPER = '#efece4';

  // host: the element that receives the pointer; the canvas goes after its <picture>.
  // ring: where the marker circle goes, in fractions of the photo itself, so it
  // stays on the same spot however the crop changes.
  function photocopy(host, ring0, onReady) {
    const pic = host.querySelector('picture'), img = pic && pic.querySelector('img');
    if (!img) return;
    const view = document.createElement('canvas');
    view.className = 'e-xerox';
    view.setAttribute('aria-hidden', 'true');
    pic.after(view);
    const ctx = view.getContext('2d');
    const paper = document.createElement('canvas');   // the photocopy
    const keep = document.createElement('canvas');    // colour that stays (the circle)
    const trail = document.createElement('canvas');   // colour that fades (your marks)
    let W = 0, H = 0, dpr = 1, map = null, ring = [], drawn = 0, raf = 0, idle = 0, ready = false;

    const fit = () => {
      const iw = img.naturalWidth, ih = img.naturalHeight;
      const s = Math.max(W / iw, H / ih), dw = iw * s, dh = ih * s;
      const [px, py] = getComputedStyle(img).objectPosition.split(' ').map(v => parseFloat(v) / 100);
      return { x: (W - dw) * (isNaN(px) ? .5 : px), y: (H - dh) * (isNaN(py) ? .5 : py), w: dw, h: dh };
    };

    function halftone() {
      const p = paper.getContext('2d');
      const cell = Math.min(6, Math.max(4, W / dpr / 110)) * dpr;
      const k = cell / 3, sw = Math.ceil(W / k), sh = Math.ceil(H / k);
      const sample = document.createElement('canvas');
      sample.width = sw; sample.height = sh;
      const sx = sample.getContext('2d', { willReadFrequently: true });
      sx.drawImage(img, map.x / k, map.y / k, map.w / k, map.h / k);
      const px = sx.getImageData(0, 0, sw, sh).data;
      const lum = (x, y) => {
        const i = (Math.min(sh - 1, Math.max(0, y / k | 0)) * sw + Math.min(sw - 1, Math.max(0, x / k | 0))) * 4;
        const L = Math.pow((.2126 * px[i] + .7152 * px[i + 1] + .0722 * px[i + 2]) / 255, .8);
        return Math.min(1, Math.max(0, (L - .5) * 2.1 + .5));
      };
      const plate = (deg, size, radius, ox, oy) => {
        const a = deg * Math.PI / 180, ca = Math.cos(a), sa = Math.sin(a), R = Math.hypot(W, H) / 2 + size;
        p.beginPath();
        for (let v = -R; v < R; v += size) {
          for (let u = -R; u < R; u += size) {
            const x = W / 2 + u * ca - v * sa, y = H / 2 + u * sa + v * ca;
            if (x < -size || y < -size || x > W + size || y > H + size) continue;
            const r = radius(lum(x, y)) * size;
            if (r < .35) continue;
            p.moveTo(x + ox + r, y + oy);
            p.arc(x + ox, y + oy, r, 0, 6.2832);
          }
        }
        p.fill();
      };
      p.globalCompositeOperation = 'source-over';
      p.fillStyle = PAPER; p.fillRect(0, 0, W, H);
      p.globalAlpha = .9; p.fillStyle = PINK;
      plate(15, cell * 1.1, L => .62 * Math.sqrt(Math.max(0, 1 - L * 1.15)), 2 * dpr, 1.5 * dpr);
      p.globalAlpha = 1; p.globalCompositeOperation = 'multiply'; p.fillStyle = INK;
      plate(45, cell, L => .74 * Math.max(0, 1 - L), 0, 0);
      p.globalCompositeOperation = 'source-over';
    }

    // A hand-drawn loop: one lap and a bit, wobbling, overshooting its start.
    function loop() {
      if (!ring0) return [];
      const pts = [], n = 120, cx = map.x + ring0.cx * map.w, cy = map.y + ring0.cy * map.h;
      const rx = ring0.rx * map.w, ry = ring0.ry * map.h, ct = Math.cos(ring0.tilt), st = Math.sin(ring0.tilt);
      for (let i = 0; i <= n; i++) {
        const t = i / n, a = -2.5 + t * 7.35;
        const wob = 1 + .045 * Math.sin(t * 11 + 1) + .03 * Math.sin(t * 23) + .09 * t * t;
        const x = rx * wob * (1 + .07 * Math.sin(a)) * Math.cos(a), y = ry * wob * (1 - .06 * Math.cos(a * 2)) * Math.sin(a);
        pts.push([cx + x * ct - y * st, cy + x * st + y * ct]);
      }
      return pts;
    }

    function fillKeep(upto) {
      const k = keep.getContext('2d');
      k.clearRect(0, 0, W, H);
      if (upto < 2) return;
      // colour floods in behind the pen: a wedge from the centre to each drawn point
      k.fillStyle = '#000';
      k.beginPath(); k.moveTo(map.x + ring0.cx * map.w, map.y + ring0.cy * map.h);
      for (let i = 0; i < Math.min(upto, ring.length); i++) k.lineTo(ring[i][0], ring[i][1]);
      k.closePath(); k.fill();
    }

    function spray(x, y, r) {
      const t = trail.getContext('2d');
      const g = t.createRadialGradient(x, y, 0, x, y, r);
      g.addColorStop(0, 'rgba(0,0,0,1)'); g.addColorStop(.55, 'rgba(0,0,0,.9)'); g.addColorStop(1, 'rgba(0,0,0,0)');
      t.fillStyle = g; t.beginPath(); t.arc(x, y, r, 0, 6.2832); t.fill();
      t.fillStyle = '#000';
      for (let i = 0; i < 14; i++) {   // overspray
        const a = Math.random() * 6.2832, d = r * (.7 + Math.random() * .6), s = (.6 + Math.random() * 1.6) * dpr;
        t.fillRect(x + Math.cos(a) * d, y + Math.sin(a) * d, s, s);
      }
    }

    function paint() {
      ctx.globalCompositeOperation = 'source-over';
      ctx.clearRect(0, 0, W, H);
      ctx.drawImage(paper, 0, 0);
      ctx.globalCompositeOperation = 'destination-out';
      if (ring.length) ctx.drawImage(keep, 0, 0);
      ctx.drawImage(trail, 0, 0);
      ctx.globalCompositeOperation = 'source-over';
      const n = Math.min(drawn, ring.length);
      if (n > 1) {
        ctx.lineCap = ctx.lineJoin = 'round';
        ctx.strokeStyle = PINK;
        [[7, 1, 0], [3, .55, 3]].forEach(([w, a, off]) => {
          ctx.lineWidth = w * dpr; ctx.globalAlpha = a;
          ctx.beginPath();
          for (let i = 0; i < n; i++) {
            const [x, y] = ring[i];
            const o = off * dpr * Math.sin(i / 7);
            i ? ctx.lineTo(x + o, y - o) : ctx.moveTo(x + o, y - o);
          }
          ctx.stroke();
        });
        ctx.globalAlpha = 1;
      }
    }

    function tick() {
      raf = 0;
      if (drawn < ring.length) { drawn = Math.min(ring.length, drawn + (reduce ? ring.length : 2.4)); fillKeep(Math.floor(drawn)); }
      const t = trail.getContext('2d');
      if (idle > 0 && !reduce) {
        t.globalCompositeOperation = 'destination-out';
        t.fillStyle = `rgba(0,0,0,${fine ? .06 : .035})`;
        t.fillRect(0, 0, W, H);
        t.globalCompositeOperation = 'source-over';
        if (--idle === 0) t.clearRect(0, 0, W, H);
      }
      paint();
      if (drawn < ring.length || idle > 0) raf = requestAnimationFrame(tick);
    }
    const wake = () => { if (!raf) raf = requestAnimationFrame(tick); };

    function build() {
      if (!img.naturalWidth) return;
      dpr = Math.min(window.devicePixelRatio || 1, 2);
      W = Math.round(pic.clientWidth * dpr); H = Math.round(pic.clientHeight * dpr);
      if (!W || !H) return;
      [view, paper, keep, trail].forEach(c => { c.width = W; c.height = H; });
      map = fit(); ring = loop();
      halftone();
      if (ready) drawn = ring.length;
      if (ring.length) fillKeep(Math.floor(drawn));
      paint();
      host.classList.add('is-xerox');
      if (onReady) onReady(ring, W, dpr);
      if (!ready) {
        ready = true;
        // wait until the colour photo underneath can actually paint, so the
        // circle never opens onto an empty frame
        const painted = img.decode ? img.decode().catch(() => {}) : Promise.resolve();
        Promise.race([painted, new Promise(r => setTimeout(r, 2500))]).then(() => setTimeout(wake, reduce ? 0 : 700));
      }
    }

    // pointer: spray colour back into the photocopy
    let last = null;
    const at = e => { const b = view.getBoundingClientRect(); return [(e.clientX - b.left) / b.width * W, (e.clientY - b.top) / b.height * H]; };
    const stroke = e => {
      // the canvas is hidden when the window narrows to a phone layout
      if (!ready || !view.offsetWidth || !view.offsetHeight) return;
      const [x, y] = at(e), r = (fine ? 62 : 54) * dpr;
      if (last) {
        const d = Math.hypot(x - last[0], y - last[1]), steps = Math.ceil(d / (r * .3));
        for (let i = 1; i <= steps; i++) spray(last[0] + (x - last[0]) * i / steps, last[1] + (y - last[1]) * i / steps, r);
      } else spray(x, y, r);
      last = [x, y]; idle = fine ? 70 : 150; wake();
    };
    host.addEventListener('pointermove', e => { if (fine || e.pressure > 0) stroke(e); });
    host.addEventListener('pointerdown', e => { last = null; stroke(e); });
    ['pointerleave', 'pointerup', 'pointercancel'].forEach(t => host.addEventListener(t, () => { last = null; }));

    const start = () => { if (img.complete && img.naturalWidth) build(); else img.addEventListener('load', build, { once: true }); };
    let rt = 0;
    new ResizeObserver(() => { if (ready) { clearTimeout(rt); rt = setTimeout(build, 120); } }).observe(pic);
    // build when it is about to be seen
    if ('IntersectionObserver' in window) {
      const io = new IntersectionObserver(([e]) => { if (e.isIntersecting) { io.disconnect(); if (img.loading === 'lazy') img.loading = 'eager'; start(); } }, { rootMargin: '600px 0px' });
      io.observe(host);
    } else start();
  }

  // Desktop with a cursor only; phones and tablets keep the photographs in colour.
  const desk = matchMedia('(min-width: 1025px) and (hover: hover) and (pointer: fine)');
  let copied = false;
  const copy = () => {
    if (copied || !desk.matches || !document.createElement('canvas').getContext) return;
    copied = true;
    const cover = document.querySelector('.e-cover-photo');
    if (cover) photocopy(cover, { cx: .64, cy: .335, rx: .3, ry: .112, tilt: -.06 }, (ring, W, dpr) => {
      const xs = ring.map(p => p[0]);
      cover.style.setProperty('--ring-r', (W - Math.max(...xs)) / dpr + 'px');
    });
    const close = document.querySelector('.e-close');
    if (close) photocopy(close, null);
  };
  copy();
  if (desk.addEventListener) desk.addEventListener('change', copy);

  /* ---------- 2. the GET dock ---------- */
  const dock = document.querySelector('.e-dock');
  const coverGet = document.querySelector('.e-cover .e-get');
  const close = document.querySelector('.e-close');
  if (dock && coverGet && close && 'IntersectionObserver' in window) {
    let pastCover = false, atClose = false;
    const set = () => dock.classList.toggle('on', pastCover && !atClose);
    new IntersectionObserver(([e]) => { pastCover = !e.isIntersecting && e.boundingClientRect.top < 0; set(); }).observe(coverGet);
    new IntersectionObserver(([e]) => { atClose = e.isIntersecting; set(); }, { rootMargin: '0px 0px -20% 0px' }).observe(close);
  }

  /* ---------- 3. save: tap a polaroid to stamp it; the receipt rewrites itself ----------
     Every combination of the four reads as its own little story, so one more
     (or one fewer) thing changes what the whole collection is about. */
  const RECEIPT = {
    'link':                ['The piece you keep meaning to finish.', 'Sent at 2am. Reading it properly on Sunday.'],
    'place':               ['The café with the orange chairs.', 'Sit outside, even in December. Especially in December.'],
    'song':                ['MM..FOOD, front to back.', 'No skipping. It only makes sense as a whole.'],
    'book':                ['The Dieter Rams book.', 'Less, but better. Borrowed it twice, finally bought my own.'],
    'link+place':          ['Read this, then meet me here', 'Bring your take on the article. First round’s on me.'],
    'link+song':           ['Headphones on, tabs open', 'The essay reads better with this playing. Trust me.'],
    'link+book':           ['Before I start my own thing', 'The piece that made me want to. The book that shows me how.'],
    'place+song':          ['Sunday, nowhere to be', 'Window seat, one coffee, the whole album. No rush.'],
    'place+book':          ['Lunch for one, on purpose', 'Order slowly. A chapter between courses.'],
    'song+book':           ['Make something this weekend', 'Rams on the desk, DOOM on repeat. Less, but louder.'],
    'link+place+song':     ['A Saturday, in order', 'Read it on the bus. Find the café. Put the record on.'],
    'link+place+book':     ['A quiet day of good ideas', 'Coffee, a chapter, the essay everyone’s quoting. No soundtrack needed.'],
    'link+song+book':      ['Staying in, thinking big', 'Everything I need is already on this desk.'],
    'place+song+book':     ['A slow Sunday, done properly', 'The café first. The book after. The album all the way home.'],
    'link+place+song+book':['Me, lately', 'If you want to know who I am right now, start here.']
  };
  const KINDS = ['link', 'place', 'song', 'book'];
  const wrap = document.querySelector('.e-save .e-receipt-wrap');
  const receipt = wrap && wrap.querySelector('.e-receipt');
  const saved = new Set();
  const render = () => {
    if (!receipt) return;
    const label = receipt.querySelector('.e-label'), title = receipt.querySelector('strong'), note = receipt.querySelector('p:not(.e-label)');
    const key = KINDS.filter(k => saved.has(k)).join('+');
    if (!key) {
      label.textContent = 'Nothing saved yet';
      title.textContent = 'Tap what you’d keep.';
      note.textContent = '“It lands here, with a line on why it mattered.”';
    } else {
      const [t, n] = RECEIPT[key];
      label.textContent = saved.size === 1 ? '✓ Saved · a ' + key : '✓ New collection · ' + saved.size + ' things';
      title.textContent = t;
      note.textContent = '“' + n + '”';
    }
    wrap.classList.toggle('is-empty', !key);
    if (!reduce) { wrap.classList.remove('is-print'); void wrap.offsetWidth; wrap.classList.add('is-print'); }
  };
  if (receipt) receipt.setAttribute('aria-live', 'polite');
  document.querySelectorAll('.e-collage .e-snap').forEach(snap => {
    const what = (snap.querySelector('figcaption') || {}).textContent || 'this';
    snap.setAttribute('role', 'button');
    snap.setAttribute('tabindex', '0');
    snap.setAttribute('aria-pressed', 'false');
    snap.setAttribute('aria-label', 'Save ' + what);
    const stamp = document.createElement('span');
    stamp.className = 'e-snap-stamp';
    stamp.setAttribute('aria-hidden', 'true');
    stamp.textContent = 'Saved';
    snap.appendChild(stamp);
    const toggle = () => {
      const on = snap.classList.toggle('is-saved');
      snap.setAttribute('aria-pressed', String(on));
      if (snap.dataset.kind) { on ? saved.add(snap.dataset.kind) : saved.delete(snap.dataset.kind); render(); }
      if (on && !reduce) { snap.classList.remove('is-thunk'); void snap.offsetWidth; snap.classList.add('is-thunk'); }
      if (on && navigator.vibrate && navigator.userActivation && navigator.userActivation.isActive) navigator.vibrate(12);
    };
    snap.addEventListener('click', toggle);
    snap.addEventListener('keydown', e => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); toggle(); } });
  });

  /* ---------- 4. footer: slap a sticker anywhere on the wall ---------- */
  const wall = document.querySelector('.e-wall');
  if (wall) {
    const kinds = [['No ads', 'ink'], ['30 max', 'burst'], ['No likes', 'pink'], ['People, not popularity', 'yellow'], ['your taste, not your face', 'paper'], ['No public counts', 'pink'], ['Taste > clout', 'yellow'], ['Choose wisely', 'ink'], ['Pass it on', 'paper']];
    let n = 0;
    wall.addEventListener('click', e => {
      const b = wall.getBoundingClientRect();
      const [label, kind] = kinds[n++ % kinds.length];
      const s = document.createElement('span');
      s.className = 'e-sticky e-sticky--' + kind + ' is-new';
      s.textContent = label;
      s.style.cssText = `--x:${(e.clientX - b.left) / b.width * 100}%;--y:${(e.clientY - b.top) / b.height * 100}%;--r:${(Math.random() * 24 - 12).toFixed(1)}deg`;
      wall.appendChild(s);
      const all = wall.querySelectorAll('.e-sticky');
      if (all.length > 14) all[0].remove();
      if (navigator.vibrate && navigator.userActivation && navigator.userActivation.isActive) navigator.vibrate(10);
    });
  }

  /* ---------- 5. collections on a phone: a deck you flick through ---------- */
  const fan = document.querySelector('.e-fan');
  const deck = matchMedia('(max-width: 1024px)');
  if (fan) {
    const cards = [...fan.querySelectorAll('.e-snap')];
    let order = [cards[1], cards[2], cards[0]];   // the pinned polaroid starts on top
    const place = () => order.forEach((card, i) => {
      card.dataset.pos = i;
      if (deck.matches) {
        card.setAttribute('role', 'button');
        card.setAttribute('aria-label', 'Next photo: ' + (card.querySelector('figcaption') || {}).textContent);
        card.tabIndex = i === 0 ? 0 : -1;
      } else {
        card.removeAttribute('role'); card.removeAttribute('aria-label'); card.removeAttribute('tabindex');
      }
    });
    const next = dir => {
      const top = order[0];
      top.style.setProperty('--out', dir);
      top.classList.add('is-out');
      setTimeout(() => {
        top.classList.remove('is-out');
        top.style.setProperty('--dx', '0px'); top.style.setProperty('--tilt', '0deg');
        order.push(order.shift()); place();
        if (document.activeElement === top) order[0].focus();
      }, reduce ? 0 : 240);
    };
    let drag = null;
    fan.addEventListener('pointerdown', e => {
      if (!deck.matches || !order[0].contains(e.target)) return;
      drag = { x: e.clientX, id: e.pointerId, dx: 0, moved: false };
      order[0].classList.add('is-drag');
      try { fan.setPointerCapture(e.pointerId); } catch (_) {}
    });
    fan.addEventListener('dragstart', e => e.preventDefault());
    fan.addEventListener('pointermove', e => {
      if (!drag || e.pointerId !== drag.id) return;
      drag.dx = e.clientX - drag.x;
      if (Math.abs(drag.dx) > 6) drag.moved = true;
      order[0].style.setProperty('--dx', drag.dx + 'px');
      order[0].style.setProperty('--tilt', drag.dx / 18 + 'deg');
    });
    const release = cancelled => {
      if (!drag) return;
      const { dx, moved } = drag; drag = null;
      order[0].classList.remove('is-drag');
      if (!cancelled && (!moved || Math.abs(dx) > 60)) next(dx < 0 ? -1 : 1);
      else { order[0].style.setProperty('--dx', '0px'); order[0].style.setProperty('--tilt', '0deg'); }
    };
    fan.addEventListener('pointerup', () => release(false));
    fan.addEventListener('pointercancel', () => release(true));
    fan.addEventListener('keydown', e => {
      if (deck.matches && (e.key === 'Enter' || e.key === ' ') && e.target === order[0]) { e.preventDefault(); next(1); }
    });
    place();
    if (deck.addEventListener) deck.addEventListener('change', place);
  }

  /* ---------- 6. demo steps on a phone: keep the active step in view ---------- */
  const steps = document.querySelector('.e-demo .steps');
  if (steps && 'MutationObserver' in window) {
    new MutationObserver(() => {
      const on = steps.querySelector('.step.active');
      if (!on || steps.scrollWidth <= steps.clientWidth) return;
      const left = steps.scrollLeft + on.getBoundingClientRect().left - steps.getBoundingClientRect().left - 20;
      steps.scrollTo({ left, behavior: reduce ? 'auto' : 'smooth' });
    }).observe(steps, { subtree: true, attributes: true, attributeFilter: ['class'] });
    // fade the edge that still has more steps behind it
    const edge = () => steps.classList.toggle('at-end', steps.scrollLeft + steps.clientWidth >= steps.scrollWidth - 4);
    steps.addEventListener('scroll', edge, { passive: true });
    edge();
  }

  /* ---------- 7. pass it on: the phone's own share sheet ---------- */
  const share = document.querySelector('.e-share');
  if (share && navigator.share) {
    share.hidden = false;
    share.addEventListener('click', () => {
      const url = (document.querySelector('link[rel=canonical]') || {}).href || location.href;
      navigator.share({ title: 'Circle', text: 'Circle — a home for your taste. Save what shapes you, find what’s next.', url }).catch(() => {});
    });
  }
})();
