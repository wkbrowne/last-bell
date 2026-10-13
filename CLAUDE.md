# Last Bell (Zombie Zone)

One page, `index.html`, loading `js/*.js` in order; no build. The save is `G` in localStorage (`js/game.js`), the current screen is `Scene`.

- Learning engine: `js/learn-core.js` is a copy from `../learn-core`. Change it there, then `sh sync-core.sh`. Never edit the copy.
- Any script change: run `./bump.sh` (cache version in `sw.js` and `index.html`), or the pre-commit hook refuses. Once per clone: `git config core.hooksPath hooks`.
- Preview: `.claude/launch.json` serves the repo on port 8770. Smoke test after a change: new game, grade 2, console errors, then `Learn.report()` through its three pages.
- Grown-up Report Card: `Learn.report()` in `js/learn.js`. Day stats: `dayTick` in `js/game.js`. Sittings: `Sess` in `js/game.js` (learn-core's `sessions`).
- Tests for the engine run in learn-core, not here.
