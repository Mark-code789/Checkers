class Transmitter extends MovePlayer {
	static #transmitter = null;
	static #container = null;
	static #root = null;
	static #sleep = null;
	static #destination = null;
	
	static init () {
		this.#transmitter = $('.scene .transmitter');
		this.#container = this.#transmitter.lastElementChild;
		this.#root = document.documentElement;
		this.#sleep = new Sleep();
		
		this.offload = this.offload.bind(this);
		this.#container.addEventListener('animationend', this.offload);
	} 
	
	static async transmit (proceed = false) {
		let load = this.load;
		let start = UIValue.getPosition(...this.path[0][0]);
		let end = UIValue.getPosition(...this.path[0][1]);
		if(!proceed) {
			this.#container.lastElementChild.classList.add(...[...load.classList]);
			this.#container.lastElementChild.classList.remove('incomplete_move');
		} 
		this.#container.style.top = `${start.top}px`;
		this.#container.style.left = `${start.left}px`;
		this.#root.style.setProperty('--ept', `${end.top - start.top}px`);
		this.#root.style.setProperty('--epl', `${end.left - start.left}px`);
		
		let averageTransitTime = 0.15; // in seconds
		let acceleration = averageTransitTime * 0.25;
		let transitTime = (Math.abs(start.x - end.x) - 1) * acceleration + averageTransitTime;
		
		this.#root.style.setProperty('--tt', `${transitTime}s`);
		this.#destination = end.cell;
		
		if(!proceed) {
			this.load.parentElement.removeChild(this.load);
		} 
		
		this.#transmitter.classList.add('container_ready');
		this.#container.classList.add('move');
		if(!this.#sleep.running)
		await this.#sleep.start();
	} 
	
	static async offload () {
		this.checkRule();
		this.path.shift();
		this.#transmitter.classList.remove('container_ready');
		this.#container.classList.remove('move');
		
		if(this.path.length) {
			this.playAudio(true);
			return this.transmit(true);
		} 
		
		this.#container.lastElementChild.classList.remove(...[...this.#container.lastElementChild.classList]);
		this.#destination.classList.remove('helper_move', 'helper_capture');
		this.#destination.appendChild(this.load);
		this.#sleep.end();
	} 
	
	static checkRule () {
		let id = Player.whoseTurn();
		let i = this.path[0][1][0];
		let j = this.path[0][1][1];
		
		let hasAttainedRank = Play.board.hasAttainedRank(i, j);
		
		if(!hasAttainedRank) 
			return;
			
		MovePlayer.hasAttainedRank = hasAttainedRank;
		Player.changeKingsCount(1);
		this.#container.lastElementChild.classList.add('crown_' + id);
		this.load.classList.add('crown_' + id);
	} 
} 