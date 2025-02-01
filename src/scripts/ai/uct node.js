class UCTNode {
	constructor (move, player) {
		this.move = move;
		this.player = player;
		this.visits = 0;
		this.score = 0;
		this.children = [];
		this.hash = null;
	} 

	is (node) {
		return this.move.getId('move') == node.move.getId('move');
	}
	
	hasChildren () {
		return Boolean(this.children.length);
	} 

	hasHash () {
		return Boolean(this.hash);
	}
	
	getChildren () {
		return this.children;
	} 

	getHash () {
		return this.hash;
	}
	
	opponent () {
		return this.player ^ 1;
	} 
	
	appendChild (child) {
		this.children.push(child);
	} 
	
	ucb (parentVisits, parentId) {
		let score = (this.score / this.visits);
		score += (20 * Math.sqrt(Math.log(parentVisits) / this.visits));
		score *= parentId == this.player? -1: 1;
		return score;
	} 
	
	async findBestChild () {
		let best = {
			score: -Infinity, 
			children: [], 
		};
		
		for(let child of this.children) {
			if(child.visits == 0) {
				best.children = [child];
				break;
			}
			
			let score = child.ucb(this.visits, this.player);
			if(score > best.score) {
				best.children = [child];
				best.score = score;
			} 
			else if(score == best.score) {
				best.children.push(child);
			} 
		}
		let r = 0; //Math.floor(Math.random() * best.children.length);
		return best.children[r];
	}
	
	async expand (board) {
		let player = Player.whoseTurn();
			player = Player.getPlayerFrom(player);
		await board.findMovesFor(player); 

		let moves = board.getLegalMoves();
		
		for(let move of moves) {
			let node = new UCTNode(move, player.id);
			this.appendChild(node);
		} 
	} 
	
	async play (board, m, n, depth) {
		m = m != undefined? m: this.move.getFromRow();
		n = n != undefined? n: this.move.getFromCol();
		
		let more = await board.move(this.move, false, m, n);
		let winner = board.getWinner();

		/*if(!this.hasHash() && depth == 2)
			this.hash = board.toData();*/
		
		if(winner) {
			m = undefined;
			n = undefined;
			return {result: winner, m, n};
		}
		
		if(!more.captures.length) {
			m = undefined;
			n = undefined;
			Player.changeTurn();
		} 
		
		let player = Player.whoseTurn();
			player = Player.getPlayerFrom(player);
		await board.findMovesFor(player);
		
		return {result: 0, m, n};
	} 
}