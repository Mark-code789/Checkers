class Play {
	static date;
	static #hintCount = 0;
	static #undoCount = 0;
	static isOver = false;
	static trainingMode = false;
	static async start (request = false) {
		let ready = this.playersReady(request);
		if(!ready) 
			return;
			
		let isOnline = Mode.is("two-players-online"); 
			
		if($("#play-window").classList.contains("hide"))
			return this.setWindow(isOnline && !request);

		/* if(Mode.is('single-player')) {
			let action = await Notify.confirm({
				header: 'Training Mode',
				message: 'Do you wish to train the AI?',
				type: 'NO/YES'
			});

			if(action == 'YES')
				this.trainingMode = true;
			else
				this.trainingMode = false;
		} */
		
		
		this.level = 9;
		this.firstPlayer = Player.whoseTurn();
		this.date = new Date();
		this.#hintCount = 0;
		this.#undoCount = 0;
		this.board = new Board();
		await this.setBoard();
			  this.countPieces();
			  this.updateScore(this.board.getPiecesPerPlayer());
			  this.initSoundButton();
			  this.initHintButton();
		await Timer.reset();
		await MoveChecker.reset();
			  this.setWindow(isOnline && !request);
		await this.changeShadow();
			  this.scaleFont();
		await this.setPlayerTurn();
		await Helper.showPossibleMoves();
		await Timer.start();
		await WorkerManager.setData();
		WorkerManager.onWorkComplete = Bot.onWorkComplete.bind(Bot);
		WorkerManager.onDone = Bot.onDone.bind(Bot);
		
		// this.level = prompt('Enter level:\n1: Beginner - 12: Grand Master', "12");
		// this.level = parseInt(this.level) || 12;
		
		
		this.updatePenalties('undo', 0);
		this.updatePenalties('hint', 0);
		
		if(isOnline && !request) {
			Channel.requestPlay();
			Notify.alert({
				header: "Play Request", 
				message: `Play request has been sent to ${PLAYER_B.name}, play will start once request is accepted.`
			});
			return;
		} 
		
		await new Sleep().wait(0.5);
		Bot.makeMove(); 
	} 
	
	static async end (endGameId) {
		let id = Player.whoseTurn();
		let player = Player.getPlayerFrom(id);
		let isDraw = endGameId == 1;
		let isNonCapture = PLAYER_A.pieces == PLAYER_B.pieces && PLAYER_A.pieces == this.board.getPiecesPerPlayer();
		
		if(Mode.is('single-player')) {
			let winComment = [
				"Wonderful! Good start. ✨", 
				"Kudos! You are doing great. 👍", 
				"What a good learner! 👏", 
				"Very good play. 👌", 
				"Bravo! You are becoming a pro. 😎", 
				"Amazing! You are a pro indeed. 😱", 
				"Brilliant! You are really intelligent. 🤔", 
				"What can I say Master 🤷‍♂️! Wonderful!", 
				"You are simply a masterclass player. Congratulations 🥇👏",
				"Welcome to the club of champions. Congratulations 🎉🎉",
				"You are now a world champion! Congratulations 👏👏",
			];
			
			let score = this.calculateScore(PLAYER_A.pieces);
						Level.setScore(score);
			
			let isWin = !isDraw && !PLAYER_A.is(player);
			let winner = Player.invert(player);
			let level = Level.getLevelAsInt();
			let nextLevel = isWin && Level.unlockNext();
			let nextLevelComment = nextLevel && nextLevel.startsWith('already-unlocked')? 'Do you wish to try next level?': 
								   nextLevel? 'You have unlocked ' + nextLevel.toCamelCase() + ' Level':
								   'You can try out other versions';
			let loseComment = "Amending mistakes you made, can guarantee you a win.<br>Practice make perfect!";
			let drawComment = isNonCapture && 'Those were really clever moves! you forced out a draw.' ||
							  'You are really hard to crack. This is a draw.<br>Do you think by continuing you can change this around?';
							
			if(!isDraw && isWin) 
				AudioPlayer.play('gameWin');
			else if(!isDraw) 
				AudioPlayer.play('gameLose');

			if(this.trainingMode) {
				let json = await WorkerManager.getTrainingData();
				let blob = new Blob([json], {type: 'application/json'});
				let file = new File([blob], 'training data.json');
				let formData = new FormData();
				formData.append('action', 'update-training-data');
				formData.append('files[]', file);
				let res = await fetch('../portal/server/test.php', {
					method: 'post',
					body: formData
				});

				if(res.ok) {
					res = await res.json();
					if(typeof res == 'string')
						Notify.popUpNote(res);
				}
				else 
					Notify.popUpNote('Failed to upload the training data.');

				let timeout = setTimeout(() => Notify.triggerAction('CANCEL'), 15000);
				let action = await Notify.confirm({
					header: 'End training session',
					message: 'Do you wish to end this training session?',
					type: 'END/CANCEL',
				});
				
				clearTimeout(timeout);
				if(action == 'END') {
					await GameStats.add(winner, isDraw, this.date);
					this.exit(true);
					return;
				}
				else {
					await GameStats.add(winner, isDraw, this.date);
					await this.restart(true);
					return;
				}
			}
							
			let action = await Notify[(isDraw || isWin && nextLevel) && 'other' || 'confirm']({
				header: isDraw && 'DRAW!' || 'YOU ' + (isWin && 'WIN' || 'LOSE'), 
				message: isDraw && drawComment || isWin && winComment[level] + '<br/>' + nextLevelComment || loseComment,
				type: isDraw && 'MENU/CONTINUE/REPLAY' || isWin && nextLevel && 'MENU/REPLAY/NEXT LEVEL' || 'MENU/REPLAY', 
				icon: isDraw && ICONS.drawIcon || isWin && ICONS.winnerIcon || ICONS.loserIcon,
				iconType: isDraw && 'draw' || isWin && 'winner' || 'loser'
			});
			
			if(action == 'MENU') {
				await GameStats.add(winner, isDraw, this.date);
				this.exit(true);
			} 
			else if(action == 'CONTINUE') {
				Notify.cancel();
				Bot.makeMove();
			} 
			else if(action == 'REPLAY') {
				await GameStats.add(winner, isDraw, this.date);
				await this.restart(true);
			} 
			else if(action == 'NEXT LEVEL') {
				await GameStats.add(winner, isDraw, this.date);
				
				nextLevel = nextLevel == 'already-unlocked'? Level.getNext(): nextLevel;
				let nextLevelElement = $(`#main-window div[action='level'][value='${nextLevel}']`);
				await Level.change(nextLevelElement, nextLevel);
				await this.restart(true);
			} 
		} 
		else if(Mode.is('two-players-online')) {
			let isWin = !isDraw && !PLAYER_A.is(player);
			let winner = Player.invert(player);
			let winComment = "It was an entertaining match. Congratulations on your win 🎉🎉🎉";
			let loseComment = player.name + " went hardbof you there, what about a rematch?";
			let drawComment = isNonCapture && 'Those were really clever moves! you forced out a draw.' ||
							  'You are really hard to crack. This is a draw.<br>Do you think by continuing you can change this around?';
							
			if(!isDraw && isWin) 
				AudioPlayer.play('gameWin');
			else if(!isDraw) 
				AudioPlayer.play('gameLose');
							
			let action = await Notify[isDraw && 'other' || 'confirm']({
				header: isDraw && 'DRAW!' || 'YOU ' + (isWin && 'WIN' || 'LOSE'), 
				message: isDraw && drawComment || isWin && winComment || loseComment,
				type: isDraw && 'MENU/CONTINUE/REPLAY' || 'MENU/REPLAY', 
				icon: isDraw && ICONS.drawIcon || isWin && ICONS.winnerIcon || ICONS.loserIcon,
				iconType: isDraw && 'draw' || isWin && 'winner' || 'loser'
			});
			
			if(action == 'MENU') {
				await GameStats.add(winner, isDraw, this.date);
				await this.exit(true);
			} 
			else if(action == 'CONTINUE') {
				Notify.cancel();
			} 
			else if(action == 'REMATCH') {
				await GameStats.add(winner, isDraw, this.date);
				await this.restart(true);
			} 
		} 
		else if(Mode.is('two-players-offline')) {
			let winner = Player.invert(player);
			let winHeader = !isDraw && 'CONGRATULATIONS ' + winner.name.toUpperCase() + '!';
			let winComment = "It was an entertaining match. " + player.name + " do you want a rematch?";
			let drawComment = isNonCapture && 'Well! Well! those were clever moves.<br>But there are no moves to play,<br>what about a rematch?' ||
							  "You people really don't wanna give in to each other.<br>Do you still want to continue?";
							
			if(!isDraw) 
				AudioPlayer.play('gameWin');
							
			let action = await Notify[isDraw && !isNonCapture && 'other' || 'confirm']({
				header: isDraw && 'DRAW!' || winHeader, 
				message: isDraw && drawComment || winComment,
				type: isDraw && !isNonCapture && 'MENU/CONTINUE/REMATCH' || 'MENU/REMATCH', 
				icon: isDraw && ICONS.drawIcon || ICONS.winnerIcon,
				iconType: isDraw && 'draw' || 'winner'
			});
			
			if(action == 'MENU') {
				await GameStats.add(winner, isDraw, this.date);
				await this.exit(true);
			} 
			else if(action == 'CONTINUE') {
				Notify.cancel();
			} 
			else if(action == 'REMATCH') {
				await GameStats.add(winner, isDraw, this.date);
				await this.restart(true);
			} 
		} 
	} 
	
	static action (newElem, value) {
		switch (value) {
			case "restart":
				this.restart();
				break;
				
			case "undo":
				this.undo();
				break;
				
			case "hint":
				this.hint(newElem);
				break;
				
			case "about":
				this.showAboutInfo();
				break;
				
			case "menu":
				this.exit();
				break;
				
			case "sound":
				this.changeSound(newElem);
				break;
		} 
	} 
	
	static setBoard () {
		let board = this.board;
		let size = board.getSize();
		let headings = $$("#play-window .header_section *");
		let playState = $$("#play-window p.state_updater");
		let frames = $$("#play-window .frame");
		let boardElement = $("#play-window #table");
		let labelCharacters = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";
		let scene = $('.scene');
		let ft, fr, fb, fl;
		
		scene.classList[Mode.is('two-players-offline') && 'add' || 'remove']('two_players_offline');
		document.documentElement.style.setProperty('--board-size', size);
		
		headings[0].textContent = Version.getVersion().toUpperCase() + " CHECKERS";
		headings[1].textContent = this.trainingMode && 'SELF PLAY' || Mode.is('single-player') && Level.getLevel().toUpperCase() + " LEVEL" ||
								  PLAYER_A.name + ' VS ' + PLAYER_B.name;
		playState[0].textContent = headings[1].textContent;
		playState[1].textContent = headings[1].textContent;
		
		[...frames].forEach((frame) => {
			[...frame.children].forEach((p, n) => {
				if(n >= size)
					p.style.display = 'none';
				else
					p.style.display = 'flex';
			});
		});
		
		for(let i = 0; i < size; i++) {
			for(let j = 0; j < size; j++) {
				let blackPiece = board.getColor(i, j) == board.BLACK_ID;
				let blackKing = blackPiece && board.isKing(i, j);
				let whitePiece = board.getColor(i, j) == board.WHITE_ID;
				let whiteKing = whitePiece && board.isKing(i, j);
				let cell = board.getCell(i, j);
				
				let cellValue = i + '' + j;
				let cellElement = boardElement.$(`.cell[value='${cellValue}']`);
				let previousCell = cellElement && cellElement.previousElementSibling || null;
				
				let style  = `top: calc(100% / var(--board-size) * ${i}); `;
            		style += `left: calc(100% / var(--board-size) * ${j})`;
            
            	if(j == 0) {
	                ft = frames[0].children[size-1-i];
	                fb = frames[2].children[i];
	                ft.innerHTML = labelCharacters.charAt(i);
	                fb.innerHTML = labelCharacters.charAt(i);
	            }
	            if(j == 0 || j == size-1) {
	                fr = frames[1].children[i];
	                fl = frames[3].children[size-1-i];
	                fr.innerHTML = i+1;
	                fl.innerHTML = i+1;
	            } 
				
				if(cell) { // black cell
					let initialCellValue = cellElement && parseInt(cellElement.getAttribute("value"));
					let isSimilarCell = cellElement && cellElement.classList.contains('cell_black') && 
										initialCellValue == cellValue || false;
										
					let pieceElement = cellElement && cellElement.children[0];
					let isSimilarPiece = blackPiece && pieceElement && pieceElement.classList.contains("piece_black") ||
										 whitePiece && pieceElement && pieceElement.classList.contains("piece_white") || 0;
					
					if(cellElement) {
						cellElement.classList.remove('valid', 'invalid', 'helper_move', 'helper_capture', 'hint', 'cell_disabled');
						if(!isSimilarCell) {
							cellElement.classList.remove("cell_white");
							cellElement.classList.add("cell_black");
							cellElement.setAttribute("value", cellValue);
							cellElement.setAttribute("style", style);
						} 
						else {
							// cellElement.setAttribute("style", style);
						} 
					} 
					else {
						cellElement = $$$('div', ['class', 'cell cell_black', 'value', cellValue, 'style', style]);
						boardElement.insertBefore(cellElement, previousCell);
					} 
					
					cellElement.setAttribute("onclick", "MoveChecker.check(event)");
					
					if(isSimilarPiece && blackPiece | whitePiece && !(blackKing | whiteKing)) {
						pieceElement.classList.remove('crown_black', 'crown_white');
					} 
					if(!isSimilarPiece && blackPiece | whitePiece) {
						let newPieceElement = $$$("div", ["class", (blackPiece && "piece_black" || "piece_white") + (blackKing && ' crown_black' || whiteKing && ' crown_white' || '')]);
						if(pieceElement)
						cellElement.replaceChild(newPieceElement, pieceElement);
						else
						cellElement.appendChild(newPieceElement);
					} 
					else if(pieceElement && !(blackPiece | whitePiece)) {
						pieceElement.parentElement.removeChild(pieceElement);
					} 
					
					pieceElement = cellElement.children[0];
					pieceElement && pieceElement.classList.remove('half_flip_vertically', 'incomplete_move');
					
					if(Mode.is('two-players-offline') && (blackPiece | whitePiece)) 
						pieceElement.classList.add('half_flip_vertically');
				} 
				else {
					let initialCellValue = cellElement && parseInt(cellElement.getAttribute("value"));
					let isSimilarCell = cellElement && cellElement.classList.contains('cell_white') && 
										initialCellValue == cellValue || false;
										
					if(cellElement) {
						cellElement.innerHTML = "";
						if(!isSimilarCell) {
							cellElement.classList.remove("cell_black");
							cellElement.classList.add("cell_white");
							cellElement.setAttribute("value", cellValue);
							cellElement.setAttribute("style", style);
						} 
					} 
					else {
						cellElement = $$$('div', ['class', 'cell cell_white', 'value', cellValue, 'style', style]);
						boardElement.insertBefore(cellElement, previousCell);
					} 
					
					cellElement.removeAttribute("onclick");
				} 
				
				cellElement.classList.remove('valid', 'invalid', 'pre_valid');
			} 
		} 
	} 
	
	static setWindow (hide = false) {
		if(hide) {
			$("#play-window").classList.add("visible", "hide");
			return;
		} 
		
		while(!$("#main-window").classList.contains("visible")) 
			UIHistory.undo();
		
		$("#play-window").classList.remove("hide");
		UIHistory.push("#main-window", "#play-window");
	} 
	
	static async setPlayerTurn () {
		let firstMove = Setting.get('first-move');
		
		if(firstMove == 'roll-dice') {
			Notify.alertSpecial({
				header: 'Rolling Dice', 
				message: 'please wait...'
			});
			
			let res = await Dice.roll();
			Notify.cancel();
			
			firstMove = res && 'white' || 'black';
			
			let player = Player.getPlayerFrom(firstMove);
			let header = '';
			if(Mode.is('single-player', 'two-players-online')) {
				header = PLAYER_A.is(player) && PLAYER_A.name.toUpperCase() + ' WON DICE ROLL. MAKE FIRST MOVE' || PLAYER_A.name.toUpperCase() + ' LOST DICE ROLL. WAIT FOR YOUR OPPONENT\'S MOVE';
			} 
			else {
				header = player.name.toUpperCase() + ' WON DICE ROLL. MAKE FIRST MOVE';
			} 
			
			await Notify.popUpAlert({
				header, 
				iconType: 'dice', 
				icon: ICONS.diceIcon, 
				delay: 3000
			});
		} 
		
		Player.setTurn(firstMove);
	} 
	
	static playersReady (request = false) {
		if(PLAYER_A.name && PLAYER_B.name) 
			return true;
			
		if(Mode.is("two-players-online")) {
			if(Channel.isConnected())
				Notify.popUpNote("Waiting for opponent to join");
			else
				Notify.popUpNote("Subscribe first to the platform by clicking submit");
		} 
		else if(Mode.is("two-players-offline")) {
			Notify.popUpNote("Please fill out player names first");
		} 
		
		return false;
	} 
	
	static countPieces () {
		let count = this.board.getPiecesCount();
		
		let A_name = Mode.is('single-player') && PLAYER_A.pieceColor || PLAYER_A.name;
		let B_name = Mode.is('single-player') && PLAYER_B.pieceColor || PLAYER_B.name;
		let A_pieces = count[PLAYER_A.id];
		let B_pieces = count[PLAYER_B.id];
		
		Player.setPiecesCount(A_pieces, B_pieces);
		this.updateStatus(`${A_name}: ${A_pieces}		${B_name}: ${B_pieces}`);
		this.updateScore(A_pieces);
	} 
	
	static updateStatus (status = "") {
		let updaters = $$("#play-window pre.state_updater");
		for(let updater of updaters) updater.textContent = status;
	} 
	
	static updateScore (count) {
		let score = this.calculateScore(count);
		let scoreElem = $$('#play-window .score');
		scoreElem[0].classList.remove('pc_1', 'pc_2', 'pc_3');
		scoreElem[1].classList.remove('pc_1', 'pc_2', 'pc_3');
		scoreElem[0].classList.add('pc_' + score);
		scoreElem[1].classList.add('pc_' + score);
	}
	
	static updatePenalties (type, count) {
		let penalties = $$("#play-window .penalties div:" + (type == 'undo' && 'first-of-type' || 'last-of-type'));
		if(count == 0) {
			penalties[0].style.display = "none";
			penalties[1].style.display = "none";
		}
		else {
			penalties[0].children[0].textContent = count;
			penalties[1].children[0].textContent = count;
			penalties[0].style.display = "block";
			penalties[1].style.display = "block";
		}
	} 
	
	static calculateScore (count) {
		let penalty = this.#undoCount > 0 || this.#hintCount > 0;
		let piecesPerPlayer = this.board.getPiecesPerPlayer();
		count = penalty? 0: count;
		
		if (count >= piecesPerPlayer * (3/4)) {
			return 3;
		} 
		else if(count >= piecesPerPlayer * (1/2)) {
			return 2;
		} 
		else if(count >= piecesPerPlayer * (1/4)) {
			return 1;
		} 
		else {
			return penalty? 0.1: 0;
		} 
	} 
	
	static initSoundButton () {
		let sound = AudioPlayer.getSound();
		let soundElements = $$("#play-window button[action='controls'][value='sound']");
		for(let soundElement of soundElements) soundElement.classList[(sound && "add" || "remove")]("sound");
	} 

	static initHintButton () {
		let penalty = Level.getPreviousLevelPenalty();
		let hintElements = $$("#play-window button[action='controls'][value='hint']");

		this.#hintCount = Number(!penalty)-1;
		console.log(this.#hintCount, penalty);
		for(let hintElement of hintElements) hintElement.classList[(penalty && "add" || "remove")]("lock");
	} 
	
	static async changeShadow () {
		if(UIValue.getValue($('#play-window'), 'display', false) != 'grid')
			return;
			
		document.documentElement.style.setProperty('--piece-size', '80%');
		await new Sleep().wait(0.5);
		
		let view = Setting.get('view');
		let piece = $("#table .cell div");
		let pieceSize = UIValue.getValue(piece, 'width');
		document.documentElement.style.setProperty('--piece-size', pieceSize + 'px');
	} 
	
	static scaleFont () {
		let timers = $$("#play-window .three_d_timer > span > span");
		for(let timer of timers) {
			let parentWidth = timer.parentElement.getBoundingClientRect().width;
			let width = timer.getBoundingClientRect().width;
			let expectedWidth = parentWidth - 8;
			let scaleFactor = expectedWidth / width;
			timer.style.transform = `scale(${scaleFactor})`;
		} 
	} 
	
	static descaleFont () {
		let timers = $$("#play-window .three_d_timer > span > span");
		for(let timer of timers) {
			timer.removeAttribute('style');
		} 
	} 
	
	static async restart (isGameOver = false, request = false) {
		if(!isGameOver && Mode.is('single-player') && PLAYER_B.turn)
			return Notify.popUpNote('Please wait for your opponents move.');
			
		if(Mode.is("two-players-online") && !request) {
			Channel.requestRestart();
			Notify.alertSpecial({
				header: "Restart Request", 
				message: `Restart request has been sent to ${PLAYER_B.name}, play will start once request is accepted.`
			});
		} 
		
		await Timer.reset();

		this.firstPlayer = Player.whoseTurn();
		this.date = new Date();
		this.#hintCount = 0;
		this.#undoCount = 0;
		this.board = new Board();
			  this.setBoard();
			  this.countPieces();
			  this.initHintButton();
		await this.setPlayerTurn();
		await Helper.showPossibleMoves();
		await Timer.start();
		await WorkerManager.setData();
		WorkerManager.onWorkComplete = Bot.onWorkComplete.bind(Bot);
		WorkerManager.onDone = Bot.onDone.bind(Bot);

		this.updatePenalties('undo', 0);
		this.updatePenalties('hint', 0);
		
		await new Sleep().wait(0.5);
		Bot.makeMove();
		
		if(Mode.is("two-players-online") && request)
			Channel.allSet();
	} 
	
	static async undo (opponent = false) {
		
		if(Mode.is('single-player') && this.#undoCount >= 5) 
			return Notify.popUpNote('You can not undo more than 5 times');
			
		if(Mode.is('single-player', 'two-players-online') && PLAYER_B.turn && !opponent)
			return Notify.popUpNote('Please wait for your opponents move.');
			
		if(!Player.madeMoves()) 
			return Notify.popUpNote('No move played yet');
			
		if(Mode.is('single-player', 'two-players-online')) 
			await MovePlayer.undo();
			
		await MovePlayer.undo();

		if(Mode.is('single-player'))
			this.updatePenalties('undo', ++this.#undoCount);
			
		this.countPieces();
		
		if(Mode.is("two-players-online") && !opponent)
			Channel.send({
				message: {
					title: "Undone", 
					content: ""
				}
			});
	} 
	
	static async hint (elem) {
		if(Mode.is('single-player', 'two-players-online') && PLAYER_B.turn)
			return Notify.popUpNote('Please wait for your opponents move.');

		if(this.#hintCount == -1)
			return Notify.popUpNote('Please win the previous level without using hint or undo buttons.');
			
		if(this.#hintCount >= 3) 
			return Notify.popUpNote('You can not hint more than 3 times');
			
		await this.updatePenalties('hint', ++this.#hintCount); 
			
		let hintElems = $$('#play-window button[action="controls"][value="hint"]');
		hintElems[0].classList.add('wait');
		hintElems[1].classList.add('wait');
		
		await new Sleep().wait(0.01);
		await Bot.hint();
		await AudioPlayer.play('notification', 0.1);
		
		hintElems[0].classList.remove('wait');
		hintElems[1].classList.remove('wait');
		
		if(Mode.is("two-players-online"))
			Channel.send({
				message: {
					title: "Hint", 
					content: ""
				}
			});
	} 
	
	static isOn () {
		return UIValue.getValue($('#play-window'), 'display') != 'none';
	} 
	
	static showAboutInfo () {
        let message = "";
        let version = Version.getVersion();
        let src = FLAGS[version];
        switch(version) {
            case "american":
                message = `American Checkers also known as English/Standard Checkers is played on 8x8 board with each player having 12 pieces at the start of the game. 
						   Men (uncrowned pieces) are only allowed to move forwards. 
						   When there is multiple capturing sequence, one is expected to choose only one and not necessarily the one that will result in multiple captures. 
						   All the captures in the chosen sequence should be made. Kings (crowned pieces) can capture and move both forwards and backwards. 
						   However, they can move only one square.`;
                break;
            case "kenyan":
                message = `Kenyan Checkers is played on 8x8 board with each player having 12 pieces at the start of the game. 
						   Men (uncrowned pieces) can only move and capture forward. 
						   In the event of capture, a piece reaches the far end of the board and there are more captures to be made, the piece will continue uncrowned. 
						   Kings (crowned pieces) can move and capture both forwards and backwards. 
						   However in the event of a capture, a king can jump multiple steps and land only to the immediate square after the captured piece. 
						   Incase of multiple captures, one should make sure all the captures in the chosen path are made.`;
                break;
            case "casino":
                message = `Casino Checkers is a Kenyan checkers game played on 8x8 board with each player having 12 pieces at the start of the game. 
						   Men (uncrowned pieces) can only move forward one square. 
						   They can however capture two squares both forwards and backwards. 
						   In the event of capture, a piece reaches the far end of the board and there are more captures to be made, the piece will continue uncrowned. 
						   Kings (crowned pieces) can move and capture both forwards and backwards. 
						   However in the event of a capture, a king can jump multiple steps and land only to the immediate square after the captured piece. 
						   Incase of multiple captures, one should make sure all the captures in the chosen path are made.`;
                break;
            case "international":
                message = `International Checkers is played on 10x10 board with each player having 20 pieces at the start of the game. 
						   Men (uncrowned pieces) can only move one square forward. 
						   However they can capture both forwards and backwards. 
						   In the event of capture, a piece reaches the far end of the board and there are more captures to be made, the piece will continue uncrowned. 
						   Kings (crowned pieces) can move and capture multiple steps both forwards and backwards. 
						   They are also called flying kings. 
						   Incase of multiple captures, you can only choose one that favors your game. 
						   However, all the captures in the chosen path should be made exhaustively.`;
                break;
            case "pool":
                message = `Pool Checkers is played on 8x8 board with each player having 12 pieces at the start of the game. 
						   Men (uncrowned pieces) can only move one square forward. 
						   However, they can capture both forwards and backwards. 
						   In the event of capture, a piece reaches the far end of the board and there are more captures to be made, the piece stops and becomes crowned. 
						   Kings (crowned pieces) can move and capture multiple steps both forwards and backwards. 
						   They are also called flying kings. 
						   Incase of multiple captures, you can only choose one that favors your game. 
						   However, all the captures in the chosen path should be made exhaustively`;
                break;
            case "russian":
                message = `Russian Checkers is played on 8x8 board with each player having 12 pieces at the start of the game. 
						   Men (uncrowned pieces) can only move one square forward. 
						   However, they can capture both forwards and backwards. 
						   In the event of capture, a piece reaches the far end of the board and there are more captures to be made, the piece is crowned and continues as a king. 
						   Kings (crowned pieces) can move and capture multiple steps both forwards and backwards. 
						   They are also called flying kings. 
						   Incase of multiple captures, you can only choose one that favors your game. 
						   However all the captures in the chosen path should be made exclusively.`;
                break;
            case "nigerian":
                message = `Nigerian Checkers is similar to international checkers with the difference being, the longest diagonal is align to the right of the players. 
						   The game is played on 10x10 board with each player having 20 pieces at the start of the game. 
						   Men (uncrowned pieces) can only move one square forward. 
						   However they can capture both forwards and backwards. 
						   In the event of capture, a piece reaches the far end of the board and there are more captures to be made, the piece will continue uncrowned. 
						   Kings (crowned pieces) can move and capture multiple steps both forwards and backwards. 
						   They are also called flying kings. 
						   Incase of multiple captures, you can only choose one that favors your game. 
						   However, all the captures in the chosen path should be made exhaustively.`;
                break;
        }
        
        Notify.alert({
			header: `<img src=${src}> <span>${version.toUpperCase() + " CHECKERS"}</span>`, 
			message
		});
	} 
	
	static async exit (isGameOver = false, isOpponent = false) {
		if(!isGameOver && Player.madeMoves() && !isOpponent) {
			let response = await Notify.confirm({
				header: "Are you sure really want to exit?", 
				message: "The current progress will be lost!", 
				type: "CANCEL/EXIT", 
			});
			
			if(response == "CANCEL") return;
		} 
		
		this.descaleFont();
		
		$("#play-window").classList.remove("hide");
		
		Timer.stop();
		UIHistory.undo();
		
		if(Mode.is("two-players-online") && !isOpponent)
			Channel.send({
				message: {
					title: "ExitedGame", 
					content: ""
				}
			});
	} 
	
	static changeSound (soundElement) {
		AudioPlayer.toggleMute();
		soundElement.classList.toggle("sound");
	} 
}