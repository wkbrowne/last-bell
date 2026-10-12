'use strict';
// Coverage for the tests Pacifica gives (see docs/test-coverage-design.md): listening and sound skills, geometry,
// measurement, reasoning, research, more passages, Maze Dash, the Read-Aloud Check and the Writing Workshop.
function addSkill(id, dom, def, lesson) { def.id = id; SKILLS[id] = def; DOMAIN[id] = dom; LESSONS[id] = lesson; }

// ============================================================ passages
for (const p of PASSAGES) if (/Boltbug|Shamblers|Stay or Go/.test(p.title)) p.k = 'info';
PASSAGES.push(
  { g: [2, 2], k: 'info', title: 'All About Gloops', text: 'A Gloop is a soft green critter. It has no bones. A Gloop moves by stretching out and pulling itself along. Gloops live near water because their skin must stay wet. They eat moss and old leaves. A happy Gloop makes a sound like a tiny bell.', qs: [
    ['Why do Gloops live near water?', 'Their skin must stay wet.', ['They like to swim races.', 'They eat fish.', 'They are afraid of grass.'], 'The passage says they live near water "because their skin must stay wet."', ['Gloops live near water because their skin must stay wet.', ['A Gloop is a soft green critter.', 'They eat moss and old leaves.', 'It has no bones.']]],
    ['How does a Gloop move?', 'It stretches out and pulls itself along.', ['It hops on two legs.', 'It flies with tiny wings.', 'It rolls like a ball.'], 'The third sentence tells how it moves.'],
    ['What is this passage MOSTLY about?', 'what Gloops are like', ['how to catch a Gloop', 'why bells ring', 'where moss grows'], 'Every sentence tells a fact about Gloops.']] },
  { g: [2, 3], k: 'info', title: 'Why It Thunders', text: 'Lightning is a giant spark in the sky. It is very, very hot. The heat makes the air around it move fast. That fast air makes a loud boom. We call the boom thunder. Light moves faster than sound, so you always see the flash before you hear the boom.', qs: [
    ['What makes thunder?', 'air moving fast after lightning heats it', ['clouds bumping into each other', 'rain hitting the ground', 'the wind blowing trees'], 'The heat makes the air move fast, and that fast air makes the boom.'],
    ['Why do you see lightning before you hear thunder?', 'Light moves faster than sound.', ['Thunder is farther away.', 'Your eyes are stronger than your ears.', 'Lightning happens twice.'], 'The last sentence gives the reason.', ['Light moves faster than sound, so you always see the flash before you hear the boom.', ['Lightning is a giant spark in the sky.', 'It is very, very hot.', 'We call the boom thunder.']]],
    ['In this passage, what does the word "boom" mean?', 'a loud sound', ['a bright light', 'a kind of cloud', 'a hot spark'], 'The passage says the fast air "makes a loud boom."']] },
  { g: [2, 2], title: "Wren's Race", text: 'Wren wanted to be the fastest kid in town. Every morning she ran to the park and back. One day she tripped on a root and scraped her knee. It hurt a lot. But Wren stood up, brushed off the dirt, and kept running. The next week she ran faster than ever.', qs: [
    ['What happened when Wren tripped?', 'She scraped her knee.', ['She lost her shoe.', 'She won the race.', 'She went home to sleep.'], 'The passage says she tripped on a root and scraped her knee.'],
    ['Which word BEST describes Wren?', 'determined', ['lazy', 'afraid', 'silly'], 'She got hurt but stood up and kept going. That is being determined.', ['But Wren stood up, brushed off the dirt, and kept running.', ['Every morning she ran to the park and back.', 'It hurt a lot.', 'One day she tripped on a root and scraped her knee.']]],
    ['What is the lesson of this story?', 'Keep trying, even when it is hard.', ['Never run in the park.', 'Always watch for roots.', 'Running is too dangerous.'], 'Wren kept trying, and she got faster.']] },
  { g: [3, 3], k: 'info', title: 'How Crows Remember', text: 'Crows are some of the smartest birds in the world. Scientists found that a crow can remember a human face for years. In one study, people wore a mask while they trapped crows. Later, crows scolded anyone who wore that same mask, even birds that had never been trapped. The crows had taught each other who to watch out for.', qs: [
    ['What did the scientists learn?', 'Crows remember faces and teach other crows.', ['Crows are afraid of all people.', 'Crows cannot see masks.', 'Crows forget things quickly.'], 'Crows scolded the mask for years, and even untrapped birds joined in.'],
    ['Which detail shows crows teach each other?', 'Birds that had never been trapped scolded the mask too.', ['Crows are some of the smartest birds.', 'People wore a mask.', 'Scientists did a study.'], 'Those birds could only have learned it from other crows.'],
    ['What does "scolded" most likely mean here?', 'made angry noises at', ['flew away from', 'sang sweetly to', 'shared food with'], 'The crows were warning about someone they did not trust.']] },
  { g: [3, 3], title: 'The Stick Sword', text: 'Dex held up the stick. "This is not a sword," he said. Old Clank folded his metal arms. "Every blade I have ever made began as something plain," the armor rumbled. "It is not the steel that makes a knight. It is what the knight does next." Dex looked at the stick again. Then he stood a little taller.', qs: [
    ['Why does Dex stand taller at the end?', "Old Clank's words made him feel braver.", ['The stick turned into steel.', 'He was trying to see over the stall.', 'Old Clank told him to.'], 'After hearing that a knight is made by what he does, Dex feels proud.'],
    ['What does Old Clank believe?', 'What you do matters more than what you carry.', ['Only steel swords are real.', 'Sticks are better than swords.', 'Dex should give up.'], '"It is not the steel that makes a knight. It is what the knight does next."', ['"It is not the steel that makes a knight."', ['Dex held up the stick.', 'Old Clank folded his metal arms.', 'Dex looked at the stick again.']]],
    ['What does the word "plain" mean in this passage?', 'simple and ordinary', ['shiny and sharp', 'very heavy', 'broken'], 'Old Clank means every great blade started as something simple.']] }
);
const passageQ = kind => g => {
  let ps = PASSAGES.filter(p => g >= p.g[0] && g <= p.g[1] && (kind === 'any' || (kind === 'info') === (p.k === 'info')));
  if (!ps.length) ps = PASSAGES.filter(p => g >= p.g[0] && g <= p.g[1]); if (!ps.length) ps = PASSAGES;
  const p = pick(ps), q = pick(p.qs), out = mc(q[0], q[1], q[2], q[3], { passage: p.text, ptitle: p.title, small: true });
  if (q[4]) out.partB = mc('Which sentence from the passage BEST supports your answer in Part A?', q[4][0], q[4][1], 'Good readers can point to the exact sentence that proves their answer.');
  return out;
};
SKILLS.reading.gen = passageQ('lit'); SKILLS.reading.n = 'Reading: Stories'; SKILLS.reading.std = 'RL.2–6.1,2,3,4';
addSkill('readinfo', 'Comprehension', { n: 'Reading: Information', sub: 'ela', std: 'RI.2–6.1,2,4,8', g: [2, 6], gen: passageQ('info') },
  ['Information texts teach you facts. Read the title first: it tells you the topic.', 'Look for signal words. "Because" and "so" tell you WHY something happens. "First" and "then" tell you the order.', 'When a question asks how you know, go back and find the sentence that says it. Do not answer from memory.']);

// ============================================================ listening (needs the read-aloud voice)
const SOUNDS = [
  ['cat', 'Which word RHYMES with the word you heard?', 'hat', ['cut', 'can', 'kit'], 'Cat and hat end with the same sounds: -at.'],
  ['night', 'Which word RHYMES with the word you heard?', 'kite', ['net', 'nice', 'neat'], 'Night and kite both end with the "ite" sound.'],
  ['ship', 'What sound does the word START with?', 'sh', ['s', 'ch', 'p'], 'Ship starts with the /sh/ sound.'],
  ['chair', 'What sound does the word START with?', 'ch', ['sh', 'k', 'th'], 'Chair starts with the /ch/ sound.'],
  ['duck', 'What sound does the word END with?', 'k', ['d', 'g', 't'], 'Duck ends with the /k/ sound.'],
  ['fish', 'What sound does the word END with?', 'sh', ['s', 'f', 'ch'], 'Fish ends with the /sh/ sound.'],
  ['elephant', 'How many syllables (beats) does the word have?', '3', ['2', '4', '1'], 'Clap it: EL-e-phant. Three beats.'],
  ['pencil', 'How many syllables (beats) does the word have?', '2', ['1', '3', '4'], 'Clap it: PEN-cil. Two beats.'],
  ['dog', 'How many syllables (beats) does the word have?', '1', ['2', '3', '4'], 'Dog is one beat.'],
  ['banana', 'How many syllables (beats) does the word have?', '3', ['2', '4', '5'], 'Clap it: ba-NA-na. Three beats.'],
  ['stop', 'Say the word WITHOUT its first sound. What is left?', 'top', ['sop', 'pot', 'stow'], 'Take the /s/ off stop and you get top.'],
  ['cart', 'Say the word WITHOUT its last sound. What is left?', 'car', ['art', 'cat', 'cut'], 'Take the /t/ off cart and you get car.'],
  ['man', 'Change the FIRST sound to /f/. What is the new word?', 'fan', ['fin', 'map', 'men'], 'Swap /m/ for /f/: man becomes fan.'],
  ['cake', 'Which word has the same MIDDLE sound?', 'rain', ['cat', 'kick', 'cook'], 'Cake and rain both have the long A sound in the middle.'],
  ['bed', 'Which word has the same MIDDLE sound?', 'ten', ['bead', 'bad', 'bid'], 'Bed and ten both have the short E sound.'],
  ['splash', 'Which two sounds do you hear at the START?', 's and p', ['s and l', 'p and l', 's and h'], 'Splash starts /s/ /p/ /l/. The first two are s and p.']
];
const SIGHT = [['because', 'become', 'before', 'between'], ['friend', 'found', 'front', 'fried'], ['people', 'purple', 'pebble', 'pupil'], ['thought', 'though', 'through', 'tough'], ['where', 'were', 'when', 'there'], ['said', 'sad', 'side', 'sand'], ['these', 'those', 'three', 'them'], ['could', 'cold', 'cloud', 'would'], ['again', 'against', 'agent', 'ago'], ['little', 'litter', 'title', 'kettle'], ['every', 'very', 'ever', 'even'], ['many', 'may', 'money', 'main'], ['laugh', 'large', 'lunch', 'light'], ['enough', 'enjoy', 'engine', 'eleven'], ['know', 'now', 'knew', 'snow'], ['what', 'want', 'that', 'wait'], ['does', 'dose', 'goes', 'done'], ['come', 'came', 'comb', 'some']];
addSkill('sounds', 'Phonological Awareness', { n: 'Listen for Sounds', sub: 'ela', std: 'RF.1.2 · RF.2.3', g: [2, 3], needs: 'speech', gen: () => { const it = pick(SOUNDS); return mc(it[1], it[2], it[3], `The word was "${it[0]}." ` + it[4], { say: `Listen. The word is: ${it[0]}. ... ${it[0]}.` }); } },
  ['Words are made of sounds. You can play with them like blocks: take one off, swap one, or count the beats.', 'RHYMING words end with the same sounds: cat, hat, bat. To count SYLLABLES, clap once for each beat: el-e-phant is three claps.', 'Press HEAR IT AGAIN as many times as you like. Say the word out loud yourself. Your mouth will help your ears.']);
addSkill('sight', 'High-Frequency Words', { n: 'Sight Words', sub: 'ela', std: 'RF.2.3f · RF.3.3d', g: [2, 3], needs: 'speech', gen: () => { const it = pick(SIGHT); return mc('Which word did you hear?', it[0], it.slice(1), `The word was "${it[0]}." Look at ALL the letters, not just the first one.`, { say: `Find the word: ${it[0]}. ... ${it[0]}.` }); } },
  ['Sight words are words you see so often that you should know them in a snap, without sounding them out.', 'Many of them look alike: where, were, wear. There, their, three. Look at every letter from start to end.', 'Listen to the whole word. Then check the first letter, the LAST letter, and how long the word is.']);
addSkill('listen', 'Listening', { n: 'Listening', sub: 'ela', std: 'SL.2–6.2 · SBAC Claim 3', g: [2, 6], needs: 'speech', gen: g => {
  let ps = PASSAGES.filter(p => g >= p.g[0] && g <= p.g[1]); if (!ps.length) ps = PASSAGES; const p = pick(ps), q = pick(p.qs);
  return mc(q[0], q[1], q[2], q[3], { say: `Listen carefully. ${p.title}. ... ${p.text}`, small: true, heard: p.title }); } },
  ['On a listening question you HEAR the passage instead of reading it. You cannot look back, so listen like a detective.', 'Before it starts, read the question. Then you know what to listen for.', 'You may press HEAR IT AGAIN. On the real test you can replay it too, so use that.']);

// ============================================================ geometry and measurement
const SHAPES3 = [
  I(3, 'Which shape is ALWAYS a quadrilateral?', 'rhombus', ['triangle', 'pentagon', 'circle'], 'A quadrilateral has 4 sides. A rhombus has 4 sides.'),
  I(3, 'A square is a special kind of...', 'rectangle', ['triangle', 'pentagon', 'hexagon'], 'A square has 4 right angles like every rectangle. Its sides just happen to be equal too.'),
  I(3, 'Which shape has 4 equal sides but might NOT have square corners?', 'rhombus', ['square', 'rectangle', 'trapezoid'], 'A rhombus has 4 equal sides. It only becomes a square if the corners are right angles.'),
  I(3, 'Which shape has exactly ONE pair of parallel sides?', 'trapezoid', ['rectangle', 'rhombus', 'square'], 'A trapezoid has one pair of sides that run side by side and never meet.'),
  I(3, 'Which of these is NOT a quadrilateral?', 'triangle', ['square', 'trapezoid', 'rhombus'], 'A triangle has 3 sides. Quadrilaterals have 4.'),
  I(4, 'What do we call two lines that never meet, like train tracks?', 'parallel', ['perpendicular', 'intersecting', 'curved'], 'Parallel lines stay the same distance apart forever.'),
  I(4, 'Lines that cross to make square corners are called...', 'perpendicular', ['parallel', 'curved', 'slanted'], 'Perpendicular lines meet at right angles, like the corner of a page.'),
  I(4, 'A triangle with one square corner is a...', 'right triangle', ['acute triangle', 'obtuse triangle', 'round triangle'], 'A right triangle has one 90-degree angle.'),
  I(4, 'How many lines of symmetry does a square have?', '4', ['1', '2', '8'], 'You can fold a square in half 4 ways so both sides match: up-down, left-right, and both diagonals.'),
  I(4, 'Which capital letter has a line of symmetry?', 'A', ['F', 'G', 'J'], 'Fold an A down the middle and both halves match.'),
  I(4, 'An angle SMALLER than a right angle is called...', 'acute', ['obtuse', 'straight', 'full'], 'Acute angles are less than 90 degrees. (A-CUTE little angle.)'),
  I(4, 'An angle BIGGER than a right angle but less than a straight line is called...', 'obtuse', ['acute', 'right', 'full'], 'Obtuse angles are between 90 and 180 degrees.'),
  I(5, 'Which statement is true of ALL parallelograms?', 'Opposite sides are parallel.', ['All sides are equal.', 'All angles are right angles.', 'They have exactly one pair of parallel sides.'], 'That is what makes a shape a parallelogram: two pairs of parallel sides.'),
  I(5, 'A triangle with all three sides different lengths is called...', 'scalene', ['isosceles', 'equilateral', 'regular'], 'Scalene: no sides match. Isosceles: two match. Equilateral: all three match.'),
  I(5, 'A triangle with exactly two equal sides is called...', 'isosceles', ['scalene', 'equilateral', 'right'], 'Isosceles triangles have two sides the same length.'),
  I(5, 'Which shape is NOT a parallelogram?', 'trapezoid', ['square', 'rhombus', 'rectangle'], 'A trapezoid has only one pair of parallel sides. A parallelogram needs two.'),
  I(5, 'Every square is also a...', 'rhombus and a rectangle', ['trapezoid', 'triangle', 'pentagon'], 'A square has 4 equal sides (rhombus) AND 4 right angles (rectangle).')
];
addSkill('shapes3', 'Geometry', { n: 'Shapes & Lines', sub: 'math', std: '3.G.1 · 4.G.1–3 · 5.G.3–4', g: [3, 5], gen: itemQ(SHAPES3) },
  ['Shapes belong to families. Any shape with 4 sides is a QUADRILATERAL. Squares, rectangles, rhombuses and trapezoids are all in that family.', 'PARALLEL lines never meet, like train tracks. PERPENDICULAR lines cross at a square corner, like a plus sign.', 'A square is the show-off of the family: it is a rectangle (4 right angles) AND a rhombus (4 equal sides) at the same time.']);
addSkill('angles', 'Measurement & Data', { n: 'Angles', sub: 'math', std: '4.MD.5–7 · 4.G.1', g: [4, 5], gen() {
  const t = rint(0, 3);
  if (t === 0) { const a = pick([25, 40, 65, 90, 110, 135, 160, 180]), nm = a < 90 ? 'acute' : a === 90 ? 'right' : a < 180 ? 'obtuse' : 'straight'; return mc(`An angle measures ${a}°. What kind of angle is it?`, nm, ['acute', 'right', 'obtuse', 'straight'].filter(x => x !== nm), 'Less than 90° is acute. Exactly 90° is right. Between 90° and 180° is obtuse. Exactly 180° is straight.'); }
  if (t === 1) { const a = rint(2, 16) * 5; return mc(`Two angles fit together to make a right angle. One is ${a}°. How big is the other?`, `${90 - a}°`, [`${180 - a}°`, `${90 + a}°`, `${a}°`, `${100 - a}°`].filter(x => x !== `${90 - a}°`), `A right angle is 90°. 90 − ${a} = ${90 - a}.`); }
  if (t === 2) { const a = rint(4, 32) * 5; return mc(`Two angles sit on a straight line. One is ${a}°. How big is the other?`, `${180 - a}°`, [`${90 - a > 0 ? 90 - a : a + 10}°`, `${360 - a}°`, `${a}°`, `${190 - a}°`].filter(x => x !== `${180 - a}°`), `A straight line is 180°. 180 − ${a} = ${180 - a}.`); }
  const it = pick([['a full turn', 360], ['a half turn', 180], ['a quarter turn', 90]]); return mc(`How many degrees are in ${it[0]}?`, `${it[1]}°`, [90, 180, 270, 360, 100].filter(x => x !== it[1]).map(x => x + '°'), 'A full turn is 360°. Half of that is 180°. A quarter is 90°.');
} }, ['An angle measures a TURN. We count turns in degrees. A full spin all the way around is 360 degrees.', 'A square corner is a RIGHT angle: 90 degrees. Smaller than that is ACUTE. Bigger is OBTUSE. A flat line is 180 degrees.', 'Angles add up. If two angles make a right angle and one is 30, the other must be 60, because 30 + 60 = 90.']);
const UNITS = [['feet', 'inches', 12], ['yards', 'feet', 3], ['meters', 'centimeters', 100], ['kilometers', 'meters', 1000], ['hours', 'minutes', 60], ['minutes', 'seconds', 60], ['pounds', 'ounces', 16], ['gallons', 'quarts', 4], ['kilograms', 'grams', 1000], ['liters', 'milliliters', 1000]];
addSkill('convert', 'Measurement & Data', { n: 'Unit Conversions', sub: 'math', std: '4.MD.1 · 5.MD.1', g: [4, 5], gen(g) {
  const [big, small, f] = pick(UNITS), n = rint(2, 9);
  if (g >= 5 && coin()) { const A = n; return mc(`${fmt(n * f)} ${small} = ? ${big}`, A, [n * f, n + f, n * 10, n + 1].filter(x => x !== A), `There are ${fmt(f)} ${small} in 1 ${big.replace(/s$/, '').replace(/feet/, 'foot')}. Going to the BIGGER unit, divide: ${fmt(n * f)} ÷ ${fmt(f)} = ${n}.`); }
  if (g >= 5 && f >= 100 && coin()) { const h = rint(11, 49) * 10 / 100; return mc(`${num(h)} ${big} = ? ${small}`, fmt(h * f), [h * f * 10, h * f / 10, h + f, h * f + 100].map(x => fmt(x)).filter(x => x !== fmt(h * f)), `Multiply by ${fmt(f)}: ${num(h)} × ${fmt(f)} = ${fmt(h * f)}.`); }
  return mc(coin() ? `${n} ${big} = ? ${small}` : `Wren's rope is ${n} ${big} long. How many ${small} is that?`, fmt(n * f), [n + f, n * f + f, n * f - n, n * f * 10].map(fmt).filter(x => x !== fmt(n * f)), `There are ${fmt(f)} ${small} in 1 ${big.replace(/s$/, '').replace(/feet/, 'foot')}. Going to the SMALLER unit, multiply: ${n} × ${fmt(f)} = ${fmt(n * f)}.`);
} }, ['To change units you need the magic number between them. 12 inches in a foot. 3 feet in a yard. 60 minutes in an hour. 100 centimeters in a meter.', 'Going to a SMALLER unit? You will need MORE of them, so multiply. 3 feet is 3 × 12 = 36 inches.', 'Going to a BIGGER unit? You will need FEWER, so divide. 300 centimeters is 300 ÷ 100 = 3 meters.']);
addSkill('coord', 'Geometry', { n: 'Coordinate Grid', sub: 'math', std: '5.G.1–2 · 6.NS.6–8', g: [5, 6], gen(g) {
  const a = rint(1, 9), b = rint(1, 9), t = rint(0, g >= 6 ? 4 : 2);
  if (t === 0) return mc(`Start at (0, 0). Go ${a} to the right and ${b} up. Where are you?`, `(${a}, ${b})`, [`(${b}, ${a})`, `(${a}, ${a + b})`, `(${a + b}, ${b})`, `(${b}, ${b})`].filter(x => x !== `(${a}, ${b})`), 'The first number is how far ACROSS. The second is how far UP. Across first, then up.');
  if (t === 1) return mc(`In the ordered pair (${a}, ${b}), what does the ${b} tell you?`, 'how far up to go', ['how far right to go', 'how big the point is', 'which grid to use'], 'The second number is the y-coordinate: how far up.');
  if (t === 2) { const c = rint(1, 9), d = Math.abs(a - c) || 3, c2 = a - d > 0 ? a - d : a + d; return mc(`How far apart are the points (${a}, ${b}) and (${c2}, ${b})?`, `${d} units`, [`${a + c2} units`, `${b} units`, `${d + 1} units`, `${d * 2} units`].filter(x => x !== `${d} units`), `They are on the same row (both have y = ${b}), so just subtract the x-values: ${Math.max(a, c2)} − ${Math.min(a, c2)} = ${d}.`); }
  if (t === 3) { const sx = coin() ? -1 : 1, sy = coin() ? -1 : 1, Q = sx > 0 ? (sy > 0 ? 'I' : 'IV') : (sy > 0 ? 'II' : 'III'); return mc(`In which quadrant is the point (${sx * a}, ${sy * b})?`, 'Quadrant ' + Q, ['I', 'II', 'III', 'IV'].filter(x => x !== Q).map(x => 'Quadrant ' + x), 'Quadrant I is top right (+, +). Then go counter-clockwise: II is top left, III is bottom left, IV is bottom right.'); }
  return mc(`The point (${a}, ${b}) is reflected across the x-axis. Where does it land?`, `(${a}, −${b})`, [`(−${a}, ${b})`, `(−${a}, −${b})`, `(${b}, ${a})`], 'Flipping over the x-axis keeps the x the same and flips the sign of the y.');
} }, ['A coordinate grid is a map. Every point has an address made of two numbers, like (3, 5).', 'The first number says how far to go ACROSS. The second says how far to go UP. Remember: you walk to the elevator, then ride it up.', 'Two points on the same row have the same second number. To find how far apart they are, subtract the first numbers.']);

// ============================================================ reasoning and research
addSkill('reason', 'Algebra & Algebraic Thinking', { n: 'Who Is Right?', sub: 'math', std: 'MP.3 · SBAC Claim 3', g: [2, 6], gen(g) {
  const t = pick(g <= 2 ? [0, 1, 3] : g === 3 ? [0, 1, 2, 3, 4] : g === 4 ? [1, 2, 4] : [2, 4, 5]);
  if (t === 0) { const at = rint(4, 9), ao = rint(0, 5), bt = rint(1, at - 2), bo = rint(ao + 2, 9), a = at * 10 + ao, b = bt * 10 + bo, wrong = (at - bt) * 10 + (bo - ao);
    return mc(`Bash solved ${a} − ${b} and got ${wrong}. The right answer is ${a - b}. What was his mistake?`, 'In the ones place he took the smaller digit from the bigger one instead of regrouping.', ['He added instead of subtracting.', 'He forgot to subtract the tens.', 'He made no mistake.'], `${ao} ones is not enough to take away ${bo} ones. He needed to trade 1 ten for 10 ones first.`, { small: true }); }
  if (t === 1) { const a = rint(3, 9), b = rint(2, 8), add = g <= 2; return mc(`Dex says ${a} ${add ? '+' : '×'} ${b} gives the same answer as ${b} ${add ? '+' : '×'} ${a}. Wren says the answers are different. Who is correct?`, `Dex. You can ${add ? 'add' : 'multiply'} in any order.`, ['Wren. The bigger number must go first.', 'Wren. Switching the order changes the answer.', 'Neither. You cannot tell without working it out.'], `${a} ${add ? '+' : '×'} ${b} = ${add ? a + b : a * b} and ${b} ${add ? '+' : '×'} ${a} = ${add ? a + b : a * b}. Order does not matter.`, { small: true }); }
  if (t === 2) { const a = rint(2, 5), b = a + rint(2, 5); return mc(`Bash says 1/${b} is greater than 1/${a} because ${b} is greater than ${a}. Is he correct?`, 'No. Cutting a whole into more pieces makes each piece smaller.', [`Yes. ${b} is greater than ${a}.`, 'Yes. A bigger bottom number always means a bigger fraction.', 'No. Fractions cannot be compared.'], `Share a pizza with ${a} people or with ${b} people. With ${b}, your slice is smaller. So 1/${b} is less than 1/${a}.`, { small: true }); }
  if (t === 3) return mc('Wren says, "An even number plus an even number is always even." Which example supports her?', pick(['4 + 6 = 10', '2 + 8 = 10', '6 + 6 = 12']), ['3 + 4 = 7', '5 + 5 = 10', '2 + 3 = 5'], 'To support her claim, both numbers being added must be even, and the answer must be even.');
  if (t === 4) { const a = rint(21, 79), b = rint(21, 79), ra = Math.round(a / 10) * 10, rb = Math.round(b / 10) * 10; return mc(`Munch says ${a} + ${b} is about ${ra + rb}. Is that a reasonable estimate?`, `Yes. ${a} is about ${ra} and ${b} is about ${rb}.`, [`No. The answer must be exactly ${a + b}.`, `No. It should be about ${ra + rb + 100}.`, 'No. You cannot estimate addition.'], `Round each number to the nearest ten, then add: ${ra} + ${rb} = ${ra + rb}. The exact answer, ${a + b}, is close.`, { small: true }); }
  const a = rint(2, 6), b = rint(2, 5), c = rint(2, 5); return mc(`Dex says ${a} + ${b} × ${c} = ${(a + b) * c}. Priya says it equals ${a + b * c}. Who is correct?`, 'Priya. You multiply before you add.', ['Dex. You always work from left to right.', 'Both. There are two right answers.', 'Neither of them.'], `Multiply first: ${b} × ${c} = ${b * c}. Then add: ${a} + ${b * c} = ${a + b * c}.`, { small: true });
} }, ['Some test questions do not ask for an answer. They ask whether someone ELSE is right, and why.', 'First, solve it yourself. Then look at what the other person did. Where did their path split from yours?', 'The best choice does two jobs: it says who is right AND gives the real math reason. Watch out for choices with a true ending but a wrong reason.']);
const RESEARCH = [
  I(3, 'Priya is writing a report on how beetles make light. Which source would help MOST?', 'a science book about insects', ['a comic book about superheroes', 'a cookbook', 'a map of Wexler Falls'], 'Pick the source that is about your topic and written to teach facts.'),
  I(3, 'Where would you look to find the meaning of the word "ominous"?', 'a dictionary', ['an atlas', 'a calendar', 'a phone book'], 'A dictionary tells what words mean.'),
  I(3, 'Which part of a book lists the chapters and their page numbers?', 'the table of contents', ['the glossary', 'the index', 'the title page'], 'The table of contents is at the front and shows what is in each chapter.'),
  I(3, 'Which part of a book explains what important words mean?', 'the glossary', ['the table of contents', 'the cover', 'the title page'], 'A glossary is a mini dictionary at the back of a book.'),
  I(3, 'Which sentence is a FACT, not an opinion?', 'A crow can remember a human face.', ['Crows are the coolest birds.', 'Everyone should like crows.', 'Crows are scarier than owls.'], 'A fact can be checked and proven. An opinion is what someone thinks or feels.'),
  I(4, 'Which is the BEST search phrase for learning what raccoons eat?', 'raccoon diet', ['raccoon', 'animals', 'what do things eat'], 'Good search words are short and exact: the animal and the topic.'),
  I(4, 'Which question would make the BEST research project?', 'How do critters see in the dark?', ['Are critters cool?', 'What is a critter?', 'Do you like critters?'], 'A good research question cannot be answered with just yes, no, or one word.'),
  I(4, 'Which note belongs in a report about how potions are brewed?', 'The cauldron is heated before the moss is added.', ['Nana Newt has a purple hat.', 'Dex likes gummy worms.', 'The market has lanterns.'], 'Only keep notes that are about your topic.'),
  I(4, 'Dex finds a web page with no author and lots of spelling mistakes. What should he do?', 'Look for a more trustworthy source.', ['Copy it exactly.', 'Use it because it was the first result.', 'Share it with everyone.'], 'Trustworthy sources say who wrote them and are carefully checked.'),
  I(5, 'Wren copies a sentence word for word from a book into her report. What must she do?', 'Put it in quotation marks and say where it came from.', ['Change one word so it is hers.', 'Nothing. Books are free to copy.', 'Make the letters bigger.'], 'Using someone else\'s exact words without saying so is called plagiarism.'),
  I(5, 'Two sources disagree about how fast Shamblers walk. What is the best next step?', 'Check a third reliable source.', ['Pick the one you like better.', 'Use the bigger number.', 'Leave that part out and guess.'], 'When sources disagree, look for more evidence.'),
  I(5, 'Which source would give the most up-to-date facts about tonight\'s storm?', "today's weather report", ['a ten-year-old encyclopedia', 'a book of fairy tales', 'a history book'], 'For things that change quickly, use the newest source.'),
  I(6, 'Which source is MOST likely to be biased about whether the ferry is safe?', 'an ad from the company that owns the ferry', ['a safety report from inspectors', 'a news story quoting both sides', 'a list of ferry times'], 'Someone who gains from your choice may only tell you one side.'),
  I(6, 'Priya wants to put a fact from an article into her own words. This is called...', 'paraphrasing', ['plagiarizing', 'quoting', 'editing'], 'Paraphrasing means restating an idea in your own words. You still say where it came from.')
];
addSkill('research', 'Research', { n: 'Research Skills', sub: 'ela', std: 'W.3.8 – W.6.8 · SBAC Claim 4', g: [3, 6], gen: itemQ(RESEARCH) },
  ['Research means finding answers in sources: books, articles and websites. Not every source is a good one.', 'A good source is ABOUT your topic, says who wrote it, and is meant to teach facts. A FACT can be checked. An OPINION is what someone feels.', 'Use your own words when you take notes. If you copy the exact words, put them in quotation marks and say where they came from.']);
Object.assign(DOMAIN, { reading: 'Comprehension: Literature', readinfo: 'Comprehension: Informational', maze: 'Comprehension: Informational' });

// ============================================================ Maze Dash (the DIBELS Maze format)
const MAZES = [
  ['The Lost Boltbug', 'Dex heard a tiny buzz under the porch. He got down on his {knees|blue|sang} and looked. A little Boltbug was {stuck|happy|seven} in a spider web. Its light was very {dim|loud|tall}. Dex used a stick to {break|sleep|green} the web. The Boltbug shook its {wings|books|soup} and flew up. It landed on his {cap|river|because}. Then its light grew {bright|pencil|under} again. "You can stay with {me|it|of}," said Dex. The Boltbug buzzed {twice|chair|never}. That meant {yes|sock|ran}.'],
  ['Rain', 'Rain starts high up in the {sky|shoe|jump}. Tiny drops of water stick {together|purple|eaten} inside a cloud. When the drops get too {heavy|funny|seven}, they fall. Rain fills up rivers and {ponds|chairs|songs}. Plants need rain to {grow|laugh|blue}. Animals {drink|paint|tall} it. Too much rain can cause a {flood|pencil|happy}. Too little rain is called a {drought|doorway|dinner}. After the rain {stops|sings|green}, you may see a {rainbow|sandwich|quickly}.'],
  ["Bash's Tomatoes", 'Bash wanted to grow tomatoes on the roof. First he filled ten pots with {dirt|milk|noise}. He put one seed in each {pot|sky|run}. Every morning he gave them {water|shoes|songs}. For a long time, nothing {happened|purple|window}. Bash felt {sad|tall|seven}. Then one day a tiny green {leaf|rock|spoon} poked out. Soon there were {more|under|sing}. By summer the plants were as {tall|wet|loud} as Bash. He picked the first red {tomato|pencil|river} and shared it with his {friends|chairs|clouds}.'],
  ['The Night Market', 'The Night Market opens when the sun goes {down|soup|happy}. Lanterns hang over every {stall|cloud|jump}. A suit of armor sells {swords|rain|sleepy}. A newt in a tall hat stirs a {pot|shoe|song} of potion. A ghost with glasses reads old {books|rocks|feet}. Nobody here takes {money|trees|quiet}. To get a sword, you must answer a hard {question|window|purple}. Dex thinks that is {fair|blue|seven}. After all, a sharp mind is better than a sharp {blade|soup|green}.']
];
Learn.mazeDash = async function () {
  const who = this.teacher();
  await say(who, 'MAZE DASH. A story with missing words. For each gap, pick the word that makes sense. You have three minutes. Go for as many as you can, but a wrong pick costs you half a point.');
  const [title, raw] = pick(MAZES), parts = raw.split(/\{[^}]+\}/), gaps = [...raw.matchAll(/\{([^}]+)\}/g)].map(m => { const o = m[1].split('|'); return { a: o[0], ch: shuffle(o.slice()), pick: null }; });
  const res = await new Promise(done => {
    let cur = 0, left = 180000, hits = [], sel = 0;
    const end = () => { UI.pop(m); done({ right: gaps.filter(x => x.pick === x.a).length, wrong: gaps.filter(x => x.pick && x.pick !== x.a).length, n: gaps.length, time: 180000 - left }); };
    const choose = i => { gaps[cur].pick = gaps[cur].ch[i]; Snd.sfx('move'); cur++; sel = 0; if (cur >= gaps.length) end(); };
    const m = {
      update(dt, pr) { left -= dt; if (left <= 0) { end(); return; } for (const k of pr) { if (k === 'left') sel = (sel + 2) % 3; if (k === 'right') sel = (sel + 1) % 3; if (k === 'a') { choose(sel); return; } } },
      tap(x, y) { const h = hits.find(r => inRect(x, y, r)); if (h) choose(h.i); },
      draw() {
        ctx.fillStyle = 'rgba(12,6,30,.8)'; ctx.fillRect(0, 0, W, H); panel(24, 14, W - 48, H - 28);
        setFont(18, true); text('MAZE DASH', 48, 34, '#ffd76a'); setFont(24); text(title, W / 2, 38, '#c8ffb8', 'center');
        const sec = Math.ceil(left / 1000); text(`${Math.floor(sec / 60)}:${String(sec % 60).padStart(2, '0')}`, W - 48, 38, left < 30000 ? '#ff8a7a' : '#fff', 'right'); bar(48, 76, W - 96, 8, left / 180000, left < 30000 ? '#ff5a48' : '#7fe0d8');
        setFont(27); let x = 52, y = 104; const sp = ctx.measureText(' ').width;
        const put = (w, col, box) => { const ww = ctx.measureText(w).width; if (x + ww > W - 56) { x = 52; y += 40; } if (box) rbox(x - 6, y - 3, ww + 12, 34, 8, box[0], box[1], 2); text(w, x, y, col); x += ww + sp; };
        parts.forEach((p, i) => { for (const w of p.trim().split(/\s+/)) if (w) put(w, '#f4eeff'); if (i < gaps.length) { const g = gaps[i]; if (i < cur) put(g.pick, '#ffd76a'); else if (i === cur) put('______', '#fff', ['#6652c0', '#ffd76a']); else put('____', '#6d6680'); } });
        hits = [];
        gaps[cur].ch.forEach((c, i) => { const r = { x: 60 + i * 285, y: H - 150, w: 270, h: 76, i }; rbox(r.x + 2, r.y + 5, r.w, r.h, 16, 'rgba(8,4,20,.4)'); rbox(r.x, r.y, r.w, r.h, 16, i === sel ? '#6652c0' : '#4a3a8e', i === sel ? '#ffd76a' : '#7a66d0', 3); setFont(38); text(c, r.x + r.w / 2, r.y + 20, '#fff', 'center'); hits.push(r); });
        setFont(21); text(`Gap ${cur + 1} of ${gaps.length}`, W / 2, H - 62, '#8f86a8', 'center');
      }
    };
    UI.push(m);
  });
  const score = Math.max(0, res.right - res.wrong / 2), prize = Math.round(score * 6);
  (G.learn.maze = G.learn.maze || []).push({ s: score, r: res.right, w: res.wrong, n: res.n }); G.scrap += prize;
  this.record({ skill: 'maze' }, res.right >= Math.ceil(res.n * .8) && res.wrong <= 1);
  Snd.sfx(score >= res.n * .7 ? 'badge' : 'ok');
  await say(null, `MAZE DASH RESULTS\n${res.right} right, ${res.wrong} wrong, out of ${res.n} gaps in ${Math.round(res.time / 1000)} seconds.\nScore: ${score}  (right answers minus half of the wrong ones)   ·   +${prize} scrap`, { col: '#ffd76a' });
  await say(who, res.wrong > res.right / 2 ? 'Slow down a little. Read the whole sentence before you pick. A guess that misses costs you.' : score >= res.n * .7 ? 'That was sharp. Fast AND careful. That is exactly how the real one is scored.' : 'Good run. Next time, see if you can get a few more gaps before the clock runs out.');
  await checkFeats();
};

// ============================================================ Read-Aloud Check (oral reading fluency, scored by a grown-up)
const ORAL = [
  ['The Clever Crow', 'A crow lived in the big oak tree behind the school. Every day at noon, she flew down to the lunch tables. The kids liked to feed her. One boy gave her a piece of bread. One girl gave her a slice of apple. The crow liked apples best of all. One day there were no kids at the tables. There was no bread. There was no apple. The crow was hungry. She looked around the yard. Then she saw a shiny lunch box under a bench. She hopped over and tapped it with her beak. The lid popped open. Inside was half a sandwich and three grapes. The crow ate the grapes first. She saved the sandwich for later. After that, the crow checked under the bench every single day.'],
  ['The Storm', 'The sky was dark and the wind began to blow. Dex pulled his hood over his head and ran. Rain fell in big cold drops. First it was a little rain. Then it was a lot. He could hear thunder far away, and it was getting closer. Dex jumped over a puddle and slipped on the wet grass. He got up fast. His knees were muddy, but he did not stop. At last he saw the water tower. A warm yellow light was on in the window. His friends had left it on for him. Dex climbed the ladder as fast as he could. Inside, it was dry and it smelled like soup. Bash handed him a towel. Priya handed him a bowl. Nobody said a word about the mud.']
];
Learn.readAloud = async function () {
  await say(null, 'READ-ALOUD CHECK (needs a grown-up). The reader reads the passage OUT LOUD for one minute. The grown-up holds the tablet and taps any word that is read wrong or skipped.');
  await say(null, 'When the minute ends, tap the LAST word that was read. The game then shows words correct per minute and accuracy, the same two numbers the school reading check uses.');
  if (await ask(null, 'Grown-up holding the tablet? Reader ready?', ['Start the timer', 'Not now']) !== 0) return;
  const [title, body] = pick(ORAL), words = body.split(/\s+/);
  const res = await new Promise(done => {
    let left = 60000, phase = 'read', rects = [], doneHit = null; const bad = new Set();
    const m = {
      update(dt) { if (phase === 'read') { left -= dt; if (left <= 0) { left = 0; phase = 'last'; Snd.sfx('badge'); } } },
      tap(x, y) {
        if (phase === 'read' && doneHit && inRect(x, y, doneHit)) { phase = 'last'; return; }
        const i = rects.findIndex(r => r && inRect(x, y, r)); if (i < 0) return;
        if (phase === 'read') { bad.has(i) ? bad.delete(i) : bad.add(i); Snd.sfx('move'); }
        else { UI.pop(m); done({ last: i, errs: [...bad].filter(b => b <= i).length, ms: 60000 - left }); }
      },
      draw() {
        ctx.fillStyle = '#16102e'; ctx.fillRect(0, 0, W, H); panel(14, 10, W - 28, H - 20);
        setFont(18, true); text(title.toUpperCase(), 36, 28, '#ffd76a'); setFont(26); const sec = Math.ceil(left / 1000);
        text(phase === 'read' ? `0:${String(sec).padStart(2, '0')}` : 'TIME! Tap the LAST word read.', W - 36, 30, phase === 'read' ? '#fff' : '#ffb07a', 'right');
        setFont(31); let x = 40, y = 78; const sp = ctx.measureText(' ').width; rects = [];
        words.forEach((w, i) => { const ww = ctx.measureText(w).width; if (x + ww > W - 44) { x = 40; y += 46; } const r = { x: x - 5, y: y - 5, w: ww + 10, h: 42 }; rects.push(r); if (bad.has(i)) rbox(r.x, r.y, r.w, r.h, 8, '#b03a4c'); text(w, x, y, bad.has(i) ? '#fff' : '#f4eeff'); x += ww + sp; });
        if (phase === 'read') { doneHit = { x: W - 250, y: H - 74, w: 220, h: 50 }; rbox(doneHit.x, doneHit.y, doneHit.w, doneHit.h, 25, '#4a3a8e', '#f2c14e', 2.5); setFont(17, true); text('FINISHED EARLY', doneHit.x + 110, doneHit.y + 14, '#fff', 'center'); setFont(21); text('Tap a word that is read wrong or skipped. Tap again to undo.', 40, H - 60, '#8f86a8'); }
      }
    };
    UI.push(m);
  });
  const read = res.last + 1, correct = read - res.errs, wcpm = Math.round(correct * 60000 / Math.max(15000, res.ms)), acc = Math.round(100 * correct / read);
  (G.learn.orf = G.learn.orf || []).push({ wcpm, acc, d: Date.now() });
  Snd.sfx('badge');
  await say(null, `READ-ALOUD RESULTS\nWords read: ${read}   ·   Errors: ${res.errs}\nWords correct per minute: ${wcpm}   ·   Accuracy: ${acc}%`, { col: '#ffd76a' });
  await say(null, `${acc >= 96 ? 'That accuracy is strong.' : acc >= 90 ? 'Accuracy is fair. Reading a little slower may help.' : 'Accuracy is low on this passage. Try reading it together first.'} Past checks are saved on the Report Card. Compare these two numbers with the reading report from school, which uses the same measure.`);
  G.scrap += 20; await checkFeats();
};

// ============================================================ Writing Workshop (typed sentences, marked by the grader)
const WRITE = [
  { g: 2, kind: 'opinion', task: 'Which makes the better pet for the Nest: a Gloop or a Boltbug?', src: [], q: 'Write ONE sentence that tells your opinion and gives a reason.', hint: 'Start with "I think..." and add "because...".',
    good: ['I think a Boltbug is the better pet because it can light up the dark.', 'A Gloop is the best pet because it is friendly and soft.', 'The Boltbug is better because its light helps us see at night.', 'I think the Gloop is better because it gives hugs.'], poor: ['Boltbugs are beetles.', 'I saw a Gloop by the pond.', 'I like pets.', 'Pets are animals.'] },
  { g: 2, kind: 'informative', task: 'A new kid has never heard of the Night Market.', src: [], q: 'Write ONE sentence that tells what the Night Market is.', hint: 'Say what it is and what happens there.',
    good: ['The Night Market is a place where friendly monsters trade swords and potions for math answers.', 'The Night Market is where you can earn items by solving problems.', 'It is a market where monsters sell swords, potions and magic.'], poor: ['I like it.', 'Dex has a red cap.', 'It is night.', 'Markets are fun.'] },
  { g: 2, kind: 'explain', task: 'Is 47 greater than 39?', src: [], q: 'Write ONE sentence that explains how you know.', hint: 'Talk about the tens.',
    good: ['47 is greater because it has 4 tens and 39 only has 3 tens.', 'Yes, because 4 tens is more than 3 tens.', '47 is bigger since 40 is more than 30.'], poor: ['Yes.', '47 and 39 are numbers.', 'Because I know.', 'I counted.'] },
  { g: 3, kind: 'informative', task: 'You are writing a paragraph about why critters make good friends.', src: ['They warn you when zombies are near.', 'They keep you company at night.', 'They almost never eat your gummy worms.'], q: 'Write a TOPIC SENTENCE that introduces the whole paragraph.', hint: 'Do not give one detail. Tell what ALL the details are about.',
    good: ['Critters make great friends for many reasons.', 'There are many reasons why critters are good friends to have.', 'A critter is one of the best friends you can have.'], poor: ['They warn you about zombies.', 'Gummy worms are tasty.', 'Critters keep you company at night.', 'I have a critter.'] },
  { g: 3, kind: 'informative', task: 'You wrote a paragraph about how storms form. It needs an ending.', src: ['Warm air rises.', 'Clouds grow tall and dark.', 'Rain and lightning follow.'], q: 'Write a CONCLUSION sentence that wraps up the paragraph.', hint: 'Sum it up. Do not add a new fact.',
    good: ['That is how a calm sky turns into a storm.', 'So a storm is made step by step from warm air, clouds and rain.', 'Now you know how storms form.'], poor: ['Warm air rises.', 'I do not like storms.', 'Lightning is hot.', 'The end.'] },
  { g: 3, kind: 'explain', task: 'Dex says 3/4 is greater than 3/8.', src: [], q: 'Is he right? Write ONE sentence that explains why.', hint: 'Think about the size of the pieces.',
    good: ['He is right because fourths are bigger pieces than eighths.', 'Dex is right since three big pieces are more than three small pieces.', 'Yes, because cutting something into 4 pieces makes bigger pieces than cutting it into 8.'], poor: ['He is right.', 'Fractions are hard.', '8 is bigger than 4.', 'I think so.'] },
  { g: 4, kind: 'opinion', task: 'Should the crew stay in Wexler Falls or leave on the ferry?', src: ['The colony has food, doctors and walls.', 'Other kids may still be hiding in town.', 'The Nest\'s beacon is the only signal that can reach them.'], q: 'Write ONE sentence that states your claim and gives a reason from the notes.', hint: 'Pick a side, then use "because" and one of the notes.',
    good: ['The crew should stay because other kids may still be hiding in town.', 'They should leave on the ferry because the colony has food and doctors.', 'I think they should stay since the beacon is the only signal that can reach the other kids.'], poor: ['The ferry is a boat.', 'I do not know.', 'The colony has walls.', 'Dex is brave.'] },
  { g: 5, kind: 'informative', task: 'Priya concluded that temperature affects how fast Shamblers move.', src: ['She timed ten Shamblers crossing a field.', 'Afternoon zombies were almost twice as fast as morning ones.', 'Mornings were cold and afternoons were warm.'], q: 'Write ONE sentence that gives EVIDENCE for her conclusion.', hint: 'Use the numbers or what she measured.',
    good: ['The zombies she timed in the warm afternoon were almost twice as fast as the ones in the cold morning.', 'Her evidence is that afternoon Shamblers crossed the field almost twice as fast.', 'Shamblers moved much faster when it was warm than when it was cold.'], poor: ['Priya is smart.', 'Zombies are slow.', 'She has a theory.', 'It was a football field.'] },
  { g: 2, kind: 'narrative', task: 'Dex opened the stash and gasped.', src: [], q: 'Write the NEXT sentence of the story.', hint: 'What did he see? What did he do?',
    good: ['Inside was a tiny dragon egg glowing like a lantern.', 'A sleepy Gloop was curled up on a pile of comics.'], poor: ['The end.', 'I like stories.'] }
];
Learn.workshop = async function () {
  const who = this.teacher(), g = G.learn.grade;
  toast('Getting the marker ready...'); await Grader.load();
  const pool = WRITE.filter(p => p.g <= g && p.g >= g - 2 && Grader.canMark(p));
  if (!pool.length) { await say(who, "I can't mark writing on this device right now. The marker did not load. A grown-up can add a Claude key under Options to turn on marking."); return; }
  const done = (G.learn.wrote = G.learn.wrote || {}), p = pool.filter(x => !done[x.task])[0] || pick(pool);
  await say(who, `WRITING WORKSHOP. On the real test, some answers are not multiple choice. You have to WRITE them. ${Grader.key() ? 'Claude will read your sentence and tell you how you did.' : 'I will check that your sentence is on the topic and does the job.'}`);
  const drawTask = note => () => {
    ctx.fillStyle = 'rgba(12,6,30,.82)'; ctx.fillRect(0, 0, W, H); panel(24, 14, W - 48, 420);
    setFont(18, true); text('WRITING WORKSHOP', 48, 34, '#ffd76a'); setFont(24); text(p.kind.toUpperCase(), W - 48, 38, '#ffb0d0', 'right');
    let y = 78; setFont(28); wrap(p.task, W - 110).forEach(l => { text(l, 52, y, '#fff'); y += 34; });
    if (p.src.length) { y += 6; setFont(24); for (const s of p.src) { text('•  ' + s, 64, y, '#c8ffb8'); y += 29; } }
    y += 10; setFont(27); wrap(p.q, W - 110).forEach(l => { text(l, 52, y, '#ffd76a'); y += 33; });
    if (note) { y += 8; setFont(24); wrap(note, W - 110).forEach(l => { text(l, 52, y, '#ffb07a'); y += 29; }); }
  };
  let note = '', value = '';
  for (let tries = 0; tries < 3; tries++) {
    const t = await typeAnswer('Your sentence:', { draw: drawTask(note), value });
    if (t === null) { await say(who, 'No problem. The Workshop is here whenever you want it.'); return; }
    value = t; toast('Marking...');
    let v = null; try { v = await Grader.grade(p, t, g); } catch (e) {}
    if (!v) { await say(who, 'The marker could not read that one. Try again in a moment.'); return; }
    const L = G.learn; L.writing = L.writing || { n: 0, r: 0 }; L.writing.n++;
    if (v.ok) {
      L.writing.r++; done[p.task] = 1; G.scrap += 20; Snd.sfx('badge');
      const eg = G.eggs.find(x => !x.hatched); if (eg) eg.we = Math.min(20, eg.we + 2);
      await say(null, `★ "${t}" ★\n${v.note || 'That sentence does the job!'}   +20 scrap`, { col: '#ffd76a' });
      await say(who, `Nice writing. Here is another strong one, just to compare: "${p.good[0]}"`);
      await checkFeats(); return;
    }
    note = (v.note || 'Not quite yet. ' + p.hint) + (tries < 2 ? '  Fix it and try again.' : ''); Snd.sfx('wrong');
  }
  await say(who, `Good effort. That one is tricky. Here is one way to do it: "${p.good[0]}"  Come back and try a different task any time.`);
};
Learn.practiceMenu = async function () {
  while (true) {
    const i = await menu(['Practice Test  (10 questions)', 'Maze Dash  (3-minute reading)', 'Read-Aloud Check  (with a grown-up)', 'Writing Workshop', 'Back'], { x: 240, y: 190, w: 480, title: 'PRACTICE & TESTS' });
    if (i === 0) await this.testDay(); else if (i === 1) await this.mazeDash(); else if (i === 2) await this.readAloud(); else if (i === 3) await this.workshop(); else return;
  }
};

// ============================================================ final grade 2 pass: the standards that were still uncovered
addSkill('numline', 'Number & Operations', { n: 'Number Lines', sub: 'math', std: '2.MD.6 · 3.NF.2', g: [2, 3], gen(g) {
  const t = rint(0, g >= 3 ? 4 : 3);
  if (t === 0) { const a = rint(1, 8) * 10; return mc(`A number line is marked ${a - 10}, ${a}, ${a + 10}, ${a + 20}. Which number is HALFWAY between ${a} and ${a + 10}?`, a + 5, [a + 10, a + 2, a - 5, a + 15].filter(x => x !== a + 5), `Halfway between ${a} and ${a + 10} is 5 more than ${a}: ${a + 5}.`); }
  if (t === 1) { const a = rint(12, 60), b = rint(5, 30); return mc(`Start at ${a} on a number line. Jump FORWARD ${b}. Where do you land?`, a + b, [a - b > 0 ? a - b : a + b + 10, a + b + 10, a + b - 1, a + b + 1].filter(x => x !== a + b), `Forward means add: ${a} + ${b} = ${a + b}.`); }
  if (t === 2) { const a = rint(40, 95), b = rint(5, 30); return mc(`Start at ${a} on a number line. Jump BACK ${b}. Where do you land?`, a - b, [a + b, a - b - 10, a - b + 1, a - b - 1].filter(x => x !== a - b && x > 0), `Back means subtract: ${a} − ${b} = ${a - b}.`); }
  if (t === 3) { const tgt = rint(3, 8) * 10, near = tgt + pick([-3, -2, 2, 3]), others = shuffle([tgt - 12, tgt + 14, tgt - 19, tgt + 21, tgt + 9, tgt - 8]).slice(0, 3); return mc(`Which number is CLOSEST to ${tgt} on a number line?`, near, others, `${near} is only ${Math.abs(near - tgt)} away from ${tgt}. The others are farther.`); }
  const d = pick([2, 3, 4]); return mc(`A number line from 0 to 1 is cut into ${d} equal parts. What number is at the FIRST mark after 0?`, `1/${d}`, [`1/${d + 1}`, `${d}/1`, `1/${d * 2}`, `${d - 1 || 2}/${d}`].filter(x => x !== `1/${d}`), `${d} equal parts means each part is one ${['', '', 'half', 'third', 'fourth'][d]}: 1/${d}.`);
} }, ['A number line is a ruler for numbers. Numbers get BIGGER as you move right and SMALLER as you move left.', 'Adding is jumping forward (right). Subtracting is jumping back (left). Start at 34, jump forward 10, land on 44.', 'To find what is halfway between two numbers, find the middle. Halfway between 20 and 30 is 25.']);
const GRAM2 = [
  I(2, 'A group of wolves is called a...', 'pack', ['herd', 'flock', 'school'], 'Some groups have special names: a pack of wolves, a herd of cows, a flock of birds, a school of fish.'),
  I(2, 'A group of fish is called a...', 'school', ['pack', 'team', 'flock'], 'A school of fish. (No homework, though.)'),
  I(2, 'A group of birds is called a...', 'flock', ['herd', 'pack', 'class'], 'A flock of birds.'),
  I(2, 'A group of cows is called a...', 'herd', ['flock', 'school', 'pack'], 'A herd of cows.'),
  I(2, 'Dex made the sandwich all by ___.', 'himself', ['hisself', 'him', 'he'], 'Use "himself" when a boy does something to or for himself. "Hisself" is not a word.'),
  I(2, 'We fixed the radio ___.', 'ourselves', ['ourself', 'us', 'we'], '"Ourselves" goes with "we."'),
  I(2, 'Priya taught ___ to read maps.', 'herself', ['hers', 'her', 'she'], '"Herself" goes with "she."'),
  I(2, 'The critters fed ___.', 'themselves', ['theirselves', 'them', 'they'], '"Themselves" goes with "they." "Theirselves" is not a word.'),
  I(2, 'I can tie my shoes by ___.', 'myself', ['me', 'I', 'mine'], '"Myself" goes with "I."'),
  I(2, 'Wren runs ___.', 'quickly', ['quick', 'quickness', 'quicked'], 'The word tells HOW she runs, so it needs -ly: quickly.'),
  I(2, 'The ___ dragon slept in the cave.', 'quiet', ['quietly', 'quieted', 'quietness'], 'The word describes the dragon (a thing), so use quiet, not quietly.'),
  I(2, 'Bash spoke ___ to the ferns.', 'softly', ['soft', 'softness', 'soften'], 'The word tells HOW he spoke, so it needs -ly: softly.'),
  I(2, 'Which would you say to your principal?', 'Good morning. May I ask a question?', ["Hey, what's up?", 'Yo!', 'Gimme a sec.'], 'With grown-ups at school we use polite, formal words.'),
  I(2, 'Which sentence is the most POLITE and formal?', 'I would like some water, please.', ['Gimme water.', 'Water. Now.', 'I wanna drink.'], 'Formal language uses whole words and "please."'),
  I(2, 'What does the compound word "birdhouse" mean?', 'a house for a bird', ['a bird that is a house', 'a very big bird', 'a house shaped like a bird'], 'A compound word joins two words. Bird + house is a house for a bird.'),
  I(2, 'Which two words make the compound word "sunlight"?', 'sun + light', ['su + nlight', 'sunl + ight', 'sunny + lit'], 'Sunlight is light from the sun.'),
  I(3, 'Which word names something you CANNOT touch?', 'bravery', ['wrench', 'tower', 'snack'], 'Bravery is an idea, not an object. Words like that are called abstract nouns.'),
  I(3, 'Which sentence compares correctly?', 'Bash is taller than Dex.', ['Bash is more taller than Dex.', 'Bash is tallest than Dex.', 'Bash is most tall than Dex.'], 'To compare two things, add -er and use "than."'),
  I(3, 'Which sentence compares THREE or more correctly?', 'Krush is the biggest critter of all.', ['Krush is the bigger critter of all.', 'Krush is the most biggest critter.', 'Krush is more big of all.'], 'To compare three or more, add -est.')
];
addSkill('grammar2', 'Language & Grammar', { n: 'Grammar Power', sub: 'ela', std: 'L.2.1a,c,e · L.2.3 · L.2.4d · L.3.1', g: [2, 3], gen: itemQ(GRAM2) },
  ['Some groups have their own names: a PACK of wolves, a HERD of cows, a FLOCK of birds, a SCHOOL of fish.', 'When someone does something alone, we use a -self word: I did it myself. He did it himself. They did it themselves.', 'A describing word for a THING has no -ly: the quiet dragon. A word that tells HOW something is done usually ends in -ly: it slept quietly.']);
const SHADES = [
  I(2, 'Which word means to throw the HARDEST?', 'hurl', ['toss', 'throw', 'drop'], 'Toss is gentle, throw is normal, and hurl is with all your might.'),
  I(2, 'Which is the STRONGEST way to say "big"?', 'gigantic', ['large', 'big', 'medium'], 'Big, large, huge, gigantic: each one is bigger than the last.'),
  I(2, 'Which word shows someone is the MOST upset?', 'furious', ['annoyed', 'mad', 'fine'], 'Annoyed is a little upset. Mad is more. Furious is the most.'),
  I(2, 'Which word means to move the FASTEST?', 'sprint', ['stroll', 'walk', 'jog'], 'Stroll, walk, jog, sprint: slowest to fastest.'),
  I(2, 'Which word means just a LITTLE bit wet?', 'damp', ['soaked', 'drenched', 'flooded'], 'Damp is slightly wet. Soaked and drenched are very wet.'),
  I(2, 'Which word means VERY cold?', 'freezing', ['cool', 'chilly', 'warm'], 'Cool, chilly, cold, freezing: each one is colder.'),
  I(2, 'Which word means to look at something for a long time?', 'stare', ['glance', 'peek', 'blink'], 'A glance and a peek are quick. A stare is long.'),
  I(2, 'Which food would you describe as SPICY?', 'hot peppers', ['ice cream', 'plain bread', 'milk'], 'Spicy foods make your mouth feel hot.'),
  I(2, 'Which of these would you describe as COZY?', 'a warm blanket', ['a rainstorm', 'a cactus', 'a loud alarm'], 'Cozy means warm, soft and comfortable.'),
  I(3, 'Which word means you are SURE something is true?', 'know', ['wonder', 'suspect', 'guess'], 'Wonder, guess, suspect, believe, know: each one is more certain.'),
  I(3, 'Which is the STRONGEST way to say "happy"?', 'overjoyed', ['glad', 'pleased', 'content'], 'Content and glad are mild. Overjoyed is as happy as it gets.'),
  I(3, 'Which word means to eat very quickly and greedily?', 'gobble', ['nibble', 'taste', 'chew'], 'To nibble is to take tiny bites. To gobble is to eat fast.')
];
addSkill('shades', 'Vocabulary', { n: 'Shades of Meaning', sub: 'ela', std: 'L.2.5a,b · L.3.5c', g: [2, 3], gen: itemQ(SHADES) },
  ['Some words mean almost the same thing, but one is STRONGER. Big, huge, gigantic. Cool, cold, freezing.', 'Line them up from weakest to strongest in your head, like a ladder. Toss is at the bottom, throw is in the middle, hurl is at the top.', 'Picking the exact word makes writing better. "Dex was furious" tells you much more than "Dex was mad."']);
// sentences, punctuation, research and reading: grade 2 items
SENT.push(
  I(2, 'Which is a COMPLETE sentence?', 'The critter ran under the porch.', ['Under the porch.', 'The little critter.', 'Ran fast.'], 'A complete sentence tells WHO and WHAT THEY DID.'),
  I(2, 'Put the words in order to make a sentence:  ran / the / fast / critter', 'The critter ran fast.', ['Ran the fast critter.', 'Critter the fast ran.', 'Fast critter the ran.'], 'Start with who (the critter), then what it did (ran fast).'),
  I(2, 'Which sentence tells you the MOST?', 'The tiny gray critter ran under the porch.', ['The critter ran.', 'It ran.', 'Critter.'], 'Adding describing words and where it happened makes a sentence tell more.'),
  I(2, '"Dex is tall. Dex is fast."  Which sentence joins them?', 'Dex is tall and fast.', ['Dex is tall Dex is fast.', 'Dex tall fast.', 'Dex is tall, fast is Dex.'], 'Use "and" to join two ideas about the same person.'),
  I(2, 'Which is a COMPLETE sentence?', 'Dex found a map.', ['Found a map.', 'Dex and the map.', 'A very old map.'], 'A complete sentence tells WHO (Dex) and WHAT HE DID (found a map).'),
  I(2, 'Which one is a QUESTION?', 'Where is my hat?', ['My hat is red.', 'Find my hat.', 'What a nice hat!'], 'A question asks something and ends with a question mark.'),
  I(2, 'Which one is a COMMAND? (It tells someone to do something.)', 'Close the door.', ['The door is closed.', 'Is the door closed?', 'What a big door!'], 'A command tells someone what to do.'),
  I(2, '"The dog barked. The cat ran."  Which sentence joins them?', 'The dog barked, and the cat ran.', ['The dog barked the cat ran.', 'The dog and barked the cat ran.', 'The dog barked, the cat.'], 'Use a comma and the word "and" to join two whole sentences.'),
  I(2, 'Which one is NOT a complete sentence?', 'The big red.', ['The bell rang.', 'Wren ran home.', 'It is raining.'], '"The big red" does not tell what happened. Red what? Did what?'));
SKILLS.sentence.g = [2, 6]; SKILLS.sentence.std = 'L.2.1f · L.4.1f · L.5.1 · L.6.1';
PUNCT.push(
  I(2, 'Which letter GREETING is written correctly?', 'Dear Mom,', ['Dear Mom', 'dear Mom,', 'Dear, Mom'], 'The greeting of a letter starts with a capital and ends with a comma.'),
  I(2, 'Which letter CLOSING is written correctly?', 'Your friend, Dex', ['Your friend Dex,', 'your friend, Dex', 'Your, friend Dex'], 'The closing of a letter has a comma before your name.'),
  I(2, null, 'We carve pumpkins on Halloween.', ['We carve pumpkins on halloween.', 'we carve pumpkins on Halloween.', 'We carve Pumpkins on Halloween.'], 'Holidays are special names, so they start with a capital letter.'),
  I(2, null, "That is Dex's backpack.", ['That is Dexs backpack.', "That is Dexs' backpack.", 'That is dex\'s backpack.'], "Add an apostrophe and s to show that something belongs to Dex."),
  I(2, null, 'Priya lives in Pacifica, California.', ['Priya lives in pacifica, california.', 'Priya lives in Pacifica California.', 'priya lives in Pacifica, California.'], 'Names of towns and states get capital letters, with a comma between them.'));
RESEARCH.push(
  I(2, 'Which word comes FIRST in ABC order?', 'apple', ['bell', 'critter', 'dragon'], 'A comes before B, C and D.'),
  I(2, 'Which word comes FIRST in ABC order?', 'bat', ['bell', 'big', 'bus'], 'They all start with b, so look at the SECOND letter: a comes before e, i and u.'),
  I(2, 'Which word comes LAST in ABC order?', 'zombie', ['moon', 'tower', 'storm'], 'Z is the last letter of the alphabet.'),
  I(2, 'You do not know what the word "gloomy" means. Where should you look?', 'a dictionary', ['a calendar', 'a map', 'a cookbook'], 'A dictionary tells what words mean. The words are in ABC order.'),
  I(2, 'In a book, what is a CAPTION?', 'words that explain a picture', ['the name of the author', 'the last page', 'a list of chapters'], 'A caption sits next to a picture and tells you about it.'),
  I(2, 'Why are some words in a book printed in BOLD (dark) letters?', 'They are important words to notice.', ['The printer made a mistake.', 'They are spelled wrong.', 'They are the easy words.'], 'Bold print tells you: this word matters. It is often explained in the glossary.'),
  I(2, 'What does a HEADING tell you?', 'what the next part is about', ['who wrote the book', 'how many pages there are', 'what the pictures cost'], 'A heading is like a little title for one part of the page.'),
  I(2, 'Where do you look to find the page where a chapter starts?', 'the table of contents', ['the back cover', 'a caption', 'the glossary'], 'The table of contents is at the front. It lists the chapters and their pages.'));
SKILLS.research.g = [2, 6]; SKILLS.research.n = 'Research & Book Skills'; SKILLS.research.std = 'L.2.2e · L.2.4e · RI.2.5 · W.3.8 – W.6.8';
PASSAGES.push({ g: [2, 2], title: 'Rain Song (a poem)', text: 'Drip, drop, on the top / of the tower in the night. / Drip, drop, do not stop, / wash the town till morning light. / Dex is dry and Dex is warm, / listening to the gentle storm.', qs: [
  ['Which two words from the poem RHYME?', 'night and light', ['top and tower', 'town and till', 'dry and Dex'], 'Rhyming words end with the same sound: night, light.'],
  ['Which words are repeated to give the poem a beat?', 'Drip, drop', ['morning light', 'gentle storm', 'the tower'], 'Repeating "Drip, drop" sounds like rain falling again and again.'],
  ['How does Dex feel in this poem?', 'safe and cozy', ['scared and cold', 'angry and loud', 'bored and sleepy'], 'He is dry and warm, and the storm is "gentle."', ['Dex is dry and Dex is warm,', ['Drip, drop, on the top', 'of the tower in the night.', 'wash the town till morning light.']]]] });
for (const p of PASSAGES) {
  if (p.title === "Wren's Race") p.qs.push(['What happens at the END of the story?', 'Wren runs faster than ever.', ['Wren trips on a root.', 'Wren wants to be the fastest.', 'Wren scrapes her knee.'], 'The ending is the last thing that happens in a story.'], ['What happens at the BEGINNING of the story?', 'Wren wants to be the fastest kid in town.', ['Wren runs faster than ever.', 'Wren scrapes her knee.', 'Wren brushes off the dirt.'], 'The beginning tells who the story is about and what they want.']);
  if (p.title === 'All About Gloops') p.qs.push(['Why did the author write this passage?', 'to teach facts about Gloops', ['to tell a funny story', 'to get you to buy a Gloop', 'to explain how to cook moss'], 'It gives fact after fact, so the author wants to inform you.']);
  if (p.title === 'Why It Thunders') p.qs.push(['Why did the author write this passage?', 'to explain what causes thunder', ['to scare the reader', 'to tell a story about a storm', 'to sell umbrellas'], 'The passage explains how something works. That is writing to inform.']);
}

// ============================================================ pictures for young learners
// Drawn math models: clocks, coins, number lines, arrays, base-ten blocks, bar charts, shapes, fraction circles, ten-frames.
const Pic = {
  h(p) { return { clock: 176, coins: 104, numline: 112, array: 36 + p.r * 30, blocks: 128, bars: 184, shape: 150, pie: 150, tenframe: 116 }[p.t] || 120; },
  draw(p, x, y, w) { const h = this.h(p); rbox(x, y, w, h, 14, 'rgba(250,246,232,.96)', '#6a56b8', 3); ctx.save(); this[p.t](p, x, y, w, h, x + w / 2, y + h / 2); ctx.restore(); },
  ink: '#2a1f38',
  clock(p, x, y, w, h, cx, cy) {
    const r = 76; ctx.fillStyle = '#ffffff'; ctx.beginPath(); ctx.arc(cx, cy, r, 0, 6.3); ctx.fill(); ctx.strokeStyle = '#3b5ba9'; ctx.lineWidth = 7; ctx.stroke();
    ctx.font = '700 19px ' + FONT_B; ctx.textAlign = 'center'; ctx.textBaseline = 'middle'; ctx.fillStyle = this.ink;
    for (let i = 1; i <= 12; i++) { const a = i * Math.PI / 6 - Math.PI / 2; ctx.fillText(i, cx + Math.cos(a) * (r - 17), cy + Math.sin(a) * (r - 17) + 1); }
    ctx.strokeStyle = '#9aa3b0'; ctx.lineWidth = 1.6; for (let i = 0; i < 60; i++) { if (i % 5 === 0) continue; const a = i * Math.PI / 30; ctx.beginPath(); ctx.moveTo(cx + Math.cos(a) * (r - 5), cy + Math.sin(a) * (r - 5)); ctx.lineTo(cx + Math.cos(a) * (r - 1), cy + Math.sin(a) * (r - 1)); ctx.stroke(); }
    const hand = (ang, len, wd, col) => { ctx.strokeStyle = col; ctx.lineWidth = wd; ctx.lineCap = 'round'; ctx.beginPath(); ctx.moveTo(cx, cy); ctx.lineTo(cx + Math.cos(ang) * len, cy + Math.sin(ang) * len); ctx.stroke(); };
    hand(((p.h % 12) + p.m / 60) * Math.PI / 6 - Math.PI / 2, r * .46, 8, '#e5483d'); hand(p.m * Math.PI / 30 - Math.PI / 2, r * .76, 5, this.ink);
    ctx.fillStyle = this.ink; ctx.beginPath(); ctx.arc(cx, cy, 6, 0, 6.3); ctx.fill();
  },
  coins(p, x, y, w, h, cx, cy) {
    const K = { b: [86, 44, '#8fc78a', '$1'], q: [30, 30, '#c9d2de', '25¢'], d: [19, 19, '#e3e8ee', '10¢'], n: [25, 25, '#b4bdc9', '5¢'], p: [22, 22, '#d08a52', '1¢'] }, list = [];
    for (const k of ['b', 'q', 'd', 'n', 'p']) for (let i = 0; i < (p[k] || 0); i++) list.push(k);
    const widths = list.map(k => (k === 'b' ? 86 : K[k][0] * 2) + 12), tot = widths.reduce((a, b) => a + b, 0); let px = cx - tot / 2;
    list.forEach((k, i) => { const c = K[k], mx = px + widths[i] / 2; ctx.strokeStyle = this.ink; ctx.lineWidth = 3;
      if (k === 'b') { ctx.fillStyle = c[2]; ctx.beginPath(); ctx.roundRect(mx - 43, cy - 22, 86, 44, 5); ctx.fill(); ctx.stroke(); ctx.strokeStyle = '#4f8a54'; ctx.lineWidth = 1.5; ctx.strokeRect(mx - 37, cy - 16, 74, 32); }
      else { ctx.fillStyle = c[2]; ctx.beginPath(); ctx.arc(mx, cy, c[0], 0, 6.3); ctx.fill(); ctx.stroke(); ctx.strokeStyle = 'rgba(255,255,255,.6)'; ctx.lineWidth = 2; ctx.beginPath(); ctx.arc(mx, cy, c[0] - 5, 3.6, 5.2); ctx.stroke(); }
      ctx.fillStyle = this.ink; ctx.font = `700 ${k === 'd' ? 13 : 17}px ` + FONT_B; ctx.textAlign = 'center'; ctx.textBaseline = 'middle'; ctx.fillText(c[3], mx, cy + 1); px += widths[i]; });
  },
  numline(p, x, y, w, h, cx, cy) {
    const x0 = x + 54, x1 = x + w - 54, ly = cy + 16, X = v => x0 + (v - p.from) / (p.to - p.from) * (x1 - x0);
    ctx.strokeStyle = this.ink; ctx.lineWidth = 4; ctx.lineCap = 'round'; ctx.beginPath(); ctx.moveTo(x0 - 26, ly); ctx.lineTo(x1 + 26, ly); ctx.stroke();
    for (const [ax, s] of [[x0 - 26, -1], [x1 + 26, 1]]) { ctx.beginPath(); ctx.moveTo(ax, ly); ctx.lineTo(ax - s * 10, ly - 7); ctx.moveTo(ax, ly); ctx.lineTo(ax - s * 10, ly + 7); ctx.stroke(); }
    ctx.font = '700 18px ' + FONT_B; ctx.textAlign = 'center'; ctx.textBaseline = 'top'; ctx.fillStyle = this.ink;
    for (let v = p.from; v <= p.to + 1e-9; v += p.step) { const big = !p.label || Math.round((v - p.from) / p.step) % p.label === 0; ctx.lineWidth = big ? 3.5 : 2; ctx.beginPath(); ctx.moveTo(X(v), ly - (big ? 11 : 7)); ctx.lineTo(X(v), ly + (big ? 11 : 7)); ctx.stroke(); if (big && !(p.hide || []).includes(v)) ctx.fillText(v, X(v), ly + 15); }
    if (p.jump) { const [a, b] = p.jump, ax = X(a), bx = X(b), top = ly - 46; ctx.strokeStyle = '#e5483d'; ctx.lineWidth = 3.5; ctx.beginPath(); ctx.moveTo(ax, ly - 12); ctx.quadraticCurveTo((ax + bx) / 2, top - 22, bx, ly - 12); ctx.stroke(); const s = bx > ax ? 1 : -1; ctx.beginPath(); ctx.moveTo(bx, ly - 12); ctx.lineTo(bx - s * 12, ly - 16); ctx.moveTo(bx, ly - 12); ctx.lineTo(bx - s * 3, ly - 25); ctx.stroke(); ctx.fillStyle = '#e5483d'; ctx.textBaseline = 'bottom'; ctx.fillText((b > a ? '+' : '−') + Math.abs(b - a), (ax + bx) / 2, top - 6);
      ctx.fillStyle = '#3b5ba9'; ctx.beginPath(); ctx.arc(ax, ly, 7, 0, 6.3); ctx.fill(); }
    if (p.mark != null) { const mx = X(p.mark); ctx.fillStyle = '#e5483d'; ctx.beginPath(); ctx.arc(mx, ly, 9, 0, 6.3); ctx.fill(); ctx.strokeStyle = this.ink; ctx.lineWidth = 2.5; ctx.stroke(); if (!p.jump) { ctx.fillStyle = '#e5483d'; ctx.font = '700 24px ' + FONT_B; ctx.textBaseline = 'bottom'; ctx.fillText('?', mx, ly - 14); } }
  },
  array(p, x, y, w, h, cx, cy) {
    const s = 30, ox = cx - p.c * s / 2, oy = cy - p.r * s / 2;
    for (let r = 0; r < p.r; r++) for (let c = 0; c < p.c; c++) { const px = ox + c * s, py = oy + r * s; ctx.strokeStyle = this.ink; ctx.lineWidth = 2.5;
      if (p.grid) { ctx.fillStyle = (r + c) % 2 ? '#bfe3ff' : '#d8efff'; ctx.fillRect(px, py, s, s); ctx.strokeRect(px, py, s, s); }
      else { ctx.fillStyle = ['#7fd14f', '#57bdee', '#f6b93b', '#e07aa0', '#8e6be8'][r % 5]; ctx.beginPath(); ctx.arc(px + s / 2, py + s / 2, 11, 0, 6.3); ctx.fill(); ctx.stroke(); ctx.fillStyle = this.ink; ctx.beginPath(); ctx.arc(px + s / 2 - 4, py + s / 2 - 2, 1.8, 0, 6.3); ctx.arc(px + s / 2 + 4, py + s / 2 - 2, 1.8, 0, 6.3); ctx.fill(); } }
  },
  blocks(p, x, y, w, h, cx, cy) {
    const tot = p.h * 62 + p.n * 15 + (p.o ? Math.ceil(p.o / 5) * 15 + 6 : 0) + 20; let px = cx - tot / 2; const top = cy - 30; ctx.lineWidth = 1;
    for (let i = 0; i < p.h; i++) { ctx.fillStyle = '#f6b93b'; ctx.fillRect(px, top, 60, 60); ctx.strokeStyle = 'rgba(42,31,56,.35)'; for (let k = 1; k < 10; k++) { ctx.beginPath(); ctx.moveTo(px + k * 6, top); ctx.lineTo(px + k * 6, top + 60); ctx.moveTo(px, top + k * 6); ctx.lineTo(px + 60, top + k * 6); ctx.stroke(); } ctx.strokeStyle = this.ink; ctx.lineWidth = 2.5; ctx.strokeRect(px, top, 60, 60); ctx.lineWidth = 1; px += 66; }
    px += 4;
    for (let i = 0; i < p.n; i++) { ctx.fillStyle = '#57bdee'; ctx.fillRect(px, top, 10, 60); ctx.strokeStyle = 'rgba(42,31,56,.35)'; for (let k = 1; k < 10; k++) { ctx.beginPath(); ctx.moveTo(px, top + k * 6); ctx.lineTo(px + 10, top + k * 6); ctx.stroke(); } ctx.strokeStyle = this.ink; ctx.lineWidth = 2; ctx.strokeRect(px, top, 10, 60); ctx.lineWidth = 1; px += 15; }
    px += 8;
    for (let i = 0; i < p.o; i++) { const ux = px + Math.floor(i / 5) * 15, uy = top + (i % 5) * 12; ctx.fillStyle = '#7fd14f'; ctx.fillRect(ux, uy, 10, 10); ctx.strokeStyle = this.ink; ctx.lineWidth = 2; ctx.strokeRect(ux, uy, 10, 10); }
    ctx.fillStyle = '#6d6680'; ctx.font = '600 15px ' + FONT_B; ctx.textAlign = 'center'; ctx.textBaseline = 'top'; ctx.fillText('big square = 100      stick = 10      small cube = 1', cx, top + 68);
  },
  bars(p, x, y, w, h, cx, cy) {
    const n = p.vals.length, mx = Math.max(...p.vals), top = Math.ceil(mx / 2) * 2, bx = x + 70, by = y + h - 40, bh = h - 62, bw = Math.min(110, (w - 140) / n - 26);
    ctx.font = '600 15px ' + FONT_B; ctx.textBaseline = 'middle'; ctx.textAlign = 'right';
    for (let v = 0; v <= top; v++) { const gy = by - v / top * bh, lab = top <= 5 || v % 2 === 0; ctx.strokeStyle = v ? `rgba(42,31,56,${lab ? .3 : .14})` : this.ink; ctx.lineWidth = v ? 1.2 : 3; ctx.beginPath(); ctx.moveTo(bx, gy); ctx.lineTo(x + w - 40, gy); ctx.stroke(); if (lab) { ctx.fillStyle = this.ink; ctx.fillText(v, bx - 8, gy); } }
    ctx.strokeStyle = this.ink; ctx.lineWidth = 3; ctx.beginPath(); ctx.moveTo(bx, by); ctx.lineTo(bx, by - bh - 6); ctx.stroke();
    p.vals.forEach((v, i) => { const px = bx + 30 + i * ((w - 140) / n), hh = v / top * bh; ctx.fillStyle = ['#7fd14f', '#57bdee', '#f6b93b', '#e07aa0'][i % 4]; ctx.fillRect(px, by - hh, bw, hh); ctx.strokeStyle = this.ink; ctx.lineWidth = 2.5; ctx.strokeRect(px, by - hh, bw, hh); ctx.fillStyle = this.ink; ctx.font = '700 17px ' + FONT_B; ctx.textAlign = 'center'; ctx.textBaseline = 'top'; ctx.fillText(p.labels[i], px + bw / 2, by + 8); });
  },
  shape(p, x, y, w, h, cx, cy) {
    ctx.strokeStyle = this.ink; ctx.lineWidth = 4; ctx.lineJoin = 'round'; ctx.fillStyle = p.col || '#57bdee';
    if (p.cube) { const s = 62, d = 24, ox = cx - s / 2 - d / 2, oy = cy - s / 2 + d / 2; ctx.fillStyle = '#f6b93b'; ctx.fillRect(ox, oy, s, s); ctx.strokeRect(ox, oy, s, s); ctx.fillStyle = '#ffd98a'; ctx.beginPath(); ctx.moveTo(ox, oy); ctx.lineTo(ox + d, oy - d); ctx.lineTo(ox + s + d, oy - d); ctx.lineTo(ox + s, oy); ctx.closePath(); ctx.fill(); ctx.stroke(); ctx.fillStyle = '#d99a1e'; ctx.beginPath(); ctx.moveTo(ox + s, oy); ctx.lineTo(ox + s + d, oy - d); ctx.lineTo(ox + s + d, oy + s - d); ctx.lineTo(ox + s, oy + s); ctx.closePath(); ctx.fill(); ctx.stroke(); return; }
    const n = p.sides, r = 60, rot = n === 4 ? Math.PI / 4 : -Math.PI / 2; ctx.beginPath(); for (let i = 0; i < n; i++) { const a = rot + i * 2 * Math.PI / n, px = cx + Math.cos(a) * r * (n === 4 && p.wide ? 1.5 : 1), py = cy + Math.sin(a) * r * (n === 4 && p.wide ? .72 : 1); i ? ctx.lineTo(px, py) : ctx.moveTo(px, py); } ctx.closePath(); ctx.fill(); ctx.stroke();
  },
  pie(p, x, y, w, h, cx, cy) {
    const r = 62; ctx.strokeStyle = this.ink; ctx.lineWidth = 3.5;
    if (p.bar) { const bw = 300, bh = 70, ox = cx - bw / 2, oy = cy - bh / 2; for (let i = 0; i < p.d; i++) { ctx.fillStyle = i < p.k ? '#f6b93b' : '#ffffff'; ctx.fillRect(ox + i * bw / p.d, oy, bw / p.d, bh); ctx.strokeRect(ox + i * bw / p.d, oy, bw / p.d, bh); } return; }
    for (let i = 0; i < p.d; i++) { const a0 = -Math.PI / 2 + i * 2 * Math.PI / p.d, a1 = a0 + 2 * Math.PI / p.d; ctx.fillStyle = i < p.k ? '#f6b93b' : '#ffffff'; ctx.beginPath(); ctx.moveTo(cx, cy); ctx.arc(cx, cy, r, a0, a1); ctx.closePath(); ctx.fill(); ctx.stroke(); }
  },
  tenframe(p, x, y, w, h, cx, cy) {
    const s = 34, frames = p.a + p.b > 10 ? 2 : 1, fw = 5 * s, gap = 34, ox = cx - (frames * fw + (frames - 1) * gap) / 2, oy = cy - s;
    for (let f = 0; f < frames; f++) for (let i = 0; i < 10; i++) { const px = ox + f * (fw + gap) + (i % 5) * s, py = oy + Math.floor(i / 5) * s, idx = f * 10 + i; ctx.fillStyle = '#ffffff'; ctx.fillRect(px, py, s, s); ctx.strokeStyle = this.ink; ctx.lineWidth = 2.5; ctx.strokeRect(px, py, s, s);
      if (idx < p.a + p.b) { ctx.fillStyle = idx < p.a ? '#e5483d' : '#3f7ee8'; ctx.beginPath(); ctx.arc(px + s / 2, py + s / 2, 12, 0, 6.3); ctx.fill(); ctx.stroke(); } }
  },
  // a full-screen picture with a caption, used inside lessons
  show(title, L) { return page(() => { ctx.fillStyle = 'rgba(12,6,30,.82)'; ctx.fillRect(0, 0, W, H); panel(40, 60, W - 80, H - 160); setFont(18, true); text('LOOK: ' + title.toUpperCase(), 68, 84, '#ffd76a'); const ph = Pic.h(L.pic); Pic.draw(L.pic, 80, 140, W - 160); setFont(28); let y = 160 + ph; wrap(L.cap, W - 180).forEach(l => { text(l, 84, y, '#fff'); y += 36; }); if (Math.floor(performance.now() / 400) % 2) { setFont(24); text('▼', W - 90, H - 140, '#c9a24a'); } }); }
};
const LPIC = {
  time: { pic: { t: 'clock', h: 4, m: 10 }, cap: 'The short red hand is just past the 4, so the hour is 4. The long hand points at the 2: count by fives, 5, 10. It is 4:10.' },
  money: { pic: { t: 'coins', q: 1, d: 2, n: 1, p: 3 }, cap: 'Biggest first: 25... then the dimes, 35, 45... the nickel, 50... the pennies, 51, 52, 53. That is 53¢.' },
  place: { pic: { t: 'blocks', h: 2, n: 3, o: 4 }, cap: '2 big squares are 200. 3 sticks are 30. 4 small cubes are 4. Together they show 234.' },
  numline: { pic: { t: 'numline', from: 20, to: 60, step: 5, label: 2, jump: [30, 45], mark: 45 }, cap: 'Start at 30. Jump forward 15. You land on 45. Jumping forward is adding.' },
  groups: { pic: { t: 'array', r: 3, c: 4 }, cap: '3 rows with 4 in each row. Add 4 three times: 4 + 4 + 4 = 12.' },
  shapes: { pic: { t: 'pie', d: 4, k: 1 }, cap: 'This circle is cut into 4 EQUAL parts. Each part is one fourth. One fourth is shaded.' },
  addsub: { pic: { t: 'tenframe', a: 8, b: 5 }, cap: '8 + 5. Two of the blue ones fill up the first frame to make 10. That leaves 3 more. 10 + 3 = 13.' },
  data: { pic: { t: 'bars', labels: ['Gloops', 'Boltbugs', 'Gnawbies'], vals: [5, 8, 3] }, cap: 'The tallest bar is Boltbugs: 8. The shortest is Gnawbies: 3. That is 8 − 3 = 5 more Boltbugs.' },
  compare: { pic: { t: 'blocks', h: 3, n: 4, o: 8 }, cap: 'This is 348. To compare it with 384, look at the big squares first. Both have 3. Now the sticks: 4 sticks is less than 8 sticks. So 348 < 384.' }
};
// picture versions of the Grade 2 (and 3) math questions, mixed in with the plain ones
const withPic = (id, maxG, chance, fn) => { const old = SKILLS[id].gen; SKILLS[id].gen = g => (g <= maxG && Math.random() < chance && fn(g)) || old(g); };
withPic('time', 3, .55, g => { const hr = rint(1, 12), m = rint(0, g <= 2 ? 9 : 11) * 5, pd = v => String(v).padStart(2, '0'), A = `${hr}:${pd(m)}`;
  return mc('What time does the clock show?', A, [`${m / 5 || 12}:${pd(hr * 5 % 60)}`, `${hr % 12 + 1}:${pd(m)}`, `${hr}:${pd((m + 15) % 60)}`, `${hr === 1 ? 12 : hr - 1}:${pd(m)}`].filter(x => x !== A), `The short red hand shows the hour: ${hr}. The long hand ${m ? `points at the ${m / 5}. Count by fives: ${m} minutes` : 'points straight up at the 12, so it is exactly on the hour'}. It is ${A}.`, { pic: { t: 'clock', h: hr, m }, tips: m ? { [`${m / 5}:${pd(hr * 5 % 60)}`]: 'You swapped the hands. The SHORT red hand shows the hour. The LONG hand shows the minutes.', [`${hr % 12 + 1}:${pd(m)}`]: 'The short hand has not reached that number yet. Use the number it has already passed.' } : undefined }); });
withPic('money', 2, .6, () => { let q, d, n, p, v; do { q = rint(0, 2); d = rint(0, 3); n = rint(0, 2); p = rint(0, 4); v = q * 25 + d * 10 + n * 5 + p; } while (v >= 100 || q + d + n + p > 8 || [q, d, n, p].filter(x => x).length < 2);
  return mc('How much money is this?', `${v}¢`, [q + d + n + p, v + 5, v - 5, v + 10, v + 1].filter(x => x > 0 && x !== v).map(x => x + '¢'), `Start with the biggest coins and count up: ${[q && q * 25, d && d * 10, n && n * 5, p && p].filter(x => x).join(' + ')} = ${v}¢.`, { pic: { t: 'coins', q, d, n, p }, tips: { [`${q + d + n + p}¢`]: 'That is how many COINS there are. The question asks what they are WORTH.' } }); });
withPic('groups', 2, .5, () => { const r = rint(2, 5), c = rint(2, 5); return coin()
  ? mc('How many critters are there in all?', r * c, [r + c, r * c + c, r * c - 1, r * c + 1].filter(x => x !== r * c), `There are ${r} rows with ${c} in each row: ${Array(r).fill(c).join(' + ')} = ${r * c}.`, { pic: { t: 'array', r, c } })
  : mc('Which addition matches the picture?', Array(r).fill(c).join(' + '), [`${r} + ${c}`, Array(r + 1).fill(c).join(' + '), Array(r).fill(c + 1).join(' + ')].filter(x => x !== Array(r).fill(c).join(' + ')), `Each row has ${c}. There are ${r} rows. So add ${c}, ${r} times.`, { pic: { t: 'array', r, c } }); });
withPic('shapes', 2, .55, () => { const k = rint(0, 3);
  if (k === 0) { const n = pick([3, 4, 5, 6, 8]); return mc('How many sides does this shape have?', n, [3, 4, 5, 6, 7, 8].filter(x => x !== n), 'Put your finger on one side and count each straight edge once, all the way around.', { pic: { t: 'shape', sides: n, col: pick(['#57bdee', '#7fd14f', '#f6b93b', '#e07aa0']) } }); }
  if (k === 1) { const N = { 3: 'triangle', 5: 'pentagon', 6: 'hexagon', 4: 'quadrilateral' }, n = pick([3, 4, 5, 6]); return mc('What is this shape called?', N[n], Object.values(N).filter(x => x !== N[n]), `It has ${n} sides. A shape with ${n} sides is a ${N[n]}.`, { pic: { t: 'shape', sides: n, wide: n === 4 } }); }
  if (k === 2) { const d = pick([2, 3, 4]), N = ['', '', 'one half', 'one third', 'one fourth'], bar = coin(); return mc(`What part of the ${bar ? 'rectangle' : 'circle'} is shaded?`, N[d], [N[2], N[3], N[4], 'one whole'].filter(x => x !== N[d]), `The ${bar ? 'rectangle' : 'circle'} is cut into ${d} equal parts and 1 is shaded. That is ${N[d]}.`, { pic: { t: 'pie', d, k: 1, bar } }); }
  const r = rint(2, 4), c = rint(2, 5); return mc('This rectangle is split into same-size squares. How many squares are there?', r * c, [r + c, r * c + r, r * c - 1, 2 * (r + c)].filter(x => x !== r * c), `Count ${c} in each row, ${r} times: ${Array(r).fill(c).join(' + ')} = ${r * c}.`, { pic: { t: 'array', r, c, grid: 1 } }); });
withPic('place', 2, .4, () => { const h = rint(1, 4), t = rint(0, 9), o = rint(1, 9), n = h * 100 + t * 10 + o; return mc('What number do the blocks show?', n, [h * 100 + o * 10 + t, h + t + o, h * 100 + t * 10, h * 10 + t + o, n + 10].filter(x => x !== n), `${h} big square${h > 1 ? 's' : ''} = ${h * 100}. ${t} stick${t === 1 ? '' : 's'} = ${t * 10}. ${o} small cube${o > 1 ? 's' : ''} = ${o}. Together: ${n}.`, { pic: { t: 'blocks', h, n: t, o } }); });
withPic('addsub', 2, .25, () => { const a = rint(5, 9), b = rint(3, 9); return mc(`${a} + ${b} = ?`, a + b, [a + b + 1, a + b - 1, a + b + 2, a + b - 2], a + b > 10 ? `The red counters need ${10 - a} more to fill the first frame. That leaves ${b - (10 - a)} in the second frame. 10 + ${b - (10 - a)} = ${a + b}.` : `Count all the counters: ${a} red and ${b} blue make ${a + b}.`, { pic: { t: 'tenframe', a, b } }); });
withPic('data', 3, .7, g => { const names = shuffle(['Gloops', 'Boltbugs', 'Gnawbies', 'Zaprats', 'Murdles']).slice(0, 3), v = shuffle([...Array(g <= 2 ? 8 : 10)].map((_, i) => i + 1)).slice(0, 3), hi = v.indexOf(Math.max(...v)), lo = v.indexOf(Math.min(...v)), pic = { t: 'bars', labels: names, vals: v }, t = rint(0, 3), head = 'The chart shows the critters Dex saw.  ';
  if (t === 0) return mc(head + `How many MORE ${names[hi]} than ${names[lo]}?`, v[hi] - v[lo], [v[hi] + v[lo], v[hi], v[lo], v[hi] - v[lo] + 1].filter(x => x !== v[hi] - v[lo]), `Read the tops of the bars: ${v[hi]} and ${v[lo]}. Subtract to compare: ${v[hi]} − ${v[lo]} = ${v[hi] - v[lo]}.`, { pic });
  if (t === 1) return mc(head + 'How many critters in all?', v[0] + v[1] + v[2], [v[0] + v[1], v[0] + v[1] + v[2] + 1, v[0] + v[1] + v[2] - 2, Math.max(...v)].filter(x => x !== v[0] + v[1] + v[2]), `Add all three bars: ${v[0]} + ${v[1]} + ${v[2]} = ${v[0] + v[1] + v[2]}.`, { pic });
  if (t === 2) return mc(head + 'Which critter did he see the MOST?', names[hi], names.filter((_, i) => i !== hi).concat(['They are all the same']), `The tallest bar is ${names[hi]}.`, { pic });
  return mc(head + `How many ${names[1]} did he see?`, v[1], [v[0], v[2], v[1] + 1, v[1] - 1].filter(x => x !== v[1] && x > 0), `Find the ${names[1]} bar and read across to the number on the left: ${v[1]}.`, { pic }); });
withPic('numline', 3, .75, () => { const t = rint(0, 2);
  if (t === 0) { const a = rint(1, 7) * 10; return mc('Which number belongs at the red dot?', a + 5, [a + 10, a + 2, a - 5, a + 15].filter(x => x !== a + 5), `The dot is halfway between ${a} and ${a + 10}. Halfway is 5 more than ${a}: ${a + 5}.`, { pic: { t: 'numline', from: a - 10, to: a + 20, step: 5, label: 2, mark: a + 5 } }); }
  const a = rint(2, 6) * 5 + (t === 1 ? 0 : 20), b = rint(1, 4) * 5, fwd = t === 1, end = fwd ? a + b : a - b, lo = Math.floor(Math.min(a, end) / 10) * 10 - 10, hi2 = lo + 50;
  return mc(`Start at ${a}. Jump ${fwd ? 'forward' : 'back'} ${b}. Where do you land?`, end, [fwd ? a - b : a + b, end + 5, end - 5, end + 10].filter(x => x !== end && x >= 0), `${fwd ? 'Forward means add' : 'Back means subtract'}: ${a} ${fwd ? '+' : '−'} ${b} = ${end}.`, { pic: { t: 'numline', from: Math.max(0, lo), to: Math.max(0, lo) + 50, step: 5, label: 2, jump: [a, end], hide: [end] } }); });
