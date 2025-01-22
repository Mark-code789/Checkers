class Timer {
	static AH = 0;
	static BH = 0;
	static AM = 0;
	static BM = 0;
	static interval;
	static start = (player) => {
		if(!player) {
			player = Player.getPlayerFrom(Player.whoseTurn());
			player = PLAYER_A.is(player) && 'A' || 'B';
		} 
		else {
			player = 'A';
		} 
		
		clearInterval(this.interval);
		this.interval = setInterval (() => {
			if(player == "A") {
				this.AM++;
				this.AH = this.AM >= 60? this.AH+1: this.AH;
				this.AM = this.AM >= 60? 0: this.AM;
			}
			else {
				this.BM++;
				this.BH = this.BM >= 60? this.BH+1: this.BH;
				this.BM = this.BM >= 60? 0: this.BM;
			}
			this.show(player);
		}, 1000);
	}
	static stop = () => {
		clearInterval(this.interval);
	}
	static reset = () => {
		this.AH = this.AM = this.BH = this.BM = 0;
		let icons = $$("#play-window .player_A_icon, #play-window .player_B_icon");
		icons[0].classList.remove("black_icon", "white_icon");
		icons[0].classList.add(`${PLAYER_A.pieceColor.toLowerCase()}_icon`);
		icons[2].classList.remove("black_icon", "white_icon");
		icons[2].classList.add(`${PLAYER_A.pieceColor.toLowerCase()}_icon`);
		icons[1].classList.remove("black_icon", "white_icon");
		icons[1].classList.add(`${PLAYER_B.pieceColor.toLowerCase()}_icon`);
		icons[3].classList.remove("black_icon", "white_icon");
		icons[3].classList.add(`${PLAYER_B.pieceColor.toLowerCase()}_icon`);
		this.show('all');
	}
	static show = (player) => {
		if(player == 'A') {
			$$(".player_A_time span")[0].textContent = (this.AH + "").padStart(2, '0') + ":" + (this.AM + "").padStart(2, '0');
			$$(".player_A_time span")[1].textContent = (this.AH + "").padStart(2, '0') + ":" + (this.AM + "").padStart(2, '0');
		}
		else if(player == 'B') {
			$$(".player_B_time span")[0].textContent = (this.BH + "").padStart(2, '0') + ":" + (this.BM + "").padStart(2, '0');
			$$(".player_B_time span")[1].textContent = (this.BH + "").padStart(2, '0') + ":" + (this.BM + "").padStart(2, '0');
		}
		else if(player == "all") {
			$$(".player_A_time span")[0].textContent = (this.AH + "").padStart(2, '0') + ":" + (this.AM + "").padStart(2, '0');
			$$(".player_A_time span")[1].textContent = (this.AH + "").padStart(2, '0') + ":" + (this.AM + "").padStart(2, '0');
			$$(".player_B_time span")[0].textContent = (this.BH + "").padStart(2, '0') + ":" + (this.BM + "").padStart(2, '0');
			$$(".player_B_time span")[1].textContent = (this.BH + "").padStart(2, '0') + ":" + (this.BM + "").padStart(2, '0');
		} 
	} 
}