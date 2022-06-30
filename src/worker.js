'use strict' 

/* Version: 21 */

self.importScripts("./objects.js", "./ai.js", "./core.js");
let search;
self.addEventListener("message", async (e) => {
	try {
		if(e.data && e.data.type == "move-search") {
			search = new Search();
			search.start(e.data.content);
		} 
		else if(e.data && e.data.type == "stop-search") {
			if(search)
			search.stop();
		} 
		else if(e.data && e.data.type == "init-worker") {
			ZobristHash.table = e.data.table;
		} 
		else {
			Log(...e.data);
		} 
	} catch (error) {
		self.postMessage("Error: " + error.message + "\n" + error.stack);
	} 
});

class Search {
	ai = null;
	start = async (data) => {
		try {
			Game.mandatoryCapture = data[10];
			Game.boardSize = data[11];
			Game.version = data[12];
			playerA.pieceColor = data[13];
			playerB.pieceColor = data[14];
			
			let id = data[1];
			let isContinuousCapture = data[9];
			
			this.ai = new AI({depth: data[0], state: data[3], moves: data[2], worker: true});
			await this.ai.evaluate(data[3]);
			let value;
			
			if(isContinuousCapture) 
				value = await this.ai.negascout(...data.slice(2,9));
			else 
				value = -await this.ai.negascout(...data.slice(2,9));
				
			let actualDepthSearched = this.ai.depth - this.ai.depthSearched;
				value -= actualDepthSearched * 1000;
				
			if(!this.ai.stop) {
				await self.postMessage({type: "search-result", content: {value, id}, workerID: data[15]});
			} 
		} catch (error) {
			self.postMessage("Error: " + error.message + "\n" + error.stack);
		} 
	} 
	stop = () => {
		try {
			this.ai.stop = true;
		} catch (error) {
			self.postMessage("Error: " + error.message + "\n" + error.stack);
		} 
	} 
}