// ============================================================ CREW SIDE-STORIES
// Four short story lines on the Quest Board, one per crew member, opened in order as they join.
// Each has five steps; a new step comes up the day after the last one was finished (the crew member radios in).
// The last step leaves something that lasts: Bash's garden, Priya's radar, Wren's sneakers, Gale's whistle.
// A step is an ordinary quest (visit a place, befriend, defeat, answer, fly) with q.story = line and q.step = index.
OB.garden = function () { rr(10, 56, 80, 34, 6, '#7a5230'); rr(14, 60, 72, 24, 4, '#5a3a22');
  for (const [x, y, c] of [[24, 58, '#3fae5a'], [40, 54, '#2f9a4a'], [58, 57, '#3fae5a'], [74, 55, '#2f9a4a']]) { ln([x, 74, x - 8, y - 6], c, 4); ln([x, 74, x + 7, y - 8], c, 4); ln([x, 74, x, y - 12], c, 4); }
  for (const [x, y, c] of [[32, 50, '#ff9ad0'], [50, 46, '#ffd24a'], [66, 50, '#ff9ad0']]) { dot(x, y, 6, c); dot(x, y, 2.4, '#fff6b0'); }
  glow(50, 60, 40, '#a8ffb8', .25); };
const QGARDEN = (() => { const M = MAPS.world.m; for (const [x, y] of [[39, 63], [43, 63], [39, 62], [43, 62], [38, 63], [44, 63]]) if ('.:=-,'.includes(M.get(x, y)) && !ENT.some(e => e.map === 'world' && e.x === x && e.y === y)) { M.set(x, y, '.'); return [x, y]; } return [43, 63]; })();
E({ map: 'world', x: QGARDEN[0], y: QGARDEN[1], spr: 'garden', if: () => flag('gardenDone'), act: () => Crew.garden() });

// Granny Dot: the hero's own grandma (her skin follows the chosen hero, like Mom's)
HUM.granny = { skin: '#a86b42', hair: '#eeeef6', style: 'bun', jacket: '#c07ab0', shirt: '#fff6e8', pants: '#6a5a8a', shoes: '#8a5a3a', specs: 1, lash: 1, eye: '#5a3a1e' };
SPEAKERS.granny = { n: 'Granny Dot', spr: 'granny', col: '#ffb8e0' };
const QGRANNY = (() => { const M = MAPS.world.m; for (const [x, y] of [[44, 62], [38, 62], [44, 61], [38, 61], [45, 63], [37, 63]]) if ('.:=-,'.includes(M.get(x, y)) && !ENT.some(e => e.map === 'world' && e.x === x && e.y === y) && !(x === QGARDEN[0] && y === QGARDEN[1])) { M.set(x, y, '.'); return [x, y]; } return [44, 62]; })();
E({ map: 'world', x: QGRANNY[0], y: QGRANNY[1], spr: 'granny', if: () => flag('grannyHome'), act: () => Crew.granny() });

// spots: 0 junkyard office, 4 downtown, 6 the harbor, 1 Elm Street, 2 Pembry Park, 3 school yard, 5 the Lost Lot, 9 Radio Hill, 11 Maple Court
const SIDE = {
  granny: { who: 'granny', flag: 'grannyHome', n: "Granny Dot's Kitchen", open: () => flag('starter'), steps: [
    { kind: 'visit', spot: 6, title: 'A voice on the walkie', text: 'Someone who sounds a LOT like Granny Dot is calling from the harbor. Go and see!',
      call: 'Hello? Is this thing on? This is Granny Dot! Is that my favourite grandkid? I am at the harbor, sweetheart. Come and give your granny a hug!',
      at: [['granny', '@N! Look at you! You have grown a whole foot. Come here. Hug first, questions later.'], ['granny', 'When the sky went green I locked myself in the harbor bakery with a bag of flour and my rolling pin. Nobody bites a granny with a rolling pin.'], ['granny', 'I have been baking for every lost kid who wanders past. But I am running low on everything. Will you help your granny?']] },
    { kind: 'right', need: 15, title: 'Recipe math', text: 'Granny Dot is doubling her cookie recipe. Help her with 15 right answers.',
      call: 'Sweetheart, I need to make TWICE as many cookies, and my glasses keep fogging up. Help me with the numbers?',
      done: [['granny', 'Two cups and two cups is four cups. You always were the clever one. Do not tell your cousins I said that.']] },
    { kind: 'visit', spot: 4, title: 'A sack of flour', text: 'Granny Dot needs flour. There is a sack in the old grocery downtown.',
      call: 'I am out of flour! There is a sack at the old grocery downtown. Carry it carefully, it is heavier than it looks.',
      at: [[null, 'Behind the grocery counter: a big sack of flour with a sticky note. "DOT\'S. HANDS OFF."'], ['granny', '(on the walkie) Found it? That is my flour! I hid it there before the Green Night. Bring it home, sweetheart.']] },
    { kind: 'defeat', need: 3, title: 'Cookie guards', text: 'The smell of baking is drawing a crowd. Win 3 battles to protect Granny Dot\'s kitchen.',
      call: 'The cookies smell so good the zombies are lining up at the window. I will keep baking. You keep them busy!',
      done: [['granny', 'My hero. Here, have a cookie. Have two. You are too skinny.']] },
    { kind: 'visit', spot: 11, title: 'Granny moves in', text: 'Granny Dot is moving into the Nest. Meet her on Maple Court and help carry her things.',
      call: 'I have been thinking. A Nest full of kids needs a granny. Meet me on Maple Court and help me with my bags.',
      at: [['granny', 'There. My rocking chair, my rolling pin, and my second-best oven mitt.'], ['granny', 'I will be right here by the Nest. Come and see me every day. I will always have cookies, and I will always be proud of you.']] }],
    finale: async () => { await say(null, '★ GRANNY DOT MOVED INTO THE NEST ★\nVisit her once a day for cookies (2 Critter Snacks) and a hug.', { col: '#ffd76a' }); logAdd('GRANNY DOT IS ALIVE. She was baking cookies at the harbor the whole time. She moved into the Nest. She brought her rolling pin. Nobody messes with Granny Dot.'); } },
  bash: { who: 'bash', flag: 'gardenDone', n: "Grandma's Garden", open: () => flag('bash'), steps: [
    { kind: 'visit', spot: 5, title: "Grandma's seed tin", text: 'Bash thinks his grandma hid a tin of seeds at the Lost Lot. Meet him there.',
      call: "Hey. It's Bash. Don't laugh. My grandma used to keep a tin of seeds at the Lost Lot. If it's still there... meet me?",
      at: [['bash', 'Found it! Look. "For Bash. Plant these where people need cheering up. Love, Grandma."'], ['bash', "I'm gonna build her garden. At the Nest. Will you help?"]] },
    { kind: 'hunt', sp: 'thornpup', title: 'Garden guards', text: 'Thornpups chase beetles off young plants. Befriend one to guard the garden.',
      call: 'Beetles keep eating the sprouts. Grandma always said Thornpups make the best garden guards. Can you befriend one?',
      done: [['bash', "A real garden guard! Look at it sniff everything. It's perfect."]] },
    { kind: 'right', need: 15, title: 'Planting math', text: 'Bash has to space the seeds just right. Help him with 15 right answers.',
      call: 'The seed packet says plant them in rows, so far apart, so deep... it is a LOT of numbers. Brain help?',
      done: [['bash', 'Every seed in its row. Grandma would say I finally did my homework.']] },
    { kind: 'defeat', need: 3, title: 'Night stompers', text: 'Something keeps trampling the beds at night. Win 3 battles to scare them off.',
      call: "Someone stomped half the beds flat last night. Big muddy footprints. I'm not crying, YOU'RE crying. Help?",
      done: [['bash', 'Nobody stomps on these ferns. Not on my watch. Not on OUR watch.']] },
    { kind: 'visit', spot: 11, title: 'First bloom', text: 'Bash has something to show you on Maple Court, right by the Nest.',
      call: 'Get over to Maple Court. Right now. You have to see this.',
      at: [['bash', 'Look. LOOK. Everything bloomed overnight. Grandma\'s garden.'], ['bash', 'Whenever the team is hurt, come sit in it. Ferns fix everything. Grandma said so.']] }],
    finale: async () => { await say(null, '★ GRANDMA\'S GARDEN ★\nA garden grows by the Nest. Visit it once a day: it heals your team and gives you a Potion.', { col: '#ffd76a' }); logAdd('Bash planted his grandma\'s garden by the Nest. He named every single fern. One of them is named after me.'); } },
  priya: { who: 'priya', flag: 'radarDone', n: 'The Big Antenna', open: () => flag('priya'), steps: [
    { kind: 'visit', spot: 0, title: 'Copper wire', text: 'Priya needs copper wire from the junkyard office for a bigger antenna.',
      call: "Priya here. I want to build a BIGGER antenna. Like, find-everyone-in-the-whole-county big. I need copper wire from the junkyard office.",
      at: [['priya', 'A whole spool! Do you know how rare unchewed wire is? Zombies LOVE chewing wire.']] },
    { kind: 'defeat', t: 'SPARK', need: 3, title: 'Charge it up', text: 'The antenna battery needs sparks. Win 3 battles against SPARK-type critters.',
      call: 'The battery is flat. SPARK critters give off little zaps when you beat them. I can catch the zaps in a jar. Science!',
      done: [['priya', 'Battery at one hundred percent. My jar is humming. Do not touch the jar.']] },
    { kind: 'right', need: 20, title: 'Tuning the frequency', text: 'Help Priya tune the antenna: 20 right answers.',
      call: 'Now I have to tune it. It is all numbers and patterns. Twenty right answers and we lock the frequency in.',
      done: [['priya', 'Locked in. Hear that hiss? That is the sound of the WHOLE county.']] },
    { kind: 'visit', spot: 9, title: 'Up on Radio Hill', text: 'Meet Priya on Radio Hill to bolt the antenna on.',
      call: 'It is built. Meet me on Radio Hill and hold the ladder. Please hold the ladder.',
      at: [['priya', 'Bolted on. Okay. Switching it on in three, two...'], ['priya', 'IT WORKS. I can pick up walkie chatter from all over town!']] },
    { kind: 'signals', need: 1, title: 'First call', text: 'Test the new antenna: answer a night signal from the Nest or a campfire.',
      call: 'Last test: answer a real signal on the new antenna. Somebody out there needs us.',
      done: [['priya', 'Crystal clear. We are going to find SO many more kids now.']] }],
    finale: async () => { await say(null, "★ PRIYA'S RADAR ★\nPriya's antenna picks up extra calls. From tomorrow, the Quest Board has a 4th quest every day.", { col: '#ffd76a' }); logAdd('Priya built an antenna that can hear the whole county. She let me press the ON button. I pressed it really well.'); } },
  wren: { who: 'wren', flag: 'shoesDone', n: "Wren's Big Race", open: () => flag('wren'), steps: [
    { kind: 'visit', spot: 3, title: 'The old track', text: 'Wren wants to show you something at the school yard.',
      call: "Wren. Before the Green Night I was going to run in the county race. I still want to beat my old time. Meet me at the school yard.",
      at: [['wren', 'This is where I trained. Every morning. Before anyone else was up.'], ['wren', 'Will you be my coach? Coaches do not run. Coaches yell helpful things.']] },
    { kind: 'visit', spot: 2, title: 'Warm-up lap', text: 'Coach Wren through a warm-up lap: meet her in Pembry Park.',
      call: 'Warm-up lap. Meet me in Pembry Park. Bring your yelling voice.',
      at: [['wren', 'Good warm-up. You yelled "GO WREN GO" eleven times. Very helpful.']] },
    { kind: 'streak', need: 5, title: 'Racer focus', text: 'Runners need focus. Get 5 answers right in a row.',
      call: 'Racers need focus. Show me five right in a row. No guessing. Breathe.',
      done: [['wren', 'That is it. That calm feeling. That is what the start line feels like.']] },
    { kind: 'defeat', need: 3, title: 'Clear the course', text: 'The race course is crawling. Win 3 battles to clear it.',
      call: 'Problem: the race course is full of critters and zombies. Clear it for me?',
      done: [['wren', 'Course is clear. Tomorrow is race day.']] },
    { kind: 'visit', spot: 1, title: 'Race day', text: 'Race day on Elm Street! Go cheer for Wren.',
      call: 'Race day. Elm Street. Do not be late. Coaches are never late.',
      at: [['wren', 'On your marks...'], [null, 'Wren flies down Elm Street like the wind is pushing her. She crosses the old chalk finish line and throws her arms up.'], ['wren', 'A new best time! By FOUR seconds!'], ['wren', 'Here. My spare racing sneakers. They are lucky. You will be fast in them.']] }],
    finale: async () => { await say(null, "★ WREN'S RACING SNEAKERS ★\nYou walk faster everywhere now.", { col: '#ffd76a' }); logAdd('Wren beat her old record by four seconds. She gave me her lucky sneakers. I am going to be SO fast.'); } },
  gale: { who: 'gale', flag: 'galeWhistle', n: "Gale's Lost Feathers", open: () => flag('skyFirst'), sky: true, steps: [
    { kind: 'skyvisit', isle: 'gust', title: 'Feathers on the wind', text: 'The storm blew off three of Gale\'s feathers. Fly to the Gust Shrine and look.',
      call: 'Little rider. The storm took three of my oldest feathers. I think the wind dropped one by the Gust Shrine.',
      done: [[null, 'Caught in the wind statue: a grey feather as long as your arm.'], ['gale', 'One. My grandmother gave me that feather. Thank you.']] },
    { kind: 'rings', need: 6, title: 'Chasing the wind', text: 'The second feather is riding the wind. Fly through 6 right Sky Rings to catch it.',
      call: 'The second is riding the high wind. Fly through the rings and you will catch it.',
      done: [['gale', 'Two. You fly like you were born up here.']] },
    { kind: 'right', need: 15, title: "Gale's riddles", text: 'Gale tells stories full of riddles. Answer 15 questions right.',
      call: 'While we look, an old dragon likes to tell stories. Answer my riddles: fifteen right.',
      done: [['gale', 'Clever. My riddles have stumped storms.']] },
    { kind: 'visit', spot: 9, title: 'Down to Radio Hill', text: 'The last feather fell into town. Meet Gale on Radio Hill.',
      call: 'The last one fell all the way down to your town. Meet me on Radio Hill.',
      at: [[null, 'Stuck in the radio tower: the third feather.'], ['gale', 'Three. Now I am whole again.']] },
    { kind: 'skyvisit', isle: 'roost', title: 'A gift on Roost Rock', text: 'Gale has a gift for you on Roost Rock.',
      call: 'Come up to Roost Rock. I have something for you.',
      done: [['gale', 'I carved this whistle from my own feather. Blow it at any campfire, and I will come.']] }],
    finale: async () => { await say(null, "★ GALE'S WHISTLE ★\nAt any campfire in town, choose 'Whistle for Gale' to fly.", { col: '#ffd76a' }); logAdd('Gale carved me a whistle out of her own feather. A DRAGON gave me a present.'); } }
};
const SIDE_ORDER = ['granny', 'bash', 'priya', 'wren', 'gale'];

const Crew = {
  S() { const Q = Quests.S(); return Q.side || (Q.side = { line: null, step: 0, wait: -99, done: [], q: null }); },
  q() { return G && G.quests && G.quests.side ? G.quests.side.q : null; },
  // a step as a quest: the usual quest kinds, with the crew member's words on top
  make(line, i) {
    const L = SIDE[line], st = L.steps[i], Q = Quests.S(), id = 'q' + (++Q.n), rw = { scrap: 60 + i * 20, item: i === 4 ? 'slush' : 'potion', qty: 1 }; let q = null;
    if (st.kind === 'visit') q = { id, kind: 'visit', spot: st.spot, who: st.who || L.who, need: 1, prog: 0 };
    else if (st.kind === 'hunt') { const hp = Quests.habitat(e => e === st.sp); q = { id, kind: 'hunt', sp: st.sp, x: hp && hp[0], y: hp && hp[1], v2: 1, need: 1, prog: 0 }; }
    else if (st.kind === 'defeat' && st.t) { const hp = Quests.habitat(e => SPECIES[e] && SPECIES[e].t === st.t); q = hp ? { id, kind: 'defeat', t: st.t, x: hp[0], y: hp[1], v2: 1, need: st.need, prog: 0 } : null; }
    else if (st.kind === 'skyvisit') q = { id, kind: 'skyvisit', isle: st.isle, need: 1, prog: 0 };
    if (!q) { q = Quests.make(st.kind, new Set(this.reserved()), false); if (!q) return null; q.id = id; if (st.need) q.need = st.need; delete q.dragon; }
    return Object.assign(q, { story: line, step: i, title: `★ ${CREW_NAME(L.who)}: ${st.title}`, text: st.text, reward: rw, prog: 0 });
  },
  reserved() { const q = this.q(); return q && q.spot != null && !q.done ? [q.spot] : []; },
  // the next step comes up the day after the last one; a new story opens when its crew member is around
  ensure() {
    if (!G || !flag('starter')) return; const S = this.S(), d = Quests.day();
    if (S.q && !S.q.done) return; if (S.wait >= d) return;
    if (!S.line) { S.line = SIDE_ORDER.find(k => !S.done.includes(k) && SIDE[k].open()) || null; S.step = 0; if (!S.line) return; }
    const q = this.make(S.line, S.step); if (!q) return; S.q = q; Quests.sync();
  },
  async intro() { const q = this.q(); if (!q || q.told || q.done) return; q.told = 1; const st = SIDE[q.story].steps[q.step]; Snd.sfx('blip');
    await say(SIDE[q.story].who, `${q.step === 0 ? '(on the walkie) ' : ''}${st.call}`); toast('New crew story on the Quest Board!'); },
  async visit(q) { const st = SIDE[q.story].steps[q.step]; for (const [w, t] of st.at) await say(w, t); q.prog = 1; Quests.complete(q); Quests.sync(); await Quests.announce(); },
  // after the QUEST COMPLETE line: the crew member's words, and the finale after the last step
  // the moment a step is done: the story moves on (and a finished story's reward is given), even if the app closes before the words
  advance(q) {
    const S = this.S(), L = SIDE[q.story]; if (S.q !== q) return false;
    S.step++; S.wait = Quests.day(); S.q = null; if (S.step < L.steps.length) return false;
    S.done.push(S.line); S.line = null; S.step = 0; setFlag(L.flag); if (typeof PlayLog !== 'undefined') PlayLog.add('sidestory', { line: q.story }); return true;
  },
  // afterwards, when the QUEST COMPLETE line is shown: the crew member's words, and the finale
  async after(it) {
    const q = it.q, L = SIDE[q.story], st = L.steps[q.step];
    if (st.done) for (const [w, t] of st.done) await say(w, t);
    if (it.last) { Snd.sfx('levelup'); await L.finale(); await badge('sidestory'); }
    else await say(null, `${CREW_NAME(L.who)} will call tomorrow with the next part of "${L.n}".`, { col: '#9fe0ff' });
  },
  async granny() {
    const D = dayState(), line = pick(['I am so proud of you, sweetheart. Now eat something.', 'Your mother used to count on her fingers too. Look how fast you are!', 'Every right answer is a little brick in a big strong house. Keep building.', 'Wear a jacket. The zombies are bad enough without you catching a cold.', 'You are braver than all of them. Even Bash. Do not tell Bash.', 'Reading is like a cookie for your brain. Have another one.']);
    if (D.granny) { await say('granny', line); return; }
    D.granny = 1; give('snack', 2, true); Snd.sfx('heal'); await say('granny', 'There is my favourite grandkid! Fresh cookies. Your critters can have some too.'); await say(null, 'Granny Dot gives you 2 Critter Snacks and a big squishy hug.'); await say('granny', line);
  },
  async garden() {
    const D = dayState(); if (D.garden) { await say(null, 'The garden is resting. The ferns sway like they are waving at you. Come back tomorrow.'); return; }
    D.garden = 1; healAll(); give('potion', 1, true); Snd.sfx('heal'); await say('bash', 'Sit, sit. Ferns fix everything.'); await say(null, 'Your team is fully healed, and Bash hands you a Potion from the garden shed.');
  },
  init() {
    SPEAKERS.gale = SPEAKERS.gale || { n: 'Grandmother Gale', spr: 'gale', human: false, col: '#c8d8ff' };
    Quests.reserved = () => this.reserved();
    BADGES.sidestory = ['Good Friend', 'Finished a crew story.'];
    { const o = Quests.all.bind(Quests); Quests.all = () => { const q = Crew.q(); return (q ? [q] : []).concat(o()); }; }   // the story quest first: it wins a shared spot
    { const o = Quests.spotAct.bind(Quests); Quests.spotAct = async function (i) { const q = Quests.at(i); if (q && q.kind === 'visit') return Crew.visit(q); return o(i); }; }
    { const o = Quests.complete.bind(Quests); Quests.complete = function (q) { const r = o(q); if (q.story) (Crew.after_ = Crew.after_ || []).push({ q, last: Crew.advance(q) }); return r; }; }
    { const o = Quests.announce.bind(Quests); Quests.announce = async function () { await o(); while (Crew.after_ && Crew.after_.length) await Crew.after(Crew.after_.shift()); }; }
    { const o = Quests.refresh.bind(Quests); Quests.refresh = function () { const L0 = G && G.quests && G.quests.list, r = o(); const Q = Quests.S();
        // Priya's radar: a 4th daily quest
        if (flag('radarDone') && Q.list !== L0 && Q.list.length === 3) { const taken = new Set(Q.list.map(x => x.spot).filter(x => x != null).concat(Crew.reserved())), have = new Set(Q.list.map(x => x.kind)); let q = null; for (let t = 0; t < 8 && !q; t++) { const k = pick(['patrol', 'hunt', 'defeat', 'rescue', 'bounty', 'errand'].filter(k => !have.has(k))); q = Quests.make(k, taken); } if (q) { q.title = "Priya's pick: " + q.title; Q.list.push(q); } }
        Crew.ensure(); return r; }; }
    // the crew member radios in when the next step is up and the player is free
    { const o = arrive; arrive = function () { const r = o.apply(this, arguments); const q = Crew.q(); if (q && !q.told && !Script.n && G.map === 'world') script(() => Crew.intro()); return r; }; }
    { const o = welcomeBack; welcomeBack = async function () { await o.apply(this, arguments); Crew.ensure(); if (Crew.q() && !Crew.q().told) await Crew.intro(); }; }
  }
};
const CREW_NAME = w => w === 'gale' ? 'Gale' : (SPEAKERS[w] && SPEAKERS[w].n) || w;
window.addEventListener('DOMContentLoaded', () => { try { Crew.init(); } catch (e) { console.error('Crew stories wiring', e); } });
