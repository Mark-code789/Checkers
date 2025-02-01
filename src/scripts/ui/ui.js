'use strict'

/* Version: 44 */
const ICONS = {
    alertIcon: "", 
    confirmIcon: "", 
    winnerIcon: "", 
    loserIcon: "", 
    drawIcon: "",
    loadIcon: "",
    diceIcon: "",
    contactIcon: "", 
}
const FLAGS = {
	american: "", 
	kenyan: "", 
	casino: "", 
	international: "", 
	pool: "", 
	russian: "", 
	nigerian: "", 
} 
const SOUND = { 
    click: "",
    capture: "",
    king: "", 
    collect: "", 
    gameWin: "", 
    gameLose: "",
    notification: "",
    startRecording: "",
    deleteRecording: "",
    stopRecording: "",
    throwRecording: "", 
}

window.storage = localStorage || null;

class Init {
	static appShells = [
		"alert.png",
        "confirm.png", 
        "winner.png",
        "loser.png", 
        "draw.png",
        "load.png",
        "dice roll.png",
		"contact.png",
		"american flag.jpeg",
        "kenyan flag.jpeg",
        "casino flag.jpeg", 
        "international flags.jpeg",
        "pool flag.jpeg",
        "russian flag.jpeg",
        "nigerian flag.jpeg",
        "black piece.png",
        "white piece.png",
        "cancel.png", 
        "lock.png", 
        "star.png",
        "background1.jpeg",
        "click.mp3",
		"capture.mp3", 
		"king.mp3", 
		"collect.mp3",
		"game win.mp3", 
		"game lose.mp3", 
		"notification.mp3", 
		"start recording.mp3",
		"delete recording.mp3", 
		"stop recording.mp3", 
		"throw recording.mp3", 
        "background2.jpeg", 
        "black cell.jpeg", 
        "white cell.jpeg",
        "frame.jpeg", 
        "hint.png", 
        "load.png",
        "menu.png", 
        "restart.png", 
        "undo.png", 
        "about.png",
        "black crown.png", 
        "white crown.png",
        "sound on.png",
        "sound off.png",
        "send.png",
        "recorder.png", 
		"bin.png",
		"bin lid.png",
		"copy.png", 
        "warning.png", 
        "chat.png",
	];
	
	static imageProps = [
		...Object.keys(ICONS), 
	    ...Object.keys(FLAGS), 
        "--black-piece", 
        "--white-piece", 
        "--cancel",
        "--lock",
        "--star",
        "--bg1",
        "--bg2",
        "--black-cell", 
        "--white-cell",
        "--frame",
        "--hint",
        "--load", 
        "--menu", 
        "--restart", 
        "--undo", 
        "--about",
        "--black-crown", 
        "--white-crown",
        "--sound-on",
        "--sound-off",
        "--send-btn",
        "--recorder-btn", 
		"--delete-bin", 
		"--delete-lid",
		"--copy",
		"--warning",
		"--chat",
	];
	
	static srcs = [];
	static soundProps = Object.keys(SOUND);

	static async load (src = this.appShells[0], i = 0) {
	    if(src.includes(".mp3")) {
	        src = "./src/audio/" + src;
	    } 
	    else {
	        src = "./src/images/" + src;
	    }
		
	    let response = await fetch(src);
	    if(response.status === 200) {
			let loadingInfo = $("#load-window .loader p");
			let progress = $("#load-window .loader .progress");
	        let blob = await response.blob();
			
	        if(blob.size > 0) {
				let iconsLength = Object.keys(ICONS).length;
				let flagsLength = Object.keys(FLAGS).length;
				let soundsLength = Object.keys(SOUND).length;
				let totalLength = iconsLength + flagsLength + soundsLength + 6;
					
	            if(!src.includes(".mp3")) {
	            	loadingInfo.textContent = (i < iconsLength + flagsLength + 6)? "Loading textures...": "Finishing";
	            	progress.style.width = `calc(calc(100% / 3 * 2) * ${(i + 1) / totalLength} + calc(100% / 3))`;
	                src = URL.createObjectURL(blob);
					
	                if(i < iconsLength) {
	                    ICONS[this.imageProps[i]] = src;
	                }
	                else {
						if(i < iconsLength + flagsLength ) {
							FLAGS[this.imageProps[i]] = src;
							this.imageProps[i] = "--" + this.imageProps[i] + "-flag";
						}
						
						let j = i < iconsLength + flagsLength + 6? i: i - soundsLength;
	                    document.documentElement.style.setProperty(this.imageProps[j], `url(${src})`);
	                }
	            } 
	            else {
					loadingInfo.textContent = "Loading audio...";
					progress.style.width = `calc(calc(100% / 3 * 2) * ${(i + 1) / totalLength} + calc(100% / 3))`;
	                src = URL.createObjectURL(blob);
	                let audio = new Audio(src);
	                SOUND[this.soundProps[i - 21]] = audio;
	            }
	            if(i == iconsLength + flagsLength + soundsLength + 6) {
	                await this.done();
	            }
	            
	            i++;
	            if(i < this.appShells.length) {
	                this.load(this.appShells[i], i);
	            }
	            else {
	            	delete this.appShells;
	            	delete this.imageProps;
	            	delete this.soundProps;
	            	await new Sleep().wait(0.5);
	
					$(".install_btn[action='install']").addEventListener("click", App.install.bind(App));
					$(".install_btn[action='cancel']").addEventListener("click", App.hideInstallPrompt.bind(App));
	            	
	            	if(App.deferredEvent && reg && !reg.waiting) {
				        $(".install").classList.add("show_install_prompt");
				    } 
				    else if(reg && reg.waiting) {
				    	invokeSWUpdateFlow();
				    } 
				    else {
				    	Permissions.check();
				    } 
	            } 
	        }
	        else {
	            alert("BUFFERING ERROR!\nFailed to buffer fetched data to an array data.");
	        } 
	    }
	    else {
	    	console.log('Response: ', response);
	        alert("LOADING ERROR!\nFailed to load AppShellFiles. Either you have bad network or you have lost internet connection.");
	    }
	} 

	static async done () {
		this.addEventListeners();
		
		// Detect launching orientation
		if(screen.orientation.type.includes("landscape")) 
			document.body.style.backgroundSize = "auto 70vmax";
			
		// Change window to main 
	    $("#load-window").classList.remove("visible");
	    $("#main-window").classList.add("visible");
		
		await this.initData();
		history.pushState(null, "", "");
	} 
	
	static async initData () {
		await Mode.init();
		await GameStats.init();
		await Version.init();
		await Setting.init();
		await Transmitter.init();
		await Bot.init();
		await Channel.init();
	}
	
	static addEventListeners () {
		// window 
		window.addEventListener('orientationchange', UIEvent.orientationChange);
		window.addEventListener('resize', UIEvent.orientationChange);
		window.addEventListener('popstate', UIEvent.popState);
		window.addEventListener('online', UIEvent.onlineChange);
		window.addEventListener('offline', UIEvent.onlineChange);
		document.addEventListener('fullscreenchange', UIEvent.fullscreenChange);
		// Universal 
		for(let item of $$("button[action='back']")) item.addEventListener('click', UIEvent.click);
		for(let item of $$("input[type='text']")) item.addEventListener('keyup', UIEvent.keyUp);
		for(let item of $$("input[type='text']")) item.addEventListener('focus', UIEvent.focus);
		// Notification window 
		for(let item of $$("#notification-window *[action='notify-button']")) item.addEventListener('click', UIEvent.click);
		// Main window 
		for(let item of $$("#main-window div[action='version']")) item.addEventListener('click', UIEvent.click);
		for(let item of $$("#main-window div[action='mode']")) item.addEventListener('click', UIEvent.click);
		for(let item of $$("#main-window div[action='settings']")) item.addEventListener('click', UIEvent.click);
		for(let item of $$("#main-window div[action='level']")) item.addEventListener('click', UIEvent.click);
		for(let item of $$("#main-window .footer_section button")) item.addEventListener('click', UIEvent.click);
		// Two players window 
		for(let item of $$("#two-players-window button[action='play-as']")) item.addEventListener('click', UIEvent.click);
		for(let item of $$("#two-players-window button[action='submit']")) item.addEventListener('click', UIEvent.click);
		for(let item of $$("#two-players-window button[action='unsubscribe']")) item.addEventListener('click', UIEvent.click);
		for(let item of $$("#two-players-window button[action='share']")) item.addEventListener('click', UIEvent.click);
		for(let item of $$("#two-players-window form")) item.addEventListener('submit', UIEvent.submit);
		// Settings window 
		for(let item of $$("#settings-window button[action='setting-item']")) item.addEventListener('click', UIEvent.click);
		for(let item of $$("#settings-window button[action='social-media']")) item.addEventListener('click', UIEvent.click);
		// Games window
		for(let item of $$("#games-window button[action='total-stats']")) item.addEventListener('click', UIEvent.click);
		for(let item of $$("#games-window button[action='clear-games']")) item.addEventListener('click', UIEvent.click);
		
		let drag = new Drag($(".games_totals"), "y", "0.5s");
	    $(".games_totals").addEventListener("touchstart", drag.start, false);
	    $(".games_totals").addEventListener("touchend", drag.end, false);
	    $(".games_totals").addEventListener("touchmove", drag.move, false);
	    
	    $(".games_totals").addEventListener("mousedown", drag.start, false);
	    $(".games_totals").addEventListener("mouseup", drag.end, false);
	    $(".games_totals").addEventListener("mousemove", drag.move, false);
		// Chat window 
		drag = new Drag($("#chat-icon"), "both", "0.5s");
	    $("#chat-icon").addEventListener("touchstart", drag.start, false);
	    $("#chat-icon").addEventListener("touchend", drag.end, false);
	    $("#chat-icon").addEventListener("touchmove", drag.move, false);
	    
	    $("#chat-icon").addEventListener("mousedown", drag.start, false);
	    $("#chat-icon").addEventListener("mouseup", drag.end, false);
	    $("#chat-icon").addEventListener("mousemove", drag.move, false);
	
		drag = new Drag($(".recorder_button"), "x", "0.3s");
	    $(".recorder_button").addEventListener("touchstart", drag.start, false);
	    $(".recorder_button").addEventListener("touchend", drag.end, false);
	    $(".recorder_button").addEventListener("touchmove", drag.move, false);
	   
	    $(".recorder_button").addEventListener("mousedown", drag.start, false);
	    $(".recorder_button").addEventListener("mouseup", drag.end, false);
	    $(".recorder_button").addEventListener("mousemove", drag.move, false);
		
		$(".send_button").addEventListener("click", UIEvent.click);
		$(".chat_close").addEventListener("click", UIEvent.click);
		$(".chat_field").addEventListener("focus", UIEvent.focus);
		$(".chat_field").addEventListener("blur", UIEvent.blur);
		$(".chat_field").addEventListener("paste", UIEvent.paste);
		$(".chat_field").addEventListener("input", UIEvent.input);
		$(".chat_delete").addEventListener("click", UIEvent.click, false);
    	$(".chat_copy").addEventListener("click", UIEvent.click, false);
		// Play window 
		for(let item of $$("#play-window button[action='controls']")) item.addEventListener('click', UIEvent.click);
		
		for(let item of $$("#play-window button[action='controls'][value='restart']")) Tooltip.setTip(item, "Restart the game", true);
		for(let item of $$("#play-window button[action='controls'][value='undo']")) Tooltip.setTip(item, "Undo previous moves made", true);
		for(let item of $$("#play-window button[action='controls'][value='about']")) Tooltip.setTip(item, "Get more information about this variant", true);
		for(let item of $$("#play-window button[action='controls'][value='hint']")) Tooltip.setTip(item, "Seek assistance on which move to play", true);
		for(let item of $$("#play-window button[action='controls'][value='sound']")) Tooltip.setTip(item, "Mute or unmute sound", true);
		for(let item of $$("#play-window button[action='controls'][value='menu']")) Tooltip.setTip(item, "Exit the game and go to main menu", true);
	} 
}

class UIEvent {
	static audiosInitialized = false;
	static click (event) {
		if(!this.audiosInitialized) {
			AudioPlayer.init();
			this.audiosInitialized = true;
		} 
		
		AudioPlayer.play('click');
		
		let elem = event.target;
		let action = elem.getAttribute('action');
		let value = elem.getAttribute('value');
		
		switch (action) {
			case "back":
				UIEvent.back();
				break;
				
			case "popstate":
				UIEvent.popState();
				break;
				
			case "notify-button":
				Notify.buttonAction(elem);
				break;
				
			case "version":
				Version.change(elem, value);
				break;
				
			case "settings":
				Setting.show(elem, value);
				break;
				
			case "level":
				Level.change(elem, value);
				break;
				
			case "mode":
				Mode.change(elem, value);
				break;
				
			case "play":
				Play.start();
				break;
				
			case "controls":
				Play.action(elem, value);
				break;
				
			case "games":
				GameStats.view(elem);
				break;
				
			case "clear-games":
				GameStats.clear();
				break;
				
			case "total-stats":
				GameStats.showTotalStats(elem);
				break;
				
			case "play-as":
				Multiplayers.changePlayerColor(elem, value);
				break;
				
			case "unsubscribe":
				Channel.unsubscribe();
				break;
				
			case "share":
				Channel.share();
				break;
				
			case "submit":
				let mode = Mode.getMode();
				let submit = $(`#two-players-window form#${mode.split('-').slice(-1)[0]} input[type='submit']`);
				submit.click();
				break;
				
			case "setting-item":
				Setting.change(elem, value);
				break;
				
			case "social-media":
				UIHistory.push("#settings-window", "#follow-up-window");
				break;
				
			case "close-chat":
				Chat.close();
				break;
				
			case "delete-chat":
				Chat.requestDelete();
				break;
				
			case "copy-chat":
				Chat.copyMessage();
				break;
				
			case "send":
				Chat.sendMessage(elem);
				break;
		} 
	} 
	
	static focus (event) {
		if(event.target.classList.contains("chat_field"))
			return Chat.updateField(event);
			
		event.preventDefault();
		let input = event.target;
		let scrollableParent;
		
		if(Mode.is('two-players-online', 'two-players-offline')) 
			scrollableParent = $(`#two-players-window > section:first-of-type`);
			
		setTimeout(() => Scroll.intoView(scrollableParent, input, 'vert', 'end'), 100);
	} 
	
	static blur (event) {
		if(event.target.classList.contains("chat_field"))
			return Chat.updateField(event);
	} 
	
	static keyUp (event) {
		let input = event.target;
		let value = input.value;
		value = value.replaceAll(/^\w|\s\w/g, t => t.toUpperCase()).trim();
		input.value = value;
	} 
	
	static input (event) {
		if(event.target.classList.contains("chat_field"))
			return Chat.updateField(event);
	} 
	
	static paste (event) {
		if(event.target.classList.contains("chat_field"))
			return Chat.updateField(event);
	} 
	
	static submit (event) {
		event.preventDefault();
		AudioPlayer.play('click');
		
		let elem = event.target;
		Multiplayers.submit(elem);
	} 
	
	static back () {
		UIHistory.undo();
	} 
	
	static orientationChange () {
		Setting.updateOrientation();
		setTimeout(() => {
			Play.descaleFont();
			Play.scaleFont();
			Play.changeShadow();
		}, 500);
	} 

	static async fullscreenChange () {
		let state = Setting.get('fullscreen');
		let fullscreen = Setting.isFullscreen();
		
		if(!fullscreen && state == 'on') {
			let action = await Notify.confirm({
				header: "Fullscreen Change", 
				message: "Fullscreen change detected, do you wish to go back to fullscreen mode?", 
				type: "NO/YES"
			});
			
			if(action == 'YES') 
				Setting.updateFullscreen('on');
			else
				Setting.updateFullscreen('off');
		} 
	} 
	
	static popState () {
		if(UIHistory.isEmpty()) {
			Notify.popUpNote('Press again to exit');
			setTimeout(() => {
				history.pushState(null, "", "");
			}, 4000);
		}
		else {
			AudioPlayer.play('click');
			UIHistory.undo();
			history.pushState(null, "", "");
		}
	}
	
	static onlineChange (event) {
		Channel.setOnlineStatus(event.type);
		
		Notify.popUpNote(`You ${navigator.onLine && "are back online" || "went offline"}`);
	} 
} 

class UIHistory {
	static state = [];
	static push (from, to) {
		if(from) 
		$(from).classList.remove('visible');
		$(to).classList.add('visible');
		
		this.state.push({from, to});
	} 
	static undo () {
		let state = this.state.pop();
		let from = state.from;
		let to = state.to;
		if(from) 
		$(from).classList.add('visible');
		$(to).classList.remove('visible');
		
		if(to = '.games_totals') 
			$(to).removeAttribute('style');
	} 
	static isEmpty () {
		return this.state.length == 0;
	}
} 

class UIValue {
	static getValue (element, value, asNumber = true, pseudo = false) {
		value = window.getComputedStyle(element, pseudo).getPropertyValue(value);
		if(asNumber) 
			return parseFloat(value);
		else 
			return value;
	} 
	
	static getPosition (x, y) {
		let obj = {};
		obj.cell = $(`#table .cell[value='${x}${y}']`);
	    obj.cellSize = this.getValue($("#table"), "width") / Play.board.getSize();
	    obj.top = this.getValue(obj.cell, "top");
		obj.left  = this.getValue(obj.cell, "left");
		obj.x = x;
		obj.y = y;
		return obj;
	} 
}

String.prototype.toCamelCase = function () {
	return this.replaceAll(/^\w|\s\w/g, (t) => t.toUpperCase());
}

Date.prototype.toTime = function (mode, includeSec = false) {
	if(!mode) 
		return this.toTimeString();
		
	let converted = '';
	let hr = this.getHours();
	let min = this.getMinutes();
	let sec = this.getSeconds();
	
	hr = String(hr).padStart(2, "0");
	min = String(min).padStart(2, "0");
	sec = String(sec).padStart(2, "0");
	
	if(mode == 12) {
		if(parseInt(hr) == 0) 
			converted = "12:" + min + (includeSec? ":" + sec: "") + " AM";
		else if(parseInt(hr) > 12) 
			converted = String(parseInt(hr) - 12).padStart(2, '0') + ":" + min + (includeSec? ":" + sec: "") + " PM";
		else if(parseInt(hr) == 12) 
			converted = hr + ":" + min  + (includeSec? ":" + sec: "") + " PM";
		else 
			converted = hr + ":" + min  + (includeSec? ":" + sec: "") + " AM";
	} 
	else {
		converted = hr + ":" + min + (includeSec? ":" + sec: "");
	} 
	
	return converted;
} 