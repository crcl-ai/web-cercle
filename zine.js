/* Circle — the zine layer.
   1. The cover photo is a two-plate photocopy (pink + black halftone). A marker
      circle brings what's inside it back to colour, and a finger or cursor
      sprays more colour wherever it goes.
   2. A GET bar that waits at the bottom of small screens once the cover's own
      GET has scrolled away.
   Without JavaScript the cover stays a colour photograph and the bar never shows. */
(() => {
  const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;
  const fine = matchMedia('(hover: hover) and (pointer: fine)').matches;

  /* ---------- 1. photocopy cover ---------- */
  const fig = document.querySelector('.e-cover-photo');
  const img = fig && fig.querySelector('img');
  const ok = fig && img && document.createElement('canvas').getContext;
  if (ok) {
    const view = document.createElement('canvas');
    view.className = 'e-xerox';
    view.setAttribute('aria-hidden', 'true');
    fig.querySelector('picture').after(view);
    const ctx = view.getContext('2d');
    const paper = document.createElement('canvas');   // the photocopy
    const keep = document.createElement('canvas');    // colour that stays (the circle)
    const trail = document.createElement('canvas');   // colour that fades (your marks)
    const PINK = '#ff7acd', INK = '#111', PAPER = '#efece4';
    // The circle is placed in the photo's own coordinates (fractions of the
    // image) so it stays on the sunglasses however the crop changes.
    const RING = { cx: .64, cy: .335, rx: .3, ry: .112, tilt: -.06 };
    let W = 0, H = 0, dpr = 1, map = null, ring = [], drawn = 0, raf = 0, idle = 0, ready = false;

    const fit = () => {
      const iw = img.naturalWidth, ih = img.naturalHeight;
      const s = Math.max(W / iw, H / ih), dw = iw * s, dh = ih * s;
      return { x: (W - dw) * .5, y: (H - dh) * .28, w: dw, h: dh };
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
      const pts = [], n = 120, cx = map.x + RING.cx * map.w, cy = map.y + RING.cy * map.h;
      const rx = RING.rx * map.w, ry = RING.ry * map.h;
      for (let i = 0; i <= n; i++) {
        const t = i / n, a = -2.5 + t * 7.35;
        const wob = 1 + .045 * Math.sin(t * 11 + 1) + .03 * Math.sin(t * 23) + .09 * t * t;
        const x = rx * wob * (1 + .07 * Math.sin(a)) * Math.cos(a), y = ry * wob * (1 - .06 * Math.cos(a * 2)) * Math.sin(a);
        pts.push([cx + x * Math.cos(RING.tilt) - y * Math.sin(RING.tilt), cy + x * Math.sin(RING.tilt) + y * Math.cos(RING.tilt)]);
      }
      return pts;
    }

    function fillKeep(upto) {
      const k = keep.getContext('2d');
      k.clearRect(0, 0, W, H);
      if (upto < 2) return;
      // colour floods in behind the pen: a wedge from the centre to each drawn point
      const cx = map.x + RING.cx * map.w, cy = map.y + RING.cy * map.h;
      k.fillStyle = '#000';
      k.beginPath(); k.moveTo(cx, cy);
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
      ctx.drawImage(keep, 0, 0);
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
      W = Math.round(fig.clientWidth * dpr); H = Math.round(fig.clientHeight * dpr);
      if (!W || !H) return;
      [view, paper, keep, trail].forEach(c => { c.width = W; c.height = H; });
      map = fit(); ring = loop();
      const xs = ring.map(p => p[0]), ys = ring.map(p => p[1]);
      fig.style.setProperty('--ring-l', Math.min(...xs) / dpr + 'px');
      fig.style.setProperty('--ring-r', (W - Math.max(...xs)) / dpr + 'px');
      fig.style.setProperty('--ring-b', Math.max(...ys) / dpr + 'px');
      halftone();
      if (ready) drawn = ring.length;
      fillKeep(Math.floor(drawn));
      paint();
      fig.classList.add('is-xerox');
      if (!ready) { ready = true; setTimeout(wake, reduce ? 0 : 900); }
    }

    // pointer: spray colour back into the photocopy
    let last = null;
    const at = e => { const b = view.getBoundingClientRect(); return [(e.clientX - b.left) / b.width * W, (e.clientY - b.top) / b.height * H]; };
    const stroke = e => {
      if (!ready) return;
      const [x, y] = at(e), r = (fine ? 62 : 54) * dpr;
      if (last) {
        const d = Math.hypot(x - last[0], y - last[1]), steps = Math.ceil(d / (r * .3));
        for (let i = 1; i <= steps; i++) spray(last[0] + (x - last[0]) * i / steps, last[1] + (y - last[1]) * i / steps, r);
      } else spray(x, y, r);
      last = [x, y]; idle = fine ? 70 : 150; wake();
    };
    fig.addEventListener('pointermove', e => { if (fine || e.pressure > 0) stroke(e); });
    fig.addEventListener('pointerdown', e => { last = null; stroke(e); });
    ['pointerleave', 'pointerup', 'pointercancel'].forEach(t => fig.addEventListener(t, () => { last = null; }));

    if (img.complete && img.naturalWidth) build(); else img.addEventListener('load', build, { once: true });
    let rt = 0;
    new ResizeObserver(() => { clearTimeout(rt); rt = setTimeout(build, 120); }).observe(fig);
  }

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
})();
