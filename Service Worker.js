// Service worker
const cacheName = "Checkers v6.5";
const appShellFiles = [
    "american flag.jpeg",
    "kenyan flag.jpeg",
    "casino flag.jpeg", 
    "international flags.jpeg",
    "pool flag.jpeg",
    "russian flag.jpeg",
    "nigerian flag.jpeg",
    "background.jpeg", 
    "black cell.jpeg", 
    "white cell.jpeg",
    "hint.png", 
    "menu.png", 
    "restart.png", 
    "undo.png", 
    "about.png",
    "black piece.png",
    "white piece.png", 
    "black crown.png", 
    "white crown.png",
    "send.png", 
    "cancel.png",
    "alert.png",
    "confirm.png", 
    "winner.png",
    "loser.png", 
    "draw.png",
    "load.png",
    "dice roll.png",
    "lock.png", 
    "star.png", 
    "click.mp3",
    "capture.mp3", 
    "king.mp3", 
    "collect.mp3",
    "game win.mp3", 
    "game lose.mp3", 
    "notification.mp3", 
    "https://cdn.pubnub.com/sdk/javascript/pubnub.4.29.9.js", 
    "AI.js", 
    "UI.js", 
    "Channel.js", 
    "Core.js", 
    "Worker.js", 
    "index.css", 
    "index.html"
];

self.addEventListener("install", (e) => {
    e.waitUntil(
        caches.open(cacheName).then((cache) => {
            return cache.addAll(appShellFiles);
        })
    )
});

self.addEventListener("fetch", (e) => {
    e.respondWith(
        caches.match(e.request).then((res1) => {
            if(res1) {
                if(navigator.onLine && (e.request.url.includes(".js") || e.request.url.includes(".css") || e.request.url.includes(".html"))) {
                    return fetch(e.request).then((res2) => {
                   	    return caches.open(cacheName).then((cache) => {
                            cache.put(e.request, res2.clone());
                            return res2;
                        })
                    }).catch((error) => {
                        return res1;
                    })
                } 
                return res1;
            }
            else {
                return fetch(e.request).then((res2) => {
                    return caches.open(cacheName).then((cache) => {
                        cache.put(e.request, res2.clone());
                        return res2;
                    })
                })
             }
        })
    )
});

self.addEventListener("activate", (e) => {
    const keepList = [cacheName];
    
    e.waitUntil(
        caches.keys().then((keyList) => {
            return Promise.all(keyList.map((key) => {
                if(keepList.indexOf(key) === -1) {
                    return caches.delete(key);
                } 
            }))
        })
    )
});



