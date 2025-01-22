class Negascout {
	static MIN = -100_000_000;
	static MAX = 100_000_000;
	depthSearched = 100; 
	startDepth = 0;
	stop = false;
	board = null;
	moves = new Map();
	
	constructor (board, depth) {
		this.board = board; 
		this.startDepth = depth;
	} 
	
	end () {
		this.stop = true;
	} 
	
	async start (moves, depth, color, alpha, beta, a, b, prevColor) { 
		if(this.stop)
			return 0;
			
		this.depthSearched = Math.min(depth, this.depthSearched);
    	let best = Negascout.MIN;
    	let currLength = moves.moves.length + moves.captures.length;
    
    	if(!currentLength) {
    		let leafScore = 1_000_000;
    		return leafScore * color;
    	} 
    	
        if(depth === 0) {
        	let valuator = new Evaluator();
        	await valuator.evaluateBoard(this.board.getBoard());
        	let score = await valuator.evaluateDepth();
            return score * color; 
        } 
        else {
        	moves = (Setting.get('mandatory-capture') == 'on' && moves.captures.length || color == prevColor) && 
					moves.captures || moves.captures.concat(moves.moves); 
					
			// moves = await this.sortMoves(depth, color, moves);
        	
            for(let i = 0; i < moves.length; i++) {
            	if(this.stop)
					return 0;
            	
            	let move = moves[i];
            	let value, m, n;
				
				let more = await this.board.move(move); 
				
            	more.captures = more.captures.filter(({empty}) => {
            		[m, n] = empty;
            		return !(depth < this.startDepth && color == prevColor && m == a && n == b) // start position
            	});
            	
                if(more.captures.length) {
                	[m, n] = move.cell;
					m = color == prevColor? a: m;
					n = color == prevColor? b: n;
					
					value = await this.start(more, depth, color, alpha, beta, m, n, color);
                } 
                else {
                	await Player.changeTurn();
                	
                	let id = Player.whoseTurn();
                	let player = Player.getPlayerFrom(id);
                	[m, n] = move.empty;
                	
                	let nextPlayerMoves = await this.board.findNewMovesFor(player);
					
					if(i == 0) { 
						value = -await this.start(nextPlayerMoves, depth-1, -color, -beta, -alpha, m, n, color); 
					} 
					else {
                    	value = -await this.start(nextPlayerMoves, depth-1, -color, -alpha-1, -alpha, m, n, color); 
						
						if(value > alpha && value < beta) 
							value = -await this.start(nextPlayerMoves, depth-1, -color, -beta, -alpha, m, n, color); 
					} 
					
					await Player.changeTurn();
				} 
				
				move = await this.board.move([], true);
				
				best = Math.max(value, best);
				alpha = Math.max(best, alpha);
				
				if(alpha >= beta) {
					// await this.addMove(depth, color, alpha, move);
					break; 
				} 
            } 
            
            return best;
        } 
    } 
    
    async addMove (depth, color, move, alpha) {
    	let moves = this.moves.get(depth) || {};
    	moves.push({color, move, alpha});
    	this.moves.set(depth, moves);
	} 
	
	async sortMoves (depth, color, moves) {
		moves = moves.sort((a, b) => {
			let killerA = this.moves.get(depth).find(({move: m, color: c}) => {
				return m.getFromRow();
			});
		})
	} 
} 