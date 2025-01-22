class GameStats {
	static value = [];
	static init () {
		let stats = storage && storage.getItem('checkers-game-stats');
		stats = stats && JSON.parse(stats) || [];

		this.value = stats;

		for(let stat of stats) {
			let date = new Date(stat.ms);
			Version.setVersion(stat.version);
			Level.setLevel(stat.level);
			Mode.setMode(stat.mode);
			this.add(null, null, date, true);
		}

		Level.resetLevel();
		Mode.reset();
	}

	static view () {
		UIHistory.push("#main-window", "#games-window");
		if(!this.value.length)
			Notify.popUpNote("The games you will have played will be shown here");
			
	} 
	
	static showTotalStats (elem) {
		UIHistory.push(undefined, ".games_totals");
	} 
	
	static add (winner, draw, date, initializing = false) {
		if(!initializing) {
			this.value.push({
				playerName: [PLAYER_A.name, PLAYER_B.name],
				pieceColor: [PLAYER_A.pieceColor.toUpperCase(), PLAYER_B.pieceColor.toUpperCase()],
				gameStatus: [draw? "DRAW": PLAYER_A.is(winner)? "WON": "LOST", draw? "DRAW": PLAYER_B.is(winner)? "WON": "LOST"], 
				piecesRemaining: [PLAYER_A.pieces, PLAYER_B.pieces], 
				kingsMade: [PLAYER_A.kings, PLAYER_B.kings], 
				movesMade: [PLAYER_A.moves, PLAYER_B.moves],
				capturesMade: [PLAYER_A.captures, PLAYER_B.captures], 
				longestCapture: [PLAYER_A.longestCapture, PLAYER_B.longestCapture], 
				time: [(Timer.AH + "").padStart(2, '0') + ":" + (Timer.AM + "").padStart(2, '0'), (Timer.BH + "").padStart(2, '0') + ":" + (Timer.BM + "").padStart(2, '0')],
				ms: date.getTime(),
				mode: Mode.getMode(), 
				version: Version.getVersion(),
				level: Mode.is('single-player') && Level.getLevel()
			});
		}
		
		let length = this.value.length;
	    let mainSec = $("#games-window #games");   
	    let itemSec = $$$("section", ["class", "game_item", "date", date.toDateString()]);
	    let ref = mainSec.$(`section[date='${date.toDateString()}']:last-of-type`);
	    if(!ref) {
			let today = new Date().toDateString();
			let yesterday = new Date();
				yesterday.setDate(yesterday.getDate()-1);
				yesterday = yesterday.toDateString();
				
	    	let str = date.toDateString() == today? "Today": 
					  date.toDateString() == yesterday? "Yesterday":
					  date.toDateString();
	    	if(!ref) {
	    		let dateSec = $$$("section", ["class", "games_date", "date", date.toDateString(), "textContent", str]);
				mainSec.appendChild(dateSec);
				ref = dateSec;
	    	}
	    } 
		
		let text = `${PLAYER_A.name} VS ${PLAYER_B.name} <br/>
					<span>${Version.getVersion().toCamelCase()} Checkers <br/>
					${Mode.is('single-player')? Level.getLevel().toCamelCase() + ' Level': 
					Mode.getMode().toCamelCase()} &nbsp&nbsp(${date.toTime(12)})</span>`;
					
	    let p = $$$("p", ["innerHTML", text]);
	    let btn = $$$("button", ["class", "active", "textContent", "SEE STATS"]);
	    btn.addEventListener("click", () => this.getStats(length - 1), false);
	    itemSec.appendChild(p);
	    itemSec.appendChild(btn);
	    mainSec.insertBefore(itemSec, ref.nextElementSibling);
	    $(".totals_footer p").textContent = "Total of " + length + " game" + (length > 1? "s":"") + " played so far...";
		
		
		!initializing && storage && storage.setItem("checkers-game-stats", JSON.stringify(this.value));
		
		this.getTotals();
		Player.reset();
	} 
	
	static getStats (no) {
		let section = $(".stats_section");
			section.innerHTML = "";
		let stat = this.value[no];
		let icons = $$(".stats_header .player_A_icon, .stats_header .player_B_icon");
		icons[0].classList.remove('black_icon', 'white_icon');
		icons[0].classList.add(`${stat.pieceColor[0].toLowerCase()}_icon`);
		icons[1].classList.remove('black_icon', 'white_icon');
		icons[1].classList.add(`${stat.pieceColor[1].toLowerCase()}_icon`);
		
	    for(let key of Object.keys(stat)) {
	    	if(/version|level|ms|mode/gi.test(key))
	    		continue;
			
	    	let value = stat[key];
	    	let item = $$$("div");
			item.classList.add("stats_item");
			let val1 = $$$("div");
			val1.classList.add("stats_value");
			let name = $$$("div");
			val1.classList.add("stats_name");
			let val2 = $$$("div");
			val2.classList.add("stats_value");
			
			key = key.replaceAll(/[A-Z]/g, t => ' ' + t).toCamelCase();
			val1.innerHTML = String(value[0]).toCamelCase();
			val2.innerHTML = String(value[1]).toCamelCase();
			name.innerHTML = key;
			
			item.appendChild(val1);
			item.appendChild(name);
			item.appendChild(val2);
			section.appendChild(item);
	    } 
	
	    AudioPlayer.play('click');
		UIHistory.push("#games-window", "#stats-window");
	} 
	
	static getTotals () {
		for(let div of $$(".totals_div")) {
			let p = div.$("p");
			p.innerHTML = p.innerHTML.replace(/\d+/gi, 0);
			p.setAttribute("total", 0);
			let conts = div.$$("div");
			for(let cont of conts) 
				div.removeChild(cont);
		} 
		for(const stat of this.value) {
			let mode = stat.mode;
			let names = structuredClone(stat.playerName);
			let name1 = stat.playerName[0];
			let name2 = stat.playerName[1];
			let status1 = stat.gameStatus[0].toLowerCase();
			let status2 = stat.gameStatus[1].toLowerCase();
			let version = stat.version.toUpperCase();
			version = version? version.length == 3? Version.getVersions().find((v) => {
				return v.toUpperCase().startsWith(version);
			}).toUpperCase() + " CHECKERS": version: "Unknown";
			
			let table = $(`#${names.join("-")}`) || $(`#${names.reverse().join("-")}`) || $$$("table", ["id", names.join("-")]);
			let thead = table.$("thead") || $$$("thead");
			let tbody = table.$("tbody") || $$$("tbody");
			let tr1 = thead.$$("tr")[0] || $$$("tr");
			let tr2 = thead.$$("tr")[1] || $$$("tr");
			let tr3 = tbody.$$("tr")[0] || $$$("tr", ["name", name1]);
			let tr4 = tbody.$$("tr")[1] || $$$("tr", ["name", name2]);
			
			if(!tr1.parentNode || !tr1.$(`th[value='${version}']`)) {
				let th;
				if(!tr1.parentNode) {
					th = $$$("th", ["textContent", "Player", "rowspan", "2"]);
					tr1.appendChild(th);
				} 
				th = $$$("th", ["textContent", version, "value", version, "colspan", "4"]);
				tr1.appendChild(th);
				th = $$$("th", ["textContent", "Wins", "value", version]);
				tr2.appendChild(th);
				th = $$$("th", ["textContent", "Losses", "value", version]);
				tr2.appendChild(th);
				th = $$$("th", ["textContent", "Draws", "value", version]);
				tr2.appendChild(th);
				th = $$$("th", ["textContent", "Win Probability", "value", version]);
				tr2.appendChild(th);
				
				if(!tr1.parentNode) {
					thead.appendChild(tr1);
					thead.appendChild(tr2);
				} 
				
				let td;
				if(!tr3.parentNode) {
					td = $$$("td", ["textContent", name1, "name", name1]);
					tr3.appendChild(td);
				} 
				let count = status1 == "won"? 1: 0;
				td = $$$("td", ["textContent", count, "count", count, "value", version]);
				tr3.appendChild(td);
				count = status1 == "lost"? 1: 0;
				td = $$$("td", ["textContent", count, "count", count, "value", version]);
				tr3.appendChild(td);
				count = status1 == "draw"? 1: 0;
				td = $$$("td", ["textContent", count, "count", count, "value", version]);
				tr3.appendChild(td);
				
				let cells = tr3.$$(`td[value='${version}']`);
				let prob = (parseInt(cells[0].getAttribute("count")) / (parseInt(cells[0].getAttribute("count")) + parseInt(cells[1].getAttribute("count")) + parseInt(cells[2].getAttribute("count"))) * 100).toFixed(0);
				td = $$$("td", ["textContent", prob + "%", "value", version, "prob", prob]);
				tr3.appendChild(td);
				
				if(!tr4.parentNode) {
					td = $$$("td", ["textContent", name2, "name", name2]);
					tr4.appendChild(td);
				} 
				count = status2 == "won"? 1: 0;
				td = $$$("td", ["textContent", count, "count", count, "value", version]);
				tr4.appendChild(td);
				count = status2 == "lost"? 1: 0;
				td = $$$("td", ["textContent", count, "count", count, "value", version]);
				tr4.appendChild(td);
				count = status2 == "draw"? 1: 0;
				td = $$$("td", ["textContent", count, "count", count, "value", version]);
				tr4.appendChild(td);
				
				cells = tr4.$$(`td[value='${version}']`);
				prob = (parseInt(cells[0].getAttribute("count")) / (parseInt(cells[0].getAttribute("count")) + parseInt(cells[1].getAttribute("count")) + parseInt(cells[2].getAttribute("count"))) * 100).toFixed(0);
				td = $$$("td", ["textContent", prob + "%", "value", version, "prob", prob]);
				tr4.appendChild(td);
				
				if(!tr3.parentNode) {
					tbody.appendChild(tr3);
					tbody.appendChild(tr4);
					
					table.appendChild(thead);
					table.appendChild(tbody);
				} 
			}
			else if(tr1.$(`th[value='${version}']`)) {
				tr3 = tbody.$(`td[name='${name1}']`).parentNode;
				let cells = tr3.$$(`td[value='${version}']`);
				let cell = status1 == "won"? cells[0]: status1 == "lost"? cells[1]: cells[2];
				let count = parseInt(cell.getAttribute("count")) + 1;
				cell.textContent = count;
				cell.setAttribute("count", count);
				
				let prob = (parseInt(cells[0].getAttribute("count")) / (parseInt(cells[0].getAttribute("count")) + parseInt(cells[1].getAttribute("count")) + parseInt(cells[2].getAttribute("count"))) * 100).toFixed(0);
				cells[3].textContent = prob + "%";
				cells[3].setAttribute("prob", prob);
				
				tr4 = tbody.$(`td[name='${name2}']`).parentNode;
				cells = tr4.$$(`td[value='${version}']`);
				cell = status2 == "won"? cells[0]: status2 == "lost"? cells[1]: cells[2];
				count = parseInt(cell.getAttribute("count")) + 1;
				cell.textContent = count;
				cell.setAttribute("count", count);
				
				prob = (parseInt(cells[0].getAttribute("count")) / (parseInt(cells[0].getAttribute("count")) + parseInt(cells[1].getAttribute("count")) + parseInt(cells[2].getAttribute("count"))) * 100).toFixed(0);
				cells[3].textContent = prob + "%";
				cells[3].setAttribute("prob", prob);
			}
			let prob1 = tr3.$$(`td[value='${version}']`);
			let prob2 = tr4.$$(`td[value='${version}']`);
			prob1 = prob1[prob1.length-1];
			prob2 = prob2[prob2.length-1];
			prob1.classList.remove("active", "red_ui");
			prob2.classList.remove("active", "red_ui");
			if(prob1.getAttribute("prob") > prob2.getAttribute("prob")) {
				prob1.classList.add("active");
				prob2.classList.add("red_ui");
			}
			else if(prob1.getAttribute("prob") < prob2.getAttribute("prob")) {
				prob1.classList.add("red_ui");
				prob2.classList.add("active");
			}
			
			let div;
			if(mode == "single-player" || name1.toLowerCase() == "you" && name2.toLowerCase() == "ai") {
				div = $(".single_player_totals");
			}
			else if(mode == "two-players-online") {
				div = $(".online_totals");
			}
			else if(mode == "two-players-offline") {
				div = $(".offline_totals");
			}
			else {
				div = $(".uncategorized_totals");
			}
			
			if(!table.parentNode) {
				let cont = $$$("div");
				cont.appendChild(table);
				div.appendChild(cont);
			} 
				
			let p = div.$("p");
			let count = parseInt(p.getAttribute("total")) + 1;
			p.innerHTML = p.innerHTML.replace(/\d+/gi, count);
			p.setAttribute("total", count);
		}
	} 
	
	static async clear () {
		if(!this.value.length) {
			Notify.popUpNote("No games played yet.");
			return;
		} 
			
		let response = await Notify.confirm({
		        header: "Are you sure you want clear?", 
		        message: "Once done this action can not be undone.", 
                type: "CANCEL/CLEAR"
		});
		
		if(response == "CLEAR") {
			$("#games").innerHTML = "";
			
			let p = $(".totals_footer p");
				p.innerHTML = p.innerHTML.replace(/\d+/gi, 0);
				
			$(".float_date").textContent = "";
			$(".float_date").removeAttribute("value");
			
			this.value = [];

			storage && storage.removeItem('checkers-game-stats');
			
			this.getTotals();
		    Notify.popUpNote("Games cleared successfully");
		} 
	} 
} 