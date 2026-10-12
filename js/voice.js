// The game's own reading voice: a natural-sounding neural voice (Piper) that runs on the device, off the main thread.
// It needs no internet once the game is installed. If the device is too slow for it, Speak falls back to the device voice.
const Voice = {
  state: 'off', rtf: 0, w: null, n: 0, wait: {}, cache: new Map(), src: null, err: '',
  base() { return window.LBSpeech ? 'https://lastbell.local/tts/' : new URL('tts/', location.href).href; },
  ready() { return this.state === 'ready'; },
  // fast enough to keep up with a child reading along
  good() { return this.state === 'ready' && this.rtf > 0 && this.rtf < 2.5; },
  start() {
    if (this.state !== 'off') return; this.state = 'loading';
    try {
      const code = '(' + this.worker.toString() + ')()';
      this.w = new Worker(URL.createObjectURL(new Blob([code], { type: 'text/javascript' })));
      this.w.onerror = e => { this.fail(e.message || 'worker'); };
      this.w.onmessage = e => {
        const m = e.data;
        if (m.t === 'ready') this.test();
        else if (m.t === 'pcm' || m.t === 'err') { const f = this.wait[m.id]; delete this.wait[m.id]; if (m.t === 'err' && !m.id) this.fail(m.msg); if (f) f(m.t === 'pcm' ? m : null); }
      };
      this.w.postMessage({ t: 'init', base: this.base() });
    } catch (e) { this.fail(String(e)); }
  },
  fail(msg) { this.state = 'bad'; this.err = msg; for (const k in this.wait) { this.wait[k](null); } this.wait = {}; try { this.w && this.w.terminate(); } catch (e) {} },
  raw(text, rate) { return new Promise(res => { const id = ++this.n; this.wait[id] = res; this.w.postMessage({ t: 'syn', id, text, rate }); }); },
  // time a short sentence once, so a slow tablet uses its own voice instead of making the child wait
  async test() {
    await this.raw('Ready.', 1);
    const m = await this.raw('This is how I sound when I read to you.', 1);
    if (!m) { this.fail('test'); return; }
    this.rtf = m.ms / 1000 / (m.pcm.length / m.sr); this.state = 'ready';
  },
  // one sentence -> an AudioBuffer (remembered, so a repeat is instant)
  async get(text, rate) {
    if (!this.ready() || !Snd.ac) return null;
    const key = rate + '|' + text; let p = this.cache.get(key);
    if (!p) {
      p = this.raw(text, rate).then(m => { if (!m) { this.cache.delete(key); return null; } const b = Snd.ac.createBuffer(1, m.pcm.length, m.sr); b.getChannelData(0).set(m.pcm); return b; });
      this.cache.set(key, p); if (this.cache.size > 60) this.cache.delete(this.cache.keys().next().value);
    }
    return p;
  },
  play(buf, onEnd) {
    this.stop();
    const s = Snd.ac.createBufferSource(), g = Snd.ac.createGain(); g.gain.value = Snd.muted ? 0 : 1;
    s.buffer = buf; s.connect(g); g.connect(Snd.ac.destination); s.onended = () => { if (this.src === s) { this.src = null; onEnd(); } };
    this.src = s; s.start();
  },
  stop() { const s = this.src; this.src = null; if (s) { try { s.onended = null; s.stop(); } catch (e) {} } },
  // Runs inside the worker. Kept self-contained: it is turned into text and loaded from a Blob.
  worker: function () {
    let B, sess, cfg, phon, q = Promise.resolve();
    const init = async base => {
      B = base; importScripts(B + 'ort.wasm.min.js');
      ort.env.wasm.wasmPaths = B; ort.env.wasm.numThreads = 1;
      const [mod, cj, buf] = await Promise.all([import(B + 'phonemizer.js'), fetch(B + 'voice.json').then(r => r.json()), fetch(B + 'voice.onnx').then(r => r.arrayBuffer())]);
      phon = mod.phonemize; cfg = cj;
      sess = await ort.InferenceSession.create(buf, { executionProviders: ['wasm'], graphOptimizationLevel: 'all' });
    };
    const syn = async (text, rate) => {
      const t0 = Date.now(), map = cfg.phoneme_id_map, bits = text.split(/([,.!?;:]+)/); let ph = '';
      for (let i = 0; i < bits.length; i++) {
        const s = bits[i]; if (!s.trim()) continue;
        if (i % 2) ph += s[0]; else ph += (ph ? ' ' : '') + (await phon(s.trim(), cfg.espeak.voice || 'en-us')).join(' ');
      }
      const ids = [map['^'][0], 0];
      for (const c of ph) if (map[c]) ids.push(map[c][0], 0);
      ids.push(map['$'][0]);
      const inf = cfg.inference || {};
      const out = await sess.run({
        input: new ort.Tensor('int64', BigInt64Array.from(ids.map(BigInt)), [1, ids.length]),
        input_lengths: new ort.Tensor('int64', BigInt64Array.from([BigInt(ids.length)]), [1]),
        scales: new ort.Tensor('float32', Float32Array.from([inf.noise_scale || .667, (inf.length_scale || 1) / (rate || 1), inf.noise_w || .8]), [3])
      });
      const pcm = new Float32Array(out[Object.keys(out)[0]].data);
      // even loudness from sentence to sentence
      let pk = 0; for (let i = 0; i < pcm.length; i++) { const a = pcm[i] < 0 ? -pcm[i] : pcm[i]; if (a > pk) pk = a; }
      if (pk > .01) { const k = .85 / pk; for (let i = 0; i < pcm.length; i++) pcm[i] *= k; }
      // soft edges so sentences do not click
      const f = Math.min(400, pcm.length >> 1); for (let i = 0; i < f; i++) { pcm[i] *= i / f; pcm[pcm.length - 1 - i] *= i / f; }
      return { pcm, sr: cfg.audio.sample_rate, ms: Date.now() - t0 };
    };
    onmessage = e => {
      const m = e.data;
      q = q.then(async () => {
        try {
          if (m.t === 'init') { await init(m.base); postMessage({ t: 'ready' }); }
          else if (m.t === 'syn') { const r = await syn(m.text, m.rate); postMessage({ t: 'pcm', id: m.id, pcm: r.pcm, sr: r.sr, ms: r.ms }, [r.pcm.buffer]); }
        } catch (err) { postMessage({ t: 'err', id: m.id || 0, msg: String(err && err.message || err) }); }
      });
    };
  }
};
