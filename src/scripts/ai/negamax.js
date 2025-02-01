class Negamax {
	static MIN = -100_000_000;
	static MAX = 100_000_000;
	depthSearched = 100; 
	startDepth = 0;
	stop = false;
	board = null;
	actual = 0;
	
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
    	let best = Negamax.MIN;
    	let currLength = moves.moves.length + moves.captures.length;
		let alphaOrig = alpha;
		let ttEntry;
		
		/* if(depth < this.startDepth) {
			ttEntry = await TranspositionTable.lookUp();
			if(ttEntry.valid && ttEntry.depth <= depth) {
				if(ttEntry.flag = 0) {
					this.depthSearched = Math.min(ttEntry.depth, this.depthSearched);
					return ttEntry.value;
				}
				else if(ttEntry.flag == -1) {
					alpha = Math.max(alpha, ttEntry.value);
				}
				else if(ttEntry.flag == 1) {
					beta = Math.min(beta, ttEntry.value);
				}
				
				if(alpha >= beta) {
					this.depthSearched = Math.min(ttEntry.depth, this.depthSearched);
					return ttEntry.value;
				}
			}
		} */
    	if(!currLength) {
			let leafScore = color == 1? -1_000_000: 1_000_000;
			return leafScore * color;
		}
    	
        if(depth === 0) {
        	let valuator = new Evaluator();
        	await valuator.evaluateBoard(this.board);
        	let score = await valuator.evaluateDepth();
        		score *= color;
            return score; 
        } 
        else {
        	moves = (Setting.get('mandatory-capture') == 'on' && moves.captures.length) || color == prevColor? 
					moves.captures: moves.captures.concat(moves.moves); 
        	
            for(let i = 0; i < moves.length; i++) {
            	if(this.stop)
					return 0;
            	
            	let move = moves[i];
            	let value, m, n;
				
				let more = await this.board.move(move, false, a, b); 
            	
                if(more.captures.length) {
                	m = move.getFromRow();
                	n = move.getFromCol();
					m = color == prevColor? a: m;
					n = color == prevColor? b: n;
					
					value = await this.start(more, depth-1, color, alpha, beta, m, n, color);
                } 
                else {
                	await Player.changeTurn();
                	
                	let id = Player.whoseTurn();
                	let player = Player.getPlayerFrom(id);
                	m = move.getToRow();
                	n = move.getToCol();
                	
                	let nextPlayerMoves = await this.board.findNewMovesFor(player);
					
					value = -await this.start(nextPlayerMoves, depth-1, -color, -beta, -alpha, m, n, color); 
					
					await Player.changeTurn();
				} 
				
				move = await this.board.move([], true, a, b);
				
				best = Math.max(value, best);
				alpha = Math.max(best, alpha);
				
				if(alpha >= beta) {
					break; 
				} 
            } 
			
			/* if(!this.stop && depth < this.startDepth) {
				ttEntry.value = best;
				if(best <= alphaOrig)
					ttEntry.flag = 1;
				else if(best >= beta) 
					ttEntry.flag = -1;
				else
					ttEntry.flag = 0;
				
				ttEntry.valid = true;
				ttEntry.depth = depth;
				
				await TranspositionTable.store(ttEntry);
			} */
            
            return best;
        } 
    } 
} 