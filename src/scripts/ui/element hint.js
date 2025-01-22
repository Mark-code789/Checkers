class ElemHint {
	static timeout;
	static setHint = (elem, text) => {
		clearTimeout(this.timeout);
		let hint = $(".elem_hint");
		let root = document.documentElement;
		hint.textContent = text;
		hint.style.display = "block";
		hint.style.opacity = 1;
		let hintRect = hint.getBoundingClientRect();
		let elemRect = elem.getBoundingClientRect();
		
		if(elemRect.width / 2 >= hintRect.width / 2) { /* can be fit at the center */
			root.style.setProperty('--hint-pointer-x', `${hintRect.width / 2 - 10}px`);
			hint.style.left = `${elemRect.width / 2 + elemRect.left - (hintRect.width / 2)}px`;
		}
		else if(elemRect.width / 2 < hintRect.width / 2) {
			if(elemRect.width / 2 + elemRect.left - (hintRect.width / 2) > 5 &&
			   elemRect.right - (elemRect.width / 2) + (hintRect.width / 2) < window.innerWidth - 5) { /* center alignment */
				root.style.setProperty('--hint-pointer-x', `${hintRect.width / 2 - 10}px`);
				hint.style.left = `${elemRect.width / 2 + elemRect.left - (hintRect.width / 2)}px`;
			}
			else if(elemRect.left > 5 && elemRect.right < window.innerWidth / 2) { /* Not at extreme far left*/
				root.style.setProperty('--hint-pointer-x', `${elemRect.width / 2 + elemRect.left - 15}px`);
				hint.style.left = `5px`;
			}
			else if(elemRect.right < window.innerWidth - 5) { /* Not at extreme far right */
				root.style.setProperty('--hint-pointer-x', `${(elemRect.width / 2 + elemRect.left - 10) - (window.innerWidth - hintRect.width - 5)}px`); /* 5 because of screen margin and border width which is 10*/
				hint.style.left = `${window.innerWidth - hintRect.width - 5}px`;
			} 
		} 
		
		
		if(elemRect.top - hintRect.height - 13 > 0) {
			hint.classList.remove("top");
			root.style.setProperty('--hint-pointer-y', '-10px');
			hint.style.top = `${elemRect.top - hintRect.height - 13}px`;
		} 
		else if(elemRect.bottom + hintRect.height + 13 < window.innerHeight) {
			hint.classList.add("top");
			root.style.setProperty('--hint-pointer-y', '-10px');
			hint.style.top = `${elemRect.bottom + 13}px`;
		} 
			
		hint.style.opacity = 1;
		this.timeout = setTimeout(() => {hint.style.display = "none";}, 3500);
	} 
} 