// Service worker
const version = "550";
const cacheName = "Checkers-v:" + version;
const appShellFiles = [
    "./src/images/american flag.jpeg",
    "./src/images/kenyan flag.jpeg",
    "./src/images/casino flag.jpeg", 
    "./src/images/international flags.jpeg",
    "./src/images/pool flag.jpeg",
    "./src/images/russian flag.jpeg",
    "./src/images/nigerian flag.jpeg",
    "./src/images/background1.jpeg", 
    "./src/images/background2.jpeg", 
    "./src/images/background3.jpeg", 
    "./src/images/black cell.jpeg", 
    "./src/images/white cell.jpeg",
    "./src/images/sound on.png",
    "./src/images/sound off.png",
    "./src/images/frame.jpeg",
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
    "./src/images/contact.png",
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
    "./src/images/bin.png",
    "./src/images/bin lid.png",
    "./src/images/copy.png",
    "./src/images/warning.png", 
    "./src/images/lock.png", 
    "./src/images/star.png", 
    "./src/images/channel image.png", 
    "./src/images/player image.png",
    "./src/images/status image.png", 
    "./src/images/channel joined image.png", 
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
    "./src/objects.js", 
    "./src/ai.js", 
    "./src/app.js", 
    "./src/channel.js", 
    "./src/core.js", 
    "./src/worker.js", 
    "./src/app.css", 
    "./manifest.webmanifest", 
    "./index.js", 
    "./index.css", 
    "./index.html"
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
        caches.match(e.request.url.replace(/html\/.*$/i, 'html').replace(/checkers\/$/i, (t) => t + "index.html"), {cacheName, ignoreSearch: true}).then( async (res) => {
        	if(res && !/objects.js$/gi.test(e.request.url)) {
            	return res;
            }
            
            return fetch(e.request).then((res2) => {
            	if(e.request.url.includes("pndsn.com")) {
            		return res2; 
					/*Not storing this kind of request*/
            	} 
            	if(res2.status != 200) {
	            	return res || res2;
            	} 
            	
                return caches.open(cacheName).then((cache) => {
                    cache.put(e.request.url.split("?")[0], res2.clone());
                    return res2;
                }).catch((error) => {
					return res2;
				});
            }).catch((error) => {
            	console.log(e.request.url);
            	return res || new Response(null, {"status": 200});
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

self.addEventListener("message", async (e) => {
	if(e.data && e.data.type == "skip-waiting") {
		self.skipWaiting();
	} 
	else if(e.data && e.data.type == "move-search") {
		sendMsg(e.data.content);
		await searchMove(e.data.content);
	} 
});

function sendMsg(msg) {
	self.clients.matchAll({type: 'window'}).
	then((clients) => {
		for(let client of clients) {
			client.postMessage(msg);
		} 
	});
} 

