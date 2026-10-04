// Data gemmes på telefonen (localStorage) og synkroniseres – hvis det er sat op – til
// en Firebase-database under en hemmelig familienøgle, så forældre kan følge med.
import { FIREBASE_DB_URL, NTFY_ENABLED } from '../config.js';
import { dateKey, parseKey } from './plan.js';

const KEY = 'laura-ryg-v1';

const defaults = () => ({
  profile: {
    name: 'Laura',
    startDate: dateKey(),
    phaseMode: 'auto',
    clubDays: [0, 2, 3], // søndag, tirsdag, onsdag
    reminderTime: '17:00',
  },
  sessions: [],
  familyKey: '',
});

let state;
export function load() {
  try {
    const raw = localStorage.getItem(KEY);
    const saved = raw ? JSON.parse(raw) : {};
    const d = defaults();
    state = { ...d, ...saved, profile: { ...d.profile, ...(saved.profile || {}) } };
  } catch {
    state = defaults();
  }
  // Familienøgle fra linket (?k=...) gemmes første gang
  const k = new URLSearchParams(location.search).get('k');
  if (k && /^[a-z0-9]{8,40}$/i.test(k)) state.familyKey = k;
  save();
  return state;
}
export function save() {
  try { localStorage.setItem(KEY, JSON.stringify(state)); } catch { /* fx privat browsing */ }
}
export const getState = () => state;

export function addSession(s) {
  state.sessions.push(s);
  state.sessions.sort((a, b) => a.startedAt.localeCompare(b.startedAt));
  save();
}
export function updateProfile(patch) {
  state.profile = { ...state.profile, ...patch };
  save();
  pushProfile();
}

// ---------- Statistik ----------
export function doneDays(sessions = state.sessions) {
  return new Set(sessions.map((s) => s.date));
}
export function streak(sessions = state.sessions, today = new Date()) {
  const days = doneDays(sessions);
  const d = parseKey(dateKey(today));
  if (!days.has(dateKey(d))) d.setDate(d.getDate() - 1); // i dag tæller først, når den er lavet
  let n = 0;
  while (days.has(dateKey(d))) { n++; d.setDate(d.getDate() - 1); }
  return n;
}
export function bestStreak(sessions = state.sessions) {
  const days = [...doneDays(sessions)].sort();
  let best = 0, run = 0, prev = null;
  for (const k of days) {
    const cur = parseKey(k);
    run = prev && (cur - prev) / 86400000 === 1 ? run + 1 : 1;
    best = Math.max(best, run);
    prev = cur;
  }
  return best;
}
export function daysInLast(n, sessions = state.sessions, today = new Date()) {
  const days = doneDays(sessions);
  let c = 0;
  const d = parseKey(dateKey(today));
  for (let i = 0; i < n; i++) { if (days.has(dateKey(d))) c++; d.setDate(d.getDate() - 1); }
  return c;
}

export const BADGES = [
  { id: 'first', icon: '🌱', name: 'Første træning', test: (s) => s.length >= 1 },
  { id: 's3', icon: '🔥', name: '3 dage i træk', test: (s) => bestStreak(s) >= 3 },
  { id: 's7', icon: '⭐', name: '7 dage i træk', test: (s) => bestStreak(s) >= 7 },
  { id: 's14', icon: '🏅', name: '14 dage i træk', test: (s) => bestStreak(s) >= 14 },
  { id: 'n10', icon: '💪', name: '10 træninger', test: (s) => s.length >= 10 },
  { id: 'n25', icon: '🤸', name: '25 træninger', test: (s) => s.length >= 25 },
  { id: 'n50', icon: '🏆', name: '50 træninger', test: (s) => s.length >= 50 },
  { id: 'p2', icon: '🚀', name: 'Nået fase 2', test: (s) => s.some((x) => x.phase >= 2) },
  { id: 'p3', icon: '🦋', name: 'Nået fase 3', test: (s) => s.some((x) => x.phase >= 3) },
  { id: 'free', icon: '😊', name: '5 træninger uden smerter bagefter', test: (s) => s.filter((x) => x.painAfter === 0).length >= 5 },
];
export const earnedBadges = (s = state.sessions) => BADGES.filter((b) => b.test(s));

// ---------- Synkronisering ----------
export const syncEnabled = () => !!(FIREBASE_DB_URL && state.familyKey);
const base = () => `${FIREBASE_DB_URL.replace(/\/$/, '')}/familier/${state.familyKey}`;

async function put(path, data) {
  const r = await fetch(`${base()}/${path}.json`, { method: 'PUT', body: JSON.stringify(data) });
  if (!r.ok) throw new Error('sync ' + r.status);
}

export async function pushProfile() {
  if (!syncEnabled()) return;
  try { await put('profile', state.profile); } catch { /* prøver igen senere */ }
}

// Sender usynkroniserede træninger og henter evt. træninger, der mangler lokalt (fx efter ny telefon)
export async function sync() {
  if (!syncEnabled()) return { ok: false, reason: 'off' };
  try {
    const r = await fetch(`${base()}/sessions.json`);
    const remote = (r.ok && (await r.json())) || {};
    const local = new Set(state.sessions.map((s) => s.id));
    let changed = false;
    for (const s of Object.values(remote)) {
      if (s && s.id && !local.has(s.id)) { state.sessions.push({ ...s, synced: true }); changed = true; }
    }
    for (const s of state.sessions) {
      if (!s.synced || !remote[s.id]) {
        const { synced, ...data } = s;
        await put(`sessions/${s.id}`, data);
        s.synced = true; changed = true;
      }
    }
    if (changed) { state.sessions.sort((a, b) => a.startedAt.localeCompare(b.startedAt)); save(); }
    await put('profile', state.profile);
    return { ok: true };
  } catch (e) {
    return { ok: false, reason: 'net' };
  }
}

export const ntfyTopic = (key = state.familyKey) => (key ? `ryg-${key}` : '');

export async function notifyParents(s) {
  if (!NTFY_ENABLED || !state.familyKey) return;
  const pain = s.painBefore != null && s.painAfter != null ? ` · smerte ${s.painBefore}→${s.painAfter}` : '';
  const msg = `${state.profile.name} har trænet ✅ ${Math.round(s.durationSec / 60)} min (${s.programName})${pain}` +
    (s.note ? `\n"${s.note}"` : '');
  try {
    await fetch(`https://ntfy.sh/${ntfyTopic()}`, { method: 'POST', body: msg, headers: { Title: 'Rygtræning', Tags: 'muscle' } });
  } catch { /* ikke kritisk */ }
}
