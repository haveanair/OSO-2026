/* OSO offline shell — development preview only.
 * Network-first to keep web and TWA updates in sync; cache fallback for repeat visits.
 * NEVER caches external URLs, ranking submissions, or non-GET requests.
 */
const CACHE = "oso-tourism-shell-20261118-v9";
const ROOT = new URL("./", self.location.href).pathname;
const INDEX = new URL("./index.html", self.location.href).href;
const PRECACHE = [
  "./index.html",
  "./manifest.webmanifest",
  "./oso-i18n.js",
  "./oso-game-i18n.js",
  "./oso-rpg-strings.js",
  "./oso-rpg-dynamic.js",
  "./oso-i18n.css",
  "./sp1/sotris-integration.js",
  "./rpg-field-actions.js",
  "./rpg-save-confirm.js",
  "./nongae-unlock-wrap.js",
  "./run-distance-speed.js",
  "./character-special-abilities.js",
  "./character-aspect-guard.js",
  "./nongae-heaven-jade-fx.js",
  "./silk-stack-endless.js",
  "./character-performance-bonus.js",
  "./result-auto-collapse.js",
  "./assets/nongae-01.webp",
  "./assets/nongae-02.webp",
  "./assets/kf21-approved-top.webp",
  "./assets/kf21-game-topdown.webp"
];
self.addEventListener("install", event => {
  event.waitUntil((async () => {
    const cache = await caches.open(CACHE);
    await Promise.all(PRECACHE.map(async path => {
      try {
        const request = new Request(new URL(path, self.location.href), { cache: "reload" });
        const refresh = navigate || /^oso-.*\.(?:js|css)$/.test(url.pathname.split("/").pop());
      const response = await fetch(request, refresh ? { cache: "reload" } : undefined);
        if (response.ok) await cache.put(request, response);
      } catch (error) {
        // Never abort installation for a transient failure or an optional module.
        console.warn("OSO precache skipped", path, error);
      }
    }));
    await self.skipWaiting();
  })());
});
self.addEventListener("activate", event => {
  event.waitUntil((async () => {
    const names = await caches.keys();
    await Promise.all(names.filter(name => name.startsWith("oso-tourism-shell-") && name !== CACHE).map(name => caches.delete(name)));
    await self.clients.claim();
  })());
});
const offlinePage = () => new Response(`<!doctype html><html lang="ko"><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>어서오소! / OSO!</title><style>body{font-family:system-ui,'Noto Sans KR',sans-serif;background:#fff3d0;color:#493321;display:grid;min-height:100vh;place-items:center;text-align:center;margin:0;padding:24px}main{background:white;border-radius:24px;padding:28px;max-width:400px;box-shadow:0 5px 20px #a8763635}h1{font-size:25px}button{border:0;background:#ffc928;border-radius:12px;padding:13px 28px;font-size:18px;font-weight:bold}</style><main><h1>🕹️ 어서오소! / OSO!</h1><p>인터넷 연결을 확인하고 다시 시도해 주세요.</p><p>Please check your internet connection and try again.</p><button onclick="location.reload()">다시 시도 / Retry</button></main></html>`, { status: 503, headers: { "Content-Type": "text/html; charset=utf-8" } });
self.addEventListener("fetch", event => {
  const request = event.request;
  if (request.method !== "GET") return;
  const url = new URL(request.url);
  if (url.origin !== self.location.origin || !url.pathname.startsWith(ROOT)) return;
  const navigate = request.mode === "navigate";
  // Only support game files and navigation. Pass all third-party maps through.
  if (!navigate && !["script", "style", "image", "manifest", "font"].includes(request.destination)) return;
  event.respondWith((async () => {
    const cache = await caches.open(CACHE);
    try {
      const response = await fetch(request);
      if (response.ok && response.type === "basic") {
        const key = navigate ? INDEX : request;
        event.waitUntil(cache.put(key, response.clone()).catch(() => {}));
      }
      return response;
    } catch (_) {
      const cached = navigate
        ? await cache.match(INDEX)
        : (await cache.match(request)) || (await cache.match(request, { ignoreSearch: true }));
      return cached || (navigate ? offlinePage() : Response.error());
    }
  })());
});
