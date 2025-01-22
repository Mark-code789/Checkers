class ZobristHash {
	static table = [];
	static generateRandom (n) {
		return window.crypto.getRandomValues(new BigUint64Array(n));
	} 
	static index (id) {
		let index = -1;
		switch (id) {
			case -1:
			index = 0;
			break;
			
			case 0: // Player B king
			index = 1;
			break;
			
			case 1: // Player A king
			index = 2;
			break;
			
			case 2: // Player B piece
			index = 3;
			break;
			
			case 3: // Player A piece
			index = 4;
			break;
			
			default:
			index = 5;
		} 
		return index;
	} 
	static init (size) {
		this.table = [];
		for(let i = 0; i < size; i++) { /* 10 maximum board size*/
			this.table.push([]);
			for(let j = 0; j < size; j++) {
				this.table[i].push([]);
				this.table[i][j] = this.generateRandom(6);
			} 
		} 
	} 
	static getTable () {
		return this.table;
	}
	static setTable (table) {
		this.table = table;
	}
	static async toJSON () {
		let table = await this.serialize(this.table);
		return table;
	}
	static async fromJSON (table) {
		if(!table)
			return;
			
		table = await this.deserialize(table);
		this.table = table;
	} 
	static async serialize (table) {
		let copy = new Array(table.length);
		for(let i = 0; i < table.length; i++) {
			let item = table[i];
			
			if(Array.isArray(item) || item instanceof BigUint64Array) 
				copy[i] = await this.serialize(item);
			else {
				copy[i] = item.toString();
			} 
		} 
		
		return copy;
	} 
	static async deserialize (table) {
		let copy = new Array(table.length);
		for(let i = 0; i < table.length; i++) {
			let item = table[i];
			if(Array.isArray(item)) 
				copy[i] = await this.deserialize(item);
			else {
				if(!(copy instanceof BigUint64Array))
					copy = new BigUint64Array(table.length);
				copy[i] = BigInt(item);
			} 
		} 
		
		return copy;
	} 
	static computeHash (board) {
		let size = board.getSize();
		let hash = 0n;

		for(let i = 0; i < size; i++) {
			for(let j = 0; j < size; j++) {
				let id;
				let piece = board.getPiece(i, j);
				if(piece != undefined) {
					let player = board.getPlayerAt(i, j);
					let king = board.isKing(i, j);
					id = player == PLAYER_A.id? (king? 1: 3):
						 player == PLAYER_B.id? (king? 0: 2): 0;
				}

				let index = this.index(id); 
				if(Boolean(~index)) 
					hash ^= this.table[i][j][index];
			}
		}
		
		return hash;
	} 
}