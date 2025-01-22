class MovePlayer extends MoveChecker {
	static path = {};
	static load = null;
	static hasAttainedRank = false;
	static repeat = false;
	static async play (index) {
		let i = this.selected[0].getFromRow();
		let j = this.selected[0].getFromCol();
		let cell = $(`#table .cell[value='${i}${j}']`);
		let piece = cell.lastElementChild;
		
		if(this.selected[0].isCapture()) {
			let isComplete = await MoveChecker.isComplete(index);
			if(!isComplete) {
				for(let n = 0; n <= index; n++) {
					let move = this.selected[n];
					i = move.getToRow();
					j = move.getToCol();
					cell = $(`#table .cell[value='${i}${j}']`);
					cell.classList.add('cell_disabled');
					if(n == index) {
						let placeholder = piece.cloneNode(true);
						placeholder.classList.add('incomplete_move');
						cell.appendChild(placeholder);
						break;
					} 
				}
				this.repeat = true;
				return false;
			} 
			Player.setCaptures(this.selected.length);
		} 
		
		await Play.board.move(this.selected);
		
		this.load = piece;
		await this.generatePath();
		await Transmitter.transmit();
		await this.playAudio();
		await this.complete(index);
		await Play.countPieces();
		await Player.changeMovesCount();
		await Player.changeTurn();
		await Helper.showPossibleMoves();
		await Timer.start();
		return true;
	} 
	
	static async undo () {
		await Player.changeTurn();
		
		let player = Player.getPlayerFrom(Player.whoseTurn());
		let move = await Play.board.move([], true);
		
		if(!move) {
			await Player.changeTurn();
			return;
		}
			
		await Helper.reset();
		
		move.forEach((move, a, arr) => {
			if(a+1 == arr.length) {
				let i = move.getFromRow();
				let j = move.getFromCol();
				let m = arr[0].getToRow();
				let n = arr[0].getToCol();
				let id = Player.whoseTurn();
				let isKing = move.isKing();
				let piece = $(`#table .cell[value='${m}${n}'] div`);
				let prevCell = $(`#table .cell[value='${i}${j}']`);
				
				if(!isKing && piece.classList.contains('crown_' + id)) 
					piece.classList.remove('crown_' + id);
				else if(isKing && !piece.classList.contains('crown_' + id)) 
					piece.classList.add('crown_' + id);
					
				prevCell.appendChild(piece);
			} 
			
			if(move.isCapture()) {
				let i = move.getCapturedRow();
				let j = move.getCapturedCol();
				let isKing = Play.board.isKing(i, j);
				let id = Player.invertTurn();
				let div = $$$('div', ['class', 'piece_' + id + (isKing && ' crown_' + id || '')]);
				let cell = $(`#table .cell[value='${i}${j}']`);
				cell.appendChild(div);
			} 
		});
		
		if(move[0].isCapture())
			await Player.setCaptures(move.length, -1);
			
		player.kings = Play.board.getPiecesCount()[player.id & 1];
		await Player.changeMovesCount(-1);
		await Helper.showPossibleMoves();
	} 
	
	static async complete (index) {
		await Helper.reset();
		
		this.selected.forEach((move, n) => {
			let piece;
			let i = move.getFromRow();
			let j = move.getFromCol();
			let cell = $(`#table .cell[value='${i}${j}']`);
				cell.classList.remove('cell_disabled');
				
			if(cell.lastElementChild)
				cell.removeChild(cell.lastElementChild);
				
			Helper.markTrack(move);
				
			if(!move.isCapture()) 
				return;
				
			i = move.getCapturedRow();
			j = move.getCapturedCol();
			cell = $(`#table .cell[value='${i}${j}']`);
			piece = cell.lastElementChild;
			piece.addEventListener('animationend', this.remove);
			piece.classList.add('captured');
		});
		
		this.repeat = false;
		this.load = null;
	} 
	
	static remove (event) {
		let piece = event.target;
		let cell = piece.parentElement;
		
		if(event.animationName != 'fade-out') 
			return;
			
		piece.removeEventListener('animationend', this.remove);
		cell.removeChild(piece);
	} 
	
	static async playAudio (step = false) {
		if(this.hasAttainedRank) 
			await AudioPlayer.play('king');
		else if(!step && this.selected[0].isCapture() && this.selected.length > 1) 
			await AudioPlayer.play('collect');
		else if(!step && this.selected[0].isCapture()) 
			await AudioPlayer.play('capture');
		else
			await AudioPlayer.play('click');
			
		MovePlayer.hasAttainedRank = false;
	} 
	
	static async generatePath () {
		let path = [];
		for(let move of this.selected) {
			//await Play.valuator.evaluateMove(Board.getBoard(), move, Player.whoseTurn(), false);
			if(!path.length) {
				path.push([[move.getFromRow(), move.getFromCol()], [move.getToRow(), move.getToCol()]]);
			} 
			else {
				let prev = path.slice(-1)[0];
				let factor = Math.abs(prev[0] - prev[1]);
				let diff = Math.abs(move.getToRow() - move.getToCol());
				if(diff != factor) {
					path.push([[move.getFromRow(), move.getFromCol()], [move.getToRow(), move.getToCol()]]);
				} 
			} 
		} 
		
		this.path = path;
	} 
}