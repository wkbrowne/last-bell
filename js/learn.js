'use strict';
// BRAIN POWER: math + English questions aligned to the Common Core State Standards
// (the standards California adopted as CA CCSS and tests with CAASPP / Smarter Balanced).
// Math is generated fresh every time; English comes from hand-written item banks.
const shuffle = a => { for (let i = a.length - 1; i > 0; i--) { const j = Math.floor(Math.random() * (i + 1)); [a[i], a[j]] = [a[j], a[i]]; } return a; };
const coin = () => Math.random() < .5;
const fmt = n => Number(n).toLocaleString('en-US');
const gcd = (a, b) => b ? gcd(b, a % b) : Math.abs(a);
const lcm = (a, b) => a * b / gcd(a, b);
function fr(n, d) { const g = gcd(n, d); n /= g; d /= g; if (d === 1) return String(n); if (n > d) { const w = Math.floor(n / d); return `${w} ${n - w * d}/${d}`; } return `${n}/${d}`; }
const d2 = h => (h / 100).toFixed(2).replace(/\.?0+$/, '');
const num = x => String(parseFloat(Number(x).toFixed(5)));

// the value of a number, fraction or mixed number written as text (null for anything else)
const valOf = t => { t = String(t).replace(/,/g, '').trim(); let m;
  if ((m = t.match(/^(-?\d+) (\d+)\/(\d+)$/))) return +m[1] + m[2] / m[3];
  if ((m = t.match(/^(-?\d+)\/(\d+)$/))) return m[1] / m[2];
  return /^-?\d+(\.\d+)?$/.test(t) ? +t : null; };
function mc(q, ans, wrongs, why, extra) {
  ans = String(ans);
  const opts = [ans], av = valOf(ans), same = w => { const v = valOf(w); return av !== null && v !== null && Math.abs(v - av) < 1e-9; };
  for (const w of shuffle(wrongs.map(String))) if (!opts.includes(w) && !same(w) && opts.length < 4) opts.push(w);
  const n = Number(ans.replace(/,/g, ''));
  for (let k = 1; opts.length < 4 && k < 30; k++) {
    const v = n + k * (k % 2 ? 1 : -1) * 2;
    const w = isNaN(n) || /[ /R]/.test(ans) ? ['none of these', 'not enough information', 'all of these'][k - 1] : (n >= 0 && v < 0 ? null : ans.includes(',') ? fmt(v) : num(v));
    if (w && !opts.includes(w)) opts.push(w);
  }
  shuffle(opts);
  return Object.assign({ q, choices: opts, a: opts.indexOf(ans), why }, extra || {});
}
// "Select ALL / Select TWO" items, scored all-or-nothing like the real tests.
function ms(q, corr, wrong, why) {
  corr = [...new Set(corr.map(String))]; wrong = [...new Set(wrong.map(String))].filter(w => !corr.includes(w));
  const opts = shuffle(corr.concat(wrong));
  return { q, choices: opts, as: corr.map(c => opts.indexOf(c)), type: 'multi', why, small: opts.some(o => o.length > 30) };
}
const band = (items, g) => { const p = items.filter(i => i.g <= g && i.g >= g - 1); return p.length >= 3 ? p : items.filter(i => i.g <= g); };

// ============================================================ MATH
const MATH = {
  addsub: { n: 'Add & Subtract', std: '2.OA.2 · 2.NBT.5 · 3.NBT.2 · 4.NBT.4', g: [2, 4], gen(g) {
    if (g <= 2) {
      const t = rint(0, 6);
      if (t === 4) { const b = rint(110, 299), a = rint(b + 15, 680), add = coin(), A = add ? a + b : a - b; return mc(`${a} ${add ? '+' : '−'} ${b} = ?`, A, [A + 10, A - 10, A + 100, A - 100, A + 1].filter(x => x > 0), `Work one place at a time: hundreds, tens, then ones. ${a} ${add ? '+' : '−'} ${b} = ${A}.`); }
      if (t === 5) { const n = rint(120, 880), d = pick([10, 100]), more = coin(), A = more ? n + d : n - d; return mc(`What is ${d} ${more ? 'more' : 'less'} than ${n}?`, A, [more ? n - d : n + d, more ? n + d * (d === 10 ? 10 : .1) : n - d * (d === 10 ? 10 : .1), n + (more ? 1 : -1), A + (d === 10 ? 100 : 10)].filter(x => x > 0 && x !== A), d === 10 && Math.floor(n / 10) % 10 === (more ? 9 : 0) ? (more ? `${n} already has 9 tens. One more ten makes 10 tens, and that is another hundred: ${A}.` : `${n} has no tens to take away, so trade 1 hundred for 10 tens. Then take one ten away: ${A}.`) : `Only the ${d === 10 ? 'tens' : 'hundreds'} digit changes. It goes ${more ? 'up' : 'down'} by one: ${A}.`); }
      if (t === 6) { const a = rint(11, 29), b = rint(11, 29), c = rint(11, 29), S = a + b + c; return mc(`${a} + ${b} + ${c} = ?`, S, [S + 10, S - 10, S + 1, a + b, S - 2], `Add the tens: ${a - a % 10} + ${b - b % 10} + ${c - c % 10} = ${S - a % 10 - b % 10 - c % 10}. Add the ones: ${a % 10} + ${b % 10} + ${c % 10} = ${a % 10 + b % 10 + c % 10}. Together: ${S}.`); }
      if (t === 0) { const a = rint(4, 9), b = rint(3, 9), s = a + b; return mc(`${a} + ${b} = ?`, s, [s + 1, s - 1, s + 2, s - 2, s + 10], s > 10 ? `Make a ten! ${a} needs ${10 - a} more to make 10. That leaves ${b - (10 - a)} more: 10 + ${b - (10 - a)} = ${s}.` : `Start at ${a} and count on ${b} more. You land on ${s}.`); }
      if (t === 1) { const s = rint(11, 18), b = rint(3, 9); return mc(`${s} − ${b} = ?`, s - b, [s - b + 1, s - b - 1, s - b + 2, s + b, s - b + 10].filter(x => x >= 0), `Think of it as adding: ${b} + ? = ${s}. Since ${b} + ${s - b} = ${s}, the answer is ${s - b}.`); }
      if (t === 2) { const a = rint(21, 68), b = rint(11, 29), s = a + b, ta = a - a % 10, tb = b - b % 10; return mc(coin() ? `${a} + ${b} = ?` : `Munch has ${a} snacks. He bakes ${b} more. How many snacks does he have now?`, s, [s + 10, s - 10, s + 1, s - 1, s + 9], `Add the tens: ${ta} + ${tb} = ${ta + tb}. Add the ones: ${a % 10} + ${b % 10} = ${a % 10 + b % 10}. Put them together: ${ta + tb} + ${a % 10 + b % 10} = ${s}.`); }
      const a = rint(45, 98), b = rint(12, a - 11), tb = b - b % 10; return mc(coin() ? `${a} − ${b} = ?` : `There are ${a} zombies in the park. ${b} of them fall asleep. How many are still awake?`, a - b, [a - b + 10, a - b - 10, a - b + 1, a - b - 1, a + b].filter(x => x >= 0), `Take away the tens first: ${a} − ${tb} = ${a - tb}. Then take away the ones: ${a - tb} − ${b % 10} = ${a - b}.`);
    }
    const big = g >= 4, a = rint(big ? 1200 : 120, big ? 8999 : 899), b = rint(big ? 300 : 100, big ? a - 100 : Math.min(a - 10, 499));
    if (coin()) { const s = a + b; return mc(coin() ? `${fmt(a)} + ${fmt(b)} = ?` : `Munch has ${fmt(a)} bottle caps. He finds ${fmt(b)} more. How many does he have now?`, fmt(s), [s + 10, s - 10, s + 100, s - 100, s + 1].map(fmt), `Line up the place values and add: ${fmt(a)} + ${fmt(b)} = ${fmt(s)}.`); }
    const s = a - b; return mc(coin() ? `${fmt(a)} − ${fmt(b)} = ?` : `There were ${fmt(a)} zombies downtown. ${fmt(b)} wandered off. How many are left?`, fmt(s), [s + 10, s - 10, s + 100, s - 100, a + b].filter(x => x > 0).map(fmt), `Line up the place values and subtract, regrouping when you need to: ${fmt(a)} − ${fmt(b)} = ${fmt(s)}.`);
  } },
  mult: { n: 'Multiplication', std: '3.OA.7 · 4.NBT.5 · 5.NBT.5', g: [3, 5], gen(g) {
    let a, b, why;
    if (g <= 3) { a = rint(2, 10); b = rint(2, 10); why = `${a} × ${b} means ${a} groups of ${b}. That makes ${a * b}.`; }
    else if (g === 4) { a = rint(12, 99); b = rint(3, 9); const t = Math.floor(a / 10) * 10, o = a % 10; why = `Break it apart: (${t} × ${b}) + (${o} × ${b}) = ${t * b} + ${o * b} = ${a * b}.`; }
    else { a = rint(12, 99); b = rint(11, 39); const t = Math.floor(b / 10) * 10, o = b % 10; why = `Break it apart: (${a} × ${t}) + (${a} × ${o}) = ${a * t} + ${a * o} = ${a * b}.`; }
    const s = a * b, q = g <= 3 && coin() ? `${a} zombies each drop ${b} pieces of scrap. How much scrap is that in all?` : `${a} × ${b} = ?`;
    return mc(q, fmt(s), [s + a, s - a, s + b, s - b, s + 10, a + b].filter(x => x > 0).map(fmt), why);
  } },
  div: { n: 'Division', std: '3.OA.7 · 4.NBT.6 · 5.NBT.6', g: [3, 5], gen(g) {
    if (g <= 3) { const b = rint(2, 10), q = rint(2, 10), a = b * q; return mc(coin() ? `${a} ÷ ${b} = ?` : `Dex shares ${a} gummy worms equally among ${b} critters. How many does each critter get?`, q, [q + 1, q - 1, q + 2, b, q + b].filter(x => x > 0), `Think: ${b} × ? = ${a}. Since ${b} × ${q} = ${a}, the answer is ${q}.`); }
    if (g === 4) { const b = rint(3, 9), q = rint(12, 99), r = rint(0, b - 1), a = b * q + r, A = r ? `${q} R${r}` : `${q}`;
      return mc(`${a} ÷ ${b} = ?`, A, [`${q + 1} R${r}`, `${q - 1} R${r || 1}`, `${q} R${r + 1}`, `${q + 10}`, `${q}`].filter(x => x !== A), `${b} × ${q} = ${b * q}. ${a} − ${b * q} = ${r}, so the answer is ${A}.`); }
    const b = rint(11, 25), q = rint(11, 60), a = b * q; return mc(`${fmt(a)} ÷ ${b} = ?`, q, [q + 1, q - 1, q + 10, q - 10, q + 2], `Check by multiplying: ${b} × ${q} = ${fmt(a)}.`);
  } },
  round: { n: 'Rounding', std: '3.NBT.1 · 4.NBT.3 · 5.NBT.4', g: [3, 5], gen(g) {
    if (g >= 5) { const h = rint(1011, 9989), tenth = coin(), x = (h / 1000).toFixed(3);
      const up = v => tenth ? (v / 10).toFixed(1) : (v / 100).toFixed(2), base = tenth ? Math.floor(h / 100) : Math.floor(h / 10), A = up(tenth ? Math.round(h / 100) : Math.round(h / 10));
      return mc(`Round ${x} to the nearest ${tenth ? 'tenth' : 'hundredth'}.`, A, [up(base), up(base + 1), tenth ? (Math.round(h / 10) / 100).toFixed(2) : (Math.round(h / 100) / 10).toFixed(1), String(Math.round(h / 1000))], `Look at the digit just to the right of the ${tenth ? 'tenths' : 'hundredths'} place. If it is 5 or more, round up. Otherwise, stay.`); }
    const n = g <= 3 ? rint(101, 989) : rint(1200, 98999), p = g <= 3 ? pick([10, 100]) : pick([100, 1000]), A = Math.round(n / p) * p, o = p === 10 ? 100 : p === 100 ? (g <= 3 ? 10 : 1000) : 100;
    return mc(`Round ${fmt(n)} to the nearest ${fmt(p)}.`, fmt(A), [Math.floor(n / p) * p, Math.ceil(n / p) * p, Math.round(n / o) * o, A + p, A - p].map(fmt), `Look at the digit to the right of the ${fmt(p)}s place. 5 or more? Round up. 4 or less? Round down. ${fmt(n)} rounds to ${fmt(A)}.`);
  } },
  place: { n: 'Place Value', std: '2.NBT.1 · 2.NBT.3 · 3.NBT.1 · 4.NBT.1 · 5.NBT.3', g: [2, 5], gen(g) {
    const ds = shuffle([1, 2, 3, 4, 5, 6, 7, 8, 9]);
    if (g <= 2) {
      const [h, t, o] = ds, n = h * 100 + t * 10 + o, k = rint(0, 3);
      if (k === 3) { const ON = ['', 'one', 'two', 'three', 'four', 'five', 'six', 'seven', 'eight', 'nine'], TN = ['', '', 'twenty', 'thirty', 'forty', 'fifty', 'sixty', 'seventy', 'eighty', 'ninety'], t2 = t < 2 ? t + 2 : t, n2 = h * 100 + t2 * 10 + o; return mc(`Which number is "${ON[h]} hundred ${TN[t2]}-${ON[o]}"?`, n2, [h * 100 + o * 10 + t2, h * 1000 + t2 * 10 + o, h * 100 + t2 + o, t2 * 100 + h * 10 + o], `${ON[h]} hundred is ${h * 100}, ${TN[t2]} is ${t2 * 10}, and ${ON[o]} is ${o}. Put them together: ${n2}.`); }
      if (k === 0) { const i = rint(0, 2), dg = [h, t, o][i], v = dg * [100, 10, 1][i]; return mc(`What is the value of the digit ${dg} in ${n}?`, v, [dg, dg * 10, dg * 100].filter(x => x !== v).concat([dg + 10]), `The ${dg} is in the ${['hundreds', 'tens', 'ones'][i]} place, so it is worth ${v}.`, i < 2 ? { tips: { [dg]: 'That is the digit itself. Which PLACE is it in, and what is it worth there?' } } : undefined); }
      if (k === 1) return mc(`Which one shows the number ${n}?`, `${h * 100} + ${t * 10} + ${o}`, [`${h * 10} + ${t * 10} + ${o}`, `${h * 100} + ${t} + ${o}`, `${h} + ${t} + ${o}`, `${h * 100} + ${o * 10} + ${t}`], `${n} has ${h} hundreds, ${t} tens, and ${o} ones. That is ${h * 100} + ${t * 10} + ${o}.`);
      return mc(`Which number has ${h} hundred${h > 1 ? 's' : ''}, ${t} ten${t > 1 ? 's' : ''}, and ${o} one${o > 1 ? 's' : ''}?`, n, [h * 100 + o * 10 + t, t * 100 + h * 10 + o, o * 100 + t * 10 + h, h + t + o], `Hundreds come first, then tens, then ones: ${h}, ${t}, ${o} makes ${n}.`);
    }
    if (g >= 5) { const [a, b, c, d] = ds, i = rint(0, 2), dg = [b, c, d][i], nm = ['tenths', 'hundredths', 'thousandths'];
      return mc(`In ${a}.${b}${c}${d}, what is the value of the digit ${dg}?`, `${dg} ${nm[i]}`, [`${dg} ${nm[(i + 1) % 3]}`, `${dg} ${nm[(i + 2) % 3]}`, `${dg} ones`, `${dg} tens`], `After the decimal point the places go: tenths, hundredths, thousandths. The ${dg} sits in the ${nm[i]} place.`); }
    const len = g <= 3 ? 4 : 6, dig = ds.slice(0, len), n = Number(dig.join('')), i = rint(0, len - 1), dg = dig[i], v = dg * Math.pow(10, len - 1 - i);
    const nm = ['ones', 'tens', 'hundreds', 'thousands', 'ten-thousands', 'hundred-thousands'][len - 1 - i];
    return mc(`What is the value of the digit ${dg} in ${fmt(n)}?`, fmt(v), [dg, dg * 10, dg * 100, dg * 1000, dg * 10000, dg * 100000].filter(x => x !== v).map(fmt), `The ${dg} is in the ${nm} place, so it is worth ${fmt(v)}.`);
  } },
  fraccmp: { n: 'Compare Fractions', std: '3.NF.3 · 4.NF.2', g: [3, 4], gen(g) {
    const t = rint(0, 2);
    if (t === 0) { const [n, d] = pick([[1, 2], [1, 3], [2, 3], [1, 4], [3, 4], [2, 5], [3, 5], [1, 6]]), k = rint(2, 4);
      return mc(`Which fraction is equal to ${n}/${d}?`, `${n * k}/${d * k}`, [`${n * k + 1}/${d * k}`, `${n}/${d * k}`, `${n * k}/${d * k + 1}`, `${n + k}/${d + k}`], `Multiply the top AND bottom by the same number: ${n} × ${k} = ${n * k} and ${d} × ${k} = ${d * k}.`); }
    if (t === 1 || g <= 3) { if (coin()) { const d = rint(5, 12), ns = shuffle([...Array(d - 1)].map((_, i) => i + 1)).slice(0, 4), m = Math.max(...ns);
        return mc('Which fraction is the GREATEST?', `${m}/${d}`, ns.filter(x => x !== m).map(x => `${x}/${d}`), `The pieces are the same size (${d}ths), so more pieces means more. ${m}/${d} is the greatest.`); }
      const n = rint(1, 3), dd = shuffle([2, 3, 4, 5, 6, 8, 10, 12].filter(x => x > n)).slice(0, 4), m = Math.min(...dd);
      return mc('Which fraction is the GREATEST?', `${n}/${m}`, dd.filter(x => x !== m).map(x => `${n}/${x}`), `Same number of pieces, so bigger pieces win. A smaller bottom number means bigger pieces: ${n}/${m}.`); }
    const d = pick([5, 7, 8, 9, 10, 12]), n = rint(Math.floor(d / 2) + 1, d - 1), ws = shuffle([[1, 3], [1, 4], [2, 5], [1, 5], [3, 8], [2, 7], [1, 6], [4, 9]]).slice(0, 3).map(([a, b]) => `${a}/${b}`);
    return mc('Which fraction is GREATER than 1/2?', `${n}/${d}`, ws, `Half of ${d} is ${d / 2}. Since ${n} is more than ${d / 2}, the fraction ${n}/${d} is more than one half.`);
  } },
  fracadd: { n: 'Add & Subtract Fractions', std: '4.NF.3 · 5.NF.1', g: [4, 6], gen(g) {
    if (g <= 4) { const d = rint(5, 12), a = rint(2, d - 2), b = rint(1, Math.min(a - 1, d - 1 - a) || 1);
      if (coin() && a + b < d) return mc(`${a}/${d} + ${b}/${d} = ?`, `${a + b}/${d}`, [`${a + b}/${2 * d}`, `${a + b + 1}/${d}`, `${a - b}/${d}`, `${a * b}/${d}`], `The bottom number stays the same. Just add the tops: ${a} + ${b} = ${a + b}. So ${a + b}/${d}.`);
      return mc(`${a}/${d} − ${b}/${d} = ?`, `${a - b}/${d}`, [`${a - b}/${d - 1}`, `${a + b}/${d}`, `${a - b + 1}/${d}`, `${a - b}/${2 * d}`], `The bottom number stays the same. Subtract the tops: ${a} − ${b} = ${a - b}. So ${a - b}/${d}.`); }
    const [d1, d2] = pick([[2, 3], [2, 4], [3, 4], [2, 5], [3, 6], [4, 8], [2, 6], [3, 5], [4, 6], [2, 8]]), a = rint(1, d1 - 1), b = rint(1, d2 - 1), L = lcm(d1, d2), x = a * L / d1, y = b * L / d2;
    const sub = coin() && x !== y, hi = x >= y, n = sub ? Math.abs(x - y) : x + y;
    const q = sub ? (hi ? `${a}/${d1} − ${b}/${d2} = ?` : `${b}/${d2} − ${a}/${d1} = ?`) : `${a}/${d1} + ${b}/${d2} = ?`;
    return mc(q, fr(n, L), [`${a + b}/${d1 + d2}`, fr(n + 1, L), `${a + b}/${L}`, fr(n, L * 2), `${Math.abs(a - b) || 1}/${Math.abs(d1 - d2) || 1}`], `Find a common denominator (${L}): ${hi || !sub ? x : y}/${L} ${sub ? '−' : '+'} ${hi || !sub ? y : x}/${L} = ${n}/${L}${fr(n, L) !== `${n}/${L}` ? ', which simplifies to ' + fr(n, L) : ''}.`);
  } },
  fracmul: { n: 'Multiply & Divide Fractions', std: '5.NF.4 · 6.NS.1', g: [5, 6], gen(g) {
    const [a, b] = pick([[1, 2], [1, 3], [2, 3], [1, 4], [3, 4], [2, 5], [3, 5], [1, 6], [5, 6]]), [c, d] = pick([[1, 2], [1, 3], [2, 3], [1, 4], [3, 4], [1, 5], [4, 5]]);
    if (g >= 6 && coin()) return mc(`${a}/${b} ÷ ${c}/${d} = ?`, fr(a * d, b * c), [fr(a * c, b * d), fr(b * c, a * d), fr(a + d, b + c), fr(a * d + 1, b * c)], `Dividing by a fraction is the same as multiplying by its flip: ${a}/${b} × ${d}/${c} = ${a * d}/${b * c}${fr(a * d, b * c) !== `${a * d}/${b * c}` ? ' = ' + fr(a * d, b * c) : ''}.`);
    if (coin()) { const w = rint(2, 9); return mc(coin() ? `${a}/${b} × ${w} = ?` : `Priya's beacon uses ${a}/${b} of a battery each hour. How many batteries does it use in ${w} hours?`, fr(a * w, b), [fr(a * w, b * w), fr(a + w, b), fr(a, b * w), fr(a * w + 1, b)], `Multiply the top by the whole number: ${a} × ${w} = ${a * w}. Keep the bottom: ${a * w}/${b}${fr(a * w, b) !== `${a * w}/${b}` ? ' = ' + fr(a * w, b) : ''}.`); }
    return mc(`${a}/${b} × ${c}/${d} = ?`, fr(a * c, b * d), [fr(a * d, b * c), fr(a + c, b + d), fr(a * c, b + d), fr(a * c + 1, b * d)], `Multiply top × top and bottom × bottom: ${a * c}/${b * d}${fr(a * c, b * d) !== `${a * c}/${b * d}` ? ' = ' + fr(a * c, b * d) : ''}.`);
  } },
  decimals: { n: 'Decimals', std: '4.NF.7 · 5.NBT.7 · 6.NS.3', g: [4, 6], gen(g) {
    if (g <= 4) { const v = shuffle([...Array(98)].map((_, i) => i + 1)).slice(0, 2).concat(shuffle([10, 20, 30, 40, 50, 60, 70, 80, 90]).slice(0, 2)), uniq = [...new Set(v)]; while (uniq.length < 4) uniq.push(rint(1, 99) + 100);
      const big = coin(), m = big ? Math.max(...uniq) : Math.min(...uniq);
      return mc(`Which decimal is the ${big ? 'GREATEST' : 'LEAST'}?`, d2(m), uniq.filter(x => x !== m).map(d2), `Line up the decimal points. It helps to write them all with two places (0.4 is 0.40). Then compare like whole numbers.`); }
    if (g >= 6 && coin()) { const a = rint(11, 99), b = rint(2, 9), p = a * b; return mc(`${(a / 10).toFixed(1)} × 0.${b} = ?`, d2(p), [d2(p * 10), d2(p * 100), d2(p + 10), (p / 1000).toFixed(3)], `Multiply like whole numbers: ${a} × ${b} = ${p}. There are 2 decimal places in all, so the answer is ${d2(p)}.`); }
    const a = rint(105, 2999), b = rint(15, Math.min(999, a - 10));
    if (coin()) { const s = a + b; return mc(coin() ? `${d2(a)} + ${d2(b)} = ?` : `A Zap Cola costs $${(a / 100).toFixed(2)} and a snack costs $${(b / 100).toFixed(2)}. What is the total?`, d2(s), [s + 10, s - 10, s + 100, s + 1, s - 100].map(d2), `Line up the decimal points, then add: ${d2(a)} + ${d2(b)} = ${d2(s)}.`); }
    const s = a - b; return mc(`${d2(a)} − ${d2(b)} = ?`, d2(s), [s + 10, s - 10, s + 100, s + 1, a + b].map(d2), `Line up the decimal points, then subtract: ${d2(a)} − ${d2(b)} = ${d2(s)}.`);
  } },
  pow10: { n: 'Powers of Ten', std: '5.NBT.2', g: [5, 6], gen() {
    const x = rint(12, 999) / pick([10, 100]), k = rint(1, 3), p = Math.pow(10, k), mul = coin();
    const A = num(mul ? x * p : x / p);
    return mc(`${num(x)} ${mul ? '×' : '÷'} ${fmt(p)} = ?`, A, [num(mul ? x * p * 10 : x / p / 10), num(mul ? x * p / 10 : x / p * 10), num(mul ? x / p : x * p), num(mul ? x * p / 100 : x / p * 100)], `${mul ? 'Multiplying' : 'Dividing'} by ${fmt(p)} moves every digit ${k} place${k > 1 ? 's' : ''} to the ${mul ? 'left (the number gets bigger)' : 'right (the number gets smaller)'}.`);
  } },
  word: { n: 'Word Problems', std: '2.OA.1 · 2.MD.5 · 3.OA.8 · 4.OA.3 · 5.NF.6 · 6.RP.3', g: [2, 6], gen(g) {
    const t = rint(0, 2);
    if (g <= 2) {
      const k = rint(0, 4), a = rint(24, 60), b = rint(6, 19), c = rint(3, 9);
      if (k === 0) return mc(`Dex has ${a} gummy worms. He gives ${b} to his critters. How many gummy worms does he have left?`, a - b, [a + b, a - b + 10, a - b - 1, a - b + 1], `"Gives away" means subtract: ${a} − ${b} = ${a - b}.`, { tips: { [a + b]: 'That is what you get if you ADD. But he gives some away, so he ends up with fewer.' } });
      if (k === 1) return mc(`Priya finds ${a} bolts in the morning and ${b} more after lunch. How many bolts does she find in all?`, a + b, [a - b, a + b + 10, a + b - 1, a + b + 1], `"In all" means add: ${a} + ${b} = ${a + b}.`, { tips: { [a - b]: 'That is what you get if you TAKE AWAY. "In all" means put the two amounts together.' } });
      if (k === 2) return mc(`There are ${a} zombies on Elm Street. ${b} more shuffle in. Then ${c} fall asleep. How many zombies are still awake?`, a + b - c, [a + b + c, a + b, a - b - c, a + b - c + 1].filter(x => x > 0), `First add the new ones: ${a} + ${b} = ${a + b}. Then subtract the sleepers: ${a + b} − ${c} = ${a + b - c}.`);
      if (k === 3) return mc(`Bash has ${a} ferns. Wren has ${b} ferns. How many MORE ferns does Bash have than Wren?`, a - b, [a + b, a, a - b + 1, a - b - 10].filter(x => x > 0), `"How many more" means find the difference: ${a} − ${b} = ${a - b}.`, { tips: { [a + b]: 'That is how many they have TOGETHER. "How many more" asks how far apart the two numbers are.', [a]: 'That is just how many Bash has. How many MORE does he have than Wren?' } });
      return mc(`A rope is ${a} feet long. Dex cuts off ${b} feet. How long is the rope now?`, `${a - b} feet`, [a + b, a - b + 10, b, a - b - 2].filter(x => x > 0).map(x => x + ' feet'), `Cutting off a piece makes it shorter, so subtract: ${a} − ${b} = ${a - b} feet.`, { tips: { [`${a + b} feet`]: 'Cutting a piece off makes the rope SHORTER, not longer.', [`${b} feet`]: 'That is the piece he cut off. How long is the rope that is LEFT?' } });
    }
    if (g <= 3) {
      if (t === 0) { const p = rint(3, 9), n = rint(3, 8), paid = Math.ceil((p * n + 1) / 10) * 10 + pick([0, 10]); return mc(`Munch sells Critter Snacks for ${p} scrap each. Dex buys ${n} snacks and pays with ${paid} scrap. How much change does he get?`, paid - p * n, [p * n, paid - p - n, paid + p * n, paid - p * n + 10, paid - p * n - 1].filter(x => x >= 0), `First find the cost: ${n} × ${p} = ${p * n}. Then subtract from what he paid: ${paid} − ${p * n} = ${paid - p * n}.`); }
      if (t === 1) { const r = rint(3, 9), c = rint(4, 9), k = rint(2, 9); return mc(`Zombies stand in ${r} rows of ${c} on the football field. Then ${k} wander off. How many zombies are still on the field?`, r * c - k, [r * c, r * c + k, r + c - k, r * c - k - 1, r + c + k].filter(x => x > 0), `First multiply: ${r} × ${c} = ${r * c}. Then subtract the ones who left: ${r * c} − ${k} = ${r * c - k}.`); }
      const a = rint(12, 40), b = rint(12, 40), e = rint(2, 6), tot = (a + b) - (a + b) % e || e; const a2 = tot - b > 0 ? tot - b : a;
      return mc(`Bash picks ${a2} tomatoes on Monday and ${tot - a2} on Tuesday. He packs them into bags of ${e}. How many bags does he fill?`, tot / e, [tot, tot / e + 1, tot / e - 1, tot - e, a2 / 1 | 0].filter(x => x > 0), `Add first: ${a2} + ${tot - a2} = ${tot}. Then divide into bags: ${tot} ÷ ${e} = ${tot / e}.`);
    }
    if (g === 4) {
      if (t === 0) { const c = rint(4, 9), n = c * rint(4, 11) + rint(1, c - 1), w = Math.ceil(n / c); return mc(`${n} survivors need a ride. Each wagon holds ${c} people. What is the FEWEST number of wagons needed?`, w, [w - 1, w + 1, n % c, n - c], `${n} ÷ ${c} = ${w - 1} with ${n % c} left over. The leftover ${n % c === 1 ? 'person still needs' : 'people still need'} a wagon, so you need ${w}.`); }
      if (t === 1) { const r = rint(3, 8), c = rint(4, 9), k = rint(3, 9); return mc(`Bash plants ${r} rows of ${c} tomato plants. Each plant grows ${k} tomatoes. How many tomatoes grow in all?`, r * c * k, [r * c + k, r * c, (r + c) * k, r * c * k + c, r * c * k - r], `Plants: ${r} × ${c} = ${r * c}. Tomatoes: ${r * c} × ${k} = ${r * c * k}.`); }
      const each = rint(12, 35), n = rint(3, 6), have = rint(10, each * n - 5); return mc(`A radio part costs ${each} scrap. Priya needs ${n} parts and already has ${have} scrap. How much MORE scrap does she need?`, each * n - have, [each * n, each * n + have, each - have > 0 ? each - have : each + n, each * n - have + 10, each * n - have - 2].filter(x => x > 0), `Total cost: ${n} × ${each} = ${each * n}. Still needed: ${each * n} − ${have} = ${each * n - have}.`);
    }
    if (g === 5) {
      if (t === 0) { const c = pick([125, 150, 175, 225, 250, 275]), n = rint(3, 8); return mc(`A Zap Cola costs $${(c / 100).toFixed(2)}. Wren buys ${n} of them. How much does she spend?`, '$' + (c * n / 100).toFixed(2), [c * n + 100, c * n - 100, c * n + c, c + n * 100].map(x => '$' + (x / 100).toFixed(2)), `Multiply: ${n} × $${(c / 100).toFixed(2)} = $${(c * n / 100).toFixed(2)}.`); }
      if (t === 1) { const d = pick([2, 3, 4]), tot = d * rint(4, 12); return mc(`The crew finds ${tot} Juice Boxes. They drink 1/${d} of them on the first day. How many Juice Boxes are LEFT?`, tot - tot / d, [tot / d, tot - d, tot / d + 1, tot], `1/${d} of ${tot} is ${tot} ÷ ${d} = ${tot / d}. Left over: ${tot} − ${tot / d} = ${tot - tot / d}.`); }
      const l = rint(3, 9), w = rint(2, 6), h = rint(2, 5), k = rint(2, 4); return mc(`A supply crate is ${l} ft long, ${w} ft wide, and ${h} ft tall. What is the total volume of ${k} crates?`, `${l * w * h * k} cubic ft`, [l * w * h, (l + w + h) * k, l * w * k, l * w * h * k + l].map(x => x + ' cubic ft'), `One crate: ${l} × ${w} × ${h} = ${l * w * h}. ${k} crates: ${l * w * h} × ${k} = ${l * w * h * k} cubic feet.`);
    }
    if (t === 0) { const p = pick([10, 20, 25, 40, 50, 75]), z = pick([40, 60, 80, 120, 200]); return mc(`A horde has ${z} zombies. ${p}% of them are Sprinters. How many Sprinters are there?`, z * p / 100, [z - p, p, z * p / 10, z * p / 100 + 5, z / p | 0].filter(x => x > 0), `${p}% means ${p} out of 100. ${z} × ${p / 100} = ${z * p / 100}.`); }
    if (t === 1) { const r = rint(4, 9), s = rint(5, 12), s2 = s * rint(2, 4); return mc(`Wren runs ${r * s} meters in ${s} seconds. At that speed, how far does she run in ${s2} seconds?`, `${r * s2} m`, [r * s + s2, r * s2 + r, r * s, s * s2].map(x => x + ' m'), `Her speed is ${r * s} ÷ ${s} = ${r} meters per second. ${r} × ${s2} = ${r * s2} meters.`); }
    const a = rint(2, 5), b = rint(a + 1, 8), k = rint(3, 7); return mc(`Bash mixes plant food using ${a} scoops of powder for every ${b} cups of water. How many scoops does he need for ${b * k} cups of water?`, a * k, [a + k, b * k - a, a * b, a * k + a], `${b * k} cups is ${k} times the recipe (${b} × ${k}). So he needs ${a} × ${k} = ${a * k} scoops.`);
  } },
  area: { n: 'Area, Perimeter & Volume', std: '3.MD.7 · 4.MD.3 · 5.MD.5 · 6.G.1', g: [3, 6], gen(g) {
    if (g >= 6) { const b = rint(2, 9) * 2, h = rint(3, 12); return mc(`A triangular flag has a base of ${b} in. and a height of ${h} in. What is its area?`, `${b * h / 2} sq in.`, [b * h, b + h, b * h / 2 + b, b * h * 2].map(x => x + ' sq in.'), `Area of a triangle = ½ × base × height = ½ × ${b} × ${h} = ${b * h / 2}.`); }
    if (g === 5) { const l = rint(3, 9), w = rint(2, 8), h = rint(2, 7); return mc(`A crate is ${l} ft long, ${w} ft wide, and ${h} ft tall. What is its volume?`, `${l * w * h} cubic ft`, [l + w + h, l * w, 2 * (l * w + l * h + w * h), l * w * h + l * w].map(x => x + ' cubic ft'), `Volume = length × width × height = ${l} × ${w} × ${h} = ${l * w * h}.`); }
    const w = rint(3, 12), h = rint(2, 9);
    if (g === 4 && coin()) return mc(`Bash's garden is a rectangle with an area of ${w * h} square feet. One side is ${w} feet long. How long is the other side?`, `${h} ft`, [w * h - w, h + 1, h + w, w].filter(x => x !== h).map(x => x + ' ft'), `Area = length × width. So ${w} × ? = ${w * h}, and ${w * h} ÷ ${w} = ${h}.`);
    if (coin()) return mc(`A rectangle is ${w} units long and ${h} units wide. What is its AREA?`, `${w * h} square units`, [2 * (w + h), w + h, w * h + w, 2 * w * h].map(x => x + ' square units'), `Area = length × width = ${w} × ${h} = ${w * h} square units.`);
    return mc(`A rectangle is ${w} units long and ${h} units wide. What is its PERIMETER?`, `${2 * (w + h)} units`, [w * h, w + h, 2 * w + h, 4 * w].map(x => x + ' units'), `Perimeter is the distance all the way around: ${w} + ${h} + ${w} + ${h} = ${2 * (w + h)}.`);
  } },
  ooo: { n: 'Order of Operations', std: '5.OA.1 · 6.EE.1', g: [5, 6], gen(g) {
    const a = rint(2, 9), b = rint(2, 9), c = rint(2, 6), d = rint(1, 9), t = rint(0, g >= 6 ? 4 : 2);
    const why = 'Remember the order: parentheses first, then exponents, then × and ÷ (left to right), then + and − (left to right).';
    if (t === 0) return mc(`${a} + ${b} × ${c} = ?`, a + b * c, [(a + b) * c, a * b + c, a + b + c, a + b * c + 1], why + ` ${b} × ${c} = ${b * c}, then ${a} + ${b * c} = ${a + b * c}.`);
    if (t === 1) { const e = Math.min(d, 7); return mc(`(${a} + ${b}) × ${c} − ${e} = ?`, (a + b) * c - e, [a + b * c - e, (a + b) * (c - e), (a + b) * c + e, a + b * c + e].filter(x => x > 0 || g >= 6), why + ` (${a} + ${b}) = ${a + b}, then × ${c} = ${(a + b) * c}, then − ${e}.`); }
    if (t === 2) return mc(`${a * c} ÷ ${a} + ${b} × ${d} = ?`, c + b * d, [(c + b) * d, a * c / a + b + d, c * b + d, c + b * d + a], why + ` ${a * c} ÷ ${a} = ${c} and ${b} × ${d} = ${b * d}. Then ${c} + ${b * d} = ${c + b * d}.`);
    if (t === 3) { const s = a + 2; return mc(`${s}² − ${b} × ${c} = ?`, s * s - b * c, [(s * s - b) * c, s * 2 - b * c, s * s - b - c, s * s + b * c], why + ` ${s}² = ${s * s}, ${b} × ${c} = ${b * c}, so ${s * s} − ${b * c} = ${s * s - b * c}.`); }
    return mc(`2 × ${a}² = ?`, 2 * a * a, [4 * a * a, 4 * a, 2 * a * 2, a * a + 2], why + ` Do the exponent first: ${a}² = ${a * a}. Then 2 × ${a * a} = ${2 * a * a}.`);
  } },
  unknown: { n: 'Mystery Numbers & Patterns', std: '2.OA.1 · 2.NBT.2 · 3.OA.4 · 4.OA.5', g: [2, 4], gen(g) {
    if (g <= 2) {
      const a = rint(3, 12), b = rint(3, 9), t = rint(0, 2);
      if (t === 0) return mc(`? + ${a} = ${a + b}`, b, [b + 1, b - 1, a + b, b + 2, a], `Use the opposite: ${a + b} − ${a} = ${b}. Check it: ${b} + ${a} = ${a + b}.`);
      if (t === 1) return mc(`${a + b} − ? = ${a}`, b, [b + 1, b - 1, a + b, b + 2, a], `How far is it from ${a} up to ${a + b}? Count on: it is ${b}.`);
      const k = pick([2, 5, 10, 100]), st = k === 10 ? rint(11, 59) : k * rint(1, k === 100 ? 5 : 8); return mc(`Skip count! What number comes next?  ${st}, ${st + k}, ${st + 2 * k}, ${st + 3 * k}, ?`, st + 4 * k, [st + 4 * k + 1, st + 3 * k + 1, st + 5 * k, st + 4 * k - 1], `The numbers go up by ${k} each time. ${st + 3 * k} + ${k} = ${st + 4 * k}.`);
    }
    const a = rint(2, 9), b = rint(2, 9), t = rint(0, g >= 4 ? 3 : 1);
    if (t === 0) return mc(`? × ${a} = ${a * b}`, b, [b + 1, b - 1, a * b - a, a, b + 2].filter(x => x > 0), `Use the opposite operation: ${a * b} ÷ ${a} = ${b}.`);
    if (t === 1) return mc(`${a * b} ÷ ? = ${a}`, b, [b + 1, b - 1, a, a * b - a, b + 2].filter(x => x > 0), `Think: ${a} × ? = ${a * b}. The missing number is ${b}.`);
    if (t === 2) { const s = rint(2, 20), k = rint(3, 9); return mc(`What number comes next?  ${s}, ${s + k}, ${s + 2 * k}, ${s + 3 * k}, ?`, s + 4 * k, [s + 4 * k + 1, s + 3 * k + 1, s + 5 * k, s + 4 * k - 2], `Each number goes up by ${k}. ${s + 3 * k} + ${k} = ${s + 4 * k}.`); }
    const s = rint(1, 4), k = pick([2, 3]); return mc(`What number comes next?  ${s}, ${s * k}, ${s * k * k}, ${s * k * k * k}, ?`, s * k ** 4, [s * k ** 3 + k, s * k ** 3 * 2 + 1, s * k ** 4 + k, s * k ** 3 + s * k * k], `Each number is multiplied by ${k}. ${s * k ** 3} × ${k} = ${s * k ** 4}.`);
  } },
  time: { n: 'Telling Time', std: '2.MD.7 · 3.MD.1', g: [2, 3], gen(g) {
    if (g <= 2 && Math.random() < .2) { const [what, A, ws] = pick([['eating breakfast before school', '7:00 a.m.', ['7:00 p.m.', '12:00 midnight', '3:00 p.m.']], ['watching the sun go down', '7:00 p.m.', ['7:00 a.m.', '12:00 noon', '3:00 a.m.']], ['getting into bed for the night', '8:30 p.m.', ['8:30 a.m.', '12:00 noon', '3:00 p.m.']], ['waking up for school', '6:30 a.m.', ['6:30 p.m.', '12:00 noon', '11:00 p.m.']], ['eating dinner', '6:00 p.m.', ['6:00 a.m.', '10:00 a.m.', '3:00 a.m.']], ['eating lunch at school', '12:00 noon', ['12:00 midnight', '6:00 a.m.', '9:00 p.m.']]]);
      return mc(`Dex is ${what}. What time is it most likely to be?`, A, ws, 'a.m. is the morning, from midnight until noon. p.m. is the afternoon and evening, from noon until midnight.'); }
    if (g <= 2) {
      const hr = rint(1, 11);
      if (coin()) { const nn = rint(1, 11), mm = String(nn * 5).padStart(2, '0'), A = `${hr}:${mm}`; return mc(`On a clock, the short hand is between ${hr} and ${hr + 1}. The long hand points at the ${nn}. What time is it?`, A, [`${hr + 1}:${mm}`, `${hr}:${String(nn).padStart(2, '0')}`, `${nn}:${String(hr * 5).padStart(2, '0')}`, `${hr}:${String((nn * 5 + 5) % 60).padStart(2, '0')}`], `The short hand tells the hour: ${hr}. For the long hand, count by 5s around the clock. The ${nn} means ${nn * 5} minutes. So it is ${A}.`); }
      const [w, mm, why] = pick([['half past', '30', 'Half past means 30 minutes after the hour, because 30 is half of 60.'], ['quarter past', '15', 'Quarter past means 15 minutes after the hour.'], ['quarter to', '45', 'Quarter to means 15 minutes BEFORE the next hour.']]);
      const sh = w === 'quarter to' ? hr + 1 : hr; return mc(`What time is "${w} ${sh}"?`, `${hr}:${mm}`, [`${hr + 1}:${mm}`, `${hr}:${mm === '30' ? '15' : '30'}`, `${hr}:${mm === '45' ? '15' : '45'}`, `${sh}:50`].filter(x => x !== `${hr}:${mm}`), why + ` So it is ${hr}:${mm}.`);
    }
    const h = rint(1, 10), m = rint(0, 11) * 5, e = rint(3, 17) * 5, tot = h * 60 + m + e, f = t => `${Math.floor(t / 60)}:${String(t % 60).padStart(2, '0')}`;
    if (coin()) return mc(`It is ${f(h * 60 + m)} now. The horde will arrive at ${f(tot)}. How many minutes until the horde arrives?`, `${e} minutes`, [e + 5, e - 5, e + 10, e + 40, Math.abs(e - 40) || 60].filter(x => x > 0 && x !== e).map(x => x + ' minutes'), `Count up from ${f(h * 60 + m)} to ${f(tot)}. Remember there are 60 minutes in an hour. It is ${e} minutes.`);
    return mc(`Wren starts her patrol at ${f(h * 60 + m)}. It takes ${e} minutes. What time does she finish?`, f(tot), [f(tot + 5), f(tot - 5), f(tot + 60), f(tot - 10), f(tot + 10)], `Add ${e} minutes to ${f(h * 60 + m)}. When you pass 60 minutes, a new hour starts. She finishes at ${f(tot)}.`);
  } },
  compare: { n: 'Compare Numbers', std: '2.NBT.4', g: [2, 2], gen() {
    const d = shuffle([1, 2, 3, 4, 5, 6, 7, 8, 9]).slice(0, 3), [h, t, o] = d;
    if (coin()) { const v = [h * 100 + t * 10 + o, h * 100 + o * 10 + t, t * 100 + h * 10 + o, o * 100 + t * 10 + h], big = coin(), m = big ? Math.max(...v) : Math.min(...v); return mc(`Which number is the ${big ? 'GREATEST' : 'LEAST'}?`, m, v.filter(x => x !== m), `Look at the hundreds first. If they match, look at the tens, then the ones. ${m} is the ${big ? 'greatest' : 'least'}.`); }
    const a = h * 100 + t * 10 + o, b = coin() ? h * 100 + o * 10 + t : t * 100 + h * 10 + o, A = a < b ? '<' : '>';
    return mc(`Which sign makes this true?   ${a}  ___  ${b}`, A, ['<', '>', '=', '+'].filter(x => x !== A), `${a} is ${a < b ? 'less' : 'greater'} than ${b}. The open mouth of the sign always points at the BIGGER number, like a hungry zombie.`);
  } },
  groups: { n: 'Even, Odd & Equal Groups', std: '2.OA.3 · 2.OA.4', g: [2, 2], gen() {
    const t = rint(0, 2);
    if (t === 0) { const even = coin(), base = shuffle([...Array(9)].map((_, i) => i + 1)); const A = base[0] * 2 + (even ? 0 : 1), ws = base.slice(1, 4).map(x => x * 2 + (even ? 1 : 0)); return mc(`Which number is ${even ? 'EVEN' : 'ODD'}?`, A, ws, `Even numbers can be split into two equal groups. They end in 0, 2, 4, 6, or 8. Odd numbers end in 1, 3, 5, 7, or 9.`); }
    const r = rint(2, 5), c = rint(2, 5);
    if (t === 1) return mc(`Critters line up in ${r} rows. There are ${c} critters in each row. How many critters are there in all?`, r * c, [r + c, r * c + c, r * c - 1, r * c + 1], `Add ${c} once for each row: ${Array(r).fill(c).join(' + ')} = ${r * c}.`, r + c !== r * c ? { tips: { [r + c]: `You added the two numbers. But there are ${r} rows, so add ${c} once for EVERY row.` } } : undefined);
    const A = Array(r).fill(c).join(' + '); return mc(`There are ${r} rows of snacks with ${c} snacks in each row. Which addition shows how many snacks?`, A, [`${r} + ${c}`, Array(r + 1).fill(c).join(' + '), Array(r).fill(c + 1).join(' + '), Array(Math.max(1, r - 1)).fill(c).join(' + ') + ` + ${r}`].filter(x => x !== A), `Each row has ${c}, and there are ${r} rows. So add ${c} a total of ${r} times.`);
  } },
  money: { n: 'Counting Money', std: '2.MD.8', g: [2, 2], gen() {
    if (Math.random() < .3) { const d = rint(1, 4), q = rint(1, 3), n = rint(0, 3), c = d * 100 + q * 25 + n * 5, f = x => '$' + (x / 100).toFixed(2); return mc(`Dex has ${d} one-dollar bill${d > 1 ? 's' : ''}, ${q} quarter${q > 1 ? 's' : ''}${n ? ` and ${n} nickel${n > 1 ? 's' : ''}` : ''}. How much money is that?`, f(c), [f(c + 25), f(c - 25 > 0 ? c - 25 : c + 50), f(d * 100 + q + n), f((d + q + n) * 100), f(c + 100)].filter(x => x !== f(c)), `Dollars first: ${f(d * 100)}. Quarters: ${q} × 25¢ = ${q * 25}¢.${n ? ` Nickels: ${n * 5}¢.` : ''} Altogether ${f(c)}.`); }
    if (coin()) { const cost = rint(4, 17) * 5, paid = pick([50, 75, 100].filter(x => x > cost)); return mc(`A Critter Snack costs ${cost}¢. Dex pays with ${paid === 100 ? 'a dollar (100¢)' : paid + '¢'}. How much change does he get back?`, `${paid - cost}¢`, [paid - cost + 10, paid - cost - 5, paid + cost, paid - cost + 5].filter(x => x > 0).map(x => x + '¢'), `Change is what is left over: ${paid} − ${cost} = ${paid - cost}¢.`); }
    let q, d, n, p, v; do { q = rint(0, 2); d = rint(0, 3); n = rint(0, 3); p = rint(0, 4); v = q * 25 + d * 10 + n * 5 + p; } while (v >= 100 || [q, d, n, p].filter(x => x).length < 2);
    const parts = [[q, 'quarter'], [d, 'dime'], [n, 'nickel'], [p, 'penny']].filter(x => x[0]).map(([k, w]) => `${k} ${k > 1 ? (w === 'penny' ? 'pennies' : w + 's') : w}`);
    return mc(`Dex finds ${parts.slice(0, -1).join(', ')} and ${parts[parts.length - 1]}. How much money is that?`, `${v}¢`, [q + d + n + p, v + 5, v - 5, v + 10, v + 1].filter(x => x > 0 && x !== v).map(x => x + '¢'), `Quarters are 25¢, dimes 10¢, nickels 5¢, pennies 1¢. Start with the biggest coins and count up: ${[q && q * 25, d && d * 10, n && n * 5, p && p].filter(x => x).join(' + ')} = ${v}¢.`, { tips: { [`${q + d + n + p}¢`]: 'That is how many COINS there are. The question asks what they are WORTH.' } });
  } },
  shapes: { n: 'Shapes & Equal Parts', std: '2.G.1 · 2.G.2 · 2.G.3', g: [2, 2], gen() {
    if (Math.random() < .25) { const r = rint(2, 5), c = rint(2, 5); return mc(`A rectangle is split into ${r} rows and ${c} columns of same-size squares. How many squares are there?`, r * c, [r + c, r * c + r, r * c - 1, 2 * (r + c)].filter(x => x !== r * c), `Count ${c} squares in each row, ${r} times: ${Array(r).fill(c).join(' + ')} = ${r * c}.`); }
    const it = pick([
      ['How many sides does a triangle have?', '3', ['4', '5', '6'], 'TRI means three. A triangle has 3 sides and 3 corners.'],
      ['How many sides does a pentagon have?', '5', ['4', '6', '8'], 'A pentagon has 5 sides and 5 corners.'],
      ['How many sides does a hexagon have?', '6', ['5', '7', '8'], 'A hexagon has 6 sides. (Hexagon and six both have an x!)'],
      ['How many corners (angles) does a quadrilateral have?', '4', ['3', '5', '6'], 'QUAD means four. Squares and rectangles are quadrilaterals.'],
      ['Which shape has 6 square faces?', 'cube', ['cone', 'sphere', 'triangle'], 'A cube looks like a box or a die. Every face is a square.'],
      ['Which shape has exactly 4 equal sides and 4 square corners?', 'square', ['triangle', 'circle', 'hexagon'], 'A square has 4 sides that are all the same length.'],
      ['A pizza is cut into 4 equal pieces. What is each piece called?', 'a fourth', ['a half', 'a third', 'a whole'], '4 equal pieces are called fourths (or quarters).'],
      ['A candy bar is split into 2 equal pieces. What is each piece called?', 'a half', ['a third', 'a fourth', 'a whole'], '2 equal pieces are called halves.'],
      ['A pie is cut into 3 equal pieces. What is each piece called?', 'a third', ['a half', 'a fourth', 'a fifth'], '3 equal pieces are called thirds.'],
      ['How many fourths make one whole?', '4', ['2', '3', '1'], 'It takes four fourths to make one whole.'],
      ['How many halves make one whole?', '2', ['1', '3', '4'], 'It takes two halves to make one whole.'],
      ['Bash cuts a brownie into thirds. Wren cuts the same size brownie into halves. Who has BIGGER pieces?', 'Wren', ['Bash', 'They are the same', 'Nobody can tell'], 'Fewer pieces means bigger pieces. Halves are bigger than thirds.']
    ]);
    return mc(it[0], it[1], it[2], it[3]);
  } },
  data: { n: 'Charts & Measuring', std: '2.MD.1 · 2.MD.3 · 2.MD.10 · 3.MD.3', g: [2, 3], gen(g) {
    if (Math.random() < .35) { const it = pick([
      ['Which unit is BEST for measuring the length of a pencil?', 'inches', ['miles', 'pounds', 'gallons'], 'Small things are measured in inches or centimeters. Miles are for long trips.'],
      ['Which tool would you use to measure how long a table is?', 'a ruler or tape measure', ['a clock', 'a scale', 'a thermometer'], 'Rulers and tape measures measure length. Clocks measure time and scales measure weight.'],
      ['About how long is a school bus?', '40 feet', ['40 inches', '4 feet', '400 feet'], 'A bus is much longer than a person is tall, so 40 feet makes sense. 40 inches is only about as tall as a little kid.'],
      ['About how tall is a door?', '7 feet', ['7 inches', '70 feet', '2 feet'], 'A door is a bit taller than a grown-up, so about 7 feet.'],
      ['Which is longer: 1 foot or 1 inch?', '1 foot', ['1 inch', 'They are the same', 'It depends'], 'There are 12 inches in 1 foot, so a foot is longer.'],
      ['Which unit is BEST for measuring how far it is to the next town?', 'miles', ['inches', 'centimeters', 'feet'], 'Long distances are measured in miles or kilometers.'],
      ['How many inches are in 1 foot?', '12', ['10', '100', '3'], 'One foot is 12 inches. A ruler is usually one foot long.'],
      ['How many centimeters are in 1 meter?', '100', ['10', '12', '1,000'], 'One meter is 100 centimeters.']]); return mc(it[0], it[1], it[2], it[3]); }
    if (Math.random() < .25) { const v = [...Array(8)].map(() => rint(3, 7)), x = pick(v), cnt = v.filter(y => y === x).length; return coin()
      ? mc(`Priya measured 8 pencils. Their lengths in inches were:\n${v.join(',  ')}\nHow many pencils were ${x} inches long?`, cnt, [cnt + 1, cnt - 1, x, 8].filter(y => y > 0 && y !== cnt), `Count every ${x} in the list. There ${cnt === 1 ? 'is' : 'are'} ${cnt}.`)
      : mc(`Priya measured 8 pencils. Their lengths in inches were:\n${v.join(',  ')}\nHow much longer is the longest pencil than the shortest?`, Math.max(...v) - Math.min(...v) + ' inches', [Math.max(...v), Math.min(...v), Math.max(...v) + Math.min(...v), Math.max(...v) - Math.min(...v) + 1].map(y => y + ' inches').filter(y => y !== Math.max(...v) - Math.min(...v) + ' inches'), `Longest is ${Math.max(...v)}, shortest is ${Math.min(...v)}. ${Math.max(...v)} − ${Math.min(...v)} = ${Math.max(...v) - Math.min(...v)}.`); }
    const names = shuffle(['Gloops', 'Boltbugs', 'Gnawbies', 'Zaprats', 'Murdles']).slice(0, 3), v = shuffle([...Array(g <= 2 ? 9 : 14)].map((_, i) => i + 2)).slice(0, 3);
    const chart = `Dex made a chart of the critters he saw.\n${names[0]}: ${v[0]}      ${names[1]}: ${v[1]}      ${names[2]}: ${v[2]}\n`, t = rint(0, 3), hi = v.indexOf(Math.max(...v)), lo = v.indexOf(Math.min(...v));
    if (t === 0) return mc(chart + `How many MORE ${names[hi]} than ${names[lo]} did he see?`, v[hi] - v[lo], [v[hi] + v[lo], v[hi], v[lo], v[hi] - v[lo] + 1], `Subtract to compare: ${v[hi]} − ${v[lo]} = ${v[hi] - v[lo]}.`, { tips: { [v[hi] + v[lo]]: 'That is how many there are ALTOGETHER. "How many more" asks for the difference.' } });
    if (t === 1) return mc(chart + 'How many critters did he see in all?', v[0] + v[1] + v[2], [v[0] + v[1], v[0] + v[1] + v[2] + 1, v[0] + v[1] + v[2] - 2, Math.max(...v)], `Add all three: ${v[0]} + ${v[1]} + ${v[2]} = ${v[0] + v[1] + v[2]}.`);
    if (t === 2) return mc(chart + 'Which critter did he see the MOST?', names[hi], names.filter((_, i) => i !== hi).concat(['They are all the same']), `${v[hi]} is the biggest number on the chart, so the answer is ${names[hi]}.`);
    return mc(chart + `How many ${names[0]} and ${names[1]} did he see altogether?`, v[0] + v[1], [v[0] + v[1] + v[2], Math.abs(v[0] - v[1]) || 1, v[0] + v[1] + 1, v[1] + v[2]], `"Altogether" means add: ${v[0]} + ${v[1]} = ${v[0] + v[1]}.`);
  } },
  factors: { n: 'Factors & Multiples', std: '4.OA.4', g: [4, 5], gen() {
    const t = rint(0, 2);
    if (t === 0) { const p = pick([11, 13, 17, 19, 23, 29, 31, 37, 41, 43]), ws = shuffle([9, 15, 21, 25, 27, 33, 35, 39, 49, 51]).slice(0, 3); return mc('Which number is PRIME?', p, ws, `A prime number has exactly two factors: 1 and itself. ${p} cannot be divided evenly by anything else.`); }
    if (t === 1) { const k = rint(6, 9), m = k * rint(4, 11); return mc(`Which number is a MULTIPLE of ${k}?`, m, [m + 1, m - 1, m + 2, m + k - 1].filter(x => x % k), `Multiples of ${k} are what you get when you count by ${k}s. ${k} × ${m / k} = ${m}.`); }
    const n = pick([24, 30, 36, 40, 48, 60, 72]), fs = [...Array(n)].map((_, i) => i + 1).filter(x => n % x === 0 && x > 2 && x < n), f = pick(fs), ws = shuffle([5, 7, 9, 11, 13, 14, 16, 17, 21, 25, 27, 32].filter(x => n % x)).slice(0, 3);
    return mc(`Which number is a FACTOR of ${n}?`, f, ws, `A factor divides evenly with nothing left over. ${n} ÷ ${f} = ${n / f}.`);
  } },
  expr: { n: 'Expressions & Equations', std: '6.EE.2 · 6.EE.7', g: [6, 6], gen() {
    const a = rint(2, 9), b = rint(1, 12), x = rint(2, 9), t = rint(0, 3);
    if (t === 0) return mc(`What is the value of ${a}x + ${b} when x = ${x}?`, a * x + b, [a + x + b, a * (x + b), Number(`${a}${x}`) + b, a * x - b], `Replace x with ${x}: ${a} × ${x} + ${b} = ${a * x} + ${b} = ${a * x + b}.`);
    if (t === 1) return mc(`Solve for x:   x + ${b} = ${x + b}`, x, [x + 2 * b, x + b, x + 1, x - 1].filter(v => v !== x), `Undo the + ${b} by subtracting ${b} from both sides: x = ${x + b} − ${b} = ${x}.`);
    if (t === 2) return mc(`Solve for x:   ${a}x = ${a * x}`, x, [a * x - a, a * x * a, x + 1, x + a], `Undo the multiplication by dividing both sides by ${a}: x = ${a * x} ÷ ${a} = ${x}.`);
    return mc(`Solve for x:   ${a}x + ${b} = ${a * x + b}`, x, [x + 1, x - 1, x + b, (a * x + 2 * b) / a | 0].filter(v => v !== x && v > 0), `Subtract ${b} from both sides: ${a}x = ${a * x}. Then divide by ${a}: x = ${x}.`);
  } },
  ratio: { n: 'Ratios & Percents', std: '6.RP.1–3', g: [6, 6], gen() {
    const t = rint(0, 2), a = rint(2, 7), b = rint(2, 9), k = rint(2, 6);
    if (t === 0) return mc(`The ratio of critters to zombies is ${a}:${b}. If there are ${a * k} critters, how many zombies are there?`, b * k, [b + k, a * k + b, a * b, b * k + b].filter(v => v !== b * k), `${a * k} critters is ${k} times ${a}. Multiply the zombies by ${k} too: ${b} × ${k} = ${b * k}.`);
    if (t === 1) { const p = pick([5, 10, 20, 25, 30, 50, 75]), n = pick([20, 40, 60, 80, 120, 200, 400]); return mc(`What is ${p}% of ${n}?`, n * p / 100, [n * p / 10, n - p, n / p | 0, n * p / 100 + 10].filter(v => v !== n * p / 100), `${p}% = ${p}/100. ${n} × ${p} ÷ 100 = ${n * p / 100}.`); }
    const price = rint(2, 9), n = rint(3, 8); return mc(`${n} Critter Snacks cost ${price * n} scrap. What is the unit price (cost of ONE snack)?`, `${price} scrap`, [price * n, price + 1, n, price * n - n].filter(v => v !== price).map(v => v + ' scrap'), `Unit price = total ÷ how many: ${price * n} ÷ ${n} = ${price} scrap each.`);
  } },
  negint: { n: 'Negative Numbers', std: '6.NS.5–7', g: [6, 6], gen() {
    const a = rint(2, 12), b = rint(2, 12), t = rint(0, 3);
    if (t === 0) return mc(`−${a} + ${b} = ?`, b - a, [a + b, -(a + b), a - b, b - a + 1].filter(v => v !== b - a), `Start at −${a} on the number line and move ${b} to the right. You land on ${b - a}.`);
    if (t === 1) return mc(`${a} − ${a + b} = ?`, -b, [b, a + a + b, -(a + b), -b - 1], `You are taking away more than you have, so the answer drops below zero: ${a} − ${a + b} = −${b}.`);
    if (t === 2) return mc(`−${a} × ${b} = ?`, -a * b, [a * b, -(a + b), b - a === -a * b ? 0 : b - a, -a * b - b].filter(v => v !== -a * b), `A negative times a positive is negative. ${a} × ${b} = ${a * b}, so the answer is −${a * b}.`);
    const v = shuffle([-12, -9, -7, -4, -2, 0, 3, 5, 8]).slice(0, 4), m = Math.min(...v); return mc('Which number is the LEAST?', m, v.filter(x => x !== m), `On a number line, numbers get smaller as you move left. ${m} is the farthest left.`);
  } },
  mean: { n: 'Mean & Median', std: '6.SP.5', g: [6, 6], gen() {
    const v = [rint(3, 20), rint(3, 20), rint(3, 20), rint(3, 20)]; let s = v.reduce((a, b) => a + b, 0), last = 5 - s % 5; if (last < 3) last += 5; v.push(last); s += last;
    const srt = v.slice().sort((a, b) => a - b), mean = s / 5, med = srt[2];
    if (coin() || mean === med) return mc(`Scrap found each day: ${v.join(', ')}. What is the MEAN (average)?`, mean, [med, s, srt[4] - srt[0], mean + 1, mean - 1].filter(x => x !== mean), `Add them all up (${s}) and divide by how many there are (5): ${s} ÷ 5 = ${mean}.`);
    return mc(`Scrap found each day: ${v.join(', ')}. What is the MEDIAN?`, med, [mean, srt[4] - srt[0], v[2], srt[1], srt[3]].filter(x => x !== med), `Put them in order: ${srt.join(', ')}. The median is the middle number: ${med}.`);
  } }
};

// ============================================================ ENGLISH
const PLURALS = [['child', 'children'], ['mouse', 'mice'], ['tooth', 'teeth'], ['foot', 'feet'], ['goose', 'geese'], ['wolf', 'wolves'], ['leaf', 'leaves'], ['knife', 'knives'], ['man', 'men'], ['woman', 'women'], ['sheep', 'sheep'], ['deer', 'deer'], ['shelf', 'shelves'], ['city', 'cities'], ['story', 'stories'], ['box', 'boxes'], ['bush', 'bushes'], ['hero', 'heroes'], ['potato', 'potatoes'], ['monkey', 'monkeys'], ['life', 'lives'], ['party', 'parties'], ['fox', 'foxes']];
const PAST = [['run', 'ran'], ['eat', 'ate'], ['bring', 'brought'], ['catch', 'caught'], ['think', 'thought'], ['throw', 'threw'], ['fly', 'flew'], ['hide', 'hid'], ['bite', 'bit'], ['fight', 'fought'], ['teach', 'taught'], ['buy', 'bought'], ['swim', 'swam'], ['write', 'wrote'], ['see', 'saw'], ['go', 'went'], ['take', 'took'], ['find', 'found'], ['build', 'built'], ['keep', 'kept'], ['feel', 'felt'], ['draw', 'drew'], ['ring', 'rang'], ['sing', 'sang'], ['fall', 'fell']];
const I = (g, q, a, w, why) => ({ g, q, a, w, why });
const SVA = [
  I(2, 'The critter ___ fast.', 'runs', ['run', 'running', 'runned'], 'One critter runs. Add -s to the action word when there is just one.'),
  I(2, 'The zombies ___ slow.', 'are', ['is', 'am', 'be'], 'More than one zombie: they are.'),
  I(2, 'Dex ___ a red cap.', 'has', ['have', 'having', 'haves'], 'One person has. More than one have.'),
  I(2, 'We ___ happy today.', 'are', ['is', 'am', 'be'], 'Use "are" with we, you, and they.'),
  I(2, 'She ___ to school yesterday.', 'walked', ['walk', 'walks', 'walking'], '"Yesterday" means it already happened, so add -ed: walked.'),
  I(2, 'The dogs ___ loudly.', 'bark', ['barks', 'barking', 'barkes'], 'More than one dog: they bark. No -s on the action word.'),
  I(2, 'My mom ___ the bus to work.', 'rides', ['ride', 'riding', 'rided'], 'One mom rides. Add -s when there is just one.'),
  I(2, 'I ___ seven years old.', 'am', ['is', 'are', 'be'], 'Use "am" with I: I am.'),
  I(2, 'Bash ___ a fern yesterday.', 'planted', ['plant', 'plants', 'planting'], '"Yesterday" means it already happened, so add -ed: planted.'),
  I(2, 'The birds ___ south last fall.', 'flew', ['fly', 'flyed', 'flies'], '"Last fall" already happened. The past of fly is flew.'),
  I(2, 'He ___ not like peas.', 'does', ['do', 'doing', 'done'], 'Use "does" with he, she, and it.'),
  I(2, 'Tomorrow we ___ go to the park.', 'will', ['did', 'was', 'has'], '"Tomorrow" has not happened yet, so use "will."'),
  I(2, 'The cat and the dog ___ friends.', 'are', ['is', 'am', 'be'], 'A cat AND a dog is two animals: they are.'),
  I(3, 'The zombies ___ slowly down Elm Street.', 'walk', ['walks', 'walking', 'is walk'], '"Zombies" is plural (more than one), so the verb has no -s: they walk.'),
  I(3, 'Priya ___ a new gadget every week.', 'builds', ['build', 'building', 'are build'], '"Priya" is one person, so the verb gets an -s: she builds.'),
  I(3, 'Bash and Wren ___ guarding the gate.', 'are', ['is', 'am', 'be'], 'Two people joined by "and" make a plural subject: they are.'),
  I(3, 'My critter ___ faster than yours.', 'runs', ['run', 'running', 'runned'], 'One critter runs. The -s goes on the verb when the subject is singular.'),
  I(3, 'They ___ never seen a Gloop before.', 'have', ['has', 'having', 'is'], 'Use "have" with they, we, you, and I. Use "has" with he, she, and it.'),
  I(3, 'There ___ three comics on the shelf.', 'are', ['is', 'am', 'be'], 'Three comics is plural, so use "are."'),
  I(3, 'Tomorrow, we ___ fix the radio tower.', 'will', ['did', 'was', 'has'], '"Tomorrow" tells you it is the future, so use "will."'),
  I(3, 'Wren ___ to the junkyard yesterday.', 'ran', ['run', 'runs', 'running'], '"Yesterday" tells you it already happened, so use the past tense: ran.'),
  I(4, 'One of the zombies ___ wearing a chef hat.', 'is', ['are', 'were', 'be'], 'The subject is "One" (not "zombies"), and one is singular: one is.'),
  I(4, 'Munch ___ not eat kids.', 'does', ['do', 'doing', "don't"], '"Munch" is singular, so use "does."'),
  I(5, 'Each of the critters ___ a snack.', 'wants', ['want', 'wanting', 'are want'], '"Each" is always singular. Each one wants.'),
  I(5, 'The box of snacks ___ on the top shelf.', 'is', ['are', 'be', 'were'], 'The subject is "box" (one box), not "snacks." The box is.'),
  I(5, 'Neither Dex nor Priya ___ afraid.', 'is', ['are', 'am', 'be'], 'With "neither...nor," the verb matches the closer subject. Priya is.'),
  I(5, 'The team ___ ready for the boss fight.', 'is', ['are', 'be', 'were being'], 'A team is one group acting together, so it takes a singular verb: the team is.')
];
const HOMO = [
  I(2, 'I can ___ the moon.', 'see', ['sea', 'se', 'cee'], 'You SEE with your eyes. The SEA is the ocean.'),
  I(2, 'The ___ is hot today.', 'sun', ['son', 'sunn', 'sone'], 'The SUN is in the sky. A SON is a boy.'),
  I(2, 'I ___ a snack for lunch.', 'ate', ['eight', 'aet', 'ait'], 'ATE means you already ate it. EIGHT is the number 8.'),
  I(2, 'Come over ___!', 'here', ['hear', 'heer', 'hir'], 'HERE is a place. You HEAR with your EAR.'),
  I(2, 'Dex has ___ critters.', 'two', ['to', 'too', 'tow'], 'TWO is the number 2.'),
  I(2, 'I got a ___ bike for my birthday.', 'new', ['knew', 'nue', 'noo'], 'NEW means not old. KNEW means you already knew it.'),
  I(2, 'Please ___ your name on the paper.', 'write', ['right', 'rite', 'wright'], 'You WRITE with a pencil. RIGHT is the opposite of left or wrong.'),
  I(2, 'Turn ___ at the corner.', 'right', ['write', 'rite', 'wright'], 'RIGHT is a direction. You WRITE with a pencil.'),
  I(2, 'The wind ___ my hat off.', 'blew', ['blue', 'bloo', 'blewe'], 'BLEW is what the wind did. BLUE is a color.'),
  I(2, 'I ___ the answer!', 'know', ['no', 'kno', 'noe'], 'KNOW is in your brain. NO is the opposite of yes.'),
  I(2, 'I want to come ___!', 'too', ['to', 'two', 'tu'], 'TOO means "also." It has an extra o, too.'),
  I(2, 'We read a ___ about a brave knight.', 'tale', ['tail', 'tayl', 'tael'], 'A TALE is a story. A TAIL is on a dog.'),
  I(2, 'The dog wagged its ___.', 'tail', ['tale', 'tayl', 'taile'], 'A TAIL is on a dog. A TALE is a story.'),
  I(3, 'The zombies left ___ shoes behind.', 'their', ['there', "they're", 'thier'], '"Their" shows something belongs to them.'),
  I(3, '___ going to need a bigger net.', "They're", ['Their', 'There', 'Theyre'], '"They\'re" is short for "they are."'),
  I(3, 'Put the snack over ___.', 'there', ['their', "they're", 'thare'], '"There" names a place.'),
  I(3, 'Dex ate ___ many gummy worms.', 'too', ['to', 'two', 'tew'], '"Too" means "more than enough" or "also."'),
  I(3, 'Wren ran ___ the junkyard.', 'to', ['too', 'two', 'toe'], '"To" shows direction: where she went.'),
  I(3, 'We found ___ comics today.', 'two', ['to', 'too', 'tow'], '"Two" is the number 2.'),
  I(3, 'I can\'t ___ the bell from here.', 'hear', ['here', 'hare', 'heer'], 'You HEAR with your EAR.'),
  I(3, 'Our team ___ the battle!', 'won', ['one', 'when', 'wan'], '"Won" is the past tense of win. "One" is the number 1.'),
  I(3, 'Did you ___ the answer?', 'know', ['no', 'now', 'knew'], '"Know" means to understand. "No" is the opposite of yes.'),
  I(4, '___ critter is glowing.', 'Your', ["You're", 'Yore', 'Youre'], '"Your" shows it belongs to you.'),
  I(4, '___ the bravest kid I know.', "You're", ['Your', 'Yore', 'Youre'], '"You\'re" is short for "you are."'),
  I(4, 'The Gloop wiggled ___ tail.', 'its', ["it's", "its'", 'it is'], '"Its" (no apostrophe) shows ownership. "It\'s" always means "it is."'),
  I(4, '___ time to rest at the campfire.', "It's", ['Its', "Its'", 'Is'], '"It\'s" is short for "it is."'),
  I(4, 'Bash is taller ___ Dex.', 'than', ['then', 'them', 'that'], '"Than" compares two things. "Then" is about time.'),
  I(4, 'First we eat, ___ we explore.', 'then', ['than', 'them', 'when'], '"Then" tells what happens next in time.'),
  I(4, '___ backpack is this?', 'Whose', ["Who's", 'Whos', 'Who'], '"Whose" asks who owns something. "Who\'s" means "who is."'),
  I(5, 'Wren walked ___ the school.', 'past', ['passed', 'pass', 'paste'], '"Past" tells where she walked (by it). "Passed" is a verb.'),
  I(5, 'I ___ the test!', 'passed', ['past', 'pass', 'paste'], '"Passed" is the past-tense verb: what you did.'),
  I(5, 'The ___ of the school was a zombie.', 'principal', ['principle', 'princepal', 'principel'], 'The principAL is your PAL. A principle is a rule or belief.'),
  I(5, 'Take a deep ___.', 'breath', ['breathe', 'breth', 'breeth'], '"Breath" is the noun (a thing). "Breathe" is the verb (an action).'),
  I(6, 'The cold weather will ___ how fast zombies move.', 'affect', ['effect', 'afect', 'effact'], '"Affect" is usually a verb (an Action). "Effect" is usually a noun.'),
  I(6, 'The bell had a strange ___ on the town.', 'effect', ['affect', 'efect', 'affekt'], '"Effect" is the noun: the result of something.'),
  I(6, 'Priya gave Dex some good ___.', 'advice', ['advise', 'advize', 'addvice'], '"Advice" is the noun (a thing you give). "Advise" is the verb.'),
  I(6, 'Everyone came ___ Bash, who stayed with the ferns.', 'except', ['accept', 'expect', 'exept'], '"Except" means "leaving out." "Accept" means to receive.')
];
const PUNCT = [
  I(2, null, 'My dog is named Max.', ['my dog is named Max.', 'My dog is named max.', 'My dog is named Max'], 'Start with a capital letter, capitalize names, and end with a period.'),
  I(2, null, 'Do you like pizza?', ['Do you like pizza.', 'do you like pizza?', 'Do you like pizza'], 'A question ends with a question mark.'),
  I(2, null, "I can't find my hat.", ['I cant find my hat.', "I ca'nt find my hat.", "i can't find my hat."], 'In "can\'t," the apostrophe stands in for the missing letters of "cannot."'),
  I(2, null, 'We saw Dex on Monday.', ['We saw dex on Monday.', 'We saw Dex on monday.', 'we saw Dex on Monday.'], 'Names of people and days of the week start with capital letters.'),
  I(2, null, 'Watch out for the zombie!', ['watch out for the zombie!', 'Watch out for the zombie', 'Watch out for the Zombie!'], 'An excited sentence ends with an exclamation point. Only names need capitals in the middle.'),
  I(3, null, 'Dex, Priya, and Bash ran home.', ['Dex Priya and Bash ran home.', 'Dex, Priya and, Bash ran home.', 'dex, Priya, and Bash ran home.'], 'Use commas between items in a list, and capitalize names.'),
  I(3, null, 'We live in Wexler Falls, California.', ['We live in wexler falls, California.', 'We live in Wexler Falls California.', 'we live in Wexler Falls, California'], 'Capitalize city and state names, and put a comma between them.'),
  I(3, null, "The critter's tail is fluffy.", ['The critters tail is fluffy.', "The critters' tail is fluffy.", "The critter,s tail is fluffy."], 'One critter owns the tail, so add apostrophe + s.'),
  I(3, null, 'Is that a zombie?', ['Is that a zombie.', 'is that a zombie?', 'Is that a zombie'], 'A question starts with a capital letter and ends with a question mark.'),
  I(3, null, '"Run!" shouted Wren.', ['Run! shouted Wren.', '"Run! shouted Wren."', '"Run"! shouted wren.'], 'Quotation marks go around the exact words someone says.'),
  I(4, null, 'Priya said, "The beacon is ready."', ['Priya said "The beacon is ready".', 'Priya said, the beacon is ready.', 'Priya said, "the beacon is ready."'], 'Put a comma before the quote, capitalize its first word, and keep the period inside the quotation marks.'),
  I(4, null, 'I wanted to rest, but the horde was close.', ['I wanted to rest but, the horde was close.', 'I wanted to rest but the horde, was close.', 'I wanted, to rest but the horde was close.'], 'When two complete sentences are joined by and, but, or so, put a comma BEFORE the joining word.'),
  I(4, null, 'On Monday, July 4, we found the Nest.', ['On monday, july 4, we found the Nest.', 'On Monday July 4 we found the Nest.', 'On Monday, July 4 we found the nest.'], 'Capitalize days and months, and use commas around the date.'),
  I(5, null, 'Yes, I fed the critters.', ['Yes I fed the critters.', 'Yes I, fed the critters.', 'Yes; I fed the critters.'], 'Put a comma after an introductory word like yes, no, or well.'),
  I(5, null, 'Bash, will you water the ferns?', ['Bash will you water the ferns?', 'Bash will, you water the ferns?', 'Bash, will you water the ferns.'], 'When you speak directly to someone, set off their name with a comma.'),
  I(5, null, 'After the storm passed, we went outside.', ['After the storm passed we, went outside.', 'After, the storm passed we went outside.', 'After the storm, passed we went outside.'], 'Put a comma after an introductory clause.'),
  I(5, null, "All three critters' bowls were empty.", ["All three critter's bowls were empty.", 'All three critters bowls were empty.', "All three critters's bowls were empty."], 'For a plural noun ending in s, add only an apostrophe to show ownership.'),
  I(6, null, 'Krush, the junkyard crusher, was only lonely.', ['Krush the junkyard crusher, was only lonely.', 'Krush, the junkyard crusher was only lonely.', 'Krush the junkyard crusher was, only lonely.'], 'Extra information in the middle of a sentence gets a comma on BOTH sides.'),
  I(6, null, 'Wren packed three things: a rope, a map, and a flashlight.', ['Wren packed three things, a rope a map and a flashlight.', 'Wren packed: three things a rope, a map, and a flashlight.', 'Wren packed three things a rope, a map, and, a flashlight.'], 'A colon can introduce a list after a complete sentence.'),
  I(6, null, 'Mr. Munch (a very large critter) runs the shop.', ['Mr. Munch (a very large critter runs the shop).', 'Mr. Munch a very large critter (runs the shop).', '(Mr. Munch) a very large critter runs the shop.'], 'Parentheses hold extra information. The sentence should still make sense without it.')
];
const SPELL = [[2, 'said', 'sed', 'sayd', 'siad'], [2, 'they', 'thay', 'tha', 'thei'], [2, 'were', 'wer', 'wure', 'wher'], [2, 'could', 'cood', 'coud', 'culd'], [2, 'when', 'whenn', 'whin', 'wehn'], [2, 'little', 'littel', 'litle', 'littul'], [2, 'what', 'wut', 'waht', 'whut'], [2, 'does', 'duz', 'doez', 'dos'], [2, 'friend', 'frend', 'freind', 'frind'], [2, 'very', 'vry', 'verry', 'vere'], [2, 'who', 'hoo', 'woh', 'whoo'], [2, 'many', 'meny', 'manny', 'menny'], [2, 'pretty', 'pritty', 'prety', 'preety'], [2, 'other', 'uther', 'othr', 'othur'], [2, 'would', 'woud', 'wuld', 'woold'], [2, 'house', 'howse', 'hous', 'huose'], [2, 'before', 'befor', 'bifore', 'beefore'], [2, 'always', 'allways', 'alwayz', 'olways'], [2, 'people', 'peeple', 'pepole', 'peple'],
  [3, 'because', 'becuase', 'becaus', 'becuz'], [3, 'friend', 'freind', 'frend', 'friand'], [3, 'people', 'peeple', 'poeple', 'pepole'], [3, 'school', 'skool', 'scool', 'shcool'], [3, 'different', 'diffrent', 'diferent', 'differant'], [3, 'favorite', 'favrite', 'faverite', 'favorit'], [3, 'enough', 'enuff', 'enouf', 'anough'], [3, 'caught', 'cought', 'caugt', 'cawt'], [3, 'thought', 'thout', 'thougt', 'thaught'], [3, 'again', 'agen', 'agian', 'agin'],
  [4, 'believe', 'beleive', 'belive', 'beleeve'], [4, 'beautiful', 'beutiful', 'beautifull', 'butiful'], [4, 'surprise', 'suprise', 'surprize', 'serprise'], [4, 'calendar', 'calender', 'calandar', 'kalendar'], [4, 'island', 'iland', 'ileland', 'islend'], [4, 'probably', 'probly', 'probaly', 'prabably'], [4, 'weird', 'wierd', 'weerd', 'wird'], [4, 'library', 'libary', 'librery', 'liberry'], [4, 'February', 'Febuary', 'Februery', 'Feburary'],
  [5, 'necessary', 'neccessary', 'necesary', 'nessesary'], [5, 'separate', 'seperate', 'separete', 'seprate'], [5, 'definitely', 'definately', 'definitly', 'defanitely'], [5, 'embarrass', 'embarass', 'embaras', 'imbarrass'], [5, 'restaurant', 'restarant', 'resturant', 'restaurent'], [5, 'temperature', 'temperture', 'tempature', 'temprature'], [5, 'receive', 'recieve', 'receeve', 'receve'], [5, 'government', 'goverment', 'governmant', 'govenment'],
  [6, 'rhythm', 'rythm', 'rhythym', 'rithm'], [6, 'conscience', 'consience', 'concience', 'conshence'], [6, 'occasion', 'ocasion', 'occassion', 'ocassion'], [6, 'mischievous', 'mischievious', 'mischevous', 'mischivous'], [6, 'guarantee', 'garantee', 'guarentee', 'gaurantee'], [6, 'accommodate', 'accomodate', 'acommodate', 'acomodate'], [6, 'privilege', 'privelege', 'priviledge', 'privlege'], [6, 'occurred', 'occured', 'ocurred', 'ocured']
].map(r => ({ g: r[0], a: r[1], w: r.slice(2) }));
const SYN = [[2, 'glad', 'happy', 'sad'], [2, 'small', 'little', 'big'], [2, 'cold', 'chilly', 'hot'], [2, 'shout', 'yell', 'whisper'], [2, 'near', 'close', 'far'], [2, 'quick', 'fast', 'slow'], [2, 'scared', 'afraid', 'brave'],
  [3, 'happy', 'glad', 'sad'], [3, 'big', 'large', 'small'], [3, 'fast', 'quick', 'slow'], [3, 'brave', 'bold', 'scared'], [3, 'quiet', 'silent', 'loud'], [3, 'begin', 'start', 'finish'], [3, 'angry', 'mad', 'calm'], [3, 'tiny', 'little', 'huge'], [3, 'tired', 'sleepy', 'awake'],
  [4, 'ancient', 'old', 'modern'], [4, 'enormous', 'gigantic', 'tiny'], [4, 'fragile', 'delicate', 'sturdy'], [4, 'rapid', 'swift', 'sluggish'], [4, 'assist', 'help', 'hinder'], [4, 'brief', 'short', 'lengthy'], [4, 'vanish', 'disappear', 'appear'], [4, 'timid', 'shy', 'bold'],
  [5, 'abundant', 'plentiful', 'scarce'], [5, 'cautious', 'careful', 'reckless'], [5, 'conceal', 'hide', 'reveal'], [5, 'hostile', 'unfriendly', 'friendly'], [5, 'obvious', 'clear', 'hidden'], [5, 'reluctant', 'unwilling', 'eager'], [5, 'vacant', 'empty', 'occupied'],
  [6, 'benevolent', 'kind', 'cruel'], [6, 'diligent', 'hardworking', 'lazy'], [6, 'frigid', 'freezing', 'scorching'], [6, 'novice', 'beginner', 'expert'], [6, 'tranquil', 'peaceful', 'chaotic'], [6, 'ominous', 'threatening', 'promising'], [6, 'candid', 'honest', 'deceptive']
].map(r => ({ g: r[0], w: r[1], s: r[2], o: r[3] }));
const AFFIX = [[2, 'redo', 're-', 'again'], [2, 'unkind', 'un-', 'not'], [2, 'careful', '-ful', 'full of'], [2, 'helpless', '-less', 'without'], [2, 'preschool', 'pre-', 'before'], [2, 'retell', 're-', 'again'], [2, 'unsafe', 'un-', 'not'], [2, 'joyful', '-ful', 'full of'], [2, 'spotless', '-less', 'without'], [2, 'preview', 'pre-', 'before'], [2, 'unfair', 'un-', 'not'], [2, 'reread', 're-', 'again'], [2, 'painful', '-ful', 'full of'], [2, 'hopeless', '-less', 'without'],
  [3, 'unhappy', 'un-', 'not'], [3, 'rebuild', 're-', 'again'], [3, 'preheat', 'pre-', 'before'], [3, 'misspell', 'mis-', 'wrongly'], [3, 'fearless', '-less', 'without'], [3, 'hopeful', '-ful', 'full of'], [3, 'teacher', '-er', 'a person who'],
  [4, 'disagree', 'dis-', 'the opposite of'], [4, 'overcooked', 'over-', 'too much'], [4, 'submarine', 'sub-', 'under'], [4, 'washable', '-able', 'able to be'], [4, 'darkness', '-ness', 'the state of being'], [4, 'midnight', 'mid-', 'middle'],
  [5, 'international', 'inter-', 'between'], [5, 'transport', 'trans-', 'across'], [5, 'antivirus', 'anti-', 'against'], [5, 'semicircle', 'semi-', 'half'], [5, 'telescope', 'tele', 'far away'], [5, 'aquarium', 'aqua', 'water'], [5, 'portable', 'port', 'to carry'],
  [6, 'microscope', 'micro', 'very small'], [6, 'biology', 'bio', 'life'], [6, 'autograph', 'graph', 'to write'], [6, 'inspect', 'spect', 'to look'], [6, 'erupt', 'rupt', 'to break or burst'], [6, 'predict', 'dict', 'to say'], [6, 'geology', '-ology', 'the study of']
].map(r => ({ g: r[0], word: r[1], part: r[2], m: r[3] }));
const CONTEXT = [
  I(2, 'The puppy was so TINY that it fit in my hand.', 'very small', ['very loud', 'very old', 'very fast'], 'Something that fits in your hand is very small.'),
  I(2, 'Dex was EXHAUSTED after running all day, so he fell asleep fast.', 'very tired', ['very hungry', 'very happy', 'very cold'], 'He ran all day and fell asleep fast. He was very tired.'),
  I(2, 'The soup was SCORCHING, so I blew on it to cool it down.', 'very hot', ['very cold', 'very sweet', 'very thick'], 'You blow on food to cool it when it is very hot.'),
  I(2, 'She was DELIGHTED and could not stop smiling.', 'very happy', ['very sleepy', 'very angry', 'very lost'], 'Someone who cannot stop smiling is very happy.'),
  I(2, 'The room was SILENT. Nobody made a sound.', 'very quiet', ['very dark', 'very big', 'very messy'], '"Nobody made a sound" tells you silent means very quiet.'),
  I(2, 'Bash was FURIOUS. He stomped his feet and yelled.', 'very angry', ['very happy', 'very sleepy', 'very shy'], 'Stomping and yelling are what very angry people do.'),
  I(2, 'The box was ENORMOUS. It was bigger than a car.', 'very big', ['very small', 'very old', 'very light'], '"Bigger than a car" tells you enormous means very big.'),
  I(2, 'Wren felt DROWSY, so she yawned and closed her eyes.', 'sleepy', ['hungry', 'angry', 'silly'], 'Yawning and closing your eyes are clues for sleepy.'),
  I(2, 'The path was NARROW, so we had to walk one at a time.', 'not wide', ['not safe', 'not long', 'not clean'], 'If only one person fits at a time, the path is not wide.'),
  I(2, 'Dex was STARVING, so he ate two whole pizzas.', 'very hungry', ['very tired', 'very cold', 'very scared'], 'Someone who eats two whole pizzas is very hungry.'),
  I(3, 'The zombie was so SLUGGISH that a snail passed it.', 'slow', ['fast', 'angry', 'shiny'], 'The clue is that a snail passed it. Snails are slow!'),
  I(3, 'Bash was FAMISHED after skipping lunch, so he ate three sandwiches.', 'very hungry', ['very sleepy', 'very lost', 'very cold'], 'He skipped lunch and ate three sandwiches. Those clues point to hungry.'),
  I(3, 'The basement was so DIM that Dex needed his Boltbug to see.', 'dark', ['bright', 'wet', 'loud'], 'He needed a light to see, so it must have been dark.'),
  I(3, 'Dex let out an ENORMOUS yawn, the biggest one ever.', 'huge', ['quiet', 'quick', 'small'], '"The biggest one ever" tells you enormous means huge.'),
  I(4, 'Priya EXAMINED the gadget, turning it over and checking every wire.', 'looked at carefully', ['broke apart', 'hid away', 'sold quickly'], 'Turning it over and checking every wire is what careful looking sounds like.'),
  I(4, 'The streets were DESERTED; not a single person was in sight.', 'empty', ['crowded', 'noisy', 'narrow'], '"Not a single person was in sight" means empty.'),
  I(4, 'Wren was RELUCTANT to join, dragging her feet and sighing.', 'not wanting to', ['excited', 'in a hurry', 'proud'], 'Dragging feet and sighing are clues that she did not want to.'),
  I(4, 'The Gloop was TRANSPARENT, so we could see right through it.', 'see-through', ['heavy', 'sticky', 'colorful'], '"We could see right through it" is the clue.'),
  I(5, 'The fog began to DISSIPATE, and soon we could see the tower clearly.', 'fade away', ['grow thicker', 'freeze solid', 'glow brightly'], 'They could soon see clearly, so the fog must have faded away.'),
  I(5, "Munch's prices were EXORBITANT: fifty scrap for one tiny snack!", 'far too high', ['very fair', 'quite low', 'kept secret'], 'Fifty scrap for one tiny snack is a LOT. The price is too high.'),
  I(5, 'The critter was DOCILE, letting even small children pet it.', 'gentle and calm', ['fierce', 'starving', 'gigantic'], 'An animal that lets small children pet it is gentle.'),
  I(6, 'The Butler spoke in a CONDESCENDING tone, as if we were toddlers.', 'acting superior', ['friendly', 'frightened', 'confused'], 'Talking to someone "as if they were toddlers" means acting like you are better than them.'),
  I(6, 'Her METICULOUS notes listed every wire, bolt, and battery.', 'very careful and detailed', ['messy', 'short', 'secret'], 'Notes that list every single part are very detailed.'),
  I(6, "The bell's OMINOUS toll made everyone uneasy.", 'threatening', ['cheerful', 'silent', 'musical'], 'It made everyone uneasy, so it must have felt like a warning of something bad.')
];
const FIGUR = [
  I(4, 'Wren is "as fast as lightning." This is a…', 'simile', ['metaphor', 'idiom', 'rhyme'], 'A simile compares two things using "like" or "as."'),
  I(4, '"The classroom was a zoo." This is a…', 'metaphor', ['simile', 'fact', 'rhyme'], 'A metaphor says one thing IS another thing (without "like" or "as").'),
  I(4, 'What does "It\'s raining cats and dogs" mean?', 'It is raining very hard.', ['Pets are falling from the sky.', 'It is a sunny day.', 'The animals are loud.'], 'An idiom is a saying that does not mean exactly what the words say.'),
  I(4, '"That quiz was a piece of cake" means the quiz was…', 'very easy', ['delicious', 'very long', 'confusing'], '"A piece of cake" is an idiom for something easy.'),
  I(4, 'Which sentence contains a simile?', 'The Gloop wobbled like jelly.', ['The Gloop was a wobbly blob.', 'The Gloop wobbled a lot.', 'Wobble, wobble went the Gloop.'], 'Look for "like" or "as" comparing two things.'),
  I(4, '"Bash has a heart of gold" means Bash…', 'is very kind', ['is very rich', 'is made of metal', 'has a cold'], 'A heart of gold is an idiom for being kind and generous.'),
  I(4, '"Time to hit the books" means it is time to…', 'study', ['punch a book', 'go to sleep', 'clean the shelf'], '"Hit the books" is an idiom that means to study hard.'),
  I(5, '"The wind whispered through the trees." This is an example of…', 'personification', ['simile', 'hyperbole', 'alliteration'], 'Personification gives human actions (like whispering) to non-human things.'),
  I(5, '"Six slimy slugs slid sideways" is an example of…', 'alliteration', ['personification', 'metaphor', 'simile'], 'Alliteration repeats the same beginning sound.'),
  I(5, '"I\'m so hungry I could eat a horse" is an example of…', 'hyperbole', ['simile', 'alliteration', 'onomatopoeia'], 'Hyperbole is a huge exaggeration used to make a point.'),
  I(5, '"Buzz," "clang," and "splat" are examples of…', 'onomatopoeia', ['hyperbole', 'metaphor', 'idiom'], 'Onomatopoeia words sound like the noise they describe.'),
  I(5, '"Don\'t spill the beans" means…', "don't tell the secret", ["don't drop your lunch", "don't run inside", "don't cook dinner"], '"Spill the beans" is an idiom for telling a secret.'),
  I(5, 'If Dex is "feeling under the weather," he is…', 'feeling sick', ['standing in the rain', 'feeling brave', 'watching the sky'], '"Under the weather" is an idiom for feeling sick.'),
  I(6, '"The bell\'s toll was a cold hand on my neck." This metaphor suggests the sound was…', 'frightening', ['funny', 'comforting', 'too quiet to hear'], 'A cold hand on your neck is creepy. The author wants you to feel a chill.'),
  I(6, '"The Nest was a lighthouse in a sea of darkness." The author is suggesting that the Nest…', 'gives hope and guidance', ['is next to the ocean', 'is very tall', 'has broken lights'], 'A lighthouse guides people to safety, so the metaphor shows the Nest brings hope.')
];
const POS = [
  I(2, 'The big dog barked.|NOUN', 'dog', ['big', 'barked', 'The'], 'A noun is a person, place, or thing. A dog is a thing.'),
  I(2, 'The frog jumped high.|VERB', 'jumped', ['frog', 'high', 'The'], 'A verb is an action word. Jumping is the action.'),
  I(2, 'I ate a red apple.|ADJECTIVE', 'red', ['ate', 'apple', 'I'], 'An adjective describes something. "Red" tells what kind of apple.'),
  I(2, 'The happy critter danced.|ADJECTIVE', 'happy', ['critter', 'danced', 'The'], '"Happy" describes the critter, so it is an adjective.'),
  I(2, 'The girl kicked the ball.|VERB', 'kicked', ['girl', 'ball', 'The'], 'Kicking is the action, so "kicked" is the verb.'),
  I(2, 'A tiny bug sat on a leaf.|ADJECTIVE', 'tiny', ['bug', 'sat', 'leaf'], '"Tiny" tells what kind of bug, so it is an adjective.'),
  I(2, 'My brother sings loudly.|NOUN', 'brother', ['sings', 'loudly', 'My'], 'A brother is a person, so "brother" is a noun.'),
  I(2, 'The bell rang at noon.|VERB', 'rang', ['bell', 'noon', 'The'], 'Ringing is what the bell did, so "rang" is the verb.'),
  I(2, 'Wren found a shiny coin.|ADJECTIVE', 'shiny', ['found', 'coin', 'Wren'], '"Shiny" describes the coin, so it is an adjective.'),
  I(2, 'The owl flew silently away.|ADVERB', 'silently', ['owl', 'flew', 'The'], 'An adverb tells HOW something is done. The owl flew silently.'),
  I(3, 'The sleepy zombie bumped into a mailbox.|ADJECTIVE', 'sleepy', ['zombie', 'bumped', 'into'], 'An adjective describes a noun. "Sleepy" describes the zombie.'),
  I(3, 'The Gloop wiggled happily across the floor.|VERB', 'wiggled', ['Gloop', 'happily', 'floor'], 'A verb is an action word. Wiggling is the action.'),
  I(3, 'Priya built a tiny radio.|NOUN', 'radio', ['built', 'tiny', 'a'], 'A noun is a person, place, or thing. A radio is a thing.'),
  I(3, 'He gave the snack to Bash.|PRONOUN', 'He', ['gave', 'snack', 'Bash'], 'A pronoun takes the place of a noun: he, she, it, they, we.'),
  I(3, 'Munch sells crunchy snacks.|ADJECTIVE', 'crunchy', ['Munch', 'sells', 'snacks'], '"Crunchy" describes the snacks, so it is an adjective.'),
  I(3, 'Three brave kids climbed the rusty tower.|VERB', 'climbed', ['brave', 'kids', 'rusty'], 'Climbing is the action, so "climbed" is the verb.'),
  I(4, 'Wren runs quickly.|ADVERB', 'quickly', ['Wren', 'runs', 'none of these'], 'An adverb tells HOW something is done. Many end in -ly.'),
  I(4, 'Bash carefully watered the green ferns.|ADVERB', 'carefully', ['watered', 'green', 'ferns'], '"Carefully" tells how he watered.'),
  I(4, 'The critter hid under the porch.|PREPOSITION', 'under', ['critter', 'hid', 'porch'], 'A preposition shows position or direction: under, over, in, on, behind.'),
  I(4, 'The horde moved slowly toward the school.|ADVERB', 'slowly', ['horde', 'moved', 'school'], '"Slowly" tells how the horde moved.'),
  I(5, 'Dex wanted to rest, but the bell rang.|CONJUNCTION', 'but', ['wanted', 'rest', 'rang'], 'A conjunction joins words or sentences: and, but, or, so, because.'),
  I(5, 'Wow! That critter is huge.|INTERJECTION', 'Wow', ['That', 'critter', 'huge'], 'An interjection shows sudden feeling: Wow! Ouch! Yikes!'),
  I(5, 'Neither Wren nor Priya saw the map.|CORRELATIVE CONJUNCTIONS', 'Neither / nor', ['Wren / Priya', 'saw / map', 'the / the'], 'Correlative conjunctions come in pairs: either/or, neither/nor, both/and.')
];
const SENT = [
  I(4, 'Which is a COMPLETE sentence?', 'The zombie tripped on a skateboard.', ['Tripped on a skateboard.', 'The zombie on a skateboard.', 'Because the zombie tripped.'], 'A complete sentence needs a subject (who) and a verb (did what), and it must make sense on its own.'),
  I(4, 'Which is a RUN-ON sentence?', 'Dex ran home he forgot his bag.', ['Dex ran home.', 'Dex ran home, but he forgot his bag.', 'Dex ran home because he forgot his bag.'], 'A run-on jams two sentences together with no punctuation or joining word.'),
  I(4, 'Choose the best joining word:  "I wanted to explore, ___ it was getting dark."', 'but', ['so', 'or', 'because'], '"But" shows a contrast: wanting to explore versus it getting dark.'),
  I(4, 'Choose the best joining word:  "Bash was tired, ___ he took a nap."', 'so', ['but', 'or', 'yet'], '"So" shows a result. Being tired caused the nap.'),
  I(4, 'Which is a sentence FRAGMENT?', 'After the bell rang.', ['The bell rang.', 'We hid after the bell rang.', 'After the bell rang, we hid.'], 'A fragment is missing something. "After the bell rang"... then what happened?'),
  I(4, 'Choose the right word:  "The kid ___ built the beacon is Priya."', 'who', ['which', 'whom', 'whose'], 'Use "who" for people doing an action.'),
  I(4, 'Which phrase puts the describing words in the right order?', 'a small red wagon', ['a red small wagon', 'a wagon small red', 'small a red wagon'], 'In English, size comes before color: small red wagon.'),
  I(5, 'Which sentence uses the correct verb tense?', 'By the time we arrived, the horde had left.', ['By the time we arrived, the horde has leave.', 'By the time we arrive, the horde had leaving.', 'By the time we arrived, the horde will left.'], '"Had left" shows that the leaving happened before the arriving.'),
  I(5, 'What is the best way to combine these?  "Priya is smart. Priya is brave."', 'Priya is smart and brave.', ['Priya is smart, Priya is brave.', 'Priya is smart brave.', 'Priya smart and is brave.'], 'Join the two describing words with "and" so you do not repeat "Priya is."'),
  I(5, 'Which sentence keeps the same tense all the way through?', 'Dex opened the stash and found a comic.', ['Dex opened the stash and finds a comic.', 'Dex opens the stash and found a comic.', 'Dex will open the stash and found a comic.'], 'Both verbs should be in the same tense: opened and found.'),
  I(6, 'Choose the right word:  "Wren and ___ fixed the tower."', 'I', ['me', 'myself', 'mine'], 'Take Wren out to test it: "I fixed the tower" sounds right. "Me fixed" does not.'),
  I(6, 'Choose the right word:  "The snack was for Bash and ___."', 'me', ['I', 'myself', 'mine'], 'Take Bash out to test it: "The snack was for me" sounds right.'),
  I(6, 'Which sentence has a clear pronoun?', 'When Dex called Bash, Bash was asleep.', ['When Dex called Bash, he was asleep.', 'When he called him, he was asleep.', 'Dex called Bash when he was him.'], 'In the other choices, "he" could mean Dex or Bash. A clear sentence leaves no doubt.')
];
const PHONICS = [
  I(2, 'Which word has the same vowel sound as "rain"?', 'cake', ['ran', 'car', 'rag'], 'The "ai" in rain says long A, just like the a_e in cake.'),
  I(2, 'Which word has the same vowel sound as "boat"?', 'home', ['hot', 'book', 'box'], 'The "oa" in boat says long O, like the o_e in home.'),
  I(2, 'Which word has a LONG i sound?', 'kite', ['kit', 'kid', 'king'], 'The silent e at the end of kite makes the i say its name.'),
  I(2, 'Which word has a SHORT e sound?', 'bed', ['bead', 'bee', 'be'], 'Short e sounds like "eh," as in bed, red, and ten.'),
  I(2, 'Which word has a LONG e sound?', 'team', ['ten', 'tent', 'them'], 'The "ea" in team says long E.'),
  I(2, 'Which word rhymes with "light"?', 'kite', ['lit', 'late', 'lift'], 'Light and kite end with the same sound, even though they are spelled differently.'),
  I(2, 'Which word rhymes with "bear"?', 'chair', ['beard', 'bar', 'beer'], 'Bear and chair both end with the "air" sound.'),
  I(2, 'How many syllables are in "zombie"?', '2', ['1', '3', '4'], 'Clap it out: ZOM-bie. Two claps, two syllables.'),
  I(2, 'How many syllables are in "caterpillar"?', '4', ['2', '3', '5'], 'Clap it out: CAT-er-pil-lar. Four claps.'),
  I(2, 'Which word begins with the same sound as "phone"?', 'fish', ['pig', 'hat', 'pony'], 'The letters "ph" make the /f/ sound.'),
  I(2, 'Which word has a silent letter at the beginning?', 'knee', ['nest', 'kept', 'need'], 'The k in knee is silent. You only hear the n.'),
  I(2, 'Which word ends with the same sound as "duck"?', 'back', ['dug', 'bath', 'dust'], 'Duck and back both end with "ck," which says /k/.'),
  I(2, 'Which word has the same middle sound as "bird"?', 'turn', ['bride', 'bid', 'bread'], 'The "ir" in bird and the "ur" in turn make the same sound.'),
  I(2, 'Add -ing to "run." Which word is spelled correctly?', 'running', ['runing', 'runeing', 'runnning'], 'When a short word ends in one vowel and one consonant, double the last letter before adding -ing.'),
  I(2, 'Add -ed to "hop." Which word is spelled correctly?', 'hopped', ['hoped', 'hopd', 'hoppd'], 'Double the p, then add -ed. ("Hoped" is a different word, from hope!)'),
  I(2, 'Which word is a compound word?', 'sunshine', ['sunny', 'shining', 'sunniest'], 'A compound word is two smaller words stuck together: sun + shine.'),
  I(2, 'Which word has the same vowel sound as "moon"?', 'blue', ['book', 'mop', 'money'], 'The "oo" in moon and the "ue" in blue make the same sound.'),
  I(2, 'Which word has the same vowel sound as "cow"?', 'loud', ['low', 'coat', 'cool'], 'The "ow" in cow and the "ou" in loud both say "ow!"'),
  I(2, 'Which word has the same vowel sound as "coin"?', 'toy', ['cone', 'corn', 'can'], 'The "oi" in coin and the "oy" in toy make the same sound.'),
  I(2, 'What is the base word in "jumping"?', 'jump', ['jum', 'ping', 'jumpi'], 'Take off the ending -ing and you are left with the base word: jump.'),
  I(2, 'Which is the correct contraction for "do not"?', "don't", ["dont'", "do'nt", 'donot'], 'The apostrophe goes where the letter o was taken out: do not becomes don\'t.'),
  I(3, 'Which word has the same vowel sound as "caught"?', 'saw', ['cat', 'coat', 'cut'], 'The "augh" in caught and the "aw" in saw make the same sound.'),
  I(3, 'How many syllables are in "dangerous"?', '3', ['2', '4', '5'], 'Clap it out: DAN-ger-ous. Three claps.'),
  I(3, 'Which word has BOTH a prefix and a suffix?', 'unhelpful', ['helper', 'unhappy', 'helping'], 'un- is the prefix, help is the base word, and -ful is the suffix.'),
  I(3, 'Which word begins with the same sound as the c in "city"?', 'sun', ['cat', 'kite', 'chin'], 'When c comes before i, e, or y, it usually makes the soft /s/ sound.')
];
const MAZE = [
  I(2, 'The Gloop was hungry, so it ___ a snack.', 'ate', ['ran', 'blue', 'under'], 'Only "ate" makes sense. Hungry critters eat!'),
  I(2, 'Dex put on his cap and went ___.', 'outside', ['purple', 'sleepy', 'eat'], 'You can go outside. The other words do not fit.'),
  I(2, 'The rain made the street very ___.', 'wet', ['tall', 'hungry', 'seven'], 'Rain makes things wet.'),
  I(2, 'Priya used a wrench to ___ the radio.', 'fix', ['swim', 'eat', 'green'], 'A wrench is a tool for fixing things.'),
  I(2, 'The zombies walk slowly ___ they are sleepy.', 'because', ['under', 'quickly', 'table'], '"Because" tells the reason why.'),
  I(2, 'Bash watered the ferns ___ morning.', 'every', ['jump', 'blue', 'fast'], '"Every morning" tells when he does it.'),
  I(2, 'Wren can run ___ than anyone.', 'faster', ['fastest', 'table', 'jump'], 'Use "faster" with "than" when you compare two things.'),
  I(2, 'It was dark, so Dex turned on his ___.', 'flashlight', ['sandwich', 'river', 'shoe'], 'You turn on a flashlight when it is dark.'),
  I(2, 'The critter hid ___ the porch.', 'under', ['happy', 'jump', 'because'], '"Under" tells where it hid.'),
  I(2, 'After the storm, a ___ came out in the sky.', 'rainbow', ['pencil', 'chair', 'sock'], 'Rainbows show up in the sky after rain.'),
  I(2, 'Munch counted his scrap and ___ went to sleep.', 'then', ['blue', 'under', 'sing'], '"Then" tells what happened next.'),
  I(3, 'Although it was raining, the crew ___ to go outside.', 'decided', ['decision', 'slowly', 'umbrella'], 'The sentence needs an action word in the past: decided.'),
  I(3, 'The bell was so loud that the windows ___.', 'rattled', ['rattle', 'quiet', 'window'], 'The story is in the past ("was"), so the verb must be too: rattled.'),
  I(3, 'Priya was proud ___ her beacon finally worked.', 'because', ['although', 'unless', 'or'], '"Because" gives the reason she was proud.')
];
const PASSAGES = [
  { g: [2, 2], title: 'Dex and the Gloop', text: 'Dex found a little green Gloop by the pond. It was cold and wet. Dex gave it a snack. The Gloop wiggled and made a happy sound. Now the Gloop follows Dex everywhere. They are best friends.', qs: [
    ['Where did Dex find the Gloop?', 'by the pond', ['in a tree', 'at school', 'under his bed'], 'The first sentence says he found it by the pond.'],
    ['Why did the Gloop wiggle?', 'It was happy about the snack.', ['It was scared of Dex.', 'It was very sleepy.', 'It wanted to swim.'], 'It wiggled and made a happy sound right after Dex gave it a snack.'],
    ['What is this story MOSTLY about?', 'how Dex and a Gloop became friends', ['how to swim in a pond', 'what Gloops like to eat', 'why ponds are cold'], 'The whole story tells how they met and became best friends.', ['They are best friends.', ['It was cold and wet.', 'Dex gave it a snack.', 'Dex found a little green Gloop by the pond.']]]] },
  { g: [2, 2], title: 'Rules of the Nest', text: 'The Nest is a clubhouse in an old water tower. There are three rules. First, wipe your feet. Second, share your snacks. Third, never wake a sleeping critter. Bash broke the third rule once. A grumpy Gnawbie chased him around the tower two times!', qs: [
    ['How many rules does the Nest have?', 'three', ['two', 'four', 'five'], 'The passage says, "There are three rules."'],
    ['Which rule did Bash break?', 'Never wake a sleeping critter.', ['Wipe your feet.', 'Share your snacks.', 'Do not climb the tower.'], 'He broke the third rule, which is about sleeping critters.'],
    ['What happened because Bash broke the rule?', 'A Gnawbie chased him.', ['He lost his snacks.', 'He had to wipe his feet.', 'The tower fell down.'], 'The last sentence tells what happened next.', ['A grumpy Gnawbie chased him around the tower two times!', ['There are three rules.', 'First, wipe your feet.', 'The Nest is a clubhouse in an old water tower.']]]] },
  { g: [3, 4], title: "Munch's Shop", text: 'Mr. Munch is the biggest critter in Wexler Falls, but he is not scary. He runs a snack shop next to the old gas station. Kids bring him shiny scrap, and he trades it for crunchy treats. Munch never eats kids. He says they are "mostly elbows." Every night, he counts his scrap twice and hums a happy tune.', qs: [
    ['What is this passage MOSTLY about?', 'a friendly critter who runs a shop', ['how to find shiny scrap', 'why the gas station closed', 'a monster who scares kids'], 'The main idea is what the whole passage is about: Munch and his friendly shop.'],
    ['What does Munch do every night?', 'counts his scrap twice', ['eats crunchy treats', 'scares the kids away', 'closes the gas station'], 'The last sentence says he counts his scrap twice and hums.', ['Every night, he counts his scrap twice and hums a happy tune.', ['He runs a snack shop next to the old gas station.', 'Munch never eats kids.', 'Mr. Munch is the biggest critter in Wexler Falls, but he is not scary.']]],
    ['Why does the author say Munch is "not scary"?', 'to show he is friendly even though he is big', ['to show he is very small', 'to show that kids are brave', 'to show he is hiding'], 'The word "but" is a clue: he is big, BUT he is not scary.']] },
  { g: [3, 4], title: 'How a Boltbug Glows', text: 'A Boltbug is a beetle with a tiny light on its head. The light is not hot like a campfire. Instead, the bug mixes two chemicals inside its body to make a cool glow. Boltbugs glow brightest when they are happy. Because they are so bright, they are helpful in dark places like caves and basements.', qs: [
    ['How does a Boltbug make light?', 'It mixes two chemicals in its body.', ['It swallows a campfire.', 'It rubs its wings together.', 'It stores sunlight.'], 'The passage says the bug mixes two chemicals inside its body.'],
    ['Why are Boltbugs helpful in caves?', 'because they are bright', ['because they are hot', 'because they are happy', 'because they are tiny'], '"Because they are so bright" gives the reason.', ['Because they are so bright, they are helpful in dark places like caves and basements.', ['The light is not hot like a campfire.', 'A Boltbug is a beetle with a tiny light on its head.', 'Boltbugs glow brightest when they are happy.']]],
    ['Which word from the passage means the OPPOSITE of "hot"?', 'cool', ['bright', 'tiny', 'happy'], 'The passage contrasts a hot campfire with a cool glow.']] },
  { g: [2, 3], title: "Bash's Garden", text: 'Bash grows ferns in the mall garden shop. He waters them every morning. He even gives each fern a name. His favorite is a big one called Frank. Bash used to be a bully, but plants changed him. "Plants need you to show up every day," he says.', qs: [
    ['What does Bash do every morning?', 'waters the ferns', ['goes to the mall to shop', 'bullies other kids', 'names a new fern'], 'The second sentence says he waters them every morning.'],
    ['What changed Bash?', 'taking care of plants', ['moving to a new town', 'a fern named Frank bit him', 'the mall closing'], 'The passage says, "plants changed him."', ['Bash used to be a bully, but plants changed him.', ['He even gives each fern a name.', 'His favorite is a big one called Frank.', 'Bash grows ferns in the mall garden shop.']]],
    ['What lesson does Bash share?', 'It is important to be dependable.', ['Ferns are the best plants.', 'Malls are good places to live.', 'Bullies never change.'], 'Showing up every day means being someone others can count on.']] },
  { g: [4, 5], title: 'The Nest', text: 'Dex built the Nest inside an old water tower. At first, he liked living alone. Nobody told him when to go to bed, and he ate gummy worms for breakfast. But the nights were long and quiet. Sometimes he talked into his walkie-talkie, even though nobody answered. When a voice finally crackled back, Dex nearly fell out of his chair.', qs: [
    ["How did Dex's feelings about living alone change?", 'He liked it at first, but then he became lonely.', ['He hated it at first, but then he loved it.', 'He was always afraid of the tower.', 'His feelings never changed.'], '"At first" and "But" are signal words that show a change.', ['But the nights were long and quiet.', ['Dex built the Nest inside an old water tower.', 'Nobody told him when to go to bed, and he ate gummy worms for breakfast.', 'When a voice finally crackled back, Dex nearly fell out of his chair.']]],
    ['Which detail BEST shows that Dex was lonely?', 'He talked into his walkie-talkie even though nobody answered.', ['He ate gummy worms for breakfast.', 'He built the Nest in a water tower.', 'Nobody told him when to go to bed.'], 'Talking when no one answers is strong evidence of loneliness.'],
    ['The word "crackled" most likely describes…', 'a rough, broken sound', ['a bright light', 'a sweet smell', 'a very loud shout'], 'A walkie-talkie makes a scratchy, broken sound.']] },
  { g: [5, 6], title: 'Why Shamblers Are Slow', text: 'Priya has a theory about Shamblers. She noticed that they move more slowly on cold mornings than on warm afternoons. To test her idea, she timed ten Shamblers crossing the football field at different times of day. The afternoon zombies were almost twice as fast. Priya concluded that temperature affects how quickly a Shambler can move.', qs: [
    ["What is Priya's conclusion?", 'Temperature affects how fast Shamblers move.', ['Shamblers are afraid of football fields.', 'Shamblers are always slow.', 'Ten Shamblers is too many to test.'], 'The last sentence states her conclusion.'],
    ["Which evidence BEST supports Priya's conclusion?", 'The afternoon zombies were almost twice as fast.', ['Priya has a theory.', 'She timed ten Shamblers.', 'The test was on a football field.'], 'Evidence is the data that backs up a claim. The speed difference is her data.'],
    ['As it is used in the passage, a "theory" is…', 'an idea that can be tested', ['a proven fact', 'a wild guess', 'a kind of zombie'], 'Priya had an idea and then tested it. That is what a theory is.']] },
  { g: [5, 6], title: 'The Last Bell', text: 'The bell at Blackwood Manor had not rung in a hundred years. Its rope had rotted, and its tower leaned like a tired old man. So when a deep, slow DONG rolled across the town at midnight, every dog in Wexler Falls began to howl. Windows rattled. Wren stopped running. "That," she whispered, "is not supposed to happen."', qs: [
    ['The phrase "leaned like a tired old man" is a…', 'simile showing the tower is old and weak', ['metaphor showing the tower is alive', 'fact about how towers are built', 'hyperbole about a very tall man'], 'It uses "like" to compare the tower to a tired old man.'],
    ['What is the MOOD of this passage?', 'eerie and tense', ['cheerful and silly', 'calm and sleepy', 'proud and excited'], 'Howling dogs, rattling windows, and whispering all build a creepy feeling.'],
    ['Why is the ringing bell so surprising?', 'It had not rung in a hundred years and its rope had rotted.', ['It rings every night at midnight.', 'Wren rang it herself.', 'The dogs were howling first.'], 'The first two sentences explain why nobody expected it to ring.', ['The bell at Blackwood Manor had not rung in a hundred years.', ['Windows rattled.', 'Wren stopped running.', '"That," she whispered, "is not supposed to happen."']]]] },
  { g: [6, 6], title: 'Stay or Go?', text: 'Some of the crew think they should leave Wexler Falls on the ferry. They argue that the colony has food, doctors, and walls. Dex disagrees. He points out that other kids may still be hiding in town, and the Nest\'s beacon is the only signal that could reach them. "If we leave," he asks, "who turns on the light?"', qs: [
    ["What is Dex's claim?", 'The crew should stay in Wexler Falls.', ['The colony has no food.', 'The ferry is unsafe.', 'The beacon is broken.'], 'A claim is what someone is arguing for. Dex argues for staying.'],
    ['Which reason supports the OTHER side of the argument?', 'The colony has food, doctors, and walls.', ['Other kids may be hiding in town.', 'The beacon is the only signal.', 'Dex disagrees.'], 'That is the reason given by those who want to leave.'],
    ["Dex's question at the end is meant to…", 'persuade the crew by making them think', ['show that he is confused', 'ask for directions', 'change the subject'], 'A question like this is not asking for an answer. It makes the listener think.']] }
];

const pluralQ = () => { const [w, a] = pick(PLURALS); const ws = [...new Set([w + 's', w + 'es', w.slice(0, -1) + 'ies', a + 's', w.slice(0, -1) + 'ves', w + 'en'])].filter(x => x !== a); return mc(`One ${w}, two ___.  Which word is the correct plural of "${w}"?`, a, ws, `The plural of "${w}" is "${a}." Some plurals do not just add -s. You have to learn them by heart!`, w + 's' !== a ? { tips: { [w + 's']: `Most words just add -s. But "${w}" is one of the rule-breakers.` } } : undefined); };
const pastQ = () => { const [v, a] = pick(PAST); const ws = [...new Set([v + 'ed', a + 'ed', v + v.slice(-1) + 'ed', v + 't'].concat(v.endsWith('e') ? [v + 'd'] : []))].filter(x => x !== a); return mc(`Today I ${v}. Yesterday I ___.  Which is the past tense of "${v}"?`, a, ws, `"${v[0].toUpperCase() + v.slice(1)}" is an irregular verb. Its past tense is "${a}," not "${v}ed."`, { tips: { [v + 'ed']: `Most action words add -ed. But "${v}" is a rule-breaker: it changes in its own way.` } }); };
const HOMO_MEAN = { to: '"To" shows where someone goes: go TO school.', too: '"Too" means also, or more than enough.', two: '"Two" is the number 2.', their: '"Their" means it belongs to them.', there: '"There" names a place.', "they're": '"They\'re" is short for "they are."', your: '"Your" means it belongs to you.', "you're": '"You\'re" is short for "you are."', its: '"Its" means it belongs to it.', "it's": '"It\'s" is short for "it is."', here: '"Here" names a place.', hear: 'You "hear" with your ear.', see: 'You "see" with your eyes.', sea: 'The "sea" is the ocean.', sun: 'The "sun" is in the sky.', son: 'A "son" is a boy in a family.', ate: '"Ate" is what you did with food.', eight: '"Eight" is the number 8.', know: '"Know" is something your brain does.', no: '"No" is the opposite of yes.', now: '"Now" means at this moment.', knew: '"Knew" means you already knew it.', new: '"New" means not old.', write: 'You "write" with a pencil.', right: '"Right" is a direction, or it means correct.', blew: '"Blew" is what the wind did.', blue: '"Blue" is a color.', tale: 'A "tale" is a story.', tail: 'A "tail" is on an animal.', won: '"Won" means you did not lose.', one: '"One" is the number 1.', than: '"Than" compares two things.', then: '"Then" tells what happens next.', past: '"Past" tells where: you walk past something.', passed: '"Passed" is something you did.', whose: '"Whose" asks who owns something.', "who's": '"Who\'s" is short for "who is."', affect: '"Affect" is an action: to change something.', effect: 'An "effect" is a result, a thing.', accept: '"Accept" means to take or receive.', except: '"Except" means leaving out.', advice: '"Advice" is a thing you give.', advise: '"Advise" is an action.', breath: 'A "breath" is a thing: one puff of air.', breathe: '"Breathe" is an action.', principal: 'The "principal" runs the school.', principle: 'A "principle" is a rule or belief.' };
const SVA_HELP = { is: '"Is" goes with just ONE (he, she, it).', are: '"Are" goes with more than one (we, you, they).', am: '"Am" only goes with "I."', be: '"Be" needs a helper in front, like "will be."', has: '"Has" goes with just one (he, she, it).', have: '"Have" goes with I, you, we and they.', do: '"Do" goes with I, you, we and they.', does: '"Does" goes with just one (he, she, it).', was: '"Was" goes with just one, and it already happened.', were: '"Were" goes with more than one, and it already happened.' };
const itemQ = (bank, pre) => g => { const it = pick(band(bank, g)); return mc((pre ? pre + '\n' : '') + it.q, it.a, it.w, it.why); };
const ELA = {
  plural: { n: 'Plural Nouns', std: 'L.2.1b · L.3.1b', g: [2, 4], gen: pluralQ },
  past: { n: 'Past-Tense Verbs', std: 'L.2.1d · L.3.1d', g: [2, 4], gen: pastQ },
  sva: { n: 'Subject-Verb Agreement', std: 'L.2.1 · L.3.1f · L.5.1', g: [2, 5], gen: itemQ(SVA, 'Pick the word that completes the sentence.') },
  homophone: { n: 'Tricky Sound-Alikes', std: 'L.2.2 · L.4.1g', g: [2, 6], gen: itemQ(HOMO, 'Pick the word that completes the sentence.') },
  punct: { n: 'Punctuation & Capitals', std: 'L.2.2 – L.6.2', g: [2, 6], gen: g => { const it = pick(band(PUNCT, g)); return mc(it.q || 'Which sentence is written correctly?', it.a, it.w, it.why, { small: true }); } },
  spelling: { n: 'Spelling', std: 'L.2.2 – L.6.2', g: [2, 6], gen: g => { const it = pick(band(SPELL, g)); return mc('Which word is spelled correctly?', it.a, it.w, `The correct spelling is "${it.a}." Say it slowly and picture each letter.`); } },
  synant: { n: 'Synonyms & Antonyms', std: 'L.2.5 – L.6.5', g: [2, 6], gen: g => { const FAM = { big: 'size', tiny: 'size', small: 'size', enormous: 'size', brief: 'size', fast: 'speed', quick: 'speed', rapid: 'speed', happy: 'joy', glad: 'joy', brave: 'nerve', scared: 'nerve', timid: 'nerve', quiet: 'sound', shout: 'sound', cold: 'temp', frigid: 'temp', angry: 'calm', tranquil: 'calm', hostile: 'kind', benevolent: 'kind', obvious: 'hide', conceal: 'hide', vanish: 'hide' };
    const pool = band(SYN, g), it = pick(pool), others = shuffle(pool.filter(x => x !== it && !(FAM[x.w] && FAM[x.w] === FAM[it.w]))); const syn = coin();
    return mc(`Which word means ${syn ? 'almost the SAME as' : 'the OPPOSITE of'} "${it.w}"?`, syn ? it.s : it.o, [syn ? it.o : it.s, others[0].s, others[1].o, others[2].s], `"${it.w[0].toUpperCase() + it.w.slice(1)}" means about the same as "${it.s}." Its opposite is "${it.o}."`, { tips: { [syn ? it.o : it.s]: syn ? 'That one means the OPPOSITE. You want the word that means almost the SAME.' : 'That one means almost the SAME. You want the OPPOSITE.' } }); } },
  affix: { n: 'Word Parts', std: 'L.2.4b – L.6.4b', g: [2, 6], gen: g => { const pool = band(AFFIX, g), it = pick(pool), ws = shuffle([...new Set(pool.map(x => x.m))].filter(x => x !== it.m)).concat(shuffle([...new Set(AFFIX.map(x => x.m))].filter(x => x !== it.m))).filter((x, i, arr) => arr.indexOf(x) === i).slice(0, 3);
    return mc(`In the word "${it.word}," what does the word part "${it.part}" mean?`, it.m, ws, `"${it.part}" means "${it.m}." Knowing word parts helps you figure out new words.`); } },
  context: { n: 'Context Clues', std: 'L.2.4a – L.6.4a', g: [2, 6], gen: g => { const it = pick(band(CONTEXT, g)); const w = it.q.match(/[A-Z]{3,}/)[0]; return mc(`${it.q}\nWhat does ${w} most likely mean?`, it.a, it.w, it.why); } },
  figur: { n: 'Figurative Language', std: 'L.4.5 – L.6.5', g: [4, 6], gen: itemQ(FIGUR) },
  pos: { n: 'Parts of Speech', std: 'L.2.1 – L.5.1a', g: [2, 5], gen: g => { const it = pick(band(POS, g)), [s, k] = it.q.split('|'); return mc(`"${s}"\nWhich word is ${/^[AEIOU]/.test(k) ? 'an' : 'a'} ${k}?`.replace('a CORRELATIVE CONJUNCTIONS', 'a pair of CORRELATIVE CONJUNCTIONS'), it.a, it.w, it.why); } },
  sentence: { n: 'Building Sentences', std: 'L.4.1f · L.5.1 · L.6.1', g: [4, 6], gen: itemQ(SENT) },
  phonics: { n: 'Phonics & Word Sounds', std: 'RF.2.3 · RF.3.3', g: [2, 3], gen: itemQ(PHONICS) },
  maze: { n: 'Fill the Gap', std: 'RF.2.4 · L.2.3', g: [2, 3], gen: itemQ(MAZE, 'Choose the word that makes sense in the sentence.') },
  reading: { n: 'Reading Detective', std: 'RL/RI.2–6.1,2,4', g: [2, 6], gen: g => { const ps = PASSAGES.filter(p => g >= p.g[0] && g <= p.g[1]), p = pick(ps.length ? ps : PASSAGES), q = pick(p.qs), out = mc(q[0], q[1], q[2], q[3], { passage: p.text, ptitle: p.title, small: true }); if (q[4]) out.partB = mc('Which sentence from the passage BEST supports your answer in Part A?', q[4][0], q[4][1], 'Good readers can point to the exact sentence that proves their answer.'); return out; } }
};
MATH.addsub.multi = g => { const T = g <= 2 ? rint(9, 18) : rint(40, 160), nC = rint(2, 3), ex = new Set(), bad = new Set();
  while (ex.size < nC) { const a = rint(1, T - 1); ex.add(coin() ? `${a} + ${T - a}` : `${T + a} − ${a}`); }
  for (let i = 0; bad.size < 5 - nC && i < 60; i++) { const a = rint(1, T - 1), o = pick([-1, 1, g <= 2 ? 2 : 10]), e = coin() ? `${a} + ${T - a + o}` : `${T + a} − ${a + o}`; if (!ex.has(e)) bad.add(e); }
  return ms(`Select ALL the expressions that equal ${T}.`, [...ex], [...bad], `Work out each one. Only the ones that make exactly ${T} count. There can be more than one right answer!`); };
MATH.place.multi = g => { if (g > 3) return null; const [h, t, o] = shuffle([1, 2, 3, 4, 5, 6, 7, 8, 9]), n = h * 100 + t * 10 + o;
  const yes = shuffle([`${h * 100} + ${t * 10} + ${o}`, `${h} hundreds, ${t} tens, ${o} ones`, `${h * 10 + t} tens and ${o} ones`]).slice(0, 2);
  return ms(`Select the TWO ways to show the number ${n}.`, yes, [`${h * 10} + ${t * 10} + ${o}`, `${h} hundreds, ${o} tens, ${t} ones`, `${h * 100} + ${t} + ${o}`], `${n} is ${h} hundreds, ${t} tens, and ${o} ones. (${h} hundreds is the same as ${h * 10} tens, so ${h * 10 + t} tens and ${o} ones works too.)`); };
MATH.groups.multi = () => { const v = shuffle([...Array(58)].map((_, i) => i + 2)), even = coin(), nC = rint(2, 3), yes = v.filter(x => (x % 2 === 0) === even).slice(0, nC), no = v.filter(x => (x % 2 === 0) !== even).slice(0, 5 - nC);
  return ms(`Select ALL the ${even ? 'EVEN' : 'ODD'} numbers.`, yes, no, 'Look only at the last digit. Even numbers end in 0, 2, 4, 6, or 8. Odd numbers end in 1, 3, 5, 7, or 9.'); };
MATH.round.multi = g => { if (g < 3 || g > 4) return null; const p = g <= 3 ? pick([10, 100]) : pick([100, 1000]), T = p * rint(2, 9), nC = rint(2, 3), yes = new Set(), no = new Set();
  while (yes.size < nC) yes.add(T + rint(-p / 2 + 1, p / 2 - 1)); while (no.size < 5 - nC) no.add(coin() ? T + p / 2 + rint(0, p / 2 - 1) : T - p / 2 - rint(1, p / 2 - 1));
  return ms(`Select ALL the numbers that round to ${fmt(T)} when rounded to the nearest ${fmt(p)}.`, [...yes].map(fmt), [...no].map(fmt), `A number rounds to ${fmt(T)} if it is from ${fmt(T - p / 2)} up to ${fmt(T + p / 2 - 1)}.`); };
MATH.mult.multi = g => { const P = pick([12, 18, 20, 24, 30, 36, 40, 48]), prs = []; for (let a = 2; a * a <= P; a++) if (P % a === 0) prs.push([a, P / a]);
  const yes = shuffle(prs).slice(0, Math.min(prs.length, rint(2, 3))).map(([a, b]) => coin() ? `${a} × ${b}` : `${b} × ${a}`), no = new Set();
  for (let i = 0; no.size < 5 - yes.length && i < 60; i++) { const [a, b] = pick(prs), e = coin() ? `${a} × ${b + 1}` : `${a + 1} × ${b}`; no.add(e); }
  return ms(`Select ALL the expressions that equal ${P}.`, yes, [...no], `Multiply each one out. More than one pair of factors can make ${P}.`); };
MATH.fraccmp.multi = () => { const [n, d] = pick([[1, 2], [1, 3], [2, 3], [3, 4], [1, 4]]), ks = shuffle([2, 3, 4, 5, 6]), nC = rint(2, 3), yes = ks.slice(0, nC).map(k => `${n * k}/${d * k}`), no = new Set();
  for (let i = 0; no.size < 5 - nC && i < 60; i++) { const k = pick(ks), [a, b] = pick([[n * k + 1, d * k], [n * k, d * k + 1], [n + k, d + k]]); if (a * d !== b * n && a < b) no.add(`${a}/${b}`); }
  return ms(`Select ALL the fractions that are equal to ${n}/${d}.`, yes, [...no], `A fraction equals ${n}/${d} when the top and bottom were both multiplied by the same number.`); };
ELA.spelling.multi = g => { const seen = new Set(), it = shuffle(band(SPELL, g).slice()).filter(x => !seen.has(x.a) && seen.add(x.a)).slice(0, 5); if (it.length < 5) return null;
  return ms('Select the TWO words that are spelled correctly.', [it[0].a, it[1].a], [it[2].w[0], it[3].w[0], it[4].w[1]], `The correct spellings are "${it[0].a}" and "${it[1].a}." The others should be "${it[2].a}," "${it[3].a}," and "${it[4].a}."`); };
ELA.pos.multi = () => { const W3 = { NOUN: ['zombie', 'tower', 'snack', 'critter', 'school', 'bell', 'river', 'wrench'], VERB: ['run', 'hide', 'jump', 'build', 'shout', 'climb', 'whisper', 'crunch'], ADJECTIVE: ['spooky', 'tiny', 'loud', 'brave', 'slimy', 'quick', 'rusty', 'fuzzy'] }, kind = pick(Object.keys(W3)), nC = rint(2, 3);
  const yes = shuffle(W3[kind].slice()).slice(0, nC), no = shuffle([].concat(...Object.keys(W3).filter(k => k !== kind).map(k => W3[k]))).slice(0, 5 - nC);
  return ms(`Select ALL the ${kind}S.`, yes, no, { NOUN: 'A noun names a person, place, or thing.', VERB: 'A verb is an action word: something you can DO.', ADJECTIVE: 'An adjective describes what something is like.' }[kind]); };
ELA.punct.multi = g => { const it = shuffle(band(PUNCT, g).filter(x => !x.q)).slice(0, 3); if (it.length < 3) return null;
  return ms('Select the TWO sentences that are written correctly.', [it[0].a, it[1].a], [it[0].w[0], it[1].w[1], it[2].w[0]], `${it[0].why} ${it[1].why}`); };
const DOMAIN = {};
for (const [d, ids] of Object.entries({ 'Number & Operations': 'addsub place compare round mult div fraccmp fracadd fracmul decimals pow10 negint', 'Algebra & Algebraic Thinking': 'unknown groups ooo expr factors word ratio', 'Measurement & Data': 'time money data mean', 'Geometry': 'shapes area',
  'Phonics': 'phonics', 'High-Frequency Words': 'spelling', 'Vocabulary': 'synant affix context homophone figur', 'Comprehension': 'reading maze', 'Language & Grammar': 'plural past sva punct pos sentence' })) for (const id of ids.split(' ')) DOMAIN[id] = d;
const SKILLS = {};
for (const k in MATH) { MATH[k].sub = 'math'; MATH[k].id = k; SKILLS[k] = MATH[k]; }
for (const k in ELA) { ELA[k].sub = 'ela'; ELA[k].id = k; SKILLS[k] = ELA[k]; }

// ============================================================ LESSONS
const LESSONS = {
  addsub: ['Stack the numbers so the ones, tens, and hundreds line up, like zombies in neat rows. Start on the RIGHT with the ones.', 'Adding and get 10 or more? Carry the extra ten to the next row. Subtracting and the top digit is too small? Borrow 10 from the neighbor on the left.', 'Example: 346 + 278. Ones: 6+8=14, write 4, carry 1. Tens: 4+7+1=12, write 2, carry 1. Hundreds: 3+2+1=6. Answer: 624.'],
  mult: ['Multiplying is just fast adding. 4 × 6 means 4 groups of 6: 6 + 6 + 6 + 6 = 24.', 'For big numbers, break them apart. 23 × 4 is (20 × 4) + (3 × 4) = 80 + 12 = 92. Two easy problems instead of one hard one!', 'Stuck on a fact? Use one you know. Don\'t know 7 × 8? You know 7 × 7 = 49. Add one more 7: 56.'],
  div: ['Division is sharing equally. 24 ÷ 6 asks: if 6 critters share 24 snacks, how many does each get?', 'Division is multiplication backwards. To solve 24 ÷ 6, think "6 times WHAT is 24?" 6 × 4 = 24, so the answer is 4.', 'Sometimes there are leftovers. 26 ÷ 6 = 4 with 2 left over. We write that 4 R2. The R stands for remainder.'],
  round: ['Rounding makes a number simpler. First, find the place you are rounding to. Then peek at the digit to its RIGHT.', 'If that neighbor is 5 or more, round UP. If it is 4 or less, the digit stays the same. Everything to the right turns to zeros.', 'Example: round 372 to the nearest hundred. The neighbor of the 3 is a 7. That is 5 or more, so round up: 400.'],
  place: ['Where a digit sits tells you what it is worth. In 4,726 the 7 is in the hundreds place, so it is worth 700.', 'From right to left the places are: ones, tens, hundreds, thousands, ten-thousands. Each place is worth 10 times the one before.', 'After a decimal point the places go: tenths, hundredths, thousandths. In 3.47, the 4 is 4 tenths and the 7 is 7 hundredths.'],
  fraccmp: ['A fraction is a piece of a whole. The BOTTOM number tells how many equal pieces. The TOP tells how many you have.', 'Same bottom number? More pieces wins: 5/8 is more than 3/8. Same top number? Bigger pieces win: 1/3 is more than 1/8, because thirds are bigger slices.', 'To make an equal fraction, multiply the top AND bottom by the same number: 2/3 = 4/6 = 6/9. Same amount of pizza, just cut into more slices.'],
  fracadd: ['If the bottom numbers match, add (or subtract) the top numbers and keep the bottom the same. 2/7 + 3/7 = 5/7.', 'If the bottoms are different, make them match first. For 1/2 + 1/3, both can become sixths: 3/6 + 2/6.', 'Now add the tops: 3/6 + 2/6 = 5/6. NEVER add the bottom numbers together. That is the classic trap!'],
  fracmul: ['To multiply fractions, go straight across: top × top, and bottom × bottom. 2/3 × 1/4 = 2/12, which simplifies to 1/6.', 'A fraction times a whole number? Multiply just the top. 3/4 × 5 = 15/4, which is 3 3/4.', 'To DIVIDE by a fraction, flip the second fraction and multiply. 1/2 ÷ 1/4 becomes 1/2 × 4/1 = 4/2 = 2.'],
  decimals: ['Decimals are fractions in disguise. 0.4 is four tenths. 0.38 is thirty-eight hundredths.', 'To compare, give them the same number of places: 0.4 becomes 0.40. Now it is easy to see that 0.40 beats 0.38.', 'To add or subtract, line up the decimal POINTS, not the last digits. Then add like normal and bring the point straight down.'],
  pow10: ['Multiplying by 10 slides every digit one place to the left. 3.4 × 10 = 34. By 100? Two places: 340.', 'Dividing by 10 slides every digit one place to the right. 56 ÷ 10 = 5.6. By 100? Two places: 0.56.', 'Count the zeros! One zero, one hop. Two zeros, two hops. Three zeros, three hops.'],
  word: ['Word problems are little stories. Read it once just to picture it. Then ask: what is the question REALLY asking for?', 'Many problems have two steps. Do the first step, and write the answer down. Then use it for the second step.', 'When you finish, check: does my answer make sense? If 6 snacks cost 4 scrap each, the total should not be 10!'],
  area: ['PERIMETER is the fence around a shape. Add up all the sides. AREA is the grass inside. For a rectangle, multiply length × width.', 'VOLUME is how much a box holds: length × width × height. The answer is in cubic units.', 'A triangle is half a rectangle, so its area is ½ × base × height.'],
  ooo: ['Math has a traffic law. First: anything in ( ). Second: exponents like 3². Third: × and ÷, left to right. Last: + and −, left to right.', 'Example: 4 + 3 × 5. Multiply first! 3 × 5 = 15. Then 4 + 15 = 19. (Not 35!)', 'Parentheses are the boss. In (4 + 3) × 5, you do the 4 + 3 first, so the answer is 7 × 5 = 35.'],
  unknown: ['A mystery number is just a number in a mask. For ? × 6 = 42, ask: "6 times WHAT is 42?"', 'Use the opposite operation to unmask it. Multiplication and division are opposites: 42 ÷ 6 = 7.', 'For patterns, find the rule. Check how you get from each number to the next. Is it adding the same amount, or multiplying?'],
  time: ['There are 60 minutes in an hour. When the minutes reach 60, they roll over into a new hour.', 'To find how long something takes, count up. From 2:40 to 3:00 is 20 minutes. From 3:00 to 3:15 is 15 more. Total: 35 minutes.', 'To find an ending time, add the minutes. 2:50 plus 25 minutes: 10 minutes gets you to 3:00, with 15 left. So it is 3:15.'],
  compare: ['To compare two numbers, start on the LEFT. Check the hundreds first. The number with more hundreds is bigger.', 'If the hundreds are the same, check the tens. If the tens are the same too, check the ones.', 'The signs < and > are like a hungry zombie mouth. The open side always faces the BIGGER number: 348 < 384.'],
  groups: ['EVEN numbers can be split into two equal teams with nobody left over. They end in 0, 2, 4, 6, or 8.', 'ODD numbers always have one left over. They end in 1, 3, 5, 7, or 9. You only need to look at the last digit!', 'When things are in equal rows, you can add the same number again and again. 3 rows of 4 is 4 + 4 + 4 = 12.'],
  money: ['A penny is 1¢. A nickel is 5¢. A dime is 10¢. A quarter is 25¢. (The dime is the smallest coin, but it is NOT worth the least!)', 'To count coins, start with the biggest ones. Count quarters by 25s, dimes by 10s, nickels by 5s, then add the pennies.', 'Example: 1 quarter, 2 dimes, and 3 pennies. Say it out loud: 25... 35, 45... 46, 47, 48. That is 48¢.'],
  shapes: ['Shapes are named for their sides. Triangle: 3 sides. Quadrilateral: 4 sides. Pentagon: 5 sides. Hexagon: 6 sides.', 'A cube is a solid shape like a box. It has 6 faces, and every face is a square.', 'When you cut a shape into EQUAL parts, 2 parts are halves, 3 parts are thirds, and 4 parts are fourths. More pieces means smaller pieces!'],
  data: ['A chart is just a neat way to show counts. To find how many MORE, subtract the smaller number from the bigger one. To find how many IN ALL, add them up.', 'Pick a unit that fits the job. Inches and centimeters for small things. Feet and meters for rooms and people. Miles for long trips.', 'Good to know by heart: 12 inches make 1 foot. 100 centimeters make 1 meter.'],
  phonics: ['Vowels can be short (cat, bed, kit) or long, where the vowel says its own name (cake, bee, kite). A silent e at the end usually makes the vowel long.', 'Some letters work in teams. "ai" and "ay" say long A. "oa" says long O. "sh," "ch," "th," and "ph" each make one sound.', 'To count syllables, clap the beats: ZOM-bie has two. Every syllable has a vowel sound in it.'],
  maze: ['When a word is missing, read the WHOLE sentence first, then try each choice in the gap.', 'Ask two questions. Does it make sense? Does it sound right? Only one choice will pass both.', 'Watch the little words too. "Because" gives a reason. "Then" tells what came next. "Under" tells where.'],
  factors: ['FACTORS are numbers that divide evenly into another number. The factors of 12 are 1, 2, 3, 4, 6, and 12.', 'MULTIPLES are what you get when you skip-count. The multiples of 7 are 7, 14, 21, 28...', 'A PRIME number has exactly two factors: 1 and itself. 13 is prime. 15 is not, because 3 × 5 = 15.'],
  expr: ['A letter like x just stands for a number. To find 3x + 4 when x = 5, swap in the 5: 3 × 5 + 4 = 19.', 'To SOLVE an equation, get x alone. Whatever you do to one side, do to the other, like keeping a seesaw balanced.', 'Undo things with opposites. For x + 7 = 15, subtract 7 from both sides: x = 8. For 4x = 36, divide both sides by 4: x = 9.'],
  ratio: ['A ratio compares two amounts. 2:3 means "for every 2 of these, there are 3 of those."', 'To keep a ratio equal, multiply BOTH parts by the same number. 2:3 = 4:6 = 10:15.', 'Percent means "out of 100." To find 25% of 80, multiply 80 × 25 and divide by 100. That gives 20. A unit rate is the amount for just ONE.'],
  negint: ['Negative numbers live to the LEFT of zero on the number line. The farther left, the smaller. So −9 is less than −2.', 'Adding moves you right. Subtracting moves you left. Start at −5 and add 3: hop right three times to land on −2.', 'A negative times a positive is negative: −3 × 4 = −12.'],
  mean: ['The MEAN is the average. Add all the numbers, then divide by how many numbers there are.', 'The MEDIAN is the middle number. But first you MUST put the numbers in order from least to greatest.', 'Example: 3, 9, 4, 8, 6. Mean: the sum is 30, and 30 ÷ 5 = 6. Median: in order they are 3, 4, 6, 8, 9. The middle is 6.'],
  plural: ['Most nouns just add -s to become plural: one zombie, two zombies. Words ending in s, x, ch, or sh add -es: boxes, bushes.', 'Words ending in a consonant + y change the y to i and add -es: city becomes cities. Many words ending in f change to -ves: wolf becomes wolves.', 'Some words are rebels and change completely: child, children. Mouse, mice. Foot, feet. And a few never change: one sheep, two sheep.'],
  past: ['Most verbs add -ed to show the past: walk, walked. Jump, jumped.', 'But irregular verbs break the rule. We do not say "runned," we say RAN. Not "eated," but ATE. Not "bringed," but BROUGHT.', 'There is no trick for these. You learn them by reading and listening. Say the sentence out loud: "Yesterday I ___." Your ear often knows!'],
  sva: ['The subject and the verb have to match. One zombie WALKS. Two zombies WALK. It feels backwards, but the -s goes on the verb when there is just ONE.', 'Watch out for sneaky words in the middle. "The box of snacks IS heavy." The subject is the box, not the snacks.', 'Each, every, and one are always singular: "Each of the critters WANTS a snack."'],
  homophone: ['Homophones sound the same but are spelled differently. Their = belongs to them. There = a place. They\'re = they are.', 'To / too / two: "Two" is the number. "Too" means also or too much (it has too many o\'s!). "To" is for everything else.', 'Its vs. it\'s: try saying "it is." If the sentence still works, use IT\'S. If not, use ITS. The same trick works for you\'re (you are) and who\'s (who is).'],
  punct: ['Every sentence starts with a capital and ends with a period, question mark, or exclamation point. Names of people and places get capitals too.', 'Commas separate items in a list: "Dex, Priya, and Bash." A comma also goes before and, but, or so when it joins two full sentences.', 'Quotation marks hug the exact words someone says: Priya said, "It works!" An apostrophe shows ownership: the critter\'s tail.'],
  spelling: ['Good spellers look for the tricky part of a word and make up a way to remember it. FRI-END: you are friends to the END.', 'Say the word the silly way, sounding out every letter: "Wed-NES-day." "Feb-RU-ary." "Be-A-U-tiful."', 'Remember: "i before e, except after c." BelIEve, but recEIve. (WEIRD is weird and breaks the rule!)'],
  synant: ['SYNONYMS are words that mean almost the Same. Big, large, huge, and enormous are synonyms.', 'ANTONYMS are opposites. Hot and cold. Brave and scared. Ancient and modern.', 'Tip: put your answer into a sentence in place of the word. For a synonym, the sentence should mean the same thing. For an antonym, it should flip.'],
  affix: ['Many words are built from parts, like LEGO bricks. A PREFIX snaps onto the front: un- means not, so UNhappy means not happy. Re- means again, so REbuild means build again.', 'A SUFFIX snaps onto the end: -less means without, so fearLESS means without fear. -ful means full of.', 'ROOTS are the middle bricks. "Aqua" means water (aquarium). "Tele" means far (telescope). Knowing parts lets you crack words you have never seen before.'],
  context: ['When you hit a word you do not know, be a detective. The words around it are your clues.', 'Sometimes the sentence gives an example: "He was famished, so he ate three sandwiches." Someone who eats three sandwiches is very hungry!', 'Try each answer choice in place of the mystery word. The one that makes the sentence make sense is your answer.'],
  figur: ['A SIMILE compares two things using "like" or "as": fast as lightning. A METAPHOR says one thing IS another: the classroom was a zoo.', 'An IDIOM is a saying that does not mean what the words say. "Piece of cake" means easy. No cake involved. Sorry.', 'PERSONIFICATION makes things act like people: the wind whispered. HYPERBOLE is a giant exaggeration: I could eat a horse. ALLITERATION repeats a starting sound: six slimy slugs.'],
  pos: ['A NOUN is a person, place, or thing: zombie, school, snack. A VERB is an action: run, hide, munch.', 'An ADJECTIVE describes a noun: the SLEEPY zombie. An ADVERB describes a verb and often ends in -ly: it walked SLOWLY.', 'A PRONOUN stands in for a noun: he, she, it, they. A PREPOSITION shows where: under, over, behind. A CONJUNCTION joins things: and, but, so.'],
  sentence: ['A complete sentence needs a WHO (the subject) and a DID WHAT (the verb), and it has to make sense all by itself.', 'A FRAGMENT is missing a piece: "After the bell rang." ...and then what? A RUN-ON is two sentences crashed together with nothing in between.', 'Fix a run-on with a period, or with a comma and a joining word. Use "but" for a contrast, "so" for a result, and "and" to add on.'],
  reading: ['Read the passage first. Then read the question carefully. Then go BACK to the passage and find the answer. Good readers always look back!', 'The MAIN IDEA is what the whole passage is mostly about, not just one little detail.', 'For "why" and "how do you know" questions, hunt for evidence. Point to the exact sentence that proves your answer.']
};

// Grade 2 versions of the lessons whose main text is pitched at older grades.
const LESSON_G2 = {
  addsub: ['For small numbers, make a ten. 8 + 5: the 8 needs 2 more to make 10. That leaves 3. So 10 + 3 = 13.', 'For bigger numbers, add the tens and the ones on their own. 47 + 28: the tens are 40 + 20 = 60. The ones are 7 + 8 = 15. Then 60 + 15 = 75.', 'To subtract, take away the tens first, then the ones. 63 − 25: first 63 − 20 = 43. Then 43 − 5 = 38.'],
  place: ['Where a digit sits tells you what it is worth. In 472, the 4 is worth 400, the 7 is worth 70, and the 2 is worth 2.', 'From right to left the places are ones, tens, hundreds. Ten ones make a ten. Ten tens make a hundred.', 'You can stretch a number out: 472 = 400 + 70 + 2. To find 10 more or 10 less, only the tens change: 10 more than 472 is 482.'],
  unknown: ['A mystery number is a number wearing a mask. In ? + 6 = 14, something plus 6 makes 14.', 'To unmask it, use the opposite. Adding and subtracting are opposites: 14 − 6 = 8. Check it: 8 + 6 = 14.', 'For skip counting, find the jump. 15, 20, 25: each one is 5 more. So the next number is 30.'],
  time: ['A clock has two hands. The SHORT hand shows the hour. The LONG hand shows the minutes.', 'For the long hand, count by fives around the clock. The 1 means 5 minutes, the 2 means 10, the 3 means 15, and so on.', 'Half past means 30 minutes after the hour. Quarter past means 15 after. Quarter to means 15 before the next hour. And a.m. is the morning; p.m. is the afternoon and night.'],
  word: ['Word problems are little stories. Read it once just to picture it. Then ask: what is the question REALLY asking for?', '"In all" and "altogether" mean add. "How many are left" and "how many more" mean subtract.', 'Some stories have two steps. Do the first step and write the answer down. Then use it for the second step. Last, check: does my answer make sense?']
};

// ============================================================ ENGINE
// Which skill comes next and what an answer means are decided by js/learn-core.js, the engine Last Bell shares with
// Population Pup. This is Last Bell's side of it. A group is one subject at one grade ("math2"), and each record keeps
// the "skill@grade" key it has always had. Every skill for the grade is in play from the start.
const GRP = { sub: g => g.replace(/\d+$/, ''), grade: g => +g.replace(/\D+/g, '') };
const ENG = LearnCore.create({
  state: () => G.learn,
  key: (group, id) => id + '@' + GRP.grade(group),
  skills: group => Learn.forGrade(GRP.grade(group), GRP.sub(group)).map(s => s.id),
  lane: group => GRP.sub(group),
  today: () => Learn.day(),
  kinds: (group, id) => Learn.kinds(id, GRP.grade(group)),
  prereq: (group, id) => ({ group: GRP.sub(group) + (GRP.grade(group) - 1), id }),      // the same skill a grade earlier, where there is one
  harder: (group, id) => ({ group: GRP.sub(group) + (GRP.grade(group) + 1), id }),      // and a grade later, for stretch questions
  answered: (group, id, ok) => { if (typeof dayTick === 'function') dayTick(id, ok); },
  config: { newStart: 99, newPerDay: 99, stretch: .35 }
});
const Learn = {
  st() { return G.learn; },
  grp(id, g) { return SKILLS[id].sub + (g || G.learn.grade); },
  sk(id, g) { return ENG.rec(this.grp(id, g), id); },
  // Saves from before the shared engine keep every record: one field is renamed and the old round is put away.
  migrate() {
    const L = G.learn; if (!L || !L.sk) return;
    for (const key in L.sk) { const k = L.sk[key]; if (Array.isArray(k.ok)) { k.kd = k.ok; delete k.ok; } if (typeof k.rest === 'string') delete k.rest; }
    if (L.retry) { const c = ENG.core(); L.retry.forEach(r => { if (r && SKILLS[r.id] && c.retry.length < 6) c.retry.push({ g: this.grp(r.id), s: r.id, at: c.n, sig: r.sig }); }); }
    ['retry', 'deck', 'deckG', 'cycle', 'gap'].forEach(f => delete L[f]);
  },
  forGrade(g, sub) { return Object.values(SKILLS).filter(s => g >= s.g[0] && g <= s.g[1] && (!sub || s.sub === sub) && (s.needs !== 'speech' || Speak.can())); },
  teacher() { return flag('priya') ? 'priya' : 'guide'; },
  // A question may be asked as "type the answer" only when it makes sense without seeing the choices.
  typable(q) { return !q.type && !q.partB && !/\b(Which|Select)\b/.test(q.q) && /^[\d,]+(\.\d+)?$/.test(q.choices[q.a]); },
  // The KIND of question, ignoring the particular numbers: "47 + 28 = ?" and "35 + 49 = ?" are the same kind,
  // "7 + 8 = ?" and "346 + 278 = ?" are not. English items and passage questions are each their own kind.
  sig(q, sub) {
    let t = (q.type === 'multi' ? 'M|' : '') + (q.ptitle || '') + '|' + q.q;
    if (sub === 'math') {
      // bare sums keep the SIZE of their numbers (1, 2 or 3 digits); in longer questions any number is just "a number"
      t = t.replace(/\d+/g, d => t.length <= 24 ? '#'.repeat(Math.min(3, d.length)) : '#').replace(/Gloops|Boltbugs|Gnawbies|Zaprats|Murdles/g, 'X')
        .replace(/\b(one|two|three|four|five|six|seven|eight|nine|twenty|thirty|forty|fifty|sixty|seventy|eighty|ninety)\b/g, 'N')
        .replace(/# (one-dollar bills?|quarters?|dimes?|nickels?|penn(y|ies))/g, 'C').replace(/C((,| and) C)+/g, 'C').replace(/[ap]\.m\./g, 'm');
    } else if (q.type !== 'multi') t += '|' + q.choices[q.a] + (q.say || '');
    let h = 0; for (let i = 0; i < t.length; i++) h = (h * 31 + t.charCodeAt(i)) | 0; return (h >>> 0).toString(36);
  },
  // want = a kind to ask again (a retry of something missed). Otherwise prefer kinds this child has not had yet,
  // so that a skill is not "mastered" on its easy kinds alone and English items do not repeat until the bank runs out.
  make(id, gOver, want) {
    const L = G.learn, g = gOver || L.grade, S = SKILLS[id], k = g > L.grade ? null : this.sk(id, g);
    const one = () => { let c = (S.multi && Math.random() < .25 && S.multi(g)) || null; if (!c || c.choices.length < 5) c = S.gen(g); c.sig = this.sig(c, S.sub); return c; };
    const key = c => c.q + (c.passage ? c.ptitle : '');
    let q = null;
    if (want) { for (let i = 0; i < 250 && !q; i++) { const c = one(); if (c.sig === want) q = c; } if (k && k.w && k.w[want]) { k.wf = q ? 0 : (k.wf || 0) + 1; if (k.wf >= 3) { delete k.w[want]; k.wf = 0; } } }
    if (!q) {
      const seen = k ? (k.seen = k.seen || []) : []; let fb = null;
      for (let i = 0; i < 10 && !q; i++) { const c = one(); if (L.recent.includes(key(c))) continue; fb = fb || c; if (!seen.includes(c.sig)) q = c; }
      if (!q) { q = fb || one(); if (k) k.seen = []; }
    }
    if (k) { k.seen = k.seen || []; if (!k.seen.includes(q.sig)) k.seen.push(q.sig); if (k.seen.length > 40) k.seen.shift(); }
    if (S.sub === 'math' && Math.random() < .3 && this.typable(q)) { q.type = 'num'; q.ans = q.choices[q.a]; }
    L.recent.push(key(q)); if (L.recent.length > 24) L.recent.shift();
    q.skill = id; q.grp = this.grp(id, g); return q;
  },
  weak(k) { return LearnCore.openKinds(k); },
  day() { return Math.floor((Date.now() - new Date().getTimezoneOffset() * 60000) / 864e5); },
  // how many different kinds of question a skill has at this grade (counted once by sampling), and how many must be answered right
  kinds(id, gr) { const g = gr || G.learn.grade, key = id + '@' + g, C = this._kinds || (this._kinds = {}); if (!C[key]) { const S = SKILLS[id], set = new Set(); for (let i = 0; i < 150; i++) { const c = (S.multi && i % 4 === 0 && S.multi(g)) || S.gen(g); set.add(this.sig(c, S.sub)); } C[key] = set.size; } return C[key]; },
  breadth(id) { return ENG.breadth(this.grp(id), id); },
  // ADAPTIVE PRACTICE (the rules themselves are in learn-core.js)
  // Each skill sits in a box from 0 (shaky) to 4 (rock solid). A right answer moves it up a box, a miss sends it to box 0.
  //  - A miss comes back three questions later as the SAME KIND of question (at most one question in three is a retry).
  //    A missed kind has to be answered right twice before it is cleared.
  //  - A miss the very first time a skill is met does not count against it.
  //  - Skills still being learned come up every round. Once MASTERED they come back as REVIEW by days: after 1 day,
  //    then 3, 7, 14, 30 and 60. A missed review starts that over.
  //  - Two of the last three missed opens the SKILL BUILDER. If the same skill a grade earlier is not solid, that is
  //    checked first, and built up as a WARM-UP in the rounds if it needs it.
  //  - Mastered skills sometimes come back one grade harder as a STRETCH, which never counts for or against mastery.
  // MASTERED = four right in a row, at least five tries, right answers on up to six different kinds of question,
  // and no missed kind still waiting to be cleared.
  box(k) { return LearnCore.box(k); },
  next() {
    const L = G.learn;
    if (this.focus && SKILLS[this.focus]) return this.make(this.focus);
    // math and English take turns
    const subs = ['math', 'ela'].filter(s => this.forGrade(L.grade, s).length); L.flip = !L.flip;
    const p = ENG.pick((subs.length > 1 && L.flip ? subs[1] : subs[0]) + L.grade), g = GRP.grade(p.group);
    const q = this.make(p.id, g === L.grade ? null : g, p.want);
    if (p.noRecord) q.noRec = 1;
    if (p.tag) q.tag = p.tag === 'Stretch' ? `STRETCH: GRADE ${g}` : p.tag.toUpperCase();
    return q;
  },
  standing() { const all = this.forGrade(G.learn.grade); return { weak: all.filter(s => { const k = this.sk(s.id); return k.n > 0 && (this.box(k) === 0 || k.miss >= 2); }), strong: all.filter(s => { const k = this.sk(s.id); return k.m || (k.n > 0 && this.box(k) >= 3); }) }; },
  pickFocus() {
    const all = this.forGrade(G.learn.grade), todo = all.filter(s => !this.sk(s.id).m);
    if (todo.length) return todo.sort((x, y) => (this.sk(y.id).miss - this.sk(x.id).miss) || (this.sk(x.id).n - this.sk(y.id).n))[0].id;
    return all.sort((x, y) => this.sk(x.id).n - this.sk(y.id).n)[0].id;
  },
  progress() { const all = this.forGrade(G.learn.grade); return [all.filter(s => this.sk(s.id).m).length, all.length]; },
  record(q, ok) {
    const L = G.learn, grp = q.grp || this.grp(q.skill), k = ENG.rec(grp, q.skill), was = k.m;
    L.total++;
    { const eg = G.eggs && G.eggs.find(x => !x.hatched); if (ok && eg && SKILLS[q.skill]) { if (SKILLS[q.skill].sub === 'math') eg.wm = Math.min(20, eg.wm + 1); else eg.we = Math.min(20, eg.we + 1); } }
    if (ok) { L.right++; L.streak++; L.best = Math.max(L.best, L.streak); } else L.streak = 0;
    // one example of what was missed is kept for the grown-up report
    // (Maze Dash records a whole round against a skill, with no question attached)
    const right = !q.choices ? '' : q.type === 'multi' ? q.as.map(i => q.choices[i]).join(', ') : q.type === 'num' ? q.ans : q.choices[q.a];
    const ex = ok || !q.q ? null : (q.q.includes('\n') && !q.pic ? q.q.split('\n').pop() : q.q).replace(/\s+/g, ' ').slice(0, 70) + '  →  ' + String(right).slice(0, 30);
    const v = ENG.record(grp, q.skill, ok, { sig: q.sig, ex });
    if (!was && k.m && grp === this.grp(q.skill)) (L.fresh = L.fresh || []).push(q.skill);
    // the engine says when teaching is called for; the Skill Builder then opens, but not twice within twelve questions
    if ((v === 'teach' || v === 'refresh') && !this.building && L.total - (L.lastBuild == null ? -99 : L.lastBuild) >= 12) L.build = { id: q.skill, sig: q.sig, g: GRP.grade(grp) };
  },
  async quiz(title, id) { return this.ask(id ? this.make(id) : this.next(), title); },
  // Presents one item the way the real tests do. Formats: single choice, 'multi' (select all that apply),
  // 'num' (type the answer), and two-part evidence questions (Part A + Part B, both must be right).
  // mode.test = practice-test conditions: no feedback until the end.
  async ask(q, title, noRecord, mode) {
    let ok = await this.card(q, title, q.partB ? Object.assign({}, mode, { hold: 1, part: 'PART A' }) : mode);
    if (q.partB) {
      const b = Object.assign({ skill: q.skill, passage: q.passage, ptitle: q.ptitle, small: true }, q.partB);
      const ok2 = await this.card(b, title, Object.assign({}, mode, { part: 'PART B', both: ok, aText: q.choices[q.a] }));
      ok = ok && ok2;
    }
    if (!noRecord && !q.noRec) this.record(q, ok);
    if (!noRecord && !q.noRec && !(mode && mode.test) && !this.hold && !this.building && G.learn.build) await this.builder();
    return ok;
  },
  card(q, title, mode) {
    mode = mode || {};
    return new Promise(res => {
      const s = SKILLS[q.skill], type = q.type || 'mc', quiet = mode.test || mode.hold, n = q.choices.length;
      const PAD = ['7', '8', '9', '4', '5', '6', '1', '2', '3', '0', '.', '⌫', 'OK'], word = pick(['BRAIN BLAST!', 'NAILED IT!', 'BIG BRAIN!']);
      let sel = -1, ok = null, picked = -1, t = 0, hits = [], inp = '', sayHit = null, tries = 0, hint = null, late = false; const struck = new Set();
      // In ordinary play the first miss gets a hint and one more try. (It still counts as a miss.) Not in tests, trials or the solo step.
      const canHint = !quiet && !mode.demo && !mode.noHint && !Learn.hold && (type === 'num' || (type === 'mc' && n === 4));
      // read-aloud: listening items speak on their own; young readers also get a "read to me" button
      const sayText = q.say && Speak.can() ? q.say : null;
      const readText = !sayText && Speak.can() && G.learn.grade <= 3 ? (q.passage ? q.passage + ' ... ' : '') + q.q.replace(/_{2,}/g, 'blank') + (type === 'num' ? '' : ' ... The choices are: ' + q.choices.map((c, i) => 'Choice ' + 'ABCDEF'[i] + '. ' + c).join(' ... ')) : null;
      const speakNow = () => { if (sayText || readText) Speak.say(sayText || readText); };
      if (sayText) Timers.add(350, speakNow);
      const cut = type === 'mc' && n === 4 && !mode.test && G.gear && G.gear.charms.hint ? pick([0, 1, 2, 3].filter(i => i !== q.a)) : -1;
      const marks = new Set();
      if (mode.demo) { ok = true; picked = q.a; if (type === 'multi') q.as.forEach(i => marks.add(i)); }
      const finish = () => { Speak.stop(); UI.pop(m); res(ok); };
      const settle = good => {
        if (ok !== null) return; ok = good; t = 0;
        if (quiet) { Snd.sfx('ok'); Timers.add(300, finish); return; }
        const all = good && mode.both !== false; Snd.sfx(all || late ? 'right' : 'wrong'); if (all) { Fx.flash = .25; tween(Fx, 'flash', 0, 250); }
      };
      const choose = i => {
        if (ok !== null) return;
        if (type === 'multi') { if (i === n) { if (!marks.size) { Snd.sfx('no'); return; } settle(marks.size === q.as.length && q.as.every(x => marks.has(x))); } else { marks.has(i) ? marks.delete(i) : marks.add(i); Snd.sfx('move'); } return; }
        if (i === cut || struck.has(i)) { Snd.sfx('no'); return; }
        if (i !== q.a && canHint && !tries) { tries = 1; struck.add(i); hint = Learn.hintFor(q, q.choices[i]); Snd.sfx('wrong'); for (let k = 1; k < n; k++) { const j = (i + k) % n; if (j !== cut) { sel = j; break; } } return; }
        picked = i; late = tries > 0 && i === q.a; settle(i === q.a && !tries);
      };
      const key = k => {
        if (ok !== null) return;
        if (k === '⌫') inp = inp.slice(0, -1);
        else if (k === 'OK') { if (!inp || inp === '.') { Snd.sfx('no'); return; } const good = Math.abs(parseFloat(inp) - parseFloat(String(q.ans).replace(/,/g, ''))) < 1e-9;
          if (!good && canHint && !tries) { tries = 1; hint = Learn.hintFor(q, inp); inp = ''; Snd.sfx('wrong'); return; }
          late = tries > 0 && good; settle(good && !tries); return; }
        else if (inp.length < 9 && !(k === '.' && inp.includes('.'))) inp += k;
        Snd.sfx('move');
      };
      const m = {
        update(dt, pr) {
          t += dt;
          for (const k of pr) {
            if (ok !== null) { if (!quiet && t > 500 && (k === 'a' || k === 'b')) { finish(); return; } continue; }
            if (k === 'read') { speakNow(); continue; }
            if (type === 'num') {
              if (k.length === 2 && k[0] === 'd') { key(k[1]); sel = 12; } else if (k === 'bksp') key('⌫');
              else if (k === 'up') sel = sel === 12 ? 9 : (sel + 12 - 3) % 12; else if (k === 'down') sel = sel === 12 ? 0 : (sel + 3) % 12;
              else if (k === 'left') sel = (sel + 12) % 13; else if (k === 'right') sel = (sel + 1) % 13; else if (k === 'a') key(PAD[sel]);
            } else {
              const rows = type === 'multi' ? n + 1 : n;
              if (sel < 0) { if (k === 'up' || k === 'down') { sel = [...Array(n).keys()].find(j => j !== cut && !struck.has(j)) || 0; Snd.sfx('move'); } continue; }
              const dead = j => j === cut || struck.has(j); if (k === 'up') { do sel = (sel + rows - 1) % rows; while (dead(sel)); Snd.sfx('move'); } if (k === 'down') { do sel = (sel + 1) % rows; while (dead(sel)); Snd.sfx('move'); } if (k === 'a') choose(sel);
            }
          }
        },
        get hits() { return ok === null ? hits : []; },
        tap(x, y) {
          if (ok !== null) { if (!quiet && t > 500) finish(); return; }
          if (sayHit && inRect(x, y, sayHit)) { speakNow(); return; }
          const h = hits.find(r => inRect(x, y, r)); if (!h) return;
          if (type === 'num') { sel = PAD.indexOf(h.k); key(h.k); } else { choose(h.i); sel = -1; }
        },
        draw() {
          ctx.fillStyle = 'rgba(12,6,30,.72)'; ctx.fillRect(0, 0, W, H);
          panel(24, 14, W - 48, H - 28);
          setFont(18, true); text((title || 'BRAIN BLAST!') + (mode.part ? '   ·   ' + mode.part : '') + (q.tag && !mode.test ? '   ·   ' + q.tag : ''), 48, 34, '#ffd76a');
          ctx.drawImage(Art.sprite('brain'), W - 100, 16, 64, 64);
          setFont(24); text((s.sub === 'math' ? 'MATH' : 'ENGLISH') + ' · ' + s.n, W - 104, 36, s.sub === 'math' ? '#7fe0d8' : '#ffb0d0', 'right');
          let y = 78; hits = []; sayHit = null;
          if (sayText) { sayHit = { x: 56, y, w: 330, h: 50 }; const pu = Speak.on ? .5 + .5 * Math.sin(t / 120) : 0; rbox(sayHit.x, sayHit.y + 3, sayHit.w, sayHit.h, 25, 'rgba(8,4,20,.35)'); rbox(sayHit.x, sayHit.y, sayHit.w, sayHit.h, 25, '#2f7ab0', pu ? '#ffffff' : '#9fe0ff', 3); setFont(18, true); text(Speak.on ? 'LISTEN...' : 'HEAR IT AGAIN', sayHit.x + 165, sayHit.y + 13, '#fff', 'center'); if (q.heard) { setFont(24); text('Listening: ' + q.heard, 406, y + 12, '#9fe0ff'); } y += 64; }
          if (q.passage) {
            setFont(24); const pl = wrap(q.passage, W - 130);
            rbox(44, y, W - 88, pl.length * 25 + 46, 14, 'rgba(12,6,30,.55)', '#6a56b8', 2);
            text(q.ptitle, 60, y + 8, '#c9a24a'); pl.forEach((l, i) => text(l, 60, y + 36 + i * 25, '#e8e0f4'));
            y += pl.length * 25 + 56;
          }
          const qs = q.passage ? 27 : (q.q.length > 110 ? 30 : 36);
          setFont(qs); const ql = wrap(q.q, W - 120);
          ql.forEach((l, i) => text(l, 56, y + i * (qs + 4), '#ffffff')); y += ql.length * (qs + 4) + 10;
          if (q.pic) { const ph = Pic.h(q.pic); Pic.draw(q.pic, 56, y, W - 112); y += ph + 10; }
          const done = ok !== null && !quiet;
          let why = [], head = '';
          if (done) {
            const right = type === 'multi' ? q.as.map(i => q.choices[i]).join('   ·   ') : type === 'num' ? q.ans : q.choices[q.a];
            const all = ok && mode.both !== false;
            head = mode.demo ? 'WATCH: HERE IS HOW IT WORKS' : late ? 'YES! YOU GOT IT ON THE SECOND TRY.' : all ? word : ok ? 'PART B IS RIGHT — BUT CHECK PART A:' : "NOT QUITE — HERE'S THE TRICK:";
            setFont(24); why = wrap((mode.both === false ? 'Part A answer: ' + mode.aText + '.  ' : '') + (ok || late ? '' : 'Answer: ' + right + '.  ') + q.why, W - 120);
          } else if (hint) { head = 'NOT QUITE. HERE IS A HINT, THEN TRY ONCE MORE:'; setFont(24); why = wrap(hint, W - 120); }
          if (type === 'num') {
            setFont(22); text('Type your answer, then press OK.', 56, y, '#c9a24a'); y += 30;
            rbox(56, y, 380, 64, 14, '#1a1038', done ? (ok ? '#a8ffb8' : '#ffb0bc') : '#ffd76a', 3);
            setFont(46); text(inp + (ok === null && Math.floor(t / 400) % 2 ? '|' : ''), 76, y + 8, '#ffffff');
            const kx = 480, kw = 96, kh = 54;
            PAD.forEach((k, i) => {
              const r = i === 12 ? { x: kx + 3 * (kw + 8), y, w: 120, h: 4 * (kh + 8) - 8 } : { x: kx + (i % 3) * (kw + 8), y: y + Math.floor(i / 3) * (kh + 8), w: kw, h: kh };
              rbox(r.x, r.y + 3, r.w, r.h, 12, 'rgba(8,4,20,.35)'); rbox(r.x, r.y, r.w, r.h, 12, i === 12 ? '#2f9a54' : (i === sel && ok === null ? '#6652c0' : '#4a3a8e'), i === sel && ok === null ? '#ffd76a' : '#7a66d0', 3);
              setFont(i === 12 ? 34 : 36); text(k, r.x + r.w / 2, r.y + r.h / 2 - 16, '#fff', 'center'); hits.push(Object.assign({ k }, r));
            });
            y += 78;
            if (done || hint) { setFont(18, true); text(done ? head : 'HINT: TRY ONCE MORE', 56, y + 6, ok || late ? '#7fe08a' : '#ffb07a'); setFont(24); wrap(why.join(' '), 400).forEach((l, i) => text(l, 56, y + 36 + i * 25, '#e8e0f4')); }
          } else {
            const cs = q.small || n > 4 ? 25 : 30;
            setFont(cs);
            const lines = q.choices.map(c => wrap(c, W - 190)), minH = q.passage || q.pic || n > 4 ? 42 : 54;
            const rowH = lines.map(l => Math.max(minH, l.length * (cs + 2) + 18));
            const need = rowH.reduce((a, b) => a + b + 8, 0) + (type === 'multi' ? 58 : 0) + (done || hint ? why.length * 25 + 44 : 0);
            const gap = Math.max(2, Math.min(8, 8 + (H - 30 - y - need) / (n + 1)));
            q.choices.forEach((c, i) => {
              const h = rowH[i], on = marks.has(i), good = type === 'multi' ? q.as.includes(i) : i === q.a, mine = type === 'multi' ? on : i === picked;
              let bg = '#4a3a8e', bd = '#7a66d0';
              if (!done && (i === sel || on)) { bg = on ? '#5a48b0' : '#6652c0'; bd = i === sel ? '#ffd76a' : '#b8a8ff'; }
              if (done && good) { bg = '#2f9a54'; bd = '#a8ffb8'; } else if (done && mine) { bg = '#b03a4c'; bd = '#ffb0bc'; }
              rbox(58, y + 4, W - 112, h, 14, 'rgba(8,4,20,.35)'); rbox(56, y, W - 112, h, 14, bg, bd, 3); rbox(62, y + 4, 44, h - 8, 10, 'rgba(0,0,0,.22)');
              setFont(cs);
              if (type === 'multi') { rbox(72, y + h / 2 - 12, 24, 24, 6, on ? '#ffd76a' : 'rgba(255,255,255,.12)', '#ffd76a', 2); if (on) text('✓', 84, y + h / 2 - 15, '#1a1030', 'center'); }
              else text('ABCDEF'[i], 84, y + (h - cs) / 2 - 2, '#ffd76a', 'center');
              lines[i].forEach((l, j) => text(l, 116, y + (h - lines[i].length * (cs + 2)) / 2 + j * (cs + 2) - 1, '#fff'));
              if ((i === cut || struck.has(i)) && !done) { ctx.fillStyle = 'rgba(20,12,44,.72)'; ctx.beginPath(); ctx.roundRect(56, y, W - 112, h, 14); ctx.fill(); ctx.strokeStyle = i === cut ? '#ffd76a' : '#ff9a8a'; ctx.lineWidth = 3; ctx.beginPath(); ctx.moveTo(116, y + h / 2); ctx.lineTo(W - 90, y + h / 2); ctx.stroke(); if (i === cut) { setFont(20); text('OWL CHARM', W - 80, y + h / 2 - 11, '#ffd76a', 'right'); } }
              hits.push({ x: 56, y, w: W - 112, h, i });
              y += h + gap;
            });
            if (type === 'multi' && !done) { const r = { x: W / 2 - 130, y: y + 2, w: 260, h: 46, i: n }; rbox(r.x, r.y + 3, r.w, r.h, 23, 'rgba(8,4,20,.35)'); rbox(r.x, r.y, r.w, r.h, 23, marks.size ? '#2f9a54' : '#3a3458', sel === n ? '#ffd76a' : '#7a66d0', 3); setFont(18, true); text('SUBMIT', W / 2, r.y + 10, marks.size ? '#fff' : '#8f86a8', 'center'); hits.push(r); }
            if (done || hint) { setFont(18, true); text(head, 56, y + 6, (ok && mode.both !== false) || late ? '#7fe08a' : '#ffb07a'); setFont(24); why.forEach((l, i) => text(l, 56, y + 34 + i * 25, '#e8e0f4')); }
          }
          if (readText && ok === null) { sayHit = { x: 44, y: H - 70, w: 200, h: 40 }; rbox(sayHit.x, sayHit.y, sayHit.w, sayHit.h, 20, '#2f7ab0', Speak.on ? '#ffffff' : '#9fe0ff', 2.5); setFont(15, true); text(Speak.on ? 'READING...' : 'READ TO ME', sayHit.x + 100, sayHit.y + 10, '#fff', 'center'); }
          if (done && t > 500 && Math.floor(t / 400) % 2) { setFont(24); text('▼', W - 70, H - 54, '#c9a24a'); }
          if (ok !== null && quiet) { setFont(18, true); text('LOCKED IN', W / 2, H - 62, '#a8ffb8', 'center'); }
        }
      };
      UI.push(m);
    });
  },
  // QUICK CHECK: twelve questions, no hints, nothing recorded as a miss. A right answer gives that skill a head start
  // (two more right answers finish it); it does not mark it mastered, because one answer can be a lucky guess.
  async placement() {
    const L = G.learn, g = L.grade, who = this.teacher(), all = this.forGrade(g);
    const first = ['addsub', 'phonics', 'place', 'spelling', 'word', 'sva', 'time', 'reading', 'money', 'homophone', 'unknown', 'punct'];
    const pool = first.map(id => all.find(x => x.id === id)).filter(Boolean).concat(shuffle(all.filter(x => !first.includes(x.id)))).filter(x => !this.sk(x.id).m && x.needs !== 'speech').slice(0, 12);
    if (pool.length < 4) { await say(who, 'There is nothing left to check. You have already shown me nearly all of it.'); return; }
    await say(who, `QUICK CHECK. ${pool.length} questions. No hints, and a miss does not count against you. If you do not know one, just take your best guess. It tells me what we can go faster on.`);
    const known = []; this.hold = (this.hold || 0) + 1;
    try {
      for (let i = 0; i < pool.length; i++) {
        const sk = pool[i], q = this.make(sk.id); if (sk.sub === 'math' && this.typable(q)) { q.type = 'num'; q.ans = q.choices[q.a]; }
        if (await this.ask(q, `QUICK CHECK   ${i + 1} OF ${pool.length}`, true, { test: 1 })) {
          ENG.headStart(this.grp(sk.id), sk.id, q.sig); known.push(sk.n);
        }
      }
    } finally { this.hold--; }
    L.placed = g; ENG.reset(); Snd.sfx('badge');
    await say(null, `QUICK CHECK DONE\nYou got ${known.length} of ${pool.length}.`, { col: '#ffd76a' });
    await say(who, known.length ? `Nice. I will go faster on: ${known.slice(0, 6).join(', ')}${known.length > 6 ? ', and more' : ''}. Two more right answers on each and they are mastered.` : 'Good to know. We will take everything one step at a time.');
  },
  // A hint for the first miss. Where the wrong answer shows WHAT went wrong, say so; otherwise give the skill's key idea.
  hintFor(q, picked) {
    picked = String(picked);
    if (q.tips && q.tips[picked]) return q.tips[picked];
    const nv = t => { t = String(t); if (t.includes(':') || t.includes('/')) return null; const m = t.replace(/,/g, '').match(/^\$?(\d+(\.\d+)?)/); return m ? +m[1] : null; };
    const a = nv(q.type === 'num' ? q.ans : q.choices[q.a]), p = nv(picked);
    if (a !== null && p !== null && SKILLS[q.skill].sub === 'math' && !/\b(Which|Select|Round|about)\b/.test(q.q)) {
      const m = q.q.match(/(\d[\d,]*) ([+−]) (\d[\d,]*) = \?/);
      if (m) { const x = +m[1].replace(/,/g, ''), y = +m[3].replace(/,/g, '');
        if (m[2] === '−' && p === x + y) return 'Look at the sign. It says TAKE AWAY, but that answer is what you get when you add.';
        if (m[2] === '+' && p === Math.abs(x - y)) return 'Look at the sign. It says ADD, but that answer is what you get when you take away.'; }
      const d = Math.round(Math.abs(p - a) * 100) / 100;
      if (d === 1) return 'So close! You are off by just 1. Count the ones again.';
      if (d === 10) return 'You are off by exactly 10. The ones are right, so check the tens again.';
      if (d === 100) return 'You are off by exactly 100. Check the hundreds again.';
      return p > a ? 'That is too big. Think it through once more.' : 'That is too small. Think it through once more.';
    }
    if (q.passage) return 'Go back to the passage. Find the sentence that answers the question, then pick again.';
    const les = (G.learn.grade <= 2 && LESSON_G2[q.skill]) || LESSONS[q.skill];
    if (SKILLS[q.skill].sub !== 'math') {
      const id = q.skill, ans = String(q.choices[q.a]), low = picked.toLowerCase(), gapLine = q.q.split('\n').filter(l => /_{2,}/.test(l)).pop();
      if (id === 'homophone') return HOMO_MEAN[low] ? HOMO_MEAN[low] + ' Is that what this sentence needs?' : `"${picked}" is not a real spelling. Look for the real words.`;
      if (id === 'sva') { if (SVA_HELP[low]) return SVA_HELP[low] + ' Who is this sentence about?'; if (/ing$/.test(low)) return 'A word that ends in -ing needs a helper in front of it, like "is running."'; if (/yesterday|last |tomorrow/i.test(q.q)) return 'Find the time word in the sentence. Has it already happened, or is it still going to happen?'; }
      if (id === 'punct' && !q.type && ans.length > 6) {
        const end = t => /[.?!]"?$/.test(t) ? t.replace(/"$/, '').slice(-1) : '';
        if (/^[a-z]/.test(picked) && /^[A-Z"]/.test(ans)) return 'Look at the very first letter. How does every sentence start?';
        if (end(ans) && !end(picked)) return 'Look at the very end. Every sentence needs an end mark.';
        if (end(ans) && end(picked) !== end(ans)) return end(ans) === '?' ? 'This one ASKS something. Which mark goes at the end of a question?' : 'Look at the mark at the very end. Is it the right one for this sentence?';
        const aw = ans.split(' '), pw = picked.split(' '); if (aw.length === pw.length) for (let i = 1; i < aw.length; i++) if (aw[i] !== pw[i] && aw[i].toLowerCase() === pw[i].toLowerCase()) return /^[A-Z]/.test(aw[i]) ? `Look at "${pw[i].replace(/[.,!?]/g, '')}." It is a special name, and special names need a capital letter.` : `Look at "${pw[i].replace(/[.,!?]/g, '')}." It is not a name, so it does not need a capital letter.`;
        const cnt = (t, c) => t.split(c).length; if (cnt(ans, "'") !== cnt(picked, "'") || ans.indexOf("'") !== picked.indexOf("'")) return 'Look closely at the apostrophe. Is it there, and is it in the right place?';
        if (cnt(ans, '"') !== cnt(picked, '"')) return 'Look closely at the quotation marks. They go around the exact words someone says.';
        if (cnt(ans, ',') !== cnt(picked, ',') || ans.indexOf(',') !== picked.indexOf(',')) return 'Look closely at the commas. Are they all there, and in the right places?';
      }
      if (id === 'pos') { const kind = (q.q.match(/Which word is an? ([A-Z]+)/) || [])[1], T = { NOUN: `A noun is a person, place, or thing. Is "${picked}" one of those?`, VERB: `A verb is something you can DO. Can you "${low}"?`, ADJECTIVE: `An adjective tells what something is like. Does "${picked}" describe something?`, ADVERB: `An adverb tells HOW something is done. Does "${picked}" tell how?`, PRONOUN: `A pronoun stands in for a name, like he, she, it or they. Does "${picked}" do that?`, PREPOSITION: `A preposition tells WHERE, like under, over or behind. Does "${picked}" tell where?` }; if (T[kind]) return T[kind]; }
      if (id === 'context') return `Try putting "${picked}" where the capital word is. Do the other words in the sentence still fit with it?`;
      if (gapLine) return `Read it out loud with your choice in the gap: "${gapLine.replace(/_{2,}/, picked).trim()}"  Does that sound right?`;
      // English: otherwise a way of working
      if (/_{2,}/.test(q.q)) return 'Try each choice in the gap and read the whole sentence. Only one will make sense and sound right.';
      if (/spelled/.test(q.q)) return 'Say the word slowly and look at every letter. Which one looks the way you have seen it in books?';
      if (/sound|rhyme|syllable/i.test(q.q)) return 'Say each word out loud, slowly, and listen. Your ears will tell you.';
    }
    // otherwise the line of the lesson that talks about the same things as this question
    const words = t => new Set(String(t).toLowerCase().match(/[a-z]{4,}/g) || []), qw = words(q.q + ' ' + q.choices.join(' '));
    let best = null, top = 0; for (const l of les || []) { let n = 0; for (const w of words(l)) if (qw.has(w)) n++; if (n > top) { top = n; best = l; } }
    return best || (les && SKILLS[q.skill].sub === 'math' ? les[0] : 'Read the question again slowly. Cross out the choices you know are wrong, then pick from what is left.');
  },
  // SKILL BUILDER: what happens when the same kind of question (or the same skill) keeps going wrong.
  // Watch a solved one -> try one with two choices -> try one with all the choices -> two on your own.
  // In the supported steps a miss is explained and the same question is asked again until it is right.
  two(q) { if (q.type === 'multi') return q; const w = pick(q.choices.map((_, i) => i).filter(i => i !== q.a)), ch = shuffle([q.choices[q.a], q.choices[w]]); return Object.assign({}, q, { choices: ch, a: ch.indexOf(q.choices[q.a]) }); },
  async builder() {
    const L = G.learn, b = L.build; L.build = null; if (!b || !SKILLS[b.id] || this.building) return;
    const og = b.g && b.g !== L.grade ? b.g : null, grp = this.grp(b.id, og), s = SKILLS[b.id], who = this.teacher(), T = 'SKILL BUILDER';
    const les = (L.grade <= 2 && LESSON_G2[b.id]) || LESSONS[b.id] || [];
    // Math: every step is the same KIND with new numbers. English: the missed item is shown and then answered,
    // but the practice in between and at the end uses OTHER items, so he learns the idea and not just one answer.
    const bank = s.sub !== 'math';
    const fresh = other => { const q = this.make(b.id, og, bank && other ? null : b.sig); if (q.type === 'num') delete q.type; return q; };
    const until = async (q, title) => { for (let i = 0; i < 3; i++) if (await this.card(q, title)) return; };
    this.building = true; L.lastBuild = L.total;
    try {
      await say(who, `Time out! "${s.n}" has tripped us up a few times. That is fine. It just means we build it up together, one small step at a time.`);
      // STEPPING BACK: if the same skill a grade earlier is not solid, three of those come first. With two right the
      // trouble is in the new part; otherwise the earlier one is built up in the rounds and this one rests for today.
      const pre = ENG.warmupFor(grp, b.id);
      if (pre) {
        await say(who, 'First, three warm-ups from a step earlier. They show me where to start.');
        let got = 0; for (let i = 0; i < 3; i++) if (await this.ask(this.make(pre.id, GRP.grade(pre.group)), `WARM-UP   ${i + 1} OF 3`, false, { noHint: 1 })) got++;
        if (ENG.warmupDone(grp, b.id, pre, got) === 'back') { await say(who, 'Good to know. We will build up the earlier step first. A few WARM-UP questions will pop up as we go, and then this one will feel much easier.'); return; }
        await say(who, 'Those are solid. So it is the new part we need to work on.');
      }
      for (let round = 0; round < 2; round++) {
        await say(who, round ? 'STEP 1 again: WATCH. Here is another one, already solved.' : 'STEP 1: WATCH. I will do one. Just look at how it works.');
        await this.card(fresh(), T + '   ·   WATCH', { demo: 1 });
        await say(who, 'STEP 2: TOGETHER. Your turn, with only two choices. If you miss, we look at why, and then you get it again.');
        await until(this.two(fresh(true)), T + '   ·   TOGETHER');
        await say(who, 'STEP 3: Now with all the choices. Take your time.');
        await until(fresh(), T + '   ·   ALMOST THERE');
        await say(who, 'STEP 4: ON YOUR OWN. Get two in a row and this one is fixed.');
        let row = 0; for (let i = 0; i < 4 && row < 2; i++) row = (await this.ask(this.make(b.id, og, bank ? null : b.sig), `${T}   ·   ON YOUR OWN   ${row} OF 2`, false, { noHint: 1 })) ? row + 1 : 0;
        if (row >= 2) {
          ENG.taught(grp, b.id, 'teach', b.sig); G.scrap += 15; Snd.sfx('badge');      // back into practice, with one more check a little later so it sticks
          await say(null, `★ SKILL BUILT: ${s.n} ★   +15 scrap`, { col: '#ffd76a' });
          await say(who, 'See? You did that. I will sneak one more in later to make sure it stuck.'); return;
        }
        if (round === 0) { await say(who, 'Not there yet, and that is OK. Let me explain it another way, and then we go again.'); for (const p of les) await say(who, p); if (typeof LPIC !== 'undefined' && LPIC[b.id]) await Pic.show(s.n, LPIC[b.id]); }
      }
      ENG.rest(grp, b.id);
      await say(who, 'We worked hard on that one. Brains keep growing while they rest, so we will leave it for today and come back to it another day.');
    } finally { this.building = false; L.build = null; }
  },
  // Night Market challenge. Higher tiers mean more questions, typed answers, word problems, and finally next-grade math.
  trialInfo(tier) { const g = G.learn.grade, up = tier >= 4 && g < 6; return { n: [2, 3, 3, 4, 5][tier - 1], typed: tier >= 3, up, allow: tier <= 2 ? 1 : 0, g: up ? g + 1 : g }; },
  async trial(tier, title) {
    const T = this.trialInfo(tier), pool = this.forGrade(T.g, 'math'); let miss = 0, last = null;
    for (let i = 0; i < T.n; i++) {
      let id = tier >= 3 && i === T.n - 1 ? 'word' : pick(pool.filter(x => x.id !== last)).id; last = id;
      let q; for (let k = 0; k < 6; k++) { q = SKILLS[id].gen(T.g); if (!T.typed || this.typable(q)) break; }
      q.skill = id; q.sig = this.sig(q, 'math'); if (T.typed && this.typable(q)) { q.type = 'num'; q.ans = q.choices[q.a]; }
      const ok = await this.ask(q, `${title}   ${i + 1} OF ${T.n}`, T.up);
      if (!ok && ++miss > T.allow) return false;
    }
    return true;
  },
  // The test a dragon egg sets before it lets itself be picked up: math and English, turn about, one miss allowed.
  async eggTrial(k) {
    const g = G.learn.grade, n = [6, 6, 8, 8, 10][k - 1], ma = shuffle(this.forGrade(g, 'math').slice()), en = shuffle(this.forGrade(g, 'ela').slice()); let miss = 0;
    for (let i = 0; i < n; i++) {
      const src = i % 2 ? en : ma, sk = src[Math.floor(i / 2) % src.length], q = this.make(sk.id);
      if (sk.sub === 'math' && this.typable(q)) { q.type = 'num'; q.ans = q.choices[q.a]; }
      if (!(await this.ask(q, `EGG TRIAL   ${i + 1} OF ${n}`)) && ++miss > 1) return false;
    }
    return true;
  },
  // A ten-question practice test under test conditions: mixed formats, no hints, score report at the end.
  async testDay() {
    const who = this.teacher(), keep = this.focus; this.focus = null;
    await say(who, 'PRACTICE TEST. Ten questions, mixed up, just like the real thing. No hints and no answers until the end. Read every question twice. Ready?');
    const got = [];
    for (let i = 0; i < 10; i++) { const q = this.next(); got.push({ q, ok: await this.ask(q, `PRACTICE TEST   ${i + 1} OF 10`, false, { test: 1 }) }); }
    this.focus = keep;
    const score = got.filter(x => x.ok).length, prize = score * 8;
    Snd.sfx(score >= 7 ? 'badge' : 'ok');
    await page(() => {
      ctx.fillStyle = 'rgba(12,6,30,.8)'; ctx.fillRect(0, 0, W, H); panel(60, 30, W - 120, H - 60);
      setFont(22, true); text('PRACTICE TEST RESULTS', W / 2, 54, '#ffd76a', 'center');
      ctx.font = '120px ' + FONT_T; ctx.textAlign = 'center'; ctx.fillStyle = score >= 8 ? '#7fe08a' : score >= 5 ? '#ffd76a' : '#ffb07a'; ctx.fillText(score + ' / 10', W / 2, 96);
      setFont(25); got.forEach((x, i) => { const cx = 110 + (i % 2) * 390, cy = 250 + Math.floor(i / 2) * 44; text(x.ok ? '✔' : '✘', cx, cy, x.ok ? '#7fe08a' : '#ff8a7a'); text(`${i + 1}. ${SKILLS[x.q.skill].n}`, cx + 34, cy, '#f4eeff'); });
      setFont(24); text(`Prize: ${prize} scrap.   ${score >= 8 ? 'Outstanding!' : score >= 5 ? 'Solid. Review the misses below.' : 'Good effort. Every miss is a skill to train.'}`, W / 2, 490, '#c8ffb8', 'center');
      text('Tap or press Z to review the ones you missed.', W / 2, 620, '#8f86a8', 'center');
    });
    G.scrap += prize;
    for (const x of got.filter(g2 => !g2.ok)) { const q = x.q, right = q.type === 'multi' ? q.as.map(i => q.choices[i]).join('  ·  ') : q.type === 'num' ? q.ans : q.choices[q.a]; await say(who, `${SKILLS[q.skill].n}: ${q.passage ? '(' + q.ptitle + ') ' : ''}${q.q}\nAnswer: ${right}.  ${q.why}`); }
    if (score >= 9) await badge('ace');
    await checkFeats();
  },
  // Called after battles: celebrate skills mastered in the field, and offer the next grade when one is complete.
  async celebrate() {
    const L = G.learn;
    while (L.fresh && L.fresh.length) { const id = L.fresh.shift(), [m, n] = this.progress(); Snd.sfx('badge'); G.scrap += 25; await say(null, `★ SKILL MASTERED: ${SKILLS[id].n} ★\nFour in a row! +25 scrap.   Grade ${L.grade} skills: ${m} of ${n}`, { col: '#ffd76a' }); }
    const [m, n] = this.progress();
    if (m >= n && !flag('grad' + L.grade)) {
      setFlag('grad' + L.grade); await badge('grad'); const who = this.teacher();
      if (L.grade < 6) { const c = await ask(who, `You have mastered ALL ${n} skills for Grade ${L.grade}. Every. Single. One. Ready to level up to Grade ${L.grade + 1} questions?`, ['Level me up!', 'Not yet']); if (c === 0) { L.grade++; ENG.reset(); await say(who, `Grade ${L.grade} it is. New skills, new tricks. I will be right here.`); } else await say(who, 'No rush. You can switch any time under Options.'); }
      else await say(who, 'That is every skill I know. You are officially smarter than the Bellringer. Keep sharp: I will keep mixing in review.');
    }
  },
  flagged() { return this.forGrade(G.learn.grade).filter(s => this.sk(s.id).miss >= 2).sort((a, b) => this.sk(b.id).miss - this.sk(a.id).miss); },
  // Offered after a battle when a concept keeps going wrong.
  async maybeOffer() {
    const L = G.learn, f = this.flagged()[0];
    if (!f || L.total - (L.lastOffer || 0) < 6) return;
    L.lastOffer = L.total;
    const who = this.teacher();
    const c = await ask(who, who === 'priya' ? `Hey, "${f.n}" keeps tripping us up. Want me to show you a trick? There's a prize if you can prove you've got it.` : `FIELD GUIDE TIP: "${f.n}" has been tricky. Want a quick lesson? Prove you've got it and earn a prize!`, ['Yes, show me!', 'Later']);
    if (c === 0) await this.lesson(f.id);
    else await say(who, 'No problem. You can find it any time in STUDY HALL, at a campfire or in the menu.');
  },
  // Teach, then require proof of understanding: three right in a row.
  async lesson(id) {
    const s = SKILLS[id], who = this.teacher(), k = this.sk(id), prev = Snd.curName;
    Snd.play('nest');
    await say(who, `LESSON: ${s.n.toUpperCase()}`, { col: '#ffd76a' });
    const les = (G.learn.grade <= 2 && LESSON_G2[id]) || LESSONS[id];
    for (const p of les) await say(who, p);
    if (typeof LPIC !== 'undefined' && LPIC[id]) await Pic.show(s.n, LPIC[id]);
    await say(who, 'Now show me. Get THREE in a row and this skill is officially MASTERED.');
    let row = 0, fails = 0;
    while (row < 3) {
      const ok = await this.ask(this.make(id, null, this.weak(k)[0]), `PROVE IT!   ${row} OF 3 DONE`);
      if (ok) row++;
      else {
        row = 0; fails++;
        const c = await ask(who, pick(['So close. That one is sneaky. Want to go again?', 'Mistakes are how brains grow. Seriously, that is science. Again?', 'No worries. Even Captain Cosmos misses sometimes. One more try?']), ['Try again', 'Hear the lesson again', 'Take a break']);
        if (c === 1) for (const p of les) await say(who, p);
        if (c === 2) { await say(who, 'Good call. Brains need rest too. Come back to STUDY HALL whenever you want.'); Snd.play(prev); return false; }
      }
    }
    Snd.sfx('badge');
    const first = !k.m; k.m = true; k.miss = 0; k.slip = 0; k.cs = 4; k.w = {}; k.wx = {}; k.rv = 0; k.due = this.day() + 1; k.box = Math.max(3, this.box(k));
    await say(null, `★ SKILL MASTERED: ${s.n} ★`, { col: '#ffd76a' });
    if (first) { G.scrap += 40; give('soda', 1, true); await say(who, 'Told you that you could do it. Here: 40 scrap and a Zap Cola. You earned them.'); }
    else await say(who, 'Still got it! Practice keeps your brain sharp.');
    Snd.play(prev); await checkFeats(); return true;
  },
  async studyHall() {
    while (true) {
      const list = this.forGrade(G.learn.grade);
      const items = list.map(s => { const k = this.sk(s.id); return { label: (k.m ? '★ ' : k.miss >= 2 ? '! ' : '· ') + s.n, right: k.n ? Math.round(100 * k.r / k.n) + '%' : '—', col: k.m ? '#ffd76a' : k.miss >= 2 ? '#ffb07a' : null }; });
      const i = await menu(items, { x: 60, y: 60, w: W - 120, rows: 12, title: `STUDY HALL — Grade ${G.learn.grade}   ★ ${this.progress()[0]} of ${this.progress()[1]} mastered   (! needs practice)` });
      if (i < 0) return;
      await this.lesson(list[i].id);
    }
  },
  // For grown-ups: accuracy by skill, with the standard each one maps to.
  async report() {
    const L = G.learn, list = this.forGrade(L.grade);
    await page(() => {
      ctx.fillStyle = 'rgba(6,4,14,.9)'; ctx.fillRect(0, 0, W, H); panel(20, 14, W - 40, H - 28);
      setFont(18, true); text('REPORT CARD', 44, 34, '#ffd76a');
      setFont(24); text(`Grade ${L.grade}  ·  ${L.right}/${L.total} correct (${L.total ? Math.round(100 * L.right / L.total) : 0}%)  ·  best streak ${L.best}  ·  rank: ${brainRank(L.right)}`, 44, 64, '#e8e0f4');
      setFont(21);
      { const st = this.standing(), nm = a => a.slice(0, 3).map(x => x.n).join(', ') || '—'; setFont(20); text(`Working on: ${nm(st.weak)}     Strongest: ${nm(st.strong)}`, 44, 84, '#ffd76a'); }
      list.forEach((s, i) => {
        const k = this.sk(s.id), col = i % 2, x = 44 + col * 446, y = 112 + Math.floor(i / 2) * Math.min(44, Math.floor(540 / Math.ceil(list.length / 2)));
        text((k.m ? '★ ' : '') + s.n, x, y, k.m ? '#ffd76a' : k.miss >= 2 ? '#ffb07a' : '#fff');
        text(k.n ? `${k.r}/${k.n}` : '—', x + 420, y, '#fff', 'right');
        { const lab = `${DOMAIN[s.id] || (s.sub === 'math' ? 'Math' : 'ELA')} · ${s.std}`; text(lab.length > 50 ? lab.slice(0, 49) + '…' : lab, x, y + 20, '#8f86a8'); }
      });
      setFont(20); { const w = L.writing, mz = L.maze && L.maze.length ? Math.max(...L.maze.map(x => x.s)) : null, o = L.orf && L.orf.length ? L.orf[L.orf.length - 1] : null; text(`Writing ${w ? w.r + '/' + w.n : '—'}   ·   Maze Dash best ${mz == null ? '—' : mz}   ·   Read-aloud ${o ? o.wcpm + ' words/min, ' + o.acc + '%' : '—'}   ·   ★ = mastered`, 44, H - 50, '#c8ffb8'); }
    });
    // page 2: the exact things being missed, fact speed, and what is due for review
    const today = this.day(), rows = [];
    for (const s2 of list) { const k = this.sk(s2.id); for (const h of Object.keys(k.wx || {})) rows.push([s2.n, k.wx[h]]); }
    const ff = L.ff || {}, slow = Object.keys(ff).filter(f => ff[f][1] > 0 || ff[f][0] > 3500).sort((a, b) => (ff[b][1] - ff[a][1]) || (ff[b][0] - ff[a][0])).slice(0, 8);
    const dash = L.dash && L.dash.length ? L.dash[L.dash.length - 1] : null, bestDash = L.dash && L.dash.length ? Math.max(...L.dash.map(d => d.n)) : 0;
    const mastered = list.filter(s2 => this.sk(s2.id).m), dueNow = mastered.filter(s2 => (this.sk(s2.id).due || 0) <= today).length, head = list.filter(s2 => this.sk(s2.id).head && !this.sk(s2.id).m).length;
    await page(() => {
      ctx.fillStyle = 'rgba(6,4,14,.9)'; ctx.fillRect(0, 0, W, H); panel(20, 14, W - 40, H - 28);
      setFont(18, true); text('WHAT TO PRACTISE', 44, 34, '#ffd76a'); let y = 74;
      setFont(22); text(rows.length ? 'Kinds of question missed and not yet fixed (an example of each, with the answer):' : 'No missed kinds are waiting to be fixed. ', 44, y, '#c8ffb8'); y += 32;
      setFont(21); rows.slice(0, 9).forEach(r => { text(r[0], 44, y, '#ffb07a'); wrap(r[1], W - 330).slice(0, 2).forEach((l, i) => text(l, 270, y + i * 23, '#f4eeff')); y += 50; });
      y = Math.max(y + 6, 150); setFont(18, true); text('NUMBER FACTS', 44, y, '#ffd76a'); y += 34; setFont(22);
      text(dash ? `Last Fact Dash: ${dash.n} right, ${dash.w} wrong in one minute.   Best: ${bestDash}.` : 'No Fact Dash yet. It is under Practice & Tests and takes one minute.', 44, y, '#f4eeff'); y += 28;
      if (slow.length) { text('Slow or missed facts: ' + slow.join(',   '), 44, y, '#ffb07a'); y += 28; }
      y += 8; setFont(18, true); text('REVIEW', 44, y, '#ffd76a'); y += 34; setFont(22);
      text(`Skills mastered: ${mastered.length}.  Due for review today: ${dueNow}.  Reviews come back after 1, 3, 7, 14, 30 and 60 days.`, 44, y, '#f4eeff'); y += 28;
      text(L.placed === L.grade ? `Quick check done. ${head} skills still have a head start from it.` : 'Quick check not done yet. It is under Practice & Tests.', 44, y, '#f4eeff');
      setFont(20); text('Tap to close.', W - 60, H - 50, '#8f86a8', 'right');
    });
  }
};
// The Skill Builder never interrupts a trial, a lesson or a practice test. It waits for the next ordinary question.
for (const f of ['trial', 'eggTrial', 'lesson', 'testDay']) { const o = Learn[f]; Learn[f] = async function (...a) { this.hold = (this.hold || 0) + 1; try { return await o.apply(this, a); } finally { this.hold--; } }; }
