class VoiceNoteRecorder {
	stream;
	mediaRecorder;
	audioChunks;
	timer;
	static isRecording = false;
	static recorder = null;
	static requestAbortion = false;
	static initiating = false;
	static aborting = false;
	static initializationError = false;
	init = async () => {
		try {
			this.stream = await navigator.mediaDevices.getUserMedia({ audio: true });
		} catch (error) {
			return error.name;
		} 
    	this.mediaRecorder = new MediaRecorder(this.stream);
    	this.audioChunks = [];
    	this.mediaRecorder.addEventListener("dataavailable", (event) => {
			this.audioChunks.push(event.data);
		});
		
		return "success";
	} 
	start = () => {
		this.mediaRecorder.start();
		let m = 0;
		let s = 0;
		let recorderTime = $(".recorder_time");
		recorderTime.textContent = "0:00";
		clearInterval(this.timer);
		this.timer = setInterval(() => {
			s++;
			if(s == 60) {
				m++;
				s = 0;
			} 
			recorderTime.textContent = `${m}:${String(s).padStart(2, '0')}`;
		}, 1000);
	} 
	stop = async (cancelled = false) => {
		let data = null;
		let sleep = new Sleep();
		let self = this;
		if(this.mediaRecorder) {
			this.mediaRecorder.addEventListener("stop", () => {
				if(!cancelled && this.audioChunks.length > 0) {
					const audioBlob = new Blob(this.audioChunks);
					const audioURL = URL.createObjectURL(audioBlob);
					const audio = new Audio(audioURL);
					const mimeType = self.mediaRecorder.mimeType.split(";")[0];
					data = {audioBlob, mimeType, audio};
				} 
				else {
					this.audioChunks = [];
					data = null;
				} 
				clearInterval(this.timer);
				$(".recorder_time").textContent = "0:00";
				sleep.end();
			});
			
			if(this.mediaRecorder.state == "recording") {
				this.mediaRecorder.stop();
				await sleep.start();
			} 
			this.stream.getTracks()[0].stop();
		} 
		else {
			data = "no media";
		} 
		
		return data;
	} 
	
	static record = async (elem) => {
		this.isRecording = true;
		if(!Permissions.permissions.microphone) {
			Chat.refocus();
			await Permissions.check("recorder");
			Chat.refocus();
			this.isRecording = false;
			return false;
		} 
		Chat.refocus();
		if(this.initiating || this.aborting) return false; /* Discard the request */
		this.requestAbortion = false; /* Resetting call to abort */
		this.initiating = true; /* Process started */
		this.initializationError = false;
		
		/* Stopping all initial opened streams*/
		try {
			let stream = await navigator.mediaDevices.getUserMedia({ audio: true });
			for(let track of stream.getTracks()) {
				track.stop();
			} 
		} catch (error) {}
		
		this.recorder = new VoiceNoteRecorder();
		let res = await this.recorder.init();
		
		if(res != "success") {
			Notify.popUpNote(res + " occurred. We couldn't proceed.");
			navigator.vibrate([100,50,100]);
			this.recorder = null;
			this.initializationError = true;
			this.initiating = false;
			return false;
		} 
		let elemRect = elem.getBoundingClientRect();
		let recorderCont = $(".recorder_container");
		
		let sleep = new Sleep(); 
		elem.onanimationend = function () {
			this.style.transform = "scale(2)";
			this.classList.remove('button_pop_up');
			this.onanimationend = null;
			sleep.end();
		} 
		
		elem.classList.add("button_pop_up");
		$(".field_container").style.opacity = 0;
		recorderCont.style.display = "flex";
		
		await sleep.start();
		
		AudioPlayer.play("startRecording", 1);
		//await new Sleep().wait(5); /* waiting for recording audio to finish playing*/
		elem.classList.remove("button_pop_up");
		
		res = true;
		if(this.requestAbortion) {
			if(this.recorder && this.recorder.stream) 
				this.recorder.stream.getTracks()[0].stop();
			this.recorder = null;
			
			elem.style.transform = "none";
			recorderCont.style.width = "calc(100% - 70px)";
			
			await new Sleep().wait(0.3); /* wait for animation to finish */
			$(".field_container").style.opacity = 1;
			recorderCont.style.display = "none";
			res = false;
			Tooltip.setTip(elem, "Hold to record. Release to send. Slide left to cancel.");
			
			elem.style.transitionDuration = "0.3s";
			recorderCont.style.transitionDuration = "0.3s";
		} 
		else {
			Channel.setState({
				state: {action: "recording", value: true}, 
			});
			this.recorder.start();
		} 
		this.initiating = false;
		return res;
	} 
	static stopRecording = async (elem, cancelled = false) => {
		Chat.refocus();
		this.isRecording = false;
		if(!Permissions.permissions.microphone) {
			return;
		} 
		try {
			this.requestAbortion = true;
			if(this.initiating || this.initializationError || this.aborting) return; /* Discard the request */
			this.aborting = true; /* Aborting process started */
			
			let res = await this.recorder.stop(cancelled);
			if(cancelled) {
				Channel.setState({
					state: {action: "recording", value: false}, 
				});
				
				elem.onanimationend = function () {
					this.classList.remove('button_shake');
					this.onanimationend = null;
				} 
				
				elem.classList.add("button_shake");
				
				setTimeout(() => {$(".recorder_delete").classList.add("delete_recording")}, 400);
				setTimeout(() => {AudioPlayer.play("throwRecording", 1)}, 800);
				$(".recorder_time").classList.add("delete_recording");
				AudioPlayer.play("deleteRecording", 1);
				navigator.vibrate(50);
				
				await new Sleep().wait(2.1);
				$(".recorder_delete").classList.remove("delete_recording");
				$(".recorder_time").classList.remove("delete_recording");
				Notify.popUpNote("deleted successfully");
			} 
			else if(typeof res == "object") {
				Channel.setState({
					state: {action: "recording", value: false}, 
				});
				let player = new VoicenotePlayer();
				player.send(res);
				AudioPlayer.play("stopRecording", 1);
				navigator.vibrate(50);
			} 
			
			$(".field_container").style.opacity = 1;
			$(".recorder_container").style.display = "none";
			this.recorder = null;
			this.aborting = false;
		} catch (error) {
			console.error(error);
			/* Stopping all initial opened streams*/
			try {
				let stream = await navigator.mediaDevices.getUserMedia({ audio: true });
				for(let track of stream.getTracks()) {
					track.stop();
				} 
			} catch (error) {}
			elem.style.transform = `none`;
			$(".recorder_delete").classList.remove("delete_recording");
			$(".recorder_time").classList.remove("delete_recording");
			$(".field_container").style.opacity = 1;
			$(".recorder_container").style.display = "none";
			this.recorder = null;
			this.aborting = false;
		} 
	} 
} 