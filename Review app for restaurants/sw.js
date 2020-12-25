self.cacheName='cache-v2';

self.addEventListener('activate',function(event){
    console.log("sw: Activation of service worker")
    event.waitUntil(
        caches.keys().then(function(keys){
            return Promise.all(
                keys.map(key=>{
                    if(key!=self.cacheName){
                        return caches.delete(key);
                    }
                })
            )
        })
    )
})

self.addEventListener('install',function(event){
    console.log("sw: install sw");
})


self.addEventListener('fetch',function(event){
    var requestURL=event.request.url;
    console.log("sw: Fetch event for url:",event.request.url);
    //special case for handling restaurant.html?id=[0-9]
    var queryMatcher=event.request.url.match("restaurant.html\\?id=[0-9]");
    if(queryMatcher){
        requestURL=event.request.url.split('?')[0];
        console.log("sw: fetch is for restaurant.html so request is modified for ", requestURL);
    }

    event.respondWith(
        caches.open(self.cacheName).then(cache=>{
            return cache.match(requestURL).then(reponse=>{
                if(reponse){
                    console.log("sw: Available in cache for ",requestURL);
                    return reponse;
                }
                console.log("sw: Fetching from network for ",requestURL);
                return fetch(event.request).then(networkResponse=>{
                        cache.put(requestURL,networkResponse.clone());
                        return networkResponse;
                }).catch(networkResponse=>{
                    console.log("sw: for url ",requestURL,"netwrork error popped",networkResponse);
                    return "Network Error:"+networkResponse;
                })
            })
        })
    )
})
