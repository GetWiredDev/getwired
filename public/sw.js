// No-op service worker – prevents 404 errors from PWA manifest detection.
self.addEventListener("install", () => self.skipWaiting());
self.addEventListener("activate", (event) => event.waitUntil(self.clients.claim()));

