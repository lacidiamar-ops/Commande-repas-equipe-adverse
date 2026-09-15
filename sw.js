const VERSION = "44";

self.addEventListener("install", () => self.skipWaiting());
self.addEventListener("activate", event => event.waitUntil(self.clients.claim()));

self.addEventListener("push", event => {
  let data = {};
  try { data = event.data ? event.data.json() : {}; }
  catch (_error) { data = { body:event.data ? event.data.text() : "Nouvelle demande reçue" }; }
  const title = data.title || "Commande repas — API Restauration";
  const options = {
    body:data.body || "Une nouvelle demande nécessite votre attention.",
    icon:"./icon-192.png?v=" + VERSION,
    badge:"./favicon-32.png?v=" + VERSION,
    tag:data.tag || "commande-repas",
    renotify:true,
    data:{ url:data.url || "./?admin=demandes", requestId:data.requestId || "" }
  };
  event.waitUntil(self.registration.showNotification(title, options));
});

self.addEventListener("notificationclick", event => {
  event.notification.close();
  const target = new URL((event.notification.data && event.notification.data.url) || "./?admin=demandes", self.registration.scope).href;
  event.waitUntil((async () => {
    const windows = await self.clients.matchAll({ type:"window", includeUncontrolled:true });
    for (const client of windows){
      if ("navigate" in client) await client.navigate(target);
      if ("focus" in client) return client.focus();
    }
    return self.clients.openWindow(target);
  })());
});
