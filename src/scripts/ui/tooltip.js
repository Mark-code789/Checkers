class Tooltip {
	static elems = new Map();
	static showing;
	eventType;
	displayTimeout;
	hoverTimeout;
	constructor (elem, text, registerHover = false) {
		this.elem = elem;
		this.text = text;
		
		if(!registerHover) 
			return;
		
		elem.addEventListener("mouseenter", this.hoverStart.bind(this), false); 
		elem.addEventListener("touchstart", this.hoverStart.bind(this), false); 
		elem.addEventListener("mouseout", this.hoverEnd.bind(this)); 
		elem.addEventListener("touchend", this.hoverEnd.bind(this)); 
		elem.addEventListener("click", this.hoverEnd.bind(this), false);  
	} 
	
	hoverStart (e) {
		if(this.eventType && !e.type.startsWith(this.eventType))
			return;
		else if(!this.eventType)
			[this.eventType] = e.type.match(/mouse|touch/) || [null];
			
		clearTimeout(this.hoverTimeout);
		
		this.hoverTimeout = setTimeout(() => this.show(), 700);
	} 
	hoverEnd (e) {
		if(e.type != 'click' && this.eventType && !e.type.startsWith(this.eventType))
			return;
			
		if(this.eventType != "touch") 
			this.reset();
			
		clearTimeout(this.hoverTimeout);
	} 
	async reset () {
		let root = document.documentElement;
		let tip = $(".tooltip");
		tip.classList.remove("tooltip_appear", "visible"); 
		clearTimeout(this.displayTimeout); 
		await new Sleep().wait(0.5);
		root.style.setProperty('--tip-x', `var(--tip-margin)`);
		root.style.setProperty('--tip-y', `var(--tip-margin)`);
		root.style.setProperty('--tip-pointer-x', `50%`);
		root.style.setProperty('--tip-pointer-x', `100%`);

	} 
	async show () {
		Tooltip.showing && await Tooltip.showing.reset();
		Tooltip.showing = this;
		
		let elem = this.elem;
		let text = this.text;
		let tip = $(".tooltip");
		let root = document.documentElement;
		let margin = UIValue.getValue(root, "--tip-margin");
		let pointerWidth = UIValue.getValue(root, "--tip-pointer-width");
		let maxWidth = window.innerWidth - (margin * 2);
		let maxHeight = window.innerHeight - (margin * 2);
		tip.textContent = text;
		tip.classList.add("visible");
		tip.classList.remove("top");
		let tipRect = tip.getBoundingClientRect();
		let elemRect = elem.getBoundingClientRect();
		
		if(elemRect.top >= window.innerHeight || elemRect.bottom <= 0 ||
		   elemRect.left >= window.innerWidth || elemRect.right <= 0) {
			tip.classList.remove("visible");
			console.error("Element passed for tooltip not visible", elem);
		} 
		
		if(elemRect.top - tipRect.height - 13 > 0) {
			tip.classList.remove("top");
			root.style.setProperty('--tip-y', `${elemRect.top - tipRect.height - 13}px`);
		} 
		else if(elemRect.bottom + tipRect.height + 13 < window.innerHeight) {
			tip.classList.add("top");
			root.style.setProperty('--tip-y', `${elemRect.bottom + 13}px`);
		} 
			
		if(tipRect.width >= maxWidth) { /* only pointer is affected */
			if(elemRect.right <= margin ||
			   elemRect.width / 2 + elemRect.left <= 0) {
				root.style.setProperty('--tip-pointer-x', `${Math.hypot(pointerWidth / 2, pointerWidth / 2)}px`); 
				root.style.setProperty("--tip-x", `0px`);
			} 
			else if(elemRect.left >= maxWidth + margin || 
					elemRect.width / 2 + elemRect.left >= window.innerWidth) {
				root.style.setProperty('--tip-pointer-x', `calc(100% - ${Math.hypot(pointerWidth / 2, pointerWidth / 2)}px)`); 
				root.style.setProperty("--tip-x", `${window.innerWidth - tipRect.width}`);
			} 
			else {
				root.style.setProperty('--tip-pointer-x', `${elemRect.width / 2 + elemRect.left - margin}px`);
				root.style.setProperty('--tip-x', `${margin}px`);
			} 
		} 
		else if(elemRect.width / 2 >= tipRect.width / 2) { /* can be fit at the center */
			root.style.setProperty('--tip-pointer-x', `${tipRect.width / 2}px`);
			root.style.setProperty('--tip-x', `${elemRect.width / 2 + elemRect.left - (tipRect.width / 2)}px`);
		}
		else if(elemRect.width / 2 < tipRect.width / 2) {
			if(elemRect.width / 2 + elemRect.left <= margin) {
				root.style.setProperty('--tip-pointer-x', `${Math.hypot(pointerWidth / 2, pointerWidth / 2)}px`); 
				root.style.setProperty("--tip-x", `0px`);
			} 
			else if(elemRect.width / 2 + elemRect.left >= maxWidth + margin) {
				root.style.setProperty('--tip-pointer-x', `calc(100% - ${Math.hypot(pointerWidth / 2, pointerWidth / 2)}px)`); 
				root.style.setProperty("--tip-x", `${window.innerWidth - tipRect.width}`);
			} 
			else if(elemRect.width / 2 + elemRect.left - (tipRect.width / 2) > 0 && 
					elemRect.width / 2 + elemRect.left + (tipRect.width / 2) < window.innerWidth) {
				root.style.setProperty('--tip-pointer-x', `calc(${elemRect.width / 2 + elemRect.left}px - var(--tip-x))`);
				root.style.setProperty('--tip-x', `${elemRect.width / 2 + elemRect.left - (tipRect.width / 2)}px`);
			} 
			else if(elemRect.width / 2 + elemRect.left > window.innerWidth / 2) {
				root.style.setProperty('--tip-pointer-x', `calc(${elemRect.width / 2 + elemRect.left}px - var(--tip-x))`);
				root.style.setProperty('--tip-x', `${window.innerWidth - margin - tipRect.width}px`);
			} 
			else if(elemRect.width / 2 + elemRect.left < window.innerWidth / 2) {
				root.style.setProperty('--tip-pointer-x', `calc(${elemRect.width / 2 + elemRect.left}px - var(--tip-x))`);
				root.style.setProperty('--tip-x', `${margin}px`);
			} 
		} 
		
		tip.classList.add("tooltip_appear");
		this.displayTimeout = setTimeout(() => {
			tip.classList.remove("tooltip_appear");
			this.displayTimeout = setTimeout(() => this.reset(), 500);
		}, Math.max(text.length * 25, 3500));
	} 
	static setTip (elem, text, registerHover = false) {
		let tooltip;
		let id = elem.getAttribute("tp-id");
		if(id)
			tooltip = this.elems.get(id);
		else {
			id = "tp-" + btoa((this.elems.size + Math.random()).toString());
			tooltip = new Tooltip (elem, text, registerHover);
			this.elems.set(id, tooltip);
			elem.setAttribute("tp-id", id);
		} 
		
		if(!registerHover)
			tooltip.show();
	} 
} 