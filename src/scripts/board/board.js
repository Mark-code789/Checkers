class Board {
	KING_ID = 4;
	BLACK_ID = 5;
	WHITE_ID = 6;
	WIN_SCORE = 100_000;
	state = {
		piecesPerPlayer: 0,
		rowsPerPlayer: 0,
		size: 0, 
		area: 0,
		grid: [], 
		pieces: [], 
		moves: [], 
	};
	
	drawStateCount = 0;
	baseStateCount = 0;
	baseState = [];
	
	movesMade = []; 
	capturedPieces = [];
	
	standard = [
		["NA", "KW", "NA", "EC", "NA", "EC", "NA", "EC"],
		["EC", "NA", "MB", "NA", "EC", "NA", "EC", "NA"],
		["NA", "EC", "NA", "EC", "NA", "MB", "NA", "EC"],
		["EC", "NA", "EC", "NA", "EC", "NA", "EC", "NA"],
		["NA", "MB", "NA", "MB", "NA", "EC", "NA", "EC"],
		["EC", "NA", "EC", "NA", "EC", "NA", "EC", "NA"],
		["NA", "EC", "NA", "EC", "NA", "EC", "NA", "EC"],
		["EC", "NA", "EC", "NA", "EC", "NA", "EC", "NA"] 

		/* ['EC', 'EC', 'EC', 'EC', 'EC', 'EC', 'EC', 'MB'],
		['MB', 'EC', 'MB', 'EC', 'EC', 'EC', 'EC', 'EC'],
		['EC', 'MB', 'EC', 'EC', 'EC', 'MB', 'EC', 'MB'],
		['EC', 'EC', 'EC', 'EC', 'EC', 'EC', 'MB', 'EC'],
		['EC', 'MW', 'EC', 'MW', 'EC', 'MB', 'EC', 'MW'],
		['MW', 'EC', 'EC', 'EC', 'EC', 'EC', 'EC', 'EC'],
		['EC', 'MB', 'EC', 'EC', 'EC', 'EC', 'EC', 'MW'],
		['EC', 'EC', 'MW', 'EC', 'MW', 'EC', 'MW', 'EC'], */
	];
	
	constructor (updatePieceColors = true) {
		let size = Version.is("international", "nigerian")? 10: 8;

		if(updatePieceColors)
			this.updatePieceColors();

		this.init(size);
		/*this.createFrom(this.standard);
		return;*/
		
		let key = 0;
		let {rowsPerPlayer} = this.state
		for(let i = 0; i < size; i++) {
			for(let j = 0; j < size; j++) {
				let isBlackCell = Version.is("nigerian") && (i % 2 == 0 && j % 2 == 0 || i % 2 == 1 && j % 2 == 1) ||
								 !Version.is("nigerian") && (i % 2 == 0 && j % 2 == 1 || i % 2 == 1 && j % 2 == 0);
				let isBlackPiece = isBlackCell && (PLAYER_B.pieceIs('Black') && i < rowsPerPlayer || PLAYER_A.pieceIs('Black') && i > rowsPerPlayer + 1);
				let isWhitePiece = isBlackCell && (PLAYER_B.pieceIs('White') && i < rowsPerPlayer || PLAYER_A.pieceIs('White') && i > rowsPerPlayer + 1);
				let player = i < rowsPerPlayer && PLAYER_B.id || PLAYER_A.id;
				let color = isBlackPiece? this.BLACK_ID: this.WHITE_ID;
				
				if(isBlackPiece || isWhitePiece)
					this.mapPiece(key, i, j, false, player, color);
				else if(isBlackCell) 
					this.state.grid[i * size + j] = 0;
					
				key += (isBlackPiece || isWhitePiece)? 1: 0;
			} 
		} 
	} 
	
	static getMaximumSize () {
		return 10;
	} 
	
	init (size) {
		this.state.rowsPerPlayer = (size - 2) >> 1;
		this.state.piecesPerPlayer = ((size - 2) >> 1) * (size / 2);
		this.state.grid = new Array( (size ** 2) + (this.state.piecesPerPlayer * 2) );
		this.state.moves = new Moves();
		this.state.size = size;
		this.state.area = size ** 2;
		this.state.pieces = [0, 0, this.state.piecesPerPlayer, this.state.piecesPerPlayer];
	} 
	
	updatePieceColors () {
		let playAs = Setting.get('play-as');
		Player.setPlayAs(playAs);
	} 
	
	createFrom (state) {
		let size = state.length;
		this.init(size);
		
		let whitePieces = 0;
		let whiteKings = 0;
		let blackKings = 0;
		let blackPieces = 0;
		let keyA = 0;
		let keyB = 0;
		for(let i = 0; i < size; i++) {
			for(let j = 0; j < size; j++) {
				let cell = state[i][j];
				
				if(cell == "MW" || cell == 'KW') {
					let player = PLAYER_A.pieceIs("White")? PLAYER_A.id: PLAYER_B.id;
					let key = player & 1? this.state.piecesPerPlayer + keyA: keyB;
					this.mapPiece(key, i, j, cell == 'KW', player, this.WHITE_ID);
					
					keyA += PLAYER_A.pieceIs('White')? 1: 0;
					keyB += PLAYER_B.pieceIs('White')? 1: 0;
					whiteKings += cell == "KW"? 1: 0;
					whitePieces += 1;
				} 
				else if(cell == "MB" || cell == "KB") {
					let player = PLAYER_A.pieceIs("Black")? PLAYER_A.id: PLAYER_B.id;
					let key = player & 1? this.state.piecesPerPlayer + keyA: keyB;
					this.mapPiece(key, i, j, cell == 'KB', player, this.BLACK_ID);
					
					keyA += PLAYER_A.pieceIs('Black')? 1: 0;
					keyB += PLAYER_B.pieceIs('Black')? 1: 0;
					blackKings += cell == "KB"? 1: 0;
					blackPieces += 1;
				} 
				else if(cell == "EC") 
					this.state.grid[i * size + j] = 0;
			} 
		} 
		
		this.state.pieces[0] = PLAYER_B.pieceIs('White')? whiteKings: blackKings;
		this.state.pieces[1] = PLAYER_A.pieceIs('White')? whiteKings: blackKings;
		this.state.pieces[2] = PLAYER_B.pieceIs('White')? whitePieces: blackPieces;
		this.state.pieces[3] = PLAYER_A.pieceIs('White')? whitePieces: blackPieces;
		
		for(let n = 0; n < this.state.piecesPerPlayer * 2; n++) {
			let pos = this.state.grid[this.state.area + n];
			if(!pos) 
			this.state.grid[this.state.area + n] = -1;
		} 
	} 
	
	mapPiece (key, row, col, isKing, player, color) {
		// Board area pieces are stored in bit string
		// Bits 0 - 1: Player ID
		//      2 - 8: Piece Color
		//      9 - 16: key
		let {size, area} = this.state;
		this.state.grid[row * size + col] = ((key << 16) | (color << 8) | player) | (isKing? this.KING_ID: 0);
		this.state.grid[area + key] = (row << 8) | col;
	} 
	
	coordToIndex (row, col) {
		return row * this.state.size + col;
	} 
	
	posToCoord (pos) {
		return [pos >> 8 & 0xFF, pos >> 0 & 0xFF];
	} 
	
	getArea () {
		return this.state.area;
	} 
	
	getPiece (row, col) {
		return this.state.grid[this.coordToIndex(row, col)];
	} 
	
	getPos (player, index) {
		let startIndex = this.state.area + ((player & 1) * this.state.piecesPerPlayer);
		return this.state.grid[startIndex + index];
	} 
	
	getPosAsBit (player, row, col) {
		if(row < 0 || row >= this.state.size ||
		   col < 0 || col >= this.state.size)
		   return 0;
		   
		let piece = this.getPiece(row, col);
		
		if(!piece)
			return 0;
		
		if((piece & 3) != player) {
			return 0;
		} 
		
		let key = this.getKey(piece);
		let pos = this.getPos(player, key);
		
		return pos === -1? 0: 1;
	} 
	
	getCell (row, col) {
		return row >= 0 && row < this.state.size &&
			   col >= 0 && col < this.state.size && 
			   (Version.is('nigerian') && 
			   (row % 2 == 0 && col % 2 == 0 || 
				row % 2 == 1 && col % 2 == 1) ||
			   !Version.is('nigerian') && (row % 2 == 0 && col % 2 == 1 ||
				row % 2 == 1 && col % 2 == 0))?
			   1: 0;
	} 
	
	getPlayerAt (row, col) {
		return this.getPiece(row, col) & 3;
	} 
	
	getKey (piece) {
		return piece >> 16 & 0xFF;
	}
	
	getColor (row, col) {
		return this.getPiece(row, col) >> 8 & 0xFF;
	} 
	
	getSize () {
		return this.state.size;
	} 
	
	getPiecesCount () {
		return this.state.pieces;
	} 
	
	getPieceMargin (winner) {
		let loser = winner ^ 1;
		return this.state.pieces[winner] - this.state.pieces[loser];
	} 
	
	getPiecesPerPlayer () {
		return this.state.piecesPerPlayer;
	} 
	
	getMovesMadeSize() {
		return this.movesMade.length;
	} 
	
	getBoard () {
		return this.state;
	}

	getWinner () {
		let pA = this.state.pieces[PLAYER_A.id];
		let pB = this.state.pieces[PLAYER_B.id];
		return pA == 0? PLAYER_B.id: pB == 0? PLAYER_A.id: 0;
	} 
	
	getMoves () {
		return this.state.moves;
	} 
	
	getNonCaptures () {
		return this.state.moves.moves;
	} 
	
	getCaptures () {
		return this.state.moves.captures;
	} 
	
	getLegalMoves () {
		let moves = this.state.moves;
		moves = Setting.get('mandatory-capture') == 'on' && moves.captures.length? 
				moves.captures: moves.captures.concat(moves.moves);
				
		return moves;
	} 
	
	setMoves (moves) {
		this.state.moves = moves;
	} 
	
	setBoard (board) {
		this.state = board;
	} 
	
	setPiece (row, col, piece) {
		this.state.grid[this.coordToIndex(row, col)] = piece;
	}
	
	setPos (row, col, piece) {
		let key = this.getKey(piece);
		this.state.grid[this.state.area + key] = row << 8 | col;
	}
	
	setKing (row, col, state) {
		let piece = this.getPiece(row, col);
		let player = piece & 3;
		piece = state? (piece | this.KING_ID): (piece ^ this.KING_ID);
		this.setPiece(row, col, piece);
		this.state.pieces[player & 1] += (state? 1: -1); // Update kings
	} 
	
	readdPiece (row, col, piece) {
		let player = piece & 3; // or 0x3
		this.setPiece(row, col, piece);
		this.setPos(row, col, piece);
		
		// If is king increament kings count
		if(piece & this.KING_ID)
			this.state.pieces[player & 1]++;
		
		this.state.pieces[player]++;
	}
	
	removePiece (row, col) {
		let piece = this.getPiece(row, col);
		let player = piece & 3; // or 0x3
		this.setPiece(row, col, 0);
		this.removePos(piece);
		
		// If is king decreament kings count
		if(piece & this.KING_ID)
			this.state.pieces[player & 1]--;
		
		this.state.pieces[player]--;
		return piece;
	} 
	
	removePos (piece) {
		let key = this.getKey(piece);
		this.state.grid[this.state.area + key] = -1;
	} 
	
	evaluateScore () {
		let result = ((this.state.pieces[0] * 5) + (this.state.pieces[2] * 2)) - 
			   	  ((this.state.pieces[1] * 5) + (this.state.pieces[3] * 2));
		
		return result;
	} 
	
	isKing (row, col) {
		return this.getPiece(row, col) & this.KING_ID;
	} 
	
	isBlack (row, col) {
		return this.getColor(row, col) == this.BLACK_ID;
	} 
	
	isWhite (row, col) {
		return this.getColor(row, col) == this.WHITE_ID;
	} 
	
	isCapturedKing () {
		return this.capturedPieces[0] & this.KING_ID;
	} 
	
	hasAttainedRank (i, j) {
		return this.movesMade[0].some((move) => move.getToRow() == i && move.getToCol() == j && move.isKing() && !move.wasKing());
	} 
	
	async findNewMovesFrom (player, i, j) {
		let moves = new Moves();
		await moves.find(player, this, i, j);
		moves = moves.list;
			
		return moves;
	}
	
	async findMovesFrom (player, i, j) {
		return this.state.moves.filter((move) => {
			let row = move.getFromRow();
			let col = move.getFromCol();
			return row == i && col == j;
		});
	} 
	
	async findMovesFor (player) {
		let moves = new Moves();
		await moves.populate(player, this);
		this.state.moves = moves.list;
	} 
	
	async findNewMovesFor (player) {
		let moves = new Moves();
		await moves.populate(player, this);
		return moves.list;
	} 
	
	copy () {
		let copy = new Board(false);
		let moves = {};
		moves.moves = this.getMoves().moves.map((move) => {
			return new Move(...move.getIds());
		});
		moves.captures = this.getMoves().captures.map((move) => {
			return new Move(...move.getIds());
		});
		copy.setBoard(structuredClone(this.getBoard()));
		copy.setMoves(moves);
		return copy;
	}
	
	isGameOver () {
		let hasMoves = MoveChecker.hasMoves();
		if(!hasMoves)
			return 2; // Win
			
		const A_PIECES = PLAYER_A.pieces;
		const B_PIECES = PLAYER_B.pieces;
		const A_KINGS = PLAYER_A.kings;
		const B_KINGS = PLAYER_B.kings;
		
		if(Level.getLevelAsInt() > 0 && 
		  (A_PIECES == B_PIECES && A_PIECES <= 2 || //Men draw scenario 
		   A_PIECES == A_KINGS && B_PIECES == B_KINGS && A_PIECES <= 6)) { // Kings scenario 
			if(this.drawStateCount >= 12) {
				this.drawStateCount = 0;
				return 1; // draw
			} 
			
			this.drawStateCount++;
		} 
		else if(PLAYER_B.turn && PLAYER_B.moves % 2 == 0) {
			const ID = PLAYER_B.pieceColor.toLowerCase();
			if(JSON.stringify(this.baseState) == JSON.stringify(this.state.grid)) {
				if(this.baseStateCount >= 2) {
					this.baseStateCount = 0;
					return 1; // draw
				} 
					
				this.baseStateCount++;
			} 
			else {
				this.baseState = structuredClone(this.state.grid);
				this.baseStateCount = 0;
			} 
		} 
			
		return 0;
	} 
	
	async findCapturePaths (player, i, j, path = [], d = 0, a = i, b = j, moves) {
		if(!moves) {
			moves = await this.findNewMovesFrom(player, i, j);
		}
		
		let continuous = false;
		let landingPos = [];
		
		for(let move of moves.captures) {
			let m = move.getToRow();
			let n = move.getToCol();

			if(d > 0 && m == a && n == b && !Version.is('american', 'kenyan', 'casino')) // start position
				continue;
			
			let length = path.length;
			let prev = length? path.slice(-1)[0]: [];
			
			if(!continuous) {
				prev.push(move);
				let index = length? length-1: 0
				path[index] = prev;
			} 
			else {
				prev = prev.slice(0, d);
				prev.push(move);
				path.push(prev);
			} 
			
			let more = await this.move(move, false, a, b); // make
			
			if(more.captures.length) {
				let p = JSON.stringify(path);
				path = await this.findCapturePaths(player, m, n, path, d+1, a, b, more);
				
				let add = p === JSON.stringify(path); // If there is no change add this move to the previous list
				
				landingPos = await this.updateLandingPos(landingPos, move, path.length-1, add); 
			} 
			else {
				landingPos = await this.updateLandingPos(landingPos, move, path.length-1, true);
			} 
			
			continuous = true;
			await this.move(move, true); // undo
		} 
		
		path = path.filter((_, index) => {
			return !landingPos.some(({remove}) => {
				return remove.some(({must, indexes}) => must && indexes.includes(index));
			});
		});
		
		return path;
	} 
	
	async enforceRules (move, undo = false) {
		let id = Player.whoseTurn();
		let player = Player.getPlayerFrom(id);
		let value = {moves: [], captures: []};
		
		let i = move.getToRow();
		let j = move.getToCol();
		
		let isKing = undo? move.isKing(): this.isKing(i, j);
		
		if(isKing) {
			if(!undo) {
				if(move.isCapture()) {
					value = await this.findNewMovesFrom(player, i, j);
				}
				
				move.setIsKing(true);
				move.setWasKing(true);
				this.movesMade[0].unshift(move);
			} 
			else if(!move.wasKing()) {
				let m = move.getFromRow();
				let n = move.getFromCol();
				move.setIsKing(false);
				this.setKing(m, n, false);
			}
				
			return value;
		} 
		
		if(PLAYER_A.is(player) && i == 0 || PLAYER_B.is(player) && i == this.state.size-1) {
			if(Version.is('casino', 'international', 'nigerian')) { // Continues uncrowned
				if(!move.isCapture()) {
					this.setKing(i, j, true);
				} 
				else {
					value = await this.findNewMovesFrom(player, i, j);
					if(!value.captures.length)
						this.setKing(i, j, true);
				} 
			} 
			else if(Version.is('russian')) { // Continues crowned
				this.setKing(i, j, true);
				if(move.capture) 
					value = await this.findNewMovesFrom(player, i, j); 
			} 
			else { // Stops
				this.setKing(i, j, true);
			} 
		} 
		else if(!undo && move.isCapture()) 
			value = await this.findNewMovesFrom(player, i, j);
		
		if(!undo) {
			move.setIsKing(this.isKing(i, j));
			move.setWasKing(false);
			this.movesMade[0].unshift(move);
		} 
			
		return value;
	} 
	
	async move (moves, undo = false, m, n) { // m and n are the starting point of a capture move
		moves = Array.isArray(moves)? moves: [moves];
		moves = undo? this.movesMade.shift(): this.movesMade.unshift([]) && moves;
		
		if(!moves) {
			return null;
		} 
		
		let more;
		// console.log(undo && 'Undoing...' || 'Making...');
		for(let move of moves) {
			let fromRow = move.getFromRow();
			let fromCol = move.getFromCol();
			let toRow = move.getToRow();
			let toCol = move.getToCol();
			let row = undo? toRow: fromRow;
			let col = undo? toCol: fromCol;
			let piece = this.getPiece(row, col);
			this.setPiece(row, col, 0);
			// console.log('Board move: ', fromRow, fromCol, toRow, toCol);
			row = undo? fromRow: toRow;
			col = undo? fromCol: toCol;
			this.setPiece(row, col, piece);
			this.setPos(row, col, piece);
			
			if(move.isCapture()) {
				row = move.getCapturedRow();
				col = move.getCapturedCol();
				
				if(undo) {
					this.readdPiece(row, col, this.capturedPieces.shift());
				}
				else {
					this.capturedPieces.unshift(this.removePiece(row, col));
				}
			} 
				
			more = await this.enforceRules(move, undo);
			more = await this.clean(more, m, n);
		} 
		
		// this.logBoard(this.state);
		// console.log(structuredClone(this.state.pieces)); 
		
		return undo? moves: more;
	} 
	
	async updateLandingPos (pos, move, index, add = false) {
		let m = move.getFromRow();
		let n = move.getFromCol();
		let a = move.getToRow();
		let b = move.getToCol();
		let dxA = m - a;
		let dyA = n - b;
		
		let landingIndex = pos.findIndex((p) => {
			let c = p.move.getToRow();
			let d = p.move.getToCol();
			
			let dxB = m - c;
			let dyB = n - d;
			
			// same direction have similar change in the direction
			return dxA / Math.abs(dxA) == dxB / Math.abs(dxB) &&
				   dyA / Math.abs(dyA) == dyB / Math.abs(dyB);
		});
		
		if(~landingIndex && add) 
			pos[landingIndex].remove.slice(-1)[0].indexes.push(index);
		else if(~landingIndex) {
			pos[landingIndex].remove.slice(-1)[0].must = true;
			if(pos[landingIndex].remove.slice(-1)[0].indexes.length) 
				pos[landingIndex].remove.push({must: true, indexes: []});
		} 
		else if(add) 
			pos.push({move, remove: [{must: false, indexes: [index]}]});
		else
			pos.push({move, remove: [{must: true, indexes: []}]});
			
		return pos;
	} 
	
	async clean (moves, m, n) {
		let {captures} = moves;
		
		if(!m && !n)
			return moves;
		
		captures = captures.filter((move) => {
			let c = move.getToRow();
			let d = move.getToCol();
			
			return m == c && n == d && Version.is('american', 'kenyan', 'casino') ||
				 !(m == c && n == d);
		});
		
		moves.captures = captures;
		return moves;
	}
	
	async moveRandom (m, n, ppa) {
		let player = Player.whoseTurn();
			player = Player.getPlayerFrom(player);
		let captures = this.getCaptures();
		let initialLength = captures.length;
		
		captures = captures.filter((move) => {
			let a = move.getToRow();
			let b = move.getToCol();
			return !(move.isCapture() && a == m && b == n);
		});
		
		this.state.moves.captures = captures;
		if(captures.length < initialLength && initialLength == 1) {
			Player.changeTurn();
			player = Player.getPlayerFrom(Player.whoseTurn());
			await this.findMovesFor(player);
		} 
		
		let moves = this.getLegalMoves();
		if(!moves.length) {
			m = undefined;
			n = undefined;
			return {result: Player.invert(player).id, m, n};
		}
		
		let rand = Math.floor(Math.random() * moves.length);
		let move = moves[rand]; 
		
		let more = await this.move(move, false, m, n);
		
		let winner = this.getWinner();
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
		
		player = Player.whoseTurn();
		player = Player.getPlayerFrom(player);
		await this.findMovesFor(player);
		
		return {result: 0, m, n};
	} 
	
	logBoard (board) {
		console.log('~~~~~~~~~~~~~~~~~~~~~~~~~~');
		let arr = [];
		for(let i = 1; i <= board.area; i++) {
			let piece = board.grid[i-1];
			let c = piece >> 8 & 0xFF;
			let str = piece == undefined && '  ' || 
					  piece == 0 && 'EC' || 
					  (piece & 4 && 'K' || 'M') + (c == this.BLACK_ID && 'B' || 'W');
			arr.push(str);
			if(i % (board.size - 0) == 0) {
				console.log(`[${Math.floor((i-1) / board.size)}]    `, arr);
				arr = [];
			} 
		} 
		console.log('~~~~~~~~~~~~~~~~~~~~~~~~~~');
	} 
	
	toHash () {
		let boardHash = ZobristHash.computeHash(this);
		return boardHash;
	} 
	
	toData () {
		let piecesA = [];
		let piecesB = [];
		let kingsA = [];
		let kingsB = [];
		
		let area = this.getArea();
		
		for(let i = 0; i < this.getSize(); i++) {
			for(let j = 0; j < this.getSize(); j++) {
				let piece = this.getPiece(i, j);
				
				if(piece == 0 || piece == undefined) {
					piecesA.push(0);
					piecesB.push(0);
					kingsA.push(0);
					kingsB.push(0);
				} 
				else {
					let key = this.getKey(piece);
					if(key < this.getPiecesPerPlayer()) {
						piecesB.push(1);
						piecesA.push(0);
						kingsA.push(0);
						
						if(this.isKing(i, j))
							kingsB.push(1);
						else 
							kingsB.push(0);
					} 
					else {
						piecesA.push(1);
						piecesB.push(0);
						kingsB.push(0);
						
						if(this.isKing(i, j))
							kingsA.push(1);
						else
							kingsA.push(0);
					} 
				} 
			} 
		} 
		
		let data = piecesB.concat(kingsB).concat(piecesA).concat(kingsA);

		return data;
	} 
}