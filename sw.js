// Offline support: the game is saved on the device after the first visit.
const CACHE = 'last-bell-v33';
const VOICE = 'last-bell-voice-1';   // the reading voice is big, so it is kept across game updates
const CORE = ['./', './index.html', './manifest.json', './icon-192.png', './icon-512.png', './js/engine.js?v=33', './js/snd.js?v=33', './js/voice.js?v=33', './js/art.js?v=33', './js/data.js?v=33', './js/learn.js?v=33', './js/grader.js?v=33', './js/learn2.js?v=33', './js/world.js?v=33', './js/battle.js?v=33', './js/story.js?v=33', './js/game.js?v=33'];
self.addEventListener('install', e => { e.waitUntil(caches.open(CACHE).then(c => c.addAll(CORE)).then(() => self.skipWaiting())); });
self.addEventListener('activate', e => { e.waitUntil(caches.keys().then(ks => Promise.all(ks.filter(k => k !== CACHE && k !== VOICE).map(k => caches.delete(k)))).then(() => self.clients.claim())); });
self.addEventListener('fetch', e => {
  if (e.request.method !== 'GET') return;
  if (/\/tts\//.test(e.request.url)) { e.respondWith(caches.open(VOICE).then(c => c.match(e.request).then(hit => hit || fetch(e.request).then(r => { if (r && r.ok) c.put(e.request, r.clone()); return r; })))); return; }
  const font = /fonts\.(googleapis|gstatic)\.com/.test(e.request.url);
  const save = r => { if (r && (r.ok || r.type === 'opaque')) { const copy = r.clone(); caches.open(CACHE).then(c => c.put(e.request, copy)); } return r; };
  // Fonts: use the saved copy first. Game files: newest from the network when online, saved copy when not.
  e.respondWith(font
    ? caches.match(e.request).then(hit => hit || fetch(e.request).then(save))
    : fetch(e.request).then(save).catch(() => caches.match(e.request, { ignoreSearch: true }).then(hit => hit || caches.match('./index.html'))));
});
