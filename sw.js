self.addEventListener('install', event => {
    event.waitUntil(
      caches.open('v1').then(cache => {
        return cache.addAll([
            '/Zenith/',  // Update this path
            '/Zenith/index.html',  // Update this path
            '/Zenith/style.css',  // Update this path
            '/Zenith/script.js',  // Update this path
            '/Zenith/Favicons/favicon_package_v0.16/favicon-192x192.png',  // Update this path
            '/Zenith/Favicons/favicon_package_v0.16/favicon-512x512.png'  // Update this path
        ]);
      })
    );
  });
  
  self.addEventListener('fetch', event => {
    event.respondWith(
      caches.match(event.request).then(response => {
        return response || fetch(event.request);
      })
    );
  });
  