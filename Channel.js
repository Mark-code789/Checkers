'use strict' 

const CheckHref = async () => {
	alert(document.location.href);
	let split = document.location.href.split("?");
	if(split.length > 1) {
		let name = split[1].replace("name=", "");
		$("#online #channel-name").value = name;
		await Mode(3, false);
		BackState.state.push(["#main-window", "#two-players-window"]);
        $("#main-window").style.display = "none";
        $("#two-players-window").style.display = "grid";
	} 
} 

const Lobby = {isConnected: false, intentionalExit: false, isHost: false, unreadMessages: [], timeoutInterval: null, offlineInterval: null};

const ChannelFunction = () => {
	if(!navigator.onLine) {
		Notify("Can't complete this request. You are offline.");
		return;
	} 
	
    let name = $("#online #playerA-name").value.trim();
    let channel = $("#online #channel-name").value;
    if(channel === "") {
        $("#online #channel-name").focus();
    	Notify("Please fill out channel name.");
    } 
	else if(name === "") {
		$("#online #playerA-name").focus();
        Notify("Please fill out your name.");
    } 
    else {
        channel = channel.replaceAll(/^\w|\s\w/g, t => t.toUpperCase());
        name = name.replace(/^\w|\s\w/g, t => t.toUpperCase());
        $("#online #channel-name").maxLength = "100";
        playerA.name = name;
        
        try { 
            if(!Lobby.isConnected) {
            	$$("#online .player_name")[0].innerHTML = name;
                Lobby.UUID = PubNub.generateUUID();
                Lobby.CHANNEL = channel;
                Lobby.LOBBY = "Lobby"+channel;
                Lobby.PUBNUB = new PubNub({
                    uuid: Lobby.UUID,
                    publish_key: 'pub-c-1d3446b1-0874-4490-9ac7-20c09c56bf71',
                    subscribe_key: 'sub-c-3a0c6c3e-bfc7-11ea-bcf8-42a3de10f872',
                    ssl: true, 
                    presenceTimeout: 60, 
                    sendByPost: true, 
                    restore: true
                });
                Lobby.PUBNUB.setUUID(Lobby.UUID);
                setTimeout( () => {Notify("Connecting..."); }, 100);
                Lobby.LOBBY_LISTENER = {
                	presence: function(response) { 
						if(response.channel == Lobby.LOBBY && response.action === "join") {
	                		Lobby.PUBNUB.hereNow({
	                    		channels: [Lobby.CHANNEL] 
	                    	}, function (status, response2) {
	                        	if(response2.totalOccupancy < 2) {
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
									Notify(`${Lobby.CHANNEL} channel is fully occupied, please try another channel.`);
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
                            Notify(`Connection timeout to ${Lobby.CHANNEL} channel. Reconnecting...`);
                        } 
                	} 
                } 
                
                Lobby.LISTENER = {
                    presence: function(response) { 
						if(response.channel == Lobby.CHANNEL) {
	                        if(response.action === 'join' && response.uuid == Lobby.UUID) {
								Lobby.isTyping = false;
								Lobby.PUBNUB.setState({
				                	state: {"isTyping": false}, 
				                	channels: [Lobby.CHANNEL]
				                }, (status, res) => {});
	                            if(response.occupancy === 1 && !Lobby.isConnected) {
	                                Lobby.isHost = true;
	                                Notify("You are the host in this channel.");
	                            } 
	                            else if(response.occupancy === 2 && !Lobby.isConnected) {
	                                if(!Lobby.isHost) {
	                                    Notify("You are a guest in this channel.");
	                                } 
	                            } 
	                        } 
	                        else if(response.action === 'timeout') {
								if(response.uuid == Lobby.UUID) {
	                            	// Nothing for now 
								} 
								else {
									let n = 1;
									Lobby.timeoutInterval = setInterval(() => {
										if(n < 3)
											n++;
										else
											LeftChannel({totalOccupancy: 1});
									}, 60000);
									let opp = $$("#online .player_name")[1].innerHTML;
									Notify(`${opp} went offline.`);
									let status = $$(".chat_header p")[1];
									status.innerHTML = "offline";
									let opponentStatus = $("#player-2-status");
						        	opponentStatus.innerHTML = "OFFLINE";
						        	opponentStatus.style.backgroundImage = "linear-gradient(rgba(193, 115, 0, 0.9), rgba(153, 75, 0, 0.9))";
								} 
	                        } 
							else if(response.action === "leave" && response.uuid != Lobby.UUID) {
								if(!Lobby.intentionalExit) {
									let opp = $$("#online .player_name")[1].innerHTML;
									Notify(`${opp} went offline.`);
									let status = $$(".chat_header p")[1];
									status.innerHTML = "offline";
									let opponentStatus = $("#player-2-status");
						        	opponentStatus.innerHTML = "OFFLINE";
						        	opponentStatus.style.backgroundImage = "linear-gradient(rgba(193, 115, 0, 0.9), rgba(153, 75, 0, 0.9))";
								} 
							} 
							else if(response.action === "state-change" && response.uuid != Lobby.UUID) { try {
								if(response.state.isTyping) {
									$("#dragItem").innerHTML = "";
									if(GetValue($("#chat-icon"), "display") === "block") {
										for(let dot of $$(".typing")) {
											void dot.offsetWidth;
											dot.style.display = "inline-block";
											dot.classList.add("bouncing");
										} 
									} 
									else {
										let status = $$(".chat_header p")[1];
										status.innerHTML = "typing...";
									} 
								} 
								else if(!response.state.isTyping) {
									$("#dragItem").innerHTML = "CHAT";
									if(GetValue($("#chat-icon"), "display") === "block") {
										for(let dot of $$(".typing")) {
											dot.classList.remove("bouncing");
											dot.style.display = "none";
											let opponentStatus = $("#player-2-status");
							        		opponentStatus.innerHTML = "ONLINE";
							        		opponentStatus.style.backgroundImage = other.default;
										} 
									} 
									else {
										let status = $$(".chat_header p")[1];
										status.innerHTML = "online";
									} 
								}
								
								} catch(error) {alert(error)} 
							} 
                        } 
                    }, 
                    status: function(event) {
                        if(!Lobby.isConnected && event.category === 'PNConnectedCategory') {
                            Lobby.timeoutID = setTimeout( () => {
                                let connectivityStatus = $("#connectivity");
                                connectivityStatus.classList.add("default");
                                connectivityStatus.innerHTML = "CONNECTED";
                                $("#online .lobby_name").innerHTML = Lobby.CHANNEL;
                                Lobby.isConnected = true;
                                if(Lobby.isHost) {
                                    Notify(`Connected to ${Lobby.CHANNEL} channel successfully. Waiting for opponent...`);
                                } 
                                else {
                                    Notify(`Connected to ${Lobby.CHANNEL} channel successfully.`);
                                    Publish.send({
                                            channel: Lobby.CHANNEL, 
                                            message: {
                                                     title: "OpponentName", 
                                                     content: $$("#online .player_name")[0].innerHTML}
                                            });
                                } 
                            }, 5000);
                        } 
                        else if(event.category === 'PNReconnectedCategory') {
                        	Notify(`Reconnected back to ${Lobby.CHANNEL} channel successfully.`);
                        } 
                        else if(event.category === 'PNNetworkUpCategory') {
                        	Publish.send({channel: Lobby.CHANNEL, message: {title: "Reconnected", content: ""}});
                        	Lobby.PUBNUB.reconnect();
                        	clearInterval(Lobby.offlineInterval);
                            Notify("You are back online.");
                        } 
                        else if(event.category === 'PNNetworkIssueCategory') {
                            Notify("Having trouble to connect, please check your device internet connection.");
                        } 
                        else if(event.category === 'PNNetworkDownCategory') {
                            Notify("You are offline. If this persists in 3 minutes, you will be unsubscribed from " + Lobby.CHANNEL + " channel.");
                            if(!Lobby.offlineInterval) {
                        		let n = 1;
                        		Lobby.offlineInterval = setInterval(() => {
                        			if(n < 3) 
                        				n++;
                        			else
                        				Unsubscribe();
                        		}, 60000);
                        	} 
                        }
                        else if(event.category === 'PNTimeoutCategory') {
                        	Notify("Connection Timeout. If this persists in 3 minutes, you will be unsubscribed from " + Lobby.CHANNEL + " channel.");
                        	if(!Lobby.offlineInterval) {
                        		let n = 1;
                        		Lobby.offlineInterval = setInterval(() => {
                        			if(n < 3)
                        				n++;
                        			else
                        				Unsubscribe();
                        		}, 60000);
                        	} 
                        } 
                    }, 
                    message: function(msg) {
                    	msg.message = JSON.parse(msg.message);
                    	if($("#player-2-status").innerHTML == "OFFLINE" && msg.message.title != "Reconnected") {
                    		clearInterval(Lobby.timeoutInterval);
							Notify(`${playerB.name} is back online.`);
                            let status = $$(".chat_header p")[1];
							status.innerHTML = "online";
							let opponentStatus = $("#player-2-status");
						    opponentStatus.innerHTML = "ONLINE";
						    opponentStatus.style.backgroundImage = other.default;
						} 
                        if(msg.channel === Lobby.CHANNEL) {
                            if(msg.message.title === 'ConfirmLeave') {
                                Publish.send({
                                        channel: Lobby.CHANNEL, 
                                        message: {
                                                 title: "StillPresent", 
                                                 content: ""}
                                        });
                            } 
                            else if(msg.message.title === "IntentionalExit") {
                            	Lobby.intentionalExit = true;
                            	LeftChannel({totalOccupancy: 1});
                            } 
                            else if(msg.message.title === 'Reconnected') {
                            	clearInterval(Lobby.timeoutInterval);
                            	Notify(`${playerB.name} is back online.`);
                                let status = $$(".chat_header p")[1];
								status.innerHTML = "online";
								let opponentStatus = $("#player-2-status");
							    opponentStatus.innerHTML = "ONLINE";
							    opponentStatus.style.backgroundImage = other.default;
                            } 
                            else if(msg.message.title === "NameChange") {
                        		name = msg.message.content;
                        		$$("#online .player_name")[1].innerHTML = name;
                        		$$(".chat_header h2")[1].innerHTML = name;
                        		playerB.name = name;
                        		Notify(`Your opponent changed name to ${name}`);
                        	} 
                            else if(msg.message.title === 'OpponentName') {
                                name = msg.message.content;
                                $$("#online .player_name")[1].innerHTML = name;
                                let opponentStatus = $("#player-2-status");
                                opponentStatus.innerHTML = "ONLINE";
                                opponentStatus.style.backgroundImage = other.default;
                                $("#chat-icon").style.display = 'block';
                                $$(".chat_header h2")[1].innerHTML = name;
                                playerB.name = name;
                                Lobby.intentionalExit = false;
                                Notify(`Your opponent is ${name}`);
                                if(Lobby.isHost) {
                                    Publish.send({
                                             channel: Lobby.CHANNEL, 
                                             message: {
                                                      title: "OpponentName", 
                                                      content: $$("#online .player_name")[0].innerHTML}
                                             });
                                } 
                            } 
                            else if(msg.message.title === "Delivered") { 
								try {
                            		let tick = $("#" + msg.message.content);
                            		tick.style.background = "#C0C0C0";
                            	} catch (error) {alert(error)} 
                            } 
                            else if(msg.message.title === "Read") {
                            	try {
                            		let tick = $("#" + msg.message.content);
                            		tick.style.background = "#009819";
                            	} catch (error) {alert(error)}
                            } 
                            else if(msg.message.title === 'ChatMessage') { 
                            	Publish.send({channel: Lobby.CHANNEL, message: {title: "Delivered", content: msg.message.content.id}});
                                let badge = $(".badge");
                                if(GetValue($("#chat-icon"), "display") === "block") {
                                    badge.innerHTML = parseInt(badge.innerHTML)+1;
                                    badge.style.display = "block";
                                    Notify(`You have ${parseInt(badge.innerHTML) <= 1? 'a new message': badge.innerHTML + ' new messages'} from ${$$("#online .player_name")[1].innerHTML}`);
                                    AudioPlayer.play("notification", 0.8);
                                } 
                                Message({action: 'receive', count: parseInt(badge.innerHTML), text: msg.message.content.text, id: msg.message.content.id});
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
                                Notify($$("#online .player_name")[1].innerHTML + " accepted the request, the game will start shortly.");
                                Cancel();
                                setTimeout(() => play(false, true), 2000);
                            } 
                            else if(msg.message.title === "DeclinedRequest") {
                                Notify($$("#online .player_name")[1].innerHTML + " declined your request.");
                                Cancel();
                            } 
                            else if(msg.message.title === "Moved") { 
                            	OpponentMove.move(msg.message.content);
                            } 
                            else if(msg.message.title === "Undone") {
                            	Notify(playerB.name + " undid the move");
                                back(true, true);
                            } 
                            else if(msg.message.title === "Hint") {
                                Notify(playerB.name + " has use hint");
                            } 
                            else if(msg.message.title === "ExitedGame") {
                                Notify(msg.message.content + " exited the game.");
                                back();
                            } 
                        } 
                    } 
                } 
                Lobby.PUBNUB.addListener(Lobby.LOBBY_LISTENER);
                Lobby.PUBNUB.subscribe({
                    channels: [Lobby.LOBBY], 
                    withPresence: true
                }); 
            } 
            else if(Lobby.isConnected && $$("#online .player_name")[0].innerHTML.toLowerCase() == $("#online #playerA-name").value.toLowerCase()) {
                Notify({action: "alert", 
                        header: "Duplicate Action", 
                        message: `<p>You are already subscribed to <b>${Lobby.CHANNEL}</b> channel. To join another channel, unsubscribe from this channel first.</p>`});
            } 
            else if(Lobby.isConnected &&  $$("#online .player_name")[0].innerHTML.toLowerCase() != $("#online #playerA-name").value.toLowerCase()) {
            	Publish.send({channel: Lobby.CHANNEL, message: {title: "NameChange", content: $("#online #playerA-name").value.replaceAll(/^\w|\s\w/g, t => t.toUpperCase())}});
            	$$("#online .player_name")[0].innerHTML = $("#online #playerA-name").value.replace(/^\w|\s\w/g, t => t.toUpperCase());
            	Notify("Name changed successfully");
            } 
        } catch (error) {
            Notify("An error occurred. Loading necessary data...");
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

const Unsubscribe = async (intentional = true) => {
    if(Lobby.isConnected) {
    	Notify({action: "alert_special", 
    			header: "Please wait", 
    			message: `Unsubscribing ${Lobby.CHANNEL} channel...`});
    	Lobby.sleep = new Sleep();
    	Publish.send({channel: Lobby.CHANNEL, message: {title: "IntentionalExit", content: ""}});
    	await Lobby.sleep.start();
    	Cancel();
        Lobby.PUBNUB.unsubscribe({
            channels: [Lobby.CHANNEL]
        });
        
        Lobby.PUBNUB.removeListener(Lobby.LISTENER);
        if(intentional) 
        	Notify(`Unsubscribed from ${Lobby.CHANNEL} channel successfully.`);
        
        clearTimeout(Lobby.timeoutID);
        clearInterval(Lobby.offlineInterval);
        clearInterval(Lobby.timeoutInterval);
        let connectivityStatus = $("#connectivity");
        connectivityStatus.classList.remove("default");
        connectivityStatus.innerHTML = "DISCONNECTED";
        $("#online .lobby_name").innerHTML = "N/A";
        $("#online #channel-name").value = "";
        let opponentStatus = $("#player-2-status");
        opponentStatus.innerHTML = "N/A";
        opponentStatus.style.backgroundImage = "linear-gradient(rgba(0, 120, 225, 0.9), rgba(0, 80, 185, 0.9))";
        $$("#online .player_name")[1].innerHTML = "N/A";
        Lobby.CHANNEL = null;
        Lobby.isConnected = false;
        Lobby.intentionalExit = false;
        Lobby.PUBNUB = null;
        Lobby.isHost = false;
        Lobby.offlineInterval = null;
        Lobby.timeoutInterval = null;
        $("#chat-icon").style.display = 'none';
    } 
    else {
        Notify("You have not joined any channel.");
    } 
} 

class OpponentMove {
	static moves = [];
	static move = (prop) => {
		this.moves.push(prop);
		if(this.moves.length == 1)
			this.make();
	} 
	static make = async () => {
		try {
			let self = this;
			//await new Sleep().wait(0.1);
			let prop = self.moves[0];
            let i = Game.boardSize-1 - prop.i, 
                j = Game.boardSize-1 - prop.j,
                cell = $("#table").rows[i].cells[j];
            await ValidateMove({cell, i, j, isComputer: true});
			await this.moves.shift();
			if(this.moves.length > 0)
				await this.make();
        } catch (error) {alert(error + "")}
	} 
} 

class Publish { 
	static messages = [];
	static retryCount = 0;
	static sleep = new Sleep();
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
	} 
	    
    static publish = async () => { 
        let config = this.messages[0];
        let self = this;
		Lobby.PUBNUB.publish(config, async (status, response) => {
            if(!status.error) {
                if(JSON.parse(config.message).title === "IntentionalExit") {
					self.retryCount = 0;
        			self.messages = [];
        			Lobby.sleep.end();
				} 
				else {
					await self.sleep.wait(0.1);
					self.messages.shift();
        			self.retryCount = 0;
				} 
            } 
            if(status.error) {
				if(self.retryCount <= 2) // retry twice
                	++self.retryCount;
				else {
					self.retryCount = 0;
		        	self.messages = [];
					//alert(status.message);
					if(JSON.parse(config.message).title === "IntentionalExit")
	        			Lobby.sleep.end(); 
					else
						Notify({action: "alert", 
		                    header: "Communication Error", 
		                    message: status.message + "<br>" + status.category});
				} 
            } 
			if(self.messages.length > 0) 
	        	await self.publish();
	    });
	} 
} 

const LeftChannel = (response) => {
    if(response.totalOccupancy < 2) {
    	if(Game.mode ==" two-player-online" && GetValue($("#play-window"), "display") == "grid") {
    		Cancel();
    		back();
    	} 
        let name = $$("#online .player_name")[1].innerHTML;
        $$("#online .player_name")[1].innerHTML = "N/A";
        let opponentStatus = $("#player-2-status");
        opponentStatus.innerHTML = "N/A";
        opponentStatus.style.backgroundImage = "linear-gradient(rgba(0, 120, 225, 0.9), rgba(0, 80, 185, 0.9))";
        $("#chat-icon").style.display = 'none';
        $("#chat-window").style.display = "none";
        Lobby.isHost = true;
        Notify(`${name} left ${Lobby.CHANNEL} channel.`);
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
	    yourStatus.innerHTML = "OFFLINE";
	    yourStatus.style.backgroundImage = "linear-gradient(rgba(193, 115, 0, 0.9), rgba(153, 75, 0, 0.9))";
	    //Notify(`You are offline.`);
	} 
	else {
		yourStatus.innerHTML = "ONLINE";
	    yourStatus.style.backgroundImage = other.default;
	    //Notify(`You are online.`);
	} 
} 

const Share = (elem) => {
    if(Lobby.isConnected) {
        if(navigator.canShare) {
        	Notify({action: "alert_special", 
					header: "Please wait", 
					message: "Preparing to share"});
            let channelName = Lobby.CHANNEL;
            let name = $$("#online .player_name")[0].textContent;
            navigator.share({
                title: "Checkers Game", 
                text: `Hi, ${name} is requesting you to join the following channel to play checkers match. Please click the the link below to join.\nYou will be required to enter your name in field named 'players details'. Click submit afterwards to join.\n`, 
                url: "https://mark-code789.github.io/Checkers/index.html?name=" + channelName
            }).then( () => { 
            	Cancel();
                Notify("Channel name shared successfully."); 
            }).catch( (error) => { 
            	let message = error.toString().split(":");
                Notify({action: "alert", 
                        header: message[0], 
                        message: ("There was an error while trying to share the name of the channel.<br> :-" + message[1])});
            });
        } 
        else {
            Notify({action: "alert", 
                    header: "Error!", 
                    message: "Your Browser does not support this kind of sharing. Please use your ordinary means."});
        } 
    } 
    else 
        Notify("You have not joined any channel.");
} 

const Message = async (prop) => { try {
    let container = $(".bubbles_container");
    let anchor = $(".anchor");
    let bubble = $$$("div");
    let pText = $$$("p");
    let pReport = $$$("span");
    let pTime = $$$("span");
    pText.classList.add("text");
    pReport.classList.add("report");
    pTime.classList.add("time");
    
    let text = prop.text || $('.chat_field').innerHTML;
    let time = new Date();
    let h = ("0" + time.getHours()).slice(-2);
    let m = ("0" + time.getMinutes()).slice(-2);
    let am_pm = (parseInt(h) >= 12)? "PM": "AM";
    h = (h > 12)? h%12: h;
    time = `${h}:${m} ${am_pm}`;
    
    pText.innerHTML = text;
    pTime.innerHTML = time;
    pReport.appendChild(pTime);
    pText.appendChild(pReport);
    
    let children = $$(".bubble");
    
    if(prop.action === "send") {
    	let pTick = $$$("span");
    	pTick.classList.add("tick");
    	pReport.appendChild(pTick);
        $('.chat_field').innerHTML = "";
        $('.chat_field').focus();
        await ChangeTextBox(false, $(".chat_field"));
        await AdjustWidth.adjust($(".chat_field", false));
        
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
        
        setTimeout(() => {anchor.scrollIntoView({block: "start", behavior: "smooth"});}, 200);
        Publish.send({channel: Lobby.CHANNEL, message: {title: "ChatMessage", content: {text, id: pTick.id}} });
        return;
    } 
    else if(prop.action === 'receive') {
        bubble.classList.add("bubble", "left_bubble");
        let pAvatar = $$$("p");
        pAvatar.innerHTML = $$(".chat_header h2")[1].innerHTML.split(' ').map((n) => n[0]).join('');
        bubble.appendChild(pAvatar);
        bubble.appendChild(pText);
        
        if(children.length > 0 && children[children.length-1].className.includes("left_bubble")) {
            pAvatar.style.visibility = "hidden";
            bubble.classList.add("same_side_bubble");
        } 
        else {
            // nothing for now
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
        	Publish.send({channel:Lobby.CHANNEL, message: {title: "Read", content: prop.id}});
        	Lobby.unreadMessages = [];
            setTimeout(() => {anchor.scrollIntoView({block: "start", behavior: "smooth"});}, 200);
        } 
        else 
        	Lobby.unreadMessages.push(prop.id);
    } 
    } catch (error) {Notify(error + "");}
} 

const Request = async (prop) => {
    if(prop.title === "RequestPlay") {
        Notify({action: "confirm", 
                header: "Request for a  match!", 
                type: "CANCEL/ACCEPT", 
                message: `${$$("#online .player_name")[1].innerHTML} is requesting a match with you`,
                onResponse: RequestOption});
        Lobby.firstMove = prop.content.firstMove;
        Lobby.mandatoryCapture = prop.content.mandatoryCapture;
        Lobby.version = prop.content.version;
    } 
    else if(prop.title === "RequestReplay") {
        Notify({action: "confirm", 
                header: "Request for rematch", 
                type: "CANCEL/ACCEPT", 
                message: `${$$("#online .player_name")[1].innerHTML} is requesting a rematch with you.`, 
                onResponse: RequestOption});
        Lobby.firstMove = prop.content.firstMove;
        Lobby.mandatoryCapture = prop.content.mandatoryCapture;
        Lobby.version = prop.content.version;
    } 
    else if(prop.title === "RequestRestart") {
        Notify({action: "confirm", 
                header: "Request to restart", 
                type: "CANCEL/ACCEPT", 
                message: `${$$("#online .player_name")[1].innerHTML} wants to restart this match.`, 
                onResponse: RequestOption});
        Lobby.firstMove = prop.content.firstMove;
        Lobby.mandatoryCapture = prop.content.mandatoryCapture;
        Lobby.version = prop.content.version;
    } 
    
    async function RequestOption (option) { 
        if(option === "ACCEPT") { try {
            Game.firstMove = Lobby.firstMove;
            Game.mandatoryCapture = Lobby.mandatoryCapture;
            Game.version = Lobby.version;
            
            if(Game.alternatePlayAs) {
                let color = playerA.pieceColor;
                await Alternate(color);
            }
            setTimeout(async () => {
                Publish.send({channel: Lobby.CHANNEL, message: {title: "AcceptedRequest", content: ""} });
                Notify("The game will start shortly...");
                Game.whiteTurn = (Game.firstMove)? playerA.pieceColor === "White": playerB.pieceColor === "White";
                await Mode(3, false);
                
                // Updating ui
                let btn = (Game.mandatoryCapture)? $("#must-jump"): $("#not-must-jump");
                await Clicked(btn, btn.parentNode, false);
                let version = null;
                for(let h2 of $$(".version h2")) {
                    if(h2.innerHTML.includes(Game.version.toUpperCase())) {
                        version = h2.parentNode;
                        break;
                    } 
                } 
                await Version(version, 0, true);
                await Cancel();
                setTimeout(() => play(false, true), 2000);
            }, 200);
            } catch (error) {Notify(error + " request error")}
        } 
        else if(option === "CANCEL") {
            Publish.send({channel: Lobby.CHANNEL, message: {title: "DeclinedRequest", content: ""} });
            Cancel();
        } 
        return;
    } 
    return;
} 

class AdjustWidth {
	static finishedExecuting = true;
	static adjust = (elem, isEvent = true) => {
		if(this.finishedExecuting) {
			this.finishedExecuting = false;
			this.updateState(elem, isEvent);
		} 
		else
			return;
	} 
	static updateState = (elem, isEvent) => { try {
		let self = this;
		clearTimeout(Lobby.timeoutID);
		if(isEvent) {
			if(!Lobby.isTyping) {
				Lobby.isTyping = true;
				Lobby.PUBNUB.setState({
					state: {"isTyping": true}, 
					channels: [Lobby.CHANNEL]
				}, function (status, response) {});
			} 
			
			Lobby.timeoutID = setTimeout(_=> {
				Lobby.isTyping = false;
				Lobby.PUBNUB.setState({
					state: {"isTyping": false}, 
					channels: [Lobby.CHANNEL]
				}, function (status, response) {});
			}, 1000);
		} 
		self.adjustWidth(elem);
		} catch (error) {Notify(error + "")}
	} 
	
	static adjustWidth = (elem) => {
	    let sendBtn = $(".send_button");
	    if(elem.innerHTML.toLowerCase().replace(/<div><br><\/div>/gm, '') == "") {
	        elem.innerHTML = "";
	        sendBtn.style.filter = "invert(60%)";
	        sendBtn.style.pointerEvents = "none";
	    } 
	    else {
	        sendBtn.style.filter = "invert(90%)";
	        sendBtn.style.pointerEvents = "auto";
	        
	        if(CalculateSize(elem.innerHTML) >= 32768) {
	            elem.innerHTML = elem.innerHTML.substring(0, elem.innerHTML.length-2);
	            Notify("message size exceeded limit");
	        } 
	    } 
	    let height = elem.clientHeight || parseInt(GetValue(elem, "height"));
	    document.documentElement.style.setProperty("--txtSize", (height + "px"));
		this.finishedExecuting = true;
	} 
} 

const ChangeTextBox = async (isFocused, elem) => { 
	if($(".send_button") === document.activeElement) {
		clearTimeout(Lobby.timeoutID);
		Lobby.isTyping = false;
		Lobby.PUBNUB.setState({
			state: {"isTyping": false}, 
			channels: [Lobby.CHANNEL]
		}, function (status, response) {});
		Message({action: "send"});
	} 
	if(!elem.className.includes("chat_field")) {
		elem.scrollIntoView(false);
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
                $(".chat_field").style.maxHeight = "40px";
            } 
            else {
                $("#two-players-window h2").style.display = "none";
                elem.scrollIntoView({block: "start", inline: "center", behavior: "smooth"});
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
