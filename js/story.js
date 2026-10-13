'use strict';
SPEAKERS = {
  dex: { n: 'Dex', spr: 'dex', col: '#ffd76a' }, priya: { n: 'Priya', spr: 'priya', col: '#c8a0ff' },
  bash: { n: 'Bash', spr: 'bash', col: '#8fe08a' }, wren: { n: 'Wren', spr: 'wren', col: '#ff9a8a' },
  mom: { n: 'Mom', spr: 'mom', col: '#9fe8f0' }, munch: { n: 'Mr. Munch', spr: 'munch', human: false, col: '#ffb07a' },
  guide: { n: 'Field Guide', spr: 'comic', human: false, col: '#7fe0d8' }, radio: { n: 'Walkie-Talkie', col: '#9fe8f0' },
  coach: { n: 'Coach Krunk', spr: 'coach', human: false, col: '#b8e0a0' }, cop: { n: 'Officer Scoot', spr: 'mallcop', human: false, col: '#b8e0a0' },
  doc: { n: 'Dr. Flatline', spr: 'flatline', human: false, col: '#b8e0a0' }, butler: { n: 'The Butler', spr: 'butler', human: false, col: '#b8e0a0' },
  clank: { n: 'Old Clank', spr: 'clanker', human: false, col: '#c9d2de' }, newt: { n: 'Nana Newt', spr: 'newt', human: false, col: '#ffb07a' }, flick: { n: 'Professor Flicker', spr: 'flicker', human: false, col: '#9ff0e2' },
  bell: { n: 'The Bellringer', spr: 'bellringer', human: false, col: '#ff8a7a' }
};
const ENT = [];
const E = o => { if (o.solid == null) o.solid = true; ENT.push(o); return o; };
const COMICS = ['#1: Captain Cosmos vs. the Homework Hydra', '#2: The Cafeteria of Doom', '#3: Attack of the Fifty-Foot Hamster', '#4: Captain Cosmos Forgets His Lunch',
  '#5: Robots Need Hugs Too', '#6: The Ghost Who Was Bad at Hiding', '#7: Captain Cosmos Gets a Flu Shot', '#8: The Very Last Issue (Probably)'];

function stash(map, x, y, id, items, scrap) {
  E({ map, x, y, spr: 'stash', if: () => !flag('st_' + id), act: async () => {
    await say(null, 'A survivor stash! It has a BRAIN LOCK on it. Answer the question to pop it open.');
    for (let tries = 1; !(await Learn.quiz('BRAIN LOCK')); tries++) {
      if (tries >= 3) { await say(null, 'The lock sighs. "Fine. You tried really hard. That counts." CLICK.'); break; }
      await say(null, 'BZZT. The lock scrambles and asks a new question.');
    }
    setFlag('st_' + id); Snd.sfx('levelup');
    const got = [];
    for (const k in items) { give(k, items[k], true); got.push(`${items[k]} ${ITEMS[k].n}${items[k] > 1 ? 's' : ''}`); }
    if (scrap) { G.scrap += scrap; got.push(scrap + ' scrap'); }
    await say(null, 'CLICK! Found ' + got.join(', ') + '!');
  } });
}
function comic(map, x, y, n) {
  E({ map, x, y, spr: 'comic', if: () => !flag('comic' + n), act: async () => {
    setFlag('comic' + n); Snd.sfx('levelup');
    await say(null, `Found a comic book!\nCAPTAIN COSMOS ${COMICS[n - 1]}`);
    const c = COMICS.filter((_, i) => flag('comic' + (i + 1))).length;
    await say('dex', c < 8 ? `Sweet. That's ${c} of 8.` : "That's ALL EIGHT. I am officially the greatest collector in the apocalypse.");
    if (c >= 8) await badge('comics');
  } });
}
const sign = (map, x, y, txt) => E({ map, x, y, spr: 'sign', act: () => say(null, txt) });
const camp = (map, x, y) => E({ map, x, y, spr: 'fire', act: () => restMenu(false) });
function gate(map, x, y, sp, fl, fn, human) { E({ map, x, y, spr: sp, human, if: () => !flag(fl), act: async () => { if (typeof PlayLog !== 'undefined') PlayLog.add('gate', fl); await fn(); if (G.obj) await say(null, 'This way is shut for now. Follow the gold arrow instead: ' + G.obj); } }); }

// ------------------------------------------------------------ campfire talks (crew bonds)
const TALKS = [
  { id: 'p1', who: 'priya', ok: () => true, run: async () => {
    await say('priya', "You know what the worst part was? It wasn't that you skipped the science fair.");
    await say('priya', "It was that you didn't say anything. You just... weren't there.");
    const c = await ask('dex', '...', ["I was scared and didn't know how to say it.", 'Our volcano was going to lose anyway.']);
    if (c === 0) { await say('dex', "Mom had just started working nights. I figured if I never counted on anybody, nobody could let me down."); await say('priya', "That is the dumbest smart thing you have ever said."); await say('priya', "...Thanks for telling me."); return 2; }
    await say('priya', 'It was a WEATHER BALLOON, Dex.'); await say(null, "(She's laughing, though. First time in forty-two days.)"); return 1; } },
  { id: 'b1', who: 'bash', ok: () => true, run: async () => {
    await say('bash', 'That thing with the recycling bin. In sixth grade.'); await say('dex', 'The blue one. For paper. I remember.');
    await say('bash', "My big brother did stuff like that to me. I thought that's what big guys were for.");
    await say('bash', "Plants don't care how big you are. They just need you to show up. Every day.");
    const c = await ask('bash', "So. I'm sorry. For the bin.", ['Apology accepted.', 'You owe me one (1) bin ride.']);
    await say('bash', c === 0 ? 'Cool. ...Cool.' : 'Ha! Deal. After we save the town.'); return c === 0 ? 2 : 1; } },
  { id: 'w1', who: 'wren', ok: () => true, run: async () => {
    await say('wren', 'My old group had nine people. We had a van and a plan. Know what happened?'); await say('wren', 'Somebody sneezed.');
    await say('wren', "I'm fast, Dex. I got out because I didn't wait for anyone.");
    const c = await ask('dex', '...', ['You waited for us at the junkyard.', "Being fast isn't a crime."]);
    await say('wren', c === 0 ? "...Yeah. I did. Don't make me regret it." : "No. But it gets lonely out in front."); return c === 0 ? 2 : 1; } },
  { id: 'p2', who: 'priya', ok: () => flag('broadcast'), run: async () => {
    await say('priya', 'I kept a list. Everyone from homeroom. I check it against... the ones I see walking around.'); await say('priya', "It's a bad list, Dex.");
    await say('dex', "Then we start a new one. People we FOUND. It's got four names on it already."); await say('priya', 'Five. Tesla the Boltbug counts.'); return 1; } },
  { id: 'b2', who: 'bash', ok: () => flag('wren'), run: async () => {
    await say('bash', "I named all the ferns. Don't tell Wren."); await say('bash', "When this is over, I'm going to grow tomatoes on the roof of the Nest. Real ones. For everybody.");
    await say('dex', 'For everybody.'); await say(null, '(Huh. A month ago you would have said "for me.")'); return 1; } },
  { id: 'w2', who: 'wren', ok: () => flag('bellTolls'), run: async () => {
    await say('wren', "You went into that hospital. You didn't have to."); await say('dex', "Yeah, I did. I'd been not-looking for forty-two days.");
    await say('wren', 'My parents were on a plane to Tucson that night. I still check the sky sometimes. Dumb, right?');
    await say('dex', "Not dumb. We'll put it on the beacon: WREN IS HERE. COME FIND HER."); await say('wren', '...Okay, Captain. Okay.'); return 1; } }
];

// ------------------------------------------------------------ first-visit zone chatter
const ZONE_FIRST = {
  suburbs: async () => { await say('dex', 'Elm Street. Apocalypse Rule #2: Tall grass means critters. Or zombies. Or both.'); },
  lot: async () => { await say('dex', 'Lanterns? Out here? ...Is that a suit of armor selling SWORDS?'); await say('guide', 'FIELD GUIDE: The Night Market. Friendly monsters trade here, but never for scrap. Every item is won with a math challenge. Better items, harder math.'); },
  park: async () => { await say('dex', 'Pembry Park. The Boltbugs like the pond. Good place to make friends.'); },
  school: async () => { await say('dex', 'Wexler Middle School. I never thought I would break IN to this place.'); await say('dex', 'The floors are grimy in the halls. Zombies like grimy.'); },
  downtown: async () => { await say('dex', 'Downtown. The Galleria mall is straight ahead. Mega Battery, here we come.'); },
  mall: async () => { await say('priya', 'Electronics store is at the back, but the security shutter is down. We need the keycard.'); await say('dex', 'And the zombie holding the keycard is...?'); await say('priya', 'Riding a scooter. Security office, top right.'); },
  junk: async () => { await say('bash', "Krush & Sons. My uncle used to say the car crusher here was alive."); await say('dex', 'Your uncle sounds fun at parties.'); },
  woods: async () => { await say('wren', 'Whisperwood. Stay on the trail. The trees move when you are not looking.'); await say('dex', 'They do NOT.'); await say('wren', '...Probably not.'); },
  cemetery: async () => { await say('dex', 'Apocalypse Rule #12: Never go into a cemetery.'); await say('dex', "Rule #12b: Unless your friends are watching and you'd look like a chicken."); },
  radio: async () => { await say('priya', "There's the tower! If we can get the beacon up there, the whole county will hear us."); },
  hospital_d: async () => { await say('dex', 'County General. Mom worked the night shift here.'); await say(null, '(Your feet feel very heavy.)'); },
  harbor: async () => { await say('wren', 'The harbor. The ferry dock is at the end of the road.'); },
  grounds: async () => { await say('bash', 'Blackwood Manor. Nobody has lived here in a hundred years.'); await say('dex', "Somebody's home now."); },
  manor: async () => { await say(null, 'Somewhere far above, an organ is playing. Nobody is supposed to be here to play it.'); await say('dex', 'Brains on, everybody.'); }
};

// ------------------------------------------------------------ Night Watch: the endless part of the story
const KIDS = ['Milo', 'Zadie', 'Theo', 'Imani', 'Gus', 'Lucia', 'Omar', 'Pippa', 'Kenji', 'Nora', 'Dev', 'Ruby', 'Felix', 'Amara', 'Hank', 'Sol', 'Juno', 'Rafa', 'Tess', 'Ezra', 'Maya', 'Cole', 'Ines', 'Beck', 'Wyatt', 'Lila', 'Otis', 'Noor', 'Sam', 'Ivy'];
const KID_LINES = ['I hid in a vending machine for six days. I never want to see a pretzel again.', 'Is it true you have a car crusher that does tricks?', 'I thought I was the last kid on Earth!', 'I can whistle really loud. Is that useful? I feel like that is useful.', 'I brought my hamster. He is not negotiable.', 'You came. Somebody actually came.', 'I have been counting zombies to fall asleep. It does not work.', 'Do you have a bathroom? Asking for me.'];
const PLACES = [['the old arcade', 'street'], ['Pembry Park', 'grass'], ['the school library', 'indoor'], ['the junkyard office', 'junk'], ['the cemetery gates', 'spooky'], ["the Gas 'N' Gulp", 'street'], ['the mall food court', 'indoor'], ['the edge of Whisperwood', 'spooky'], ['the bowling alley', 'indoor'], ['the water treatment plant', 'junk']];
// ------------------------------------------------------------ the story
const Story = {
  // One night, one signal, one kid to bring home. Repeats forever, gets harder, and each run drills one skill.
  async signal() {
    if (!G.party.some(c => c.hp > 0)) { await say(null, 'Your critters need rest first.'); return; }
    const n = G.night + 1, bossNight = n % 5 === 0, focus = Learn.pickFocus(), who = Learn.teacher();
    const kid = KIDS[(n - 1) % KIDS.length] + (n > KIDS.length ? ' ' + (Math.floor((n - 1) / KIDS.length) + 1) : ''), [place, bg] = PLACES[(n * 7 + 3) % PLACES.length];
    Snd.sfx('blip'); await say('radio', `...kzzt... is anybody out there? My name is ${kid}... I'm stuck at ${place}... they're everywhere... kzzt...`);
    if (n === 1) { await say('dex', "Another kid. There are MORE of us."); await say('priya', flag('bellSilenced') ? "The bell is broken, but its echo still wakes a few of them after dark. Every night, the beacon finds someone new." : "The walkie picks up a new signal almost every night. Every one is a kid like us."); await say('dex', 'Then every night, we go get them. New rule. Rule #1, actually.'); }
    await say(who, `Brain training for tonight: ${SKILLS[focus].n.toUpperCase()}. Every Brain Blast on this run will be about it. ${Learn.sk(focus).m ? 'A little review keeps it sharp.' : 'Four in a row and that skill is yours for good.'}`);
    if (await ask('dex', bossNight ? `Night ${n}. Priya says a HORDE CAPTAIN is leading this pack. Go?` : `Night ${n}. Ready to roll out?`, ["Let's go!", 'Not yet']) !== 0) return;
    const top = Math.max(...G.party.map(c => c.lvl)), lvl = clamp(top - 1 + Math.floor(n / 4), 3, 50);
    const pool = ['shambler', 'sprinter'].concat(lvl >= 7 ? ['lunchlady'] : [], lvl >= 14 ? ['hazmat', 'bloater'] : [], lvl >= 26 ? ['clanker'] : []);
    const waves = [[[pick(pool), lvl - 1], [pick(pool), lvl]], [[pick(pool), lvl], [pick(pool), lvl]]];
    if (bossNight) waves.push([[pick(pool), lvl], [pick(['coach', 'mallcop', 'flatline', 'butler']), Math.min(50, lvl + 2), `Horde Captain #${n / 5}`]]);
    Learn.focus = focus;
    for (let i = 0; i < waves.length; i++) {
      const last = i === waves.length - 1;
      const r = await Battle.run({ foes: waves[i], kind: 'boss', bg, music: last && bossNight ? 'boss' : 'battle', intro: i === 0 ? `Night ${n}: zombies swarm ${place}!` : last && bossNight ? 'The HORDE CAPTAIN steps out of the dark!' : 'More of them close in!' });
      if (r !== 'win') { Learn.focus = null; await blackout(); await say(who, `We will get ${kid} tomorrow night. Maybe a quick lesson on ${SKILLS[focus].n} first?`); return; }
      if (!last) { healAll(); await say(flag('wren') ? 'wren' : who, 'Patch up, quick. More coming!'); }
    }
    Learn.focus = null; healAll();
    G.night = n; G.saved.push(kid);
    const scrap = 30 + n * 5 + (bossNight ? 60 : 0); G.scrap += scrap; give(bossNight ? 'slush' : n % 2 ? 'soda' : 'snack', bossNight ? 2 : 1, true);
    Snd.sfx('badge');
    await say(null, `${kid}: "${KID_LINES[(n * 5 + 1) % KID_LINES.length]}"`);
    await say(null, `★ ${kid} is safe at the Nest! ★\nKids rescued: ${G.saved.length}   ·   +${scrap} scrap   ·   Night ${n} complete`, { col: '#ffd76a' });
    if (n === 1) logAdd('Answered a signal tonight. Brought a kid home. There is a spare sleeping bag in the Nest now, and it is not spare anymore. We are doing this every night.');
    if (n % 5 === 0) logAdd(`Night ${n}. ${G.saved.length} kids at the Nest. Bash is building bunk beds. Priya made a chore chart. I used to live alone in a water tower. This is better.`);
    await checkFeats(); saveGame();
  },
  async intro() {
    Scene = 'black'; Snd.play('toccata');
    await sleep(400);
    const g = await menu(['Grade 2', 'Grade 3', 'Grade 4', 'Grade 5', 'Grade 6'], { x: 330, y: 230, w: 300, cancel: false, sel: 0, title: 'What grade are you in?' });
    G.learn.grade = 2 + g; G.readAloud = G.learn.grade <= 3;
    const n = t => say(null, t);
    await n('Day 42 since the Green Night.');
    await n("That's the night the sky turned the color of lime soda, every grown-up in Wexler Falls got REALLY bitey, and weird little monsters crawled out of the storm drains.");
    await n("My name is Dex Okafor. I'm fourteen. I live in a water tower.");
    await n("As far as I can tell, I'm the last teenager on Earth.");
    await n('...Which, honestly? Best. Summer. Ever.');
    await fadeOut(400); enterWorld(); await fadeIn(600);
    await say('dex', 'No bedtime. No chores. Gummy worms for breakfast.');
    await say('dex', 'Apocalypse Rule #1: Never go anywhere without a monster buddy.');
    await say('dex', 'Good thing my critter trap finally caught something. THREE somethings!');
    const starters = ['scrapup', 'sporkle', 'zaprat'];
    let pickd = -1;
    while (pickd < 0) {
      const i = await menu(starters.map(s => ({ label: SPECIES[s].n, right: SPECIES[s].t, rcol: TYPES[SPECIES[s].t].col })), { x: 40, y: 120, w: 360, cancel: false, title: 'Pick your buddy!', onDraw: s => {
        const sp = SPECIES[starters[s]]; panel(420, 120, 500, 380);
        ctx.drawImage(Art.sprite(starters[s]), 580, 140, 180, 180);
        setFont(26); wrap(sp.desc, 450).forEach((l, k) => text(l, 444, 340 + k * 28));
        text('Strong against: ' + TYPES[sp.t].beats.join(', '), 444, 430, '#7fe08a'); text('Weak against: ' + weakTo(sp.t).join(', '), 444, 458, '#e07a8a');
      } });
      if (await ask('dex', `${SPECIES[starters[i]].n}? You and me, pal?`, ['Yes!', 'Let me think...']) === 0) pickd = i;
    }
    addCritter(makeCritter(starters[pickd], 6)); setFlag('starter');
    await say(null, `${SPECIES[starters[pickd]].n} joined your team! The other two scamper off into the grass.`);
    await badge('first');
    await say('guide', "CAPTAIN COSMOS FIELD GUIDE, page 1: Critters run on BRAIN POWER. When their human thinks hard, they hit HARD.");
    await say('guide', 'In a fight, every attack comes with a BRAIN BLAST question. Get it right and the attack is supercharged. Get it wrong and it fizzles a bit. Either way, your brain gets stronger.');
    await say('dex', 'Zombies want brains. Too bad for them, I plan on USING mine.');
    await say(null, 'GRRRAAAUGH.');
    await say('dex', "Oh no. It's Mr. Pembry, the mailman. He still walks his route every day. Mostly he delivers... bites.");
    await Battle.run({ foes: [['shambler', 3, 'Mailman Pembry']], kind: 'boss', bg: 'grass', music: 'battle', intro: 'Mailman Pembry shuffles up with a very late package!' });
    healAll();
    await say('dex', 'Ha! Return to sender.');
    Snd.sfx('blip'); await say('radio', '...kzzt... anyone... Wexler Middle School... science lab... kzzt... please...');
    await say('dex', 'That sounded like a person. A NOT-ZOMBIE person.');
    await say('dex', 'Nope. Rule #4: Lone wolves live longest.'); await say('dex', '...'); await say('dex', 'But she said please.');
    setObj('Go east along Main Street to Wexler Middle School.');
    logAdd('Day 42. Caught a monster. Punched a mailman (he started it). Heard a voice on the walkie. Probably nothing. Going to check anyway. NOT because I am lonely.');
    await say(null, 'Move with the arrow keys or the D-pad. Press A (or Z) to talk and search. Open the menu with ☰ (or X). Rest at the Nest to heal and save.');
  },
  async labDoor() {
    if (flag('priya')) return;
    await say(null, 'The science lab door is blocked from the inside by a pile of desks.');
    await say('radio', 'Hello?! Is somebody there?'); await say('dex', '...Priya?');
    await say('priya', 'DEX?! Okay. Okay. Listen. Coach Krunk has my Boltbug, Tesla, in the gym. I am not leaving without her.');
    await say('dex', 'Gym. Coach. Got it.'); setFlag('heardPriya');
    setObj('Beat Coach Krunk in the school gym (bottom right).');
  },
  async coach() {
    await say('coach', 'TWEEEEEET! OKAFOR! YOU ARE... LATE... FOR GYM!');
    await say('dex', "Coach, it's July."); await say('coach', 'DROP... AND GIVE ME... BRAAAAINS!');
    if (!(await bossFight({ foes: [['sprinter', 6, 'Hall Monitor'], ['coach', 8]], bg: 'indoor' }))) return;
    setFlag('coach'); await badge('coach');
    await say(null, 'Coach Krunk flops onto a pile of dodgeballs and starts snoring. A little blue Boltbug zips out of the equipment cage.');
    await say('priya', 'TESLA! You found her!'); await say('priya', '...Dex Okafor. Forty-two days, and you never once checked the SCHOOL?');
    await say('dex', "In my defense: it's a school. In summer.");
    const c = await ask('priya', "You ditched me at the science fair. Now you rescue me by accident. What am I supposed to do with that?", ["I'm sorry I bailed on you.", 'Technically, I rescued your beetle.']);
    if (c === 0) { await say('priya', '...Okay. That is a start.'); G.bond.priya = 1; } else await say('priya', 'Unbelievable. (She is almost smiling.)');
    await say('priya', "I've been building a beacon. With enough power, we could reach anyone who is still out there.");
    await say('priya', 'I need two things. A Mega Battery from the Galleria mall, and an antenna dish from the junkyard.');
    await say(null, '(Other people. You had sort of gotten used to the idea that there were not any.)');
    await joinCrew('priya');
    await say('priya', 'Also, my Noise-o-Tron can lure that horde off Elm Street. And when a question stumps you, ask me. I have a trick for everything.');
    await say('priya', 'One more thing. The walkie picks up other kids calling for help at night. We can ANSWER A SIGNAL from the Nest or any campfire, whenever you want. As many nights as it takes.');
    setObj('Head south down Elm Street to the Galleria mall and find a Mega Battery.');
    logAdd('Found Priya. She is still mad about the science fair. She is also the smartest person alive, which, okay, is a short list. We are building a beacon.');
  },
  async lunch() {
    await say(null, 'The Lunch Zombie raises her ladle. "SEEECONDS?"');
    if (!(await bossFight({ foes: [['shambler', 6], ['lunchlady', 8, 'Lunch Lady Doris']], bg: 'indoor', music: 'battle' }))) return;
    setFlag('lunch'); await say('dex', 'No thanks. I brought my own.');
  },
  async bash() {
    await say(null, 'The garden shop is full of healthy green ferns. A very large boy is watering them.');
    await say('dex', 'Oh no. Bash Holt. Eighth-grade wrecking ball. He once put me in a recycling bin.');
    await say('bash', "Okafor. Don't step on the ferns.");
    await say('priya', 'Bash, we need to get to the electronics store. Will you help?'); await say('bash', "Can't. If I leave, the zombies trample everything. These guys need me.");
    await say(null, 'CRASH! The shop window shatters. Shamblers pour in!');
    const c = await ask('dex', '(You could slip out the back while they are busy with Bash...)', ['Stay and fight for the ferns!', 'Rule #4 says run...']);
    if (c === 1) await say('dex', '...No. New rule. Rule #4 is cancelled.');
    if (!(await bossFight({ foes: [['shambler', 11], ['sprinter', 12], ['shambler', 12, 'Fern Stomper']], bg: 'indoor', music: 'battle', intro: 'The horde stomps toward the ferns!' }))) return;
    await say('bash', "You stayed. You could've run."); await say('dex', 'New rule. We do not leave people behind. Or ferns.');
    await say('bash', '...I can carry a lot of stuff. And I can lift that junkyard gate. If you want.');
    G.bond.bash = c === 0 ? 1 : 0;
    await joinCrew('bash');
    setObj(flag('battery') ? 'Take Route 9 (east of the school) south to the junkyard.' : 'Get the keycard from Officer Scoot in the mall security office.');
  },
  async cop() {
    await say('cop', 'NO RUNNING... IN THE MALL. NO... LIVING... IN THE MALL.');
    if (!(await bossFight({ foes: [['sprinter', 14, 'Mall Walker'], ['mallcop', 16]], bg: 'indoor' }))) return;
    setFlag('cop'); await badge('mall');
    await say(null, 'Officer Scoot rolls gently into a potted plant. A keycard falls out of his pocket.');
    await say('priya', 'The keycard! The shutter on the electronics store should open now.');
    setObj('Grab the Mega Battery from the electronics store at the back of the mall.');
  },
  async joe() {
    await say(null, 'A very round zombie is asleep face-down in a tray of nachos.');
    if (!(await bossFight({ foes: [['bloater', 14, 'Sloppy Joe']], bg: 'indoor', music: 'battle', intro: 'Sloppy Joe wakes up. He is NOT a morning person.' }))) return;
    setFlag('joe'); await say('dex', "He didn't even finish his nachos.");
  },
  async battery() {
    setFlag('battery'); Snd.sfx('badge');
    await say(null, 'You got the MEGA BATTERY! It hums like a happy cat.');
    await say('priya', "One down. Now the antenna. The junkyard is past the school, south on Route 9.");
    setObj(flag('bash') ? 'Take Route 9 (east of the school) south to the junkyard.' : 'Talk to Bash in the mall garden shop.');
    logAdd('Got the battery. Also: Bash Holt is on the team?? He names ferns now. The apocalypse is weird.');
  },
  async wren() {
    await say(null, 'A girl in a red track jacket is sitting on a stack of tires, eating beans from a can.');
    await say('wren', "That's close enough."); await say('priya', 'Wren Castillo? From the track team?');
    await say('wren', "Groups are loud. Loud gets you eaten. I work alone."); await say('dex', 'Hey, that was MY rule.');
    await say('wren', "Then you know it's a good one. Tell you what. Beat my critters and I'll show you where the antenna dish is.");
    if (!(await bossFight({ foes: [['murdle', 16, "Wren's Murdle"], ['trashking', 18, "Wren's Trashking"]], bg: 'junk', music: 'battle', intro: 'Wren whistles. Her critters leap into action!' }))) return;
    setFlag('wrenBeat');
    await say('wren', 'Huh. Not bad. The dish is on top of the old car crusher, at the back of the yard.'); await say('wren', "One problem. The crusher doesn't like visitors.");
    setObj('Find the car crusher at the back of the junkyard.');
  },
  async krush() {
    if (!flag('wrenBeat')) { await say(null, 'A huge yellow car crusher. Its red eyes are closed. Better not poke it yet.'); return; }
    await say(null, 'The ground shakes. The car crusher stands up. It has LEGS. It has TEETH.');
    await say('wren', 'Told you.');
    if (!(await bossFight({ foes: [['krush', 20]], bg: 'junk', intro: 'KRUSH roars like a hundred garbage trucks!' }))) return;
    setFlag('krush'); await badge('junk');
    await say(null, 'Krush sits down with a CLANG. A tiny oily tear rolls down its bumper.');
    await say('bash', "Aw. He's not mean. He's lonely. Nobody has brought him a car in weeks.");
    if (await ask('dex', '(Offer Krush a Critter Snack?)', ['Here, big guy.', 'Maybe not.']) === 0) {
      const k = makeCritter('krush', 20); addCritter(k); Snd.sfx('catch');
      await say(null, `KRUSH joined ${G.party.includes(k) ? 'your team' : 'the Critter Pen at the Nest'}! He wags his whole body.`);
    }
    await say('wren', 'You could have left him. Or left me, back there. You did not.'); await say('wren', 'Fine. I am in. But I run out front.');
    setFlag('antenna'); await joinCrew('wren'); await badge('squad');
    await say('priya', "Battery, antenna, and a full crew! The radio tower is on the hill, past Whisperwood and the cemetery."); await say('wren', 'I know the trail. That fallen tree on Elm Street? I can get us past it.');
    setObj('Go north up Elm Street, through Whisperwood and the cemetery, east to Radio Hill.');
    logAdd('We have a crew now. Four kids, a pile of monsters, and a car crusher who likes snacks. I had a rule about lone wolves. I am deleting it.');
  },
  async tower() {
    if (flag('broadcast')) { await say(null, 'The beacon blinks steadily. WE ARE HERE. WE ARE HERE.'); return; }
    await say('priya', "Okay. I need a few minutes to wire this up. It is going to be LOUD."); await say('wren', 'Loud brings zombies.'); await say('dex', 'Then we hold the hill. Together.');
    const waves = [[['sprinter', 21], ['hazmat', 22]], [['bloater', 22], ['sprinter', 23], ['hazmat', 23]], [['bloater', 25, 'Big Earl']]];
    for (let i = 0; i < waves.length; i++) {
      if (!(await bossFight({ foes: waves[i], bg: 'grass', music: i === 2 ? 'boss' : 'battle', intro: i === 2 ? 'The ground shakes. BIG EARL has arrived.' : `Wave ${i + 1}! Zombies climb the hill!` }))) return;
      if (i < 2) { healAll(); await say('wren', 'Quick, patch up. More are coming!'); }
    }
    setFlag('broadcast'); await badge('air'); Snd.play('sad');
    await say('priya', "It's ready. Dex... you should be the one to say it.");
    const c = await ask('dex', '(You pick up the microphone.)', ['"This is Dex, Priya, Bash, and Wren. We\'re alive."', '"Uh. Hi. Is this thing on?"']);
    if (c === 1) await say('priya', '(whispering) Dex!');
    await say('dex', "This is Dex Okafor, with Priya, Bash, and Wren. We're alive. We're at Wexler Falls. If you can hear this, you are not alone.");
    await say(null, 'Static. A long, long minute of static.');
    await say('radio', '...kzzt... Harbor Colony... we read you... ferry can reach Wexler pier...');
    await say('radio', '...kzzt... a nurse got forty people out of County General that night... name of Okafor...');
    await say(null, 'You forget how to breathe.');
    await say('dex', "My mom. She's a nurse. At County General."); await say('wren', 'You never went to look?');
    await say('dex', "As long as I never looked, she could still be anywhere. If I looked, she'd only be one thing.");
    await say('bash', "We'll look with you."); await say('priya', 'The wrecked bus on the west bridge. All four of us could push it.');
    setObj('Cross the west bridge on Main Street and go to County General Hospital.');
    logAdd("Mom got forty people out. FORTY. I spent forty-two days pretending this was a video game so I wouldn't have to wonder. I'm done pretending. We're going to the hospital.");
    Snd.play(zoneAt(G.map, G.x, G.y).music);
  },
  async flatline() {
    await say('doc', 'THE DOCTOR... WILL SEE YOU... NOW.'); await say('dex', "Move. That's my mom's desk.");
    if (!(await bossFight({ foes: [['hazmat', 27, 'Nurse Sneezy'], ['bloater', 28, 'Patient Zero-ish'], ['flatline', 30]], bg: 'indoor' }))) return;
    setFlag('flatline'); await say(null, 'Dr. Flatline topples onto a gurney, which rolls slowly away down the hall.');
  },
  async note() {
    if (flag('bellTolls')) { await say(null, "Mom's note. You have read it eleven times. Twelve, now."); return; }
    Snd.play('sad');
    await say(null, "The nurses' station. Taped to the desk lamp is an envelope. It says DEX in her handwriting.");
    await say('mom', 'Dex, if you are reading this, then you are okay, and that is the only thing I need to know.');
    await say('mom', 'I got my patients out to the harbor. I went back for you, baby, but the house was empty. I looked for two days.');
    await say('mom', 'You were always the kid who said "I can do it myself." Do not do this by yourself. Find people. Let them help.');
    await say('mom', 'Then come find me. I will be on the first ferry that can dock. I am so proud of whoever you have become. Love, Mom.');
    await say('dex', '...'); await say('priya', 'Dex?'); await say('dex', "She's alive. She LOOKED for me."); await say('bash', '(sniff) I got something in my eye. Fern dust.');
    await badge('house');
    Snd.stop(); await sleep(400);
    Fx.shake = 14; Snd.sfx('bell'); await sleep(1400); Snd.sfx('bell'); await tween(Fx, 'shake', 0, 1600);
    await say(null, 'DONG. DONG. The whole building shakes. Every zombie in the hospital turns to face the same direction.');
    await say('wren', "That's the bell at Blackwood Manor. It has not rung in a hundred years.");
    await say('priya', "They're all walking toward the harbor. The bell is SENDING them. The ferry can't dock in the middle of a horde!");
    await say('dex', 'Then we shut the bell up. Blackwood Manor. West trail through Whisperwood.');
    setFlag('bellTolls');
    setObj('Go to Blackwood Manor (through Whisperwood, west then north) and silence the bell.');
    logAdd('Mom is alive. She told me not to do this alone. For once I was already doing what she said. Now a haunted bell is sending every zombie in town at her ferry. Not happening.');
    Snd.play(zoneAt(G.map, G.x, G.y).music);
  },
  async butler() {
    await say('butler', 'The Master is not receiving visitors.'); await say('butler', 'Correction. The Master is receiving visitors... for dinner.');
    if (!(await bossFight({ foes: [['clanker', 30, 'Suit of Armor'], ['butler', 32]], bg: 'manor' }))) return;
    setFlag('butler'); await say('butler', 'How... very... rude.'); await say(null, 'The Butler bows stiffly and falls over.');
  },
  async bellringer() {
    Snd.play('toccata');
    await say('bell', 'DONG. LITTLE LIVING THINGS. SO LOUD. SO WARM.');
    await say('bell', 'I RANG, AND THE TOWN LAID DOWN ITS BURDENS. NO MORE HOMEWORK. NO MORE BEDTIMES. NO MORE THINKING.');
    await say('bell', "ISN'T THAT WHAT YOU WANTED, BOY? THE BEST SUMMER EVER?");
    const c = await ask('dex', '...', ['"Yeah. It was. I was wrong."', '"I want my mom back, you big ding-dong."']);
    await say('dex', c === 0 ? "I thought being alone meant being free. It just meant being alone." : "And my friends. And homework. Okay, SOME homework.");
    await say('priya', 'His bell turns brains OFF. So we turn ours all the way ON.'); await say('bash', 'For the ferns!'); await say('wren', 'For everybody.');
    if (G.gear.sword >= 5) { await say('dex', 'Also, I brought something. An old friend of yours made it.'); await say('bell', 'THAT BLADE. THE ARMOR... BETRAYS ME.'); await say(null, '(Use the Bellbreaker from the CREW menu. Against the Bellringer, it hits twice as hard.)'); }
    else if (G.gear.sword) await say('dex', "And I've got a sword now. So. That's new.");
    if (!(await bossFight({ foes: [['gloomwing', 33, 'Bell Bat'], ['clanker', 33, 'Bell Guard'], ['bellringer', 36]], bg: 'manor', music: 'finale', intro: 'THE BELLRINGER raises his terrible bell!' }))) return;
    setFlag('bellSilenced'); Snd.stop();
    Fx.flash = 1; await tween(Fx, 'flash', 0, 900);
    await say('bell', 'SO... MUCH... THINKING...'); await say(null, 'The great bell cracks down the middle. The sound that comes out is tiny. Ding.');
    await say(null, 'Outside, all across Wexler Falls, a thousand zombies stop walking. One by one, they sit down and fall asleep.');
    await say(null, 'And far beneath the manor, in the dark where the Bell used to reach, something warm rolls over. The eggs are waking up.');
    await badge('bell'); healAll();
    await say('priya', "The ferry can dock now. Dex... let's go meet your mom.");
    setObj('Go to the pier at Wexler Harbor (south of the hospital) and sound the horn.');
    logAdd('We did it. WE did it. The bell is broken, the zombies are napping, and there is a ferry coming. I think I am going to throw up. In a good way.');
    await fadeOut(500); warpTo('world', 19, 15, 'down'); await fadeIn(500);
  },
  async horn() {
    if (!flag('bellSilenced')) { await say(null, 'A hand-crank foghorn. Someone has painted on it: "FERRY COMES WHEN THE COAST IS CLEAR."'); return; }
    await say(null, 'You crank the foghorn. HOOOOOONK.'); Snd.play('sad');
    await say(null, 'Out of the morning mist comes a ferry, low and slow. There are people on the deck. Waving.');
    await say(null, 'One of them is wearing blue hospital scrubs. She is already running down the ramp.');
    await say('mom', 'DEX!'); await say('dex', 'Mom!'); await say(null, '(It is a very long hug. Nobody rushes it.)');
    await say('mom', "You got tall. And you've got... is that a car crusher?"); await say('dex', "That's Krush. And this is Priya, and Bash, and Wren. They're my crew.");
    await say('mom', 'You found people.'); await say('dex', "You said to. ...Okay, I found them before I read the note. But I was GOING to listen.");
    await say('mom', 'The colony has room for all of you. Beds. Hot food. A school.'); await say('bash', '(whispering) She said school like it was a GOOD thing.');
    const c = await ask('dex', '(The crew is looking at you. Captain.)', ["Let's go with the ferry.", 'There might be more kids out here. We keep the Nest lit.']);
    if (c === 0) { await say('dex', "Let's go. All of us. And the beacon stays on, so anyone else can follow it."); await say('priya', 'I rigged it to run for a year. Obviously.'); }
    else { await say('dex', "If we leave, who turns on the light? We stay. We find the others. Then we ALL come."); await say('mom', "...That's my kid. Then I'm staying too. Somebody has to make sure you eat a vegetable."); await say('bash', 'I have tomatoes!'); }
    await fadeOut(900); Scene = 'black'; Snd.play('nest'); await fadeIn(400);
    const L = G.learn;
    await say(null, 'Day 49 since the Green Night.');
    await say(null, 'My name is Dex Okafor. I used to think I was the last teenager on Earth.');
    await say(null, 'Turns out I just had not looked hard enough.');
    await say(null, "The bell is broken, but its echo still wakes a few sleepers after dark. And every night, the beacon finds another kid. So every night, we go.");
    await say(null, `THE END\n\nBrain Blasts landed: ${L.right} of ${L.total}   ·   Best streak: ${L.best}\nBrain rank: ${brainRank(L.right)}   ·   Skills mastered: ${Object.values(L.sk).filter(k => k.m).length}\nMerit badges: ${G.badges.length} of ${Object.keys(BADGES).length}   ·   Critter friends: ${Object.keys(G.dex).length}`, { col: '#ffd76a' });
    await say(null, 'Thanks for playing ZOMBIE ZONE. Your save is still here: keep exploring, master every skill in Study Hall, and find all the comics!');
    setFlag('cleared'); setObj('Answer a signal from the Nest or any campfire each night. Rescue every kid and master every skill.'); saveGame();
    await fadeOut(400); enterWorld(); await fadeIn(400);
  }
};

// ------------------------------------------------------------ entities
E({ map: 'world', x: 41, y: 62, spr: 'nest', big: 2, act: () => restMenu(true) });
sign('world', 43, 59, "MAPLE COURT. Somebody has crossed out \"Slow: Children\" and written \"FAST: ZOMBIES.\"");
E({ map: 'world', x: 35, y: 55, spr: 'sign', act: async () => { await say('dex', flag('bellTolls') ? "My house. She came back here for me. I was two streets away, hiding in a tower." : "My house. I don't go in. Mom's shoes are still by the door."); } });
E({ map: 'world', x: 65, y: 59, spr: 'munch', act: () => munchShop() });
sign('world', 60, 55, "ELM ST & MAIN ST.  East: School.  South: Downtown.  North: Whisperwood.  West: Hospital.");
sign('world', 110, 48, 'WEXLER MIDDLE SCHOOL. Home of the Fighting Possums. "Summer school is cancelled. FOREVER."');
sign('world', 78, 79, 'WEXLER GALLERIA. "Everything must go!" (Everything went.)');
sign('world', 107, 62, 'KRUSH & SONS JUNKYARD. "We Crush It!"');
sign('world', 17, 55, 'COUNTY GENERAL HOSPITAL. Visiting hours: please do not.');
sign('world', 50, 25, 'HOLLOW REST CEMETERY. Quiet, please. The residents are light sleepers.');
sign('world', 21, 24, 'BLACKWOOD MANOR. Private. Very, very private.');
for (const x of [58, 59]) gate('world', x, 68, 'shambler', 'priya', async () => { await say(null, 'A HORDE of Shamblers, packed shoulder to shoulder across Elm Street.'); await say('dex', 'No way through. Not alone, anyway. School first.'); });
for (const x of [108, 109]) gate('world', x, 64, 'gate', 'bash', async () => { await say(null, 'The junkyard gate is chained shut. It would take someone REALLY strong to lift it.'); });
for (const x of [58, 59]) gate('world', x, 38, 'log', 'wren', async () => { await say(null, 'A giant fallen tree blocks the trail north. You would need someone who knows the woods to find a way past.'); });
for (const y of [56, 57]) gate('world', 28, y, 'wreck', 'broadcast', async () => { await say(null, 'A wrecked school bus blocks the bridge. Beyond it: the hospital.'); await say('dex', "...I don't need to go that way. Nothing over there I need to see."); });
for (const x of [19, 20]) gate('world', x, 22, 'gate', 'bellTolls', async () => { await say(null, 'Tall iron gates, locked tight. Beyond them, a dark house on a hill. It feels like it is looking back.'); });
E({ map: 'world', x: 107, y: 72, spr: 'wren', human: true, if: () => !flag('wrenBeat'), act: () => Story.wren() });
E({ map: 'world', x: 120, y: 84, spr: 'krush', big: 2, if: () => !flag('krush'), act: () => Story.krush() });
E({ map: 'world', x: 106, y: 8, spr: 'tower', big: 3, act: () => Story.tower() });
E({ map: 'world', x: 15, y: 92, spr: 'horn', act: () => Story.horn() });
E({ map: 'world', x: 19, y: 91, spr: 'ferry', big: 3, solid: false, if: () => flag('cleared') });
camp('world', 66, 84); camp('world', 56, 31); camp('world', 103, 13); camp('world', 10, 82); camp('world', 21, 18); camp('world', 110, 66);
stash('world', 39, 52, 'a', { snack: 3, juice: 2 }, 20); stash('world', 80, 44, 'b', { juice: 3 }, 30); stash('world', 99, 50, 'c', { snack: 3, wipes: 2 });
stash('world', 80, 86, 'd', { soda: 2, snack: 3 }, 50); stash('world', 118, 71, 'e', { soda: 3, salts: 1 }, 60); stash('world', 36, 27, 'f', { soda: 2, snack: 4 });
stash('world', 10, 40, 'g', { slush: 1, salts: 1 }, 80); stash('world', 56, 22, 'h', { soda: 3, wipes: 3 }); stash('world', 70, 10, 'i', { slush: 1, snack: 5 });
stash('world', 114, 10, 'j', { soda: 3, salts: 1 }, 100); stash('world', 24, 50, 'k', { slush: 2, wipes: 3 }); stash('world', 22, 80, 'l', { slush: 2, salts: 2 }, 120); stash('world', 30, 5, 'm', { slush: 3, salts: 2 });
comic('world', 37, 80, 1); comic('world', 55, 79, 3); comic('world', 100, 77, 5); comic('world', 49, 10, 6);
// the Night Market (in the Lost Lot, south of Maple Court)
sign('world', 37, 69, 'THE NIGHT MARKET. No scrap. No coupons. Pay with BRAINS (the thinking kind).');
E({ map: 'world', x: 38, y: 71, spr: 'stall1' }); E({ map: 'world', x: 41, y: 71, spr: 'stall2' }); E({ map: 'world', x: 44, y: 71, spr: 'stall3' });
E({ map: 'world', x: 38, y: 72, spr: 'clanker', act: () => nightShop('forge') });
E({ map: 'world', x: 41, y: 72, spr: 'newt', act: () => nightShop('brew') });
E({ map: 'world', x: 44, y: 72, spr: 'flicker', act: () => nightShop('magic') });
camp('world', 41, 75);
// dragon eggs: one where each of the big bosses stood guard
const eggE = (map, x, y, elm, need, cold) => E({ map, x, y, spr: 'egg_' + elm, if: () => !G.eggs.some(g => g.el === elm), act: () => eggNest(elm, need, cold) });
eggE('school', 30, 4, 'ember', 'coach', 'A strange warm egg sits on the shelf. It trembles every time a whistle blows in the gym. It will not let you near while Coach Krunk is still stomping around.');
eggE('mall', 16, 15, 'tide', 'cop', 'Something round and blue glows at the bottom of the fountain. Every time the scooter squeaks past upstairs, it sinks deeper. Deal with Officer Scoot first.');
eggE('world', 114, 86, 'storm', 'krush', 'A crackling egg is wedged under a pile of scrap. Sparks jump off it. The big crusher keeps glaring at you. Better calm it down first.');
eggE('world', 50, 9, 'whisper', 'broadcast', 'A pale green egg rests on the crypt steps. You can hear it whispering, but the words slide away. It is waiting for something. A voice on the air, maybe.');
eggE('manor', 5, 27, 'story', 'butler', 'An egg the color of the night sky sits among the oldest books. The Butler would never let you touch it.');
// school
E({ map: 'school', x: 23, y: 9, spr: 'barricade', if: () => !flag('coach'), act: () => Story.labDoor() });
E({ map: 'school', x: 28, y: 17, spr: 'coach', if: () => !flag('coach'), act: () => Story.coach() });
E({ map: 'school', x: 8, y: 15, spr: 'lunchlady', if: () => !flag('lunch'), act: () => Story.lunch() });
camp('school', 16, 2); stash('school', 8, 1, 's1', { juice: 3, snack: 2 }, 25); stash('school', 33, 4, 's2', { soda: 1, wipes: 2 }, 30); stash('school', 2, 20, 's3', { soda: 2, snack: 3 }); stash('school', 23, 2, 's4', { soda: 2, salts: 1 }, 40);
comic('school', 14, 20, 2);
// mall
E({ map: 'mall', x: 6, y: 4, spr: 'bash', human: true, if: () => !flag('bash'), act: () => Story.bash() });
E({ map: 'mall', x: 33, y: 4, spr: 'mallcop', if: () => !flag('cop'), act: () => Story.cop() });
E({ map: 'mall', x: 33, y: 17, spr: 'bloater', if: () => !flag('joe'), act: () => Story.joe() });
E({ map: 'mall', x: 20, y: 7, spr: 'shutter', if: () => !flag('cop'), act: async () => { await say(null, 'A steel security shutter. There is a keycard slot. Officer Scoot in the security office (top right) has the card.'); } });
E({ map: 'mall', x: 20, y: 2, spr: 'stash', if: () => !flag('battery'), act: () => Story.battery() });
camp('mall', 15, 20); stash('mall', 37, 21, 'm1', { soda: 2, snack: 4 }, 60); stash('mall', 37, 2, 'm2', { slush: 1, salts: 1 }, 50); stash('mall', 2, 21, 'm3', { soda: 2, wipes: 2 }); comic('mall', 11, 21, 4);
// hospital
E({ map: 'hospital', x: 17, y: 10, spr: 'flatline', if: () => !flag('flatline'), act: () => Story.flatline() });
E({ map: 'hospital', x: 17, y: 2, spr: 'note', act: () => Story.note() });
camp('hospital', 13, 16); stash('hospital', 31, 2, 'h1', { slush: 2 }, 80); stash('hospital', 26, 19, 'h2', { soda: 4, salts: 2 }); stash('hospital', 30, 19, 'h3', { slush: 1, wipes: 4 }, 60); comic('hospital', 5, 2, 7);
// manor
E({ map: 'manor', x: 18, y: 12, spr: 'butler', if: () => !flag('butler'), act: () => Story.butler() });
E({ map: 'manor', x: 18, y: 3, spr: 'bellringer', big: 2, if: () => !flag('bellSilenced'), act: () => Story.bellringer() });
camp('manor', 15, 26); camp('manor', 20, 14); stash('manor', 2, 2, 'x1', { slush: 2, salts: 2 }, 100); stash('manor', 12, 2, 'x2', { slush: 2, soda: 3 }); stash('manor', 35, 2, 'x3', { slush: 3, salts: 2 }, 150); comic('manor', 2, 19, 8);
