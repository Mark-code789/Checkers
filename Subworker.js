self.importScripts("./Objects.js", "./AI.js", "./Core.js");
let search;
let subworkers = [];
self.addEventListener("message", async (e) => {
	try {
		if(e.data && e.data.type == "move-search") {
			search = new Search();
			search.start(e.data.content);
		} 
		else if(e.data && e.data.type == "stop-search") {
			search.stop();
		} 
		else if(e.data && e.data.type == "init-worker") {
			ZobristHash.table = e.data.table;
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
			
			let isContinuousCapture = data[10];
			
			let id = data[1];
			
			this.ai = new AI({depth: data[0], state: data[2], moves: data[3], worker: true, subworker: true});
			let value;
			if(isContinuousCapture) 
				value = await this.ai.negascout(...data.slice(2,10));
			else 
				value = -await this.ai.negascout(...data.slice(2,10));
				
			if(!this.ai.stop) 
				await self.postMessage({type: "search-result", content: {value, id, depth: this.ai.depthSearched}});
		} catch (error) {
			self.postMessage("Error: ", data[0] + " - " + data[4] + " Error: " + error.message + "\n" + error.stack);
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