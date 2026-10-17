// ============================================================ THE HERO
// Who the player is: chosen once, at the start of a new game, or the first time an older save is opened.
// The sprite key stays 'dex' everywhere; HUM.dex is swapped for the chosen look.
// Text that names the hero uses tokens: @N (name), @n (name in lower case), @he @He @him @his @His @himself. heroText() fills them in.
const HEROES = {
  dex: { n: 'Dex', tag: 'Skater. Lightning jacket, red cap, scraped knees.', p: ['he', 'him', 'his', 'himself'], acc: ['cap', 'scarf', 'shoes'], col0: 'red',
    look: { skin: '#a86b42', hair: '#1c1410', style: 'cap', spiky: 1, cap: '#e5483d', jacket: '#2b3a67', shirt: '#f6b93b', emblem: 1, pants: '#3a3f52', shoes: '#e5483d', scarf: '#e5483d', pack: '#6a5238', gloves: '#22202c', eye: '#5a3a1e' } },
  jo: { n: 'Jo', tag: 'Soccer star. Ponytail, team shirt, fastest kid in town.', p: ['she', 'her', 'her', 'herself'], acc: ['band', 'shoes'], col0: 'gold',
    look: { skin: '#f1c9a5', hair: '#8a3a1e', style: 'pony', band: '#f2c14e', shirt: '#1f9a8a', num: '9', pants: '#2b3a67', shoes: '#f2c14e', pack: '#6a5238', eye: '#3a6a5a', lash: 1 } },
  lulu: { n: 'Lulu', tag: 'Sparkle queen. Pigtails, big bows, glitter sneakers.', p: ['she', 'her', 'her', 'herself'], acc: ['bows', 'shoes'], col0: 'pink',
    look: { skin: '#6b3f26', hair: '#1a1010', style: 'bunches', bows: '#e07aa0', jacket: '#ff9ad0', shirt: '#c49cff', heart: '#ff4f8a', skirt: '#8e6be8', pants: '#ffc4e4', shoes: '#e07aa0', pack: '#c49cff', eye: '#5a3a1e', lash: 1, sparkle: 1 } }
};
for (const k in HEROES) HUM['hero_' + k] = HEROES[k].look;   // for the chooser's pictures
const heroKey = () => (typeof G !== 'undefined' && G && HEROES[G.hero]) ? G.hero : 'dex';
const hero = () => HEROES[heroKey()];
const HN = () => hero().n;
// fill in the hero tokens; k picks a hero other than the current one ('dex' gives the text as it was first written)
function heroText(s, k) {
  if (typeof s !== 'string' || s.indexOf('@') < 0) return s;
  const H = HEROES[k] || hero(), [he, him, his, self] = H.p, cap = w => w[0].toUpperCase() + w.slice(1);
  return s.replace(/@(himself|Him|him|His|his|He|he|N|n)/g, (m, t) => ({ N: H.n, n: H.n.toLowerCase(), he, He: cap(he), him, Him: cap(him), his, His: cap(his), himself: self })[t]);
}
// every string (and string in an array) of an item, filled in
function heroItem(o, k) { const r = {}; for (const key in o) { const v = o[key]; r[key] = typeof v === 'string' ? heroText(v, k) : Array.isArray(v) ? v.map(x => typeof x === 'string' ? heroText(x, k) : x) : v && v.constructor === Object ? heroItem(v, k) : v; } return r; }

// every dialogue line and choice goes through say(), so the tokens are filled in there
{ const o = say; say = function (who, str, opts) { if (opts && opts.choices) opts = Object.assign({}, opts, { choices: opts.choices.map(c => heroText(c)) }); return o.call(this, who, heroText(str), opts); }; }

const Hero = {
  // put the chosen look on the player sprite, keeping the sword and the quest colour
  apply() {
    const H = hero(), old = HUM.dex || {};
    HUM.dex = Object.assign({}, H.look, { sword: old.sword || 0 });
    const c = typeof QCAPS !== 'undefined' && G && G.cos && QCAPS.find(x => x[0] === G.cos.cap); if (c) for (const a of H.acc) HUM.dex[a] = c[1];
    HUM.mom.skin = H.look.skin; if (HUM.granny) HUM.granny.skin = H.look.skin;   // Mom and Granny Dot look like their kid
    for (const k in Art.cache) if (/^[hs]:(dex|mom|granny)/.test(k)) delete Art.cache[k];
  },
  set(k) {
    G.hero = k; const H = HEROES[k];
    G.cos = G.cos || { caps: [], cap: H.col0 }; if (!G.cos.caps.includes(H.col0)) G.cos.caps.push(H.col0);
    if (!G.cos.chosen && G.cos.cap === 'red') G.cos.cap = H.col0;   // the hero's own colour, unless another was picked in the Wardrobe already
    this.apply(); if (typeof PlayLog !== 'undefined') PlayLog.add('hero', { k });
  },
  // three big cards; tap one, then say yes. Resolves when a hero is chosen (there is no way out without choosing).
  pick(first) {
    const keys = Object.keys(HEROES);
    return new Promise(res => {
      const hits = keys.map((k, i) => ({ x: 60 + i * 290, y: 196, w: 260, h: 420, i, k }));
      let busy = false, t = 0;
      const choose = async i => {
        if (busy) return; busy = true; Snd.sfx('ok'); const H = HEROES[keys[i]];
        const c = await ask(null, `Play as ${H.n}? You only get to choose once, so pick the one you like best!`, [`Yes, I am ${H.n}!`, 'Let me look again']);
        if (c !== 0) { busy = false; return; }
        UI.pop(m); this.set(keys[i]); Snd.sfx('levelup'); res(keys[i]);
      };
      const m = { hits,
        update(dt, pr) { t += dt; },
        tap(x, y) { const h = hits.find(r => inRect(x, y, r)); if (h) choose(h.i); },
        draw() {
          ctx.fillStyle = 'rgba(12,6,30,.9)'; ctx.fillRect(0, 0, W, H); panel(30, 40, W - 60, H - 70);
          setFont(30, true); text('WHO ARE YOU?', W / 2, 70, '#ffd76a', 'center');
          setFont(22); text(first ? 'Tap the hero you want to be. You only choose once.' : 'Something new: choose who you play as! You only choose once.', W / 2, 124, '#c8ffb8', 'center');
          setFont(19); text('Your crew, critters and progress all stay the same.', W / 2, 156, '#8f86a8', 'center');
          hits.forEach((r, i) => { const k = keys[i], H = HEROES[k], b = Math.sin(t / 300 + i) * 4;
            rbox(r.x, r.y + 6, r.w, r.h, 24, 'rgba(8,4,20,.45)'); rbox(r.x, r.y, r.w, r.h, 24, ['#2b3a67', '#1f6a62', '#7a3a78'][i], '#ffd76a', 3);
            ctx.drawImage(Art.sprite('hero_' + k), r.x + r.w / 2 - 118, r.y + 4 + b, 236, 236);
            setFont(36, true); text(H.n, r.x + r.w / 2, r.y + 250, '#fff', 'center');
            setFont(20); wrap(H.tag, r.w - 34).forEach((l, j) => text(l, r.x + r.w / 2, r.y + 300 + j * 26, '#f4eeff', 'center'));
            setFont(18); text('Tap to choose', r.x + r.w / 2, r.y + r.h - 34, '#ffd76a', 'center'); });
        } };
      UI.push(m);
    });
  },
  init() {
    Object.defineProperty(SPEAKERS.dex, 'n', { get: () => HN(), configurable: true });
    { const o = loadGame; loadGame = function () { const r = o.apply(this, arguments); if (r) Hero.apply(); return r; }; }
    // an older save, opened for the first time since heroes came in: choose once, before anything else
    { const o = welcomeBack; welcomeBack = async function () { if (G && !G.hero) { await Hero.pick(false); saveGame(true); await say('dex', `That's me. ${HN()} Okafor. Let's go.`); } return o.apply(this, arguments); }; }
  }
};
window.addEventListener('DOMContentLoaded', () => Hero.init());
// what the quest colours are called for this hero
const capWord = () => hero().acc[0] === 'cap' ? 'cap' : hero().acc[0] === 'band' ? 'headband' : 'bow color';
