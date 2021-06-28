const PREFIX = 'V2'

self.addEventListener('install', (e) =>{
    self.skipWaiting()
    e.waitUntil((async () =>{
        const cache = await caches.open(PREFIX)
        cache.add(new Request ("/offline.html"))
    })())
    console.log(`${PREFIX} install`);
})

self.addEventListener('activate', (e) =>{
    clients.claim()
    e.waitUntil((async () => {
        const keys = await caches.keys()
        await Promise.all(
            keys.map((key) =>{
                if(!key.includes(PREFIX)){
                    return caches.delete(key)
                }
            })
        )
    })())
    console.log(`${PREFIX} active`);
})

self.addEventListener('fetch', (e) =>{
    console.log(`${PREFIX}Fetching: ${e.request.url}, Mode: ${e.request.mode}`);
    if(e.request.mode === "navigate"){
        e.respondWith((async () =>{
            try{
                const preloadResponse = await e.preloadResponse
                if(preloadResponse){
                    return preloadResponse
                }
                return await fetch(e.request)
            } catch(error){
                const cache = await caches.open(PREFIX)
                return await cache.match("/offline.html")
            }
        })());
    }
})