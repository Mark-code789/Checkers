'use strict' 

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

// AI class object
// Methods and variables are self explanatory
let subworkers = [];
class AI {
	ai = playerB.pieceColor.slice(0,1);
	opp = playerA.pieceColor.slice(0,1);
	MAX = 1000000;
	MIN = -1000000;
	stop = false;
	
	constructor (prop) {
		if(prop.state != undefined && prop.state.length > 7 && prop.depth != undefined && prop.moves != undefined) {
	        this.state = Copy(prop.state);
	        this.depth = prop.worker? prop.depth: prop.depth + 1;
			this.depthSearched = this.depth;
	        this.moves = Copy(prop.moves);
			this.total = 0;
			this.count = 0;
			this.sleep = new Sleep();
			this.values = [];
        } 
        else {
            throw new Error("Possible error. Check your attributes passed to AI object arguments. <br>\n" + JSON.stringify(prop));
        } 
    } 
    
    // Evaluation function 
    evaluate = async (state, movesA, movesB, colorA) => {
    	let aiMoves = colorA == 1? movesA: movesB;
    	let humanMoves = colorA == 1? movesB: movesA;
    	let movesStrA = JSON.stringify(aiMoves);
    	let movesStrB = JSON.stringify(humanMoves);
        let ai = 0, human = 0;
        
        for(let i = 0; i < Game.boardSize; i++) {
            for(let j = 0; j < Game.boardSize; j++) {
                let piece = state[i][j];
                
                if(piece.includes(this.ai)) { 
                	if(piece.includes("M")) {
                        ai += 1000; // value to piece 
                        if(i == 0)
                        	ai += 2;
                    } 
                    if(piece.includes("K")) { // threatening
                    	if(Game.version == "american") 
                    		ai += 1010;
                    	else if(/kenyan|casino/gi.test(Game.version))
                    		ai += 1015;
                    	else
                        	ai += 1020; // value to piece
                        
                        if(/american|kenyan|casino/gi.test(Game.version)) {
	                        if(i == Game.boardSize-1 && j == Game.boardSize-2 && state[i-1][j+1] == "EC") 
	                        	ai += 10;
	                        else if(i == Game.boardSize-2 && j == Game.boardSize-1 && state[i+1][j-1] == "EC") 
	                        	ai += 10;
	                        else if(i == 0 && j == 1 && state[i+1][j-1] == "EC")
	                        	ai += 10;
	                        else if(i == 1 && j == 0 && state[i-1][j+1] == "EC") 
	                        	ai += 10;
						} 
                    } 
                    if(movesStrA.includes(`"cell":"${i}{j}"`)) // movable piece 
                    	ai += 500;
                    if(movesStrB.includes(`"capture":"${i}{j}"`)) {// will be captured 
                    	if(piece.includes("M"))
                    		ai -= 1000;
                    	else if(Game.version == "american") 
                    		ai -= 1010;
                    	else if(/kenyan|casino/gi.test(Game.version))
                    		ai -= 1015;
                    	else
                    		ai -= 1020;
                    } 
                    else // safe piece
                    	ai += 100;
                } 
                else if(piece.includes(this.opp)) {
                	if(piece.includes("M")) {
                        human += 1000; // value to piece 
                        if(i == Game.boardSize-1) 
                        	human += 2;
                    }
                    if(piece.includes("K")) { // Becomes more threatening
                        if(Game.version == "american") 
                    		human += 1010
                    	else if(Game.version == "kenyan" || Game.version == "casino") 
                    		human += 1015;
                    	else
                        	human += 1020; // value to piece
                        
                        if(/american|kenyan|casino/gi.test(Game.version)) {
	                        if(i == Game.boardSize-1 && j == Game.boardSize-2 && state[i-1][j+1] == "EC") 
	                        	human += 10;
	                        else if(i == Game.boardSize-2 && j == Game.boardSize-1 && state[i+1][j-1] == "EC") 
	                        	human += 10;
	                        else if(i == 0 && j == 1 && state[i+1][j-1] == "EC")
	                        	human += 10;
	                        else if(i == 1 && j == 0 && state[i-1][j+1] == "EC") 
	                        	human += 10;
						} 
                    } 
                    if(movesStrB.includes(`"cell":"${i}{j}"`)) // movable piece 
                    	human += 500;
                    if(movesStrA.includes(`"capture":"${i}{j}"`)) {// will be captured 
                    	if(piece.includes("M"))
                    		human -= 1000;
                    	else if(Game.version == "american") 
                    		human -= 1010;
                    	else if(/kenyan|casino/gi.test(Game.version))
                    		human -= 1015;
                    	else
                    		human -= 1020;
                    } 
                    else // safe piece
                    	human += 100;
                } 
            } 
        } 
        
        let currentValue = ai - human;
        return Prms(currentValue);
    } 
    
    move = async (state, move) => { //try {
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
            
        id = state[i][j];
        state[i][j] = "IP"; // INITIAL-POSITION
        if(id.includes("M") && (id.includes(playerA.pieceColor.slice(0,1)) && m === 0 || id.includes(playerB.pieceColor.slice(0,1)) && m === Game.boardSize - 1)) {
            id = id.replace("M", "K");
            crowned = true;
        } 
        
        if(cap != undefined) {
            let a = parseInt(cap.slice(0,1)), 
                b = parseInt(cap.slice(1,2));
                
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
        state[m][n] = id;
        return Prms({state, continuousJump});
        //} catch (error) {alert("AI move Error!\n" + error);} 
    } 
    
    correct = (state) => {
        state = JSON.stringify(state);
        state = state.replaceAll(/\bIP\b/g, 'EC');
        return Prms(JSON.parse(state));
    } 
    
    negascout = async (state, moves, depth, color, alpha, beta, previousPlayer, movesB) => { // previousPlayer : 1 = ai || -1 = opp 
    	if(this.stop) {
    		return 0;
    	}
    	let best = this.MIN;
    	this.depthSearched = Math.min(depth, this.depthSearched);
    	//this.alpha = alpha;
    	//this.beta = beta;
    	/*await Log("Depth: ", depth);
    	await LogState(state);
    	await Log('');*/
    	
    	// Transposition Table Lookup:
    	/*let alphaOrig = alpha;
    	let ttEntry;
		
		if(depth < this.depth) {
			ttEntry = TranspositionTable.lookUp(state, color);
	    	if(ttEntry.valid && ttEntry.depth <= depth) {
	    		// flag property: 0 = exact, 1 = upper bound, -1 = lower bound
	    		if(ttEntry.flag == 0) 
	    			return ttEntry.value;
	    		else if(ttEntry.flag == -1) 
	    			alpha = Math.max(alpha, ttEntry.value);
	    		else if(ttEntry.flag == 1)
	    			beta = Math.min(beta, ttEntry.value);
	    		
	    		if(alpha >= beta) 
	    			return ttEntry.value;
	    	} 
		} */
    
        if(!moves.length || depth === 0) {
        	let leafScore = !moves.length? (previousPlayer == 1? 100000: -100000): 0;
        	let score = await this.evaluate(state, movesB, moves, previousPlayer);
        	score = score + leafScore;
            return Prms(score * color); 
        } 
        else {
            let opp = color == 1? this.opp: this.ai;
            let cloneState;
            
            // Move ordering
            //moves = moves.slice(0,1);
            moves = color == 1? moves.reverse(): moves//await this.sort(moves, state);
            //moves = await this.sort(moves, state);
            
            for(let i = 0; i < moves.length; i++) {
            	let move = moves[i];
            	let value;
            	if(this.stop) {
					return 0;
				} 
            	cloneState = Copy(state);
            	let res = await this.move(cloneState, move); // make move
                    cloneState = res.state;
                    
                if(res.continuousJump.length === 0) {
                	cloneState = await this.correct(cloneState); // Removing the ip cells
                    let moves2 = await AssessAll({id: opp, state: cloneState});
                    if(Game.mandatoryCapture && moves2.captures.length > 0) {
                    	moves2 = moves2.captures;
                    } 
                    else if(Game.mandatoryCapture && moves2.captures.length === 0) {
                        moves2 = moves2.nonCaptures;
                    }
                    else if(!Game.mandatoryCapture) {
	                    moves2 = moves2.nonCaptures.concat(moves2.captures);
	                } 
					
					if(!subworkers || subworkers.length == 0) {
						value = -await this.negascout(cloneState, moves2, depth-1, -color, -beta, -alpha, color, moves);
					} 
					else {
						let worker = subworkers[i % subworkers.length];
						worker.onmessage = this.workerMessage;
						worker.postMessage({type: "move-search", content: [this.depth, i, cloneState, moves2, depth-1, -color, -beta, -alpha, color, moves, false, Game.mandatoryCapture, Game.boardSize, Game.version, playerA.pieceColor, playerB.pieceColor]});
						this.total++;
					} 
					
					/*if(moves.indexOf(move) == 0) { 
						value = -await this.negascout(cloneState, moves2, depth-1, -color, -beta, -alpha, color, moves); // initial search
					} 
					else {
                    	value = -await this.negascout(cloneState, moves2, depth-1, -color, -alpha-1, -alpha, color, moves); // null window search
						
						if(value > alpha && value < beta) // if it fails high i.e has possibility of raising alpha
							value = -await this.negascout(cloneState, moves2, depth-1, -color, -beta, -alpha, color, moves); // research to get the exact value
					} */
				} 
				else {
					let moves2 = res.continuousJump;
					
					if(!subworkers || subworkers.length == 0) {
						value = await this.negascout(cloneState, moves2, depth, color, alpha, beta, color, moves);
					} 
					else {
						let worker = subworkers[i % subworkers.length];
						worker.onmessage = this.workerMessage;
						worker.postMessage({type: "move-search", content: [this.depth, i, cloneState, moves2, depth, color, alpha, beta, color, moves, true, Game.mandatoryCapture, Game.boardSize, Game.version, playerA.pieceColor, playerB.pieceColor]});
						this.total++;
					} 
				} 
				
				
				if(subworkers && subworkers.length > 0 && i % subworkers.length == 0 && i+1 < moves.length) {
					continue;
				} 
				else if(subworkers && subworkers.length > 0) {
					await this.sleep.start();
					value = Math.max(...this.values);
					this.count = 0;
					this.total = 0;
					this.values = [];
				} 
				
				best = Math.max(value, best);
				alpha = Math.max(best, alpha);
				//this.alpha = alpha;
				//this.beta = beta;
				
				if(alpha >= beta) {
					break; // alpha cut-off
				} 
				
				// Transposition Table Storage 
				/*if(depth < this.depth) {
					ttEntry.value = value;
					if(value <= alphaOrig) 
						ttEntry.flag = 1; // upper bound
					else if(value >= beta) 
						ttEntry.flag = -1; // lower bound
					else
						ttEntry.flag = 0; // exact
					
					ttEntry.valid = true;
					ttEntry.depth = depth;
					TranspositionTable.store(ttEntry);
				} */
            } 
            return Prms(best);
        } 
    } 
    
    workerMessage = async (e) => {
    	if(e.data.type == "search-result") {
    		this.values.push(e.data.content.value); 
        	this.depthSearched = e.data.content.depth;
        	this.count++;
        	//this.alpha = Math.max(this.alpha, e.data.content.value);
        	if(this.count == this.total) {
        		this.sleep.end();
        		/*for(let worker of subworkers) {
        			worker.postMessage({type: "stop-search"});
        		} */
        	} 
    	} 
    	else {
    		await Log(e.data);
    	} 
    } 
    
    findBestMove = async (state, moves) => {
        let color = (Game.whiteTurn && playerB.pieceColor === "White" || !Game.whiteTurn && playerB.pieceColor === "Black")? 1: -1; // false == playerA while true == playerB
        let opp = color == 1? this.opp: this.ai;
        let count = 0;
        let sleep = new Sleep();
        let self = this;
        let bestValue = this.MIN;
        let bestPossibleMoves = [];
        let widthA, widthB;
        //let time = null;
        for(let worker of workers) {
        	worker.onmessage = message;
        } 
        
        if(moves.length > 1 && this.depth > 1) { 
    		//time = Date.now();
    		//moves = moves.slice(0,1);
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
			let timestamp = Date.now();
			let test = false;
			$("#play-window .footer_section").style.backgroundImage = "linear-gradient(to right, #00981988 5px, #0000 5px)";
			$("#play-window .middle_section .scene .board .face_bottom").style.backgroundImage = `linear-gradient(to right, #00981988 5px, #0000 5px), linear-gradient(to bottom, rgba(70,70,70,0.4), rgba(0,0,0,0.7)), var(--black-cell)`;
			for(let i = 0; i < moves.length; i+=workers.length) {
				for(let j = i; j < i+workers.length; j++) {
	    			let move = moves[j];
					if(!move) 
						break;
					/*if(move.cell == "03" && move.empty == "12") {}
					else continue;*/
					
					self.depthSearched = self.depth;
					let cloneState = Copy(state);
					let res = await self.move(cloneState, move); // make move
		                cloneState = res.state; 
					
		            if(res.continuousJump.length === 0) {
		            	cloneState = await self.correct(cloneState); // Removing the ip cells
		                let moves2 = await AssessAll({id: opp, state: cloneState});
						if(Game.mandatoryCapture && moves2.captures.length > 0) {
							moves2 = moves2.captures;
						} 
		                else if(Game.mandatoryCapture && moves2.captures.length === 0) {
		                    moves2 = moves2.nonCaptures;
		                }
		                else if(!Game.mandatoryCapture) {
		                    moves2 = moves2.nonCaptures.concat(moves2.captures);
		                } 
						
						let data = [
							self.depth, 
							j, 
							cloneState, 
							moves2, 
							depth-1, 
							-color, 
							self.MIN, 
							self.MAX, 
							color, 
							moves, 
							false, 
							Game.mandatoryCapture, 
							Game.boardSize, 
							Game.version, 
							playerA.pieceColor, 
							playerB.pieceColor, 
							timestamp
						]; 
						if(test) {
							let value = -await self.negascout(...data.slice(2,10));
							console.log(value, move, self.depth - self.depthSearched);
							//navigator.serviceWorker.controller.postMessage({type: "move-search", content: data});
						} 
						else {
							await workers[j % workers.length].postMessage({type: "move-search", content: data});
						} 
					} 
					else {
						let moves2 = res.continuousJump;
						
						let data = [
							self.depth, 
							j, 
							cloneState, 
							moves2, 
							depth, 
							color, 
							self.MIN, 
							self.MAX, 
							color, 
							moves, 
							true, 
							Game.mandatoryCapture, 
							Game.boardSize, 
							Game.version, 
							playerA.pieceColor, 
							playerB.pieceColor, 
							timestamp
						]; 
						if(test) {
							let value = await self.negascout(...data.slice(2,10));
							console.log(value, move, self.depth - self.depthSearched);
							//navigator.serviceWorker.controller.postMessage({type: "move-search", content: data});
						} 
						else {
							workers[j % workers.length].postMessage({type: "move-search", content: data});
						} 
					} 
				} 
			} 
		} 
        
        async function message (e) {
            if(e.data.type == "search-result") {
            	let value = e.data.content.value; 
            	let i = e.data.content.id; 
            	let move = moves[i];
            	count++;
            	// evaluating 
            	//console.log(value, move, e.data.content.depth);
            	let section = $("#play-window .footer_section");
            	let faceBottom = $("#play-window .middle_section .face_bottom");
            	widthA = parseFloat(GetValue(section, "width")) - 5;
            	widthB = parseFloat(GetValue(faceBottom, "width")) - 5;
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
                
                if(count == moves.length) {
                	section.style.backgroundImage = "none";
                	faceBottom.style.backgroundImage = `linear-gradient(to bottom, rgba(70,70,70,0.4), rgba(0,0,0,0.7)), var(--black-cell)`;
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
            state[i][j] = "IP"; // INITIAL-POSITION
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
    	//return;
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
    		let opp = state[a][b].includes(this.ai)? this.opp: this.ai;
        	if(move.capture) {
        		captures.push(move);
        	} 
        	if(state[a][b].includes("K")) {
				kings.push(move);
			} 
			else {
				let dist = Game.boardSize+1;
				for(let i = 0; i < Game.boardSize; i++) {
	    			for(let j = 0; j < Game.boardSize; j++) {
	    				if(state[i][j].includes(opp) && (a - m) * (a - i) >= 0 || state[i][j] == "K" + opp) { // if positive same sign
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
    	let opp = color == 1? this.opp: this.ai;
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
	i = 0;
	j = 1_000;
	start = () => {
		let self = this;
		return new Promise((resolve, reject) => {
			const it = setInterval(() => {
				self.i+=0.001;
				if(self.i >= self.j) {
					resolve("Done");
					self.i = 0;
					self.j = 1_000;
					clearInterval(it);
				} 
			}, 1);
		});
	} 
	end = () => {
		this.i = this.j;
	} 
	wait = async (sec) => {
		this.j = sec;
		this.i = 0;
		await this.start();
		return "done";
	} 
} 


