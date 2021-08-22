'use strict' 

const Iterate = async (prop) => {
    if(prop.func == undefined || prop.id == undefined || /(W|B)$/g.test(prop.id == false) || prop.state == undefined)
        throw new Error(`Missing important attribute of the argument provided.`);
    let func = prop.func, 
        id = prop.id.slice(-1), 
        state = prop.state,
        returnObj = [];
    
    for(let i = 0; i < Game.boardSize; i++) {
        for(let j = 0; j < Game.boardSize; j++) {
            let piece = state[i][j];
            if(piece.includes(id)) {
                let movesObj = await func({i, j, state});
                
                for(let moveObj of movesObj) {
                    returnObj.push(moveObj);
                } 
            } 
        } 
    } 
    return Prms(returnObj); // returns single dimension array
} 

const AssesMoves = async (prop) => { try {
    //concept based on Assess Captures function 
    if(prop.i == undefined || prop.j == undefined || prop.state == undefined)
        throw new Error(`Missing important attribute of the argument provided.`);
    let i = prop.i,
        j = prop.j,
        state = prop.state,
        id = state[i][j], 
        m = [], 
        moves = [];
    let r = id.includes(playerA.pieceColor.slice(0,1))? -1: 1;
    
    if(Game.version === "american" || Game.version === "kenyan" || Game.version === "casino") {
        let isKing = id.includes("K");
        m = await getMoves(i, j, i+r, i-r, r, isKing);
        for(let cell of m) {
            moves.push({cell: `${i}${j}`, empty: `${cell.x}${cell.y}`});
        } 
    } 
    else if(Game.version === "international" || Game.version === "nigerian" || Game.version === "russian" || Game.version === "pool") {
        if(id.includes('M')) {
            m = await getMoves(i, j, i+r, i-r, r, false);
            for(let cell of m) {
                moves.push({cell: `${i}${j}`, empty: `${cell.x}${cell.y}`});
            } 
        } 
        else if(id.includes('K')) {
            m = await getMoves(i, j, Math.MAX_SAFE_NUMBER, Math.MAX_SAFE_NUMBER, r, true);
            for(let cell of m) {
                moves.push({cell: `${i}${j}`, empty: `${cell.x}${cell.y}`});
            } 
        } 
    } 
    
    function getMoves (startX, startY, endX1, endX2, r, isKing) {
        let x1 = startX + r;
        let x2 = startX - r;
        let y1 = startY + 1;
        let y2 = startY - 1;
        let obstacle1A = false;
        let obstacle1B = false;
        let obstacle2A = false;
        let obstacle2B = false;
        let m = [];
        for(;; x1+=r, x2-=r, y1+=1, y2-=1) {
            let row1 = state[x1];
            let row2 = state[x2];
            let obstacle1A1 = row1 != undefined && row1[y1] != "EC";
            let obstacle1A2 = row1 != undefined && row1[y2] != "EC";
            let obstacle2A1 = row2 != undefined && row2[y1] != "EC";
            let obstacle2A2 = row2 != undefined && row2[y2] != "EC";
            
            if(obstacle1A == false && obstacle1A1)
                obstacle1A = true;
            if(obstacle1B == false && obstacle1A2)
                obstacle1B = true;
            if(obstacle2A == false && obstacle2A1)
                obstacle2A = true;
            if(obstacle2B == false && obstacle2A2)
                obstacle2B = true;
            
            if(row1 == undefined && row2 == undefined || obstacle1A && obstacle1B && obstacle2A && obstacle2B) {
                break;
            } 
            if(!obstacle1A && row1 != undefined && row1[y1] == "EC") {
                m.push({x: x1, y: y1});
            } 
            if(!obstacle1B && row1 != undefined && row1[y2] == "EC") {
                m.push({x: x1, y: y2});
            } 
            if(!obstacle2A && isKing && row2 != undefined && row2[y1] == "EC") {
                m.push({x: x2, y: y1});
            } 
            if(!obstacle2B && isKing && row2 != undefined && row2[y2] == "EC") {
                m.push({x: x2, y: y2});
            } 
            
            if(x1 == endX1 && x2 == endX2) {
                break;
            } 
        } 
        return Prms(m);
    } 
    
    return Prms(moves);
    } catch (error) {console.log(error);}
} 

const AssesCaptures = async (prop) => { 
    if(prop.i == undefined || prop.j == undefined || prop.state == undefined)
        throw new Error(`Missing important attribute of the argument provided.`);
    let i = prop.i, // i for row
        j = prop.j, // j for column
        state = prop.state, // state of the game to examine
        id = state[i][j], 
        op = (id.includes("W"))? "B": "W", // op for an opponent
        you = id.replace(/[KM]/g, ""), // you
        m = [], // to store current moves
        captures = []; // array to store found captures
    let r = id.includes(playerA.pieceColor.slice(0,1))? -1: 1;
        
    if(Game.version === "american") {
        let reverse = id.includes("K");
        m = await getCaptures(i, j, i+r, "one", r, reverse);
        for(let cell of m) {
            captures.push({cell: `${i}${j}`, capture: `${cell.x1}${cell.y1}`, empty: `${cell.x2}${cell.y2}`});
        } 
    } 
    else if(Game.version === "kenyan") {
        if(id.includes('M')) {
            m = await getCaptures(i, j, i+r, "one", r, false);
            for(let cell of m) {
                captures.push({cell: `${i}${j}`, capture: `${cell.x1}${cell.y1}`, empty: `${cell.x2}${cell.y2}`});
            } 
        } 
        else if(id.includes('K')) {
            m = await getCaptures(i, j, Math.MAX_SAFE_NUMBER, "one", r, true);
            for(let cell of m) {
                captures.push({cell: `${i}${j}`, capture: `${cell.x1}${cell.y1}`, empty: `${cell.x2}${cell.y2}`});
            } 
        } 
    } 
    else if(Game.version === "casino") {
        if(id.includes('M')) {
            m = await getCaptures(i, j, i+r, "one", r, true);
            for(let cell of m) {
                captures.push({cell: `${i}${j}`, capture: `${cell.x1}${cell.y1}`, empty: `${cell.x2}${cell.y2}`});
            } 
        } 
        else if(id.includes('K')) {
            m = await getCaptures(i, j, Math.MAX_SAFE_NUMBER, "one", r, true);
            for(let cell of m) {
                captures.push({cell: `${i}${j}`, capture: `${cell.x1}${cell.y1}`, empty: `${cell.x2}${cell.y2}`});
            } 
        } 
    } 
    else if(Game.version === "international" || Game.version === "nigerian" || Game.version === "russian" || Game.version === "pool") {
        if(id.includes('M')) {
            m = await getCaptures(i, j, i+r, "one", r, true);
            for(let cell of m) {
                captures.push({cell: `${i}${j}`, capture: `${cell.x1}${cell.y1}`, empty: `${cell.x2}${cell.y2}`});
            } 
        } 
        else if(id.includes('K')) {
            m = await getCaptures(i, j, Math.MAX_SAFE_NUMBER, "no_limit", r, true);
            for(let cell of m) {
                captures.push({cell: `${i}${j}`, capture: `${cell.x1}${cell.y1}`, empty: `${cell.x2}${cell.y2}`});
            } 
        } 
    } 
    
    function getCaptures (startX, startY, end1, end2, r, reverse) {
        let x1 = startX + r;
        let x2 = startX - r;
        let y1 = startY + 1;
        let y2 = startY - 1;
        let end1A = null;
        let end1B = null;
        let end2A = null;
        let end2B = null;
        let enemy1A = null;
        let enemy1B = null;
        let enemy2A = null;
        let enemy2B = null;
        let obstacle1A = false;
        let obstacle1B = false;
        let obstacle2A = false;
        let obstacle2B = false;
        let m = [];
        for(;; x1+=r, x2-=r, y1+=1, y2-=1) {
            let row1 = state[x1];
            let row2 = state[x2];
            let obstacle1A1 = row1 != undefined && row1[y1] == "IP";
            let obstacle1A2 = row1 != undefined && row1[y2] == "IP";
            let obstacle1B1 = row1 != undefined && row1[y1] != "EC" && enemy1A != null;
            let obstacle1B2 = row1 != undefined && row1[y2] != "EC" && enemy1B != null;
            let obstacle1C1 = row1 != undefined && row1[y1] != undefined && row1[y1].includes(you);// && !enemy1A;
            let obstacle1C2 = row1 != undefined && row1[y2] != undefined && row1[y2].includes(you);// && !enemy1B;
            
            let obstacle2A1 = row2 != undefined && row2[y1] == "IP";
            let obstacle2A2 = row2 != undefined && row2[y2] == "IP";
            let obstacle2B1 = row2 != undefined && row2[y1] != "EC" && enemy2A != null;
            let obstacle2B2 = row2 != undefined && row2[y2] != "EC" && enemy2B != null;
            let obstacle2C1 = row2 != undefined && row2[y1] != undefined && row2[y1].includes(you);// && !enemy2A;
            let obstacle2C2 = row2 != undefined && row2[y2] != undefined && row2[y2].includes(you);// && !enemy2B;
            
            if(obstacle1A == false && (obstacle1A1 || obstacle1B1 || obstacle1C1)) 
                obstacle1A = true;
            if(obstacle1B == false && (obstacle1A2 || obstacle1B2 || obstacle1C2)) 
                obstacle1B = true;
            if(obstacle2A == false && (obstacle2A1 || obstacle2B1 || obstacle2C1)) 
                obstacle2A = true;
            if(obstacle2B == false && (obstacle2A2 || obstacle2B2 || obstacle2C2)) 
                obstacle2B = true;
                
            if(row1 == undefined && row2 == undefined || !reverse && obstacle1A && obstacle1B || reverse && obstacle1A && obstacle1B && obstacle2A && obstacle2B) {
                break;
            } 
            
            if(!obstacle1A && (end1 == startX+r && Math.abs(startX - x1) == 1 || end1 != startX+r) && !enemy1A && row1 != undefined && row1[y1] != undefined && row1[y1].includes(op)) {
                enemy1A = {x: x1, y: y1};
                if(end2 == "one") {
                    end1A = x1+r;
                } 
            } 
                
            if(!obstacle1B && (end1 == startX+r && Math.abs(startX - x1) == 1 || end1 != startX+r) && !enemy1B && row1 != undefined && row1[y2] != undefined && row1[y2].includes(op)) {
                enemy1B = {x: x1, y: y2};
                if(end2 == "one") {
                    end1B = x1+r;
                } 
            } 
                
            if(reverse && !obstacle2A && (end1 == startX+r && Math.abs(startX - x1) == 1 || end1 != startX+r) && !enemy2A && row2 != undefined && row2[y1] != undefined && row2[y1].includes(op)) {
                enemy2A = {x: x2, y: y1};
                if(end2 == "one") {
                    end2A = x2-r;
                } 
            } 
                
            if(reverse && !obstacle2B && (end1 == startX+r && Math.abs(startX - x1) == 1 || end1 != startX+r) && !enemy2B && row2 != undefined && row2[y2] != undefined && row2[y2].includes(op)) {
                enemy2B = {x: x2, y: y2};
                if(end2 == "one") {
                    end2B = x2-r;
                } 
            } 
            
            if(!obstacle1A && enemy1A && (end2 == "one" && Math.abs(enemy1A.x - x1) == 1 || end2 == "no_limit") && row1 != undefined && row1[y1] == "EC") {
                m.push({x1: enemy1A.x, y1: enemy1A.y, x2: x1, y2: y1});
            } 
            else if(end2 == "one" && (enemy1A && Math.abs(enemy1A.x - x1) >= 1 || !enemy1A && end1 == startX+r)) {
                end1A = x1;
            } 
                
                
            if(!obstacle1B && enemy1B && (end2 == "one" && Math.abs(enemy1B.x - x1) == 1 || end2 == "no_limit") && row1 != undefined && row1[y2] == "EC") {
                m.push({x1: enemy1B.x, y1: enemy1B.y, x2: x1, y2: y2});
            } 
            else if(end2 == "one" && (enemy1B && Math.abs(enemy1B.x - x1) >= 1 || !enemy1B && end1 == startX+r)) {
                end1B = x1;
            } 
                
            if(!obstacle2A && enemy2A && (end2 == "one" && Math.abs(enemy2A.x - x2) == 1 || end2 == "no_limit") && row2 != undefined && row2[y1] == "EC") {
                m.push({x1: enemy2A.x, y1: enemy2A.y, x2: x2, y2: y1});
            } 
            else if(end2 == "one" && (enemy2A && Math.abs(enemy2A.x - x2) >= 1 || !enemy2A && end1 == startX+r)) {
                end2A = x2;
            } 
                
                
            if(!obstacle2B && enemy2B && (end2 == "one" && Math.abs(enemy2B.x - x2) == 1 || end2 == "no_limit") && row2 != undefined && row2[y2] == "EC") {
                m.push({x1: enemy2B.x, y1: enemy2B.y, x2: x2, y2: y2});
            } 
            else if(end2 == "one" && (enemy2B && Math.abs(enemy2B.x - x2) >= 1 || !enemy2B && end1 == startX+r)) {
                end2B = x2;
            } 
            
            if(end1A == x1 && end1B == x1 && end2A == x2 && end2B == x2) {
                break;
            } 
        } 
        return Prms(m);
    } 
    
    return Prms(captures);
}

const RemoveUnwantedCells = async (prop, isPath) => {
    if(prop.state == undefined)
        throw new Error("Board state missing in argument provided");
    if(prop.captures == undefined)
        throw new Error("Capture moves missing in argument provided");
    if(Game.version == "american" || Game.version == "kenyan" || Game.version == "casino") 
        return prop.captures; // because the kings only land to the immediate cell after the captured piece
    
    let captures = Copy(prop.captures);
    let state = Copy(prop.state);
    let newCaps = [];
    let sortedList = [];
    
    // only deal with kings
    captures = captures.filter((cap) => {
        let i = parseInt(cap.cell.slice(0,1));
        let j = parseInt(cap.cell.slice(1,2));
        if(state[i][j].includes("K")) {
            return cap;
        } 
    });
    if(captures.length == 0)
        return prop.captures;
    
    for(let cap of captures) {
        if(sortedList.length == 0)
            sortedList.push([cap]);
        else {
            for(let arr of sortedList) {
                let id = arr[0];
                if(id.cell == cap.cell && id.capture == cap.capture) {
                    if(id.empty == cap.empty)
                        break; // already exists
                    arr.push(cap);
                    break;
                } 
                else if(sortedList.indexOf(arr) == sortedList.length - 1) {
                    sortedList.push([cap]);
                } 
            } 
        } 
    } 
    
    for(let a = 0; a < sortedList.length; a++) {
        let arr = sortedList[a];
        let wanted = [];
        for(let b = 0; b < arr.length; b++) {
            let move = arr[b];
            let i = parseInt(move.cell.slice(0,1));
            let j = parseInt(move.cell.slice(1,2));
            let k = parseInt(move.capture.slice(0,1));
            let l = parseInt(move.capture.slice(1,2));
            let m = parseInt(move.empty.slice(0,1));
            let n = parseInt(move.empty.slice(1,2));
            
            let cloneState = Copy(state);
            let id = cloneState[i][j];
            cloneState[i][j] = "EC";
            cloneState[m][n] = id;
            cloneState[k][l] = "EC";
            let moves = await AssesCaptures({i: m, j: n, state: cloneState});
            
            if(moves.length > 0) {
                wanted.push(move);
            } 
        }
        
        if(wanted.length > 0)
            newCaps.push(...wanted);
        else 
            newCaps.push(...arr);
    } 
    
    return Prms(newCaps);
} 

const SortCaptures = (moves) => {
	let sorted = [];
	for(let move of moves) {
		let hasMove;
		for(let sort of sorted) { //push if it belongs to the same path
			hasMove = sort[sort.length-1].empty == move.cell;
			if(hasMove) 
				sort.push(move);
		} 
		if(!hasMove && move.source) // otherwise if the move is source create new path
			sorted.push([move]);
		else if(!hasMove) { // otherwise check if the move already exits in the paths and if so, pick the moves prior to the current move and add to the new path
			let i = 0, j = 0;
			for(; i < sorted.length; i++) {
				let sort = sorted[i];
				for(; j < sort.length; j++) {
					if(sort[j].cell == move.cell) {
						hasMove = true;
						break;
					} 
				} 
				if(hasMove) break;
			} 
			if(hasMove) {
				sorted.push([]);
				for(let sort of sorted[i].slice(0,j))
					sorted[sorted.length-1].push(sort);
				sorted[sorted.length-1].push(move);
			} 
		} 
	} 
	return Prms(sorted);
} 

