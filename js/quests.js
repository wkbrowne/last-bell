'use strict';
// QUEST BOARD: new quests every day, a bigger one every week, built from the places, critters and characters already in
// the game, so there is always something to do after the story. A board stands by the Nest (and "Quests" is in the menu).
//   Daily: three quests a day, one of them a brain quest. Unfinished ones are replaced the next day.
//   Weekly: one bigger quest, and a trophy for finishing five daily quests in the same week.
// Quests finish themselves the moment the goal is met and pay out on the spot. When the story has nothing waiting
// (or is waiting on a grown dragon), the guide arrow and the goal line follow the first unfinished quest.
// Loaded after sky.js and before game.js; the hooks into game.js are made in Quests.init() once everything is loaded.

OB.board = function () { rr(14, 20, 72, 54, 6, '#a8683a'); rr(19, 25, 62, 44, 4, '#d9a866'); ln([30, 74, 30, 96], '#7a5230', 6); ln([70, 74, 70, 96], '#7a5230', 6);
  for (const [x, y, r, c] of [[26, 30, -.1, '#fff6d8'], [48, 28, .08, '#ffe9a8'], [62, 40, -.05, '#fff6d8'], [32, 46, .1, '#d8f0ff']]) { g.save(); g.translate(x, y); g.rotate(r); rr(0, 0, 18, 20, 1, c); ln([3, 6, 15, 6], '#b98a4c', 1.4); ln([3, 11, 13, 11], '#b98a4c', 1.4); dot(9, 1, 2.2, '#e5483d'); g.restore(); }
  el(84, 16, 12, 12, '#ffd24a', 0, true); rr(82, 8, 4, 10, 2, '#2a1840'); dot(84, 22, 2.2, '#2a1840'); };
OB.parcel = function () { glow(50, 66, 34, '#fff59a', .35); rr(24, 50, 52, 38, 4, '#c98f5a'); ln([24, 62, 76, 62], '#8a5f3a', 2); rr(46, 50, 8, 38, 1, '#e5483d'); rr(24, 66, 52, 6, 1, '#e5483d'); el(50, 48, 10, 6, '#e5483d', 0, true); };
SPEAKERS.board = { n: 'Quest Board', spr: 'board', human: false, col: '#ffd76a' };
BADGES.quester = ['Quester', 'Finished a quest from the Quest Board.'];
BADGES.trophy = ['Weekly Champion', 'Finished five Quest Board quests in one week.'];

// ---- where quests happen: spots spread over the town, each found as a free tile near a named place
const QSPOTS = [['the junkyard office', 110, 80], ['Elm Street', 60, 61], ['Pembry Park', 70, 45], ['the school yard', 104, 52], ['downtown', 72, 86], ['the Lost Lot', 38, 76],
  ['the harbor', 16, 80], ['the hospital lot', 12, 52], ['the cemetery', 44, 16], ['Radio Hill', 96, 20], ['Whisperwood', 44, 36], ['Maple Court', 46, 50]];
{ const M = MAPS.world.m, used = new Set();
  const free = (x0, y0) => { for (let r = 0; r < 14; r++) for (let dy = -r; dy <= r; dy++) for (let dx = -r; dx <= r; dx++) { if (Math.max(Math.abs(dx), Math.abs(dy)) !== r) continue; const x = x0 + dx, y = y0 + dy, c = M.get(x, y);
      if (!'.:=-'.includes(c) || used.has(x + ',' + y) || ENT.some(e => e.map === 'world' && Math.abs(e.x - x) + Math.abs(e.y - y) < 2)) continue;
      if (!'.:=-'.includes(M.get(x, y + 1))) continue; used.add(x + ',' + y); return [x, y]; } return [x0, y0]; };
  QSPOTS.forEach((s, i) => { const [x, y] = free(s[1], s[2]); s.x = x; s.y = y; s.i = i;
    // one character per spot; what it looks like and does depends on today's quest there
    const e = E({ map: 'world', x, y, spr: 'sign', if: () => !!Quests.at(i), act: () => Quests.spotAct(i) });
    Object.defineProperty(e, 'spr', { get() { const q = Quests.at(i); return !q ? 'sign' : q.kind === 'rescue' ? q.look : q.kind === 'bounty' ? q.sp : 'parcel'; } });
    Object.defineProperty(e, 'human', { get() { const q = Quests.at(i); return !!(q && q.kind === 'rescue'); } }); });
}
const QBOARD = (() => { const M = MAPS.world.m; for (const [x, y] of [[44, 64], [45, 64], [38, 64], [44, 65], [38, 65]]) if ('.:=-,'.includes(M.get(x, y)) && !ENT.some(e => e.map === 'world' && e.x === x && e.y === y)) { M.set(x, y, '.'); return [x, y]; } return [44, 64]; })();
E({ map: 'world', x: QBOARD[0], y: QBOARD[1], spr: 'board', act: () => Quests.board() });

const Quests = {
  NPC: { munch: ['Mr. Munch', 'munch', 65, 59], forge: ['Old Clank', 'forge', 38, 72], brew: ['Nana Newt', 'brew', 41, 72], magic: ['Professor Flicker', 'magic', 44, 72] },
  S() { const Q = G.quests || (G.quests = { day: -1, week: -1, list: [], weekly: null, weekDone: 0, trophies: [], done: 0, n: 0 }); return Q; },
  day() { return Learn.day(); },
  week() { return Math.floor((this.day() + 3) / 7); },   // weeks start on Monday
  top() { return Math.max(3, ...G.party.map(c => c.lvl)); },
  // which tiles of the town can be walked to right now (gates still shut keep their side shut)
  reach() {
    const key = Object.keys(G.flags).length + '|' + G.party.length; if (this._reach && this._reachKey === key) return this._reach;
    const M = MAPS.world.m, w = M.w, solid = new Set(ENT.filter(e => e.map === 'world' && e.solid && (!e.if || e.if()) && !QSPOTS.some(s => s.x === e.x && s.y === e.y)).map(e => e.x + e.y * w)), seen = new Set([41 + 64 * w]), q = [41 + 64 * w];
    while (q.length) { const c = q.pop(), x = c % w, y = (c - x) / w; for (const d in DV) { const nx = x + DV[d][0], ny = y + DV[d][1], n = nx + ny * w; if (nx < 0 || ny < 0 || nx >= w || ny >= M.h || seen.has(n) || TINFO[M.t[ny][nx]].s || solid.has(n)) continue; seen.add(n); q.push(n); } }
    this._reachKey = key; return this._reach = seen;
  },
  canReach(x, y) { const s = this.reach(), w = MAPS.world.m.w; return Object.values(DV).some(([dx, dy]) => s.has((x + dx) + (y + dy) * w)); },
  // ---- making quests
  pickSpot(taken) { const ok = QSPOTS.filter(s => !taken.has(s.i) && this.canReach(s.x, s.y)); return ok.length ? pick(ok) : null; },
  make(kind, taken, big) {
    const top = this.top(), Q = this.S(), id = 'q' + (++Q.n), rw = (s, item, qty) => ({ scrap: Math.round(s * (big ? 3 : 1) * (1 + top / 40)), item, qty: (qty || 1) * (big ? 2 : 1) });
    const zoneOf = s => zoneAt('world', s.x, s.y), names = ['Ava', 'Leo', 'Maya', 'Sam', 'Zoe', 'Eli', 'Nina', 'Theo', 'Ruby', 'Max', 'Ivy', 'Owen'];
    if (kind === 'rescue') { const s = this.pickSpot(taken); if (!s) return null; taken.add(s.i); const who = pick(names);
      return { id, kind, spot: s.i, look: 'w' + rint(0, 5), who, title: `Rescue ${who}`, text: `${who} is trapped at ${s[0]} and zombies are closing in. Get there and fight them off!`, need: 1, prog: 0, reward: rw(70, 'soda', 2) }; }
    if (kind === 'bounty') { const s = this.pickSpot(taken); if (!s) return null; taken.add(s.i); const zs = (zoneOf(s).enc || []).map(e => e[0]).filter(sp => SPECIES[sp] && SPECIES[sp].z), sp = zs.length ? pick(zs) : 'shambler', nm = pick(['Grumbles', 'Big Tony', 'Stinkfoot', 'The Moaner', 'Old Chompers', 'Lady Drool', 'Captain Shuffle']);
      return { id, kind, spot: s.i, sp, nm, title: `Bounty: ${nm}`, text: `A Horde Captain called ${nm} (a ${SPECIES[sp].n}) is stomping around ${s[0]}. Beat it for the bounty!`, need: 1, prog: 0, reward: rw(110, 'potion', 1) }; }
    if (kind === 'errand') { const s = this.pickSpot(taken); if (!s) return null; const to = pick(Object.keys(this.NPC).filter(k => k === 'munch' || flag('shop_' + k) || flag('marketLog'))); if (!to) return null; taken.add(s.i); const N = this.NPC[to];
      const what = pick(['a box of spare bolts', 'a crate of glass jars', 'a bag of shiny scrap', 'a stack of old comics', 'a basket of moss', 'a lost lunchbox']);
      return { id, kind, spot: s.i, to, what, title: `Delivery for ${N[0]}`, text: `${N[0]} needs ${what}. It was left at ${s[0]}. Pick it up and bring it over.`, need: 1, prog: 0, got: false, reward: rw(60, 'snack', 3) }; }
    if (kind === 'hunt') { const seen = Object.keys(G.seen || {}).concat(Object.keys(G.dex || {})).filter(sp => SPECIES[sp] && !SPECIES[sp].z && SPECIES[sp].rate > 0 && !SPECIES[sp].dragon), sp = seen.length ? pick(seen) : 'gloop';
      const hp = this.habitat(e => e === sp);
      return { id, kind, sp, x: hp && hp[0], y: hp && hp[1], title: big ? `Befriend 2 ${SPECIES[sp].n}s` : `Befriend a ${SPECIES[sp].n}`, text: `Make friends with ${big ? 'two' : 'a'} ${SPECIES[sp].n}${big ? 's' : ''}: weaken it in battle, then use a Critter Snack.`, need: big ? 2 : 1, prog: 0, reward: rw(80, 'snack', 2) }; }
    if (kind === 'defeat') { // a type he can actually find: one that lives in a part of town he can walk to
      const R = this.reach(), w = MAPS.world.m.w, near = MAPS.world.zones.filter(z => { for (let y = z.r[1]; y < z.r[1] + z.r[3]; y += 2) for (let x = z.r[0]; x < z.r[0] + z.r[2]; x += 2) if (R.has(x + y * w)) return true; return false; }), ts = [].concat(...near.map(z => (z.enc || []).map(e => SPECIES[e[0]] && SPECIES[e[0]].t))).filter(Boolean);
      const t = ts.length ? pick(ts) : 'ROT', n = big ? 15 : rint(3, 5), hp = this.habitat(e => SPECIES[e] && SPECIES[e].t === t);
      return { id, kind, t, x: hp && hp[0], y: hp && hp[1], title: `Defeat ${n} ${t} critters`, text: `Win battles against ${n} ${t}-type critters or zombies. (Zombies are ROT.)`, need: n, prog: 0, reward: rw(70, 'juice', 2) }; }
    if (kind === 'patrol') {   // a zone he can walk into, and the reachable spot nearest its middle for the arrow
      const R = this.reach(), w = MAPS.world.m.w, spot = z => { const cx = z.r[0] + (z.r[2] >> 1), cy = z.r[1] + (z.r[3] >> 1); let best = null, bd = 1e9; for (let y = z.r[1]; y < z.r[1] + z.r[3]; y++) for (let x = z.r[0]; x < z.r[0] + z.r[2]; x++) if (R.has(x + y * w) && zoneAt('world', x, y).id === z.id) { const d = Math.abs(x - cx) + Math.abs(y - cy); if (d < bd) { bd = d; best = [x, y]; } } return best; };
      const zs = MAPS.world.zones.filter(z => z.id !== 'gull' && z.id !== PL.zone).map(z => [z, spot(z)]).filter(a => a[1]); if (!zs.length) return null; const [z, p] = pick(zs);
      return { id, kind, zone: z.id, x: p[0], y: p[1], title: `Patrol ${z.n}`, text: `Walk through ${z.n} and check that everything is okay.`, need: 1, prog: 0, reward: rw(40, 'juice', 1) }; }
    if (kind === 'right') { const n = big ? 60 : pick([10, 15, 20]); return { id, kind, title: `${n} Brain Blasts`, text: `Answer ${n} questions right. Battles, stashes and Study Hall all count.`, need: n, prog: 0, reward: rw(60, 'soda', 1) }; }
    if (kind === 'streak') { const n = big ? 10 : 5; return { id, kind, title: `${n} in a row`, text: `Get ${n} questions right in a row, without a miss.`, need: n, prog: 0, reward: rw(70, 'potion', 1) }; }
    if (kind === 'dash') { const best = G.learn.dash && G.learn.dash.length ? Math.max(...G.learn.dash.map(d => d.n)) : 0, n = Math.max(6, Math.min(25, best ? best - 2 : 8)); return { id, kind, title: `Fact Dash: ${n} or more`, text: `Score ${n} or more in one Fact Dash (Practice & Tests).`, need: n, prog: 0, reward: rw(70, 'slush', 1) }; }
    if (kind === 'master') { return { id, kind, base: Learn.progress()[0], title: 'Master a new skill', text: 'Master one skill you have not mastered yet. Study Hall lessons are a fast way.', need: 1, prog: 0, reward: rw(120, 'slush', 1) }; }
    return null;
  },
  // where to look for a critter or a type: a reachable patch of tall grass in a part of town where it lives
  habitat(match) {
    const R = this.reach(), M = MAPS.world.m, w = M.w, zs = MAPS.world.zones.filter(z => (z.enc || []).some(e => match(e[0]))); let best = null, bd = 1e9;
    for (const z of zs) for (let y = z.r[1]; y < z.r[1] + z.r[3]; y++) for (let x = z.r[0]; x < z.r[0] + z.r[2]; x++) { if (!R.has(x + y * w) || !TINFO[M.t[y][x]].enc || zoneAt('world', x, y).id !== z.id) continue; const d = Math.abs(x - 41) + Math.abs(y - 64) + (Math.random() * 30 | 0); if (d < bd) { bd = d; best = [x, y]; } }
    return best;
  },
  // three a day, one of them a brain quest; one bigger one a week
  refresh() {
    const Q = this.S(), d = this.day(), wk = this.week(); let fresh = false;
    if (Q.week !== wk) { Q.week = wk; Q.weekDone = 0; Q.weekly = this.make(pick(['right', 'defeat', 'master', 'hunt']), new Set(), true); if (Q.weekly) Q.weekly.weekly = 1; fresh = true; }
    if (Q.day !== d) { Q.day = d; const taken = new Set(), list = [];
      for (const kinds of [['rescue', 'bounty', 'errand'], ['hunt', 'defeat', 'patrol', 'rescue', 'errand'], ['right', 'streak', 'dash', 'right']]) { const left = kinds.filter(k => !list.some(q => q.kind === k)); let q = null; for (let t = 0; t < 6 && !q; t++) q = this.make(pick(left.length ? left : kinds), taken); if (q) list.push(q); }   // never the same kind twice in a day
      Q.list = list; fresh = true; }
    if (fresh) { this._new = true; this.sync(); }
    return fresh;
  },
  all() { const Q = this.S(); return Q.list.concat(Q.weekly ? [Q.weekly] : []); },
  open() { return this.all().filter(q => !q.done); },
  at(i) { if (!G || !G.quests) return null; return this.open().find(q => q.spot === i && (q.kind !== 'errand' || !q.got)) || null; },
  // ---- progress
  event(type, a, b) {
    if (!G || !G.quests) return; let any = false;
    for (const q of this.open()) {
      let p = q.prog;
      if (type === 'right' && q.kind === 'right') p++;
      if (type === 'streak' && q.kind === 'streak') p = Math.max(p, a);
      if (type === 'dash' && q.kind === 'dash' && a >= q.need) p = q.need;
      if (type === 'master' && q.kind === 'master' && Learn.progress()[0] > q.base) p = 1;
      if (type === 'catch' && q.kind === 'hunt' && a === q.sp) p++;
      if (type === 'defeat' && q.kind === 'defeat' && a === q.t) p += b || 1;
      if (type === 'zone' && q.kind === 'patrol' && a === q.zone) p = 1;
      if (p !== q.prog) { q.prog = Math.min(q.need, p); any = true; if (q.prog >= q.need) this.complete(q); }
    }
    if (any) this.sync();
  },
  complete(q) {
    if (q.done) return; q.done = true; const Q = this.S(), R = q.reward; G.scrap += R.scrap; if (R.item) give(R.item, R.qty, true); Q.done++;
    if (!q.weekly) Q.weekDone++;
    (this.pending = this.pending || []).push(q);
    if (typeof PlayLog !== 'undefined') PlayLog.add('quest', { kind: q.kind, weekly: !!q.weekly });
  },
  // the fanfare: shown as soon as nothing else is on screen
  async announce() {
    while (this.pending && this.pending.length) {
      const q = this.pending.shift(), R = q.reward, Q = this.S(); Snd.sfx('badge'); Fx.flash = .4; tween(Fx, 'flash', 0, 400);
      await say('board', `★ QUEST COMPLETE: ${q.title} ★\n+${R.scrap} scrap${R.item ? `, ${R.qty} ${ITEMS[R.item].n}${R.qty > 1 ? 's' : ''}` : ''}`, { col: '#ffd76a' });
      await badge('quester');
      if (!q.weekly && Q.weekDone >= 5 && !Q.trophies.includes(Q.week)) { Q.trophies.push(Q.week); G.scrap += 250; give('slush', 2, true); Snd.sfx('levelup');
        await say('board', `★ WEEKLY CHAMPION ★\nFive quests this week! A trophy for the Nest, 250 scrap and 2 Mega Slushes.\nTrophies: ${Q.trophies.length}`, { col: '#ffd76a' }); await badge('trophy'); }
      await checkFeats();
    }
  },
  // ---- the places
  async spotAct(i) {
    const q = this.at(i), s = QSPOTS[i]; if (!q) return; const top = this.top(), z = zoneAt('world', s.x, s.y), lv = d => clamp(top + d + rint(-1, 1), 3, 60);
    if (q.kind === 'rescue') {
      await say(null, `${q.who} is backed against a wall. "Help! They are everywhere!"`);
      const tb = (z.enc || []).map(e => e[0]).filter(sp => SPECIES[sp] && SPECIES[sp].z), f = () => tb.length ? pick(tb) : pick(['shambler', 'sprinter']);
      const r = await Battle.run({ foes: [[f(), lv(-2)], [f(), lv(-1)]], kind: 'wild', bg: z.bg, intro: 'Zombies close in on ' + q.who + '!' });
      if (r === 'lose') { await blackout(); return; } if (r !== 'win') { await say(null, `You backed off. ${q.who} is still waiting for help.`); return; }
      await say(null, `${q.who}: "You came! Thank you, thank you!" ${q.who} heads for the Nest.`); if (!G.saved.includes(q.who)) G.saved.push(q.who);
      q.prog = 1; this.complete(q); this.sync(); await afterBattle(); return;
    }
    if (q.kind === 'bounty') {
      await say(null, `${q.nm}, a Horde Captain, turns around slowly. It has a bounty poster stuck to its back.`);
      const r = await Battle.run({ foes: [[pick(['shambler', 'sprinter']), lv(-1)], [q.sp, lv(1), q.nm]], kind: 'boss', bg: z.bg, intro: q.nm + ' ROARS!' });
      if (r === 'lose') { await blackout(); return; } if (r !== 'win') { await say(null, `${q.nm} is still out there.`); return; }
      await say(null, `${q.nm} topples over and starts snoring. Bounty collected!`); q.prog = 1; this.complete(q); this.sync(); await afterBattle(); return;
    }
    if (q.kind === 'errand') { q.got = true; Snd.sfx('levelup'); await say(null, `You found ${q.what}! Now take it to ${this.NPC[q.to][0]}.`); this.sync(); }
  },
  async deliver(to) {
    const q = this.open().find(x => x.kind === 'errand' && x.to === to && x.got); if (!q) return;
    await say(null, `You hand over ${q.what}. ${this.NPC[to][0]} is delighted.`); q.prog = 1; this.complete(q); this.sync(); await this.announce();
  },
  // where the arrow should point for a quest, and the goal line
  target(q) {
    if (!q) return null;
    if (q.kind === 'errand') { if (!q.got) { const s = QSPOTS[q.spot]; return { map: 'world', x: s.x, y: s.y }; } const N = this.NPC[q.to]; return { map: 'world', x: N[2], y: N[3] }; }
    if (q.spot != null) { const s = QSPOTS[q.spot]; return { map: 'world', x: s.x, y: s.y }; }
    if ((q.kind === 'patrol' || q.kind === 'hunt' || q.kind === 'defeat') && q.x != null) return { map: 'world', x: q.x, y: q.y, zone: 1 };
    return null;
  },
  tracked() { const Q = this.S(), o = this.open(); return o.find(q => q.id === Q.track) || o.find(q => this.target(q)) || o[0] || null; },
  storyIdle(base) { return !base || (typeof Sky !== 'undefined' && ['forge', 'library', 'eye'].includes(base.map) && !rideable()); },
  sync() {
    if (!G || !G.quests || !flag('starter')) return; const base = this._final ? this._final() : null;
    if (!this.storyIdle(base)) return; const q = this.tracked();
    G.obj = q ? `QUEST: ${q.title}. ${q.kind === 'errand' && q.got ? 'Bring it to ' + this.NPC[q.to][0] + '.' : q.text}${q.need > 1 ? `  (${q.prog}/${q.need})` : ''}` : 'All of today\'s quests are done! New ones appear on the Quest Board tomorrow.';
  },
  // ---- the board itself
  async board() {
    this.refresh(); this._new = false; const Q = this.S();
    while (true) {
      const list = this.all(), label = q => (q.done ? '✔ ' : q.id === Q.track ? '▶ ' : '· ') + (q.weekly ? 'WEEKLY: ' : '') + q.title, right = q => q.done ? 'DONE' : q.need > 1 ? `${q.prog}/${q.need}` : (q.kind === 'errand' && q.got ? 'carrying' : '');
      const i = await menu(list.map(q => ({ label: label(q), right: right(q), col: q.done ? '#a8ffb8' : q.weekly ? '#ffd76a' : null })).concat([{ label: 'Close' }]), { x: 70, y: 70, w: W - 140, rows: 7, title: `QUEST BOARD   ·   this week ${Math.min(5, Q.weekDone)}/5 for a trophy   ·   trophies: ${Q.trophies.length}` });
      if (i < 0 || i >= list.length) return;
      const q = list[i], R = q.reward;
      if (q.done) { await say('board', `${q.title}: done! You earned ${R.scrap} scrap${R.item ? ' and ' + R.qty + ' ' + ITEMS[R.item].n + (R.qty > 1 ? 's' : '') : ''}.`); continue; }
      const c = await ask('board', `${q.title}\n${q.text}\nReward: ${R.scrap} scrap${R.item ? ', ' + R.qty + ' ' + ITEMS[R.item].n + (R.qty > 1 ? 's' : '') : ''}.`, this.target(q) ? ['Follow the arrow to it', 'Back'] : ['Got it', 'Back']);
      if (c === 0 && this.target(q)) { Q.track = q.id; this.sync(); await say(null, this.storyIdle(this._final && this._final()) ? 'The gold arrow will lead you there.' : 'The arrow follows the story first. When the story is waiting, it will lead you to this quest.'); return; }
    }
  },
  init() {
    // the arrow: story first; when the story has nothing waiting, the tracked quest
    { const o = Guide.final.bind(Guide); this._final = o; Guide.final = function () { const base = o(); if (!Quests.storyIdle(base) || !G || !G.quests || !flag('starter')) return base; const t = Quests.target(Quests.tracked()); return t || base; }; }
    // hooks into the game for progress
    { const o = Learn.record; Learn.record = function (q, ok) { const r = o.apply(this, arguments); if (ok && q && q.q) Quests.event('right'); if (q && q.q) Quests.event('streak', G.learn.streak); if ((G.learn.fresh || []).length) Quests.event('master'); return r; }; }
    { const o = Learn.factDash; Learn.factDash = async function () { const r = await o.apply(this, arguments); const L = G.learn.dash; if (L && L.length) Quests.event('dash', L[L.length - 1].n); await Quests.announce(); return r; }; }
    { const o = addCritter; addCritter = function (c) { const r = o.apply(this, arguments); Quests.event('catch', c.sp); return r; }; }
    { const o = Battle.run; Battle.run = async function (opt) { const r = await o.apply(this, arguments); if (r === 'win' && opt && opt.foes) { const n = {}; for (const f of opt.foes) { const t = SPECIES[f[0]] && SPECIES[f[0]].t; if (t) n[t] = (n[t] || 0) + 1; } for (const t in n) Quests.event('defeat', t, n[t]); } return r; }; }
    { const o = checkZone; checkZone = function () { const z0 = PL.zone, r = o.apply(this, arguments); if (PL.zone !== z0 && G && G.map === 'world') Quests.event('zone', PL.zone); return r; }; }
    { const o = munchShop; munchShop = async function () { await Quests.deliver('munch'); return o.apply(this, arguments); }; }
    { const o = nightShop; nightShop = async function (id) { await Quests.deliver(id); return o.apply(this, arguments); }; }
    { const o = afterBattle; afterBattle = async function () { await o.apply(this, arguments); await Quests.announce(); }; }
    // new quests each day: checked when play resumes and whenever Dex arrives somewhere
    { const o = welcomeBack; welcomeBack = async function () { await o.apply(this, arguments); if (G && flag('starter') && Quests.refresh()) await say('board', 'New quests are up on the Quest Board by the Nest!'); }; }
    { const o = arrive; arrive = function () { const r = o.apply(this, arguments); if (G && flag('starter')) { if (G.map === 'world' && PL.zone) Quests.event('zone', PL.zone); /* a patrol counts even if he was already there */ if (Quests.refresh()) toast('New quests on the Quest Board!'); if (Quests.pending && Quests.pending.length && !Script.n) script(() => Quests.announce()); } return r; }; }
  }
};
document.addEventListener('DOMContentLoaded', () => { try { Quests.init(); } catch (e) { console.error('Quest Board wiring', e); } });
