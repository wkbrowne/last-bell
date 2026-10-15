'use strict';
// BUG HUNT: checks that drive the real game by taps and report what breaks. Not loaded by the game itself.
// In the browser console:   const s = document.createElement('script'); s.src = 'tests/hunt.js'; document.head.appendChild(s);
// then                       await HUNT.all()          (or one probe: HUNT.layout(), HUNT.engine(), HUNT.story(), HUNT.saves(), HUNT.screens())
// Each probe returns a list of findings; an empty list means it passed.
window.HUNT = {
  finds: null,
  add(k, ex) { const f = this.finds; (f[k] = f[k] || { n: 0, ex }).n++; },
  out() { return Object.entries(this.finds).sort((a, b) => b[1].n - a[1].n).map(([k, v]) => v.n + 'x ' + k + (v.ex ? ' :: ' + v.ex : '')); },
  fresh(grade) { UI.stack.length = 0; Script.n = 0; G = newState(); G.learn.grade = grade || 2; G.flags.starter = true; G.party = [makeCritter('scrapup', 5)]; Scene = 'black'; },

  // 1. Every question card, in every state, must fit on the screen and never cover its own buttons.
  async layout(ms) {
    this.finds = {}; const real = text; let maxY = 0, cards = 0; const t0 = performance.now(), mute = Snd.muted; Snd.muted = true;
    text = function (s, x, y, c, a) { const px = parseInt((ctx.font.match(/(\d+)px/) || [0, 20])[1]); if (y + px > maxY) maxY = y + px; return real(s, x, y, c, a); };
    try {
      this.fresh();
      for (let g = 2; g <= 6 && performance.now() - t0 < (ms || 30000); g++) { G.learn.grade = g;
        for (const s of Learn.forGrade(g)) for (let i = 0; i < 8; i++) {
          let q; try { q = Learn.make(s.id); } catch (e) { this.add('make threw ' + s.id + ' g' + g, e.message); break; }
          UI.stack.length = 0; const tag = s.id + ' g' + g + ' ' + (q.type || 'mc') + (q.passage ? ' passage' : '') + (q.pic ? ' pic' : '');
          try {
            Learn.card(q, 'BRAIN BLAST!'); const m = UI.stack[0]; cards++;
            const check = state => { maxY = 0; m.draw(); const hs = m.hits || [], low = Math.max(0, ...hs.map(h => h.y + h.h));
              if (maxY > 716) this.add('text runs off the bottom (' + state + ') ' + tag, Math.round(maxY) + ' | ' + q.q.slice(0, 50));
              if (low > 712) this.add('button off the bottom (' + state + ') ' + tag, Math.round(low) + ' | ' + q.q.slice(0, 50));
              return hs; };
            let hs = check('fresh');
            if ((q.type || 'mc') === 'mc') { const w = hs.filter(h => h.i !== q.a); if (w[0]) { m.tap(w[0].x + 10, w[0].y + 5); check('hint'); const w2 = (m.hits || []).filter(h => h.i !== q.a && h.i !== w[0].i); if (w2[0]) { m.tap(w2[0].x + 10, w2[0].y + 5); check('answer shown'); } } }
            else if (q.type === 'num') { const k = hs.find(h => h.k === '1'), ok = hs.find(h => h.k === 'OK'); m.tap(k.x + 5, k.y + 5); m.tap(ok.x + 5, ok.y + 5); check('hint'); m.tap(k.x + 5, k.y + 5); m.tap(ok.x + 5, ok.y + 5); check('answer shown'); }
            else { const w = hs.find(h => h.i < q.choices.length && !q.as.includes(h.i)), sub = hs.find(h => h.i === q.choices.length); m.tap(w.x + 10, w.y + 5); m.tap(sub.x + 10, sub.y + 5); check('answer shown'); }
          } catch (e) { this.add('card threw ' + tag, (e.stack || e.message).split('\n').slice(0, 2).join(' | ')); }
        }
      }
    } finally { text = real; UI.stack.length = 0; Snd.muted = mute; }
    return { probe: 'layout', cards, finds: this.out() };
  },

  // 2. The learning engine: thousands of answers across grades and days must never throw, stall or corrupt its records.
  async engine() {
    this.finds = {}; const realDay = Learn.day, realB = Learn.builder; let day = 40000, asked = 0;
    Learn.day = () => day; Learn.builder = async function () { G.learn.build = null; };
    try {
      for (let g = 2; g <= 6; g++) { this.fresh(g); const seen = {};
        for (let d = 0; d < 40; d++) { day = 40000 + d * (d % 7 === 6 ? 3 : 1);
          for (let i = 0; i < 25; i++) {
            let q; try { q = Learn.next(); } catch (e) { this.add('next() threw g' + g, (e.stack || e.message).split('\n').slice(0, 2).join(' | ')); break; }
            asked++;
            if (!q || !SKILLS[q.skill]) { this.add('next() gave no skill g' + g, JSON.stringify(q).slice(0, 80)); continue; }
            if (!q.choices || q.choices.length < 2 || (q.type !== 'multi' && (q.a == null || q.a < 0))) this.add('bad question from next() ' + q.skill + ' g' + g, q.q.slice(0, 60));
            if (q.type === 'num' && !/^[\d,]+(\.\d+)?$/.test(String(q.ans))) this.add('typed question with an untypeable answer ' + q.skill, q.q.slice(0, 50) + ' -> ' + q.ans);
            if (q.type === 'num' && /\b(Which|Select)\b/.test(q.q)) this.add('typed question that needs its choices ' + q.skill, q.q.slice(0, 60));
            const s = SKILLS[q.skill]; if (!q.noRec && (g < s.g[0] || g > s.g[1])) this.add('out-of-grade skill dealt ' + q.skill + ' g' + g);
            seen[q.skill] = (seen[q.skill] || 0) + 1;
            try { if (!q.noRec) Learn.record(q, Math.random() < (i % 5 === 0 ? .3 : .85)); } catch (e) { this.add('record() threw ' + q.skill, (e.stack || e.message).split('\n').slice(0, 2).join(' | ')); }
            try { for (const c of q.choices) if (q.type !== 'multi' && c !== q.choices[q.a]) { const h = Learn.hintFor(q, c); if (!h || typeof h !== 'string' || /undefined|NaN|\[object/.test(h)) this.add('bad hint ' + q.skill, String(h).slice(0, 60)); } } catch (e) { this.add('hintFor() threw ' + q.skill, e.message); }
          }
          const txt = JSON.stringify(G.learn); if (/NaN|null,null|undefined/.test(txt)) this.add('learning record has NaN/undefined g' + g, (txt.match(/.{30}(NaN|undefined).{20}/) || [''])[0]);
          if (txt.length > 60000) this.add('learning record is growing too large g' + g, txt.length + ' bytes on day ' + d);
          try { G = JSON.parse(JSON.stringify(G)); } catch (e) { this.add('save does not survive JSON g' + g, e.message); }   // every day, as if saved and reloaded
        }
        for (const s of Learn.forGrade(g)) if (!seen[s.id] && s.needs !== 'speech') this.add('skill never dealt in 1000 questions: ' + s.id + ' g' + g);
        const [m, n] = Learn.progress(); if (!(m >= 0 && m <= n)) this.add('progress() is wrong g' + g, m + '/' + n);
      }
    } finally { Learn.day = realDay; Learn.builder = realB; }
    return { probe: 'engine', asked, finds: this.out() };
  },

  // drives real frames by hand, so it works even when the tab is hidden
  T: 0, raf: null,
  async frames(n, each) { if (!this.raf) { this.raf = window.requestAnimationFrame; window.requestAnimationFrame = () => 0; this.T = performance.now() + 5e5; }
    for (let i = 0; i < n; i++) { this.T += 16.7; if (each && each(i) === false) return false; frame(this.T); await null; if (i % 120 === 0) await new Promise(r => setTimeout(r, 0)); } return true; },
  release() { if (this.raf) { window.requestAnimationFrame = this.raf; this.raf = null; requestAnimationFrame(frame); } },

  // 3. The whole story, start to finish, by taps only (battles are skipped as wins). Nothing may throw or get stuck.
  async story(maxFrames) {
    this.finds = {}; const errs = [], onErr = e => errs.push((e.message || (e.reason && (e.reason.stack || e.reason.message)) || String(e.reason)).split('\n').slice(0, 2).join(' | '));
    addEventListener('error', onErr); addEventListener('unhandledrejection', onErr);
    const realRun = Battle.run, realBoss = typeof bossFight === 'function' ? bossFight : null, realCard = Learn.card, mute = Snd.muted; Snd.muted = true; Touch.enabled = true;
    Battle.run = async () => 'win'; if (realBoss) bossFight = async () => true;
    let plan = [], cur = null; Learn.card = function (q, t, m) { cur = q; const type = q.type || 'mc'; plan = m && m.demo ? [] : type === 'num' ? String(q.ans).replace(/,/g, '').split('').map(c => ({ k: c })).concat([{ k: 'OK' }]) : type === 'multi' ? q.as.map(i => ({ i })).concat([{ i: q.choices.length }]) : [{ i: q.a }]; const p = realCard.call(this, q, t, m); p.then(() => { if (cur === q) cur = null; }); return p; };
    const steps = []; let last = '', lastChange = 0, f = 0, lastFlag = '';
    try {
      UI.stack.length = 0; Script.n = 0; G = newState(); script(() => Story.intro());
      const ok = await this.frames(maxFrames || 60000, i => {
        f = i; for (const d of ['up', 'down', 'left', 'right']) Input.held[d] = false; const top = UI.stack[UI.stack.length - 1];
        if (i % 6 === 0 && (top || Scene !== 'world' || Script.n > 0)) { let pt = { x: 480, y: 610 }; const hs = top && top.hits; if (hs && hs.length) { let h = null; if (cur && plan.length) { const w = plan[0]; h = hs.find(r => w.k != null ? r.k === w.k : r.i === w.i); if (h) plan.shift(); } else if (!cur) h = hs[0]; if (h) pt = { x: h.x + h.w / 2, y: h.y + h.h / 2 }; } Input.taps.push(pt); }
        if (G && !top && Scene === 'world' && Script.n === 0) { PL.grace = 99; const hx = G.x, hy = G.y; if (PL.moving) { G.x = PL.tx; G.y = PL.ty; } Guide.key = null; Guide.solve(); const p = Guide.path, t = Guide.tgt, gx = G.x, gy = G.y; G.x = hx; G.y = hy;
          if (!t || flag('cleared')) return flag('cleared') ? false : undefined;
          const nx = p.length > 1 ? p[1] : [t.x, t.y], dx = nx[0] - gx, dy = nx[1] - gy, dir = dx > 0 ? 'right' : dx < 0 ? 'left' : dy > 0 ? 'down' : dy < 0 ? 'up' : null; if (dir) Input.held[dir] = true; if (p.length <= 1 && i % 6 === 3) Input.presses.push('a'); }
        const fl = G ? Object.keys(G.flags).filter(k => !/^z_|^st_|^comic/.test(k)).join() : ''; if (fl !== lastFlag) { lastFlag = fl; steps.push(i + ':' + fl.split(',').pop()); }
        const s = !G ? Scene : Scene + '|' + UI.stack.length + '|' + G.map + '|' + G.x + ',' + G.y + '|' + G.learn.total + '|' + fl.length + '|' + (cur ? cur.q.slice(0, 20) + plan.length : '');
        if (s !== last) { last = s; lastChange = i; } else if (i - lastChange > 2400) { this.add('STUCK for 40 seconds', 'at ' + s + ' | top modal: ' + (top ? Object.keys(top).join('/') : 'none') + ' | goal: ' + (G && G.obj)); return false; }
      });
      if (ok && !flag('cleared')) this.add('story not finished in the frame budget', 'last step ' + steps[steps.length - 1] + ' | goal: ' + (G && G.obj));
    } catch (e) { this.add('story run threw', (e.stack || e.message).split('\n').slice(0, 3).join(' | ')); }
    finally { Battle.run = realRun; if (realBoss) bossFight = realBoss; Learn.card = realCard; Snd.muted = mute; removeEventListener('error', onErr); removeEventListener('unhandledrejection', onErr); for (const d of ['up', 'down', 'left', 'right']) Input.held[d] = false; }
    for (const e of [...new Set(errs)]) this.add('error during story', e);
    return { probe: 'story', frames: f, steps, finished: !!(G && flag('cleared')), finds: this.out() };
  },

  // 4. Old and odd save files must load and keep working.
  async saves() {
    this.finds = {}; const KEY = 'lastbell_save_v1', keep = localStorage.getItem(KEY);
    const tryLoad = (name, obj) => { try { localStorage.setItem(KEY, typeof obj === 'string' ? obj : JSON.stringify(obj)); const ok = loadGame(); if (!ok) { if (name.startsWith('good')) this.add('save refused: ' + name); return; }
        enterWorld(); worldDraw(); for (let i = 0; i < 30; i++) { const q = Learn.next(); if (!q.noRec) Learn.record(q, i % 3 > 0); } Learn.progress(); Learn.standing(); dayState(); saveGame(); JSON.parse(localStorage.getItem(KEY));
      } catch (e) { this.add('save broke the game: ' + name, (e.stack || e.message).split('\n').slice(0, 2).join(' | ')); } };
    try {
      this.fresh(); G.map = 'world'; G.x = 41; G.y = 64; for (let i = 0; i < 40; i++) { const q = Learn.next(); if (!q.noRec) Learn.record(q, i % 4 > 0); } saveGame(); const good = JSON.parse(localStorage.getItem(KEY));
      tryLoad('good: a current save', good);
      const strip = (o, keys) => { const c = JSON.parse(JSON.stringify(o)); const body = c.G || c; for (const k of keys) delete body[k]; return c; };
      tryLoad('good: a save from before shops, eggs and sessions', strip(good, ['gear', 'eggs', 'roosts', 'goal', 'limitMin', 'dayStreak', 'day', 'readAloud', 'guide', 'crew', 'bond', 'saved', 'night']));
      { const c = JSON.parse(JSON.stringify(good)), b = c.G || c; b.learn = { grade: 2, sk: { 'addsub@2': { n: 6, r: 5, miss: 0, m: true, cs: 4 }, 'money@2': { n: 3, r: 1, miss: 2, m: false, cs: 0 } }, right: 6, total: 9, streak: 0, best: 4, recent: [], flip: false }; tryLoad('good: a save with the first version of the learning record', c); }
      { const c = JSON.parse(JSON.stringify(good)), b = c.G || c; b.learn.grade = 6; tryLoad('good: grade changed to 6', c); }
      tryLoad('bad: not JSON', '{oops'); tryLoad('bad: empty object', {}); tryLoad('bad: null', 'null');
    } finally { if (keep == null) localStorage.removeItem(KEY); else localStorage.setItem(KEY, keep); UI.stack.length = 0; Script.n = 0; }
    return { probe: 'saves', finds: this.out() };
  },

  // 5. Every menu and side screen opens, draws and closes by taps without an error.
  async screens() {
    this.finds = {}; const errs = [], onErr = e => errs.push((e.message || (e.reason && (e.reason.stack || e.reason.message)) || String(e.reason)).split('\n').slice(0, 2).join(' | '));
    addEventListener('error', onErr); addEventListener('unhandledrejection', onErr); const mute = Snd.muted; Snd.muted = true; Touch.enabled = true;
    const realCard = Learn.card; let plan = [], cur = null; Learn.card = function (q, t, m) { cur = q; const type = q.type || 'mc'; plan = m && m.demo ? [] : type === 'num' ? String(q.ans).replace(/,/g, '').split('').map(c => ({ k: c })).concat([{ k: 'OK' }]) : type === 'multi' ? q.as.map(i => ({ i })).concat([{ i: q.choices.length }]) : [{ i: q.a }]; const p = realCard.call(this, q, t, m); p.then(() => { if (cur === q) cur = null; }); return p; };
    const open = async (name, fn, taps) => { this.fresh(); G.map = 'world'; G.x = 41; G.y = 64; G.scrap = 500; G.flags.priya = true; enterWorld(); const n0 = errs.length; let done = false;
      script(async () => { try { await fn(); } catch (e) { this.add('screen threw: ' + name, (e.stack || e.message).split('\n').slice(0, 2).join(' | ')); } done = true; });
      await this.frames(taps || 900, i => { if (done) return false; const top = UI.stack[UI.stack.length - 1]; if (i % 9 !== 0 || !top) return;
        let pt = { x: 480, y: 610 }; const hs = top.hits;
        if (cur && plan.length && hs) { const w = plan[0], h = hs.find(r => w.k != null ? r.k === w.k : r.i === w.i); if (h) { plan.shift(); pt = { x: h.x + h.w / 2, y: h.y + h.h / 2 }; } }   // a question: answer it
        else if (top.close) pt = top.close;                                                                                                   // a menu that can be closed: use its close button
        else if (hs && hs.length && !cur) { const h = hs[hs.length - 1]; pt = { x: h.x + h.w / 2, y: h.y + h.h / 2 }; }                        // a forced choice: take the last one
        Input.taps.push(pt); });
      if (!done) this.add('screen did not close by taps: ' + name, 'still open: ' + UI.stack.length + ' layers');
      for (const e of errs.slice(n0)) this.add('error on screen: ' + name, e); UI.stack.length = 0; Script.n = 0; };
    try {
      await open('pause menu', () => pauseMenu()); await open('options', () => optionsMenu()); await open('study hall', () => Learn.studyHall()); await open('report card', () => Learn.report());
      await open('practice menu', () => Learn.practiceMenu()); await open('team', () => partyMenu()); await open('bag', () => bagMenu()); await open('rest at the Nest', () => restMenu(true));
      await open('day summary', () => daySummary('TEST', 'test')); await open('quick check', () => Learn.placement(), 2500); await open('fact dash', () => Learn.factDash(), 4500);
      await open('practice test', () => Learn.testDay(), 3000); await open('maze dash', () => Learn.mazeDash(), 2500); await open('forge shop', () => nightShop('forge'), 1500); await open('potion shop', () => nightShop('brew'), 1500); await open('magic shop', () => nightShop('magic'), 1500);
      await open('play findings', () => PlayLog.report(), 1500); await open('how was today', async () => { dayState().mood = 0; await PlayLog.mood(); }); await open('lesson', () => Learn.lesson('addsub'), 3000); await open('skill builder', async () => { G.learn.build = { id: 'money', sig: null }; await Learn.builder(); }, 4000);
    } finally { Learn.card = realCard; Snd.muted = mute; removeEventListener('error', onErr); removeEventListener('unhandledrejection', onErr); }
    return { probe: 'screens', finds: this.out() };
  },

  // 6. Real battles by taps: fighting, the bag, swapping, catching, running, winning and losing. None may stall.
  async battles(n) {
    this.finds = {}; const errs = [], onErr = e => errs.push((e.message || (e.reason && (e.reason.stack || e.reason.message)) || String(e.reason)).split('\n').slice(0, 2).join(' | '));
    addEventListener('error', onErr); addEventListener('unhandledrejection', onErr); const mute = Snd.muted; Snd.muted = true; Touch.enabled = true;
    const realCard = Learn.card; let plan = [], cur = null, cards = 0;
    Learn.card = function (q, t, m) { cur = q; cards++; const type = q.type || 'mc', miss = cards % 4 === 0; plan = m && m.demo ? [] : type === 'num' ? String(miss ? 1 : q.ans).replace(/,/g, '').split('').map(c => ({ k: c })).concat([{ k: 'OK' }], miss ? String(q.ans).replace(/,/g, '').split('').map(c => ({ k: c })).concat([{ k: 'OK' }]) : []) : type === 'multi' ? q.as.map(i => ({ i })).concat([{ i: q.choices.length }]) : (miss ? [{ i: (q.a + 1) % q.choices.length }, { i: q.a }] : [{ i: q.a }]); const p = realCard.call(this, q, t, m); p.then(() => { if (cur === q) cur = null; }); return p; };
    const foes = Object.keys(SPECIES).filter(k => !/^(ember|frost|storm|story|bloom|grit)\d/.test(k)), results = {};
    try {
      for (let b = 0; b < (n || 14); b++) {
        this.fresh(2 + b % 3); G.map = 'world'; G.x = 41; G.y = 64; enterWorld(); const strong = b % 3 !== 2, lvl = strong ? 12 : 3;
        G.party = [makeCritter('scrapup', lvl), makeCritter('zaprat', lvl)]; G.bag = Object.assign(G.bag || {}, { snack: 5, soda: 3, potion: 2, venom: 2 }); G.flags.priya = true;
        const sp = foes[(b * 7) % foes.length], opt = { foes: [[sp, strong ? 5 : 30]], kind: b % 5 === 4 ? 'boss' : 'wild', bg: 'grass' }; let done = false, res = null, menus = 0;
        script(async () => { try { res = await Battle.run(opt); if (res === 'lose' && typeof blackout === 'function') await blackout(); else if (typeof afterBattle === 'function') await afterBattle(); } catch (e) { this.add('battle threw vs ' + sp, (e.stack || e.message).split('\n').slice(0, 3).join(' | ')); } done = true; });
        await this.frames(9000, i => { if (done) return false; const top = UI.stack[UI.stack.length - 1]; if (i % 7 !== 0 || !top) return; let pt = { x: 480, y: 610 }; const hs = top.hits;
          if (cur && plan.length && hs) { const w = plan[0], h = hs.find(r => w.k != null ? r.k === w.k : r.i === w.i); if (h) { plan.shift(); pt = { x: h.x + h.w / 2, y: h.y + h.h / 2 }; } }
          else if (hs && hs.length && !cur) { menus++; const pickI = menus % 9 === 4 ? Math.min(hs.length - 1, 2) : menus % 13 === 7 ? Math.min(hs.length - 1, 3) : 0, h = hs[pickI]; pt = { x: h.x + h.w / 2, y: h.y + h.h / 2 }; }
          Input.taps.push(pt); });
        if (!done) this.add('battle did not finish by taps (' + opt.kind + ', ' + (strong ? 'strong team' : 'weak team') + ') vs ' + sp, 'layers open: ' + UI.stack.length + ', scene ' + Scene);
        results[res] = (results[res] || 0) + 1; UI.stack.length = 0; Script.n = 0; if (typeof Battle.on !== 'undefined') Battle.on = false;
      }
    } finally { Learn.card = realCard; Snd.muted = mute; removeEventListener('error', onErr); removeEventListener('unhandledrejection', onErr); }
    for (const e of [...new Set(errs)]) this.add('error during battle', e);
    return { probe: 'battles', results, cards, finds: this.out() };
  },

  // 7. How hard is the start? A plain player (one critter, always the first move, three answers in four right, rests when
  //    the arrow says so) plays from a new game until the first boss is beaten. Not part of all(): it measures, it does not pass or fail.
  async earlyGame(seed, until) {
    seed = seed || 1; until = until || 'coach'; PlayLog.clear(); UI.stack.length = 0; Script.n = 0; const mute = Snd.muted; Snd.muted = true; Touch.enabled = true; G = newState();
    const realCard = Learn.card; let cur = null, plan = [], n = 0, f = 0; const taps = new WeakMap(), digits = v => String(v).replace(/,/g, '').split('').map(c => ({ k: c })).concat([{ k: 'OK' }]);
    Learn.card = function (q, t, m) { cur = q; n++; const type = q.type || 'mc', miss = (n * 7 + seed) % 4 === 0; plan = m && m.demo ? [] : type === 'num' ? (miss ? digits(1).concat(digits(q.ans)) : digits(q.ans)) : type === 'multi' ? q.as.map(i => ({ i })).concat([{ i: q.choices.length }]) : (miss ? [{ i: (q.a + 1) % q.choices.length }, { i: q.a }] : [{ i: q.a }]); const p = realCard.call(this, q, t, m); p.then(() => { if (cur === q) cur = null; }); return p; };
    try {
      script(() => Story.intro());
      await this.frames(60000, i => { f = i; if (G && flag(until)) return false; for (const d of ['up', 'down', 'left', 'right']) Input.held[d] = false; const top = UI.stack[UI.stack.length - 1];
        if (i % 6 === 0 && (top || Scene !== 'world' || Script.n > 0)) { let pt = { x: 480, y: 610 }; const hs = top && top.hits;
          if (cur && plan.length && hs) { const w = plan[0], h = hs.find(r => w.k != null ? r.k === w.k : r.i === w.i); if (h) { plan.shift(); pt = { x: h.x + h.w / 2, y: h.y + h.h / 2 }; } }
          else if (top && hs && hs.length && !cur) { const c = taps.get(top) || 0; taps.set(top, c + 1); if (top.close && c >= 1) pt = top.close; else { const h = hs[0]; pt = { x: h.x + h.w / 2, y: h.y + h.h / 2 }; } }
          else if (top && top.close && !cur) pt = top.close; Input.taps.push(pt); }
        if (G && !top && Scene === 'world' && Script.n === 0) { const hx = G.x, hy = G.y; if (PL.moving) { G.x = PL.tx; G.y = PL.ty; } Guide.key = null; Guide.solve(); const p = Guide.path, t = Guide.tgt, gx = G.x, gy = G.y; G.x = hx; G.y = hy;
          if (t) { const nx = p.length > 1 ? p[1] : [t.x, t.y], dx = nx[0] - gx, dy = nx[1] - gy, dir = dx > 0 ? 'right' : dx < 0 ? 'left' : dy > 0 ? 'down' : dy < 0 ? 'up' : null; if (dir) Input.held[dir] = true; if (p.length <= 1 && i % 6 === 3) Input.presses.push('a'); } } });
    } finally { Learn.card = realCard; Snd.muted = mute; for (const d of ['up', 'down', 'left', 'right']) Input.held[d] = false; }
    const E = PlayLog.load(), be = E.filter(e => e[1] === 'battle-end'), boss = be.filter(e => e[2].kind === 'boss');
    const r = { reached: !!(G && flag(until)), gameMinutes: Math.round(f / 360) / 10, questions: E.filter(e => e[1] === 'q').length, battles: be.length, won: be.filter(e => e[2].res === 'win').length, lost: be.filter(e => e[2].res === 'lose').length, blackouts: E.filter(e => e[1] === 'blackout').length, bossTries: boss.map(e => e[2].foe + ':' + e[2].res), levels: G.party.map(c => c.lvl) };
    UI.stack.length = 0; Script.n = 0; PlayLog.clear(); return r;
  },

  // 8. Act 2, Skyreach: from the end of the story to the storm lifting, by taps, with a grown dragon (battles skipped).
  //    Then the gifts are tried back home, and a second run without a dragon checks the far islands stay shut and say why.
  async sky(maxFrames) {
    this.finds = {}; const errs = [], onErr = e => errs.push((e.message || (e.reason && (e.reason.stack || e.reason.message)) || String(e.reason)).split('\n').slice(0, 2).join(' | '));
    addEventListener('error', onErr); addEventListener('unhandledrejection', onErr);
    const realRun = Battle.run, realCard = Learn.card, realMenu = menu, mute = Snd.muted; Snd.muted = true; Touch.enabled = true; Battle.run = async () => 'win';
    let plan = [], cur = null, items = [], steps = [], f = 0, last = '', lastChange = 0, flights = 0;
    Learn.card = function (q, t, m) { cur = q; const type = q.type || 'mc'; plan = m && m.demo ? [] : type === 'num' ? String(q.ans).replace(/,/g, '').split('').map(c => ({ k: c })).concat([{ k: 'OK' }]) : type === 'multi' ? q.as.map(i => ({ i })).concat([{ i: q.choices.length }]) : [{ i: q.a }]; const p = realCard.call(this, q, t, m); p.then(() => { if (cur === q) cur = null; }); return p; };
    let itemsTop = null; menu = function (its) { items = its.map(i => typeof i === 'string' ? i : i.label); const p = realMenu.apply(this, arguments); itemsTop = UI.stack[UI.stack.length - 1]; return p; };
    const setup = dragonToo => { this.fresh(2); for (const s of Guide.steps) if (!Sky.isSky(s[1]) && s[0] !== 'skyFirst') G.flags[s[0]] = true; Object.assign(G.flags, { priya: true, bash: true, wren: true, antenna: true, heardPriya: true });
      G.party = [makeCritter('scrapup', 40)]; if (dragonToo) G.party.push(makeCritter('ember2', 40)); G.map = 'world'; G.x = 41; G.y = 64; enterWorld(); };
    const drive = (n, stopFlag) => this.frames(n, i => {
      f = i; if (flag(stopFlag)) return false; for (const d of ['up', 'down', 'left', 'right']) Input.held[d] = false; const top = UI.stack[UI.stack.length - 1];
      if (top && top.answer !== undefined) { if (i % 5 === 0) { const a = top.answer; if (a >= 0) top.tap(0, top.ringAt(a)); } return; }   // in flight: steer to the right ring
      if (i % 6 === 0 && (top || Scene !== 'world' || Script.n > 0)) { let pt = { x: 480, y: 610 }; const hs = top && top.hits;
        if (cur && plan.length && hs) { const w = plan[0], h = hs.find(r => w.k != null ? r.k === w.k : r.i === w.i); if (h) { plan.shift(); pt = { x: h.x + h.w / 2, y: h.y + h.h / 2 }; } }
        else if (hs && hs.length && !cur) { const fin = Guide.final(), want = fin ? (fin.map === 'world' ? 'Home' : (Sky.DEST[fin.map] || {}).n) : null; let h = hs[0];
          if (want && items.length && top === itemsTop) { const k = items.findIndex(l => String(l).startsWith(want)); const hh = hs.find(r => r.i === k); if (hh) h = hh; } pt = { x: h.x + h.w / 2, y: h.y + h.h / 2 }; }
        Input.taps.push(pt); }
      if (G && !top && Scene === 'world' && Script.n === 0) { PL.grace = 99; const hx = G.x, hy = G.y; if (PL.moving) { G.x = PL.tx; G.y = PL.ty; } Guide.key = null; Guide.solve(); const p = Guide.path, t = Guide.tgt, gx = G.x, gy = G.y; G.x = hx; G.y = hy;
        if (t) { const nx = p.length > 1 ? p[1] : [t.x, t.y], dx = nx[0] - gx, dy = nx[1] - gy, dir = dx > 0 ? 'right' : dx < 0 ? 'left' : dy > 0 ? 'down' : dy < 0 ? 'up' : null; if (dir) Input.held[dir] = true; if (p.length <= 1 && i % 6 === 3) Input.presses.push('a'); } }
      const fl = Object.keys(G.flags).filter(k => /sky|glide|roar|glow|stormEnd|seen_/.test(k)).join(); if (fl !== steps[steps.length - 1]) steps.push(fl);
      const s = Scene + '|' + UI.stack.length + '|' + G.map + '|' + G.x + ',' + G.y + '|' + fl + '|' + (cur ? cur.q.slice(0, 16) + plan.length : '');
      if (s !== last) { last = s; lastChange = i; } else if (i - lastChange > 2400) { this.add('STUCK for 40 seconds', 'at ' + s + ' | goal: ' + G.obj + ' | menu: ' + items.join(' / ')); return false; } });
    const results = {};
    try {
      // with a grown dragon, all the way through
      setup(true); await drive(maxFrames || 90000, 'stormEnd'); results.finished = flag('stormEnd'); results.flags = Object.keys(G.flags).filter(k => /sky|glide|roar|glow|stormEnd/.test(k));
      if (!flag('stormEnd')) this.add('Act 2 not finished', 'flags ' + results.flags.join() + ' | goal: ' + G.obj);
      // the gifts at home
      const run = async fn => { let done = false; UI.stack.length = 0; Script.n = 0; script(async () => { await fn(); done = true; }); await this.frames(5000, i => { if (done) return false; const top = UI.stack[UI.stack.length - 1]; if (top && top.answer !== undefined) { if (i % 5 === 0 && top.answer >= 0) top.tap(0, top.ringAt(top.answer)); return; } if (i % 6 === 0 && top) { const hs = top.hits; Input.taps.push(hs && hs.length ? { x: hs[0].x + hs[0].w / 2, y: hs[0].y + hs[0].h / 2 } : { x: 480, y: 610 }); } }); return done; };
      G.map = 'world'; G.x = SKYPLACE.padA[0] - 1; G.y = SKYPLACE.padA[1]; enterWorld(); await run(() => Sky.glidePad('out')); results.glideLanded = G.x === SKYPLACE.padB[0] + 1 && G.y === SKYPLACE.padB[1];
      if (!results.glideLanded) this.add('GLIDE did not land on Gull Island', G.x + ',' + G.y);
      await run(() => Sky.friend('gullFriend', 'gloomwing', 'test')); results.friend = flag('gullFriend') && G.party.concat(G.pen).some(c => c.sp === 'gloomwing'); if (!results.friend) this.add('the Gull Island critter did not join');
      for (const [i, t] of SKYPLACE.rubble.entries()) { await run(() => Sky.rubble('rb' + (i + 1))); if (!flag('rb' + (i + 1))) this.add('ROAR did not clear rubble ' + (i + 1)); }
      await run(() => Sky.grove()); if (!flag('grove')) this.add('GLOW did not open the grove');
      for (const k of ['school', 'mall', 'tower']) { await run(() => Sky.roof(k)); if (!flag('roof_' + k)) this.add('rooftop visit failed: ' + k); }
      results.booster = flag('booster');
      G.map = 'gust'; await run(() => Sky.chest('silk')); G.map = 'forge'; await run(() => Sky.chest('glass')); G.map = 'world';
      const brew = SHOPS.brew.stock().find(x => /Sky Tonic/.test(x.n)), magic = SHOPS.magic.stock().find(x => x.n === CHARMS.thunder.n); results.shops = { tonic: brew && !brew.locked, charm: magic && !magic.locked }; if (!results.shops.tonic || !results.shops.charm) this.add('sky items not for sale after finding the ingredients', JSON.stringify(results.shops));
      const realRain = drawRain; let rain = 0; drawRain = function () { rain++; }; G.map = 'world'; G.x = 56; G.y = 57; enterWorld(); worldDraw(); worldDraw(); results.rainInTown = rain; G.x = 48; G.y = 15; enterWorld(); worldDraw(); results.rainAtCemetery = rain - results.rainInTown; drawRain = realRain;
      if (results.rainInTown) this.add('it still rains over the town after the storm is broken'); if (!results.rainAtCemetery) this.add('the cemetery lost its storm too');
      // without a dragon: Gale carries you to the first two islands; the rest stay shut and say why
      setup(false); steps = []; await drive(30000, 'glide');
      await this.frames(900, i => { if (!UI.stack.length && !Script.n) return false; const top = UI.stack[UI.stack.length - 1]; if (i % 6 === 0 && top) { const hs = top.hits; Input.taps.push(hs && hs.length ? { x: hs[0].x + hs[0].w / 2, y: hs[0].y + hs[0].h / 2 } : { x: 480, y: 610 }); } });   // let the shrine finish talking results.noDragonGlide = flag('glide'); if (!flag('glide')) this.add('without a dragon, the first gift could not be earned', 'goal: ' + G.obj);
      results.goalAfterGlide = G.obj; UI.stack.length = 0; Script.n = 0; G.flags.glide = true; G.map = 'gust'; G.x = 15; G.y = 17; enterWorld(); let menuItems = null; menu = function (its) { menuItems = its; return realMenu.apply(this, arguments); };
      await run(() => Sky.perch('gust')); const forge = (menuItems || []).find(x => /Thunder Forge/.test(x.label)); results.forgeShutWithoutDragon = !!(forge && forge.disabled && /dragon/.test(forge.label)); if (!results.forgeShutWithoutDragon) this.add('Thunder Forge is not shut (or does not say why) without a dragon', JSON.stringify(forge));
      results.goalSaysWhy = /dragon/i.test(results.goalAfterGlide = results.goalAfterGlide || ''); if (!results.goalSaysWhy) this.add('the goal does not tell him he needs a grown dragon', G.obj);
    } catch (e) { this.add('sky run threw', (e.stack || e.message).split('\n').slice(0, 3).join(' | ')); }
    finally { Battle.run = realRun; Learn.card = realCard; menu = realMenu; Snd.muted = mute; removeEventListener('error', onErr); removeEventListener('unhandledrejection', onErr); for (const d of ['up', 'down', 'left', 'right']) Input.held[d] = false; UI.stack.length = 0; Script.n = 0; }
    for (const e of [...new Set(errs)]) this.add('error during Act 2', e);
    return { probe: 'sky', frames: f, results, steps, finds: this.out() };
  },

  // 9. The Quest Board: a week of daily quests done by taps (walking with the arrow, battles skipped), brain quests done
  //    by answering, and the weekly trophy. Also: one rescue played as a real battle.
  async quests(days) {
    this.finds = {}; const errs = [], onErr = e => errs.push((e.message || (e.reason && (e.reason.stack || e.reason.message)) || String(e.reason)).split('\n').slice(0, 2).join(' | '));
    addEventListener('error', onErr); addEventListener('unhandledrejection', onErr);
    const realRun = Battle.run, realCard = Learn.card, realDay = Learn.day, mute = Snd.muted; Snd.muted = true; Touch.enabled = true; let day = 60000, plan = [], cur = null, done = 0, f = 0, last = '', lastChange = 0, real = null;
    Learn.day = () => day; Learn.card = function (q, t, m) { cur = q; const type = q.type || 'mc'; plan = m && m.demo ? [] : type === 'num' ? String(q.ans).replace(/,/g, '').split('').map(c => ({ k: c })).concat([{ k: 'OK' }]) : type === 'multi' ? q.as.map(i => ({ i })).concat([{ i: q.choices.length }]) : [{ i: q.a }]; const p = realCard.call(this, q, t, m); p.then(() => { if (cur === q) cur = null; }); return p; };
    const results = { days: [], trophies: 0 };
    try {
      this.fresh(2); for (const s of Guide.steps) if (!Sky.isSky(s[1]) && s[0] !== 'skyFirst') G.flags[s[0]] = true; Object.assign(G.flags, { priya: true, bash: true, wren: true, antenna: true, skyFirst: true, glide: true, roar: true, glow: true, stormEnd: true, skyCall: true, marketLog: true, shop_forge: true, shop_brew: true, shop_magic: true });   // the story is finished, so the arrow belongs to the quests
      G.party = [makeCritter('scrapup', 30), makeCritter('gloop', 30)]; G.seen = { gloop: 1, boltbug: 1 }; G.map = 'world'; G.x = 41; G.y = 64; enterWorld();
      for (let dd = 0; dd < (days || 6); dd++) {
        day = 60000 + dd; Quests.refresh(); const before = Quests.S().done;
        if (dd === 0 && !Quests.open().some(q => q.kind === 'rescue')) { const q = Quests.make('rescue', new Set(Quests.open().map(x => x.spot).filter(x => x != null))); if (q) Quests.S().list.push(q); }   // make sure one rescue is fought for real
        // brain quests: answer questions; a Fact Dash quest is met by reporting a score
        for (let i = 0; i < 30 && Quests.open().some(q => ['right', 'streak'].includes(q.kind)); i++) { const q = Learn.next(); if (!q.noRec) Learn.record(q, true); }
        for (const q of Quests.open().filter(q => q.kind === 'dash')) Quests.event('dash', q.need);
        for (const q of Quests.open().filter(q => q.kind === 'master')) { q.base = -1; Quests.event('master'); }
        for (const q of Quests.open().filter(q => q.kind === 'hunt')) for (let k = q.prog; k < q.need; k++) addCritter(makeCritter(q.sp, 20));
        for (const q of Quests.open().filter(q => q.kind === 'defeat')) Quests.event('defeat', q.t, q.need);   // (wild battles: the bot keeps encounters off while it walks)
        // the rest by walking: follow the arrow and tap; one rescue each run is fought for real
        const wantReal = dd === 0;
        Battle.run = async function (opt) { if (wantReal && !real && opt && /close in/.test(opt.intro || '')) { real = 'started'; const r = await realRun.apply(this, arguments); real = r; return r; } return 'win'; };
        Quests.event('zone', '__');   // (patrol quests complete by walking in; the arrow walks him there)
        await this.frames(16000, i => {
          f = i; const open = Quests.open().filter(q => Quests.target(q)); if (!open.length && !UI.stack.length && !Script.n) return false;
          for (const d of ['up', 'down', 'left', 'right']) Input.held[d] = false; const top = UI.stack[UI.stack.length - 1];
          if (i % 6 === 0 && (top || Scene !== 'world' || Script.n > 0)) { let pt = { x: 480, y: 610 }; const hs = top && top.hits;
            if (cur && plan.length && hs) { const w = plan[0], h = hs.find(r => w.k != null ? r.k === w.k : r.i === w.i); if (h) { plan.shift(); pt = { x: h.x + h.w / 2, y: h.y + h.h / 2 }; } }
            else if (hs && hs.length && !cur) { const h = top.close && Scene !== 'battle' && !(Guide.tgt && Guide.tgt.rest) ? null : hs[0]; pt = h ? { x: h.x + h.w / 2, y: h.y + h.h / 2 } : top.close; }   // in battle: always the first choice (FIGHT, then the first move)
            Input.taps.push(pt); }
          if (G && !top && Scene === 'world' && Script.n === 0) { PL.grace = 99; if (!Quests.S().track || !Quests.open().some(q => q.id === Quests.S().track && Quests.target(q))) { const q = open[0]; if (q) Quests.S().track = q.id; }
            const hx = G.x, hy = G.y; if (PL.moving) { G.x = PL.tx; G.y = PL.ty; } Guide.key = null; Guide.solve(); const p = Guide.path, t = Guide.tgt, gx = G.x, gy = G.y; G.x = hx; G.y = hy;
            if (t) { const nx = p.length > 1 ? p[1] : [t.x, t.y], dx = nx[0] - gx, dy = nx[1] - gy, dir = dx > 0 ? 'right' : dx < 0 ? 'left' : dy > 0 ? 'down' : dy < 0 ? 'up' : null; if (dir) Input.held[dir] = true; if (p.length <= 1 && i % 6 === 3) Input.presses.push('a'); } }
          const s = Scene + '|' + UI.stack.length + '|' + G.map + '|' + G.x + ',' + G.y + '|' + Quests.S().done + '|' + (cur ? cur.q.slice(0, 16) + plan.length : '');
          if (s !== last) { last = s; lastChange = i; } else if (i - lastChange > 2400) { this.add('STUCK for 40 seconds on day ' + dd, 'at ' + s + ' | tracked: ' + JSON.stringify(Quests.tracked()).slice(0, 160)); return false; } });
        const left = Quests.S().list.filter(q => !q.done).map(q => q.kind); if (left.length) this.add('daily quests left unfinished on day ' + dd, left.join(', '));
        results.days.push(Quests.S().done - before);
      }
      results.trophies = Quests.S().trophies.length; results.weekDone = Quests.S().weekDone; results.realRescue = real; results.saved = G.saved.length;
      if (!results.trophies) this.add('no weekly trophy after a week of quests', 'week done ' + Quests.S().weekDone);
      if (real !== 'win' && real !== 'lose' && real !== 'run') this.add('the real rescue battle did not run', String(real));
      // the board itself opens and closes by taps
      let ok = false; UI.stack.length = 0; Script.n = 0; script(async () => { await Quests.board(); ok = true; }); await this.frames(400, i => { if (ok) return false; const top = UI.stack[UI.stack.length - 1]; if (i % 10 === 0 && top) Input.taps.push(top.close || { x: 480, y: 610 }); }); if (!ok) this.add('the Quest Board did not close by taps');
      // an old save without quests loads and gets quests
      const old = JSON.parse(JSON.stringify(G)); delete old.quests; G = Object.assign(newState(), old); Quests.refresh(); if (Quests.S().list.length < 3) this.add('an old save got no quests');
    } catch (e) { this.add('quest run threw', (e.stack || e.message).split('\n').slice(0, 3).join(' | ')); }
    finally { Battle.run = realRun; Learn.card = realCard; Learn.day = realDay; Snd.muted = mute; removeEventListener('error', onErr); removeEventListener('unhandledrejection', onErr); for (const d of ['up', 'down', 'left', 'right']) Input.held[d] = false; UI.stack.length = 0; Script.n = 0; }
    for (const e of [...new Set(errs)]) this.add('error during quests', e);
    return { probe: 'quests', frames: f, results, finds: this.out() };
  },

  async all() { const r = []; for (const p of ['layout', 'engine', 'saves', 'screens', 'battles', 'story', 'sky', 'quests']) { try { r.push(await this[p]()); } catch (e) { r.push({ probe: p, crashed: (e.stack || e.message).split('\n').slice(0, 3).join(' | ') }); } } this.release(); return r; }
};
