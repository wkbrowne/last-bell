'use strict';
// ---------------------------------------------------------------- core
const W = 960, H = 720, SC = 3, VW = 20, VH = 15;
const cv = document.getElementById('game');
const ctx = cv.getContext('2d');
let KPX = 1;
// Drops resolution and effects automatically on slower tablets.
const PERF = { lvl: 0, acc: 0, n: 0 };
function fitCanvas() {
  const r = cv.getBoundingClientRect(), k = clamp((window.devicePixelRatio || 1) * (r.width || W) / W, 1, [2.5, 1.5, 1][PERF.lvl]);
  KPX = Math.round(k * 4) / 4;
  if (cv.width !== W * KPX) { cv.width = W * KPX; cv.height = H * KPX; }
}
addEventListener('resize', () => fitCanvas());

const FONT_B = '"Fredoka","Arial Rounded MT Bold","Trebuchet MS",sans-serif';
const FONT_T = '"Lilita One","Fredoka","Arial Rounded MT Bold",sans-serif';
// Sizes are given in the old pixel-font scale and mapped onto the rounded display fonts.
function setFont(px, title) { ctx.font = title ? Math.round(px * 1.45) + 'px ' + FONT_T : '600 ' + Math.round(px * .86) + 'px ' + FONT_B; }

function mulberry32(a) {
  return function () {
    a |= 0; a = a + 0x6D2B79F5 | 0;
    let t = Math.imul(a ^ a >>> 15, 1 | a);
    t = t + Math.imul(t ^ t >>> 7, 61 | t) ^ t;
    return ((t ^ t >>> 14) >>> 0) / 4294967296;
  };
}
const rint = (a, b) => a + Math.floor(Math.random() * (b - a + 1));
const pick = a => a[Math.floor(Math.random() * a.length)];
const clamp = (v, a, b) => Math.max(a, Math.min(b, v));
const easeOut = k => 1 - (1 - k) * (1 - k);

// ---------------------------------------------------------------- timers / tweens (driven by the game loop)
const Timers = {
  list: [],
  add(ms, fn) { this.list.push({ t: ms, fn }); },
  update(dt) {
    for (let i = this.list.length - 1; i >= 0; i--) {
      const t = this.list[i]; t.t -= dt;
      if (t.t <= 0) { this.list.splice(i, 1); t.fn(); }
    }
  }
};
const sleep = ms => new Promise(r => Timers.add(ms, r));
const Tweens = [];
function tween(obj, prop, to, ms, ease) {
  return new Promise(res => {
    const from = obj[prop]; let t = 0;
    Tweens.push(dt => {
      t += dt; const k = Math.min(1, t / ms);
      obj[prop] = from + (to - from) * (ease ? ease(k) : k);
      if (k >= 1) { res(); return true; }
    });
  });
}
function updateTweens(dt) {
  for (let i = Tweens.length - 1; i >= 0; i--) if (Tweens[i](dt)) Tweens.splice(i, 1);
}

// ---------------------------------------------------------------- input
const Input = { held: {}, presses: [], taps: [] };
const KEYS = {
  ArrowUp: 'up', KeyW: 'up', ArrowDown: 'down', KeyS: 'down', ArrowLeft: 'left', KeyA: 'left',
  ArrowRight: 'right', KeyD: 'right', KeyZ: 'a', Enter: 'a', Space: 'a', KeyX: 'b', Escape: 'b',
  KeyM: 'mute', KeyR: 'read', ShiftLeft: 'run', ShiftRight: 'run'
};
const DIRKEYS = ['up', 'down', 'left', 'right'];
addEventListener('keydown', e => {
  if (e.target && /TEXTAREA|INPUT/.test(e.target.tagName)) return;      // typing in the answer box
  if (/^[0-9.]$/.test(e.key)) { Input.presses.push('d' + e.key); Snd.unlock(); return; }
  if (e.code === 'Backspace') { Input.presses.push('bksp'); e.preventDefault(); return; }
  const k = KEYS[e.code]; if (!k) return;
  e.preventDefault();
  if (!e.repeat || DIRKEYS.includes(k)) Input.presses.push(k);
  Input.held[k] = true;
  Snd.unlock();
});
addEventListener('keyup', e => { const k = KEYS[e.code]; if (k) Input.held[k] = false; });
addEventListener('blur', () => { Input.held = {}; });
cv.addEventListener('pointerdown', e => {
  Snd.unlock();
  if (Touch.enabled && !document.fullscreenElement && document.documentElement.requestFullscreen) document.documentElement.requestFullscreen().catch(() => {});
  const r = cv.getBoundingClientRect();
  Input.taps.push({ x: (e.clientX - r.left) * W / r.width, y: (e.clientY - r.top) * H / r.height });
  e.preventDefault();
});
const inRect = (x, y, r) => x >= r.x && x <= r.x + r.w && y >= r.y && y <= r.y + r.h;

// ---------------------------------------------------------------- drawing helpers
function rbox(x, y, w, h, r, fill, stroke, lw) {
  ctx.beginPath(); ctx.roundRect(x, y, w, h, r);
  if (fill) { ctx.fillStyle = fill; ctx.fill(); }
  if (stroke) { ctx.strokeStyle = stroke; ctx.lineWidth = lw || 2; ctx.stroke(); }
}
function panel(x, y, w, h) {
  const r = Math.min(20, h / 3);
  rbox(x + 2, y + 7, w, h, r, 'rgba(8,4,20,.4)');
  const g = ctx.createLinearGradient(0, y, 0, y + h); g.addColorStop(0, '#43307c'); g.addColorStop(1, '#1e1444');
  rbox(x, y, w, h, r, g, '#170d2e', 5);
  rbox(x + 4.5, y + 4.5, w - 9, h - 9, Math.max(4, r - 4), null, '#f2c14e', 2.5);
  rbox(x + 12, y + 9, w - 24, Math.min(12, h / 5), 6, 'rgba(255,255,255,.07)');
}
function text(s, x, y, col, align) {
  ctx.textAlign = align || 'left'; ctx.textBaseline = 'top';
  ctx.fillStyle = 'rgba(10,4,24,.55)'; ctx.fillText(s, x + 1.5, y + 2.5);
  ctx.fillStyle = col || '#fbf4e4'; ctx.fillText(s, x, y);
}
function wrap(str, maxW) {
  const out = [];
  for (const para of String(str).split('\n')) {
    let line = '';
    for (const w of para.split(' ')) {
      const t = line ? line + ' ' + w : w;
      if (ctx.measureText(t).width > maxW && line) { out.push(line); line = w; } else line = t;
    }
    out.push(line);
  }
  return out;
}
function bar(x, y, w, h, frac, col) {
  rbox(x - 3, y - 3, w + 6, h + 6, (h + 6) / 2, '#170d2e');
  rbox(x, y, w, h, h / 2, '#4a3f66');
  const fw = Math.max(0, w * clamp(frac, 0, 1));
  if (fw > 1) { rbox(x, y, Math.max(h, fw), h, h / 2, col); rbox(x + 3, y + 1.5, Math.max(2, fw - 6), h * .32, h / 4, 'rgba(255,255,255,.35)'); }
}

// ---------------------------------------------------------------- modal UI stack
const UI = {
  stack: [],
  push(m) { this.stack.push(m); },
  pop(m) { const i = this.stack.indexOf(m); if (i >= 0) this.stack.splice(i, 1); },
  get busy() { return this.stack.length > 0; },
  update(dt, pr) { const top = this.stack[this.stack.length - 1]; if (top) top.update(dt, pr); },
  draw() { for (const m of this.stack) m.draw(); }
};
const BOX_Y = H - 204, BOX_H = 194;
let SPEAKERS = {};

// Dialogue box. Resolves when dismissed; with opts.choices resolves to the picked index.
function say(who, str, opts) {
  opts = opts || {};
  return new Promise(res => {
    const sp = who ? (SPEAKERS[who] || { n: who }) : null;
    const hasPortrait = sp && sp.spr;
    const tx = hasPortrait ? 176 : 44;
    setFont(30);
    const lines = wrap(str, W - tx - 50);
    const pages = [];
    for (let i = 0; i < lines.length; i += 4) pages.push(lines.slice(i, i + 4));
    let pg = 0, chars = 0, sel = 0, done = 0, blip = 0, readHit = null;
    // story and lesson text can be read aloud: automatically when the setting is on, or with the READ button
    const canRead = !opts.auto && Speak.can(), autoRead = canRead && typeof G !== 'undefined' && G && G.readAloud;
    const speakPg = () => { if (canRead) Speak.say(pages[pg].join(' ').replace(/[★▸▶◀♥♡·]/g, ' ').replace(/\.\.\./g, ', ')); };
    if (autoRead) Timers.add(150, speakPg);
    const total = () => pages[pg].join('').length;
    const ch = opts.choices;
    const m = {
      update(dt, pr) {
        const before = Math.floor(chars);
        chars = Math.min(total(), chars + dt * 0.075);
        if (Math.floor(chars) > before && (blip++ % 3 === 0) && !opts.auto) Snd.sfx('blip');
        const full = chars >= total(), last = pg === pages.length - 1;
        if (opts.auto && full && last) { done += dt; if (done > opts.auto) { UI.pop(m); res(); return; } }
        for (const k of pr) {
          if (ch && full && last) {
            if (k === 'up') { sel = (sel + ch.length - 1) % ch.length; Snd.sfx('move'); }
            if (k === 'down') { sel = (sel + 1) % ch.length; Snd.sfx('move'); }
            if (k === 'a') { Snd.sfx('ok'); if (canRead) Speak.stop(); UI.pop(m); res(sel); return; }
            continue;
          }
          if (k === 'read') { speakPg(); continue; }
          if (k === 'a' || k === 'b') {
            if (!full) chars = total();
            else if (!last) { pg++; chars = 0; if (autoRead) speakPg(); else if (canRead) Speak.stop(); }
            else if (!ch) { if (canRead) Speak.stop(); UI.pop(m); res(); return; }
          }
        }
      },
      tap(x, y) {
        const full = chars >= total(), last = pg === pages.length - 1;
        if (readHit && inRect(x, y, readHit)) { speakPg(); return; }
        if (ch && full && last) {
          const h = (m.hits || []).find(r => inRect(x, y, r));
          if (h) { Snd.sfx('ok'); if (canRead) Speak.stop(); UI.pop(m); res(h.i); }
          return;
        }
        m.update(0, ['a']);
      },
      draw() {
        panel(10, BOX_Y, W - 20, BOX_H);
        if (sp) {
          setFont(26);
          const nw = ctx.measureText(sp.n).width + 36;
          panel(30, BOX_Y - 34, nw, 40);
          text(sp.n, 48, BOX_Y - 28, sp.col || '#ffd76a');
        }
        if (canRead) { readHit = { x: W - 150, y: BOX_Y - 32, w: 124, h: 38 }; rbox(readHit.x, readHit.y, readHit.w, readHit.h, 19, '#2f7ab0', Speak.on ? '#ffffff' : '#9fe0ff', 2.5); setFont(15, true); text(Speak.on ? 'READING' : 'READ', readHit.x + 62, readHit.y + 9, '#fff', 'center'); }
        if (hasPortrait) {
          const pg2 = ctx.createLinearGradient(0, BOX_Y + 38, 0, BOX_Y + 158); pg2.addColorStop(0, '#7a62c8'); pg2.addColorStop(1, '#3d2c78');
          rbox(34, BOX_Y + 38, 120, 120, 18, pg2, '#f2c14e', 3);
          const im = sp.human === false ? Art.sprite(sp.spr) : Art.human(sp.spr, 'down', 0);
          ctx.save(); ctx.beginPath(); ctx.roundRect(36, BOX_Y + 40, 116, 116, 16); ctx.clip(); ctx.drawImage(im, 22, BOX_Y + 38, 144, 144); ctx.restore();
        }
        setFont(30);
        let left = Math.floor(chars);
        pages[pg].forEach((ln, i) => {
          const s = ln.slice(0, Math.max(0, left)); left -= ln.length;
          text(s, tx, BOX_Y + 24 + i * 38, opts.col);
        });
        const full = chars >= total(), last = pg === pages.length - 1;
        if (full && !(ch && last) && !opts.auto && Math.floor(performance.now() / 350) % 2)
          text('▼', W - 50, BOX_Y + BOX_H - 44, '#c9a24a');
        if (ch && full && last) {
          setFont(28);
          const cw = Math.max(...ch.map(c => ctx.measureText(c).width)) + 80;
          const chh = ch.length * 38 + 26, cx = W - cw - 20, cy = BOX_Y - chh - 8;
          panel(cx, cy, cw, chh);
          m.hits = ch.map((c, i) => ({ x: cx, y: cy + 10 + i * 38, w: cw, h: 38, i }));
          ch.forEach((c, i) => {
            if (i === sel) text('▶', cx + 20, cy + 14 + i * 38, '#ffd76a');
            text(c, cx + 48, cy + 14 + i * 38, i === sel ? '#fff' : '#b9b1c9');
          });
        }
      }
    };
    UI.push(m);
  });
}
const ask = (who, str, choices) => say(who, str, { choices });

// List menu. items: strings or {label,right,disabled,col}. Resolves to index, or -1 on cancel.
function menu(items, o) {
  o = o || {};
  return new Promise(res => {
    items = items.map(i => typeof i === 'string' ? { label: i } : i);
    let sel = clamp(o.sel || 0, 0, items.length - 1), top = 0;
    const rows = Math.min(items.length, o.rows || 9), rh = 38;
    setFont(28);
    const w = o.w || Math.max(...items.map(i => ctx.measureText(i.label + (i.right ? '    ' + i.right : '')).width)) + 84;
    const h = rows * rh + 28 + (o.title ? 38 : 0);
    const x = o.x != null ? o.x : W - w - 14;
    const y = o.by != null ? o.by - h : (o.y != null ? o.y : H - h - 14);
    const m = {
      update(dt, pr) {
        for (const k of pr) {
          if (k === 'up') { sel = (sel + items.length - 1) % items.length; Snd.sfx('move'); }
          if (k === 'down') { sel = (sel + 1) % items.length; Snd.sfx('move'); }
          if (k === 'a') {
            if (items[sel].disabled) { Snd.sfx('no'); continue; }
            Snd.sfx('ok'); UI.pop(m); res(sel); return;
          }
          if (k === 'b' && o.cancel !== false) { UI.pop(m); res(-1); return; }
        }
        if (sel < top) top = sel;
        if (sel >= top + rows) top = sel - rows + 1;
      },
      tap(tx, ty) {
        if (!inRect(tx, ty, { x, y, w, h })) { if (o.cancel !== false) { UI.pop(m); res(-1); } return; }
        const y0 = y + 14 + (o.title ? 38 : 0);
        if (ty < y0 && top > 0) { top--; sel = top; return; }
        const i = top + Math.floor((ty - y0) / rh);
        if (i >= top + rows) { if (top + rows < items.length) { top++; sel = top + rows - 1; } return; }
        if (!items[i]) return;
        sel = i;
        if (items[i].disabled) { Snd.sfx('no'); return; }
        Snd.sfx('ok'); UI.pop(m); res(i);
      },
      draw() {
        if (o.onDraw) o.onDraw(sel);
        panel(x, y, w, h);
        setFont(28);
        let yy = y + 14;
        if (o.title) { text(o.title, x + 22, yy, '#c9a24a'); yy += 38; }
        for (let r = 0; r < rows; r++) {
          const i = top + r, it = items[i]; if (!it) break;
          const col = it.disabled ? '#6d6680' : (i === sel ? '#fff' : (it.col || '#cfc7dd'));
          if (i === sel) { rbox(x + 12, yy - 4, w - 24, rh - 3, 11, 'rgba(255,215,106,.18)', 'rgba(255,215,106,.55)', 1.5); text('▶', x + 20, yy, '#ffd76a'); }
          text(it.label, x + 48, yy, col);
          if (it.right) text(it.right, x + w - 22, yy, it.rcol || col, 'right');
          yy += rh;
        }
        if (top > 0) text('▲', x + w - 30, y + 6, '#c9a24a');
        if (top + rows < items.length) text('▼', x + w - 30, y + h - 30, '#c9a24a');
      }
    };
    UI.push(m);
  });
}

// Full custom page; closes on A or B.
function page(drawFn) {
  return new Promise(res => {
    const m = {
      update(dt, pr) { for (const k of pr) if (k === 'a' || k === 'b') { Snd.sfx('ok'); UI.pop(m); res(); return; } },
      tap() { Snd.sfx('ok'); UI.pop(m); res(); },
      draw() { drawFn(); }
    };
    UI.push(m);
  });
}

// ---------------------------------------------------------------- screen fx
const Fx = { fade: 0, shake: 0, flash: 0, toasts: [] };
const fadeOut = (ms) => tween(Fx, 'fade', 1, ms || 300);
const fadeIn = (ms) => tween(Fx, 'fade', 0, ms || 300);
function toast(msg) { Fx.toasts.push({ msg, t: 2600 }); }
function drawFx(dt) {
  if (Fx.flash > 0) { ctx.fillStyle = `rgba(255,255,255,${Fx.flash})`; ctx.fillRect(0, 0, W, H); }
  if (Fx.fade > 0) { ctx.fillStyle = `rgba(0,0,0,${Fx.fade})`; ctx.fillRect(0, 0, W, H); }
  setFont(26);
  let y = 14;
  for (let i = 0; i < Fx.toasts.length; i++) {
    const t = Fx.toasts[i]; t.t -= dt;
    const a = clamp(t.t / 400, 0, 1);
    const tw = ctx.measureText(t.msg).width + 40;
    ctx.globalAlpha = a;
    panel(W - tw - 14, y, tw, 42); text(t.msg, W - tw + 6, y + 8, '#ffe9a8');
    ctx.globalAlpha = 1; y += 48;
  }
  Fx.toasts = Fx.toasts.filter(t => t.t > 0);
}

// ---------------------------------------------------------------- touch controls (tablet)
const Touch = { el: document.getElementById('touch'), enabled: false, want: false };
(function () {
  const dpad = document.getElementById('dpad');
  const enable = () => { Touch.enabled = true; };
  if (matchMedia('(pointer: coarse)').matches || 'ontouchstart' in window) enable();
  addEventListener('touchstart', enable, { passive: true });
  const setDir = e => {
    const r = dpad.getBoundingClientRect();
    const dx = e.clientX - (r.left + r.width / 2), dy = e.clientY - (r.top + r.height / 2);
    for (const d of DIRKEYS) Input.held[d] = false;
    if (Math.hypot(dx, dy) < r.width * 0.1) return;
    const d = Math.abs(dx) > Math.abs(dy) ? (dx < 0 ? 'left' : 'right') : (dy < 0 ? 'up' : 'down');
    Input.held[d] = true;
  };
  const clearDir = () => { for (const d of DIRKEYS) Input.held[d] = false; dpad.classList.remove('down'); };
  dpad.addEventListener('pointerdown', e => { Snd.unlock(); dpad.setPointerCapture(e.pointerId); dpad.classList.add('down'); setDir(e); e.preventDefault(); });
  dpad.addEventListener('pointermove', e => { if (dpad.classList.contains('down')) setDir(e); });
  dpad.addEventListener('pointerup', clearDir); dpad.addEventListener('pointercancel', clearDir);
  const btn = (id, key, hold) => {
    const b = document.getElementById(id);
    b.addEventListener('pointerdown', e => { Snd.unlock(); b.classList.add('down'); if (hold) Input.held[key] = true; else Input.presses.push(key); e.preventDefault(); });
    const up = () => { b.classList.remove('down'); if (hold) Input.held[key] = false; };
    b.addEventListener('pointerup', up); b.addEventListener('pointercancel', up); b.addEventListener('pointerleave', up);
  };
  btn('bA', 'a'); btn('bB', 'run', true); btn('bM', 'b');
  document.addEventListener('contextmenu', e => e.preventDefault());
})();
function updateTouch(show) {
  const on = Touch.enabled && show;
  if (on !== Touch.want) { Touch.want = on; Touch.el.classList.toggle('on', on); if (!on) for (const d of DIRKEYS) Input.held[d] = false; }
}

// ---------------------------------------------------------------- the storm
const Storm = { next: 0, t0: -99999, seed: 1, x: 480 };
function drawRain(now, n, a, top) {
  n = Math.round(n * [1, .6, .35][PERF.lvl]);
  ctx.save(); ctx.strokeStyle = `rgba(190,215,255,${a})`; ctx.lineWidth = 1.7; ctx.beginPath();
  for (let i = 0; i < n; i++) {
    const sp = .85 + (i % 7) * .09, x = W + 100 - ((i * 127.1 + now * .34 * sp) % (W + 200)), y = ((i * 311.7 + now * 1.3 * sp) % (H + 80)) - 40;
    ctx.moveTo(x, y); ctx.lineTo(x - 10, y + 36);
  }
  ctx.stroke();
  ctx.strokeStyle = `rgba(200,225,255,${a * 1.2})`; ctx.lineWidth = 1.4;
  for (let i = 0; i < 16; i++) {
    const ph = (now / 520 + i * .37) % 1, k = Math.floor(now / 520 + i * .37) * 7.3 + i * 91.7;
    const x = (Math.sin(k) * .5 + .5) * W, y = (top || 0) + (Math.sin(k * 1.7) * .5 + .5) * (H - (top || 0));
    ctx.globalAlpha = 1 - ph; ctx.beginPath(); ctx.ellipse(x, y, 4 + ph * 12, 1.5 + ph * 4, 0, 0, 6.3); ctx.stroke();
  }
  ctx.restore();
}
// Fires a bolt every so often. bolt=false gives only the flash (seen through windows indoors).
function drawStorm(now, groundY, gapMin, gapMax, bolt) {
  if (now > Storm.next) { Storm.t0 = now; Storm.next = now + gapMin + Math.random() * (gapMax - gapMin); Storm.seed = Math.floor(Math.random() * 1e6); Storm.x = 120 + Math.random() * (W - 240); Timers.add(180 + Math.random() * 400, () => Snd.sfx('thunder')); }
  const age = now - Storm.t0; if (age > 620) return;
  const fl = age < 90 ? .6 : age < 170 ? .12 : age < 260 ? .5 : .5 * (1 - (age - 260) / 360);
  if (bolt !== false && age < 300) {
    const r = mulberry32(Storm.seed), pts = [[Storm.x, -10]]; let x = Storm.x, y = -10;
    while (y < groundY) { y += 26 + r() * 34; x += (r() - .5) * 78; pts.push([x, Math.min(y, groundY)]); }
    const path = (ps) => { ctx.beginPath(); ctx.moveTo(ps[0][0], ps[0][1]); for (const q of ps) ctx.lineTo(q[0], q[1]); ctx.stroke(); };
    const br = pts.slice(Math.floor(pts.length * .4), Math.floor(pts.length * .4) + 4).map((q, i) => [q[0] + i * 34, q[1] + i * 10]);
    ctx.save(); ctx.lineJoin = 'round'; ctx.lineCap = 'round'; ctx.globalAlpha = age < 170 ? 1 : .6;
    ctx.strokeStyle = 'rgba(150,180,255,.35)'; ctx.lineWidth = 16; path(pts); ctx.lineWidth = 9; path(br);
    ctx.strokeStyle = '#ffffff'; ctx.lineWidth = 4; path(pts); ctx.lineWidth = 2.4; path(br);
    const gl = ctx.createRadialGradient(x, groundY, 4, x, groundY, 150); gl.addColorStop(0, 'rgba(220,235,255,.8)'); gl.addColorStop(1, 'rgba(220,235,255,0)'); ctx.fillStyle = gl; ctx.fillRect(x - 150, groundY - 150, 300, 300);
    ctx.restore();
  }
  ctx.fillStyle = `rgba(215,228,255,${fl * (bolt === false ? .45 : 1)})`; ctx.fillRect(0, 0, W, H);
}

// ---------------------------------------------------------------- read-aloud
// The tablet app speaks through Android's own voice (LBSpeech bridge); a browser uses its built-in voices.
const Speak = {
  id: 0, on: false, bad: false, done: null, tm: 0, VKEY: 'lastbell_voice', RKEY: 'lastbell_rate',
  can() { try { return !this.bad && (window.LBSpeech ? !!window.LBSpeech.ok() : !!(window.speechSynthesis && window.SpeechSynthesisUtterance)); } catch (e) { return false; } },
  duck(d) { try { if (Snd.master && !Snd.muted) Snd.master.gain.value = d ? .1 : .7; } catch (e) {} },
  get(k, d) { try { return localStorage.getItem(k) || d; } catch (e) { return d; } },
  set(k, v) { try { localStorage.setItem(k, v); } catch (e) {} },
  rate() { return parseFloat(this.get(this.RKEY, '0.95')); },
  // English voices on this device, best first. Natural-sounding ones are ranked above the robotic defaults.
  voices() {
    let list = [];
    try {
      if (window.LBSpeech) list = JSON.parse(window.LBSpeech.voices() || '[]');
      else list = speechSynthesis.getVoices().filter(v => /^en/i.test(v.lang)).map(v => ({ name: v.name, lang: v.lang, q: v.localService ? 300 : 320 }));
    } catch (e) {}
    const score = v => { const n = v.name.toLowerCase(); let s = v.q || 300;
      if (/natural|neural|wavenet/.test(n)) s += 200; if (/enhanced|premium|siri/.test(n)) s += 150;
      if (/samantha|ava|allison|zoe|aria|jenny|michelle|salli|joanna|kendra|ivy|google us english/.test(n)) s += 90;
      if (/female|#female|-f-|sfg|tpf|iob|iog/.test(n)) s += 20;
      if (/en[-_]us/i.test(v.lang || n)) s += 60; else if (/en[-_](gb|au)/i.test(v.lang || n)) s += 10;
      if (/compact|espeak|pico|albert|bad news|bahh|bells|boing|bubbles|cellos|deranged|good news|jester|organ|trinoids|whisper|wobble|zarvox|fred|ralph|junior|kathy|princess|superstar|grandma|grandpa|eddy|flo|reed|rocko|sandy|shelley/.test(n)) s -= 400;
      return s; };
    return list.map(v => Object.assign(v, { score: score(v) })).sort((a, b) => b.score - a.score);
  },
  voiceName() { const want = this.get(this.VKEY, ''), vs = this.voices(); return (vs.find(v => v.name === want) || vs[0] || {}).name || ''; },
  pretty(n) { return String(n || 'Device voice').replace(/^(Microsoft|Google)\s+/i, '').replace(/\s*-\s*English.*$/i, '').replace(/\(.*?\)/g, '').replace(/en[-_]us[-_]x[-_]/i, 'Voice ').replace(/[-_#]/g, ' ').replace(/\s+/g, ' ').trim().slice(0, 26); },
  // make text sound right when spoken: math signs become words, shouted words are not spelled out, gaps become "blank"
  clean(t) {
    return String(t)
      .replace(/[★☆▸▶◀♥♡·•]/g, ' ').replace(/kzzt/gi, ' ').replace(/_{2,}/g, ' blank ')
      .replace(/(\d)\s*\/\s*(\d)/g, '$1 over $2').replace(/\?\s*([+×÷−=])/g, 'what number $1').replace(/=\s*\?/g, 'equals what')
      .replace(/×/g, ' times ').replace(/÷/g, ' divided by ').replace(/−/g, ' minus ').replace(/(\d)\s*-\s*(\d)/g, '$1 minus $2').replace(/\+/g, ' plus ').replace(/=/g, ' equals ')
      .replace(/(\d)¢/g, '$1 cents').replace(/(\d)°/g, '$1 degrees').replace(/</g, ' is less than ').replace(/>/g, ' is greater than ').replace(/\bR(\d)/g, 'remainder $1')
      .replace(/\b([A-Z]{2,})\b/g, w => /^(OK|TV|ABC|II|III|IV)$/.test(w) ? w : w.toLowerCase())
      .replace(/\.\.\./g, ', ').replace(/\s+/g, ' ').trim();
  },
  stop() { this.id++; clearTimeout(this.tm); if (!this.on) return; this.on = false; this.duck(false); try { if (window.LBSpeech) window.LBSpeech.stop(); else speechSynthesis.cancel(); } catch (e) {} },
  // spoken a sentence at a time, so there is a natural breath between sentences and long passages are never cut off
  say(text) {
    this.stop(); if (!this.can()) return Promise.resolve(false);
    const parts = (this.clean(text).match(/[^.!?]+[.!?]+["')]*|[^.!?]+$/g) || []).map(x => x.trim()).filter(x => /[a-z0-9]/i.test(x));
    if (!parts.length) return Promise.resolve(false);
    return new Promise(res => {
      const id = ++this.id, end = ok => { if (id !== this.id) return; this.id++; clearTimeout(this.tm); this.on = false; this.duck(false); res(ok); };
      this.on = true; this.duck(true);
      const name = this.voiceName(), rate = this.rate(); let i = 0;
      const next = ok => {
        if (id !== this.id) return; clearTimeout(this.tm);
        if (ok === false || i >= parts.length) { end(ok !== false); return; }
        const t = parts[i++]; this.done = next; this.tm = setTimeout(() => next(true), 3500 + t.length * 120);
        try {
          if (window.LBSpeech) { window.LBSpeech.setup(name, rate, 1.06); window.LBSpeech.speak(t); }
          else { const u = new SpeechSynthesisUtterance(t), v = speechSynthesis.getVoices().find(x => x.name === name); if (v) { u.voice = v; u.lang = v.lang; } else u.lang = 'en-US'; u.rate = rate; u.pitch = 1.06; u.onend = () => next(true); u.onerror = () => next(false); this.keep = u; speechSynthesis.speak(u); }
        } catch (e) { this.bad = true; end(false); }
      };
      next(true);
    });
  }
};
window.lbSpeechDone = ok => { if (Speak.done) Speak.done(ok); };
try { if (window.speechSynthesis) speechSynthesis.getVoices(); } catch (e) {}

// ---------------------------------------------------------------- typing box (a real text field over the canvas)
function typeAnswer(label, opts) {
  opts = opts || {};
  return new Promise(res => {
    const box = document.getElementById('typebox'), inp = document.getElementById('typein'), ok = document.getElementById('typeok'), no = document.getElementById('typecancel');
    document.getElementById('typelabel').textContent = label; inp.value = opts.value || ''; inp.placeholder = opts.placeholder || 'Type here...'; inp.rows = opts.rows || 3; no.textContent = opts.cancel || 'Skip';
    box.hidden = false; setTimeout(() => { try { inp.focus(); } catch (e) {} }, 60);
    const m = { update() {}, draw() { if (opts.draw) opts.draw(); }, tap() {} }; UI.push(m);
    const close = v => { box.hidden = true; ok.onclick = no.onclick = null; try { inp.blur(); } catch (e) {} UI.pop(m); res(v); };
    ok.onclick = () => { const v = inp.value.trim(); if (!v) { inp.focus(); return; } close(v); };
    no.onclick = () => close(null);
  });
}
