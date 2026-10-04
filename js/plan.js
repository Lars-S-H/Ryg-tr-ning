// Træningsplan: 3 faser + et kort program til dage med klubtræning.
import { byId } from './exercises.js';

const x = (id, sets, amount, extra = {}) => ({ id, sets, amount, ...extra });

// Fire faste øvelser, som bliver sværere fase for fase. Samme øvelser hver dag gør dem nemme at lære.
export const PHASES = [
  {
    n: 1, name: 'Rolig start', weeks: 'Uge 1–2',
    goal: 'Lær de fire øvelser rigtigt, og få ro på ryggen.',
    program: [x('deadbug', 2, 6), x('birddog', 2, 6), x('bridge', 2, 10), x('hinge', 2, 10)],
  },
  {
    n: 2, name: 'Styrke', weeks: 'Uge 3–5',
    goal: 'Flere sæt og sværere varianter. Ryggen skal kunne holde til mere.',
    program: [
      x('deadbug', 3, 8),
      x('birddog', 2, 6, { tip: 'Hold 5 sekunder i hver strækning.' }),
      x('bridge1', 2, 8),
      x('hinge', 2, 10),
    ],
  },
  {
    n: 3, name: 'Gymnastikklar', weeks: 'Uge 6+',
    goal: 'Gymnastikstyrke til afsæt og landinger.',
    program: [
      x('deadbug', 3, 10, { tip: 'Hold en lille bold eller vandflaske i hænderne.' }),
      x('birddog', 2, 8, { tip: 'Hold 5 sekunder i hver strækning.' }),
      x('bridge1', 3, 10),
      x('hinge', 2, 12),
    ],
  },
];

export const CLUB_DAY = {
  name: 'Klubdag – kort program',
  goal: 'De samme fire øvelser, ét sæt af hver. Godt som opvarmning før træning.',
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

export function fullProgram(profile) {
  const phase = currentPhase(profile);
  return { kind: 'fuld', phase, name: `Fase ${phase.n}: ${phase.name}`, goal: phase.goal, program: phase.program };
}
export function todaysProgram(profile, today = new Date()) {
  if (profile.clubDays.includes(today.getDay())) return clubProgram(profile);
  return fullProgram(profile);
}
export function easyProgram(profile) {
  return { kind: 'let', phase: currentPhase(profile), ...EASY_DAY };
}
// Klubdag: samme øvelser som fasen, men kun ét sæt
export function clubProgram(profile) {
  const phase = currentPhase(profile);
  return { kind: 'klub', phase, ...CLUB_DAY, program: phase.program.map((it) => ({ ...it, sets: 1 })) };
}
