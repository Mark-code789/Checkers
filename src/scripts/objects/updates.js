window.Updates = {
	version: "31.22.219.575", 
	updatesLog: new Map([
		["22.15.200.529", ["Added voice notes in the chat engine.", "Added delete and copy option for chat engine.", "Improved internal operations.", "Improved the AI thinking time.", "Fixed channel subscription error.", "Fixed more other errors."]], 
		["22.15.201.530", ["Fixed single player draw issue.", "Fixed fullscreen not changing orientation.", "Fixed game stats behind by a move.", "Added locking orientation in both primary and secondary."]], 
		["22.15.204.536", ["Fixed minor bags."]], 
		["22.15.205.537", ["Fixed minor bags."]], 
		["22.15.206.538", ["Fixed declining updated error.", "Fixed minor bags."]], 
		["22.15.209.540", ["Fixed channel subscription timeout issue.", "Removed showing captures helper for online opponent."]], 
		["22.15.209.541", ["Fixed out some issues."]], 
		["23.16.210.542", ["Added check for updates.", "Added support line.", "Added more apps option.", "Fixed out some issues."]], 
		["23.16.211.543", ["Improved internal operations."]], 
		["23.16.211.545", ["Fixed offline loading error."]], 
		["24.17.214.550", ["Fixed refresh error.", "Improved game difficulty.", "Fixed minor bugs."]], 
		["30.21.218.571", ["Added 2 new levels per version.", "Improved game performance.", "Improved game difficulty", "Change online match connectivity", "Fixed interface breaking on different size screens", "Added other features, discover by yourself"]], 
		["31.22.219.575", ["Fixed few bugs.", "Improved game thinking time"]], 
	]), 
	getDescription: function (version) {
		let versionDescription = "<ul>";
		if(!version) {
			for(let [key, value] of this.updatesLog.entries()) {
				if(key >= this.version) {
					versionDescription += `<li>Version: ${key}</li><ul>${value.map(desc => "<li>" + desc + "</li>").join("")}</ul>`;
				} 
			} 
		} 
		else {
			let value = this.updatesLog.get(version);
			value = !value? this.updatesLog.get(Array.from(this.updatesLog.keys())[0]): value;
			versionDescription += value.map(desc => "<li>" + desc + "</li>").join("");
		} 
		versionDescription += "</ul>";
		return versionDescription;
	} 
}
