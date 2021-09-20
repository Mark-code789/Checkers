// Service worker
const cacheName = "Checkers v6.5.44";
const appShellFiles = [
    "./src/images/american flag.jpeg",
    "./src/images/kenyan flag.jpeg",
    "./src/images/casino flag.jpeg", 
    "./src/images/international flags.jpeg",
    "./src/images/pool flag.jpeg",
    "./src/images/russian flag.jpeg",
    "./src/images/nigerian flag.jpeg",
    "./src/images/background.jpeg", 
    "./src/images/black cell.jpeg", 
    "./src/images/white cell.jpeg",
    "./src/images/hint.png", 
    "./src/images/menu.png", 
    "./src/images/restart.png", 
    "./src/images/undo.png", 
    "./src/images/about.png",
    "./src/images/black piece.png",
    "./src/images/white piece.png", 
    "./src/images/black crown.png", 
    "./src/images/white crown.png",
    "./src/images/send.png", 
    "./src/images/cancel.png",
    "./src/images/alert.png",
    "./src/images/confirm.png", 
    "./src/images/winner.png",
    "./src/images/loser.png", 
    "./src/images/draw.png",
    "./src/images/load.png",
    "./src/images/dice roll.png",
    "./src/images/lock.png", 
    "./src/images/star.png", 
    "./src/audio/click.mp3",
    "./src/audio/capture.mp3", 
    "./src/audio/king.mp3", 
    "./src/audio/collect.mp3",
    "./src/audio/game win.mp3", 
    "./src/audio/game lose.mp3", 
    "./src/audio/notification.mp3", 
    "https://cdn.pubnub.com/sdk/javascript/pubnub.4.32.1.min.js", 
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
            if(navigator.onLine && /(?<!min).(html|css|js)(.*?)$/g.test(e.request.url) || !res1) {
                return fetch(e.request).then((res2) => {
                    return caches.open(cacheName).then((cache) => {
                        cache.put(e.request, res2.clone());
                        return res2;
                    })
                })
             }
             else {
             	return res1
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



