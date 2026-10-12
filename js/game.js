'use strict';
const SAVE_KEY = 'lastbell_save_v1';
let G = null, Scene = 'title';
const PL = { px: 0, py: 0, moving: false, t: 0, fx: 0, fy: 0, tx: 0, ty: 0, step: 0, grace: 0, zone: null, banner: 0, bannerText: '', pendingOffer: false };
const Script = { n: 0 };
const DV = { up: [0, -1], down: [0, 1], left: [-1, 0], right: [1, 0] };
async function script(fn) { Script.n++; try { await fn(); } catch (e) { console.error(e); } finally { Script.n--; } }

function newState() {
  return { map: 'world', x: 41, y: 64, dir: 'up', party: [], pen: [], bag: { snack: 5, juice: 3 }, scrap: 40, flags: {}, badges: [], dex: {}, seen: {},
    wins: 0, night: 0, saved: [], gear: { sword: 0, charms: {}, wins: 0 }, goal: 20, limitMin: 0, dayStreak: 0, day: null, readAloud: false, eggs: [], roosts: [], crew: [], bond: {}, rest: { map: 'world', x: 41, y: 64 }, log: [], obj: '', time: 0, steps: 0,
    learn: { grade: 2, sk: {}, right: 0, total: 0, streak: 0, best: 0, recent: [], flip: false } };
}
const flag = k => !!G.flags[k];
const setFlag = (k, v) => { G.flags[k] = v === undefined ? true : v; };
function give(id, n, silent) { G.bag[id] = (G.bag[id] || 0) + n; if (!silent) toast(`+${n} ${ITEMS[id].n}`); }
function setObj(t) { G.obj = t; toast('New goal!'); }
function logAdd(t) { G.log.push(t); }
function healAll() { for (const c of G.party.concat(G.pen)) { c.hp = maxHp(c); c.status = null; c.stun = false; c.dhp = c.hp; } }
function addCritter(c) { G.dex[c.sp] = 1; (G.party.length < 6 ? G.party : G.pen).push(c); }
async function badge(id) {
  if (G.badges.includes(id)) return;
  G.badges.push(id); Snd.sfx('badge');
  await say(null, `★ MERIT BADGE EARNED ★\n${BADGES[id][0]}: ${BADGES[id][1]}`, { col: '#ffd76a' });
}
async function joinCrew(id) {
  if (!G.crew.includes(id)) G.crew.push(id);
  setFlag(id); G.bond[id] = G.bond[id] || 0; Snd.sfx('badge');
  await say(null, `${CREW[id].n} joined the crew!\nNew battle power: ${CREW[id].ab}. ${CREW[id].abd}`, { col: '#ffd76a' });
}
async function checkFeats() {
  const L = G.learn, m = Object.values(L.sk).filter(k => k.m).length, f = Object.keys(G.dex).filter(k => !SPECIES[k].z).length;
  if (L.right >= 10) await badge('brain10'); if (L.right >= 50) await badge('brain50'); if (L.right >= 150) await badge('brain150');
  if (L.best >= 5) await badge('streak5'); if (L.best >= 10) await badge('streak10');
  if (m >= 1) await badge('master1'); if (m >= 5) await badge('master5');
  if (f >= 5) await badge('friends5'); if (f >= 10) await badge('friends10');
  if (G.gear.sword >= 1) await badge('blade'); if (G.gear.sword >= 5) await badge('bellbreaker'); if (G.gear.wins >= 15) await badge('shopper');
  if (G.night >= 1) await badge('rescue1'); if (G.night >= 10) await badge('rescue10'); if (G.night >= 25) await badge('rescue25');
  await Learn.celebrate();
  await dragonCheck();
}
async function useItem(id, c) {
  const it = ITEMS[id], mh = maxHp(c);
  if (it.heal) { if (c.hp <= 0 || c.hp >= mh) return false; c.hp = Math.min(mh, c.hp + it.heal); }
  else if (it.cure) { if (!c.status && !c.stun) return false; c.status = null; c.stun = false; }
  else if (it.revive) { if (c.hp > 0) return false; c.hp = Math.floor(mh * it.revive); }
  else return false;
  G.bag[id]--; Snd.sfx('heal'); c.dhp = c.hp;
  await say(null, `Used ${it.n} on ${cname(c)}.`, { auto: 600 });
  return true;
}
function saveGame() {
  try { localStorage.setItem(SAVE_KEY, JSON.stringify(G, (k, v) => (k === 'st' || k === 'stun' || k === 'dhp') ? undefined : v)); toast('Game saved'); } catch (e) { toast('Could not save'); }
}
function loadGame() {
  try { const s = localStorage.getItem(SAVE_KEY); if (!s) return false; const d = JSON.parse(s), n = newState(); G = Object.assign(n, d); G.learn = Object.assign(n.learn, d.learn); return true; } catch (e) { return false; }
}
const hasSave = () => { try { return !!localStorage.getItem(SAVE_KEY); } catch (e) { return false; } };

// ---------------------------------------------------------------- world
const tileAt = (map, x, y) => { const m = MAPS[map].m; return (x >= 0 && y >= 0 && x < m.w && y < m.h) ? m.t[y][x] : 'W'; };
const entsOn = map => ENT.filter(e => e.map === map && (!e.if || e.if()));
const entAt = (map, x, y) => ENT.find(e => e.map === map && e.x === x && e.y === y && (!e.if || e.if()));
function passable(x, y) {
  const m = MAPS[G.map].m; if (x < 0 || y < 0 || x >= m.w || y >= m.h) return false;
  if (TINFO[m.t[y][x]].s) return false;
  if (G.map === 'world' && wandAt(x, y)) return false;
  const e = entAt(G.map, x, y); return !(e && e.solid);
}
// ---- Pretenders: townsfolk who stroll around looking perfectly normal... until you get close.
const WAND = [];
const wandAt = (x, y) => WAND.find(w => w.state !== 'gone' && ((w.x === x && w.y === y) || (w.moving && w.tx === x && w.ty === y)));
function wandCan(x, y) {
  const m = MAPS.world.m; if (x < 1 || y < 1 || x >= m.w - 1 || y >= m.h - 1) return false;
  const inf = TINFO[m.t[y][x]]; if (inf.s) return false;
  if (entAt('world', x, y) || wandAt(x, y) || (x === G.x && y === G.y) || (PL.moving && x === PL.tx && y === PL.ty)) return false;
  return zoneAt('world', x, y).id !== 'maple';
}
function spawnWanderer() {
  if (G.map !== 'world' || !flag('starter') || WAND.length >= 4) return;
  for (let i = 0; i < 14; i++) {
    const a = Math.random() * 6.3, d = 8 + Math.random() * 4, x = Math.round(G.x + Math.cos(a) * d * 1.2), y = Math.round(G.y + Math.sin(a) * d * .9);
    if (!wandCan(x, y) || TINFO[MAPS.world.m.t[y][x]].enc) continue;
    WAND.push({ x, y, px: x * 16, py: y * 16, dir: pick(DIRKEYS), moving: false, t: 0, wait: 400, look: rint(0, 5), state: 'walk', step: 0 }); return;
  }
}
function wandUpdate(dt) {
  if (G.map !== 'world') { WAND.length = 0; return; }
  if (Script.n > 0 || Battle.on || UI.busy) return;
  for (const w of WAND) {
    if (w.state !== 'walk') continue;
    if (w.moving) {
      w.t += dt / 300;
      if (w.t >= 1) { w.moving = false; w.x = w.tx; w.y = w.ty; w.px = w.x * 16; w.py = w.y * 16; w.wait = Math.random() < .6 ? 0 : 300 + Math.random() * 1600; }
      else { w.px = (w.fx + (w.tx - w.fx) * w.t) * 16; w.py = (w.fy + (w.ty - w.fy) * w.t) * 16; }
    } else if ((w.wait -= dt) <= 0) {
      const d = Math.random() < .65 ? w.dir : pick(DIRKEYS), nx = w.x + DV[d][0], ny = w.y + DV[d][1]; w.dir = d;
      if (wandCan(nx, ny)) { w.moving = true; w.t = 0; w.fx = w.x; w.fy = w.y; w.tx = nx; w.ty = ny; w.step++; } else w.wait = 250;
    }
  }
  for (let i = WAND.length - 1; i >= 0; i--) if (WAND[i].state === 'gone' || Math.abs(WAND[i].x - G.x) + Math.abs(WAND[i].y - G.y) > 20) WAND.splice(i, 1);
  if (!PL.moving) { const w = WAND.find(k => k.state === 'walk' && !k.moving && Math.abs(k.x - G.x) + Math.abs(k.y - G.y) <= 2); if (w) script(() => pretender(w)); }
}
async function pretender(w) {
  w.state = 'turn';
  const dx = G.x - w.x, dy = G.y - w.y; w.dir = Math.abs(dx) > Math.abs(dy) ? (dx > 0 ? 'right' : 'left') : (dy > 0 ? 'down' : 'up');
  const z = zoneAt('world', w.x, w.y);
  Snd.sfx('no');
  await say(null, pick(['The stranger stops walking. Its head tilts... a little too far.', '"Lovely weather," says the stranger. It is NOT lovely weather.', 'The stranger smiles at you. The smile keeps going.', 'The stranger waves. Then it keeps waving. And waving.']));
  Fx.shake = 7; Snd.sfx('enc'); await sleep(950);
  w.z = true; Fx.flash = .85; tween(Fx, 'flash', 0, 320); tween(Fx, 'shake', 0, 320); Snd.sfx('thunder'); await sleep(380);
  if (!flag('pretender')) {
    setFlag('pretender');
    await say('dex', 'A PRETENDER! They look totally normal, right up until they smell brains.');
    await say('guide', 'FIELD GUIDE: Pretenders cast no shadow, and a flash of lightning shows what they really are. Keep your distance... or get ready to fight.');
  }
  const zs = (z.enc || []).filter(e => SPECIES[e[0]].z), e = zs.length ? pick(zs) : ['shambler', 3, 5];
  const res = await Battle.run({ foes: [[e[0], rint(e[1], e[2]) + 1, 'Pretender']], look: 'w' + w.look + 'z', kind: 'wild', bg: z.bg, intro: 'The Pretender drops the act and lunges!' });
  w.state = 'gone'; PL.grace = 5;
  if (res === 'lose') { await blackout(); return; }
  if (res === 'win') { G.scrap += 10; await say(null, 'The Pretender curls up on the ground and starts to snore. +10 bonus scrap.'); }
  await afterBattle();
}
// Dex carries his current sword on his back, so redraw him when it changes.
function syncGear() { HUM.dex.sword = (G && G.gear.sword) || 0; for (const k in Art.cache) if (k.startsWith('h:dex') || k.startsWith('s:dex')) delete Art.cache[k]; }
function enterWorld() {
  syncGear();
  Scene = 'world'; PL.px = G.x * 16; PL.py = G.y * 16; PL.moving = false; PL.zone = null; checkZone(true);
}
function checkZone(quiet) {
  const z = zoneAt(G.map, G.x, G.y);
  if (z.id === PL.zone) return;
  PL.zone = z.id; PL.banner = 2600; PL.bannerText = z.n; Snd.play(z.music);
  if (!quiet && ZONE_FIRST[z.id] && !flag('z_' + z.id)) { setFlag('z_' + z.id); script(ZONE_FIRST[z.id]); }
}
function warpTo(map, x, y, dir) { WAND.length = 0; G.map = map; G.x = x; G.y = y; if (dir) G.dir = dir; PL.px = x * 16; PL.py = y * 16; PL.moving = false; PL.zone = null; }
async function doWarp(w) { Snd.sfx('door'); await fadeOut(220); warpTo(w[0], w[1], w[2], w[3]); checkZone(); await fadeIn(220); }
async function blackout() {
  await say(null, 'Your critters are all tuckered out! Dex scoops them up and dashes to safety.');
  await fadeOut(400); healAll(); warpTo(G.rest.map, G.rest.x, G.rest.y, 'down'); checkZone(true); await fadeIn(400);
  await say('dex', pick(['Okay. Deep breath. Everybody gets a snack, and we try again.', "Apocalypse Rule #9: Losing just means you're not done yet.", 'We almost had it. Maybe a little practice in Study Hall first?']));
}
async function afterBattle() { await checkFeats(); await Learn.maybeOffer(); }
async function bossFight(o) {
  const r = await Battle.run(Object.assign({ kind: 'boss' }, o));
  if (r !== 'win') { await blackout(); return false; }
  await checkFeats(); PL.pendingOffer = true; return true;
}
async function wild(z) {
  const tb = z.enc; let r = Math.random() * tb.reduce((a, e) => a + e[3], 0), e = tb[0];
  for (const t of tb) { r -= t[3]; if (r <= 0) { e = t; break; } }
  const lvl = rint(e[1], e[2]), sp = evolved(e[0], lvl);
  G.seen[sp] = (G.seen[sp] || 0) + 1;
  const res = await Battle.run({ foes: [[sp, lvl]], kind: 'wild', bg: z.bg });
  PL.grace = 5;
  if (res === 'lose') { await blackout(); return; }
  await afterBattle();
}
function arrive() {
  G.steps++;
  if (Math.random() < .3) spawnWanderer();
  checkZone();
  if (Script.n > 0) return;
  { const D = dayState(); if ((!D.done && D.q >= G.goal) || (G.limitMin && D.ms >= G.limitMin * 60000 && !D.wrapped)) { script(sessionCheck); return; } }
  if (PL.pendingOffer) { PL.pendingOffer = false; script(() => Learn.maybeOffer()); return; }
  if (PL.grace > 0) { PL.grace--; return; }
  if (TINFO[tileAt(G.map, G.x, G.y)].enc && G.party.length && Math.random() < .1) { const z = zoneAt(G.map, G.x, G.y); script(() => wild(z)); }
}
function interact() {
  const [dx, dy] = DV[G.dir], x = G.x + dx, y = G.y + dy, e = entAt(G.map, x, y);
  if (e && e.act) { script(() => e.act(e)); return; }
  const wn = G.map === 'world' && wandAt(x, y); if (wn && wn.state === 'walk') { script(() => pretender(wn)); return; }
  if (tileAt(G.map, x, y) === 'D') script(() => say(null, pick(['Locked. Something inside goes "uuuugh."', 'Locked tight.', "Nobody's home. Well. Nobody you want to meet."])));
}
function worldUpdate(dt, pr) {
  G.time += dt; if (PL.banner > 0) PL.banner -= dt;
  wandUpdate(dt);
  if (Script.n > 0 || Battle.on) return;
  if (PL.moving) {
    PL.t += dt / (Input.held.run ? 80 : 130);
    if (PL.t >= 1) { PL.moving = false; G.x = PL.tx; G.y = PL.ty; PL.px = G.x * 16; PL.py = G.y * 16; arrive(); }
    else { PL.px = (PL.fx + (PL.tx - PL.fx) * PL.t) * 16; PL.py = (PL.fy + (PL.ty - PL.fy) * PL.t) * 16; }
    if (PL.moving || Script.n > 0) return;
  }
  for (const k of pr) { if (k === 'a') { interact(); return; } if (k === 'b') { script(pauseMenu); return; } }
  const d = DIRKEYS.find(k => Input.held[k]);
  if (!d) return;
  G.dir = d;
  const nx = G.x + DV[d][0], ny = G.y + DV[d][1], w = WARPS[`${G.map}:${nx},${ny}`];
  if (w) { script(() => doWarp(w)); return; }
  if (passable(nx, ny)) { PL.moving = true; PL.t = 0; PL.fx = G.x; PL.fy = G.y; PL.tx = nx; PL.ty = ny; PL.step++; }
}
const GMAP = { '=': 'road', c: 'road', '-': 'walk', ':': 'dirt', J: 'dirt', j: 'dirt', s: 'sand', '~': 'water', b: 'plank', o: 'floor', E: 'floor', m: 'grime', w: 'wood', l: 'wood', k: 'carpet', W: 'wall' };
const OBJT = { T: 'tree', t: 'dead', ',': 'tuft', f: 'fence', i: 'ifence', g: 'grave', r: 'rock', c: 'car', j: 'junk', d: 'desk', h: 'shelf', e: 'bed', p: 'plant', u: 'counter', l: 'candle' };
const ESIZE = { egg_ember: 76, egg_tide: 76, egg_storm: 76, egg_whisper: 76, egg_story: 76, stall1: 150, stall2: 150, stall3: 150, clanker: 96, newt: 90, flicker: 90, barricade: 64, nest: 170, tower: 250, krush: 160, bellringer: 170, ferry: 230, fire: 70, stash: 58, comic: 50, sign: 58, note: 52, horn: 62, wreck: 78, log: 70, gate: 60, shutter: 58, munch: 92, coach: 92, mallcop: 92, flatline: 92, bloater: 92 };
const FLOATY = { stash: 1, comic: 1, note: 1 };
function prepMap(name) {
  const mp = MAPS[name], m = mp.m, world = name === 'world', baseT = world ? 'grass' : (GMAP[mp.base] || 'floor');
  mp.baseT = baseT;
  mp.gt = m.t.map(row => row.map(ch => GMAP[ch] || baseT));
  mp.mk = mp.gt.map((row, y) => row.map((t, x) => {
    if (t === 'wall') return (y + 1 < m.h && mp.gt[y + 1][x] !== 'wall') ? 1 : 0;
    if (!GT[t] || !GT[t].e) return 0;
    let k = 0;
    [[0, -1, 1], [1, 0, 2], [0, 1, 4], [-1, 0, 8]].forEach(([dx, dy, bit]) => {
      const nx = x + dx, ny = y + dy; if (nx < 0 || ny < 0 || nx >= m.w || ny >= m.h) return;
      const n = mp.gt[ny][nx]; if (n !== t && !(t === 'water' && n === 'plank')) k |= bit;
    });
    return k;
  }));
}
const LIGHT = document.createElement('canvas'); LIGHT.width = 480; LIGHT.height = 360;
const AMB = Array.from({ length: 46 }, (_, i) => ({ x: Math.random() * W, y: Math.random() * H, p: Math.random() * 6.3, s: .4 + Math.random() }));
let ambT = 0;
function worldDraw() {
  const mp = MAPS[G.map], m = mp.m; if (!mp.gt) prepMap(G.map);
  const now = performance.now(), f = Math.floor(now / 520) % 2, world = G.map === 'world';
  const pxX = PL.px * 3, pxY = PL.py * 3;
  const camX = clamp(pxX + 24 - W / 2, 0, Math.max(0, m.w * 48 - W)), camY = clamp(pxY + 24 - H / 2, 0, Math.max(0, m.h * 48 - H));
  const sx = Fx.shake ? (Math.random() - .5) * Fx.shake : 0, sy = Fx.shake ? (Math.random() - .5) * Fx.shake : 0;
  const x0 = Math.floor(camX / 48), y0 = Math.floor(camY / 48);
  ctx.fillStyle = '#1a1230'; ctx.fillRect(0, 0, W, H);
  ctx.save(); ctx.translate(Math.round(-camX + sx), Math.round(-camY + sy));
  // ---- ground
  for (let ty = y0; ty <= y0 + VH; ty++) for (let tx = x0; tx <= x0 + VW; tx++) {
    if (tx < 0 || ty < 0 || tx >= m.w || ty >= m.h) continue;
    const t = mp.gt[ty][tx], ch = m.t[ty][tx], v = (tx * 7 + ty * 13) & 3;
    if (t === 'wall') ctx.drawImage(Art.wall(mp.mk[ty][tx], v & 1), tx * 48, ty * 48, 48.6, 48.6);
    else ctx.drawImage(Art.ground(t, mp.mk[ty][tx], v, f, mp.baseT, ch === '*' || ch === 'J'), tx * 48, ty * 48, 48.6, 48.6);
    if (t === 'wall') { if (mp.mk[ty][tx] && (tx * 29 + ty * 17) % 19 === 0) ctx.drawImage(Art.blood(10 + (tx % 3)), tx * 48, ty * 48 + 8, 48, 44); }
    else if (t !== 'water' && t !== 'plank' && (tx * 73 + ty * 151) % (world ? (t === 'grass' ? 211 : 31) : (G.map === 'hospital' ? 11 : 23)) === 0) ctx.drawImage(Art.blood((tx * 3 + ty) % 10), tx * 48, ty * 48, 48, 48);
    if (t === 'wall' && !mp.mk[ty][tx] && ty + 1 >= m.h) continue;
    if (ch === 'E') ctx.drawImage(Art.sprite('exitmat'), tx * 48 - 6, ty * 48 - 10, 60, 60);
  }
  // soft shadow that walls cast onto the floor below them
  if (!world) { for (let ty = y0; ty <= y0 + VH; ty++) for (let tx = x0; tx <= x0 + VW; tx++) if (ty > 0 && ty < m.h && tx >= 0 && tx < m.w && mp.gt[ty][tx] !== 'wall' && mp.gt[ty - 1][tx] === 'wall') { const sg = ctx.createLinearGradient(0, ty * 48, 0, ty * 48 + 18); sg.addColorStop(0, 'rgba(10,4,30,.4)'); sg.addColorStop(1, 'rgba(10,4,30,0)'); ctx.fillStyle = sg; ctx.fillRect(tx * 48, ty * 48, 48, 18); } }
  // ---- things that stand up, sorted back-to-front
  const list = [], lights = [], peepers = [];
  for (let ty = y0 - 1; ty <= y0 + VH + 3; ty++) for (let tx = x0 - 2; tx <= x0 + VW + 2; tx++) {
    if (tx < 0 || ty < 0 || tx >= m.w || ty >= m.h) continue;
    const o = OBJT[m.t[ty][tx]]; if (!o) continue;
    list.push({ y: (ty + 1) * 48 + (o === 'tuft' ? 3 : 0), k: o, tx, ty });
    if ((o === 'tree' || o === 'dead') && (tx * 37 + ty * 91) % 19 === 0) peepers.push([tx * 48 + 24, ty * 48 - 6, tx + ty]);
    if (o === 'candle') lights.push([tx * 48 + 24, ty * 48, 170, 1]);
  }
  for (const b of m.b) if ((b.x + b.w) * 48 > camX - 60 && b.x * 48 < camX + W + 60 && (b.y + b.h) * 48 > camY - 20 && b.y * 48 - 400 < camY + H) list.push({ y: (b.y + b.h) * 48 - 6, b });
  for (const e of entsOn(G.map)) { list.push({ y: (e.y + 1) * 48 - 1, e }); if (e.spr === 'fire') lights.push([e.x * 48 + 24, e.y * 48 + 20, 230, 1]); if (e.spr === 'nest') lights.push([e.x * 48 + 24, e.y * 48 - 40, 150, 1]); if (e.spr.startsWith('stall')) lights.push([e.x * 48 + 24, e.y * 48 - 20, 190, 1]); if (e.spr.startsWith('egg_')) lights.push([e.x * 48 + 24, e.y * 48 + 10, 150, 1]); }
  if (world) for (const w of WAND) if (w.state !== 'gone') list.push({ y: w.py * 3 + 47, w });
  list.push({ y: pxY + 48, pl: true }); list.sort((a, b) => a.y - b.y);
  const oval = (x, y, rx, ry) => { ctx.fillStyle = 'rgba(10,4,30,.26)'; ctx.beginPath(); ctx.ellipse(x, y, rx, ry, 0, 0, 6.3); ctx.fill(); };
  for (const o of list) {
    if (o.pl) {
      const fr = PL.moving ? [1, 0, 2, 0][(PL.step * 2 + (PL.t > .5 ? 1 : 0)) % 4] : 0, S = 104, hop = PL.moving ? -Math.abs(Math.sin(PL.t * Math.PI)) * 4 : Math.sin(now / 500) * 1.2;
      oval(pxX + 24, pxY + 43, 23, 8);
      ctx.drawImage(Art.human('dex', G.dir, fr), pxX + 24 - S / 2, pxY + 46 - S * .945 + hop, S, S);
    } else if (o.w) {
      // no shadow under a Pretender, and lightning shows its true face
      const w = o.w, S = 104, turning = w.state === 'turn' && !w.z, real = w.z || (turning && Math.sin(now / 45) > 0) || now - Storm.t0 < 260;
      const fr = w.moving ? [1, 0, 2, 0][(w.step * 2 + (w.t > .5 ? 1 : 0)) % 4] : 0, jit = turning ? (Math.random() - .5) * 6 : 0;
      ctx.drawImage(Art.human('w' + w.look + (real ? 'z' : ''), w.dir, fr), w.px * 3 + 24 - S / 2 + jit, w.py * 3 + 46 - S * .945, S, S);
    } else if (o.b) { const a = Art.building(o.b); ctx.drawImage(a.c, o.b.x * 48 - 12, o.b.y * 48 - 64, a.w, a.h); }
    else if (o.e) {
      const e = o.e, S = (ESIZE[e.spr] || (HUM[e.spr] ? 98 : 82)) * (ESIZE[e.spr] ? 1 : (e.big || 1)), cx = e.x * 48 + 24, by = e.y * 48 + 45;
      const im = e.human ? Art.human(e.spr, 'down', 0) : Art.sprite(e.spr);
      const fl = FLOATY[e.spr] ? Math.sin(now / 350 + e.x) * 4 - 6 : 0, br = (CR[e.spr] || HUM[e.spr]) ? 1 + Math.sin(now / 430 + e.x * 2) * .025 : 1;
      if (e.spr !== 'ferry' && e.spr !== 'fire') oval(cx, by - 1, S * .26, S * .08);
      if (FLOATY[e.spr]) { const gl = ctx.createRadialGradient(cx, by - 26, 2, cx, by - 26, 44); gl.addColorStop(0, 'rgba(255,240,150,.5)'); gl.addColorStop(1, 'rgba(255,240,150,0)'); ctx.fillStyle = gl; ctx.fillRect(cx - 44, by - 70, 88, 88); }
      if (e.spr === 'fire') { const k = 1 + Math.sin(now / 90) * .05; ctx.save(); ctx.translate(cx, by); ctx.scale(f ? -k : k, 2 - k); ctx.drawImage(im, -S / 2, -S * .945, S, S); ctx.restore(); }
      else ctx.drawImage(im, cx - S / 2, by - S * .945 * br + fl, S, S * br);
    } else if (o.k === 'tree') {
      const h = (o.tx * 31 + o.ty * 17) % 7, p = Art.prop('tree' + (h % 3)), s = .92 + h * .035;
      ctx.save(); ctx.translate(o.tx * 48 + 24, o.ty * 48 + 47); ctx.rotate(Math.sin(now / 1100 + o.tx * 1.7 + o.ty * .9) * .02);
      ctx.drawImage(p.c, -p.w * s / 2, -p.h * s + 6, p.w * s, p.h * s); ctx.restore();
    } else if (o.k === 'tuft') {
      const p = Art.prop('tuft'), near = Math.abs(o.tx * 48 - pxX) < 30 && Math.abs(o.ty * 48 - pxY) < 30 && PL.moving;
      ctx.save(); ctx.translate(o.tx * 48 + 24, o.ty * 48 + 48); ctx.transform(1, 0, Math.sin(now / (near ? 90 : 620) + o.tx + o.ty * 2) * (near ? .3 : .13), 1, 0, 0);
      ctx.drawImage(p.c, -p.w * .58, -p.h * 1.1, p.w * 1.16, p.h * 1.1); ctx.restore();
    } else {
      const p = Art.prop(o.k, o.k === 'car' ? (o.tx + o.ty) & 3 : 0);
      ctx.drawImage(p.c, o.tx * 48 + 24 - p.w / 2, o.ty * 48 + 48 - p.h + (o.k === 'fence' || o.k === 'ifence' ? -2 : 0), p.w, p.h);
    }
  }
  ctx.restore();
  // ---- lighting
  const z = zoneAt(G.map, G.x, G.y), zd = z.dark + (world ? .14 : .04);
  if (zd > .03) {
    const lg = LIGHT.getContext('2d'); lg.globalCompositeOperation = 'source-over'; lg.clearRect(0, 0, 480, 360);
    lg.fillStyle = `rgba(14,10,44,${Math.min(.88, zd * (world ? 1.55 : 1.2))})`; lg.fillRect(0, 0, 480, 360);
    lg.globalCompositeOperation = 'destination-out';
    lights.push([pxX + 24, pxY + 10, 210, .9]);
    for (const [lx, ly, r, a] of lights) { const x = (lx - camX) / 2, y = (ly - camY) / 2, q = lg.createRadialGradient(x, y, r * .08, x, y, r / 2 * (1 + Math.sin(now / 130 + lx) * .03)); q.addColorStop(0, `rgba(0,0,0,${a})`); q.addColorStop(1, 'rgba(0,0,0,0)'); lg.fillStyle = q; lg.fillRect(x - r, y - r, r * 2, r * 2); }
    ctx.drawImage(LIGHT, 0, 0, W, H);
    ctx.save(); ctx.globalCompositeOperation = 'lighter';
    for (const [lx, ly, r] of lights.slice(0, -1)) { const x = lx - camX, y = ly - camY, q = ctx.createRadialGradient(x, y, 4, x, y, r * .8); q.addColorStop(0, 'rgba(255,170,70,.28)'); q.addColorStop(1, 'rgba(255,170,70,0)'); ctx.fillStyle = q; ctx.fillRect(x - r, y - r, r * 2, r * 2); }
    ctx.restore();
  }
  // ---- drifting ambience: pollen by day, fireflies and fog at night, dust indoors
  const dt = Math.min(60, now - ambT); ambT = now;
  const spooky = z.dark > .25, indoor = !world;
  // something is watching from the trees...
  if (world) for (const [ex, ey, h] of peepers) {
    const d = Math.hypot(ex - pxX - 24, ey - pxY), blink = Math.sin(now / 1700 + h * 2.3) > -.82, a = clamp((d - 150) / 160, 0, 1) * (blink ? 1 : 0);
    if (!a) continue; const x = ex - camX, y = ey - camY, red = h % 3 === 0;
    for (const s2 of [-6, 6]) { const q = ctx.createRadialGradient(x + s2, y, 0, x + s2, y, 9); q.addColorStop(0, red ? `rgba(255,90,70,${a})` : `rgba(240,255,110,${a})`); q.addColorStop(.35, red ? `rgba(255,60,40,${a * .7})` : `rgba(220,255,90,${a * .7})`); q.addColorStop(1, 'rgba(0,0,0,0)'); ctx.fillStyle = q; ctx.fillRect(x + s2 - 9, y - 9, 18, 18); }
  }
  // the storm: sheets of rain and forked lightning outside, flashes through the windows inside
  if (world) { ctx.fillStyle = 'rgba(16,24,52,.14)'; ctx.fillRect(0, 0, W, H); drawRain(now, 170, .3 + z.dark * .2); drawStorm(now, 300 + (Storm.seed % 260), z.dark > .4 ? 4000 : 6000, z.dark > .4 ? 9000 : 14000); }
  else drawStorm(now, H, 9000, 17000, false);
  if (z.dark > .15 && world) { ctx.save(); ctx.globalAlpha = .06 + z.dark * .12; ctx.fillStyle = '#d0dcff'; for (let i = 0; i < 4; i++) { ctx.beginPath(); ctx.ellipse(((now / (40 + i * 9)) + i * 300) % (W + 600) - 300, 140 + i * 150, 330, 34, 0, 0, 6.3); ctx.fill(); } ctx.restore(); }
  ctx.save();
  for (const a of (PERF.lvl > 1 ? [] : AMB)) {
    a.p += dt * .0016 * a.s; a.x += (Math.cos(a.p) * .25 + (indoor ? 0 : .22)) * dt * .06 * a.s; a.y += Math.sin(a.p * 1.3) * dt * .02 - (spooky ? 0 : dt * .004);
    if (a.x > W + 10) a.x = -10; if (a.y < -10) a.y = H + 10; if (a.y > H + 10) a.y = -10;
    const tw = .5 + .5 * Math.sin(a.p * 3);
    if (spooky) { const q = ctx.createRadialGradient(a.x, a.y, 0, a.x, a.y, 12); q.addColorStop(0, `rgba(190,255,140,${.75 * tw})`); q.addColorStop(1, 'rgba(190,255,140,0)'); ctx.fillStyle = q; ctx.fillRect(a.x - 12, a.y - 12, 24, 24); }
    else { ctx.globalAlpha = (indoor ? .25 : .5) * tw; ctx.fillStyle = indoor ? '#fff6d8' : '#ffffff'; ctx.beginPath(); ctx.arc(a.x, a.y, 1.6 + a.s, 0, 6.3); ctx.fill(); }
  }
  ctx.restore();
  const vg = ctx.createRadialGradient(W / 2, H / 2, 300, W / 2, H / 2, 640); vg.addColorStop(0, 'rgba(10,4,30,0)'); vg.addColorStop(1, `rgba(8,2,24,${.42 + z.dark * .3})`); ctx.fillStyle = vg; ctx.fillRect(0, 0, W, H);
  // ---- HUD
  if (!Battle.on) {
    rbox(10, 10, 372, 46, 23, 'rgba(26,14,58,.82)', '#f2c14e', 2.5);
    ctx.drawImage(Art.sprite('brain'), 12, 4, 54, 54);
    setFont(27); text(`${G.learn.right}   ${brainRank(G.learn.right)}`, 68, 20, '#ffb8d4');
    text(`⚙ ${G.scrap}`, 366, 20, '#ffd76a', 'right');
    { const eg = curEgg(); if (eg) { const pu = 1 + Math.sin(now / 300) * .04 * (1 + (eg.wm + eg.we) / 20); rbox(392, 10, 176, 46, 23, 'rgba(26,14,58,.82)', '#f2c14e', 2.5); ctx.drawImage(Art.sprite('egg_' + eg.el), 394 + 24 - 24 * pu, 8 + 26 - 27 * pu, 48 * pu, 52 * pu); bar(448, 20, 104, 8, eg.wm / 20, '#7fe0d8'); bar(448, 38, 104, 8, eg.we / 20, '#ffb0d0'); } }
    { const D = dayState(), gx = W - 268; rbox(gx, 10, 176, 46, 23, 'rgba(26,14,58,.82)', D.done ? '#a8ffb8' : '#f2c14e', 2.5); setFont(21); text(D.done ? 'GOAL DONE ★' : `Today ${Math.min(D.q, G.goal)}/${G.goal}`, gx + 88, 14, D.done ? '#a8ffb8' : '#fff', 'center'); bar(gx + 20, 40, 136, 6, D.q / G.goal, D.done ? '#5fe070' : '#ffd76a'); }
    if (G.obj) { setFont(23); const ls = wrap('▸ ' + G.obj, 540); rbox(10, 62, 572, ls.length * 25 + 14, 14, 'rgba(26,14,58,.72)'); ls.forEach((l, i) => text(l, 24, 69 + i * 25, '#f4eeff')); }
    if (PL.banner > 0) {
      const a = clamp(PL.banner / 500, 0, 1), up = clamp((2600 - PL.banner) / 300, 0, 1); ctx.globalAlpha = a; setFont(19, true);
      const tw = ctx.measureText(PL.bannerText).width + 80; panel(W / 2 - tw / 2, 150 - up * 16, tw, 58); text(PL.bannerText, W / 2, 164 - up * 16, '#ffd76a', 'center'); ctx.globalAlpha = 1;
    }
  }
}


// ---------------------------------------------------------------- menus
function critterPanel(c, x, y, w, h) {
  panel(x, y, w, h); if (!c) return;
  const sp = SPECIES[c.sp];
  ctx.drawImage(Art.sprite(c.sp), x + 12, y + 6, 164, 164);
  setFont(32); text(cname(c), x + 180, y + 20); setFont(26);
  text('Lv ' + c.lvl, x + 180, y + 58, '#ffd76a'); text(sp.t, x + 270, y + 58, TYPES[sp.t].col);
  text(`HP ${c.hp}/${maxHp(c)}`, x + 180, y + 88); bar(x + 180, y + 122, w - 210, 10, c.hp / maxHp(c), '#5fd86a');
  text(`ATK ${statOf(c, 'atk')}   DEF ${statOf(c, 'def')}   SPD ${statOf(c, 'spd')}`, x + 180, y + 138, '#b9b1c9');
  setFont(22); wrap(sp.desc || '', w - 44).forEach((l, i) => text(l, x + 22, y + 176 + i * 24, '#b9b1c9'));
  setFont(26); c.moves.forEach((id, i) => { const m = MOVES[id]; text(m.n, x + 22, y + 240 + i * 32); text(m.t + (m.p ? ' ' + m.p : ''), x + w - 22, y + 240 + i * 32, TYPES[m.t].col, 'right'); });
  const a = xpFor(c.lvl), b = xpFor(c.lvl + 1); setFont(22); text(`XP to next level: ${Math.max(0, b - c.xp)}`, x + 22, y + h - 40, '#8fb8f0');
}
const partyItems = list => list.map(c => ({ label: `${cname(c)}  Lv${c.lvl}`, right: `${c.hp}/${maxHp(c)}`, col: c.hp <= 0 ? '#e07a8a' : null }));
async function partyMenu() {
  while (true) {
    const i = await menu(partyItems(G.party), { x: 20, y: 20, w: 400, title: 'YOUR TEAM  (pick one to put first)', onDraw: s => critterPanel(G.party[s], 430, 20, 510, 420) });
    if (i < 0) return;
    if (i > 0) { const c = G.party.splice(i, 1)[0]; G.party.unshift(c); toast(`${cname(c)} leads the team`); }
  }
}
async function bagMenu() {
  while (true) {
    const ids = Object.keys(ITEMS).filter(id => G.bag[id] > 0);
    if (!ids.length) { await say(null, 'Your bag is empty.'); return; }
    const i = await menu(ids.map(id => ({ label: ITEMS[id].n, right: '×' + G.bag[id] })), { x: 20, y: 20, w: 420, title: 'BAG', onDraw: s => { panel(450, 20, 490, 110); setFont(26); wrap(ITEMS[ids[s]].d, 450).forEach((l, k) => text(l, 472, 40 + k * 28)); } });
    if (i < 0) return;
    if (ids[i] === 'snack') { await say(null, 'Toss these to wild critters during a battle.'); continue; }
    if (ITEMS[ids[i]].foe || ITEMS[ids[i]].buff || ITEMS[ids[i]].party) { await say(null, 'Save this for a battle. Open your BAG during a fight to use it.'); continue; }
    const t = await menu(partyItems(G.party), { x: 450, y: 140, w: 490, title: 'Use on who?' });
    if (t >= 0 && !(await useItem(ids[i], G.party[t]))) await say(null, "That won't do anything right now.");
  }
}
async function penMenu() {
  while (true) {
    if (!G.pen.length) { await say(null, 'The Critter Pen is empty. When your team is full, new friends wait here.'); return; }
    const i = await menu(partyItems(G.pen), { x: 20, y: 20, w: 400, title: 'CRITTER PEN', onDraw: s => critterPanel(G.pen[s], 430, 20, 510, 420) });
    if (i < 0) return;
    if (G.party.length < 6) { G.party.push(G.pen.splice(i, 1)[0]); continue; }
    const t = await menu(partyItems(G.party), { x: 20, y: 20, w: 400, title: 'Swap with who?', onDraw: s => critterPanel(G.party[s], 430, 20, 510, 420) });
    if (t >= 0) { const a = G.pen[i]; G.pen[i] = G.party[t]; G.party[t] = a; }
  }
}
const overlay = () => { ctx.fillStyle = 'rgba(12,6,30,.8)'; ctx.fillRect(0, 0, W, H); panel(20, 14, W - 40, H - 28); };
const journal = () => page(() => {
  overlay(); setFont(18, true); text("DEX'S APOCALYPSE LOG", 44, 34, '#ffd76a');
  setFont(26); let y = 70; wrap('GOAL: ' + (G.obj || '—'), W - 100).forEach(l => { text(l, 44, y, '#7fe08a'); y += 28; });
  y += 10; setFont(23);
  const lines = []; for (const e of G.log.slice(-4)) { wrap(e, W - 100).forEach(l => lines.push(l)); lines.push(''); }
  lines.slice(-21).forEach(l => { text(l, 44, y, '#e8e0f4'); y += 25; });
});
const badgesPage = () => page(() => {
  overlay(); setFont(18, true); text(`MERIT BADGES  ${G.badges.length}/${Object.keys(BADGES).length}`, 44, 34, '#ffd76a');
  setFont(22);
  Object.keys(BADGES).forEach((id, i) => {
    const has = G.badges.includes(id), x = 44 + (i % 2) * 450, y = 74 + Math.floor(i / 2) * 60;
    text((has ? '★ ' : '☆ ') + BADGES[id][0], x, y, has ? '#ffd76a' : '#6d6680'); text(has ? BADGES[id][1] : '???', x + 26, y + 24, has ? '#e8e0f4' : '#4d4660');
  });
  text('Every badge makes your critters earn XP a little faster.', 44, H - 50, '#8f86a8');
});
const crewPage = () => page(() => {
  overlay(); setFont(18, true); text('THE CREW', 44, 34, '#ffd76a');
  setFont(22); text('Blade: ' + (G.gear.sword ? SWORDS[G.gear.sword - 1].n : 'none yet') + '     Charms: ' + (Object.keys(G.gear.charms).map(k => CHARMS[k].n).join(', ') || 'none yet'), W - 44, 40, '#c8ffb8', 'right');
  if (!G.crew.length) { setFont(28); text("It's just you and your critters. For now.", 44, 90); return; }
  G.crew.forEach((id, i) => {
    const c = CREW[id], y = 76 + i * 200;
    ctx.drawImage(Art.human(id, 'down', 0), 44, y, 126, 126);
    setFont(30); text(`${c.n} — ${c.role}`, 190, y, SPEAKERS[id].col); setFont(24);
    text('Bond: ' + '♥'.repeat(Math.min(3, G.bond[id] || 0)) + '♡'.repeat(3 - Math.min(3, G.bond[id] || 0)), 190, y + 36, '#ff9ab8');
    wrap(c.bio, 700).forEach((l, k) => text(l, 190, y + 66 + k * 26, '#e8e0f4'));
    text(`${c.ab}: ${c.abd}`, 190, y + 126, '#7fe08a');
  });
  setFont(20); text('Talk with your crew at campfires to grow your bond. Stronger bonds, stronger powers.', 44, H - 50, '#8f86a8');
});
// a sum a second-grader will not do in his head keeps grown-up settings for grown-ups
async function grownUp() { const a = rint(13, 19), b = rint(6, 9), t = await typeAnswer(`Grown-ups only. What is ${a} × ${b}?`, { rows: 1, cancel: 'Cancel', placeholder: 'answer' }); if (t === null) return false; if (parseInt(t, 10) !== a * b) { await say(null, 'Not quite. This is for grown-ups.'); return false; } return true; }
async function optionsMenu() {
  while (true) {
    const opts = [
      [`Grade level: ${G.learn.grade}`, async () => { const g = await menu(['Grade 2', 'Grade 3', 'Grade 4', 'Grade 5', 'Grade 6'], { x: 330, y: 230, w: 300, sel: G.learn.grade - 2, title: 'Question level' }); if (g >= 0) G.learn.grade = 2 + g; }],
      [`Read the story aloud: ${G.readAloud ? 'ON' : 'off'}`, async () => { G.readAloud = !G.readAloud; if (!Speak.can()) await say(null, 'This device does not have a reading voice available, so nothing will be read aloud.'); }],
      [`Reading voice: ${Speak.label()}`, async () => {
        if (!Speak.can()) { await say(null, 'This device has no reading voice turned on. On a Fire tablet: Settings, then Accessibility or Keyboard & Language, then Text-to-Speech.'); return; }
        const opts = (window.LBSpeech ? [{ label: 'Tablet voice', v: '' }] : []).concat(Speak.voices().filter(v => v.score > 0).slice(0, 8).map(v => ({ label: Speak.pretty(v.name), v: v.name })));
        while (true) { const cur = window.LBSpeech ? Speak.get(Speak.VKEY, '') : Speak.voiceName(), k = await menu(opts.map(o => ({ label: (o.v === cur ? '● ' : '○ ') + o.label })).concat([{ label: 'Done' }]), { x: 250, y: 120, w: 460, rows: 10, title: 'Pick a voice (tap to hear it)' });
          if (k < 0 || k >= opts.length) break; Speak.set(Speak.VKEY, opts[k].v); Speak.say('Hi! I can read the story and the questions to you.'); } Speak.stop(); }],
      [`Reading speed: ${Speak.rate() < .9 ? 'slow' : Speak.rate() > 1 ? 'fast' : 'normal'}`, async () => { const k = await menu(['Slow', 'Normal', 'Fast'], { x: 330, y: 250, w: 300, title: 'Reading speed' }); if (k >= 0) { Speak.set(Speak.RKEY, ['0.8', '0.95', '1.1'][k]); Speak.say('This is how fast I will read.'); } }],
      [`Sound: ${Snd.muted ? 'off' : 'ON'}`, async () => { Snd.toggleMute(); }],
      [`Daily goal: ${G.goal} questions`, async () => { const k = await menu(['10 questions', '20 questions', '30 questions'], { x: 330, y: 250, w: 300, sel: [10, 20, 30].indexOf(G.goal), title: 'Daily goal' }); if (k >= 0) G.goal = [10, 20, 30][k]; }],
      [`Play-time limit: ${G.limitMin ? G.limitMin + ' minutes' : 'off'}  (grown-ups)`, async () => { if (!(await grownUp())) return; const k = await menu(['Off', '15 minutes', '20 minutes', '30 minutes', '45 minutes'], { x: 330, y: 230, w: 300, title: 'Stop for the day after' }); if (k >= 0) G.limitMin = [0, 15, 20, 30, 45][k]; }],
      ['Report Card  (grown-ups)', () => Learn.report()],
      [`Claude marking: ${Grader.key() ? 'ON' : 'off'}  (grown-ups)`, async () => {
        if (!(await grownUp())) return;
        await say(null, 'With an Anthropic API key, typed sentences in the Writing Workshop are marked by Claude, with a line of feedback. The key stays on this device only. Each sentence marked is one small paid API call.');
        const k = await typeAnswer(Grader.key() ? 'A key is saved. Paste a new one, or type "none" to remove it.' : 'Paste an Anthropic API key (it starts with sk-ant-).', { rows: 2, cancel: 'Cancel', placeholder: 'sk-ant-...' });
        if (k === null) return; if (/^none$/i.test(k)) { Grader.setKey(''); toast('Claude marking off'); } else { Grader.setKey(k); toast('Claude marking on'); } }],
      ['Back', null]];
    const i = await menu(opts.map(o => o[0]), { x: 210, y: 110, w: 560, rows: 11, title: 'OPTIONS' });
    if (i < 0 || !opts[i][1]) return;
    await opts[i][1]();
  }
}
// ---------------------------------------------------------------- a day's play: a goal, a wrap-up, a place to stop
const dayKey = (off) => new Date(Date.now() - (off || 0) * 864e5).toLocaleDateString('en-CA');
function dayState() {
  const d = dayKey();
  if (!G.day || G.day.date !== d) { if (!(G.day && G.day.done && G.day.date === dayKey(1))) G.dayStreak = 0; G.day = { date: d, q: 0, r: 0, ms: 0, done: false, wrapped: false, sk: {} }; }
  return G.day;
}
function dayTick(skill, ok) { const D = dayState(); D.q++; if (ok) D.r++; const k = D.sk[skill] || (D.sk[skill] = [0, 0]); k[0]++; if (ok) k[1]++; }
function daySummary(title, sub) {
  const D = dayState(), best = Object.keys(D.sk).filter(k => SKILLS[k] && D.sk[k][1] > 0).sort((a, b) => D.sk[b][1] - D.sk[a][1]).slice(0, 3).map(k => SKILLS[k].n);
  const st = Learn.standing(), next = st.weak[0] ? st.weak[0].n : SKILLS[Learn.pickFocus()].n;
  return page(() => {
    ctx.fillStyle = 'rgba(12,6,30,.84)'; ctx.fillRect(0, 0, W, H); panel(90, 60, W - 180, H - 130);
    setFont(24, true); text(title, W / 2, 86, '#ffd76a', 'center'); setFont(26); text(sub, W / 2, 136, '#c8ffb8', 'center');
    ctx.drawImage(Art.sprite('fire'), W / 2 - 60, 160, 120, 120);
    setFont(30); text(`${D.q} questions today   ·   ${D.q ? Math.round(100 * D.r / D.q) : 0}% right`, W / 2, 292, '#fff', 'center');
    text(`Day streak: ${G.dayStreak || 0}  ${'★'.repeat(Math.min(7, G.dayStreak || 0))}`, W / 2, 334, '#ffd76a', 'center');
    setFont(25); wrap('Got stronger at: ' + (best.join(', ') || 'showing up, which counts'), W - 260).forEach((l, i) => text(l, W / 2, 390 + i * 30, '#f4eeff', 'center'));
    text('Next time: ' + next, W / 2, 470, '#ffb0d0', 'center');
    const [m, n] = Learn.progress(); text(`Grade ${G.learn.grade} skills mastered: ${m} of ${n}`, W / 2, 506, '#9fe0ff', 'center');
    if (Math.floor(performance.now() / 400) % 2) text('▼', W - 130, H - 110, '#c9a24a');
  });
}
async function stopForToday() { await say('dex', pick(['Good work today. See you tomorrow.', 'That is a wrap. The Nest will keep the light on.', 'Brain: bigger. Zombies: sleepier. Good day.'])); saveGame(); await fadeOut(500); Scene = 'title'; WAND.length = 0; Fx.fade = 0; script(titleFlow); }
async function sessionCheck() {
  const D = dayState();
  if (!D.done && D.q >= G.goal) {
    D.done = true; G.dayStreak = (G.dayStreak || 0) + 1; G.scrap += 50; give('potion', 1, true); Snd.sfx('badge');
    await daySummary('DAILY GOAL COMPLETE!', `${G.goal} Brain Blasts done.  +50 scrap and a Healing Potion`);
    if (G.dayStreak >= 3) await badge('days3'); if (G.dayStreak >= 7) await badge('days7');
    if (await ask(Learn.teacher(), 'That was your goal for today. This is a great place to stop. Your brain keeps what it learned better after a rest.', ['Save and stop for today', 'Keep playing a bit']) === 0) { await stopForToday(); return true; }
  } else if (G.limitMin && D.ms >= G.limitMin * 60000 && !D.wrapped) {
    D.wrapped = true; Snd.sfx('badge');
    await daySummary('CAMPFIRE TIME', `That is ${G.limitMin} minutes of play for today.`);
    if (await ask(null, 'Time to stop for today. (A grown-up can allow more time.)', ['Save and stop', 'A grown-up says keep going']) === 1 && (await grownUp())) return false;
    await stopForToday(); return true;
  }
  return false;
}
async function welcomeBack() {
  const D = dayState(); if (D.told) return; D.told = true;
  if (!G.log.length) return;
  const st = Learn.standing();
  await say(Learn.teacher(), `Welcome back! ${G.dayStreak ? `Day streak: ${G.dayStreak}. ` : ''}Today's goal is ${G.goal} Brain Blasts.${st.weak[0] ? ` We will give "${st.weak[0].n}" some extra turns.` : ''}`);
  if (G.obj) await say('dex', 'Right. Where was I? ' + G.obj);
}
async function pauseMenu() {
  while (true) {
    const opts = [['Team', partyMenu], ['Bag', bagMenu], ['Study Hall', () => Learn.studyHall()], ['Practice & Tests', () => Learn.practiceMenu()], ['Dragons', eggsPage]];
    if (flag('canFly')) opts.push(['Fly', flyMenu]);
    opts.push(["Dex's Log", journal], ['Badges', badgesPage], ['Crew', crewPage], ['Save', async () => saveGame()], ['Options', optionsMenu], ['Close', null]);
    const i = await menu(opts.map(o => o[0]), { x: W - 300, y: 20, w: 280, rows: 12, title: 'MENU' });
    if (i < 0 || !opts[i][1]) return;
    if ((await opts[i][1]()) === 'exit') return;
  }
}
async function restMenu(nest) {
  while (true) {
    const talk = TALKS.find(t => G.crew.includes(t.who) && t.ok() && !flag('talk_' + t.id)), [pm, pn] = Learn.progress();
    const opts = [['Rest & Save', async () => {
      await fadeOut(350); healAll(); G.rest = { map: G.map, x: G.x, y: G.y };
      if (G.map === 'world') { const rn = nest ? "The Crow's Nest" : zoneAt('world', G.x, G.y).n; G.roosts = G.roosts.filter(r => r.n !== rn); G.roosts.push({ n: rn, x: G.x, y: G.y }); } Snd.sfx('heal'); saveGame(); await fadeIn(350);
      await say(null, 'Everyone is rested and healed. Game saved.');
    }]];
    if (flag('priya')) opts.push([`Answer a signal  (Night ${G.night + 1})`, () => Story.signal()]);
    if (flag('canFly') && G.map === 'world') opts.push(['Fly by dragon', () => flyMenu()]);
    opts.push([`Study Hall  ★ ${pm}/${pn}`, () => Learn.studyHall()]);
    opts.push(['Practice & Tests', () => Learn.practiceMenu()]);
    opts.push([talk ? `Talk with ${CREW[talk.who].n}  ♥` : 'Sit by the fire', async () => {
      if (!talk) { await say(null, pick(['The fire crackles. For a minute, everything is okay.', 'Your critters pile up into one big, snoring heap.', "You toast a gummy worm. It's... not great. You eat it anyway."])); return; }
      const prev = Snd.curName; Snd.play('sad');
      const b = await talk.run(); setFlag('talk_' + talk.id);
      G.bond[talk.who] = Math.min(3, (G.bond[talk.who] || 0) + b); Snd.sfx('heal');
      await say(null, `Your bond with ${CREW[talk.who].n} grew!  ` + '♥'.repeat(G.bond[talk.who]) + '♡'.repeat(3 - G.bond[talk.who]), { col: '#ff9ab8' });
      Snd.play(prev);
    }]);
    if (nest) opts.push(['Critter Pen', () => penMenu()]);
    opts.push(['Leave', null]);
    const i = await menu(opts.map(o => o[0]), { x: 290, y: 200, w: 400, title: nest ? `THE CROW'S NEST${G.saved.length ? `  ·  ${G.saved.length} kids safe` : ''}` : 'CAMPFIRE' });
    if (i < 0 || !opts[i][1]) return;
    if ((await opts[i][1]()) === 'exit') return;
    if (Scene !== 'world') return;
  }
}
// ---------------------------------------------------------------- dragon eggs
// Skills mastered so far, [math, English], counted across every grade he has played.
function masteredBy() { let m = 0, e = 0; for (const k in G.learn.sk) { if (!G.learn.sk[k].m) continue; const sk = SKILLS[k.split('@')[0]]; if (sk) sk.sub === 'math' ? m++ : e++; } return [m, e]; }
const curEgg = () => G.eggs.find(x => !x.hatched);
const eggNeed = k => Math.min(10, 2 * k);
const dragonsOwned = () => G.party.concat(G.pen).filter(c => SPECIES[c.sp].dragon);
const rideable = () => G.party.find(c => SPECIES[c.sp].dragon && SPECIES[c.sp].stage >= 2 && c.hp > 0);
async function eggNest(elm, need, cold) {
  const D = DRAGONS[elm];
  if (!flag(need)) { await say(null, cold); return; }
  if (!flag('eggSeen')) { setFlag('eggSeen'); await say(null, 'In a nest of old feathers sits an egg the size of a football. It is warm. It is HUMMING.'); await say('dex', 'That is not a critter egg. That is a... no way.'); await say('guide', 'FIELD GUIDE: Dragon eggs sleep under Wexler Falls. An egg only goes with someone whose mind is sharp in BOTH numbers and words. First it tests you. Then it must be kept warm with right answers.'); }
  if (curEgg()) { await say(null, `The ${D.egg} hums at you. But you are already keeping one egg warm, and a dragon needs ALL of your attention. Hatch that one first.`); return; }
  const k = G.eggs.length + 1, [m, e] = masteredBy();
  if (m < k || e < k) {
    await say(null, `You reach for the ${D.egg}. It goes ice cold.\nIt wants a sharper mind: ${k} math skill${k > 1 ? 's' : ''} AND ${k} English skill${k > 1 ? 's' : ''} mastered. You have ${m} math and ${e} English.`);
    await say(Learn.teacher(), 'Master skills in Study Hall, on Night Watch, or by getting four in a row in battle. Then come back for it.'); return;
  }
  const n = [6, 6, 8, 8, 10][k - 1];
  if (await ask(null, `The ${D.egg} glows. It is going to test you: ${n} questions, math and English, and you may only miss one. Ready?`, ['I am ready.', 'Not yet']) !== 0) return;
  if (!(await Learn.eggTrial(k))) { await say(null, 'The egg goes quiet and dim. Not this time. It will let you try again when you are ready.'); return; }
  G.eggs.push({ el: elm, k, hatched: false, wm: 0, we: 0 }); Snd.sfx('badge'); Fx.flash = .6; tween(Fx, 'flash', 0, 500);
  await say(null, `★ You won the ${D.egg}! ★\nIt rolls into your backpack and settles against your spine like a hot-water bottle.`, { col: '#ffd76a' });
  await say('guide', `To hatch it: keep it warm with 20 right MATH answers and 20 right ENGLISH answers, and master ${eggNeed(k)} skills in each. Check on it any time under DRAGONS in the menu.`);
  logAdd(`I have a dragon egg in my backpack. A DRAGON EGG. It hums when I get answers right. Nana Newt says it will only hatch for someone who is good at numbers AND words. So. Guess I am doing that.`);
  await badge('egg');
}
// Hatches the egg he is carrying once the proficiency bar is met, and grows dragons as his mastery grows.
async function dragonCheck() {
  const eg = curEgg(), [m, e] = masteredBy();
  if (eg && m >= eggNeed(eg.k) && e >= eggNeed(eg.k) && eg.wm >= 20 && eg.we >= 20) {
    const D = DRAGONS[eg.el], c = makeCritter(eg.el + '1', clamp(Math.max(5, ...G.party.map(x => x.lvl)) - 1, 5, 50));
    eg.hatched = true; const prev = Snd.curName; Snd.play('sad');
    await say(null, 'Your backpack is shaking.'); Fx.shake = 8; Snd.sfx('enc'); await say(null, 'CRACK. A line of light runs across the shell. Crack. CRACK.'); Fx.flash = 1; Snd.sfx('badge'); await tween(Fx, 'flash', 0, 700); Fx.shake = 0;
    addCritter(c);
    await say(null, `★ The ${D.egg} hatched! ★\n${D.n[0]} blinks up at you, sneezes a tiny spell, and climbs onto your shoulder.`, { col: '#ffd76a' });
    await say(Learn.teacher(), `A dragon. An actual dragon. ${D.d} Its spells get stronger the longer your answer streak is.${G.party.includes(c) ? '' : ' (Your team is full, so it is waiting in the Critter Pen at the Nest.)'}`);
    logAdd(`${D.n[0]} hatched today. I kept it warm with forty right answers. It fell asleep in my hood. I am never taking this hoodie off.`);
    Snd.play(prev); await badge('hatch'); if (G.eggs.filter(x => x.hatched).length >= 5) await badge('clutch');
  }
  for (const c of dragonsOwned()) {
    const sp = SPECIES[c.sp], want = (m >= 9 && e >= 9 && m + e >= 22) ? 3 : (m >= 4 && e >= 4 && m + e >= 10) ? 2 : 1;
    if (want <= sp.stage) continue;
    const old = cname(c), before = maxHp(c); c.sp = sp.dragon + (sp.stage + 1); c.hp += maxHp(c) - before; c.dhp = c.hp; G.dex[c.sp] = 1;
    for (const [l, id] of SPECIES[c.sp].ls) if (l <= c.lvl && !c.moves.includes(id)) { if (c.moves.length < 4) c.moves.push(id); else c.moves[0] = id; }
    Snd.sfx('badge'); Fx.flash = 1; await tween(Fx, 'flash', 0, 500);
    await say(null, `★ ${old} grew into ${SPECIES[c.sp].n}! ★\nAll that mastered math and English had to go somewhere.`, { col: '#ffd76a' });
    if (sp.stage === 1 && !flag('canFly')) { setFlag('canFly'); await say('dex', 'Whoa. You are... big enough to RIDE.'); await say('guide', 'FIELD GUIDE: A grown dragon can FLY you to any campfire you have rested at. Choose FLY at a campfire, the Nest, or in the menu. (Outdoors only. Dragons hate ceilings.)'); }
  }
}
async function flyMenu() {
  const c = rideable();
  if (G.map !== 'world') { await say(null, 'Dragons hate ceilings. Go outside first.'); return; }
  if (!c) { await say(null, dragonsOwned().length ? 'Your dragon is still too small to ride. It grows as you master more skills in math AND English.' : 'You need a grown dragon to fly.'); return; }
  const here = zoneAt('world', G.x, G.y).n, spots = G.roosts.filter(r => Math.abs(r.x - G.x) + Math.abs(r.y - G.y) > 6);
  if (!spots.length) { await say(null, 'Dragons fly between campfires you have rested at. Rest at a few more first.'); return; }
  const i = await menu(spots.map(r => r.n).concat(['Stay here']), { x: 280, y: 160, w: 400, title: `FLY ON ${cname(c).toUpperCase()}` });
  if (i < 0 || i >= spots.length) return;
  await say(null, `${cname(c)} crouches low. Dex climbs on and holds tight.`);
  await fadeOut(300); PL.fly = { t0: performance.now(), sp: c.sp }; Scene = 'fly'; Snd.sfx('thunder'); await fadeIn(250);
  await sleep(2300); await fadeOut(300);
  warpTo('world', spots[i].x, spots[i].y, 'down'); Scene = 'world'; checkZone(true); await fadeIn(350);
  await badge('rider');
  return 'exit';
}
function flyDraw() {
  const now = performance.now(), p = clamp((now - PL.fly.t0) / 2400, 0, 1);
  const g2 = ctx.createLinearGradient(0, 0, 0, H); g2.addColorStop(0, '#0d0a2a'); g2.addColorStop(.6, '#3a2a6b'); g2.addColorStop(1, '#6a3a78'); ctx.fillStyle = g2; ctx.fillRect(0, 0, W, H);
  const gl = ctx.createRadialGradient(760, 130, 10, 760, 130, 240); gl.addColorStop(0, 'rgba(255,90,70,.7)'); gl.addColorStop(1, 'rgba(255,90,70,0)'); ctx.fillStyle = gl; ctx.fillRect(520, -110, 480, 480); ctx.fillStyle = '#e8483a'; ctx.beginPath(); ctx.arc(760, 130, 60, 0, 6.3); ctx.fill();
  ctx.fillStyle = 'rgba(200,210,255,.16)'; for (let i = 0; i < 9; i++) { const x = W + 300 - ((now * (.5 + (i % 3) * .25) + i * 260) % (W + 600)), y = 90 + i * 70; for (const [dx, dy, r] of [[0, 0, 50], [56, 12, 38], [-56, 14, 34], [14, -22, 36]]) { ctx.beginPath(); ctx.arc(x + dx, y + dy, r, 0, 6.3); ctx.fill(); } }
  const x = -220 + p * (W + 440), y = 330 + Math.sin(now / 260) * 26, fl = 1 + Math.sin(now / 110) * .06;
  ctx.save(); ctx.translate(x, y); ctx.rotate(-.12);
  ctx.drawImage(Art.sprite(PL.fly.sp), -190, -190 * fl, 380, 380 * fl);
  ctx.drawImage(Art.human('dex', 'right', 1), -52, -214, 110, 110);
  ctx.restore();
  drawRain(now, 190, .4); drawStorm(now, H, 1500, 3000);
}
const eggsPage = () => page(() => {
  overlay(); setFont(18, true); text('DRAGONS', 44, 34, '#ffd76a');
  const [m, e] = masteredBy(); setFont(23); text(`Skills mastered:  Math ${m}   ·   English ${e}`, W - 44, 40, '#c8ffb8', 'right');
  Object.keys(DRAGONS).forEach((elm, i) => {
    const D = DRAGONS[elm], eg = G.eggs.find(x => x.el === elm), y = 78 + i * 112, dr = dragonsOwned().find(c => SPECIES[c.sp].dragon === elm);
    rbox(40, y, W - 80, 104, 14, 'rgba(12,6,30,.45)', eg ? '#f2c14e' : '#4a3f66', 2);
    if (!eg) { ctx.globalAlpha = .28; ctx.drawImage(Art.sprite('egg_' + elm), 52, y + 4, 96, 96); ctx.globalAlpha = 1; setFont(27); text('? ? ?', 170, y + 14, '#8f86a8'); setFont(22); text('An egg is still out there somewhere. Look where the strongest zombies were.', 170, y + 52, '#6d6680'); return; }
    ctx.drawImage(Art.sprite(eg.hatched && dr ? dr.sp : 'egg_' + elm), 52, y + 4, 96, 96);
    setFont(27); text(eg.hatched ? (dr ? `${cname(dr)}   Lv ${dr.lvl}` : D.n[0]) : D.egg, 170, y + 10, '#ffd76a'); setFont(22);
    if (eg.hatched) { const st = dr ? SPECIES[dr.sp].stage : 1; text(D.d, 170, y + 44, '#e8e0f4'); text(st >= 3 ? 'Fully grown. Can fly.' : st === 2 ? `Can fly.  Final form at 9 math + 9 English skills mastered (${m}/${e}).` : `Too small to ride.  Grows at 4 math + 4 English skills mastered (${m}/${e}).`, 170, y + 70, '#a8ffb8'); return; }
    const need = eggNeed(eg.k), ok = v => v ? '#a8ffb8' : '#ffb07a';
    text(`Warmth:   Math ${eg.wm}/20`, 170, y + 44, ok(eg.wm >= 20)); bar(400, y + 50, 150, 12, eg.wm / 20, '#7fe0d8'); text(`English ${eg.we}/20`, 580, y + 44, ok(eg.we >= 20)); bar(740, y + 50, 150, 12, eg.we / 20, '#ffb0d0');
    text(`Skills mastered:   Math ${Math.min(m, need)}/${need}`, 170, y + 72, ok(m >= need)); text(`English ${Math.min(e, need)}/${need}`, 580, y + 72, ok(e >= need));
  });
  setFont(20); text('An egg warms with RIGHT answers. Dragons only hatch, and only grow, for someone strong in both math and English.', 44, H - 50, '#8f86a8');
});
// ---------------------------------------------------------------- the Night Market: pay with brains
const SHOPS = {
  forge: { who: 'clank', title: "OLD CLANK'S FORGE", short: 'FORGE',
    intro: ["Halt. ...Old habit. I stood guard at Blackwood Manor for a hundred years.", "I watched that Bell switch off every mind in this town. I am done guarding it. Now I make things to break it.", "I do not take scrap, small knight. A blade is only as sharp as the one who swings it. Show me you can THINK, and I will arm you."],
    hello: ['Back for a better blade, small knight?', 'Steel is patient. Are you?', 'A sharp mind first. Then a sharp sword.'],
    stock() { const gates = [null, 'priya', 'bash', 'wren', 'broadcast'], why = ['', 'Old Clank needs Priya to design the grip. Find her first.', 'Too heavy to forge alone. Come back with someone strong.', 'It must be quenched in lightning. Come back with someone fast enough to catch a bolt.', 'It needs a shard of the antenna dish. Send the broadcast first.'];
      return SWORDS.map((w, i) => ({ n: w.n, d: w.d + ` Your critters hit ${6 * (i + 1)}% harder, and Dex can strike once per battle.`, tier: i + 1, owned: G.gear.sword > i, locked: (G.gear.sword < i && 'Earn the ' + SWORDS[i - 1].n + ' first.') || (gates[i] && !flag(gates[i]) && why[i]), get() { G.gear.sword = i + 1; syncGear(); } })); },
    async extra() { if (G.gear.sword >= 1 && !flag('lore_clank')) { setFlag('lore_clank'); await say('clank', 'You carry a blade now, so you should know what I truly guarded. Not the Bell. What sleeps BENEATH it.'); await say('clank', 'Five eggs. Older than the manor. The Blackwoods built that Bell to keep them asleep. The Bellringer turned it on your town instead.'); await say('clank', 'The eggs choose their own keepers, small knight. They care nothing for strength. Only for a mind that is sharp in numbers AND in words.'); } },
    dare: it => `The ${it.n}. Earn it.`, win: ['It suits you. Swing it like you mean it.', 'Well struck, small knight. Even before you swing.'], lose: ['Not yet. The steel can wait. Try again when you are ready.', 'A dull answer. Sharpen it and return.'] },
  brew: { who: 'newt', title: "NANA NEWT'S POTIONS", short: 'POTION',
    intro: ["Come in, come in, dearie! Mind the cauldron. It bites.", "We crawled up out of the storm drains on the Green Night, same as your critters. Somebody has to look after the little ones.", "Venom, dearie, is just medicine pointed the other way. I don't want your scrap. A potion is a recipe, and a recipe is MATH. Measure right and I'll brew for you."],
    hello: ['Back again, dearie? Lovely.', 'What shall Nana brew for you today?', 'The cauldron is hot and so are my recipes.'],
    stock() { const mk = (id, tier, qty, gate, why) => ({ n: ITEMS[id].n + (qty > 1 ? ' ×' + qty : ''), d: ITEMS[id].d + ` You have ${G.bag[id] || 0}.`, tier, qty, locked: gate && !flag(gate) && why, get() { give(id, qty, true); } });
      return [mk('potion', 1, 2), mk('venom', 2, 2, 'priya', 'Nana needs glass vials from the school science lab. Rescue Priya first.'), mk('power', 2, 1, 'priya', 'Nana needs glass vials from the school science lab. Rescue Priya first.'), mk('stone', 3, 1, 'bash', 'Needs moss from the mall garden. Befriend whoever is guarding it.'), mk('tonic', 4, 1, 'wren', 'Needs a feather from the junkyard crows. Go meet their keeper.')]; },
    async extra() { const eg = curEgg(); if (eg) await say('newt', eg.wm >= 20 && eg.we >= 20 ? "Ooh, that egg is toasty, dearie! Warm enough. Now it just wants you to MASTER a few more skills. Check your DRAGONS page." : `Let Nana feel that egg. Mm. Math warmth ${eg.wm} of 20, English warmth ${eg.we} of 20. Right answers, dearie. That is the only fire it likes.`); },
    dare: it => `${it.n.replace(/ ×.*/, '')}? Ooh, a tricky recipe. Measure carefully!`, win: ['Perfect measurements! Here you are, dearie.', 'Bubbling beautifully. Don\'t drink it all at once.'], lose: ['Oh dear, it curdled. No matter! We try again.', 'A pinch too much somewhere. Have another go, dearie.'] },
  magic: { who: 'flick', title: "PROFESSOR FLICKER'S SPELL CELLAR", short: 'MAGIC',
    intro: ["Ah! A living student. How novel. I was librarian at Blackwood Manor, before the Bell. And after, I suppose, in a manner of speaking.", "Here is the secret, young man: the Bell does not make monsters. It switches THINKING off. A mind that is busy working cannot be switched off.", "That is why your critters strike harder when you solve things. Numbers and words are the oldest magic there is. Prove you can wield them, and my scrolls are yours."],
    hello: ['Class is in session.', 'Ah, my favorite living student.', 'Magic is only math wearing a cape. Shall we?'],
    stock() { const sc = (id, tier, qty, gate, why) => ({ n: ITEMS[id].n + (qty > 1 ? ' ×' + qty : ''), d: ITEMS[id].d + ` You have ${G.bag[id] || 0}.`, tier, qty, locked: gate && !flag(gate) && why, get() { give(id, qty, true); } });
      const ch = (id, tier, gate, why) => ({ n: CHARMS[id].n, d: CHARMS[id].d + ' (Permanent.)', tier, owned: !!G.gear.charms[id], locked: gate && !flag(gate) && why, get() { G.gear.charms[id] = 1; } });
      return [sc('moon', 2, 1), sc('bolt', 2, 2, 'priya', 'I need someone to help me translate it. Bring a scientist.'), sc('frost', 3, 1, 'bash', 'The ink must be kept cold. Come back when your crew is bigger.'), ch('luck', 2), ch('hint', 3, 'priya', 'The owl only trusts scholars. Bring a scientist.'), ch('retry', 4, 'bash', 'This charm must be forged in friendship. Come back with a bigger crew.'), ch('xp', 5, 'wren', 'The amulet is locked in a case only a very fast hand can open.')]; },
    async extra() { if (G.eggs.length && !flag('lore_flick')) { setFlag('lore_flick'); await say('flick', 'Is that... great galloping footnotes. A Blackwood egg. I catalogued those. In 1887.'); await say('flick', 'Dragons do not breathe fire, young man. They cast it. Every dragon is a spellcaster, and a spell is only a perfect sentence with a number in it.'); await say('flick', 'That is why it will hatch only for a scholar of BOTH. And it will grow as you do. Master enough, and one day it will carry you.'); } },
    dare: it => `${it.n.replace(/ ×.*/, '')}. An excellent choice. Your examination begins now.`, win: ['Full marks! Use it wisely.', 'Splendid. I knew you had it in you.'], lose: ['Not quite. Review, and sit the examination again.', 'A wrong turn is still a turn. Try once more.'] }
};
async function nightShop(id) {
  const S = SHOPS[id];
  if (!flag('shop_' + id)) { setFlag('shop_' + id); for (const l of S.intro) await say(S.who, l); if (!flag('marketLog')) { setFlag('marketLog'); logAdd('Found the Night Market in the Lost Lot. Friendly monsters, and they do not take scrap. You pay by solving math. A ghost says thinking is the one thing the Bell cannot switch off. That explains a LOT.'); } }
  else await say(S.who, pick(S.hello));
  if (S.extra) await S.extra();
  while (true) {
    const stock = S.stock();
    const i = await menu(stock.map(it => ({ label: it.n, right: it.owned ? 'OWNED' : it.locked ? 'LATER' : '★'.repeat(it.tier), disabled: !!(it.owned || it.locked), rcol: '#ffd76a' })).concat([{ label: 'Leave' }]), { x: 20, y: 20, w: 470, title: S.title, onDraw: k => {
      const it = stock[k]; panel(500, 20, 440, 330); if (!it) return;
      setFont(28); text(it.n, 524, 40, '#ffd76a'); setFont(24); let y = 78; wrap(it.d, 396).forEach(l => { text(l, 524, y); y += 27; }); y += 8;
      if (it.owned) text('You already own this.', 524, y, '#a8ffb8');
      else if (it.locked) wrap(it.locked, 396).forEach(l => { text(l, 524, y, '#ffb07a'); y += 27; });
      else { const T = Learn.trialInfo(it.tier); text('PRICE: a math challenge  ' + '★'.repeat(it.tier), 524, y, '#a8ffb8'); y += 30; wrap(`${T.n} questions${T.typed ? ', typed answers, ending with a word problem' : ''}${T.up ? `, Grade ${T.g} level` : ''}. ${T.allow ? 'You may miss one.' : 'No misses allowed.'}`, 396).forEach(l => { text(l, 524, y, '#e8e0f4'); y += 27; }); }
    } });
    if (i < 0 || i >= stock.length) break;
    const it = stock[i];
    await say(S.who, S.dare(it));
    if (await Learn.trial(it.tier, S.short + ' CHALLENGE  ' + '★'.repeat(it.tier))) {
      it.get(); G.gear.wins = (G.gear.wins || 0) + 1; Snd.sfx('badge');
      await say(null, `★ You earned: ${it.n}! ★`, { col: '#ffd76a' }); await say(S.who, pick(S.win)); await checkFeats();
    } else await say(S.who, pick(S.lose));
  }
}
async function munchShop() {
  if (!flag('munchTip')) { setFlag('munchTip'); await say('munch', "Psst. Munch only sells snacks. For the GOOD stuff, go to the Night Market. South of your tower, down the dirt path."); await say('munch', "Swords! Potions! Magic! But Munch's cousins do not take scrap. They take SMARTS."); }
  await say('munch', pick(['MUNCH TRADE! Shiny scrap for crunchy snacks.', 'Munch not eat kids. Kids are mostly elbows.', 'Welcome, tiny customer! Munch has the good stuff.']));
  const stock = ['snack', 'juice', 'wipes'].concat(flag('priya') ? ['soda'] : [], flag('bash') ? ['salts'] : [], flag('wren') ? ['slush'] : []);
  while (true) {
    const i = await menu(stock.map(id => ({ label: ITEMS[id].n, right: ITEMS[id].price + ' scrap', disabled: G.scrap < ITEMS[id].price })).concat([{ label: 'Bye, Munch!' }]),
      { x: 20, y: 20, w: 460, title: `MUNCH'S SNACK SHACK     You have ⚙ ${G.scrap}`, onDraw: s => { if (stock[s]) { panel(490, 20, 450, 120); setFont(26); wrap(ITEMS[stock[s]].d, 410).forEach((l, k) => text(l, 512, 40 + k * 28)); text('You own: ' + (G.bag[stock[s]] || 0), 512, 100, '#b9b1c9'); } } });
    if (i < 0 || i >= stock.length) break;
    G.scrap -= ITEMS[stock[i]].price; give(stock[i], 1); Snd.sfx('ok');
  }
  await say('munch', 'Come back soon! Bring scrap! And brains! ...Munch is joking about the brains.');
}

// ---------------------------------------------------------------- title
const TITLE_MANOR = { x: 0, y: 0, w: 16, h: 9, roof: 'P', door: 8 };
function sceneBg(dim, withDragon) {
  const t = performance.now() / 1000;
  ctx.drawImage(Art.bg('spooky'), 0, 0, W, H);
  if (withDragon) titleDragon(t);
  const mn = Art.building(TITLE_MANOR); ctx.drawImage(mn.c, 30, 130, mn.w * .5, mn.h * .5);
  ctx.save(); ctx.globalAlpha = .13; ctx.fillStyle = '#d0dcff';
  for (let i = 0; i < 4; i++) { ctx.beginPath(); ctx.ellipse(((t * (22 + i * 6)) + i * 330) % (W + 700) - 350, 380 + i * 70, 360, 30, 0, 0, 6.3); ctx.fill(); }
  ctx.restore();
  ['shambler', 'sprinter', 'bloater', 'shambler', 'lunchlady', 'shambler', 'hazmat', 'sprinter'].forEach((n, i) => {
    const x = 330 + i * 86 + Math.sin(t * .5 + i * 2) * 8, y = 420 + (i % 3) * 10 + Math.sin(t * 1.3 + i) * 2, sz = 96 + (i % 3) * 10;
    ctx.drawImage(Art.silh(n), x - sz / 2, y - sz * .945, sz, sz);
    if (Math.sin(t * .9 + i * 1.9) > -.85) for (const s2 of [-.085, .085]) { const ex = x + sz * s2 + sz * .02, ey = y - sz * .59, q = ctx.createRadialGradient(ex, ey, 0, ex, ey, 7); q.addColorStop(0, 'rgba(240,255,120,1)'); q.addColorStop(1, 'rgba(240,255,120,0)'); ctx.fillStyle = q; ctx.fillRect(ex - 7, ey - 7, 14, 14); }
  });
  drawRain(t * 1000, 150, .32, 330); drawStorm(t * 1000, 400, 4000, 9000);
  if (dim) { ctx.fillStyle = `rgba(8,4,22,${dim})`; ctx.fillRect(0, 0, W, H); }
}
// The title-screen dragon: far off in the storm, circling the blood moon. Scaled, shaded and rim-lit by hand.
function titleDragon(t) {
  const bob = Math.sin(t * 1.1) * 10, N = 56, P = [];
  for (let i = 0; i <= N; i++) {
    const u = i / N;
    const x = 912 - u * 610 + Math.sin(u * 3.1) * 10;
    const y = 308 + bob + Math.sin(u * 6.2 - t * 1.7) * 30 * (1 - u * .6) + (u > .7 ? Math.pow((u - .7) / .3, 1.4) * 78 : 0) - (u < .28 ? (.28 - u) * 190 : 0);
    const r = (u < .5 ? 5 + Math.pow(u / .5, .8) * 33 : u < .76 ? 38 - (u - .5) / .26 * 15 : 23 - (u - .76) / .24 * 2) * 1.3;
    P.push([x, y, r]);
  }
  // unit tangent (toward the head) and the normal that points up, per spine point
  const F = P.map((p, i) => { const a = P[Math.max(0, i - 1)], b = P[Math.min(N, i + 1)], dx = b[0] - a[0], dy = b[1] - a[1], l = Math.hypot(dx, dy) || 1; let nx = dy / l, ny = -dx / l; if (ny > 0) { nx = -nx; ny = -ny; } return [dx / l, dy / l, nx, ny]; });
  const BASE = '#74172a', DARK = '#3a0916', LITE = '#a82c3a', RIM = '#ffb09a', BELLY = '#cf9440', BELLYD = '#8a5a1e', BONE = '#e6d0a2', BONED = '#9a8050', OUTL = '#10030b';
  const circ = (x, y, r, c) => { ctx.fillStyle = c; ctx.beginPath(); ctx.arc(x, y, r, 0, 6.3); ctx.fill(); };
  const poly = (pts, fill, stroke, lw) => { ctx.beginPath(); ctx.moveTo(pts[0], pts[1]); for (let i = 2; i < pts.length; i += 2) ctx.lineTo(pts[i], pts[i + 1]); ctx.closePath(); if (fill) { ctx.fillStyle = fill; ctx.fill(); } if (stroke) { ctx.strokeStyle = stroke; ctx.lineWidth = lw || 3; ctx.stroke(); } };
  ctx.save(); ctx.translate(438, 22); ctx.scale(.58, .58); ctx.lineJoin = 'round'; ctx.lineCap = 'round';
  const wing = (sx, sy, sc, ph, near) => {
    const f = Math.sin(t * 2.4 + ph);
    ctx.save(); ctx.translate(sx, sy); ctx.rotate(-.12 + f * .1); ctx.scale(sc, sc * (.8 + f * .26));
    const W0 = [45, -118], tips = [[-64, -246], [96, -262], [214, -176], [262, -52]];
    const edge = () => { ctx.beginPath(); ctx.moveTo(0, 0); ctx.lineTo(W0[0], W0[1]); ctx.lineTo(tips[0][0], tips[0][1]);
      for (let i = 1; i < tips.length; i++) ctx.quadraticCurveTo((tips[i - 1][0] + tips[i][0]) / 2 * .7 + W0[0] * .3, (tips[i - 1][1] + tips[i][1]) / 2 * .7 + W0[1] * .3, tips[i][0], tips[i][1]);
      ctx.quadraticCurveTo(190, 2, 150, 22); ctx.closePath(); };
    edge(); const g = ctx.createLinearGradient(-40, -260, 180, 30); g.addColorStop(0, near ? '#a02a36' : '#521020'); g.addColorStop(.55, near ? '#701826' : '#3a0a18'); g.addColorStop(1, near ? '#3c0a16' : '#22060f'); ctx.fillStyle = g; ctx.fill();
    ctx.save(); edge(); ctx.clip();
    // moonlight glowing through the skin, then veins fanning out from the wrist
    const mg = ctx.createRadialGradient(120, -190, 10, 120, -190, 190); mg.addColorStop(0, near ? 'rgba(255,120,90,.4)' : 'rgba(255,110,90,.22)'); mg.addColorStop(1, 'rgba(255,120,90,0)'); ctx.fillStyle = mg; ctx.fillRect(-120, -300, 420, 360);
    ctx.strokeStyle = 'rgba(20,3,10,.42)'; ctx.lineWidth = 1.6;
    for (let s = 0; s < tips.length - 1; s++) for (let k = 1; k < 5; k++) { const q = k / 5, ex = tips[s][0] + (tips[s + 1][0] - tips[s][0]) * q, ey = tips[s][1] + (tips[s + 1][1] - tips[s][1]) * q, mxx = (W0[0] + ex) / 2 + (k % 2 ? 10 : -8), myy = (W0[1] + ey) / 2 + 6;
      ctx.beginPath(); ctx.moveTo(W0[0], W0[1]); ctx.quadraticCurveTo(mxx, myy, ex * .9 + W0[0] * .1, ey * .9 + W0[1] * .1); ctx.stroke();
      ctx.beginPath(); ctx.moveTo(mxx, myy); ctx.lineTo(mxx + 16, myy + 12); ctx.moveTo(mxx * .7 + ex * .3, myy * .7 + ey * .3); ctx.lineTo(mxx * .7 + ex * .3 - 12, myy * .7 + ey * .3 + 12); ctx.stroke(); }
    for (let k = 1; k < 5; k++) { ctx.beginPath(); ctx.moveTo(0, 0); ctx.quadraticCurveTo(110, -30 - k * 8, 150 + k * 22, 22 - k * 16); ctx.stroke(); }
    ctx.fillStyle = 'rgba(10,2,8,.22)'; for (const [hx, hy, hr] of [[150, -120, 9], [60, -180, 6], [200, -60, 7]]) { ctx.beginPath(); ctx.ellipse(hx, hy, hr, hr * .6, .6, 0, 6.3); ctx.fill(); }
    ctx.restore();
    edge(); ctx.strokeStyle = OUTL; ctx.lineWidth = 4.5; ctx.stroke();
    const bone = (x0, y0, x1, y1, w) => { ctx.strokeStyle = OUTL; ctx.lineWidth = w + 4; ctx.beginPath(); ctx.moveTo(x0, y0); ctx.lineTo(x1, y1); ctx.stroke(); ctx.strokeStyle = near ? '#5c1220' : '#30081a'; ctx.lineWidth = w; ctx.stroke(); ctx.strokeStyle = near ? 'rgba(255,150,130,.35)' : 'rgba(255,150,130,.15)'; ctx.lineWidth = w * .3; ctx.beginPath(); ctx.moveTo(x0 - 1, y0 - 2); ctx.lineTo(x1 - 1, y1 - 2); ctx.stroke(); };
    bone(0, 0, W0[0], W0[1], 9); for (const tp of tips) { bone(W0[0], W0[1], tp[0], tp[1], 5); poly([tp[0] - 4, tp[1] + 2, tp[0] + (tp[0] - W0[0]) * .08, tp[1] + (tp[1] - W0[1]) * .08 - 4, tp[0] + 4, tp[1] + 3], BONE, OUTL, 1.6); }
    circ(W0[0], W0[1], 7, OUTL); circ(W0[0], W0[1], 4.5, '#5c1220'); poly([W0[0] - 7, W0[1] + 2, W0[0] - 4, W0[1] - 30, W0[0] + 6, W0[1] - 4], BONE, OUTL, 2.2);
    ctx.restore();
  };
  const S = P[Math.round(N * .5)];
  wing(S[0] - 120, S[1] - S[2] * .4, 1.1, 1.1, false);
  { const T = P[0], T2 = P[3], a = Math.atan2(T[1] - T2[1], T[0] - T2[0]); ctx.save(); ctx.translate(T[0], T[1]); ctx.rotate(a); poly([-6, -5, 20, -24, 44, 0, 20, 24, -6, 5], LITE, OUTL, 4); poly([0, 0, 40, 0], null, DARK, 3); poly([8, -4, 20, -18], null, 'rgba(20,3,10,.45)', 2); poly([8, 4, 20, 18], null, 'rgba(20,3,10,.45)', 2); ctx.restore(); }
  for (const [x, y, r] of P) circ(x, y, r + 4.5, OUTL);
  for (let i = 4; i < N - 5; i++) {                                                       // a ridge of bony spines
    const [x, y, r] = P[i], [tx, ty, nx, ny] = F[i], h = r * .5 + 7 + (i % 2) * 5, w = 6.5;
    poly([x - tx * w + nx * r * .86, y - ty * w + ny * r * .86, x + nx * (r + h) + 9, y + ny * (r + h), x + tx * w + nx * r * .86, y + ty * w + ny * r * .86], i % 2 ? BONE : BONED, OUTL, 2.4);
  }
  for (const [x, y, r] of P) circ(x, y, r, BASE);
  ctx.globalAlpha = .5; for (let i = 0; i <= N; i++) { const [x, y, r] = P[i], [, , nx, ny] = F[i]; circ(x - nx * r * .2, y - ny * r * .2, r * .86, DARK); } ctx.globalAlpha = 1;      // shadowed underside
  for (let i = 0; i <= N; i++) { const [x, y, r] = P[i], [, , nx, ny] = F[i]; circ(x + nx * r * .3, y + ny * r * .3, r * .72, BASE); circ(x + nx * r * .52, y + ny * r * .52, r * .46, LITE); }   // lit back
  for (let i = 0; i <= N; i++) { const [x, y, r] = P[i], [, , nx, ny] = F[i], u = i / N; if (u > .12 && u < .96) circ(x - nx * r * .5, y - ny * r * .5, r * .5, BELLY); }            // belly
  for (let i = 7; i < N - 2; i += 2) { const [x, y, r] = P[i], [tx, ty, nx, ny] = F[i], bx = x - nx * r * .5, by = y - ny * r * .5, a0 = Math.atan2(ty, tx);                        // belly plates
    ctx.strokeStyle = BELLYD; ctx.lineWidth = 2.6; ctx.beginPath(); ctx.arc(bx, by, r * .5, a0 + .25, a0 + Math.PI - .25); ctx.stroke(); ctx.strokeStyle = 'rgba(255,230,160,.5)'; ctx.lineWidth = 1.4; ctx.beginPath(); ctx.arc(bx + tx * 3, by + ty * 3, r * .44, a0 + .5, a0 + Math.PI - .5); ctx.stroke(); }
  for (let i = 3; i < N - 1; i++) {                                                       // overlapping scales
    const [x, y, r] = P[i], [tx, ty, nx, ny] = F[i], a0 = Math.atan2(ty, tx), rows = r > 26 ? [.78, .5, .2, -.08] : [.7, .32, -.04];
    rows.forEach((k, j) => { const off = (j + i) % 2 ? 6 : 0, cx = x + nx * r * k + tx * off, cy = y + ny * r * k + ty * off, sr = Math.max(4, r * .2);
      ctx.strokeStyle = 'rgba(16,2,8,.5)'; ctx.lineWidth = 1.7; ctx.beginPath(); ctx.arc(cx, cy, sr, a0 - 1.2, a0 + 1.2); ctx.stroke();
      if (k > .4) { ctx.strokeStyle = 'rgba(255,170,150,.3)'; ctx.lineWidth = 1.2; ctx.beginPath(); ctx.arc(cx - tx * 2.4, cy - ty * 2.4, sr * .8, a0 - .9, a0 + .2); ctx.stroke(); } });
  }
  ctx.strokeStyle = RIM; ctx.globalAlpha = .6; ctx.lineWidth = 3; ctx.beginPath();                                                       // moonlit rim along the back
  for (let i = 4; i < N - 1; i++) { const [x, y, r] = P[i], [, , nx, ny] = F[i]; ctx[i === 4 ? 'moveTo' : 'lineTo'](x + nx * (r - 2.5), y + ny * (r - 2.5)); } ctx.stroke(); ctx.globalAlpha = 1;
  for (const u of [.4, .6]) { const i = Math.round(N * u), L = P[i], k = Math.sin(t * 1.6 + u * 9) * 5, kx = L[0] - 18, ky = L[1] + L[2] + 30 + k;                    // legs
    ctx.fillStyle = OUTL; ctx.beginPath(); ctx.ellipse(L[0] - 2, L[1] + L[2] * .5, 21, 26, .35, 0, 6.3); ctx.fill(); ctx.fillStyle = BASE; ctx.beginPath(); ctx.ellipse(L[0] - 2, L[1] + L[2] * .5, 17, 22, .35, 0, 6.3); ctx.fill(); ctx.fillStyle = LITE; ctx.beginPath(); ctx.ellipse(L[0] + 3, L[1] + L[2] * .42, 9, 15, .35, 0, 6.3); ctx.fill();
    for (let s = 0; s < 3; s++) { ctx.strokeStyle = 'rgba(16,2,8,.45)'; ctx.lineWidth = 1.6; ctx.beginPath(); ctx.arc(L[0] - 6 + s * 5, L[1] + L[2] * .5 + s * 9, 8, .3, 2.4); ctx.stroke(); }
    ctx.strokeStyle = OUTL; ctx.lineWidth = 19; ctx.beginPath(); ctx.moveTo(L[0] - 6, L[1] + L[2] * .8); ctx.lineTo(kx, ky); ctx.stroke(); ctx.strokeStyle = BASE; ctx.lineWidth = 13; ctx.stroke();
    for (const c of [-11, 0, 11]) poly([kx - 5 + c, ky - 2, kx - 12 + c * 1.5, ky + 22, kx + 5 + c, ky + 2], BONE, OUTL, 2); }
  wing(S[0] + 16, S[1] - S[2] * .7, 1.3, 0, true);
  // head
  const H = P[N], Hb = P[N - 5], a2 = Math.atan2(H[1] - Hb[1], -(H[0] - Hb[0])), jaw = .3 + Math.sin(t * 1.5) * .1, breathing = Math.sin(t * .55) > .25;
  ctx.save(); ctx.translate(H[0], H[1]); ctx.scale(-1.5, 1.5); ctx.rotate(a2);
  const horn = (pts, c) => { poly(pts, c, OUTL, 3); for (let q = .25; q < .9; q += .2) { const ax = pts[0] + (pts[2] - pts[0]) * q, ay = pts[1] + (pts[3] - pts[1]) * q, bx = pts[4] + (pts[2] - pts[4]) * q, by = pts[5] + (pts[3] - pts[5]) * q; poly([ax, ay, bx, by], null, 'rgba(90,60,20,.55)', 1.4); } };
  horn([-8, 4, -56, -8, -8, -6], BONED); horn([-4, -13, -76, -50, -14, -2], BONE);
  poly([-6, 8, -30, 24, -10, 16], LITE, OUTL, 2.5); poly([0, 12, -18, 34, 2, 20], LITE, OUTL, 2.5);                                       // cheek frills
  ctx.save(); ctx.translate(12, 8); ctx.rotate(jaw); poly([-6, -3, 54, -1, 64, 6, 50, 14, -8, 13], DARK, OUTL, 4); poly([4, 2, 44, 3, 40, 8, 6, 8], '#b84a5a'); for (let x = 8; x < 54; x += 9) poly([x, -1, x + 3.5, -10, x + 7, -1], '#fffbe6', OUTL, 1.4); ctx.restore();
  ctx.fillStyle = OUTL; ctx.beginPath(); ctx.ellipse(8, 0, 30, 21, 0, 0, 6.3); ctx.fill(); ctx.fillStyle = BASE; ctx.beginPath(); ctx.ellipse(8, 0, 26, 17, 0, 0, 6.3); ctx.fill();
  poly([14, -15, 66, -11, 82, -2, 74, 7, 16, 9], BASE, OUTL, 4); ctx.fillStyle = BASE; ctx.fillRect(10, -11, 16, 18);
  poly([16, -14, 64, -10, 76, -4, 20, -6], LITE); ctx.globalAlpha = .55; poly([18, 2, 70, 3, 72, 6, 18, 8], DARK); ctx.globalAlpha = 1;
  for (let x = 30; x < 72; x += 9) poly([x, 7, x + 3.5, 16, x + 7, 7], '#fffbe6', OUTL, 1.4);
  for (const [sx2, sy2] of [[34, -6], [44, -5], [54, -4], [39, 0], [49, 1], [60, 1], [0, -6], [-6, 2], [4, 4], [12, -10]]) { ctx.strokeStyle = 'rgba(16,2,8,.5)'; ctx.lineWidth = 1.2; ctx.beginPath(); ctx.arc(sx2, sy2, 4, -.6, 1.9); ctx.stroke(); }
  circ(72, -4, 2.6, OUTL); poly([4, -16, 26, -25, 34, -12, 10, -10], DARK, OUTL, 3); poly([-2, -15, 6, -27, 10, -14], BONE, OUTL, 2); poly([8, -18, 17, -31, 20, -17], BONE, OUTL, 2);
  const eg = ctx.createRadialGradient(22, -5, 1, 22, -5, 24); eg.addColorStop(0, 'rgba(255,230,110,.9)'); eg.addColorStop(1, 'rgba(255,190,60,0)'); ctx.fillStyle = eg; ctx.fillRect(-4, -30, 52, 50);
  ctx.fillStyle = '#ffd84a'; ctx.beginPath(); ctx.ellipse(22, -5, 7.5, 5, -.25, 0, 6.3); ctx.fill(); ctx.strokeStyle = OUTL; ctx.lineWidth = 2.4; ctx.stroke(); ctx.fillStyle = OUTL; ctx.beginPath(); ctx.ellipse(23, -5, 1.8, 4.6, -.25, 0, 6.3); ctx.fill(); circ(20, -7, 1.3, '#fff');
  ctx.restore();
  // a short gout of fire now and then; a thread of smoke the rest of the time
  const ca = Math.cos(a2), sa = Math.sin(a2), mx = H[0] - (ca * 74 - sa * 6) * 1.5, my = H[1] + (sa * 74 + ca * 6) * 1.5, fx = -ca, fy = sa + .1;
  ctx.globalCompositeOperation = breathing ? 'lighter' : 'source-over';
  for (let i = 0; i < 48; i++) {
    const p = (t * 1.3 + i / 48) % 1, hsh = Math.sin(i * 91.7) * .5, d = p * (breathing ? 250 : 80), sp = hsh * p * (breathing ? 110 : 36);
    ctx.globalAlpha = (1 - p) * (breathing ? .42 : .2);
    circ(mx + fx * d - fy * sp, my + fy * d + fx * sp + (breathing ? 0 : -p * 46), (breathing ? 8 : 5) + p * (breathing ? 30 : 15), breathing ? (p < .22 ? '#fff7c0' : p < .55 ? '#ffb03a' : '#e8483a') : '#8a8498');
  }
  ctx.restore();
  // weather between us and the dragon pushes it back into the distance
  ctx.save(); ctx.fillStyle = 'rgba(58,40,110,.2)'; ctx.fillRect(560, 60, 400, 290);
  ctx.fillStyle = 'rgba(200,205,255,.13)'; for (let i = 0; i < 4; i++) { const cx = W + 260 - ((t * (16 + i * 7) + i * 310) % (W + 520)), cy = 150 + i * 44; for (const [dx, dy, r] of [[0, 0, 44], [50, 10, 34], [-52, 12, 30], [10, -18, 30]]) { ctx.beginPath(); ctx.arc(cx + dx, cy + dy, r, 0, 6.3); ctx.fill(); } }
  ctx.restore();
}
function titleDraw() {
  const t = performance.now() / 1000;
  sceneBg(0, true);
  const put = (im, x, y, s, bob) => { ctx.fillStyle = 'rgba(0,0,0,.3)'; ctx.beginPath(); ctx.ellipse(x, y - 2, s * .28, s * .08, 0, 0, 6.3); ctx.fill(); ctx.drawImage(im, x - s / 2, y - s * .945 + (bob || 0), s, s); };
  put(Art.sprite('nest'), 640, 560, 300);
  put(Art.sprite('shambler'), 880 + Math.sin(t * .8) * 14, 640, 150, Math.sin(t * 2) * 3);
  put(Art.human('wren', 'down', 0), 250, 630, 130); put(Art.human('bash', 'down', 0), 560, 630, 140); put(Art.human('priya', 'down', 0), 340, 650, 130);
  put(Art.human('dex', 'down', 0), 450, 670, 160, Math.sin(t * 2.2) * 2);
  ['scrapup', 'sporkle', 'zaprat'].forEach((s, i) => put(Art.sprite(s), 90 + i * 0 + [0, 80, 690][i], 690 - (i === 2 ? 10 : 0), 110, Math.abs(Math.sin(t * 3 + i * 1.4)) * -12));
  const ty = 60 + Math.sin(t * 1.4) * 5;
  ctx.textAlign = 'center'; ctx.textBaseline = 'top'; ctx.lineJoin = 'round';
  ctx.font = '132px ' + FONT_T;
  ctx.strokeStyle = '#1a0a2e'; ctx.lineWidth = 22; ctx.strokeText('LAST BELL', W / 2, ty + 8);
  ctx.strokeStyle = '#3a0410'; ctx.lineWidth = 12; ctx.strokeText('LAST BELL', W / 2, ty);
  const tg = ctx.createLinearGradient(0, ty, 0, ty + 130); tg.addColorStop(0, '#ff7a5a'); tg.addColorStop(.5, '#d81e30'); tg.addColorStop(1, '#6a0814');
  ctx.fillStyle = tg; ctx.fillText('LAST BELL', W / 2, ty);
  for (let i = 0; i < 11; i += 2) {
    const x = W / 2 - 288 + i * 56 + (i * 37 % 19), len = (18 + (i * 53 % 46)) * (.65 + .35 * Math.sin(t * .6 + i * 1.7));
    rbox(x, ty + 104, 9, len, 4.5, '#b01020'); ctx.beginPath(); ctx.arc(x + 4.5, ty + 104 + len, 6, 0, 6.3); ctx.fill();
    const fall = (t * 120 + i * 97) % 420; if (i % 3 === 0 && fall < 300) { ctx.globalAlpha = 1 - fall / 300; ctx.beginPath(); ctx.ellipse(x + 4.5, ty + 110 + len + fall, 4, 6.5, 0, 0, 6.3); ctx.fill(); ctx.globalAlpha = 1; }
  }
  setFont(20, true); text('A ZOMBIE QUEST FOR BIG BRAINS', W / 2, ty + 142, '#c8ffb8', 'center');
  if (PL.titleWait) { rbox(W / 2 - 170, 676, 340, 38, 19, 'rgba(26,14,58,.8)', '#f2c14e', 2.5); ctx.globalAlpha = .6 + .4 * Math.sin(t * 5); setFont(17, true); text('TAP  OR  PRESS  Z', W / 2, 683, '#ffffff', 'center'); ctx.globalAlpha = 1; }
}

async function titleFlow() {
  Scene = 'title'; Snd.play('toccata');
  PL.titleWait = true;
  await new Promise(res => { const m = { update(dt, pr) { if (pr.includes('a')) { UI.pop(m); res(); } }, tap() { UI.pop(m); res(); }, draw() { } }; UI.stack.push(m); });
  PL.titleWait = false; Snd.sfx('ok');
  while (true) {
    const has = hasSave();
    const i = await menu(has ? ['Continue', 'New Game'] : ['New Game'], { x: 340, y: 300, w: 280, cancel: false });
    if (has && i === 0 && loadGame()) { await fadeOut(300); enterWorld(); await fadeIn(300); await welcomeBack(); return; }
    if (has && (await ask(null, 'Start over? Your saved game will be replaced the next time you save.', ['Yes, new game', 'Never mind'])) !== 0) continue;
    G = newState(); await fadeOut(300); Fx.fade = 0; await Story.intro(); return;
  }
}

// ---------------------------------------------------------------- boot / loop
(function fixEntityTiles() {
  for (const e of ENT) { const mp = MAPS[e.map], t = mp.m.t[e.y][e.x], inf = TINFO[t]; if (e.spr !== 'ferry' && (inf.s || inf.enc)) mp.m.t[e.y][e.x] = e.map === 'world' ? '.' : (mp.base === 'm' ? 'w' : mp.base); }
})();
let lastT = 0;
function frame(ts) {
  const raw = ts - lastT || 16, dt = Math.min(50, raw); lastT = ts;
  if (raw < 250) { PERF.acc += raw; if (++PERF.n >= 90) { if (PERF.acc / PERF.n > 30 && PERF.lvl < 2) PERF.lvl++; PERF.acc = 0; PERF.n = 0; } }
  step(dt); requestAnimationFrame(frame);
}
function step(dt) {
  fitCanvas(); ctx.setTransform(KPX, 0, 0, KPX, 0, 0); ctx.imageSmoothingEnabled = true; ctx.imageSmoothingQuality = 'high';
  Timers.update(dt); updateTweens(dt);
  const pr = Input.presses.splice(0);
  for (const t of Input.taps.splice(0)) {
    const top = UI.stack[UI.stack.length - 1];
    if (top) { if (top.tap) top.tap(t.x, t.y); else pr.push('a'); } else pr.push('a');
  }
  if (pr.includes('mute')) toast(Snd.toggleMute() ? 'Sound off' : 'Sound on');
  if (G && (Scene === 'world' || Scene === 'battle')) dayState().ms += dt;
  if (UI.busy) UI.update(dt, pr); else if (Scene === 'world' && G) worldUpdate(dt, pr);
  if (Scene === 'title') titleDraw();
  else if (Scene === 'black') sceneBg(.62);
  else if (Scene === 'fly') flyDraw();
  else if (Scene === 'battle') Battle.draw();
  else worldDraw();
  UI.draw(); drawFx(dt);
  { const inside = (Scene === 'world' && G && G.map !== 'world') || (Scene === 'battle' && Battle.st && (Battle.st.o.bg === 'indoor' || Battle.st.o.bg === 'manor')); Snd.setRain(inside ? .55 : 1, inside); }
  updateTouch(Scene === 'world' && !UI.busy && Script.n === 0);
}
const boot = () => { script(titleFlow); requestAnimationFrame(frame); };
if (document.fonts && document.fonts.load) Promise.race([Promise.all([document.fonts.load('600 26px Fredoka'), document.fonts.load('30px "Lilita One"')]), new Promise(r => setTimeout(r, 1500))]).then(boot, boot);
else boot();

// ---------------------------------------------------------------- debug helpers (open the console)
const DBG = {
  validate() {
    const out = [];
    const starts = { world: [41, 64], school: [18, 20], mall: [20, 22], hospital: [17, 20], manor: [19, 28] };
    for (const map in MAPS) {
      const m = MAPS[map].m, seen = new Set(), q = [starts[map]]; seen.add(starts[map].join());
      const solidEnt = new Set(ENT.filter(e => e.map === map && e.solid && !e.if).map(e => e.x + ',' + e.y));
      while (q.length) { const [x, y] = q.pop(); for (const d in DV) { const nx = x + DV[d][0], ny = y + DV[d][1], k = nx + ',' + ny; if (seen.has(k) || nx < 0 || ny < 0 || nx >= m.w || ny >= m.h || TINFO[m.t[ny][nx]].s || solidEnt.has(k)) continue; seen.add(k); q.push([nx, ny]); } }
      for (const e of ENT.filter(e => e.map === map && e.solid)) if (!Object.values(DV).some(([dx, dy]) => seen.has((e.x + dx) + ',' + (e.y + dy)))) out.push(`${map} ${e.spr} @${e.x},${e.y} unreachable`);
      for (const k in WARPS) if (k.startsWith(map + ':')) { const [x, y] = k.split(':')[1].split(',').map(Number); if (!Object.values(DV).some(([dx, dy]) => seen.has((x + dx) + ',' + (y + dy)))) out.push('warp unreachable ' + k); }
    }
    return out;
  },
  questions(n) {
    const bad = [];
    for (const id in SKILLS) for (let g = SKILLS[id].g[0]; g <= SKILLS[id].g[1]; g++) for (let i = 0; i < (n || 200); i++) {
      let q; try { q = (SKILLS[id].multi && i % 2 && SKILLS[id].multi(g)) || null; if (!q || q.choices.length < 5) q = SKILLS[id].gen(g); } catch (e) { bad.push(`${id} g${g} threw ${e.message}`); break; }
      const s = JSON.stringify(q);
      if (q.type === 'multi') { if (q.choices.length < 5 || new Set(q.choices).size !== q.choices.length || !q.as.length || q.as.includes(-1) || q.as.length >= q.choices.length || /NaN|undefined/.test(s)) { bad.push(`${id} g${g} multi: ${s}`); break; } continue; }
      if (q.partB && (q.partB.choices.length !== 4 || q.partB.a < 0)) { bad.push(`${id} partB: ${s}`); break; }
      if (q.choices.length !== 4 || new Set(q.choices).size !== 4 || q.a < 0 || /NaN|undefined|Infinity|null,/.test(s) || q.choices.some(c => c === '' || /^-?0\/|\/0$/.test(c))) { bad.push(`${id} g${g}: ${s}`); break; }
    }
    return bad;
  }
};
