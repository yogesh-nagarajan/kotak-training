/**
 * Security & Trust block
 *
 * Two-column block: text content on the left, an animated Kotak "8‖" mark on
 * the right. The mark is an inline SVG (built in the DOM — no .svg file is
 * shipped or deployed) driven by a small JS animation loop that reproduces the
 * reference motion exactly: two large outlined circles and their inner circles
 * converge to the centre while two slanted bars morph into a central vertical
 * form, hold, then reverse — on a 9s seamless loop.
 *
 * Expected initial content structure (rows):
 *   1. Content .... a single cell with a heading and description paragraph(s).
 *
 * @param {Element} block The security-trust block element
 */

const SVG_NS = 'http://www.w3.org/2000/svg';

// keyframe geometry — index 0 = initial state, index 1 = central state
const STATE = {
  bigCircle1: { from: [55, 70], to: [70, 120] },
  bigCircle2: { from: [55, 170], to: [160, 120] },
  smallCircle1: { from: [55, 70], to: [70, 120], r: [0.5, 15] },
  smallCircle2: { from: [55, 170], to: [160, 120], r: [0.5, 15] },
  bar1: {
    from: [162, 20, 206, 20, 149, 220, 105, 220],
    to: [95, 20, 138, 20, 138, 220, 95, 220],
  },
  bar2: {
    from: [219, 20, 263, 20, 206, 220, 162, 220],
    to: [95, 20, 138, 20, 138, 220, 95, 220],
  },
};

// cubic-bezier(0.3, 0, 0.1, 1) solver — maps linear time fraction to eased value
function cubicBezier(p1x, p1y, p2x, p2y) {
  const cx = 3 * p1x;
  const bx = 3 * (p2x - p1x) - cx;
  const ax = 1 - cx - bx;
  const cy = 3 * p1y;
  const by = 3 * (p2y - p1y) - cy;
  const ay = 1 - cy - by;
  const sampleX = (t) => ((ax * t + bx) * t + cx) * t;
  const sampleY = (t) => ((ay * t + by) * t + cy) * t;
  const sampleDX = (t) => (3 * ax * t + 2 * bx) * t + cx;
  const solveX = (x) => {
    let t = x;
    for (let i = 0; i < 8; i += 1) {
      const xe = sampleX(t) - x;
      if (Math.abs(xe) < 1e-6) return t;
      const d = sampleDX(t);
      if (Math.abs(d) < 1e-6) break;
      t -= xe / d;
    }
    return t;
  };
  return (x) => sampleY(solveX(x));
}

const ease = cubicBezier(0.3, 0, 0.1, 1);
const lerp = (a, b, p) => a + (b - a) * p;

// 9s timeline: hold, converge (eased), hold centre, return (eased), hold
// returns morph progress p where 0 = initial, 1 = central
function progressAt(ms) {
  const t = ms / 1000;
  if (t < 0.5) return 0; // initial hold
  if (t < 3) return ease((t - 0.5) / 2.5); // converge 0 -> 1
  if (t < 4) return 1; // centre hold
  if (t < 8.5) return 1 - ease((t - 4) / 4.5); // return 1 -> 0
  return 0; // final hold
}

function pointsAt(bar, p) {
  return bar.from.map((v, i) => lerp(v, bar.to[i], p).toFixed(2)).join(' ');
}

function el(name, attrs) {
  const node = document.createElementNS(SVG_NS, name);
  Object.entries(attrs).forEach(([k, v]) => node.setAttribute(k, v));
  return node;
}

export default function decorate(block) {
  const rows = [...block.children];

  // gather all authored text into the left column
  const content = document.createElement('div');
  content.className = 'security-trust-content';
  rows.forEach((row) => {
    [...row.children].forEach((cell) => {
      while (cell.firstElementChild) content.append(cell.firstElementChild);
    });
    row.remove();
  });

  // right column — animated inline SVG mark (no file)
  const visual = document.createElement('div');
  visual.className = 'security-trust-visual';
  visual.setAttribute('aria-hidden', 'true');

  const svg = el('svg', {
    class: 'security-trust-mark',
    viewBox: '0 0 270 240',
    preserveAspectRatio: 'xMidYMid meet',
    role: 'img',
  });
  const stroke = {
    fill: 'none', stroke: '#263943', 'stroke-width': '2', 'stroke-linejoin': 'round', 'stroke-linecap': 'round',
  };

  const big1 = el('circle', {
    ...stroke, cx: 55, cy: 70, r: 50,
  });
  const big2 = el('circle', {
    ...stroke, cx: 55, cy: 170, r: 50,
  });
  const small1 = el('circle', {
    ...stroke, cx: 55, cy: 70, r: 0.5,
  });
  const small2 = el('circle', {
    ...stroke, cx: 55, cy: 170, r: 0.5,
  });
  const bar1 = el('polygon', { ...stroke, points: pointsAt(STATE.bar1, 0) });
  const bar2 = el('polygon', { ...stroke, points: pointsAt(STATE.bar2, 0) });

  svg.append(big1, big2, bar1, bar2, small1, small2);
  visual.append(svg);
  block.append(content, visual);

  const apply = (p) => {
    big1.setAttribute('cx', lerp(STATE.bigCircle1.from[0], STATE.bigCircle1.to[0], p).toFixed(2));
    big1.setAttribute('cy', lerp(STATE.bigCircle1.from[1], STATE.bigCircle1.to[1], p).toFixed(2));
    big2.setAttribute('cx', lerp(STATE.bigCircle2.from[0], STATE.bigCircle2.to[0], p).toFixed(2));
    big2.setAttribute('cy', lerp(STATE.bigCircle2.from[1], STATE.bigCircle2.to[1], p).toFixed(2));
    small1.setAttribute('cx', lerp(STATE.smallCircle1.from[0], STATE.smallCircle1.to[0], p).toFixed(2));
    small1.setAttribute('cy', lerp(STATE.smallCircle1.from[1], STATE.smallCircle1.to[1], p).toFixed(2));
    small1.setAttribute('r', lerp(STATE.smallCircle1.r[0], STATE.smallCircle1.r[1], p).toFixed(2));
    small2.setAttribute('cx', lerp(STATE.smallCircle2.from[0], STATE.smallCircle2.to[0], p).toFixed(2));
    small2.setAttribute('cy', lerp(STATE.smallCircle2.from[1], STATE.smallCircle2.to[1], p).toFixed(2));
    small2.setAttribute('r', lerp(STATE.smallCircle2.r[0], STATE.smallCircle2.r[1], p).toFixed(2));
    bar1.setAttribute('points', pointsAt(STATE.bar1, p));
    bar2.setAttribute('points', pointsAt(STATE.bar2, p));
  };

  // respect reduced-motion: render the initial composition statically
  const reduce = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  if (reduce) {
    apply(0);
    return;
  }

  let start = null;
  const frame = (now) => {
    if (start === null) start = now;
    apply(progressAt((now - start) % 9000));
    requestAnimationFrame(frame);
  };
  requestAnimationFrame(frame);
}
