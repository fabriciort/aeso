// Minimal service worker: makes AESo installable. It does not cache anything,
// so deploys are always picked up immediately.
self.addEventListener('install', () => self.skipWaiting())
self.addEventListener('activate', (event) => event.waitUntil(self.clients.claim()))
self.addEventListener('fetch', () => {})
