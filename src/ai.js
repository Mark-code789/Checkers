'use strict' 

/* Version 22 */

function Copy (obj) {
    if(obj == undefined || obj == null)
        throw new Error("Argument object can not be undefined or null");
    return JSON.parse(JSON.stringify(obj));
} 

function Prms (value) {
    if(value == undefined || value == null)
        throw new Error("Argument object can not be undefined or null");
	return new Promise(resolve => {return resolve(value)});
} 



class AI {
	b = playerB.pieceColor.slice(0,1);
	a = playerA.pieceColor.slice(0,1);
	playerA = [0];
	playerB = [0];
	MAX = 100_000_000;
	MIN = -100_000_000;
	stop = false;
	workerValue = -1000000;
	
	constructor (prop) {
		if(prop.state != undefined && prop.state.length > 7 && prop.depth != undefined && prop.moves != undefined) {
	        this.state = Copy(prop.state);
	        this.depth = prop.depth + 1;
			this.depthSearched = this.depth;
	        this.moves = Copy(prop.moves);
        } 
        else {
            throw new Error("Possible error. Check your attributes passed to AI object arguments. <br>\n" + JSON.stringify(prop));
        } 
    } 
    
    
    evaluate = async (state) => {
        let aValue = 0;
		let bValue = 0;
        let aPieces = 0;
        let bPieces = 0;
        
        for(let i = 0; i < Game.boardSize; i++) {
            for(let j = 0; j < Game.boardSize; j++) {
                let piece = state[i][j];
                
                if(piece.includes(this.b)) { 
                	bPieces++;
                	bValue += 1000;
                	if(piece.includes("M")) {
                        if(i == 0)
                        	bValue += 1;
                    } 
                    if(piece.includes("K")) { 
                    	if(Game.version == "american") 
                    		bValue += 10;
                    	else if(/kenyan|casino/gi.test(Game.version))
                    		bValue += 15;
                    	else
                        	bValue += 20; 
                        
                        if(/american|kenyan|casino/gi.test(Game.version)) {
	                        if(i == Game.boardSize-1 && j == Game.boardSize-2 && state[i-1][j+1] == "EC") 
	                        	bValue += 1;
	                        else if(i == Game.boardSize-2 && j == Game.boardSize-1 && state[i+1][j-1] == "EC") 
	                        	bValue += 1;
	                        else if(i == 0 && j == 1 && state[i+1][j-1] == "EC")
	                        	bValue += 1;
	                        else if(i == 1 && j == 0 && state[i-1][j+1] == "EC") 
	                        	bValue += 1;
						} 
                    } 
                } 
                else if(piece.includes(this.a)) {
                	aPieces++;
                	aValue += 1000; 
                	if(piece.includes("M")) {
                        if(i == Game.boardSize-1) 
                        	aValue += 1;
                    }
                    if(piece.includes("K")) { 
                        if(Game.version == "american") 
                    		aValue += 10
                    	else if(Game.version == "kenyan" || Game.version == "casino") 
                    		aValue += 15;
                    	else
                        	aValue += 20; 
                        
                        if(/american|kenyan|casino/gi.test(Game.version)) {
	                        if(i == Game.boardSize-1 && j == Game.boardSize-2 && state[i-1][j+1] == "EC") 
	                        	aValue += 1;
	                        else if(i == Game.boardSize-2 && j == Game.boardSize-1 && state[i+1][j-1] == "EC") 
	                        	aValue += 1;
	                        else if(i == 0 && j == 1 && state[i+1][j-1] == "EC")
	                        	aValue += 1;
	                        else if(i == 1 && j == 0 && state[i-1][j+1] == "EC") 
	                        	aValue += 1;
						} 
                    } 
                } 
            } 
        } 
        
        let currentValue = bValue - aValue;
        this.playerA = [[aValue, aPieces]];
        this.playerB = [[bValue, bPieces]];
        
        return Prms(currentValue);
    } 
    
    move = async (state, move) => { 
        state = Copy(state);
        move = Copy(move);
        let i = parseInt(move.cell.slice(0,1)), 
            j = parseInt(move.cell.slice(1,2)),
            m = parseInt(move.empty.slice(0,1)),
            n = parseInt(move.empty.slice(1,2)),
            cap = move.capture, 
            continuousJump = [], 
            crowned = false, 
            id;
        let l = Game.boardSize;
        let cornerMoves = [[0,1,1,0], [1,0,0,1], [l-1,l-2,l-2,l-1], [l-2,l-1,l-1,l-2]];
            
        id = state[i][j];
        state[i][j] = "IP"; 
        if(id.includes("M") && (id.includes(playerA.pieceColor.slice(0,1)) && m === 0 || id.includes(playerB.pieceColor.slice(0,1)) && m === Game.boardSize - 1)) {
            id = id.replace("M", "K");
            crowned = true;
        } 
        
        if(cap != undefined) {
            let a = parseInt(cap.slice(0,1)), 
                b = parseInt(cap.slice(1,2));
			let captured = state[a][b];
            let color = captured.includes(this.b)? "playerB": "playerA";
        	let value = this[color].slice(-1)[0][0];
        	let pieces = this[color].slice(-1)[0][1];
        	--pieces;
        	
        	if(captured.includes("K")) {
        		value -= /american/gi.test(Game.version)? 1010: /kenyan|casino/gi.test(Game.version)? 1015: 1020;
        	} 
        	else {
        		value -= 1000;
        	} 
        	
        	this[color].push([value, pieces]);
                
            state[a][b] = "EC";
            id = crowned && /^casino|international|nigerian$/gi.test(Game.version)? id.replace("K", "M"): id;
            state[m][n] = id;
            
            if(!crowned || crowned && /^casino|international|nigerian|russian$/gi.test(Game.version)) {
	            continuousJump = await AssesMoves({i: m, j: n, state});
				continuousJump = continuousJump.captures;
				if(continuousJump.length == 0 && crowned) {
					id = id.replace("M", "K");
				} 
			} 
        }
        else {
        	let color = id.includes(this.b)? "playerA": "playerB";
        	let value = this[color].slice(-1)[0][0];
        	let pieces = this[color].slice(-1)[0][1];
        	this[color].push([value, pieces]);
        } 
        
        let color = id.includes(this.b)? "playerB": "playerA";
        let value = this[color].slice(-1)[0][0];
        let pieces = this[color].slice(-1)[0][1];
        
        if(crowned) {
        	value += /american/gi.test(Game.version)? 10: /kenyan|casino/gi.test(Game.version)? 15: 20;
        } 
        if(id.includes("M") && (i == 0 || i == Game.boardSize-1)) {
        	value -= 2;
        } 
        
    	if(/american|kenyan|casino/gi.test(Game.version)) {
    		let cornerMove;
			for(let move of cornerMoves) {
				if(move[0] == m && move[1] == n && id.includes("K") && /EC|IP/gi.test(state[move[2]][move[3]])) {
					cornerMove = {dir: "to", move};
					break;
				} 
				else if(move[0] == i && move[1] == j && /K/gi.test(state[move[2]][move[3]])) {
					cornerMove = {dir: "from", move};
					break;
				} 
				else if(move[0] == i && move[1] == j && id.includes("K") && /EC|IP/gi.test(state[move[2]][move[3]])) {
					cornerMove = {dir: "from"};
					break;
				} 
			}
			if(cornerMove) {
				if(cornerMove.dir == "to") {
					value += 10;
				} 
				else if(cornerMove.dir == "from" && !cornerMove.move) {
					value -= 10;
				} 
				else if(cornerMove.dir == "from") {
					let clr = state[cornerMove.move[2]][cornerMove.move[3]].includes(this.b)? "playerB": "playerA";
					if(clr != color) {
						let val = this[clr].slice(-1)[0][0] + 10;
						let pcs = this[clr].slice(-1)[0][1];
						l = this[clr].length-1;
						this[clr][l] = [val, pcs];
					} 
					else {
						value += 10;
					} 
				} 
			} 
    	} 
        
        this[color].push([value, pieces]);
        
        state[m][n] = id;
        return Prms({state, continuousJump});
        
    } 
    
    correct = (state) => {
        state = JSON.stringify(state);
        state = state.replaceAll(/\bIP\b/g, 'EC');
        return Prms(JSON.parse(state));
    } 
    
    negascout = async (moves, state, depth, color, alpha, beta, previousPlayer) => { 
    	if(this.stop) {
    		return 0;
    	}
    	let best = this.MIN;
    	this.depthSearched = Math.min(depth, this.depthSearched);
    	
    	let alphaOrig = alpha;
    	let ttEntry;
    	
    	
        /*if(depth < this.depth) {
			ttEntry = await TranspositionTable.lookUp(state);
	    	if(ttEntry.valid && ttEntry.depth <= depth) {
	    		
				
	    		if(ttEntry.flag == 0) {
					this.depthSearched = Math.min(this.depthSearched, ttEntry.depthSearched);
	    			return ttEntry.value;
				}
	    		else if(ttEntry.flag == -1) {
	    			alpha = Math.max(alpha, ttEntry.value);
				} 
	    		else if(ttEntry.flag == 1) {
	    			beta = Math.min(beta, ttEntry.value);
	    		} 
				
	    		if(alpha >= beta) {
					this.depthSearched = Math.min(this.depthSearched, ttEntry.depthSearched);
	    			return ttEntry.value;
				}
	    	} 
		} */
    
        if(!moves.length || depth === 0) {
        	let leafScore = !moves.length? (previousPlayer == 1? 1_000_000: -1_000_000): 0;
        	let bValue = this.playerB.slice(-1)[0][0];
        	let bPieces = this.playerB.slice(-1)[0][1];
        	let aValue = this.playerA.slice(-1)[0][0];
        	let aPieces = this.playerA.slice(-1)[0][1];
        	let score = bValue - aValue;
        	score = score + leafScore;
            return Prms(score * color); 
        } 
        else {
            let opp = color == 1? this.a: this.b;
            let you = color == 1? this.b: this.a;
            let cloneState;
            
            
            
            moves = color == 1? moves.reverse(): moves;
            moves = await this.sort(moves, state);
            
            for(let i = 0; i < moves.length; i++) {
            	let move = moves[i];
            	let value;
            	if(this.stop) {
					return 0;
				} 
            	cloneState = Copy(state);
            	let res = await this.move(cloneState, move); 
                    cloneState = res.state;
                
                /*await Log(depth);
                await LogState(cloneState);
                await Log(this.playerB.slice(-1)[0], this.playerA.slice(-1)[0]);*/
                if(res.continuousJump.length === 0) {
                	cloneState = await this.correct(cloneState); 
                    let moves2 = await AssessAll({id: opp, state: cloneState});
                    moves2 = Game.mandatoryCapture && moves2.captures.length > 0? moves2.captures: Game.mandatoryCapture && moves2.captures.length == 0? moves2.nonCaptures: moves2.captures.concat(moves2.nonCaptures);
					
					
					
					if(moves.indexOf(move) == 0) { 
						value = -await this.negascout(moves2, cloneState, depth-1, -color, -beta, -alpha, color); 
					} 
					else {
                    	value = -await this.negascout(moves2, cloneState, depth-1, -color, -alpha-1, -alpha, color); 
						
						if(value > alpha && value < beta) 
							value = -await this.negascout(moves2, cloneState, depth-1, -color, -beta, -alpha, color); 
					} 
				} 
				else {
					let moves2 = res.continuousJump;
					
					value = await this.negascout(moves2, cloneState, depth, color, alpha, beta, color);
				} 
				
				this.playerA.pop();
				this.playerB.pop();
				best = Math.max(value, best);
				alpha = Math.max(best, alpha);
				
				if(alpha >= beta) {
					break; 
				} 
            } 
            
			/*if(depth < this.depth) {
				ttEntry.value = best;
				if(best <= alphaOrig) 
					ttEntry.flag = 1; 
				else if(best >= beta) 
					ttEntry.flag = -1; 
				else
					ttEntry.flag = 0; 
				
				ttEntry.valid = true;
				ttEntry.depth = depth;
				ttEntry.depthSearched = this.depthSearched;
				await TranspositionTable.store(ttEntry);
			} */
            return Prms(best);
        } 
    } 
    
    workerMessage = async (e) => {
		if(e.data && e.data.type == "search-result") {
			this.workerValue = e.data.content.value;
			this.depthSearched = Math.min(this.depthSearched, e.data.content.depth);
			workerSleep.end();
		} 
		else {
			await Log(...e.data);
		} 
	} 
    
    findBestMove = async (state, moves) => {
        let color = (Game.whiteTurn && playerB.pieceColor === "White" || !Game.whiteTurn && playerB.pieceColor === "Black")? 1: -1; 
        let opp = color == 1? this.a: this.b;
        let you = color == 1? this.b: this.a;
        let idleSleep = await new Sleep('idle');
        let sleep = await new Sleep('search');
        let self = this;
        let count = 0;
        let bestValue = this.MIN;
        let bestPossibleMoves = [];
        let widthA, widthB;
        let idleWorkers = Array.from(workers.keys());
        let start = Date.now();
        for(let worker of workers) {
        	worker.onmessage = message;
        } 
        
        if(moves.length > 1 && this.depth > 1) { 
    		moves = color == 1? moves.reverse(): moves;
    		moves = await this.sort(moves, state);
    		
    		await search(state, moves, this.depth);
    		await sleep.start();
    		
			
			bestPossibleMoves = await this.filter(state, bestPossibleMoves, color);
			let random = Math.round(Math.random() * (bestPossibleMoves.length - 1));
	        let bestMove = bestPossibleMoves[random];
			
	        return bestMove;
		} 
		else if(moves.length > 1 && this.depth == 1) {
			let random = Math.round(Math.random() * (moves.length - 1));
	        let bestMove = moves[random];
	        return Copy(bestMove);
		} 
		else {
			return Copy(moves[0]);
		} 
		
		async function search (state, moves, depth) {
			let test = false;
			$("#play-window .footer_section").style.backgroundImage = "linear-gradient(to right, #00981988 5px, #0000 5px)";
			$("#play-window .middle_section .scene .board .face_bottom").style.backgroundImage = `linear-gradient(to right, #00981988 5px, #0000 5px), linear-gradient(to bottom, rgba(70,70,70,0.4), rgba(0,0,0,0.7)), var(--black-cell)`;
			for(let j = 0; j < moves.length; j++) {
    			let move = moves[j];
				if(!move) 
					break;
				/*if(move.cell == "10" && move.empty == "21") {}
				else continue;*/
				
				self.depthSearched = self.depth;
				let cloneState = Copy(state);
				let res = await self.move(cloneState, move); 
	                cloneState = res.state;
	            if(res.continuousJump.length === 0) {
	            	cloneState = await self.correct(cloneState); 
	                let moves2 = await AssessAll({id: opp, state: cloneState});
                	moves2 = Game.mandatoryCapture && moves2.captures.length > 0? moves2.captures: Game.mandatoryCapture && moves2.captures.length == 0? moves2.nonCaptures: moves2.captures.concat(moves2.nonCaptures);
					
					let data = [
						self.depth-1, 
						j, 
						moves2,
						cloneState,
						depth-1, 
						-color, 
						self.MIN, 
						self.MAX, 
						color, 
						false, 
						Game.mandatoryCapture, 
						Game.boardSize, 
						Game.version, 
						playerA.pieceColor, 
						playerB.pieceColor, 
						idleWorkers[0]
					]; 
					if(test) {
						
						let value = -await self.negascout(...data.slice(2,10));
						console.log(value, move, self.depth - self.depthSearched);
					} 
					else {
						workers[idleWorkers[0]].postMessage({type: "move-search", content: data});
						idleWorkers.shift();
					} 
				} 
				else {
					let moves2 = res.continuousJump;
					
					let data = [
						self.depth-1, 
						j, 
						moves2, 
						cloneState, 
						depth, 
						color, 
						self.MIN, 
						self.MAX, 
						color, 
						true, 
						Game.mandatoryCapture, 
						Game.boardSize, 
						Game.version, 
						playerA.pieceColor, 
						playerB.pieceColor,
						idleWorkers[0]
					]; 
					if(test) {
						let value = await self.negascout(...data.slice(2,10));
						console.log(value, move, self.depth - self.depthSearched);
					} 
					else {
						workers[idleWorkers[0]].postMessage({type: "move-search", content: data});
						idleWorkers.shift();
					} 
				} 
				if(idleWorkers.length == 0 && j < moves.length-1) {
					await idleSleep.start();
				}  
			} 
			if(count == moves.length)
				sleep.end();
		} 
        
        async function message (e) {
            if(e.data.type == "search-result") {
            	let value = e.data.content.value; 
            	let i = e.data.content.id; 
            	let j = e.data.workerID;
            	let move = moves[i];
            
            	count++;
            	
            	let section = $("#play-window .footer_section");
            	let faceBottom = $("#play-window .middle_section .face_bottom");
            	widthA = parseFloat(GetValue(section, "width"));
            	widthB = parseFloat(GetValue(faceBottom, "width"));
            	let finishedSize = (count * widthA / moves.length) + "px";
            	section.style.backgroundImage = "linear-gradient(to right, #00981988 " + finishedSize + ", #0000 " + finishedSize + ")";
            	finishedSize = (count * widthB / moves.length) + "px";
            	faceBottom.style.backgroundImage = `linear-gradient(to right, #00981988 ${finishedSize}, #0000 ${finishedSize}), linear-gradient(to bottom, rgba(70,70,70,0.4), rgba(0,0,0,0.7)), var(--black-cell)`;
            	
                if(bestValue <= value) {
	                if(bestValue < value) {
	                    bestValue = value;
	                    bestPossibleMoves.splice(0, bestPossibleMoves.length, move);
	                } 
	                else if(bestValue === value) {
	                    bestPossibleMoves.push(move);
	                } 
	            } 
	
				Game.possibleWin = Math.abs(bestValue) > 990_000? true: false;
	
				idleWorkers.push(j);
				
				if(idleSleep.running)
					idleSleep.end();
				
                if(workers.length == idleWorkers.length) {
                	section.style.backgroundImage = "none";
                	faceBottom.style.backgroundImage = `linear-gradient(to bottom, rgba(70,70,70,0.4), rgba(0,0,0,0.7)), var(--black-cell)`;
                	if(!idleSleep.running)
                		sleep.end();
                } 
            } 
            else if(e.data.type == "tt-entry") {
            	for(let worker of workers) {
            		if(i == workers.indexOf(worker)) continue;
            		worker.postMessage({type: "tt-entry", entry: e.data.entry});
            	} 
            } 
            else {
            	if(Array.isArray(e.data))
            		await console.log(...e.data);
            	else
                	await console.log(e.data);
                
            } 
        } 
    } 
    
    makeMove = async (returnable = false) => { 
    	Game.thinking = true;
        let state = Copy(this.state);
        let moves = this.moves;
		let bestMove = await this.findBestMove(state, moves);
        let i = parseInt(bestMove.cell.slice(0,1));
        let j = parseInt(bestMove.cell.slice(1,2));
        let m = parseInt(bestMove.empty.slice(0,1));
        let n = parseInt(bestMove.empty.slice(1,2));
        
        general.aiPath.push({i, j, m, n});
        
        if(bestMove.capture != undefined) {
            state = Copy(this.state);
            let id = state[i][j];
            let crowned = false;
            state[i][j] = "IP"; 
            if(!id.includes("K") && (id.includes(playerA.pieceColor.slice(0,1)) && m === 0 || id.includes(playerB.pieceColor.slice(0,1)) && m === Game.boardSize - 1)) {
                id = id.replace("M", "K");
                crowned = true;
            } 
            state[parseInt(bestMove.capture.slice(0,1))][parseInt(bestMove.capture.slice(1,2))] = "EC";
            
            moves = [];
            id = crowned && /^casino|international|nigerian$/gi.test(Game.version)? id.replace("K", "M"): id;
            state[m][n] = id;
            if(!crowned || crowned && /^casino|international|nigerian|russian$/gi.test(Game.version)) {
                moves = await AssesMoves({id, i: m, j: n, state});
                moves = moves.captures;
            } 
                
            if(moves.length > 0) {
                this.state = state;
                this.moves = moves;
                await this.makeMove(returnable);
                return;
            } 
            else if(crowned) {
            	id = id.replace("K", "M");
            } 
            state[m][n] = id;
        } 
        if(returnable) {
            Game.thinking = false;
            return;
        } 
        
        let table = $("#table");
		let preSelectedCells = $$("#table .valid, #table .pre_valid, #table .hint, .helper_empty, .helper_filled");
        for(let cell of preSelectedCells) { 
            cell.classList.remove("valid");
            cell.classList.remove("pre_valid");
            cell.classList.remove("hint");
            cell.classList.remove("helper_empty");
            cell.classList.remove("helper_filled");
        } 
        
        for(let cell of general.aiPath) {
            table.children[cell.i*Game.boardSize+cell.j].classList.add("valid");
            table.children[cell.m*Game.boardSize+cell.n].classList.add("valid");
        } 
    	
    	if($("#play-window").style.display == "grid") 
        await setTimeout( async () => {
        	let cell1 = general.aiPath[0];
        	let cell = table.children[cell1.i*Game.boardSize+cell1.j];
	        await ValidateMove({cell, i: cell1.i, j: cell1.j, isComputer: true});
        	for(let cell2 of general.aiPath) {
	            cell = table.children[cell2.m*Game.boardSize+cell2.n];
	            ValidateMove({cell, i: cell2.m, j: cell2.n, isComputer: true});
			} 
			general.aiPath = [];
        }, 250);
        this.moves = [];
        Game.thinking = false;
        return;
    } 
    
    sort = async (moves, state) => {
        moves = await Copy(moves);
        let captures = [];
        let kings = [];
        let ordinary = [];
        for(let move of moves) {
        	let a = parseInt(move.cell.slice(0,1));
    		let b = parseInt(move.cell.slice(1,2));
    		let m = parseInt(move.empty.slice(0,1));
    		let n = parseInt(move.empty.slice(1,2));
    		let opp = state[a][b].includes(this.b)? this.a: this.b;
        	if(move.capture) {
        		captures.push(move);
        	} 
        	else if(state[a][b].includes("K") && !/american|kenyan|casino/gi.test(Game.version)) {
				kings.push(move);
			} 
			else {
				let dist = Game.boardSize+1;
				for(let i = 0; i < Game.boardSize; i++) {
	    			for(let j = 0; j < Game.boardSize; j++) {
	    				if(state[i][j].includes(opp) && (a - m) * (a - i) >= 0 || state[i][j] == "K" + opp) { 
							if(j >= n - Math.abs(m - i) && j <= n + Math.abs(m - i) || state[i][j] == "K" + opp && a - i == 0 && Math.abs(m - i) == 1 && Math.abs(n - j) == 1)
	    						dist = Math.min(dist, (Math.abs(i - m) || Math.abs(j - n)));
	    				} 
	    			} 
	    		} 
				let index =  ordinary.findIndex((data) => {
					return data.dist > dist;
				});
				
				index = index == -1? ordinary.length: index;
				move.dist = dist;
				ordinary.splice(index, 0, move);
			} 
        } 
        return captures.concat(kings).concat(ordinary);
    } 
    filter = async (state, moves, color) => {
    	let opp = color == 1? this.a: this.b;
    	let ordinary = [];
    	let kings = [];
    	let captures = [];
    	for(let move of moves) {
    		let a = parseInt(move.cell.slice(0,1));
    		let b = parseInt(move.cell.slice(1,2));
    		let m = parseInt(move.empty.slice(0,1));
    		let n = parseInt(move.empty.slice(1,2));
    		if(move.capture) {
    			captures.push(move);
    		} 
    		else if(state[a][b].includes("M")) {
    			ordinary.push(move);
				continue;
    		} 
    		
    		for(let i = 0; i < Game.boardSize; i++) {
    			for(let j = 0; j < Game.boardSize; j++) {
    				if(state[i][j].includes(opp) && (a - m) * (a - i) >= 0) {
    					if(j >= n - Math.abs(m - i) && j <= n + Math.abs(m - i)) 
    						kings.push(move);
    				} 
    			} 
    		} 
    	} 
    	
    	if(captures.length) 
    		return captures;
    	if(kings.length)
    		return kings;
    	else if(ordinary.length)
    		return ordinary;
    	else 
    		return moves;
    } 
} 

const TerminateWorkers = () => {
	$("#play-window .footer_section").style.backgroundImage = "none";
    $("#play-window .middle_section .face_bottom").style.backgroundImage = `linear-gradient(to bottom, rgba(70,70,70,0.4), rgba(0,0,0,0.7)), var(--black-cell)`;
    
	for(let worker of workers) {
		worker.postMessage({type: "stop-search"});
	} 
} 

class Sleep {
	running = false;
	name = '';
	constructor (name) {
		this.name = name;
		this.start = this.start.bind(this);
		this.end = this.end.bind(this);
		this.wait = this.wait.bind(this);
	} 
	start () {
		this.running = true;
		return new Promise((resolve, reject) => {
			this.it = setInterval(() => {
				if(!this.running) {
					resolve(clearInterval(this.it));
				} 
			}, 1);
		});
	} 
	end () {
		this.running = false;
	} 
	wait (sec) {
		return new Promise((resolve) => {
			setTimeout(() => {
				resolve("Done");
			}, sec * 1000);
		});
	} 
} 


