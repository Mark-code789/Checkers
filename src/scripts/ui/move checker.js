class MoveChecker {
	static capturePaths = [];
	static possiblePaths = null;
	static clicked = new Map();
	static moves = null;
	static selected = null;
	static completeMoveMaking = true;
	
	static async check (e) {
		if(!this.completeMoveMaking) 
			return;

		if(Play.trainingMode && e.isTrusted)
			return Notify.popUpNote('Training mode is on');
			
		this.completeMoveMaking = false;
			
		let cell = e.target;
		let piece = cell.children[0];
		let value = cell.getAttribute('value') || null;
		
		if(Mode.is('two-players-online') && PLAYER_A.turn)
			Channel.send({
				message: {
					title: "Moved", 
					content: {
						i: Play.board.getSize() - parseInt(value.split("")[0]) - 1, 
						j: Play.board.getSize() - parseInt(value.split("")[1]) - 1
					}
				}
			}); 
		
		let isValid = await this.isValid(piece, value);
		if(typeof isValid == "string") {
			switch(isValid) {
				case 'invalid':
					if(e.isTrusted) {
						this.markCellInvalid(cell);
						Notify.popUpNote('Opponent piece');
					} 
					break;
			
				case 'wrong turn':
					if(e.isTrusted) {
						this.markCellInvalid(cell); 
						Notify.popUpNote('Not your turn');
					} 
					break;
			
				case 'movable':
					if(Mode.is('single-player', 'two-players-online') && PLAYER_B.turn && e.isTrusted) {
						this.markCellInvalid(cell);
						Notify.popUpNote('Opponent piece');
					} 
					else {
						this.markCellValid(cell);
						Helper.showPossibleMovesFrom(value); 
					} 
					break;
				
				case 'unmovable':
				case 'mandatory capture':
					this.markCellInvalid(cell);
					break;
			} 
		} 
		else {
			if(Mode.is('single-player', 'two-players-online') && PLAYER_B.turn && e.isTrusted) {
				this.completeMoveMaking = true;
				return this.markCellInvalid(cell);
			} 
				
			let index = isValid;
			
			if(index == undefined || !~index) {
				this.completeMoveMaking = true;
				return this.markCellInvalid(cell);
			}
			else {
				Helper.showPossibleMovesFrom(value);  
			} 
			
			let complete = await MovePlayer.play(index);
			if(complete) {
				this.moves = null;
				this.selected = null;
				this.possiblePaths = null;
				this.capturePaths = [];
				
				let gameIsOver = Play.board.isGameOver();
				if(gameIsOver) 
					Play.end(gameIsOver);
				else
					Bot.makeMove();
			} 
		} 
		
		this.completeMoveMaking = true;
	} 
	
	static disableBoard () {
		$(".board").classList.add("disabled");
	} 
	
	static enableBoard () {
		$(".board").classList.remove("disabled");
	} 
	
	static pieceIsFor (piece) {
		return Player.getPlayerFrom(piece);
	} 
	
	static checkPlayerTurn (player) {
		return player.turn;
	} 
	
	static findMovesFrom (i, j) {
		let possibleMoves = Play.board.getLegalMoves();
		
		return possibleMoves.reduce((moves, move) => {
			if(move.getFromRow() == i && 
			   move.getFromCol() == j && 
			   move.isCapture())
				moves.captures.push(move);
			else if(move.getFromRow() == i && 
					move.getFromCol() == j) 
				moves.moves.push(move);
				
			return moves;
		}, {moves: [], captures: []});
	} 
	
	static async isValid (piece, value) {
		let i = parseInt(value.split('')[0]);
		let j = parseInt(value.split('')[1]);
		
		if(this.moves) {
			let closest = {diff: Infinity};
			this.clicked.set(value, {i, j});
			this.possiblePaths = [];
			let index = -1;
			
			if(this.selected) {
				this.findPossiblePaths();
				index = this.selected.findIndex((move) => move.getToRow() == i && move.getToCol() == j);
				if(Boolean(~index))
					return index;
			} 
			
			let prev = this.selected;
			this.selected = this.capturePaths.reduce((found, path) => {
				let n = -1; 
				let p = [...this.clicked.values()].every(({i, j}) => {
					let m = path.findIndex((move) => move.getToRow() == i && move.getToCol() == j);
						
					if(Boolean(~m) && m > n) {
						n = m;
						return true;
					}
						
					return false;
				});
				
				if(p) 
					this.possiblePaths.push(...path);
				
				if(p && (index == -1 || index > n)) {
					this.clearPath(prev, path); 
					found = path;
					index = n;
				} 
				
				n = path.findIndex((move) => move.getToRow() == i && move.getToCol() == j);
				
				if(Boolean(~n) && closest.diff > path.length - n) {
					closest.diff = path.length - n;
					closest.path = path;
					closest.index = n;
				} 
					
				return found;
			}, null);
			
			if(!~index && closest.path) {
				this.clearPath(prev, closest.path); 
				this.clicked = new Map([[value, {i, j}]]);
				this.selected = closest.path;
				index = closest.index;
				
				this.findPossiblePaths();
			} 
			
			if(Setting.get('mandatory-capture') == 'on' && this.capturePaths.length && !piece)
				return index;
				
			if(!this.selected)
				this.selected = this.moves.moves.find((move, n) => {
					let isThis = move.getToRow() == i && move.getToCol() == j || false;
					index = isThis? 0: index;
					return isThis;
				});
				
			this.selected = Array.isArray(this.selected)? this.selected: this.selected? [this.selected]: null;
			
			if(!piece)
				return index;
		} 
		if(piece) {
			this.clicked = new Map();
			let player = this.pieceIsFor(piece);
			
			if(!player || Mode.is('single-player', 'two-players-online') && !player.is(PLAYER_A) && PLAYER_A.turn) 
				return 'invalid';
				
			let isPlayersTurn = this.checkPlayerTurn(player);
			
			if(!isPlayersTurn) 
				return 'wrong turn';
				
			let moves = Play.board.getLegalMoves();
			
			moves = moves.some((move) => move.getFromRow() == i || 
										 move.getFromCol() == j);
										 
			if(!moves && Setting.get('mandatory-capture') == 'on') 
				return 'mandatory capture';
			
			this.moves = await this.findMovesFrom(i, j);
			
			if(this.moves.captures.length) {
				this.capturePaths = await Play.board.findCapturePaths(player, i, j);
			} 
				
			return this.moves.moves.length + this.moves.captures.length? 'movable': 'unmovable';
		} 
	} 
	
	static async isMultipleCaptures (move) {
		if(!move.isCapture())
			return false;
			
		let player = Player.getPlayerFrom(Player.whoseTurn());
		let i = move.getFromRow();
		let j = move.getFromCol();
		
		this.capturePaths = await Play.board.findCapturePaths(player, i, j);
		return this.capturePaths.length > 1;
	} 
	
	static async isComplete (index) {
		return index == this.selected.length - 1;
	} 
	
	static findPossiblePaths () {
		this.capturePaths.forEach((path) => {
			let n = -1; 
			let p = this.clicked.values().every(({i, j}) => {
				let m = path.findIndex((move) => move.getToRow() == i && move.getToCol() == j);
					
				if(Boolean(~m) && m > n) {
					n = m;
					return true;
				}
					
				return false;
			});
			
			if(p) 
				this.possiblePaths.push(...path);
		});
	} 
	
	static clearPath (prev, current) {
		if(!prev) 
			return;
			
		prev.forEach((move) => {
			let i = move.getToRow();
			let j = move.getToCol();
			
			if(current.some((move) => move.getToRow() == i && move.getToCol() == j)) 
				return;
			
			let cell = $(`.cell[value='${i+""+j}']`);
			let piece = cell.$('.incomplete_move');
			cell.classList.remove('cell_disabled'); 
			
			if(piece) {
				piece.remove(); 
			} 
		})
	} 
	
	static markCellValid (cell) {
		[...$$('.cell.valid, .cell.invalid, .cell.helper_move, .cell.helper_capture')].forEach((cell) => {
			cell.classList.remove('valid', 'invalid', 'helper_move', 'helper_capture');
		});
		
		cell.classList.add('valid');
	} 
	
	static markCellInvalid (cell) {
		/*[...$$('.cell.valid, .cell.invalid, .cell.helper_move, .cell.helper_capture')].forEach((cell) => {
			cell.classList.remove('valid', 'invalid', 'helper_move', 'helper_capture');
		});*/
		
        void cell.offsetWidth;
        cell.classList.add("invalid");
        
        setTimeout(() => {
			cell.classList.remove("invalid");
		}, 750);
		
		if(Play.board.getCaptures().length && Setting.get('mandatory-capture') == 'on') {
			if(Mode.is('two-players-offline') || PLAYER_A.turn)
				Notify.popUpNote('You must capture');
				
			/*Play.board.getCaptures().forEach((move) => {
				let i = move.getFromRow();
				let j = move.getFromCol();
				let cell = $(`#table .cell[value='${i}${j}']`);
				cell.classList.add('helper_capture');
			});*/
		} 
	} 
	
	static setMove (move) {
		this.selected = move;
	} 
	
	static setPossibleMoves (moves) {
		this.possibleMoves = moves;
	} 
	
	static hasMoves () {
		return Boolean(Play.board.getLegalMoves().length);
	} 
	
	static reset () {
		this.possibleMoves = {moves: [], captures: []};
		this.capturePaths = [];
		this.moves = null;
		this.selected = null;
		MovePlayer.playedMoves = [];
	} 
}
