// Træningsplan: 3 faser + et kort program til dage med klubtræning.
import { byId } from './exercises.js';

const x = (id, sets, amount, extra = {}) => ({ id, sets, amount, ...extra });

// Hver fase har tre korte dage (A, B, C) med 4 øvelser, som skiftes i rækkefølge.
// Rotationen følger antal gennemførte træninger – springer hun en dag over, tager hun bare den næste.
export const PHASES = [
  {
    n: 1, name: 'Rolig start', weeks: 'Uge 1–2',
    goal: 'Ro på ryggen, lær at spænde op og bevæg dig uden smerter.',
    days: [
      [x('hoftebojer', 2, 30), x('deadbug', 2, 6), x('bridge', 2, 10), x('hinge', 2, 10)],
      [x('baglaar', 2, 30), x('birddog', 2, 6), x('curlup', 2, 4), x('clamshell', 2, 10)],
      [x('aabenbog', 2, 6), x('sideplanke', 2, 20, { tip: 'Lav den på knæene.' }), x('birddog', 2, 6), x('hinge', 2, 10)],
    ],
  },
  {
    n: 2, name: 'Styrke', weeks: 'Uge 3–5',
    goal: 'Mere styrke i mave, ryg og baller. Ryggen skal kunne holde til mere.',
    days: [
      [x('hoftebojer', 2, 30), x('deadbug', 3, 8), x('bridge1', 3, 8), x('squat', 3, 10)],
      [x('baglaar', 2, 30), x('birddog', 3, 8), x('planke', 3, 30), x('pallof', 3, 10, { tip: 'Ingen elastik? Lav dead bug i stedet.' })],
      [x('aabenbog', 2, 6), x('sideplanke', 3, 30), x('hinge', 2, 10), x('bridge1', 3, 8)],
    ],
  },
  {
    n: 3, name: 'Gymnastikklar', weeks: 'Uge 6+',
    goal: 'Gymnastikstyrke: hollow, lange planker og stærke baller til afsæt og landinger.',
    days: [
      [x('hoftebojer', 2, 30), x('hollow', 3, 20), x('bridge1', 3, 12), x('squat', 3, 12)],
      [x('baglaar', 2, 30), x('birddog', 3, 10), x('planke', 3, 45), x('pallof', 3, 12)],
      [x('aabenbog', 2, 6), x('sideplanke', 3, 40, { tip: 'Prøv at løfte det øverste ben.' }), x('deadbug', 3, 10), x('hinge', 2, 12)],
    ],
  },
];
export const DAY_LABELS = ['A', 'B', 'C'];

export const CLUB_DAY = {
  name: 'Klubdag – kort program',
  goal: 'Lav det som en del af opvarmningen før træning, eller derhjemme samme dag.',
  program: [x('deadbug', 2, 6), x('birddog', 2, 6), x('hoftebojer', 1, 30)],
};

export const EASY_DAY = {
  name: 'Let dag',
  goal: 'Når ryggen er øm: rolige øvelser, der plejer at gøre godt. Stop, hvis noget gør mere ondt.',
  program: [x('vejrtraekning', 1, 8), x('baglaar', 2, 30), x('ballestraek', 2, 30), x('bridge', 1, 8)],
};

export const REST_SEC = 20; // pause mellem sæt
export const CHANGE_SEC = 10; // tid til at skifte øvelse
const SEC_PER_REP = (ex) => (ex.id === 'curlup' ? 11 : ex.id === 'birddog' ? 6 : 4);

export function itemSeconds(item) {
  const ex = byId[item.id];
  const per = ex.unit === 'sek' ? item.amount : item.amount * SEC_PER_REP(ex);
  const sides = ex.perSide ? 2 : 1;
  return item.sets * sides * per + (item.sets * sides - 1) * (ex.unit === 'sek' && ex.perSide ? 5 : 0) + (item.sets - 1) * REST_SEC;
}
export function programMinutes(program) {
  const s = program.reduce((sum, it) => sum + itemSeconds(it) + CHANGE_SEC, 0);
  return Math.round(s / 60);
}

const DAY_MS = 86400000;
export function dateKey(d = new Date()) {
  const z = (n) => String(n).padStart(2, '0');
  return `${d.getFullYear()}-${z(d.getMonth() + 1)}-${z(d.getDate())}`;
}
export function parseKey(k) { const [y, m, d] = k.split('-').map(Number); return new Date(y, m - 1, d); }

export function weekNumber(startDate, today = new Date()) {
  const days = Math.floor((parseKey(dateKey(today)) - parseKey(startDate)) / DAY_MS);
  return Math.max(1, Math.floor(days / 7) + 1);
}
export function autoPhase(startDate, today) {
  const w = weekNumber(startDate, today);
  return w <= 2 ? 1 : w <= 5 ? 2 : 3;
}
export function currentPhase(profile, today = new Date()) {
  const n = profile.phaseMode === 'auto' ? autoPhase(profile.startDate, today) : Number(profile.phaseMode);
  return PHASES[n - 1];
}

// Næste dag i rotationen = antal fulde træninger i denne fase modulo 3
export function nextDayIndex(phase, sessions = []) {
  return sessions.filter((s) => s.programKind === 'fuld' && s.phase === phase.n).length % phase.days.length;
}

export function fullProgram(profile, sessions = [], dayIndex = null) {
  const phase = currentPhase(profile);
  const d = dayIndex ?? nextDayIndex(phase, sessions);
  return {
    kind: 'fuld', phase, day: d, name: `Fase ${phase.n} · Dag ${DAY_LABELS[d]}`,
    goal: phase.goal, program: phase.days[d],
  };
}
export function todaysProgram(profile, sessions = [], today = new Date()) {
  if (profile.clubDays.includes(today.getDay())) return clubProgram(profile);
  return fullProgram(profile, sessions);
}
export function easyProgram(profile) {
  return { kind: 'let', phase: currentPhase(profile), ...EASY_DAY };
}
export function clubProgram(profile) {
  return { kind: 'klub', phase: currentPhase(profile), ...CLUB_DAY };
}
