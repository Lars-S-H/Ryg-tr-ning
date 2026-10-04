import { EXERCISES, CATEGORIES, byId } from './exercises.js';
import { createFigure } from './figure.js';
import {
  PHASES, REST_SEC, todaysProgram, fullProgram, easyProgram, clubProgram, programMinutes,
  currentPhase, weekNumber, dateKey, parseKey,
} from './plan.js';
import * as store from './store.js';
import { painChart } from './charts.js';

const $view = document.getElementById('view');
let figures = [];
let cleanup = [];
const esc = (s) => String(s ?? '').replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
const DOW = ['søn', 'man', 'tir', 'ons', 'tor', 'fre', 'lør'];
const DOW_LONG = ['søndag', 'mandag', 'tirsdag', 'onsdag', 'torsdag', 'fredag', 'lørdag'];
const MONTHS = ['januar', 'februar', 'marts', 'april', 'maj', 'juni', 'juli', 'august', 'september', 'oktober', 'november', 'december'];

function mountFigures(root = $view) {
  root.querySelectorAll('[data-fig]').forEach((node) => {
    const ex = byId[node.dataset.fig];
    figures.push(createFigure(node, ex.anim, { small: node.classList.contains('thumb') }));
  });
}
function clearFigs() {
  figures.forEach((f) => f.destroy());
  figures = [];
}
function reset() {
  clearFigs();
  cleanup.forEach((fn) => fn());
  cleanup = [];
}
function toast(msg) {
  const t = document.createElement('div');
  t.className = 'toast'; t.textContent = msg;
  document.body.appendChild(t);
  setTimeout(() => t.remove(), 2600);
}
function setTab(name) {
  document.querySelectorAll('.tabbar a').forEach((a) => a.classList.toggle('active', a.dataset.tab === name));
}
const amountText = (ex, amount) => (ex.unit === 'sek' ? `${amount} sek` : `${amount} ${ex.unitLabel || 'gange'}`);
const itemText = (it) => {
  const ex = byId[it.id];
  return `${it.sets} × ${amountText(ex, it.amount)}${ex.perSide ? ' pr. side' : ''}`;
};

// ---------------- Hjem ----------------
function weekStrip(today = new Date()) {
  const days = store.doneDays();
  const monday = new Date(today); monday.setDate(today.getDate() - ((today.getDay() + 6) % 7));
  let html = '<div class="week">';
  for (let i = 0; i < 7; i++) {
    const d = new Date(monday); d.setDate(monday.getDate() + i);
    const k = dateKey(d);
    const on = days.has(k);
    html += `<div>${DOW[d.getDay()]}<i class="${on ? 'on' : ''} ${k === dateKey(today) ? 'today' : ''}">${on ? '✓' : d.getDate()}</i></div>`;
  }
  return html + '</div>';
}

function programCard(p, { hero = false, startLabel = 'Start træning' } = {}) {
  return `
    <div class="card ${hero ? 'hero' : ''}">
      <div class="muted small">${p.kind === 'klub' ? 'Klubdag 🤸' : p.kind === 'let' ? 'Øm ryg' : 'Dagens program'} · ca. ${programMinutes(p.program)} min</div>
      <h2 style="margin:4px 0 6px">${esc(p.name)}</h2>
      <p class="${hero ? 'muted' : 'muted small'}">${esc(p.goal)}</p>
      <div class="chips">${p.program.map((it) => `<span class="chip">${esc(byId[it.id].name)}</span>`).join('')}</div>
      <a class="btn big ${hero ? 'white' : ''}" href="#/traen/${p.kind}">${startLabel} ▶</a>
    </div>`;
}

function viewHome() {
  setTab('hjem');
  const st = store.getState();
  const prof = st.profile;
  const today = new Date();
  const todayProg = todaysProgram(prof, today);
  const doneToday = st.sessions.some((s) => s.date === dateKey(today));
  const streak = store.streak();
  const phase = currentPhase(prof);
  const hour = today.getHours();
  const hello = hour < 10 ? 'Godmorgen' : hour < 18 ? 'Hej' : 'Godaften';
  const alt = todayProg.kind === 'klub' ? fullProgram(prof) : clubProgram(prof);

  $view.innerHTML = `
    <div class="topline">
      <div>
        <div class="muted small">${DOW_LONG[today.getDay()]} d. ${today.getDate()}. ${MONTHS[today.getMonth()]}</div>
        <h1>${hello} ${esc(prof.name)} 👋</h1>
      </div>
      <a class="icon-btn" href="#/indstillinger" aria-label="Indstillinger">⚙️</a>
    </div>
    <p class="muted">Fase ${phase.n} · uge ${weekNumber(prof.startDate)} af din plan</p>

    <div class="card ${doneToday ? 'done' : 'hero'}">
      <div class="topline">
        <div>
          <div style="font-size:34px;font-weight:800;line-height:1">🔥 ${streak}</div>
          <div class="small" style="opacity:.85">${streak === 1 ? 'dag' : 'dage'} i træk</div>
        </div>
        <div style="text-align:right;max-width:60%" class="small">${doneToday ? '<b>Godt gået! ✅</b><br>Du har trænet i dag.' : streak > 0 ? 'Træn i dag for at holde din stime i live!' : 'Hver dag tæller. Start en ny stime i dag!'}</div>
      </div>
      ${weekStrip(today)}
    </div>

    ${doneToday ? '' : programCard(todayProg, { hero: false })}

    ${doneToday ? `<h2>Har du lyst til mere?</h2>${programCard(todayProg, { startLabel: 'Træn igen' })}` : ''}

    <h2>Andre muligheder</h2>
    <div class="card">
      <ul class="list">
        <li><a href="#/traen/let"><span style="font-size:26px">🫶</span><div><b>Let dag</b><div class="muted small">Når ryggen er øm · ca. ${programMinutes(easyProgram(prof).program)} min</div></div><span class="chev">›</span></a></li>
        <li><a href="#/traen/${alt.kind}"><span style="font-size:26px">${alt.kind === 'klub' ? '⚡' : '💪'}</span><div><b>${esc(alt.kind === 'klub' ? 'Kort program' : 'Fuldt program')}</b><div class="muted small">${esc(alt.name)} · ca. ${programMinutes(alt.program)} min</div></div><span class="chev">›</span></a></li>
        <li><a href="#/plan"><span style="font-size:26px">🗺️</span><div><b>Se hele planen</b><div class="muted small">Fase 1 → 3</div></div><span class="chev">›</span></a></li>
      </ul>
    </div>
    <p class="muted small center">Husk: Øvelserne må højst gøre lidt ondt (0–3 ud af 10), og smerterne skal være væk dagen efter. <a href="#/info">Læs mere</a></p>
  `;
}

// ---------------- Plan ----------------
function viewPlan() {
  setTab('hjem');
  const prof = store.getState().profile;
  const cur = currentPhase(prof).n;
  $view.innerHTML = `
    <div class="topline"><a class="icon-btn" href="#/" aria-label="Tilbage">‹</a><h1 style="flex:1">Din plan</h1></div>
    <p class="muted">De samme 4 øvelser hver dag, ca. 10 minutter. De bliver sværere i hver fase. På dage med klubtræning (${prof.clubDays.map((d) => DOW[d]).join(', ')}) laver du ét sæt af hver.</p>
    ${PHASES.map((ph) => `
      <div class="card">
        <div class="topline"><h3>Fase ${ph.n}: ${ph.name}</h3>${ph.n === cur ? '<span class="tag">Nu</span>' : ''}</div>
        <p class="muted small">${ph.weeks} · ca. ${programMinutes(ph.program)} min</p>
        <p>${ph.goal}</p>
        <ul class="list">${ph.program.map((it) => `
          <li><a href="#/ovelse/${it.id}"><div class="thumb" data-fig="${it.id}"></div>
          <div><b>${esc(byId[it.id].name)}</b>${ph.n > 1 && !PHASES[ph.n - 2].program.some((p) => p.id === it.id) ? ' <span class="tag" style="background:var(--accent);color:#fff">Ny</span>' : ''}<div class="muted small">${itemText(it)}${it.tip ? ' · ' + esc(it.tip) : ''}</div></div><span class="chev">›</span></a></li>`).join('')}
        </ul>
      </div>`).join('')}
    <p class="muted small">Hoftehængslet er ikke med efter fase 1, men brug det hver dag, når du samler noget op eller tager sko på.</p>
    <p class="muted small">Gå kun videre til næste fase, hvis øvelserne i den nuværende føles lette og ikke gør ondt. Fasen kan ændres under ⚙️ Indstillinger.</p>
  `;
  mountFigures();
}

// ---------------- Øvelser ----------------
function viewExercises() {
  setTab('ovelser');
  $view.innerHTML = `<h1>Øvelser</h1><p class="muted">Tryk på en øvelse for at se, hvordan den laves.</p>` +
    Object.entries(CATEGORIES).map(([cat, label]) => `
      <h2>${label}</h2>
      <div class="card"><ul class="list">
      ${EXERCISES.filter((e) => e.cat === cat).map((e) => `
        <li><a href="#/ovelse/${e.id}"><div class="thumb" data-fig="${e.id}"></div>
        <div><b>${esc(e.name)}</b><div class="muted small">${esc(e.purpose.split('.')[0])}.</div></div><span class="chev">›</span></a></li>`).join('')}
      </ul></div>`).join('');
  mountFigures();
}

function exerciseDetails(ex) {
  return `
    <p>${esc(ex.purpose)}</p>
    ${ex.equipment ? `<p><span class="tag">Udstyr</span> ${esc(ex.equipment)}</p>` : ''}
    <h3 style="margin-top:14px">Sådan gør du</h3>
    <ol class="steps">${ex.steps.map((s) => `<li>${esc(s)}</li>`).join('')}</ol>
    <h3 style="margin-top:14px">Pas på</h3>
    <ul class="plain">${ex.mistakes.map((s) => `<li>${esc(s)}</li>`).join('')}</ul>
    ${ex.easier ? `<p><span class="tag">Lettere</span> ${esc(ex.easier)}</p>` : ''}
    ${ex.harder ? `<p><span class="tag">Sværere</span> ${esc(ex.harder)}</p>` : ''}
    ${ex.avoid ? `<div class="card warn" style="margin-top:12px;box-shadow:none">⚠️ ${esc(ex.avoid)}</div>` : ''}
    ${ex.note ? `<p class="muted small">${esc(ex.note)}</p>` : ''}
  `;
}

function viewExercise(id) {
  setTab('ovelser');
  const ex = byId[id];
  if (!ex) return (location.hash = '#/ovelser');
  $view.innerHTML = `
    <div class="topline"><a class="icon-btn" href="javascript:history.back()" aria-label="Tilbage">‹</a><span class="tag">${CATEGORIES[ex.cat]}</span></div>
    <h1 style="margin-top:12px">${esc(ex.name)}</h1>
    <div class="figbox" data-fig="${ex.id}"></div>
    <div class="card" style="margin-top:14px">${exerciseDetails(ex)}</div>
  `;
  mountFigures();
}

// ---------------- Træning ----------------
let audioCtx;
function beep(freq = 880, ms = 160) {
  try {
    audioCtx = audioCtx || new (window.AudioContext || window.webkitAudioContext)();
    const o = audioCtx.createOscillator(), g = audioCtx.createGain();
    o.frequency.value = freq; o.connect(g); g.connect(audioCtx.destination);
    g.gain.setValueAtTime(0.25, audioCtx.currentTime);
    g.gain.exponentialRampToValueAtTime(0.001, audioCtx.currentTime + ms / 1000);
    o.start(); o.stop(audioCtx.currentTime + ms / 1000);
  } catch { /* lyd er ikke vigtig */ }
  navigator.vibrate?.(120);
}
let wakeLock = null;
async function keepAwake(on) {
  try {
    if (on && 'wakeLock' in navigator) wakeLock = await navigator.wakeLock.request('screen');
    else if (!on && wakeLock) { await wakeLock.release(); wakeLock = null; }
  } catch { /* ikke understøttet */ }
}

function buildSteps(program) {
  const steps = [];
  program.forEach((it, i) => {
    const ex = byId[it.id];
    const sides = ex.perSide ? ['Højre side', 'Venstre side'] : [null];
    for (let s = 1; s <= it.sets; s++) {
      sides.forEach((side, si) => {
        steps.push({ type: 'work', item: it, ex, index: i, set: s, side, first: s === 1 && si === 0 });
      });
      if (s < it.sets) steps.push({ type: 'rest', sec: REST_SEC, index: i });
    }
  });
  return steps;
}

function painPicker(title, sub) {
  const cls = (n) => (n <= 2 ? 'g' : n <= 5 ? 'y' : 'r');
  return `
    <h1>${title}</h1>
    <p class="muted">${sub}</p>
    <div class="pain">${Array.from({ length: 11 }, (_, n) => `<button class="${cls(n)}" data-pain="${n}" aria-pressed="false">${n}</button>`).join('')}</div>
    <div class="legend"><span>0 = ingen smerte</span><span>10 = værst tænkelige</span></div>`;
}

function viewTrain(kind) {
  const prof = store.getState().profile;
  const p = kind === 'let' ? easyProgram(prof) : kind === 'klub' ? clubProgram(prof) : fullProgram(prof);
  const session = {
    id: `${Date.now().toString(36)}${Math.random().toString(36).slice(2, 6)}`,
    date: dateKey(), startedAt: new Date().toISOString(),
    programKind: p.kind, programName: p.name, phase: p.phase.n,
    painBefore: null, painAfter: null, note: '', skipped: [],
  };
  const steps = buildSteps(p.program);
  let pos = -1;
  let timer = null;
  document.body.classList.add('in-session');
  keepAwake(true);
  cleanup.push(() => { clearInterval(timer); document.body.classList.remove('in-session'); keepAwake(false); });

  const stopTimer = () => { clearInterval(timer); timer = null; };

  function header() {
    const done = Math.max(0, pos) / steps.length;
    return `<div class="session-top">
      <button class="icon-btn" data-act="quit" aria-label="Afslut">✕</button>
      <div class="progress"><div style="width:${(done * 100).toFixed(0)}%"></div></div>
      <span class="muted small">${Math.min(p.program.length, (steps[pos]?.index ?? 0) + 1)}/${p.program.length}</span>
    </div>`;
  }

  function showPainBefore() {
    $view.innerHTML = `${header()}${painPicker('Hvor ondt gør ryggen lige nu?', 'Vælg et tal før du starter.')}
      <div id="painmsg"></div>`;
    $view.querySelectorAll('[data-pain]').forEach((b) => b.addEventListener('click', () => {
      const n = Number(b.dataset.pain);
      session.painBefore = n;
      $view.querySelectorAll('[data-pain]').forEach((x) => x.setAttribute('aria-pressed', String(x === b)));
      const msg = $view.querySelector('#painmsg');
      if (n >= 6) {
        msg.innerHTML = `<div class="card warn"><b>Det lyder som en dårlig dag.</b>
          <p>Lav den lette version i dag, eller hold helt fri. Det er helt okay. Fortæl din mor/far, hvis det bliver ved.</p>
          ${p.kind !== 'let' ? '<a class="btn big accent" href="#/traen/let">Skift til let dag</a>' : ''}
          <button class="btn big ghost" data-go>Fortsæt med ${esc(p.name)}</button></div>`;
      } else {
        msg.innerHTML = `${n >= 3 ? '<p class="muted">Tag det roligt i dag, og spring de øvelser over, der gør mere ondt.</p>' : ''}<button class="btn big" data-go>Start ▶</button>`;
      }
      msg.querySelector('[data-go]').addEventListener('click', () => { beep(660, 60); next(); });
    }));
  }

  function next() {
    stopTimer();
    pos++;
    if (pos >= steps.length) return showPainAfter();
    const st = steps[pos];
    st.type === 'rest' ? showRest(st) : showWork(st);
  }

  function ring(total, left) {
    const C = 2 * Math.PI * 64;
    return `<div class="ring"><svg viewBox="0 0 150 150"><circle class="bg" cx="75" cy="75" r="64" fill="none" stroke-width="12"/>
      <circle class="fg" cx="75" cy="75" r="64" fill="none" stroke-width="12" stroke-linecap="round" stroke-dasharray="${C}" stroke-dashoffset="${C * (1 - left / total)}"/></svg><b>${left}</b></div>`;
  }
  function countdown(total, onTick, onDone) {
    let left = total;
    onTick(left);
    timer = setInterval(() => {
      left--;
      if (left > 0 && left <= 3) beep(660, 80);
      if (left <= 0) { stopTimer(); beep(990, 300); onDone(); return; }
      onTick(left);
    }, 1000);
  }

  function showWork(st) {
    clearFigs();
    const { ex, item } = st;
    const timed = ex.unit === 'sek';
    $view.innerHTML = `${header()}
      <h1>${esc(ex.name)}</h1>
      <div class="setline">Sæt ${st.set} af ${item.sets}${st.side ? `<span class="side-badge">${st.side}</span>` : ''}</div>
      <div class="figbox" data-fig="${ex.id}"></div>
      <div id="target">${timed ? ring(item.amount, item.amount) : `<div class="target">${item.amount}<small>${esc(ex.unitLabel || 'gentagelser')}</small></div>`}</div>
      ${item.tip ? `<p class="center"><span class="tag">Tip</span> ${esc(item.tip)}</p>` : ''}
      <div class="stack">
        <button class="btn big" data-main>${timed ? 'Start tid ▶' : 'Færdig ✓'}</button>
        <div class="row"><button class="btn light" data-skip>Spring øvelsen over</button></div>
      </div>
      <details ${st.first ? 'open' : ''}><summary>Vis instruktion</summary>${exerciseDetails(ex)}</details>`;
    mountFigures();
    const main = $view.querySelector('[data-main]');
    main.addEventListener('click', () => {
      if (!timed) { beep(880, 80); return next(); }
      if (timer) return; // kører allerede
      main.textContent = 'Færdig før tid ✓';
      main.classList.add('light');
      main.onclick = () => next();
      countdown(item.amount, (left) => { $view.querySelector('#target').innerHTML = ring(item.amount, left); }, next);
    }, { once: !timed });
    $view.querySelector('[data-skip]').addEventListener('click', () => {
      session.skipped.push(ex.id);
      // spring alle resterende trin for denne øvelse over
      while (pos + 1 < steps.length && steps[pos + 1].index === st.index) pos++;
      next();
    });
  }

  function showRest(st) {
    clearFigs();
    const nxt = steps[pos + 1];
    $view.innerHTML = `${header()}
      <h1 class="center" style="margin-top:20px">Pause 😮‍💨</h1>
      <p class="center muted">Ryst armene og træk vejret.</p>
      <div id="target">${ring(st.sec, st.sec)}</div>
      ${nxt ? `<p class="center">Næste: <b>${esc(nxt.ex.name)}</b>${nxt.side ? ` · ${nxt.side}` : ''}</p>` : ''}
      <button class="btn big light" data-skip>Spring pausen over</button>`;
    $view.querySelector('[data-skip]').addEventListener('click', next);
    countdown(st.sec, (left) => { $view.querySelector('#target').innerHTML = ring(st.sec, left); }, next);
  }

  function showPainAfter() {
    clearFigs();
    pos = steps.length;
    $view.innerHTML = `${header()}${painPicker('Godt klaret! 🎉 Hvordan har ryggen det nu?', 'Vælg et tal.')}
      <label class="field" style="margin-top:16px"><span>Noter (valgfrit)</span>
        <textarea id="note" rows="3" placeholder="Fx: Sideplanken var hård, dead bug gik godt…"></textarea></label>
      <button class="btn big" data-save disabled>Gem træning</button>`;
    const save = $view.querySelector('[data-save]');
    $view.querySelectorAll('[data-pain]').forEach((b) => b.addEventListener('click', () => {
      session.painAfter = Number(b.dataset.pain);
      $view.querySelectorAll('[data-pain]').forEach((x) => x.setAttribute('aria-pressed', String(x === b)));
      save.disabled = false;
    }));
    save.addEventListener('click', () => finish($view.querySelector('#note').value.trim().slice(0, 500)));
  }

  function finish(note) {
    const before = store.earnedBadges().map((b) => b.id);
    session.note = note;
    session.endedAt = new Date().toISOString();
    session.durationSec = Math.round((Date.parse(session.endedAt) - Date.parse(session.startedAt)) / 1000);
    session.completed = p.program.length - new Set(session.skipped).size;
    session.total = p.program.length;
    store.addSession(session);
    store.notifyParents(session);
    store.sync();
    const fresh = store.earnedBadges().filter((b) => !before.includes(b.id));
    const streak = store.streak();
    clearFigs();
    document.body.classList.remove('in-session');
    keepAwake(false);
    $view.innerHTML = `
      <div class="celebrate">${fresh[0]?.icon || '🎉'}</div>
      <h1 class="center">Super flot, ${esc(store.getState().profile.name)}!</h1>
      <p class="center muted">${Math.max(1, Math.round(session.durationSec / 60))} minutters træning gennemført.</p>
      <div class="stats">
        <div class="stat"><b>🔥 ${streak}</b><span>dage i træk</span></div>
        <div class="stat"><b>${store.getState().sessions.length}</b><span>træninger i alt</span></div>
        <div class="stat"><b>${session.painBefore ?? '–'}→${session.painAfter}</b><span>smerte før→efter</span></div>
      </div>
      ${fresh.length ? `<div class="card"><h3>Nyt mærke! </h3>${fresh.map((b) => `<p style="font-size:18px">${b.icon} <b>${b.name}</b></p>`).join('')}</div>` : ''}
      ${session.painAfter >= 6 ? '<div class="card warn">Ryggen gør ret ondt efter træningen. Fortæl det til din mor/far, og vælg en let dag i morgen.</div>' : ''}
      <a class="btn big" href="#/">Tilbage til forsiden</a>`;
  }

  $view.addEventListener('click', onQuit);
  cleanup.push(() => $view.removeEventListener('click', onQuit));
  function onQuit(e) {
    if (!e.target.closest('[data-act="quit"]')) return;
    if (confirm('Vil du stoppe træningen? Den bliver ikke gemt.')) location.hash = '#/';
  }

  showPainBefore();
}

// ---------------- Fremgang ----------------
let calMonth = null;
function calendarHtml(month) {
  const days = store.doneDays();
  const club = store.getState().profile.clubDays;
  const y = month.getFullYear(), m = month.getMonth();
  const first = new Date(y, m, 1);
  const offset = (first.getDay() + 6) % 7;
  const n = new Date(y, m + 1, 0).getDate();
  const today = dateKey();
  let cells = ['man', 'tir', 'ons', 'tor', 'fre', 'lør', 'søn'].map((d) => `<div class="dow">${d}</div>`).join('');
  cells += '<div></div>'.repeat(offset);
  for (let d = 1; d <= n; d++) {
    const dt = new Date(y, m, d);
    const k = dateKey(dt);
    cells += `<div class="d ${days.has(k) ? 'on' : ''} ${k === today ? 'today' : ''} ${club.includes(dt.getDay()) ? 'club' : ''}">${d}</div>`;
  }
  return `<div class="cal-head"><button class="icon-btn" data-cal="-1" aria-label="Forrige måned">‹</button>
    <b>${MONTHS[m]} ${y}</b><button class="icon-btn" data-cal="1" aria-label="Næste måned">›</button></div>
    <div class="cal">${cells}</div>
    <p class="muted small" style="margin-top:8px">● Blå = trænet · <span style="color:var(--accent)">▁</span> streg = klubdag</p>`;
}

function viewProgress() {
  setTab('fremgang');
  const st = store.getState();
  calMonth = calMonth || new Date(new Date().getFullYear(), new Date().getMonth(), 1);
  const earned = new Set(store.earnedBadges().map((b) => b.id));
  const recent = [...st.sessions].reverse().slice(0, 15);
  $view.innerHTML = `
    <h1>Fremgang</h1>
    <div class="stats">
      <div class="stat"><b>🔥 ${store.streak()}</b><span>dage i træk</span></div>
      <div class="stat"><b>${store.bestStreak()}</b><span>bedste stime</span></div>
      <div class="stat"><b>${store.daysInLast(30)}</b><span>dage sidste 30</span></div>
    </div>
    <div class="card" id="cal">${calendarHtml(calMonth)}</div>
    <h2>Smerte</h2>
    <div class="card">${painChart(st.sessions)}</div>
    <h2>Mærker</h2>
    <div class="badges">${store.BADGES.map((b) => `<div class="badge ${earned.has(b.id) ? '' : 'off'}"><b>${b.icon}</b>${b.name}</div>`).join('')}</div>
    <h2>Seneste træninger</h2>
    <div class="card">${recent.length ? `<ul class="list">${recent.map((s) => {
      const d = parseKey(s.date);
      return `<li><div style="width:100%"><div class="topline"><b>${DOW_LONG[d.getDay()]} ${d.getDate()}/${d.getMonth() + 1}</b><span class="muted small">${Math.max(1, Math.round((s.durationSec || 0) / 60))} min · smerte ${s.painBefore ?? '–'}→${s.painAfter ?? '–'}</span></div>
        <div class="muted small">${esc(s.programName)}${s.skipped?.length ? ` · sprang ${s.skipped.length} over` : ''}</div>${s.note ? `<div class="small">“${esc(s.note)}”</div>` : ''}</div></li>`;
    }).join('')}</ul>` : '<p class="muted">Ingen træninger endnu. Din første er kun 10 minutter væk! 💪</p>'}</div>
    <button class="btn big light" data-share>📤 Send status til mor/far</button>
  `;
  $view.querySelector('#cal').addEventListener('click', (e) => {
    const b = e.target.closest('[data-cal]');
    if (!b) return;
    calMonth = new Date(calMonth.getFullYear(), calMonth.getMonth() + Number(b.dataset.cal), 1);
    $view.querySelector('#cal').innerHTML = calendarHtml(calMonth);
  });
  $view.querySelector('[data-share]').addEventListener('click', async () => {
    const last = st.sessions.slice(-7).map((s) => `${s.date}: ${s.programName}, smerte ${s.painBefore ?? '–'}→${s.painAfter ?? '–'}${s.note ? ` (“${s.note}”)` : ''}`).join('\n');
    const text = `${st.profile.name}s rygtræning\n🔥 ${store.streak()} dage i træk · ${store.daysInLast(7)} af de sidste 7 dage · ${st.sessions.length} i alt\n\n${last}`;
    try {
      if (navigator.share) await navigator.share({ text });
      else { await navigator.clipboard.writeText(text); toast('Kopieret – sæt det ind i en besked'); }
    } catch { /* annulleret */ }
  });
}

// ---------------- Info ----------------
function viewInfo() {
  setTab('info');
  $view.innerHTML = `
    <h1>Om ryggen</h1>
    <p class="muted">Gode råd, så træningen hjælper og ikke gør skade.</p>

    <h2>Smerte-trafiklyset 🚦</h2>
    <div class="card traffic">
      <div><span class="dot" style="background:var(--ok)"></span><div><b>0–2: Grønt</b><br>Fint! Fortsæt som planlagt.</div></div>
      <div><span class="dot" style="background:var(--warn)"></span><div><b>3–5: Gult</b><br>Okay, hvis det ikke bliver værre under øvelsen og er væk igen næste dag. Lav den lettere version.</div></div>
      <div><span class="dot" style="background:var(--bad)"></span><div><b>6–10: Rødt</b><br>Stop øvelsen. Vælg "Let dag" og fortæl det til din mor/far.</div></div>
    </div>

    <h2>Undgå lige nu 🚫</h2>
    <div class="card"><p>Det gør ondt, når du bøjer forover. Derfor er det smart at skåne den bevægelse lidt, mens ryggen bliver stærkere:</p>
      <ul class="plain">
        <li>Sit-ups og crunches</li>
        <li>Stående "rør tæerne"-stræk og pike-stræk med krum ryg</li>
        <li>At løfte tunge ting med krum ryg. Brug <a href="#/ovelse/hinge">hoftehængslet</a></li>
        <li>At sidde sammensunket i lang tid. Rejs dig hvert 30. minut</li>
      </ul>
      <p class="small muted">Tal med din træner om, hvilke øvelser til træning du skal være forsigtig med lige nu.</p>
    </div>

    <h2>Gode vaner ✅</h2>
    <div class="card"><ul class="plain">
      <li>Bøj i hofterne, ikke i lænden, når du samler noget op eller tager sko på.</li>
      <li>Varm godt op før træning. Klubdagsprogrammet er en god start.</li>
      <li>Søvn og mad er en del af træningen. Ryggen bliver stærkere, når du hviler.</li>
      <li>Lidt hver dag er bedre end meget en gang imellem.</li>
    </ul></div>

    <h2>Fortæl det til en voksen og tal med en læge, hvis… 🩺</h2>
    <div class="card warn"><ul class="plain">
      <li>smerterne stråler ned i benet (især under knæet)</li>
      <li>du får prikken, sovende fornemmelse eller føler dig svag i benene</li>
      <li>det gør ondt om natten eller i hvile</li>
      <li>du har feber eller føler dig syg samtidig</li>
      <li>du får problemer med at tisse eller holde på det</li>
      <li>det kom efter et fald eller en hård landing</li>
      <li>det ikke bliver bedre efter 2–3 uger med øvelserne</li>
    </ul></div>

    <p class="muted small">Appen er ikke en erstatning for en fysioterapeut eller læge. Har du fået øvelser af en fysioterapeut, så følg dem først.</p>
  `;
}

// ---------------- Indstillinger ----------------
function icsFile(time, name) {
  const [h, m] = time.split(':');
  const d = new Date(); d.setDate(d.getDate() + 1);
  const z = (n) => String(n).padStart(2, '0');
  const ymd = `${d.getFullYear()}${z(d.getMonth() + 1)}${z(d.getDate())}`;
  const end = new Date(d); end.setHours(Number(h), Number(m) + 20);
  const url = location.href.split('#')[0].split('?')[0];
  return [
    'BEGIN:VCALENDAR', 'VERSION:2.0', 'PRODID:-//Rygtraening//DA', 'CALSCALE:GREGORIAN', 'BEGIN:VEVENT',
    `UID:rygtraening-${Date.now()}@app`, `DTSTAMP:${ymd}T000000`,
    `DTSTART:${ymd}T${z(h)}${z(m)}00`, `DTEND:${ymd}T${z(end.getHours())}${z(end.getMinutes())}00`,
    'RRULE:FREQ=DAILY', `SUMMARY:Rygtræning ${name} 💪`, `DESCRIPTION:10 min rygtræning: ${url}`, `URL:${url}`,
    'BEGIN:VALARM', 'ACTION:DISPLAY', 'DESCRIPTION:Tid til rygtræning 💪', 'TRIGGER:PT0M', 'END:VALARM',
    'END:VEVENT', 'END:VCALENDAR',
  ].join('\r\n');
}

function viewSettings() {
  setTab('');
  const st = store.getState();
  const prof = st.profile;
  const syncOn = store.syncEnabled();
  $view.innerHTML = `
    <div class="topline"><a class="icon-btn" href="#/" aria-label="Tilbage">‹</a><h1 style="flex:1">Indstillinger</h1></div>
    <div class="card" style="margin-top:14px">
      <label class="field"><span>Navn</span><input id="name" value="${esc(prof.name)}" maxlength="30"></label>
      <label class="field"><span>Planen startede</span><input id="start" type="date" value="${prof.startDate}"></label>
      <label class="field"><span>Fase</span>
        <select id="phase">
          <option value="auto">Automatisk (efter antal uger)</option>
          ${PHASES.map((p) => `<option value="${p.n}">Fase ${p.n}: ${p.name}</option>`).join('')}
        </select></label>
      <div class="field"><span style="display:block;font-weight:600;margin-bottom:6px">Klubtræning (kort program)</span>
        <div class="days">${[1, 2, 3, 4, 5, 6, 0].map((d) => `<label><input type="checkbox" value="${d}" ${prof.clubDays.includes(d) ? 'checked' : ''}><span>${DOW[d]}</span></label>`).join('')}</div></div>
      <button class="btn big" data-save>Gem</button>
    </div>

    <h2>Daglig påmindelse ⏰</h2>
    <div class="card">
      <p class="small">Læg en gentagende aftale i iPhone-kalenderen med en påmindelse hver dag.</p>
      <label class="field"><span>Tidspunkt</span><input id="time" type="time" value="${prof.reminderTime}"></label>
      <button class="btn big light" data-ics>📅 Tilføj til kalender</button>
      <p class="muted small" style="margin-top:10px">Virker det ikke? Åbn appen i Safari og prøv igen. Du kan også bruge "Påmindelser"-appen: Ny påmindelse → "Rygtræning" → Dato og tid → Gentag: Dagligt.</p>
    </div>

    <h2>Installer på iPhone 📲</h2>
    <div class="card"><ol class="steps">
      <li>Åbn linket i <b>Safari</b>.</li>
      <li>Tryk på Del-knappen <b>⬆︎</b> nederst.</li>
      <li>Vælg <b>"Føj til hjemmeskærm"</b>.</li>
      <li>Åbn altid appen fra ikonet. Så husker den din træning.</li>
    </ol></div>

    <h2>Deling med mor/far 👨‍👩‍👧</h2>
    <div class="card">${syncOn
      ? `<p>✅ Dine træninger deles automatisk med dine forældre.</p><button class="btn light" data-sync>Synkroniser nu</button>`
      : st.familyKey
        ? '<p class="muted">Familienøglen er gemt, men databasen er ikke sat op endnu.</p>'
        : '<p class="muted">Ikke sat op. Bed din mor/far om at sende dig det specielle link til appen.</p>'}
    </div>

    <h2>Backup</h2>
    <div class="card row">
      <button class="btn light" data-export>Gem backup</button>
      <label class="btn light" style="margin:0">Hent backup<input type="file" accept="application/json" id="import" hidden></label>
    </div>
    <p class="muted small center">Version 1.0</p>
  `;
  $view.querySelector('#phase').value = prof.phaseMode;
  $view.querySelector('[data-save]').addEventListener('click', () => {
    store.updateProfile({
      name: $view.querySelector('#name').value.trim() || 'Laura',
      startDate: $view.querySelector('#start').value || prof.startDate,
      phaseMode: $view.querySelector('#phase').value,
      clubDays: [...$view.querySelectorAll('.days input:checked')].map((i) => Number(i.value)),
    });
    toast('Gemt ✓');
  });
  $view.querySelector('[data-ics]').addEventListener('click', () => {
    const t = $view.querySelector('#time').value || '17:00';
    store.updateProfile({ reminderTime: t });
    const blob = new Blob([icsFile(t, prof.name)], { type: 'text/calendar' });
    const a = document.createElement('a');
    a.href = URL.createObjectURL(blob); a.download = 'rygtraening.ics';
    document.body.appendChild(a); a.click(); a.remove();
  });
  $view.querySelector('[data-sync]')?.addEventListener('click', async () => {
    const r = await store.sync();
    toast(r.ok ? 'Synkroniseret ✓' : 'Ingen forbindelse – prøver igen senere');
  });
  $view.querySelector('[data-export]').addEventListener('click', () => {
    const blob = new Blob([JSON.stringify(store.getState(), null, 2)], { type: 'application/json' });
    const a = document.createElement('a');
    a.href = URL.createObjectURL(blob); a.download = `rygtraening-backup-${dateKey()}.json`;
    document.body.appendChild(a); a.click(); a.remove();
  });
  $view.querySelector('#import').addEventListener('change', async (e) => {
    const f = e.target.files[0];
    if (!f) return;
    try {
      const data = JSON.parse(await f.text());
      if (!Array.isArray(data.sessions)) throw new Error();
      const st2 = store.getState();
      const have = new Set(st2.sessions.map((s) => s.id));
      data.sessions.filter((s) => s && s.id && !have.has(s.id)).forEach((s) => store.addSession({ ...s, synced: false }));
      toast('Backup hentet ✓');
      store.sync();
    } catch { toast('Filen kunne ikke læses'); }
  });
}

// ---------------- Router ----------------
function route() {
  reset();
  const h = location.hash.replace(/^#\/?/, '');
  const [page, arg] = h.split('/');
  window.scrollTo(0, 0);
  switch (page) {
    case '': return viewHome();
    case 'plan': return viewPlan();
    case 'ovelser': return viewExercises();
    case 'ovelse': return viewExercise(arg);
    case 'traen': return viewTrain(arg);
    case 'fremgang': return viewProgress();
    case 'info': return viewInfo();
    case 'indstillinger': return viewSettings();
    default: location.hash = '#/';
  }
}

store.load();
window.addEventListener('hashchange', route);
route();
store.sync();
if ('serviceWorker' in navigator && location.protocol === 'https:') navigator.serviceWorker.register('sw.js');
