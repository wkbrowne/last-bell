'use strict';
// Vector cartoon art, drawn procedurally at high resolution and cached.
// Everything is authored in a 100x100 box (feet at y~94) with chunky outlines and soft shading.
const Q = 2.5, OUT = '#2a1f38';
const mk = (w, h) => { const c = document.createElement('canvas'); c.width = Math.ceil(w); c.height = Math.ceil(h); return c; };
if (!CanvasRenderingContext2D.prototype.roundRect) {
  CanvasRenderingContext2D.prototype.roundRect = function (x, y, w, h, r) {
    if (!Array.isArray(r)) r = [r, r, r, r]; if (r.length === 2) r = [r[0], r[1], r[0], r[1]];
    const [a, b, c, d] = r.map(v => Math.min(v || 0, Math.abs(w) / 2, Math.abs(h) / 2));
    this.moveTo(x + a, y); this.lineTo(x + w - b, y); this.arcTo(x + w, y, x + w, y + b, b); this.lineTo(x + w, y + h - c); this.arcTo(x + w, y + h, x + w - c, y + h, c);
    this.lineTo(x + d, y + h); this.arcTo(x, y + h, x, y + h - d, d); this.lineTo(x, y + a); this.arcTo(x, y, x + a, y, a); this.closePath();
  };
}
function tint(hex, a) {
  const n = parseInt(hex.slice(1), 16), t = a < 0 ? 0 : 255, k = Math.abs(a);
  const f = v => Math.round(v + (t - v) * k).toString(16).padStart(2, '0');
  return '#' + f(n >> 16) + f(n >> 8 & 255) + f(n & 255);
}
let g = null;
function begin(w, h, units) { const c = mk(w * Q, h * Q), k = c.getContext('2d'); g = k; g.scale(w * Q / (units || 100), w * Q / (units || 100)); g.lineWidth = 3.6; g.strokeStyle = OUT; g.lineJoin = 'round'; g.lineCap = 'round'; return c; }
const grad = (x, y, r, col) => { const q = g.createRadialGradient(x - r * .35, y - r * .45, r * .05, x, y, r * 1.3); q.addColorStop(0, tint(col, .3)); q.addColorStop(.5, col); q.addColorStop(1, tint(col, -.3)); return q; };
function el(x, y, rx, ry, col, rot, flat) { g.beginPath(); g.ellipse(x, y, rx, ry, rot || 0, 0, 6.3); g.fillStyle = flat ? col : grad(x, y, Math.max(rx, ry), col); g.fill(); g.stroke(); }
function pol(p, col) { g.beginPath(); g.moveTo(p[0], p[1]); for (let i = 2; i < p.length; i += 2) g.lineTo(p[i], p[i + 1]); g.closePath(); g.fillStyle = col; g.fill(); g.stroke(); }
function rr(x, y, w, h, r, col, flat) { g.beginPath(); g.roundRect(x, y, w, h, r); g.fillStyle = flat ? col : grad(x + w / 2, y + h / 2, Math.max(w, h) * .6, col); g.fill(); g.stroke(); }
function ln(p, col, w) { g.save(); g.beginPath(); g.moveTo(p[0], p[1]); for (let i = 2; i < p.length; i += 2) g.lineTo(p[i], p[i + 1]); g.strokeStyle = col || OUT; g.lineWidth = w || 3; g.stroke(); g.restore(); }
function dot(x, y, r, col, a) { g.save(); if (a) g.globalAlpha = a; g.beginPath(); g.arc(x, y, r, 0, 6.3); g.fillStyle = col; g.fill(); g.restore(); }
function glow(x, y, r, col, a) { g.save(); const q = g.createRadialGradient(x, y, 0, x, y, r); q.addColorStop(0, col); q.addColorStop(1, 'rgba(255,255,255,0)'); g.globalAlpha = a || .6; g.fillStyle = q; g.fillRect(x - r, y - r, r * 2, r * 2); g.restore(); }
function arc(x, y, r, a0, a1, col, w) { g.save(); g.beginPath(); g.arc(x, y, r, a0, a1); g.strokeStyle = col || OUT; g.lineWidth = w || 3; g.stroke(); g.restore(); }
function eyes(x, y, sep, r, o) {
  o = o || {};
  for (const s of [-1, 1]) {
    const ex = x + s * sep, rr2 = r * (o.big && s === o.big ? 1.3 : 1);
    if (o.closed) { arc(ex, y - r * .3, r, .2, 2.9); continue; }
    g.save(); g.lineWidth = 2.4; el(ex, y, rr2, rr2 * (o.tall || 1.15), o.white || '#ffffff', 0, true); g.restore();
    dot(ex + (o.lx || 0) * r * .35, y + r * .12, rr2 * (o.pup || .62), o.iris || '#231a30');
    dot(ex - r * .22 + (o.lx || 0) * r * .35, y - r * .28, rr2 * .24, '#ffffff');
    if (o.angry) ln([ex + s * r * 1.2, y - r * 1.7, ex - s * r * .9, y - r * .9], OUT, 3.4);
    if (o.det) ln([ex + s * r * 1.3, y - r * 1.6, ex - s * r * .95, y - r * 1.05], OUT, 3.2);
    if (o.sad) ln([ex + s * r * 1.2, y - r * 1.1, ex - s * r * .9, y - r * 1.7], OUT, 3);
  }
}
function mouth(x, y, w, type) {
  if (type === 'open') { g.save(); g.lineWidth = 2.6; el(x, y, w, w * .7, '#5a1f33', 0, true); g.restore(); dot(x, y + w * .3, w * .5, '#ff7a8a'); }
  else if (type === 'fang') { arc(x, y - w * .4, w, .3, 2.84, OUT, 2.8); g.save(); g.lineWidth = 2; pol([x - w * .6, y + w * .1, x - w * .25, y + w * .1, x - w * .42, y + w * .7], '#ffffff'); g.restore(); }
  else if (type === 'teeth') { g.save(); g.lineWidth = 2.6; rr(x - w, y - w * .3, w * 2, w * .8, w * .3, '#ffffff', true); ln([x - w * .33, y - w * .3, x - w * .33, y + w * .5], OUT, 1.8); ln([x + w * .33, y - w * .3, x + w * .33, y + w * .5], OUT, 1.8); g.restore(); }
  else if (type === 'flat') ln([x - w, y, x + w, y], OUT, 2.8);
  else arc(x, y - w * .5, w, .35, 2.79, OUT, 2.8);
}
const blush = (x, y, sep, r) => { dot(x - sep, y, r || 4, '#ff7a9a', .45); dot(x + sep, y, r || 4, '#ff7a9a', .45); };
const shine = (x, y, rx, ry) => { g.save(); g.globalAlpha = .4; g.beginPath(); g.ellipse(x, y, rx, ry, -.6, 0, 6.3); g.fillStyle = '#fff'; g.fill(); g.restore(); };
const feet = (x, y, sep, col) => { el(x - sep, y, 7, 4.5, col); el(x + sep, y, 7, 4.5, col); };

// ------------------------------------------------------------ critters
const CR = {
  scrapup() { const a = '#a9b4c2', b = '#6d7887'; ln([50, 30, 50, 16], b, 3); dot(50, 14, 4, '#ff5a4a'); pol([27, 36, 24, 14, 42, 30], a); pol([73, 36, 76, 14, 58, 30], a); feet(50, 92, 13, b); el(50, 78, 20, 14, a); rr(25, 28, 50, 40, 13, a); el(50, 56, 13, 9, '#dfe6ee'); dot(50, 52, 3.4, OUT); eyes(50, 44, 12, 6.5, { det: 1 }); mouth(50, 58, 5, 'fang'); ln([62, 32, 68, 40], b, 2); ln([65, 31, 64, 41], b, 1.6); rr(30, 65, 40, 7, 3, '#e5483d'); for (const x of [35, 44, 53, 62]) { g.save(); g.lineWidth = 1.8; pol([x - 3, 66, x, 59, x + 3, 66], '#dfe6ee'); g.restore(); } dot(30, 34, 1.8, b); dot(70, 34, 1.8, b); dot(36, 82, 1.8, b); dot(64, 82, 1.8, b); blush(50, 52, 19); },
  junkhound() { const a = '#8f9aa8', b = '#555f6c'; pol([20, 60, 8, 44, 26, 48], b); pol([80, 60, 92, 44, 74, 48], b); pol([38, 40, 50, 22, 62, 40], b); feet(50, 93, 17, b); el(50, 74, 28, 19, a); rr(26, 60, 14, 12, 4, b); rr(60, 60, 14, 12, 4, b); pol([24, 34, 18, 10, 40, 26], a); pol([76, 34, 82, 10, 60, 26], a); rr(22, 22, 56, 42, 14, a); rr(34, 48, 32, 16, 6, '#e9e2c8', true); for (const x of [40, 46, 52, 58]) ln([x, 54, x + 2, 60], OUT, 2); ln([34, 55, 66, 55], OUT, 2.4); dot(50, 46, 3.6, OUT); eyes(50, 36, 13, 6.5, { angry: 1 }); },
  sporkle() { const a = '#4fb84a', b = '#2c7a36', pk = '#e8508a';
    ln([62, 82, 82, 76, 90, 60], b, 5.5); pol([85, 62, 98, 50, 94, 68], '#7fe06a');
    feet(50, 93, 11, b); el(50, 77, 17, 15, a); el(50, 81, 9, 8, '#c8f08a', 0, true);
    pol([38, 66, 16, 58, 30, 76], '#7fe06a'); pol([62, 66, 84, 58, 70, 76], '#7fe06a');
    g.beginPath(); g.ellipse(50, 50, 27, 17, 0, 0, Math.PI); g.closePath(); g.fillStyle = grad(50, 56, 27, a); g.fill(); g.stroke();
    g.save(); g.lineWidth = 2.4; el(50, 50, 23, 7, pk, 0, true); g.restore();
    for (let x = 31; x < 66; x += 8) { g.save(); g.lineWidth = 1.8; pol([x, 57, x + 3.5, 49, x + 7, 57], '#ffffff'); g.restore(); }
    pol([43, 22, 50, 6, 57, 22], '#7fe06a'); pol([30, 30, 28, 14, 40, 24], '#7fe06a'); pol([70, 30, 72, 14, 60, 24], '#7fe06a');
    g.beginPath(); g.ellipse(50, 46, 29, 25, 0, Math.PI, 0); g.closePath(); g.fillStyle = grad(50, 32, 29, a); g.fill(); g.stroke();
    for (let x = 25; x < 72; x += 8.4) { g.save(); g.lineWidth = 1.8; pol([x, 45, x + 4.2, 54, x + 8.4, 45], '#ffffff'); g.restore(); }
    dot(34, 38, 3, b, .6); dot(66, 36, 2.4, b, .6); dot(58, 26, 2, b, .6);
    eyes(50, 33, 10, 6, { det: 1, white: '#fff3a8' }); },
  mycolossus() { const a = '#2f9a4a', b = '#1c5a2c', pk = '#c8306a', pet = '#e8483a';
    for (const s of [-1, 1]) { ln([50 + s * 24, 70, 50 + s * 40, 60, 50 + s * 43, 46], b, 6.5); el(50 + s * 43, 40, 8.5, 7.5, a); g.save(); g.lineWidth = 1.6; for (const k of [-4, 1]) pol([50 + s * 43 + k, 43, 50 + s * 43 + k + 2.5, 49, 50 + s * 43 + k + 5, 43], '#fff'); g.restore(); }
    ln([60, 86, 84, 88, 94, 74], b, 6); pol([90, 76, 100, 62, 98, 82], '#7fe06a');
    feet(50, 94, 15, b); el(50, 77, 24, 18, a); el(50, 81, 13, 10, '#b8e87a', 0, true);
    for (const [x, y, r2] of [[14, 40, -1.1], [86, 40, 1.1], [24, 16, -.6], [76, 16, .6], [50, 4, 0]]) { g.save(); g.translate(x, y); g.rotate(r2); pol([-8, 10, 0, -12, 8, 10], pet); g.restore(); }
    g.beginPath(); g.ellipse(50, 46, 36, 22, 0, 0, Math.PI); g.closePath(); g.fillStyle = grad(50, 54, 36, a); g.fill(); g.stroke();
    g.save(); g.lineWidth = 2.4; el(50, 46, 31, 9, pk, 0, true); g.restore();
    for (let x = 24; x < 70; x += 10) { g.save(); g.lineWidth = 2; pol([x, 56, x + 5, 45, x + 10, 56], '#ffffff'); g.restore(); }
    g.beginPath(); g.ellipse(50, 40, 38, 31, 0, Math.PI, 0); g.closePath(); g.fillStyle = grad(50, 22, 38, a); g.fill(); g.stroke();
    for (let x = 16; x < 80; x += 10.4) { g.save(); g.lineWidth = 2; pol([x, 39, x + 5.2, 51, x + 10.4, 39], '#ffffff'); g.restore(); }
    dot(28, 30, 4, b, .6); dot(72, 28, 3, b, .6); dot(62, 14, 2.6, b, .6); dot(40, 14, 2.2, b, .6);
    eyes(50, 24, 13, 6.5, { angry: 1, white: '#fff3a8', iris: '#7a0f2a' }); },
  zaprat() { const a = '#ffd23f', b = '#d9a520'; pol([76, 78, 92, 66, 84, 64, 96, 46, 78, 60, 86, 62], '#7ff4ff'); el(28, 30, 13, 15, a); el(28, 31, 7, 9, '#ffb0c0', 0, true); el(72, 30, 13, 15, a); el(72, 31, 7, 9, '#ffb0c0', 0, true); feet(50, 93, 11, b); el(50, 66, 25, 26, a); el(50, 76, 13, 11, '#fff3bf', 0, true); eyes(50, 58, 10, 6.5, { det: 1 }); dot(50, 66, 2.6, '#ff7a9a'); mouth(50, 70, 4.5, 'fang'); pol([43, 44, 46, 28, 50, 38, 53, 22, 55, 36, 60, 30, 58, 45], '#7ff4ff'); dot(30, 68, 5, '#ff7a5a', .7); dot(70, 68, 5, '#ff7a5a', .7); ln([34, 64, 22, 62], OUT, 1.6); ln([66, 64, 78, 62], OUT, 1.6); },
  voltvermin() { const a = '#f7b52c', b = '#b97a12'; pol([78, 74, 96, 60, 86, 58, 98, 36, 76, 54, 86, 56], '#7ff4ff'); pol([22, 74, 4, 60, 14, 58, 2, 36, 24, 54, 14, 56], '#7ff4ff'); pol([30, 34, 18, 8, 42, 24], a); pol([70, 34, 82, 8, 58, 24], a); feet(50, 93, 14, b); pol([24, 60, 12, 52, 24, 48, 14, 38, 30, 40, 50, 30, 70, 40, 86, 38, 76, 48, 88, 52, 76, 60], a); el(50, 64, 28, 27, a); el(50, 76, 15, 12, '#fff0b5', 0, true); eyes(50, 54, 11, 7, { angry: 1 }); mouth(50, 68, 6, 'fang'); dot(28, 66, 5, '#ff7a5a', .7); dot(72, 66, 5, '#ff7a5a', .7); },
  gnawbie() { const a = '#9b9bab', b = '#55556a'; el(80, 72, 9, 17, a, .5); ln([74, 64, 88, 68], b, 4); ln([76, 74, 90, 78], b, 4); pol([28, 34, 24, 14, 42, 26], a); pol([72, 34, 76, 14, 58, 26], a); feet(50, 93, 11, b); el(50, 76, 20, 17, a); el(50, 80, 11, 10, '#e2e2ec', 0, true); el(50, 46, 28, 22, a); g.save(); g.lineWidth = 2.4; el(37, 44, 11, 8, '#33334a', -.2, true); el(63, 44, 11, 8, '#33334a', .2, true); g.restore(); el(50, 54, 10, 7, '#e9e9f2', 0, true); dot(50, 51, 3, OUT); eyes(50, 44, 12, 5, { det: 1 }); mouth(50, 55, 4, 'fang'); pol([34, 62, 66, 62, 58, 70, 50, 80, 42, 70], '#e5483d'); ln([36, 64, 64, 64], '#b02a22', 2); },
  trashking() { const a = '#7f7f98', b = '#444458'; el(84, 70, 10, 20, a, .5); ln([76, 60, 92, 64], b, 4.5); ln([78, 72, 94, 76], b, 4.5); pol([26, 34, 22, 16, 40, 26], a); pol([74, 34, 78, 16, 60, 26], a); feet(50, 93, 15, b); el(50, 74, 27, 21, a); el(50, 78, 16, 14, '#dadaea', 0, true); el(50, 42, 30, 23, a); pol([32, 22, 32, 6, 41, 15, 50, 4, 59, 15, 68, 6, 68, 22], '#ffcb3d'); dot(50, 15, 2.6, '#e5483d'); g.save(); g.lineWidth = 2.4; el(36, 42, 12, 8.5, '#2c2c40', -.2, true); el(64, 42, 12, 8.5, '#2c2c40', .2, true); g.restore(); el(50, 53, 11, 7.5, '#ededf6', 0, true); dot(50, 50, 3.2, OUT); eyes(50, 42, 13, 5.5, { angry: 1 }); mouth(50, 54, 5, 'fang'); },
  thornpup() { const a = '#5cc25a', b = '#2f7d3a', c = '#c8ec70'; for (const x of [34, 44, 56, 66]) pol([x - 5, 62, x, 50, x + 5, 62], c); pol([24, 44, 12, 22, 38, 30], c); pol([76, 44, 88, 22, 62, 30], c); feet(50, 93, 12, b); el(50, 76, 21, 16, a); el(50, 48, 26, 22, a); el(50, 57, 11, 8, '#e3f7b0', 0, true); dot(50, 53, 3, OUT); eyes(50, 44, 11, 6.5, { det: 1 }); mouth(50, 58, 4.5, 'fang'); rr(32, 66, 36, 6, 3, '#3a2a1a'); for (const x of [37, 46, 55, 63]) { g.save(); g.lineWidth = 1.8; pol([x - 3, 67, x, 60, x + 3, 67], '#ffd23f'); g.restore(); } },
  brambleback() { const a = '#44a352', b = '#256b33', c = '#d6ee6c'; for (const [x, y, r] of [[28, 52, 17], [72, 52, 17], [50, 42, 21], [38, 62, 15], [62, 62, 15]]) el(x, y, r, r, b); for (const [x, y] of [[20, 40], [80, 40], [50, 20], [34, 26], [66, 26]]) pol([x - 5, y + 6, x, y - 8, x + 5, y + 6], c); dot(30, 48, 4, '#ff7ab0'); dot(72, 44, 4, '#ff7ab0'); dot(52, 30, 4, '#ffd23f'); feet(50, 93, 16, b); el(50, 74, 25, 19, a); el(50, 64, 21, 17, a); el(50, 72, 10, 7, '#dff5a8', 0, true); dot(50, 68, 3, OUT); eyes(50, 60, 10, 6, { angry: 1 }); mouth(50, 74, 4.5, 'fang'); },
  dustmoth() { const a = '#cdb98f', b = '#8a7650'; el(24, 44, 20, 24, a, -.35); el(76, 44, 20, 24, a, .35); el(26, 72, 13, 15, tint(a, -.12), .4); el(74, 72, 13, 15, tint(a, -.12), -.4); dot(22, 42, 6, b, .7); dot(78, 42, 6, b, .7); dot(26, 72, 3.5, '#fff', .6); dot(74, 72, 3.5, '#fff', .6); ln([44, 34, 36, 14], OUT, 2.6); ln([56, 34, 64, 14], OUT, 2.6); dot(36, 13, 3.4, a); dot(64, 13, 3.4, a); el(50, 68, 12, 20, '#f3ead2'); el(50, 44, 17, 16, '#f3ead2'); eyes(50, 42, 7.5, 6.5, { det: 1, white: '#fff3a8' }); mouth(50, 53, 3, 'fang'); },
  gloomwing() { const a = '#6a56a8', b = '#2f2550'; pol([50, 50, 6, 14, 2, 50, 14, 62, 6, 82, 30, 74, 44, 84], a); pol([50, 50, 94, 14, 98, 50, 86, 62, 94, 82, 70, 74, 56, 84], a); for (const [x, y] of [[18, 36], [26, 58], [82, 36], [74, 58], [14, 50], [86, 50]]) dot(x, y, 2.6, '#fff3a8'); glow(22, 44, 18, '#b7a4ff', .35); glow(78, 44, 18, '#b7a4ff', .35); ln([44, 32, 36, 12], OUT, 2.6); ln([56, 32, 64, 12], OUT, 2.6); el(50, 70, 12, 20, b); el(50, 44, 18, 17, b); eyes(50, 42, 8, 6.5, { white: '#ffe36a', iris: '#2a1030', angry: 1, pup: .4 }); mouth(50, 54, 3.5, 'fang'); },
  wispkin() { glow(50, 54, 46, '#8ff5e2', .5); g.beginPath(); g.moveTo(50, 6); g.bezierCurveTo(64, 26, 84, 40, 80, 66); g.bezierCurveTo(76, 92, 24, 92, 20, 66); g.bezierCurveTo(16, 44, 34, 40, 38, 22); g.bezierCurveTo(42, 28, 46, 22, 50, 6); g.closePath(); g.fillStyle = grad(50, 56, 34, '#7fe8d6'); g.fill(); g.stroke(); g.beginPath(); g.moveTo(50, 34); g.bezierCurveTo(60, 48, 68, 58, 64, 72); g.bezierCurveTo(58, 86, 40, 86, 36, 72); g.bezierCurveTo(32, 58, 44, 52, 50, 34); g.fillStyle = '#e9fffb'; g.fill(); el(41, 62, 5, 7, '#17454a', 0, true); el(59, 62, 5, 7, '#17454a', 0, true); dot(39.5, 59.5, 1.6, '#fff'); dot(57.5, 59.5, 1.6, '#fff'); mouth(50, 74, 4.5, 'open'); },
  boltbug() { const a = '#3f7ee8', b = '#234a9c'; for (const s of [-1, 1]) { ln([50 + s * 18, 66, 50 + s * 34, 60, 50 + s * 38, 70], OUT, 3); ln([50 + s * 16, 78, 50 + s * 32, 80, 50 + s * 36, 90], OUT, 3); } ln([50, 30, 50, 18], OUT, 3); glow(50, 12, 20, '#fff59a', .9); el(50, 12, 7, 8, '#fff59a'); el(50, 68, 24, 22, a); ln([50, 48, 50, 90], b, 2.6); shine(40, 60, 6, 9); dot(38, 74, 3, b); dot(62, 70, 3, b); el(50, 42, 19, 15, tint(a, -.25)); rr(34, 35, 32, 11, 5.5, '#1a2444', true); glow(50, 40.5, 18, '#7ff4ff', .6); ln([39, 40.5, 61, 40.5], '#7ff4ff', 3); mouth(50, 51, 3.5); },
  rubblet() { const a = '#a99887', b = '#73655a'; feet(50, 93, 12, b); pol([24, 86, 14, 62, 26, 38, 46, 28, 70, 32, 86, 52, 82, 80, 62, 90, 38, 90], '#a99887'); g.save(); g.clip(); glow(38, 46, 40, '#fff', .28); g.restore(); pol([24, 86, 14, 62, 26, 38, 46, 28, 70, 32, 86, 52, 82, 80, 62, 90, 38, 90], 'rgba(0,0,0,0)'); ln([60, 34, 56, 46, 64, 52], b, 2.4); ln([24, 70, 34, 74], b, 2.4); eyes(48, 60, 11, 7, { det: 1 }); mouth(48, 74, 5, 'fang'); glow(62, 42, 12, '#ffb03a', .7); ln([60, 34, 56, 46, 64, 52], '#ffb03a', 1.6); },
  bouldozer() { const a = '#96867a', b = '#5f5248'; rr(18, 82, 22, 12, 4, b); rr(60, 82, 22, 12, 4, b); pol([14, 80, 6, 50, 18, 24, 44, 10, 74, 16, 94, 44, 92, 78, 70, 88, 30, 88], a); ln([64, 20, 58, 34, 68, 40], b, 2.6); ln([16, 46, 28, 50], b, 2.6); eyes(50, 40, 13, 7.5, { angry: 1 }); rr(16, 60, 68, 22, 5, '#f2c230'); for (let x = 22; x < 80; x += 12) pol([x, 82, x + 5, 92, x + 10, 82], '#e8e8f0'); ln([20, 66, 80, 66], '#b98c12', 2.4); },
  gloop() { g.beginPath(); g.moveTo(14, 84); g.bezierCurveTo(10, 40, 34, 26, 50, 26); g.bezierCurveTo(66, 26, 90, 40, 86, 84); g.bezierCurveTo(86, 96, 74, 94, 70, 88); g.bezierCurveTo(64, 96, 56, 96, 50, 89); g.bezierCurveTo(44, 96, 36, 96, 30, 88); g.bezierCurveTo(26, 94, 14, 96, 14, 84); g.closePath(); g.fillStyle = grad(50, 58, 38, '#86e052'); g.fill(); g.stroke(); shine(34, 42, 8, 13); dot(66, 40, 3, '#fff', .5); eyes(50, 60, 11, 7.5, { det: 1 }); mouth(50, 75, 8, 'teeth'); },
  gloopzilla() { el(14, 62, 9, 16, '#62c63f', .5); el(86, 62, 9, 16, '#62c63f', -.5); pol([32, 22, 28, 6, 42, 16], '#c8ffa0'); pol([68, 22, 72, 6, 58, 16], '#c8ffa0'); g.beginPath(); g.moveTo(10, 86); g.bezierCurveTo(4, 30, 30, 12, 50, 12); g.bezierCurveTo(70, 12, 96, 30, 90, 86); g.bezierCurveTo(90, 98, 76, 96, 72, 90); g.bezierCurveTo(66, 98, 56, 98, 50, 91); g.bezierCurveTo(44, 98, 34, 98, 28, 90); g.bezierCurveTo(24, 96, 10, 98, 10, 86); g.closePath(); g.fillStyle = grad(50, 52, 42, '#68cc44'); g.fill(); g.stroke(); shine(30, 32, 9, 15); dot(72, 30, 4, '#fff', .45); dot(78, 44, 2.5, '#fff', .45); eyes(50, 48, 13, 8.5, { angry: 1 }); mouth(50, 68, 10, 'teeth'); },
  murdle() { const a = '#3a3a52', b = '#1f1f2e'; ln([42, 84, 40, 94, 34, 94], '#f0a020', 3.4); ln([58, 84, 60, 94, 66, 94], '#f0a020', 3.4); pol([70, 70, 94, 78, 76, 84], b); el(50, 66, 24, 22, a); el(64, 68, 13, 17, b, .3); el(42, 40, 20, 19, a); pol([38, 20, 34, 8, 44, 18], a); pol([20, 44, 6, 50, 22, 54], '#f8b62c'); rr(24, 32, 34, 11, 4, '#15131c', true); ln([28, 35, 36, 35], '#8fd0ea', 2); ln([44, 35, 50, 35], '#8fd0ea', 2); shine(50, 56, 6, 10); },
  krush() { for (const x of [26, 62]) { rr(x, 74, 12, 16, 3, '#5a6270'); rr(x - 4, 88, 20, 8, 3, '#3d4249'); } rr(2, 44, 14, 30, 6, '#f2c230'); rr(84, 44, 14, 30, 6, '#f2c230'); rr(12, 8, 76, 50, 10, '#f2c230'); for (let x = 16; x < 84; x += 16) pol([x, 50, x + 8, 50, x + 2, 58, x - 6, 58], '#2a2430'); rr(22, 16, 56, 26, 6, '#221c2c', true); glow(38, 29, 12, '#ff3b30', .9); glow(62, 29, 12, '#ff3b30', .9); dot(38, 29, 5.5, '#ff5a4a'); dot(62, 29, 5.5, '#ff5a4a'); dot(36.5, 27.5, 1.8, '#fff'); dot(60.5, 27.5, 1.8, '#fff'); rr(14, 56, 72, 20, 5, '#8a93a0'); for (let x = 20; x < 80; x += 11) pol([x, 56, x + 5, 67, x + 10, 56], '#f0f0f6'); dot(18, 14, 2, '#b98c12'); dot(82, 14, 2, '#b98c12'); },
  munch() { const a = '#f08a3c'; pol([28, 26, 22, 6, 40, 18], '#ffe0b0'); pol([72, 26, 78, 6, 60, 18], '#ffe0b0'); el(14, 62, 9, 15, a, .4); el(86, 62, 9, 15, a, -.4); feet(50, 94, 16, '#b05a1e'); el(50, 56, 38, 38, a); el(50, 80, 20, 11, '#ffe0b0', 0, true); eyes(50, 38, 13, 8); g.save(); g.lineWidth = 3; rr(24, 52, 52, 20, 9, '#5a1f33', true); g.restore(); for (let x = 28; x < 70; x += 9) { pol([x, 53, x + 4, 60, x + 8, 53], '#fff'); } el(50, 68, 12, 4, '#ff7a8a', 0, true); pol([42, 78, 50, 82, 42, 86], '#e5483d'); pol([58, 78, 50, 82, 58, 86], '#e5483d'); dot(50, 82, 2.6, '#ffd23f'); },
  clanker() { const a = '#9aa4bd', b = '#5a6480'; pol([50, 20, 58, 2, 66, 8, 60, 22], '#e5483d'); rr(34, 78, 12, 16, 3, b); rr(54, 78, 12, 16, 3, b); rr(8, 46, 16, 14, 6, a); rr(76, 46, 16, 14, 6, a); rr(10, 58, 11, 22, 4, b); rr(79, 58, 11, 22, 4, b); rr(26, 44, 48, 38, 8, a); ln([50, 46, 50, 80], b, 2.6); ln([30, 62, 70, 62], b, 2.6); rr(28, 14, 44, 36, [20, 20, 6, 6], a); rr(32, 28, 36, 9, 3, '#1f1828', true); glow(42, 32, 9, '#ff5a4a', .9); dot(42, 32, 3.4, '#ff6a5a'); glow(58, 32, 9, '#ff5a4a', .9); dot(58, 32, 3.4, '#ff6a5a'); for (const x of [38, 44, 50, 56, 62]) ln([x, 40, x, 47], '#1f1828', 2); ln([84, 80, 84, 26], '#6a4a2a', 3.5); pol([78, 28, 84, 10, 90, 28], '#dfe6ee'); },
  bellringer() { const a = '#45306e', b = '#27183f'; glow(50, 40, 50, '#ff3b30', .22); pol([8, 96, 20, 44, 32, 28, 68, 28, 80, 44, 92, 96], a); pol([38, 96, 44, 50, 56, 50, 62, 96], b); el(16, 62, 9, 15, a, .3); el(84, 62, 9, 15, a, -.3); el(50, 30, 24, 24, a); el(50, 34, 16, 17, '#120a1e', 0, true); glow(43, 32, 10, '#ff3b30', 1); glow(57, 32, 10, '#ff3b30', 1); dot(43, 32, 3.6, '#ff6a5a'); dot(57, 32, 3.6, '#ff6a5a'); pol([30, 14, 30, 0, 38, 8, 44, -2, 50, 8, 56, -2, 62, 8, 70, 0, 70, 14], '#ffcb3d'); ln([16, 70, 16, 78], '#6a4a2a', 3); g.beginPath(); g.moveTo(4, 96); g.quadraticCurveTo(6, 78, 16, 76); g.quadraticCurveTo(26, 78, 28, 96); g.closePath(); g.fillStyle = grad(16, 86, 14, '#ffcb3d'); g.fill(); g.stroke(); dot(16, 96, 3, '#b98c12'); }
};

// ------------------------------------------------------------ people & zombies (chibi kit)
const HUM = {
  dex: { skin: '#a86b42', hair: '#1c1410', style: 'cap', spiky: 1, cap: '#e5483d', jacket: '#2b3a67', shirt: '#f6b93b', emblem: 1, pants: '#3a3f52', shoes: '#e5483d', scarf: '#e5483d', pack: '#6a5238', gloves: '#22202c', eye: '#5a3a1e' },
  priya: { skin: '#c98d5e', hair: '#2b1b33', style: 'long', streak: '#3fe0d0', jacket: '#f4f4fa', shirt: '#8e6be8', pants: '#3f466b', shoes: '#8e6be8', goggles: 1, belt: '#7a5230', prop: 'wrench', eye: '#4a3a8a' },
  bash: { skin: '#f4cfa6', hair: '#e0b24f', style: 'mohawk', shirt: '#2f8a4a', num: '7', pads: '#9aa3b0', pants: '#4a4a5a', shoes: '#22202c', wide: 38, eyeblack: 1, bandage: 1, gloves: '#9aa3b0', eye: '#3a6a8a' },
  wren: { skin: '#d79a68', hair: '#7a3220', style: 'pony', band: '#ffffff', jacket: '#e2553f', shirt: '#22202c', scarf: '#22202c', pants: '#22262e', shoes: '#b8ff5a', gloves: '#f4f4f4', eye: '#2a6a4a' },
  mom: { skin: '#a86b42', hair: '#2a1c14', style: 'bun', shirt: '#7fd6de', pants: '#63b9c2', shoes: '#ffffff', eye: '#5a3a1e' },
  shambler: { z: 1, skin: '#84b08a', hair: '#5b4a3a', style: 'mess', shirt: '#7a8bb5', pants: '#4a4a5e', shoes: '#3a3038' },
  sprinter: { z: 1, skin: '#8cb894', hair: '#33303a', style: 'buzz', shirt: '#d64f44', pants: '#2b2f3a', shoes: '#f0f0f0', band: '#ffffff', stripe: '#ffffff' },
  lunchlady: { z: 1, skin: '#84b08a', hair: '#e9e9f2', style: 'bun', shirt: '#f3efe2', pants: '#9a78ad', shoes: '#ffffff', wide: 36, prop: 'ladle' },
  hazmat: { z: 1, skin: '#84b08a', hair: '#f2d43a', style: 'hood', shirt: '#f2d43a', pants: '#d9bb22', shoes: '#4a4a55' },
  bloater: { z: 1, skin: '#90b488', hair: '#5b4a3a', style: 'mess', shirt: '#a07c55', pants: '#4a4a5e', shoes: '#3a3038', wide: 54, belly: 1 },
  butler: { z: 1, skin: '#a4b8b4', hair: '#c9c9d6', style: 'slick', shirt: '#23202e', pants: '#23202e', shoes: '#111118', bow: 1, prop: 'tray' },
  coach: { z: 1, skin: '#84b08a', hair: '#5b4a3a', style: 'cap', cap: '#d6453a', shirt: '#f0f0f6', pants: '#32479a', shoes: '#f0f0f0', wide: 38, stripe: '#d6453a', prop: 'whistle' },
  mallcop: { z: 1, skin: '#84b08a', hair: '#33303a', style: 'cop', cap: '#27325c', shirt: '#42558c', pants: '#2c3660', shoes: '#111118', wide: 36, prop: 'scooter' },
  flatline: { z: 1, skin: '#84b08a', hair: '#3a3038', style: 'mess', shirt: '#f5f5fa', pants: '#5a6a80', shoes: '#111118', coat: 1, prop: 'mirror' }
};
function hair(c, dir, y, back) {
  const s = c.style, h = c.hair, sd = dir === 'left' ? -1 : dir === 'right' ? 1 : 0, bs = sd || -1;
  if (back) {
    if (s === 'long') el(50, y + 9, 23, 25, h);
    if (s === 'pony') { el(50 - bs * 19, y - 9, 7, 16, h, bs * .7); el(50 - bs * 27, y + 2, 5, 9, h, bs * .3); }
    if (s === 'bun') el(50, y - 20, 8, 7, h);
    if (c.spiky && dir !== 'up') for (const k of (sd ? [-sd] : [-1, 1])) pol([50 + k * 15, y + 8, 50 + k * 27, y + 6, 50 + k * 20, y + 1, 50 + k * 28, y - 4, 50 + k * 18, y - 6], h);
    return;
  }
  if (s === 'hood') return;
  const capClip = (yy, col, r) => { g.save(); g.beginPath(); g.rect(0, 0, 100, yy); g.clip(); el(50, y, r || 21, (r || 21) - 1, col); g.restore(); };
  if (dir === 'up') {
    if (s === 'mohawk' || s === 'buzz') el(50, y, 19.5, 18.5, tint(h, -.3)); else el(50, y, 21, 20, h);
    if (s === 'cap' || s === 'cop') { capClip(y + 1, c.cap, 21.5); rr(43, y - 3, 14, 5, 2, tint(c.cap, -.25)); if (c.spiky) pol([34, y + 12, 40, y + 22, 45, y + 14, 50, y + 24, 55, y + 14, 60, y + 22, 66, y + 12], h); }
    if (s === 'mohawk') pol([47, y + 10, 46, y - 23, 50, y - 30, 54, y - 23, 53, y + 10], h);
    if (s === 'long') el(50, y + 10, 22, 24, h);
    if (c.band) { g.save(); g.beginPath(); g.ellipse(50, y, 20, 19, 0, 0, 6.3); g.clip(); ln([20, y - 7, 80, y - 7], c.band, 5); g.restore(); }
    return;
  }
  if (sd && s !== 'buzz' && s !== 'mohawk') { g.save(); g.beginPath(); g.rect(sd > 0 ? 0 : 50, 0, 50, y + 12); g.clip(); el(50, y, 21, 20, h); g.restore(); }
  if (s === 'cap' || s === 'cop') {
    capClip(y - 5, c.cap, 21.5);
    if (sd) rr(sd > 0 ? 60 : 14, y - 11, 26, 7, 3, tint(c.cap, -.25)); else rr(29, y - 11, 42, 8, 4, tint(c.cap, -.25));
    if (s === 'cop') dot(50 + sd * 9, y - 15, 3.6, '#ffd23f'); else if (!sd) ln([44, y - 17, 50, y - 20, 56, y - 17], tint(c.cap, .35), 2);
  } else if (s === 'buzz') capClip(y - 10, h);
  else if (s === 'slick') capClip(y - 7, h);
  else if (s === 'mohawk') { capClip(y - 13, tint(h, -.25)); if (sd) pol([35, y - 13, 39, y - 25, 50, y - 31, 61, y - 26, 66, y - 14], h); else pol([43, y - 12, 44, y - 27, 50, y - 32, 56, y - 27, 57, y - 12], h); }
  else if (s === 'mess') pol([33, y - 10, 36, y - 23, 43, y - 14, 48, y - 27, 55, y - 14, 62, y - 24, 67, y - 10], h);
  else { pol([30, y - 5, 37, y + 2 - (sd ? 4 : 0), 43, y - 5, 50, y + 3 - (sd ? 5 : 0), 57, y - 5, 63, y + 2 - (sd ? 4 : 0), 70, y - 5, 70, y - 11, 30, y - 11], h); capClip(y - 5, h); }
  if (c.streak) { g.save(); g.beginPath(); g.ellipse(50, y + 4, 23, 25, 0, 0, 6.3); g.clip(); ln([60 + sd * 2, y - 19, 66 + sd * 2, y - 6, 68 + sd * 2, y + 10], c.streak, 4); g.restore(); }
  if (c.band) { g.save(); g.beginPath(); g.ellipse(50, y, 20, 19, 0, 0, 6.3); g.clip(); ln([20, y - 8, 80, y - 8], c.band, 5); g.restore(); }
}
function human(c, dir, frame) {
  const z = c.z, bob = frame ? -1.2 : 0, sd = dir === 'left' ? -1 : dir === 'right' ? 1 : 0, up = dir === 'up', down = dir === 'down';
  const W0 = c.wide || 28, bw = sd ? Math.min(26, W0 * .78) : W0, bx = 50 - bw / 2, HY = 28 + bob, ty = 46 + bob;
  const armC = c.jacket || c.shirt, handC = c.gloves || c.skin, sw = frame === 1 ? 6 : frame === 2 ? -6 : 0;
  g.save(); if (z) { g.translate(50, 94); g.rotate(.13); g.translate(-50, -94); }
  hair(c, dir, HY, true);
  if (c.pack && sd) rr(sd > 0 ? bx - 7 : bx + bw - 3, ty + 3, 10, 22, 4, c.pack);
  if (c.scarf && !up) { const sx = sd ? 50 - sd * 9 : 59, k = sd ? -sd : 1, fl = frame ? 4 : 0; pol([sx, ty, sx + k * 17, ty + 7 + fl, sx + k * 12, ty + 12 + fl, sx + k * 19, ty + 19 + fl, sx + k * 4, ty + 9], c.scarf); }
  // legs + chunky sneakers
  const legs = sd ? [[45.5 - sw * sd, 0], [45.5 + sw * sd, 0]] : [[50 - bw * .27 - 4.5, frame === 1 ? 4 : 0], [50 + bw * .27 - 4.5, frame === 2 ? 4 : 0]];
  for (const [lx, lift] of legs) { rr(lx, 70, 9, 20 - lift, 3, c.pants); const fxo = lx - 2 + sd * 1.5; rr(fxo, 87 - lift, 13, 8, 3.5, c.shoes); ln([fxo + 1.5, 93.6 - lift, fxo + 11.5, 93.6 - lift], '#ffffff', 1.6); }
  if (c.prop === 'scooter') { ln([50, 96, 50, 52], '#8a93a0', 4); ln([40, 52, 60, 52], '#3a3a44', 4.5); el(50, 95, 9, 5, '#2a2430'); }
  if (!sd && !z) for (const s of [-1, 1]) { el(50 + s * (bw / 2 + 2.5), ty + 12, 5.2, 11, armC, -s * .12); el(50 + s * (bw / 2 + 3.6), ty + 24, 4.4, 4.4, handC); }
  if (c.pack && up) rr(38, ty + 1, 24, 25, 6, c.pack);
  // torso
  rr(bx, ty, bw, 28, 8, c.jacket || c.shirt);
  if (c.jacket && !up) {
    if (!sd) { g.save(); g.lineWidth = 2.4; pol([44, ty + 1, 56, ty + 1, 58, ty + 27.5, 42, ty + 27.5], c.shirt); g.restore(); if (c.emblem) { g.save(); g.lineWidth = 1.6; pol([51.5, ty + 5, 46, ty + 15, 50, ty + 15, 48, ty + 24, 55, ty + 12, 51, ty + 12], '#ffffff'); g.restore(); } pol([44, ty + 1, 40, ty + 1, 42, ty + 9], tint(c.jacket, .25)); pol([56, ty + 1, 60, ty + 1, 58, ty + 9], tint(c.jacket, .25)); }
    else rr(sd > 0 ? bx + bw - 8 : bx + 1, ty + 2, 7, 24, 3, c.shirt);
  }
  if (c.pack && down) { ln([bx + 4, ty + 1, bx + 6, ty + 22], c.pack, 3.4); ln([bx + bw - 4, ty + 1, bx + bw - 6, ty + 22], c.pack, 3.4); }
  if (c.num && !sd) { g.fillStyle = '#ffffff'; g.font = '900 15px "Lilita One","Arial Black",sans-serif'; g.textAlign = 'center'; g.textBaseline = 'middle'; g.fillText(c.num, 50, ty + 16); }
  if (c.pads) { if (sd) rr(50 - 9, ty - 4, 18, 11, 5, c.pads); else for (const s of [-1, 1]) { rr(50 + s * (bw / 2 - 1) - 9, ty - 4, 18, 11, 5, c.pads); dot(50 + s * (bw / 2 - 1), ty + 1.5, 1.5, '#5a6270'); } }
  if (c.belt && !up) { rr(bx - 1, ty + 20, bw + 2, 5, 2, c.belt, true); rr(bx + 1, ty + 19, 7, 8, 2, tint(c.belt, .25), true); rr(bx + bw - 8, ty + 19, 7, 8, 2, tint(c.belt, .25), true); dot(50, ty + 22.5, 2, '#ffd23f'); }
  if (c.belly) { el(50, ty + 22, bw * .36, 8, c.skin); dot(50, ty + 23, 1.4, OUT); }
  if (c.stripe && !up) ln([bx + 3, ty + 11, bx + bw - 3, ty + 11], c.stripe, 3.4);
  if (c.coat && !up) { ln([50, ty + 2, 50, ty + 27], '#c9c9d6', 2); pol([47, ty + 2, 53, ty + 2, 51.5, ty + 16, 48.5, ty + 16], '#d6453a'); }
  if (c.bow && down) { rr(44, ty + 2, 12, 20, 3, '#f4f4f8', true); pol([44, ty + 2, 50, ty + 5, 44, ty + 8], '#d6453a'); pol([56, ty + 2, 50, ty + 5, 56, ty + 8], '#d6453a'); }
  if (c.prop === 'whistle' && down) { ln([42, ty + 2, 50, ty + 12, 58, ty + 2], '#3a3a44', 1.8); dot(50, ty + 13, 3.2, '#ffd23f'); }
  if (c.style === 'cop' && down) dot(bx + 8, ty + 8, 3, '#ffd23f');
  if (z && !up) { dot(bx + bw * .64, ty + 12, 3.4, '#8f1020', .75); ln([bx + 5, ty + 5, bx + 9, ty + 13, bx + 6, ty + 18], tint(c.shirt, -.45), 2); g.save(); g.lineWidth = 2; for (let i = 0; i < 3; i++) pol([bx + 4 + i * (bw - 8) / 3, ty + 27, bx + 4 + (i + .5) * (bw - 8) / 3, ty + 33, bx + 4 + (i + 1) * (bw - 8) / 3, ty + 27], c.shirt); g.restore(); }
  // arms in front
  if (z && down) for (const s of [-1, 1]) { el(50 + s * (bw / 2 + 1), ty + 14, 5.6, 12, armC, -s * .5); el(50 + s * (bw / 2 + 7), ty + 25, 5, 5, c.skin); }
  if (z && up) for (const s of [-1, 1]) el(50 + s * (bw / 2 + 2), ty + 10, 5.2, 10, armC, -s * .15);
  if (sd) { if (z) { rr(sd > 0 ? 50 : 24, ty + 7, 26, 9, 4.5, armC); el(sd > 0 ? 78 : 22, ty + 11.5, 5, 5, c.skin); } else { el(50 + sw * sd * .9, ty + 12, 5.2, 11, armC, -sw * .05 * sd); el(50 + sw * sd * 1.5, ty + 24, 4.4, 4.4, handC); } }
  if (c.scarf) rr(39, ty - 4, 22, 8, 4, c.scarf);
  // head
  if (c.style === 'hood') { el(50, HY, 22, 21, c.hair); if (!up) { rr(sd ? (sd > 0 ? 47 : 27) : 34, HY - 8, sd ? 26 : 32, 17, 7, '#1f3a4a', true); for (const k of [-6, 6]) { glow(50 + sd * 9 + k, HY, 8, '#7ff4ff', .9); dot(50 + sd * 9 + k, HY, 2.4, '#c8ffff'); } } }
  else {
    el(50, HY, 19, 18, c.skin);
    if (!up) {
      g.save(); g.beginPath(); g.ellipse(50, HY, 18.4, 17.4, 0, 0, 6.3); g.clip();
      const fx = 50 + sd * 7.5, es = sd ? 6 : 7.5;
      if (z) {
        for (const s of [-1, 1]) { dot(fx + s * es, HY + 2, 7.6, '#2a1238', .6); glow(fx + s * es, HY + 2, 11, '#e6ff5a', .85); }
        eyes(fx, HY + 2, es, 4.6, { white: '#f6ff9a', iris: '#8a0f2a', pup: .26, big: 1, angry: 1 });
        g.save(); g.lineWidth = 2; el(fx, HY + 11.5, 6.6, 4.2, '#2e0a1c', 0, true); g.lineWidth = 1.1; for (const tx of [-4.6, -1.5, 1.6]) pol([fx + tx, HY + 8.2, fx + tx + 3, HY + 8.2, fx + tx + 1.5, HY + 11.4], '#fffbe6'); for (const tx of [-3, .2]) pol([fx + tx, HY + 14.8, fx + tx + 3, HY + 14.8, fx + tx + 1.5, HY + 12], '#fffbe6'); g.restore();
        ln([fx - 3.5, HY + 15.5, fx - 3.5, HY + 19], '#a0101e', 2);
        ln([fx - 12, HY - 8, fx - 5, HY - 6], tint(c.skin, -.35), 1.8); ln([fx - 9.5, HY - 10, fx - 8.5, HY - 5], tint(c.skin, -.35), 1.4); dot(fx + 10, HY + 8, 2.8, tint(c.skin, -.35), .7);
      } else {
        for (const s of [-1, 1]) { const ex = fx + s * es; g.save(); g.lineWidth = 2; el(ex, HY + 2.5, 4.3, 4.5, '#ffffff', 0, true); g.restore(); dot(ex + sd * 1.2, HY + 3, 3, c.eye || '#3a2a1a'); dot(ex + sd * 1.2, HY + 3, 1.5, '#15101c'); dot(ex - 1.1 + sd, HY + 1.4, 1.1, '#ffffff'); ln([ex + s * 5.8, HY - 3.8, ex - s * 4.6, HY - 1.2], OUT, 2.8); }
        arc(fx + 1.5, HY + 7.6, 4.2, .5, 2.2, OUT, 2.4); ln([fx + 5.2, HY + 9.4, fx + 6.6, HY + 7.6], OUT, 2.2);
        if (c.eyeblack) for (const s of [-1, 1]) ln([fx + s * es - 3.4, HY + 8.2, fx + s * es + 3.4, HY + 8.2], '#22202c', 2.6);
        if (c.bandage) { g.save(); g.lineWidth = 1.4; g.translate(fx, HY + 5.4); g.rotate(-.2); rr(-5, -1.8, 10, 3.6, 1.6, '#fff3e0', true); g.restore(); }
      }
      g.restore();
    }
  }
  hair(c, dir, HY, false);
  if (c.goggles) { g.save(); g.beginPath(); g.ellipse(50, HY, 20.5, 19.5, 0, 0, 6.3); g.clip(); ln([24, HY - 10, 76, HY - 10], '#3a2a1a', 4); g.restore(); if (!up) for (const s of (sd ? [0] : [-1, 1])) { const gx = 50 + sd * 11 + s * 7; g.save(); g.lineWidth = 2.6; el(gx, HY - 10.5, 6, 5, '#8fe0ff', 0, true); g.restore(); ln([gx - 3, HY - 9, gx + 1, HY - 13], '#ffffff', 1.6); } }
  if (c.prop === 'wrench' && down) { ln([bx + bw + 6, ty + 30, bx + bw + 10, ty + 6], '#aab4c2', 4.4); arc(bx + bw + 10.5, ty + 2, 4.6, 2.2, 7.2, '#aab4c2', 3.6); }
  if (c.prop === 'mirror' && !up) { ln([31, HY - 10, 69, HY - 10], '#5a6a80', 3); el(50 + sd * 8, HY - 12, 5.4, 5.4, '#dfe6ee'); }
  if (c.prop === 'ladle' && down) { ln([86, 42, 86, 72], '#8a93a0', 3.5); el(86, 38, 7, 6, '#aab4c2'); }
  if (c.prop === 'tray' && down) { el(86, 52, 13, 4, '#dfe6ee'); g.beginPath(); g.ellipse(86, 50, 9, 8, 0, Math.PI, 0); g.fillStyle = '#c9d2de'; g.fill(); g.stroke(); dot(86, 41, 2, '#dfe6ee'); }
  g.restore();
}

// ------------------------------------------------------------ objects
const OB = {
  nest() { ln([30, 96, 36, 54], '#7a5230', 5); ln([70, 96, 64, 54], '#7a5230', 5); ln([32, 84, 68, 70], '#7a5230', 3.5); ln([68, 84, 32, 70], '#7a5230', 3.5); ln([50, 96, 50, 60], '#9a7248', 3); for (let y = 66; y < 96; y += 7) ln([46, y, 54, y], '#9a7248', 2.4); rr(22, 22, 56, 36, 8, '#8fc7e8'); ln([22, 32, 78, 32], '#5a96bc', 2.6); ln([22, 48, 78, 48], '#5a96bc', 2.6); glow(50, 42, 16, '#ffe9a0', .8); rr(43, 36, 14, 14, 3, '#ffe9a0', true); ln([50, 36, 50, 50], OUT, 1.6); pol([16, 24, 50, 2, 84, 24], '#e5483d'); ln([50, 2, 50, -6], '#7a5230', 2.4); pol([50, -6, 62, -2, 50, 2], '#ffd23f'); shine(32, 30, 4, 7); },
  tower() { ln([22, 98, 46, 14], '#aab4c2', 4.5); ln([78, 98, 54, 14], '#aab4c2', 4.5); for (const [y, w] of [[84, 24], [66, 19], [48, 14], [32, 9]]) { ln([50 - w, y, 50 + w, y], '#8a93a0', 3); ln([50 - w, y, 50 + w * .8, y - 16], '#8a93a0', 2); } ln([50, 14, 50, 0], '#aab4c2', 3.5); glow(50, 0, 16, '#ff3b30', 1); dot(50, 0, 4, '#ff5a4a'); el(66, 30, 9, 6, '#dfe6ee', -.5); },
  fire() { glow(50, 62, 46, '#ffb03a', .55); ln([28, 90, 72, 80], '#7a5230', 7); ln([72, 90, 28, 80], '#5a3a1e', 7); g.beginPath(); g.moveTo(50, 28); g.bezierCurveTo(70, 52, 76, 66, 66, 80); g.bezierCurveTo(58, 90, 42, 90, 34, 80); g.bezierCurveTo(24, 66, 38, 58, 40, 46); g.bezierCurveTo(46, 52, 48, 42, 50, 28); g.closePath(); g.fillStyle = '#ff7a2a'; g.fill(); g.stroke(); g.beginPath(); g.moveTo(52, 48); g.bezierCurveTo(62, 62, 64, 72, 58, 80); g.bezierCurveTo(52, 86, 44, 84, 42, 76); g.bezierCurveTo(40, 68, 48, 62, 52, 48); g.fillStyle = '#ffe14a'; g.fill(); dot(50, 76, 4, '#fff', .8); },
  stash() { rr(18, 48, 64, 42, 6, '#a8683a'); g.beginPath(); g.moveTo(18, 52); g.quadraticCurveTo(50, 20, 82, 52); g.closePath(); g.fillStyle = grad(50, 40, 34, '#c07c44'); g.fill(); g.stroke(); ln([18, 52, 82, 52], OUT, 3); rr(30, 34, 8, 56, 2, '#ffcb3d', true); rr(62, 34, 8, 56, 2, '#ffcb3d', true); el(50, 58, 11, 10, '#ff9ab8'); arc(47, 57, 4, 3.4, 6, '#d8587a', 1.8); arc(53, 59, 4, 0, 3, '#d8587a', 1.8); glow(50, 58, 20, '#ff9ab8', .4); },
  comic() { g.save(); g.translate(50, 60); g.rotate(-.18); rr(-24, -32, 48, 62, 4, '#f4f4f8', true); rr(-20, -28, 40, 36, 2, '#e5483d', true); pol([0, -24, 5, -14, 16, -14, 7, -7, 11, 4, 0, -3, -11, 4, -7, -7, -16, -14, -5, -14], '#ffd23f'); rr(-20, 12, 40, 14, 2, '#3f7ee8', true); ln([-14, 19, 14, 19], '#fff', 2.4); g.restore(); glow(50, 56, 40, '#fff59a', .3); },
  sign() { rr(46, 50, 8, 44, 2, '#7a5230'); rr(16, 22, 68, 36, 5, '#d9a866'); ln([26, 34, 74, 34], '#7a5230', 2.6); ln([26, 44, 62, 44], '#7a5230', 2.6); dot(22, 28, 1.8, '#7a5230'); dot(78, 28, 1.8, '#7a5230'); },
  wreck() { g.save(); g.translate(50, 62); g.rotate(-.08); el(-26, 28, 9, 9, '#2a2430'); el(26, 28, 9, 9, '#2a2430'); dot(-26, 28, 3.5, '#8a93a0'); dot(26, 28, 3.5, '#8a93a0'); rr(-44, -22, 88, 48, 9, '#f6b93b'); for (const x of [-36, -16, 4, 24]) rr(x, -14, 15, 16, 3, '#2c3e5c', true); ln([-44, 10, 44, 10], '#2a2430', 3.5); ln([-30, -10, -24, 0], '#8fd0ea', 1.6); dot(-40, 18, 3, '#fff3bf'); pol([30, -22, 36, -34, 40, -22], '#8a93a0'); g.restore(); },
  log() { el(50, 74, 44, 15, '#8a5f3a'); el(88, 74, 8, 14, '#d9a866', 0, true); arc(88, 74, 4, 0, 6.3, '#8a5f3a', 1.6); ln([20, 70, 40, 72], '#5a3a1e', 2.4); ln([50, 80, 66, 79], '#5a3a1e', 2.4); pol([30, 60, 22, 44, 36, 52], '#5cc25a'); pol([60, 60, 70, 46, 64, 60], '#5cc25a'); el(46, 62, 6, 4, '#e8503f'); },
  gate() { for (let x = 10; x <= 90; x += 16) { ln([x, 96, x, 20], '#2a2636', 5); pol([x - 5, 22, x, 8, x + 5, 22], '#3a3550'); } ln([6, 34, 94, 34], '#2a2636', 5); ln([6, 82, 94, 82], '#2a2636', 5); rr(42, 52, 16, 14, 3, '#ffcb3d'); },
  shutter() { rr(4, 6, 92, 90, 4, '#9aa3b0'); for (let y = 16; y < 94; y += 10) ln([6, y, 94, y], '#6d7887', 2.4); rr(40, 80, 20, 10, 2, '#e5483d'); },
  ferry() { el(50, 86, 48, 8, '#3b9bd6', 0, true); pol([4, 64, 96, 64, 84, 88, 16, 88], '#e5483d'); ln([6, 70, 94, 70], '#fff', 3); rr(22, 40, 56, 24, 5, '#f4f4f8'); for (const x of [28, 42, 56, 68]) rr(x, 46, 8, 9, 3, '#8fd0ea', true); rr(40, 22, 22, 18, 4, '#f4f4f8'); rr(56, 6, 9, 16, 2, '#3a3a44'); el(62, 0, 7, 5, '#dfe6ee', 0, true); },
  note() { glow(50, 60, 38, '#fff59a', .5); rr(22, 42, 56, 40, 4, '#fff6d8'); ln([22, 44, 50, 66, 78, 44], '#c8b88a', 2.6); g.beginPath(); g.moveTo(50, 70); g.bezierCurveTo(40, 60, 44, 54, 50, 60); g.bezierCurveTo(56, 54, 60, 60, 50, 70); g.fillStyle = '#e5483d'; g.fill(); },
  horn() { rr(46, 56, 8, 40, 2, '#7a5230'); pol([24, 44, 62, 34, 62, 58], '#ffcb3d'); el(64, 46, 9, 16, '#f2b020'); el(22, 44, 5, 6, '#b98c12'); arc(58, 62, 8, 0, 4, '#8a93a0', 3); },
  brain() { el(50, 54, 34, 28, '#ff9ab8'); ln([50, 28, 50, 80], '#d8587a', 2.6); arc(36, 44, 9, 3.3, 5.8, '#d8587a', 2.4); arc(34, 62, 9, .8, 3.6, '#d8587a', 2.4); arc(64, 44, 9, 3.6, 6.1, '#d8587a', 2.4); arc(66, 62, 9, 5.8, 8.6, '#d8587a', 2.4); shine(36, 40, 7, 10); },
  barricade() { rr(8, 58, 84, 12, 3, '#d9a866'); rr(14, 70, 7, 24, 2, '#7a5230'); rr(79, 70, 7, 24, 2, '#7a5230'); g.save(); g.translate(50, 44); g.rotate(-.2); rr(-34, -8, 68, 12, 3, '#c98f5a'); rr(-28, 4, 6, 18, 2, '#7a5230'); rr(22, 4, 6, 18, 2, '#7a5230'); g.restore(); rr(30, 14, 30, 22, 4, '#8fc7e8'); ln([36, 20, 54, 30], '#fff', 2); ln([10, 94, 90, 60], '#b98a54', 6); },
  exitmat() { glow(50, 60, 46, '#9fffb0', .5); rr(14, 30, 72, 56, 8, '#3d9a54'); pol([50, 76, 30, 54, 42, 54, 42, 40, 58, 40, 58, 54, 70, 54], '#f4fff0'); }
};

// tall map props, authored in a w x h unit box anchored at bottom-centre
const shadow = (x, y, rx, ry) => { g.save(); g.globalAlpha = .22; g.beginPath(); g.ellipse(x, y, rx, ry, 0, 0, 6.3); g.fillStyle = '#000'; g.fill(); g.restore(); };
const PROPS = {
  tree0: [96, 124, () => { shadow(48, 116, 30, 8); rr(41, 78, 14, 40, 5, '#8a5f3a'); for (const [x, y, r, c] of [[30, 62, 23, '#2f9a4a'], [66, 62, 23, '#2f9a4a'], [48, 40, 30, '#3cb357'], [36, 34, 14, '#5fd06e'], [58, 28, 10, '#5fd06e']]) el(x, y, r, r * .92, c); }],
  tree1: [96, 124, () => { shadow(48, 116, 26, 7); rr(42, 90, 12, 28, 4, '#7a5230'); pol([14, 98, 48, 52, 82, 98], '#23804a'); pol([20, 74, 48, 30, 76, 74], '#2c9655'); pol([28, 50, 48, 8, 68, 50], '#3fb068'); ln([38, 36, 48, 20], '#7fe09a', 2.4); }],
  tree2: [96, 124, () => { shadow(48, 116, 30, 8); rr(40, 80, 16, 38, 5, '#8a5f3a'); el(48, 48, 34, 34, '#49b94a'); el(34, 38, 13, 12, '#7cdc6a', 0, true); dot(60, 56, 3.5, '#e5483d'); dot(40, 62, 3.5, '#e5483d'); dot(66, 36, 3.5, '#e5483d'); }],
  dead: [96, 124, () => { shadow(48, 116, 22, 6); g.save(); g.lineWidth = 3; pol([40, 118, 44, 60, 30, 34, 36, 32, 48, 52, 50, 16, 56, 16, 56, 50, 70, 30, 76, 34, 58, 62, 58, 118], '#5a4a5a'); g.restore(); ln([30, 34, 18, 28], '#5a4a5a', 4); ln([70, 30, 84, 22], '#5a4a5a', 4); ln([50, 26, 40, 10], '#5a4a5a', 3.5); }],
  tuft: [48, 44, () => { for (const [x, h, c, b] of [[6, 24, '#3aa850', -4], [14, 34, '#56c860', 3], [24, 40, '#45b858', -2], [33, 33, '#6fdc78', 4], [42, 24, '#3aa850', -3], [19, 22, '#7fe48a', 2], [29, 20, '#56c860', -2]]) { g.save(); g.lineWidth = 1.6; g.strokeStyle = '#1f6a34'; g.beginPath(); g.moveTo(x - 5, 44); g.quadraticCurveTo(x + b, 44 - h * .6, x + b * 1.5, 44 - h); g.quadraticCurveTo(x + 3 + b, 44 - h * .5, x + 5, 44); g.closePath(); g.fillStyle = c; g.fill(); g.stroke(); g.restore(); } }],
  fence: [48, 44, () => { rr(-2, 16, 52, 6, 2, '#b98a54'); rr(-2, 30, 52, 6, 2, '#b98a54'); for (const x of [6, 22, 38]) { g.save(); g.lineWidth = 2.6; pol([x - 5, 44, x - 5, 10, x, 3, x + 5, 10, x + 5, 44], '#d9a866'); g.restore(); } }],
  ifence: [48, 50, () => { ln([-2, 16, 50, 16], '#2a2636', 4); ln([-2, 40, 50, 40], '#2a2636', 4); for (const x of [6, 18, 30, 42]) { ln([x, 50, x, 8], '#2a2636', 4); pol([x - 3.5, 10, x, 0, x + 3.5, 10], '#4a4466'); } }],
  grave: [48, 56, () => { shadow(24, 52, 18, 5); rr(9, 10, 30, 44, [15, 15, 3, 3], '#a9adc0'); ln([24, 20, 24, 36], '#6d7186', 3); ln([18, 26, 30, 26], '#6d7186', 3); ln([14, 44, 22, 44], '#6d7186', 2); el(12, 52, 7, 4, '#3cb357', 0, true); el(38, 53, 6, 3.5, '#3cb357', 0, true); }],
  rock: [48, 44, () => { shadow(24, 40, 20, 5); pol([6, 40, 4, 24, 14, 10, 30, 6, 42, 18, 44, 36, 36, 42], '#9a9bb0'); ln([14, 12, 22, 22, 18, 30], '#6d6e84', 2.2); shine(16, 18, 4, 6); }],
  car: [56, 50, () => { shadow(28, 46, 26, 5); const c = ['#d6453a', '#3f7ee8', '#8fb84a', '#9a9bb0'][PROPS.v || 0]; el(13, 42, 6, 6, '#2a2430'); el(43, 42, 6, 6, '#2a2430'); rr(2, 22, 52, 20, 7, c); rr(12, 8, 32, 18, [9, 9, 2, 2], c); rr(16, 12, 11, 11, 3, '#2c3e5c', true); rr(30, 12, 11, 11, 3, '#2c3e5c', true); ln([18, 14, 24, 21], '#8fd0ea', 1.6); dot(5, 30, 2.6, '#fff3bf'); ln([34, 26, 46, 34], tint(c, -.3), 2); }],
  junk: [56, 54, () => { shadow(28, 50, 26, 5); el(16, 40, 13, 9, '#2a2430'); el(16, 40, 5, 3.5, '#6d7887', 0, true); rr(24, 18, 24, 26, 3, '#b98a54'); ln([24, 30, 48, 30], '#7a5230', 2); rr(34, 34, 20, 14, 3, '#c0603a'); ln([6, 24, 22, 10], '#8a93a0', 5); el(40, 14, 7, 7, '#f2c230'); dot(40, 14, 2.6, OUT); }],
  desk: [48, 44, () => { shadow(24, 42, 20, 4); rr(8, 24, 5, 18, 1, '#7a5230'); rr(35, 24, 5, 18, 1, '#7a5230'); rr(3, 12, 42, 14, 4, '#d9a866'); rr(14, 8, 14, 8, 1.5, '#f4f4f8', true); ln([17, 12, 25, 12], '#9aa', 1.4); }],
  shelf: [48, 70, () => { shadow(24, 66, 22, 4); rr(2, 4, 44, 64, 3, '#8a5f3a'); for (const y of [10, 30, 50]) { rr(6, y, 36, 15, 1.5, '#4a3020', true); const cs = ['#e5483d', '#3f7ee8', '#48a05a', '#ffcb3d', '#8e6be8']; for (let i = 0; i < 6; i++) { g.save(); g.lineWidth = 1.4; rr(8 + i * 5.6, y + 2 + (i % 2), 5, 13 - (i % 2), 1, cs[(i + y) % 5], true); g.restore(); } } }],
  bed: [48, 60, () => { shadow(24, 56, 22, 4); rr(4, 8, 40, 50, 5, '#dfe6ee'); rr(8, 12, 32, 13, 5, '#ffffff', true); rr(4, 30, 40, 28, [2, 2, 5, 5], '#7fd6de'); ln([4, 36, 44, 36], '#5ab0b8', 2.4); }],
  plant: [48, 60, () => { shadow(24, 56, 16, 4); pol([14, 40, 34, 40, 31, 58, 17, 58], '#c0603a'); for (const [x, y, r, c] of [[14, 28, 10, '#2f9a4a'], [34, 28, 10, '#2f9a4a'], [24, 18, 13, '#49b94a'], [24, 34, 9, '#3cb357']]) el(x, y, r, r * 1.2, c, (x - 24) * .04); dot(28, 14, 3, '#ff7ab0'); }],
  counter: [48, 50, () => { rr(-1, 14, 50, 34, 2, '#7a5a70'); rr(-2, 6, 52, 12, 3, '#e9e3d3'); ln([8, 26, 8, 44], '#5a4058', 2); ln([24, 26, 24, 44], '#5a4058', 2); ln([40, 26, 40, 44], '#5a4058', 2); }],
  candle: [48, 70, () => { shadow(24, 66, 10, 3); glow(24, 14, 26, '#ffb03a', .8); rr(22, 30, 4, 34, 1, '#ffcb3d'); pol([14, 68, 34, 68, 28, 60, 20, 60], '#d9a520'); rr(20, 20, 8, 12, 2, '#fff6e6'); g.beginPath(); g.moveTo(24, 4); g.quadraticCurveTo(31, 14, 24, 20); g.quadraticCurveTo(17, 14, 24, 4); g.fillStyle = '#ffb03a'; g.fill(); g.stroke(); dot(24, 15, 2, '#fff59a'); }]
};

const Art = { cache: {} };
function whiten(src) { const c = mk(src.width, src.height), k = c.getContext('2d'); k.drawImage(src, 0, 0); k.globalCompositeOperation = 'source-in'; k.fillStyle = '#fff'; k.fillRect(0, 0, c.width, c.height); return c; }
function recolor(src, col) { const c = mk(src.width, src.height), k = c.getContext('2d'); k.drawImage(src, 0, 0); k.globalCompositeOperation = 'source-in'; k.fillStyle = col; k.fillRect(0, 0, c.width, c.height); return c; }
Art.silh = function (name) { const key = 'x:' + name; return this.cache[key] || (this.cache[key] = recolor(this.sprite(name), '#0c0820')); };
Art.sprite = function (name, flash) {
  const key = 's:' + name + (flash ? '!' : '');
  if (this.cache[key]) return this.cache[key];
  if (flash) return this.cache[key] = whiten(this.sprite(name));
  const c = begin(110, 110, 110); g.translate(5, 10);
  if (CR[name]) CR[name](); else if (HUM[name]) human(HUM[name], 'down', 0); else (OB[name] || OB.sign)();
  return this.cache[key] = c;
};
Art.human = function (name, dir, frame) {
  const key = 'h:' + name + dir + frame;
  if (this.cache[key]) return this.cache[key];
  const c = begin(110, 110, 110); g.translate(5, 10);
  human(HUM[name] || HUM.dex, dir, frame);
  return this.cache[key] = c;
};
Art.prop = function (name, v) {
  const key = 'p:' + name + (v || 0);
  if (this.cache[key]) return this.cache[key];
  const p = PROPS[name]; PROPS.v = v || 0;
  const c = begin(p[0], p[1], p[0]); p[2]();
  return this.cache[key] = { c, w: p[0], h: p[1] };
};

// ------------------------------------------------------------ ground (organic edges: rounded where terrain changes)
const GT = {
  road: { c: '#666a82', e: '#484b60', ew: 4, round: 1 }, walk: { c: '#d3cfe0', e: '#a7a3ba', ew: 3, round: 1 }, dirt: { c: '#e0b473', e: '#b98a4c', ew: 4, round: 1 },
  sand: { c: '#f5e3a8', e: '#dcc47c', ew: 3, round: 1 }, water: { c: '#57bdee', e: '#f4fbff', ew: 7, round: 1 }, plank: { c: '#c9905a' },
  floor: { c: '#ece6d6' }, grime: { c: '#9eaa90' }, wood: { c: '#c98f5a' }, carpet: { c: '#c8402f', e: '#f2c14e', ew: 5 }, grass: { c: '#7fd160' }
};
function groundBase(type, v, f, deco) {
  const r = mulberry32(v * 97 + type.length * 13 + 5), R = (c, x, y, w, h, rad) => { g.beginPath(); g.roundRect(x, y, w, h, rad || 0); g.fillStyle = c; g.fill(); };
  const blob = (c, n, a) => { for (let i = 0; i < n; i++) { g.save(); g.globalAlpha = a || 1; g.beginPath(); g.ellipse(8 + r() * 32, 8 + r() * 32, 3 + r() * 5, 2 + r() * 4, r() * 3, 0, 6.3); g.fillStyle = c; g.fill(); g.restore(); } };
  R(GT[type].c, -1, -1, 50, 50);
  if (type === 'grass') { blob('#72c655', 2, .8); blob('#8fdc6e', 2, .8); if (v % 3 === 0) for (let i = 0; i < 3; i++) { const x = 8 + r() * 32, y = 12 + r() * 30; ln([x, y, x - 2, y - 6], '#4fa84a', 1.8); ln([x + 3, y, x + 4, y - 5], '#4fa84a', 1.8); } if (deco) for (let i = 0; i < 4; i++) { const x = 8 + r() * 32, y = 8 + r() * 32, c = ['#ffd23f', '#ff7ab0', '#ffffff', '#ff9a3a'][(i + v) % 4]; for (let k = 0; k < 5; k++) dot(x + Math.cos(k * 1.26) * 3, y + Math.sin(k * 1.26) * 3, 2, c); dot(x, y, 1.6, '#ffb03a'); } }
  else if (type === 'road') { blob('#5c6078', 3, .7); if (v === 1) ln([14, 30, 24, 22, 30, 26], '#50536a', 1.6); }
  else if (type === 'walk') { ln([0, 47.5, 48, 47.5], '#b5b1c8', 1.5); ln([47.5, 0, 47.5, 48], '#b5b1c8', 1.5); blob('#dcd8e8', 1, .8); }
  else if (type === 'dirt') { blob('#d2a462', 3, .8); blob('#ecc68a', 2, .7); if (deco) { rr(8 + v * 3, 10, 9, 6, 2, '#8a93a0', true); el(32, 30 + v, 6, 4, '#c0603a', .4, true); ln([12, 36, 22, 40], '#6d7887', 3); dot(36, 12, 3, '#f2c230'); } }
  else if (type === 'sand') { blob('#e8d28e', 3, .8); dot(10 + v * 8, 30, 1.6, '#fff'); }
  else if (type === 'water') { blob('#6ccaf4', 2, .6); g.save(); g.globalAlpha = .7; ln([8 + v * 6 + f * 4, 14, 20 + v * 6 + f * 4, 14], '#c9eeff', 2.4); ln([22 - v * 3 - f * 4, 32, 36 - v * 3 - f * 4, 32], '#c9eeff', 2.4); g.restore(); }
  else if (type === 'plank') { for (let y = 0; y < 48; y += 12) { ln([0, y + 11.5, 48, y + 11.5], '#8a5a30', 2); dot(6 + (y * 7 + v * 9) % 30, y + 5, 1.2, '#8a5a30'); } ln([1, 0, 1, 48], '#7a4a26', 3); ln([47, 0, 47, 48], '#7a4a26', 3); }
  else if (type === 'floor') { R('#ddd6c2', 0, 0, 24, 24); R('#ddd6c2', 24, 24, 24, 24); g.save(); g.globalAlpha = .5; ln([0, 0, 48, 0], '#c2baa4', 1); ln([0, 0, 0, 48], '#c2baa4', 1); g.restore(); }
  else if (type === 'grime') { R('#919d83', 0, 0, 24, 24); R('#919d83', 24, 24, 24, 24); blob('#7fbf5a', 2, .35); blob('#6a7860', 2, .5); }
  else if (type === 'wood') { for (let y = 0; y < 48; y += 12) { ln([0, y + 11.5, 48, y + 11.5], '#9a6a3a', 1.8); ln([(y * 5 + v * 14) % 48, y, (y * 5 + v * 14) % 48, y + 12], '#9a6a3a', 1.8); } }
  else if (type === 'carpet') { g.save(); g.globalAlpha = .35; for (let i = 0; i < 2; i++) for (let j = 0; j < 2; j++) pol([12 + i * 24, 4 + j * 24, 20 + i * 24, 12 + j * 24, 12 + i * 24, 20 + j * 24, 4 + i * 24, 12 + j * 24], '#a82a20'); g.restore(); }
}
Art.ground = function (type, mask, v, f, under, deco) {
  const an = type === 'water' ? f : 0, key = 'g:' + type + mask + v + an + (under || '') + (deco ? 'd' : '');
  if (this.cache[key]) return this.cache[key];
  const ug = under && under !== type && (mask || type === 'water') ? Art.ground(under, 0, v, 0) : null;
  const c = begin(48, 48, 48), t = GT[type];
  if (ug) g.drawImage(ug, 0, 0, 48, 48);
  const N = mask & 1, E = mask & 2, S = mask & 4, Wd = mask & 8, rad = t.round ? 20 : 0;
  const rs = [Wd && N ? rad : 0, N && E ? rad : 0, E && S ? rad : 0, S && Wd ? rad : 0];
  g.save(); g.beginPath(); g.roundRect(0, 0, 48, 48, rs); g.clip();
  g.lineWidth = 2.4; groundBase(type, v, an, deco);
  if (t.e && mask) { g.beginPath(); g.roundRect(Wd ? 0 : -20, N ? 0 : -20, 48 + (Wd ? 0 : 20) + (E ? 0 : 20), 48 + (N ? 0 : 20) + (S ? 0 : 20), rs); g.strokeStyle = t.e; g.lineWidth = t.ew * 2; g.stroke(); if (type === 'water') { g.strokeStyle = '#d9b87a'; g.lineWidth = 5; g.stroke(); } }
  g.restore();
  return this.cache[key] = c;
};
Art.blood = function (v) {
  const key = 'b:' + v; if (this.cache[key]) return this.cache[key];
  const c = begin(48, 48, 48), r = mulberry32(v * 53 + 7), A = '#8f1020', D = '#4a0610', k = v >= 10 ? 5 : v % 5;
  g.strokeStyle = D; g.lineWidth = 1.5;
  const bl = (x, y, rx, ry, st) => { g.beginPath(); g.ellipse(x, y, rx, ry, r() * 3, 0, 6.3); g.fillStyle = A; g.fill(); if (st) g.stroke(); };
  if (k === 0) { bl(22, 26, 14, 9, 1); bl(30, 22, 9, 7, 1); bl(18, 30, 8, 5, 1); g.fillStyle = A; g.fillRect(14, 20, 20, 10); dot(18, 23, 2.4, '#d8405a', .7); }
  else if (k === 1) { bl(24, 24, 9, 8, 1); for (let i = 0; i < 11; i++) { const a = r() * 6.3, d = 12 + r() * 10; bl(24 + Math.cos(a) * d, 24 + Math.sin(a) * d, 1.5 + r() * 2.5, 1.2 + r() * 2); } dot(21, 22, 2, '#d8405a', .7); }
  else if (k === 2) { for (let i = 0; i < 9; i++) { g.globalAlpha = 1 - i * .09; bl(6 + i * 4.4, 30 - Math.sin(i * .5) * 8, 5 - i * .35, 3.2 - i * .2); } g.globalAlpha = 1; }
  else if (k === 3 || k === 5) { g.save(); g.translate(24, k === 5 ? 18 : 26); g.rotate((r() - .5) * .8); bl(0, 4, 7, 8); for (let i = 0; i < 4; i++) { g.save(); g.rotate(-.5 + i * .33); g.beginPath(); g.roundRect(-2, -15, 4, 12, 2); g.fillStyle = A; g.fill(); g.restore(); } g.save(); g.rotate(-1.2); g.beginPath(); g.roundRect(-2, -11, 4.4, 9, 2); g.fill(); g.restore(); g.restore(); if (k === 5) for (const [x, l] of [[18, 16], [25, 24], [30, 12]]) { g.beginPath(); g.roundRect(x, 24, 3, l, 1.5); g.fillStyle = A; g.fill(); dot(x + 1.5, 24 + l, 2.2, A); } }
  else { for (const [x, y] of [[12, 34], [22, 22], [30, 12]]) { g.save(); g.translate(x, y); g.rotate(.6); bl(0, 0, 3.4, 6); bl(0, -8, 2.6, 2.4); g.restore(); g.save(); g.translate(x + 10, y + 4); g.rotate(.6); bl(0, 0, 3.4, 6); bl(0, -8, 2.6, 2.4); g.restore(); } }
  return this.cache[key] = c;
};
Art.wall = function (face, v) {
  const key = 'w:' + face + v; if (this.cache[key]) return this.cache[key];
  const c = begin(48, 48, 48); g.lineWidth = 2;
  g.fillStyle = '#3a3152'; g.fillRect(-1, -1, 50, 50);
  if (face) { g.fillStyle = '#6a6088'; g.fillRect(-1, 16, 50, 34); for (let y = 16; y < 48; y += 11) { ln([0, y, 48, y], '#4a4266', 1.6); for (let x = ((y / 11 | 0) % 2 ? 12 : 0) + v * 3; x < 48; x += 24) ln([x, y, x, y + 11], '#4a4266', 1.6); } g.fillStyle = '#2a2240'; g.fillRect(-1, 44, 50, 6); ln([0, 16, 48, 16], '#8a80a8', 2); }
  else if (v === 1) dot(24, 24, 2, '#4a4266');
  return this.cache[key] = c;
};

// ------------------------------------------------------------ buildings (one drawing per building)
Art.building = function (b) {
  if (b.art) return b.art;
  const Wd = b.w * 48, Hh = b.h * 48, top = 64, c = begin(Wd + 24, Hh + top, Wd + 24); g.translate(12, top);
  const wallY = Hh - 96, doorX = b.door * 48;
  const win = (x, y, w, h, lit, board) => { rr(x - 3, y - 3, w + 6, h + 6, 4, '#f4f0e4', true); rr(x, y, w, h, 2, lit || '#3c5a80', true); if (!lit) { ln([x + 4, y + h - 5, x + w * .5, y + 4], '#8fb8e0', 2); } ln([x + w / 2, y, x + w / 2, y + h], OUT, 1.8); if (board) { g.save(); g.lineWidth = 2; rr(x - 5, y + 4, w + 10, 6, 1, '#b98a54', true); rr(x - 5, y + h - 12, w + 10, 6, 1, '#b98a54', true); g.restore(); } };
  shadow(Wd / 2, Hh + 2, Wd / 2 + 6, 9);
  if (b.roof === 'P') {
    rr(0, wallY - 30, Wd, 126, 4, '#55466e');
    for (let x = 0; x < Wd; x += 24) ln([x, wallY - 26, x, Hh - 6], '#463959', 1.4);
    for (const tx of [10, Wd - 106]) { rr(tx, wallY - 150, 96, 250, 4, '#5f4f7a'); pol([tx - 10, wallY - 148, tx + 48, wallY - 260, tx + 106, wallY - 148], '#3a2a52'); for (const wy of [wallY - 110, wallY - 30]) { glow(tx + 48, wy + 20, 40, '#c8ff9a', .5); g.beginPath(); g.roundRect(tx + 34, wy, 28, 44, [14, 14, 2, 2]); g.fillStyle = '#d6ffa8'; g.fill(); g.stroke(); ln([tx + 48, wy, tx + 48, wy + 44], OUT, 2); } }
    pol([-14, wallY - 26, 60, wallY - 180, Wd - 60, wallY - 180, Wd + 14, wallY - 26], '#3f2e58');
    for (let y = wallY - 150; y < wallY - 30; y += 26) ln([40, y, Wd - 40, y], '#2c1f40', 2);
    rr(Wd / 2 - 40, wallY - 300, 80, 150, 4, '#5f4f7a'); pol([Wd / 2 - 52, wallY - 298, Wd / 2, wallY - 370, Wd / 2 + 52, wallY - 298], '#3a2a52');
    g.beginPath(); g.roundRect(Wd / 2 - 24, wallY - 270, 48, 60, [24, 24, 2, 2]); g.fillStyle = '#1a1028'; g.fill(); g.stroke(); glow(Wd / 2, wallY - 236, 40, '#ffcb3d', .5); pol([Wd / 2 - 14, wallY - 224, Wd / 2 - 8, wallY - 252, Wd / 2 + 8, wallY - 252, Wd / 2 + 14, wallY - 224], '#ffcb3d');
    for (let x = 130; x < Wd - 130; x += 70) if (Math.abs(x + 18 - doorX - 24) > 60) { glow(x + 18, wallY + 20, 36, '#c8ff9a', .4); g.beginPath(); g.roundRect(x, wallY - 4, 36, 54, [18, 18, 2, 2]); g.fillStyle = '#d6ffa8'; g.fill(); g.stroke(); ln([x + 18, wallY - 4, x + 18, wallY + 50], OUT, 2); }
    g.beginPath(); g.roundRect(doorX - 6, Hh - 80, 60, 80, [30, 30, 0, 0]); g.fillStyle = '#241634'; g.fill(); g.stroke(); ln([doorX + 24, Hh - 80, doorX + 24, Hh], '#463959', 2.4); dot(doorX + 16, Hh - 36, 3, '#ffcb3d'); dot(doorX + 32, Hh - 36, 3, '#ffcb3d');
  } else if (b.roof === 'G') {
    const stone = b.label === 'CRYPT';
    rr(0, 0, Wd, Hh - 60, 8, stone ? '#9a9bb0' : '#9c9ab4'); rr(8, 8, Wd - 16, Hh - 84, 5, stone ? '#b4b5c8' : '#b3b1c8', true);
    if (!stone) { const r = mulberry32(b.x * 31 + b.y); for (let i = 0; i < Math.max(1, b.w * b.h / 12); i++) { const x = 24 + r() * (Wd - 90), y = 20 + r() * Math.max(10, Hh - 190); rr(x, y, 40, 28, 4, '#7d7b96'); for (let k = 0; k < 3; k++) ln([x + 8 + k * 12, y + 6, x + 8 + k * 12, y + 22], '#5c5a74', 2.4); } }
    rr(0, wallY, Wd, 96, 4, stone ? '#a9adc0' : '#e3dfee');
    for (let y = wallY + 12; y < Hh; y += 14) ln([2, y, Wd - 2, y], stone ? '#8d91a6' : '#c9c4d8', 1.2);
    rr(-4, wallY - 8, Wd + 8, 14, 4, stone ? '#7d8196' : '#7d7b96');
    if (stone) { g.beginPath(); g.roundRect(doorX + 2, Hh - 70, 44, 70, [22, 22, 0, 0]); g.fillStyle = '#2a2240'; g.fill(); g.stroke(); ln([doorX + 24, wallY + 6, doorX + 24, wallY + 22], '#6d7186', 4); ln([doorX + 16, wallY + 12, doorX + 32, wallY + 12], '#6d7186', 4); }
    else {
      for (let x = 14; x + 60 < Wd; x += 84) if (x + 66 < doorX - 8 || x > doorX + 56) { rr(x, wallY + 24, 60, 50, 3, '#8fd0ea', true); ln([x + 8, wallY + 66, x + 30, wallY + 30], '#d6f2ff', 3); ln([x + 30, wallY + 24, x + 30, wallY + 74], OUT, 1.8); }
      rr(doorX - 2, Hh - 70, 52, 70, [4, 4, 0, 0], '#6fb8d8', true); ln([doorX + 24, Hh - 70, doorX + 24, Hh], OUT, 2.4);
      for (let i = 0; i < 5; i++) { g.save(); g.lineWidth = 2; pol([doorX - 12 + i * 14.5, Hh - 84, doorX + 2.5 + i * 14.5, Hh - 84, doorX + 2.5 + i * 14.5, Hh - 70, doorX - 12 + i * 14.5, Hh - 70], i % 2 ? '#ffffff' : (b.col || '#e5483d')); g.restore(); }
      if (b.label) { g.font = '900 30px "Lilita One","Arial Rounded MT Bold",sans-serif'; const tw = Math.min(Wd - 40, g.measureText(b.label).width + 36), sx = clamp(doorX + 24 - tw / 2, 10, Wd - tw - 10); rr(sx, wallY - 40, tw, 40, 8, b.col || '#e5483d'); g.fillStyle = '#fff'; g.textAlign = 'center'; g.textBaseline = 'middle'; g.fillText(b.label, sx + tw / 2, wallY - 19, tw - 16); }
    }
  } else {
    const rc = b.roof === 'B' ? '#4a78c8' : '#d65545', wc = b.roof === 'B' ? '#f6ecd6' : '#fbe9c6';
    rr(6, wallY - 8, Wd - 12, 104, 5, wc);
    for (let y = wallY + 14; y < Hh - 6; y += 13) ln([9, y, Wd - 9, y], tint(wc, -.14), 1.3);
    rr(6, Hh - 12, Wd - 12, 12, 2, '#b9a88a', true);
    for (let i = 0; i < b.w; i++) if (i !== b.door && (i % 2 === 1 || b.w < 5)) win(i * 48 + 11, wallY + 22, 26, 30, (b.x + i) % 5 === 0 ? '#ffe9a0' : null, (b.x * 3 + i) % 7 === 0);
    if ((b.x * 7 + b.y) % 6 === 0) { const hx = doorX + (b.door < b.w / 2 ? 62 : -30), hy = Hh - 52; g.fillStyle = '#8f1020'; g.beginPath(); g.ellipse(hx, hy, 8, 10, 0, 0, 6.3); g.fill(); for (let k = 0; k < 4; k++) { g.beginPath(); g.roundRect(hx - 8 + k * 4.6, hy - 22, 3.6, 14, 2); g.fill(); } g.beginPath(); g.roundRect(hx - 2, hy + 6, 3, 30, 1.5); g.fill(); g.beginPath(); g.roundRect(hx + 4, hy + 6, 3, 16, 1.5); g.fill(); }
    rr(doorX + 8, Hh - 62, 32, 62, [14, 14, 0, 0], '#9a5f38'); dot(doorX + 33, Hh - 30, 2.6, '#ffcb3d'); rr(doorX + 2, Hh - 5, 44, 6, 2, '#a7a3ba', true);
    rr(Wd - 70, -34, 22, 50, 3, '#b0584a');
    pol([-10, wallY - 2, 26, -22, Wd - 26, -22, Wd + 10, wallY - 2], rc);
    g.save(); g.beginPath(); g.moveTo(-10, wallY - 2); g.lineTo(26, -22); g.lineTo(Wd - 26, -22); g.lineTo(Wd + 10, wallY - 2); g.clip();
    for (let y = -6; y < wallY; y += 20) { ln([-12, y, Wd + 12, y], tint(rc, -.22), 2); for (let x = (y / 20 | 0) % 2 ? 0 : 18; x < Wd; x += 36) ln([x, y, x, y + 20], tint(rc, -.22), 1.6); }
    g.restore(); ln([26, -22, Wd - 26, -22], tint(rc, .3), 4);
  }
  return b.art = { c, w: Wd + 24, h: Hh + top };
};

// ------------------------------------------------------------ battle backdrops
Art.bg = function (type) {
  const key = 'bg:' + type; if (this.cache[key]) return this.cache[key];
  const c = mk(960 * 1.5, 720 * 1.5); g = c.getContext('2d'); g.scale(1.5, 1.5); g.lineJoin = 'round'; g.lineCap = 'round'; g.strokeStyle = OUT; g.lineWidth = 3;
  const sky = (a, b, c2) => { const q = g.createLinearGradient(0, 0, 0, 360); q.addColorStop(0, a); q.addColorStop(.7, b); q.addColorStop(1, c2 || b); g.fillStyle = q; g.fillRect(0, 0, 960, 380); };
  const hills = (y, amp, col, seed) => { g.beginPath(); g.moveTo(0, 400); for (let x = 0; x <= 960; x += 20) g.lineTo(x, y + Math.sin(x / 130 + seed) * amp + Math.sin(x / 47 + seed * 2) * amp * .3); g.lineTo(960, 400); g.closePath(); g.fillStyle = col; g.fill(); };
  const ground = (a, b) => { const q = g.createLinearGradient(0, 330, 0, 720); q.addColorStop(0, a); q.addColorStop(1, b); g.fillStyle = q; g.fillRect(0, 330, 960, 390); g.save(); g.globalAlpha = .12; g.fillStyle = '#000'; for (let i = 0; i < 8; i++) g.fillRect(0, 336 + i * i * 6, 960, 3 + i); g.restore();
    for (let i = 0; i < 2; i++) { const x = 40 + rb() * 880, y = 370 + rb() * 130, w = 14 + rb() * 20; g.save(); g.globalAlpha = .8; g.fillStyle = '#7a0c18'; g.beginPath(); g.ellipse(x, y, w, w * .3, 0, 0, 6.3); g.fill(); for (let k = 0; k < 6; k++) { g.beginPath(); g.ellipse(x + (rb() - .5) * w * 3.4, y + (rb() - .5) * w * .9, 2 + rb() * 5, 1 + rb() * 2, 0, 0, 6.3); g.fill(); } g.restore(); } };
  const r = mulberry32(type.length * 77 + 3), rb = mulberry32(type.length * 19 + 11);
  const stars = n => { for (let i = 0; i < n; i++) dot(r() * 960, r() * 230, r() * 1.6 + .4, '#fff', .6); };
  const moon = (x, y, s) => { glow(x, y, s * 3.6, '#ff4a3a', .55); dot(x, y, s, '#e8483a'); dot(x - s * .15, y - s * .12, s * .82, '#f2604a', .6); dot(x - s * .3, y - s * .25, s * .18, '#b8302a'); dot(x + s * .3, y + s * .3, s * .24, '#b8302a'); dot(x + s * .2, y - s * .4, s * .1, '#b8302a'); };
  const snag = (x, col) => { g.save(); g.strokeStyle = col; g.lineWidth = 7; g.beginPath(); g.moveTo(x, 342); g.lineTo(x + 4, 246); g.moveTo(x + 3, 290); g.lineTo(x - 28, 248); g.moveTo(x + 4, 270); g.lineTo(x + 32, 232); g.moveTo(x - 14, 268); g.lineTo(x - 22, 240); g.stroke(); g.restore(); };
  if (type === 'grass') {
    sky('#1d1848', '#6a3a78', '#e8875a'); stars(50); moon(190, 110, 52);
    hills(292, 26, '#3a2f5e', 1); hills(320, 18, '#241f44', 3);
    for (const [x, h, tl] of [[330, 74, -.07], [600, 96, .05], [860, 66, -.05]]) { g.save(); g.translate(x, 340); g.rotate(tl); g.fillStyle = '#15102a'; g.fillRect(-34, -h, 68, h); g.beginPath(); g.moveTo(-46, -h); g.lineTo(0, -h - 42); g.lineTo(46, -h); g.fill(); glow(8, -h * .58, 28, '#ffd76a', .8); g.fillStyle = '#ffd76a'; g.fillRect(2, -h * .72, 12, 16); g.restore(); }
    for (const x of [60, 250, 470, 720, 930]) snag(x + r() * 20, '#120e26');
    ground('#3a6a50', '#132824'); for (let i = 0; i < 40; i++) { const x = r() * 960, y = 350 + r() * 160; ln([x, y, x - 3, y - 9], '#1f4a3a', 2.4); ln([x + 4, y, x + 6, y - 8], '#1f4a3a', 2.4); }
    g.save(); g.globalAlpha = .1; g.fillStyle = '#c8d8ff'; for (let i = 0; i < 4; i++) { g.beginPath(); g.ellipse(r() * 960, 350 + i * 60, 300, 20, 0, 0, 6.3); g.fill(); } g.restore();
  } else if (type === 'street') {
    sky('#121030', '#3a2a5e', '#7a4a6a'); stars(40); moon(770, 100, 50);
    for (let i = 0; i < 16; i++) { const x = i * 62 - 10, h = 70 + r() * 150; g.fillStyle = i % 2 ? '#1c1a38' : '#24214a'; g.fillRect(x, 340 - h, 56, h); for (let wy = 350 - h; wy < 320; wy += 22) for (let wx = x + 8; wx < x + 48; wx += 16) { const k = r(); g.fillStyle = k < .1 ? '#ffe9a0' : k < .16 ? '#8dffa8' : '#0e0c22'; g.fillRect(wx, wy, 8, 10); } }
    ln([140, 344, 140, 150, 196, 150], '#0e0c22', 7); glow(196, 162, 110, '#fff0a0', .55); dot(196, 158, 7, '#fff7c0');
    ground('#4a4c66', '#1a1b2c'); g.fillStyle = '#6a6880'; g.fillRect(0, 330, 960, 16); g.save(); g.globalAlpha = .3; g.fillStyle = '#f4f0a0'; for (let x = 20; x < 960; x += 150) g.fillRect(x, 420, 80, 8); g.restore();
    for (let i = 0; i < 6; i++) { const x = 80 + r() * 800, y = 380 + r() * 200; ln([x, y, x + 20, y + 8, x + 28, y + 26, x + 50, y + 30], '#2a2b40', 2.4); }
  } else if (type === 'indoor') {
    const q = g.createLinearGradient(0, 0, 0, 340); q.addColorStop(0, '#12162a'); q.addColorStop(1, '#2c3a4a'); g.fillStyle = q; g.fillRect(0, 0, 960, 340);
    for (let x = 30, i = 0; x < 960; x += 74, i++) { rr(x, 120, 60, 200, 4, '#2f4a66'); ln([x + 12, 150, x + 48, 150], '#1c3048', 3); ln([x + 12, 162, x + 48, 162], '#1c3048', 3); dot(x + 48, 230, 4, '#8a96a8'); if (i % 4 === 2) { pol([x + 60, 120, x + 84, 132, x + 84, 328, x + 60, 320], '#1c3048'); glow(x + 30, 250, 34, '#e6ff5a', .5); dot(x + 22, 250, 3.4, '#f6ff9a'); dot(x + 38, 250, 3.4, '#f6ff9a'); } }
    glow(280, 60, 230, '#7dffa0', .32); rr(200, 34, 160, 16, 6, '#b8ffc8'); rr(560, 34, 160, 16, 6, '#3a4658'); ln([640, 50, 632, 76], '#3a4658', 3);
    for (let i = 0; i < 2; i++) { const x = 60 + r() * 840, y = 150 + r() * 120; g.fillStyle = '#8f1020'; g.beginPath(); g.ellipse(x, y, 9, 11, 0, 0, 6.3); g.fill(); for (let k = 0; k < 4; k++) { g.beginPath(); g.roundRect(x - 9 + k * 5, y - 24, 4, 15, 2); g.fill(); } g.beginPath(); g.roundRect(x - 3 + (i % 3) * 3, y + 8, 3, 20 + r() * 50, 1.5); g.fill(); }
    g.fillStyle = '#7fd05a'; for (let i = 0; i < 9; i++) { const x = 40 + r() * 880, h = 30 + r() * 80; g.beginPath(); g.roundRect(x, 0, 12 + r() * 10, h, [0, 0, 8, 8]); g.fill(); g.beginPath(); g.arc(x + 8, h + 12, 5, 0, 6.3); g.fill(); }
    for (let i = 0; i < 5; i++) { const x = 60 + r() * 840, y = 70 + r() * 60; ln([x, y, x + 14, y + 22, x + 6, y + 40, x + 24, y + 62], '#0e1220', 2.4); }
    g.fillStyle = '#1a2233'; g.fillRect(0, 318, 960, 14);
    ground('#8a8c80', '#2c2e2c'); g.save(); g.globalAlpha = .18; for (let i = 0; i < 14; i++) { g.beginPath(); g.moveTo(480 + (i - 7) * 70, 332); g.lineTo(480 + (i - 7) * 240, 720); g.strokeStyle = '#1a1c18'; g.lineWidth = 2; g.stroke(); } g.restore();
  } else if (type === 'spooky') {
    sky('#150f33', '#3a2a6b', '#5a4a8a'); for (let i = 0; i < 70; i++) dot(r() * 960, r() * 280, r() * 1.8 + .4, '#fff', .7);
    glow(760, 110, 240, '#ff4a3a', .55); dot(760, 110, 64, '#e8483a'); dot(750, 102, 52, '#f2604a', .6); dot(738, 92, 12, '#b8302a'); dot(782, 130, 16, '#b8302a'); dot(772, 84, 7, '#b8302a');
    hills(300, 22, '#2f2752', 2); hills(322, 14, '#241d40', 5);
    for (let i = 0; i < 7; i++) { const x = 50 + i * 140 + r() * 50; g.save(); g.strokeStyle = '#1a1430'; g.lineWidth = 7; g.beginPath(); g.moveTo(x, 340); g.lineTo(x + 4, 250); g.moveTo(x + 3, 290); g.lineTo(x - 26, 250); g.moveTo(x + 4, 270); g.lineTo(x + 30, 236); g.stroke(); g.restore(); }
    for (let i = 0; i < 8; i++) { const x = 30 + i * 124 + r() * 30; g.beginPath(); g.roundRect(x, 312, 26, 30, [13, 13, 0, 0]); g.fillStyle = '#4a4470'; g.fill(); }
    ground('#2f5a4a', '#16302a'); g.save(); g.globalAlpha = .12; g.fillStyle = '#c8d8ff'; for (let i = 0; i < 5; i++) { g.beginPath(); g.ellipse(r() * 960, 350 + i * 50, 300, 22, 0, 0, 6.3); g.fill(); } g.restore();
  } else if (type === 'junk') {
    sky('#241636', '#8a3a4a', '#f08a4a'); stars(30); glow(480, 330, 320, '#ffb070', .5);
    for (let i = 0; i < 8; i++) { const x = i * 130 + r() * 40, h = 60 + r() * 100; g.save(); g.lineWidth = 0; g.strokeStyle = 'rgba(0,0,0,0)'; pol([x - 80, 342, x - 30, 342 - h, x + 20, 342 - h * .8, x + 80, 342], i % 2 ? '#2a1c2c' : '#1f1524'); g.restore(); if (i % 3 === 1) { glow(x - 4, 340 - h * .45, 22, '#ffe14a', .7); dot(x - 10, 340 - h * .45, 3, '#fff59a'); dot(x + 2, 340 - h * .45, 3, '#fff59a'); } }
    ln([820, 342, 820, 110, 940, 150], '#1a1220', 9); ln([940, 150, 940, 210], '#1a1220', 3); dot(940, 216, 9, '#1a1220');
    ground('#8a6a4a', '#33241e'); for (let i = 0; i < 30; i++) dot(r() * 960, 350 + r() * 180, 2 + r() * 4, '#5a4230', .8);
  } else {
    const q = g.createLinearGradient(0, 0, 0, 340); q.addColorStop(0, '#120a20'); q.addColorStop(1, '#3a2850'); g.fillStyle = q; g.fillRect(0, 0, 960, 340);
    for (let y = 30; y < 330; y += 34) for (let x = (y / 34 | 0) % 2 ? 0 : 40; x < 960; x += 80) { g.strokeStyle = '#2a1c3c'; g.lineWidth = 2; g.strokeRect(x, y, 80, 34); }
    for (const x of [150, 440, 730]) { glow(x + 40, 170, 150, x === 440 ? '#ff7a8a' : '#9fd0ff', .45); g.beginPath(); g.roundRect(x, 80, 80, 200, [40, 40, 4, 4]); g.fillStyle = x === 440 ? '#c0405a' : '#4a78c8'; g.fill(); g.strokeStyle = OUT; g.lineWidth = 5; g.stroke(); ln([x + 40, 80, x + 40, 280], OUT, 3); ln([x, 170, x + 80, 170], OUT, 3); dot(x + 40, 130, 14, '#ffd23f', .8); }
    for (const x of [60, 330, 630, 900]) { rr(x - 22, 40, 44, 300, 6, '#4a3a62'); rr(x - 30, 30, 60, 22, 4, '#5f4f7a'); glow(x, 150, 60, '#ffb03a', .6); dot(x, 150, 5, '#ffe14a'); }
    ground('#7a2430', '#3a1018'); g.save(); g.globalAlpha = .5; g.fillStyle = '#c8402f'; g.beginPath(); g.moveTo(400, 332); g.lineTo(560, 332); g.lineTo(760, 720); g.lineTo(200, 720); g.fill(); g.restore();
  }
  return this.cache[key] = c;
};
