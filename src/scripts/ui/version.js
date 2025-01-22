class Version {
	static #default = 'american';
	static #value = '';
	static #mask = {} 
	
	static init () {
		let versionsContainer = $(`#main-window .versions_container`);
		
		this.#mask = [...versionsContainer.children].reduce((mask, versionElement, index, arr) => {
			let version = versionElement.getAttribute('value');
			mask[version] = String(1).padStart(index + 1, '0').padEnd(arr.length, '0');
			return mask;
		}, {});
		
		let lastVersion = storage && storage.getItem('checkers-last-version') || this.#default;
		let versionElement = versionsContainer.$(`[value='${lastVersion}']`);
		this.change(versionElement, lastVersion, true);
	} 
	
	static async change (newElem, version, initialize = false) {
		let scrollableParent = $("#main-window .versions_container");
		let initialElem = $("#main-window div[action='version'].active");
		let headings = $$("#main-window .header_div > h2");
		
		if(initialElem) 
		initialElem.classList.remove('active');
		newElem.classList.add('active');
		for(let heading of headings) heading.textContent = version.toUpperCase() + " CHECKERS";
		
		this.#value = version;
		storage && storage.setItem('checkers-last-version', version);
		
		await Scroll.intoView(scrollableParent, newElem, 'horiz', 'center');

		if(initialize)
			Level.init();
		else
			Level.update();
	} 
	
	static getVersions () {
		return [...Object.keys(this.#mask)];
	} 
	
	static getMask () {
		return this.#mask;
	} 
	
	static getVersion () {
		return this.#value;
	} 
	
	static getMaskedVersion () {
		return this.#mask[this.#value];
	} 
	
	static setMask (mask) {
		this.#mask = mask;
	} 
	
	static setVersion (version, includingUI = false) {
		this.#value = version;
		
		if(!includingUI) return;
		
		let scrollableParent = $("#main-window .versions_container");
		let initialElem = $("#main-window div[action='version'].active");
		let newElem = $(`#main-window div[action='version'][value="${value}"`);
		let headings = $$("#main-window .header_div > h2");
		
		if(initialElem) 
			initialElem.classList.remove('active');
			
		newElem.classList.add('active');
		for(let heading of headings) heading.textContent = version.toUpperCase() + " CHECKERS";
		
		Scroll.intoView(scrollableParent, newElem, 'horiz', 'center');
		
		storage && storage.setItem('checkers-last-version', version);
	} 
	
	static is (...versions) {
		let mask = this.getMaskedVersion();
		let index = mask.indexOf('1');
		let is = versions.some((version) => this.#mask[version].charAt(index) & '1');
		return is;
	} 
}