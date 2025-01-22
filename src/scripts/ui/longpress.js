class LongPress {
	static selectMode = false;
	static delay = null;
	static hinted = false;
	static scroll = false;
	static firstTime = false;
	
	static reset () {
		this.selectMode = false;
	} 
	static start (event, target) {
		if(event.target == target) {
			this.scroll = false;
			this.firstTime = false;
			if(!this.selectMode) {
				this.delay = setTimeout(() => {
					$(".chat_header").classList.add("select_mode");
					$(".chat_copy").classList.remove("disabled_button");
					$(".bubbles_container").classList.add("select_mode"); 
					target.classList.toggle("selected_bubble"); 
					
					if(target.$(".text > div").classList.contains("audio_panel")) 
						$(".chat_copy").classList.add("disabled_button");
						
					this.selectMode = true;
				}, 500);
				this.firstTime = true;
			} 
		}
	}
	static end (event, target) {
		if(event.target == target) {
			clearTimeout(this.delay);
			if(!this.scroll && (event.type == "touchend" || event.type == "mouseup")) {
				event.preventDefault();
				if(!this.selectMode && !this.hinted) {
					ElemHint.setHint(target.$(".text"), "Long press for more options.");
					this.hinted = true;
				}
				else if(this.selectMode && !this.firstTime) {
					target.classList.toggle("selected_bubble");
					let selected = $$(".selected_bubble");
					
					if(selected.length == 0) {
						clearTimeout(this.delay);
						$(".chat_header").classList.remove("select_mode");
						$(".bubbles_container").classList.remove("select_mode");
						this.selectMode = false; 
					}
					else if(selected.length > 1) {
						$(".chat_copy").classList.add("disabled_button");
					}
					else if(selected.length == 1) {
						$(".chat_copy").classList.remove("disabled_button");
					}
					
					if($(".selected_bubble .audio_panel")) {
						$(".chat_copy").classList.add("disabled_button");
					}
				} 
			}
			else if(event.type == "scroll") {
				this.scroll = true;
			} 
		} 
	} 
} 