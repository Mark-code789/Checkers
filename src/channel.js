'use strict' 

/* Version: 54*/

const CheckHref = async () => {
	let url = new URL(window.location);
	
	if(url.searchParams.has("name")) {
		let name = url.searchParams.get("name");
		$("#online #channel-name").value = name;
		await Mode(3, false);
		BackState.state.push(["#main-window", "#two-players-window"]);
        $("#main-window").style.display = "none";
        $("#two-players-window").style.display = "grid";
        
        Notify.alert({ 
    			header: "Message", 
    			message: `Please fill in your name in the field named 'PLAYER DETAILS' and hit <kbd>SUBMIT</kbd> button at the bottom right corner of this window to join ${name} channel as shown below. Your opponent will refer to you using the name you will provide.<img src='./src/images/player image.png'>`});
    	$("#online .playerA_name").focus();
	} 
	history.pushState(null, "", "");
} 

const Lobby = {isConnected: false, isHost: false, unreadMessages: [], offlineTimeout: null};

const ChannelFunction = async () => {
	if(!navigator.onLine) {
		Notify.popUpNote("Can't complete this request. You are offline.");
		return;
	} 
	
    let name = $("#online .playerA_name").value.trim();
    let channel = $("#online #channel-name").value;
    if(channel === "") {
        $("#online #channel-name").focus();
    	Notify.popUpNote("Please fill out channel name.");
    } 
	else if(name === "") {
		$("#online .playerA_name").focus();
        Notify.popUpNote("Please fill out your name.");
    } 
    else {
        channel = channel.replaceAll(/^\w|\s\w/g, t => t.toUpperCase());
        name = name.replace(/^\w|\s\w/g, t => t.toUpperCase());
        $("#online #channel-name").maxLength = "100";
        playerA.name = name;
        
        try { 
            if(!Lobby.isConnected) { 
            	$$("#online .player_name")[0].innerHTML = name;
            	$$("#online .player_name")[0].setAttribute("value", name);
            	if(storage) {
            		if(storage.getItem("Checkers - uuid")) {
                		Lobby.UUID = storage.getItem("Checkers - uuid");
                	} 
					else {
						Lobby.UUID = PubNub.generateUUID();
						storage.setItem("Checkers - uuid", Lobby.UUID);
					} 
                } 
                else {
					Lobby.UUID = PubNub.generateUUID();
				} 
                
                Lobby.CHANNEL = channel;
                Lobby.LOBBY = "Lobby"+channel;
                Lobby.PUBNUB = new PubNub({
                    uuid: Lobby.UUID,
                    publish_key: 'pub-c-1d3446b1-0874-4490-9ac7-20c09c56bf71',
                    subscribe_key: 'sub-c-3a0c6c3e-bfc7-11ea-bcf8-42a3de10f872',
                    ssl: true, 
                    presenceTimeout: 20, 
                    restore: false
                });
                
                Lobby.LOBBY_LISTENER = {
                	presence: function(response) { 
						if(response.channel == Lobby.LOBBY && response.action === "join") {
	                		Lobby.PUBNUB.hereNow({
	                    		channels: [Lobby.CHANNEL] 
	                    	}, function (status, response2) {
	                        	if(response2.totalOccupancy < 2) {
									Lobby.isHost = response2.totalOccupancy == 0;
									Lobby.PUBNUB.removeListener(Lobby.LOBBY_LISTENER);
									Lobby.PUBNUB.unsubscribe({
										channels: [Lobby.LOBBY] 
									});
									Lobby.PUBNUB.addListener(Lobby.LISTENER);
									const Filter = `uuid != '${Lobby.PUBNUB.getUUID()}'`;
            						Lobby.PUBNUB.setFilterExpression(Filter);
		                            Lobby.PUBNUB.subscribe({
										channels: [Lobby.CHANNEL], 
										withPresence: true
									});
								} 
								else {
									Notify.popUpNote(`${Lobby.CHANNEL} channel is fully occupied, please try another channel.`);
									Lobby.PUBNUB.removeListener(Lobby.LOBBY_LISTENER);
									Lobby.PUBNUB.unsubscribe({
										channels: [Lobby.LOBBY]
									});
									Lobby.CHANNEL = null;
									Lobby.LOBBY = null;
							        Lobby.isConnected = false;
							        Lobby.PUBNUB = null;
							        Lobby.isHost = false;
									$("#online #channel-name").value = "";
								} 
							});
						} 
						else if(response.channel == Lobby.LOBBY && response.action === 'timeout') {
                            Notify.popUpNote(`Connection timeout to ${Lobby.CHANNEL} channel. Reconnecting...`);
                        } 
                	}
                } 
                
                Lobby.PUBNUB.addListener(Lobby.LOBBY_LISTENER);
                Lobby.PUBNUB.subscribe({
                    channels: [Lobby.LOBBY], 
                    withPresence: true, 
                }); 
                
                await new Sleep().wait(0.1);
                Notify.popUpNote("Connecting...");
                
                Lobby.LISTENER = {
                    presence: async function(response) { 
						if(response.channel == Lobby.CHANNEL) {
	                        if(response.action === 'join') {
								if(response.uuid == Lobby.UUID && response.occupancy <= 2) {
									
								} 
								else if(response.UUID != Lobby.UUID && response.occupancy <= 2) {
									
								} 
								else if(response.occupancy > 2) {
									Unsubscribed();
									Notify.popUpNote(`${Lobby.CHANNEL} channel is full please try another one`);
								} 
	                        } 
	                        else if(response.action === 'timeout') {
								if(response.uuid == Lobby.UUID) {
									Unsubscribe(false);
								} 
								else if(Lobby.opponent) { 
									Lobby.offlineTimeout = setTimeout(() => LeftChannel({totalOccupancy: 1}), 180_000);
									let opp = $$("#online .player_name")[1].innerHTML;
									Notify.popUpNote(`${opp} went offline.`);
									let status = $$(".chat_header p")[1];
									status.innerHTML = "offline";
									let opponentStatus = $("#player-2-status");
									opponentStatus.setAttribute("value", "offline");
						        	opponentStatus.innerHTML = "OFFLINE";
						        	opponentStatus.classList.remove("black_ui", "default");
									opponentStatus.classList.add("orange_ui");
								} 
	                        } 
							else if(response.action === "leave" && response.uuid != Lobby.UUID) {
								LeftChannel({totalOccupancy: 1});
							} 
							else if(response.action === "leave" && response.uuid == Lobby.UUID) {
								
							} 
							else if(response.action === "state-change" && response.uuid != Lobby.UUID) { 
								let action = response.state.action;
								
								if(response.state.value == true) {
									let state = $(".state_container");
									state.classList.add(action);
									let status = $$(".chat_header p")[1];
									status.innerHTML = `${action}...`;
								} 
								else {
									let state = $(".state_container");
									state.classList.remove("recording", "typing");
									let status = $$(".chat_header p")[1];
									status.innerHTML = "online";
								} 
							} 
                        } 
                    }, 
                    status: async function(event) {
                        if(!Lobby.isConnected && event.category === 'PNConnectedCategory') {
                        	let connectivityStatus = $("#connectivity");
                            connectivityStatus.classList.remove("orange_ui");
                            connectivityStatus.classList.add("default");
                            connectivityStatus.textContent = "CONNECTED";
                            Lobby.isConnected = true;
                            
							$("#online .lobby_name").textContent = Lobby.CHANNEL + (Lobby.isHost? " (Host)": " (Guest)");
							
                            if(Lobby.isHost) {
                                Notify.popUpNote(`Connected to ${Lobby.CHANNEL} channel successfully as the host member. Waiting for opponent...`);
                            } 
                            else {
                                Notify.popUpNote(`Connected to ${Lobby.CHANNEL} channel successfully as the guest member.`);
                                Publish.send({
                                        channel: Lobby.CHANNEL, 
                                        message: {
                                                 title: "OpponentName", 
                                                 content: $$("#online .player_name")[0].innerHTML}
                                        });
                            } 
                        } 
                        else if(event.category === 'PNReconnectedCategory') {
                        	Notify.popUpNote(`Reconnected back to ${Lobby.CHANNEL} channel successfully.`);
                        	Publish.send({channel: Lobby.CHANNEL, message: {title: "Reconnected", content: ""}});
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
                    message: function(msg) {
                    	msg.message = JSON.parse(msg.message);
                    	clearTimeout(Lobby.offlineTimeout);
                        if(msg.channel === Lobby.CHANNEL) {
                            if(msg.message.title === 'Reconnected') {
                            	Notify.popUpNote(`${playerB.name} is back online.`);
                                let status = $$(".chat_header p")[1];
								status.innerHTML = "online";
								let opponentStatus = $("#player-2-status");
								opponentStatus.setAttribute("value", "online");
							    opponentStatus.innerHTML = "ONLINE";
							    opponentStatus.classList.remove("orange_ui", "black_ui");
								opponentStatus.classList.add("default");
								clearTimeout(Lobby.offlineTimeout);
                            } 
                            else if(msg.message.title === "NameChange") {
                        		name = msg.message.content;
                        		$$("#online .player_name")[1].innerHTML = name;
                        		$$(".chat_header h2")[1].innerHTML = name;
                        		Lobby.opponent = name;
                        		Notify.popUpNote(`Your opponent changed name to ${name}`);
                        	} 
                            else if(msg.message.title === 'OpponentName') { 
                                name = msg.message.content;
                                $$("#online .player_name")[1].textContent = name;
                                Lobby.opponent = name;
                                let opponentStatus = $("#player-2-status");
                                opponentStatus.setAttribute("value", "online");
                                opponentStatus.innerHTML = "ONLINE";
                                opponentStatus.classList.remove("orange_ui", "black_ui");
								opponentStatus.classList.add("default");
                                $("#chat-icon").style.display = 'block';
                                setTimeout(() => {ElemHint.setHint($("#chat-icon"), "Drag to move. Click to open chat.");}, 1000);
                                $$(".chat_header h2")[1].innerHTML = name;
                                $(".bubbles_container").innerHTML = "<div class='anchor'></div>";
                                playerB.name = name;
                                Notify.popUpNote(`Your opponent is ${name}`);
                                
                                if(Lobby.isHost) {
	                                Publish.send({
	                                         channel: Lobby.CHANNEL, 
	                                         message: {
	                                                  title: "OpponentName", 
	                                                  content: $$("#online .player_name")[0].innerHTML}
	                                         });
								}
                            } 
                            else if(msg.message.title === 'ChatMessage') { 
                            	Lobby.PUBNUB.addMessageAction({
									channel: Lobby.CHANNEL, 
									messageTimetoken: msg.timetoken, 
									action: {
										type: "delivered", 
										value: msg.message.content.id
									} 
								});
								let state = $(".state_container");
									state.classList.remove("recording", "typing");
									let status = $$(".chat_header p")[1];
									status.innerHTML = "online";
                                let badge = $(".badge");
                                if(GetValue($("#chat-icon"), "display") === "block") {
                                    badge.textContent = parseInt(badge.innerHTML)+1;
                                    badge.style.display = "block";
                                    Notify.popUpNote(`You have ${parseInt(badge.textContent) <= 1? 'a new message': badge.innerHTML + ' new messages'} from ${$$("#online .player_name")[1].innerHTML}`);
                                    AudioPlayer.play("notification", 0.8);
                                } 
                                Message({action: 'receive', count: parseInt(badge.innerHTML), text: msg.message.content.text, id: msg.message.content.id, timetoken: msg.timetoken});
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
                            	
                            	Bubble.selectedLeft = selected;
                            	Bubble.deleteBubble("MYSELF", true);
                            } 
                            else if(msg.message.title === "RequestPlay") {
                            	Request(msg.message);
                            } 
                            else if(msg.message.title === "RequestReplay") {
                                Request(msg.message);
                            } 
                            else if(msg.message.title === "RequestRestart") {
                                Request(msg.message);
                            } 
                            else if(msg.message.title === "AcceptedRequest") {
                                Notify.popUpNote($$("#online .player_name")[1].innerHTML + " accepted the request, the game will start shortly.");
                                Notify.cancel();
                                setTimeout(() => play(true), 2000);
                            } 
                            else if(msg.message.title === "DeclinedRequest") {
                                Notify.popUpNote($$("#online .player_name")[1].innerHTML + " declined your request.");
                                Notify.cancel();
                            } 
                            else if(msg.message.title === "Moved") { 
                            	OpponentMove.move(msg.message.content);
                            } 
                            else if(msg.message.title === "Undone") {
                            	Notify.popUpNote(playerB.name + " undid the move");
                                back(true, true);
                            } 
                            else if(msg.message.title === "Hint") {
                                Notify.popUpNote(playerB.name + " has use hint");
                            } 
                            else if(msg.message.title === "ExitedGame") {
                                Notify.popUpNote(msg.message.content + " exited the game.");
                                back();
                            } 
                        } 
                    }, 
                    messageAction: function(action) { 
                    	if(action.publisher != Lobby.UUID) {
	                    	let type = action.data.type;
	                    	let id = action.data.value;
	                    	if(type == "delivered") {
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
                    file: function(event) {
                    	let badge = $(".badge");
                        if(GetValue($("#chat-icon"), "display") === "block") {
                            badge.innerHTML = parseInt(badge.innerHTML)+1;
                            badge.style.display = "block";
                            Notify.popUpNote(`You have ${parseInt(badge.innerHTML) <= 1? 'a new message': badge.innerHTML + ' new messages'} from ${$$("#online .player_name")[1].innerHTML}`);
                            AudioPlayer.play("notification", 0.8);
                        } 
                        
						let player = new VoiceNotePlayer();
						player.receive({id: event.file.id, name: event.file.name, channel: event.channel, message: {timetoken: event.timetoken, id: event.message.id, count: parseInt(badge.innerHTML)}});
						Lobby.PUBNUB.addMessageAction({
							channel: Lobby.CHANNEL, 
							messageTimetoken: event.timetoken, 
							action: {
								type: "delivered", 
								value: event.message.id
							} 
						});
					} 
                } 
                /* End of listener*/
            } 
            else if(Lobby.isConnected && $$("#online .player_name")[0].innerHTML.toLowerCase() == $("#online .playerA_name").value.toLowerCase()) {
                Notify.alert({ 
                        header: "Duplicate Action", 
                        message: `<p>You are already subscribed to <b>${Lobby.CHANNEL}</b> channel. To join another channel, unsubscribe from this channel first.</p>`});
            } 
            else if(Lobby.isConnected &&  $$("#online .player_name")[0].innerHTML.toLowerCase() != $("#online .playerA_name").value.toLowerCase()) {
            	Publish.send({channel: Lobby.CHANNEL, message: {title: "NameChange", content: $("#online .playerA_name").value.replaceAll(/^\w|\s\w/g, t => t.toUpperCase())}});
            	$$("#online .player_name")[0].innerHTML = $("#online .playerA_name").value.replace(/^\w|\s\w/g, t => t.toUpperCase());
            	Notify.popUpNote("Name changed successfully");
            } 
        } catch (error) {
            Notify.popUpNote("An error occurred. Loading necessary data...");
            let src = $("#pubnub-file").getAttribute("src");
            let script = $$$("script");
            document.head.removeChild($("#pubnub-file"));
            document.head.appendChild(script);
            script.addEventListener("load", () => {
                ChannelFunction();
            } , false);
            script.setAttribute("id", "pubnub-file");
            script.src = src;
        } 
    } 
}

const Unsubscribe = async (isClick = true) => {
    if(Lobby.isConnected) {
    	let choice;
    	if(isClick) {
	    	choice = await Notify.confirm({
	    			header: "Do you really want to leave " + Lobby.CHANNEL + " channel?", 
	    			message: "Without a channel you cannot play an online match.", 
	    			type: "NOT NOW/LEAVE ANYWAY"
			});
		} 
		else {
			Lobby.offlineTimeout = setTimeout(() => {
				UnsubscribeResponse("LEAVE ANYWAY");
			}, 180_000); /* 3 minutes */
			
			choice = await Notify.confirm({
	    			header: "Connection Timeout?", 
	    			message: `You have been dormant in a while, we couldn't establish a connection to ${Lobby.CHANNEL} channel. If this persist for 3 minutes without any action you will be unsubscribed from the channel.`, 
	    			type: "AM ACTIVE/LEAVE ANYWAY"
	    	});
		} 
		
		UnsubscribeResponse(choice);
    } 
    else {
        Notify.popUpNote("You have not joined any channel.");
    } 
} 

const UnsubscribeResponse = async (choice) => { 
	if(choice == "LEAVE ANYWAY") {
		if(Lobby.PUBNUB) {
	    	Notify.alertSpecial({ 
	    			header: "Please wait", 
	    			message: `Unsubscribing ${Lobby.CHANNEL} channel...`});
			
			Lobby.PUBNUB.unsubscribe({
				channels: [Lobby.CHANNEL]
			});
	
			await new Sleep().wait(1);
	        
	        Lobby.PUBNUB.removeListener(Lobby.LISTENER);
	        Notify.popUpNote(`Unsubscribed from ${Lobby.CHANNEL} channel successfully.`);
		} 
		
		Notify.cancel();
        
        clearTimeout(Lobby.offlineTimeout);
        let connectivityStatus = $("#connectivity");
        connectivityStatus.classList.remove("default");
        connectivityStatus.classList.add("orange_ui");
        connectivityStatus.innerHTML = "DISCONNECTED";
        $("#online .lobby_name").innerHTML = "N/A";
        $("#online #channel-name").value = "";
        let opponentStatus = $("#player-2-status");
        opponentStatus.innerHTML = "N/A";
        opponentStatus.classList.remove("default", "orange_ui");
		opponentStatus.classList.add("black_ui");
		$("#online .playerA_name").value = "";
        $("#online .player_name:first-of-type").innerHTML = "N/A";
		$("#online .player_name:last-of-type").innerHTML = "N/A";
		if(GetValue($("#chat-window"), "display") == "flex")
			 BackState.state.pop();
		$("#chat-window").style.display = "none";
		$("#chat-icon").style.display = 'none';
        Lobby.CHANNEL = null;
        Lobby.isConnected = false;
        Lobby.PUBNUB = null;
        Lobby.isHost = false;
        Lobby.offlineTimeout = null;
		Lobby.opponent = null;
	} 
	else if(choice == "NOT NOW" || choice == "AM ACTIVE") {
		if(choice == "AM ACTIVE" && Lobby.PUBNUB) {
			Publish.send({channel: Lobby.CHANNEL, message: {title: "Reconnected", content: ""}});
			clearTimeout(Lobby.offlineTimeout);
		} 
		else {
			Notify.popUpNote("You are already unsubscribed from the channel.");
		} 
	} 
} 

class OpponentMove {
	static moves = [];
	static sleep;
	static move = (prop) => {
		this.moves.push(prop);
		if(this.moves.length == 1)
			this.make();
	} 
	static make = async () => {
		if(GetValue($("#play-window"), "display") == "none") {
			if(!this.sleep)
				this.sleep = new Sleep();
			await this.sleep.start();
		} 
		
		let prop = this.moves[0];
        let i = Game.boardSize-1 - prop.i, 
            j = Game.boardSize-1 - prop.j,
            cell = $("#table").children[i*Game.boardSize+j];
        await ValidateMove({cell, i, j, isComputer: true});
		await this.moves.shift();
		if(this.moves.length > 0)
			await this.make();
	} 
} 

class Publish { 
	static messages = [];
	static retryCount = 0;
	static send = async (prop) => {
	    const MetaConfig = {
	        "uuid": Lobby.UUID
	    } 
	    const PublishConfig = {
	        channel: Lobby.CHANNEL, 
	        message: JSON.stringify(prop.message), 
	        meta: MetaConfig 
	    } 
		
	    this.messages.push(PublishConfig);
	    
	    if(this.messages.length == 1)
	        this.publish();
	
		return Prms("done");
	} 
	    
    static publish = async () => { 
        let config = this.messages[0];
        let self = this;
		Lobby.PUBNUB.publish(config, async (status, response) => {
            if(!status.error) {
				self.messages.shift();
    			self.retryCount = 0;
            } 
            if(status.error) {
				if(self.retryCount <= 2) 
                	++self.retryCount;
				else {
					self.retryCount = 0;
		        	self.messages = [];
					Notify.alert({ 
	                    header: "Network Error", 
	                    message: "We couldn't communicate with the opponent. Please try again.<br>Details:<br>" + status.message + "<br>" + status.category});
				} 
            } 
			if(self.messages.length > 0) 
	        	await self.publish();
	    });
		return Prms("Done");
	} 
} 

const LeftChannel = (response) => {
    if(response.totalOccupancy < 2) {
    	if(Game.mode ==" two-player-online" && GetValue($("#play-window"), "display") == "grid") {
    		back();
    	} 
        let name = $$("#online .player_name")[1].innerHTML;
        $$("#online .player_name")[1].innerHTML = "N/A";
        let opponentStatus = $("#player-2-status");
        opponentStatus.innerHTML = "N/A";
        opponentStatus.classList.remove("default", "orange_ui");
		opponentStatus.classList.add("black_ui");
        if(GetValue($("#chat-window"), "display") == "flex")
			BackState.state.pop();
		$("#chat-icon").style.display = 'none';
        $("#chat-window").style.display = "none";
        $("#online .lobby_name").innerHTML = Lobby.CHANNEL + " (Host)";
        Lobby.isHost = true;
        Lobby.opponent = null;
        Notify.popUpNote(`${name} left ${Lobby.CHANNEL} channel.`);
    }
} 

const CalculateSize = (text) => {
    let message = {title: "ChatMessage", content: text};
    let packet = Lobby.CHANNEL + JSON.stringify(message);
    let size = encodeURIComponent(packet).length + 100;
    return size;
} 

const UpdateOnlineStatus = () => {
	let yourStatus = $("#player-1-status");
	if(!navigator.onLine) {
		yourStatus.setAttribute("value", "offline");
	    yourStatus.innerHTML = "OFFLINE";
	    yourStatus.classList.remove("default");
		yourStatus.classList.add("orange_ui");
	    
	} 
	else {
		yourStatus.setAttribute("value", "online");
		yourStatus.innerHTML = "ONLINE";
	    yourStatus.classList.remove("orange_ui");
		yourStatus.classList.add("default");
	    
	} 
} 

const Share = (elem) => {
    if(Lobby.isConnected) {
        if(navigator.canShare) {
        	Notify.alertSpecial({ 
					header: "Please wait", 
					message: "Preparing to share"});
            let channelName = Lobby.CHANNEL;
            let name = $$("#online .player_name")[0].textContent;
            navigator.share({
                title: "Checkers Game", 
                text: `Hi, ${name} is requesting you to join the following channel to play checkers match. Please click the the link below to join.\n`, 
                url: "https://mark-code789.github.io/Checkers/index.html?name=" + channelName
            }).then( () => { 
            	Notify.cancel();
                Notify.popUpNote("Channel name shared successfully."); 
            }).catch( (error) => { 
            	let message = error.toString().split(":");
                Notify.alert({ 
                        header: message[0], 
                        message: ("There was an error while trying to share the name of the channel.<br> :-" + message[1])});
            });
        } 
        else {
            Notify.alert({ 
                    header: "Oops! Sorry", 
                    message: "Your Browser does not support this kind of sharing. Please use your ordinary means."});
        } 
    } 
    else 
        Notify.popUpNote("You have not joined any channel.");
} 

class VoiceNoteRecorder {
	stream;
	mediaRecorder;
	audioChunks;
	timer;
	static recorder = null;
	static requestAbortion = false;
	static initiating = false;
	static aborting = false;
	static initializationError = false;
	init = async () => {
		try {
			this.stream = await navigator.mediaDevices.getUserMedia({ audio: true });
		} catch (error) {
			return error.name;
		} 
    	this.mediaRecorder = new MediaRecorder(this.stream);
    	this.audioChunks = [];
    	this.mediaRecorder.addEventListener("dataavailable", (event) => {
			this.audioChunks.push(event.data);
		});
		
		return "success";
	} 
	start = () => {
		this.mediaRecorder.start();
		let m = 0;
		let s = 0;
		let recorderTime = $(".recorder_time");
		recorderTime.textContent = "0:00";
		clearInterval(this.timer);
		this.timer = setInterval(() => {
			s++;
			if(s == 60) {
				m++;
				s = 0;
			} 
			recorderTime.textContent = `${m}:${String(s).padStart(2, '0')}`;
		}, 1000);
	} 
	stop = async (cancelled = false) => {
		let data = null;
		let sleep = new Sleep();
		let self = this;
		if(this.mediaRecorder) {
			this.mediaRecorder.addEventListener("stop", () => {
				if(!cancelled && this.audioChunks.length > 0) {
					const audioBlob = new Blob(this.audioChunks);
					const audioURL = URL.createObjectURL(audioBlob);
					const audio = new Audio(audioURL);
					const mimeType = self.mediaRecorder.mimeType.split(";")[0];
					data = {audioBlob, mimeType, audio};
				} 
				else {
					this.audioChunks = [];
					data = null;
				} 
				clearInterval(this.timer);
				$(".recorder_time").textContent = "0:00";
				sleep.end();
			});
			
			if(this.mediaRecorder.state == "recording") {
				this.mediaRecorder.stop();
				await sleep.start();
			} 
			this.stream.getTracks()[0].stop();
		} 
		else {
			data = "no media";
		} 
		
		return data;
	} 
	static record = async (elem) => {
		if(!Permissions.permissions.microphone) {
			Permissions.check("recorder");
			return false;
		} 
		if(this.initiating || this.aborting) return false; /* Discard the request */
		this.requestAbortion = false; /* Resetting call to abort */
		this.initiating = true; /* Process started */
		this.initializationError = false;
		
		/* Stopping all initial opened streams*/
		try {
			let stream = await navigator.mediaDevices.getUserMedia({ audio: true });
			for(let track of stream.getTracks()) {
				track.stop();
			} 
		} catch (error) {}
		
		this.recorder = new VoiceNoteRecorder();
		let res = await this.recorder.init();
		
		if(res != "success") {
			Notify.popUpNote(res + " occurred. We couldn't proceed.");
			navigator.vibrate([100,50,100]);
			this.recorder = null;
			this.initializationError = true;
			this.initiating = false;
			return false;
		} 
		let recorderCont = $(".recorder_container");
		recorderCont.style.transitionDuration = "0.3s";
		elem.style.transitionDuration = "0.3s";
		elem.style.height = "70px";
		elem.style.width = "70px";
		elem.style.bottom = "-2.5px";
		$(".field_container").style.opacity = 0;
		recorderCont.style.display = "flex";
		recorderCont.style.width = "calc(100% - 60px)";
		AudioPlayer.play("startRecording", 1);
		navigator.vibrate(50);
		await new Sleep().wait(0.5); /* waiting for recording audio to finish playing*/
		res = true;
		if(this.requestAbortion) {
			if(this.recorder && this.recorder.stream) 
				this.recorder.stream.getTracks()[0].stop();
			this.recorder = null;
			elem.style.height = "45px";
			elem.style.width = "45px";
			elem.style.bottom = "10px";
			elem.style.transform = `none`;
			recorderCont.style.width = "calc(100% - 70px)";
			
			await new Sleep().wait(0.3); /* wait for animation to finish */
			$(".field_container").style.opacity = 1;
			recorderCont.style.display = "none";
			res = false;
			ElemHint.setHint(elem, "Hold to record. Release to send. Slide left to cancel.");
		} 
		else {
			if(Lobby.isConnected) {
				Lobby.PUBNUB.setState({
					state: {action: "recording", value: true}, 
					channels: [Lobby.CHANNEL]
				});
			} 
			this.recorder.start();
		} 
		this.initiating = false;
		elem.style.transitionDuration = "0s";
		recorderCont.style.transitionDuration = "0s";
		return res;
	} 
	static stopRecording = async (elem, cancelled = false) => {
		if(!Permissions.permissions.microphone) {
			return;
		} 
		try {
			this.requestAbortion = true;
			if(this.initiating || this.initializationError || this.aborting) return; /* Discard the request */
			this.aborting = true; /* Aborting process started */
			elem.style.height = "45px";
			elem.style.width = "45px";
			elem.style.bottom = "10px";
			elem.style.transform = `none`;
			await new Sleep().wait(0.3); /* Wait for animation to finish */
			let res = await this.recorder.stop(cancelled);
			if(cancelled) {
				if(Lobby.isConnected) {
					Lobby.PUBNUB.setState({
						state: {action: "recording", value: false}, 
						channels: [Lobby.CHANNEL]
					});
				} 
				setTimeout(() => {$(".recorder_delete").classList.add("delete_recording")}, 400);
				setTimeout(() => {AudioPlayer.play("throwRecording", 1)}, 800);
				$(".recorder_time").classList.add("delete_recording");
				AudioPlayer.play("deleteRecording", 1);
				navigator.vibrate(50);
				
				await new Sleep().wait(2.1);
				$(".recorder_delete").classList.remove("delete_recording");
				$(".recorder_time").classList.remove("delete_recording");
				Notify.popUpNote("deleted successfully");
			} 
			else if(typeof res == "object") {
				if(Lobby.isConnected) {
					Lobby.PUBNUB.setState({
						state: {action: "recording", value: false}, 
						channels: [Lobby.CHANNEL]
					});
				} 
				let player = new VoiceNotePlayer();
				player.send(res);
				AudioPlayer.play("stopRecording", 1);
				navigator.vibrate(50);
			} 
			
			$(".field_container").style.opacity = 1;
			$(".recorder_container").style.width = "calc(100% - 70px)";
			$(".recorder_container").style.display = "none";
			this.recorder = null;
			this.aborting = false;
		} catch (error) {
			/* Stopping all initial opened streams*/
			try {
				let stream = await navigator.mediaDevices.getUserMedia({ audio: true });
				for(let track of stream.getTracks()) {
					track.stop();
				} 
			} catch (error) {}
			elem.style.height = "45px";
			elem.style.width = "45px";
			elem.style.bottom = "10px";
			elem.style.transform = `none`;
			$(".recorder_delete").classList.remove("delete_recording");
			$(".recorder_time").classList.remove("delete_recording");
			$(".field_container").style.opacity = 1;
			$(".recorder_container").style.width = "calc(100% - 70px)";
			$(".recorder_container").style.display = "none";
			this.recorder = null;
			this.aborting = false;
		} 
	} 
} 

class VoiceNotePlayer {
	panel;
	btn;
	range;
	time;
	timer;
	audio;
	playing = false;
	initialPlay = false;
	static currentPlayer;
	constructor () {
		this.panel = $$$("div", ["class", "audio_panel"]);
		this.btn = $$$("button", ["class", "audio_play audio_download"]);
		this.range = $$$("input", ["type", "range", "max", "100", "value", "0", "class", "audio_slider"]);
		this.time = $$$("label", ["class", "audio_current_time", "textContent", "0:00"]);
		this.panel.appendChild(this.btn);
		this.panel.appendChild(this.range);
		this.panel.appendChild(this.time);
		
		this.btn.addEventListener("click", this.play, false);
		this.btn.addEventListener("focus", (event) => ChangeTextBox(false, this.btn, event), false);
		this.range.addEventListener("change", this.skip, false);
		this.range.addEventListener("input", this.skipInput, false);
		this.range.addEventListener("focus", (event) => ChangeTextBox(false, this.range, event), false);
	} 
	send = async (data) => {
		this.audio = data.audio;
		this.audio.addEventListener("ended", () => {
			this.playing = false;
			this.audio.currentTime = 0;
			this.audio.muted = false;
			this.audio.playbackRate = 1;
			clearInterval(this.timer);
			this.time.textContent = "0:00";
			this.range.style.backgroundSize = `0%`;
			this.range.value = 0;
			this.btn.classList.remove("audio_pause", "audio_download");
			this.panel.style.pointerEvents = "auto";
			this.range.style.pointerEvents = "auto";
			VoiceNotePlayer.currentPlayer = null;
		});
		this.audio.addEventListener("loadeddata", () => {
			if(String(this.audio.duration) == "Infinity") {
				this.audio.muted = true;
				this.audio.play();
				this.audio.playbackRate = 10;
				return;
			} 
			this.btn.classList.remove("audio_download");
			this.panel.style.pointerEvents = "auto";
		});
		
		const msgID = await Message({action: 'send', text: this.panel}, false);
		const buffer = await data.audioBlob.arrayBuffer();
		const mimeType = data.mimeType;
		if(Lobby.isConnected) {
			const MetaConfig = {
		        "uuid": Lobby.UUID
		    } 
			const FileConfig = {
				data: buffer, 
				name: "CH-" + Date.now() + "." + mimeType.split("/")[1],
				mimeType
			} 
			const MessageConfig = {
				id: msgID
			} 
			Lobby.PUBNUB.sendFile({
				channel: Lobby.CHANNEL, 
				message: MessageConfig, 
				file: FileConfig, 
				meta: MetaConfig
			});
		} 
	} 
	receive = async (data) => {
		Message({action: 'receive', text: this.panel, count: data.message.count, id: data.message.id, timetoken: data.message.timetoken});
		let DownloadConfig = {
			channel: data.channel,
			id: data.id,
			name: data.name
		} 
		let file = await Lobby.PUBNUB.downloadFile(DownloadConfig);
		let blob = await file.toFile();
		let url = URL.createObjectURL(blob);
		this.audio = new Audio(url);
		this.audio.addEventListener("ended", () => {
			this.playing = false;
			this.audio.currentTime = 0;
			this.audio.muted = false;
			this.audio.playbackRate = 1;
			clearInterval(this.timer);
			this.time.textContent = "0:00";
			this.range.style.backgroundSize = `0%`;
			this.range.value = 0;
			this.btn.classList.remove("audio_pause", "audio_download");
			this.panel.style.pointerEvents = "auto";
			this.range.style.pointerEvents = "auto";
			VoiceNotePlayer.currentPlayer = null;
			if(this.initialPlay)
				this.btn.click();
			this.initialPlay = false;
		});
		this.audio.addEventListener("loadeddata", () => {
			if(String(this.audio.duration) == "Infinity") {
				this.btn.classList.remove("audio_download");
				this.range.style.pointerEvents = "none";
			} 
			this.btn.classList.remove("audio_download");
			this.panel.style.pointerEvents = "auto";
		});
	} 
	play = async (event) => {
		general.chatFieldHadFocus = document.activeElement == $(".chat_field");
		if(this.playing) {
			this.playing = false;
			this.audio.pause();
			clearInterval(this.timer);
			event.target.classList.remove("audio_pause");
			VoiceNotePlayer.currentPlayer = null;
		} 
		else {
			if(String(this.audio.duration) == "Infinity") {
				this.audio.muted = true;
				this.audio.playbackRate = 10;
				this.btn.classList.add("audio_download");
				this.panel.style.pointerEvents = "none";
				this.initialPlay = true;
				this.audio.play();
				return;
			} 
			if(VoiceNotePlayer.currentPlayer) {
				VoiceNotePlayer.currentPlayer.btn.click();
			} 
			VoiceNotePlayer.currentPlayer = this;
			this.playing = true;
			this.audio.play();
			this.timer = setInterval(() => {
				let m = Math.floor(this.audio.currentTime / 60);
				let s = Math.floor(this.audio.currentTime % 60);
				this.time.textContent = `${m}:${String(s).padStart(2, '0')}`;
				let pac = Math.floor(this.audio.currentTime / this.audio.duration * 100);
				this.range.style.backgroundSize = `${pac}%`;
				this.range.value = `${pac}`;
			}, 1);
			event.target.classList.add("audio_pause");
		} 
	} 
	skip = async (event) => {
		general.chatFieldHadFocus = document.activeElement == $(".chat_field");
		let point = event.target.value;
		let time = point / 100 * this.audio.duration;
		this.audio.currentTime = time;
		if(this.playing) {
			this.playing = false;
			this.btn.click();
		} 
	} 
	skipInput = async (event) => {
		if(!this.audio.paused) {
			this.audio.pause();
			clearInterval(this.timer);
			this.btn.classList.remove("audio_pause");
		} 
		event.target.style.backgroundSize = `${event.target.value}%`;
		let time = event.target.value / 100 * this.audio.duration;
		let m = Math.floor(time / 60);
		let s = Math.floor(time % 60);
		this.time.textContent = `${m}:${String(s).padStart(2, '0')}`;
	} 
} 

const Message = async (prop, publish = true) => { 
    let container = $(".bubbles_container");
    let anchor = $(".anchor");
    let bubble = $$$("div");
    let pText = $$$("div", ["class", "text"]);
    let pReport = $$$("span", ["class", "report"]);
    let pTime = $$$("span", ["class", "time"]);
    bubble.addEventListener("touchstart", (event) => LongPress.start(event, bubble), false);
    bubble.addEventListener("touchend", (event) => LongPress.end(event, bubble), false);
    bubble.addEventListener("mousedown", (event) => LongPress.start(event, bubble), false);
    bubble.addEventListener("mouseup", (event) => LongPress.end(event, bubble), false);
    
    let text = prop.text || $('.chat_field').innerHTML;
    let time = new Date();
    let h = ("0" + time.getHours()).slice(-2);
    let m = ("0" + time.getMinutes()).slice(-2);
    let am_pm = (parseInt(h) >= 12)? "PM": "AM";
    h = (h > 12)? h%12: h;
    time = `${h}:${m} ${am_pm}`;
    
    if(typeof text == "string") {
    	pText.innerHTML = `<div>${text}</div>`;
    } 
    else {
    	pText.appendChild(text);
    } 
    pTime.innerHTML = time;
    pReport.appendChild(pTime);
    pText.appendChild(pReport);
    
    let children = $$(".bubble");
    
    if(prop.action === "send") {
    	let pTick = $$$("span");
    	pTick.classList.add("tick");
    	pReport.appendChild(pTick);
    	pReport.appendChild(pTick.cloneNode(true));
        $('.chat_field').innerHTML = "";
        if(general.chatFieldHadFocus)
        	$('.chat_field').focus();
        await ChangeTextBox(true, $(".chat_field"));
        await AdjustWidth.adjust($(".chat_field"));
        
        bubble.classList.add("bubble", "right_bubble");
        bubble.appendChild(pText);
        if(children.length > 0 && children[children.length-1].className.includes("right_bubble")) {
            bubble.classList.add("same_side_bubble");
        } 
        container.insertBefore(bubble, anchor);
        pTick.id = "tick" + $$(".right_bubble").length;
        
        let unreadBubble = $(".center_bubble");
        if(unreadBubble != null) 
            unreadBubble.parentNode.removeChild(unreadBubble);
        
        setTimeout(() => {container.scrollTop = anchor.offsetTop;}, 200);
        if(Lobby.isConnected && publish) {
        	Publish.send({channel: Lobby.CHANNEL, message: {title: "ChatMessage", content: {text, id: pTick.id}} });
        } 
        return pTick.id;
    } 
    else if(prop.action === 'receive') {
        bubble.classList.add("bubble", "left_bubble");
        bubble.id = "left-" + prop.id;
        let pAvatar = $$$("p");
        pAvatar.innerHTML = $$(".chat_header h2")[1].innerHTML.split(' ').map((n) => n[0]).join('');
        bubble.appendChild(pAvatar);
        bubble.appendChild(pText);
        
        if(children.length > 0 && children[children.length-1].className.includes("left_bubble")) {
            pAvatar.style.visibility = "hidden";
            bubble.classList.add("same_side_bubble");
        } 
        else {
            
        } 
            
        if($(".center_bubble") === null && prop.count === 1) {
            let unreadBubble = $$$("div");
            unreadBubble.classList.add("bubble", "center_bubble");
            let unreadText = $$$("p");
            unreadText.innerHTML = `${prop.count} UNREAD MESSAGE`;
            unreadBubble.appendChild(unreadText);
            container.insertBefore(unreadBubble, anchor);
        } 
        else if(prop.count > 1) {
            $(".center_bubble p").innerHTML = `${prop.count} UNREAD MESSAGES`;
        } 
        container.insertBefore(bubble, anchor);
        
        if(GetValue($("#chat-window"), "display") === "flex") {
        	if(Lobby.isConnected) {
	        	Lobby.PUBNUB.addMessageAction({
					channel: Lobby.CHANNEL, 
					messageTimetoken: prop.timetoken, 
					action: {
						type: "read", 
						value: prop.id
					} 
				});
			} 
        	Lobby.unreadMessages = [];
            setTimeout(() => {container.scrollTop = anchor.offsetTop;}, 200);
        } 
        else 
        	Lobby.unreadMessages.push({id: prop.id, timetoken: prop.timetoken});
    } 
} 

class Bubble {
	static selectedLeft = [];
	static selectedRight = [];
	static requestDelete = async () => {
		this.selectedLeft = $$(".left_bubble.selected_bubble");
		this.selectedRight = $$(".right_bubble.selected_bubble");
		let total = this.selectedLeft.length + this.selectedRight.length;
		let option; 
		if(this.selectedLeft.length || $(".selected_bubble.deleted")) {
			option = await Notify.confirm({
				header: `Delete ${total + (total > 1? " messages": " message")}`, 
				message: "Whom do you want to delete for?", 
				type: "CANCEL/MYSELF"
			});
		} 
		else {
			option = await Notify.other({
				header: `Delete ${total + (total > 1? " messages": " message")}`, 
				message: "Whom do you want to delete for?", 
				type: "CANCEL/EVERYONE/MYSELF"
			});
		} 
		this.deleteBubble(option);
	} 
	
	static deleteBubble = (option, deletedByPublisher) => {
		let selected = Array.from(Bubble.selectedLeft).concat(Array.from(Bubble.selectedRight));
		let ids = "";
		if(option != "CANCEL") {
			for(let bubble of selected) {
				if(!bubble.classList.contains("deleted") && bubble.$(".tick") && bubble.$(".tick").classList.contains("grey")) {
					bubble.$(".text > div").innerHTML = "You deleted this message.";
					bubble.classList.add("deleted");
					ids += bubble.$(".tick").id + "-";
				} 
				else if(deletedByPublisher) {
					bubble.$(".text > div").innerHTML = "This message was deleted.";
					bubble.classList.add("deleted");
				} 
				else {
					bubble.parentNode.removeChild(bubble);
				} 
				bubble.classList.remove("selected_bubble");
			} 
			
			if(option == "EVERYONE" && Lobby.isConnected) {
				ids = ids.replace(/-$/g, "");
				Publish.send({
					channel: Lobby.CHANNEL, 
					message: {title: "deleted", ids}
				});
			} 
		} 
		else {
			for(let bubble of selected) {
				bubble.classList.remove("selected_bubble");
			} 
		} 
		
		window.$(".chat_header > h2:last-of-type").style.display = "block";
		window.$(".chat_header > p:nth-of-type(2)").style.display = "block";
		window.$(".chat_menu").style.display = "none";
		window.$(".bubbles_container").classList.remove("select_mode");
		LongPress.selectMode = false;
		Bubble.selectedLeft = [];
		Bubble.selectedRight = [];
	} 
	
	static copyBubbleText = async () => {
		if(Permissions.permissions.clipboard) {
			let text = $(".selected_bubble .text > div").textContent;
			navigator.clipboard.writeText(text).then(() => {
				Notify.popUpNote("Text copied to clipboard");
			}, () => {
				Notify.popUpNote("Text was not copied to clipboard for some reason.");
			});
		} 
		else {
			Permissions.check("bubble", "clipboard-write");
		} 
		$(".selected_bubble").classList.remove("selected_bubble");
		$(".chat_header > h2:last-of-type").style.display = "block";
		$(".chat_header > p:nth-of-type(2)").style.display = "block";
		$(".chat_menu").style.display = "none";
		$(".bubbles_container").classList.remove("select_mode");
		LongPress.selectMode = false;
	} 
} 

const Request = async (prop) => {
	let option;
    if(prop.title === "RequestPlay") {
        option = await Notify.confirm({
                header: "Request for a  match!", 
                type: "CANCEL/ACCEPT", 
                message: `${$$("#online .player_name")[1].innerHTML} is requesting a match with you`
		});
        Lobby.firstMove = prop.content.firstMove;
        Lobby.mandatoryCapture = prop.content.mandatoryCapture;
        Lobby.version = prop.content.version;
    } 
    else if(prop.title === "RequestReplay") {
        option = await Notify.confirm({
                header: "Request for rematch", 
                type: "CANCEL/ACCEPT", 
                message: `${$$("#online .player_name")[1].innerHTML} is requesting a rematch with you.`
		});
        Lobby.firstMove = prop.content.firstMove;
        Lobby.mandatoryCapture = prop.content.mandatoryCapture;
        Lobby.version = prop.content.version;
    } 
    else if(prop.title === "RequestRestart") {
        option = await Notify.confirm({
                header: "Request to restart", 
                type: "CANCEL/ACCEPT", 
                message: `${$$("#online .player_name")[1].innerHTML} wants to restart this match.`
		});
        Lobby.firstMove = prop.content.firstMove;
        Lobby.mandatoryCapture = prop.content.mandatoryCapture;
        Lobby.version = prop.content.version;
    } 
    
    if(option === "ACCEPT") { 
        Game.firstMove = Lobby.firstMove;
        Game.mandatoryCapture = Lobby.mandatoryCapture;
        Game.version = Lobby.version;
        
        if(Game.alternatePlayAs) {
            let color = playerA.pieceColor;
            await Alternate(color);
        }
        await setTimeout(async () => {
            await Publish.send({channel: Lobby.CHANNEL, message: {title: "AcceptedRequest", content: ""} });
            Notify.popUpNote("The game will start shortly...");
            Game.whiteTurn = (Game.firstMove)? playerA.pieceColor === "White": playerB.pieceColor === "White";
            await Mode(3, false);
            
            
            let btn = (Game.mandatoryCapture)? $("#must-jump"): $("#not-must-jump");
            await Clicked(btn, btn.parentNode, false);
            let version = $(`#main-window .version[value='${Game.version}']`);
            await Version(version, 0, true);
            await new Sleep().wait(1);
            await play(true);
        }, 200);
    } 
    else if(option === "CANCEL") {
        Publish.send({channel: Lobby.CHANNEL, message: {title: "DeclinedRequest", content: ""} });
    } 
    return;
} 

const ChangeWidth = (elem, event) => {
	AdjustWidth.adjust(elem, event);
} 

class AdjustWidth {
	static finishedExecuting = true;
	static stateTimeout;
	static typing = false;
	static adjust = (elem, event) => {
		if(event) {
			event.preventDefault();
		} 
		if(this.finishedExecuting) {
			this.finishedExecuting = false;
			this.updateState(elem, typeof event == "object");
		} 
		else
			return;
	} 
	static updateState = (elem, isEvent) => { 
		let self = this;
		
		if(isEvent && Lobby.isConnected) {
			clearTimeout(this.stateTimeout);
			if(elem.innerHTML.toLowerCase().replace(/<div><br><\/div>/gm, '') == "") {
				clearTimeout(AdjustWidth.stateTimeout);
				Lobby.PUBNUB.setState({
					state: {action: "typing", value: false}, 
					channels: [Lobby.CHANNEL]
				});
				this.typing = false;
			} 
			else if(!this.typing) {
				Lobby.PUBNUB.setState({
					state: {action: "typing", value: true}, 
					channels: [Lobby.CHANNEL]
				});
				this.typing = true;
			} 
			else {
				clearTimeout(this.stateTimeout);
				this.stateTimeout = setTimeout(() => {
					Lobby.PUBNUB.setState({
						state: {action: "typing", value: false}, 
						channels: [Lobby.CHANNEL]
					});
					this.typing = false;
				}, 700);
			} 
		} 
		self.adjustWidth(elem);
	} 
	
	static adjustWidth = (elem) => {
	    let sendBtn = $(".send_button");
		let recordBtn = $(".recorder_button");
	    if(elem.innerHTML.toLowerCase().replace(/<div><br><\/div>/gm, '') == "") {
			if(GetValue(sendBtn, "display") == "block") {
		        elem.innerHTML = "";
				sendBtn.style.display = "none";
				recordBtn.style.display = "block";
				recordBtn.classList.add("button_pop_up");
				setTimeout(() => {recordBtn.classList.remove("button_pop_up")}, 300);
			}
	    } 
	    else {
			if(GetValue(recordBtn, "display") == "block") {
				recordBtn.style.display = "none";
				sendBtn.style.display = "block";
				sendBtn.style.display = "block";
				sendBtn.classList.add("button_pop_up");
				setTimeout(() => {sendBtn.classList.remove("button_pop_up")}, 300);
			} 
	        
	        if(CalculateSize(elem.innerHTML) >= 32768) {
	            elem.innerHTML = elem.innerHTML.substring(0, elem.innerHTML.length-2);
	            Notify.popUpNote("message size exceeded limit");
	        } 
	    } 
	    let height = $(".field_container").offsetHeight || parseFloat(GetValue($(".field_container"), "height"));
	    document.documentElement.style.setProperty("--txt-size", ((height + 20) + "px"));
		this.finishedExecuting = true;
	} 
} 

const ChangeTextBox = async (isFocused, elem, event) => { 
	let active = document.activeElement;
	if(typeof event == "object") {
		event.preventDefault();
		if(event.type == "blur" && elem.classList.contains("chat_field")) {
			AdjustWidth.typing = false;
			clearTimeout(AdjustWidth.stateTimeout);
			if(Lobby.isConnected) {
				Lobby.PUBNUB.setState({
					state: {action: "typing", value: false}, 
					channels: [Lobby.CHANNEL]
				});
			} 
		} 
		if(event.type == "focus" && general.chatFieldHadFocus && $("#chat-window").contains(active)) {
			for(let bubble of $$(".selected_bubble")) {
				bubble.classList.remove("selected_bubble");
			} 
			$(".chat_header > h2:last-of-type").style.display = "block";
			$(".chat_header > p:nth-of-type(2)").style.display = "block";
			$(".chat_menu").style.display = "none";
			$(".bubbles_container").classList.remove("select_mode");
			LongPress.selectMode = false;
			$(".chat_field").focus();
		} 
	} 
	
	if(!elem.className.includes("chat_field")) {
		if(isFocused) {
			setTimeout (() => {
				let par = $("#main-section-tp");
				par.scrollTop = elem.offsetHeight + elem.offsetTop - par.clientHeight + 20;
			}, 200);
		} 
	} 
    if(elem.id === "channel-name") {
        elem.maxLength = "100";
    } 
    setTimeout(() => {
        let vh = window.innerHeight;
        if(vh < 150 && isFocused) {
            if(elem.className.includes("chat_field")) {
                $(".chat_header").style.display = "none";
                $(".bubbles_container").style.display = "none";
                $(".chat_field").style.maxHeight = "45px";
            } 
            else {
                $("#two-players-window h2").style.display = "none";
                elem.parentNode.scrollTop = elem.offsetTop;
            } 
        } 
        else if(vh < 150 && !isFocused || vh > 150) {
            if(elem.className.includes("chat_field")) {
                $(".chat_header").style.display = "grid";
                $(".bubbles_container").style.display = "block";
                $(".chat_field").style.maxHeight = "100px";
            } 
            else {
                $("#two-players-window h2").style.display = "flex";
            } 
        } 
    }, 300);
} 

const ChangeFocus = () => {
	general.chatFieldHadFocus = true;
} 
