'use strict' 

/* Version: 25 */

class Updates {
	static version = "24.17.214.550";
	static updatesLog = new Map([
		["22.15.200.529", ["Added voice notes in the chat engine.", "Added delete and copy option for chat engine.", "Improved internal operations.", "Improved the AI thinking time.", "Fixed channel subscription error.", "Fixed more other errors."]], 
		["22.15.201.530", ["Fixed single player draw issue.", "Fixed fullscreen not changing orientation.", "Fixed game stats behind by a move.", "Added locking orientation in both primary and secondary."]], 
		["22.15.204.536", ["Fixed minor bags."]], 
		["22.15.205.537", ["Fixed minor bags."]], 
		["22.15.206.538", ["Fixed declining updated error.", "Fixed minor bags."]], 
		["22.15.209.540", ["Fixed channel subscription timeout issue.", "Removed showing captures helper for online opponent."]], 
		["22.15.209.541", ["Fixed out some issues."]], 
		["23.16.210.542", ["Added check for updates.", "Added support line.", "Added more apps option.", "Fixed out some issues."]], 
		["23.16.211.543", ["Improved internal operations."]], 
		["23.16.211.545", ["Fixed offline loading error."]], 
		["24.17.214.550", ["Fixed refresh error.", "Improved game difficulty.", "Fixed minor bugs."]], 
	]);
	static getDescription = (version) => {
		let versionDescription = "<ul>";
		if(!version) {
			for(let [key, value] of this.updatesLog.entries()) {
				if(key >= currentAppVersion) {
					versionDescription += `<li>Version: ${key}</li><ul>${value.map(desc => "<li>" + desc + "</li>").join("")}</ul>`;
				} 
			} 
		} 
		else {
			let value = this.updatesLog.get(version);
			value = !value? this.updatesLog.get(Array.from(this.updatesLog.keys())[0]): value;
			versionDescription += value.map(desc => "<li>" + desc + "</li>").join("");
		} 
		versionDescription += "</ul>";
		return versionDescription;
	} 
} 

/*Game object to store game details*/
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
    possibleWin: false, 
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

/*Player Object to store plyer details*/
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

/*Initializing players details*/
playerA.pieceColor = "White";
playerA.name = "You";
playerB.pieceColor = "Black";
playerB.name = "AI";

/*General Object to store other details when needed*/
const general = {
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

/*Zobrist hashing*/
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
		for(let i = 0; i < 10; i++) { /* 10 maximum board size*/
			this.table.push([]);
			for(let j = 0; j < 10; j++) {
				this.table[i].push([]);
				this.table[i][j] = this.generateRandom(6);
			} 
		} 
	} 
	static computeKey = (array) => {
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
		return key;
	} 
}

/*Transposition Table Heuristic*/
class TranspositionTable {
	static size = 2*((Game.boardSize/2*Game.boardSize)*2);
	static table = {};
	static store = (entry, fromOtherWorkers = false) => {
		let table = this.table[Game.version];
		let key = entry.key;
		let index = Number(key % BigInt(this.size));
		table[index] = entry;
	} 
	static lookUp = (state) => {
		let table = this.table[Game.version];
		if(!table) {
			this.table[Game.version] = new Array(this.size);
			table = this.table[Game.version];
		} 
		let key = ZobristHash.computeKey(state);
		let index = Number(key % BigInt(this.size));
		let entry = table[index];
		if(entry && entry.key == key) {
			return entry;
		} 
		return {key};
	} 
}