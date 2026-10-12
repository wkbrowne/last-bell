'use strict';
// Chiptune synth + sequencer. Gothic, baroque-flavoured originals plus Bach's
// Toccata and Fugue in D minor (BWV 565, public domain) on a square-wave "organ".
const NOTE = { c: 0, d: 2, e: 4, f: 5, g: 7, a: 9, b: 11 };
function n2m(s) {
  const m = /^([a-g])(#|b)?(\d)$/.exec(s);
  if (!m) { console.warn('bad note', s); return 60; }
  return 12 * (+m[3] + 1) + NOTE[m[1]] + (m[2] === '#' ? 1 : m[2] === 'b' ? -1 : 0);
}
function parseMel(str, tr) {
  return str.trim().split(/\s+/).map(tok => {
    const [n, l] = tok.split(':');
    return { m: n === '-' ? null : n2m(n) + (tr || 0), len: +(l || 1) };
  });
}
function chordPCs(name) {
  const m = /^([A-G])(#|b)?(m|dim)?$/.exec(name);
  const r = NOTE[m[1].toLowerCase()] + (m[2] === '#' ? 1 : m[2] === 'b' ? -1 : 0);
  return [r, r + (m[3] ? 3 : 4), r + (m[3] === 'dim' ? 6 : 7)];
}
const BASS = {
  drive: c => [[c[0], 2], [c[0] + 12, 2], [c[0], 2], [c[0] + 12, 2], [c[2], 2], [c[0] + 12, 2], [c[0], 2], [c[0] + 12, 2]],
  gallop: c => [[c[0], 2], [c[0], 1], [c[0], 1], [c[0] + 12, 2], [c[0], 1], [c[0], 1], [c[2], 2], [c[0], 1], [c[0], 1], [c[0] + 12, 2], [c[2], 2]],
  slow: c => [[c[0], 8], [c[2], 8]],
  walk: c => [[c[0], 4], [c[2], 4], [c[0] + 12, 4], [c[2], 4]],
  pedal: c => [[c[0], 16]]
};
const ARP = {
  up16: c => [0, 1, 2, 3, 2, 1, 0, 1, 2, 3, 2, 1, 0, 1, 2, 3].map(i => [i === 3 ? c[0] + 12 : c[i], 1]),
  slow8: c => [[c[0], 2], [c[2], 2], [c[1] + 12, 2], [c[2], 2], [c[0] + 12, 2], [c[2], 2], [c[1] + 12, 2], [c[2], 2]],
  stab: c => [[null, 2], [c[1], 1], [c[2], 1], [null, 2], [c[1], 1], [c[2], 1], [null, 2], [c[1], 1], [c[2], 1], [null, 2], [c[1], 1], [c[2], 1]]
};
const DRUM = {
  rock: 'k.h.s.h.k.h.s.h.', fast: 'k.hks.h.k.hks.hs', march: 'k...k...k.s.k.ss', soft: 'k...h...k...h...'
};
const SONGS = {
  streets: { bpm: 150, bass: 'drive', arp: 'up16', drum: 'rock',
    chords: 'Dm A Dm C Bb Gm A A Dm Bb C F Gm Dm A Dm',
    mel: ['d5:2 a4:2 d5:2 e5:2 f5:4 e5:2 d5:2', 'e5:2 c#5:2 a4:4 -:2 a4:2 c#5:2 e5:2',
      'f5:2 d5:2 f5:2 g5:2 a5:4 g5:2 f5:2', 'g5:2 e5:2 c5:4 -:2 c5:2 e5:2 g5:2',
      'f5 g5 f5 e5 d5:2 bb4:2 d5:2 f5:2 bb5:4', 'a5 bb5 a5 g5 f5:2 d5:2 g5:2 bb5:2 g5:4',
      'a5:2 e5:2 c#5:2 e5:2 a5 g5 f5 e5 d5 c#5 bb4 a4', 'c#5:2 e5:2 a5:4 a4 c#5 e5 a5 c#6:4',
      'd6:4 a5:2 f5:2 d5:2 f5:2 a5:4', 'bb5:4 f5:2 d5:2 bb4:2 d5:2 f5:4',
      'c6:4 g5:2 e5:2 c5:2 e5:2 g5:4', 'a5:2 c6:2 f6:4 e6:2 c6:2 a5:4',
      'bb5 a5 g5 a5 bb5:2 d6:2 g5 f5 e5 f5 g5:2 bb5:2', 'a5 g5 f5 g5 a5:2 d6:2 f5 e5 d5 e5 f5:2 a5:2',
      'e5 f5 g5 a5 bb5 a5 g5 f5 e5 d5 c#5 d5 e5:2 c#5:2', 'd5:4 -:2 a4:2 d5:8'] },
  battle: { bpm: 172, bass: 'gallop', arp: 'stab', drum: 'fast',
    chords: 'Em B C D Em B C B G D Am B C D B Em',
    mel: ['e5 g5 b5 e6 b5 g5 e5 g5 b5:2 e6:2 b5:4', 'f#5 a5 b5 f#6 b5 a5 f#5 a5 b5:2 d#6:2 b5:4',
      'c6:2 g5:2 e5:2 g5:2 c6:2 e6:2 d6:2 c6:2', 'd6:2 a5:2 f#5:2 a5:2 d6:2 f#6:2 e6:2 d6:2',
      'e6:4 b5:2 g5:2 e5:2 g5:2 b5:2 e6:2', 'd#6:4 b5:2 f#5:2 d#5:2 f#5:2 b5:2 d#6:2',
      'e6 d6 c6 b5 a5 g5 f#5 e5 c5:2 e5:2 g5:2 c6:2', 'b5:2 f#5:2 d#5:2 f#5:2 b5 c6 b5 a5 g5 f#5 e5 d#5',
      'g5:2 b5:2 d6:4 b5:2 d6:2 g6:4', 'f#5:2 a5:2 d6:4 a5:2 d6:2 f#6:4',
      'e6:2 c6:2 a5:2 c6:2 e6:2 a6:2 g6:2 e6:2', 'd#6:2 b5:2 f#5:2 b5:2 d#6:2 f#6:2 b6:4',
      'g6 e6 c6 e6 g6 e6 c6 e6 g6:2 e6:2 c6:4', 'a6 f#6 d6 f#6 a6 f#6 d6 f#6 a6:2 f#6:2 d6:4',
      'b6:2 a6:2 g6:2 f#6:2 e6:2 d#6:2 c6:2 b5:2', 'e6:8 e5:2 b5:2 e6:4'] },
  boss: { bpm: 158, bass: 'gallop', arp: 'up16', drum: 'march',
    chords: 'Cm Ab Fm G Cm Ab Fm G',
    mel: ['c5:4 eb5:4 g5:4 c6:4', 'ab5:2 g5:2 eb5:2 c5:2 ab4:4 c5:4', 'f5:4 ab5:4 c6:4 f6:4',
      'g6 f6 eb6 d6 c6 b5 ab5 g5 f5 eb5 d5 c5 b4:2 d5:2',
      'c6 g5 eb5 g5 c6 g5 eb5 g5 d6 g5 eb5 g5 eb6 g5 eb5 g5', 'c6 ab5 eb5 ab5 c6 ab5 eb5 ab5 d6 ab5 eb5 ab5 eb6 ab5 eb5 ab5',
      'f6 c6 ab5 c6 f6 c6 ab5 c6 g6 c6 ab5 c6 ab6 c6 ab5 c6', 'g6:2 d6:2 b5:2 d6:2 g6:2 b6:2 d7:4'] },
  nest: { bpm: 96, bass: 'slow', arp: 'slow8', drum: null,
    chords: 'Am F C G Am F E E',
    mel: ['e5:4 a5:4 c6:6 b5:2', 'a5:4 f5:4 c5:8', 'e5:4 g5:4 c6:6 d6:2', 'b5:4 g5:4 d5:8',
      'c6:4 b5:2 a5:2 e5:8', 'a5:4 g5:2 f5:2 c5:8', 'e5:4 g#5:4 b5:4 e6:4', 'd6:2 c6:2 b5:2 g#5:2 e5:8'] },
  spooky: { bpm: 118, bass: 'walk', arp: 'slow8', drum: 'soft',
    chords: 'Gm Eb Cm D Gm Eb D D',
    mel: ['g5:2 bb5:2 d6:4 c6:2 bb5:2 a5:2 g5:2', 'eb5:2 g5:2 bb5:4 a5:2 g5:2 f5:2 eb5:2',
      'c5:2 eb5:2 g5:4 f5:2 eb5:2 d5:2 c5:2', 'd5:2 f#5:2 a5:2 c6:2 d6:8',
      'd6 c6 bb5 a5 g5:4 d6 c6 bb5 a5 g5:4', 'eb6 d6 c6 bb5 g5:4 eb6 d6 c6 bb5 g5:4',
      'f#5:2 a5:2 d6:2 f#6:2 eb6:2 d6:2 c6:2 a5:2', 'd6:4 a5:4 f#5:4 d5:4'] },
  sad: { bpm: 80, bass: 'slow', arp: 'slow8', drum: null,
    chords: 'F C Dm Bb F C Bb C',
    mel: ['a5:6 c6:2 f5:8', 'g5:6 e5:2 c5:8', 'f5:4 a5:4 d6:8', 'd6:4 bb5:4 f5:8',
      'a5:4 c6:4 f6:8', 'e6:4 c6:4 g5:8', 'd6:4 bb5:2 a5:2 g5:4 f5:4', 'g5:8 c6:8'] },
  win: { bpm: 150, bass: 'pedal', arp: null, drum: null, once: true, chords: 'C C',
    mel: ['c5:2 e5:2 g5:2 c6:2 e6:2 c6:2 g6:4', 'g6:16'] },
  // J.S. Bach, Toccata in D minor — the famous opening flourishes and the diminished-seventh pile-up.
  toccata: { bpm: 66, once: true, next: 'fugue', raw: (() => {
    const lead = 'a5 g5 a5:6 -:4 g5 f5 e5 d5 c#5:4 d5:8 -:4 ' +
      'a4 g4 a4:6 -:4 e4:2 f4:2 c#4:2 d4:8 -:6 ' +
      'a3 g3 a3:6 -:4 g3 f3 e3 d3 c#3:4 d3:8 -:4 ';
    return [
      { w: 'organ', v: .16, mel: lead + '-:48' },
      { w: 'organ', v: .10, mel: lead + '-:48', tr: -12 },
      { w: 'tri', v: .30, mel: '-:96 d2:32 d2:16' },
      { w: 'organ', v: .09, mel: '-:100 c#4:28 d4:16' },
      { w: 'organ', v: .09, mel: '-:102 e4:26 f#4:16' },
      { w: 'organ', v: .09, mel: '-:104 g4:24 a4:16' },
      { w: 'organ', v: .09, mel: '-:106 bb4:22 a4:16' },
      { w: 'organ', v: .10, mel: '-:108 c#5:20 d5:16' }
    ];
  })() },
  // ...and the Fugue subject, with its answer entering underneath.
  fugue: { bpm: 104, raw: (() => {
    const subj = '- a4 g4 a4 f4 a4 e4 a4 d4 a4 c#4 a4 d4 a4 e4 a4 ' +
      'f4 a4 a3 a4 b3 a4 c#4 a4 d4 a4 c#4 a4 d4 a4 e4 a4 ' +
      'f4 a4 g4 a4 a4:2 g4 f4 e4:2 d4:2 c#4:2 e4:2 ';
    const v1 = subj + 'bb4:2 d5:2 g5:2 d5:2 bb4:2 a4:2 g4:2 a4:2 bb4:2 g4:2 e4:2 g4:2 a4:2 f#4:2 a4:2 d5:2 ' +
      'bb4:2 a4:2 g4:4 f4:2 e4:2 d4:2 c#4:2 d5 a4 f4 a4 d5 a4 f4 a4 e5 a4 g4 a4 e5 a4 c#5 a4 d5:16';
    return [
      { w: 'organ', v: .15, mel: v1 },
      { w: 'organ', v: .13, mel: '-:48 ' + subj.replace(/([a-g](?:#|b)?)(\d)/g, (_, n, o) => n + o), tr: -7, tail: 'd3:4 f3:4 a3:4 a2:4 d3:16' },
      { w: 'tri', v: .28, mel: '-:48 g2:8 g2:8 g2:8 d3:8 g2:8 a2:8 d2:4 f2:4 a2:4 a2:4 d2:16' }
    ];
  })() }
};
SONGS.manor = Object.assign({}, SONGS.fugue, { bpm: 92 });
SONGS.finale = Object.assign({}, SONGS.fugue, { bpm: 126, drum: 'march', bars: 8 });

function buildSong(s) {
  const ch = [];
  if (s.raw) {
    for (const r of s.raw) {
      let ev = parseMel(r.mel, r.tr);
      if (r.tail) ev = ev.concat(parseMel(r.tail));
      ch.push({ w: r.w, v: r.v, ev });
    }
  } else {
    const chords = s.chords.split(' ').map(chordPCs);
    s.mel.forEach((b, i) => { const n = parseMel(b).reduce((a, e) => a + e.len, 0); if (n !== 16) console.warn('bar length', i, n, b); });
    ch.push({ w: 'pulse', v: .14, vib: true, ev: parseMel(s.mel.join(' ')) });
    if (s.bass) ch.push({ w: 'tri', v: .30, ev: [].concat(...chords.map(c => BASS[s.bass](c).map(([p, l]) => ({ m: 36 + p, len: l })))) });
    if (s.arp) ch.push({ w: 'sq', v: .05, ev: [].concat(...chords.map(c => ARP[s.arp](c).map(([p, l]) => ({ m: p == null ? null : 60 + p, len: l })))) });
  }
  const total = Math.max(...ch.map(c => c.ev.reduce((a, e) => a + e.len, 0)));
  if (s.drum) {
    const ev = [];
    for (let i = 0; i < total; i++) { const d = DRUM[s.drum][i % 16]; ev.push({ m: d === '.' ? null : d, len: 1 }); }
    ch.push({ w: 'drum', v: .5, ev });
  }
  for (const c of ch) { const n = c.ev.reduce((a, e) => a + e.len, 0); if (n < total) c.ev.push({ m: null, len: total - n }); }
  return { ch, total, step: 60 / s.bpm / 4, once: s.once, next: s.next };
}

const Snd = {
  ac: null, muted: false, curName: null, pending: null, bus: null, built: {}, state: null,
  unlock() {
    if (!this.ac) {
      try {
        const AC = window.AudioContext || window.webkitAudioContext;
        const ac = this.ac = new AC(); setTimeout(() => { try { Voice.start(); } catch (e) {} }, 1500);
        this.master = ac.createGain(); this.master.gain.value = this.muted ? 0 : .7; this.master.connect(ac.destination);
        const pw = d => { const n = 24, re = new Float32Array(n), im = new Float32Array(n); for (let i = 1; i < n; i++) re[i] = 2 / (i * Math.PI) * Math.sin(i * Math.PI * d); return ac.createPeriodicWave(re, im); };
        this.waves = { pulse: pw(.25) };
        const im = new Float32Array([0, 1, .8, .5, .45, 0, .3, 0, .25, 0, 0, 0, .1]);
        this.waves.organ = ac.createPeriodicWave(new Float32Array(im.length), im);
        const nb = this.noise = ac.createBuffer(1, ac.sampleRate, ac.sampleRate), d = nb.getChannelData(0);
        for (let i = 0; i < d.length; i++) d[i] = Math.random() * 2 - 1;
        const rs = ac.createBufferSource(); rs.buffer = nb; rs.loop = true;
        this.rainF = ac.createBiquadFilter(); this.rainF.type = 'lowpass'; this.rainF.frequency.value = 5200;
        this.rainG = ac.createGain(); this.rainG.gain.value = 0; rs.connect(this.rainF); this.rainF.connect(this.rainG); this.rainG.connect(this.master); rs.start();
        setInterval(() => this.tick(), 40);
      } catch (e) { console.warn('no audio', e); }
    }
    if (this.ac && this.ac.state === 'suspended' && !this.hidden) this.ac.resume();
    if (this.ac && this.pending) { const p = this.pending; this.pending = null; this.curName = null; this.play(p); }
  },
  setRain(level, muffled) {
    const k = level + (muffled ? 'm' : ''); if (!this.rainG || this.rainK === k) return; this.rainK = k;
    const t = this.ac.currentTime; this.rainG.gain.setTargetAtTime(level * .085, t, .4); this.rainF.frequency.setTargetAtTime(muffled ? 480 : 5200, t, .4);
  },
  // Silence everything while the app or tab is in the background.
  hide(h) { this.hidden = h; if (!this.ac) return; if (h) this.ac.suspend(); else this.ac.resume(); },
  toggleMute() { this.muted = !this.muted; if (this.master) this.master.gain.value = this.muted ? 0 : .7; return this.muted; },
  play(name) {
    if (this.curName === name) return;
    this.curName = name;
    if (!this.ac) { this.pending = name; return; }
    this.stop(true);
    if (!name) return;
    const song = this.built[name] || (this.built[name] = buildSong(SONGS[name]));
    const ac = this.ac;
    this.bus = ac.createGain(); this.bus.gain.value = 1; this.bus.connect(this.master);
    const dl = ac.createDelay(); dl.delayTime.value = .19; const fb = ac.createGain(); fb.gain.value = .22;
    this.bus.connect(dl); dl.connect(fb); fb.connect(this.master);
    this.state = { song, t0: ac.currentTime + .08, ptr: song.ch.map(() => ({ i: 0, t: 0 })), done: false };
  },
  stop(keepName) {
    if (this.bus) { const b = this.bus; try { b.gain.setTargetAtTime(0, this.ac.currentTime, .03); } catch (e) {} setTimeout(() => b.disconnect(), 300); }
    this.bus = null; this.state = null; if (!keepName) this.curName = null;
  },
  tick() {
    const st = this.state, ac = this.ac; if (!st || !ac) return;
    const horizon = ac.currentTime + .25, song = st.song;
    let allDone = true;
    song.ch.forEach((c, ci) => {
      const p = st.ptr[ci];
      for (let guard = 0; guard < 64; guard++) {
        const when = st.t0 + p.t * song.step;
        if (when > horizon) { allDone = false; break; }
        if (p.i >= c.ev.length) { if (song.once) break; p.i = 0; }
        const e = c.ev[p.i];
        if (e.m != null) this.voice(c, e.m, Math.max(when, ac.currentTime), e.len * song.step);
        p.t += e.len; p.i++;
        if (song.once && p.i >= c.ev.length) break;
        allDone = false;
      }
    });
    if (song.once && allDone && !st.done) {
      st.done = true;
      const end = st.t0 + song.total * song.step, nm = this.curName;
      if (song.next) setTimeout(() => { if (this.curName === nm) this.play(song.next); }, Math.max(0, (end - ac.currentTime) * 1000));
    }
  },
  voice(c, m, t, dur) {
    const ac = this.ac, out = this.bus; if (!out) return;
    if (c.w === 'drum') {
      if (m === 'k') { this.tone('sine', 150, 40, .12, .5, t, out); }
      else { const s = ac.createBufferSource(); s.buffer = this.noise; const f = ac.createBiquadFilter(); f.type = 'highpass'; f.frequency.value = m === 's' ? 1800 : 7000;
        const g = ac.createGain(); const v = m === 's' ? .16 : .05, d = m === 's' ? .11 : .035; g.gain.setValueAtTime(v, t); g.gain.exponentialRampToValueAtTime(.001, t + d);
        s.connect(f); f.connect(g); g.connect(out); s.start(t); s.stop(t + d + .02); }
      return;
    }
    const o = ac.createOscillator();
    if (c.w === 'tri') o.type = 'triangle'; else if (c.w === 'sq') o.type = 'square'; else o.setPeriodicWave(this.waves[c.w]);
    o.frequency.value = 440 * Math.pow(2, (m - 69) / 12);
    if (c.vib && dur > .25) { const l = ac.createOscillator(), lg = ac.createGain(); l.frequency.value = 6; lg.gain.value = o.frequency.value * .008; l.connect(lg); lg.connect(o.frequency); l.start(t + .12); l.stop(t + dur); }
    const g = ac.createGain(), v = c.v, organ = c.w === 'organ';
    g.gain.setValueAtTime(0, t); g.gain.linearRampToValueAtTime(v, t + .008);
    g.gain.setValueAtTime(organ ? v : v * .75, t + Math.min(.08, dur * .5));
    g.gain.linearRampToValueAtTime(organ ? v * .9 : v * .5, t + dur * .9);
    g.gain.linearRampToValueAtTime(0, t + dur + (organ ? .04 : 0));
    o.connect(g); g.connect(out); o.start(t); o.stop(t + dur + .06);
  },
  tone(type, f0, f1, dur, vol, t, out) {
    const ac = this.ac; if (!ac) return;
    t = t || ac.currentTime;
    const o = ac.createOscillator(), g = ac.createGain();
    o.type = type; o.frequency.setValueAtTime(f0, t); if (f1 !== f0) o.frequency.exponentialRampToValueAtTime(Math.max(20, f1), t + dur);
    g.gain.setValueAtTime(vol, t); g.gain.exponentialRampToValueAtTime(.001, t + dur);
    o.connect(g); g.connect(out || this.master); o.start(t); o.stop(t + dur + .02);
  },
  noiseHit(dur, vol, t) {
    const ac = this.ac; if (!ac) return; t = t || ac.currentTime;
    const s = ac.createBufferSource(); s.buffer = this.noise; const g = ac.createGain();
    g.gain.setValueAtTime(vol, t); g.gain.exponentialRampToValueAtTime(.001, t + dur);
    s.connect(g); g.connect(this.master); s.start(t); s.stop(t + dur + .02);
  },
  arp(freqs, gap, dur, vol, type) { if (!this.ac) return; const t = this.ac.currentTime; freqs.forEach((f, i) => this.tone(type || 'square', f, f, dur, vol, t + i * gap)); },
  sfx(n) {
    if (!this.ac) return;
    const t = this.ac.currentTime;
    switch (n) {
      case 'blip': this.tone('square', 520, 520, .02, .03); break;
      case 'move': this.tone('square', 660, 660, .03, .06); break;
      case 'ok': this.tone('square', 880, 1320, .07, .08); break;
      case 'no': this.tone('square', 180, 120, .14, .09); break;
      case 'hit': this.noiseHit(.12, .25); this.tone('sawtooth', 220, 60, .12, .12); break;
      case 'crit': this.noiseHit(.2, .35); this.tone('sawtooth', 500, 70, .22, .16); break;
      case 'heal': this.arp([523, 659, 784, 1047], .06, .12, .08, 'sine'); break;
      case 'right': this.arp([659, 784, 988, 1319], .055, .12, .09); break;
      case 'wrong': this.arp([311, 233], .12, .2, .08, 'triangle'); break;
      case 'catch': this.arp([784, 784, 1047], .12, .08, .08); break;
      case 'levelup': this.arp([523, 659, 784, 1047, 1319], .07, .14, .09); break;
      case 'badge': this.arp([523, 523, 784, 1047, 784, 1047, 1568], .09, .18, .09); break;
      case 'faint': this.tone('square', 440, 80, .5, .09); break;
      case 'enc': this.arp([330, 415, 494, 622, 740, 880], .05, .08, .08); break;
      case 'thunder': this.noiseHit(1.6, .16); this.tone('sine', 70, 34, 1.4, .3); break;
      case 'door': this.tone('triangle', 120, 60, .18, .2); break;
      case 'bell': [[110, 3.2, .3], [220, 2.6, .2], [277, 2.2, .12], [330, 2, .1], [554, 1.4, .06]].forEach(([f, d, v]) => this.tone('sine', f, f * .995, d, v, t)); this.noiseHit(.05, .2); break;
    }
  }
};

document.addEventListener('visibilitychange', () => Snd.hide(document.hidden));
addEventListener('pagehide', () => Snd.hide(true));
addEventListener('pageshow', () => Snd.hide(document.hidden));
