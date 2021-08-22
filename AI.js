'use strict' 

class AI {
	ai = playerB.pieceColor.slice(0,1);
	opp = playerA.pieceColor.slice(0,1);
	MAX = 1000000;
	MIN = -1000000;
	
	constructor (prop) {
		if(prop.state != undefined && prop.state.length > 7 && prop.depth != undefined && prop.moves != undefined && prop.moves.length > 0) {
	        this.state = Copy(prop.state);
	        this.depth = prop.depth + 1;
	        this.moves = Copy(prop.moves);
        } 
        else {
            console.log(prop);
            console.warn("Possible error. Check your attributes passed to AI object arguments.");
        } 
	    
		/*if(storage) {
	        storage.setItem(Game.version + "Table", JSON.stringify(TranspositionTable.states));
	    } */
    } 
    
    // Evaluation function 
    evaluate = async (state) => {
        let ai = 0, human = 0;
        
        for(let i = 0; i < Game.boardSize; i++) {
            for(let j = 0; j < Game.boardSize; j++) {
                let piece = state[i][j];
                if(piece.includes(this.ai)) { 
                    if(piece.includes("K")) { // threatening
                        ai += 300; // value to piece
                        /*if(Game.version != 'nigerian') {
                            if(i == 0 && j == 1 || i == 1 && j == 0 || i == Game.boardSize-1 && j == Game.boardSize-2 || i == Game.boardSize-2 && j == Game.boardSize-1) 
                                ai += 50;
                        } 
                        else {
                            if(i == 0 && j == Game.boardSize-2 || i == 1 && j == Game.boardSize-1 || i == Game.boardSize-1 && j == 1 || i == Game.boardSize-2 && j == 0) 
                                ai += 50;
                        } */
                    } 
                    if(piece.includes("M")) {
                        ai += 200; // value to piece
                    } 
                } 
                else if(piece.includes(this.opp)) {
                    if(piece.includes("K")) { // Becomes more threatening
                        human += 300; // value to piece
                        /*if(Game.version != 'nigerian') {
                            if(i == 0 && j == 1 || i == 1 && j == 0 || i == Game.boardSize-1 && j == Game.boardSize-2 || i == Game.boardSize-2 && j == Game.boardSize-1) 
                                human += 50;
                        } 
                        else {
                            if(i == 0 && j == Game.boardSize-2 || i == 1 && j == Game.boardSize-1 || i == Game.boardSize-1 && j == 1 || i == Game.boardSize-2 && j == 0) 
                                human += 50;
                        } */
                    } 
                    if(piece.includes("M")) {
                        human += 200; // value to piece
                    }
                } 
            } 
        } 
        
        let currentValue = ai - human;
        return Prms(currentValue);
    } 
    
    move = async (state, move) => { try {
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
        if(!id.includes("K") && (id.includes(playerA.pieceColor.slice(0,1)) && m === 0 || id.includes(playerB.pieceColor.slice(0,1)) && m === Game.boardSize - 1)) {
            id = id.replace("M", "K");
            crowned = true;
        } 
        
        if(cap != undefined) {
            let a = parseInt(cap.slice(0,1)), 
                b = parseInt(cap.slice(1,2));
                
            state[a][b] = "EC";
            if(!crowned || crowned && (Game.version === "russian" || Game.version === "kenyan" || Game.version === "international" || Game.version === "nigerian")) {
            	id = crowned && (Game.version === "kenyan" || Game.version === "international" || Game.version === "nigerian")? id.replace("K", "M"): id;
                state[m][n] = id;
	            continuousJump = await AssesCaptures({i: m, j: n, state});
				if(continuousJump.length > 0)
	            	continuousJump = await RemoveUnwantedCells({captures: continuousJump, state});
				else if(crowned) {
					id = id.replace("M", "K");
				} 
            } 
        } 
        state[m][n] = id;
        return Prms({state, continuousJump});
        } catch (error) {alert("AI move Error!\n" + error);} 
    } 
    
    correct = (state) => {
        state = JSON.stringify(state);
        state = state.replaceAll(/\bIP\b/g, 'EC');
        return Prms(JSON.parse(state));
    } 
    
    minimax = async (state, moves, depth, isMax, alpha, beta, currentPlayer) => { // currentPlayer : true = ai || false = opp 
        if(!moves.length || depth === 0) {
        	let leafScore = !moves.length? (currentPlayer? this.MAX: this.MIN): 0;
        	let actualDepth = (this.depth - depth) * 1;
        	let score = await this.evaluate(state);
        	score = score + leafScore;
            score += (currentPlayer? -actualDepth: actualDepth);
            return Prms(score); 
        } 
        else {
        	let best = isMax? this.MIN: this.MAX; // infinity
            let opp = isMax? this.opp: this.ai;
            let id = isMax? this.ai: this.opp;
            moves = await this.filter(moves, state);
            
            for(let i = 0; i < moves.length; i++) {
            	let cloneState = Copy(state);
            	let move = moves[i];
            	let value;
            	let res = await this.move(cloneState, moves[i]); // make move
                    cloneState = res.state;
				
                if(res.continuousJump.length === 0) {
                	cloneState = await this.correct(cloneState); // Removing the ip cells
                    let moves2 = await Iterate({id: opp, state: cloneState, func: AssesCaptures});
                    if(moves2.length > 0)
                        moves2 = await RemoveUnwantedCells({captures: moves2, state: cloneState});
                    if(Game.mandatoryCapture && moves2.length === 0) {
                        moves2 = await Iterate({id: opp, state: cloneState, func: AssesMoves});
                    }
                    else if(!Game.mandatoryCapture) {
	                    let moves3 = await Iterate({id: opp, state: cloneState, func: AssesMoves});
	                    moves2 = moves2.concat(moves3);
	                } 
					
                    value = await this.minimax(cloneState, moves2, depth-1, !isMax, alpha, beta, isMax); // first branch
				} 
				else {
					let moves2 = res.continuousJump;
					
					value = await this.minimax(cloneState, moves2, depth, isMax, alpha, beta, isMax);
				}
			    
				if(isMax) {
					best = Math.max(best, value);
					alpha = Math.max(best, alpha); // adjust search window 
				} 
				else {
					best = Math.min(best, value);
					beta = Math.min(best, beta);
				} 
				
				if(alpha >= beta) {
					return Prms(alpha); // alpha cut-off
				} 
            }
            
            return Prms(best);
        } 
    } 
    
    findBestMove = async (state, moves) => {
        let isMax = (Game.whiteTurn && playerB.pieceColor === "White" || !Game.whiteTurn && playerB.pieceColor === "Black")? true: false; // false == playerA while true == playerB
        let opp = isMax? this.opp: this.ai;
        let infinite = isMax? this.MIN: this.MAX;
        let bestValue = infinite;
        let bestMove;
        let bestPossibleMoves = [];
        let worker;
        let count = 0;
        let sleep = new Sleep();
        
        if(moves.length > 1 && this.depth > 1) { 
        	if(window.Worker && (this.depth > 9 /*|| Game.version == "international" || Game.version == "nigerian"*/)) {
        		worker = new Worker("Worker.js");
        		worker.onmessage = message;
        		for(let i = 0; i < moves.length; i++) {
		            let cloneState = Copy(state);
		            let move = moves[i];
		            let res = await this.move(cloneState, move); // making move
		            cloneState = res.state;
		                
		            if(res.continuousJump.length === 0) {
		            	cloneState = await this.correct(cloneState);
			            let moves2 = await Iterate({id: opp, state: cloneState, func: AssesCaptures});
			            if(moves2.length > 0)
	                        moves2 = await RemoveUnwantedCells({captures: moves2, state: cloneState});
	                    if(Game.mandatoryCapture && moves2.length === 0) {
	                        moves2 = await Iterate({id: opp, state: cloneState, func: AssesMoves});
	                    }
	                    else if(!Game.mandatoryCapture) {
		                    let moves3 = await Iterate({id: opp, state: cloneState, func: AssesMoves});
		                    moves2 = moves2.concat(moves3);
		                } 
			            worker.postMessage([this.depth, move, cloneState, moves2, this.depth-1, !isMax, this.MIN, this.MAX, isMax]);
					} 
					else {
						let moves2 = res.continuousJump;
						worker.postMessage([this.depth, move, cloneState, moves2, this.depth, isMax, this.MIN, this.MAX, isMax]);
					}
		        } 
        		await sleep.start();
        		worker.terminate();
                sleep = null;
                worker = null;
                let random = Math.round(Math.random() * (bestPossibleMoves.length - 1));
		        bestMove = bestPossibleMoves[random];
		        return Copy(bestMove);
       	 } 
        	else {
        		for(let i = 0; i < moves.length; i++) {
		            let cloneState = Copy(state);
		            let move = Copy(moves[i]);
		            let res = await this.move(cloneState, move); // making move
		            cloneState = res.state;
		                
		            let value;
		            if(res.continuousJump.length === 0) {
		            	cloneState = await this.correct(cloneState);
			            let moves2 = await Iterate({id: opp, state: cloneState, func: AssesCaptures});
			            if(moves2.length > 0)
	                        moves2 = await RemoveUnwantedCells({captures: moves2, state: cloneState});
	                    if(Game.mandatoryCapture && moves2.length === 0) {
	                        moves2 = await Iterate({id: opp, state: cloneState, func: AssesMoves});
	                    }
	                    else if(!Game.mandatoryCapture) {
		                    let moves3 = await Iterate({id: opp, state: cloneState, func: AssesMoves});
		                    moves2 = moves2.concat(moves3);
		                } 
						
			            value = await this.minimax(cloneState, moves2, this.depth-1, !isMax, this.MIN, this.MAX, isMax);
					} 
					else {
						let moves2 = res.continuousJump;
						value = await this.minimax(cloneState, moves2, this.depth, isMax, this.MIN, this.MAX, isMax);
					}
					//console.log(move, value);
		            if(isMax && bestValue <= value) {
		                if(bestValue < value) {
		                    bestValue = value;
		                    bestPossibleMoves.splice(0, bestPossibleMoves.length, move);
		                } 
		                else if(bestValue === value) {
		                    bestPossibleMoves.push(move);
		                } 
		            } 
		            else if(!isMax && bestValue >= value) {
		            	if(bestValue > value) {
		            		bestValue = value;
		            		bestPossibleMoves.splice(0, bestPossibleMoves.length, move);
		            	} 
		            	else if(bestValue === value) {
		                    bestPossibleMoves.push(move);
		                } 
		            } 
		        } 
				
		        let random = Math.round(Math.random() * (bestPossibleMoves.length - 1));
		        bestMove = bestPossibleMoves[random];
		        return Copy(bestMove);
			} 
		} 
		else if(moves.length > 1 && this.depth == 1) {
			let random = Math.round(Math.random() * (moves.length - 1));
	        bestMove = moves[random];
	        return Copy(bestMove);
		} 
		else {
			return Copy(moves[0]);
		} 
        
        async function message (e) {
            if(e.data.title == "value") {
            	let value = Copy(e.data.content.value);
            	let move = Copy(e.data.content.move);
            	count++;
                console.log(move);
            	// evaluating 
                if(isMax && bestValue <= value) {
                    if(bestValue < value) {
                        bestValue = value;
                        bestPossibleMoves.splice(0, bestPossibleMoves.length, move);
                    } 
                    else if(bestValue === value) {
                        bestPossibleMoves.push(move);
                    } 
                } 
                else if(!isMax && bestValue >= value) {
                	if(bestValue > value) {
                		bestValue = value;
                		bestPossibleMoves.splice(0, bestPossibleMoves.length, move);
                	} 
                	else if(bestValue === value) {
                        bestPossibleMoves.push(move);
                    } 
                } 
                
                if(count == this.MAX || count == moves.length) {
				    sleep.end();
                } 
            } 
            else {
                alert(e.data.content);
            } 
        } 
    } 
    
    makeMove = async (returnable = false) => { 
    	Game.thinking = true;
        let state = Copy(this.state);
        let moves = this.moves;
        moves = await this.filter(moves, state);
        
        let bestMove = await this.findBestMove(state, moves);
        let i = parseInt(bestMove.cell.slice(0,1));
        let j = parseInt(bestMove.cell.slice(1,2));
        let m = parseInt(bestMove.empty.slice(0,1));
        let n = parseInt(bestMove.empty.slice(1,2));
        
        other.aiPath.push({i, j, m, n});
        
        if(bestMove.capture != undefined) {
            state = Copy(this.state);
            let id = state[i][j];
            let crowned = false;
            state[i][j] = "IP"; // INITIAL-POSITION
            if(!id.includes("K") && (id.includes(playerA.pieceColor.slice(0,1)) && m === 0 || id.includes(playerB.pieceColor.slice(0,1)) && m === Game.boardSize - 1)) {
                id = id.replace("M", "K");
                crowned = true;
            } 
            state[m][n] = id;
            state[parseInt(bestMove.capture.slice(0,1))][parseInt(bestMove.capture.slice(1,2))] = "EC";
            
            moves = [];
            if(!crowned || crowned && (Game.version === "russian" || Game.version === "kenyan" || Game.version === "casino" || Game.version === "international" || Game.version === "nigerian")) {
            	id = crowned && (Game.version === "kenyan" || Game.version === "casino" || Game.version === "international" || Game.version === "nigerian")? id.replace("K", "M"): id;
                moves = await AssesCaptures({id, i: m, j: n, state});
            } 
                
            if(moves.length > 0) {
                moves = await RemoveUnwantedCells({captures: moves, state});
                this.state = state;
                this.moves = moves;
                await this.makeMove(returnable);
                return;
            } 
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
        
        for(let cell of other.aiPath) {
            table.rows[cell.i].cells[cell.j].classList.add("valid");
            table.rows[cell.m].cells[cell.n].classList.add("valid");
        } 
    	//return;
    	if($("#play-window").style.display == "grid") 
        await setTimeout( async () => {
        	let cell1 = other.aiPath[0];
        	let cell = table.rows[cell1.i].cells[cell1.j];
	        await ValidateMove({cell, i: cell1.i, j: cell1.j, isComputer: true});
        	for(let cell2 of other.aiPath) {
	            cell = table.rows[cell2.m].cells[cell2.n];
	            ValidateMove({cell, i: cell2.m, j: cell2.n, isComputer: true});
			} 
			other.aiPath = [];
        }, 250);
        this.moves = [];
        Game.thinking = false;
        return;
    } 
    
    filter = async (moves, state) => {
        moves = await Copy(moves);
        let filteredMoves = new Array(moves.length);
        let indexes = [];
        await moves.forEach(async (move, index) => {
            if(move.capture) {
                filteredMoves.unshift(move);
                indexes.unshift(index);
                return;
            } 
            else {
                let i = parseInt(move.cell.slice(0,1));
                let j = parseInt(move.cell.slice(1,2));
                let id = state[i][j];
                let opp = id.includes("W")? "B": "W";
                let r = id.includes(playerA.pieceColor.slice(0,1))? -1: 1;
                let z = filteredMoves.length; // closeness;
                let distance = await this.check(state, id.slice(1,2), i, j, z, r);
                
                filteredMoves.splice(distance, 0, move);
                indexes.unshift(index);
                return;
                
                if(id.includes("K")) {
                    r = -r;
                    distance = await this.check(state, id.slice(1,2), i, j, z, r);
                    filteredMoves.splice(distance, 0, move);
                    indexes.unshift(index);
                    return;
                } 
            } 
        });
        
        for(let index of indexes) 
            moves.splice(index, 1);
        filteredMoves = filteredMoves.concat(moves);
        filteredMoves = JSON.parse(JSON.stringify(filteredMoves).replaceAll(/null,|,null/g, ""));
        return Copy(filteredMoves);
    } 
    
    check = (state, id, startX, startY, end, r) => {
        let x = startX + r;
        let y1 = startY - 1;
        let y2 = startY + 1;
        let row = null;
        let opp = id == "W"? "B": "W";
        
        for(;;x+=r, y1-=1, y2+=1) {
            row = state[x];
            if(!row) 
                break;
            for(let y = y1; y <= y2; y++) {
                if(row[y] && row[y].includes(opp)) {
                    return Prms(Math.abs(x - startX));
                } 
            } 
        } 
        return Prms(end);
    } 
}

class HashTable {
	static ZobristTable = [];
	static random = (min, max) => {
		let rand = Math.round(Math.random() * (max - min) + min);
		return rand;
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
		} 
		return index;
	} 
	static initTable = () => {
		this.ZobristTable = [];
		for(let i = 0; i < 10; i++) { // 10 maximum board size
			this.ZobristTable.push([]);
			for(let j = 0; j < 10; j++) {
				this.ZobristTable[i].push([]);
				for(let k = 0; k < 10; k++) {
					this.ZobristTable[i][j].push([]); 
					this.ZobristTable[i][j][k] = this.random(2, Number.MAX_SAFE_INTEGER); // 2**31-1 => maximum integer of bitwise operation
				} 
			} 
		} 
	} 
	static computeHash = (array, isBoard = true) => {
		let hash = 0n;
		if(isBoard) {
			for(let i = 0; i < Game.boardSize; i++) {
				for(let j = 0; j < Game.boardSize; j++) {
					let piece = array[i][j];
					let index = this.index(piece);
					if(Boolean(~index)) {
						let zobristKey = this.ZobristTable[i][j][index];
						hash ^= BigInt(zobristKey);
					} 
				} 
			} 
		} 
		else {
			array = !Array.isArray(array)? [array]: array;
			for(let i in array) {
				let string = array[i].cell + array[i].empty;
				for(let j in string) {
					let index = parseInt(string.charAt(j));
					let zobristKey = this.ZobristTable[i%Game.boardSize][j%Game.boardSize][index];
					hash ^= BigInt(zobristKey);
				} 
			} 
		} 
		return hash;
	} 
} 

class TranspositionTable {
    static queue = [];
    static american = new Array(1_597_957);
    static kenyan = new Array(1_597_957);
    static international = new Array(1_597_957);
    static pool = new Array(1_597_957);
    static russian = new Array(1_597_957);
    static nigerian = new Array(1_597_957);
    
    static add = async (state, value, depth) => {
        state = await Copy(state);
        value = await Copy(value);
        
        await this.queue.push({state, value, depth});
		if(this.queue.length == 1) 
			this.addState();
    } 
    
    static addState = async () => {
        while(this.queue[0]) {
            let obj = this.queue[0];
                
            let hash = await HashTable.computeHash(obj.state);
	        let key = Number(hash % BigInt(this[Game.version].length));
	        
	        if(!this[Game.version][key]) {
		        this[Game.version][key] = obj;
	        } 
	        else if(await JSON.stringify(this[Game.version][key].state) != await JSON.stringify(obj.state)) {
		        let pos = key+1;
		        for(;;pos++) {
			        if(!this[Game.version][pos] && pos < this[Game.version].length || pos == key) {
				        break;
			        } 
			        if(pos >= this[Game.version].length - 1) 
				        pos = -1;
		        } 
		        if(pos == key)
			        alert("Table is full");
		        else 
			        this[Game.version][pos] = obj;
	        } 
	        else if(this[Game.version][key] && this[Game.version][key].depth <= obj.depth) {
			    this[Game.version][key] = obj;
	        } 
	        this.queue.shift();
        } 
    } 
    static getState = async (state, depth) => {
        let hash = await HashTable.computeHash(state);
	    let key = Number(hash % BigInt(this[Game.version].length));
	    let obj = this[Game.version][key];
	    
	    if(obj && obj.depth >= depth-1 && await JSON.stringify(obj.state) == await JSON.stringify(state))
            return obj.value;
	    else if(obj) {
		    let pos = key+1;
		    for(;;pos++) {
			    obj = this[Game.version][pos];
			    if(obj && obj.depth >= depth-1 && await JSON.stringify(obj.state) == await JSON.stringify(state) || !obj || pos == key) {
				    break;
			    } 
			    if(pos >= this[Game.version].length - 1) 
				    pos = -1;
		    } 
		    if(pos == key) 
		        obj = undefined;
	    } 
	    if(obj) 
	        return obj.value;
        else
            return false;
    } 
} 

class KillerMove {
	static queue = [];
	static moves = new Array(1_597_957);
	static add = async (move) => {
		move = await Copy(move);
		await this.queue.push(move);
		if(this.queue.length == 1) 
			this.addMove();
	} 
	static addMove = async () => {
		while(this.queue[0]) {
			let move = this.queue[0];
			let hash = await HashTable.computeHash(move, false);
			let key = Number(hash % BigInt(this.moves.length));
			
			if(!this.moves[key]) {
				this.moves[key] = move;
			} 
			else if(await JSON.stringify(this.moves[key]) != await JSON.stringify(move)) {
				let pos = key+1;
				for(;;pos++) {
					if(!this.moves[pos] && pos < this.moves.length || pos == key) {
						break;
					} 
					if(pos >= this.moves.length - 1) {
						pos = -1;
					} 
				} 
				if(pos == key) 
					alert("Table is full");
				else
					this.moves[pos] = move;
			} 
			else {
				this.moves[key] = move;
			} 
			this.queue.shift();
		} 
	} 
	static sort = async (moves) => {
		moves = await Copy(moves);
		let length = moves.length;
		let km = [];
		let indexes = [];
		await moves.forEach(async (move, index) => {
			let hash = await HashTable.computeHash(move, false);
			let key = Number(hash % BigInt(this.moves.length));
			let value = this.moves[key];
			if(value && await JSON.stringify(value) == await JSON.stringify(move)) {
				km.push(move);
				indexes.unshift(index);
			} 
			else if(value) {
				let pos = key+1;
				for(;;pos++) {
					value = this.moves[pos];
					if(value && await JSON.stringify(value) == await JSON.stringify(move)) {
						km.push(move);
						indexes.unshift(index);
						break;
					} 
					if(!value || pos == key) 
						break;
					if(pos >= this.moves.length - 1)
						pos = -1;
				} 
			} 
		});
		for(let index of indexes) 
		    moves.splice(index, 1);
		moves = km.concat(moves);
		return Copy(moves);
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
		await this.start();
		return "done";
	} 
} 


