// Forældreoverblik: læser Lauras træninger fra den fælles database og opretter delingslinks.
import { FIREBASE_DB_URL, NTFY_ENABLED } from '../config.js';
import { streak, bestStreak, daysInLast, ntfyTopic } from './store.js';
import { painChart } from './charts.js';
import { PHASES, parseKey, dateKey, weekNumber, autoPhase } from './plan.js';

const $view = document.getElementById('view');
const PKEY = 'ryg-parent-key';
const esc = (s) => String(s ?? '').replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
const DOW = ['søn', 'man', 'tir', 'ons', 'tor', 'fre', 'lør'];

function getKey() {
  const k = new URLSearchParams(location.search).get('k');
  if (k && /^[a-z0-9]{8,40}$/i.test(k)) { try { localStorage.setItem(PKEY, k); } catch {} return k; }
  try { return localStorage.getItem(PKEY) || ''; } catch { return ''; }
}
function newKey() {
  const a = new Uint8Array(12); crypto.getRandomValues(a);
  return Array.from(a, (b) => 'abcdefghijkmnpqrstuvwxyz23456789'[b % 32]).join('');
}
const baseUrl = () => location.href.split('#')[0].split('?')[0].replace(/foraelder\.html$/, '');

function linksCard(key) {
  const laura = `${baseUrl()}?k=${key}`;
  const parent = `${baseUrl()}foraelder.html?k=${key}`;
  return `
    <div class="card">
      <h3>1. Lauras link</h3>
      <p class="small">Send dette link til Laura. Hun åbner det i Safari én gang og vælger <b>Del → Føj til hjemmeskærm</b>.</p>
      <input readonly value="${laura}" onclick="this.select()">
      <div class="row" style="margin-top:8px"><button class="btn light" data-copy="${laura}">Kopiér</button><button class="btn light" data-share="${laura}">Send…</button></div>
      <h3 style="margin-top:18px">2. Dit link (denne side)</h3>
      <p class="small">Gem det som bogmærke eller på din hjemmeskærm. Del det kun med den anden forælder.</p>
      <input readonly value="${parent}" onclick="this.select()">
      ${NTFY_ENABLED ? `
      <h3 style="margin-top:18px">3. Få besked, når Laura har trænet 🔔</h3>
      <ol class="steps small">
        <li>Hent den gratis app <b>ntfy</b> i App Store.</li>
        <li>Tryk <b>+</b> og abonnér på emnet: <code style="user-select:all">${ntfyTopic(key)}</code></li>
        <li>Tillad notifikationer. Så får du en besked efter hver træning.</li>
      </ol>` : ''}
    </div>`;
}

function stats(sessions, profile) {
  const today = dateKey();
  const doneToday = sessions.some((s) => s.date === today);
  const recent = [...sessions].reverse().slice(0, 30);
  const phaseN = profile ? (profile.phaseMode === 'auto' ? autoPhase(profile.startDate) : Number(profile.phaseMode)) : 1;
  // Sidste 28 dage som et lille gitter
  const days = new Set(sessions.map((s) => s.date));
  let grid = '';
  const d = new Date(); d.setDate(d.getDate() - 27);
  for (let i = 0; i < 28; i++) {
    const k = dateKey(d);
    grid += `<div class="d ${days.has(k) ? 'on' : ''} ${k === today ? 'today' : ''}" title="${k}">${d.getDate()}</div>`;
    d.setDate(d.getDate() + 1);
  }
  return `
    <div class="card ${doneToday ? 'done' : 'hero'}">
      <b style="font-size:20px">${doneToday ? '✅ Har trænet i dag' : '⏳ Har ikke trænet i dag endnu'}</b>
      ${profile ? `<p class="muted small" style="margin-top:6px">Fase ${phaseN}: ${PHASES[phaseN - 1].name} · uge ${weekNumber(profile.startDate)} · klubdage: ${profile.clubDays.map((x) => DOW[x]).join(', ')}</p>` : ''}
    </div>
    <div class="stats">
      <div class="stat"><b>🔥 ${streak(sessions)}</b><span>dage i træk</span></div>
      <div class="stat"><b>${daysInLast(7, sessions)}/7</b><span>sidste uge</span></div>
      <div class="stat"><b>${daysInLast(30, sessions)}/30</b><span>sidste 30 dage</span></div>
    </div>
    <div class="stats">
      <div class="stat"><b>${sessions.length}</b><span>træninger i alt</span></div>
      <div class="stat"><b>${bestStreak(sessions)}</b><span>bedste stime</span></div>
      <div class="stat"><b>${Math.round(sessions.reduce((a, s) => a + (s.durationSec || 0), 0) / 60)}</b><span>minutter i alt</span></div>
    </div>
    <h2>Sidste 4 uger</h2>
    <div class="card"><div class="cal">${grid}</div></div>
    <h2>Smerte før og efter</h2>
    <div class="card">${painChart(sessions)}</div>
    <h2>Træninger</h2>
    <div class="card">${recent.length ? `<ul class="list">${recent.map((s) => {
      const dt = parseKey(s.date);
      const t = s.startedAt ? new Date(s.startedAt).toLocaleTimeString('da-DK', { hour: '2-digit', minute: '2-digit' }) : '';
      return `<li><div style="width:100%"><div class="topline"><b>${DOW[dt.getDay()]} ${dt.getDate()}/${dt.getMonth() + 1} <span class="muted small">kl. ${t}</span></b>
        <span class="small">smerte ${s.painBefore ?? '–'}→${s.painAfter ?? '–'}</span></div>
        <div class="muted small">${esc(s.programName)} · ${Math.max(1, Math.round((s.durationSec || 0) / 60))} min${s.skipped?.length ? ` · sprang over: ${s.skipped.length}` : ''}</div>
        ${s.note ? `<div class="small">“${esc(s.note)}”</div>` : ''}</div></li>`;
    }).join('')}</ul>` : '<p class="muted">Ingen træninger endnu.</p>'}</div>`;
}

async function render() {
  const key = getKey();
  if (!key) {
    $view.innerHTML = `
      <h1>Forældreoverblik</h1>
      <p class="muted">Opret en hemmelig familienøgle. Den forbinder Lauras app med denne side.</p>
      <button class="btn big" data-new>Opret familienøgle</button>`;
    $view.querySelector('[data-new]').onclick = () => { localStorage.setItem(PKEY, newKey()); render(); };
    return;
  }
  $view.innerHTML = `<h1>Lauras rygtræning</h1><p class="muted">Henter…</p>`;
  let body = '';
  if (!FIREBASE_DB_URL) {
    body = `<div class="card warn"><b>Databasen er ikke sat op endnu.</b><p class="small">Træningerne gemmes indtil videre kun på Lauras telefon. Se README.md for opsætning af Firebase (5 min). Push-beskeder via ntfy virker allerede.</p></div>`;
  } else {
    try {
      const r = await fetch(`${FIREBASE_DB_URL.replace(/\/$/, '')}/familier/${key}.json`);
      if (!r.ok) throw new Error(r.status);
      const data = (await r.json()) || {};
      const sessions = Object.values(data.sessions || {}).filter((s) => s && s.date).sort((a, b) => a.startedAt.localeCompare(b.startedAt));
      body = sessions.length || data.profile ? stats(sessions, data.profile) : '<div class="card"><p>Ingen data endnu. Når Laura har åbnet sit link og trænet første gang, dukker det op her.</p></div>';
    } catch {
      body = '<div class="card warn">Kunne ikke hente data. Tjek internetforbindelsen.</div>';
    }
  }
  $view.innerHTML = `
    <div class="topline"><h1>Lauras rygtræning</h1><button class="icon-btn" data-reload aria-label="Opdater">↻</button></div>
    <p class="muted small">Opdateret ${new Date().toLocaleTimeString('da-DK', { hour: '2-digit', minute: '2-digit' })}</p>
    ${body}
    <details><summary>Links og opsætning</summary>${linksCard(key)}</details>`;
  $view.querySelector('[data-reload]').onclick = render;
  $view.querySelectorAll('[data-copy]').forEach((b) => (b.onclick = async () => { try { await navigator.clipboard.writeText(b.dataset.copy); b.textContent = 'Kopieret ✓'; } catch {} }));
  $view.querySelectorAll('[data-share]').forEach((b) => (b.onclick = async () => {
    try { await navigator.share({ title: 'Din rygtræning', text: 'Her er din rygtrænings-app 💪 Åbn i Safari og vælg Del → Føj til hjemmeskærm', url: b.dataset.share }); } catch {}
  }));
  if (!FIREBASE_DB_URL || !$view.querySelector('.stats')) $view.querySelector('details').open = true;
}
render();
