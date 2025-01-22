class Level {
	static #default = 'beginner';
	static #value = '';
	static #achievements = {};
	static #values = [
		'beginner', 
		'easy', 
		'medium', 
		'hard', 
		'advance', 
		'expert', 
		'candidate master', 
		'master', 
		'grand master',
		'champion',
		'world champion'
	];
	
	static init () {
		let lastVersion = Version.getVersion();
		let lastLevel = storage && storage.getItem('checkers-last-level') || this.#default;
		let lastAchievements = storage && storage.getItem('checkers-last-achievements');
			lastAchievements = lastAchievements && JSON.parse(lastAchievements) || {[lastVersion]: {[this.#default]: 0}};
			this.#achievements = lastAchievements;
		let achievements = lastAchievements[lastVersion] || {[this.#default]: 0};
		
		Object.entries(achievements).forEach(([level, score]) => {
			this.unlockNext(true);
			this.setScore(score, level, true);
		});
		
		let lastLevelElement = $(`#main-window div[action='level'][value='${lastLevel}']`);
		this.change(lastLevelElement, lastLevel);
	} 
	static update () {
		let version = Version.getVersion();
		let achievements = this.#achievements[version] || {[this.#default]: 0};

		this.reset(false);

		Object.entries(achievements).forEach(([level, score]) => {
			this.unlockNext(true);
			this.setScore(score, level, true);
		});
		
		let lastLevel = Object.keys(this.#achievements[version]).slice(-1)[0] || this.#default;
		let lastLevelElement = $(`#main-window div[action='level'][value='${lastLevel}']`);
		this.change(lastLevelElement, lastLevel);
	} 
	
	static async change (newElem, level) {
		let scrollableParent = $("#main-window #levels #nav");
		let initialElem = $("#main-window div[action='level'].active");
		let heading = $("#main-window #levels > h2");
		
		if(level == 'locked') {
			Notify.popUpNote('Please win the previous level to unlock this one.');
			this.enlargeLock(newElem);
			return;
		} 
		
		if(initialElem) 
		initialElem.classList.remove('active');
		newElem.classList.add('active');
		heading.textContent = level.toUpperCase() + " LEVEL";
		
		this.#value = level;
		storage && storage.setItem('checkers-last-level', level);
		
		await Scroll.intoView(scrollableParent, newElem);
	} 
	
	static disable () {
		let levels = $$("#main-window #nav div[action='level']");
		
		for(let level of levels)
			level.classList.add("disabled");
	} 
	
	static enable () {
		let levels = $$("#main-window #nav div[action='level']");
		
		for(let level of levels)
			level.classList.remove("disabled");
	} 
	
	static enlargeLock (elem) {
		elem.classList.remove('enlarge');
		void elem.offsetWidth;
		elem.classList.add('enlarge');
		elem.onanimationend = function (e) {
			e.currentTarget.classList.remove('enlarge');
		}
	} 
	
	static getLevel () {
		return this.#value;
	} 

	static setLevel (level) {
		this.#value = level;
	}

	static resetLevel () {
		this.#value = '';
	}
	
	static getLevelAsInt () {
		return this.#values.indexOf(this.#value);
	} 
	
	static setScore (score, level, initializing = false) {
		let version = Version.getVersion();
		let currentLevelInt = this.getLevelAsInt();
		let currentLevel = level || this.#values[currentLevelInt];
		let currentLevelElement = $(`#main-window div[action='level'][value='${currentLevel}']`);
		
		currentLevelElement.classList.remove('pc_0', 'pc_1', 'pc_2', 'pc_3');
		currentLevelElement.classList.add('pc_' + score);
		
		this.#achievements[version] = this.#achievements[version] || {};
		this.#achievements[version][currentLevel] = score;
		
		if(initializing)
			return;

		storage && storage.setItem('checkers-last-achievements', JSON.stringify(this.#achievements));
		storage && storage.setItem('checkers-last-version', Version.getVersion());
	} 
	
	static unlockNext (initializing = false) {
		let version = Version.getVersion();
		let currentLevelInt = this.getLevelAsInt();
		let nextLevelInt = currentLevelInt + 1;
		let nextLevel = this.#values[nextLevelInt];
		
		if(!nextLevel) 
			return;

		if($(`#main-window div[action='level'][value='${nextLevel}']`))
			return 'already-unlocked';
		
		let nextLevelElement = $("#main-window div[action='level'][value='locked']");
		nextLevelElement.classList.add('pc_' + 0);
		nextLevelElement.setAttribute('value', nextLevel);
		nextLevelElement.children[0].innerHTML = (nextLevel.toUpperCase() + ' LEVEL').split(' ').slice(0, 2).join('<br/>');
		
		this.#value = nextLevel;
		this.#achievements[version] = this.#achievements[version] || {};
		this.#achievements[version][nextLevel] = 0;
		
		if(initializing)
			return nextLevel;

		storage && storage.setItem('checkers-last-achievements', JSON.stringify(this.#achievements));
		storage && storage.setItem('checkers-last-version', Version.getVersion());
		
		return nextLevel;
	} 
	
	static async reset (totaly = true) {
		if(totaly) {
			let response = await Notify.confirm({
				header: "Are you sure to restart all levels?", 
				message: "Once done this action can't be reversed", 
				type: "CANCEL/RESTART"
			});
			
			if(response == "CANCEL") {
				return;
			} 
		}
		
		let levels = $$("#main-window div[action='level']");
		for(let level of levels) {
			level.setAttribute("value", "locked");
			level.children[0].innerHTML = "LOCKED";
			level.classList.remove('active', 'pc_0', 'pc_1', 'pc_2', 'pc_3');
		} 
		
		if(totaly) {
			let firstLevel = levels[0];
			firstLevel.setAttribute("value", this.#default);
			firstLevel.children[0].innerHTML = (this.#default.toUpperCase() + ' LEVEL').split(' ').slice(0, 2).join('<br/>');

			this.#achievements = {};
			this.change(firstLevel, this.#default);

			storage && storage.removeItem('checkers-last-achievements');
			storage && storage.removeItem('checkers-last-level');
		}
		else {
			this.#value = '';
		}
	} 
} 