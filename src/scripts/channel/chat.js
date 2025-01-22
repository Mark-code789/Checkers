class Chat {
	static #fieldHadFocus = false;
	static #typing = false;
	static #typingTimeout = null;
	static #blurTimeout = null;
	static #sendClicked = false;
	
	static init () {
		$("#chat-icon").classList.add("visible");
		$("#chat-window .recorder_button").classList.add("visible");
		$(".bubbles_container").innerHTML = "<div class='anchor'></div>";
		setTimeout(() => ElemHint.setHint($("#chat-icon"), "Drag to move. Click to open chat."), 1000); 
	} 
	static changeStatus (status) {
		let cont = $(".state_container");
			cont.classList.remove("recording", "typing");
			
		if(status != "online")
			cont.classList.add(status);
			
		let stateStatus = $$(".chat_header p")[1];
			stateStatus.textContent = status.toLowerCase() + (status == 'online'? '': '...');
	} 
	static updateBadge (count = 0) {
		let badge = $(".badge");
		badge.textContent = count;
        badge.style.display = count > 0? "block": "none";
        
        if(count == 0)
        	return;
        
        Notify.popUpNote(`You have ${count <= 1? 'a new message': count + ' new messages'} from ${PLAYER_B.name}`);
        AudioPlayer.play("notification", 0.8);
	} 
	
	static sendMessage (button) {
		this.#sendClicked = true;
		let text = $(".chat_field").innerHTML;
		this.addMessage({
			action: "send", 
			text
		});
		
		this.refocus();
	} 
	
	static async addMessage (message, publish = true) {
		this.changeStatus("online");
        if($("#chat-icon").classList.contains("visible")) 
            this.updateBadge(message.count);
        
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
		
		let text = "";
		if(message.file) {
			let player = new VoicenotePlayer();
			text = await player.receive(message.file);
		} 
		else
			text = message.text;
			
	    let time = new Date();
	    let h = String(time.getHours()).padStart(2, '0');
	    let m = String(time.getMinutes()).padStart(2, '0');
	    let am_pm = (parseInt(h) >= 12)? "PM": "AM";
	    h = (h > 12)? h%12: h;
	    time = `${h}:${m} ${am_pm}`;
	    
	    if(typeof text == "string") {
	    	pText.innerHTML = `<div>${text}</div>`;
	    } 
	    else {
	    	pText.appendChild(text);
	    } 
		
	    pTime.textContent = time;
	    pReport.appendChild(pTime);
	    pText.appendChild(pReport);
	    
	    let children = $$(".bubble");
		
		if(message.action === "send") {
	    	let pTick = $$$("span");
	    	pTick.classList.add("tick");
	    	pReport.appendChild(pTick);
	    	pReport.appendChild(pTick.cloneNode(true));
	        
	        bubble.classList.add("bubble", "right_bubble");
	        bubble.appendChild(pText);
	        if(children.length > 0 && children[children.length-1].className.includes("right_bubble")) 
	            bubble.classList.add("same_side_bubble");
	
	        container.insertBefore(bubble, anchor);
	        pTick.id = "tick" + $$(".right_bubble").length;
	        
	        let unreadBubble = $(".center_bubble");
	        if(unreadBubble != null) 
	            unreadBubble.parentNode.removeChild(unreadBubble);
	        
	        setTimeout(() => Scroll.intoView(container, anchor, 'vert', 'start', false), 200);
	        
			if(publish)
	        	Channel.send({message: {title: "ChatMessage", content: {text, id: pTick.id}} });
	        
	        return pTick.id;
    	} 
		else if(message.action === "receive") {
	        bubble.classList.add("bubble", "left_bubble");
	        bubble.id = "left-" + message.id;
			
	        let pAvatar = $$$("p");
	        pAvatar.textContent = PLAYER_B.name.split(' ').map((n) => n[0]).join('');
	        bubble.appendChild(pAvatar);
	        bubble.appendChild(pText);
	        
	        if(children.length > 0 && children[children.length-1].className.includes("left_bubble")) {
	            pAvatar.style.visibility = "hidden";
	            bubble.classList.add("same_side_bubble");
	        } 
	        else {
	            
	        } 
	            
	        if($(".center_bubble") === null && message.count === 1) {
	            let unreadBubble = $$$("div");
	            unreadBubble.classList.add("bubble", "center_bubble");
	            let unreadText = $$$("p");
	            unreadText.textContent = `${message.count} UNREAD MESSAGE`;
	            unreadBubble.appendChild(unreadText);
	            container.insertBefore(unreadBubble, anchor);
	        } 
	        else if(message.count > 1) {
	            $(".center_bubble p").textContent = `${message.count} UNREAD MESSAGES`;
	        } 
	        container.insertBefore(bubble, anchor);
	        
	        if($("#chat-window").classList.contains("visible")) {
	        	Channel.markAsRead();
	            setTimeout(() => Scroll.intoView(container, anchor, 'vert', 'start', false), 200);
	        } 
		} 
	} 
	
	static async requestDelete (publisher = false) {
		let selectedLeft = $$(".left_bubble.selected_bubble");
		let selectedRight = $$(".right_bubble.selected_bubble");
		let total = selectedLeft.length + selectedRight.length;
		let option; 
		if(selectedLeft.length || $(".selected_bubble.deleted")) 
			option = await Notify.confirm({
				header: `Delete ${total + (total > 1? " messages": " message")}`, 
				message: "Whom do you want to delete for?", 
				type: "CANCEL/MYSELF"
			});
		else 
			option = await Notify.other({
				header: `Delete ${total + (total > 1? " messages": " message")}`, 
				message: "Whom do you want to delete for?", 
				type: "CANCEL/EVERYONE/MYSELF"
			});
			
		this.deleteMessage(Array.from(selectedLeft).concat(Array.from(selectedRight)), option);
	}
	
	static async deleteMessage (selected, option, byPublisher = false) {
		let ids = "";
		if(option != "CANCEL") {
			for(let bubble of selected) {
				if(!bubble.classList.contains("deleted") && bubble.$(".tick") && bubble.$(".tick").classList.contains("grey")) {
					bubble.$(".text > div").innerHTML = "You deleted this message.";
					bubble.classList.add("deleted");
					ids += bubble.$(".tick").id + "-";
				} 
				else if(byPublisher) {
					bubble.$(".text > div").innerHTML = "This message was deleted.";
					bubble.classList.add("deleted");
				} 
				else {
					bubble.parentNode.removeChild(bubble);
				} 
				bubble.classList.remove("selected_bubble");
			} 
			
			if(option == "EVERYONE") {
				ids = ids.replace(/-$/g, "");
				Channel.send({message: {title: "deleted", ids}});
			} 
		} 
		else {
			for(let bubble of selected) {
				bubble.classList.remove("selected_bubble");
			} 
		} 
		
		$(".chat_header").classList.remove("select_mode");
		$(".bubbles_container").classList.remove("select_mode");
		LongPress.reset();
	} 
	
	static copyMessage () {
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
		$(".chat_header").classList.remove("select_mode");
		$(".bubbles_container").classList.remove("select_mode");
		LongPress.reset();
	} 
	
	static show () {
		UIHistory.push("#chat-icon", "#chat-window");
	   
	    if(Channel.getUnreadMessages() > 0) {
	        setTimeout(() => {
				$(".bubbles_container").scrollTop = $(".anchor").offsetTop;
			}, 200);
	    } 
	    
		this.updateBadge();
		
	    Channel.markAsRead();
	} 
	
	static close () {
		UIHistory.undo();
	} 
	
	static refocus () {
		if(this.#fieldHadFocus) {
			$(".chat_field").focus();
		} 
	} 
	
	static updateField (event) {
		let field = event.target;
		let sendButton = $("#chat-window .send_button");
		let recorderButton = $("#chat-window .recorder_button");
		
		if(event.type == "focus") {
			this.#fieldHadFocus = true;
		} 
		else if(event.type == "blur") {
			clearTimeout(this.#blurTimeout);
			this.#fieldHadFocus = true;
			
			this.#blurTimeout = setTimeout(() => {
				if(this.#sendClicked) 
					field.innerHTML = "";
					
				if(!field.textContent.trim()) {
					field.innerHTML = "";
					recorderButton.classList.add("visible");
					sendButton.classList.remove("visible");
				} 
				
				if(!(VoiceNoteRecorder.isRecording || VoicenotePlayer.currentPlayer && VoicenotePlayer.currentPlayer.clicked))
					this.#fieldHadFocus = false;
					
				clearTimeout(this.#typingTimeout);
				this.#typing = false;
				
				if(VoicenotePlayer.currentPlayer) 
					VoicenotePlayer.currentPlayer.clicked = false;
				
				Channel.setState({
					state: {action: "typing", value: false}, 
				});
			}, 200);
		} 
		else if(event.type == "input") {
			if(!field.textContent.trim()) {
				field.innerHTML = "";
				recorderButton.classList.add("visible");
				sendButton.classList.remove("visible");
				return;
			} 
			else {
				recorderButton.classList.remove("visible");
				sendButton.classList.add("visible");
			} 
			
			let text = field.innerHTML; 
			
			if(!this.#typing) {
				clearTimeout(this.#typingTimeout);
				this.#typingTimeout = setTimeout(() => {
					this.#typing = false;
					Channel.setState({
						state: {action: "typing", value: false}, 
					});
				}, 1000);
				
				this.#typing = true;
				Channel.setState({
					state: {action: "typing", value: true}, 
				});
			} 
			
			let exceedsLimit = Channel.checkMessageLimit(text);
			if(exceedsLimit) {
				sendButton.classList.add('disabled');
				if(event.inputType.startsWith("insert")) 
					Notify.popUpNote("Message limit exceeded");
				return;
			} 
			
			sendButton.classList.remove('disabled');
		} 
	} 
} 