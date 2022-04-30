self.importScripts("./Objects.js", "./AI.js", "./Core.js");
let searches = [];
let timestamp = null;
self.addEventListener("message", async (e) => {
	try {
		if(e.data && e.data.type == "move-search") {
			if(timestamp != e.data.content[16]) {
				searches = [];
				timestamp = e.data.content[16];
			} 
			let search = new Search();
			search.start(e.data.content);
			searches.push(search);
		} 
		else if(e.data && e.data.type == "stop-search") {
			for(let search of searches) {
				search.stop();
			} 
		} 
		else if(e.data && e.data.type == "init-worker") {
			for(let i = 0; i < 0; i++) {
				let worker = new Worker("./Subworker.js");
				worker.postMessage({type: "init-worker", table: e.data.table});
				subworkers.push(worker);
			} 
			ZobristHash.table = e.data.table;
		} 
		else if(e.data && e.data.type == "tt-entry") {
			TranspositionTable.store(e.data.entry, true);
		} 
		else {
			Log(...e.data);
		} 
	} catch (error) {
		self.postMessage(data[1] + " Error: " + error.message + "\n" + error.stack);
	} 
});

class Search {
	ai = null;
	start = async (data) => {
		try {
			Game.mandatoryCapture = data[11];
			Game.boardSize = data[12];
			Game.version = data[13];
			playerA.pieceColor = data[14];
			playerB.pieceColor = data[15];
			
			let id = data[1];
			let isContinuousCapture = data[10];
			
			this.ai = new AI({depth: data[0], state: data[2], moves: data[3], worker: true});
			let value;
			
			if(isContinuousCapture) 
				value = await this.ai.negascout(...data.slice(2,10));
			else 
				value = -await this.ai.negascout(...data.slice(2,10));
				
			let actualDepthSearched = this.ai.depth - this.ai.depthSearched;
				value -= actualDepthSearched * 1000;
				
			if(!this.ai.stop) {
				await self.postMessage({type: "search-result", content: {value, id}});
			} 
		} catch (error) {
			self.postMessage(data[1] + " Error: " + error.message + "\n" + error.stack);
		} 
	} 
	stop = () => {
		try {
			this.ai.stop = true;
		} catch (error) {
			self.postMessage(data[1] + " Error: " + error.message + "\n" + error.stack);
		} 
	} 
}