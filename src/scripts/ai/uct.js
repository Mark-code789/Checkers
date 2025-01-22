class UCT {
	static MIN = -100_000_000;
	static MAX = 100_000_000;
	static nn = null; // neural network
	MATURITY_THRESHOLD = 100;
	MAXIMUM_HISTORY = 0;
	MAXIMUM_PLAYOUTS = 60;
	MAXIMUM_NN_INPUT_LENGTH = 64;
	td = {}; // training data
	nmoves = 0;
	history = [];

	static async nnToJSONFile () {
		let json = UCT.nn.toJSON();
		let hashTable = await ZobristHash.toJSON();
			json.hashTable = hashTable;
		let blob = new Blob([JSON.stringify(json)], {type: 'application/json'});
		let file = new File([blob], 'training data.json');
		return file;
	}
	static async nnToJSONString () {
		let json = UCT.nn.toJSON();
		let hashTable = await ZobristHash.toJSON();
			json.hashTable = hashTable;
			json = JSON.stringify(json);
		return json;
	}

	train (bestRate) {
		let nodes = Object.values(this.td);
		for(let node of nodes) {
			let rate = (node.score / node.visits) + (node.visits / 100_000);
			let hash = node.getHash();
			let score = rate > 0 && rate >= bestRate? 1: 0;
			let output = {};
				output[node.player] = score;
				output[node.opponent()] = score ^ 1;
			this.updateNet(hash, output);
		}
	} 

	updateNet (input, output) {
		let res = UCT.nn.train([{input, output}], {
			iterations: 100_000
		});
	}

	async neuralNetworkSearch (root, board) {
		let best = {
			score: -Infinity, 
			moves: [], 
		};
		for(let node of root.getChildren()) {
			let copy = board.copy();
			let winner = await node.play(copy);
			if(winner == node.player) {
				return node.move;
			}

			let input = copy.toData();

			let res = UCT.nn.run(input);
			let score = res[node.player] - res[node.opponent()] + res[1];
			let move = node.move;
			
			console.log(copy.toHash(), res);
			console.log(move.getFromRow(), move.getFromCol(), move.getToRow(), move.getToCol(), ' - ', score);
			if(/* score > 0.5 && */ score > best.score) {
				best.moves = [node.move];
				best.score = score;
			}
			else if(/* score > 0.5 &&  */score == best.score) {
				best.moves.push(node.move);
			}
		}

		if(best.moves.length) {
			let rand = Math.floor(Math.random() * best.moves.length);
			return best.moves[rand];
		}
		// Do noraml search
		return false;
	}
	
	async playout (board, m, n) {
		this.nmoves = 0;
		let winner = 0;
		let score = 0;
		
		while(this.nmoves++ < this.MAXIMUM_PLAYOUTS) {
			let res = await board.moveRandom(m, n);
			m = res.m;
			n = res.n;
			
			if(res.result) {
				winner = res.result;
				break;
			} 
		} 

		if(!winner) {
			score = board.evaluateScore();

			if(score > 0) 
				winner = PLAYER_B.id;
			if(score < 0) 
				winner = PLAYER_A.id;
		}
		
		return winner;
	}
	
	async run (board, turn, m, n) {
		let depth = 1;
		let winner = 0;
		let node = this.history[0];
		board = board.copy();
		Player.setTurn(turn);
		
		while (true) {
			this.nmoves = 0;
			if(!node.hasChildren()) {
				if(node.visits >= this.MATURITY_THRESHOLD) {
					await node.expand(board, m, n);
					
					if(!node.hasChildren()) {
						winner = node.opponent();
						this.history[depth++] = node;
						break;
					} 
					continue;
				} 
				winner = await this.playout(board, m, n, node);
				break;
			} 
			node = await node.findBestChild();
			this.history[depth++] = node;
			
			let {result, m: orgX, n: orgY} = await node.play(board, m, n, depth);
			[m, n] = [orgX, orgY];
				
			if(result) {
				winner = node.player;
				break;
			} 
		} 
		// console.log('Winner: ', winner, this.nmoves);
		for(let i = 0; i < depth; i++) {
			node = this.history[i];
			node.visits++;
			
			let score = winner == node.player? 1: winner == node.opponent()? -1: 0;
				node.score += score;
				/*score = score == -1? 0: score == 1? 1: 0;
			let output = {};
				output[node.player] = winner? score: 0;
				output[node.opponent()] = winner? score ^ 1: 0;
				output[1] = winner == 0? 1: 0;*/

			/*if(node.hasHash() && i == 1)
				this.updateNet(node.getHash(), output);*/
		} 
	} 
	
	async start (board, maxTime, trainingMode = false, m, n) {
		let currentPlayer = Player.whoseTurn();
		let root = new UCTNode(new Move(0), Player.getPlayerFrom(Player.invertTurn()).id);
		let copy = new UCTNode(new Move(0), Player.getPlayerFrom(Player.invertTurn()).id);
			await root.expand(board);
			await copy.expand(board);
			
			// root.children = root.children.slice(-2,-1);
			
		let startTime = Date.now();
		let elapsedTime = 0;
		let count = 2;
		
		this.history = [root];
		this.MAXIMUM_HISTORY = board.getArea();

		/* if(!trainingMode) {
			let neuralNetworkSearchResult = await this.neuralNetworkSearch(root, board);
						
			if(neuralNetworkSearchResult) {
				return neuralNetworkSearchResult;
			}
		} */
		
		while (true) {
			for(let i = 0; i < this.MATURITY_THRESHOLD; i++) {
				// console.log('-------------------------------------------', i);
				await this.run(board, currentPlayer, m, n);
			} 
				
			elapsedTime = Date.now() - startTime;
			if(self) 
				self.postMessage({action: 'uct-search-update', maxTime: maxTime, time: elapsedTime}); 
				
			if(elapsedTime >= maxTime) {
				count--;
				if(count < 1)
					break;
				else {
					startTime = Date.now();
					this.history = [copy];
				}
			}
		} 
		
		let best = {
			visits: -Infinity,
			score: -Infinity, 
			children: null, 
		};

		for(let i = 0; i < root.getChildren().length; i++) {
			let child = root.getChildren()[i];
			console.log('Score: ', child.score, copy.getChildren()[i].score);
			console.log('Visits: ', child.visits, copy.getChildren()[i].visits);

			child.score += copy.getChildren()[i].score;
			child.visits += copy.getChildren()[i].visits;
			console.log(child.score, child.visits);

			let childRate = (child.score / child.visits) + (child.visits / 100_000);
			let bestRate = (best.score / best.visits) + (best.visits / 100_000);
			
			bestRate = isNaN(bestRate)? -Infinity: bestRate;
			console.log(child.move.getFromRow(), child.move.getFromCol(),
						child.move.getToRow(), child.move.getToCol(),
						' - ', 
						child.visits,
						child.score,
						' - ', 
						childRate, 
						bestRate);
			
			// if(childRate > (isNaN(bestRate)? -Infinity: bestRate)) {
			if(child.visits > best.visits) {
				best.score = child.score;
				best.visits = child.visits;
				best.children = [child];
			}
			// else if(childRate == bestRate) {
			else if(child.visits == best.visits) {
				best.children.push(child);
			}

			// this.td[child.getHash()] = child;
		} 

		// Training
		// this.train((best.score / best.visits) + (best.visits / 100_000));
			
		// console.log('~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~');
		let rand = Math.floor(Math.random() * best.children.length);
		best = best.children[rand].move;
		return best;
	} 
}