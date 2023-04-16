'use strict' 
/* Version: 26 */
const HideInstallPrompt = (event) => {
    $(".install").classList.remove("show_install_prompt");
    $(".install").classList.add("hide_install_prompt");
    if(typeof event == "object") 
    	setTimeout(Permissions.check, 500);
} 

const InstallApp = async () => {
    HideInstallPrompt();
    deferredEvent.prompt();
    const {outcome} = await deferredEvent.userChoice;
    if(outcome === 'accepted') {
        Notify.popUpNote("Installation successfully");
    } 
    else {
        Notify.popUpNote("Installation canceled");
    } 
    deferredEvent = null;
    Permissions.check();
} 
class Permissions {
	static permissions = {microphone: false, clipboard: false};
    static check = async (caller, name = "microphone") => {
		let state;
		try {
    		state = await navigator.permissions.query({name});
			state = state.state;
		} catch (error) {
			if(caller == "recorder" || caller == "bubble")
				Notify.popUpNote("An error occurred while trying to get permission to access your device's ." + name);
			return;
		}
		
    	if(state == "prompt") {
			if(name == "microphone") {
	    		let res = await Notify.confirm({ 
					header: "App Permissions", 
					message: "Checkers provides in-app chat capabilities in two players online mode. This feature requires permission to use of your device microphone.", 
					type: "NOT NOW/ALLOW"
				});
				this.response(res);
			} 
			else if(name == "clipboard-write") 
				this.permissions.clipboard = true;
    	} 
		else if(state == "denied" && (caller == "recorder" || caller == "bubble")) {
			Notify.alert({ 
					header: "App Permissions", 
					message: "You have blocked this app from using your device microphone. Follow the following option to unblock:<ol>" + 
							 "<li>Under browser menu, find settings option and click it.</li>" + 
							 "<li>Under settings, find site settings and click it. Depending with your browser, this option might be directly under Settings or under another option in the Settings. For instance, Opera users it is under privacy option in Settings window. Which ever the case, it is named <b>'Site Settings'</b></li>" + 
							 "<li>Under Site Settings, find " + name.split("-")[0] + " option and click it. You will be shown a list of sites that are allowed and not allowed.</li>" + 
							 "<li>Under Blocked or Not allowed option, find <em><b>https://mark-code789.github.io/Checkers</b></em> and click to unblock.</li></ol>"
			});
		} 
		else {
			if(name == "microphone") 
			this.permissions.microphone = true;
			else if(name == "clipboard-write") 
			this.permissions.clipboard = true;
		} 
    } 
	static response = async (res) => {
		if(res == "ALLOW") {
			try {
				let stream = await navigator.mediaDevices.getUserMedia({audio: true});
				for(let track of stream.getTracks()) {
					track.stop();
				} 
				Permissions.permissions.microphone = true;
			} catch (error) {
				if(error.name == "NotAllowedError") 
					Notify.popUpNote("Permission denied.");
				else {
					Notify.popUpNote(error.name + " occurred<br>Message: " + error.message);
				} 
			}
		} 
	} 
} 

window.$ = (elem) => {
    return document.querySelector(elem);
} 

window.$$ = (elem) => {
    return document.querySelectorAll(elem);
}

window.$$$ = (type, data = []) => {
	if(!Array.isArray(data)) {
		throw new Error("Data object passed is not an array. At $$$ line: 658");
	} 
    let elem = document.createElement(type);
    for(let i = 0; i < data.length; i+=2) {
    	if(/^(innerHTML|textContent)$/gi.test(data[i]))
    		elem[data[i]] = data[i+1];
    	else
    		elem.setAttribute(data[i], data[i+1]);
    } 
    return elem;
} 
Element.prototype.$ = function (elem) {
	if(/button/gi.test(this.tagName)) return $(elem);
	return this.querySelector(elem);
} 
Element.prototype.$$ = function (elem) {
	return this.querySelectorAll(elem);
} 

let deferredEvent;
let reg;
let workers = [];
let randomFacts = [
	"Early version of checkers believed to be dated 1400 B.C, was played on a 5 x 5 board with each player having 10 pieces each. The game was called Quirkat or Alquerque.", 
	"During 13th century, checkers name was renamed to Fierges from Quirkat in southern France and was now played on 8 x 8 board. Later in 15th century it was renamed to Jeu De Dames popularly referred to as Dames.",
	"Checkers upon reaching to England from France it was renamed by English men to Draughts from Dames meaning to move or to draw. The Americans as well refer to it as Checkers what we call it today.", 
	"There are many version of checkers played in different countries and regions with there own rules and standards. For example the Nigerian checkers is played on 12 x 12 board with 20 pieces each.",
	"Chinese Checkers has nothing to do with checkers or draughts. In fact it was not invented in China. It was named that way as a marketing strategy.",
	"Checkers is played on the same board as chess — 8 x 8 board with 64 squares of black and white.",
	"The rule of crowing was introduced in the 13th century in France. Crowning meant the crowned piece becomes superior than other pieces.", 
	"The rule of mandatory jump or capture was introduced in 1535 by the English men when checkers arrived in America. Initially players were not forced to take opponents pieces when the opportunity came.",
	"In 1994 for the first time, a computer program became the 'Checkers World Champion. The program was called 'Chinook' and was developed in the University of Alberta.", 
	"Marion Tinsley was considered the greatest checkers player of all time. The late played checkers for 45 years and he only lost less 10 games. He died in 1995.", 
]; 

async function pageComplete () {
    let head = document.head;
    let SheetLink = $$$("link");
    let JsLink0 = $$$("script");
    let JsLink1 = $$$("script");
    let JsLink2 = $$$("script");
    let JsLink3 = $$$("script");
    let JsLink4 = $$$("script");
    let JsLink5 = $$$("script");
    
    SheetLink.onload = (event) => LoadedExternalFiles.run(event);
    JsLink0.onload = (event) => LoadedExternalFiles.run(event);
    JsLink1.onload = (event) => LoadedExternalFiles.run(event);
    JsLink2.onload = (event) => LoadedExternalFiles.run(event);
    JsLink3.onload = (event) => LoadedExternalFiles.run(event);
    JsLink4.onload = (event) => LoadedExternalFiles.run(event);
    JsLink0.onerror = (event) => LoadedExternalFiles.error(event);
    JsLink1.onerror = (event) => LoadedExternalFiles.error(event);
    JsLink2.onerror = (event) => LoadedExternalFiles.error(event);
    JsLink3.onerror = (event) => LoadedExternalFiles.error(event);
    JsLink4.onerror = (event) => LoadedExternalFiles.error(event);
    
    SheetLink.type = "text/css";
    SheetLink.rel = "stylesheet";
    SheetLink.href = "./src/app.css";
    
    JsLink0.src = "./src/app.js";
    JsLink1.src = "./src/ai.js";
    JsLink2.src = "./src/channel.js";
    JsLink3.src = "./src/core.js";
    JsLink4.src = "./src/objects.js";
    JsLink5.src = "https://cdn.pubnub.com/sdk/javascript/pubnub.7.0.1.min.js";
    
    head.appendChild(SheetLink);
    head.appendChild(JsLink0);
    head.appendChild(JsLink1);
    head.appendChild(JsLink2);
    head.appendChild(JsLink3);
    head.appendChild(JsLink4);
    head.appendChild(JsLink5);
    
    JsLink5.id = "pubnub-file";
    
    let fact = randomFacts[Math.floor(Math.random() * randomFacts.length)];
    let notify = $(".notify div");
	notify.innerHTML = "<b>RANDOM FACTS ABOUT CHECKERS!</b><br><br>Did you know?<br><br>" + fact;
	notify.nextElementSibling.textContent = "NOW I KNOW";
	notify.parentNode.style.display = "block";
	notify.nextElementSibling.onclick = function () {this.parentNode.style.display = 'none';} 
} 
class LoadedExternalFiles {
	static n = 0;
	static total = 6;
	static err = false;
	static run = async function (e) {
		if(this.err) return;
		this.n++;
		let loadingInfo = $("#load-window .loader p");
			loadingInfo.innerHTML = "Loading files...";
		let progress = $("#load-window .loader .progress");
			progress.style.width = `calc(100% / 3 * ${this.n / this.total})`;
		if(this.n == this.total) {
			if(window.crypto && window.crypto.getRandomValues && BigUint64Array) {
				await ZobristHash.initTable();
				let totalThreads = navigator.hardwareConcurrency || 1;
                for(let n = 0; n < totalThreads; n++) {
                	let worker = new Worker("./src/worker.js");
					await worker.postMessage({type: "init-worker", table: ZobristHash.table});
                	workers.push(worker);
                } 
				Publish.sleep = new Sleep();
				LoadResources();
				Permissions.check(undefined, "clipboard-write");
			} 
			else {
				alert("CRITICAL FAILURE\n\nYour browser lacks critical component for better performance of this game. Please, we recommend you update it or try another one preferably Chrome.");
			} 
		}
	} 
	static error = async function (e) {
		this.err = true;
		let notify = $(".notify div");
		notify.innerHTML = "<b>LOADING ERROR!</b><br><br>Failed to load AppShellFiles. Check your internet connection and hit reload.<br>" + event.target.src;
		notify.nextElementSibling.textContent = "RELOAD";
		notify.parentNode.style.display = "block";
		notify.nextElementSibling.onclick = function () {location.reload();} 
	} 
} 

const InvokeSWUpdateFlow = async () => {
	let versionDescription = await Updates.getDescription();
	let version = Updates.version;
	let action = await Notify.confirm({ 
		header: "APP UPDATE", 
		message: "<label>Thank you for using Checkers App.<br>There is a new version of this app. All you need is to refresh.<br>New version: " + version + "</label><span>What's New?</span>" + versionDescription + "<label style='display: block; text-align: left;'>Do you want to update?</label>", 
		type: "LATER/UPDATE"
	});
	
	if(action == "UPDATE") {
		Notify.alertSpecial({
				header: "Updating Checkers...",
				message: "Please Wait as we update the app. This may take a few seconds depending n the speed of your bandwidth."
		});
		await reg.waiting.postMessage({type: "skip-waiting"});
	} 
	else {
		Notify.popUpNote("App update declined.");
		if(deferredEvent) 
			$(".install").classList.add("show_install_prompt");
		else 
			Permissions.check();
	} 
} 

const FinishInstalling = async () => {
	if(reg.waiting) {
		if(window.getComputedStyle($("#load-window"), null).getPropertyValue("display") == "none") {
			setTimeout(() => {
				if(reg.waiting)
					InvokeSWUpdateFlow();
			}, 0.5); /* Timeout to ensure no subsequent activate events */
		} 
	} 
} 

window.addEventListener("beforeinstallprompt", (e) => {
    e.preventDefault();
    deferredEvent = e;
});

window.addEventListener("error", (error) => {
	event.preventDefault();
	console.log(error.message + " \n\tat " + error.filename + ": " + error.lineno + ":" + error.colno);
	let option = confirm("ERROR MESSAGE\n\nThere was an unexpected error. We recommend you refresh the page. If this error persists even after refreshing, please contact via:\n\nTel: +254 798 916984\nWhatsApp: +254 798 916984\nEmail: markcodes789@gmail.com\n\nPress OK to refresh.");
	if(option) 
		location.reload();
});

window.addEventListener("load", async () => {
	if("serviceWorker" in navigator) {
		navigator.serviceWorker.onmessage = (e) => console.log(e.data);
		reg = await navigator.serviceWorker.register("./service worker.js");
			
		reg.addEventListener("updatefound", () => {
			if(reg.installing) {
				reg.installing.addEventListener("statechange", () => {
					FinishInstalling(reg);
				});
			} 
		});
		
		let refreshing = false;
		navigator.serviceWorker.addEventListener("controllerchange", (e) => {
			if(!refreshing) {
				location.reload();
				refreshing = true;
			} 
		});
		
		
		pageComplete();
	} 
	else {
    	alert("OFFLINE REGISTRATION FAILURE\n\nCan't Register an offline version of this game because your browser don't support this capability. However you can still access it only while online. If you however really need the offline version, try: \n\n1. Update your browser. or\n2. try another browser, preferably chrome.");
        pageComplete();
    } 
});