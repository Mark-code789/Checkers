'use strict' 

self.importScripts(
	"./brain.js",
	"./uct.js",
	"./uct node.js", 
	"./negamax.js", 
	"./negascout.js", 
	"./evaluator.js", 
	"../board/board.js", 
	"../board/moves.js", 
	"../board/move.js",
	"../ui/setting.js", 
	"../ui/version.js", 
	"../objects/player.js", 
	"../objects/sleep.js",
	"../objects/zobrist hash.js",
);

var console = {
	error: (error) => {throw error}, 
	log: (...msg) => self.postMessage(msg), 
	info: (...msg) => self.postMessage(msg), 
	warn: (...msg) => self.postMessage(msg), 
};

class Element {}

self.addEventListener("message", async ({data}) => {
	try {
		if(data && data.action == "set-data") {
			PLAYER_A.pieceColor = data.player_a.pieceColor;
			PLAYER_B.pieceColor = data.player_b.pieceColor;
			Setting.setValue(data.settings);
			Version.setMask(data.versionsMask);
			Version.setVersion(data.version);
			ZobristHash.setTable(data.zobristTable);
			self.postMessage({action: 'done', workerId: data.workerId, type: 'set-data'});
		} 
		else if(data && data.action == 'set-training-data') {
			let res = await fetch('../objects/training data.json');
			if(!res.ok)
				throw new Error('Failed to load training data');
				
			UCT.nn = new brain.NeuralNetwork({});
			let trainedData = await res.json();
			if(!Object.keys(trainedData).length) 
				return self.postMessage({action: 'done', workerId: data.workerId});

			ZobristHash.fromJSON(trainedData.hashTable);
			delete trainedData.hashTable;
			UCT.nn.fromJSON(trainedData);
			self.postMessage({action: 'done', workerId: data.workerId});
		}
		else if(data && data.action == 'get-training-data') {
			let json = await UCT.nnToJSONString();
			self.postMessage({action: 'training-data', 'json': json});
		}
		else if(data && data.action == 'search') {
			Search.start(data.data, data.algorithm, data.workerId);
		} 
		else if(data && data.action == 'stop') {
			Search.stop();
		} 
	} catch (error) {
		self.postMessage({action: 'error', error: error.stack, workerId: data.workerId});
	} 
});



class Search {
	static algorithm;
	static async start (data, algorithm, workerId) {
		try {
			let moves = [];
			let player = null;
			let moveId = data.slice(-1)[0];
			let sign = data.slice(-2,-1)[0];
			let copy = data[0];
			let playAs = data[1];
			let depth = data[2];
			let color = data[3];
			let trainingMode = data[4];
			let turn = color == 1? PLAYER_B.pieceColor: PLAYER_A.pieceColor;
			let board = new Board(false); 
			
			this.algorithm = algorithm == 'Negascout'? new Negascout(board, depth):
							 algorithm == 'Negamax'? new Negamax(board, depth):
							 algorithm == 'UCT'? new UCT(): null;

			await board.setBoard(copy);
			await Player.setPlayAs(playAs, 'worker');
			await Player.setTurn(turn);
			player = Player.getPlayerFrom(Player.whoseTurn());
			
			if(/^(Negascout|Negamax)$/i.test(algorithm)) {
				moves = await board.findNewMovesFor(player);
			
				data.splice(0, 2, moves);
				data.splice(-2);
			} 
			
			let result = /^(Negascout|Negamax)$/i.test(algorithm)? await this.algorithm.start(...data):
						 await this.algorithm.start(board, depth, trainingMode, ...data.slice(5,7));
						
			result = /^(Negascout|Negamax)$/i.test(algorithm)? result * sign: result;
			
			if(/^(Negascout|Negamax)$/i.test(algorithm)) 
				self.postMessage({action: 'search-result', result, depthSearched: this.algorithm.depthSearched, workerId, moveId});
			else
				self.postMessage({action: 'uct-search-result', move: result.getIds(), workerId, moveId});
		} catch (error) {
			self.postMessage({action: 'error', error: error.stack, workerId});
		} 
	} 
	static stop () {
		this.algorithm.end();
	} 
} 
