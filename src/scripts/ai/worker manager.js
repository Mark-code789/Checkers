class WorkerManager {
	static workers = [];
	static pendingLoad = [];
	static result = [];
	static dormantWorkerIndex = [];
	static totalThreads = 0;
	static total = 0;
	static count = 0;
	static algorithm;
	static sleep;
	
	static init () {
		this.totalThreads = navigator.hardwareConcurrency || 4;
		this.totalThreads = this.totalThreads * 2 - 2;
        for(let n = 0; n < this.totalThreads; n++) {
        	let worker = new Worker("./src/scripts/ai/worker.js?v=" + Date.now());
        		worker.addEventListener('message', (e) => this.onMessage(e));
        		worker.addEventListener('error', (e) => this.onError(e));
        	this.workers.push(worker);
        	this.dormantWorkerIndex.push(n);
        } 
	} 
	
	static async setData () {
		this.sleep = new Sleep();
		this.workers.forEach(async (worker, n) => {
			await worker.postMessage({
				action: 'set-data', 
				workerId: n,
				player_a: PLAYER_A, 
				player_b: PLAYER_B, 
				settings: Setting.getValue(), 
				versionsMask: Version.getMask(),
				version: Version.getVersion(),
				zobristTable: ZobristHash.getTable(),
			});

			this.dormantWorkerIndex.shift();
		});

		await this.sleep.start();
	} 

	static async setTrainingData () {
		this.sleep = new Sleep();
		let index = this.dormantWorkerIndex.pop();
		let worker = this.workers[index];
		await worker.postMessage({
			action: 'set-training-data', 
			workerId: index,
		});

		this.uctWorkerIndex = index;
		await this.sleep.start();
	}
	static async getTrainingData () {
		this.sleep = new Sleep();
		let index = this.uctWorkerIndex;
		let worker = this.workers[index];
		await worker.postMessage({
			action: 'get-training-data', 
			workerId: index,
		});

		index = this.dormantWorkerIndex.indexOf(index);
		this.dormantWorkerIndex.splice(index, 1);
		return await this.sleep.start();
	}
	
	static async stop () {
		await this.workers.forEach(async (worker) => {
			await worker.postMessage({
				action: 'stop', 
			});
		});
	} 
	
	static async start (depth, algorithm, m, n) {
		let color = PLAYER_B.turn? 1: -1;
		let board = Play.board.getBoard(); 
		
		let moves = Play.board.getLegalMoves();
		this.moves = moves;
		this.result = []; 
		this.resetDormantWorkers();
		
		if(algorithm == Negamax || algorithm == Negascout) {
			let alpha = algorithm.MIN;
			let beta = algorithm.MAX;
				
			this.algorithm = algorithm == Negascout? 'Negascout': 'Negamax';
			
			for(let i = 0; i < moves.length; i++) {
				let move = moves[i];
				m = m != undefined? m: move.getFromRow();
				n = n != undefined? n: move.getFromCol();
				
				let more = await Play.board.move(move, false, m, n);
				
				if(more.captures && more.captures.length) {
					await this.search([board, PLAYER_A.pieceColor, depth-1, color, alpha, beta, m, n, color, 1, i]); 
				} 
				else {
					await this.search([board, PLAYER_A.pieceColor, depth-1, -color, -beta, -alpha, m, n, color, -1, i]); 
				} 
				
				move = await Play.board.move([], true, m, n);
			} 
		} 
		else if(algorithm == UCT) {
			await new Sleep().wait(1.5);
			this.algorithm = 'UCT';
			
			let maxTime = 5000; // 40000 / this.totalThreads;
			await this.search([board, PLAYER_A.pieceColor, maxTime, color, Play.trainingMode, m, n]);
		} 
	} 
	
	static async search (data) {
		let index = this.algorithm == 'UCT'? (() => {
			let index = this.dormantWorkerIndex.indexOf(this.uctWorkerIndex);
			this.dormantWorkerIndex.splice(index, 1);
			return this.uctWorkerIndex;
		})(): this.dormantWorkerIndex.pop();
		
		let worker = this.workers[index];
		
		if(!worker && !data)
			return;
		
		if(!worker) {
			this.pendingLoad.push(structuredClone(data));
			return;
		} 
		await worker.postMessage({
			action: 'search', 
			workerId: index, 
			algorithm: this.algorithm, 
			data
		});
	}
	
	static async onMessage ({data}) {
		if(typeof data == 'object' && data.action == "search-result") {
			let {workerId: index} = data;
			let {moveId, result, depthSearched: depth} = data;
			this.result.push({move: this.moves[moveId], result: result + depth});
			this.dormantWorkerIndex.unshift(index);
			
			if(this.onWorkComplete) 
				this.onWorkComplete({move: this.moves[moveId], result: result + depth}, this.result.length, this.moves.length);
			
			let load = this.pendingLoad.shift();
			
			if(load) 
				this.search(load);
			else if(this.result.length == this.moves.length && this.onDone) 
				this.onDone(this.result);
		} 
		else if(typeof data == 'object' && data.action == "uct-search-result") {
			let {workerId: index, move} = data;
			// return;
			this.dormantWorkerIndex.push(index); // Use the same worker
			this.onDone([{move: new Move(...move), result: 0}]);
		} 
		else if(typeof data == 'object' && data.action == "uct-search-update") {
			let {time, maxTime} = data;
			this.onWorkComplete({result: 0}, time, maxTime);
		} 
		else if(typeof data == 'object' && data.action == "training-data") {
			let {json, workerId} = data;
			this.dormantWorkerIndex.push(workerId);
			this.sleep.end(json);
		}
		else if(typeof data == 'object' && data.action == "done") {
			this.dormantWorkerIndex.push(data.workerId);

			if(this.dormantWorkerIndex.length == this.totalThreads) {
				this.dormantWorkerIndex.sort();
				this.sleep.end();
			}
		}
		else if(typeof data == 'object' && data.action == 'error') {
			console.error(data.error);
		} 
		else {
			console.log(...(Array.isArray(data) && data || [data]));
		} 
	} 
	
	static onError (error) {
		console.error(error.stack);
	} 

	static resetDormantWorkers () {
		for(let n = 0; n < this.totalThreads; n++) {
			if(!this.dormantWorkerIndex.includes(n)) 
				this.dormantWorkerIndex.unshift(n);
		}
	}
}
