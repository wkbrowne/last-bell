// Offline support: the game is saved on the device after the first visit.
const CACHE = 'last-bell-v108';
const CORE = ['./', './index.html', './manifest.json', './icon-192.png', './icon-512.png', './js/engine.js?v=108', './js/snd.js?v=108', './js/art.js?v=108', './js/hero.js?v=108', './js/data.js?v=108', './js/learn-core.js?v=108', './js/learn.js?v=108', './js/grader.js?v=108', './js/learn2.js?v=108', './js/world.js?v=108', './js/battle.js?v=108', './js/story.js?v=108', './js/sky.js?v=108', './js/quests.js?v=108', './js/game.js?v=108', './js/playlog.js?v=108'];
self.addEventListener('install', e => { e.waitUntil(caches.open(CACHE).then(c => c.addAll(CORE)).then(() => self.skipWaiting())); });
self.addEventListener('activate', e => { e.waitUntil(caches.keys().then(ks => Promise.all(ks.filter(k => k !== CACHE).map(k => caches.delete(k)))).then(() => self.clients.claim())); });
self.addEventListener('fetch', e => {
  if (e.request.method !== 'GET') return;
  const font = /fonts\.(googleapis|gstatic)\.com/.test(e.request.url);
  const save = r => { if (r && (r.ok || r.type === 'opaque')) { const copy = r.clone(); caches.open(CACHE).then(c => c.put(e.request, copy)); } return r; };
  // Fonts: use the saved copy first. Game files: newest from the network when online, saved copy when not.
  e.respondWith(font
    ? caches.match(e.request).then(hit => hit || fetch(e.request).then(save))
    : fetch(e.request).then(save).catch(() => caches.match(e.request, { ignoreSearch: true }).then(hit => hit || caches.match('./index.html'))));
});
