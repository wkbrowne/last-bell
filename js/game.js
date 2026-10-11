'use strict';
const SAVE_KEY = 'lastbell_save_v1';
let G = null, Scene = 'title';
const PL = { px: 0, py: 0, moving: false, t: 0, fx: 0, fy: 0, tx: 0, ty: 0, step: 0, grace: 0, zone: null, banner: 0, bannerText: '', pendingOffer: false };
const Script = { n: 0 };
const DV = { up: [0, -1], down: [0, 1], left: [-1, 0], right: [1, 0] };
async function script(fn) { Script.n++; try { await fn(); } catch (e) { console.error(e); } finally { Script.n--; } }

function newState() {
  return { map: 'world', x: 41, y: 64, dir: 'up', party: [], pen: [], bag: { snack: 5, juice: 3 }, scrap: 40, flags: {}, badges: [], dex: {}, seen: {},
    wins: 0, night: 0, saved: [], crew: [], bond: {}, rest: { map: 'world', x: 41, y: 64 }, log: [], obj: '', time: 0, steps: 0,
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
  if (G.night >= 1) await badge('rescue1'); if (G.night >= 10) await badge('rescue10'); if (G.night >= 25) await badge('rescue25');
  await Learn.celebrate();
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
function enterWorld() {
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
const ESIZE = { barricade: 64, nest: 170, tower: 250, krush: 160, bellringer: 170, ferry: 230, fire: 70, stash: 58, comic: 50, sign: 58, note: 52, horn: 62, wreck: 78, log: 70, gate: 60, shutter: 58, munch: 92, coach: 92, mallcop: 92, flatline: 92, bloater: 92 };
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
  for (const e of entsOn(G.map)) { list.push({ y: (e.y + 1) * 48 - 1, e }); if (e.spr === 'fire') lights.push([e.x * 48 + 24, e.y * 48 + 20, 230, 1]); if (e.spr === 'nest') lights.push([e.x * 48 + 24, e.y * 48 - 40, 150, 1]); }
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
async function optionsMenu() {
  while (true) {
    const i = await menu([`Grade level: ${G.learn.grade}`, `Sound: ${Snd.muted ? 'OFF' : 'ON'}`, 'Report Card (for grown-ups)', 'Back'], { x: 300, y: 200, w: 420, title: 'OPTIONS' });
    if (i === 0) { const g = await menu(['Grade 2', 'Grade 3', 'Grade 4', 'Grade 5', 'Grade 6'], { x: 330, y: 230, w: 300, sel: G.learn.grade - 2, title: 'Question level' }); if (g >= 0) G.learn.grade = 2 + g; }
    else if (i === 1) Snd.toggleMute();
    else if (i === 2) await Learn.report();
    else return;
  }
}
async function pauseMenu() {
  while (true) {
    const i = await menu(['Team', 'Bag', 'Study Hall', "Dex's Log", 'Badges', 'Crew', 'Save', 'Options', 'Close'], { x: W - 280, y: 20, w: 260, title: 'MENU' });
    if (i === 0) await partyMenu(); else if (i === 1) await bagMenu(); else if (i === 2) await Learn.studyHall(); else if (i === 3) await journal();
    else if (i === 4) await badgesPage(); else if (i === 5) await crewPage(); else if (i === 6) saveGame(); else if (i === 7) await optionsMenu(); else return;
  }
}
async function restMenu(nest) {
  while (true) {
    const talk = TALKS.find(t => G.crew.includes(t.who) && t.ok() && !flag('talk_' + t.id)), [pm, pn] = Learn.progress();
    const opts = [['Rest & Save', async () => {
      await fadeOut(350); healAll(); G.rest = { map: G.map, x: G.x, y: G.y }; Snd.sfx('heal'); saveGame(); await fadeIn(350);
      await say(null, 'Everyone is rested and healed. Game saved.');
    }]];
    if (flag('priya')) opts.push([`Answer a signal  (Night ${G.night + 1})`, () => Story.signal()]);
    opts.push([`Study Hall  ★ ${pm}/${pn}`, () => Learn.studyHall()]);
    opts.push(['Practice Test  (10 questions)', () => Learn.testDay()]);
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
    await opts[i][1]();
    if (Scene !== 'world') return;
  }
}
async function munchShop() {
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
function sceneBg(dim) {
  const t = performance.now() / 1000;
  ctx.drawImage(Art.bg('spooky'), 0, 0, W, H);
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
function titleDraw() {
  const t = performance.now() / 1000;
  sceneBg(0);
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
  if (PL.titleWait) { ctx.globalAlpha = .6 + .4 * Math.sin(t * 5); setFont(20, true); text('TAP  OR  PRESS  Z', W / 2, ty + 186, '#ffffff', 'center'); ctx.globalAlpha = 1; }
}

async function titleFlow() {
  Scene = 'title'; Snd.play('toccata');
  PL.titleWait = true;
  await new Promise(res => { const m = { update(dt, pr) { if (pr.includes('a')) { UI.pop(m); res(); } }, tap() { UI.pop(m); res(); }, draw() { } }; UI.stack.push(m); });
  PL.titleWait = false; Snd.sfx('ok');
  while (true) {
    const has = hasSave();
    const i = await menu(has ? ['Continue', 'New Game'] : ['New Game'], { x: 340, y: 300, w: 280, cancel: false });
    if (has && i === 0 && loadGame()) { await fadeOut(300); enterWorld(); await fadeIn(300); return; }
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
  if (UI.busy) UI.update(dt, pr); else if (Scene === 'world' && G) worldUpdate(dt, pr);
  if (Scene === 'title') titleDraw();
  else if (Scene === 'black') sceneBg(.62);
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
