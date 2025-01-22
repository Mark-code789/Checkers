class TranspositionTable {
	static table = [];
	
	static setTable (table) {
		this.table = table;
	}
	static getTable () {
		return this.table;
	}
	static store (entry) {
		let size = Board.getSize();
		let table = this.table[Version.getVersion()];
		let key = entry.key;
		let index = Number(key % BigInt(size));
		table[index] = entry;
	} 
	static lookUp (board) {
		let size = Board.getSize();
		let table = this.table[Version.getVersion()];
		if(!table) {
			this.table[Version.getVersion()] = new Array(size);
			table = this.table[Version.getVersion()];
		} 
		let key = ZobristHash.computeKey(board);
		let index = Number(key % BigInt(size));
		let entry = table[index];
		if(entry && entry.key == key) {
			return entry;
		} 
		return {key};
	} 
}