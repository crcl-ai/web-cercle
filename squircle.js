/* Apple-style continuous corners.
   CSS draws rounded corners as plain circular arcs. iOS eases the curve out of
   the straight edge instead, which is what makes its cards feel machined. This
   clips every rounded element on the page to that curve (Figma's corner
   smoothing construction at 60%, the iOS match) and redraws the element's
   border, inner rim or --edge hairline along the same path so it stays crisp.
   Without JavaScript the page keeps its ordinary rounded corners. */
(() => {
  if (!window.ResizeObserver || !CSS.supports('clip-path', 'path("M0 0")')) return;

  const SMOOTHING = 0.6;
  const MIN_RADIUS = 6;
  const SVG = 'http://www.w3.org/2000/svg';
  const rad = deg => deg * Math.PI / 180;
  const n = v => +v.toFixed(3);

  function corner(r, budget) {
    r = Math.min(r, budget);
    if (r <= 0) return { r: 0, p: 0, a: 0, b: 0, c: 0, d: 0, arc: 0 };
    const s = Math.max(0, Math.min(SMOOTHING, budget / r - 1));
    const p = Math.min((1 + SMOOTHING) * r, budget);
    const arcMeasure = 90 * (1 - s);
    const arc = Math.sin(rad(arcMeasure / 2)) * r * Math.SQRT2;
    const c = r * Math.tan(rad((90 - arcMeasure) / 4)) * Math.cos(rad(45 * s));
    const d = c * Math.tan(rad(45 * s));
    const b = (p - arc - c - d) / 3;
    return { r, p, a: 2 * b, b, c, d, arc };
  }

  function squircle(x, y, w, h, radius) {
    const { r, p, a, b, c, d, arc } = corner(radius, Math.min(w, h) / 2);
    const ab = a + b, bc = b + c, abc = a + b + c;
    return [
      `M${n(x + w - p)} ${n(y)}`,
      `c${n(a)} 0 ${n(ab)} 0 ${n(abc)} ${n(d)}a${n(r)} ${n(r)} 0 0 1 ${n(arc)} ${n(arc)}c${n(d)} ${n(c)} ${n(d)} ${n(bc)} ${n(d)} ${n(abc)}`,
      `L${n(x + w)} ${n(y + h - p)}`,
      `c0 ${n(a)} 0 ${n(ab)} ${n(-d)} ${n(abc)}a${n(r)} ${n(r)} 0 0 1 ${n(-arc)} ${n(arc)}c${n(-c)} ${n(d)} ${n(-bc)} ${n(d)} ${n(-abc)} ${n(d)}`,
      `L${n(x + p)} ${n(y + h)}`,
      `c${n(-a)} 0 ${n(-ab)} 0 ${n(-abc)} ${n(-d)}a${n(r)} ${n(r)} 0 0 1 ${n(-arc)} ${n(-arc)}c${n(-d)} ${n(-c)} ${n(-d)} ${n(-bc)} ${n(-d)} ${n(-abc)}`,
      `L${n(x)} ${n(y + p)}`,
      `c0 ${n(-a)} 0 ${n(-ab)} ${n(d)} ${n(-abc)}a${n(r)} ${n(r)} 0 0 1 ${n(arc)} ${n(-arc)}c${n(c)} ${n(-d)} ${n(bc)} ${n(-d)} ${n(abc)} ${n(-d)}`,
      'Z'
    ].join('');
  }

  function parseShadows(value) {
    if (!value || value === 'none') return [];
    return value.split(/,(?![^(]*\))/).map(raw => {
      const color = (raw.match(/rgba?\([^)]*\)|#[\da-f]+/i) || ['transparent'])[0];
      const [x = 0, y = 0, blur = 0, spread = 0] = (raw.replace(color, '').match(/-?[\d.]+px/g) || []).map(parseFloat);
      return { raw: raw.trim(), color, x, y, blur, spread, inset: /\binset\b/.test(raw) };
    });
  }

  const sides = ['Top', 'Right', 'Bottom', 'Left'];
  const same = (cs, prop) => sides.every(s => cs[prop.replace('*', s)] === cs[prop.replace('*', 'Top')]);
  const radii = ['borderTopRightRadius', 'borderBottomRightRadius', 'borderBottomLeftRadius'];
  const roundedEvenly = cs => radii.every(p => cs[p] === cs.borderTopLeftRadius);
  const items = new Map();

  // Runs once, the first time the element has a size, so hidden demo screens
  // are handled when they appear.
  function setup(el, w, h) {
    const cs = getComputedStyle(el);
    const radius = parseFloat(cs.borderTopLeftRadius);
    if (radius >= Math.min(w, h) / 2 - 0.5) return null; // pills stay true capsules

    const strokes = [];
    const shadows = parseShadows(cs.boxShadow);
    const outer = shadows.filter(s => !s.inset);
    // clip-path would cut off an outer shadow, so a shadowed card is painted
    // instead: its fill is drawn on the curve behind its content and the shadow
    // becomes a drop-shadow, which follows the painted shape.
    const paint = outer.length > 0;
    if (paint && cs.backgroundImage !== 'none') return null;

    // A border becomes padding plus a stroke on the curve.
    const bw = parseFloat(cs.borderTopWidth);
    if (bw > 0 && cs.borderTopStyle !== 'none' && same(cs, 'border*Width') && same(cs, 'border*Color')) {
      strokes.push({ inset: 0, width: bw, color: cs.borderTopColor });
      el.style.padding = sides.map(s => `${parseFloat(cs['padding' + s]) + bw}px`).join(' ');
      el.style.borderWidth = '0';
    }
    // A crisp inset ring (inset 0 0 0 Npx) becomes a stroke just inside the border.
    const ring = shadows.find(s => s.inset && !s.x && !s.y && !s.blur && s.spread > 0);
    if (ring) strokes.unshift({ inset: strokes.length ? bw : 0, width: ring.spread, color: ring.color });
    // --edge declares a hairline drawn over the content, as in the app.
    const edge = cs.getPropertyValue('--edge').trim();
    const parentEdge = el.parentElement ? getComputedStyle(el.parentElement).getPropertyValue('--edge').trim() : '';
    if (edge && edge !== parentEdge) {
      strokes.push({ inset: 0, width: 0.5, color: edge });
      el.dataset.sqEdge = '';
    }

    if (ring || paint) {
      el.style.boxShadow = shadows.filter(s => s !== ring && s.inset).map(s => s.raw).join(', ') || 'none';
    }
    if (paint) {
      const drops = outer.map(s => `drop-shadow(${s.x}px ${s.y}px ${s.blur / 2}px ${s.color})`);
      el.style.filter = (cs.filter === 'none' ? drops : [cs.filter, ...drops]).join(' ');
      el.style.isolation = 'isolate';
    }

    let paths = [];
    let fill = null;
    if (strokes.length || paint) {
      if (cs.position === 'static') el.style.position = 'relative';
      const svg = document.createElementNS(SVG, 'svg');
      svg.setAttribute('aria-hidden', 'true');
      svg.setAttribute('class', 'sq-line');
      svg.style.cssText = `position:absolute;inset:0;width:100%;height:100%;overflow:visible;pointer-events:none;z-index:${paint ? -1 : 10}`;
      if (paint) {
        fill = document.createElementNS(SVG, 'path');
        fill.style.cssText = `fill:${cs.backgroundColor};stroke:none`;
        svg.append(fill);
        el.style.backgroundColor = 'transparent';
      }
      paths = strokes.map(s => {
        const path = document.createElementNS(SVG, 'path');
        // Clipped elements draw the stroke twice as wide: the outer half falls
        // outside the clip, leaving it inside the edge like SwiftUI's strokeBorder.
        path.style.cssText = `fill:none;stroke:${s.color};stroke-width:${paint ? s.width : s.width * 2}px`;
        svg.append(path);
        return path;
      });
      if (paint) el.prepend(svg);
      else el.append(svg);
    }
    return { strokes, paths, fill, paint };
  }

  function update(el, w, h) {
    if (!w || !h) return;
    let item = items.get(el);
    if (item === undefined) {
      item = setup(el, w, h);
      items.set(el, item);
    }
    if (!item) return;
    const radius = parseFloat(getComputedStyle(el).borderTopLeftRadius);
    const outline = squircle(0, 0, w, h, radius);
    if (item.paint) item.fill.setAttribute('d', outline);
    else el.style.clipPath = `path('${outline}')`;
    item.paths.forEach((path, i) => {
      const s = item.strokes[i];
      const inset = item.paint ? s.inset + s.width / 2 : s.inset;
      path.setAttribute('d', squircle(inset, inset, w - inset * 2, h - inset * 2, Math.max(0, radius - inset)));
    });
  }

  const observer = new ResizeObserver(entries => {
    for (const entry of entries) {
      const box = entry.borderBoxSize && entry.borderBoxSize[0];
      update(entry.target, box ? box.inlineSize : entry.target.offsetWidth, box ? box.blockSize : entry.target.offsetHeight);
    }
  });

  for (const el of document.body.querySelectorAll('*')) {
    if (el instanceof SVGElement) continue;
    const cs = getComputedStyle(el);
    if (cs.display === 'inline' || cs.borderTopLeftRadius.includes('%')) continue;
    if (parseFloat(cs.borderTopLeftRadius) < MIN_RADIUS || !roundedEvenly(cs)) continue;
    observer.observe(el);
  }
})();
