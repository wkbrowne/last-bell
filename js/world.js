'use strict';
// s: solid, enc: wild encounters, u: tile drawn underneath (1 = map base)
const TINFO = {
  '.': {}, ',': { enc: 1 }, '=': {}, '-': {}, ':': {}, 's': {}, 'b': {}, '*': {}, 'J': { enc: 1 },
  'T': { s: 1, u: '.' }, 't': { s: 1, u: '.' }, '~': { s: 1 }, '#': { s: 1 }, 'H': { s: 1 }, 'D': { s: 1 },
  'R': { s: 1 }, 'B': { s: 1 }, 'G': { s: 1 }, 'P': { s: 1 },
  'f': { s: 1, u: '.' }, 'i': { s: 1, u: '.' }, 'g': { s: 1, u: '.' }, 'r': { s: 1, u: '.' }, 'c': { s: 1, u: '=' }, 'j': { s: 1, u: ':' },
  'W': { s: 1 }, 'o': {}, 'm': { enc: 1 }, 'w': {}, 'k': {}, 'E': {},
  'd': { s: 1, u: 1 }, 'h': { s: 1, u: 1 }, 'e': { s: 1, u: 1 }, 'p': { s: 1, u: 1 }, 'u': { s: 1, u: 1 }, 'l': { s: 1, u: 'w' }
};
class MapB {
  constructor(w, h, fill) { this.w = w; this.h = h; this.b = []; this.t = Array.from({ length: h }, () => Array(w).fill(fill)); }
  set(x, y, c) { if (x >= 0 && y >= 0 && x < this.w && y < this.h) this.t[y][x] = c; }
  get(x, y) { return (x >= 0 && y >= 0 && x < this.w && y < this.h) ? this.t[y][x] : 'T'; }
  rect(x, y, w, h, c) { for (let j = y; j < y + h; j++) for (let i = x; i < x + w; i++) this.set(i, j, c); }
  frame(x, y, w, h, c) { for (let i = x; i < x + w; i++) { this.set(i, y, c); this.set(i, y + h - 1, c); } for (let j = y; j < y + h; j++) { this.set(x, j, c); this.set(x + w - 1, j, c); } }
  hline(x, y, w, c) { this.rect(x, y, w, 1, c); }
  scatter(x, y, w, h, c, dens, r, on) { for (let j = y; j < y + h; j++) for (let i = x; i < x + w; i++) if (this.get(i, j) === (on || '.') && r() < dens) this.set(i, j, c); }
  house(x, y, w, h, roof, door, label, col) {
    this.b.push({ x, y, w, h, roof, door, label, col });
    this.rect(x, y, w, h - 2, roof); this.rect(x, y + h - 2, w, 2, '#');
    for (let i = x + 1; i < x + w - 1; i += 2) this.set(i, y + h - 2, 'H');
    this.set(x + door, y + h - 1, 'D');
  }
  clearing(x, y, w, h, r) { this.rect(x, y, w, h, '.'); this.scatter(x, y, w, h, ',', .55, r); this.scatter(x, y, w, h, '*', .08, r); }
}

function buildWorld() {
  const m = new MapB(128, 96, 'T'), r = mulberry32(1337);
  m.rect(0, 88, 48, 8, '~'); m.rect(27, 24, 3, 64, '~');
  // ---- open ground
  m.rect(4, 3, 30, 19, '.');                 // Blackwood grounds
  m.rect(36, 4, 24, 20, '.');                // cemetery
  m.rect(88, 3, 36, 23, '.');                // radio hill
  m.rect(30, 39, 94, 29, '.');               // suburbs / Maple Court / school
  m.rect(4, 46, 23, 22, '.');                // hospital district
  m.rect(4, 68, 23, 20, '.'); m.rect(4, 84, 23, 4, 's'); // harbor
  m.rect(31, 68, 15, 19, '.');               // the Lost Lot
  m.rect(48, 69, 45, 22, '.');               // downtown
  // ---- Blackwood grounds
  m.scatter(4, 3, 30, 19, 't', .10, r); m.scatter(4, 3, 30, 19, ',', .28, r); m.scatter(4, 3, 30, 19, 'g', .03, r);
  m.hline(4, 22, 30, 'i');
  m.rect(18, 14, 4, 8, '.'); m.rect(19, 14, 2, 9, ':');
  m.house(11, 5, 16, 9, 'P', 8);
  // ---- Whisperwood
  m.clearing(34, 26, 10, 5, r); m.clearing(8, 25, 9, 6, r); m.clearing(40, 35, 14, 7, r); m.clearing(8, 36, 14, 6, r);
  m.rect(19, 23, 2, 11, ':'); m.rect(19, 32, 41, 2, ':'); m.rect(27, 32, 3, 2, 'b');
  m.rect(48, 24, 2, 9, ':'); m.rect(58, 32, 2, 7, ':');
  m.rect(38, 31, 2, 1, ':'); m.rect(17, 28, 2, 1, ':'); m.rect(46, 34, 2, 1, ':'); m.rect(19, 34, 2, 2, ':');
  // ---- cemetery
  m.frame(36, 4, 24, 20, 'i');
  for (let y = 6; y <= 21; y += 3) for (let x = 38; x <= 57; x += 2) if (!(x >= 47 && x <= 50) && !(y >= 13 && y <= 16)) m.set(x, y, 'g');
  m.scatter(37, 5, 22, 18, ',', .3, r);
  m.rect(48, 9, 2, 15, ':'); m.rect(37, 14, 23, 2, ':');
  m.house(45, 5, 8, 4, 'G', 3, 'CRYPT');
  // ---- north ridge
  m.clearing(65, 9, 9, 5, r); m.clearing(76, 16, 8, 5, r);
  m.rect(60, 14, 30, 2, ':');
  // ---- radio hill
  m.scatter(88, 3, 36, 23, 'r', .16, r); m.scatter(88, 3, 36, 23, ',', .18, r);
  m.rect(88, 14, 20, 2, ':'); m.rect(106, 9, 2, 6, ':'); m.rect(108, 9, 7, 1, ':');
  m.set(106, 8, '.'); m.set(105, 8, 'r'); m.set(107, 8, 'r');
  m.house(111, 5, 6, 4, 'G', 2, 'RADIO', '#5a6a80');
  // ---- suburbs
  m.scatter(30, 39, 94, 10, ',', .22, r); m.scatter(30, 39, 94, 9, 'T', .07, r); m.scatter(30, 39, 94, 10, '*', .04, r);
  m.scatter(30, 59, 66, 9, ',', .2, r); m.scatter(30, 60, 66, 7, 'T', .04, r);
  m.rect(63, 40, 22, 8, '.'); m.scatter(63, 40, 22, 8, ',', .5, r); m.scatter(63, 40, 22, 8, '*', .1, r); m.rect(71, 42, 6, 3, '~');
  m.rect(97, 48, 9, 6, '.'); m.scatter(97, 48, 9, 6, ',', .6, r);
  // ---- hospital district / harbor / lost lot / downtown ground cover
  m.scatter(4, 46, 23, 22, ',', .22, r); m.scatter(4, 68, 23, 16, ',', .15, r);
  m.scatter(31, 68, 15, 19, ',', .5, r); m.scatter(31, 69, 15, 18, 'T', .12, r);
  m.scatter(48, 69, 45, 10, ',', .15, r); m.scatter(48, 83, 45, 8, ',', .3, r); m.rect(68, 85, 4, 3, '~');
  m.hline(48, 68, 45, 'f');
  // ---- junkyard
  m.rect(97, 65, 26, 26, ':'); m.frame(96, 64, 28, 28, 'f');
  m.scatter(97, 65, 26, 26, 'j', .14, r, ':'); m.scatter(97, 65, 26, 26, 'J', .4, r, ':');
  m.rect(108, 65, 2, 20, ':'); m.rect(108, 84, 12, 2, ':'); m.rect(100, 76, 8, 1, ':'); m.rect(110, 70, 9, 1, ':'); m.rect(105, 71, 3, 3, ':');
  // ---- roads
  m.hline(30, 55, 93, '-'); m.hline(30, 58, 93, '-');
  m.rect(30, 56, 93, 2, '='); m.rect(27, 56, 3, 2, 'b'); m.rect(12, 56, 15, 2, '=');
  m.rect(58, 39, 2, 43, '=');
  m.hline(49, 79, 43, '-'); m.hline(49, 82, 43, '-'); m.rect(49, 80, 43, 2, '='); m.rect(58, 79, 2, 3, '=');
  m.rect(108, 58, 2, 6, '='); m.rect(108, 64, 2, 1, ':');
  m.rect(108, 47, 2, 8, '-');
  m.rect(14, 58, 2, 26, '='); m.rect(14, 84, 2, 9, 'b'); m.set(15, 55, '-');
  m.rect(36, 66, 1, 15, ':'); m.rect(36, 59, 1, 7, ':'); m.rect(39, 61, 5, 5, '.'); m.rect(40, 63, 3, 2, ':');
  // ---- buildings
  for (const [x, c, d] of [[33, 'R', 2], [41, 'B', 2], [49, 'R', 3], [62, 'B', 2], [70, 'R', 3], [78, 'R', 2], [86, 'B', 2]]) m.house(x, 50, 6, 5, c, d);
  m.house(62, 60, 7, 4, 'G', 3, "GAS 'N' GULP", '#48a05a');
  for (const [x, c, d] of [[48, 'B', 2], [72, 'R', 2], [80, 'B', 3], [88, 'R', 2]]) m.house(x, 60, 6, 5, c, d);
  m.house(97, 40, 24, 7, 'G', 11, 'WEXLER MIDDLE SCHOOL', '#3f7ee8');          // school, door (108,46)
  m.house(64, 70, 24, 8, 'G', 12, 'WEXLER GALLERIA', '#8e6be8'); m.rect(76, 78, 1, 2, '-'); // mall, door (76,77)
  m.house(49, 74, 8, 5, 'G', 4, 'COMICS', '#e5483d');            // comic shop
  m.house(7, 47, 16, 8, 'G', 8, '+ COUNTY GENERAL', '#d6453a');            // hospital, door (15,54)
  m.house(5, 74, 6, 5, 'G', 2, 'BAIT', '#3f7ee8'); m.house(19, 74, 6, 5, 'R', 2);
  for (const [x, y] of [[45, 56], [66, 57], [83, 56], [95, 57], [58, 45], [59, 62], [70, 80], [85, 81], [113, 49], [115, 49], [117, 51], [114, 52], [119, 50], [20, 56], [9, 60], [52, 71], [90, 75]]) m.set(x, y, 'c');
  return m;
}
function buildSchool() {
  const m = new MapB(36, 22, 'W');
  m.rect(1, 10, 34, 3, 'm'); m.rect(17, 13, 3, 8, 'o'); m.set(18, 21, 'E');
  m.rect(1, 1, 8, 8, 'o'); m.set(4, 9, 'o'); m.rect(10, 1, 8, 8, 'o'); m.set(13, 9, 'o');
  m.rect(19, 1, 9, 8, 'o'); m.set(23, 9, 'o'); m.rect(29, 1, 6, 8, 'o'); m.set(31, 9, 'o');
  m.rect(1, 14, 15, 7, 'o'); m.set(8, 13, 'o'); m.rect(21, 14, 14, 7, 'w'); m.set(27, 13, 'w');
  for (const y of [3, 5, 7]) { for (const x of [2, 4, 6]) m.set(x, y, 'd'); for (const x of [11, 13, 15]) m.set(x, y, 'd'); }
  for (const y of [3, 6]) { m.rect(20, y, 3, 1, 'u'); m.rect(24, y, 3, 1, 'u'); }
  m.rect(29, 1, 6, 1, 'h');
  for (const y of [16, 18]) { m.rect(3, y, 3, 1, 'u'); m.rect(10, y, 3, 1, 'u'); }
  return m;
}
function buildMall() {
  const m = new MapB(40, 24, 'W');
  m.rect(14, 8, 12, 15, 'o'); m.set(20, 23, 'E'); m.rect(1, 11, 38, 2, 'm'); m.rect(18, 14, 4, 3, '~');
  m.rect(1, 1, 12, 9, 'o'); m.set(6, 10, 'o'); m.rect(1, 1, 12, 1, 'p'); for (const [x, y] of [[2, 4], [10, 4], [2, 7], [10, 7]]) m.set(x, y, 'p');
  m.rect(1, 14, 12, 9, 'm'); m.set(6, 13, 'm'); for (const y of [16, 19]) { m.rect(3, y, 2, 1, 'h'); m.rect(8, y, 3, 1, 'h'); }
  m.rect(14, 1, 12, 6, 'o'); m.set(20, 7, 'o'); m.rect(15, 3, 4, 1, 'h'); m.rect(22, 3, 4, 1, 'h');
  m.rect(27, 1, 12, 9, 'o'); m.set(33, 10, 'o'); m.rect(29, 6, 3, 1, 'd'); m.rect(35, 6, 3, 1, 'd');
  m.rect(27, 14, 12, 9, 'm'); m.set(33, 13, 'm'); m.rect(29, 16, 2, 1, 'u'); m.rect(36, 16, 2, 1, 'u'); m.rect(29, 20, 2, 1, 'u');
  return m;
}
function buildHospital() {
  const m = new MapB(34, 22, 'W');
  m.rect(12, 15, 10, 6, 'o'); m.set(17, 21, 'E'); m.rect(1, 11, 32, 3, 'm'); m.set(16, 14, 'o'); m.set(17, 14, 'o');
  m.rect(1, 1, 9, 9, 'o'); m.set(5, 10, 'o'); for (const [x, y] of [[2, 2], [2, 5], [2, 8], [8, 2], [8, 5]]) m.set(x, y, 'e');
  m.rect(12, 1, 10, 9, 'o'); m.set(17, 10, 'o'); m.rect(14, 4, 6, 1, 'u');
  m.rect(24, 1, 9, 9, 'o'); m.set(28, 10, 'o'); for (const [x, y] of [[25, 2], [25, 5], [31, 5], [31, 8]]) m.set(x, y, 'e');
  m.rect(1, 15, 9, 6, 'm'); m.set(5, 14, 'm'); m.rect(24, 15, 9, 6, 'o'); m.set(28, 14, 'o'); m.rect(25, 17, 7, 1, 'h');
  return m;
}
function buildManor() {
  const m = new MapB(38, 30, 'W');
  m.rect(13, 18, 12, 11, 'w'); m.rect(18, 18, 2, 11, 'k'); m.set(19, 29, 'E');
  m.rect(1, 18, 10, 10, 'm'); m.rect(11, 23, 2, 1, 'w'); m.rect(27, 18, 10, 10, 'm'); m.rect(25, 23, 2, 1, 'w');
  m.rect(1, 13, 36, 3, 'm'); m.rect(18, 16, 2, 2, 'k');
  m.rect(16, 1, 6, 10, 'w'); m.rect(18, 1, 2, 10, 'k'); m.rect(18, 11, 1, 2, 'k');
  m.rect(1, 1, 13, 10, 'm'); m.rect(7, 11, 1, 2, 'm'); m.rect(24, 1, 13, 10, 'm'); m.rect(30, 11, 1, 2, 'm');
  for (const [x, y] of [[14, 19], [23, 19], [14, 27], [23, 27], [16, 1], [21, 1], [16, 9], [21, 9]]) m.set(x, y, 'l');
  for (const y of [20, 22, 25]) m.rect(2, y, 7, 1, 'h');
  m.rect(29, 21, 6, 2, 'u');
  return m;
}

// Encounter tables: [species, minLvl, maxLvl, weight]
const ENC = {
  maple: [['gnawbie', 3, 4, 4], ['thornpup', 3, 4, 4], ['shambler', 3, 4, 3]],
  suburbs: [['gnawbie', 3, 5, 3], ['thornpup', 3, 5, 3], ['shambler', 4, 6, 4], ['murdle', 4, 6, 2], ['sprinter', 5, 6, 1]],
  park: [['boltbug', 4, 6, 4], ['thornpup', 4, 6, 3], ['gnawbie', 4, 6, 2], ['murdle', 5, 6, 2]],
  lot: [['gloop', 5, 7, 4], ['thornpup', 5, 7, 3], ['dustmoth', 5, 7, 2], ['shambler', 5, 7, 2]],
  school: [['shambler', 6, 8, 4], ['sprinter', 6, 8, 3], ['lunchlady', 7, 8, 1], ['boltbug', 6, 8, 2]],
  downtown: [['sprinter', 9, 12, 3], ['shambler', 10, 12, 3], ['gnawbie', 10, 12, 2], ['murdle', 10, 12, 2], ['zaprat', 10, 11, 1]],
  mall: [['shambler', 11, 13, 3], ['sprinter', 11, 13, 3], ['zaprat', 11, 13, 2], ['boltbug', 11, 13, 2]],
  junk: [['scrapup', 14, 16, 3], ['rubblet', 14, 17, 3], ['gnawbie', 15, 17, 2], ['hazmat', 15, 17, 3]],
  woods: [['sporkle', 17, 19, 3], ['dustmoth', 17, 20, 3], ['thornpup', 18, 19, 2], ['sprinter', 18, 20, 3], ['murdle', 18, 20, 1]],
  cemetery: [['wispkin', 19, 22, 3], ['dustmoth', 19, 21, 3], ['shambler', 20, 22, 3], ['gloop', 19, 21, 1]],
  ridge: [['rubblet', 21, 23, 3], ['boltbug', 21, 23, 3], ['sprinter', 21, 24, 3], ['hazmat', 22, 24, 2]],
  hospital_d: [['hazmat', 24, 27, 3], ['bloater', 24, 27, 3], ['gloop', 24, 26, 2], ['murdle', 25, 26, 2]],
  hospital: [['hazmat', 25, 28, 3], ['bloater', 25, 28, 3], ['sprinter', 26, 28, 3], ['wispkin', 25, 27, 1]],
  grounds: [['wispkin', 27, 29, 3], ['dustmoth', 28, 30, 2], ['clanker', 28, 30, 3]],
  manor: [['clanker', 29, 32, 4], ['dustmoth', 30, 32, 2], ['wispkin', 29, 31, 2], ['sprinter', 30, 32, 2]]
};
const Z = (id, n, r, music, enc, bg, dark) => ({ id, n, r, music, enc: ENC[enc], bg, dark });
const MAPS = {
  world: { m: buildWorld(), base: '.', zones: [
    Z('grounds', 'Blackwood Grounds', [4, 2, 30, 21], 'spooky', 'grounds', 'spooky', 0.62),
    Z('cemetery', 'Hollow Rest Cemetery', [36, 4, 24, 20], 'spooky', 'cemetery', 'spooky', 0.56),
    Z('radio', 'Radio Hill', [88, 2, 36, 24], 'streets', 'ridge', 'grass', 0.32),
    Z('ridge', 'North Ridge', [60, 4, 28, 22], 'spooky', 'ridge', 'grass', 0.42),
    Z('woods', 'Whisperwood', [4, 23, 58, 21], 'spooky', 'woods', 'spooky', 0.5),
    Z('junk', 'Krush & Sons Junkyard', [96, 64, 28, 28], 'streets', 'junk', 'junk', 0.26),
    Z('schoolyard', 'Wexler Middle School', [94, 39, 30, 19], 'streets', 'suburbs', 'grass', 0.2),
    Z('park', 'Pembry Park', [63, 40, 22, 8], 'streets', 'park', 'grass', 0.16),
    Z('maple', 'Maple Court', [30, 39, 26, 29], 'nest', 'maple', 'grass', 0.13),
    Z('suburbs', 'Elm Street', [56, 39, 68, 29], 'streets', 'suburbs', 'grass', 0.2),
    Z('hospital_d', 'County General', [4, 46, 26, 22], 'spooky', 'hospital_d', 'street', 0.44),
    Z('harbor', 'Wexler Harbor', [0, 68, 30, 28], 'nest', 'hospital_d', 'street', 0.3),
    Z('lot', 'The Lost Lot', [31, 68, 15, 19], 'streets', 'lot', 'grass', 0.28),
    Z('downtown', 'Downtown Wexler Falls', [46, 68, 48, 24], 'streets', 'downtown', 'street', 0.28)
  ] },
  school: { m: buildSchool(), base: 'o', zones: [Z('school', 'Wexler Middle School', [0, 0, 99, 99], 'spooky', 'school', 'indoor', 0.46)] },
  mall: { m: buildMall(), base: 'o', zones: [Z('mall', 'Wexler Galleria', [0, 0, 99, 99], 'spooky', 'mall', 'indoor', 0.46)] },
  hospital: { m: buildHospital(), base: 'o', zones: [Z('hospital', 'County General Hospital', [0, 0, 99, 99], 'sad', 'hospital', 'indoor', 0.56)] },
  manor: { m: buildManor(), base: 'm', zones: [Z('manor', 'Blackwood Manor', [0, 0, 99, 99], 'manor', 'manor', 'manor', 0.6)] }
};
const WARPS = {
  'world:108,46': ['school', 18, 20, 'up'], 'school:18,21': ['world', 108, 47, 'down'],
  'world:76,77': ['mall', 20, 22, 'up'], 'mall:20,23': ['world', 76, 78, 'down'],
  'world:15,54': ['hospital', 17, 20, 'up'], 'hospital:17,21': ['world', 15, 55, 'down'],
  'world:19,13': ['manor', 19, 28, 'up'], 'manor:19,29': ['world', 19, 14, 'down']
};
function zoneAt(map, x, y) {
  const zs = MAPS[map].zones;
  for (const z of zs) if (x >= z.r[0] && y >= z.r[1] && x < z.r[0] + z.r[2] && y < z.r[1] + z.r[3]) return z;
  return zs[zs.length - 1];
}
const BGS = {
  grass: ['#7fc8f0', '#c8ecd0', '#4f9a48', '#3f7d3c'], street: ['#8a9ab8', '#c8c8d8', '#5a5a66', '#3b3a46'],
  indoor: ['#2a2638', '#3a3448', '#6f7468', '#565c50'], spooky: ['#141028', '#3a2a5a', '#2a4a34', '#1f3a2a'],
  junk: ['#b89a6a', '#e0c898', '#84643f', '#6a4e30'], manor: ['#0c0814', '#2a1430', '#5a1f2a', '#3a141c']
};
