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
// the trophy shelf by the Nest shows one cup for each weekly trophy (up to six)
for (let n = 0; n <= 6; n++) OB['tshelf' + n] = function () { rr(10, 40, 80, 8, 2, '#8a5f3a'); rr(10, 72, 80, 8, 2, '#8a5f3a'); rr(10, 40, 6, 56, 1, '#7a5230'); rr(84, 40, 6, 56, 1, '#7a5230');
  for (let i = 0; i < n; i++) { const x = 24 + (i % 3) * 26, y = i < 3 ? 40 : 72; glow(x, y - 12, 14, '#ffe36a', .3); pol([x - 8, y - 26, x + 8, y - 26, x + 5, y - 12, x - 5, y - 12], '#ffcb3d'); rr(x - 2, y - 12, 4, 6, 1, '#d99a1e'); rr(x - 6, y - 6, 12, 5, 1, '#d99a1e'); } };
// caps Dex can earn from quests (the first is the one he starts with)
const QCAPS = [['red', '#e5483d'], ['blue', '#3f7ee8'], ['gold', '#f2c14e'], ['green', '#3fae5a'], ['purple', '#8e6be8'], ['black', '#2a2636'], ['pink', '#e07aa0'], ['white', '#f4f4fa']];
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
// parcels for sky deliveries, one spot on each of three islands
const QSKY = { gust: [21, 16], forge: [11, 14], library: [20, 13] };
for (const k in QSKY) { const e = E({ map: k, x: QSKY[k][0], y: QSKY[k][1], spr: 'parcel', if: () => !!Quests.skyAt(k), act: () => Quests.skyPick(k) }); }
const QBOARD = (() => { const M = MAPS.world.m; for (const [x, y] of [[44, 64], [45, 64], [38, 64], [44, 65], [38, 65]]) if ('.:=-,'.includes(M.get(x, y)) && !ENT.some(e => e.map === 'world' && e.x === x && e.y === y)) { M.set(x, y, '.'); return [x, y]; } return [44, 64]; })();
E({ map: 'world', x: QBOARD[0], y: QBOARD[1], spr: 'board', act: () => Quests.board() });
const QSHELF = (() => { const M = MAPS.world.m; for (const [x, y] of [[38, 64], [37, 64], [38, 65], [45, 65], [37, 65]]) if ('.:=-,'.includes(M.get(x, y)) && !ENT.some(e => e.map === 'world' && e.x === x && e.y === y) && !(x === QBOARD[0] && y === QBOARD[1])) { M.set(x, y, '.'); return [x, y]; } return [38, 64]; })();
{ const e = E({ map: 'world', x: QSHELF[0], y: QSHELF[1], spr: 'tshelf0', act: () => Quests.shelf() }); Object.defineProperty(e, 'spr', { get() { return 'tshelf' + Math.min(6, (G && G.quests && G.quests.trophies.length) || 0); } }); }

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
    if (kind === 'rescue') { const s = this.pickSpot(taken); if (!s) return null; taken.add(s.i); const who = pick(names);   // the same kind of rescue as Night Watch, only in daylight
      return { id, kind, spot: s.i, look: 'w' + rint(0, 5), who, title: `Signal: rescue ${who}`, text: `A walkie signal came in: ${who} is trapped at ${s[0]} and zombies are closing in. Go and bring ${who} home to the Nest!`, need: 1, prog: 0, reward: rw(70, 'soda', 2) }; }
    if (kind === 'signals') return { id, kind, title: `Answer ${big ? 3 : 1} night signal${big ? 's' : ''}`, text: 'Answer signals from the Nest or a campfire and bring the kids home.', need: big ? 3 : 1, prog: 0, reward: rw(90, 'slush', 1) };
    // above the clouds (once Gale has taken him up)
    const isles = ['roost', 'gust'].concat(rideable() ? ['forge', 'library', 'eye'].filter(k => Sky.DEST[k].need()) : []);
    if (kind === 'rings') { const n = big ? 12 : 4; return { id, kind, title: `Sky Rings: ${n} right`, text: `Fly anywhere and steer through ${n} right Sky Rings. Fly from a perch, or from Gale on Radio Hill.`, need: n, prog: 0, reward: rw(80, 'soda', 1) }; }
    if (kind === 'skyvisit') { const k = pick(isles.filter(x => x !== 'roost')); if (!k) return null; return { id, kind, isle: k, title: `Fly to ${Sky.DEST[k].n}`, text: `Fly to ${Sky.DEST[k].n} and land there.`, need: 1, prog: 0, reward: rw(60, 'juice', 2) }; }
    if (kind === 'skycarry') { const from = pick(Object.keys(QSKY).filter(k => isles.includes(k))); if (!from) return null; const what = pick(['a bundle of Gale\'s lost feathers', 'a jar of bottled lightning', 'a cloud-paper letter', 'a basket of sky berries']);
      return { id, kind, from, what, got: false, title: `Sky delivery for Gale`, text: `${what[0].toUpperCase() + what.slice(1)} is waiting on ${Sky.DEST[from].n}. Fly there, pick it up, and bring it to Grandmother Gale on Roost Rock.`, need: 1, prog: 0, reward: rw(90, 'potion', 2) }; }
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
    if (kind === 'right') { const n = big ? 60 : pick([10, 15, 20]); if (curEgg()) return { id, kind, dragon: 1, title: `Warm your egg: ${n} right answers`, text: `Every right answer warms your dragon egg. Answer ${n} questions right. Battles, stashes and Study Hall all count.`, need: n, prog: 0, reward: rw(60, 'soda', 1) };
      return { id, kind, title: `${n} Brain Blasts`, text: `Answer ${n} questions right. Battles, stashes and Study Hall all count.`, need: n, prog: 0, reward: rw(60, 'soda', 1) }; }
    if (kind === 'streak') { const n = big ? 10 : 5; return { id, kind, title: `${n} in a row`, text: `Get ${n} questions right in a row, without a miss.`, need: n, prog: 0, reward: rw(70, 'potion', 1) }; }
    if (kind === 'dash') { const best = G.learn.dash && G.learn.dash.length ? Math.max(...G.learn.dash.map(d => d.n)) : 0, n = Math.max(6, Math.min(25, best ? best - 2 : 8)); return { id, kind, title: `Fact Dash: ${n} or more`, text: `Score ${n} or more in one Fact Dash (Practice & Tests).`, need: n, prog: 0, reward: rw(70, 'slush', 1) }; }
    if (kind === 'master') { if (this.growing()) return { id, kind, dragon: 1, base: Learn.progress()[0], title: 'Grow your dragon: master a skill', text: `Your dragon grows when you master skills. Master one you have not mastered yet. Study Hall lessons are a fast way.`, need: 1, prog: 0, reward: rw(120, 'slush', 1) };
      return { id, kind, base: Learn.progress()[0], title: 'Master a new skill', text: 'Master one skill you have not mastered yet. Study Hall lessons are a fast way.', need: 1, prog: 0, reward: rw(120, 'slush', 1) }; }
    return null;
  },
  // where to look for a critter or a type: a reachable patch of tall grass in a part of town where it lives
  habitat(match) {
    const R = this.reach(), M = MAPS.world.m, w = M.w, zs = MAPS.world.zones.filter(z => (z.enc || []).some(e => match(e[0]))); let best = null, bd = 1e9;
    for (const z of zs) for (let y = z.r[1]; y < z.r[1] + z.r[3]; y++) for (let x = z.r[0]; x < z.r[0] + z.r[2]; x++) { if (!R.has(x + y * w) || !TINFO[M.t[y][x]].enc || zoneAt('world', x, y).id !== z.id) continue; const d = Math.abs(x - 41) + Math.abs(y - 64) + (Math.random() * 30 | 0); if (d < bd) { bd = d; best = [x, y]; } }
    return best;
  },
  // three a day, one of them a brain quest; one bigger one a week
  // a dragon that is hatched but not big enough to ride, or an egg still being kept warm
  growing() { return !!(G && (curEgg() || (dragonsOwned().length && !rideable()))); },
  refresh() {
    const Q = this.S(), d = this.day(), wk = this.week(); let fresh = false; this.applyLook();
    if (Q.week !== wk) { Q.week = wk; Q.weekDone = 0; const wk2 = ['right', 'defeat', 'master', 'hunt'].concat(flag('priya') ? ['signals'] : [], flag('skyFirst') ? ['rings'] : []); Q.weekly = this.make(this.growing() ? pick(['master', 'right']) : pick(wk2), new Set(), true); if (Q.weekly) { Q.weekly.weekly = 1; Q.weekly.reward.critter = this.rareCritter(); } fresh = true; }
    if (Q.day !== d) { Q.day = d; const taken = new Set(), list = [];
      const sky = flag('skyFirst') && !flag('_noSky'), explore = ['hunt', 'defeat', 'patrol', 'rescue', 'errand'].concat(sky ? ['rings', 'skyvisit', 'skycarry', 'skycarry'] : []), brain = this.growing() ? [curEgg() ? 'right' : 'master'] : ['right', 'streak', 'dash', 'right'];
      for (const kinds of [['rescue', 'bounty', 'errand'], explore, brain]) { const left = kinds.filter(k => !list.some(q => q.kind === k)); let q = null; for (let t = 0; t < 6 && !q; t++) q = this.make(pick(left.length ? left : kinds), taken); if (q) list.push(q); }   // never the same kind twice in a day
      Q.list = list; fresh = true; }
    if (fresh) { this._new = true; this.sync(); }
    return fresh;
  },
  rareCritter() { const have = new Set(G.party.concat(G.pen).map(c => c.sp)), pool = Object.keys(SPECIES).filter(sp => { const S = SPECIES[sp]; return S.rate > 0 && !S.z && !S.dragon && !have.has(sp) && !Object.values(SPECIES).some(o => o.evo && o.evo[1] === sp); }); return pool.length ? pick(pool) : null; },
  all() { const Q = this.S(); return Q.list.concat(Q.weekly ? [Q.weekly] : []); },
  open() { return this.all().filter(q => !q.done); },
  skyAt(k) { if (!G || !G.quests) return null; return this.open().find(q => q.kind === 'skycarry' && q.from === k && !q.got) || null; },
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
      if (type === 'signal' && q.kind === 'signals') p++;
      if (type === 'rings' && q.kind === 'rings') p += a;
      if (type === 'land' && q.kind === 'skyvisit' && a === q.isle) p = 1;
      if (p !== q.prog) { q.prog = Math.min(q.need, p); any = true; if (q.prog >= q.need) this.complete(q); }
    }
    if (any) this.sync();
  },
  complete(q) {
    if (q.done) return; q.done = true; const Q = this.S(), R = q.reward; G.scrap += R.scrap; if (R.item) give(R.item, R.qty, true); Q.done++;
    const eg = curEgg(); if (eg) { eg.wm = Math.min(20, eg.wm + 3); eg.we = Math.min(20, eg.we + 3); q.warmed = 1; }   // every quest warms a dragon egg a little
    if (R.critter && SPECIES[R.critter]) { addCritter(makeCritter(R.critter, clamp(this.top() - 2, 5, 50))); q.gotCritter = R.critter; }
    G.cos = G.cos || { caps: ['red'], cap: 'red' }; if (Q.done % 3 === 0) { const next = QCAPS.find(c => !G.cos.caps.includes(c[0])); if (next) { G.cos.caps.push(next[0]); q.gotCap = next[0]; } }
    if (!q.weekly) Q.weekDone++;
    (this.pending = this.pending || []).push(q);
    if (typeof PlayLog !== 'undefined') PlayLog.add('quest', { kind: q.kind, weekly: !!q.weekly });
  },
  // the fanfare: shown as soon as nothing else is on screen
  async announce() {
    while (this.pending && this.pending.length) {
      const q = this.pending.shift(), R = q.reward, Q = this.S(); Snd.sfx('badge'); Fx.flash = .4; tween(Fx, 'flash', 0, 400);
      await say('board', `★ QUEST COMPLETE: ${q.title} ★\n+${R.scrap} scrap${R.item ? `, ${R.qty} ${ITEMS[R.item].n}${R.qty > 1 ? 's' : ''}` : ''}${q.warmed ? '\nYour dragon egg feels a little warmer.' : ''}`, { col: '#ffd76a' });
      if (q.gotCritter) await say('board', `★ A ${SPECIES[q.gotCritter].n} heard about you and wants to join your team! ★`, { col: '#ffd76a' });
      if (q.gotCap) { await say('board', `★ NEW CAP: ${q.gotCap.toUpperCase()} ★\nChange caps on the Quest Board under Wardrobe.`, { col: '#ffd76a' }); }
      if (typeof dragonCheck === 'function') await dragonCheck();   // a warm egg may hatch, and a mastered skill may grow a dragon
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
      if (!G.saved.includes(q.who)) G.saved.push(q.who); await say(null, `${q.who}: "You came! Thank you, thank you!"\n${q.who} joins the other kids at the Nest. Kids rescued: ${G.saved.length}.`);
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
  async skyPick(k) { const q = this.skyAt(k); if (!q) return; q.got = true; Snd.sfx('levelup'); await say(null, `You found ${q.what}! Bring it to Grandmother Gale on Roost Rock.`); this.sync(); },
  async skyDeliver() { const q = this.open().find(x => x.kind === 'skycarry' && x.got); if (!q) return false; await say('gale', `${q.what[0].toUpperCase() + q.what.slice(1)}! You are a good friend to an old dragon.`); q.prog = 1; this.complete(q); this.sync(); await this.announce(); return true; },
  async deliver(to) {
    const q = this.open().find(x => x.kind === 'errand' && x.to === to && x.got); if (!q) return;
    await say(null, `You hand over ${q.what}. ${this.NPC[to][0]} is delighted.`); q.prog = 1; this.complete(q); this.sync(); await this.announce();
  },
  // where the arrow should point for a quest, and the goal line
  target(q) {
    if (!q) return null;
    if (q.kind === 'errand') { if (!q.got) { const s = QSPOTS[q.spot]; return { map: 'world', x: s.x, y: s.y }; } const N = this.NPC[q.to]; return { map: 'world', x: N[2], y: N[3] }; }
    if (q.spot != null) { const s = QSPOTS[q.spot]; return { map: 'world', x: s.x, y: s.y }; }
    const perch = () => G.map === 'world' || !Sky.isSky(G.map) ? { map: 'world', x: SKYPLACE.gale[0], y: SKYPLACE.gale[1] } : { map: G.map, x: SKYSPOT[G.map][0], y: SKYSPOT[G.map][1] };
    if (q.kind === 'rings') return perch();
    if (q.kind === 'skyvisit') return { map: q.isle, x: Sky.starts[q.isle][0], y: Sky.starts[q.isle][1] - 1 };
    if (q.kind === 'skycarry') return q.got ? { map: 'roost', x: 19, y: 8 } : { map: q.from, x: QSKY[q.from][0], y: QSKY[q.from][1] };
    if (q.kind === 'signals') return { map: 'world', x: 41, y: 62 };
    if ((q.kind === 'patrol' || q.kind === 'hunt' || q.kind === 'defeat') && q.x != null) return { map: 'world', x: q.x, y: q.y, zone: 1 };
    return null;
  },
  tracked() { const Q = this.S(), o = this.open(); return o.find(q => q.id === Q.track) || o.find(q => this.target(q)) || o[0] || null; },
  storyIdle(base) { return !base || (typeof Sky !== 'undefined' && ['forge', 'library', 'eye'].includes(base.map) && !rideable()); },
  sync() {
    if (!G || !G.quests || !flag('starter')) return; const base = this._final ? this._final() : null;
    if (!this.storyIdle(base)) return; const q = this.tracked();
    G.obj = q ? `QUEST: ${q.title}. ${q.kind === 'errand' && q.got ? 'Bring it to ' + this.NPC[q.to][0] + '.' : q.kind === 'skycarry' && q.got ? 'Bring it to Gale on Roost Rock.' : q.text}${q.need > 1 ? `  (${q.prog}/${q.need})` : ''}${this.growing() ? '  Quests help your dragon grow!' : ''}` : 'All of today\'s quests are done! New ones appear on the Quest Board tomorrow.';
  },
  // ---- the board itself
  async board() {
    this.refresh(); this._new = false; const Q = this.S();
    while (true) {
      const list = this.all(), label = q => (q.done ? '✔ ' : q.id === Q.track ? '▶ ' : '· ') + (q.weekly ? 'WEEKLY: ' : '') + q.title, right = q => q.done ? 'DONE' : q.need > 1 ? `${q.prog}/${q.need}` : (q.kind === 'errand' && q.got ? 'carrying' : '');
      const cos = G.cos || { caps: ['red'], cap: 'red' }, i = await menu(list.map(q => ({ label: label(q) + (q.dragon && !q.done ? '  🐉' : ''), right: right(q), col: q.done ? '#a8ffb8' : q.weekly ? '#ffd76a' : null })).concat([{ label: `Wardrobe  (${cos.caps.length} cap${cos.caps.length === 1 ? '' : 's'})` }, { label: 'Close' }]), { x: 70, y: 70, w: W - 140, rows: 7, title: `QUEST BOARD   ·   this week ${Math.min(5, Q.weekDone)}/5 for a trophy   ·   trophies: ${Q.trophies.length}` });
      if (i === list.length) { await this.wardrobe(); continue; }
      if (i < 0 || i >= list.length) return;
      const q = list[i], R = q.reward;
      if (q.done) { await say('board', `${q.title}: done! You earned ${R.scrap} scrap${R.item ? ' and ' + R.qty + ' ' + ITEMS[R.item].n + (R.qty > 1 ? 's' : '') : ''}.`); continue; }
      const c = await ask('board', `${q.title}\n${q.text}\nReward: ${R.scrap} scrap${R.item ? ', ' + R.qty + ' ' + ITEMS[R.item].n + (R.qty > 1 ? 's' : '') : ''}${R.critter ? ', and a rare critter friend' : ''}.${q.dragon ? '\n🐉 This one helps your dragon.' : ''}`, this.target(q) ? ['Follow the arrow to it', 'Back'] : ['Got it', 'Back']);
      if (c === 0 && this.target(q)) { Q.track = q.id; this.sync(); await say(null, this.storyIdle(this._final && this._final()) ? 'The gold arrow will lead you there.' : 'The arrow follows the story first. When the story is waiting, it will lead you to this quest.'); return; }
    }
  },
  async wardrobe() {
    const cos = G.cos = G.cos || { caps: ['red'], cap: 'red' }, have = QCAPS.filter(c => cos.caps.includes(c[0]));
    const i = await menu(have.map(c => ({ label: (c[0] === cos.cap ? '● ' : '○ ') + c[0][0].toUpperCase() + c[0].slice(1) + ' cap', col: c[1] })).concat([{ label: `(${QCAPS.length - have.length} more to earn: one every three quests)`, disabled: true }, { label: 'Done' }]), { x: 280, y: 160, w: 400, title: 'WARDROBE' });
    if (i >= 0 && i < have.length) { cos.cap = have[i][0]; this.applyLook(); Snd.sfx('ok'); await say('dex', 'Looking good.'); }
  },
  applyLook() { const c = G && G.cos && QCAPS.find(x => x[0] === G.cos.cap); const col = c ? c[1] : '#e5483d'; if (HUM.dex.cap !== col) { HUM.dex.cap = col; HUM.dex.scarf = col; HUM.dex.shoes = col; for (const k in Art.cache) if (k.startsWith('h:dex') || k.startsWith('s:dex')) delete Art.cache[k]; } },
  async shelf() { const T = (G.quests && G.quests.trophies) || []; await say(null, T.length ? `THE TROPHY SHELF\n${T.length} weekly trophy${T.length > 1 ? 's' : ''}. One for every week you finished five quests from the Quest Board.` : 'THE TROPHY SHELF\nIt is empty. Finish five Quest Board quests in one week to win the first trophy!'); },
  init() {
    // the arrow: story first; when the story has nothing waiting, the tracked quest
    { const o = Guide.final.bind(Guide); this._final = o; Guide.final = function () { const base = o(); if (!Quests.storyIdle(base) || !G || !G.quests || !flag('starter')) return base; const t = Quests.target(Quests.tracked()); return t || base; }; }
    // hooks into the game for progress
    { const o = Learn.record; Learn.record = function (q, ok) { const r = o.apply(this, arguments); if (ok && q && q.q) Quests.event('right'); if (q && q.q) Quests.event('streak', G.learn.streak); if ((G.learn.fresh || []).length) Quests.event('master'); return r; }; }
    { const o = Learn.factDash; Learn.factDash = async function () { const r = await o.apply(this, arguments); const L = G.learn.dash; if (L && L.length) Quests.event('dash', L[L.length - 1].n); await Quests.announce(); return r; }; }
    { const o = addCritter; addCritter = function (c) { const r = o.apply(this, arguments); Quests.event('catch', c.sp); return r; }; }
    { const o = Battle.run; Battle.run = async function (opt) { const r = await o.apply(this, arguments); if (r === 'win' && opt && opt.foes) { const n = {}; for (const f of opt.foes) { const t = SPECIES[f[0]] && SPECIES[f[0]].t; if (t) n[t] = (n[t] || 0) + 1; } for (const t in n) Quests.event('defeat', t, n[t]); } return r; }; }
    { const o = checkZone; checkZone = function () { const z0 = PL.zone, r = o.apply(this, arguments); if (PL.zone !== z0 && G && G.map === 'world') Quests.event('zone', PL.zone); return r; }; }
    { const o = Story.signal; Story.signal = async function () { const n0 = G.night, r = await o.apply(this, arguments); if (G.night > n0) { Quests.event('signal'); await Quests.announce(); } return r; }; }
    { const o = Flight.run.bind(Flight); Flight.run = async function (opt) { const r = await o(opt); if (r && r.right) Quests.event('rings', r.right); return r; }; }
    { const o = Sky.fly.bind(Sky); Sky.fly = async function (k) { const r = await o(k); Quests.event('land', k); await Quests.announce(); return r; }; }
    { const o = Sky.galeTalk.bind(Sky); Sky.galeTalk = async function () { if (await Quests.skyDeliver()) return; return o(); }; }
    { const o = loadGame; loadGame = function () { const r = o.apply(this, arguments); if (r) Quests.applyLook(); return r; }; }
    { const o = munchShop; munchShop = async function () { await Quests.deliver('munch'); return o.apply(this, arguments); }; }
    { const o = nightShop; nightShop = async function (id) { await Quests.deliver(id); return o.apply(this, arguments); }; }
    { const o = afterBattle; afterBattle = async function () { await o.apply(this, arguments); await Quests.announce(); }; }
    // new quests each day: checked when play resumes and whenever Dex arrives somewhere
    { const o = welcomeBack; welcomeBack = async function () { await o.apply(this, arguments); if (G && flag('starter') && Quests.refresh()) await say('board', 'New quests are up on the Quest Board by the Nest!'); }; }
    { const o = arrive; arrive = function () { const r = o.apply(this, arguments); if (G && flag('starter')) { if (G.map === 'world' && PL.zone) Quests.event('zone', PL.zone); /* a patrol counts even if he was already there */ if (Quests.refresh()) toast('New quests on the Quest Board!'); if (Quests.pending && Quests.pending.length && !Script.n) script(() => Quests.announce()); } return r; }; }
  }
};
document.addEventListener('DOMContentLoaded', () => { try { Quests.init(); } catch (e) { console.error('Quest Board wiring', e); } });
