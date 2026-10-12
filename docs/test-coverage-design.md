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

## Built for a young learner

- **Pictures.** Grade 2 math questions are mixed with drawn models: analog clocks, labeled coins and dollar
  bills, number lines with jumps, rows of counters, base-ten blocks, bar charts, shapes, shaded fraction
  circles and ten-frames. Nine Grade 2 lessons end with a worked picture before the proof questions.
- **Read-aloud.** Story and lesson text can be read by the device voice: automatically (on by default for
  grades 2-3, switch under Options) or with the READ button on any dialogue box. Question cards have READ TO ME.
- **A day's play.** A daily goal (10, 20 or 30 questions, default 20) with a progress pill on screen. Meeting
  it shows a campfire wrap-up (questions, percent right, what got stronger, what is next), gives a small
  reward, counts a day streak, and offers to save and stop. A grown-up can set a play-time limit; when it is
  reached the game wraps up and needs a grown-up to continue. Coming back on a new day gives a short recap.
- **Proofreading pass (Grade 2).** Fixed: spelling choices that were real words (vary, dose, cud, wen),
  sight-word sets containing sound-alikes (where/wear, their/there), synonym questions that could offer a
  second right answer, "persons" and "waked" as wrong answers, a subtraction that could go negative, an
  ambiguous bedtime question, and letter greetings described as sentences.

## Question sweep and engine tightening (v1.12)

**Questions.** Every generator and item bank was read line by line, then 234,000 generated questions were machine-checked:
each bare sum was recomputed, and every question was checked for four distinct choices, no wrong choice equal in value to
the right one (for example 3/6 offered against 1/2), and no negative or broken choices below Grade 6. Fixed: a fraction
question that could offer an equal-value wrong answer; decimal subtraction that could go below zero; negative wrong
choices in Grade 3–5 subtraction, rows and order-of-operations items; skip counting that ran past 1,000; a wrong
explanation for "10 more than 195"; and an adverb item with a defensible second answer. Bar charts now have a line for
every unit so odd values can be read exactly.

**Type-the-answer.** A question is only turned into a typed answer when it makes sense without its choices. "Which number
is EVEN?" used to be able to appear with a blank box.

**Kinds of question.** Each question has a *kind*: its wording with the particular numbers removed ("47 + 28 = ?" and
"35 + 49 = ?" are one kind; "7 + 8 = ?" is another; each English item is its own kind).

- A miss comes back three questions later as the **same kind**, not a random question from the skill.
- A missed kind must then be answered right **twice** before it is cleared, and it is favoured whenever that skill comes up.
- New questions prefer kinds not yet seen, so English items do not repeat until the bank has been used up.
- **Mastered** now means: four right in a row, at least five tries, right answers on up to six different kinds, and no
  missed kind still open. A lesson's three-in-a-row proof starts with the kind that was missed.
- Skills still being learned come up every round; only mastered skills are spaced out for review.
- After four misses in a row on a skill the quick retries stop (a lesson is offered instead), so one hard kind cannot
  take over a session.
- Two slips un-master a skill, but slips are forgiven after three right in a row.

**Grade 2 lessons.** Add & Subtract, Place Value, Mystery Numbers, Telling Time and Word Problems have Grade 2 wording
(the shared text taught multiplication, thousands and elapsed time).

**Grade 2 banks.** Subject-verb agreement, sound-alikes, context clues, word parts, parts of speech, sentences and
spelling each gained items, so none has fewer than nine.

**Simulated learners (Grade 2, 33 skills).** Always right: everything mastered after about 230 questions. Right 80% of
the time: 28 of 33 mastered after 400. Three weak skills at 35%: they get about a fifth of the questions and every other
skill still appears at least six times in 300.

## Skill Builder (v1.13)

When the same kind of question is missed twice, or a skill is missed three times running, the game stops and runs a
short guided loop instead of simply asking again. It follows the usual teaching sequence of *I do, we do, you do*:

1. **Watch.** A question of that kind is shown already solved, with the explanation.
2. **Together.** A new one with only two choices. A miss is explained and the same question is asked again until it is right.
3. **Almost there.** A new one with all the choices, again repeated until it is right.
4. **On your own.** Two in a row with no help. These count toward mastery.

Success clears the missed kind, pays 15 scrap and schedules one more check eight questions later. If step 4 fails, the
lesson and its picture are shown and the loop runs once more; if that fails too, the skill is rested until the next day.
For math every step is the same kind with new numbers. For English the missed item is shown and later answered, and the
practice around it uses other items from the same skill. The loop never interrupts a shop trial, an egg trial, a lesson
or a practice test, and it runs at most once every twelve questions.


## Hints, second tries and guide arrows (v1.14)

**One more try.** In ordinary play the first miss no longer shows the answer. The wrong choice is crossed out, a hint
appears, and he picks again. It still counts as a miss for mastery, so a second-try answer cannot inflate progress.
Tests, shop and egg trials, lesson proofs and the Skill Builder's solo step give no hints.

**Hints that name the mistake.** Where the wrong answer shows what went wrong, the hint says so:
- written for the common Grade 2 traps: adding when the story takes away (and the reverse), "how many more" answered
  with the total, counting coins instead of their value, swapping the clock hands, reading the next hour, giving the
  digit instead of its value, adding rows and columns instead of repeating;
- worked out for any sum: wrong operation, off by 1, off by 10, off by 100, otherwise too big or too small;
- everything else (most English items) gets the line of the skill's lesson that best matches the question. Those hints
  are about the skill, not the particular wrong choice.

**Guide arrows.** A trail of gold arrows on the ground follows the walkable route to the next story step, with a
bouncing marker over the goal. Inside a building it leads to the goal or to the exit. The route prefers roads and
paths over tall grass. Blocked story gates now say to follow the arrows. It can be switched off under Options.

## Performance on a Fire tablet (v1.15)

Measured in the browser by counting drawing calls per frame in four scenes. Not measured on a tablet.

| per frame | before | after (best) | after (balanced) |
|---|---|---|---|
| images drawn, town | 466 | 253 | 253 |
| images drawn, forest | 616 | 443 | 413 |
| images drawn, indoors | 358 | 137 | 115 |
| gradients built | 45–101 | 1–5 | 0 |

- **Ground cache.** The floor is painted once into 6×6-tile pieces and reused (about 20 draws instead of about 330).
- **Glow sprites.** Lights, fireflies, eyes in the trees and the screen-edge shadow are pre-made pictures, not fresh
  gradients every frame.
- **Quality levels.** Best, balanced, fastest. Fire tablets and other small devices start on balanced. The game steps
  down sooner than before (below about 47 frames a second, then below about 37). Fastest draws every other frame, drops
  fireflies and rain ripples, and uses the screen's plain resolution. A grown-up can pin a level under Options → Graphics.
- **Cheaper scaling.** Image smoothing is medium or low instead of high. Trees and grass sway only on best.
- **Sound.** A larger sound buffer, notes scheduled half a second ahead, every sound effect fades in over 4 ms instead
  of starting at full volume, volume changes glide, and the typewriter tick is softer, less frequent and silent while
  the voice is reading.

Still the heaviest thing on screen: forests, at about 400 tree pictures per frame.
