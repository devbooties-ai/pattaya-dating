// Minimal service worker for static shell only. No chat, user or media caching.
const CACHE='pattaya-dating-prototype-v05';
self.addEventListener('install',event=>{event.waitUntil(caches.open(CACHE).then(cache=>cache.addAll(['./index.html','./icon.svg','./manifest.webmanifest'])));self.skipWaiting()});
self.addEventListener('activate',event=>{event.waitUntil(caches.keys().then(keys=>Promise.all(keys.filter(key=>key!==CACHE).map(key=>caches.delete(key)))));self.clients.claim()});
self.addEventListener('fetch',event=>{if(event.request.method!=='GET'||event.request.mode==='navigate')return;const url=new URL(event.request.url);if(url.origin!==self.location.origin)return;if(!['/icon.svg','/manifest.webmanifest'].some(end=>url.pathname.endsWith(end)))return;event.respondWith(caches.match(event.request).then(cached=>cached||fetch(event.request)))});
