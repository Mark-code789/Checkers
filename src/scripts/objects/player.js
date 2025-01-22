class Player {
	name = "";
	pieceColor = "";
	direction = "";
	maskColor = 0;
	pieces = 0;
	kings = 0;
	moves = 0;
	captures = 0;
	longestCapture = 0;
	capturesHistory = [];
	turn = false;
	id = 2;
	#mask = {
		'White': '10',
		'Black': '01'
	};
    
	constructor (obj) {
		this.name = obj.name || "";
		this.pieceColor = obj.pieceColor || "";
		this.maskColor = obj.maskColor || 0;
		this.pieces = obj.pieces || 0;
		this.kings = obj.kings || 0;
		this.moves = obj.moves || 0;
		this.captures = obj.captures || 0;
		this.longestCapture = obj.longestCapture || 0;
		this.direction = obj.direction;
		this.id = obj.id;
	} 
	
	static reset () {
		PLAYER_A.pieces = PLAYER_B.pieces = 0;
		PLAYER_A.moves = PLAYER_B.moves = 0;
		PLAYER_A.kings = PLAYER_B.kings = 0;
		PLAYER_A.captures = PLAYER_B.captures = 0;
		PLAYER_A.longestCapture = PLAYER_B.longestCapture = 0;
		PLAYER_A.capturesHistory = PLAYER_B.capturesHistory = [];
	} 
	
	static setTurn (turn) {
		let player = this.getPlayerFrom(turn);
		player.turn = true;
		player = this.invert(player);
		player.turn = false;
	} 
	
	static changeTurn () {
		let player = this.getPlayerFrom(this.whoseTurn());
		player.turn = false;
		player = this.invert(player);
		player.turn = true;
	} 
	
	static changeMovesCount (factor = 1) {
		let player = this.getPlayerFrom(this.whoseTurn());
		player.moves += factor;
	} 
	
	static changeKingsCount (factor = 1) {
		let player = this.getPlayerFrom(this.whoseTurn());
		player.kings += factor;
	} 
	
	static setPlayAs (playAs) {
		playAs = playAs.replace(/^\w/i, t => t.toUpperCase());
		PLAYER_A.pieceColor = playAs != 'Alternately' && playAs || (PLAYER_A.pieceColor.toLowerCase() == 'white' && 'Black' || 'White');
		PLAYER_B.pieceColor = PLAYER_A.pieceColor.toLowerCase() == 'white' && 'Black' || 'White';
	} 
	
	static setName (A_name, B_name) {
		PLAYER_A.name = A_name;
		PLAYER_B.name = B_name;
	} 
	
	static setPiecesCount (A_pieces = 0, B_pieces = 0) {
		PLAYER_A.pieces = A_pieces;
		PLAYER_B.pieces = B_pieces;
	} 
	
	static setKingsCount (A_kings = 0, B_kings = 0) {
		PLAYER_A.kings = A_kings;
		PLAYER_B.kings = B_kings;
	} 
	
	static setCaptures (captures, factor = 1) {
		let player = this.getPlayerFrom(this.whoseTurn());
		player.captures += captures * factor;
		player.capturesHistory.push(captures);
		player.longestCapture = Math.max(...player.capturesHistory);
	} 
    
    static getPlayerFrom (list) {
    	let player = null;
    	list = list instanceof Element && [...list.classList] || Array.isArray(list) && list || [list];
		for(let name of list) {
			player = name.toLowerCase().includes(PLAYER_A.pieceColor.toLowerCase()) && PLAYER_A ||
					 name.toLowerCase().includes(PLAYER_B.pieceColor.toLowerCase()) && PLAYER_B ||
					 null;
					
			if(player) 
				break;
		}
		
    	return player;
	} 
	
	static getPlayerFromId (id) {
		return PLAYER_A.id == id && PLAYER_A || PLAYER_B.id == id && PLAYER_B || null;
	} 
	
	static invert (player) {
		if(typeof player == 'string') 
			player = this.getPlayerFrom(player);
			
		return PLAYER_A.is(player) && PLAYER_B || PLAYER_A;
	} 
	
	static whoseTurn () {
		return PLAYER_A.turn && PLAYER_A.pieceColor.toLowerCase() || PLAYER_B.pieceColor.toLowerCase();
	} 
	
	static invertTurn () {
		return PLAYER_A.turn && PLAYER_B.pieceColor.toLowerCase() || PLAYER_A.pieceColor.toLowerCase(); 
	} 
	
	static madeMoves () {
		if(Mode.is('single-player', 'two-players-online')) 
			return Boolean(PLAYER_A.moves);
		else 
			return Boolean(PLAYER_A.moves + PLAYER_B.moves);
	} 
	
	addMovesCount () {
		this.moves++;
	} 
	
	reduceMovesCount () {
		this.moves--;
	} 
	
	addKingsCount () {
		this.kings++;
	} 
	
	reduceKingsCount () {
		this.kings--;
	} 
	
	getDirectionInt () {
		return this.direction == 'Up' && -1 || 1;
	} 
	
	pieceIs (...colors) {
		let mask = this.#mask[this.pieceColor];
		let index = mask.indexOf('1');
		let is = colors.some((color) => this.#mask[color].charAt(index) & '1');
		return Boolean(is);
	} 
	
	is (player) {
		return this.pieceColor == player.pieceColor
	} 
} 

const PLAYER_A = new Player({name: "You", pieceColor: "White", direction: 'Up', id: 3});
const PLAYER_B = new Player({name: "AI", pieceColor: "Black", direction: 'Down', id: 2});