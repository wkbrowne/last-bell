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

## Quick check, review by days, Fact Dash, practise report, English hints (v1.16)

**Design aims.** Spend his time on what he does not know yet; bring back what he does know just before he would forget
it; make number facts automatic; tell a grown-up exactly what to practise; and make every hint about the choice he made.

**Quick check (placement).** Twelve questions, one from each of twelve core skills (six math, six English), no hints,
nothing recorded as a miss. Math answers are typed where possible so they cannot be guessed. A right answer gives that
skill a *head start*: two more right answers master it, instead of about six. It does not mark the skill mastered,
because one answer can be luck. Offered once at the start of a session (he can say no) and always available under
Practice & Tests.

**Review by days.** A mastered skill leaves the daily rounds and comes back after 1 day, then 3, 7, 14, 30 and 60 days.
A right answer on its due day moves it to the next gap; a miss sends it back to 1 day (two misses still un-master it).
When nothing is left to learn and nothing is due, the reviews due soonest are brought forward so there is always
something to play.

**Fact Dash.** One minute of number facts on a big number pad, no OK button: sums and differences within 20 in Grade 2,
times tables from Grade 3, division too from Grade 4. Each fact's speed and misses are remembered, and slow or missed
facts come up more often. A wrong answer shows the right one for a moment. It counts a little toward the daily goal.

**Practise report.** The grown-up Report Card has a second page: an example (with its answer) of each kind of question
that has been missed and not yet fixed, the last and best Fact Dash, the slow facts, how many skills are due for review,
and whether the quick check has been done.

**English hints from the choice made.** Sound-alikes: what the chosen word actually means. Verb agreement: which
subjects the chosen word goes with. Punctuation: what differs between the chosen sentence and a correct one (first
letter, end mark, a name without a capital, apostrophe, quotation marks, commas) without giving the answer. Parts of
speech: a test to apply to the chosen word. Synonyms: "that one is the opposite". Plurals and past tense: "that follows
the rule, but this word is a rule-breaker". Any fill-the-gap item: the sentence read back with his choice in it.
Spelling, phonics, word parts and reading still get a general hint.

**Also.** The guide is now one small arrow beside Dex plus a small marker over the goal when it is close. Sound on/off
is remembered between sessions, silences the reading voice too, is on the title menu, and can be forced with `?mute`
at the end of the web address.

## Bug hunt (v1.25)

`tests/hunt.js` drives the real game by taps and reports what breaks. It is not part of the game or the app. Load it
from the browser console (see the top of the file) and run `await HUNT.all()`, or one probe at a time.

| Probe | What it does |
|---|---|
| `layout` | Draws about 1,200 question cards in every state (fresh, hint showing, answer showing) and checks nothing runs off the screen. |
| `engine` | 5,000 answers across Grades 2–6 and 40 simulated days, saving and reloading every day. |
| `saves` | Loads current, old-format and broken save files and keeps playing. |
| `screens` | Opens every menu, shop, lesson, test and mini-game and closes it by taps. |
| `battles` | Plays real battles by taps: fight, bag, swap, run, win and lose. |
| `story` | Plays the whole story from the intro to the ferry by taps, with battles skipped. |

Found and fixed in this pass: Maze Dash crashed at the end of every round (the results never showed); menus with no
Back row could only be closed by tapping the thin margin outside them (they now have a close button); the battle menu
offered SWAP with nobody to swap to; the taller touch rows made the battle menu cover the HP panel; and a clock that
jumped backwards could freeze Dex mid-step.

## Play log and findings (v1.27)

`js/playlog.js` keeps a diary of play on the device (its own storage key, separate from the save; the last 5,000
events, roughly a month). Nothing is sent anywhere unless a grown-up uses the export button.

**What is recorded:** each sitting starting and the app going to the background; story goals set and story steps
reached; areas entered; battles (kind, enemy, result, seconds); blackouts; every question (skill, right or wrong, time
taken); lessons and Skill Builder runs; closed gates walked into; idle stretches of 45 seconds or more; optional
things chosen (shops, eggs, Fact Dash, Study Hall, night rescues, tests); the daily wrap-up; and the face he taps.

**The face.** After the daily wrap-up, once a day: "How was playing today?" with three faces. It can be closed
without answering.

**Findings** (Options → "How play is going", behind the grown-up gate) are drawn from the last 14 days and written as
sentences, each with a suggested change:

| Finding | Fires when |
|---|---|
| Stuck | the current story goal has been open for 3 sittings or 30 minutes of play |
| Too hard | lost to the same enemy 3 times without beating it, or more than 40% of battles lost |
| Stops at teaching / after losing / at a shut way / during questions / wanders off | 3 sittings (or 2 and 40% of them) ended within two minutes of that |
| Shorter sittings | the later half of sittings average under 70% of the earlier half |
| Never touched | three or more optional activities unused after 4 sittings |
| Not fun | 40% or more of at least 3 check-ins were a sad face |
| Long pauses | more than 45 seconds on the same skill 3 times |
| Too many misses | under 55% right over at least 20 questions |
| Keeps trying a shut way | the same closed gate walked into 4 times |

**Export.** The same screen saves or shares the whole log as a CSV file: the findings at the top, then one line per
event. In the app it opens the tablet's share sheet; in a browser it shares or downloads.

**How to use it.** Read the findings every week or two, change one thing, and see whether that finding goes away in
the next fortnight. Act on patterns, not single events: one child is a small sample.

## A gentler start, tap to use, and backups (v1.28)

**A gentler start.** Measured with `HUNT.earlyGame()`: a plain player (one critter, always the first move, three
answers in four right) from a new game until the first boss falls. Before: the boss beaten on the fifth try, 8 lost
battles out of 12. After: beaten on the second try in all three runs, 1–2 lost battles.
- The starter begins at level 6; the school area and the first two school fights are two to three levels lower.
- In Grades 2 and 3 enemies hit for 70% and 82% of normal damage.
- In Grades 2 and 3 a win gives each standing critter a quarter of its health back.
- A boss that wins comes back two levels weaker each time, up to six.
- When the team is under 40% health the crew says so once, and the guide arrow points to the nearest campfire or the
  Nest until they have rested.

**Tap to use.** A quick tap on a character, object, wandering stranger or door walks Dex to it (up to 30 steps) and
uses it. Tapping plain ground still acts on whatever he is facing. Holding a direction or pressing again cancels the walk.

**Backups.** Options → "Back up or restore progress" (grown-up gate). Back up shares or saves the whole game as one
line of text beginning `ZZSAVE1:`; restore takes that text pasted back in, shows what it contains, and asks before
replacing anything. Separately, once a day the previous save is kept as a spare, and a damaged save falls back to it.

## Act 2: Skyreach (v1.29)

`js/sky.js`. After the ferry, a voice on the walkie calls Dex to Radio Hill, where Grandmother Gale (an ancient dragon)
explains that the storm comes from islands above the clouds and carries him up the first time.

**Islands** (each a small walkable map of cloud over open sky): Roost Rock (Gale, a campfire, a stash), the Gust
Shrine, the Thunder Forge, the Cloud Library and the Storm Eye. Each has a perch to fly from.

**Getting there.** Gale will always carry him to Roost Rock and the Gust Shrine. The Forge, the Library and the Eye need
his own grown dragon (the existing rule: master skills to hatch and grow it). The perch menu and the goal line say
exactly what is missing.

**Flying is a game.** Hold a finger where you want to fly; collect sparks, dodge storm clouds. Two or three times a
flight a question appears and three Sky Rings carry the answers; flying through one answers it. Questions come from
the learning engine (short-answer math and English) and are recorded like any other. No flight can be failed.

**Shrine trials** (no hints, one miss allowed): the Wind Trial uses his weakest skills, the Thunder Trial is math, the
Reading Trial uses three new weather passages (also added to ordinary reading practice). Each gives a gift:

| Gift | Opens back home |
|---|---|
| GLIDE | the feather pad on the harbour sand: Gull Island (a stash and a Gloomwing that joins) |
| ROAR | three rubble piles in tree gaps around town, each hiding a stash |
| GLOW | the dark grove in Whisperwood, where a Wispkin joins |
| own dragon | rooftops: Coach Krunk's trophy case (school), Bash's grandma's seeds (mall), and the radio tower, which doubles night-rescue scrap |

Cloudsilk (Gust Shrine) and Thunder Glass (Thunder Forge) let the Night Market make a Sky Tonic and a Thunder Charm
(Brain Blasts hit 15% harder).

**Finale.** The Thunderhead in the Storm Eye (three waves, sky backdrop). Afterwards the rain stops and the town is
bright, except the cemetery and Blackwood Grounds, which stay stormy and spooky. There is no day/night clock in the
game, so "stormy at night" is kept as "stormy in the spooky places" plus the night rescues.

**Tests.** `HUNT.sky()` plays Act 2 by taps with a grown dragon from the end of the story to the storm lifting, then
tries every home unlock, the rooftops, the shop items and the weather; a second run without a dragon checks the first
gift can still be earned and the far islands stay shut and say why. The final battle was also played for real once.

## Quest Board (v1.30)

`js/quests.js`. A board by the Nest (and "Quests" in the menu) posts three new quests every day and one bigger quest
every week, built from what the game already has, so there is always something to do after the story.

| Kind | What it asks | How it finishes |
|---|---|---|
| Rescue | a survivor trapped at one of twelve places in town | win the battle there |
| Bounty | a named Horde Captain at one of those places | win the boss battle there |
| Delivery | a parcel left somewhere, wanted by Munch, Old Clank, Nana Newt or Professor Flicker | pick it up, walk it over |
| Befriend | a critter he has already seen | catch it with a Critter Snack |
| Defeat | 3–5 critters of one type that lives somewhere he can reach | win battles |
| Patrol | walk into a part of town | arrive |
| Brain | 10–20 right answers, 5 in a row, a Fact Dash score near his best, or mastering a new skill | play |

Each day has one action quest, one exploring quest and one brain quest, never two of the same kind. Places are only
chosen if he can walk to them right now (closed story gates are respected). Quests pay out the moment they are done
(scrap and items, scaled to his level). Five daily quests in a week earn a trophy, 250 scrap and two Mega Slushes.

**The arrow.** The story keeps the arrow while it has a next step. When the story is finished, or is waiting on a grown
dragon, the arrow and the goal line follow the tracked quest (the first one with a place, or the one he picks on the
board). Befriend and Defeat quests point to tall grass where that critter or type lives.

**Tests.** `HUNT.quests()` plays six days by taps (walking with the arrow; battles skipped except one rescue fought for
real): every daily quest finished each day, the weekly trophy awarded, the board opened and closed, and an old save
given quests. Thirty simulated days of quests at three stages of the game were checked: every quest with a place has
one he can reach.

## Quests and Act 2 together (v1.31)

The Quest Board and Skyreach now feed each other instead of running side by side.

- **Sky quests.** Once Gale has taken him up, the exploring slot can also be Sky Rings (steer through 4 right rings,
  any flight counts), Fly to an island he can reach, or a Sky delivery (a parcel on the Gust Shrine, Thunder Forge or
  Cloud Library, carried to Gale on Roost Rock). Islands are only picked if he can get there now (no dragon: Roost Rock
  and the Gust Shrine only). The arrow follows these across maps through the perches.
- **The board feeds the dragon.** While an egg is unhatched the brain quest is "Warm your egg: N right answers"; while
  a dragon is hatched but too small to ride it is "Grow your dragon: master a skill". These are marked 🐉 on the board.
  Every finished quest also warms an egg a little (+3), and a hatch or growth is checked right after the quest pays out.
- **One kind of rescue.** Board rescues are walkie signals now, the same as Night Watch: the kid joins the others at
  the Nest and counts toward "Kids rescued". A weekly quest can be "Answer 3 night signals".
- **Rewards he cares about.** Every third quest earns a new cap colour for Dex (changed under Wardrobe on the board);
  the weekly quest also brings a critter he does not have yet; a trophy shelf next to the board shows one cup per
  weekly trophy.

**Tests.** `HUNT.quests(6)`, `HUNT.quests(6, 'egg')` and `HUNT.quests(6, 'dragon')` play six days by taps each. They
check the 🐉 quests appear, the egg warms (or hatches), caps are earned and change Dex, the shelf fills, the weekly
critter arrives, signals count, and the bot flies between islands from the perch menus and steers through the right
rings to finish sky quests. A run with a Sky Rings quest forced every day finished it every day.

## Choose your hero (v1.32)

`js/hero.js`. The player can be **Dex** (skater: cap, lightning jacket), **Jo** (soccer star: ponytail, team shirt) or
**Lulu** (sparkle queen: pigtails, bows, skirt, glitter sneakers). Each has a different skin tone, and Mom matches
whichever is chosen. A new game asks right after the grade, before "My name is ... Okafor". An older save asks once,
the first time it is continued; nothing else about the save changes (crew, critters, learning, story, quests).
There is no way to change it afterwards.

- **One sprite key.** The player is still drawn as `dex`; `HUM.dex` is swapped for the chosen look, keeping the sword.
  The Quest Board colours go on Dex's cap, Jo's headband or Lulu's bows (and everyone's sneakers); the Wardrobe and
  the reward lines name them accordingly. A colour already picked in the Wardrobe is kept.
- **Name and pronouns.** Text about the hero uses tokens: `@N` (name), `@n` (name in lower case), `@he @He @him @his
  @His @himself`. `say()` fills them in for every dialogue line and choice; `mc()` and `ms()` fill them in for
  questions, passages, tips and explanations; Maze Dash and the Writing Workshop fill them in when they are picked.
  A few grammar items that test "himself" or an unclear "he" now use Bash and Mr. Munch, so their answer does not
  depend on the hero.
- **Learning history is kept.** A question's kind (`Learn.sig`) is worked out from its wording as written for Dex
  (`q.canon`), so a child who switches from Dex to Lulu mid-game keeps every "already seen" and "missed before" record.
- **Report Card.** The sittings page says "When he stops" or "When she stops" to match the hero.

**Tests.** `HUNT.hero()`: an older mid-game save continued for each hero, choosing by taps; the look, name, Mom,
colours and progress are checked, the hello line uses the new name, and the chooser never comes back. A new game
picks Lulu by taps and the intro says "My name is Lulu Okafor". Every skill's questions (and Select-all questions),
grades 2-6, generated from the same dice as Dex and as Lulu: the same kind of question every time, no token left,
no "Dex" and no stray "he" for Lulu; the writing tasks and mazes likewise.

## Defeat and Befriend quests that work (v1.33)

Reported: "Defeat 4 GHOST critters": he followed the arrow, and nothing happened. The arrow led to one tile of tall
grass near the Nest, in a part of town where only about 1 critter in 5 is a ghost, and standing on it does nothing;
wild critters only appear while walking in grass (1 step in 10). Four ghosts took ~200 grass steps, with no word on
what to do.

- **The right place.** `Quests.habitat()` now picks the part of town where the critter or type is most common (the
  share of its encounter table, a little against distance), and a tile in a patch of at least 8 joined grass tiles.
  Open quests made before this version are moved once (`q.v2`).
- **Hunting grounds.** In the quest's part of town (`Quests.ground()`), wild critters jump out more often (an extra
  15% a grass step on top of the usual 10%) and 70% of them are the kind the quest wants.
- **Saying what to do.** Stepping into a real patch there says once: "This is the place! GHOST-type critters live in
  this tall grass. Keep walking around in it and they will jump out." The arrow goes away while he is in such a patch
  (it comes back if he wanders off), and the quest text says "Follow the arrow, then walk around in the tall grass".

**Tests.** `HUNT.ground()` plays it like a child: follow the arrow, then wander in the grass, with real battles won by
taps. A GHOST quest: the cemetery (60% ghosts), done in about 35-45 grass steps and 5 battles. An old quest that
pointed at the Night Market: moved to the cemetery, done the same way. A Befriend quest: the critter turns up twice
within about a dozen grass steps (catching it is not part of this check).

## Sky Rings that wait (v1.34)

Reported: the rings came too fast; the child got discouraged (and a grown-up found it hard too). A question
appeared about 4.8 seconds before its rings reached the dragon: that was the time to read, think AND steer.

- **The rings wait.** They fly in and hover, bobbing, in front of the dragon until he picks. No timer.
- **Picking.** Tap anywhere in a ring's row, or drag the dragon there and let go (or up/down and A). The dragon lines
  up and swoops through. A tap is applied on the next frame unless the finger turned out to be dragging, so the
  row where a drag starts is not picked by mistake.
- **The row he is in glows**, and its answer turns yellow, so he can see what he is about to pick.
- **One more try.** A wrong ring pops and the other two fly back in: "Not that one! Try again." A right second try is
  1 spark (a first try is 3). Only the first try is recorded for learning.
- **Calm while thinking.** No sparks or storm clouds while a question is up. After 15 seconds: "Tap the ring with the
  answer!" (read aloud again for young readers).

**Tests.** `HUNT.rings()`: the rings are still there after 20 seconds of waiting, all three can be tapped, a wrong tap
pops that ring and leaves two, the right one then finishes it; the next question is right first time; 2 of 2 right,
learning recorded twice (once per question), 4 sparks. Tried by hand in the browser too: tap, drag and let go, a miss
and second try.

## Mashing through easy fights (v1.35)

Reported: against an enemy he thinks is too easy, he taps answers at random to get through. Before this, that cost
nothing: a wrong answer still landed at 60% and finished a weak enemy anyway.

- **Scare it off.** A lone wild critter 10+ levels below his best critter: "Scare it off!" (an instant win, a little
  scrap, counts for Defeat quests) or "Battle it anyway" ("Battle it (you could befriend it!)" if it is not in his
  Field Guide yet). Most of the fights that invited mashing are gone.
- **Mashing misses.** A WRONG answer tapped faster than it could be read (the engine's own "too quick" rule:
  38 ms a character, at least 1 s) makes the move miss altogether: "Whoa, too fast! ... Read the question, then tap."
  Reading is now the fastest way through. (A right answer that quick still lands at normal strength, as before.)
- **Read first.** Two too-quick answers in a row in battle, and the teacher says so once; the next three battle
  questions dim their choices behind a "READ IT FIRST..." bar for that same reading time. Typed answers are never
  locked (typing takes its own time). State: `G.calm` (`Calm` in battle.js); each time is logged as `calm` in the
  play log.

**Tests.** `HUNT.calm()`: a Lv 6 critter against a Lv 25 team is scared off for scrap; in a fair fight two instant
wrong answers both miss, the slow-down line appears, read-first cards follow (an instant tap on one is refused),
and the fight is then won by answering normally. The other bots now wait while a card says `locked`.
