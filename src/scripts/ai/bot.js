'use strict'

class Bot {
	static sleep;
	
	static async init () {
		await WorkerManager.setTrainingData();
	}
	static async makeMove () {
		if(!Play.trainingMode && !(Mode.is('single-player') && PLAYER_B.turn))
			return;
		/* if(Play.trainingMode && Mode.is('single-player')) {
			let res = await Notify.confirm({
				header: 'Stop Self Play',
				message: 'Do you wanna stop training?',
				type: 'STOP/CANCEL'
			});

			if(res == 'STOP')
				return Play.exit(true);
		} */
		
		this.searched = 0;
		let depth = 1 + Level.getLevelAsInt();
		let sleep = new Sleep();
		let player = Player.whoseTurn();
			player = Player.getPlayerFrom(player);
		
		Play.updateStatus('thinking...');
		
		let moves;
			moves = await this.findMove(depth);
		
		Play.board.findMovesFor(player);
		MoveChecker.setPossibleMoves(Play.board.getMoves());
		
		if(!Play.isOn()) 
			return;
			
		await Helper.showPathFor(moves);
		await Play.countPieces();
		await sleep.wait(0.5);
		
		let event = new Event('click');
		let i = moves[0].getFromRow();
		let j = moves[0].getFromCol();
		let cell = $(`#table .cell[value='${i}${j}']`);
			cell.removeAttribute('onclick');
			cell.dispatchEvent(event);
		
		await MoveChecker.check(event);
		await MoveChecker.setMove(moves);
		
		cell.setAttribute('onclick', 'MoveChecker.check(event)');
		
		i = moves.slice(-1)[0].getToRow();
		j = moves.slice(-1)[0].getToCol();
		cell = $(`#table .cell[value='${i}${j}']`);
		cell.removeAttribute('onclick');
		cell.dispatchEvent(event);
		
		await Helper.reset();
		await MoveChecker.check(event);
		cell.setAttribute('onclick', 'MoveChecker.check(event)');
	} 
	static async hint () {
		let depth = 1 + Level.getLevelAsInt();
			depth = depth < 4 && 4 || depth == 9 && 9 || depth + 1;
			
		this.searched = 0;
		let player = Player.whoseTurn();
			player = Player.getPlayerFrom(player);
		
		Play.updateStatus('thinking...');
		
		let moves = await this.findMove(depth);
		
		await Play.board.findMovesFor(player);
		MoveChecker.setPossibleMoves(Play.board.getMoves());
		
		if(!Play.isOn()) 
			return;
			
		await Helper.showPathFor(moves, true);
		Play.countPieces();
	} 
	static async findMove (depth, m, n) {
		let bestMoves = [];
		let moves = [];
		
		let move = await this.findBestMove(depth, true, m, n);
		let a = move.getToRow();
		let b = move.getToCol();
		
		if(move.isCapture()) {
			m = m == undefined? move.getFromRow(): m;
			n = n == undefined? move.getFromCol(): n;
			
			let more = await Play.board.move(move, false, m, n);
			
			if(more.captures.length) {
				Play.board.setMoves(more);
				moves = await this.findMove(depth, m, n);
			} 
			else 
				moves = [];
			await Play.board.move([], true, m, n);
		} 
		else 
			moves = [];
		
		bestMoves.push(move, ...moves);
		
		return bestMoves;
	} 
	static async findBestMove (depth, useWorker = true, m, n) {
		this.algorithm = Negamax; //Play.trainingMode && Player.whoseTurn() != Play.firstPlayer? Negamax: UCT;
		let possibleMoves = [];
		let best = this.algorithm.MIN;
		let value = this.algorithm.MIN;
		let alpha = this.algorithm.MIN;
		let beta = this.algorithm.MAX;
		let color = PLAYER_B.turn? 1: -1;
			
		// depth = Play.level;
		
		let moves = Play.board.getLegalMoves();
		
		if(moves.length == 1) {
			return moves[0];
		} 
		
		if(useWorker && depth > 1) {
			/* let algorithm = new UCT();
			let currentPlayer = Player.whoseTurn();
			let move = await algorithm.start(Play.board, 1, Play.trainingMode, m, n);
			Player.setTurn(currentPlayer);
			return move; */
			
			this.sleep = new Sleep();
			await WorkerManager.start(depth, this.algorithm, m, n);
			moves = Play.board.getLegalMoves();
			possibleMoves = await this.sleep.start();
		} 
		else if(!useWorker && depth > 1) {
			moves = Play.board.getLegalMoves();
			
			for(let i = 0; i < moves.length; i++) {
				let move = moves[i];
				m = m != undefined? m: move.getFromRow();
				n = n != undefined? n: move.getFromCol();
				
				let algorithm = new this.algorithm(depth);
				let more = await Board.move(move, false, m, n);
				
				if(more.captures.length) {
					value = await algorithm.start(more, depth-1, color, alpha, beta, m, n, color); 
				} 
				else {
					await Player.changeTurn();
                	
                	let id = Player.whoseTurn();
                	let player = Player.getPlayerFrom(id);
	            	let nextPlayerMoves = await Play.board.findMovesFor(player);
					
					value = -await algorithm.start(nextPlayerMoves, depth-1, -color, -beta, -alpha, m, n, color); 
					
					await Player.changeTurn();
				} 
				
				move = await Play.board.move([], true, m, n);
				
				move = moves[i];
				
				if(value > best) {
					possibleMoves = [];
					possibleMoves.push(move);
					best = value;
				} 
				else if(value == best) {
					possibleMoves.push(move);
				} 
			} 
		} 
		else if(depth == 1) {
			possibleMoves = await moves.reduce(async (moves, move) => {
				moves = await moves;
				if(move.captureId) {
					let more = await Play.board.move(move, false, m, n);
					await Play.board.move(move, true);
					if(more.captures.length)
						moves.push(move);
				} 
				else
					moves.push(move);
				return moves;
			}, []);
			possibleMoves = possibleMoves.length && possibleMoves || moves;
		} 
		
		possibleMoves = await this.minDistance(possibleMoves, Play.board);
		let rand = Math.floor(Math.random() * (possibleMoves.length));
		let move = possibleMoves[rand];
		
		return possibleMoves[rand];
	} 
	
	static async minDistance (moves, board) {
		let player = Player.invertTurn();
			player = Player.getPlayerFrom(player).id;
			
		if(board.getPiecesCount()[player & 1] == 0 || moves.length == 1)
			return moves;
			
		let filtered = moves.reduce((min, move) => {
			let dA = 0;
			let dB = 0;
			let a = move.getFromRow();
			let b = move.getFromCol();
			let c = move.getToRow();
			let d = move.getToCol(); 
			
			if(!board.isKing(a, b))
				return min;
			
			for(let i = 0; i < board.getPiecesPerPlayer(); i++) {
				let pos = board.getPos(player, i);
				
				if(pos == -1)
					continue;
					
				let [x, y] = board.posToCoord(pos);
				let isKing = board.isKing(x, y);
				
				if(!isKing) 
					continue;
					
				let dx = Math.abs(a - x);
				let dy = Math.abs(b - y);
				dA = Math.sqrt( (dx**2) + (dy**2) ).toFixed(0);
				
				dx = Math.abs(c - x);
				dy = Math.abs(d - y);
				dB = Math.sqrt( (dx**2) + (dy**2) ).toFixed(0);
				
				if(dB < dA) 
					min.push(move);
			} 
			
			return min;
		}, []);
		
		moves = filtered.length? filtered: moves;
		return moves;
	} 
	
	static onWorkComplete (result, count, total) {
		if(result.result >= 1_000_000) 
			WorkerManager.stop();
		this.updateProgress(count, total);
	} 
	
	static onDone (result) {
		let best = result.reduce((best, {move, result}) => {
			// console.log(move.getFromRow(), move.getFromCol(), move.getToRow(), move.getToCol(), ' - ', result);
			if(result > best.value) {
				best.moves.splice(0, best.moves.length, move);
				best.value = result;
			} 
			else if(result == best.value) {
				best.moves.push(move);
			} 
			
			return best;
		}, {moves: [], value: this.algorithm.MIN});
		
		this.updateProgress(0, 1);
		this.sleep.end(best.moves);
	} 
	
	static updateProgress (count, total) {
		let timerSection = $("#play-window .timer_section .play_state");
		let footerSection = $("#play-window .footer_section");
    	let faceBottom = $("#play-window .middle_section .face_bottom");
    
    	let widthA = parseFloat(UIValue.getValue(timerSection, "width"));
    	let widthB = parseFloat(UIValue.getValue(footerSection, "width"));
    	let widthC = parseFloat(UIValue.getValue(faceBottom, "width"));
    	let finishedSize = (count * widthA / total) + "px";
		timerSection.style.backgroundImage = "linear-gradient(to right, #00981988 " + finishedSize + ", #0000 " + finishedSize + ")";
		
    	finishedSize = (count * widthB / total) + "px";
    	footerSection.style.backgroundImage = "linear-gradient(to right, #00981988 " + finishedSize + ", #0000 " + finishedSize + ")";
    	
    	finishedSize = (count * widthC / total) + "px";
    	faceBottom.style.backgroundImage = `linear-gradient(to right, #00981988 ${finishedSize}, #0000 ${finishedSize}), linear-gradient(to bottom, rgba(70,70,70,0.4), rgba(0,0,0,0.7)), var(--black-cell)`;
	} 
}