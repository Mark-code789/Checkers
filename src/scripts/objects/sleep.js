class Sleep {
	running = false;
	name = '';
	velue = null;
	constructor (name) {
		this.name = name;
		this.start = this.start.bind(this);
		this.end = this.end.bind(this);
		this.wait = this.wait.bind(this);
	} 
	start () {
		this.running = true;
		this.value = null;
		return new Promise((resolve, reject) => {
			this.it = setInterval(() => {
				if(!this.running) {
					clearInterval(this.it);
					resolve(this.value);
				} 
			}, 1);
		});
	} 
	end (value) {
		this.value = value;
		this.running = false;
	} 
	wait (sec) {
		return new Promise((resolve) => {
			setTimeout(() => {
				resolve("Done");
			}, sec * 1000);
		});
	} 
} 