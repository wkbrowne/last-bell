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
