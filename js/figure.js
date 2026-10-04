// Animeret streg-figur. En stilling (pose) beskrives med absolutte vinkler i grader:
// 0 = peger mod højre, 90 = op, 180 = mod venstre, -90 = ned.
// Hver øvelse har en række stillinger, som figuren bevæger sig frem og tilbage imellem.

const L = { torso: 50, neck: 8, headR: 9, upper: 24, fore: 22, thigh: 30, shin: 30 };
const FLOOR = 170;
const NS = 'http://www.w3.org/2000/svg';

const rad = (a) => (a * Math.PI) / 180;
const step = ([x, y], a, len) => [x + len * Math.cos(rad(a)), y - len * Math.sin(rad(a))];
const lerp = (a, b, t) => a + (b - a) * t;
const ease = (t) => (t < 0.5 ? 2 * t * t : 1 - Math.pow(-2 * t + 2, 2) / 2);

function lerpPose(a, b, t) {
  const out = {};
  for (const k of Object.keys(a)) {
    const va = a[k];
    const vb = b[k] ?? va;
    if (Array.isArray(va)) out[k] = va.map((v, i) => lerp(v, vb[i], t));
    else if (typeof va === 'number') out[k] = lerp(va, vb, t);
    else out[k] = va;
  }
  return out;
}

function solve(p) {
  const hip = p.hip;
  const sh = step(hip, p.torso, L.torso);
  const head = step(sh, p.head, L.neck + L.headR);
  const limb = (base, [a1, a2], l1, l2, k = 1) => {
    const j = step(base, a1, l1 * k);
    return [base, j, step(j, a2, l2 * k)];
  };
  return {
    hip, sh, head,
    nArm: limb(sh, p.nArm, L.upper, L.fore, p.nArmK ?? 1),
    fArm: limb(sh, p.fArm, L.upper, L.fore, p.fArmK ?? 1),
    nLeg: limb(hip, p.nLeg, L.thigh, L.shin),
    fLeg: limb(hip, p.fLeg, L.thigh, L.shin),
    belly: p.belly ?? 0,
  };
}

const el = (name, attrs) => {
  const e = document.createElementNS(NS, name);
  for (const [k, v] of Object.entries(attrs)) e.setAttribute(k, v);
  return e;
};
const pts = (arr) => arr.map((q) => q.map((n) => n.toFixed(1)).join(',')).join(' ');

export function createFigure(container, anim, { small = false, frame = null } = {}) {
  const svg = el('svg', { viewBox: '0 0 240 190', class: 'figure' + (small ? ' figure--small' : ''), role: 'img' });
  svg.setAttribute('aria-label', 'Animation af øvelsen');
  const g = {
    floor: el('line', { x1: 8, y1: FLOOR, x2: 232, y2: FLOOR, class: 'fig-floor' }),
    props: el('g', {}),
    fArm: el('polyline', { class: 'fig-limb fig-far' }),
    fLeg: el('polyline', { class: 'fig-limb fig-far' }),
    torso: el('line', { class: 'fig-torso' }),
    neck: el('line', { class: 'fig-limb fig-near' }),
    head: el('circle', { r: L.headR, class: 'fig-head' }),
    belly: el('circle', { class: 'fig-belly' }),
    nLeg: el('polyline', { class: 'fig-limb fig-near' }),
    nArm: el('polyline', { class: 'fig-limb fig-near' }),
    front: el('g', {}),
  };
  for (const k of ['floor', 'props', 'fArm', 'fLeg', 'torso', 'neck', 'head', 'belly', 'nLeg', 'nArm', 'front']) svg.appendChild(g[k]);
  container.appendChild(svg);

  // Beskær højden til figuren, så liggende øvelser ikke får en masse tom luft
  let top = FLOOR;
  for (const f of anim.frames) {
    const q = solve(f);
    const ys = [q.head[1] - L.headR, q.sh[1], q.hip[1], ...['nArm', 'fArm', 'nLeg', 'fLeg'].flatMap((k) => q[k].map((pt) => pt[1]))];
    top = Math.min(top, ...ys);
  }
  for (const pr of anim.props || []) if (pr.type === 'box') top = Math.min(top, pr.y);
  const height = Math.max(105, FLOOR + 10 - (top - 12));
  svg.setAttribute('viewBox', `0 ${FLOOR + 10 - height} 240 ${height}`);

  const props = anim.props || [];
  // Faste rekvisitter (kasse) tegnes én gang
  for (const pr of props) {
    if (pr.type === 'box') g.props.appendChild(el('rect', { x: pr.x, y: pr.y, width: pr.w, height: pr.h, rx: 3, class: 'fig-prop' }));
  }
  const dyn = props.filter((p) => p.type !== 'box').map((pr) => {
    const node = el('line', { class: pr.type === 'strap' ? 'fig-strap' : 'fig-stick' });
    (pr.type === 'strap' ? g.front : g.props).appendChild(node);
    return { pr, node };
  });

  function draw(p) {
    const s = solve(p);
    g.fArm.setAttribute('points', pts(s.fArm));
    g.fLeg.setAttribute('points', pts(s.fLeg));
    g.nArm.setAttribute('points', pts(s.nArm));
    g.nLeg.setAttribute('points', pts(s.nLeg));
    g.torso.setAttribute('x1', s.hip[0]); g.torso.setAttribute('y1', s.hip[1]);
    g.torso.setAttribute('x2', s.sh[0]); g.torso.setAttribute('y2', s.sh[1]);
    const neckEnd = step(s.sh, p.head, L.neck);
    g.neck.setAttribute('x1', s.sh[0]); g.neck.setAttribute('y1', s.sh[1]);
    g.neck.setAttribute('x2', neckEnd[0]); g.neck.setAttribute('y2', neckEnd[1]);
    g.head.setAttribute('cx', s.head[0]); g.head.setAttribute('cy', s.head[1]);
    const mid = [(s.hip[0] + s.sh[0]) / 2, (s.hip[1] + s.sh[1]) / 2];
    g.belly.setAttribute('cx', mid[0]); g.belly.setAttribute('cy', mid[1] - 2);
    g.belly.setAttribute('r', Math.max(0, s.belly));
    for (const { pr, node } of dyn) {
      let a, b;
      if (pr.type === 'strap') { a = s.nArm[2]; b = s.nLeg[2]; }
      else { // stok langs ryggen: fra baghoved til halebenet, forskudt bagud
        const off = (q) => step(q, p.torso + 90, 7);
        a = off(step(s.head, p.torso, 4)); b = off(step(s.hip, p.torso + 180, 8));
      }
      node.setAttribute('x1', a[0]); node.setAttribute('y1', a[1]);
      node.setAttribute('x2', b[0]); node.setAttribute('y2', b[1]);
    }
  }

  const frames = anim.frames;
  const move = anim.move ?? 1400;
  const hold = anim.hold ?? 600;
  // Rækkefølge frem og tilbage: 0,1,..,n-1,..,1
  const seq = frames.map((_, i) => i).concat(frames.map((_, i) => i).slice(1, -1).reverse());
  // Pause kun i yderstillingerne; "snap"-stillinger skiftes lynhurtigt (bruges til at dreje en arm mod kameraet)
  const seg = (i) => {
    const a = frames[seq[i]], b = frames[seq[(i + 1) % seq.length]];
    const end = seq[i] === 0 || seq[i] === frames.length - 1;
    return { a, b, h: end ? hold : 0, m: a.snap && b.snap ? 60 : move };
  };
  let raf = 0, t0 = 0, idx = 0, running = false;

  function tick(now) {
    if (!t0) t0 = now;
    let dt = now - t0;
    let s = seg(idx);
    while (dt > s.h + s.m) { dt -= s.h + s.m; t0 += s.h + s.m; idx = (idx + 1) % seq.length; s = seg(idx); }
    const t = dt < s.h ? 0 : Math.min(1, (dt - s.h) / s.m);
    draw(lerpPose(s.a, s.b, ease(t)));
    raf = requestAnimationFrame(tick);
  }

  if (frame !== null) { draw(frames[frame]); return { play() {}, stop() {}, destroy() { svg.remove(); }, svg }; }
  draw(frames[frames.length > 1 ? 1 : 0]);
  const api = {
    play() { if (running || frames.length < 2) return; running = true; t0 = 0; raf = requestAnimationFrame(tick); },
    stop() { running = false; cancelAnimationFrame(raf); },
    destroy() { api.stop(); svg.remove(); },
    svg,
  };
  const reduce = window.matchMedia?.('(prefers-reduced-motion: reduce)').matches;
  if (!reduce) api.play();
  return api;
}
