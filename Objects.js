// Game object to store game details 
const Game = {
    mode: "single-player",
    version: "american",
    versions: {american: [{score: 3, validForHint: true}],
               kenyan: [{score: 3, validForHint: true}],
               casino: [{score: 3, validForHint: true}],
               international: [{score: 3, validForHint: true}],
               pool: [{score: 3, validForHint: true}],
               russian: [{score: 3, validForHint: true}],
               nigerian: [{score: 3, validForHint: true}]
               }, 
    boardSize: 8,
    rowNo: 3,
    level: 0,
    baseStateCount: 1,
    drawStateCount: 0,
    hintCount: 0,
    undoCount: 0,
    path: {index: 0},
    isComputer: false, 
    pieceSelected: false, 
    thinking: false,
    alternatePlayAs: false, 
    whiteTurn: false,
    mandatoryCapture: true, 
    helper: true, 
    capturesHelper: false, 
    over: false, 
    validForHint: true, 
    prop: null, 
    levels: [{level: "BEGINNER LEVEL", validForHint: true, score: 0}, 
             {level: "EASY LEVEL", validForHint: true, score: 0}, 
             {level: "MEDIUM LEVEL", validForHint: true, score: 0}, 
             {level: "HARD LEVEL", validForHint: true, score: 0}, 
             {level: "ADVANCED LEVEL", validForHint: true, score: 0}, 
             {level: "EXPERT LEVEL", validForHint: true, score: 0}, 
             {level: "CANDIDATE MASTER", validForHint: true, score: 0}, 
             {level: "MASTER LEVEL", validForHint: true, score: 0}, 
             {level: "GRAND MASTER", validForHint: true, score: 0}], 
    state: [], 
    baseState: [], 
    moves: {}, 
    track: [], 
    stats: []
} 

// Player Object to store plyer details 
const Player = function () {
    this.name = "";
    this.pieces = (Game.boardSize / 2) * Game.rowNo;
    this.pieceColor = "";
    this.kings = 0;
    this.moves = 0;
    this.captures = 0;
    this.longestCapture = 0;
} 
const playerA = new Player();
const playerB = new Player();

// Initializing players details 
playerA.pieceColor = "White";
playerA.name = "You";
playerB.pieceColor = "Black";
playerB.name = "AI";

// General Object to store other details when needed
var general = {
    orientation: 'natural',
    initialLoading: true,
    fullscreenSupport: false,
    fullscreen: false, 
    default: "linear-gradient(rgba(0, 152, 25, 0.9), rgba(0, 112, 0, 0.9))", 
    disabled: "linear-gradient(rgba(110, 110, 110, 0.9), rgba(70, 70, 70, 0.9))", 
    background: "linear-gradient(rgba(40, 40, 40, 0.9), rgba(0, 0, 0, 0.9))", 
    selected: "", 
    level: "",
    sorted: [], 
    helperPath: [], 
    aiPath: []
}

// Zobrist hashing
class ZobristHash {
	static table = [];
	static generateRandom = (n) => {
		return window.crypto.getRandomValues(new BigUint64Array(n));
	} 
	static index = (piece) => {
		let index = -1;
		switch (piece) {
			case "MB":
			index = 0;
			break;
			
			case "KB":
			index = 1;
			break;
			
			case "MW":
			index = 2;
			break;
			
			case "KW":
			index = 3;
			break;
			
			case "EC":
			index = 4;
			break;
			
			case "IP":
			index = 5;
			break;
		} 
		return index;
	} 
	static initTable = () => {
		this.table = [];
		for(let i = 0; i < 10; i++) { // 10 maximum board size
			this.table.push([]);
			for(let j = 0; j < 10; j++) {
				this.table[i].push([]);
				this.table[i][j] = this.generateRandom(6);
			} 
		} 
	} 
	static computeKey = (array, color) => {
		let key = 0n;
		for(let i = 0; i < Game.boardSize; i++) {
			for(let j = 0; j < Game.boardSize; j++) {
				let piece = array[i][j];
				let index = this.index(piece);
				if(Boolean(~index)) {
					key ^= this.table[i][j][index];
				} 
			} 
		} 
		if(color == 1) key ^= this.table[1][1][1];
		else if(color == -1) key ^= this.table[0][0][0];
		return key;
	} 
}

// Transposition Table Heuristic
class TranspositionTable {
	static size = 2*((Game.boardSize/2*Game.boardSize)*2);
	static table = new Array(this.size);
	static store = (entry, fromOtherWorkers = false) => {
		entry.version = Game.version;
		let key = entry.key;
		let index = Number(key % BigInt(this.size));
		this.table[index] = entry;
	} 
	static lookUp = (state, color) => {
		let key = ZobristHash.computeKey(state, color);
		let index = Number(key % BigInt(this.size));
		let entry = this.table[index];
		if(entry && entry.key == key && entry.version == Game.version) {
			return entry;
		} 
		return {key, version: Game.version};
	} 
}