class AudioPlayer {
	static #muted = false;
	static async play (tone, vol = 1) {
	    if(!this.#muted) { 
	        try {
	            SOUND[tone].muted = false;
	            SOUND[tone].volume = vol;
                SOUND[tone].currentTime = 0;
                setTimeout(_ => SOUND[tone].play(), 0.1);
	        } catch (error) {
				console.log(error);
			}
	    }
	}
	static init () {
		SOUND.click.muted = true;
		SOUND.capture.muted = true;
	    SOUND.king.muted = true;
	    SOUND.collect.muted = true;
	    SOUND.gameWin.muted = true;
	    SOUND.gameLose.muted = true;
		SOUND.notification.muted = true;
		SOUND.click.play();
	    SOUND.capture.play();
	    SOUND.king.play();
	    SOUND.collect.play();
	    SOUND.gameWin.play();
	    SOUND.gameLose.play();
		SOUND.notification.play();
	} 
	static setSound (value) {
		this.#muted = value == 'off'? true: false;
	} 
	
	static toggleMute () {
		this.#muted = !this.#muted;
	} 
	
	static getSound () {
		return !this.#muted;
	} 
} 