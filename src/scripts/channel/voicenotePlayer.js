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
		
		this.btn.addEventListener("click", this.play, false);
		this.range.addEventListener("change", this.skip, false);
		this.range.addEventListener("input", this.skipInput, false);
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
			VoicenotePlayer.currentPlayer = null;
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
	receive = async (data) => {
		let blob = await data.toFile();
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
			VoicenotePlayer.currentPlayer = null;
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
		
		return this.panel;
	} 
	play = async (event) => {
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
			if(String(this.audio.duration) == "Infinity") {
				this.audio.muted = true;
				this.audio.playbackRate = 10;
				this.btn.classList.add("audio_download");
				this.panel.style.pointerEvents = "none";
				this.initialPlay = true;
				this.audio.play();
				return;
			} 
			if(VoicenotePlayer.currentPlayer) {
				VoicenotePlayer.currentPlayer.btn.click();
			} 
			VoicenotePlayer.currentPlayer = this;
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
	skipInput = async (event) => {
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
} 