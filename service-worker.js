self.addEventListener('install', function (event) {
    event.waitUntil(
        caches.open('v1').then(function (cache) {
            return cache.addAll([
                '/progress-tracker/',
                '/progress-tracker/index.html',
                '/progress-tracker/styles.css',
                '/progress-tracker/progress-tracker.js',
                '/progress-tracker/4795155.png'
            ]);
        })
    );
});

self.addEventListener('fetch', function (event) {
    event.respondWith(
        caches.match(event.request).then(function (response) {
            return response || fetch(event.request);
        })
    );
});
