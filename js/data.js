'use strict';
const TYPES = {
  FERAL: { col: '#d88a4a', beats: ['BLOOM', 'GHOST'], weak: ['GRIT', 'ROT'] },
  BLOOM: { col: '#5fbf4f', beats: ['ROT', 'GRIT'], weak: ['FERAL', 'BLOOM'] },
  GRIT: { col: '#a8a8b8', beats: ['FERAL', 'SPARK'], weak: ['BLOOM', 'GRIT'] },
  SPARK: { col: '#f0d83a', beats: ['ROT', 'GHOST'], weak: ['GRIT', 'SPARK'] },
  ROT: { col: '#9a7ac8', beats: ['FERAL', 'BLOOM'], weak: ['GRIT', 'ROT'] },
  GHOST: { col: '#7fe0d8', beats: ['GRIT', 'SPARK'], weak: ['ROT', 'FERAL'] }
};
const typeMult = (atk, def) => TYPES[atk].beats.includes(def) ? 2 : TYPES[atk].weak.includes(def) ? 0.5 : 1;
const weakTo = def => Object.keys(TYPES).filter(t => TYPES[t].beats.includes(def));

// p: power, acc: accuracy, inf/stun: % chance, fAtk/fDef: foe stage, sAtk/sDef: self stage, ch: % for stage effect
const MOVES = {
  tackle: { n: 'Tackle', t: 'FERAL', p: 40, d: 'A full-body bonk.' },
  scratch: { n: 'Scratch', t: 'FERAL', p: 40, d: 'Quick claws.' },
  bite: { n: 'Chomp', t: 'FERAL', p: 55, d: 'A solid chomp.' },
  quicknip: { n: 'Quick Nip', t: 'FERAL', p: 40, pri: 1, d: 'Always strikes first.' },
  lunge: { n: 'Lunge', t: 'FERAL', p: 50, pri: 1, d: 'A sudden rush. Strikes first.' },
  frenzy: { n: 'Frenzy', t: 'FERAL', p: 75, d: 'A wild flurry.' },
  maul: { n: 'Mega Pounce', t: 'FERAL', p: 95, acc: 85, d: 'Huge, but can miss.' },
  peck: { n: 'Peck', t: 'FERAL', p: 45, d: 'Bonk with a beak.' },
  divebomb: { n: 'Dive Bomb', t: 'FERAL', p: 85, acc: 90, d: 'A swoop from above.' },
  snarl: { n: 'Snarl', t: 'FERAL', p: 0, fAtk: -1, d: "Lowers the foe's ATK." },
  laps: { n: 'Run Laps', t: 'FERAL', p: 60, d: '"TEN MORE LAPS!"' },
  scalpel: { n: 'Paper Cut', t: 'FERAL', p: 75, d: 'From a very sharp clipboard.' },
  rustbite: { n: 'Rust Bite', t: 'GRIT', p: 50, d: 'Crunchy and metallic.' },
  rockroll: { n: 'Rock Roll', t: 'GRIT', p: 60, d: 'Rolls right over the foe.' },
  scraptoss: { n: 'Scrap Toss', t: 'GRIT', p: 75, acc: 90, d: 'Flings a pile of junk.' },
  ironslam: { n: 'Iron Slam', t: 'GRIT', p: 100, acc: 85, d: 'Heavy metal.' },
  dumpster: { n: 'Dumpster Dive', t: 'GRIT', p: 85, acc: 90, d: 'A belly-flop from a bin.' },
  crush: { n: 'Krush', t: 'GRIT', p: 110, acc: 80, d: 'Flattening. Sometimes misses.' },
  guardup: { n: 'Guard Up', t: 'GRIT', p: 0, sDef: 1, d: 'Raises your DEF.' },
  ladle: { n: 'Ladle Smack', t: 'GRIT', p: 55, d: 'Bonk. Soup everywhere.' },
  dodgeball: { n: 'Dodgeball', t: 'GRIT', p: 70, d: 'If you can dodge a wrench...' },
  segwayram: { n: 'Scooter Ram', t: 'GRIT', p: 80, d: 'Beep beep.' },
  servesup: { n: 'Silver Tray', t: 'GRIT', p: 70, d: 'Dinner is served. On your head.' },
  polish: { n: 'Polish', t: 'GRIT', p: 0, sDef: 1, d: 'Raises DEF.' },
  sporepuff: { n: 'Pollen Blast', t: 'BLOOM', p: 45, inf: 30, d: 'May cause the Icks.' },
  thornjab: { n: 'Thorn Jab', t: 'BLOOM', p: 55, d: 'Pointy.' },
  vinewhip: { n: 'Vine Snap', t: 'BLOOM', p: 70, d: 'Whip-crack!' },
  brambleroll: { n: 'Bramble Roll', t: 'BLOOM', p: 80, acc: 95, d: 'A rolling ball of thorns.' },
  fungalboom: { n: 'Bloom Bomb', t: 'BLOOM', p: 100, acc: 85, d: 'A huge burst of thorny petals.' },
  leech: { n: 'Leech Root', t: 'BLOOM', p: 55, drain: .5, d: 'Heals you for half the damage.' },
  photosnack: { n: 'Photo-Snack', t: 'BLOOM', p: 0, heal: .4, d: 'Soak up sun. Heals 40%.' },
  staticzap: { n: 'Static Zap', t: 'SPARK', p: 45, stun: 20, d: 'May stun the foe.' },
  flicker: { n: 'Flicker', t: 'SPARK', p: 55, d: 'A bright snap of light.' },
  arcflash: { n: 'Arc Flash', t: 'SPARK', p: 70, d: 'Crackling bolt.' },
  thunderclap: { n: 'Thunderclap', t: 'SPARK', p: 105, acc: 80, d: 'KA-BOOM. Can miss.' },
  overload: { n: 'Overload', t: 'SPARK', p: 90, recoil: .2, d: 'Strong, but it stings you too.' },
  shock: { n: 'Static Shock', t: 'SPARK', p: 65, stun: 30, d: 'Carpet-socks times a thousand.' },
  chill: { n: 'Chill', t: 'GHOST', p: 40, pri: 1, d: 'A cold shiver. Strikes first.' },
  spook: { n: 'Spook', t: 'GHOST', p: 50, fAtk: -1, ch: 30, d: 'Boo! May lower ATK.' },
  hex: { n: 'Hex', t: 'GHOST', p: 70, d: 'Eerie energy.' },
  nightmare: { n: 'Nightmare', t: 'GHOST', p: 95, acc: 85, d: 'The stuff of bad dreams.' },
  wail: { n: 'Wail', t: 'GHOST', p: 0, fDef: -1, d: "Lowers the foe's DEF." },
  flatliner: { n: 'Flatliner', t: 'GHOST', p: 85, d: 'Beeeeeeeeep.' },
  toll: { n: 'Toll', t: 'GHOST', p: 90, fAtk: -1, ch: 20, d: 'DONG.' },
  knell: { n: 'Knell', t: 'GHOST', p: 0, sAtk: 1, d: 'Raises ATK.' },
  grab: { n: 'Grab', t: 'ROT', p: 40, d: 'Grabby hands.' },
  zbite: { n: 'Zombie Nibble', t: 'ROT', p: 55, inf: 25, d: 'May cause the Icks.' },
  moan: { n: 'Moan', t: 'ROT', p: 0, fAtk: -1, d: "Uuuuugh. Lowers the foe's ATK." },
  slimeball: { n: 'Slime Ball', t: 'ROT', p: 50, inf: 20, d: 'Gross. May cause the Icks.' },
  ooze: { n: 'Ooze', t: 'ROT', p: 70, d: 'A wave of goo.' },
  toxicspill: { n: 'Stink Spill', t: 'ROT', p: 80, acc: 90, inf: 40, d: 'So, so stinky.' },
  belch: { n: 'Belch', t: 'ROT', p: 65, inf: 40, d: 'Excuse you.' },
  mysterymeat: { n: 'Mystery Meat', t: 'ROT', p: 60, inf: 30, d: "Nobody knows what's in it." },
  malpractice: { n: 'Bad Medicine', t: 'ROT', p: 90, inf: 30, d: 'Not what the doctor ordered.' },
  deadring: { n: 'Dead Ringer', t: 'ROT', p: 100, acc: 90, d: 'A terrible clang.' },
  whistle: { n: 'Whistle', t: 'FERAL', p: 0, sAtk: 1, d: 'TWEEEET! Raises ATK.' }
};

// b: [hp, atk, def, spd]; ls: learnset; evo: [level, into]; rate: befriend chance; xp: yield
const SPECIES = {
  scrapup: { n: 'Scrapup', t: 'GRIT', b: [45, 50, 55, 40], evo: [16, 'junkhound'], rate: .5, xp: 62, desc: 'A junkyard pup made of spare parts. Loyal. Squeaky.',
    ls: [[1, 'tackle'], [5, 'rustbite'], [8, 'guardup'], [12, 'bite'], [15, 'scraptoss'], [23, 'ironslam'], [30, 'crush']] },
  junkhound: { n: 'Junkhound', t: 'GRIT', b: [65, 78, 88, 55], rate: .2, xp: 140, desc: 'Fetches hubcaps. Buries them. Forgets where.' },
  sporkle: { n: 'Snapvine', t: 'BLOOM', b: [50, 50, 48, 48], evo: [16, 'mycolossus'], rate: .5, xp: 62, desc: 'A baby flytrap that grew legs. Bites first. Asks questions never.',
    ls: [[1, 'bite'], [5, 'sporepuff'], [8, 'photosnack'], [12, 'thornjab'], [15, 'vinewhip'], [23, 'fungalboom'], [30, 'leech']] },
  mycolossus: { n: 'Jawbloom', t: 'BLOOM', b: [82, 78, 72, 54], rate: .2, xp: 140, desc: 'Its jaws can snap a stop sign in half. Mostly it snaps snacks.' },
  zaprat: { n: 'Zaprat', t: 'SPARK', b: [40, 55, 40, 65], evo: [16, 'voltvermin'], rate: .5, xp: 62, desc: 'Lived in an arcade machine. Still hums the theme song.',
    ls: [[1, 'scratch'], [5, 'staticzap'], [8, 'quicknip'], [12, 'flicker'], [15, 'arcflash'], [23, 'thunderclap'], [30, 'overload']] },
  voltvermin: { n: 'Voltvermin', t: 'SPARK', b: [60, 86, 56, 95], rate: .2, xp: 140, desc: 'Can charge a phone. There is nobody to call.' },
  gnawbie: { n: 'Gnawbie', t: 'FERAL', b: [45, 55, 40, 55], evo: [18, 'trashking'], rate: .7, xp: 55, desc: 'A raccoon-ish bandit. Will steal your sandwich.',
    ls: [[1, 'scratch'], [4, 'bite'], [8, 'snarl'], [13, 'rockroll'], [17, 'frenzy'], [25, 'dumpster'], [31, 'maul']] },
  trashking: { n: 'Trashking', t: 'FERAL', b: [76, 86, 62, 70], rate: .25, xp: 135, desc: 'Ruler of all bins. Wears a crown of bottle caps.' },
  thornpup: { n: 'Thornpup', t: 'BLOOM', b: [55, 50, 55, 35], evo: [20, 'brambleback'], rate: .7, xp: 55, desc: 'Half puppy, half hedge. Do not pet backwards.',
    ls: [[1, 'tackle'], [4, 'thornjab'], [9, 'guardup'], [14, 'bite'], [18, 'brambleroll'], [24, 'photosnack'], [30, 'fungalboom']] },
  brambleback: { n: 'Brambleback', t: 'BLOOM', b: [84, 78, 86, 42], rate: .25, xp: 135, desc: 'A living hedge maze with opinions.' },
  dustmoth: { n: 'Dustmoth', t: 'GHOST', b: [42, 50, 40, 62], evo: [22, 'gloomwing'], rate: .6, xp: 58, desc: 'Flutters around porch lights that no longer work.',
    ls: [[1, 'peck'], [5, 'spook'], [10, 'wail'], [16, 'hex'], [22, 'divebomb'], [28, 'nightmare']] },
  gloomwing: { n: 'Gloomwing', t: 'GHOST', b: [66, 82, 60, 88], rate: .2, xp: 140, desc: 'Its wings look like the night sky. The scary bit.' },
  wispkin: { n: 'Wispkin', t: 'GHOST', b: [50, 68, 42, 78], rate: .4, xp: 85, desc: 'A friendly little flame. Giggles in the dark.',
    ls: [[1, 'chill'], [6, 'spook'], [12, 'flicker'], [18, 'hex'], [24, 'wail'], [29, 'nightmare']] },
  boltbug: { n: 'Boltbug', t: 'SPARK', b: [48, 52, 62, 55], rate: .6, xp: 70, desc: 'A beetle with a lightbulb. Great for reading under blankets.',
    ls: [[1, 'tackle'], [4, 'staticzap'], [9, 'guardup'], [13, 'flicker'], [18, 'arcflash'], [26, 'overload']] },
  rubblet: { n: 'Rubblet', t: 'GRIT', b: [60, 50, 70, 20], evo: [22, 'bouldozer'], rate: .6, xp: 60, desc: 'A rock that woke up one day and decided to have a face.',
    ls: [[1, 'tackle'], [5, 'rockroll'], [9, 'guardup'], [15, 'scraptoss'], [21, 'ironslam'], [28, 'crush']] },
  bouldozer: { n: 'Bouldozer', t: 'GRIT', b: [92, 84, 104, 28], rate: .2, xp: 145, desc: 'Moves slowly. Moves EVERYTHING.' },
  gloop: { n: 'Gloop', t: 'ROT', b: [60, 45, 50, 30], evo: [22, 'gloopzilla'], rate: .6, xp: 58, desc: 'A friendly ooze. Hugs are... damp.',
    ls: [[1, 'grab'], [4, 'slimeball'], [9, 'moan'], [14, 'ooze'], [20, 'leech'], [26, 'toxicspill']] },
  gloopzilla: { n: 'Gloopzilla', t: 'ROT', b: [96, 76, 78, 38], rate: .2, xp: 145, desc: 'Fifty gallons of pure friendship.' },
  murdle: { n: 'Murdle', t: 'FERAL', b: [50, 66, 44, 78], rate: .5, xp: 80, desc: 'A very smart crow. Knows it. Smug.',
    ls: [[1, 'peck'], [5, 'quicknip'], [10, 'snarl'], [15, 'frenzy'], [21, 'divebomb'], [27, 'hex']] },
  krush: { n: 'Krush', t: 'GRIT', b: [100, 92, 108, 30], rate: 0, xp: 220, scale: 1.3, desc: 'The junkyard car-crusher. It was just lonely.',
    ls: [[1, 'rockroll'], [1, 'guardup'], [1, 'scraptoss'], [1, 'crush']] },
  // ---- zombies (cannot be befriended)
  shambler: { n: 'Shambler', t: 'ROT', z: 1, b: [50, 48, 45, 20], xp: 55, ls: [[1, 'grab'], [4, 'moan'], [6, 'zbite'], [18, 'ooze'], [26, 'toxicspill']] },
  sprinter: { n: 'Sprinter', t: 'ROT', z: 1, b: [42, 58, 36, 75], xp: 60, ls: [[1, 'scratch'], [5, 'lunge'], [8, 'zbite'], [16, 'frenzy'], [24, 'maul']] },
  lunchlady: { n: 'Lunch Zombie', t: 'ROT', z: 1, b: [72, 55, 60, 25], xp: 80, ls: [[1, 'ladle'], [1, 'mysterymeat'], [1, 'moan']] },
  hazmat: { n: 'Hazmat', t: 'ROT', z: 1, b: [65, 58, 75, 30], xp: 70, ls: [[1, 'grab'], [1, 'slimeball'], [1, 'guardup'], [18, 'toxicspill'], [24, 'ooze']] },
  bloater: { n: 'Bloater', t: 'ROT', z: 1, b: [95, 52, 42, 15], xp: 75, ls: [[1, 'grab'], [1, 'belch'], [1, 'moan'], [20, 'ooze']] },
  clanker: { n: 'Clanker', t: 'GRIT', z: 1, b: [70, 75, 95, 35], xp: 85, ls: [[1, 'rockroll'], [1, 'guardup'], [1, 'ironslam'], [1, 'hex']] },
  butler: { n: 'The Butler', t: 'GHOST', z: 1, b: [80, 80, 70, 60], xp: 160, ls: [[1, 'servesup'], [1, 'zbite'], [1, 'polish'], [1, 'hex']] },
  coach: { n: 'Coach Krunk', t: 'ROT', z: 1, b: [85, 68, 58, 45], xp: 150, scale: 1.2, ls: [[1, 'whistle'], [1, 'dodgeball'], [1, 'laps'], [1, 'zbite']] },
  mallcop: { n: 'Officer Scoot', t: 'ROT', z: 1, b: [90, 76, 74, 55], xp: 170, scale: 1.2, ls: [[1, 'segwayram'], [1, 'shock'], [1, 'zbite'], [1, 'guardup']] },
  flatline: { n: 'Dr. Flatline', t: 'ROT', z: 1, b: [95, 88, 75, 65], xp: 200, scale: 1.2, ls: [[1, 'scalpel'], [1, 'malpractice'], [1, 'flatliner'], [1, 'moan']] },
  bellringer: { n: 'The Bellringer', t: 'GHOST', z: 1, b: [120, 98, 90, 70], xp: 300, scale: 1.4, ls: [[1, 'toll'], [1, 'deadring'], [1, 'knell'], [1, 'nightmare']] }
};
for (const id in SPECIES) { const s = SPECIES[id]; s.id = id; if (s.evo) { const e = SPECIES[s.evo[1]]; if (!e.ls) e.ls = s.ls; } }

const ITEMS = {
  snack: { n: 'Critter Snack', price: 20, d: 'Toss to a wild critter to make friends.' },
  juice: { n: 'Juice Box', price: 15, heal: 30, d: 'Heals 30 HP.' },
  soda: { n: 'Zap Cola', price: 40, heal: 80, d: 'Heals 80 HP.' },
  slush: { n: 'Mega Slush', price: 90, heal: 9999, d: 'Heals ALL HP. Brain freeze included.' },
  wipes: { n: 'Wet Wipes', price: 15, cure: 1, d: 'Cures the Icks and stuns.' },
  salts: { n: 'Smelly Sock', price: 70, revive: .5, d: 'Wakes up a knocked-out critter. Pee-yew.' }
};

const BADGES = {
  first: ['First Friend', 'Made a monster buddy.'],
  brain10: ['Big Brain', 'Answered 10 questions right.'],
  brain50: ['Bigger Brain', 'Answered 50 questions right.'],
  brain150: ['Galaxy Brain', 'Answered 150 questions right.'],
  streak5: ['On Fire', 'Got 5 right in a row.'],
  streak10: ['Unstoppable', 'Got 10 right in a row.'],
  master1: ['Star Student', 'Mastered a skill in Study Hall.'],
  master5: ['Professor', 'Mastered 5 skills.'],
  friends5: ['Monster Whisperer', 'Befriended 5 kinds of critter.'],
  friends10: ['Zookeeper', 'Befriended 10 kinds of critter.'],
  evo: ['Glow Up', 'A critter evolved.'],
  coach: ['Gym Class Hero', 'Out-dodged Coach Krunk.'],
  mall: ['Mall Rat', 'Cleared the Wexler Galleria.'],
  junk: ['Junkyard Dog', 'Calmed the Krusher.'],
  squad: ['Squad Goals', 'Got the whole crew together.'],
  air: ['On the Air', 'Sent the broadcast.'],
  house: ['House Call', 'Went to the hospital. Finally.'],
  bell: ['For Whom the Bell Tolls', 'Silenced the Last Bell.'],
  rescue1: ['Search Party', 'Answered a signal and brought a kid home.'],
  rescue10: ['Night Watch', 'Rescued 10 kids.'],
  rescue25: ['Lighthouse', 'Rescued 25 kids. The Nest is a town now.'],
  ace: ['Test Ace', 'Scored 9 or 10 on a practice test.'],
  grad: ['Moving Up', 'Mastered every skill in a grade.'],
  comics: ['Collector', 'Found all 8 Captain Cosmos comics.']
};
const BRAIN_RANKS = [[0, 'Zombie Bait'], [10, 'Rookie'], [25, 'Sidekick'], [50, 'Brainiac'], [90, 'Mastermind'], [140, 'Mega Mind'], [200, 'Galaxy Brain'], [300, 'LEGEND']];
const brainRank = n => { let r = BRAIN_RANKS[0][1]; for (const [k, v] of BRAIN_RANKS) if (n >= k) r = v; return r; };

const CREW = {
  priya: { n: 'Priya', role: 'The Inventor', ab: 'Gadget Scan', abd: "Shows the foe's weakness and lowers its DEF.", bio: 'Science-fair champion. Builds things out of other things. Was your best friend, once.' },
  bash: { n: 'Bash', role: 'The Wall', ab: 'Body Block', abd: 'Blocks the next hit on your critter.', bio: 'Used to be the scariest kid in eighth grade. Now he waters ferns.' },
  wren: { n: 'Wren', role: 'The Runner', ab: 'Second Wind', abd: 'Heals your critter and cures the Icks.', bio: 'Fastest kid in the county. Trusts her legs more than people.' }
};

// ---- critter helpers
const xpFor = l => Math.floor(0.8 * l * l * l);
function movesAt(sp, lvl) { return SPECIES[sp].ls.filter(m => m[0] <= lvl).map(m => m[1]).slice(-4); }
function maxHp(c) { return Math.floor(SPECIES[c.sp].b[0] * 2 * c.lvl / 100) + c.lvl + 10; }
function statOf(c, k) { const i = { atk: 1, def: 2, spd: 3 }[k]; return Math.floor(SPECIES[c.sp].b[i] * 2 * c.lvl / 100) + 5; }
function evolved(sp, lvl) { while (SPECIES[sp].evo && lvl >= SPECIES[sp].evo[0] + 2) sp = SPECIES[sp].evo[1]; return sp; }
function makeCritter(sp, lvl) {
  const c = { sp, lvl, xp: xpFor(lvl), moves: movesAt(sp, lvl), status: null };
  c.hp = maxHp(c); return c;
}
const cname = c => c.nick || SPECIES[c.sp].n;
