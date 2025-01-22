class Mode {
	static #value = 'single-player';
	static #mask = {} 
	
	static async init () {
		let modes = $$(`#main-window #main div[action='mode']`);
		
		this.#mask = [...modes].reduce((mask, modeElement, index, arr) => {
			let mode = modeElement.getAttribute('value');
			mask[mode] = String(1).padStart(index + 1, '0').padEnd(arr.length, '0');
			return mask;
		}, {});
	} 
	
	static change (newElem, mode) {
		let initialElem = $("#main-window div[action='mode'].active");
		
		initialElem.classList.remove('active');
		newElem.classList.add('active');
		
		this.#value = mode;
		mode = mode.replaceAll(/-\w/g, t => t.toUpperCase().charAt(1));
		
		this[mode]();
	} 
	
	static getMode () {
		return this.#value;
	} 

	static setMode (mode) {
		this.#value = mode;
	}

	static reset () {
		this.#value = 'single-player';
	}
	
	static is (...modes) {
		let mask = this.#mask[this.#value];
		let index = mask.indexOf('1');
		let is = modes.some((mode) => this.#mask[mode].charAt(index) & '1');
		return is;
	} 
	
	static singlePlayer () {
		Level.enable();
		Player.setName('You', 'AI');
	} 
	
	static twoPlayersOffline () {
		let online = $('#two-players-window #online');
		let offline = $('#two-players-window #offline');
		online.style.display = 'none';
		offline.style.display = 'grid';
		
		Player.setName("", "");
		Level.disable();
		UIHistory.push('#main-window', '#two-players-window');
	} 
	
	static twoPlayersOnline () {
		let online = $('#two-players-window #online');
		let offline = $('#two-players-window #offline');
		online.style.display = 'grid';
		offline.style.display = 'none';
		
		Player.setName("", "");
		Level.disable();
		UIHistory.push('#main-window', '#two-players-window');
	} 
	
	static disable (...modes) {
		for(let mode of modes) 
			if(mode == "offline") 
				$('#main-window #main div[value="two-players-offline"]').classList.add("disabled");
			else if(mode == "online") 
				$('#main-window #main div[value="two-players-online"]').classList.add("disabled");
			else if(mode == "single") 
				$('#main-window #main div[value="single-player"]').classList.add("disabled"); 
	} 
	static enable (...modes) {
		for(let mode of modes) 
			if(mode == "offline") 
				$('#main-window #main div[value="two-players-offline"]').classList.remove("disabled");
			else if(mode == "online") 
				$('#main-window #main div[value="two-players-online"]').classList.remove("disabled");
			else if(mode == "single") 
				$('#main-window #main div[value="single-player"]').classList.remove("disabled"); 
	} 
} 