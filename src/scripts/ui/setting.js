class Setting {
	static #value = {
		'fullscreen': 'off', 
		'view': 'portrait', 
		'sound': 'on', 
		'first-move': 'black', 
		'play-as': 'white', 
		'mandatory-capture': 'on', 
		'helper': 'on',
	};
	
	static async init () {
		let lastSettings = storage && storage.getItem('checkers-last-settings');
			lastSettings = lastSettings && JSON.parse(lastSettings) || this.#value;
			lastSettings['fullscreen'] = 'off';
			
		for(let [item, value] of Object.entries(lastSettings)) {
			let itemElement = $(`#settings-window section[value='${item}'] button[action='setting-item'][value='${value}']`);
			this.change(itemElement, value);
		} 
	} 
	
	static show () {
		this.initSoundButton();
		UIHistory.push("#main-window", "#settings-window");
	} 
	
	static initSoundButton () {
		let sound = AudioPlayer.getSound() && 'on' || 'off';
		let soundElement = $(`#settings-window section[value='sound'] button[value='${sound}']`);
		this.change(soundElement, sound);
	} 
	
	static change (newElem, value) {
		let parentElem = newElem.parentElement;
		let parentValue = parentElem.getAttribute("value");
		let self = this;
		
		switch (parentValue) {
			case "fullscreen":
			case "view":
			case "sound":
			case "first-move":
			case "play-as":
			case "mandatory-capture":
			case "helper":
				self.set(parentValue, value, newElem);
				break;
				
			case "restart-levels":
				Level.reset();
				break;
				
			case "support":
				self.showSupportLines();
				break;
				
			case "more-apps":
				self.showMoreApps();
				break;
				
			case "contact":
				self.contactMe();
				break;
				
			case "attributes":
				self.showAttributes();
				break;
				
			case "version":
				self.showVersion();
				break;
		} 
	} 
	
	static async set (item, value, newElem) {
		if(item == 'fullscreen') {
			let response = await this.changeFullscreen(value);
			if(!response) 
				return;
		} 
		else if(item == 'view') {
			if(this.isFullscreen())
			await this.lockOrientation(value);
		} 
		else if(item == 'sound') {
			AudioPlayer.setSound(value);
		} 
		else if(item == 'play-as') {
			let playAsElements = $$('#two-players-window #offline #player-a button');
			for(let element of playAsElements) 
				if(element.getAttribute('value') == value) 
					element.classList.add('active');
				else
					element.classList.remove('active');
					
			Player.setPlayAs(value);
		} 
		
		let initialElem = newElem.parentElement.$('button[action="setting-item"].active');
		if(initialElem)
			initialElem.classList.remove('active');
		newElem.classList.add('active');
		this.#value[item] = value;
		storage && storage.setItem('checkers-last-settings', JSON.stringify(this.#value));
	} 
	
	static setFirstMove (value) {
		if(typeof value == "boolean")
			value = value && PLAYER_A.pieceColor.toLowerCase() || PLAYER_B.pieceColor.toLowerCase();
		
		let firstMoveElements = $$('#settings-window section[value="first-move"] button');
		for(let element of firstMoveElements) 
			if(element.getAttribute('value') == value) 
				element.classList.add('active');
			else
				element.classList.remove('active');
					
		this.#value["first-move"] = value;
		storage && storage.setItem('checkers-last-settings', JSON.stringify(this.#value));
	} 
	
	static setMandatoryCapture (value) {
		let mandatoryCaptureElements = $$('#settings-window section[value="mandatory-capture"] button');
		for(let element of mandatoryCaptureElements) 
			if(element.getAttribute('value') == value) 
				element.classList.add('active');
			else
				element.classList.remove('active');
					
		this.#value["mandatory-capture"] = value;
		storage && storage.setItem('checkers-last-settings', JSON.stringify(this.#value));
	} 
	
	static get (item) {
		return this.#value[item];
	} 
	
	static getValue () {
		return this.#value;
	} 
	
	static setValue (value) {
		this.#value = value;
	} 
	
	static isFullscreen () {
		try {
            if(document.fullscreenElement !== undefined) return document.fullscreenElement;
            if(document.webkitFullscreenElement !== undefined) return document.webkitFullscreenElement;
            if(document.mozFullscreenElement !== undefined) return document.mozFullscreenElement;
            if(document.msFullscreenElement !== undefined) return document.msFullscreenElement;
		} 
		catch (error) {
			return false;
		} 
    }
	
	static async changeFullscreen (value) {
        let view = $("#settings-window section[value='view']");
		
		try {
	        let elem = document.documentElement;
	        let enterFullscreen = elem.requestFullscreen || elem.webkitRequestFullscreen || elem.mozRequestFullscreen || elem.msRequestFullscreen;
	        let exitFullscreen = document.exitFullscreen || document.webkitExitFullscreen || document.mozExitFullscreen || document.msExitFullscreen;
			
		    if(value == 'on') {
			    if(enterFullscreen && !this.isFullscreen()) {
				    view.style.display = "grid";
	        		await enterFullscreen.call(elem, {navigationUI: "hide"});
				    
					let orientation = this.#value.view;
				    let locked = await this.lockOrientation(orientation);
	                if(!locked) {
	                    view.style.display = "none";
	                } 
	        	}
	        	else {
	        		Notify.alert({
						header: "Fullscreen Error",
						message: "Your browser doesn't support Fullscreen functionality."
					});
					
					return null;
				} 
		    } 
		    else {
				view.style.display = "none";
			    if(exitFullscreen && this.isFullscreen()) 
	        		exitFullscreen.call(document);
		    } 
		
			return true;
		} 
		catch (error) {
			console.log(error);
			if(!this.isFullscreen()) 
			    view.style.display = "none";
			
			Notify.alert({
				header: "Fullscreen Error",
				message: "Your browser doesn't support Fullscreen functionality."
			});
				
			return null;
		}
	} 
	
	static lockOrientation (orientation = 'portrait') {
		orientation = [orientation];
		return new Promise ((resolve) => {
			screen.orientation.lock(orientation).then(_ => {
	            resolve(true);
	        }).catch((error) => {
				if(error.name == "AbortError") {} // ignore 
	            else if(error.name == "NotSupportedError")
	                Notify.popUpNote("Screen orientation lock is not supported on this device");
				else
					Notify.popUpNote('An unexpected error occured while locking screen orientation. Please try again.');

	            resolve(false);
	        }); 
		});
	} 
	
	static updateOrientation () {
		let view = this.get('view');
		let orientation = screen.orientation.type;
			orientation = orientation.split('-')[0];
			
		if(view == orientation)
			return; 
			
		let orientationElement = $(`#settings-window section[value='view'] button[value='${orientation}']`);
		this.change(orientationElement, orientation);
	} 

	static updateFullscreen (value) {
		let fullscreenElement = $(`#settings-window section[value='fullscreen'] button[value='${value}']`);
		this.change(fullscreenElement, value);
	} 
	
	static showSupportLines () {
		Notify.alert({
			header: "SUPPORT LINES",
			message: "<label>If you have been impressed by this work, support me and let's achieve milestone through coding and programming.<br><br>" +
					 "Support line: <b>0798916984</b><br>Name: <b>Mark Etale</b></label>"
		});
	} 
	
	static showMoreApps () {
		Notify.alert({
			header: "MORE APPS",
			message: "<span>Mi List App</span><ul><li>Manage your to-do list as well as receive notification reminders when they are due with Mi-List app.<br><a href='https://mark-code789.github.io/Mi-List/'>Try it now!</a></li></ul><br>" +
					 "<span>Smart Recharge App</span><ul><li>Recharge your line automatically by scanning the digital top up code using Smart-Recharge.<br><a href='https://mark-code789.github.io/Smart-Recharge'>Try it now!</a></li></ul>"
		});
	} 
	
	static async contactMe () {
		let response = await Notify.other({
			header: "CONTACT DEVELOPER",
			message: "Feel free to reach out to me via either of the following options. Let's build checkers together.",
	 		   type: "CANCEL/EMAIL/WHATSAPP",
			icon: ICONS.contactIcon
		});
		
		if(response == "EMAIL") 
			window.location.href = "mailto:markcodes789@gmail.com? &subject=Checkers%20Support%20Feedback";
		else if(response == "WHATSAPP")
			window.location.href = "https://wa.me/+254798916984?";
	} 
	
	static showAttributes () {
		Notify.alert({
            header: "ATTRIBUTES", 
            message: "<span>Audio</span>" + 
				"<ul>" + 
					"<li>Special thanks goes to zapslat.com for powering audio in this game. Checkout the link below for more info.<br/><a href='https://www.zapsplat.com/sound-effect-categories/'>www.zapslat.com</a></li>" +
				"</ul>" +
				"<span>Online Gaming</span>" + 
				"<ul>" +
					"<li>This one goes to PubNub for enabling instant communication between internet connected devices.</li>" + 
				"</ul>"
		});
	} 
	
	static async showVersion () {
		let currentAppVersion = Updates.version;
		let currentVersionDescription = await Updates.getDescription(currentAppVersion);
		let updateChoice = await Notify.confirm({
	            header: "CHECKERS VERSION", 
	            message: "<label>Your current app version is: " + currentAppVersion + "</label><span>Updates of this version</span>" + currentVersionDescription + "<label style='display: block; text-align: left;'>Thank you for playing checkers. If you experience any difficulty or an error please contact me via the contact button in the settings. Let's build checkers together. Happy gaming 🎉</label>", 
				type: "OK/Check for update"});
				
		if(updateChoice == "Check for update") {
			if(!navigator.onLine) return Notify.popUpNote("Please connect to an internet and try again.");
			let script = $("#updates");
			let url = script.src.split('?')[0] + '?q="update"';
			let newScript = $$$("script", ["id", "updates"]);
			let logs = structuredClone(Updates.updateLogs);
			newScript.onload = async () => {
				Notify.cancel(); 
				let newAppVersion = Updates.version;
				if(currentAppVersion == newAppVersion)
					return Notify.popUpNote("No update found");
					
				updateChoice = await Notify.confirm({
					header: "Update Found", 
					message: "A new version (" + newAppVersion + ") is available, do you wanna update", 
					type: "CANCEL/UPDATE"
				});
				
				if(updateChoice == "UPDATE")
					location.reload();
				else {
					Updates.version = currentAppVersion;
					Updates.updateLogs = logs;
				} 
			} 
			
			newScript.src = url;
			script.replaceWith(newScript);
			
			Notify.alertSpecial({
					header: "Checking for update...",
					message: "Please wait as we run the check."
			});
		} 
	} 
} 