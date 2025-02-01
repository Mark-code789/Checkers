class VoicenotePlayer {
	panel;
	btn;
	range;
	time;
	timer;
	audio;
	clicked = false;
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
		
		this.btn.addEventListener("click", this.play.bind(this), false);
		this.range.addEventListener("change", this.skip.bind(this), false);
		this.range.addEventListener("input", this.skipInput.bind(this), false);
	} 
	async send (data) {
		this.audio = data.audio;
		this.audio.addEventListener("ended", this.donePlaying.bind(this));
		this.audio.addEventListener("loadeddata", this.loadedData.bind(this));
		this.audio.addEventListener("loadedmetadata", this.getDuration.bind(this));
		
		const msgID = await Chat.addMessage({action: 'send', text: this.panel}, false);
		const buffer = await data.audioBlob.arrayBuffer();
		const mimeType = data.mimeType;
		
		const fileConfig = {
			data: buffer, 
			name: "CH-" + Date.now() + "." + mimeType.split("/")[1],
			mimeType
		} 
		const messageConfig = {
			id: msgID
		} 
		Channel.send({
			message: messageConfig, 
			file: fileConfig
		});
	} 
	async receive (data) {
		let blob = await data.toFile();
		let url = URL.createObjectURL(blob);
		this.audio = new Audio(url);
		this.audio.addEventListener("ended", this.donePlaying.bind(this));
		this.audio.addEventListener("loadeddata", this.loadedData.bind(this));
		this.audio.addEventListener("loadedmetadata", this.getDuration.bind(this));
		
		return this.panel;
	} 
	async play (event) {
		this.clicked = false;
		
		Chat.refocus();
		
		if(this.playing) {
			this.playing = false;
			this.audio.pause();
			clearInterval(this.timer);
			event.target.classList.remove("audio_pause");
			VoicenotePlayer.currentPlayer = null;
		} 
		else {
			if(VoicenotePlayer.currentPlayer) {
				VoicenotePlayer.currentPlayer.btn.click();
			} 
			VoicenotePlayer.currentPlayer = this;
			this.playing = true;
			this.audio.play();
			this.timer = setInterval(this.getTime.bind(this), 1);
			event.target.classList.add("audio_pause");
		} 
	} 
	async skip (event) {
		this.clicked = false;
		
		Chat.refocus();
		
		let point = event.target.value;
		let time = point / 100 * this.audio.duration;
		this.audio.currentTime = time;
		if(this.playing) {
			this.playing = false;
			this.btn.click();
		} 
	} 
	async skipInput (event) {
		this.clicked = false;
		
		Chat.refocus();
		
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
	loadedData () {
		this.audio.currentTime = 0; 
		this.btn.classList.remove("audio_download");
		this.panel.style.pointerEvents = "auto";
	} 
	donePlaying () {
		clearInterval(this.timer);
		this.playing = false;
		this.getDuration();
		this.audio.currentTime = 0;
		this.audio.muted = false;
		this.audio.playbackRate = 1;
		this.range.style.backgroundSize = `0%`;
		this.range.value = 0;
		this.btn.classList.remove("audio_pause", "audio_download");
		this.panel.style.pointerEvents = "auto";
		this.range.style.pointerEvents = "auto";
		VoicenotePlayer.currentPlayer = null;
	} 
	getDuration () {
		if(this.audio.duration == Infinity || isNaN(this.audio.duration)) {
			this.audio.currentTime = 1e101;
			this.audio.ontimeupdate = this.getDuration.bind(this);
			return;
		} 
		
		this.audio.ontimeupdate = null;
		this.audio.currentTime = 0;
		let m = Math.floor(this.audio.duration / 60);
		let s = Math.floor(this.audio.duration % 60);
		this.time.textContent = `${m}:${String(s).padStart(2, '0')}`;
	} 
	getTime () {
		let m = Math.floor(this.audio.currentTime / 60);
		let s = Math.floor(this.audio.currentTime % 60);
		this.time.textContent = `${m}:${String(s).padStart(2, '0')}`;
		let pac = Math.floor(this.audio.currentTime / this.audio.duration * 100);
		this.range.style.backgroundSize = `${pac}%`;
		this.range.value = `${pac}`;
	} 
} 