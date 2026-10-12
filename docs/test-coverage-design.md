# Test coverage design

Goal: every test a Pacifica School District student sits should have matching practice in Last Bell, in the
format that test uses, and the game should say plainly where it cannot do that.

## What Pacifica gives

| Test | Grades | Source |
|---|---|---|
| i-Ready Diagnostic, reading and math | listed for fall, grades not stated | district calendar |
| DIBELS | K-3 | district calendar |
| DRDP | TK | district calendar (teacher observation, out of scope) |
| CAASPP / Smarter Balanced, English and math | 3-8 | California state requirement |
| CAST science | 5 and 8 | California state requirement |
| ELPAC | English learners | California state requirement |
| Physical Fitness Test | 5 and 7 | out of scope |

## Gaps found and what closes them

| Gap | Test it matters for | Feature | Status |
|---|---|---|---|
| No audio, so no listening or sound-based items | i-Ready (phonological awareness), CAASPP (listening) | Read-aloud: the tablet's own voice in the app, the browser's voice on the web. A "Read to me" button on question cards. | built |
| Phonological awareness | i-Ready, DIBELS | New skill **Listen for Sounds**: hear a word, then rhyme it, count syllables, find first and last sounds, drop a sound | built |
| High-frequency words were spelling only | i-Ready | New skill **Sight Words**: hear a word, tap it among look-alikes | built |
| Listening comprehension | CAASPP claim 3 | New skill **Listening**: a passage is read aloud and not shown, then a question | built |
| Maze was one sentence at a time | DIBELS Maze | **Maze Dash**: a passage with three-choice gaps, a three-minute timer, and the DIBELS adjusted score (right minus half of wrong) | built |
| Oral reading fluency | DIBELS | **Read-Aloud Check**: one-minute timed passage. A grown-up taps the words read wrong; the game reports words correct per minute and accuracy. A game cannot mark speech, so this is the honest version. | built |
| Too few passages; no split by text type | i-Ready, CAASPP | Five new grade 2-3 passages. Reading is now two skills: stories, and information texts | built |
| Geometry was area and volume only | i-Ready, CAASPP | New skills: **Shapes and Lines** (3-5), **Angles** (4), **Coordinate Grid** (5-6) | built |
| No measurement at grades 4-5 | i-Ready, CAASPP | New skill **Unit Conversions** (4-5) | built |
| No "explain your reasoning" | CAASPP math claim 3 | New skill **Who Is Right?** (2-6): find the error, judge a claim, pick the supporting example. Typed explanations in the Writing Workshop | built |
| No research items | CAASPP English claim 4 | New skill **Research Skills** (3-6) | built |
| No writing | CAASPP English claim 2 | **Writing Workshop**: he types a sentence for an opinion, information or explanation task and it is marked | built |
| Science | CAST, grade 5 | Needs its own question bank | not built |
| Grades 7 and 8 | CAASPP | Needs new skills in both subjects | not built |
| Performance tasks, long passages | CAASPP | Passages here are 50-150 words; the real ones run several hundred | not built |
| ELPAC speaking | ELPAC | A game cannot mark speech | out of scope |

## The grader

Typed sentences cannot be checked against a fixed answer, so they need a marker. This reuses the one from
the dog game.

1. **On the tablet.** A small sentence-meaning model (potion-base-4M by Minish Lab, MIT license) ships with
   the game in `js/pupvec.js`. Each writing task carries a few strong and a few weak example sentences. The
   model checks that his sentence is on the topic and closer to the strong examples than the weak ones. It
   can tell on-topic from off-topic and an opinion from a stray detail. It cannot judge style. It is set
   lenient: wrongly refusing a good sentence costs more than letting a weak one through.
2. **Claude, optional.** A grown-up can add an Anthropic API key under Options. Typed sentences are then
   marked by Claude with a short piece of feedback, and story-writing tasks become available (they are too
   open for the small model). The key is stored on the device only, apart from the save file, and is never
   in this repository. Each marked sentence is one small API call.
3. If neither is available the Workshop says so instead of guessing.

Writing does not gate dragons or mastery, because the on-tablet marker is not reliable enough to block
progress on.

## Where things live

- `js/learn2.js`: the new skills, passages, Maze Dash, Read-Aloud Check, Writing Workshop
- `js/grader.js`: on-tablet and Claude marking
- `js/pupvec.js`: the sentence-meaning model, loaded only when the Workshop opens
- `js/engine.js`: read-aloud and the typing box
- `android/.../MainActivity.java`: Android text-to-speech bridge

## Grade 2 standards map

Every Grade 2 Common Core standard that can be asked on a screen has a skill. 33 skills: 12 math, 21 English.

| Standards | Skill |
|---|---|
| 2.OA.1, 2.MD.5 | Word Problems |
| 2.OA.2, 2.NBT.5-8 | Add & Subtract (facts to 20, within 100, within 1000, 10 or 100 more and less, three addends) |
| 2.OA.3-4, 2.G.2 | Even, Odd & Equal Groups; Shapes & Equal Parts (rows and columns) |
| 2.NBT.1, 2.NBT.3 | Place Value (digit value, expanded form, number names) |
| 2.NBT.2 | Mystery Numbers & Patterns (skip counting) |
| 2.NBT.4 | Compare Numbers |
| 2.NBT.9, MP.3 | Who Is Right? |
| 2.MD.1-4, 2.MD.9-10 | Charts & Measuring (units, tools, charts, line-plot data) |
| 2.MD.6 | Number Lines |
| 2.MD.7 | Telling Time (five minutes, a.m. and p.m.) |
| 2.MD.8 | Counting Money (coins, dollar bills, change) |
| 2.G.1, 2.G.3 | Shapes & Equal Parts |
| RF.2.3 | Phonics & Word Sounds; Sight Words; Listen for Sounds |
| RF.2.4 | Fill the Gap; Maze Dash; Read-Aloud Check |
| RL.2.1-7 | Reading: Stories (includes a poem, story beginning and ending) |
| RI.2.1-8 | Reading: Information (includes author's purpose); Research & Book Skills (text features) |
| SL.2.2 | Listening |
| W.2.1-3 | Writing Workshop |
| L.2.1 | Plural Nouns; Past-Tense Verbs; Subject-Verb Agreement; Parts of Speech; Grammar Power; Building Sentences |
| L.2.2 | Punctuation & Capitals; Spelling; Research & Book Skills (ABC order, dictionary) |
| L.2.3 | Grammar Power (formal and informal) |
| L.2.4 | Context Clues; Word Parts; Grammar Power (compound words) |
| L.2.5 | Synonyms & Antonyms; Shades of Meaning |

Not covered because a screen cannot do it: measuring a real object with a ruler (2.MD.1), drawing shapes and
graphs (2.G.1, 2.MD.10), speaking and discussion (SL.2.1, SL.2.4-6), handwriting, and longer writing pieces.

## How practice adapts

Each skill sits in a box from 0 (shaky) to 4 (solid). A right answer moves it up one box; a miss sends it to box 0.

- **Weaknesses come back.** A missed skill returns three questions later, marked "One more try". At most one
  question in three is a retry. Box-0 skills are also dealt twice in each round.
- **Strengths are kept warm.** Solid skills still come back, marked "Review", but less often the higher the
  box: every round, then every second, third and fourth round.
- **Stretch and warm-up.** A mastered skill sometimes returns one grade harder ("Stretch"). A skill missed
  three times gets an easier version first ("Warm-up"), where an earlier grade has that skill. Neither counts
  toward mastery.
- **Mastery.** Four right in a row with at least five attempts, or passing the Study Hall proof. Two later
  misses take mastery away so the skill returns to regular practice.
- **Night Watch** runs always drill the weakest unmastered skill.

In a 300-question simulation of a student weak in three skills, those three took 36% of the questions and
every other skill still came up at least five times.
