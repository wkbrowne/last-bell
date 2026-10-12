'use strict';
// Turn-based critter battles. Every attack is powered by a BRAIN BLAST question:
// a right answer supercharges the move, a wrong one makes it fizzle (but never fail outright).
const bsay = t => say(null, t, { auto: 650 });
const stageMul = s => s >= 0 ? (2 + s) / 2 : 2 / (2 - s);

const Battle = {
  on: false, st: null,
  async run(o) {
    const st = this.st = {
      o, foes: o.foes.map(f => { const c = makeCritter(f[0], f[1]); if (f[2]) c.nick = f[2]; return c; }),
      fi: 0, pi: G.party.findIndex(c => c.hp > 0), ex: 500, px: -500, ey: 0, py: 0, ea: 1, pa: 1, ef: 0, pf: 0,
      used: {}, block: false, scan: false, combo: 0, msg: '', part: new Set(), parts: [], splats: [], banner: null
    };
    if (o.look) st.foes[0].look = o.look;
    if (st.pi < 0) return 'lose';
    for (const c of G.party.concat(st.foes)) { c.st = { atk: 0, def: 0 }; c.stun = false; c.dhp = c.hp; }
    st.part.add(st.pi);
    const prevMusic = Snd.curName, prevScene = Scene;
    Snd.sfx('enc');
    for (let i = 0; i < 3; i++) { Fx.flash = .8; await tween(Fx, 'flash', 0, 110); }
    await fadeOut(180);
    Snd.play(o.music || (o.kind === 'wild' ? 'battle' : 'boss'));
    this.on = true; Scene = 'battle';
    await fadeIn(180);
    await Promise.all([tween(st, 'ex', 0, 450, easeOut), tween(st, 'px', 0, 450, easeOut)]);
    const f0 = st.foes[0], zs = SPECIES[f0.sp].z;
    await bsay(o.intro || (zs ? `${cname(f0)} lurches out of the shadows!` : `A wild ${cname(f0)} appeared!`));
    await bsay(`Go, ${cname(G.party[st.pi])}!`);
    let result = null;
    while (!result) {
      const act = await this.choose();
      const me = G.party[st.pi], foe = st.foes[st.fi];
      st.msg = '';
      if (act.k === 'run') {
        if (Math.random() < (statOf(me, 'spd') >= statOf(foe, 'spd') ? .9 : .55)) { await bsay('You got away safely!'); result = 'run'; break; }
        await bsay("Couldn't get away!");
      } else if (act.k === 'swap') await this.sendOut(act.i);
      else if (act.k === 'snack') { if (await this.snack(act.ok)) { result = 'caught'; break; } }
      const me2 = G.party[st.pi], fm = this.aiMove(foe, me2);
      if (act.k === 'move') {
        const pm = MOVES[act.m], pp = pm.pri || 0, fp = fm.pri || 0;
        const first = pp > fp || (pp === fp && statOf(me, 'spd') >= statOf(foe, 'spd'));
        const order = first ? [[me, foe, pm, true], [foe, me, fm, false]] : [[foe, me, fm, false], [me, foe, pm, true]];
        for (const [u, t, mv, isP] of order) { if (u.hp <= 0 || t.hp <= 0) continue; await this.doMove(u, t, mv, isP, isP ? act.ok : null); }
      } else if (foe.hp > 0 && me2.hp > 0) await this.doMove(foe, me2, fm, false, null);
      for (const [c, isP] of [[G.party[st.pi], true], [foe, false]]) {
        if (c.hp > 0 && c.status === 'ick') {
          c.hp = Math.max(0, c.hp - Math.max(1, Math.floor(maxHp(c) / 8)));
          this.flash(isP); await tween(c, 'dhp', c.hp, 300); await bsay(`${cname(c)} feels icky...`);
        }
      }
      if (foe.hp <= 0) { await this.foeDown(); if (st.fi >= st.foes.length) { result = 'win'; break; } }
      if (G.party[st.pi].hp <= 0) {
        Snd.sfx('faint'); await tween(st, 'py', 260, 350); await bsay(`${cname(G.party[st.pi])} is knocked out!`);
        if (!G.party.some(c => c.hp > 0)) { result = 'lose'; break; }
        const i = await this.pickSwap(true); await this.sendOut(i, true);
      }
    }
    if (result === 'win') {
      G.wins++;
      const scrap = st.foes.reduce((a, c) => a + (SPECIES[c.sp].z ? 5 + c.lvl * 2 : 2 + Math.floor(c.lvl / 2)), 0) * (o.kind === 'boss' ? 2 : 1);
      G.scrap += scrap;
      if (o.kind !== 'wild') { Snd.play('win'); }
      await bsay(`You won! Found ${scrap} scrap.`);
    }
    if (result === 'win' || result === 'caught') await this.evolutions();
    await fadeOut(250);
    for (const c of G.party) { delete c.st; delete c.stun; }
    this.on = false; Scene = prevScene; Snd.play(prevMusic);
    await fadeIn(250);
    return result;
  },
  aiMove(foe, me) {
    const ms = foe.moves.map(id => MOVES[id]);
    const dmg = ms.filter(m => m.p), stat = ms.filter(m => !m.p);
    if (stat.length && Math.random() < .2) return pick(stat);
    if (!dmg.length) return pick(ms);
    const ws = dmg.map(m => m.p * typeMult(m.t, SPECIES[me.sp].t) * (m.acc || 100) / 100);
    let r = Math.random() * ws.reduce((a, b) => a + b, 0);
    for (let i = 0; i < dmg.length; i++) { r -= ws[i]; if (r <= 0) return dmg[i]; }
    return dmg[0];
  },
  async choose() {
    const st = this.st, o = st.o;
    while (true) {
      const me = G.party[st.pi], foe = st.foes[st.fi];
      st.msg = `What will ${cname(me)} do?`;
      const i = await menu(['FIGHT', 'CREW', 'BAG', 'SWAP', 'RUN'].map((l, k) => ({ label: l, disabled: (k === 1 && !G.crew.length && !G.gear.sword) || (k === 3 && !G.party.some((c, j) => j !== st.pi && c.hp > 0)) })), { x: 664, by: H - 12, w: 284, cancel: false, sel: 0, rh: 42 });   // five rows must not cover the HP panel above
      if (i === 0) {
        st.msg = '';
        const mi = await menu(me.moves.map(id => { const m = MOVES[id]; return { label: m.n, right: m.t + (m.p ? '  ' + m.p : '   —'), rcol: TYPES[m.t].col }; }), {
          x: 12, by: H - 12, w: 640, onDraw: s => {
            const m = MOVES[me.moves[s]];
            panel(664, BOX_Y + 2, 284, BOX_H - 4); setFont(24);
            wrap(m.d, 244).forEach((l, k) => text(l, 684, BOX_Y + 22 + k * 26, '#e8e0f4'));
            const e = typeMult(m.t, SPECIES[foe.sp].t);
            if (m.p && (st.scan || G.dex[foe.sp] || G.seen[foe.sp] > 1)) text(e > 1 ? 'Super effective!' : e < 1 ? 'Not very effective' : 'Normal damage', 684, BOX_Y + BOX_H - 44, e > 1 ? '#7fe08a' : e < 1 ? '#e07a8a' : '#b9b1c9');
          }
        });
        if (mi < 0) continue;
        let ok = await Learn.quiz(st.combo >= 2 ? `BRAIN BLAST!   COMBO ×${st.combo}` : 'BRAIN BLAST!');
        if (!ok && G.gear.charms.retry && !st.used.retry) { st.used.retry = true; await bsay('The Second-Chance Charm glows. Try another one!'); ok = await Learn.quiz('SECOND CHANCE!'); }
        st.combo = ok ? st.combo + 1 : 0;
        return { k: 'move', m: me.moves[mi], ok };
      }
      if (i === 1) {
        const acts = (G.gear.sword ? ['sword'] : []).concat(G.crew);
        const ci = await menu(acts.map(id => id === 'sword' ? { label: `Dex: ${SWORDS[G.gear.sword - 1].n}`, disabled: st.used.sword, col: '#ffd76a' } : { label: `${CREW[id].n}: ${CREW[id].ab}`, disabled: st.used[id] }), { x: 12, by: H - 12, w: 640, onDraw: s => { panel(664, BOX_Y + 2, 284, BOX_H - 4); setFont(24); wrap((acts[s] === 'sword' ? 'Dex jumps in with his blade! Answer a question to strike at full power.' : CREW[acts[s]].abd) + ' (Once per battle. Free!)', 244).forEach((l, k) => text(l, 684, BOX_Y + 22 + k * 26, '#e8e0f4')); } });
        if (ci < 0) continue;
        if (acts[ci] === 'sword') { await this.strike(); if (foe.hp <= 0) return { k: 'item' }; } else await this.crew(acts[ci]);
        continue;
      }
      if (i === 2) {
        const ids = Object.keys(ITEMS).filter(id => G.bag[id] > 0);
        if (!ids.length) { await bsay('Your bag is empty!'); continue; }
        const bi = await menu(ids.map(id => ({ label: ITEMS[id].n, right: '×' + G.bag[id] })), { x: 12, by: H - 12, w: 640, onDraw: s => { panel(664, BOX_Y + 2, 284, BOX_H - 4); setFont(24); wrap(ITEMS[ids[s]].d, 244).forEach((l, k) => text(l, 684, BOX_Y + 22 + k * 26, '#e8e0f4')); } });
        if (bi < 0) continue;
        const id = ids[bi], it = ITEMS[id];
        if (it.foe) { await this.useOnFoe(id); return { k: 'item' }; }
        if (it.buff) { G.bag[id]--; me.st[it.buff] = Math.min(3, me.st[it.buff] + 2); Snd.sfx('heal'); await bsay(`${cname(me)} gulps the ${it.n}. ${it.buff.toUpperCase()} rose sharply!`); return { k: 'item' }; }
        if (it.party) { G.bag[id]--; Snd.sfx('heal'); for (const c of G.party) if (c.hp > 0) { c.hp = Math.min(maxHp(c), c.hp + Math.floor(maxHp(c) * it.party)); c.dhp = c.hp; } await bsay('Soft moonlight washes over your whole team. Everyone feels better!'); return { k: 'item' }; }
        if (id === 'snack') {
          if (SPECIES[foe.sp].z) { await bsay("Zombies don't want snacks. They want BRAINS. (Too bad you're using yours.)"); continue; }
          if (o.kind !== 'wild') { await bsay("That critter already has a friend!"); continue; }
          const ok = await Learn.quiz('FRIENDSHIP BONUS!');
          return { k: 'snack', ok };
        }
        const ti = await this.pickParty('Use on who?');
        if (ti < 0) continue;
        if (!(await useItem(id, G.party[ti]))) { await bsay("That won't do anything right now."); continue; }
        G.party[ti].dhp = G.party[ti].hp;
        return { k: 'item' };
      }
      if (i === 3) { const si = await this.pickSwap(false); if (si < 0) continue; return { k: 'swap', i: si }; }
      if (i === 4) { if (o.kind !== 'wild') { await bsay('No running from this one!'); continue; } return { k: 'run' }; }
    }
  },
  pickParty(title, filter) {
    return menu(G.party.map((c, k) => ({ label: `${cname(c)}  Lv${c.lvl}`, right: `${c.hp}/${maxHp(c)}`, disabled: filter ? !filter(c, k) : false, col: c.hp <= 0 ? '#e07a8a' : null })), { x: 12, by: H - 12, w: 640, title });
  },
  async pickSwap(forced) {
    const st = this.st;
    while (true) {
      const i = await menu(G.party.map((c, k) => ({ label: `${cname(c)}  Lv${c.lvl}`, right: `${c.hp}/${maxHp(c)}`, disabled: c.hp <= 0 || k === st.pi })), { x: 12, by: H - 12, w: 640, title: forced ? 'Who goes in next?' : 'Swap to who?', cancel: !forced });
      if (i >= 0 || !forced) return i;
    }
  },
  async sendOut(i, fromFaint) {
    const st = this.st;
    if (!fromFaint) { await bsay(`Come back, ${cname(G.party[st.pi])}!`); await tween(st, 'px', -500, 250); }
    st.pi = i; st.py = 0; st.px = -500; st.part.add(i);
    const c = G.party[i]; c.dhp = c.hp;
    await tween(st, 'px', 0, 300, easeOut); await bsay(`Go, ${cname(c)}!`);
  },
  // Dex's own once-per-battle attack. The better the blade, the bigger the hit.
  async strike() {
    const st = this.st, foe = st.foes[st.fi], tier = G.gear.sword, sw = SWORDS[tier - 1], bane = tier === 5 && foe.sp === 'bellringer';
    st.used.sword = true;
    await say('dex', pick([`${sw.n}, don't fail me now!`, 'My turn!', 'Hey, ugly! Heads up!']));
    const ok = await Learn.ask(Learn.make(pick(Learn.forGrade(G.learn.grade, 'math')).id), 'SWORD STRIKE!');
    const d = Math.max(1, Math.floor(maxHp(foe) * (.1 + .05 * tier) * (ok ? 1 : .5) * (bane ? 2 : 1)));
    foe.hp = Math.max(0, foe.hp - d); Snd.sfx('crit'); this.flash(false, d, 'GRIT'); Fx.shake = 10; tween(Fx, 'shake', 0, 300);
    if (ok) st.banner = { t0: performance.now(), txt: bane ? 'BELLBREAKER!' : 'SWORD STRIKE!' };
    await tween(foe, 'dhp', foe.hp, 350);
    await bsay(bane ? 'The Bellbreaker rings like thunder. This is what it was made for!' : ok ? `A clean hit with the ${sw.n}!` : 'A glancing blow. The answer was off, so the swing was too.');
  },
  async useOnFoe(id) {
    const st = this.st, foe = st.foes[st.fi], it = ITEMS[id], mh = maxHp(foe); G.bag[id]--;
    await bsay(`Dex ${it.foe === 'venom' ? 'throws' : 'unrolls'} the ${it.n}!`);
    let d = 0;
    if (it.foe === 'venom') { d = Math.floor(mh * .12); foe.status = 'ick'; }
    if (it.foe === 'bolt') d = Math.floor(mh * .22 * typeMult('SPARK', SPECIES[foe.sp].t));
    if (it.foe === 'frost') { d = Math.floor(mh * .08); foe.stun = true; }
    d = Math.max(1, d); foe.hp = Math.max(0, foe.hp - d); Snd.sfx('crit'); this.flash(false, d, it.foe === 'venom' ? 'ROT' : it.foe === 'bolt' ? 'SPARK' : 'GHOST');
    if (it.foe === 'bolt') { Fx.flash = .7; tween(Fx, 'flash', 0, 300); Snd.sfx('thunder'); }
    await tween(foe, 'dhp', foe.hp, 350);
    await bsay(it.foe === 'venom' ? `${cname(foe)} is covered in venom. It has the Icks!` : it.foe === 'bolt' ? 'KRAKOOM! Lightning hammers the foe!' : `${cname(foe)} is frozen solid. It will miss its next turn!`);
  },
  async crew(id) {
    const st = this.st, me = G.party[st.pi], foe = st.foes[st.fi], bond = G.bond[id] || 0;
    st.used[id] = true; Snd.sfx('heal');
    if (id === 'priya') {
      st.scan = true; foe.st.def = Math.max(-3, foe.st.def - (bond >= 2 ? 2 : 1));
      await say('priya', `Scanning... got it! ${cname(foe)} is weak to ${weakTo(SPECIES[foe.sp].t).join(' and ')}. And I found a soft spot!`);
      await bsay(`${cname(foe)}'s DEF fell!`);
    } else if (id === 'bash') {
      st.block = true; if (bond >= 2) me.st.atk = Math.min(3, me.st.atk + 1);
      await say('bash', "I got this one. Nobody touches the little guy.");
      await bsay(`Bash will block the next hit!${bond >= 2 ? ` ${cname(me)}'s ATK rose!` : ''}`);
    } else {
      const amt = Math.floor(maxHp(me) * (.35 + .1 * bond));
      me.hp = Math.min(maxHp(me), me.hp + amt); me.status = null; me.stun = false;
      await say('wren', 'Breathe. Shake it out. You have got more in the tank than you think.');
      await tween(me, 'dhp', me.hp, 350); await bsay(`${cname(me)} caught a second wind!`);
    }
  },
  async doMove(u, t, m, isP, brain) {
    const st = this.st;
    if (u.stun) { u.stun = false; await bsay(`${cname(u)} is stunned and can't move!`); return; }
    await bsay(`${cname(u)} used ${m.n}!`);
    if (!m.p) {
      if (brain === false) { await bsay('...but it lost focus and fizzled out.'); return; }
      await this.fx(u, t, m, true); return;
    }
    if (Math.random() * 100 > (m.acc || 100) + (brain ? 15 : 0)) { await bsay('...but it missed!'); return; }
    await tween(st, isP ? 'px' : 'ex', isP ? 60 : -60, 90); tween(st, isP ? 'px' : 'ex', 0, 140);
    if (!isP && st.block) { st.block = false; Snd.sfx('no'); await bsay('Bash blocks it! "Not today, pal."'); return; }
    const eff = typeMult(m.t, SPECIES[t.sp].t), crit = Math.random() < .06;
    const A = statOf(u, 'atk') * stageMul(u.st.atk), D = statOf(t, 'def') * stageMul(t.st.def);
    let d = ((2 * u.lvl / 5 + 2) * m.p * A / D) / 50 + 2;
    d *= (SPECIES[u.sp].t === m.t ? 1.5 : 1) * eff * (crit ? 1.5 : 1) * (.85 + Math.random() * .15);
    if (brain === true) d *= 1.3 + .1 * Math.min(5, st.combo);
    if (brain === false) d *= .6;
    if (isP && G.gear.sword) d *= 1 + .06 * G.gear.sword;
    if (isP && m.t === 'DRAGON' && brain === true) d *= 1 + .08 * Math.min(5, st.combo);
    d = Math.max(1, Math.floor(d));
    t.hp = Math.max(0, t.hp - d);
    Snd.sfx(eff > 1 || brain ? 'crit' : 'hit'); this.flash(!isP, d, m.t);
    if (brain === true) st.banner = { t0: performance.now(), txt: st.combo >= 3 ? `COMBO ×${st.combo}!` : 'BRAIN BLAST!' };
    if (brain) { Fx.shake = 8; tween(Fx, 'shake', 0, 250); }
    await tween(t, 'dhp', t.hp, 350);
    if (brain === true) await bsay(st.combo >= 3 ? `BRAIN COMBO ×${st.combo}! A mega-powered hit!` : 'BRAIN BLAST! The attack is supercharged!');
    if (brain === false) await bsay('The attack fizzled a little...');
    if (crit) await bsay('A critical hit!');
    if (eff > 1) await bsay("It's super effective!"); else if (eff < 1) await bsay("It's not very effective...");
    if (m.drain && u.hp > 0) { u.hp = Math.min(maxHp(u), u.hp + Math.ceil(d * m.drain)); await tween(u, 'dhp', u.hp, 250); }
    if (m.recoil && u.hp > 0) { u.hp = Math.max(1, u.hp - Math.ceil(d * m.recoil)); await tween(u, 'dhp', u.hp, 250); await bsay(`${cname(u)} is stung by the recoil.`); }
    if (t.hp > 0) await this.fx(u, t, m, false);
  },
  async fx(u, t, m, always) {
    const roll = c => Math.random() * 100 < c;
    const stage = async (c, k, d) => {
      const v = clamp(c.st[k] + d, -3, 3);
      if (v === c.st[k]) { if (always) await bsay(`${cname(c)}'s ${k.toUpperCase()} can't go any ${d > 0 ? 'higher' : 'lower'}!`); return; }
      c.st[k] = v; await bsay(`${cname(c)}'s ${k.toUpperCase()} ${d > 0 ? 'rose' : 'fell'}!`);
    };
    const ch = always ? 100 : (m.ch || 100);
    if (m.inf && !t.status && roll(m.inf)) { t.status = 'ick'; await bsay(`${cname(t)} caught the Icks!`); }
    if (m.stun && roll(m.stun)) { t.stun = true; await bsay(`${cname(t)} is stunned!`); }
    if (m.fAtk && roll(ch)) await stage(t, 'atk', m.fAtk);
    if (m.fDef && roll(ch)) await stage(t, 'def', m.fDef);
    if (m.sAtk) await stage(u, 'atk', m.sAtk);
    if (m.sDef) await stage(u, 'def', m.sDef);
    if (m.heal) { u.hp = Math.min(maxHp(u), u.hp + Math.floor(maxHp(u) * m.heal)); Snd.sfx('heal'); await tween(u, 'dhp', u.hp, 300); await bsay(`${cname(u)} healed up!`); }
  },
  async snack(brain) {
    const st = this.st, foe = st.foes[st.fi], sp = SPECIES[foe.sp];
    G.bag.snack--;
    await bsay('Dex tosses a Critter Snack!');
    if (brain) await bsay('Dex says something really smart and soothing. The critter is impressed!');
    for (let i = 0; i < 3; i++) { await tween(st, 'ey', -18, 120); await tween(st, 'ey', 0, 120); await sleep(180); }
    const p = sp.rate * (1 - .65 * foe.hp / maxHp(foe)) + (foe.status ? .12 : 0) + (brain ? .25 : 0) + (G.gear.charms.luck ? .2 : 0);
    if (Math.random() < p) {
      Snd.sfx('catch');
      await bsay(`${sp.n} munches happily... and hops over to your side!`);
      delete foe.st; delete foe.stun;
      addCritter(foe);
      await bsay(G.party.includes(foe) ? `${sp.n} joined your team!` : `${sp.n} was sent to the Critter Pen at the Nest.`);
      return true;
    }
    await bsay(`${sp.n} gobbled the snack and growled. So close!`);
    return false;
  },
  async foeDown() {
    const st = this.st, foe = st.foes[st.fi], sp = SPECIES[foe.sp];
    Snd.sfx('faint'); await Promise.all([tween(st, 'ey', 200, 350), tween(st, 'ea', 0, 350)]);
    await bsay(sp.z ? `${cname(foe)} flops over, snoring.` : `${cname(foe)} is knocked out!`);
    G.seen[foe.sp] = (G.seen[foe.sp] || 0) + 2;
    const base = Math.floor(sp.xp * foe.lvl / 5 * (1 + .03 * G.badges.length) * (G.gear.charms.xp ? 1.25 : 1));
    for (let i = 0; i < G.party.length; i++) {
      const c = G.party[i]; if (c.hp <= 0) continue;
      await this.giveXP(c, st.part.has(i) ? base : Math.floor(base / 2), i === st.pi);
    }
    st.fi++;
    if (st.fi < st.foes.length) {
      const n = st.foes[st.fi];
      st.ex = 500; st.ey = 0; st.ea = 1; st.scan = false; st.part = new Set([st.pi]);
      await tween(st, 'ex', 0, 400, easeOut);
      await bsay(SPECIES[n.sp].z ? `${cname(n)} shuffles forward!` : `${cname(n)} jumps in!`);
    }
  },
  async giveXP(c, amt, show) {
    c.xp += amt;
    if (show) await bsay(`${cname(c)} gained ${amt} XP!`);
    while (c.lvl < 50 && c.xp >= xpFor(c.lvl + 1)) {
      const before = maxHp(c); c.lvl++; c.hp += maxHp(c) - before; c.dhp = c.hp;
      Snd.sfx('levelup'); await bsay(`${cname(c)} grew to Lv ${c.lvl}!`);
      for (const [l, id] of SPECIES[c.sp].ls) if (l === c.lvl && !c.moves.includes(id)) await this.learn(c, id);
    }
  },
  async learn(c, id) {
    const m = MOVES[id];
    if (c.moves.length < 4) { c.moves.push(id); await bsay(`${cname(c)} learned ${m.n}!`); return; }
    this.st.msg = `${cname(c)} wants to learn ${m.n}. Forget a move?`;
    const i = await menu(c.moves.map(x => ({ label: 'Forget ' + MOVES[x].n, right: MOVES[x].t + (MOVES[x].p ? ' ' + MOVES[x].p : '') })).concat([{ label: `Don't learn ${m.n}`, right: m.t + (m.p ? ' ' + m.p : '') }]), { x: 12, by: H - 12, w: 640, cancel: false });
    this.st.msg = '';
    if (i < 4) { const old = MOVES[c.moves[i]].n; c.moves[i] = id; await bsay(`${cname(c)} forgot ${old} and learned ${m.n}!`); }
    else await bsay(`${cname(c)} did not learn ${m.n}.`);
  },
  async evolutions() {
    const st = this.st;
    for (let i = 0; i < G.party.length; i++) {
      const c = G.party[i], e = SPECIES[c.sp].evo;
      if (!e || c.lvl < e[0] || c.hp <= 0) continue;
      const oldN = cname(c), before = maxHp(c);
      if (st.pi !== i) { st.pi = i; st.px = 0; st.py = 0; }
      await bsay(`What? ${oldN} is changing!`);
      for (let k = 0; k < 5; k++) { st.pf = 1; await tween(st, 'pf', 0, 160); }
      Snd.sfx('badge'); c.sp = e[1]; c.hp += maxHp(c) - before; c.dhp = c.hp; G.dex[c.sp] = 1;
      Fx.flash = 1; await tween(Fx, 'flash', 0, 400);
      await bsay(`${oldN} evolved into ${SPECIES[c.sp].n}!`);
      await badge('evo');
    }
  },
  // Hit sparks + a floating damage number on whoever just got hit.
  flash(isP, dmg, type) {
    const st = this.st; st[isP ? 'pf' : 'ef'] = 1; tween(st, isP ? 'pf' : 'ef', 0, 350);
    const x = isP ? 250 : 700, y = isP ? 370 : 180, col = type ? TYPES[type].col : '#ffffff', t0 = performance.now();
    for (let i = 0; i < 14; i++) { const a = Math.random() * 6.3, v = .12 + Math.random() * .3; st.parts.push({ x, y, vx: Math.cos(a) * v, vy: Math.sin(a) * v - .12, t0, life: 500 + Math.random() * 300, col: i % 3 ? col : '#ffffff', r: 5 + Math.random() * 7, star: i % 2 }); }
    if (!isP && SPECIES[st.foes[Math.min(st.fi, st.foes.length - 1)].sp].z) {
      for (let i = 0; i < 7; i++) { const a = -Math.PI * Math.random(), v = .15 + Math.random() * .35; st.parts.push({ x, y, vx: Math.cos(a) * v, vy: Math.sin(a) * v, t0, life: 600 + Math.random() * 400, col: i % 4 ? '#b01020' : '#e03040', r: 5 + Math.random() * 8, grav: .0012 }); }
      for (let i = 0; i < 1; i++) if (st.splats.length < 4) st.splats.push([(Math.random() - .5) * 280, (Math.random() - .5) * 46, 10 + Math.random() * 22]);
    }
    if (dmg) st.parts.push({ x, y: y - 60, vx: 0, vy: -.07, t0, life: 1000, txt: '-' + dmg, col: '#ffffff' });
  },
  draw() {
    const st = this.st; if (!st) return;
    const now = performance.now(), type = BGS[st.o.bg] ? st.o.bg : 'grass', sh = Fx.shake ? (Math.random() - .5) * Fx.shake : 0;
    ctx.drawImage(Art.bg(type), sh, 0, W, H);
    if (type !== 'indoor' && type !== 'manor') {
      ctx.save(); ctx.globalAlpha = .16; ctx.fillStyle = '#c8d0ff';
      for (let i = 0; i < 4; i++) { const cx = ((now / (70 + i * 22)) + i * 290) % (W + 300) - 150, cy = 50 + i * 38; for (const [dx, dy, r] of [[0, 0, 26], [28, 6, 20], [-28, 8, 18], [8, -12, 20]]) { ctx.beginPath(); ctx.arc(cx + dx, cy + dy, r, 0, 6.3); ctx.fill(); } }
      ctx.restore();
    }
    const pc = { grass: ['#5f9a6a', '#2a5240'], street: ['#7a7d96', '#3f4156'], indoor: ['#a9ab9c', '#5a5c52'], spooky: ['#4f8a6a', '#22483a'], junk: ['#b08a5c', '#5e442a'], manor: ['#d6584a', '#8a2430'] }[type];
    const plat = (x, y, w) => { ctx.fillStyle = 'rgba(10,4,30,.25)'; ctx.beginPath(); ctx.ellipse(x, y + 8, w, w * .24, 0, 0, 6.3); ctx.fill(); const q = ctx.createRadialGradient(x, y - 10, w * .1, x, y, w); q.addColorStop(0, pc[0]); q.addColorStop(1, pc[1]); ctx.fillStyle = q; ctx.beginPath(); ctx.ellipse(x, y, w, w * .24, 0, 0, 6.3); ctx.fill(); ctx.strokeStyle = 'rgba(20,10,40,.35)'; ctx.lineWidth = 3; ctx.stroke(); };
    const foe = st.foes[Math.min(st.fi, st.foes.length - 1)], me = G.party[st.pi];
    plat(700 + st.ex, 276, 170); plat(250 + st.px, 478, 200);
    for (const [dx, dy, w] of st.splats) { ctx.fillStyle = 'rgba(140,12,28,.85)'; ctx.beginPath(); ctx.ellipse(700 + st.ex + dx * .9, 278 + dy * .6, w, w * .32, 0, 0, 6.3); ctx.fill(); }
    const drawC = (c, x, y, size, a, fl) => {
      const br = 1 + Math.sin(now / 430 + x) * .03, hit = fl > 0 ? Math.sin(fl * 40) * fl * 12 : 0;
      ctx.globalAlpha = a * .3; ctx.fillStyle = '#0a041e'; ctx.beginPath(); ctx.ellipse(x, y - 4, size * .3, size * .07, 0, 0, 6.3); ctx.fill();
      ctx.globalAlpha = a; ctx.drawImage(Art.sprite(c.look || c.sp, fl > .55), x - size / 2 + sh + hit, y - size * .945 * br, size, size * br); ctx.globalAlpha = 1;
    };
    if (SPECIES[foe.sp].z && st.ea > 0) { const pu = .5 + .2 * Math.sin(now / 300), q = ctx.createRadialGradient(700 + st.ex, 250, 10, 700 + st.ex, 250, 230); q.addColorStop(0, `rgba(170,255,110,${.34 * pu * st.ea})`); q.addColorStop(1, 'rgba(170,255,110,0)'); ctx.fillStyle = q; ctx.fillRect(470 + st.ex, 20, 460, 460); }
    drawC(foe, 700 + st.ex, 290 + st.ey, 250 * (SPECIES[foe.sp].scale || 1), st.ea, st.ef);
    if (me) drawC(me, 250 + st.px, 494 + st.py, 290, st.pa, st.pf);
    if (type !== 'indoor' && type !== 'manor') { drawRain(now, 150, .34, 330); drawStorm(now, 330, 5000, 11000); } else drawStorm(now, 330, 9000, 16000, false);
    { const boss = st.o.kind === 'boss', pu = boss ? .5 + .12 * Math.sin(now / 420) : .38, q = ctx.createRadialGradient(W / 2, H / 2, 260, W / 2, H / 2, 640); q.addColorStop(0, 'rgba(0,0,0,0)'); q.addColorStop(1, boss ? `rgba(90,0,30,${pu})` : `rgba(8,2,26,${pu})`); ctx.fillStyle = q; ctx.fillRect(0, 0, W, H); }
    // particles
    st.parts = st.parts.filter(p => now - p.t0 < p.life);
    for (const p of st.parts) {
      const age = now - p.t0, k = age / p.life, x = p.x + p.vx * age, y = p.y + p.vy * age + (p.txt ? 0 : (p.grav || .0004) * age * age);
      ctx.globalAlpha = 1 - k * k;
      if (p.txt) { ctx.font = '64px ' + FONT_T; ctx.textAlign = 'center'; ctx.lineJoin = 'round'; ctx.strokeStyle = '#2a0a1e'; ctx.lineWidth = 10; ctx.strokeText(p.txt, x, y); ctx.fillStyle = '#ffe14a'; ctx.fillText(p.txt, x, y); }
      else if (p.star) { ctx.fillStyle = p.col; ctx.beginPath(); for (let i = 0; i < 10; i++) { const r = (i % 2 ? .45 : 1) * p.r * (1 - k * .5), a = i * .628 + age * .006; ctx.lineTo(x + Math.cos(a) * r, y + Math.sin(a) * r); } ctx.fill(); }
      else { ctx.fillStyle = p.col; ctx.beginPath(); ctx.arc(x, y, p.r * (1 - k) * .7, 0, 6.3); ctx.fill(); }
    }
    ctx.globalAlpha = 1;
    if (st.banner && now - st.banner.t0 < 1100) {
      const k = (now - st.banner.t0) / 1100, s = k < .15 ? k / .15 : 1, a = k > .75 ? (1 - k) / .25 : 1;
      ctx.save(); ctx.globalAlpha = a; ctx.translate(W / 2, 230); ctx.rotate(-.06); ctx.scale(s, s);
      ctx.fillStyle = 'rgba(255,220,90,.35)'; for (let i = 0; i < 12; i++) { ctx.beginPath(); const a2 = i * .5236 + now / 900; ctx.moveTo(0, 0); ctx.lineTo(Math.cos(a2) * 420, Math.sin(a2) * 420); ctx.lineTo(Math.cos(a2 + .2) * 420, Math.sin(a2 + .2) * 420); ctx.fill(); }
      ctx.font = '96px ' + FONT_T; ctx.textAlign = 'center'; ctx.textBaseline = 'middle'; ctx.lineJoin = 'round';
      ctx.strokeStyle = '#2a0a3e'; ctx.lineWidth = 18; ctx.strokeText(st.banner.txt, 0, 0); ctx.fillStyle = '#ff8ac0'; ctx.fillText(st.banner.txt, 0, 0);
      ctx.restore();
    }
    const box = (c, x, y, w, mine) => {
      panel(x, y, w, mine ? 116 : 92);
      setFont(31); text(cname(c), x + 22, y + 14);
      text('Lv ' + c.lvl, x + w - 22, y + 14, '#ffd76a', 'right');
      const tc = TYPES[SPECIES[c.sp].t]; setFont(19);
      rbox(x + 20, y + 50, 84, 24, 12, tc.col, '#170d2e', 2); ctx.textAlign = 'center'; ctx.textBaseline = 'top'; ctx.fillStyle = '#1a1030'; ctx.fillText(SPECIES[c.sp].t, x + 62, y + 54);
      if (c.status) text('ICKS', x + 112, y + 54, '#d8b0ff'); if (c.stun) text('STUN', x + 112, y + 72, '#f0d83a');
      const mh = maxHp(c), f = (c.dhp == null ? c.hp : c.dhp) / mh;
      bar(x + 168, y + 54, w - 194, 16, f, f > .5 ? '#5fe070' : f > .2 ? '#ffc93d' : '#ff5a48');
      if (mine) {
        setFont(24); text(`${Math.max(0, Math.round(c.dhp == null ? c.hp : c.dhp))} / ${mh}`, x + w - 24, y + 76, '#f4eeff', 'right');
        const a = xpFor(c.lvl), b = xpFor(c.lvl + 1); bar(x + 24, y + 100, w - 48, 5, (c.xp - a) / (b - a), '#6ab8ff');
      }
    };
    if (st.ea > 0) box(foe, 30, 26, 420, false);
    if (st.scan && st.ea > 0) { setFont(23); text('Weak to: ' + weakTo(SPECIES[foe.sp].t).join(', '), 44, 124, '#a8ffb8'); }
    if (st.foes.length > 1) { setFont(21); text(`Foe ${Math.min(st.fi + 1, st.foes.length)} of ${st.foes.length}`, 440, 124, '#fff', 'right'); }
    if (me) box(me, 520, 372, 420, true);
    if (st.combo >= 2) { const pu = 1 + Math.sin(now / 150) * .06; ctx.drawImage(Art.sprite('brain'), 26, 424, 70 * pu, 70 * pu); setFont(19, true); text('COMBO ×' + st.combo, 100, 444, '#ffb0d0'); }
    panel(10, BOX_Y, W - 20, BOX_H);
    if (st.msg) { setFont(30); wrap(st.msg, 600).forEach((l, i) => text(l, 44, BOX_Y + 26 + i * 38)); }
  }
};
