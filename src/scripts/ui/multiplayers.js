'use strict'

class Multiplayers {
	static changePlayerColor (newElem, value) {
		let mode = Mode.getMode();
		if(mode == 'two-players-offline') {
			let par = newElem.parentElement;
			let id = par.id;
			let initialElem;
			if(value == 'alternately') {
				par.parentElement.$('#player-b button[value="white"]').classList.add('disabled');
				par.parentElement.$('#player-b button[value="black"]').classList.add('disabled');
				par.parentElement.$('#player-b button.active').classList.remove('active');
			} 
			else {
				for(let btn of par.parentElement.$$('#player-b .disabled')) {
					btn.classList.remove('disabled');
				} 
				
				let otherPar = par.parentElement.$(`section:not(#${id})`);
				let otherElem = otherPar.$(`button[value='${value == 'white' && 'black' || 'white'}']`);
				initialElem = otherPar.$("button.active");
				if(initialElem) initialElem.classList.remove('active');
				otherElem.classList.add('active');
			} 
			
			initialElem = par.$("button.active");
			initialElem.classList.remove('active');
			newElem.classList.add('active');
		} 
	} 
	
	static submit (form) {
		let playerAName = "";
		let playerBName = "";
		let playAs = "";
			
		if(form.id == 'offline') {
			playAs = form.$('#player-a button.active').getAttribute('value');
			playerAName = form.$('#player-a input[type="text"]').value;
			playerBName = form.$('#player-b input[type="text"]').value;
			
			if(playerAName == '')
				Notify.popUpNote('Please fill out player A name');
			if(playerBName == '')
				Notify.popUpNote('Please fill out player B name');
				
			this.save(playAs, playerAName, playerBName);
			
			Level.disable();
			Notify.popUpNote('Changes saved successfully');	 
		} 
		else if(form.id == 'online') {
			Channel.subscribe();
		} 
		
		$('#two-players-window button[action="submit"]').focus();
	} 
	
	static save (playAs, playerAName, playerBName) {
		let playAsElement = $(`#settings-window section[value="play-as"] button[value="${playAs}"]`);
		Setting.change(playAsElement, playAs);
		Player.setName(playerAName || '', playerBName || '');
	} 
	
	static viewConnectivityGuide () {
		Notify.alert({
            header: "HOW TO CONNECT ONLINE CHANNEL", 
            message: "To successfully play the online match, you are required to be in a channel so that you and your opponent can communicate exclusively. " +
				"Now, to do that, there is a field named \"CHANNEL DETAILS\" on TWO PLAYERS window. " +
				"In that field, enter your preferred channel name. It can be anything as long as is an name as shown below.<img src='./src/images/channel image.png'>" + 
				"In the next field named \"PLAYER DETAILS\", enter your preferred name. " + 
				"This name will help identify you. Your opponent will refer to you using this name as well.<img src='./src/images/player image.png'>" + 
				"Once done filling the details, tap <kbd>SUBMIT</kbd> button at the bottom of the screen or just press <kbd>ENTER</kbd> on the keyboard. " + 
				"If you are successfully connected, under \"CHANNEL STATUS DETAILS\" at the top of the sreen, your status will change color to green and indicate your connection status<img src='./src/images/status image.png'>." + 
				"Likewise, the channel you have joined will be shown under \"CHANEL DETAILS\" and indicate whether you are the host or guest.<img src='./src/images/channel joined image.png'>" + 
				"If you are the host of that channel, that means you will have to invite your opponent to your channel. " + 
				"You can do this by telling him/her the channel you have joined, or create and share the link to that channel by clicking the <kbd>SHARE</kbd> button under the \"CHANNEL DETAILS\".<br>" + 
				"Once you are all connected to the same channel, a chat button will pop at top right corner of the screen. You can share instant messages live on the app without leaving the app. " + 
				"To initiate a match, just hit the <kbd>PLAY</kbd> button on the screen."
		});
	} 
} 