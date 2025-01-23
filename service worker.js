// Service worker
const version = "560";
const cacheName = "Checkers-v:" + version;
const appShellFiles = [
    "./src/images/alert.png",
    "./src/images/confirm.png", 
    "./src/images/winner.png",
    "./src/images/loser.png", 
    "./src/images/draw.png",
    "./src/images/load.png",
    "./src/images/dice roll.png",
	"./src/images/contact.png",
	"./src/images/american flag.jpeg",
    "./src/images/kenyan flag.jpeg",
    "./src/images/casino flag.jpeg", 
    "./src/images/international flags.jpeg",
    "./src/images/pool flag.jpeg",
    "./src/images/russian flag.jpeg",
    "./src/images/nigerian flag.jpeg",
    "./src/images/black piece.png",
    "./src/images/white piece.png",
    "./src/images/cancel.png", 
    "./src/images/lock.png", 
    "./src/images/star.png",
    "./src/images/background1.jpeg",
    "./src/images/background2.jpeg", 
    "./src/images/black cell.jpeg", 
    "./src/images/white cell.jpeg",
    "./src/images/frame.jpeg", 
    "./src/images/hint.png", 
    "./src/images/menu.png", 
    "./src/images/restart.png", 
    "./src/images/undo.png", 
    "./src/images/about.png",
    "./src/images/black crown.png", 
    "./src/images/white crown.png",
    "./src/images/sound on.png",
    "./src/images/sound off.png",
    "./src/images/send.png",
	"./src/images/recorder.png", 
	"./src/images/bin.png",
	"./src/images/bin lid.png",
	"./src/images/copy.png", 
    "./src/images/warning.png", 
    "./src/images/chat.png",
    "./src/audio/click.mp3",
	"./src/audio/capture.mp3", 
	"./src/audio/king.mp3", 
	"./src/audio/collect.mp3",
	"./src/audio/game win.mp3", 
	"./src/audio/game lose.mp3", 
	"./src/audio/notification.mp3", 
	"./src/audio/start recording.mp3",
	"./src/audio/delete recording.mp3", 
	"./src/audio/stop recording.mp3", 
	"./src/audio/throw recording.mp3",  
	"./src/scripts/ui/audio player.js",
	"./src/scripts/ui/drag.js",
	"./src/scripts/ui/element hint.js",
	"./src/scripts/ui/game stats.js",
	"./src/scripts/ui/level.js",
	"./src/scripts/ui/longpress.js",
	"./src/scripts/ui/mode.js",
	"./src/scripts/ui/move checker.js",
	"./src/scripts/ui/move player.js", 
	"./src/scripts/ui/transmitter.js", 
	"./src/scripts/ui/helper.js", 
	"./src/scripts/ui/multiplayers.js",
	"./src/scripts/ui/notify.js",
	"./src/scripts/ui/play.js",
	"./src/scripts/ui/scroll.js",
	"./src/scripts/ui/setting.js",
	"./src/scripts/ui/timer.js",
	"./src/scripts/ui/ui.js",
	"./src/scripts/ui/version.js",
	"./src/scripts/ai/bot.js",
	"./src/scripts/ai/brain.js",
	"./src/scripts/ai/evaluator.js",
	"./src/scripts/ai/negamax.js",
	"./src/scripts/ai/negascout.js",
	"./src/scripts/ai/uct node.js",
	"./src/scripts/ai/uct.js",
	"./src/scripts/ai/worker manager.js",
	"./src/scripts/board/board.js",
	"./src/scripts/board/moves.js",
	"./src/scripts/board/move.js",
	"./src/scripts/channel/channel.js",
	"./src/scripts/channel/pubnub.7.0.1.min.js",
	"./src/scripts/channel/chat.js",
	"./src/scripts/channel/voicenoteRecorder.js",
	"./src/scripts/channel/voicenotePlayer.js",
	"./src/scripts/eruda/eruda.min.js",
	"./src/scripts/objects/dice.js",
	"./src/scripts/objects/player.js",
	"./src/scripts/objects/sleep.js",
	"./src/scripts/objects/transposition table.js",
	"./src/scripts/objects/updates.js",
	"./src/scripts/objects/zobrist hash.js",
	"./src/styles/ui.css", 
	"./src/styles/index.css",
	"./manifest.webmanifest",
	"./index.html",
];

self.addEventListener("install", (e) => {
	const addFiles = (cache) => {
	    const stack = [];
	    appShellFiles.forEach((file) => stack.push(
	        cache.add(file).catch( _ => console.error(`can't load ${file} to cache`))
	    ));
	    return Promise.all(stack);
	};
	
    e.waitUntil(
        caches.open(cacheName).then((cache) => {
            return cache.addAll(appShellFiles);
        })
        //caches.open(cacheName).then(addFiles) 
    )
});

self.addEventListener("fetch", (e) => {
    e.respondWith(
        caches.match(e.request.url, {cacheName, ignoreSearch: true}).then( async (res) => {
        	if(res && !/updates.js$/gi.test(e.request.url)) {
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

