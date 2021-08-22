importScripts("UI.js");
importScripts("AI.js"); 
importScripts("Core.js");
				
onmessage = async (e) => { try {
	let level = e.data[0];
	let move = e.data[1];
	let cloneState = e.data[2];
	let moves = e.data[3];
	let depth = e.data[4];
	let isMax = e.data[5];
	let alpha = e.data[6];
	let beta = e.data[7];
	let currentPlayer = e.data[8];
	let ai = new AI({state: [], depth: level, moves: []});
	let value = await ai.minimax(cloneState, moves, depth, isMax, alpha, beta, currentPlayer);
	postMessage({title: "value", content: {move, value}});
	} catch (error) {
		postMessage({title: "error", content: error.stack});
	} 
}

onerror = (e) => {
	e.preventDefault();
	postMessage({title: "error", content: error.stack});
} 
