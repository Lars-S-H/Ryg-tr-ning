import { parseKey } from './plan.js';

export function painChart(sessions) {
  const data = sessions.filter((s) => s.painAfter != null).slice(-20);
  if (data.length < 2) return '<p class="muted">Grafen kommer, når du har gemt et par træninger.</p>';
  const W = 320, H = 150, pl = 22, pr = 8, pt = 8, pb = 22;
  const x = (i) => pl + (i * (W - pl - pr)) / (data.length - 1);
  const y = (v) => pt + ((10 - v) * (H - pt - pb)) / 10;
  const line = (key) => data.map((s, i) => (s[key] == null ? null : `${x(i).toFixed(1)},${y(s[key]).toFixed(1)}`)).filter(Boolean).join(' ');
  let grid = '';
  for (const v of [0, 5, 10]) grid += `<line class="grid" x1="${pl}" x2="${W - pr}" y1="${y(v)}" y2="${y(v)}"/><text x="4" y="${y(v) + 3}">${v}</text>`;
  const d0 = parseKey(data[0].date), d1 = parseKey(data[data.length - 1].date);
  return `<svg class="chart" viewBox="0 0 ${W} ${H}" role="img" aria-label="Smerte før og efter træning">${grid}
    <polyline class="before" points="${line('painBefore')}"/><polyline class="after" points="${line('painAfter')}"/>
    <text x="${pl}" y="${H - 6}">${d0.getDate()}/${d0.getMonth() + 1}</text><text x="${W - pr}" y="${H - 6}" text-anchor="end">${d1.getDate()}/${d1.getMonth() + 1}</text></svg>
    <p class="muted small"><span style="color:var(--accent)">━</span> efter træning · <span>┅</span> før træning</p>`;
}
