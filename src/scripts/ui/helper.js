class Helper extends MoveChecker {
	static async showPossibleMoves () {
		await MoveChecker.reset();
		
		let id = Player.whoseTurn();
		let player = Player.getPlayerFrom(id);
		await Play.board.findMovesFor(player);
		
		this.possibleMoves = Play.board.getMoves();
		
		if(Setting.get('helper') == 'off') 
			return;
			
		if(Mode.is('two-players-online') && PLAYER_B.turn)
			return;
			
		if(!Play.trainingMode)
			if(Mode.is('single-player') && PLAYER_B.turn)
				return;
			
		await this.reset(false);
		
		let captures = false;
		this.possibleMoves.captures.forEach((move) => {
			// from coordinates
			let i = move.getFromRow();
			let j = move.getFromCol();
			let cell = $(`#table .cell[value='${i}${j}']`);
			cell.classList.add('helper_capture');
			captures = true;
		});
		
		if(captures && Setting.get('mandatory-capture') == 'on')
			Play.updateStatus('Mandatory capture!');
		else if(captures) 
			Play.updateStatus('Captures available!');
		
		if(Setting.get('helper') == 'only-captures' || Setting.get('mandatory-capture') == 'on' && captures) {
			if(this.possibleMoves.captures.length == 1) {
				// from coordinates
				let i = this.possibleMoves.captures[0].getFromRow();
				let j = this.possibleMoves.captures[0].getFromCol();
				let cell = $(`#table .cell[value='${i}${j}']`);
				setTimeout(() => {cell.click()}, 100);
			} 
				
			return;
		} 
			
		this.possibleMoves.moves.forEach((move) => {
			// from coordinates
			let i = move.getFromRow();
			let j = move.getFromCol();
			let cell = $(`#table .cell[value='${i}${j}']`);
			cell.classList.add('helper_move');
		});
	} 
	
	static async showPossibleMovesFrom () {
		if(Setting.get('helper') == 'off') 
			return;
			
		if(Mode.is('single-player') && PLAYER_B.turn)
			return;
			
		await this.reset(false);
		
		(this.possiblePaths || this.selected || []).forEach((move) => {
			// to coordinates
			let i = move.getToRow(); 
			let j = move.getToCol();
			let cell = $(`#table .cell[value='${i}${j}']`);
			cell.classList.add(move.isCapture()? 'helper_capture': 'helper_move');
		});
		
		if(this.selected)
			return;
			
		let captures = false;
		this.capturePaths.forEach((path) => {
			captures = true;
			for(let move of path) {
				// to coordinates
				let i = move.getToRow();
				let j = move.getToCol();
				let cell = $(`#table .cell[value='${i}${j}']`);
				cell.classList.add('helper_capture');
			} 
		});
		
		if(Setting.get('helper') == 'only-captures' || Setting.get('mandatory-capture') == 'on' && captures)
			return;
			
		this.moves.moves.forEach((move) => {
			// to coordinates
			let i = move.getToRow();
			let j = move.getToCol();
			let cell = $(`#table .cell[value='${i}${j}']`);
			cell.classList.add('helper_move');
		});
	} 
	
	static async showPathFor (moves, isHint = false) {
		await this.reset();
		
		moves.forEach((move, n) => {
			// from coordinates
			let i = move.getFromRow();
			let j = move.getFromCol();
			let cell = $(`#table .cell[value='${i}${j}']`);
				cell.classList.add(isHint && 'helper_move' || 'valid');
			
			// to coordinates
			i = move.getToRow();
			j = move.getToCol();
			cell = $(`#table .cell[value='${i}${j}']`);
			cell.classList.add(isHint && 'helper_move' || 'valid');
		});
	} 
	
	static markTrack (move) {
		if(Setting.get('helper') == 'off')
			return;
		
		// from coordinates
		let i = move.getFromRow();
		let j = move.getFromCol();
		let cell = $(`#table .cell[value='${i}${j}']`);
			cell.classList.add('valid');
			
		// to coordinates
		i = move.getToRow();
		j = move.getToCol();
		cell = $(`#table .cell[value='${i}${j}']`);
		cell.classList.add('valid');
	} 
	
	static reset (total = true) {
		[...$$('.cell.helper_move, .cell.helper_capture' + (total && ', .cell.valid' || ''))].forEach((cell) => {
			let classList = ['helper_move', 'helper_capture'];
			if(total)
				classList.push('valid');
			cell.classList.remove(...classList);
		});
	} 
} 