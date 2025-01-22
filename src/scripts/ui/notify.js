class Notify {
	static popUpNote = (data) => {
		let popUpNote = $("#pop-up-note");
        popUpNote.innerHTML = data;
        popUpNote.classList.remove("pop");
        void popUpNote.offsetWidth;
        popUpNote.classList.add("pop");
        popUpNote.onanimationend = this.animationEnd;
	} 
	static reset = () => {
		this.note_window = $("#notification-window"), 
        this.note_main = $("#note"), 
        this.note_image = $(".note_img"), 
        this.note_head = $(".note_header"), 
        this.note_body = $(".note_body"), 
        this.note_footer = $(".note_footer"), 
        this.note_buttons = this.note_footer.children,
        this.note_close_button = $("#note .close_btn");
         
        this.note_window.classList.remove("fade_note");
        this.note_window.style.justifyContent = "center";
        this.note_main.style.gridTemplateRows = "auto auto auto";
        this.note_main.style.gridTemplateColumns = "60px auto 25px";
        this.note_main.style.gridRowGap = "5px";
        this.note_main.style.padding = "10px";
        this.note_image.style.padding = "5px";
        this.note_image.style.objectFit = "contain";
        this.note_head.style.fontWeight = "900";
        this.note_body.style.display = "block";
        this.note_window.removeAttribute("onclick");
        this.note_close_button.style.display = "block";
       
        if(this.sleep)
        	this.sleep.end();
        else
        	this.sleep = new Sleep();
	} 

    static alert = async (data) => {
    	await this.reset();
    	this.note_head.innerHTML = data.header || "";
        this.note_body.innerHTML = data.message || "";
        this.note_image.src = ICONS.alertIcon;
        this.note_image.style.width = "60px";
        this.note_image.style.height = "60px";
        this.note_buttons[0].style.display = "none";
        this.note_buttons[1].style.display = "none";
        this.note_buttons[2].style.display = "inline-block";
        this.note_buttons[2].textContent = "OK";
        this.note_buttons[2].setAttribute("value", "OK");
        this.note_window.setAttribute("onclick", "Notify.cancel()");
        this.note_close_button.setAttribute("value", "OK");
        this.note_close_button.style.pointerEvents = "auto";
		
        this.note_window.style.display = "flex";
        await this.sleep.start();
        return this.action;
    }
	static popUpAlert = async (data) => {
		await this.reset();
    	this.note_head.innerHTML = data.header || "";
        this.note_body.innerHTML = data.message || "";
        this.note_window.style.justifyContent = "flex-start";
        this.note_main.style.gridTemplateColumns = data.iconType == "dice"? "60px auto": "100px auto";
        this.note_main.style.gridTemplateRows = "auto";
        this.note_main.style.padding = "5px";
        this.note_main.style.gridRowGap = "0px";
        this.note_image.style.padding = "0px 10px 0px 0px";
        if(data.iconType == "flag") {
        	this.note_image.style.height = "6ch";
        	this.note_image.style.objectFit = "fill";
        	this.note_main.style.gridTemplateColumns = "auto auto";
        } 
       
        this.note_close_button.style.display = "none";
        this.note_head.style.fontWeight = "500";
        this.note_body.style.display = "none";
        this.note_image.src = data.icon;
        this.note_image.style.width = data.iconType == "dice"? "60px": data.iconType =="flag"? "auto": "100px";
        this.note_buttons[0].style.display = "none";
        this.note_buttons[1].style.display = "none";
        this.note_buttons[2].style.display = "none";
        let delay = data.delay || 1000;
        setTimeout(() => {
        	this.sleep.end();
			this.cancel();
		}, delay);
       
		this.note_window.style.display = "flex";
		await this.sleep.start();
    } 
	static alertSpecial = async (data) => {
		await this.reset();
    	this.note_head.innerHTML = data.header || "";
        this.note_body.innerHTML = data.message || "";
        this.note_image.src = ICONS.loadIcon;
        this.note_image.style.width = "60px";
        this.note_buttons[0].style.display = "none";
        this.note_buttons[1].style.display = "none";
        this.note_buttons[2].style.display = "none";
        this.note_close_button.style.pointerEvents = "none";
       
		this.note_window.style.display = "flex";
    } 
	static confirm = async (data) => {
		await this.reset();
    	this.note_head.innerHTML = data.header || "";
        this.note_body.innerHTML = data.message || "";
        this.note_image.style.width = "60px";
        this.note_image.style.height = "60px";
        if(data.icon === undefined) 
            this.note_image.src = ICONS.confirmIcon;
        else {
            if(data.iconType == "winner") {
            	this.note_image.style.height = "80px";
            } 
            else if(data.iconType == "draw") {
            	this.note_main.style.gridTemplateColumns = "80px auto 25px";
            	this.note_image.style.width = "80px";
            } 
            this.note_image.src = data.icon;
        } 
        
        this.note_buttons[0].style.display = "none";
        this.note_buttons[1].style.display = "inline-block";
        this.note_buttons[2].style.display = "inline-block";
        this.note_buttons[1].textContent = data.type.split("/")[0];
        this.note_buttons[2].textContent = data.type.split("/")[1];
        this.note_buttons[1].setAttribute("value", data.type.split("/")[0]);
        this.note_buttons[2].setAttribute("value", data.type.split("/")[1]);
        this.note_close_button.setAttribute("value", data.type.split("/")[0]);
        this.note_close_button.style.pointerEvents = "auto";
       
		this.note_window.style.display = "flex";
        await this.sleep.start();
        return this.action;
	}
    static other = async (data) => {
    	await this.reset();
    	this.note_head.innerHTML = data.header || "";
        this.note_body.innerHTML = data.message || "";
    	if(data.icon === undefined) 
            this.note_image.src = ICONS.confirmIcon;
        else
        	this.note_image.src = data.icon;
        this.note_image.style.height = "60px";
        if(data.iconType == "winner") {
            this.note_image.style.width = "60px";
            this.note_image.style.height = "80px";
        } 
        else if(data.iconType == "draw") {
        	this.note_main.style.gridTemplateColumns = "80px auto 25px";
            this.note_image.style.width = "80px";
        } 
        
        this.note_buttons[0].style.display = "inline-block";
        this.note_buttons[1].style.display = "inline-block";
        this.note_buttons[2].style.display = "inline-block";
        this.note_buttons[0].innerHTML = data.type.split("/")[0];
        this.note_buttons[1].innerHTML = data.type.split("/")[1];
        this.note_buttons[2].innerHTML = data.type.split("/")[2];
        this.note_buttons[0].setAttribute("value", data.type.split("/")[0]);
        this.note_buttons[1].setAttribute("value", data.type.split("/")[1]);
        this.note_buttons[2].setAttribute("value", data.type.split("/")[2]);
        this.note_close_button.setAttribute("value", data.type.split("/")[0]);
        this.note_close_button.style.pointerEvents = "auto";
       
		this.note_window.style.display = "flex";
        await this.sleep.start();
        return this.action;
    }

    static triggerAction = (action) => {
        let button = [...this.note_buttons].find((btn) => btn.getAttribute('value') == action);
        button.click();
    }
   
    static buttonAction = async (elem) => {
    	this.action = elem.getAttribute("value");
    	this.sleep.end();
    	this.cancel();
    }
   
	static cancel = async () => {
		this.note_window = $("#notification-window");
	    this.note_window.classList.remove("fade_note");
	    void this.note_window.offsetWidth;
	    this.note_window.setAttribute("onanimationend", "Notify.animationEnd(event)");
	    this.note_window.classList.add("fade_note");
	} 
	
	static animationEnd (event) {
        if(event.animationName == 'fade-note')
            event.target.classList.remove("fade_note");
        else if(event.animationName == 'pop-out')
            event.target.classList.remove('pop');
        
		event.target.removeAttribute("onanimationend");
        event.target.style.display = "none";
	} 
}