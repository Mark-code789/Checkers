class Drag {
	initialX = 0;
	initialY = 0;
	currentX = 0;
	currentY = 0;
	xOffset = 0;
	yOffset = 0;
	active = false;
	moved = false;
	direction = "both";
	dragItem = null;
	sleep;
	transitionDuration;
	eventType;
	
	
	constructor (dragItem, direction = "both", duration = "0.5s") {
		this.direction = direction;
		this.dragItem = dragItem;
		this.transitionDuration = duration;
		this.sleep = new Sleep();
	}
	
	start = async (e) => {
		if(this.eventType && !e.type.startsWith(this.eventType))
			return;
		else if(!this.eventType)
			[this.eventType] = e.type.match(/mouse|touch/) || [null];
			
		if(this.dragItem == e.target) {
			e.preventDefault();
			if(this.dragItem.classList.contains("recorder_button")) {
				this.xOffset = 0;
				this.yOffset = 0;
				this.recorderContainer = $(".recorder_container");
				this.recorderContainer.style.transitionDuration = "0s";
				this.active = await VoiceNoteRecorder.record(this.dragItem);
			}
			else {
				this.active = true;
			} 

			this.dragItem.style.transitionDuration = "0s";
		    if (e.type === "touchstart") {
		        this.initialX = e.touches[0].clientX - this.xOffset;
		        this.initialY = e.touches[0].clientY - this.yOffset;
		    } else {
		        this.initialX = e.clientX - this.xOffset;
		        this.initialY = e.clientY - this.yOffset;
		    }
		} 
	}
	
	end = async (e) => {
		if(this.eventType && !e.type.startsWith(this.eventType))
			return;
			
		await new Sleep().wait(0.05);
			
	    if(this.active && this.moved && (e.type === "touchend" || e.type == "mouseup")) {
			e.preventDefault();
			this.active = false;
			this.dragItem.style.transitionDuration = this.transitionDuration;
			if(this.dragItem === $("#chat-icon")) {
				let rect = this.dragItem.getBoundingClientRect();
		        if(rect.left < 10) {
		            this.currentX += 10 - rect.left;
		        }
		        else if(rect.right > window.innerWidth - 10) {
		            this.currentX += window.innerWidth - 10 - rect.right;
		        }
				else if(rect.width / 2 + rect.left > window.innerWidth / 2) {
					this.currentX += window.innerWidth - 10 - rect.right;
				}
				else if(rect.width / 2 + rect.left < window.innerWidth / 2) {
					this.currentX += 10 - rect.left;
				} 
		        if(rect.top < 10) {
		            this.currentY += 10 - rect.top;
		        }
		        else if(rect.bottom > window.innerHeight - 10) {
		            this.currentY += window.innerHeight - 10 - rect.bottom;
		        }
				this.translate(this.currentX, this.currentY, this.dragItem);
			}
			else if(this.dragItem === $(".games_totals")) {
				let rect = this.dragItem.getBoundingClientRect();
				let parRect = this.dragItem.parentNode.getBoundingClientRect();
				let offset = rect.bottom - parRect.bottom;
				if(rect.top >= (rect.height * 0.25) + rect.top - offset) {
					let dist = parRect.bottom - rect.top;
					this.translate("-50%", this.currentY + dist, this.dragItem);
					this.currentY = 0;
					this.dragItem.removeAttribute("style");
					UIHistory.undo();
				}
				else {
					let dist = rect.bottom - parRect.bottom;
					this.currentY -= dist;
					this.translate("-50%", this.currentY, this.dragItem);
				} 
			}
			else if(this.dragItem === $(".recorder_button")) {
				this.currentX = 0;
				this.currentY = 0;
				this.dragItem.style.transitionDuration = this.transitionDuration;
				this.dragItem.style.transform = "none";
				this.recorderContainer.style.transitionDuration = this.transitionDuration;
				this.recorderContainer.style.width = `calc(100% - 70px)`;
				
				await new Sleep().wait(0.3);
				
				VoiceNoteRecorder.stopRecording(this.dragItem);
			} 
			await this.sleep.wait(parseFloat(this.transitionDuration));
	        this.xOffset = this.currentX;
			this.yOffset = this.currentY;
	    }
		else if(this.dragItem === $(".recorder_button")) {
			this.dragItem.style.transitionDuration = this.transitionDuration;
			this.dragItem.style.transform = "none";
			this.recorderContainer.style.transitionDuration = this.transitionDuration;
			this.recorderContainer.style.width = `calc(100% - 70px)`;
			
			await new Sleep().wait(0.3);
			
			VoiceNoteRecorder.stopRecording(this.dragItem);
		} 
	    else if(this.active && !this.moved && this.dragItem === $("#chat-icon")) {
	        Chat.show();
		}
	    else if(this.active && this.dragItem === $(".games_totals")) {
	        this.active = false;
		}
		this.moved = false;
	}
	
	move = async (e) => {
		if(this.eventType && !e.type.startsWith(this.eventType))
			return;
			
	    if(this.active && (e.type == 'mousemove' && e.buttons || e.type == 'touchmove')) {
			e.preventDefault();
	        if (e.type === "touchmove") {
	            this.currentX = e.touches[0].clientX - this.initialX;
	            this.currentY = e.touches[0].clientY - this.initialY;
	        } else {
	            this.currentX = e.clientX - this.initialX;
	            this.currentY = e.clientY - this.initialY;
	        }
	      
			if(this.direction == "both") {
	        	this.translate(this.currentX, this.currentY, e.target);
			} 
			else if(this.direction == "x") {
				if(this.dragItem.classList.contains("recorder_button")) {
					let recCont = this.recorderContainer.getBoundingClientRect();
					let targetRect = $(".chat_field_container").getBoundingClientRect();
					let rect = this.dragItem.getBoundingClientRect();
					let right = UIValue.getValue(this.dragItem, "right", true);
					let dist = this.currentX - this.xOffset;
					let xThreshold1 = targetRect.width*0.5;
					let xThreshold2 = targetRect.right + right - rect.width /*padding 10*/;
					let expectedX = dist + rect.left;
					if(expectedX < xThreshold1) {
						this.currentX -= (expectedX - xThreshold1);
						dist = this.currentX - this.xOffset;
						this.recorderContainer.style.width = `${recCont.width + dist}px`;
						this.translate(this.currentX, 0, e.target, "", "scale(2)");
						this.active = false;
						this.dragItem.style.transitionDuration = this.transitionDuration;
						this.dragItem.style.transitionTimingFunction = "linear";
						this.dragItem.style.transform = "none";
						this.recorderContainer.style.transitionDuration = this.transitionDuration;
						this.recorderContainer.style.width = "calc(100% - 70px)";
						
						this.dragItem.ontransitionend = () => {
							VoiceNoteRecorder.stopRecording(this.dragItem, true);
							this.dragItem.style.transitionTimingFunction = "ease-out";
							this.dragItem.ontransitionend = null; 
						} 
						return;
					}
					if(expectedX > xThreshold2) {
						this.currentX -= (expectedX - xThreshold2);
						dist = this.currentX - this.xOffset;
					} 
					this.recorderContainer.style.width = `${recCont.width + dist}px`;
				}
				this.translate(this.currentX, 0, e.target, "", "scale(2)");
			}
			else {
				if(this.dragItem.classList.contains("games_totals")) {
					let rect = this.dragItem.getBoundingClientRect();
					let parRect = this.dragItem.parentNode.getBoundingClientRect();
					let dist = this.currentY - this.yOffset;
					let yThreshold = parRect.bottom - rect.height;
					let expectedY = dist + rect.top;
					if(expectedY < yThreshold) {
						this.currentY -= (expectedY - yThreshold);
					}
				} 
				this.translate("-50%", this.currentY, this.dragItem);
			}
			this.moved = !this.moved? (Math.abs(this.currentX - this.xOffset) > 0 || Math.abs(this.currentY - this.yOffset) > 0): this.moved;
			this.xOffset = this.currentX;
			this.yOffset = this.currentY;
		}
		else if(this.active && e.type == 'mousemove' && !e.buttons) {
			this.active = false;
		}
	}
	
	translate = (x, y, elem, prevTransform = "", nextTransform = "") => {
	    elem.style.transform = `${prevTransform} translate3d(${x}${typeof x == "number"? "px": ""}, ${y}${typeof y == "number"? "px": ""}, 0px) ${nextTransform}`.trim();
	}
}