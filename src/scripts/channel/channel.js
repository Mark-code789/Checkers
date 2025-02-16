class Channel {
	static #lobby = {
		isConnected: false, 
		isHost: false, 
		messages: {
			retryCount: 0,
			unread: [], 
			unsent: [], 
		}, 
		offlineTimeout: null, 
		opponent: null, 
	} 
	
	static #pubnub = null;
	static #main = '';
	static #bay = '';
	static #uuid = '';
	
	static init () {
		this.checkHref();
		this.setOnlineStatus(navigator.onLine && "online" || "offline");
	} 
	
	static reset () {
		this.#pubnub = null;
		this.#main = '';
		this.#bay = '';
		this.#uuid = '';
		
		
		this.#lobby = {
			isConnected: false, 
			isHost: false, 
			messages: {
				retryCount: 0,
				unread: [], 
				unsent: [], 
			}, 
			offlineTimeout: null, 
			opponent: null, 
		} 
	} 
	
	static setPlayersName (playerA, playerB) {
		Player.setName(playerA, playerB);
		let nameElements = $$("#online .player_name");
		nameElements[0].textContent = playerA || "N/A";
		nameElements[0].setAttribute("value", playerA);
		nameElements[1].textContent = playerB || "N/A";
		nameElements[1].setAttribute("value", playerB);
		
		$("#online .playerA_name").value = playerA;
		$$(".chat_header h2")[1].textContent = playerB || "N/A";
	} 
	
	static setConnectivityStatus (status) {
		let connectivityStatus = $("#connectivity");
        connectivityStatus.classList.remove("green_ui", "orange_ui");
        connectivityStatus.classList.add(status == "connected"? "green_ui": "orange_ui");
        connectivityStatus.textContent = status.toUpperCase();
        
        this.#lobby.isConnected = status == "connected";
	} 
	
	static setOnlineStatus (status) {
		let yourStatus = $("#player-1-status");
		yourStatus.textContent = status.toUpperCase(); 
		yourStatus.setAttribute("value", status);
	    yourStatus.classList.remove("green_ui", "orange_ui", "black_ui");
		yourStatus.classList.add(status == "online"? "green_ui": status == "offline"? "orange_ui": "black_ui");
	} 
	
	static setOpponentStatus (status) {
		let opponentStatus = $("#player-2-status");
        opponentStatus.textContent = status.toUpperCase() || "N/A";
        opponentStatus.setAttribute("value", status);
        opponentStatus.classList.remove("green_ui", "orange_ui", "black_ui");
		opponentStatus.classList.add(status == "online"? "green_ui": status == "offline"? "orange_ui": "black_ui");
		
		let chatStatus = $$(".chat_header p")[1];
		chatStatus.textContent = status;
	} 
	
	static setState ({state}) {
		if(!this.#pubnub)
			return;
			
		this.#pubnub.setState({
			state,
			channels: [this.#main]
		});
	} 
	
	static getUnreadMessages () {
		return this.#lobby.messages.unread.length;
	} 
	
	static isConnected () {
		return this.#lobby.isConnected;
	} 
	
	static markAsRead (msg) {
		msg = msg || this.#lobby.messages.unread.slice(-1)[0];
		if(!msg)
			return;
			
		this.addMessageAction({
			messageTimetoken: msg.timetoken, 
			action: {
				type: "read", 
				value: msg.id
			} 
		});
		this.#lobby.messages.unread = [];
	} 
	
	static generateUUID () {
		if(storage) {
    		if(storage.getItem("checkers-uuid")) {
        		this.#uuid = storage.getItem("checkers-uuid");
        	} 
			else {
				this.#uuid = PubNub.generateUUID();
				storage.setItem("checkers-uuid", this.#uuid);
			} 
        } 
        else {
			this.#uuid = PubNub.generateUUID();
		} 
	} 
	
	static copy () {
		navigator.clipboard.writeText(location.href.split("?")[0] + "?c=" + this.#main + "&t=" + Date.now()).then(
			() => Notify.popUpNote("Link copied to clipboard"), 
			() => Notify.popUpNote("Link failed to copy to clipboard for some reason") );
	} 
	
	static async share () {
		if(this.#lobby.isConnected) {
	        if(navigator.canShare) {
	        	Notify.alertSpecial({ 
						header: "Please wait", 
						message: "Preparing to share"});
	            
	            navigator.share({
	                title: "Checkers Game", 
	                text: `Hi, ${PLAYER_A.name} is requesting to play checkers match with you. Please click the the link below to play.\n`, 
	                url: location.href.split("?")[0] + "?c=" + this.#main + "&t=" + Date.now()
	            }).then( () => { 
	            	Notify.cancel();
	                Notify.popUpNote("Link shared successfully."); 
	            }).catch( (error) => { 
	            	let message = error.toString().split(":");
	                Notify.alert({ 
	                        header: message[0], 
	                        message: ("There was an error while trying to share the link.<br> :-" + message[1])});
	            });
	        } 
	        else {
	            let res = await Notify.confirm({ 
	                header: "Oops! Sorry", 
	                message: "Your Browser does not support this kind of sharing. Copy the link instead.", 
					type: "CANCEL/COPY", 
					icon: ICONS.alertIcon
				});
				
				if(res == "COPY") {
					let text = `Hi, ${PLAYER_A.name} is requesting to play checkers match with you. Please click the the link below to play.\n`;
					let link = location.href.split("?")[0] + "?c=" + this.#main + "&t=" + Date.now();
					navigator.clipboard.writeText(link).then(
						() => Notify.popUpNote("Link copied to clipboard"), 
						() => Notify.popUpNote("Link failed to copy to clipboard for some reason"));
				} 
	        } 
	    } 
	    else 
	        Notify.popUpNote("You have not subscribe online yet.");
	} 
	
	static async checkHref () {
		let url = new URL(window.location);
		
		history.replaceState(null, "", location.href.split("?")[0]); 
		
		if(url.searchParams.has("c")) {
			let time = url.searchParams.get("t"); 
			if(Date.now() - time > 180_000) // 3 minutes
				return Notify.popUpNote("Link expired");
				
			let modeElement = $("#main div[action='mode'][value='two-players-online']");
				modeElement.click();
				
	        this.#main = url.searchParams.get("c"); 
			await new Sleep().wait(1);
	        await Notify.alert({ 
	    			header: "Message", 
	    			message: `Please fill in your name in the field named 'PLAYER DETAILS' and hit <kbd>SUBMIT</kbd> button at the bottom right corner of this window to get started. Your opponent will refer to you using the name you will provide.<img src='./src/images/player image.png'>`});
			
	    	$("#online .playerA_name").focus();
		} 
	} 
	
	static send (data) {
		if(!this.#pubnub)
			return;
			
		const publish = async () => { 
	        let config = this.#lobby.messages.unsent[0];
			this.#pubnub[config.file? 'sendFile': 'publish'](config, async (status, response) => {
	            if(!status.error) {
					this.#lobby.messages.unsent.shift();
	    			this.#lobby.messages.retryCount = 0;
	            } 
	            if(status.error) {
					if(this.#lobby.retryCount <= 2) 
	                	++this.#lobby.messages.retryCount;
					else {
						this.#lobby.messages.retryCount = 0;
			        	this.#lobby.messages.unsent = [];
						Notify.alert({ 
		                    header: "Network Error", 
		                    message: "We couldn't communicate with the opponent. Please try again.<br>Details:<br>" + status.message + "<br>" + status.category});
					} 
	            } 
				if(this.#lobby.messages.unsent.length > 0) 
		        	await publish();
		    });
		}  
		
	    const metaConfig = {
	        "uuid": this.#uuid
	    } 
	    const publishConfig = {
	        channel: data.channel || this.#main, 
	        message: JSON.stringify(data.message), 
			file: data.file,
	        meta: metaConfig 
	    } 
		
	    this.#lobby.messages.unsent.push(publishConfig);
	    
	    if(this.#lobby.messages.unsent.length == 1)
	        publish();
	} 
	
	static addMessageAction ({messageTimetoken, action}) {
		if(!this.#pubnub)
			return;
			
		this.#pubnub.addMessageAction({
			channel: this.#main, 
			messageTimetoken, 
			action
		});
	} 
	
	static checkMessageLimit (text) {
		let message = {title: "ChatMessage", content: text};
	    let packet = this.#main + JSON.stringify(message);
	    let size = encodeURIComponent(packet).length + 100;
	    return size > 500;// 32768;
	} 
	
	static async subscribe () {
		let name = $("#online .playerA_name").value.trim(); 
		this.#main = this.#main || btoa(new Date).slice((Math.random() * 5 + 17) * -1, -2);
		this.#bay = this.#bay || this.#main + '-bay';
		
		if(name === "") {
			$("#online .playerA_name").focus();
        	return Notify.popUpNote("Please fill out your name.");
		} 
		
		if(!navigator.onLine) 
			return Notify.popUpNote("Can't complete this request. You are offline."); 
			
		if(this.#lobby.isConnected && name != PLAYER_A.name) {
			if(!PLAYER_B.name) {
				Notify.popUpNote("Can not change name at this time, please wait for opponent of unsubscribe and try again with the desired changes.");
				$("#online .playerA_name").value = PLAYER_A.name;
				return;
			} 
			
			this.send({channel: this.#main, message: {title: "NameChange", content: name}}); 
			
			this.setPlayersName(name, PLAYER_B.name);
				
			return Notify.popUpNote("Please wait...");
		} 
		
		if(this.#lobby.isConnected)
			return Notify.popUpNote("Already connected to the platform. Unsubscribe to try again")
		
		if(!window.PubNub) {
			Notify.popUpNote("An error occurred. Loading necessary data...");
			
            let src = $("#pubnub-file").getAttribute("src");
            let script = $$$("script");
            document.head.removeChild($("#pubnub-file"));
            document.head.appendChild(script);
            script.addEventListener("load", () => {
                // To do something
            } , false);
            script.setAttribute("id", "pubnub-file");
            script.src = src;
            return;
		} 
		
		this.generateUUID();
		this.#pubnub = new PubNub({
            uuid: this.#uuid,
            publish_key: 'pub-c-1d3446b1-0874-4490-9ac7-20c09c56bf71',
            subscribe_key: 'sub-c-3a0c6c3e-bfc7-11ea-bcf8-42a3de10f872',
            ssl: true, 
            presenceTimeout: 20, 
            restore: false
        });
		
		this.#lobby.bayListener = {
			presence: (response) => { 
				if(response.channel == this.#bay && response.action === "join") {
            		this.#pubnub.hereNow({
                		channels: [this.#main] 
                	}, async (status, response2) => {
                    	if(response2.totalOccupancy < 2) {
							this.#lobby.isHost = response2.totalOccupancy == 0;
							this.#pubnub.removeListener(this.#lobby.bayListener);
							this.#pubnub.unsubscribe({
								channels: [this.#bay] 
							});
							
							this.#pubnub.addListener(this.#lobby.mainListener);
							
							const filter = `uuid != '${this.#pubnub.getUUID()}'`;
    						this.#pubnub.setFilterExpression(filter);
                            this.#pubnub.subscribe({
								channels: [this.#main], 
								withPresence: true
							});
						} 
						else {
							let url = new URL(window.location);
							if(url.searchParams.has("c") && url.searchParams.get("c") == this.#main) {
								let res = await Notify.confirm({
									header: "Room is full", 
									message: "The shared room is full, would like to try a different one?", 
									type: "CANCEL/TRY"
								});
								
								if(res == "CANCEL") 
									return;
							} 
							// Main channel is full try a different channel
							this.reset();
							this.subscribe();
						} 
					});
				} 
				else if(response.channel == this.#bay && response.action === 'timeout') {
                    Notify.popUpNote(`Connection timeout to ${this.#main} channel. Reconnecting...`);
                } 
        	}
		} 
		
		this.#pubnub.addListener(this.#lobby.bayListener);
        this.#pubnub.subscribe({
            channels: [this.#bay], 
            withPresence: true, 
        }); 
        
        await new Sleep().wait(0.1);
        Notify.popUpNote("Connecting...");
        
        this.#lobby.mainListener = {
        	presence: async (response) => { 
				if(response.channel == this.#main) {
                    if(response.action === 'join') {
						if(response.uuid == this.#uuid && response.occupancy <= 2) {
							
						} 
						else if(response.UUID != this.#uuid && response.occupancy <= 2) {
							
						} 
						else if(response.occupancy > 2) {
							// Channel full, try a different one
							this.reset();
							this.subscribe();
						} 
                    } 
                    else if(response.action === 'timeout') {
						if(response.uuid == this.#uuid) {
							this.unsubscribe(false);
						} 
						else if(PLAYER_B.name) { 
							this.#lobby.offlineTimeout = setTimeout(() => this.left(), 120_000);
							this.left("offline");
						} 
                    } 
					else if(response.action === "leave" && response.uuid != this.#uuid) {
						this.left();
					} 
					else if(response.action === "leave" && response.uuid == this.#uuid) {
						
					} 
					else if(response.action === "state-change" && response.uuid != this.#uuid) { 
						let action = response.state.action;
						let value = response.state.value;
						
						Chat.changeStatus(value? action: "online");
					} 
                } 
            }, 
            status: async (event) => {
                if(!this.#lobby.isConnected && event.category === 'PNConnectedCategory') {
                	this.setConnectivityStatus("connected");
                	this.setPlayersName(name, '');
					
                    if(this.#lobby.isHost) {
                        Notify.popUpNote(`Subscribed successfully. Waiting for opponent...`);
                        let res = await Notify.confirm({
                        	header: "Connected successfully", 
                        	message: "Use this link to invite opponent<br/><br/>" + location.href.split('?')[0] + '?c=' + this.#main + "&t=" + Date.now(),
                        	type: "UNSUBSCRIBE/COPY", 
							icon: ICONS.alertIcon
                    	});
                    
                    	if(res == "UNSUBSCRIBE")
                    		this.unsubscribe();
                    	else
                    		this.copy();
                    } 
                    else {
                        Notify.popUpNote(`Subscribed successfully`);
                        this.send({
	                        channel: this.#main, 
	                        message: {
								title: "OpponentName", 
								content: PLAYER_A.name}
                        });
                    } 
                    
                    Mode.disable("offline", "single"); 
                } 
                else if(event.category === 'PNReconnectedCategory') {
                	Notify.popUpNote(`Reconnected back successfully.`);
                	this.send({channel: this.#main, message: {title: "Reconnected", content: ""}});
                } 
                else if(event.category === 'PNNetworkUpCategory') {
                    Notify.popUpNote("You are back online.");
                } 
                else if(event.category === 'PNNetworkIssueCategory') {
                    Notify.popUpNote("Having trouble to connect, please check your device internet connection.");
                } 
                else if(event.category === 'PNNetworkDownCategory') {
                    Notify.popUpNote("You are offline.");
                }
                else if(event.category === 'PNTimeoutCategory') {
					
                } 
            }, 
            message: (msg) => {
            	msg.message = JSON.parse(msg.message);
				clearTimeout(this.#lobby.offlineTimeout);
				
                if(msg.channel === this.#main) {
                    if(msg.message.title === 'Reconnected') {
                        this.setOpponentStatus("online");
                        $("#chat-icon").classList.add("visible");
                        Notify.popUpNote(`${PLAYER_B.name} is back online.`); 
                    } 
                    else if(msg.message.title === "NameChange") {
                		let name = msg.message.content;
                		
                		this.addMessageAction({
							messageTimetoken: msg.timetoken, 
							action: {
								type: "delivered", 
								value: "name-change"
							} 
						});
						
						this.setPlayersName(PLAYER_A.name, name);
                		Notify.popUpNote(`Your opponent changed name to ${name}`); 
                	} 
                    else if(msg.message.title === 'OpponentName') { 
                        let name = msg.message.content;
                        this.setPlayersName(PLAYER_A.name, name);
                        this.setOpponentStatus("online");
                        Chat.init();
                        
                        if(this.#lobby.isHost)
	                        this.send({
		                        channel: this.#main, 
		                        message: {
									title: "OpponentName", 
									content: PLAYER_A.name}
	                        }); 
                        
                        Notify.popUpNote(`Your opponent is ${name}`);
                    } 
                    else if(msg.message.title === 'ChatMessage') { 
                    	this.addMessageAction({
							messageTimetoken: msg.timetoken, 
							action: {
								type: "delivered", 
								value: msg.message.content.id
							} 
						});
						
						let message = {action: 'receive', count: this.#lobby.messages.unread.length+1, text: msg.message.content.text, id: msg.message.content.id, timetoken: msg.timetoken};
						
						this.#lobby.messages.unread.push(message);
						Chat.addMessage(message);
                    } 
                    else if(msg.message.title === "deleted") {
                    	let ids = msg.message.ids.split("-");
                    	let selected = [];
                    	for(let id of ids) {
                    		let bubble = $("#left-" + id);
                    		if(bubble) {
                    			selected.push(bubble);
                    		} 
                    	} 
                    	
                    	Chat.deleteMessage(selected, "MYSELF", true);
                    } 
                    else if(msg.message.title === "RequestPlay") {
                    	this.request(msg.message);
                    } 
                    else if(msg.message.title === "RequestReplay") {
                        this.request(msg.message);
                    } 
                    else if(msg.message.title === "RequestRestart") {
                        this.request(msg.message);
                    } 
                    else if(msg.message.title === "AcceptedRequest") {
                        Notify.popUpNote(PLAYER_B.name + " accepted the request, the game will start shortly.");
                        Notify.cancel();
                        setTimeout(() => Play.start(true), 2000);
                    } 
                    else if(msg.message.title === "ConfirmedRequest") {
                        this.request(msg.message);
                    } 
                    else if(msg.message.title === "DeclinedRequest") {
                    	$("#play-window").classList.remove("visible", "hide");
                        Notify.popUpNote(PLAYER_B.name + " declined your request.");
                        Notify.cancel();
                    } 
                    else if(msg.message.title === "AllSet") {
                        Notify.cancel();
                    } 
                    else if(msg.message.title === "Moved") {
						let {i, j} = msg.message.content;
						let cell = $(`.cell[value="${i}${j}"`);
						let event = new Event('click');
						cell.dispatchEvent(event);
                    } 
                    else if(msg.message.title === "Undone") {
                    	Notify.popUpNote(PLAYER_B.name + " undid the move");
                        Play.undo(true);
                    } 
                    else if(msg.message.title === "Hint") {
                        Notify.popUpNote(PLAYER_B.name + " has use hint");
                    } 
                    else if(msg.message.title === "ExitedGame") {
                        Notify.popUpNote(PLAYER_B.name + " exited the game.");
                        Play.exit(false, true);
                    } 
                } 
            }, 
            messageAction: (action) => { 
            	if(action.publisher != this.#uuid) {
                	let type = action.data.type;
                	let id = action.data.value;
                	if(type == "delivered") {
                		if(id == "name-change") {
                			Notify.popUpNote("Name changed successfully to " + PLAYER_A.name);
                		} 
                		let tick = $("#" + id);
                        tick.classList.add("grey");
                	} 
                	else if(type == "read") {
						if(/many-\d+$/gi.test(id)) {
							let length = parseInt(id.split("-")[1]);
							let ticks = Array.from($$(".tick.grey")).slice(-length);
							for(let tick of ticks) {
								tick.classList.add("blue");
							} 
						} 
						else {
                			let tick = $("#" + id);
                        	tick.classList.add("blue");
						} 
                	} 
				}
            }, 
            file: async (msg) => {
            	let downloadConfig = {
					channel: msg.channel,
					id: msg.file.id,
					name: msg.file.name
				} 
				msg.message = JSON.parse(msg.message);
				let file = await this.#pubnub.downloadFile(downloadConfig);
            	let message = {action: 'receive', file, count: this.#lobby.messages.unread.length+1, id: msg.message.id, timetoken: msg.timetoken};
            	
            	this.#lobby.messages.unread.push(message);
            	Chat.addMessage(message);
            	
            	
				this.addMessageAction({
					messageTimetoken: msg.timetoken, 
					action: {
						type: "delivered", 
						value: msg.message.id
					} 
				});
			}, 
		} 
	} 
	
	static async unsubscribe (isClick = true) {
		const act = async (action) => {
			if(action == "UNSUBSCRIBE") {
				if(this.#lobby.isConnected) {
			    	Notify.alertSpecial({ 
			    			header: "Please wait", 
			    			message: `Unsubscribing...`});
					
					this.#pubnub.unsubscribe({
						channels: [this.#main]
					});
			
					await new Sleep().wait(1);
			        
			        this.#pubnub.removeListener(this.#lobby.mainListener);
			        Notify.popUpNote(`Unsubscribed successfully.`);
				} 
				else {
					return Notify.popUpNote("You are already unsubscribed.");
				} 
				
				Notify.cancel();
		        
		        clearTimeout(this.#lobby.offlineTimeout);
				
		        this.setConnectivityStatus("disconnected");
				this.setOpponentStatus("");
				this.setPlayersName("", "");
				this.reset();
				
				if($("#chat-window").classList.contains("visible"))
					UIHistory.undo();  
				
				if(Mode.getMode() == "two-players-online" && $("#play-window").classList.contains("visible")) 
		    		Play.exit(false, true);
					
				$("#chat-icon").classList.remove('visible');
				Mode.enable("offline", "single");
			} 
			else if(action == "NOT NOW" || action == "AM ACTIVE") {
				if(action == "AM ACTIVE" && this.#lobby.isConnected) {
					this.send({channel: this.#main, message: {title: "Reconnected", content: ""}});
					clearTimeout(this.#lobby.offlineTimeout);
				} 
			} 
		}  
		
	    if(this.#lobby.isConnected) {
	    	let choice;
	    	if(isClick) {
		    	choice = await Notify.confirm({
		    			header: "Do you really want to unsubscribe?", 
		    			message: "Unsubscribing means you cannot play an online match.", 
		    			type: "NOT NOW/UNSUBSCRIBE"
				});
			} 
			else {
				this.#lobby.offlineTimeout = setTimeout(() => {
					act("UNSUBSCRIBE");
				}, 120_000); /* 2 minutes */
				
				choice = await Notify.confirm({
		    			header: "Connection Timeout?", 
		    			message: `You have been dormant in a while, we couldn't establish a connection. If this persist for 2 minutes without any action you will be unsubscribed`, 
		    			type: "AM ACTIVE/UNSUBSCRIBE"
		    	});
			} 
			
			act(choice);
	    } 
	    else {
	        Notify.popUpNote("You are not subscribed yet");
	    } 
	} 
	
	static left (status = "") {
		this.setOpponentStatus(status);
		
		if(status == "offline") 
			return Notify.popUpNote(`${PLAYER_B.name} went offline.`); 
		
		if($("#chat-window").classList.contains("visible"))
			UIHistory.undo();  
		
		if(Mode.getMode() == "two-players-online" && $("#play-window").classList.contains("visible")) 
    		Play.exit(false, true);
			
        this.#lobby.isHost = true;
        
        $("#chat-icon").classList.remove('visible');
        
        Notify.popUpNote(`${PLAYER_B.name} left.`); 
	} 
	
	static async request (prop) {
		let option = "";
		if(prop.title === "RequestPlay") {
	        option = await Notify.confirm({
	                header: "Request for a  match!", 
	                type: "CANCEL/ACCEPT", 
	                message: `${PLAYER_B.name} is requesting a match with you`
			});
	    } 
	    else if(prop.title === "RequestReplay") {
	        option = await Notify.confirm({
	                header: "Request for rematch", 
	                type: "CANCEL/ACCEPT", 
	                message: `${PLAYER_B.name} is requesting a rematch with you.`
			});
	    } 
	    else if(prop.title === "RequestRestart") {
	        option = await Notify.confirm({
	                header: "Request to restart", 
	                type: "CANCEL/ACCEPT", 
	                message: `${PLAYER_B.name} wants to restart this match.`
			});
	    } 
		else if(prop.title === "ConfirmedRequest") {
			Setting.setFirstMove(prop.content.firstMove);
			Setting.setMandatoryCapture(prop.content.mandatoryCapture);
			
			Play.restart(true, true);
		} 
		
	    if(option === "ACCEPT") { 
			if(prop.title === "RequestPlay") {
		        Setting.setFirstMove(prop.content.firstMove);
				Setting.setMandatoryCapture(prop.content.mandatoryCapture);
				Version.setVersion(prop.content.version);
			} 
			else if(prop.title === "RequestRestart") {
				return this.confirmRequest();
			} 
	        
	        await setTimeout(async () => {
	            this.send({
					message: {title: "AcceptedRequest", content: ""} 
				});
	            Play.start(true);
	        }, 200);
			Notify.popUpNote("The game will start shortly..."); 
	    } 
	    else if(option === "CANCEL") {
	        this.send({message: {title: "DeclinedRequest", content: ""} });
	    }  
	} 
	
	static allSet () {
		this.send({
			message: {
				title: "AllSet", 
				content: "", 
			} 
		});
	} 
	
	static async confirmRequest () {
		await Play.restart(false, true);
		
		let firstMove = !PLAYER_A.turn;
		let mandatoryCapture = Setting.get("mandatory-capture");
		
		this.send({
			message: {
				title: "ConfirmedRequest", 
				content: {firstMove, mandatoryCapture}
			} 
		});
		
		Notify.alertSpecial({
			header: "Restarting Match", 
			message: "Match restarted waiting for opponent"
		});
	} 
	
	static requestPlay () {
		let firstMove = !PLAYER_A.turn;
		let mandatoryCapture = Setting.get("mandatory-capture");
		let version = Version.getVersion();
		
		this.send({
			message: {
				title: "RequestPlay", 
				content: {firstMove, mandatoryCapture, version}
			} 
		});
	} 
	
	static requestRestart () {
		this.send({
			message: {
				title: "RequestRestart", 
				content: ""
			} 
		});
	} 
} 