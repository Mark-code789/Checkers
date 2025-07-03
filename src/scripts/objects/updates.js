window.Updates = {
	version: "31.23.220.590", 
	updatesLog: null, 
	init: async function () {
		let res = await fetch('./src/scripts/objects/updates log.json');
		if(!res.ok)
			throw new Error('Error fetching updates log');

		let logs = await res.json();
			logs = Object.entries(logs);
		this.updatesLog = new Map(logs);
	},
	getLatestVersion: function () {
		return [...this.updatesLog].at(-1)[0];
	},
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
