class Scroll {
	static intoView (parent, child, dir = 'horiz', anchor = 'center', smoothBehavior = true) {
		return new Promise((resolve) => {
			if(smoothBehavior) 
				parent.classList.add('smooth_scroll');

			let isScrolling;
			parent.addEventListener('scroll', () => {
				clearTimeout(isScrolling);
				isScrolling = setTimeout(() => {
					this.end.bind(this);
					resolve(true);
				}, 150);
			}, false);

			switch (dir) {
				case 'horiz':
					this.horizontal(parent, child, anchor);
					break;
				case 'vert':
					this.vertical(parent, child, anchor);
					break;
				case 'both':
					this.horizontal(parent, child, anchor);
					this.vertical(parent, child, anchor);
					break;
			} 
			
			isScrolling = setTimeout(() => {
				this.end.bind(this);
				resolve(true);
			}, 150);
		});
	} 
	
	static end (event) {
		event.target.classList.remove('smooth_scroll');
		event.target.removeEventListener('scrollend', this.end);
	} 
	
	static vertical (parent, child, anchor) {
		let parentHeight = parent.clientHeight;
		let top = child.offsetTop;
		let height = child.offsetHeight;
		
		if(anchor == 'start') 
			parent.scrollTop = top;
		else if(anchor == 'center') 
			parent.scrollTop = top + (height / 2) - (parentHeight / 2);
		else if(anchor == 'end') 
			parent.scrollTop = top + height - parentHeight;
	} 
		
	static horizontal (parent, child, anchor) {
		let parentWidth = parent.clientWidth;
		let left = child.offsetLeft;
		let width = child.offsetWidth;
		
		if(anchor == 'start') 
			parent.scrollLeft = left;
		else if(anchor == 'center') 
			parent.scrollLeft = left + (width / 2) - (parentWidth / 2);
		else if(anchor == 'end') 
			parent.scrollLeft = left + width - parentWidth;
	} 
} 