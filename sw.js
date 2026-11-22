const CACHE = 'acbt-perf-v84';
const ASSETS = ['/', '/index.html', '/fonts/fonts.css', '/fonts/manrope-var.woff2', '/fonts/jetbrains-mono-500.woff2', '/fonts/jetbrains-mono-700.woff2'];
self.addEventListener('install', e => { e.waitUntil(caches.open(CACHE).then(c => c.addAll(ASSETS))); self.skipWaiting(); });
self.addEventListener('activate', e => { e.waitUntil(caches.keys().then(keys => Promise.all(keys.filter(k => k !== CACHE && k !== 'acbt-share').map(k => caches.delete(k))))); self.clients.claim(); });
// Partage d'un fichier GPX depuis une autre appli (SDVFR…) : « Partager » → Performances
self.addEventListener('fetch', e => {
  const u = new URL(e.request.url);
  if (e.request.method === 'POST' && u.pathname === '/share-gpx') {
    e.respondWith((async () => {
      try {
        const fd = await e.request.formData();
        const f = fd.getAll('gpx').find(x => x && typeof x.text === 'function');
        if (f) { const c = await caches.open('acbt-share'); await c.put('/shared-gpx', new Response(await f.text(), { headers: { 'Content-Type': 'application/gpx+xml' } })); }
      } catch (err) {}
      return Response.redirect('/?gpx=partage', 303);
    })());
    return;
  }
  e.respondWith(fetch(e.request).catch(() => caches.match(e.request)));
});
