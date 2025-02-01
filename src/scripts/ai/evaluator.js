class Evaluator {
	value = {};
	getValue () {
		return this.value;
	} 
	async evaluateBoard (board) {
		let size = board.getSize();
		
		let half = size / 2;
		let valuation = {
			white: {
				pieces: 0,
				kings: 0,
				movable: {
					sides: 0,
					pieces: 0
				},
				criticalPos: {
					center: 0,
					kingsRow: 0,
				}
			}, 
			black: {
				pieces: 0,
				kings: 0,
				movable: {
					sides: 0,
					pieces: 0
				},
				criticalPos: {
					center: 0,
					kingsRow: 0,
				}
			}, 
			
		};
		
		for(let n = 0; n < board.getPiecesPerPlayer(); n++) {
			let pos = board.getPos(PLAYER_A.id, n);
			
			if(pos == -1) 
				continue; 
			
			let coord = board.posToCoord(pos);
			let piece = board.getPiece(...coord);
			let king = board.isKing(...coord)? 1: 0;
			
			let i, j, c, d, fl, fr, bl, br; 
			let isInCenter;
			
			c = PLAYER_A.pieceColor.toLowerCase();
			d = PLAYER_A.getDirectionInt();
			
			[i, j] = coord; 
			
			valuation[c].pieces += 1;
			valuation[c].kings += king;
			
			//isInCenter = (i-half == -1 || i-half == 0) && j-half >= -2 && j-half <= 1;
			//valuation[c].criticalPos.center += isInCenter && 1 || 0;
			
			fl = board.getCell(i+d, j-1) && !board.getPiece(i+d, j-1)? 1: 0;
			fr = board.getCell(i+d, j+1) && !board.getPiece(i+d, j+1)? 1: 0;
			
			valuation[c].movable.sides += fl + fr;
			valuation[c].criticalPos.kingsRow += i == size - 1? 1: 0;
			
			if(!king) {
				valuation[c].movable.pieces += fl + fr? 1: 0;  
				continue;
			} 
			
			bl = board.getCell(i-d, j-1) && !board.getPiece(i-d, j-1)? 1: 0;
			br = board.getCell(i-d, j+1) && !board.getPiece(i-d, j+1)? 1: 0;
			
			valuation[c].movable.sides += bl + br;
			valuation[c].movable.pieces += bl + br? 1: 0; 
		} 
		
		for(let n = 0; n < board.getPiecesPerPlayer(); n++) {
			let pos = board.getPos(PLAYER_B.id, n);
			
			if(pos == -1) 
				continue; 
			
			let coord = board.posToCoord(pos);
			let piece = board.getPiece(...coord);
			let king = board.isKing(...coord)? 1: 0;
			
			let i, j, c, d, fl, fr, bl, br; 
			let isInCenter;
			
			c = PLAYER_B.pieceColor.toLowerCase();
			d = PLAYER_B.getDirectionInt();
			
			[i, j] = coord; 
			
			valuation[c].pieces += 1;
			valuation[c].kings += king;
			
			//isInCenter = (i-half == -1 || i-half == 0) && j-half >= -2 && j-half <= 1;
			//valuation[c].criticalPos.center += isInCenter && 1 || 0;
			
			fl = board.getCell(i+d, j-1) && !board.getPiece(i+d, j-1)? 1: 0;
			fr = board.getCell(i+d, j+1) && !board.getPiece(i+d, j+1)? 1: 0;
			
			valuation[c].movable.sides += fl + fr;
			valuation[c].criticalPos.kingsRow += i == 0? 1: 0;
			
			if(!king) {
				valuation[c].movable.pieces += fl + fr? 1: 0;  
				continue;
			} 
			
			bl = board.getCell(i-d, j-1) && !board.getPiece(i-d, j-1)? 1: 0;
			br = board.getCell(i-d, j+1) && !board.getPiece(i-d, j+1)? 1: 0;
			
			valuation[c].movable.sides += bl + br;
			valuation[c].movable.pieces += bl + br? 1: 0; 
		} 
		this.value = valuation;
    } 
	
	evaluateDepth () {
		let valuation = this.value;
		let totalBlack = (valuation.black.pieces * 100) +
						 (valuation.black.kings * (Version.is('american')? 20: Version.is('kenyan', 'casino')? 25: 40)) +
						 (valuation.black.movable.sides * 0) + 
						 (valuation.black.movable.pieces * 0) + 
						 (valuation.black.criticalPos.center * 0) +
						 (valuation.black.criticalPos.kingsRow * 5);
						
		let totalWhite = (valuation.white.pieces * 100) +
						 (valuation.white.kings * (Version.is('american')? 20: Version.is('kenyan', 'casino')? 25: 40)) +
						 (valuation.white.movable.sides * 0) + 
						 (valuation.white.movable.pieces * 0) + 
						 (valuation.white.criticalPos.center * 0) + 
						 (valuation.white.criticalPos.kingsRow * 5);
						 
		let diff = totalBlack - totalWhite;
		return PLAYER_B.pieceIs('Black')? diff: diff * -1;
	} 
}