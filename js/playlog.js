'use strict';
// PLAY LOG: a diary of what happens during play, kept on this device only, so a grown-up can see where the game
// gets stuck, where sittings trail off, and whether it is fun. Nothing is ever sent anywhere by the game itself.
//   PlayLog.add(kind, detail)   one line in the diary
//   PlayLog.findings()          plain-language conclusions drawn from the last two weeks
//   PlayLog.report()            the grown-up screens (findings, then the export button)
//   PlayLog.csv()               the whole diary as text, for a spreadsheet
// Loaded after game.js: it wraps the game's own functions rather than changing them.
const PlayLog = {
  KEY: 'lastbell_log_v1', MAX: 5000, ev: null, lastInput: 0, idle: false, dirty: 0,
  load() { if (this.ev) return this.ev; try { this.ev = JSON.parse(localStorage.getItem(this.KEY) || '[]'); } catch (e) { this.ev = []; } if (!Array.isArray(this.ev)) this.ev = []; return this.ev; },
  save() { try { localStorage.setItem(this.KEY, JSON.stringify(this.ev)); this.dirty = 0; } catch (e) {} },
  now() { return Date.now(); },
  add(k, d) { const a = this.load(); a.push(d == null ? [this.now(), k] : [this.now(), k, d]); if (a.length > this.MAX) a.splice(0, a.length - this.MAX); if (++this.dirty >= 8 || /away|mood|flag|goal|start/.test(k)) this.save(); },
  clear() { this.ev = []; this.save(); },

  // ---- reading the diary
  // A sitting is a run of events with no gap longer than five minutes. Active minutes ignore long pauses.
  sittings(since) {
    const out = []; let cur = null;
    for (const e of this.load()) { if (since && e[0] < since) continue;
      if (!cur || e[0] - cur.end > 300000 || e[1] === 'start') { cur = { at: e[0], end: e[0], ms: 0, ev: [] }; out.push(cur); }
      cur.ms += Math.min(60000, e[0] - cur.end); cur.end = e[0]; cur.ev.push(e); }
    return out.filter(s => s.ev.length > 2);
  },
  findings(days) {
    const since = this.now() - (days || 14) * 864e5, S = this.sittings(since), E = [].concat(...S.map(s => s.ev)), F = [], min = ms => Math.max(1, Math.round(ms / 60000));
    const count = (arr, key) => { const m = {}; for (const x of arr) { const k = key(x); if (k != null) m[k] = (m[k] || 0) + 1; } return m; };
    const stats = { sittings: S.length, minutes: S.reduce((a, s) => a + s.ms, 0) / 60000, questions: E.filter(e => e[1] === 'q').length, right: E.filter(e => e[1] === 'q' && e[2] && e[2].ok).length };
    if (S.length < 2) return { stats, F: [], note: 'Not enough play recorded yet. Findings appear after two or three sittings.' };
    // 1. a story goal that stays open
    { const goals = E.filter(e => e[1] === 'goal'), lastGoal = goals[goals.length - 1];
      if (lastGoal) { const sit = S.filter(s => s.end > lastGoal[0]), ms = sit.reduce((a, s) => a + s.ev.reduce((b, e, i) => b + (i && e[0] > lastGoal[0] ? Math.min(60000, e[0] - s.ev[i - 1][0]) : 0), 0), 0);
        if (sit.length >= 3 || ms > 30 * 60000) F.push({ w: 3, t: `STUCK: the goal "${String(lastGoal[2]).slice(0, 70)}" has been open for ${sit.length} sittings (${min(ms)} minutes of play).`, fix: 'He may not know where to go or cannot beat what is there. Watch him try it once to see which.' }); } }
    // 2. losing to the same enemy again and again
    { const fights = E.filter(e => e[1] === 'battle-end' && e[2]), lost = count(fights.filter(e => e[2].res === 'lose'), e => e[2].foe), won = count(fights.filter(e => e[2].res === 'win'), e => e[2].foe);
      for (const f in lost) if (lost[f] >= 3 && !won[f]) F.push({ w: 3, t: `TOO HARD: lost to ${f} ${lost[f]} times and has not beaten it yet.`, fix: 'A difficulty spike. Lower that fight, or make sure he rests and levels up first.' });
      const all = fights.length, l = fights.filter(e => e[2].res === 'lose').length; if (all >= 8 && l / all > .4) F.push({ w: 2, t: `LOSING A LOT: ${l} of ${all} battles lost.`, fix: 'Battles overall may be too hard for his team.' }); }
    // 3. what was happening just before he stopped
    { const ended = S.slice(0, -1).concat(this.now() - S[S.length - 1].end > 300000 ? [S[S.length - 1]] : []), why = {};
      for (const s of ended) { const tail = s.ev.filter(e => e[0] > s.end - 120000).map(e => e[1]), k = tail.includes('mood') || tail.includes('wrap') ? 'wrap' : tail.some(x => /lesson|builder/.test(x)) ? 'teach' : tail.includes('blackout') || tail.some(x => x === 'battle-end') && s.ev.filter(e => e[1] === 'battle-end').slice(-1)[0][2].res === 'lose' ? 'loss' : tail.includes('gate') ? 'gate' : tail.filter(x => x === 'q').length >= 3 ? 'questions' : tail.includes('idle') ? 'idle' : 'play'; why[k] = (why[k] || 0) + 1; }
      const n = ended.length, say = { teach: ['STOPS AT TEACHING', 'right after a lesson or the Skill Builder', 'The teaching loop may feel like a punishment. Shorten it or soften how it starts.'], loss: ['STOPS AFTER LOSING', 'right after losing a battle', 'Losing ends the fun. Make the comeback quicker or the loss gentler.'], gate: ['STOPS AT A BLOCKED WAY', 'right after walking into something that is shut', 'He does not know the way around. The goal text or arrow needs to be clearer there.'], questions: ['STOPS DURING QUESTIONS', 'in the middle of a run of questions', 'Too many questions in a row. Space them out with more play.'], idle: ['WANDERS OFF', 'after sitting idle', 'He loses interest without a clear next thing to do.'] };
      for (const k in say) if (why[k] >= 3 || (why[k] >= 2 && why[k] / n >= .4)) F.push({ w: 3, t: `${say[k][0]}: ${why[k]} of ${n} sittings ended ${say[k][1]}.`, fix: say[k][2] });
      stats.endedWell = why.wrap || 0; stats.ended = n; }
    // 4. sittings getting shorter
    if (S.length >= 6) { const h = Math.floor(S.length / 2), avg = a => a.reduce((x, s) => x + s.ms, 0) / a.length, a = avg(S.slice(0, h)), b = avg(S.slice(h)); if (b < a * .7) F.push({ w: 2, t: `SHORTER SITTINGS: about ${min(a)} minutes each at first, now about ${min(b)}.`, fix: 'The novelty may be wearing off. Time for something new, or a bigger reward for the daily goal.' }); }
    // 5. optional things he never does
    if (S.length >= 4) { const did = new Set(E.filter(e => e[1] === 'do').map(e => e[2])), names = { shop: 'the Night Market shops', egg: 'dragon eggs', dash: 'Fact Dash', signal: 'night rescues', study: 'Study Hall' }, never = Object.keys(names).filter(k => !did.has(k)).map(k => names[k]);
      if (never.length >= 3) F.push({ w: 1, t: `NEVER TOUCHED: ${never.join(', ')}.`, fix: 'He may not know these exist. Point one out, or have the story introduce it.' });
      stats.optional = [...did]; }
    // 6. how he says it felt
    { const moods = E.filter(e => e[1] === 'mood'), sad = moods.filter(e => e[2] === 1).length, glad = moods.filter(e => e[2] === 3).length; stats.moods = moods.map(e => e[2]);
      if (moods.length >= 3 && sad / moods.length >= .4) F.push({ w: 3, t: `NOT FUN: ${sad} of ${moods.length} check-ins were a sad face.`, fix: 'Ask him what he did not like. Sad days often follow many misses or a lost battle.' });
      else if (moods.length >= 3 && glad / moods.length >= .6) F.push({ w: 0, t: `GOING WELL: ${glad} of ${moods.length} check-ins were a happy face.`, fix: '' }); }
    // 7. long pauses on one kind of question, and missing a lot
    { const qs = E.filter(e => e[1] === 'q' && e[2]), slow = count(qs.filter(e => e[2].ms > 45000), e => e[2].s), nm = id => (typeof SKILLS !== 'undefined' && SKILLS[id] && SKILLS[id].n) || id;
      for (const s in slow) if (slow[s] >= 3) F.push({ w: 2, t: `LONG PAUSES: took more than 45 seconds on "${nm(s)}" questions ${slow[s]} times.`, fix: 'He is stuck rather than thinking. A lesson on that skill, or sit with him for a few of them.' });
      if (qs.length >= 20) { const r = qs.filter(e => e[2].ok).length / qs.length; stats.accuracy = Math.round(r * 100); if (r < .55) F.push({ w: 3, t: `TOO MANY MISSES: only ${Math.round(r * 100)}% of ${qs.length} questions right.`, fix: 'That is discouraging. Check the grade setting, and run the Quick Check so known skills get a head start.' }); } }
    // 8. bumping into the same closed gate
    { const g = count(E.filter(e => e[1] === 'gate'), e => e[2]), nm = { priya: 'the horde on Elm Street', bash: 'the junkyard gate', wren: 'the fallen tree', broadcast: 'the bus on the bridge', bellTolls: 'the manor gates' }; for (const k in g) if (g[k] >= 4) F.push({ w: 2, t: `KEEPS TRYING A SHUT WAY: walked into ${nm[k] || k} ${g[k]} times.`, fix: 'He thinks that is the way forward. The arrow or goal is not convincing him otherwise.' }); }
    F.sort((a, b) => b.w - a.w);
    return { stats, F, note: F.filter(f => f.w > 0).length ? '' : 'Nothing stands out as a problem in the last two weeks.' };
  },
  csv() {
    const f = this.findings(), q = t => '"' + String(t).replace(/"/g, '""') + '"', L = ['ZOMBIE ZONE play log', 'exported,' + new Date().toISOString(), 'sittings (14 days),' + f.stats.sittings, 'minutes (14 days),' + Math.round(f.stats.minutes), 'questions,' + f.stats.questions, 'right,' + f.stats.right, ''];
    L.push('FINDINGS'); for (const x of f.F) L.push(q(x.t) + ',' + q(x.fix)); if (f.note) L.push(q(f.note)); L.push('', 'time,kind,detail');
    for (const e of this.load()) L.push(new Date(e[0]).toISOString() + ',' + e[1] + ',' + q(e[2] == null ? '' : typeof e[2] === 'object' ? JSON.stringify(e[2]) : e[2]));
    return L.join('\n');
  },
  // hand the file to a grown-up: the tablet's share sheet in the app, a share or a download in a browser
  async exportFile() {
    const text = this.csv(), name = 'zombie-zone-play-log.csv';
    try { if (window.LBShare) { window.LBShare.text('Zombie Zone play log', text); return 'shared'; } } catch (e) {}
    try { if (navigator.canShare && navigator.canShare({ files: [new File([text], name, { type: 'text/csv' })] })) { await navigator.share({ files: [new File([text], name, { type: 'text/csv' })], title: 'Zombie Zone play log' }); return 'shared'; } } catch (e) { if (e && e.name === 'AbortError') return 'cancelled'; }
    try { const a = document.createElement('a'); a.href = URL.createObjectURL(new Blob([text], { type: 'text/csv' })); a.download = name; document.body.appendChild(a); a.click(); a.remove(); return 'saved'; } catch (e) { return 'failed'; }
  },

  // ---- screens
  async report() {
    const f = this.findings(), st = f.stats;
    await page(() => {
      ctx.fillStyle = 'rgba(6,4,14,.92)'; ctx.fillRect(0, 0, W, H); panel(20, 14, W - 40, H - 28);
      setFont(18, true); text('HOW PLAY IS GOING', 44, 34, '#ffd76a');
      setFont(21); text(`Last 14 days:  ${st.sittings} sittings  ·  ${Math.round(st.minutes)} minutes  ·  ${st.questions} questions${st.accuracy != null ? ', ' + st.accuracy + '% right' : ''}${st.moods && st.moods.length ? '  ·  faces: ' + st.moods.map(m => ['', '🙁', '😐', '🙂'][m]).join(' ') : ''}`, 44, 70, '#c8ffb8');
      let y = 108;
      if (f.note) { setFont(23); wrap(f.note, W - 100).forEach(l => { text(l, 44, y, '#f4eeff'); y += 30; }); y += 6; }
      for (const x of f.F.slice(0, 6)) { setFont(21); const a = wrap(x.t, W - 100); a.forEach(l => { text(l, 44, y, x.w >= 3 ? '#ffb07a' : x.w === 0 ? '#a8ffb8' : '#ffd76a'); y += 25; }); if (x.fix) { setFont(19); wrap('→ ' + x.fix, W - 130).forEach(l => { text(l, 66, y, '#cfc7dd'); y += 23; }); } y += 10; if (y > H - 110) break; }
      setFont(19); text('Kept on this device only. Tap to go on.', W - 60, H - 50, '#8f86a8', 'right');
    });
    const c = await ask(null, 'Save or send the full play log? It is a file you can open in a spreadsheet, or pass to whoever is tuning the game.', ['Save / send the log', 'Not now', 'Erase the log']);
    if (c === 0) { const r = await this.exportFile(); await say(null, r === 'failed' ? 'The log could not be saved on this device.' : r === 'cancelled' ? 'Nothing was sent.' : r === 'saved' ? 'Saved as zombie-zone-play-log.csv in your downloads.' : 'Done.'); }
    else if (c === 2 && (await ask(null, 'Erase the whole play log? The game and its progress are not affected.', ['Erase it', 'Keep it'])) === 0) { this.clear(); await say(null, 'The play log is empty now.'); }
  },
  // one tap at the end of a sitting: the only direct measure of fun
  mood() {
    const D = typeof dayState === 'function' ? dayState() : {}; if (D.mood) return Promise.resolve(); D.mood = 1;
    return new Promise(res => {
      const faces = [['🙂', 'Fun!', 3, '#2f9a54'], ['😐', 'It was OK', 2, '#8a7a3a'], ['🙁', 'Not fun', 1, '#8a3a4a']], hits = faces.map((f, i) => ({ x: 130 + i * 240, y: 300, w: 220, h: 230, i }));
      const done = v => { UI.pop(m); if (v) { PlayLog.add('mood', v); Snd.sfx('ok'); } res(); };
      const m = { hits, close: { x: W - 90, y: 150 },
        update(dt, pr) { for (const k of pr) if (k === 'b') done(0); },
        tap(x, y) { const h = hits.find(r => inRect(x, y, r)); if (h) done(faces[h.i][2]); else if (Math.hypot(x - (W - 90), y - 150) < 34) done(0); },
        draw() { ctx.fillStyle = 'rgba(12,6,30,.84)'; ctx.fillRect(0, 0, W, H); panel(90, 110, W - 180, 470); setFont(24, true); text('HOW WAS PLAYING TODAY?', W / 2, 150, '#ffd76a', 'center');
          setFont(24); text('Tap a face.', W / 2, 216, '#c8ffb8', 'center');
          faces.forEach((f, i) => { const r = hits[i]; rbox(r.x, r.y + 5, r.w, r.h, 26, 'rgba(8,4,20,.4)'); rbox(r.x, r.y, r.w, r.h, 26, f[3], '#ffd76a', 3); ctx.font = '110px sans-serif'; ctx.textAlign = 'center'; ctx.textBaseline = 'top'; ctx.fillStyle = '#fff'; ctx.fillText(f[0], r.x + r.w / 2, r.y + 26); setFont(26); text(f[1], r.x + r.w / 2, r.y + 172, '#fff', 'center'); });
          ctx.fillStyle = '#b03a4c'; ctx.strokeStyle = '#ffd76a'; ctx.lineWidth = 3; ctx.beginPath(); ctx.arc(W - 90, 150, 22, 0, 6.3); ctx.fill(); ctx.stroke(); ctx.strokeStyle = '#fff'; ctx.lineWidth = 4; ctx.beginPath(); ctx.moveTo(W - 98, 142); ctx.lineTo(W - 82, 158); ctx.moveTo(W - 82, 142); ctx.lineTo(W - 98, 158); ctx.stroke(); } };
      UI.push(m);
    });
  },

  // ---- wiring: wrap the game's own functions so each one leaves a line in the diary
  wire() {
    const P = this;
    // battles
    { const o = Battle.run; Battle.run = async function (opt) { const t0 = P.now(), foe = opt && opt.foes && opt.foes.length ? opt.foes[opt.foes.length - 1] : null, name = foe ? (foe[2] || (SPECIES[foe[0]] && SPECIES[foe[0]].n) || foe[0]) : '?'; P.add('battle', { kind: opt && opt.kind, foe: name }); const res = await o.apply(this, arguments); P.add('battle-end', { kind: opt && opt.kind, foe: name, res, s: Math.round((P.now() - t0) / 1000) }); return res; }; }
    // questions: which skill, right or wrong, and how long he took
    { const oc = Learn.card; Learn.card = function (q, title, mode) { const t0 = P.now(), p = oc.apply(this, arguments); p.then(() => { q._ms = (q._ms || 0) + P.now() - t0; }); return p; };
      const or = Learn.record; Learn.record = function (q, ok) { if (q && q.q) P.add('q', { s: q.skill, ok: !!ok, ms: Math.round(q._ms || 0) }); return or.apply(this, arguments); }; }
    for (const [fn, kind] of [['builder', 'builder'], ['lesson', 'lesson']]) { const o = Learn[fn]; if (o) Learn[fn] = async function (a) { const t0 = P.now(); P.add(kind, typeof a === 'string' ? a : (G.learn.build && G.learn.build.id) || ''); const r = await o.apply(this, arguments); P.add(kind + '-end', { ok: r, s: Math.round((P.now() - t0) / 1000) }); return r; }; }
    // the optional things: does he ever choose them?
    for (const [fn, what] of [['factDash', 'dash'], ['studyHall', 'study'], ['testDay', 'test'], ['mazeDash', 'maze'], ['workshop', 'writing'], ['placement', 'check']]) { const o = Learn[fn]; if (o) Learn[fn] = function () { P.add('do', what); return o.apply(this, arguments); }; }
    // story progress, places, losses, the wrap-up and the shops (these are plain functions in game.js)
    { const o = setObj; setObj = function (t) { P.add('goal', t); return o.apply(this, arguments); }; }
    { const o = checkZone; checkZone = function () { const z0 = PL.zone, r = o.apply(this, arguments); if (PL.zone !== z0) P.add('zone', PL.zone); return r; }; }
    { const o = blackout; blackout = function () { P.add('blackout'); return o.apply(this, arguments); }; }
    { const o = daySummary; daySummary = async function () { P.add('wrap'); await o.apply(this, arguments); await P.mood(); }; }
    { const o = nightShop; nightShop = function () { P.add('do', 'shop'); return o.apply(this, arguments); }; }
    { const o = eggNest; eggNest = function () { P.add('do', 'egg'); return o.apply(this, arguments); }; }
    if (typeof Story !== 'undefined' && Story.signal) { const o = Story.signal; Story.signal = function () { P.add('do', 'signal'); return o.apply(this, arguments); }; }
  },
  boot() {
    this.load(); this.add('start', (typeof navigator !== 'undefined' && /KF[A-Z0-9]{3,}|Android/.test(navigator.userAgent)) ? 'tablet' : 'browser'); this.lastInput = this.now();
    const touch = () => { if (this.idle) { this.idle = false; this.add('idle-end', Math.round((this.now() - this.lastInput) / 1000)); } this.lastInput = this.now(); };
    for (const ev of ['pointerdown', 'keydown']) addEventListener(ev, touch, true);
    document.addEventListener('visibilitychange', () => { this.add(document.hidden ? 'away' : 'back'); this.save(); });
    addEventListener('pagehide', () => { this.add('away'); this.save(); });
    setInterval(() => { if (!document.hidden && !this.idle && this.now() - this.lastInput > 45000 && typeof G !== 'undefined' && G) { this.idle = true; this.add('idle'); } if (this.dirty) this.save(); }, 5000);
    try { this.wire(); } catch (e) { console.warn('play log wiring', e); }
  }
};
PlayLog.boot();
