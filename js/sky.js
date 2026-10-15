'use strict';
// SKYREACH: Act 2, after the ferry. The storm over Wexler Falls comes from islands above the clouds. Dragon riders fly
// there, earn three gifts at three shrines (GLIDE, ROAR, GLOW), use them to open places back home that were shut all
// along, and finally break the Thunderhead in the Storm Eye, which lifts the storm over the town.
// Loaded after story.js and before game.js: the maps and characters must exist before game.js prepares them.
// The parts that need game.js (the guide, the shops, the menus) are wired in Sky.init(), once every script has loaded.

// ---------------------------------------------------------------- tiles: cloud you can walk on, open sky you cannot
TINFO.V = { s: 1 };            // open sky
TINFO.n = {};                  // cloud
TINFO.N = { enc: 1 };          // storm cloud: critters hide in it
GT.cloud = { c: '#f6f3ff', e: '#c4b8ee', ew: 5, round: 1 };
GT.stormcloud = { c: '#d8d0f0', e: '#b2a6e0', ew: 5, round: 1 };
GT.sky = { c: '#8d7ed2' };
BGS.sky = ['#8fc8ff', '#f4ecff', '#eae6fa', '#c9c0ea'];
{ const base = groundBase; groundBase = function (type, v, f, deco) {   // extra detail on the new ground types
    base(type, v, f, deco);
    if (type === 'cloud' || type === 'stormcloud') { const r = mulberry32(v * 31 + 9); g.save(); g.globalAlpha = type === 'cloud' ? .7 : .55; for (let i = 0; i < 3; i++) { g.beginPath(); g.arc(8 + r() * 32, 8 + r() * 32, 5 + r() * 6, 0, 6.3); g.fillStyle = type === 'cloud' ? '#ffffff' : '#bfb4e2'; g.fill(); } if (type === 'stormcloud') { g.globalAlpha = .8; ln([14 + v * 4, 18, 20 + v * 4, 26, 16 + v * 4, 28, 22 + v * 4, 36], '#ffe36a', 2); } g.restore(); }
    else if (type === 'sky') { const r = mulberry32(v * 17 + 3); g.save(); g.globalAlpha = .35; for (let i = 0; i < 2; i++) { g.beginPath(); g.ellipse(6 + r() * 36, 8 + r() * 32, 9 + r() * 8, 2.5, 0, 0, 6.3); g.fillStyle = '#d8d0ff'; g.fill(); } g.restore(); }
  }; }

// ---------------------------------------------------------------- pictures
// the battle backdrop above the clouds: bright sky, a pale sun, and a floor of cloud (the stock backdrops have no sky one)
{ const base = Art.bg; Art.bg = function (type) {
    if (type !== 'sky') return base.call(this, type);
    if (this.cache['bg:sky']) return this.cache['bg:sky'];
    const c = document.createElement('canvas'); c.width = 1440; c.height = 1080; const x = c.getContext('2d'); x.scale(1.5, 1.5);
    let q = x.createLinearGradient(0, 0, 0, 720); q.addColorStop(0, '#5a8ee8'); q.addColorStop(.45, '#b8a8f0'); q.addColorStop(1, '#f2d8ec'); x.fillStyle = q; x.fillRect(0, 0, 960, 720);
    q = x.createRadialGradient(760, 120, 10, 760, 120, 220); q.addColorStop(0, 'rgba(255,248,210,.95)'); q.addColorStop(1, 'rgba(255,248,210,0)'); x.fillStyle = q; x.fillRect(500, -120, 520, 480);
    const puff = (cx, cy, s, col) => { x.fillStyle = col; for (const [dx, dy, r] of [[0, 0, 1], [1.1, .2, .8], [-1.1, .25, .75], [.5, -.45, .7], [-.5, -.4, .65]]) { x.beginPath(); x.arc(cx + dx * s, cy + dy * s, r * s, 0, 6.3); x.fill(); } };
    for (let i = 0; i < 7; i++) puff(80 + i * 140, 150 + (i % 3) * 50, 34 + (i % 2) * 14, 'rgba(255,255,255,.55)');
    x.fillStyle = '#e6e0fa'; x.fillRect(0, 380, 960, 340); for (let i = 0; i < 14; i++) puff(i * 75, 385, 46, '#f4f1ff'); for (let i = 0; i < 9; i++) puff(40 + i * 115, 560 + (i % 2) * 40, 40, 'rgba(200,190,236,.6)');
    return this.cache['bg:sky'] = c;
  }; }
DRCOL.gale = ['#b8c8f0', '#5a6aa8', '#fff6c8', '#e8f0ff'];
Object.assign(OB, {
  gale() { dragon('gale', 3); },
  perch() { el(50, 92, 30, 7, '#5a4e86'); rr(30, 52, 40, 40, 6, '#9d93c8'); rr(26, 46, 48, 10, 4, '#c4bbe8'); ln([50, 46, 50, 8], '#7a5230', 4); pol([50, 8, 84, 16, 50, 26], '#ffcb3d'); el(40, 70, 4, 6, '#7a6eb0'); el(60, 70, 4, 6, '#7a6eb0'); },
  rubble() { for (const [x, y, r, c] of [[30, 80, 18, '#8a8e9a'], [62, 82, 20, '#9da2ae'], [46, 62, 17, '#7d818e'], [74, 64, 12, '#8a8e9a'], [26, 60, 11, '#9da2ae'], [52, 44, 10, '#8a8e9a']]) { g.beginPath(); g.moveTo(x - r, y + r * .6); g.lineTo(x - r * .7, y - r * .5); g.lineTo(x + r * .2, y - r); g.lineTo(x + r, y - r * .2); g.lineTo(x + r * .8, y + r * .6); g.closePath(); g.fillStyle = c; g.fill(); g.stroke(); } el(78, 22, 12, 12, '#2f2550', 0, true); pol([70, 24, 78, 14, 86, 24, 78, 20], '#c8b0ff'); },
  shadow() { glow(50, 54, 52, '#1a0e34', .95); glow(50, 54, 34, '#08040f', .9); dot(38, 50, 3, '#7fe0d8', .8); dot(62, 46, 2.4, '#7fe0d8', .7); el(78, 22, 12, 12, '#2f2550', 0, true); pol([70, 24, 78, 14, 86, 24, 78, 20], '#c8b0ff'); },
  glidepad() { el(50, 86, 34, 10, '#c4bbe8', 0, true); el(50, 84, 24, 6, '#f6f3ff'); g.save(); g.translate(50, 54); g.rotate(-.5); el(0, 0, 9, 30, '#f6f3ff', 0, true); ln([0, -28, 0, 30], '#c4bbe8', 2); for (let i = -20; i < 24; i += 7) { ln([0, i, -7, i - 5], '#c4bbe8', 1.6); ln([0, i, 7, i - 5], '#c4bbe8', 1.6); } g.restore(); },
  skychest() { glow(50, 56, 44, '#fff59a', .5); rr(18, 50, 64, 40, 6, '#8c7ad8'); g.beginPath(); g.moveTo(18, 54); g.quadraticCurveTo(50, 26, 82, 54); g.closePath(); g.fillStyle = '#a99af0'; g.fill(); g.stroke(); rr(44, 60, 12, 14, 3, '#ffd76a'); },
  statue_wind() { rr(28, 70, 44, 24, 4, '#9d93c8'); el(50, 46, 20, 26, '#d8d0f0', 0, true); for (const a of [-1, 1]) { g.beginPath(); g.moveTo(50 + a * 14, 40); g.quadraticCurveTo(50 + a * 44, 20, 50 + a * 40, 60); g.quadraticCurveTo(50 + a * 26, 50, 50 + a * 14, 56); g.closePath(); g.fillStyle = '#f6f3ff'; g.fill(); g.stroke(); } dot(43, 42, 3, '#5a6aa8'); dot(57, 42, 3, '#5a6aa8'); glow(50, 30, 30, '#bfe8ff', .4); },
  statue_thunder() { rr(28, 70, 44, 24, 4, '#7d818e'); rr(36, 30, 28, 42, 6, '#5a5f70'); pol([54, 6, 36, 40, 50, 40, 44, 66, 66, 30, 52, 30, 60, 6], '#ffe36a'); glow(50, 30, 34, '#ffe36a', .45); },
  statue_book() { rr(28, 70, 44, 24, 4, '#9d93c8'); g.save(); g.translate(50, 46); g.rotate(-.08); rr(-30, -18, 30, 36, 3, '#f6f3ff', true); rr(0, -18, 30, 36, 3, '#f6f3ff', true); for (let y = -10; y < 14; y += 6) { ln([-24, y, -6, y], '#b2a6e0', 1.6); ln([6, y, 24, y], '#b2a6e0', 1.6); } g.restore(); glow(50, 40, 40, '#fff59a', .35); }
});
CR.thunderhead = function () {
  glow(50, 50, 56, '#6a4ac8', .45);
  for (const [x, y, r] of [[26, 52, 22], [50, 40, 28], [74, 52, 22], [38, 64, 20], [62, 64, 20]]) { g.beginPath(); g.arc(x, y, r, 0, 6.3); g.fillStyle = '#4a3e78'; g.fill(); g.stroke(); }
  for (const [x, y, r] of [[34, 44, 10], [56, 34, 12], [70, 46, 9]]) { g.save(); g.globalAlpha = .45; g.beginPath(); g.arc(x, y, r, 0, 6.3); g.fillStyle = '#8f80c8'; g.fill(); g.restore(); }
  el(40, 52, 7, 9, '#fff6a0'); el(60, 52, 7, 9, '#fff6a0'); dot(41, 54, 3.2, '#1a0e34'); dot(61, 54, 3.2, '#1a0e34'); ln([32, 42, 46, 47], '#1a0e34', 4); ln([68, 42, 54, 47], '#1a0e34', 4);
  pol([40, 66, 46, 72, 50, 66, 54, 72, 60, 66, 56, 76, 44, 76], '#1a0e34');
  for (const x of [30, 52, 72]) pol([x, 78, x - 6, 90, x + 1, 90, x - 5, 104, x + 9, 86, x + 2, 86, x + 7, 78], '#ffe36a');
};
SPECIES.thunderhead = { n: 'The Thunderhead', t: 'SPARK', b: [130, 102, 96, 78], rate: 0, xp: 340, scale: 1.5, desc: 'The storm that never ended had a face all along.', ls: [[1, 'staticzap'], [1, 'arcflash'], [1, 'thunderclap'], [1, 'overload']] };
SPEAKERS.gale = { n: 'Grandmother Gale', spr: 'gale', human: false, col: '#c8d8ff' };
BADGES.skyrider = ['Sky Rider', 'Flew above the storm to Skyreach.'];
BADGES.gifted = ['Three Gifts', 'Earned Glide, Roar and Glow at the sky shrines.'];
BADGES.stormbreaker = ['Stormbreaker', 'Broke the Thunderhead and lifted the storm.'];
CHARMS.thunder = { n: 'Thunder Charm', d: 'Made from Thunder Glass. Brain Blasts hit even harder.' };
ITEMS.skytonic = { n: 'Sky Tonic', price: 0, heal: 999, d: 'Brewed with Cloudsilk. Heals one critter completely.' };
Object.assign(ENC, {
  sky1: [['boltbug', 33, 36, 3], ['wispkin', 33, 36, 3], ['zaprat', 34, 37, 2], ['dustmoth', 33, 36, 2]],
  sky2: [['zaprat', 36, 39, 4], ['boltbug', 36, 39, 3], ['rubblet', 36, 39, 2]],
  sky3: [['wispkin', 37, 40, 3], ['gloomwing', 38, 41, 2], ['dustmoth', 37, 40, 3]],
  sky4: [['gloomwing', 40, 43, 3], ['zaprat', 40, 43, 3], ['wispkin', 40, 43, 2]]
});
// three short weather passages for the Cloud Library; they also join ordinary reading practice
PASSAGES.push(
  { g: [2, 6], k: 'info', title: 'How Clouds Form', text: 'The sun warms the water in lakes and oceans. Some of the water turns into a gas called water vapor and rises into the sky. High up, the air is cold. The cold air turns the vapor back into tiny drops of water. Millions of these drops float together. That is a cloud. When the drops bump together and grow too heavy, they fall as rain.', qs: [
    ['What turns lake water into water vapor?', 'the sun warming it', ['the cold air', 'the wind', 'the falling rain'], 'The first two sentences say the sun warms the water and some of it turns into vapor.', ['The sun warms the water in lakes and oceans.', ['High up, the air is cold.', 'That is a cloud.', 'Millions of these drops float together.']]],
    ['What happens when the drops in a cloud grow too heavy?', 'They fall as rain.', ['They turn into gas.', 'They float higher.', 'They warm the sun.'], 'The last sentence says heavy drops fall as rain.'],
    ['What is this passage MOSTLY about?', 'how clouds and rain form', ['why the sun is hot', 'how to swim in a lake', 'why the sky is blue'], 'Every sentence is a step in how a cloud forms and turns into rain.']] },
  { g: [2, 6], k: 'info', title: 'Where Wind Comes From', text: 'Wind is moving air. The sun warms some places more than others. Warm air is light, so it rises. Cooler air rushes in to take its place. That rushing air is wind. Near the ocean, the land warms up faster than the water during the day, so a cool breeze blows in from the sea.', qs: [
    ['What is wind?', 'moving air', ['warm water', 'a kind of cloud', 'falling rain'], 'The first sentence says it: wind is moving air.'],
    ['Why does warm air rise?', 'It is light.', ['It is heavy.', 'It is wet.', 'It is cold.'], 'The passage says warm air is light, so it rises.', ['Warm air is light, so it rises.', ['Wind is moving air.', 'That rushing air is wind.', 'The sun warms some places more than others.']]],
    ['During the day, which way does the breeze blow near the ocean?', 'in from the sea', ['out to sea', 'straight up', 'It does not blow.'], 'The land warms faster, so the cooler sea air blows in toward it.']] },
  { g: [2, 6], k: 'info', title: 'Safe in a Storm', text: 'Lightning can be dangerous, so it is smart to know what to do. If you can hear thunder, lightning is close enough to strike. Go inside a building or a hard-topped car. Stay away from tall trees, water, and open fields. Wait thirty minutes after the last thunder before you go back outside. Remember: when thunder roars, go indoors!', qs: [
    ['If you hear thunder, what should you do?', 'Go inside a building or a hard-topped car.', ['Stand under a tall tree.', 'Go for a swim.', 'Run into an open field.'], 'The passage says to go inside a building or a hard-topped car.', ['Go inside a building or a hard-topped car.', ['Lightning can be dangerous, so it is smart to know what to do.', 'Stay away from tall trees, water, and open fields.', 'Remember: when thunder roars, go indoors!']]],
    ['How long should you wait after the last thunder?', 'thirty minutes', ['five minutes', 'one hour', 'until it rains'], 'Wait thirty minutes after the last thunder.'],
    ['Why did the author write this passage?', 'to teach how to stay safe in a storm', ['to tell a funny story', 'to sell umbrellas', 'to describe a rainbow'], 'It gives steps to follow, so it is written to teach.']] }
);

// ---------------------------------------------------------------- the islands
function skyIsland(m, cx, cy, rx, ry, ch) { for (let y = cy - ry; y <= cy + ry; y++) for (let x = cx - rx; x <= cx + rx; x++) if (((x - cx) / rx) ** 2 + ((y - cy) / ry) ** 2 <= 1) m.set(x, y, ch || 'n'); }
function buildSkyMap(kind) {
  const m = new MapB(30, 22, 'V');
  skyIsland(m, 15, 11, 12, 8);
  if (kind === 'roost') { skyIsland(m, 5, 5, 4, 3); m.rect(5, 6, 6, 2, 'n'); skyIsland(m, 25, 16, 4, 3); }
  if (kind === 'gust') { skyIsland(m, 22, 8, 4, 3, 'N'); skyIsland(m, 8, 14, 4, 2, 'N'); }
  if (kind === 'forge') { skyIsland(m, 9, 7, 4, 3, 'N'); skyIsland(m, 22, 15, 4, 2, 'N'); m.rect(13, 3, 4, 2, 'n'); }
  if (kind === 'library') { skyIsland(m, 8, 9, 3, 3, 'N'); skyIsland(m, 22, 9, 3, 3, 'N'); skyIsland(m, 15, 16, 4, 2, 'N'); }
  if (kind === 'eye') { skyIsland(m, 15, 11, 8, 5, 'N'); skyIsland(m, 15, 8, 4, 3, 'n'); m.rect(14, 12, 3, 8, 'n'); }
  return m;
}
const SKYMAP = { roost: ['Roost Rock', 'nest', 'sky1', 0.08], gust: ['Gust Shrine', 'streets', 'sky1', 0.12], forge: ['Thunder Forge', 'battle', 'sky2', 0.2], library: ['Cloud Library', 'nest', 'sky3', 0.12], eye: ['The Storm Eye', 'manor', 'sky4', 0.5] };
for (const k in SKYMAP) { const [n, music, enc, dark] = SKYMAP[k]; MAPS[k] = { m: buildSkyMap(k), base: 'V', zones: [Z(k, n, [0, 0, 99, 99], music, enc, 'sky', dark)] }; }

// where each island's landing spot is, and where you stand when you arrive
const SKYSPOT = { roost: [15, 17], gust: [15, 18], forge: [15, 18], library: [15, 18], eye: [15, 18] };
for (const k in SKYSPOT) { const [x, y] = SKYSPOT[k]; E({ map: k, x, y, spr: 'perch', act: () => Sky.perch(k) }); }
// Roost Rock: Grandmother Gale, a campfire, a sign, a stash
E({ map: 'roost', x: 19, y: 8, spr: 'gale', big: 2, act: () => Sky.galeTalk() });
E({ map: 'roost', x: 10, y: 12, spr: 'fire', act: () => restMenu(false) });
sign('roost', 13, 15, 'ROOST ROCK. "Riders rest here. Mind the edge. It is a long way down." (Someone has drawn a very small, very worried stick figure.)');
stash('roost', 23, 14, 'roost1', { potion: 2, soda: 2 }, 80);
// the three shrines and their gifts
E({ map: 'gust', x: 15, y: 5, spr: 'statue_wind', act: () => Sky.shrine('glide') });
E({ map: 'forge', x: 15, y: 5, spr: 'statue_thunder', act: () => Sky.shrine('roar') });
E({ map: 'library', x: 15, y: 5, spr: 'statue_book', act: () => Sky.shrine('glow') });
E({ map: 'gust', x: 24, y: 13, spr: 'skychest', if: () => !flag('sky_silk'), act: () => Sky.chest('silk') });
E({ map: 'forge', x: 6, y: 13, spr: 'skychest', if: () => !flag('sky_glass'), act: () => Sky.chest('glass') });
stash('library', 24, 14, 'library1', { stone: 1, potion: 2 }, 120);
// the Storm Eye
E({ map: 'eye', x: 15, y: 7, spr: 'thunderhead', big: 2, if: () => !flag('stormEnd'), act: () => Sky.thunderhead() });

// ---------------------------------------------------------------- back home: the gifts open places that were always there
const SKYW = MAPS.world.m;
// a walkable tile near (x, y) with room around it: for placing things on the big map without hand-picking every tile
function skyFree(x0, y0) {
  for (let r = 0; r < 12; r++) for (let dy = -r; dy <= r; dy++) for (let dx = -r; dx <= r; dx++) { if (Math.max(Math.abs(dx), Math.abs(dy)) !== r) continue; const x = x0 + dx, y = y0 + dy, c = SKYW.get(x, y);
    if (!'.:=-'.includes(c) || ENT.some(e => e.map === 'world' && e.x === x && e.y === y)) continue;
    if (['.', ':', '=', '-'].includes(SKYW.get(x, y + 1)) && !ENT.some(e => e.map === 'world' && e.x === x && e.y === y + 1)) return [x, y]; }
  return [x0, y0];
}
// A nook cut into the trees beside a path: (barrier) then floor, then the prize at the end. Returns the tiles used.
function skyNook(x0, y0, depth) {
  const solidT = c => c === 'T' || c === 't';
  for (let r = 0; r < 18; r++) for (let dy = -r; dy <= r; dy++) for (let dx = -r; dx <= r; dx++) { if (Math.max(Math.abs(dx), Math.abs(dy)) !== r) continue; const x = x0 + dx, y = y0 + dy;
    if (!'.:=-'.includes(SKYW.get(x, y))) continue;
    for (const [ddx, ddy] of [[0, -1], [1, 0], [-1, 0], [0, 1]]) { let ok = true;
      for (let k = 1; k <= depth + 1 && ok; k++) { const tx = x + ddx * k, ty = y + ddy * k; if (!solidT(SKYW.get(tx, ty)) || !solidT(SKYW.get(tx + ddy, ty + ddx)) || !solidT(SKYW.get(tx - ddy, ty - ddx))) ok = false; }
      if (!ok || ENT.some(e => e.map === 'world' && Math.abs(e.x - x) + Math.abs(e.y - y) <= depth + 2)) continue;
      const tiles = []; for (let k = 1; k <= depth; k++) { SKYW.set(x + ddx * k, y + ddy * k, ':'); tiles.push([x + ddx * k, y + ddy * k]); }
      return tiles; } }
  return null;
}
const SKYPLACE = {};
{ // Gale waits on Radio Hill once the ferry has come
  const [gx, gy] = skyFree(100, 12); SKYPLACE.gale = [gx, gy];
  E({ map: 'world', x: gx, y: gy, spr: 'gale', big: 2, if: () => flag('cleared'), act: () => Sky.galeWorld() });
  // Gull Island, out in the harbour: reached with GLIDE
  SKYW.rect(33, 89, 8, 5, '.'); SKYW.set(33, 89, '~'); SKYW.set(40, 93, '~'); SKYW.set(36, 91, ','); SKYW.set(37, 92, ','); SKYW.set(38, 91, ',');
  MAPS.world.zones.unshift(Z('gull', 'Gull Island', [32, 88, 10, 7], 'nest', 'park', 'grass', 0.15));
  SKYPLACE.padA = [26, 87]; SKYPLACE.padB = [34, 91];
  E({ map: 'world', x: 26, y: 87, spr: 'glidepad', act: () => Sky.glidePad('out') });
  E({ map: 'world', x: 34, y: 91, spr: 'glidepad', act: () => Sky.glidePad('back') });
  stash('world', 39, 90, 'gull', { potion: 2, slush: 2 }, 150);
  E({ map: 'world', x: 37, y: 93, spr: 'gloomwing', if: () => !flag('gullFriend'), act: () => Sky.friend('gullFriend', 'gloomwing', 'A shy Gloomwing has a nest of driftwood here. It has been watching you the whole time.') });
  // three rubble piles (ROAR) hiding stashes, and one dark grove (GLOW) hiding a friend
  const rubbles = [[100, 60, 'rb1', { potion: 2, soda: 3 }, 120], [74, 37, 'rb2', { slush: 2, stone: 1 }, 100], [52, 88, 'rb3', { potion: 3 }, 160]];
  SKYPLACE.rubble = [];
  for (const [x, y, id, items, scrap] of rubbles) { const t = skyNook(x, y, 3); if (!t) continue; SKYPLACE.rubble.push(t[0]);
    E({ map: 'world', x: t[0][0], y: t[0][1], spr: 'rubble', if: () => !flag(id), act: () => Sky.rubble(id) }); stash('world', t[2][0], t[2][1], id + 's', items, scrap); }
  const grove = skyNook(30, 30, 4); SKYPLACE.grove = grove && grove[0];
  if (grove) { E({ map: 'world', x: grove[0][0], y: grove[0][1], spr: 'shadow', if: () => !flag('grove'), act: () => Sky.grove() });
    E({ map: 'world', x: grove[3][0], y: grove[3][1], spr: 'wispkin', if: () => !flag('groveFriend'), act: () => Sky.friend('groveFriend', 'wispkin', 'In the middle of the grove, a little flame is hiding from the dark. It has been waiting for someone to bring a light.') }); }
}

// ---------------------------------------------------------------- the flight: steer through Sky Rings to answer
const Flight = {
  Y: [215, 375, 535],
  // a quick question that fits on a ring: short answers, no picture, no passage
  question(n) {
    const g = G.learn.grade, live = Learn.forGrade(g).map(s => s.id), math = ['addsub', 'unknown', 'place', 'groups', 'compare', 'round', 'mult', 'div', 'factors'], ela = ['spelling', 'homophone', 'synant', 'plural', 'past'];
    const ids = (n % 2 ? ela : math).filter(id => live.includes(id)), pool = ids.length ? ids : math.concat(ela).filter(id => live.includes(id));
    for (let i = 0; i < 40 && pool.length; i++) {
      const id = pool[i % pool.length === 0 ? Math.floor(Math.random() * pool.length) : Math.floor(Math.random() * pool.length)], q = Learn.make(id);
      if (q.type === 'multi' || q.passage || q.pic || q.partB || q.say) continue;
      const right = String(q.choices[q.a]); if (right.length > 12) continue;
      const wrong = shuffle(q.choices.filter((c, j) => j !== q.a && String(c).length <= 12).map(String)).slice(0, 2); if (wrong.length < 2) continue;
      const line = q.q.split('\n').filter(l => l.trim()).pop(); if (line.length > 64) continue;
      const opts = shuffle([right].concat(wrong)); return { q, text: line, opts, a: opts.indexOf(right) };
    }
    return null;
  },
  // o: { rider (sprite name), dest (name shown), n (questions) }. Resolves to { sparks, right, asked } when the trip ends.
  run(o) {
    return new Promise(res => {
      const qs = []; for (let i = 0; i < (o.n || 3); i++) { const q = this.question(i); if (q) qs.push(q); }
      const DX = 230, speed = .3, T = 9000 + qs.length * 7600, st = { t: 0, y: 375, ty: 375, sparks: 0, right: 0, asked: 0, objs: [], set: null, next: 2600, qi: 0, msg: '', msgT: 0, hurt: 0, spark: 700, cloud: 1600, wing: 0 };
      const toY = e => { const r = cv.getBoundingClientRect(); return clamp((e.clientY - r.top) * H / r.height, 130, 640); };
      let down = false; const pd = e => { down = true; st.ty = toY(e); }, pm = e => { if (down) st.ty = toY(e); }, pu = () => { down = false; };
      cv.addEventListener('pointerdown', pd); cv.addEventListener('pointermove', pm); addEventListener('pointerup', pu); addEventListener('pointercancel', pu);
      const end = () => { cv.removeEventListener('pointerdown', pd); cv.removeEventListener('pointermove', pm); removeEventListener('pointerup', pu); removeEventListener('pointercancel', pu); Speak.stop(); UI.pop(m); res({ sparks: st.sparks, right: st.right, asked: st.asked }); };
      const m = {
        get answer() { return st.set ? st.set.a : -1; },   // which ring is right: used by the automated checks only
        ringAt(i) { return Flight.Y[i]; },
        get hits() { const s = st.set; return s && s.x < W ? s.opts.map((t, i) => ({ x: s.x - 70, y: this.ringY(i) - 70, w: 140, h: 140, i })) : []; },
        ringY(i) { return Flight.Y[i]; },
        tap(x, y) { st.ty = clamp(y, 130, 640); },
        update(dt) {
          st.t += dt; st.wing += dt; if (st.msgT > 0) st.msgT -= dt; if (st.hurt > 0) st.hurt -= dt;
          if (Input.held.up) st.ty = Math.max(130, st.ty - dt * .55); if (Input.held.down) st.ty = Math.min(640, st.ty + dt * .55);
          st.y += (st.ty - st.y) * Math.min(1, dt / 140);
          // sparks to collect and storm clouds to dodge, never while a set of rings is crossing
          if ((st.spark -= dt) <= 0) { st.spark = 650 + Math.random() * 500; st.objs.push({ k: 'spark', x: W + 40, y: 150 + Math.random() * 470 }); }
          if ((st.cloud -= dt) <= 0) { st.cloud = 1700 + Math.random() * 1400; if (!st.set) st.objs.push({ k: 'cloud', x: W + 90, y: 160 + Math.random() * 440 }); }
          for (const ob of st.objs) { ob.x -= dt * speed * (ob.k === 'cloud' ? 1.15 : 1); if (ob.gone || Math.abs(ob.x - DX) > 60 || Math.abs(ob.y - st.y) > (ob.k === 'cloud' ? 62 : 48)) continue;
            ob.gone = true; if (ob.k === 'spark') { st.sparks++; Snd.sfx('blip'); } else if (st.hurt <= 0) { st.sparks = Math.max(0, st.sparks - 2); st.hurt = 900; Snd.sfx('hit'); } }
          st.objs = st.objs.filter(ob => !ob.gone && ob.x > -120);
          // the rings: the question shows first, then three rings fly in; whichever height Dex is at when they pass is his answer
          if (!st.set && st.qi < qs.length && st.t >= st.next) { const q = qs[st.qi++]; st.set = Object.assign({ x: W + 130 + speed * 1900 }, q); st.objs = st.objs.filter(ob => ob.k !== 'cloud'); if (G.readAloud && Speak.can()) Speak.say(q.text + ' ... ' + q.opts.join(', or ')); }
          if (st.set) { const s = st.set; s.x -= dt * speed;
            if (s.x <= DX) { const pick = st.y < 295 ? 0 : st.y < 455 ? 1 : 2, ok = pick === s.a; st.asked++; if (ok) { st.right++; st.sparks += 3; Snd.sfx('right'); st.msg = pick3(['RIGHT! +3 sparks', 'NAILED IT! +3 sparks', 'BIG BRAIN! +3 sparks']); } else { Snd.sfx('wrong'); st.msg = 'The answer was ' + s.opts[s.a] + '.'; }
              st.msgT = 1800; try { Learn.record(s.q, ok); } catch (e) {} st.set = null; st.next = st.t + 2600; } }
          if (st.t >= T && !st.set && st.qi >= qs.length) end();
        },
        draw() {
          const now = performance.now(), g2 = ctx.createLinearGradient(0, 0, 0, H); g2.addColorStop(0, '#6aa8f0'); g2.addColorStop(.55, '#c8b8f4'); g2.addColorStop(1, '#f6d8e8'); ctx.fillStyle = g2; ctx.fillRect(0, 0, W, H);
          ctx.drawImage(glowSpr('255,240,190'), 640, -40, 300, 300);
          for (let i = 0; i < 7; i++) { const x = W + 300 - ((st.t * (.06 + (i % 3) * .05) + i * 230) % (W + 600)), y = 120 + i * 85; ctx.globalAlpha = .45 + (i % 3) * .15; ctx.fillStyle = '#fff'; for (const [dx, dy, r] of [[0, 0, 46], [52, 10, 36], [-50, 12, 34], [20, -20, 30]]) { ctx.beginPath(); ctx.arc(x + dx, y + dy, r, 0, 6.3); ctx.fill(); } }
          ctx.globalAlpha = 1; ctx.fillStyle = 'rgba(80,70,140,.35)'; ctx.fillRect(0, H - 70, W, 70); for (let x = -((st.t * .4) % 120); x < W; x += 120) { ctx.beginPath(); ctx.arc(x, H - 60, 60, Math.PI, 0); ctx.fillStyle = 'rgba(120,108,180,.5)'; ctx.fill(); }
          for (const ob of st.objs) { if (ob.k === 'spark') { ctx.drawImage(glowSpr('255,226,90', '255,250,200'), ob.x - 24, ob.y - 24, 48, 48); ctx.fillStyle = '#fff6b0'; ctx.beginPath(); ctx.arc(ob.x, ob.y, 7, 0, 6.3); ctx.fill(); }
            else { ctx.fillStyle = '#4a3e78'; for (const [dx, dy, r] of [[0, 0, 38], [34, 8, 28], [-32, 8, 28]]) { ctx.beginPath(); ctx.arc(ob.x + dx, ob.y + dy, r, 0, 6.3); ctx.fill(); } ctx.strokeStyle = '#ffe36a'; ctx.lineWidth = 4; ctx.beginPath(); ctx.moveTo(ob.x - 6, ob.y + 30); ctx.lineTo(ob.x - 14, ob.y + 50); ctx.lineTo(ob.x, ob.y + 48); ctx.lineTo(ob.x - 8, ob.y + 70); ctx.stroke(); } }
          if (st.set) { const s = st.set; s.opts.forEach((t, i) => { const y = Flight.Y[i]; ctx.lineWidth = 14; ctx.strokeStyle = '#2a1840'; ctx.beginPath(); ctx.ellipse(s.x, y, 36, 66, 0, 0, 6.3); ctx.stroke(); ctx.lineWidth = 9; ctx.strokeStyle = '#ffd24a'; ctx.stroke();
            ctx.font = '700 34px ' + FONT_B; ctx.textAlign = 'center'; ctx.textBaseline = 'middle'; ctx.lineWidth = 7; ctx.strokeStyle = '#2a1840'; ctx.strokeText(t, s.x + 74 + t.length * 8, y); ctx.fillStyle = '#fff'; ctx.fillText(t, s.x + 74 + t.length * 8, y); }); }
          const bob = Math.sin(now / 220) * 6, fl = 1 + Math.sin(st.wing / 110) * .05; ctx.save(); ctx.translate(DX, st.y + bob); ctx.rotate((st.ty - st.y) / 900); if (st.hurt > 0 && Math.floor(now / 90) % 2) ctx.globalAlpha = .45;
          ctx.drawImage(Art.sprite(o.rider), -120, -130 * fl, 240, 240 * fl); ctx.drawImage(Art.human('dex', 'right', 1), -38, -150, 80, 80); ctx.restore();
          rbox(14, 12, W - 28, 92, 20, 'rgba(26,14,58,.86)', '#f2c14e', 2.5);
          if (st.set) { setFont(26, true); text(st.set.text, W / 2, 26, '#ffffff', 'center'); setFont(21); text('Fly through the right answer!', W / 2, 70, '#c8ffb8', 'center'); }
          else { setFont(22, true); text('FLYING TO ' + String(o.dest).toUpperCase(), W / 2, 28, '#ffd76a', 'center'); setFont(21); text('Hold your finger where you want to fly. Grab the sparks, dodge the storm clouds.', W / 2, 66, '#e8e0f4', 'center'); }
          setFont(24); text(`✨ ${st.sparks}`, 30, 118, '#fff6b0'); bar(W - 250, 124, 220, 10, Math.min(1, st.t / T), '#7fe0d8');
          if (st.msgT > 0) { setFont(30, true); text(st.msg, W / 2, H - 120, st.msg.startsWith('The') ? '#ffb07a' : '#a8ffb8', 'center'); }
        }
      };
      UI.push(m);
    });
  }
};
const pick3 = a => a[Math.floor(Math.random() * a.length)];

// ---------------------------------------------------------------- the story and the places
const Sky = {
  starts: { roost: [15, 16], gust: [15, 17], forge: [15, 17], library: [15, 17], eye: [15, 17] },
  get links() { return [['world', SKYPLACE.padA, [SKYPLACE.padB[0] + 1, SKYPLACE.padB[1]]], ['world', SKYPLACE.padB, [SKYPLACE.padA[0] - 1, SKYPLACE.padA[1]]]]; },
  isSky(m) { return !!SKYMAP[m]; },
  clear() { return flag('stormEnd'); },
  dragon() { return rideable(); },
  rider() { const c = rideable(); return c ? c.sp : 'gale'; },
  // what flying further needs, in plain words, for the goal line and for Gale
  growNote() {
    const own = dragonsOwned(), [m, e] = masteredBy();
    if (own.length) return `Your dragon needs to grow big enough to ride: master ${Math.max(0, 4 - m)} more math and ${Math.max(0, 4 - e)} more English skill${Math.max(0, 4 - e) === 1 ? '' : 's'} (and 10 in all).`;
    if (curEgg()) return 'Hatch your dragon egg first: keep answering right, and master skills in Study Hall. Then help it grow.';
    return 'You need a dragon of your own. Dragon eggs wait at the school, the mall, the junkyard, the crypt and the manor.';
  },
  DEST: {
    roost: { n: 'Roost Rock', need: () => true },
    gust: { n: 'Gust Shrine', need: () => flag('skyFirst') },
    forge: { n: 'Thunder Forge', need: () => flag('glide') && !!rideable(), why: () => !flag('glide') ? 'earn the gift at the Gust Shrine first' : 'needs your own grown dragon' },
    library: { n: 'Cloud Library', need: () => flag('roar') && !!rideable(), why: () => !flag('roar') ? 'earn the gift at the Thunder Forge first' : 'needs your own grown dragon' },
    eye: { n: 'The Storm Eye', need: () => flag('glow') && !!rideable(), why: () => !flag('glow') ? 'earn all three gifts first' : 'needs your own grown dragon' },
    home: { n: 'Home: Radio Hill', need: () => true },
    nest: { n: 'Home: the Nest', need: () => !!rideable() },
    school: { n: 'The school roof', need: () => !!rideable() && !flag('roof_school'), roof: 1 },
    mall: { n: 'The mall skylight', need: () => !!rideable() && !flag('roof_mall'), roof: 1 },
    tower: { n: 'The top of the radio tower', need: () => !!rideable() && !flag('roof_tower'), roof: 1 }
  },
  // the landing perch on every island, and Gale on Radio Hill: pick where to fly
  async perch(from) {
    const here = from || G.map, own = !!rideable(), list = ['roost', 'gust', 'forge', 'library', 'eye', 'home', 'nest', 'school', 'mall', 'tower'].filter(k => k !== here && !(here === 'world' && (k === 'home' || k === 'nest')) && !(this.DEST[k].roof && !own) && !(k === 'nest' && !own));
    if (!own) await say('gale', 'I can carry you to Roost Rock and the Gust Shrine. Past those, the winds are too strong for two riders on one old dragon. For the rest you will need a dragon of your own, grown big enough to ride.');
    const items = list.map(k => { const D = this.DEST[k], ok = D.need(); return { label: D.n + (ok ? '' : '  (' + (D.why ? D.why() : 'not yet') + ')'), disabled: !ok }; });
    const i = await menu(items.concat([{ label: 'Stay here' }]), { x: 180, y: 120, w: 600, title: own ? `FLY ON ${cname(rideable()).toUpperCase()}` : 'FLY WITH GRANDMOTHER GALE' });
    if (i < 0 || i >= list.length) return;
    const k = list[i]; if (this.DEST[k].roof) return this.roof(k);
    await this.fly(k);
  },
  async fly(k) {
    const D = this.DEST[k], rider = this.rider();
    await say(null, rider === 'gale' ? 'Gale lowers her great head. Dex climbs onto her neck and grabs two fistfuls of soft grey feathers.' : `${cname(rideable())} crouches low. Dex climbs on and holds tight.`);
    const r = await Flight.run({ rider, dest: D.n, n: k === 'home' || k === 'nest' ? 2 : 3 });
    await fadeOut(300);
    if (k === 'home') warpTo('world', SKYPLACE.gale[0], SKYPLACE.gale[1] + 1, 'down'); else if (k === 'nest') warpTo('world', 41, 63, 'down'); else warpTo(k, this.starts[k][0], this.starts[k][1], 'up');
    checkZone(true); await fadeIn(350);
    const prize = r.sparks * 2 + r.right * 5; G.scrap += prize; if (typeof PlayLog !== 'undefined') PlayLog.add('flight', { to: k, right: r.right, asked: r.asked, sparks: r.sparks });
    await say(null, `Landed!  ${r.right} of ${r.asked} rings right, ${r.sparks} sparks.  +${prize} scrap`, { col: '#ffd76a' });
    if (this.isSky(k)) await badge('skyrider');
    if (k !== 'home' && k !== 'nest' && !flag('seen_' + k)) { setFlag('seen_' + k); await this.arrive(k); }
  },
  async arrive(k) {
    const T = {
      roost: ['gale', 'Welcome to Roost Rock, little rider. Above the storm, the sun never stopped shining. Look how small your town is from up here.'],
      gust: ['dex', 'The wind up here sings. That statue is... watching me. In a nice way. I think.'],
      forge: ['dex', 'It is LOUD here. Every cloud is full of lightning. Somebody built a forge in the middle of a thunderstorm on purpose.'],
      library: ['dex', 'A library. Made of clouds. Floating in the sky. Priya is going to be SO jealous.'],
      eye: ['dex', 'This is it. The middle of the storm. It is quiet. Too quiet.']
    }[k]; if (T) await say(T[0], T[1]);
  },
  // Act 2 begins: Priya hears a voice from above the clouds
  async call() {
    if (flag('skyCall')) return; setFlag('skyCall');
    await say('radio', '...kzzt... Little rider... can you hear me? ...kzzt... The storm over your town is not finished with you...');
    await say('priya', 'Dex. That signal is not coming from the town. It is coming from ABOVE the clouds.');
    await say('radio', '...Come to the top of Radio Hill. I will wait for you there. ...kzzt...');
    setObj('A voice from above the clouds is calling. Go to the top of Radio Hill.');
    logAdd('The ferry came and the town is waking up. But the storm never stopped. And tonight a voice called us from ABOVE the clouds. Priya is pretending she is not excited. She is very excited.');
  },
  // Gale on Radio Hill: the first meeting, then she is the way up
  async galeWorld() {
    if (!flag('skyFirst')) {
      await say(null, 'A dragon as big as a house is curled around the rocks. Its scales are the grey of rain clouds. It opens one enormous eye.');
      await say('gale', 'So you are the one who broke the Bell. I am Gale. I was old when your grandparents were young.');
      await say('gale', 'Your Bell was only an echo. The storm that made it lives above the clouds, in a place we call Skyreach. A thing called the Thunderhead sits in the eye of it, and it has kept your town in the rain for a long, long time.');
      await say('dex', 'Can we stop it?');
      await say('gale', 'A rider might. Three shrines up there each give a gift: GLIDE, ROAR and GLOW. The gifts work down here too. You will find places in your town you could never reach before.');
      await say('gale', 'Climb on. I will carry you up the first time. After that, the far islands need a dragon of your own.');
      setFlag('skyFirst'); await this.fly('roost');
      setObj('Fly to the Gust Shrine and earn the first gift. Talk to Gale at the perch on Roost Rock.');
      logAdd('I rode a DRAGON. Above the clouds there is sun. There is SUN up there. It has been raining for my whole apocalypse and the sun was just... upstairs.');
      return;
    }
    await this.perch('world');
  },
  async galeTalk() {
    const next = !flag('glide') ? 'The Gust Shrine is your first stop. The wind statue there will test you on whatever you find hardest. It is a kind test.' : !flag('roar') ? 'With GLIDE you can cross water back home. Try the feather pad on the harbour sand. Then the Thunder Forge waits, but only for a rider with a dragon of their own.' : !flag('glow') ? 'ROAR breaks rubble down in your town. Then the Cloud Library: it keeps its gift for a good reader.' : !flag('stormEnd') ? 'GLOW lights the dark places. You have all three gifts. The Storm Eye is ready for you, little rider.' : 'The storm is gone. Look at your town in the sun. I am very proud of you.';
    await say('gale', next);
    if (!rideable() && flag('glide') && !flag('stormEnd')) await say('gale', this.growNote());
  },
  // a shrine statue: a short trial built from what this child finds hardest. One miss is allowed. No hints.
  async shrine(gift) {
    const G2 = { glide: ['GUST SHRINE', 'WIND TRIAL', 'The statue spreads stone wings. Wind whistles through it, and a voice rides on the wind: "Show me the things that are hard for you, and I will give you wings."'], roar: ['THUNDER FORGE', 'THUNDER TRIAL', 'Lightning crawls over the statue. A voice like distant thunder rumbles: "Numbers are the bones of the world. Show me yours are strong."'], glow: ['CLOUD LIBRARY', 'READING TRIAL', 'The pages of the stone book turn on their own. A soft voice says: "Read with me. Find the answers in the words, not in your memory."'] }[gift];
    if (flag(gift)) { await say(null, gift === 'glide' ? 'The wind statue hums. Your feather cape is already full of its wind.' : gift === 'roar' ? 'The thunder statue rumbles happily. Your ROAR is already in you.' : 'The stone book glows warmly. Your GLOW is already lit.'); return; }
    await say(null, G2[2]);
    if (await ask(null, `${G2[1]}: ${gift === 'glow' ? 3 : 5} questions, no hints, and you may miss one. Ready?`, ['Ready!', 'Not yet']) !== 0) return;
    const L = G.learn, all = Learn.forGrade(L.grade).filter(s => s.needs !== 'speech'), weak = Learn.standing().weak.map(s => s.id), qs = [];
    if (gift === 'glow') { const ps = PASSAGES.slice(-3); for (const p of ps) { const it = p.qs[Math.floor(Math.random() * p.qs.length)], q = mc(it[0], it[1], it[2], it[3], { passage: p.text, ptitle: p.title, small: true }); q.skill = 'readinfo'; q.sig = Learn.sig(q, 'ela'); qs.push(q); } }
    else { const want = gift === 'roar' ? all.filter(s => s.sub === 'math') : all, ids = weak.filter(id => want.some(s => s.id === id)).concat(shuffle(want.map(s => s.id))); const pickIds = [...new Set(ids)].slice(0, 5); for (const id of pickIds) qs.push(Learn.make(id)); }
    let miss = 0; Learn.hold = (Learn.hold || 0) + 1;
    try { for (let i = 0; i < qs.length; i++) { if (!(await Learn.ask(qs[i], `${G2[0]}   ·   ${G2[1]}   ${i + 1} OF ${qs.length}`)) && ++miss > 1) break; } } finally { Learn.hold--; }
    if (miss > 1) { await say(null, 'The statue goes still. "Not yet. Come back when you are ready. I will be here. I am a statue."'); return; }
    setFlag(gift); Snd.sfx('badge'); Fx.flash = .7; tween(Fx, 'flash', 0, 600);
    const got = { glide: ['GLIDE', 'A cape of woven wind settles on Dex\'s shoulders. With GLIDE you can float across water. Look for feather pads back home.', 'Now the Thunder Forge. That needs your own grown dragon.'], roar: ['ROAR', 'Thunder fills Dex\'s chest. With ROAR you can smash rubble out of the way. There are piles of it back home.', 'Now the Cloud Library.'], glow: ['GLOW', 'A warm light settles in Dex\'s hands. With GLOW you can light up dark places. There is a grove in Whisperwood no one could ever see into.', 'Now the Storm Eye.'] }[gift];
    await say(null, `★ GIFT EARNED: ${got[0]} ★\n${got[1]}`, { col: '#ffd76a' });
    if (flag('glide') && flag('roar') && flag('glow')) await badge('gifted');
    setObj(gift === 'glide' ? (rideable() ? 'Try GLIDE at the feather pad on the harbour sand. Then fly to the Thunder Forge.' : 'Try GLIDE at the feather pad on the harbour sand. The Thunder Forge needs your own grown dragon. ' + this.growNote()) : gift === 'roar' ? 'Smash rubble back home with ROAR. Then fly to the Cloud Library.' : 'Light up the dark grove in Whisperwood with GLOW. Then fly to the Storm Eye.');
    await say('dex', got[2]);
  },
  async chest(which) {
    const I = which === 'silk' ? ['sky_silk', 'CLOUDSILK', 'a roll of shining Cloudsilk', 'Nana Newt could brew something amazing with this.'] : ['sky_glass', 'THUNDER GLASS', 'a chunk of Thunder Glass that crackles in your hand', 'Professor Flicker could make a charm out of this.'];
    setFlag(I[0]); (G.sky = G.sky || {})[which] = 1; Snd.sfx('levelup');
    await say(null, `★ Found ${I[2]}! ★`, { col: '#ffd76a' }); await say('dex', I[3]);
  },
  async glidePad(dir) {
    if (!flag('glide')) { await say(null, 'A white feather is painted on the ground, pointing out across the water. Something that could GLIDE might make it across.'); return; }
    const to = dir === 'out' ? SKYPLACE.padB : SKYPLACE.padA;
    await say(null, dir === 'out' ? 'Dex spreads the cape of wind and jumps. The breeze catches him and carries him over the waves...' : 'One running jump, and the wind carries Dex back to the harbour.');
    Snd.sfx('heal'); await fadeOut(350); warpTo('world', to[0] + (dir === 'out' ? 1 : -1), to[1], dir === 'out' ? 'right' : 'left'); checkZone(dir === 'back'); await fadeIn(350);
  },
  async rubble(id) {
    if (!flag('roar')) { await say(null, 'A heavy pile of rubble blocks a gap in the trees. Something is behind it. You would need a mighty ROAR to clear it.'); return; }
    Snd.sfx('thunder'); Fx.shake = 14; tween(Fx, 'shake', 0, 600); await say(null, 'Dex takes a deep breath and ROARS. The rubble shakes, cracks, and tumbles away!'); setFlag(id);
  },
  async grove() {
    if (!flag('glow')) { await say(null, 'A wall of darkness blocks the path. Not shadow: DARKNESS. Your flashlight just... stops at it. Only a real GLOW could get through.'); return; }
    Snd.sfx('heal'); Fx.flash = .8; tween(Fx, 'flash', 0, 700); await say(null, 'Dex holds up his hands. The GLOW spills out, warm and gold, and the darkness peels away like paper.'); setFlag('grove');
  },
  async friend(id, sp, txt) {
    await say(null, txt);
    if (await ask(null, 'It wants to come with you. Take it?', ['Yes! Welcome to the team!', 'Not right now']) !== 0) return;
    const lvl = clamp(Math.max(5, ...G.party.map(c => c.lvl)) - 2, 5, 50); addCritter(makeCritter(sp, lvl)); setFlag(id); Snd.sfx('catch');
    await say(null, `★ ${SPECIES[sp].n} joined your team! ★`, { col: '#ffd76a' });
  },
  // the rooftops: a short flight, a one-time find, and back where you were
  async roof(k) {
    const back = { map: G.map, x: G.x, y: G.y, dir: G.dir }, n = this.DEST[k].n;
    await say(null, `${cname(rideable())} crouches low. Dex climbs on and holds tight.`);
    const r = await Flight.run({ rider: this.rider(), dest: n, n: 2 }); G.scrap += r.sparks * 2 + r.right * 5;
    Scene = 'black';
    if (k === 'school') { await say(null, 'The dragon lands on the flat school roof with a thump. A rusty trophy case sits by the air vents, where Coach Krunk used to hide his snacks.'); give('slush', 3, true); G.scrap += 200; await say(null, '★ Found 3 Freeze Slushies and 200 scrap in Coach Krunk\'s secret trophy case! ★', { col: '#ffd76a' }); setFlag('roof_school'); }
    if (k === 'mall') { await say(null, 'Through the mall skylight you can see the garden shop. On the glass sits a seed packet with a note: "For Bash, if anyone ever finds this. Love, Grandma."'); give('potion', 3, true); await say(null, '★ Found Bash\'s seed packet and 3 Healing Potions! ★', { col: '#ffd76a' }); await say('bash', '...My grandma\'s ferns. These are my grandma\'s fern seeds. (He goes very quiet and very happy.)'); setFlag('roof_mall'); }
    if (k === 'tower') { await say(null, 'At the very top of the radio tower, Dex bolts Priya\'s spare antenna to the old beacon.'); await say('priya', 'Signal strength just DOUBLED. Every kid we rescue at night will find us faster. Double scrap from night rescues, starting now!'); setFlag('roof_tower'); setFlag('booster'); }
    await fadeOut(250); warpTo(back.map, back.x, back.y, back.dir); Scene = 'world'; checkZone(true); await fadeIn(250);
  },
  // the finale
  async thunderhead() {
    await say(null, 'In the middle of the storm, a cloud as big as a hill opens two yellow eyes. Lightning crawls across it like veins.');
    await say('gale', 'The Thunderhead. It feeds on minds that stop thinking. That is why your town had to keep its brains switched on. Show it a mind that never stops.');
    if (await ask('dex', 'This is it. Ready?', ['Let\'s break this storm!', 'Not yet']) !== 0) return;
    if (!(await bossFight({ foes: [['wispkin', 40, 'Storm Wisp'], ['zaprat', 41, 'Spark Swarm'], ['thunderhead', 44]], bg: 'sky', music: 'finale', intro: 'THE THUNDERHEAD rumbles awake!' }))) return;
    setFlag('stormEnd'); Snd.play('win'); Fx.flash = 1; await tween(Fx, 'flash', 0, 1200);
    await say(null, 'The Thunderhead shudders, thins, and comes apart into a thousand small white clouds. For the first time in a long time, the sky is just... sky.');
    await badge('stormbreaker');
    await say('gale', 'Fly home, little rider. Go and see it.');
    await fadeOut(400); warpTo('world', 41, 63, 'down'); checkZone(true); await fadeIn(600);
    await say(null, 'Over Wexler Falls the clouds roll back. Sunlight hits the water tower, the school, the mall, the long wet streets. People come out of their houses and look up.');
    await say('priya', 'Sunlight. Actual sunlight. My solar panels are going to be SO happy.'); await say('wren', 'I forgot what warm felt like.'); await say('bash', '...The ferns are going to LOVE this.');
    await say('dex', 'It still gets dark at the cemetery and the old manor. Some places are spooky no matter what. But the town is ours again.');
    setObj('The storm is gone! Explore, answer signals at night, and master every skill.');
    logAdd('We broke the storm. The sun came out over the whole town. Mom cried. Bash cried. I did not cry. (I cried.)');
  },
  // ---- wiring that needs game.js: run once every script has loaded
  init() {
    Object.assign(GMAP, { V: 'sky', n: 'cloud', N: 'stormcloud' });
    Object.assign(ESIZE, { gale: 210, thunderhead: 220, statue_wind: 112, statue_thunder: 112, statue_book: 112, perch: 96 });
    Guide.steps.push(['skyFirst', 'world', SKYPLACE.gale[0], SKYPLACE.gale[1]], ['glide', 'gust', 15, 5], ['roar', 'forge', 15, 5], ['glow', 'library', 15, 5], ['stormEnd', 'eye', 15, 7]);
    { const o = Guide.local.bind(Guide); Guide.local = function (t) {   // going to or from the sky means going to a perch
        if (t.map !== G.map && (Sky.isSky(t.map) || Sky.isSky(G.map))) { if (Sky.isSky(G.map)) { const s = SKYSPOT[G.map]; return { map: G.map, x: s[0], y: s[1] }; } if (G.map === 'world') return { map: 'world', x: SKYPLACE.gale[0], y: SKYPLACE.gale[1] }; }
        return o(t); }; }
    // night rescues pay double once the tower is boosted
    { const o = Story.signal; Story.signal = async function () { const s0 = G.scrap, n0 = G.night, r = await o.apply(this, arguments); if (flag('booster') && G.night > n0 && G.scrap > s0) G.scrap += G.scrap - s0; return r; }; }
    // Act 2 starts once the ferry has come: after the horn, or the next time a finished game is picked up
    { const o = Story.horn; Story.horn = async function () { const r = await o.apply(this, arguments); if (flag('cleared')) await Sky.call(); return r; }; }
    { const o = welcomeBack; welcomeBack = async function () { await o.apply(this, arguments); if (G && flag('cleared') && !flag('skyCall')) await Sky.call(); }; }
    // the sky ingredients at the Night Market
    { const o = SHOPS.brew.stock; SHOPS.brew.stock = function () { const a = o.apply(this, arguments); a.push({ n: 'Sky Tonic ×3', d: ITEMS.skytonic.d + ` You have ${G.bag.skytonic || 0}.`, tier: 5, qty: 3, locked: !(G.sky && G.sky.silk) && 'Nana needs Cloudsilk from the Gust Shrine, up in Skyreach.', get() { give('skytonic', 3, true); } }); return a; }; }
    { const o = SHOPS.magic.stock; SHOPS.magic.stock = function () { const a = o.apply(this, arguments); a.push({ n: CHARMS.thunder.n, d: CHARMS.thunder.d + ' (Permanent.)', tier: 5, owned: !!G.gear.charms.thunder, locked: !(G.sky && G.sky.glass) && 'Professor Flicker needs Thunder Glass from the Thunder Forge, up in Skyreach.', get() { G.gear.charms.thunder = 1; } }); return a; }; }
  }
};
document.addEventListener('DOMContentLoaded', () => { try { Sky.init(); } catch (e) { console.error('Skyreach wiring', e); } });
