'use strict' 

/* Version: 21 */

const AssessAll = async (prop) => {
    if(prop.id == undefined || /(W|B)$/g.test(prop.id == false) || prop.state == undefined)
        throw new Error(`Missing important attribute of the argument provided.`);
    
    let id = prop.id == "both"? prop.id: prop.id.slice(-1), 
        state = prop.state,
        moves = prop.id == "both"? {B: {nonCaptures: [], captures: []}, W: {nonCaptures: [], captures: []}}: {nonCaptures: [], captures: []};
    
    for(let i = 0; i < Game.boardSize; i++) {
        for(let j = 0; j < Game.boardSize; j++) {
            let piece = state[i][j];
            if(id == "both") {
            	if(/^(M|K)/gi.test(piece)) {
            		let movesObj = await AssesMoves({i, j, state});
            		let color = piece.slice(-1);
            		moves[color].nonCaptures.push(...movesObj.nonCaptures);
                	moves[color].captures.push(...movesObj.captures);
            	} 
            } 
            else if(piece.includes(id)) {
            	let movesObj = await AssesMoves({i, j, state});
                
                moves.nonCaptures.push(...movesObj.nonCaptures);
                moves.captures.push(...movesObj.captures);
            } 
        } 
    } 
    
    return Prms(moves); 
} 

const AssesMoves = async (prop, maximizing = false) => { 
    
    if(prop.i == undefined || prop.j == undefined || prop.state == undefined)
        throw new Error(`Missing important attribute of the argument provided.`);
    let i = prop.i,
        j = prop.j,
        state = Copy(prop.state),
        id = state[i][j];
    let r = id.includes(playerA.pieceColor.slice(0,1))? -1: 1;
    let opp = id.includes(playerA.pieceColor.slice(0,1))? playerB.pieceColor.slice(0,1): playerA.pieceColor.slice(0,1);
    let moves = {nonCaptures: [], captures: []};
    let a = i+r,
		c = i+r,
		e = i-r,
		g = i-r;
    let b = j-1,
		d = j+1,
		f = j+1,
		h = j-1;
    
    /*	     ---->
   		AB	|	CD
   		______|______
   		      |      
   		GH    |    EF 
   			<----
    */
    let oppA, oppB, oppC, oppD;
    	oppA, oppB, oppC, oppD = null;
    let obstacleA, obstacleB, obstacleC, obstacleD;
    	obstacleA, obstacleB, obstacleC, obstacleD = false;
    for(;; a+=r, b-=1, c+=r, d+=1, e-=r, f+=1, g-=r, h-=1) {
    	
    	let cell = state[a]? state[a][b]: undefined;
    	
    	if(cell == "EC" && !oppA && !obstacleA) {
    		if(id.startsWith("M") && Math.abs(i - a) == 1) {
    			moves.nonCaptures.push({cell: `${i}${j}`, empty: `${a}${b}`});
    		} 
    		if(id.startsWith("K") && (/international|nigerian|russian|pool/gi.test(Game.version) || /american|kenyan|casino/gi.test(Game.version) && Math.abs(i - a) == 1)) {
    			moves.nonCaptures.push({cell: `${i}${j}`, empty: `${a}${b}`});
    		} 
    	} 
    	else if(cell == "EC" && oppA && !obstacleA) {
    		if(Math.abs(oppA.x - a) == 1 && Math.abs(i - oppA.x) == 1) {
    			moves.captures.push({cell: `${i}${j}`, empty: `${a}${b}`, capture: `${oppA.x}${oppA.y}`});
    		} 
    		else if(id.startsWith("K") && (/kenyan|casino/gi.test(Game.version) && Math.abs(oppA.x - a) == 1 || /international|nigerian|russian|pool/gi.test(Game.version))) {
    			moves.captures.push({cell: `${i}${j}`, empty: `${a}${b}`, capture: `${oppA.x}${oppA.y}`});
    		} 
    	} 
    	else if(cell && cell.endsWith(opp) && !oppA && !obstacleA) {
    		oppA = {x: a, y: b};
    	} 
    	else if(cell && cell.includes(id.slice(-1)) || cell == "IP" || oppA && cell && cell.includes(opp)) {
    		obstacleA = true;
    	} 
    
    	
    	cell = state[c]? state[c][d]: undefined;
    	
    	if(cell == "EC" && !oppB && !obstacleB) {
    		if(id.startsWith("M") && Math.abs(i - a) == 1) {
    			moves.nonCaptures.push({cell: `${i}${j}`, empty: `${c}${d}`});
    		} 
    		if(id.startsWith("K") && (/international|nigerian|russian|pool/gi.test(Game.version) || /american|kenyan|casino/gi.test(Game.version) && Math.abs(i - c) == 1)) {
    			moves.nonCaptures.push({cell: `${i}${j}`, empty: `${c}${d}`});
    		} 
    	} 
    	else if(cell == "EC" && oppB && !obstacleB) {
    		if(Math.abs(oppB.x - c) == 1 && Math.abs(i - oppB.x) == 1) {
    			moves.captures.push({cell: `${i}${j}`, empty: `${c}${d}`, capture: `${oppB.x}${oppB.y}`});
    		} 
    		else if(id.startsWith("K") && (/kenyan|casino/gi.test(Game.version) && Math.abs(oppB.x - c) == 1 || /international|nigerian|russian|pool/gi.test(Game.version))) {
    			moves.captures.push({cell: `${i}${j}`, empty: `${c}${d}`, capture: `${oppB.x}${oppB.y}`});
    		} 
    	} 
    	else if(cell && cell.endsWith(opp) && !oppB && !obstacleB) {
    		oppB = {x: c, y: d};
    	} 
    	else if(cell && cell.includes(id.slice(-1)) || cell == "IP" || oppB && cell && cell.includes(opp)) {
    		obstacleB = true;
    	} 
    
    	
    	cell = state[e]? state[e][f]: undefined;
    	
    	if(cell == "EC" && !oppC && !obstacleC) {
    		if(id.startsWith("K") && (/international|nigerian|russian|pool/gi.test(Game.version) || /american|kenyan|casino/gi.test(Game.version) && Math.abs(i - e) == 1)) {
    			moves.nonCaptures.push({cell: `${i}${j}`, empty: `${e}${f}`});
    		} 
    	} 
    	else if(cell == "EC" && oppC && !obstacleC) {
    		if(id.startsWith("M") && !/american|kenyan/gi.test(Game.version) && Math.abs(i - oppC.x) == 1 && Math.abs(oppC.x - e) == 1) {
    			moves.captures.push({cell: `${i}${j}`, empty: `${e}${f}`, capture: `${oppC.x}${oppC.y}`});
    		} 
    		else if(id.startsWith("K") && (/american/gi.test(Game.version) && Math.abs(i - oppC.x) == 1 && Math.abs(oppC.x - e) == 1 || /kenyan|casino/gi.test(Game.version) && Math.abs(oppC.x - e) == 1 || /international|nigerian|russian|pool/gi.test(Game.version))) {
    			moves.captures.push({cell: `${i}${j}`, empty: `${e}${f}`, capture: `${oppC.x}${oppC.y}`});
    		} 
    	} 
    	else if(cell && cell.endsWith(opp) && !oppC && !obstacleC) {
    		oppC = {x: e, y: f};
    	} 
    	else if(cell && cell.includes(id.slice(-1))  || cell == "IP" || oppC && cell && cell.includes(opp)) {
    		obstacleC = true;
    	} 
    	
    	
    	cell = state[g]? state[g][h]: undefined;
    	
    	if(cell == "EC" && !oppD && !obstacleD) {
    		if(id.startsWith("K") && (/international|nigerian|russian|pool/gi.test(Game.version) || /american|kenyan|casino/gi.test(Game.version) && Math.abs(i - g) == 1)) {
    			moves.nonCaptures.push({cell: `${i}${j}`, empty: `${g}${h}`});
    		} 
    	} 
    	else if(cell == "EC" && oppD && !obstacleD) {
    		if(id.startsWith("M") && !/american|kenyan/gi.test(Game.version) && Math.abs(i - oppD.x) == 1 && Math.abs(oppD.x - e) == 1) {
    			moves.captures.push({cell: `${i}${j}`, empty: `${g}${h}`, capture: `${oppD.x}${oppD.y}`});
    		} 
    		else if(id.startsWith("K") && (/american/gi.test(Game.version) && Math.abs(i - oppD.x) == 1 && Math.abs(oppD.x - g) == 1 || /kenyan|casino/gi.test(Game.version) && Math.abs(oppD.x - g) == 1 || /international|nigerian|russian|pool/gi.test(Game.version))) {
    			moves.captures.push({cell: `${i}${j}`, empty: `${g}${h}`, capture: `${oppD.x}${oppD.y}`});
    		} 
    	} 
    	else if(cell && cell.endsWith(opp) && !oppD && !obstacleD) {
    		oppD = {x: g, y: h};
    	} 
    	else if(cell && cell.includes(id.slice(-1)) || cell == "IP" || oppD && cell && cell.includes(opp)) {
    		obstacleD = true;
    	} 
    	
    	if(!state[a] && !state[c] && !state[e] && !state[g]) 
			break;
    } 
    
    if(!maximizing && /international|nigerian|russian|pool/gi.test(Game.version))
    	moves.captures = await maximizeCaptures(moves.captures);
    return Prms(moves);
    
    async function maximizeCaptures (rawCaptures) {
	    let wanted = [];
        for(let z = 0; z < rawCaptures.length; z++) {
            let move = rawCaptures[z];
            let k = parseInt(move.capture.slice(0,1));
            let l = parseInt(move.capture.slice(1,2));
            let m = parseInt(move.empty.slice(0,1));;
            let n = parseInt(move.empty.slice(1,2));
            
            let cloneState = Copy(state);
            let piece = cloneState[i][j];
            cloneState[i][j] = "EC";
            cloneState[m][n] = piece;
            cloneState[k][l] = "EC";
            
			let another = await AssesMoves({i: m, j: n, state: cloneState}, true);
            
            if(another.captures.length > 0) {
                wanted.push(move);
            } 
        }
        if(wanted.length > 0)
        	return Prms(wanted);
        else
        	return Prms(rawCaptures);
	} 
} 

const SortCaptures = (moves) => {
	let sorted = [];
	for(let move of moves) {
		if(move.source) {
			sorted.push([move]);
		} 
		else {
			let anotherWayStartIndex = sorted[sorted.length-1].findIndex((wayMove) => {
				return wayMove.cell == move.cell;
			});
			
			if(~anotherWayStartIndex) {
				let anotherWay = sorted[sorted.length-1].slice(0, anotherWayStartIndex);
				anotherWay.push(move);
				sorted.push(anotherWay);
			} 
			else {
				sorted[sorted.length-1].push(move);
			} 
		} 
	} 
	return Prms(sorted);
} 

const Log = async (...data) => {
	await self.postMessage(data);
} 

const LogState = async (state) => {
	/*for(let row of state) {
		await Log(row);
	} */
	await Log(JSON.stringify(state));
} 

