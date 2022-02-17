// Service worker
const version = 20;
const cacheName = "Checkers - " + version;
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
    "./src/images/homescreen 48icon.png",
    "./src/images/homescreen 96icon.png",
    "./src/images/homescreen 144icon.png",
    "./src/images/homescreen 192icon.png",
    "./src/images/homescreen 256icon.png",
    "./src/images/homescreen 512icon.png",
    "./src/images/favicon16.png",
    "./src/images/favicon32.png",
    "./src/images/favicon96.png",
    "./src/images/favicon.ico",
    "./src/images/lock.png", 
    "./src/images/star.png", 
    "./src/images/Sololearn.png", 
    "./src/images/Github.png", 
    "./src/images/LinkedIn.png", 
    "./src/images/Facebook.png", 
    "./src/images/Twitter.png", 
    "./src/images/Instagram.png", 
    "./src/audio/click.mp3",
    "./src/audio/capture.mp3", 
    "./src/audio/king.mp3", 
    "./src/audio/collect.mp3",
    "./src/audio/game win.mp3", 
    "./src/audio/game lose.mp3", 
    "./src/audio/notification.mp3", 
    "./AI.js", 
    "./UI.js", 
    "./Channel.js", 
    "./Core.js", 
    "./Worker.js", 
    "./index.css", 
    "./index.html",
    "./manifest.webmanifest", 
    "https://cdn.pubnub.com/sdk/javascript/pubnub.5.0.0.min.js", 
    "./"
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
        caches.match(e.request, {cacheName, ignoreSearch: true}).then((res) => {
        	if(res) {
            	return res;
            }
            else if(!e.request.url.includes("pndsn.com")) {
            	console.log(e.request.url);
            } 
            
            return fetch(e.request).then((res2) => {
            	if(!res2 || res2.status != 200 || e.request.url.includes("pndsn.com")) {
            		return res2;
            	} 
            	
                return caches.open(cacheName).then((cache) => {
                    cache.put(e.request, res2.clone());
                    return res2;
                }).catch((error) => {
					console.log("Put Error", error);
					return res2;
				});
            }).catch((error) => {
            	console.log("Fetch Error", error);
            	return res;
            });
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

self.addEventListener("message", (e) => {
	if(e.data && e.data.type == "skip-waiting") {
		self.skipWaiting();
	} 
});

