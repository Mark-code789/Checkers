'use strict'

// Version: 24

// object to store the most needed images 
const Icons = {
    alertIcon: "", 
    confirmIcon: "", 
    winnerIcon: "", 
    loserIcon: "", 
    drawIcon: "",
    loadIcon: "",
    diceIcon: "" 
}
// object to store the most needed audio 
const Sound = { 
    click: "",
    capture: "",
    king: "", 
    collect: "", 
    game_win: "", 
    game_lose: "",
    notification: "", 
    muted: false
}

// for caching purposes 
let storage = null;
if(localStorage) storage = localStorage;

// srcs to load the resources needed
// images srcs
let srcs = ["american flag.jpeg",
            "kenyan flag.jpeg",
            "casino flag.jpeg", 
            "international flags.jpeg",
            "pool flag.jpeg",
            "russian flag.jpeg",
            "nigerian flag.jpeg",
            "background1.jpeg",
            "background2.jpeg", 
            "black cell.jpeg", 
            "white cell.jpeg",
            "frame.jpeg", 
            "hint.png", 
            "menu.png", 
            "restart.png", 
            "undo.png", 
            "about.png",
            "black piece.png",
            "white piece.png", 
            "black crown.png", 
            "white crown.png",
            "sound on.png",
            "sound off.png",
            "send.png", 
            "cancel.png", 
            "alert.png",
            "confirm.png", 
            "winner.png",
            "loser.png", 
            "draw.png",
            "load.png",
            "dice roll.png", 
            "warning.png", 
			"lock.png", 
            "star.png"];
// audio srcs 
let sounds = ["click.mp3",
              "capture.mp3", 
              "king.mp3", 
              "collect.mp3",
              "game win.mp3", 
              "game lose.mp3", 
              "notification.mp3"];
// to access audio object keys
let soundProps = Object.keys(Sound);
// to access css values and image keys
let imageProps = ["--english-flag",
                    "--kenyan-flag",
                    "--casino-flag", 
                    "--international-flags",
                    "--pool-flag",
                    "--russian-flag",
                    "--nigerian-flag", 
                    "--bg1",
                    "--bg2", 
                    "--black-cell", 
                    "--white-cell",
                    "--frame",
                    "--hint",
                    "--menu", 
                    "--restart", 
                    "--undo", 
                    "--about",
                    "--black-piece", 
                    "--white-piece", 
                    "--black-crown", 
                    "--white-crown",
                    "--sound-on",
                    "--sound-off",
                    "--send-btn",
                    "--cancel",
                    Object.keys(Icons)[0],
                    Object.keys(Icons)[1], 
                    Object.keys(Icons)[2],
                    Object.keys(Icons)[3], 
                    Object.keys(Icons)[4],
                    Object.keys(Icons)[5],
                    Object.keys(Icons)[6]
                    ];
// use recursive function to load the images in srcs and updating the progress bar
let loadingInfo = $("#load-window .loader p");
let progress = $("#load-window .loader .progress");

async function LoadResources (src, i = 0) {
    if(src.includes(".mp3")) {
        src = "./src/audio/" + src;
    } 
    else {
        src = "./src/images/" + src;
    }
    let response = await fetch(src);
    if(response.status === 200) {
        let blob = await response.blob();
        if(blob.size > 0) {
            if(!src.includes(".mp3")) {
            	loadingInfo.innerHTML = "Loading textures...";
            	progress.style.width = `calc(calc(100% / 3) * ${(i + 1) / srcs.length} + calc(100% / 3))`;
                src = await URL.createObjectURL(blob);
                srcs.splice(i, 1, src);
                if(i < imageProps.length - Object.keys(Icons).length) {
                    document.documentElement.style.setProperty(imageProps[i], `url(${src})`);
                }
                else if(i < imageProps.length) {
                    Icons[imageProps[i]] = src;
                }
            } 
            else {
            	loadingInfo.innerHTML = "Loading audio...";
            	progress.style.width = `calc(calc(100% / 3) * ${(i + 1 - srcs.length) / sounds.length} + calc(100% / 1.5))`;
                src = await URL.createObjectURL(blob);
                let audio = new Audio(src);
                Sound[soundProps[i - srcs.length]] = audio;
            }
            i++;
            if(i < srcs.length) {
                LoadResources(srcs[i], i);
            }
            else if(i < srcs.length + sounds.length) {
                LoadResources(sounds[i - srcs.length], i);
            }
            else {
                await setTimeout(LoadingDone, 1000);
                loadingInfo.innerHTML = "Finishing...";
            } 
        }
        else if(!goingToRefresh) {
            alert("BUFFERING ERROR!\nFailed to buffer fetched data to an array data.");
        } 
    }
    else {
    	console.log(i, srcs.length);
        alert("LOADING ERROR!\nFailed to load AppShellFiles - " + src + ". Either you have bad network or you have lost internet connection.");
    } 
} 

async function LoadingDone () {
	imageProps = null;
	soundProps = null;
	sounds = null;
	srcs.slice(6, srcs.length - 8);
	
	if(screen.orientation.type.includes("landscape")) {
		document.body.style.backgroundSize = "auto 70vmax";
	} 
	
    document.documentElement.style.setProperty("--star", `url(${srcs[srcs.length-1]})`);
    document.documentElement.style.setProperty("--warning", `url(${srcs[srcs.length-3]})`);
    
    $("#item1").style.display = "none";
   
    document.addEventListener("fullscreenchange", _ => Fullscreen(true, true), false);
    document.addEventListener("msFullscreenchange", _ => Fullscreen(true, true), false);
    document.addEventListener("mozFullscreenchange", _ => Fullscreen(true, true), false);
    document.addEventListener("webkitFullscreenchange", _ => Fullscreen(true, true), false);
   
    let drag = new Drag($("#chat-icon"), "both", "0.5s");
    $("#chat-icon").addEventListener("touchstart", drag.start, false);
    $("#chat-icon").addEventListener("touchend", drag.end, false);
    $("#chat-icon").addEventListener("touchmove", drag.move, false);
    $("#chat-icon").addEventListener("click", drag.end, false);
    
    $("#chat-icon").addEventListener("mousedown", drag.start, false);
    $("#chat-icon").addEventListener("mouseup", drag.end, false);
    $("#chat-icon").addEventListener("mousemove", drag.move, false);
    
    drag = new Drag($(".games_totals"), "y", "0.5s");
    $(".games_totals").addEventListener("touchstart", drag.start, false);
    $(".games_totals").addEventListener("touchend", drag.end, false);
    $(".games_totals").addEventListener("touchmove", drag.move, false);
    
    $(".games_totals").addEventListener("mousedown", drag.start, false);
    $(".games_totals").addEventListener("mouseup", drag.end, false);
    $(".games_totals").addEventListener("mousemove", drag.move, false);
    
    $("#games").addEventListener("scroll", GamesScroll.check, false);
    $(".totals_footer button").addEventListener("click", ShowTotalStats, false);
    
    Disable($("#two-players-window #playerB .white"), general.disabled, "#B4B4B4");
    general.selected = $("#main .default");
    general.level = $("#nav .default");
   
    $("#load-window").style.display = "none";
    $("#main-window").style.display = "grid";
    
    let btns = $$("#main-window #levels #nav div");
    let btn = null;
    let p = null;
    
    if(storage === null || storage.getItem("Checkers - versions") === null) {
        for(btn of btns) {
            p = btn.children[1];
            if(btn.getAttribute("value") != "lockers ") {
                p.children[0].classList.add("not_achieved");
                p.children[1].classList.add("not_achieved");
                p.children[2].classList.add("not_achieved");
            } 
            else {
                p.style.filter = "grayscale(0%) invert(0%) brightness(100%)";
                p.style.backgroundImage = `url(${srcs[srcs.length-2]})`;
            } 
        }
        if(storage) {
            storage.setItem("Checkers - versions", JSON.stringify(Game.versions));
            storage.setItem("Checkers - version", Game.version);
        } 
    }
    else {
        try {
            Game.versions = JSON.parse(storage.getItem("Checkers - versions"));
            let version = storage.getItem("Checkers - version");
            version = /^\d+/gi.test(version)? "american": version;
            Game.version = version;
            version = $(`#main-window .version[value='${version}']`);
            await Version(version, undefined, false);
        } catch (error) {console.log(error);}
        
        Game.stats = JSON.parse(storage.getItem("Checkers - stats")) || [];
        
        let length = Game.stats.length;
        let mainSec = $("#games-window #games");
        try {
        	$(".totals_footer p").textContent = "Total of " + length + " game" + (length > 1? "s":"") + " played so far...";
            for(let i = 0; i < length; i++) {
                let no = i;
                const stat = Game.stats[no];
                let itemSec = $$$("section", ["class", "game_item"]);
                let ref;
                if(stat.ms) {
                	let today = new Date();
                	let yesterday = new Date();
                	yesterday.setDate(today.getDate() - 1);
                	let date = new Date(stat.ms);
                	let str = date.toLocaleDateString('en-US', {weekday: "long", month: "short", year: "numeric"}).split(" ");
                	str = date.toDateString() == today.toDateString()? "Today": date.toDateString() == yesterday.toDateString()? "Yesterday": str[2] + ", " + str[0] + " " + date.getDate() + " " + str[1];
                	ref = mainSec.$(`section[date='${date.toDateString()}']:last-of-type`);
                	if(!ref) {
                		let dateSec = $$$("section", ["class", "games_date", "date", date.toDateString(), "textContent", str]);
                		let leastDiff = Number.MAX_SAFE_INTEGER;
                		for(let sec of mainSec.$$(".games_date")) {
                			if(sec.getAttribute("date") == "sometime back") continue;
                			let diff = new Date(sec.getAttribute("date")).getTime() - date.getTime();
	                		if(Math.abs(diff) < leastDiff && diff < 0) {
								leastDiff = Math.abs(diff);
	                			ref = sec;
	                		}
	                	}
						if(ref) {
							ref = mainSec.$(`section[date='${ref.getAttribute("date")}']:last-of-type`);
							//ref = ref[ref.length-1];
							mainSec.insertBefore(dateSec, ref.nextElementSibling);
						}
						else {
							mainSec.appendChild(dateSec);
						} 
						ref = dateSec;
                	}
                	itemSec.setAttribute("date", date.toDateString());
                }
                else {
                	ref = mainSec.$("section[date='sometime back']:last-of-type");
                	if(!ref) {
                		let dateSec = $$$("section", ["class", "games_date", "date", "sometime back", "textContent", "Sometime Back"]);
                		mainSec.appendChild(dateSec);
                		ref = dateSec;
                	}
                	itemSec.setAttribute("date", "sometime back");
                }
                
                if(stat.version) {
                	if(stat.version.length == 3) {
		                let versions = Object.keys(Game.versions);
		                stat.version = versions.find((v) => {return v.startsWith(stat.version.toLowerCase())}).toLowerCase().replaceAll(/^\w|\s\w/g, (t) => t.toUpperCase());
						stat.version += !/checkers$/gi.test(stat.version)? " Checkers": "";
					} 
					if(stat.level)
						stat.level = stat.level.toLowerCase().replaceAll(/^\w|\s\w/g, (t) => t.toUpperCase());
				}
                p = $$$("p", ["innerHTML", `${stat.playerName[0]} VS ${stat.playerName[1]} ${stat.version? "<br><span>" + stat.version + (!stat.mode || stat.mode == "single-player"? (stat.level? "<br>" + stat.level: ""): "<br>" + stat.mode.replaceAll("-", " ").replaceAll(/^\w|\s\w/g, (t) => t.toUpperCase())) + "&nbsp&nbsp" + ConvertTo(new Date(stat.ms).toTimeString(), 12) + "</span>": ""}`]);
                let btn = $$$("button", ["class", "default", "textContent", "SEE STATS"]);
                btn.addEventListener("click", () => GetStats(no), false);
                itemSec.appendChild(p);
                itemSec.appendChild(btn);
                mainSec.insertBefore(itemSec, ref.nextElementSibling);
            }
            GetTotals();
        } catch (error) {alert(error.message); navigator.serviceWorker.controller.postMessage(error.message + "\n" + error.stack);}
      
        // Mute
        let muted = storage.getItem("Checkers - muted");
        if(muted == "false") {
            Mute(JSON.parse(muted));
            $("#unmute").style.background = general.default;
            $("#mute").style.background = general.background;
        }
        else if(muted == "true") {
            Mute(JSON.parse(muted));
            $("#mute").style.background = general.default;
            $("#unmute").style.background = general.background;
        }
        else {
            storage.setItem("Checkers - muted", JSON.stringify(Sound.muted));
        }
        
        // First Move 
        let firstMove = JSON.parse(storage.getItem("Checkers - first_move"));
        if(firstMove) {
            Game.whiteTurn = firstMove.whiteTurn;
            Game.rollDice = firstMove.rollDice;
            btns = $$("#item3 button");
            if(firstMove.rollDice == true) {
                btns[0].style.background = general.background;
                btns[1].style.background = general.background;
                btns[2].style.background = general.default;
            }
            else if(firstMove.rollDice == false) {
                if(firstMove.whiteTurn) {
                    btns[0].style.background = general.default;
                    btns[1].style.background = general.background;
                }
                else {
                    btns[0].style.background = general.background;
                    btns[1].style.background = general.default;
                } 
                btns[2].style.background = general.background;
            }
        } 
        else {
            storage.setItem("Checkers - first_move", JSON.stringify({whiteTurn: Game.whiteTurn, rollDice: Game.rollDice}));
        }
       
        // Play As
        let playAs = JSON.parse(storage.getItem("Checkers - play_as"));
        if(playAs) {
            if(playAs.alternate == true) {
                btn = $$("#item4 button")[2];
                await Clicked(btn, btn.parentNode, false);
                await PlayAs(btn);
            }
            else {
                btn = playAs.playerA == "White"? $$("#item4 button")[0]: $$("#item4 button")[1];
                await Clicked(btn, btn.parentNode, false);
                await PlayAs(btn);
            } 
        }
        else {
            storage.setItem("Checkers - play_as", JSON.stringify({playerA: playerA.pieceColor, playerB: playerB.pieceColor, alternate: Game.alternatePlayAs}));
        } 
       
        // Mandatory Capture
        let mandatoryCapture = storage.getItem("Checkers - mandatory_capture");
        
        if(mandatoryCapture) {
        	mandatoryCapture = JSON.parse(mandatoryCapture);
            Game.mandatoryCapture = mandatoryCapture;
            btns = $$("#item5 button");
            if(mandatoryCapture == true) {
                btns[0].style.background = general.default;
                btns[1].style.background = general.background;
            }
            else if(firstMove.rollDice == false) {
                btns[0].style.background = general.background;
                btns[1].style.background = general.default;
            }
        } 
        else {
            storage.setItem("Checkers - mandatory_capture", JSON.stringify(Game.mandatoryCapture));
        }
       
        // Helper 
        let helper = JSON.parse(storage.getItem("Checkers - helper"));
        if(helper) {
            Game.helper= helper.helper;
            Game.capturesHelper = helper.capturesHelper;
            btns = $$("#item6 button");
            if(helper.capturesHelper == true && helper.helper == true) {
                btns[0].style.background = general.default;
                btns[1].style.background = general.background;
                btns[2].style.background = general.background;
            }
            else if(helper.capturesHelper == false && helper.helper == false) {
                btns[0].style.background = general.background;
                btns[1].style.background = general.default;
                btns[2].style.background = general.background;
            }
            else if(helper.capturesHelper == true && helper.helper == false) {
                btns[0].style.background = general.background;
                btns[1].style.background = general.background;
                btns[2].style.background = general.default;
            } 
        } 
        else {
            storage.setItem("Checkers - helper", JSON.stringify({helper: Game.helper, capturesHelper: Game.capturesHelper}));
        }
    }
    
    if(deferredEvent && !newSW) {
        $(".install").classList.add("show_install_prompt");
    } 
    else if(newSW)
    	InvokeSWUpdateFlow(newSW);
    
    document.addEventListener("visibilitychange", (e) => {
		if(document.visibilityState == "visible") {
			AdjustBoard();
		} 
	});
    window.addEventListener("orientationchange", AdjustBoard);
    
    UpdateOnlineStatus();
    window.addEventListener("beforeunload", async (e) => {
        e.preventDefault();
        if(Lobby.isConnected)
            await Unsubscribe();
    });
    window.addEventListener("online", UpdateOnlineStatus, false);
    window.addEventListener("offline", UpdateOnlineStatus, false);
    window.addEventListener("popstate", () => setTimeout(PopState, 0), false);
    CheckHref();
}

class Drag {
	initialX = 0;
	initialY = 0;
	currentX = 0;
	cureentY = 0;
	xOffset = 0;
	yOffset = 0;
	active = false;
	direction = "both";
	dragItem = null;
	initialDrag = {x: 0, y: 0};
	sleep;
	transitionDuration;
	
	constructor (dragItem, direction = "both", duration = "0.5s") {
		this.direction = direction;
		this.dragItem = dragItem;
		this.transitionDuration = duration;
		this.sleep = new Sleep();
	} 
	start = (e) => {
		if(this.dragItem == e.target) {
			this.active = true;
			this.dragItem.style.transitionDuration = "0s";
		    if (e.type === "touchstart") {
		        this.initialX = e.touches[0].clientX - this.xOffset;
		        this.initialY = e.touches[0].clientY - this.yOffset;
		    } else {
		        this.initialX = e.clientX - this.xOffset;
		        this.initialY = e.clientY - this.yOffset;
		    }
		} 
	}
	
	end = async (e) => {
	    if(this.active && (e.type === "touchend" || e.type == "mouseup")) {
			this.active = false;
			this.dragItem.style.transitionDuration = this.transitionDuration;
			if(this.dragItem === $("#chat-icon")) {
		        if(this.currentX < (65 - window.innerWidth)/2) {
		            this.translate((65 - window.innerWidth), this.currentY, this.dragItem);
		            this.currentX = (65 - window.innerWidth);
		        }
		        if(this.currentX > (65 - window.innerWidth)/2) {
		            this.translate(5, this.currentY, this.dragItem);
		            this.currentX = 5;
		        }
		        if(this.currentY < -5) {
		            this.translate(this.currentX, -5, this.dragItem);
		            this.currentY = -5;
		        }
		        if(this.currentY > (window.innerHeight - 65)) {
		            this.translate(this.currentX, (window.innerHeight - 65), this.dragItem);
		            this.currentY = (window.innerHeight - 65);
		        }
			}
			else if(this.dragItem === $(".games_totals")) {
				let rect = this.dragItem.getBoundingClientRect();
				let parRect = this.dragItem.parentNode.getBoundingClientRect();
				let offset = rect.bottom - parRect.bottom;
				if(rect.top >= (rect.height * 0.25) + rect.top - offset) {
					let dist = parRect.bottom - rect.top;
					this.translate(0, this.currentY + dist, this.dragItem);
					this.currentY = 0;
					BackState.state.pop();
				}
				else {
					let dist = rect.bottom - parRect.bottom;
					this.currentY -= dist;
					this.translate(0, this.currentY, this.dragItem);
				} 
			}
			await this.sleep.wait(parseFloat(this.transitionDuration));
	        this.xOffset = this.currentX;
	        this.yOffset = this.currentY;
	    }
	    else if(!this.active && this.dragItem == e.target) {
	        ShowChat();
		} 
	}
	
	move = async (e) => {
	    if(this.active) {
			e.preventDefault();
	        if (e.type === "touchmove") {
	            this.currentX = e.touches[0].clientX - this.initialX;
	            this.currentY = e.touches[0].clientY - this.initialY;
	        } else {
	            this.currentX = e.clientX - this.initialX;
	            this.currentY = e.clientY - this.initialY;
	        }
	      
			if(this.direction == "both") {
	        	this.translate(this.currentX, this.currentY, e.target);
			} 
			else if(this.direction == "x") {
				this.translate(this.currentX, 0, e.target);
			}
			else {
				if(this.dragItem.classList.contains("games_totals")) {
					let rect = this.dragItem.getBoundingClientRect();
					let parRect = this.dragItem.parentNode.getBoundingClientRect();
					let dist = this.currentY - this.yOffset;
					let yThreshold = parRect.bottom - rect.height;
					let expectedY = dist + rect.top;
					if(expectedY < yThreshold) {
						this.currentY -= (expectedY - yThreshold);
					}
				} 
				this.translate(0, this.currentY, this.dragItem);
			}
			this.xOffset = this.currentX;
			this.yOffset = this.currentY;
	    }
	}
	
	translate = (x, y, elem) => {
	    elem.style.transform = "translate3d(" + x + "px, " + y + "px, 0)";
	}
} 

const HideChat = () => {
    $("#chat-window").style.display = "none";
    $("#chat-icon").style.display = "block";
    
    let unreadBubble = $(".center_bubble");
    if(unreadBubble != null) {
        unreadBubble.parentNode.removeChild(unreadBubble);
    } 
}

const ShowChat = () => {
    $("#chat-icon").style.display = "none";
    $("#chat-window").style.display = "flex";
   
    let badge = $(".badge");
    if(parseInt(badge.innerHTML) > 0) {
        $(".center_bubble").scrollIntoView({block: "start", behavior: "smooth"});
    } 
    $('.chat_field').focus();
    badge.innerHTML = 0;
    badge.style.display = "none";
    while(Lobby.unreadMessages.length > 0) {
    	let id = Lobby.unreadMessages[0];
    	Publish.send({channel: Lobby.CHANNEL, message: {title: "Read", content: id}});
    	Lobby.unreadMessages.shift();
    } 
}

const BoardClick = async (e) => {
	if(e.target.classList.contains("cell")) {
		let index = Array.from($("#table").children).indexOf(e.target);
		let i = Math.floor(index / Game.boardSize);
		let j = index % Game.boardSize;
		ValidateMove({cell: e.target, i, j});
	} 
} 

const LoadBoard = async (playerAPieceColor, playerBPieceColor) => {
	let board = $("#table");
	let frame = $$(".frame");
	let ftc, frc, fbc, flc;
	let cells = board.children;
	let isEmpty = Game.state.length === 0? true: false;
	let chars = "ABCDEFGHIJKLMNOPQRST";
	let count = 0;
    for(let i = 0; i < Game.boardSize; i++) {
        if(isEmpty) 
        Game.state.push([]);
        
        for(let j=0; j < Game.boardSize; j++) {
            if(Game.version == "american" || Game.version == "kenyan" || Game.version == "casino" || Game.version == "russian" || Game.version == "pool") {
                if(j == 0) {
                    ftc = frame[0].children[Game.boardSize-1-i];
                    fbc = frame[2].children[i];
                    ftc.innerHTML = chars.charAt(i);
                    fbc.innerHTML = chars.charAt(i);
                }
                if(j == 0 || j == Game.boardSize-1) {
                    frc = frame[1].children[i];
                    flc = frame[3].children[Game.boardSize-1-i];
                    frc.innerHTML = i+1;
                    flc.innerHTML = i+1;
                } 
            }
            else if(Game.version == "nigerian") {
                if(i % 2 == 0 && j % 2 == 0 || i % 2 == 1 && j % 2 == 1) {
                    ++count;
                    if(i == 0) {
                        ftc = frame[0].children[Game.boardSize-1-j];
                        ftc.innerHTML = count;
                    } 
                    if(j == 0) {
                        flc = frame[3].children[i];
                        flc.innerHTML = count;
                    }
                    if(j == Game.boardSize-1) {
                        frc = frame[1].children[Game.boardSize-1-i];
                        frc.innerHTML = count;
                    }
                    if(i == Game.boardSize-1) {
                        fbc = frame[2].children[j];
                        fbc.innerHTML = count;
                    } 
                } 
            }
            else if(Game.version == "international") {
                if(i % 2 == 0 && j % 2 == 1 || i % 2 == 1 && j % 2 == 0) {
                    ++count;
                    if(i == 0) {
                        ftc = frame[0].children[Game.boardSize-1-j];
                        ftc.innerHTML = count;
                    } 
                    if(j == 0) {
                        flc = frame[3].children[i];
                        flc.innerHTML = count;
                    }
                    if(j == Game.boardSize-1) {
                        frc = frame[1].children[Game.boardSize-1-i];
                        frc.innerHTML = count;
                    }
                    if(i == Game.boardSize-1) {
                        fbc = frame[2].children[j];
                        fbc.innerHTML = count;
                    } 
                } 
            }
            
            let cell = cells[(i*Game.boardSize)+j] || await $$$("div");
            if(!cell.classList.contains('cell')) 
                cell.classList.add("cell");
            
            cell.style.top = `calc(100% / var(--board-size) * ${i})`;
            cell.style.left = `calc(100% / var(--board-size) * ${j})`;
            cell.id = i + "" + j;
            let ref = cells[(i*Game.boardSize+j)+1];
            if(!cell.parentNode) 
            	table.insertBefore(cell, ref);
            
            if(Game.version != "nigerian" && (j%2 == 1 && i%2 == 0 || j%2 == 0 && i%2 == 1) || Game.version === "nigerian" && (j%2 == 0 && i%2 == 0 || j%2 == 1 && i%2 == 1)) {
                if(!cell.classList.contains('cell_black')) {
                    cell.classList.add("cell_black");
                    cell.addEventListener("click", BoardClick, false);
                }
                if(isEmpty) {
	                if(i < Game.rowNo) {
	                    let div = $$$("div");
	                    //change color of the piece where according to the choice of the player
	                    if(playerBPieceColor === "Black") {
	                        div.classList.add("piece_black");
	                        Game.state[i].push("MB"); // pushing MEN-BLACK
	                    } 
	                    else if(playerBPieceColor === "White") {
	                        div.classList.add("piece_white");
	                        Game.state[i].push("MW"); // pushing MEN-WHITE
	                    } 
	                    cell.appendChild(div);
	                } 
	                else if(i > Game.boardSize - Game.rowNo - 1) {
	                    let div = $$$("div");
	                    //change color of the piece where according to the choice of the player
	                    if(playerAPieceColor === "White") {
	                        div.classList.add("piece_white");
	                        Game.state[i].push("MW"); // pushing MEN-WHITE
	                    } 
	                    else if(playerAPieceColor === "Black") {
	                        div.classList.add("piece_black");
	                        Game.state[i].push("MB"); // pushing MEN-BLACK
	                    } 
	                    cell.appendChild(div);
	                } 
	                else {
	                    Game.state[i].push("EC"); // pushing EMPTY-CELL
	                }
				}
				else {
					if(Game.state[i][j].includes("B")) {
						let div = $$$("div");
						div.classList.add("piece_black");
						if(Game.state[i][j] == "KB")
						div.classList.add("crown_black");
						cell.appendChild(div);
					}
					else if(Game.state[i][j].includes("W")) {
						let div = $$$("div");
						div.classList.add("piece_white");
						if(Game.state[i][j] == "KW")
						div.classList.add("crown_white");
						cell.appendChild(div);
					} 
				} 
            }
            else {
                if(!cell.classList.contains('cell_white')) {
                    cell.classList.add("cell_white");
                }
                if(isEmpty)
                	Game.state[i].push("NA"); // pushing NOT-AVAILABLE
            } 
            await Prms("done");
        }
        await Prms("done");
    }
   
    for(let i = Game.boardSize; i < frame[0].children.length; i++) {
        frame[0].children[i].style.display = "none";
        frame[1].children[i].style.display = "none";
        frame[2].children[i].style.display = "none";
        frame[3].children[i].style.display = "none";
    }
    //$("#play-window").style.display = "none";
	//$("#play-window").style.opacity = "1";
    return Prms("done");
} 

const Refresh = async (restart = false, color = playerA.pieceColor, gameState = []) => {
    // remove all the temporary css classes 
    let cells = $$("#table .cell");
    for(let cell of cells) {
        cell.className = "";
        cell.innerHTML = "";
        cell.removeEventListener("click", BoardClick, false);
    }
   
    for(let p of $$(".frame p")) {
        p.innerHTML = "";
        p.style.display = "flex";
    } 
    let table = $("#table");
    if(table.children.length > Math.pow(Game.boardSize)) {
        for(let i = 0; i < Math.sqrt(table.children.length); i++) {
        	for(let j = 0; j < Math.sqrt(table.children.length); j++) {
        		if(i < Game.boardSize && j >= Game.boardSize) {
					table.removeChild(table.$("#" + i + "" + j));
				}
				else if(i >= Game.boardSize) {
					table.removeChild(table.$("#" + i + "" + j));
				} 
			} 
        } 
    } 
   
    // reset all the game states and players states
    if(storage.getItem("Checkers-Test-State5")) {
		Game.state = JSON.parse(storage.getItem("Checkers-Test-State"));
	}
	else {
		Game.state = gameState;
	   /*[["NA", "EC", "NA", "EC", "NA", "EC", "NA", "MB"],
		["MB", "NA", "EC", "NA", "EC", "NA", "EC", "NA"],
		["NA", "KW", "NA", "MW", "NA", "KW", "NA", "EC"],
		["EC", "NA", "EC", "NA", "EC", "NA", "EC", "NA"],
		["NA", "EC", "NA", "EC", "NA", "EC", "NA", "KB"],
		["EC", "NA", "EC", "NA", "EC", "NA", "EC", "NA"],
		["NA", "EC", "NA", "EC", "NA", "MB", "NA", "MW"],
		["EC", "NA", "EC", "NA", "EC", "NA", "EC", "NA"]];*/
	} 
	BackState.moves = [];
    Game.track = [];
    Game.moves = {};
    Game.date = new Date();
    Game.over = false;
    Game.possibleWin = false;
    Game.isComputer = false;
    Game.pieceSelected = false;
    Game.validForHint = true;
    Game.prop = null;
    Game.baseStateCount = 1;
    Game.drawStateCount = 0;
    Game.hintCount = 0;
    Game.undoCount = 0;
    general.aiPath = [];
    general.sorted = [];
    playerA.kings = 0;
    playerA.moves = 0;
    playerA.captures = 0;
    playerA.longestCapture = 0;
    playerB.kings = 0;
    playerB.moves = 0;
    playerB.captures = 0;
    playerB.longestCapture = 0;
    Timer.reset();
    
    $("#play-window .header_section h2").innerHTML = Game.version.toUpperCase() + " CHECKERS";
    
    if(restart && Game.mode != "two-player-online") {
        start();
        return Prms(true);
    }
    else if(restart) {
        await LoadBoard(playerA.pieceColor, playerB.pieceColor);
        await UpdatePiecesStatus();
        if(Game.firstMove) {
            let id = playerA.pieceColor.slice(0,1);
            Game.moves = await AssessAll({id, state: Game.state});
            await Helper(Game.moves, Copy(Game.state));
            Notify("You are the one to start. Make a move.");
        }
        else {
        	let id = playerB.pieceColor.slice(0,1);
            Game.moves = await AssessAll({id, state: Game.state});
            await Helper(Game.moves, Copy(Game.state));
            Notify(`${playerB.name} will make the first move. Please wait.`);
        } 
        AdjustBoard();
        return Prms(true);
    } 
    
    async function start () {
        let res = null;
        let btns = $$("#item3 button");
        if(Game.rollDice) {
            res = await RollDice();
            Game.whiteTurn = (playerA.pieceColor.includes("White"))? res: !res;
        }
        else {
            Game.whiteTurn = (GetValue(btns[0], "background-image") == general.default);
        } 
        await LoadBoard(playerA.pieceColor, playerB.pieceColor);
        await UpdatePiecesStatus();
        Game.baseState = Copy(Game.state);
        if(Game.mode === "single-player") {
            $$("#play-window .penalties div")[0].style.display = "none";
            $$("#play-window .penalties div")[1].style.display = "none";
            $$("#play-window .penalties div")[2].style.display = "none";
            $$("#play-window .penalties div")[3].style.display = "none";
            if(general.orientation.toLowerCase().includes("landscape")) {
                let versions = ["american", "kenyan", "casino", "international", "pool", "russian", "nigerian"];
                setTimeout(_ => Notify({action: "pop-up-alert",
                        header: Game.version.toUpperCase() + " CHECKERS<br>" + Game.levels[Game.level].level.toUpperCase(), 
                        icon: srcs[versions.indexOf(Game.version)],
                        iconType: "flag", 
                        delay: 1500}), 500);
            } 
            if(Game.whiteTurn && playerB.pieceColor === "White" || !Game.whiteTurn && playerB.pieceColor === "Black") {
                setTimeout(_ => aiStart(), 100);
                Timer.start("B");
            }
            else if(Game.helper) {
                let id = playerA.pieceColor.slice(0,1);
                Game.moves = await AssessAll({id, state: Game.state});
                await Helper(Game.moves, Copy(Game.state));
                Timer.start("A");
            }
            else {
            	let id = playerA.pieceColor.slice(0,1);
                Game.moves = await AssessAll({id, state: Game.state});
            	Timer.start("A");
            } 
        }
        else if(Game.mode === "two-player-offline") {
            let id = (Game.whiteTurn && playerA.pieceColor === "White" || !Game.whiteTurn && playerA.pieceColor === "Black")? playerA.pieceColor.slice(0,1): playerB.pieceColor.slice(0,1);
            Game.moves = await AssessAll({id, state: Game.state});
            if(Game.helper) 
            	await Helper(Game.moves, Copy(Game.state));
            let player = Game.whiteTurn && playerA.pieceColor == "White" || !Game.whiteTurn && playerA.pieceColor == "Black"? "A": "B";
            Timer.start(player);
        }
        else if((Game.whiteTurn && playerA.pieceColor === "White" || !Game.whiteTurn && playerA.pieceColor === "Black")) {
            let id = playerA.pieceColor.slice(0,1);
            Game.moves = await AssessAll({id, state: Game.state});
            if(Game.helper)
            	await Helper(Game.moves, Copy(Game.state));
            Timer.start("A");
        }
        else {
        	Timer.start("B");
        } 
        
        if(Game.rollDice) {
            if(Game.mode != "two-player-offline") {
                Cancel();
                let t = 500;
                if(general.orientation.toLowerCase().includes("landscape")) {
                	t = 2500;
                } 
                if(res) 
                setTimeout(_ => Notify({action: "pop-up-alert", 
                        header: "YOU WIN!<br>PLAY FIRST.", 
                        icon: Icons.diceIcon, 
                        iconType: "dice", 
                        delay: 1500}), t);
                else if(!res) 
                setTimeout(_ => Notify({action: "pop-up-alert", 
                        header: "YOU LOSE!<br>OPPONENT FIRST.", 
                        icon: Icons.diceIcon, 
                        iconType: "dice", 
                        delay: 1500}), t);
            } 
            else {
                let name;
                if(res) 
                    name = playerA.name;
                else
                    name = playerB.name;
                    
                setTimeout(_ => Notify({action: "pop-up-alert", 
                        header: name.toUpperCase() + " WON!<br>PLAY FIRST.", 
                        icon: Icons.diceIcon, 
                        iconType: "dice",
                        delay: 1500}), 500);
            } 
        }
        AdjustBoard();
    } 
        
    async function aiStart () {
    	for(let cell of $$("#table .valid, #table .pre_valid, #table .hint, .helper_empty, .helper_filled")) { 
            cell.classList.remove("valid", "pre_valid", "hint", "helper_empty", "helper_filled");
        } 
        let state = Game.state;
    	let id = playerB.pieceColor.substring(0,1);
        Game.moves = await AssessAll({id, state});
        let moves;
        if(Game.mandatoryCapture && Game.moves.captures.length > 0) {
        	moves = Game.moves.captures;
        }
        else if(Game.mandatoryCapture && Game.moves.captures.length == 0) {
        	moves = Game.moves.nonCaptures;
        }
        else if(!Game.mandatoryCapture) {
        	moves = Game.moves.nonCaptures;
        	moves = moves.concat(Game.moves.captures);
        }
        /*await Helper(Game.moves, Copy(Game.state));
        let ai = new AI({moves, depth: Game.level, state});
        console.log(JSON.stringify(moves));
        moves = await ai.sort(moves.reverse(), state);
        console.log(JSON.stringify(moves));
        return;*/
        //console.log(await AssessAll({id: "KB", state}));
        //return;
        
        let chosen = (Math.random()*(moves.length - 1)).toFixed(0);
        let bestMove = moves[chosen];
        let i = parseInt(bestMove.cell.slice(0,1));
        let j = parseInt(bestMove.cell.slice(1,2));
        let m = parseInt(bestMove.empty.slice(0,1));
        let n = parseInt(bestMove.empty.slice(1,2));
        setTimeout( async () => {
            await ValidateMove({cell: $("#table").children[i*Game.boardSize+j], i, j, isComputer: true});
            await ValidateMove({cell: $("#table").children[m*Game.boardSize+n], i: m, j: n, isComputer: true});
        }, 250);
        return Prms("");
    } 
} 

const Alternate = async () => {
    if(playerA.pieceColor == "White") {
        playerA.pieceColor = 'Black';
        playerB.pieceColor = 'White';
    } 
    else if(playerA.pieceColor == "Black") {
        playerA.pieceColor = 'White';
        playerB.pieceColor = 'Black';
    }
    return Prms("done");
} 

const RollDice = () => {
    //use while loop indefinitely to get the right value of the roll
    while(true) {
        let res = Math.round(Math.random()*7) + Math.round(Math.random()*7);
        if(res == 7 || res == 11)
        return true; 
        else if(res == 2 || res == 3 || res == 12) 
        return false;
    } 
}

const BackState = {
    state: [], 
    moves: []
} 

const GetValue = function (elem, value, pseudo = null) {
    return window.getComputedStyle(elem, pseudo).getPropertyValue(value);
}

const RGBValueOf = (hex) => {
    hex = hex.replace("#", "");
    if(hex.length === 3) {
        let newHex = "";
        for(let x of hex) {
            newHex += x + x;
        }
        hex = newHex;
    }
    
    rgb = "rgb(";
    
    rgb += parseInt(hex.slice(0,2), 16) + ", ";
    rgb += parseInt(hex.slice(2,4), 16) + ", ";
    rgb += parseInt(hex.slice(4,6), 16) + ")";
    
    return rgb;
}

const GetPosition = function (x, y) {
	let obj = {};
    obj.cellSize = parseFloat(GetValue($("#table"), "width")) / Game.boardSize;
    obj.top = parseFloat(GetValue($("#table").children[x*Game.boardSize+y], "top"));
	obj.left  = parseFloat(GetValue($("#table").children[x*Game.boardSize+y], "left"));
	return obj;
} 

class Move {
    root = document.documentElement;
    moving = $$(".transmitter.cargo_ready .cargo.move");
    constructor (prop) {
        if(this.moving.length === 0 && prop.select) {
            return this.select(prop);
        }
        else if(this.moving.length === 0 && prop.movePiece) {
            return this.makePath(prop);
        } 
        else if(this.moving.length === 0 && prop.capture) { 
        	return this.select(prop);
        }
        else if(this.moving.length === 0 && prop.captureMove) {
        	return this.captures(prop);
        }
    }
   
    captures = async function (prop) {
        let final = false;
    	let validMove = false;
    	// Remove Helper cells for filtering purposes 
    	for(let cell of $$("#table .helper_empty, #table .pre_valid, #table .valid")) {
    		cell.classList.remove("helper_empty", "pre_valid", "valid");
    	} 
    	for(let sort of general.sorted) {
    		for(let move of sort) {
    			let empty = `${prop.i}${prop.j}`;
    			if(move.empty == empty && sort[0].i == Game.prop.i && sort[0].j == Game.prop.j) {
    				validMove = true;
				    for(let move2 of sort.slice(0, sort.indexOf(move) + 1)) {
					    let cell = $("#table").children[move2.m*Game.boardSize+move2.n];
			            cell.classList.add("valid", "cell_disabled");
					    if(cell.lastChild)
						    cell.removeChild(cell.lastChild);
				    }
    				$$(".controls")[1].classList.add("cell_disabled");
                    $$(".controls")[2].classList.add("cell_disabled");
                    $$(".horiz_controls")[1].classList.add("cell_disabled");
                    $$(".horiz_controls")[2].classList.add("cell_disabled");
				    
    				if(sort.indexOf(move) != sort.length-1) {
    					let clone = Game.prop.cell.lastChild.cloneNode(true);
        				clone.style.opacity = "0.5";
			            prop.cell.appendChild(clone);
					    Game.prop.cell.classList.add("valid", "cell_disabled");
    				} 
    				else {
					    final = true;
    				}
				
					//Filter helper cells
	    			if((Game.helper || Game.capturesHelper) && (Game.mode == "two-player-online" || Game.mode == "two-player-offline" || Game.mode == "single-player" && (Game.whiteTurn && playerA.pieceColor == "White" || !Game.whiteTurn && playerA.pieceColor == "Black"))) {
						let emptyCells = [];
	    				for(let arr of general.sorted) {
							for(let data of arr) {
								if(data.cell == empty) {
									emptyCells.push(...arr.slice(arr.indexOf(data)));
									break;
								} 
							} 
						}
						for(let data of emptyCells) {
							let emptyCell = $("#table").children[data.m*Game.boardSize+data.n];
							if(!emptyCell.classList.contains("pre_valid"))
								emptyCell.classList.add("helper_empty");
						} 
	    			}
					break;
    			}
    		}
		    if(final) {
			    for(let move of sort) {
				    let cell1 = $("#table").children[move.i*Game.boardSize+move.j];
				    let cell2 = $("#table").children[move.m*Game.boardSize+move.n];
				    
				    await this.select({cell: cell1, i: move.i, j: move.j}, true);
				    let track2 = await this.makePath({cell: cell2, i: move.m, j: move.n}, true);
				    track2.a = parseInt(move.capture.slice(0,1));
				    track2.b = parseInt(move.capture.slice(1,2));
				    Game.track.push([Game.prop, track2]);
			    }
			    // removing valid cell states
			    for(let move of sort) {
				    let i = parseInt(move.empty.slice(0,1));
				    let j = parseInt(move.empty.slice(1,2));
				    let cell1 = $("#table").children[i*Game.boardSize+j];
				    cell1.classList.remove("valid");
			    } 
			    Move.startMoving();
			    break;
		    } 
    	}
    	
    	if(validMove && Game.mode === "two-player-online" && (Game.whiteTurn && playerA.pieceColor === "White" || !Game.whiteTurn && playerA.pieceColor === "Black") ) {
            await Publish.send({channel: Lobby.CHANNEL, message: {title: "Moved", content: {i: prop.i, j: prop.j} } });
        }
    	return validMove;
    } 
   
    static startMoving = async function (n = 0) {
   	 Game.prop = Game.track[n][0];
   	 let prop = Game.track[n][1];
   	 prop.n = n;
   	 if(n == Game.track.length-1) {
   		 prop.final = true;
   	 } 
   	 new Move({}).sendCargo(prop, true);
    }
        
        
    select = async function (prop, capture = false) { //try {
    	//publish for selecting both ordinary and capture moves
        if(!capture && Game.mode === "two-player-online" && (Game.whiteTurn && playerA.pieceColor === "White" || !Game.whiteTurn && playerA.pieceColor === "Black") ) {
            await Publish.send({channel: Lobby.CHANNEL, message: {title: "Moved", content: {i: prop.i, j: prop.j} } });
        }
        
        if(this.moving.length > 0) {
            await Move.receiveCargo();
        } 
       
        if(!capture)
	        for(let cell of $$("#table .valid, #table .pre_valid, #table .hint, .helper_empty, .helper_filled")) {
	            cell.classList.remove("valid", "pre_valid", "hint", "helper_empty", "helper_filled");
	        }
        
        Game.pieceSelected = true;
        Game.isComputer = prop.isComputer;
        Game.prop = {cell: prop.cell, i: prop.i, j: prop.j};
        
        prop.cell.classList.add("valid");
        return Prms(true);
        //} catch (error) {Notify({action: "alert", header: "Error 0!", message: error});} 
    } 
    
    makePath = async function (prop, capture = false) { //try {
    	// publish for ordinary moves
    	if(!capture && Game.mode === "two-player-online" && (Game.whiteTurn && playerA.pieceColor === "White" || !Game.whiteTurn && playerA.pieceColor === "Black") ) {
            await Publish.send({channel: Lobby.CHANNEL, message: {title: "Moved", content: {i: prop.i, j: prop.j} } });
        } 
        
        if(!capture) {
            for(let cell of $$("#table .hint"))
                cell.classList.remove("hint");
        	Game.prop.cell.classList.remove("valid");
        } 
        
        if(!capture)
            this.sendCargo({cell: prop.cell, i: prop.i, j: prop.j});
        else {
        	return {cell: prop.cell, i: prop.i, j: prop.j};
        } 
        //} catch (error) {Notify({action: "alert", header: "Error 1!", message: error});} 
    } 
    
    sendCargo = async function (prop, capture = false) { //try {
        let piece = Game.prop.cell.lastChild;
        let transmitter = $(".transmitter");
        let cargo = transmitter.lastElementChild;
        cargo.lastElementChild.classList.add(...Array.from(piece.classList));
        Game.prop.cell.removeChild(piece);
        let data1 = await GetPosition(prop.i, prop.j);
        let data2 = await GetPosition(Game.prop.i, Game.prop.j);
        cargo.style.top = data2.top + "px";
        cargo.style.left = data2.left + "px";
        
        this.root.style.setProperty('--ept', `${data1.top - data2.top}px/*calc(100% * ${prop.i - Game.prop.i})*/`);
        this.root.style.setProperty('--epl', `${data1.left - data2.left}px/*calc(100% * ${prop.j - Game.prop.j})*/`);
        
        let mt = 0.35;
    	let increase = mt * 0.25;
    	let no_of_cells = Math.abs(Game.prop.i - prop.i);
    	for(let i = 1; i < no_of_cells; i++) {
    		mt += increase;
    	} 
    	this.root.style.setProperty("--mt", mt + "s");
        
       
        /*if(general.orientation.toLowerCase().includes("landscape")) {
        	mt += mt * 0.5;
        	this.root.style.setProperty("--mt", mt + "s");
        } */
        
        general.prop = prop;
        
        cargo.setAttribute('onanimationend', `Move.receiveCargo(${capture})`);
        transmitter.classList.add("cargo_ready");
        cargo.classList.add("move");
        //} catch (error) {Notify({action: "alert", header: "Error 2!", message: error});} 
    } 
    
    static receiveCargo = async function (capture) { 
        let prop = general.prop;
        let root = document.documentElement;
        Game.pieceSelected = false;
        //try {
        if(Game.prop != null && prop != null) {
            for(let cell of $$("#table .valid, #table .pre_valid, #table .hint, .helper_empty, .helper_filled")) {
                cell.classList.remove("valid", "pre_valid", "hint", "helper_empty", "helper_filled");
            } 
            general.sorted = [];
            let transmitter = $(".transmitter");
            let cargo = transmitter.lastElementChild;
            let piece = cargo.lastElementChild.cloneNode(true);
            transmitter.classList.remove("cargo_ready");
            cargo.classList.remove("move");
            cargo.lastElementChild.classList.remove("piece_black", "crown_black", "piece_white", "crown_white");
            
            prop.cell.classList.remove("cell_disabled");
            prop.cell.appendChild(piece);
            
            prop.piece = piece;
            
            // Updating moves made by the player
            if(!capture || prop.final) {
                if(piece.className.includes(playerA.pieceColor.toLowerCase())) 
                	playerA.moves++;
                else
                	playerB.moves++;
            } 
            
            if((Game.version !== "russian" && prop.final || Game.version === "russian" && capture || !capture) && !piece.className.includes("crown") && (prop.i === 0 && piece.className.includes(playerA.pieceColor.toLowerCase()) || prop.i === Game.boardSize - 1 && piece.className.includes(playerB.pieceColor.toLowerCase()))) {
                if(piece.classList.contains("piece_white")) {
                    piece.classList.add("crown_white");
                } 
                else {
                    piece.classList.add("crown_black");
                }
               
                prop.piece = piece;
                prop.king = true;
                if(capture)
                	Game.track[prop.n][1] = prop;
            }  
            
            // Updating Game state
            piece = Game.state[Game.prop.i][Game.prop.j];
            if(!piece.includes("K") && ((Game.version !== "russian" && prop.final || Game.version === "russian" && capture || !capture))) 
                piece = await (prop.i === 0 && piece.includes(playerA.pieceColor.slice(0,1)) || prop.i === Game.boardSize - 1 && piece.includes(playerB.pieceColor.slice(0,1)))? piece.replace("M", "K"): piece;
            Game.state[Game.prop.i][Game.prop.j] = "EC";
            Game.state[prop.i][prop.j] = piece;
            
            if(!capture) {
                // Changing turn
                Game.whiteTurn = !Game.whiteTurn;
                let id;
                id = (piece.includes("W"))? "B":"W";
                let initProp = Game.prop;
                
                id = id.replace(/[MK]/g, "");
                let over = await this.isOver(id);
                if(over)
                    return;
                else { // Game not over
                    BackState.moves.push([initProp, prop]);
                    if(Game.helper) {
                        Game.prop.cell.classList.add("valid");
                        prop.cell.classList.add("valid");
					} 
                    if(prop.king) {
                        AudioPlayer.play("king", 1);
                    } 
                    else {
                        AudioPlayer.play("click", 0.8);
                    } 
                    Helper(Game.moves, Copy(Game.state));
                    
                    if(Game.mode === "single-player" && (Game.whiteTurn && playerB.pieceColor === "White" || !Game.whiteTurn && playerB.pieceColor === "Black") ) {
                        UpdatePiecesStatus("thinking...");
                        setTimeout( async () => { //try {
                            let id = playerB.pieceColor.substring(0,1);
                            let state = Copy(Game.state);
                            let moves = Game.moves.captures;
                            if(Game.mandatoryCapture && moves.length == 0) {
                                moves = Game.moves.nonCaptures;
                            } 
                            else if(!Game.mandatoryCapture) {
                                moves = Game.moves.nonCaptures;
								moves = moves.concat(Game.moves.captures);
                            } 
                            
                            let ai = new AI({state, moves, depth: Game.level});
                            await ai.makeMove();
                            ai = null;
                            //} catch (error) {alert("Non capture Error\n" + error);} 
                        }, 1);
                    }
                    
                } // End of else if isOver 
            } // End of if capture
            else {
                if(!prop.final) {
                    // Getting the table position to aid undo in the array
                    let i = prop.a;
                    let j = prop.b;
                    
                    // Removing the captured piece
                    let id = Game.state[i][j];
                    Game.state[i][j] = "EC";
                    
                    if(!prop.king) {
                        AudioPlayer.play("capture", 1);
                    }
                    
                    this.startMoving(prop.n+1);
                } 
                else if(prop.final) {
                    //Enabling the undo buttons
                    $$(".controls")[1].classList.remove("cell_disabled");
                    $$(".controls")[2].classList.remove("cell_disabled");
                    $$(".horiz_controls")[1].classList.remove("cell_disabled");
                    $$(".horiz_controls")[2].classList.remove("cell_disabled");
                    
                    // Getting the table position to aid undo in the array
                    let i = prop.a;
                    let j = prop.b;
                    
                    // Removing the captured piece
                    let id = Game.state[i][j];
                    Game.state[i][j] = "EC";
                    
                    // Updating player's Longest capture stats 
                    if(piece.includes(playerA.pieceColor.slice(0,1)))
                        playerA.longestCapture = Math.max(Game.track.length, playerA.longestCapture);
                    else
                        playerB.longestCapture = Math.max(Game.track.length, playerB.longestCapture);
                    
                    // Changing turn
                    Game.whiteTurn = !Game.whiteTurn;
                    
                    // Checking if Game is over
                    id = (piece.includes("W"))? "B":"W";
                    let over = await this.isOver(id);
                    if(over)
                        return;
                    else {
                        // Marking the initial steps including the initial place the piece was marked
                        let captures = [];
                        let moves = [];
                        for(let track of Game.track) {
                            //marking the moves made
                            moves.push(track[1]);
                            if(Game.helper || Game.capturesHelper) {
                                track[0].cell.classList.add("valid");
                                track[1].cell.classList.add("valid");
							} 
                            track[0].cell.classList.remove("cell_disabled");
                            track[1].cell.classList.remove("cell_disabled");
                            // Getting the table position to aid undo in the array
                            i = track[1].a;
                            j = track[1].b;
                            let capturedPiece = $("#table").children[i*Game.boardSize+j].firstChild;
                            
                            id = (capturedPiece.className.includes("white"))? "W": "B";
                            id = ((capturedPiece.className.includes("crown"))? "K": "M") + id;
                            // storing information for undo purposes 
                            captures.push([capturedPiece, i, j, id]);
                            
                            // adding fading animation effect to the captured piece
                            capturedPiece.setAttribute("onanimationend", "End(event)");
                            capturedPiece.classList.add("captured");
                        }
                        moves.unshift(Game.track[0][0]);
                        BackState.moves.push([...moves, captures]);
                        
                        //Playing audios
                        if(!prop.king && Game.track.length > 1) {
                            AudioPlayer.play("collect", 0.5);
                        } 
                        else if(!prop.king) {
                            AudioPlayer.play("capture", 1);
                        } 
                        else {
                            AudioPlayer.play("king", 1);
                        }
                       
                        //general.captureFadeTime = new Sleep();
                        //await general.captureFadeTime.start();
                            
                        Game.track = [];
                        Helper(Game.moves, Copy(Game.state));
                        
                        if(Game.mode === "single-player" && (Game.whiteTurn && playerB.pieceColor === "White" || !Game.whiteTurn && playerB.pieceColor === "Black") ) {
                            UpdatePiecesStatus("thinking...");
                            setTimeout( async () => { //try {
                                let id = playerB.pieceColor.substring(0,1);
                                let state = Copy(Game.state);
                                let moves = Game.moves.captures;
	                            if(Game.mandatoryCapture && moves.length == 0) {
	                                moves = Game.moves.nonCaptures;
	                            } 
	                            else if(!Game.mandatoryCapture) {
	                                moves = Game.moves.nonCaptures;
									moves = moves.concat(Game.moves.captures);
	                            }
                                
                                let ai = new AI({state, moves, depth: Game.level});
                                await ai.makeMove();
                                ai = null;
                                //} catch (error) {alert("Capture Error\n" + error);} 
                            }, 1);
                        }
                    } // end of else if isOver
                } // end of if is prop.final
            } // End of if capture
        }
       
        if(Game.whiteTurn && playerA.pieceColor == 'White' || !Game.whiteTurn && playerA.pieceColor == "Black") {
        	Timer.start("A");
        }
        else {
        	Timer.start("B");
        } 
        
        return;
        //} catch (error) {Notify({action: "alert", header: "Error 3!", message: error});} 
    } 
    
    static isOver = async function (id) {
        Game.moves = await AssessAll({id, state: Game.state});
        
        if(Game.moves.captures.length > 0) {
            if(Game.mandatoryCapture) 
            await UpdatePiecesStatus("Mandatory Capture!");
            else
            await UpdatePiecesStatus("Captures Available!");
        } 
        else if(Game.moves.nonCaptures.length == 0) {
        	GameOver();
        	return Prms(true);
        } 
        else {
            //Calling this method to update the players pieces to help ascertain if game is over
            await UpdatePiecesStatus();
            // Checking if its a draw
            if(Game.possibleWin) {
            	Game.drawStateCount = 0;
            	Game.baseStateCount = 1;
				return Prms(false);
			} 
            
        	if(Game.level > 0 && playerA.pieces == playerB.pieces && playerA.pieces <= 2) {
        		if(Game.drawStateCount == 12) {
        			GameOver(true);
        			return;
        		}
        		else {
        			Game.drawStateCount++;
        		} 
        	} 
        	else if(Game.level > 0 && playerA.kings == playerA.pieces && playerB.kings == playerB.pieces && playerA.pieces + playerB.pieces <= 6) {
        		if(Game.drawStateCount == 12) {
        			GameOver(true);
        			return;
        		}
        		else {
        			Game.drawStateCount++;
        		} 
        	} 
        	
            if((playerB.pieceColor == "White" && Game.whiteTurn || playerB.pieceColor == "Black" && !Game.whiteTurn) && playerA.moves % 2 == 0) {
                if(JSON.stringify(Game.baseState) == JSON.stringify(Game.state)) {
                    if(Game.baseStateCount === 2) {
                        GameOver(true);
                        return;
                    } 
                    else 
                        Game.baseStateCount++;
                } 
                else {
                    Game.baseStateCount = 1;
                    Game.baseState = Copy(Game.state);
                }
            } 
        } 
        return Prms(false);
    } 
}

const ValidateMove = async (prop) => {
    /** To determine turn taking, will use Game.whiteTurn property of the Game object
      * If true is white's turn else black's turn
      * Will confirm possible captures and moves and game x1 and y1 to validate piece selections for move
      **/
    if(!prop.cell.classList.contains("cell")) {
    	return;
    }
    if(!Game.over) {
    	let isEmpty = prop.cell.lastChild && prop.cell.lastChild.className.includes("captured") || prop.cell.children.length == 0;
        let valid = isEmpty && Game.pieceSelected || !isEmpty && (Game.mode === "two-player-offline" && (Game.whiteTurn && prop.cell.lastChild.className.includes("piece_white") || !Game.whiteTurn && prop.cell.lastChild.className.includes("piece_black")) || prop.isComputer && prop.cell.lastChild.className.includes(playerB.pieceColor.toLowerCase()) || Game.whiteTurn && prop.cell.lastChild.className.includes("piece_white") && playerA.pieceColor == "White" || !Game.whiteTurn && prop.cell.lastChild.className.includes("piece_black") && playerA.pieceColor == "Black");
        
        if(valid) {
            let id = Game.state[prop.i][prop.j];
            let posId = `${prop.i}${prop.j}`; //posId for position identifier
            if(Game.moves.captures.length > 0 && !isEmpty) {
                for(let type of Game.moves.captures) {
                    if(type.cell == posId) {
                        prop.capture = true;
                        await new Move(prop);
                        if(general.sorted.length > 0) {
                        	let emptyCells = [];
                            for(let arr of general.sorted) {
                            	if(arr[0].cell == posId) {
	                            	for(let data of arr) {
	                            		if(!JSON.stringify(emptyCells).includes(JSON.stringify(data))) {
											emptyCells.push(data);
										} 
	                            	}
								} 
                            } 
                            if(Game.helper || Game.capturesHelper) 
	                            if(Game.mode == "two-player-offline" || Game.mode == "two-player-online" || Game.mode == "single-player" && (Game.whiteTurn && playerA.pieceColor === "White" || !Game.whiteTurn && playerA.pieceColor === "Black")) {
		                            for(let cell of emptyCells) {
		                                $("#table").children[cell.m*Game.boardSize+cell.n].classList.add("helper_empty");
		                            }
								}
                            return;
                        } 
                    } 
                } 
                if(Game.mandatoryCapture) {
                    if(!isEmpty) {
                        /**
                          * resetting animation 
                          **/
                        prop.cell.classList.remove("invalid");
                        void prop.cell.offsetWidth;
                        prop.cell.classList.add("invalid");
                        //if(Game.mode != "two-player-online") 
                        Notify("You must capture");
                        setTimeout(() => {
							prop.cell.classList.remove("invalid");
						}, 750);
                    } 
                    return;
                } 
            } 
           else if(Game.moves.captures.length > 0 && isEmpty && Game.isComputer == prop.isComputer) {
           	prop.captureMove = true;
           	let validMove = await new Move(prop);
           	if(!validMove) {
           		Game.pieceSelected = false;
           		for(let arr of general.sorted) {
			            let cell = arr[0];
						if(!$("#table").children[cell.i*Game.boardSize+cell.j].classList.contains("helper_filled")) 
			            $("#table").children[cell.i*Game.boardSize+cell.j].classList.add("helper_filled");
			        } 
           	}
           	return;
           } 
            
           if(!isEmpty) {
                Game.moves = await AssesMoves({id, i: prop.i, j: prop.j, state: Game.state});
                if(Game.moves.nonCaptures.length > 0) {
                	prop.select = true;
                    await new Move(prop);
                    if(Game.helper && !prop.isComputer) {
                        for(let move of Game.moves.nonCaptures) {
                            let m = parseInt(move.empty.slice(0,1));
                            let n = parseInt(move.empty.slice(1,2));
                            $("#table").children[m*Game.boardSize+n].classList.add("hint");
                        } 
                    } 
                    return;
                } 
            } 
            else if(Game.isComputer == prop.isComputer) {
                for(let type of Game.moves.nonCaptures) {
                    if(type.empty == posId && type.cell == `${Game.prop.i}${Game.prop.j}`) {
                    	prop.movePiece = true;
                        await new Move(prop) ;
                        return;
                    } 
                } 
            } 
            if(!isEmpty) {
                /**
                  * resetting animation 
                  **/
                prop.cell.classList.remove("invalid");
                void prop.cell.offsetWidth;
                prop.cell.classList.add("invalid");
                setTimeout(() => {
					prop.cell.classList.remove("invalid");
				}, 500);
            } 
        } 
    } 
    else {
        GameOver();
    } 
}

class Timer {
	static AH = 0;
	static BH = 0;
	static AM = 0;
	static BM = 0;
	static interval;
	static start = (player) => {
		clearInterval(this.interval);
		this.interval = setInterval (() => {
			if(player == "A") {
				this.AM++;
				this.AH = this.AM >= 60? this.AH+1: this.AH;
				this.AM = this.AM >= 60? 0: this.AM;
			}
			else {
				this.BM++;
				this.BH = this.BM >= 60? this.BH+1: this.BH;
				this.BM = this.BM >= 60? 0: this.BM;
			}
			this.show(player);
		}, 1000);
	}
	static stop = () => {
		clearInterval(this.interval);
	}
	static reset = () => {
		this.AH = this.AM = this.BH = this.BM = 0;
		let icons = $$("#play-window .player_A_icon, #play-window .player_B_icon");
		icons[0].style.backgroundImage = `var(--${playerA.pieceColor.toLowerCase()}-piece)`;
		icons[2].style.backgroundImage = `var(--${playerA.pieceColor.toLowerCase()}-piece)`;
		icons[1].style.backgroundImage = `var(--${playerB.pieceColor.toLowerCase()}-piece)`;
		icons[3].style.backgroundImage = `var(--${playerB.pieceColor.toLowerCase()}-piece)`;
		icons[0].classList.remove("black_icon", "white_icon");
		icons[0].classList.add(`${playerA.pieceColor.toLowerCase()}_icon`);
		icons[2].classList.remove("black_icon", "white_icon");
		icons[2].classList.add(`${playerA.pieceColor.toLowerCase()}_icon`);
		icons[1].classList.remove("black_icon", "white_icon");
		icons[1].classList.add(`${playerB.pieceColor.toLowerCase()}_icon`);
		icons[3].classList.remove("black_icon", "white_icon");
		icons[3].classList.add(`${playerB.pieceColor.toLowerCase()}_icon`);
		this.show('all');
	}
	static show = (player) => {
		if(player == 'A') {
			$$(".player_A_time")[0].textContent = (this.AH + "").padStart(2, '0') + ":" + (this.AM + "").padStart(2, '0');
			$$(".player_A_time")[1].textContent = (this.AH + "").padStart(2, '0') + ":" + (this.AM + "").padStart(2, '0');
		}
		else if(player == 'B') {
			$$(".player_B_time")[0].textContent = (this.BH + "").padStart(2, '0') + ":" + (this.BM + "").padStart(2, '0');
			$$(".player_B_time")[1].textContent = (this.BH + "").padStart(2, '0') + ":" + (this.BM + "").padStart(2, '0');
		}
		else if(player == "all") {
			$$(".player_A_time")[0].textContent = (this.AH + "").padStart(2, '0') + ":" + (this.AM + "").padStart(2, '0');
			$$(".player_A_time")[1].textContent = (this.AH + "").padStart(2, '0') + ":" + (this.AM + "").padStart(2, '0');
			$$(".player_B_time")[0].textContent = (this.BH + "").padStart(2, '0') + ":" + (this.BM + "").padStart(2, '0');
			$$(".player_B_time")[1].textContent = (this.BH + "").padStart(2, '0') + ":" + (this.BM + "").padStart(2, '0');
		} 
	} 
} 

const UpdatePiecesStatus = (string = null) => {
    let barA = $("#play-window .footer_section pre"); // bar representing the status bar on portrait mode
    let barB = $(".face_bottom pre"); // status bar for landscape mode
    if(string != null) {
        barA.innerHTML = string;
        barB.innerHTML = string;
    } 
    else {
        countPieces();
        if(Game.mode === "single-player") { try {
            let labels = [$$("#play-window .score_cont .score label"), $$("#play-window .middle_section .score label")];
            if(Game.validForHint) {
               let threshold = Math.floor((Game.boardSize / 2 * Game.rowNo) / 4);
               if(playerA.pieces < threshold) {
               	for(let label of labels) {
	                   label[0].classList.remove("not_achieved", "achieved");
	                   label[1].classList.remove("not_achieved", "achieved");
	                   label[2].classList.remove("not_achieved", "achieved");
	                   label[0].classList.add("not_achieved");
	                   label[1].classList.add("not_achieved");
	                   label[2].classList.add("not_achieved");
				   } 
               }
               else if(playerA.pieces >= threshold && playerA.pieces < threshold * 2) {
               	for(let label of labels) {
	                   label[0].classList.remove("not_achieved", "achieved");
	                   label[1].classList.remove("not_achieved", "achieved");
	                   label[2].classList.remove("not_achieved", "achieved");
	                   label[0].classList.add("achieved");
	                   label[1].classList.add("not_achieved");
	                   label[2].classList.add("not_achieved");
				   } 
               }
               else if(playerA.pieces >= threshold * 2 && playerA.pieces < threshold * 3) {
               	for(let label of labels) {
	                   label[0].classList.remove("not_achieved", "achieved");
	                   label[1].classList.remove("not_achieved", "achieved");
	                   label[2].classList.remove("not_achieved", "achieved");
	                   label[0].classList.add("achieved");
	                   label[1].classList.add("achieved");
	                   label[2].classList.add("not_achieved");
				   } 
               }
               else if(playerA.pieces >= threshold * 3) {
               	for(let label of labels) {
	                   label[0].classList.remove("not_achieved", "achieved");
	                   label[1].classList.remove("not_achieved", "achieved");
	                   label[2].classList.remove("not_achieved", "achieved");
	                   label[0].classList.add("achieved");
	                   label[1].classList.add("achieved");
	                   label[2].classList.add("achieved");
				   } 
               }
            }
            else {
            	for(let label of labels) {
	                label[0].classList.remove("not_achieved", "achieved");
	                label[1].classList.remove("not_achieved", "achieved");
	                label[2].classList.remove("not_achieved", "achieved");
	                label[0].classList.add("not_achieved");
	                label[1].classList.add("not_achieved");
	                label[2].classList.add("not_achieved");
				} 
            } } catch (error) {Notify(error + "");}
            barA.innerHTML = `${playerA.pieceColor}: ${playerA.pieces}    ${playerB.pieceColor}: ${playerB.pieces}`
            barB.innerHTML = `${playerA.pieceColor}: ${playerA.pieces}    ${playerB.pieceColor}: ${playerB.pieces}`
        } 
        else {
            barA.innerHTML = `${playerA.name} (${playerA.pieceColor}): ${playerA.pieces}    ${playerB.name} (${playerB.pieceColor}): ${playerB.pieces}`;
            barB.innerHTML = `${playerA.name} (${playerA.pieceColor}): ${playerA.pieces}    ${playerB.name} (${playerB.pieceColor}): ${playerB.pieces}`;
        }
    } 
    
    function countPieces () {
        let id1 = playerA.pieceColor.slice(0,1);
        let id2 = playerB.pieceColor.slice(0,1);
        playerA.pieces = playerB.pieces = 0;
        playerA.kings = playerB.kings = 0;
        
        for(let row of Game.state) {
            for(let id of row) {
                if(id.includes(id1)) {
                	playerA.pieces++;
                	if(id.includes("K"))
						playerA.kings++;
                } 
                else if(id.includes(id2)) {
                	playerB.pieces++;
                	if(id.includes("K"))
						playerB.kings++;
                } 
            } 
        } 
    } 
} 

const GameOver = async (draw = false) => {
    /** Based on the property whiteTurn of the Game object, we can compare it against the player's piece color to identify whose turn was. 
      * The player identified is the loser
      */
    let name = (Game.whiteTurn && playerA.pieceColor.includes("White") || !Game.whiteTurn && playerA.pieceColor.includes("Black"))? playerA.name: playerB.name;
	let noCaptureDraw = false;
	if(!draw) {
		noCaptureDraw = playerA.pieces === playerB.pieces && playerA.pieces === Game.boardSize / 2 * Game.rowNo;
		draw = noCaptureDraw;
	} 
    general.pressed = false;
    Timer.stop();
    
    if(Game.mode === "single-player") {
        if(!Game.over && !draw) {
            if(name === playerA.name) {
                AudioPlayer.play("game_lose", 1);
            } 
            else {
                AudioPlayer.play("game_win", 1);
            } 
        } 
        if(name === playerA.name && !draw)
            Notify({action: "confirm", 
                    header: "YOU LOSE!", 
                    message: "Amending mistakes you made, can guarantee you a win.<br>Practice make perfect!", 
                    type: "MENU/REPLAY", 
                    icon: Icons.loserIcon, 
                    iconType: "loser", 
                    onResponse: GameOverOption});
        else if(draw) {
            if(noCaptureDraw) {
                Notify({action: "confirm", 
                        header: "DRAW!", 
                        message: "Those were really clever moves! you forced out a draw.", 
                        type: "MENU/REPLAY", 
                        icon: Icons.drawIcon, 
                        iconType: "draw", 
                        onResponse: GameOverOption});
            } 
            else {
                Notify({action: "other", 
                    header: "DRAW!", 
                    message: "You are really hard to crack. This is a draw.<br>Do you think by continuing you can change this around?", 
                    type: "MENU/CONTINUE/REPLAY", 
                    icon: Icons.drawIcon,
                    iconType: "draw", 
                    onResponse: GameOverOption});
            } 
        } 
        else { 
            if(Game.validForHint) {
                let labels = $$("#levels #nav div")[Game.level].children[1].children;
                let score = Game.levels[Game.level].score;
                
                // only change when there is an improvement
                if(score < playerA.pieces) {
                    let threshold = Math.floor((Game.boardSize / 2 * Game.rowNo) / 4);
                    if(playerA.pieces >= threshold && playerA.pieces < threshold * 2) {
                        labels[2].classList.remove("not_achieved", "achieved");
                        labels[2].classList.add("achieved");
                    }
                    else if(playerA.pieces >= threshold * 2 && playerA.pieces < threshold * 3) {
                        labels[2].classList.remove("not_achieved", "achieved");
                        labels[1].classList.remove("not_achieved", "achieved");
                        labels[2].classList.add("achieved");
                        labels[1].classList.add("achieved");
                    }
                    else if(playerA.pieces >= threshold * 3) {
                        labels[2].classList.remove("not_achieved", "achieved");
                        labels[1].classList.remove("not_achieved", "achieved");
                        labels[0].classList.remove("not_achieved", "achieved");
                        labels[2].classList.add("achieved");
                        labels[1].classList.add("achieved");
                        labels[0].classList.add("achieved");
                    }
                }
                
                score = Math.max(playerA.pieces, score);
                Game.levels[Game.level].score = score;
            }
            let level = Game.level;
            //Unlock the next level
            if(level < Game.levels.length-1)
                await Level(false);
               
            let comment = ["Wonderful! Good start. ✨", "Kudos! You are doing great. 👍", "What a good learner! 👏", "Very good play. 👌", "Bravo! You are becoming a pro. 😎", "Amazing! You are a pro indeed. 😱", "Brilliant! You are really intelligent. 🤔", "What can I say Master 🤷‍♂️! Wonderful!", "You are simply a masterclass player. Congratulations 🥇👏"];
            Notify({action: (level < Game.levels.length-1)? "other": "confirm", 
                    header: "YOU WIN!", 
                    message: comment[level] + "<br>" + (level < Game.levels.length-1? ` You can now proceed to ${Game.levels[Game.level + 1].level.toLowerCase().replace(/^\w/, t => t.toUpperCase())}.`: ``),
                    type: (level < Game.levels.length-1)? "MENU/REPLAY/NEXT LEVEL": "MENU/REPLAY", 
                    icon: Icons.winnerIcon,
                    iconType: "winner", 
                    onResponse: GameOverOption});
        }
    } 
    else if(Game.mode === "two-player-offline") {
        if(!Game.over && !draw)
            AudioPlayer.play("game_win", 1);
        
        if(!draw) {
            Notify({action: "confirm", 
                    header: "CONGRATULATIONS " + (name === playerA.name)? playerB.name.toUpperCase(): playerA.name.toUpperCase() + "!", 
                    message: "It was an entertaining match. " + name + " do you want a rematch?",
                    type: "MENU/REMATCH", 
                    icon: Icons.winnerIcon,
                    iconType: "winner", 
                    onResponse: GameOverOption});
        }
        else if(draw) {
            if(noCaptureDraw) {
                Notify({action: "confirm", 
                        header: "DRAW!", 
                        message: "Well! Well! those were clever moves.<br>But there are no moves to play,<br>what about a rematch?", 
                        type: "MENU/REMATCH", 
                        icon: Icons.drawIcon,
                        iconType: "draw", 
                        onResponse: GameOverOption});
            } 
            else {
                Notify({action: "other", 
	                    header: "DRAW!", 
	                    message: "You people really don't wanna give in to each other.<br>Do you still want to continue?", 
	                    type: "MENU/CONTINUE/REMATCH", 
	                    icon: Icons.drawIcon,
	                    iconType: "draw", 
	                    onResponse: GameOverOption});
            } 
        }
    } 
    else if(Game.mode === "two-player-online") {
        if(!Game.over && !draw) {
            if(name === playerA.name) {
                AudioPlayer.play("game_lose", 1);
            } 
            else {
                AudioPlayer.play("game_win", 1);
            } 
        } 
        if(name === playerA.name && !draw) {
            Notify({action: "confirm", 
                    header: "YOU LOSE!", 
                    message: "Amending those mistakes you made, you can win. :-)", 
                    type: "MENU/REMATCH", 
                    icon: Icons.loserIcon, 
                    iconType: "loser", 
                    onResponse: GameOverOption});
        } 
        else if(draw) {
            if(noCaptureDraw) {
                Notify({action: "confirm", 
                        header: "DRAW!", 
                        message: "Well! Well! those were clever moves.<br>But there are no moves to play,<br>what about a rematch?", 
                        type: "MENU/REMATCH", 
                        icon: Icons.drawIcon,
                        iconType: "draw", 
                        onResponse: GameOverOption});
            } 
            else {
                Notify({action: "other", 
	                    header: "DRAW!", 
	                    message: "This game is a draw. What do you think?", 
	                    type: "MENU/CONTINUE/REPLAY", 
	                    icon: Icons.drawIcon,
	                    iconType: "draw", 
	                    onResponse: GameOverOption});
            } 
        } 
        else 
            Notify({action: "confirm", 
                    header: "YOU WIN!", 
                    message: "You capitalized on " + playerB.name + "'s mistakes. Congratulations, those were great moves.",
                    type: "MENU/REMATCH", 
                    icon: Icons.winnerIcon,
                    iconType: "winner", 
                    onResponse: GameOverOption});
    }
    
    if(!draw || noCaptureDraw) {
    	Game.over = true;
    }
   
    if(Game.over)
    	await UpdatePiecesStatus("Game Over!");
   
    Game.draw = draw;
    Game.name = name;
    
    async function GameOverOption (choice) {
        if(!general.pressed) {
            if(choice === "MENU") {
                await AddItem();
                await Cancel();
                back();
                return;
            } 
            else if(choice === "REPLAY" || choice == "REMATCH") {
                if(Game.mode === "two-player-online") {
                    if(Game.alternatePlayAs) {
                        let color = playerA.pieceColor;
                        await Alternate(color);
                    }
                    if(Game.rollDice) {
                        Game.firstMove = await RollDice();
                        Game.whiteTurn = (Game.firstMove && playerA.pieceColor === "White" || !Game.firstMove && playerA.pieceColor === "Black")? true: false;
                    }
                    else {
                        let btns = $$("#item3 button");
                        Game.whiteTurn = (GetValue(btns[0], "background-image") == general.default);
                        Game.firstMove = Game.whiteTurn;
                    }
                   
                    Notify("Rematch request has been sent to " + playerB.name);
                    Notify({action: "alert_special", 
                            header: "Please Wait!",
                            message: "Wait for opponent's feedback."});
                    let gameSettings = {firstMove: !Game.firstMove, mandatoryCapture: Game.mandatoryCapture, version: Game.version};
                    Publish.send({channel: Lobby.CHANNEL, message: {title: 'RequestReplay', content: gameSettings}});
                    return;
                }
                await AddItem();
                await setTimeout(_ => {Refresh(true);}, 200);
                Cancel();
                return;
            } 
            else if(choice === "NEXT LEVEL") {
            	await AddItem();
                await Level(true);
                Cancel();
            } 
            else if(choice === "CONTINUE") {
            	Timer.start();
                Game.baseStateCount = 1;
                Game.drawStateCount = 0;
                Game.baseState = Copy(Game.state);
                if(Game.mode === "single-player" && (Game.whiteTurn && playerB.pieceColor.includes("W") || !Game.whiteTurn && playerB.pieceColor.includes("B")) ) {
                    let id = playerB.pieceColor.substring(0,1);
                    let state = Copy(Game.state);
                    let moves = await AssessAll({id, state, func: AssesMoves});
                    let ai = new AI({state, moves, depth: Game.level});
                    await ai.makeMove(false);
                } 
                Cancel();
            }
            general.pressed = true;
        }
        else
            return;
    }
}

const AddItem = async function () {
	let name = Game.name;
	let draw = Game.draw
	let date = Game.date;
    Game.levels[Game.level].validForHint = Game.validForHint;
    playerA.captures = Game.boardSize / 2 * Game.rowNo - playerB.pieces;
    playerB.captures = Game.boardSize / 2 * Game.rowNo - playerA.pieces;
    
    // Caching stats
    Game.stats.push({playerName: [playerA.name, playerB.name],
                     pieceColor: [playerA.pieceColor.toUpperCase(), playerB.pieceColor.toUpperCase()],
                     gameStatus: [draw? "DRAW": name === playerA.name? "LOST": "WON", draw? "DRAW": name === playerB.name? "LOST": "WON"], 
                     piecesRemaining: [playerA.pieces, playerB.pieces], 
                     kingsMade: [playerA.kings, playerB.kings], 
                     movesMade: [playerA.moves, playerB.moves],
                     capturesMade: [playerA.captures, playerB.captures], 
                     longestCapture: [playerA.longestCapture, playerB.longestCapture], 
					 time: [(Timer.AH + "").padStart(2, '0') + ":" + (Timer.AM + "").padStart(2, '0'), (Timer.BH + "").padStart(2, '0') + ":" + (Timer.BM + "").padStart(2, '0')],
					 ms: date.getTime(),
					 mode: Game.mode
                    });
    // Updating Games window 
    let length = Game.stats.length;
    let mainSec = $("#games-window #games");   
    let itemSec = $$$("section", ["class", "game_item", "date", date.toDateString()]);
    let ref = mainSec.$(`section[date='${date.toDateString()}']:last-of-type`);
    if(!ref) {
    	let str = "Today";
    	if(!ref) {
    		let dateSec = $$$("section", ["class", "games_date", "date", date.toDateString(), "textContent", str]);
			mainSec.appendChild(dateSec);
			ref = dateSec;
    	}
    } 
    let p = $$$("p", ["innerHTML", `${playerA.name} VS ${playerB.name} <br><span>${Game.version.replaceAll(/^\w|\s\w/g, (t) => t.toUpperCase())} Checkers${Game.mode == "single-player"? "<br>" + Game.levels[Game.level].level.toLowerCase().replaceAll(/^\w|\s\w/g, (t) => t.toUpperCase()): Game.mode.replaceAll(/^\w|\s\w/gi, (t) => t.toUpperCase())} &nbsp&nbsp(${ConvertTo(date.toTimeString(), 12)})</span>`]);
    let btn = $$$("button", ["class", "default", "textContent", "SEE STATS"]);
    btn.addEventListener("click", () => GetStats(length - 1), false);
    itemSec.appendChild(p);
    itemSec.appendChild(btn);
    mainSec.insertBefore(itemSec, ref.nextElementSibling);
    $(".totals_footer p").textContent = "Total of " + length + " game" + (length > 1? "s":"") + " played so far...";
    
    if(Game.mode === "single-player") {
        Game.stats[length-1].level = Game.levels[Game.level].level;
    }
    Game.stats[length-1].version = Game.version.substring(0,3).toUpperCase();
    GetTotals();
    if(storage) {
        storage.setItem("Checkers - stats", JSON.stringify(Game.stats));
    }
} 

class AudioPlayer {
	static play = async (tone, vol) => {
	    if(!Sound.muted) { 
	        try {
	            Sound[tone].muted = false;
	            Sound[tone].volume = vol;
                Sound[tone].pause();
                Sound[tone].currentTime = 0;
                setTimeout(_ => Sound[tone].play(), 0.1);
	        } catch (error) {Notify(error + "");}
	    }
	}
	static initializeAudios = () => {
		Sound.click.muted = true;
		Sound.capture.muted = true;
	    Sound.king.muted = true;
	    Sound.collect.muted = true;
	    Sound.game_win.muted = true;
	    Sound.game_lose.muted = true;
		Sound.notification.muted = true;
		Sound.click.play();
	    Sound.capture.play();
	    Sound.king.play();
	    Sound.collect.play();
	    Sound.game_win.play();
	    Sound.game_lose.play();
		Sound.notification.play();
	} 
} 

const Clicked = async (elem, parent, click = true) => { try {
    if(click) 
        AudioPlayer.play("click", 1);
    if(elem != undefined && elem.getAttribute("value") != "locked" || elem != undefined && !click) {
        let btns = parent.children;
        for(let btn of btns) {
            if(parent.id !== "vc" && btn.tagName.toLowerCase() == "div" || parent.id !== "vc" && btn.tagName.toLowerCase() == "button") {
                btn.style.background = general.background;
            }
            else if(parent.id === "vc") {
                btn.classList.remove("default");
            } 
        } 
        
        
        if(parent.id === "nav") {
            $(`#${parent.parentNode.id} h2`).innerHTML = elem.children[0].innerHTML.replace("<br>", " ");
        } 
        else if(parent.id === "main") { 
            $(`#${parent.id} h2`).innerHTML = elem.innerHTML.split("<br>").join(" ");
            
            if(elem.getAttribute("value") == "single-player") 
                $("#main-window #levels h2").style.color = "#000";
            else
                $("#main-window #levels h2").style.color = "#6C6C6C";
        } 
        
        //setting background to green
        if(parent.id !== "vc") 
            elem.style.background = general.default; //"rgba(0, 152, 25, 0.9)";
        else {
            elem.classList.add("default");
            await Scroll(elem, {block: "nearest", inline: "center", behavior: "smooth"}, elem.parentNode.parentNode);
            //alert("Version scr: " + scr);
        } 
        //alert("done");
        
        if(parent.id == "main" || parent.id == "nav") {
            for(let btn of btns) {
                if(!btn.tagName.includes("H")) {
                    btn.style.color = "#fff";
                } 
            } 
            
            if(elem.getAttribute("value") === "single-player" || parent.id === "nav") {
                if(parent.id === "nav") general.level = elem;
                await Enable($("#main-window #levels #nav"), general.background, "#fff");
            } 
            else {
                await Disable($("#main-window #levels #nav"), general.disabled, "#B4B4B4");
            }
        }
    }
    else if(elem != undefined && elem.getAttribute("value") == "locked") {
        //resetting size
        clearTimeout(general.timeout);
        elem.children[1].style.backgroundSize = "calc(calc(.2 * var(--W) ) - 5px)";
        //restarting
        let size = GetValue(elem.children[1], "background-size");
        elem.children[1].style.backgroundSize = (parseInt(size) + 8) + "px";
        general.timeout = setTimeout(() => {
			elem.children[1].style.backgroundSize = "calc(calc(.2 * var(--W) ) - 5px)";
			Notify("To unlock this level, you must win the previous level.");
		}, 300);
        return;
    } 
    
    if(general.initialLoading && click) {
    	AudioPlayer.initializeAudios();
    	general.initialLoading = false;
    } 
    } catch (error) {alert("Click error: " + error.message);}
}

const Scroll = async (elem, options, parent) => {
    const startScroll = new Promise((resolve, reject) => {
        let tm = null;
        let scrLeft = elem.scrollLeft;
        if(elem instanceof Element) {	
            try {
                clearTimeout(tm);
                parent.removeEventListener("scroll", check, false);
                elem.scrollIntoView(options);
                parent.addEventListener("scroll", check, false);
                check();
            } catch (error) {alert("Scroll Error: " + error.message)}
        }
        else {
            reject("Argument Error: elem must be of type Element");
        }
       
        function check () {
            clearTimeout(tm);
            tm = setTimeout(() => {
                //alert(parent.scrollLeft);
                parent.removeEventListener("scroll", check, false);
                resolve(true);
            }, 300);
        }
    });
   
    return startScroll;
} 

const Disable = async (parent, bgColor, color = "#7C7C7C") => {
    let children = parent.children;
    children = (!children.length)? [parent]:children;
    
    for(let child of children) {
        if(parent.id != "main") {
            if(GetValue(child, "background-image") === general.default) { 
                general.selected = child;
                //general.classList.remove("default");
            } 
                
            if(child.tagName.toLowerCase() != "p" && child.tagName.toLowerCase() != "h2") {
                child.style.background = bgColor;
                child.style.color = color;
            } 
                
            if(child.children.length > 0) {
                child.children[0].style.color = color;
                if(!child.children[1].className.includes('disabled')) {
                    child.children[1].classList.remove("disabled");
                    child.children[1].children[0].classList.remove("disabled");
                    child.children[1].children[1].classList.remove("disabled");
                    child.children[1].children[2].classList.remove("disabled");
                    
                    child.children[1].classList.add("disabled");
                    child.children[1].children[0].classList.add("disabled");
                    child.children[1].children[1].classList.add("disabled");
                    child.children[1].children[2].classList.add("disabled");
                } 
            } 
            
            //disable the level buttons
            child.style.pointerEvents = "none";
        } 
        else {
            if(child.children.length > 0) {
                child.children[0].style.color = color;
                child.children[1].style.filter = "grayscale(100%) brightness(50%)";
            } 
            child.style.pointerEvents = "none";
        } 
    } 
} 

const Enable = async (parent, bgColor, color) => { try {
    let children = parent.children;
    children = (!children.length)? [parent]:children;
    
    for(let child of children) {
        if(parent.id != "nav" && child === general.selected || child === general.level) {
            child.style.background = general.default;
        } 
        else if(child.tagName.toLowerCase() != "p" && child.tagName.toLowerCase() != "h2") {
            child.style.background = bgColor;
            child.style.color = color;
        } 
        
        if(child.children.length > 0) {
            if(child.getAttribute("value") === "locked") {
                child.style.background = general.disabled;
            } 
            
            child.children[0].style.color = color;
            child.children[1].classList.remove("disabled");
            child.children[1].children[0].classList.remove("disabled");
            child.children[1].children[1].classList.remove("disabled");
            child.children[1].children[2].classList.remove("disabled");
        } 
        
        //enable the level buttons
        child.style.pointerEvents = "auto";
    }
    
    if(parent.id == "nav") {
        await Scroll(general.level, {block: "nearest", inline: "center", behavior: "smooth"}, general.level.parentNode);
    }
    
    } catch (error) {Notify(error + "")} 
} 

const Mute = (mute) => {
	if(mute == undefined) {
		Sound.muted = !Sound.muted;
		mute = Sound.muted;
		if(mute) {
			$("#unmute").style.background = general.background;
            $("#mute").style.background = general.default;
            Clicked();
		}
		else {
			$("#unmute").style.background = general.default;
            $("#mute").style.background = general.background;
		} 
	}
	let btns = $$('.middle_section .horiz_controls:nth-of-type(6), .controls_section .controls:nth-of-type(6)');
	if(mute) {
		btns[0].style.backgroundImage = "var(--sound-on)";
		btns[1].style.backgroundImage = "var(--sound-on)";
	}
	else {
		btns[0].style.backgroundImage = "var(--sound-off)";
		btns[1].style.backgroundImage = "var(--sound-off)";
	} 
    Sound.muted = mute;
    if(storage) {
        storage.setItem("Checkers - muted", JSON.stringify(Sound.muted));
    } 
} 

const Edit = (elem, extreme = false) => {
    if(extreme) {
        let preEdited = elem.value;
        let channel = preEdited.replace('https://www.checkers.com/', "");
        let isLink = /^(\d+%)+\d+$$/.test(channel);
        if(!isLink) {
            elem.value = preEdited.replace(/[.,*:\/\\\s]/g, '');
            elem.maxLength = "20";
        }
        else {
            elem.value = preEdited;
        } 
    } 
    else {
        elem.value = elem.value.replace(/\s+/g, ' ');
    } 
} 

const Submit = (event) => {
    event.preventDefault();
    $("#two-players-window .footer_section .right_btn").focus();
    let isOnlineForm = GetValue($("#online"), "display") == "grid";
    if(isOnlineForm) {
        if(navigator.onLine)
            ChannelFunction();
        else
            Notify("You are offline, please turn on your device internet connection and try again.");
    } 
    else {
        let playerA_name = $("#offline #playerA .playerA_name").value.trim();
        let playerB_name = $("#offline #playerB .playerB_name").value.trim();
        if(playerA_name != "" && playerB_name != "") {
            //player 1 name
            playerA.name = playerA_name.replace(/^\w|\s\w/g, t => t.toUpperCase());
        
            //player 2 name
            playerB.name = playerB_name.replace(/^\w|\s\w/g, t => t.toUpperCase());
            
            Notify("Names submitted successfully!");
        } 
        else {
        	if(playerA_name == "") {
                $("#offline #playerA .playerA_name").focus();
            	Notify("Please fill out player 1 name.");
            } 
            else if(playerB_name == "") {
                $("#offline #playerB .playerB_name").focus();
            	Notify("Please fill out player 2 name.");
            } 
        } 
    } 
} 

const AboutOnline = () => {
    Notify({action: "alert", 
            header: "HOW TO CONNECT ONLINE CHANNEL", 
            message: "To successfully play the online match, you are required to be in a channel so that you and your opponent can communicate exclusively. Now, to do that, there is a field named \"CHANNEL DETAILS\" on TWO PLAYERS window. In that field, enter your preferred channel name. It can be anything as long as is an name as shown below.<img src='./src/images/channel image.png'>In the next field named \"PLAYER DETAILS\", enter your preferred name. This name will help identify you. Your opponent will refer to you using this name as well.<img src='./src/images/player image.png'>Once done filling the details, tap <kbd>SUBMIT</kbd> button at the bottom of the screen or just press <kbd>ENTER</kbd> on the keyboard. If you are successfully connected, under \"CHANNEL STATUS DETAILS\" at the top of the sreen, your status will change color to green and indicate your connection status<img src='./src/images/status image.png'>. Likewise, the channel you have joined will be shown under \"CHANEL DETAILS\" and indicate whether you are the host or guest.<img src='./src/images/channel joined image.png'>If you are the host of that channel, that means you will have to invite your opponent to your channel. You can do this by telling him/her the channel you have joined, or create and share the link to that channel by clicking the <kbd>SHARE</kbd> button under the \"CHANNEL DETAILS\".<br>Once you are all connected to the same channel, a chat button will pop at top right corner of the screen. You can share instant messages live on the app without leaving the app. To initiate a match, just hit the <kbd>PLAY</kbd> button on the screen."});
}

const Restart = async (option) => {
	if(Game.thinking) {
		Notify("Please wait for opponent's move");
		return;
	} 
    if(!Game.over) {
        Notify({action: "confirm", 
                header: "Restart Game!", 
                message: "Do you really want to restart this game?<br>Restarting will mean you accept defeat.",
                type: "CANCEL/RESTART", 
                onResponse: RestartOption});
        
        async function RestartOption (choice) {
        	Timer.stop();
            if(choice === "RESTART") {
                if(Game.mode === "two-player-online") {
                    if(Game.alternatePlayAs) {
                        let color = playerA.pieceColor;
                        await Alternate(color);
                    }
                    if(Game.rollDice) {
                        Game.firstMove = await RollDice();
                        Game.whiteTurn = (Game.firstMove && playerA.pieceColor === "White" || !Game.firstMove && playerA.pieceColor === "Black")? true: false;
                    }
                    else {
                        let btns = $$("#item3 button");
                        Game.whiteTurn = (GetValue(btns[0], "background-image") == general.default);
                        Game.firstMove = Game.whiteTurn;
                    }
                   
                    Notify("Restart request has been sent to " + playerB.name);
                    Notify({action: "alert_special", 
                            header: "Please Wait!",
                            message: "Wait for opponent's feedback."});
                    let gameSettings = {firstMove: !Game.firstMove, mandatoryCapture: Game.mandatoryCapture, version: Game.version};
                    Publish.send({channel: Lobby.CHANNEL, message: {title: 'RequestRestart', content: gameSettings}});
                    return;
                }
                Game.name = playerA.name;
                await AddItem();
                if(Game.alternatePlayAs) {
                    let color = playerA.pieceColor;
                    await Alternate(color);
                }
                
                await setTimeout(_ => {Refresh(true);}, 200);
                Cancel();
            } 
            else if(choice === "CANCEL") {
                Cancel();
            } 
        } 
    } 
    else {
        GameOver();
    } 
} 

const Hint = async (elem, state=Copy(Game.state)) => {
	if(Game.thinking) {
		Notify("Please wait for opponent's move");
		return;
	}
    if(!Game.over) { try {
        // if player won previous level without using hints and undo
        // is allowed to use hint
        if(Game.mode === "two-player-offline" || Game.mode === "two-player-online" && (Game.whiteTurn && playerA.pieceColor === "White" || !Game.whiteTurn && playerA.pieceColor === "Black") || Game.mode === "single-player" && Game.hintCount < 3 && (Game.level === 0 || Game.levels[Game.level-1].validForHint)) {
        	if(Game.mode === "single-player") {
				Game.validForHint = false;
				Game.hintCount++;
				$$("#play-window .penalties div:last-of-type span")[0].textContent = Game.hintCount;
				$$("#play-window .penalties div:last-of-type span")[1].textContent = Game.hintCount;
				$$("#play-window .penalties div:last-of-type")[0].style.display = "block";
				$$("#play-window .penalties div:last-of-type")[1].style.display = "block";
				UpdatePiecesStatus();
		    }
		    else if(Game.mode === "two-player-online") {
			    Publish.send({channel: Lobby.CHANNEL, message: {title: "Hint"}});
			} 
	        elem.style.backgroundSize = "3.75vmax 3.75vmax";
	        elem.style.backgroundImage = `url('${Icons.loadIcon}')`;
			elem.style.pointerEvents = "none";
			general.hintPath = [];
			await setTimeout( () => getHint(elem, state), 100);
		}
		else if (Game.mode === "single-player") { 
            //resetting size
            clearTimeout(general.timeout);
            let validForHint = Game.level > 0? Game.levels[Game.level-1].validForHint: true;
            elem.style.backgroundSize = validForHint? "4.5vmax 3.75vmax" : "3.75vmax 4.5vmax";
            //restarting
            elem.style.backgroundSize = validForHint? "5.5vmax 4.75vmax" : "4.75vmax 5.5vmax";
            general.timeout = setTimeout(() => {
				elem.style.backgroundSize = validForHint? "4.5vmax 3.75vmax" : "3.75vmax 4.5vmax";
				if(Game.hintCount == 0)
					Notify("Please win the previous level without using the hint and undo buttons");
				else
					Notify("You can't hint more than three (3) times in a game.");
			}, 300);
        }
        else {
            Notify("Please wait for your turn.");
            //alert(Game.whiteTurn + "\n" + playerA.pieceColor);
        } 
        } catch (error) {Notify(error + "")} 
    } 
    else {
        GameOver();
    }
   
    async function getHint(elem, state) {
        let id = (Game.mode !== "two-player-offline")? playerA.pieceColor.substring(0,1): (Game.whiteTurn && playerA.pieceColor === "White" || !Game.whiteTurn && playerA.pieceColor === "Black")? playerA.pieceColor.slice(0,1): playerB.pieceColor.slice(0,1);
        let moves = await AssessAll({id, state});
        if(Game.mandatoryCapture && moves.captures.length > 0) {
        	moves = moves.captures;
        }
        else if(Game.mandatoryCapture && moves.captures.length == 0) {
        	moves = moves.nonCaptures;
        }
        else {
        	moves = moves.nonCaptures.concat(moves.captures);
        } 
        let level = Game.mode != "single-player"? 5: Game.level;
        let ai = new AI({state, moves, depth: (level < 4? 4: level)});
        await ai.makeMove(true);
       
        let cell = general.aiPath[0];
        await ValidateMove({cell: $("#table").children[cell.i*Game.boardSize+cell.j], i: cell.i, j: cell.j});
        
        for(cell of general.aiPath) {
            $("#table").children[cell.m*Game.boardSize+cell.n].classList.remove("helper_empty");
            $("#table").children[cell.m*Game.boardSize+cell.n].classList.add("hint");
        }
        AudioPlayer.play("notification", 0.1);
        general.aiPath = [];
        elem.style.backgroundSize = "4.5vmax 3.75vmax";
        elem.style.backgroundImage = `var(--hint)`;
        elem.style.pointerEvents = "auto";
        return;
    } 
} 

const Exit = () => { try {
    if(BackState.moves.length > 0 && !Game.over) {
        Notify({action: "confirm", 
                header: "Do you really want to exit?", 
                message: "The current game progress will be lost!",
                type: "CANCEL/EXIT", 
                onResponse: Option });
        Clicked();
                
        function Option (choice)  {
            if(choice == "EXIT") {
                if(Game.mode === "two-player-online") {
                    Publish.send({channel: Lobby.CHANNEL, message: {title: "ExitedGame", content: playerA.name} });
                }
                TerminateWorkers();
                Timer.stop();
                Cancel();
                back();
                return;
            } 
            else if(choice == "CANCEL") {
                Cancel();
            } 
        }
    } 
    else if(!Game.over) {
        if(Game.mode === "two-player-online") {
            Publish.send({channel: Lobby.CHANNEL, message: {title: "ExitedGame", content: playerA.name} });
        } 
        back();
    } 
    else {
        GameOver();
    } 
    } catch (error) {Notify(error + "");}
} 

const AboutCheckers = () => {
    if(!Game.over) {
        let src = null;
        let message = "";
        let version = Game.version.toUpperCase() + " CHECKERS";
        let root = document.documentElement;
        switch(Game.version) {
            case "american":
                message = "American Checkers also known as English/Standard Checkers is played on 8x8 board with each player having 12 pieces at the start of the game. Men (uncrowned pieces) are only allowed to move forwards. When there is multiple capturing sequence, one is expected to choose only one and not necessarily the one that will result in multiple captures. All the captures in the chosen sequence should be made. Kings (crowned pieces) can capture and move both forwards and backwards. However, they can move only one square.";
                src = srcs[0];
                break;
            case "kenyan":
                message = "Kenyan Checkers is played on 8x8 board with each player having 12 pieces at the start of the game. Men (uncrowned pieces) can only move and capture forward. In the event of capture, a piece reaches the far end of the board and there are more captures to be made, the piece will continue uncrowned. Kings (crowned pieces) can move and capture both forwards and backwards. However in the event of a capture, a king can jump multiple steps and land only to the immediate square after the captured piece. Incase of multiple captures, one should make sure all the captures in the chosen path are made.";
                src = srcs[1];
                break;
            case "casino":
                message = "Casino Checkers is a Kenyan checkers game played on 8x8 board with each player having 12 pieces at the start of the game. Men (uncrowned pieces) can only move forward one square. They can however capture two squares both forwards and backwards. In the event of capture, a piece reaches the far end of the board and there are more captures to be made, the piece will continue uncrowned. Kings (crowned pieces) can move and capture both forwards and backwards. However in the event of a capture, a king can jump multiple steps and land only to the immediate square after the captured piece. Incase of multiple captures, one should make sure all the captures in the chosen path are made.";
                src = srcs[2];
                break;
            case "international":
                message = "International Checkers is played on 10x10 board with each player having 20 pieces at the start of the game. Men (uncrowned pieces) can only move one square forward. However they can capture both forwards and backwards. In the event of capture, a piece reaches the far end of the board and there are more captures to be made, the piece will continue uncrowned. Kings (crowned pieces) can move and capture multiple steps both forwards and backwards. They are also called flying kings. Incase of multiple captures, you can only choose one that favors your game. However, all the captures in the chosen path should be made exhaustively.";
                src = srcs[3];
                break;
            case "pool":
                message = "Pool Checkers is played on 8x8 board with each player having 12 pieces at the start of the game. Men (uncrowned pieces) can only move one square forward. However, they can capture both forwards and backwards. In the event of capture, a piece reaches the far end of the board and there are more captures to be made, the piece stops and becomes crowned. Kings (crowned pieces) can move and capture multiple steps both forwards and backwards. They are also called flying kings. Incase of multiple captures, you can only choose one that favors your game. However, all the captures in the chosen path should be made exhaustively";
                src = srcs[4];
                break;
            case "russian":
                message = "Russian Checkers is played on 8x8 board with each player having 12 pieces at the start of the game. Men (uncrowned pieces) can only move one square forward. However, they can capture both forwards and backwards. In the event of capture, a piece reaches the far end of the board and there are more captures to be made, the piece is crowned and continues as a king. Kings (crowned pieces) can move and capture multiple steps both forwards and backwards. They are also called flying kings. Incase of multiple captures, you can only choose one that favors your game. However all the captures in the chosen path should be made exclusively.";
                src = srcs[5];
                break;
            case "nigerian":
                message = "Nigerian Checkers is similar to international checkers with the difference being, the longest diagonal is align to the right of the players. The game is played on 10x10 board with each player having 20 pieces at the start of the game. Men (uncrowned pieces) can only move one square forward. However they can capture both forwards and backwards. In the event of capture, a piece reaches the far end of the board and there are more captures to be made, the piece will continue uncrowned. Kings (crowned pieces) can move and capture multiple steps both forwards and backwards. They are also called flying kings. Incase of multiple captures, you can only choose one that favors your game. However, all the captures in the chosen path should be made exhaustively.";
                src = srcs[6];
                break;
        }
        //alert(src);
        Notify({action: "alert", 
                header: `<img src=${src}> <span>${version}</span>`, 
                message});
    } 
    else
    GameOver();
} 


const Helper = async (moves, state, isMultJump = false) => {
    for(let cell of $$("#table .valid, #table .pre_valid, #table .hint, #table .helper_empty, #table .helper_filled")) {
        cell.classList.remove("hint", "helper_empty", "helper_filled");
    }
    let showNonCapture = Game.mandatoryCapture && Game.moves.captures.length == 0 || !Game.mandatoryCapture;
    // check if moves is an attack move or not
    if(showNonCapture && !isMultJump) {
    	if(!((Game.mode == "single-player" || Game.mode == "two-player-online") && (Game.whiteTurn && playerB.pieceColor == "White" || !Game.whiteTurn && playerB.pieceColor == "Black")) && Game.helper) 
	        for(let move of moves.nonCaptures) {
	            let i = parseInt(move.cell.slice(0,1));
	            let j = parseInt(move.cell.slice(1,2));
	            let m = parseInt(move.empty.slice(0,1));
	            let n = parseInt(move.empty.slice(1,2));
	            $("#table").children[i*Game.boardSize+j].classList.add("pre_valid");
	        }
		if(Game.mandatoryCapture)
			return;
    }
    moves = moves.captures;
    
    for(let k = 0; k < moves.length; k++) {
    	let move = moves[k];
        let i = parseInt(move.cell.slice(0,1));
        let j = parseInt(move.cell.slice(1,2));
        let m = parseInt(move.empty.slice(0,1));
        let n = parseInt(move.empty.slice(1,2));
        let crowned = false;
        if(!isMultJump) 
        	general.helperPath.push({i, j, m, n, cell: move.cell, capture: move.capture, empty: move.empty, source: true});
        else
        	general.helperPath.push({i, j, m, n, cell: move.cell, capture: move.capture, empty: move.empty, source: false});
        // Check if its a capture
        if(move.capture != undefined) {
            let cloneState = Copy(state);
            let id = cloneState[i][j];
            let a = parseInt(move.capture.slice(0,1)), 
                b = parseInt(move.capture.slice(1,2));
            cloneState[a][b] = "EC";
            cloneState[i][j] = "IP";
            if(id.includes("M") && (id.includes(playerA.pieceColor.slice(0,1)) && m === 0 || id.includes(playerB.pieceColor.slice(0,1)) && m === Game.boardSize - 1)) {
                id = id.replace("M", "K");
                crowned = true;
            }
            let moves2 = [];
            id = crowned && /^casino|international|nigerian$/gi.test(Game.version)? id.replace("K", "M"): id;
            cloneState[m][n] = id;
			
            if(!crowned || crowned && /^casino|international|nigerian|russian$/gi.test(Game.version)) {
            	moves2 = await AssesMoves({id, i: m, j: n, state: cloneState});
                
				if(moves2.captures.length > 0) {
					await Helper(moves2, cloneState, true);
				} 
				else if(crowned) {
					id = id.replace("M", "K");
				} 
            } 
            cloneState[m][n] = id;
    	} 
    }
    
    if(isMultJump) {
        return Prms(true);
    }
   
    general.sorted = await SortCaptures(general.helperPath);
    general.helperPath = [];
    if((Game.helper || Game.capturesHelper) && Game.mandatoryCapture && (Game.mode == "single-player" && (Game.whiteTurn && playerA.pieceColor === "White" || !Game.whiteTurn && playerA.pieceColor === "Black") || Game.mode != "single-player")) {
	    let i = general.sorted[0][0].i,
	        j = general.sorted[0][0].j, 
	        singleCell = general.sorted[0][0].cell;
	        
	    for(let arr of general.sorted) {
			let data = arr[0];
        	if(data.cell != singleCell) {
				singleCell = false;
				break;
			} 
	    } 
	    
	    if(singleCell) {
			if(Game.mode != "two-player-online")
	        	await ValidateMove({cell: $("#table").children[i*Game.boardSize+j], i, j});
			else
				$("#table").children[i*Game.boardSize+j].classList.add("helper_filled");
	        return;
	    } 
	    else if(Game.helper || Game.capturesHelper) {
	        for(let arr of general.sorted) {
	            let cell = arr[0];
	            $("#table").children[cell.i*Game.boardSize+cell.j].classList.add("helper_filled");
	        } 
	        return;
	    }
	}
	else if((Game.helper || Game.capturesHelper) && !Game.mandatoryCapture && (Game.mode == "single-player" && (Game.whiteTurn && playerA.pieceColor === "White" || !Game.whiteTurn && playerA.pieceColor === "Black") || Game.mode != "single-player")) {
		for(let arr of general.sorted) {
            let cell = arr[0];
            $("#table").children[cell.i*Game.boardSize+cell.j].classList.remove("pre_valid");
            $("#table").children[cell.i*Game.boardSize+cell.j].classList.add("helper_filled");
        } 
        return;
	} 
} 

const PlayAs = (elem) => { 
    if(elem.parentNode.id == "playerA") {
        if(elem.getAttribute("value") != "play-as-alternately") {
            let num = elem.classList.length - 1;
            Enable($$("#playerB button")[0], general.default, "#fff");
            Enable($$("#playerB button")[1], general.default, "#fff");
            Disable($(`#playerB .${elem.classList[num]}`), general.disabled, "#B4B4B4");
            Enable($(`#playerB button:not(.${elem.classList[num]})`), general.default, "#fff");
            let btn = $(`#item4 button[value='${elem.getAttribute("value")}']`);
            Clicked(btn, btn.parentNode, false);
        }
        else {
            Game.alternatePlayAs = true;
            let btns = $$("#item4 button")[2];
            Clicked(btns, btns.parentNode, false);
           
            btns = $$("#playerB button");
            for(let btn of btns) {
               if(GetValue(btn, "background-image") === general.default) {
                   Disable(btn, general.disabled, "#B4B4B4");
                   break;
               } 
            } 
        } 
    } 
    if(elem.getAttribute("value") != "play-as-alternately") {
        Game.alternatePlayAs = false;
        let playAsWhite = (elem.getAttribute("value") == "play-as-white");
        playerA.pieceColor = (playAsWhite)? "White": "Black";
        playerB.pieceColor = (playAsWhite)? "Black": "White";
        
        if(elem.parentNode.id !== "playerA") {
            let btns = $$("#playerA button");
            for(let btn of btns) {
            	if(btn.getAttribute("value") === elem.getAttribute("value")) {
            	    Clicked(btn, btn.parentNode, false);
                    let num = btn.classList.length - 1;
                    Disable($(`#playerB .${btn.classList[num]}`), general.disabled, "#B4B4B4");
                    Enable($(`#playerB button:not(.${btn.classList[num]})`), general.default, "#fff");
                    break;
            	} 
            } 
        } 
    } 
    else {
        Game.alternatePlayAs = true;
        let btns = $$("#playerA button")[2];
        Clicked(btns, btns.parentNode, false);
        btns = $$("#playerB button");
        for(let btn of btns) {
           if(GetValue(btn, "background-image") === general.default) {
               Disable(btn, general.disabled, "#B4B4B4");
               break;
           } 
        } 
    }
    if(storage)
        storage.setItem("Checkers - play_as", JSON.stringify({playerA: playerA.pieceColor, playerB: playerB.pieceColor, alternate: Game.alternatePlayAs}));
} 

const Contact = () => {
	Notify({action: "other",
			header: "CONTACT DEVELOPER",
			message: "Feel free to reach out to me via either of the following options. Let's build checkers together.",
 		   type: "NOT NOW/EMAIL/WHATSAPP",
			icon: "./src/images/contact.png", 
			onResponse: ContactResponse});
	
	function ContactResponse (response) {
		if(response == "EMAIL") 
    		window.location.href = "mailto:markcodes789@gmail.com? &subject=Checkers%20Support%20Feedback";
    	else if(response == "WHATSAPP")
    		window.location.href = "https://wa.me/+254798916984?";
    	else
    		Cancel();
    } 
} 

const Attribute = () => {
    Notify({action: "alert", 
            header: "ATTRIBUTES", 
            message: "<span>Audio</span><ul><li>Special thanks goes to zapslat.com for powering audio in this game. Checkout the link below for more info.<br/><a href='https://www.zapsplat.com/sound-effect-categories/'>www.zapslat.com</a></li></ul><span>Online Gaming</span><ul><li>This one goes to PubNub for enabling instant communication between internet connected devices.</li></ul>"});
}

const AppVersion = () => {
	Notify({action: "alert", 
            header: "CHECKERS VERSION", 
            message: "Your current app version is: " + appVersion + "<span>Updates of this version</span><ul><li>Improved internal operations.</li><li>Improved the AI thinking time.</li><li>Fixed channel subscription error.</li><li>Fixed more other errors</li></ul><label style='display: block; text-align: left;'>Thank you for playing checkers. If you experience any difficulty or an error please contact me via the contact button in the settings. Let's build checkers together. Happy gaming 🎉</label>"});
} 

const FollowUp = () => {
    BackState.state.push(["#settings-window", "#follow-up-window"]);
    $("#settings-window").style.display = "none";
    $("#follow-up-window").style.display = "grid";
} 

const GetGames = () => {
    BackState.state.push(["#main-window", "#games-window"]);
    $("#main-window").style.display = "none";
    $("#games-window").style.display = "grid";
    if(Game.stats.length == 0)
        Notify("Your Games will be displayed here.");
}

const ShowTotalStats = async () => {
	let sec = $(".games_totals");
	sec.style.transform = "translate(0%, 0%)";
	BackState.state.push([".games_totals"]);
}

const GetTotals = () => { try {
	for(let div of $$(".totals_div")) {
		let p = div.$("p");
		p.innerHTML = p.innerHTML.replace(/\d+/gi, 0);
		p.setAttribute("total", 0);
		let conts = div.$$("div");
		for(let cont of conts) 
			div.removeChild(cont);
	} 
	for(const stat of Game.stats) {
		let mode = stat.mode;
		let names = JSON.parse(JSON.stringify(stat.playerName));
		let name1 = stat.playerName[0];
		let name2 = stat.playerName[1];
		let status1 = stat.gameStatus[0].toLowerCase();
		let status2 = stat.gameStatus[1].toLowerCase();
		let version = stat.version.toUpperCase();
		version = version? version.length == 3? Object.keys(Game.versions).find((v) => {
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
		prob1.classList.remove("default", "red_ui");
		prob2.classList.remove("default", "red_ui");
		if(prob1.getAttribute("prob") > prob2.getAttribute("prob")) {
			prob1.classList.add("default");
			prob2.classList.add("red_ui");
		}
		else if(prob1.getAttribute("prob") < prob2.getAttribute("prob")) {
			prob1.classList.add("red_ui");
			prob2.classList.add("default");
		}
		
		let div;
		if(mode == "single-player" || name1.toLowerCase() == "you" && name2.toLowerCase("ai")) {
			div = $(".single_player_totals");
		}
		else if(mode == "two-player-online") {
			div = $(".online_totals");
		}
		else if(mode == "two-player-offline") {
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
	} catch (error) {alert(error);}
} 

class GamesScroll {
	static lastScrollTop = 0;
	static check = (e) => {
		if(Game.stats.length == 0) return;
		let dir = e.target.scrollTop - this.lastScrollTop; // > 0 == scroll up else scroll down
		let floatDate = $(".float_date");
		let date = floatDate.getAttribute("value") || $(".games_date").getAttribute("date");
		let targetElem = $$(`.game_item[date='${date}']`);
		
		targetElem = targetElem[dir > 0? targetElem.length-1: 0];
		let threshold;
		if(dir > 0) {
			let parTop = e.target.getBoundingClientRect().top;
			let targetElemTop = targetElem.getBoundingClientRect().top;
			threshold = targetElemTop - parTop;
		}
		else if(dir < 0) {
			let parBottom = e.target.getBoundingClientRect().bottom;
			let targetElemBottom = targetElem.getBoundingClientRect().bottom;
			threshold = parBottom - targetElemBottom;
		} 
		
		if(threshold <= -20 && targetElem.nextElementSibling) {
			date = dir > 0? targetElem.nextElementSibling : targetElem.previousElementSibling.previousElementSibling;
			floatDate.textContent = $(`.games_date[date='${date.getAttribute("date")}']`).textContent;
			floatDate.setAttribute("value", date.getAttribute("date"));
		}
		else if(!floatDate.getAttribute("value")) {
			date = $(".games_date");
			floatDate.textContent = date.textContent;
			floatDate.setAttribute("value", date.getAttribute("date"));
		} 
		floatDate.classList.add("show_float_date");
		clearTimeout(general.floatTimeout);
		general.floatTimeout = setTimeout(() => {
			floatDate.classList.remove("show_float_date");
		}, 2000);
		this.lastScrollTop = e.target.scrollTop;
	} 
}

const ConvertTo = (time, to, includeSec = false) => {
	try {
		if(time == "Invalid Date")
			return "";
		time = time.split(" ")[0];
		let hr = parseInt(time.split(":")[0]);
		let min = time.split(" ")[0].split(":")[1];
		let sec = time.split(" ")[0].split(":")[2] || "00";
		let converted = "";
		if(to == 24) {
			let prd = time.split(" ")[1];
			if(prd == "PM" && hr < 12) {
				converted = String((hr + 12)).padStart(2, "0") + ":" + min + (includeSec? ":" + sec: "");
			} 
			else if(prd == "AM" && hr == 12) {
				converted = "00:" + min + (includeSec? ":" + sec: "");
			} 
			else {
				converted = String(hr).padStart(2, "0") + ":" + min + (includeSec? ":" + sec: "");
			} 
		} 
		else if(to == 12) {
			if(hr == 0) {
				converted = "12:" + min + (includeSec? ":" + sec: "") + " AM";
			} 
			else if(hr > 12) {
				converted = String((hr - 12)).padStart(2, "0") + ":" + min + (includeSec? ":" + sec: "") + " PM";
			} 
			else if(hr == 12) {
				converted = String(hr).padStart(2, "0") + ":" + min  + (includeSec? ":" + sec: "") + " PM";
			} 
			else {
				converted = String(hr).padStart(2, "0") + ":" + min  + (includeSec? ":" + sec: "") + " AM";
			} 
		} 
		return converted;
	} catch (error) {
		reportError(error);
	} 
} 

const ClearGames = () => {
	Clicked();
	if(Game.stats.length > 0) {
		Notify({action: "confirm",
		        header: "Are you sure you want clear?", 
		        message: "Once done this action can not be undone.", 
                type: "CANCEL/CLEAR", 
                onResponse: ClearResponse});
	} else {
		Notify("No games played yet.");
	}
	
	function ClearResponse (response) {
		if(response == "CANCEL") {
			Cancel();
		}
		else if(response == "CLEAR") {
			$("#games").innerHTML = "";
			let p = $(".totals_footer p");
			p.innerHTML = p.innerHTML.replace(/\d+/gi, 0);
		    Game.stats = [];
			GetTotals();
			$(".float_date").textContent = "";
			$(".float_date").removeAttribute("value");
		    Notify("Games cleared successfully");
		    if(storage) {
			    storage.removeItem("Checkers - stats");
		    }
			Cancel();
		} 
    } 
} 

const GetStats = (no) => { 
	let section = $(".stats_section");
	section.innerHTML = "";
	let stat = Game.stats[no];
	let imgs = $$(".stats_header img");
	imgs[0].src = stat.pieceColor[0] == "BLACK"? srcs[17]: srcs[18];
	imgs[1].src = stat.pieceColor[1] == "BLACK"? srcs[17]: srcs[18];
	
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
		
		for(let ch of key) {
			if(ch == ch.toUpperCase()) {
				let index = key.indexOf(ch);
				key = key.slice(0, index) + " " + key.slice(index);
				break;
			}
		} 
		
		val1.innerHTML = String(value[0]).toLowerCase().replace(/^\w/, (t) => t.toUpperCase());
		val2.innerHTML = String(value[1]).toLowerCase().replace(/^\w/, (t) => t.toUpperCase());
		name.innerHTML = key.replace(/^\w/, (t) => t.toUpperCase());;
		
		item.appendChild(val1);
		item.appendChild(name);
		item.appendChild(val2);
		section.appendChild(item);
    } 
    Clicked();
    
    BackState.state.push(["#games-window", "#stats-window"]);
    $("#games-window").style.display = "none";
    $("#stats-window").style.display = "grid";
} 

const Mode = async (type, click = true) => {
    if(type == 2) {
        Game.mode = "two-player-offline";
        playerA.name = $(".playerA_name").value;
        playerB.name = $(".playerB_name").value;
        $("#two-players-window h2").innerHTML = "TWO PLAYERS OFFLINE";
        $("#item4").style.display = "none";
        $("#online").style.display = "none";
        $("#offline").style.display = "grid";
      
        let elem = $("#main div:nth-of-type(2)");
        await Clicked(elem, elem.parentNode, click);
    } 
    else if(type == 3) {
        Game.mode = "two-player-online";
        playerA.name = $$("#online .player_name")[0].innerHTML;
        playerB.name = $$("#online .player_name")[1].innerHTML;
        $("#two-players-window h2").innerHTML = "TWO PLAYERS ONLINE";
        $("#item4").style.display = "grid";
        $("#online").style.display = "grid";
        $("#offline").style.display = "none";
       
        let elem = $("#main div:nth-of-type(3)");
        await Clicked(elem, elem.parentNode, click);
    } 
    else if(type == 1) { 
        Game.mode = "single-player";
        playerA.name = "You";
        playerB.name = "AI";
        $("#item4").style.display = "grid";
       
        let elem = $$("#main div")[0];
        await Clicked(elem, elem.parentNode, click);
    }
   
    if(click && type != 1) {
        BackState.state.push(["#main-window", "#two-players-window"]);
        $("#main-window").style.display = "none";
        $("#two-players-window").style.display = "grid";
    }
} 

const Settings = (elem) => {
    let modes = $$("#main-window #main div");
    let previousMode;
    for(let mode of modes) {
        if(GetValue(mode, "background-image") === general.default) { 
            previousMode = mode;
            break;
        } 
    } 
    Clicked(elem, elem.parentNode);
    BackState.state.push(["#main-window", "#settings-window", previousMode]);
    $("#main-window").style.display = "none";
    $("#settings-window").style.display = "grid";
} 

const Cancel = () => {
    let note_window = $("#notification-window");
    note_window.classList.remove("fade_note");
    void note_window.offsetWidth;
    note_window.setAttribute("onanimationend", "End(event)");
    note_window.classList.add("fade_note");
} 

const Confirm = async (option, callBack) => {
    callBack(option);
} 


const Notify = (data) => {
    if(typeof data === "object") {
        general.Handler0 = null;
        general.Handler1 = null;
        general.Handler2 = null;
        let note_window = $("#notification-window"), 
            note_main = $("#note"), 
            note_image = $(".note_img"), 
            note_head = $(".note_header"), 
            note_body = $(".note_body"), 
            note_footer = $(".note_footer"), 
            note_buttons = note_footer.children,
            note_close_button = $("#note .close_btn");
         
        note_window.classList.remove("fade_note");
        note_window.style.justifyContent = "center";
        note_main.style.gridTemplateRows = "auto auto auto";
        note_main.style.gridTemplateColumns = "60px auto 25px";
        note_main.style.gridRowGap = "5px";
        note_main.style.padding = "10px";
        note_image.style.padding = "5px";
        note_image.style.objectFit = "contain";
        note_head.style.fontWeight = "900";
        note_body.style.display = "block";
        note_head.innerHTML = data.header || "";
        note_body.innerHTML = data.message || "";
        note_buttons[1].removeAttribute("onclick");
        note_buttons[2].removeAttribute("onclick");
        note_buttons[2].removeAttribute("onclick");
        note_window.removeAttribute("onclick");
        note_close_button.removeAttribute("onclick");
        note_close_button.style.display = "block";
        if(data.action == "alert") {
            note_image.src = Icons.alertIcon;
            note_image.style.width = "60px";
            note_image.style.height = "60px";
            note_buttons[0].style.display = "none";
            note_buttons[1].style.display = "none";
            note_buttons[2].style.display = "inline-block";
            note_buttons[2].innerHTML = "OK";
            note_buttons[2].setAttribute("onclick", "Cancel()");
            note_window.setAttribute("onclick", "Cancel()");
            note_close_button.setAttribute("onclick", "Cancel()");
            
            note_close_button.style.pointerEvents = "auto";
        }
        else if(data.action === "pop-up-alert") {
            note_window.style.justifyContent = "flex-start";
            note_main.style.gridTemplateColumns = data.iconType == "dice"? "60px auto": "100px auto";
            note_main.style.gridTemplateRows = "auto";
            note_main.style.padding = "5px";
            note_main.style.gridRowGap = "0px";
            note_image.style.padding = "0px 10px 0px 0px";
            if(data.iconType == "flag") {
            	note_image.style.height = "6ch";
            	note_image.style.objectFit = "fill";
            	note_main.style.gridTemplateColumns = "auto auto";
            } 
           
            note_close_button.style.display = "none";
            note_head.style.fontWeight = "500";
            note_body.style.display = "none";
            note_image.src = data.icon;
            note_image.style.width = data.iconType == "dice"? "60px": data.iconType =="flag"? "auto": "100px";
            note_buttons[0].style.display = "none";
            note_buttons[1].style.display = "none";
            note_buttons[2].style.display = "none";
            let delay = data.delay || 1000;
            setTimeout(Cancel, delay);
        } 
        else if(data.action === "alert_special") {
            note_image.src = Icons.loadIcon;
            note_image.style.width = "60px";
            note_buttons[0].style.display = "none";
            note_buttons[1].style.display = "none";
            note_buttons[2].style.display = "none";
            note_close_button.style.pointerEvents = "none";
        } 
        else if(data.action == "confirm") {
            note_image.style.width = "60px";
            note_image.style.height = "60px";
            if(data.icon === undefined) 
                note_image.src = Icons.confirmIcon;
            else {
                if(data.iconType == "winner") {
                	note_image.style.height = "80px";
                } 
                else if(data.iconType == "draw") {
                	note_main.style.gridTemplateColumns = "80px auto 25px";
                	note_image.style.width = "80px";
                } 
                note_image.src = data.icon;
            } 
            
            note_buttons[0].style.display = "none";
            note_buttons[1].style.display = "inline-block";
            note_buttons[2].style.display = "inline-block";
            note_buttons[1].innerHTML = data.type.split("/")[0];
            note_buttons[2].innerHTML = data.type.split("/")[1];
            const Handler1 = `Confirm("${data.type.split('/')[0]}", ${data.onResponse})`;
            const Handler2 = `Confirm("${data.type.split('/')[1]}", ${data.onResponse})`;
            note_buttons[1].setAttribute("onclick", Handler1);
            note_buttons[2].setAttribute("onclick", Handler2);
            note_close_button.setAttribute("onclick", Handler1);
            
            note_close_button.style.pointerEvents = "auto";
        }
        else if(data.action == "other") {
            note_image.src = data.icon;
            note_image.style.height = "60px";
            if(data.iconType == "winner") {
                note_image.style.width = "60px";
                note_image.style.height = "80px";
            } 
            else if(data.iconType == "draw") {
            	note_main.style.gridTemplateColumns = "80px auto 25px";
                note_image.style.width = "80px";
            } 
            
            note_buttons[0].style.display = "inline-block";
            note_buttons[1].style.display = "inline-block";
            note_buttons[2].style.display = "inline-block";
            note_buttons[0].innerHTML = data.type.split("/")[0];
            note_buttons[1].innerHTML = data.type.split("/")[1];
            note_buttons[2].innerHTML = data.type.split("/")[2];
            const Handler0 = `Confirm("${data.type.split('/')[0]}", ${data.onResponse})`;
            const Handler1 = `Confirm("${data.type.split('/')[1]}", ${data.onResponse})`;
            const Handler2 = `Confirm("${data.type.split('/')[2]}", ${data.onResponse})`;
            note_buttons[0].setAttribute("onclick", Handler0);
            note_buttons[1].setAttribute("onclick", Handler1);
            note_buttons[2].setAttribute("onclick", Handler2);
            note_close_button.setAttribute("onclick", Handler0);
            note_close_button.style.pointerEvents = "auto";
        }
        
        note_window.style.display = "flex";
    } 
    else {
        let popUpNote = $("#pop-up-note");
        popUpNote.innerHTML = data;
        popUpNote.style.display = "block";
        popUpNote.classList.remove("pop");
        void popUpNote.offsetWidth;
        popUpNote.classList.add("pop");
    }
    return Prms("done");
}

const Version = async (elem, index, click = true) => { 
    elem.parentNode.classList.add("disabled_container");
    $("#footer .left_btn").style.pointerEvents = "none";
    $("#nav").classList.add("disabled_levels");
    let levels = $$("#nav div");

    if(click) {
        let scores = [];
        let levelIndex;
        levels.forEach((level, index) => {
            if(level.getAttribute("value") !== "locked") {
                let score = 3;
                for(let i = 0; i < level.children[1].children.length; i++) {
                    let label = level.children[1].children[i];
                    if(!label.className.includes("not_achieved")) {
                        score = i;
                        break;
                    } 
                }
                let validForHint = Game.levels[index].validForHint;
                scores.push({score, validForHint});
                levelIndex = index;
            } 
        });
        Game.versions[Game.version] = scores;
        Game.version = elem.getAttribute("value");
        $(".header_div:last-of-type h2").innerHTML = Game.version.toUpperCase() + " CHECKERS";
        await Clicked(elem, elem.parentNode, click);
        
        
        if(storage) {
            storage.setItem("Checkers - versions", JSON.stringify(Game.versions));
            storage.setItem("Checkers - version", Game.version);
            storage.setItem("Checkers - currentLevel", levelIndex);
        }
        await loop();
    }
    else {
        $(".header_div:last-of-type h2").innerHTML = Game.version.toUpperCase() + " CHECKERS";
        await Clicked(elem, elem.parentNode, click);
        await loop();
    } 
    
    async function loop (m = 0) {
    	
        if(m === levels.length) {
            if(Game.mode === "single-player") {
            	let level = levels[Game.versions[Game.version].length-1];
            	if(storage && !click) {
            		let lvl = storage.getItem("Checkers - currentLevel");
            		if(lvl) {
            			lvl = levels[lvl];
            			if(lvl && lvl.getAttribute("value") != "locked") {
            				level = lvl;
            			} 
					} 
            	} 
                await Clicked(level, level.parentNode, false);
            }
            else {
                general.level = levels[Game.versions[Game.version].length-1];
            }
            await loopingDone();
            elem.parentNode.classList.remove("disabled_container");
            $("#nav").classList.remove("disabled_levels");
            $("#footer .left_btn").style.pointerEvents = "auto";
            return;
        } 
        
        let level = levels[m];
        
        if(m < Game.versions[Game.version].length) {
            Game.level = m-1;
            await Level(false, "version");
            Game.level = m;
            Game.levels[Game.level].validForHint = Game.versions[Game.version][m].validForHint;
            if(Game.levels[Game.level].validForHint === undefined)
            	Game.levels[Game.level].validForHint = true;
            
            let score = Game.versions[Game.version][m].score; 
			if(score === undefined) 
				Game.versions[Game.version][m];
            
            for(let i = 0; i < 3; i++) {
                level.children[1].children[i].classList.remove("achieved", "not_achieved");
                
                if(i >= score) {
                    level.children[1].children[i].classList.add("achieved");
                }
                else {
                    level.children[1].children[i].classList.add("not_achieved");
                } 
            }
        }
        else {
        	level.setAttribute("value", "locked");
            level.children[0].innerHTML = "LOCKED";
            level.children[1].style.filter = "grayscale(0) invert(0) brightness(1)";
            level.style.backgroundImage = general.disabled;
            level.children[1].style.backgroundImage = `url(${srcs[srcs.length-2]})`;

            for(let label of level.children[1].children) {
                label.classList.remove("achieved", "not_achieved");
            } 
        }
       
        if(Game.mode !== "single-player") {
            await Disable(level.parentNode, general.disabled, "#B4B4B4");
        } 
        
        await loop(m+1);
    }
    function loopingDone () {
        if(Game.version != "international" && Game.version != "nigerian") {
            Game.boardSize = 8;
            Game.rowNo = 3;
        } 
        else {
            Game.boardSize = 10;
            Game.rowNo = 4;
        }
        document.documentElement.style.setProperty("--board-size", Game.boardSize);
    } 
}

const RestartLevels = async () => { 
	try {
		Notify({action: "confirm", 
				header: "Are you sure restart all levels!", 
				message: "Once done this action can not be reversed.",
				type: "CANCEL/RESTART", 
				onResponse: RestartLevelsOption});
				
		async function RestartLevelsOption (option) {
			if(option == "RESTART") {
				await Notify({action: "alert_special", 
						header: "Please Wait!", 
						message: "Resetting levels..."});
				
				Object.keys(Game.versions).map((key) => {
					Game.versions[key] = [{score: 3, validForHint: true}];
				});
				if(storage) {
			        storage.setItem("Checkers - versions", JSON.stringify(Game.versions));
			        storage.setItem("Checkers - version", Game.version);
					storage.setItem("Checkers - currentLevel", 0);
			    }
			    let version = $(`#main-window .version[value='${Game.version}']`);
			    await Version(version, undefined, false);
			} 
		    Cancel();
		} 
    } catch(error) {alert("Restart Error!\n" + error.message)}
} 

const Level = async (elem, index, click = true) => {
    if(typeof elem === "object") {
        await Clicked(elem, elem.parentNode, click);
        if(elem.getAttribute("value") != "locked") {
            try {
                let level = index;
                storage.setItem("Checkers - currentLevel", (level).toString());
            } catch (error) {} 
            Game.level = index;
        }
    } 
    else if(elem) { try {
        let level = $$("#levels #nav div")[Game.level+1];
        await Clicked(level, level.parentNode, false);
        $("#play-window .header_section h3").innerHTML = `${$("#levels h2").innerHTML}`;
        $(".face_bottom #level").innerHTML = `${Game.version.toUpperCase().slice(0,3)} - ${$("#levels h2").innerHTML}`;
        for(level of Game.levels) {
            if(level.level === $("#levels h2").innerHTML) {
                Game.level = Game.levels.indexOf(level);
                break;
            } 
        } 
        
        if(Game.levels[Game.level-1].validForHint) {
            $("#play-window .middle_section .horiz_controls:nth-of-type(3)").style.backgroundImage = "var(--hint)";
            $("#play-window .controls_section .controls:nth-of-type(3)").style.backgroundImage = "var(--hint)";
            $("#play-window .controls_section .controls:nth-of-type(3)").style.backgroundSize = "4.5vmax 3.75vmax";
            $("#play-window .middle_section .horiz_controls:nth-of-type(3)").style.backgroundSize = "4.5vmax 3.75vmax";
        } 
        else if(!Game.levels[Game.level-1].validForHint) {
            $("#play-window .middle_section .horiz_controls:nth-of-type(3)").style.backgroundImage = `url(${srcs[srcs.length-2]})`;
            $("#play-window .controls_section .controls:nth-of-type(3)").style.backgroundImage = `url(${srcs[srcs.length-2]})`;
            $("#play-window .controls_section .controls:nth-of-type(3)").style.backgroundSize = "3.75vmax 4.5vmax";
            $("#play-window .middle_section .horiz_controls:nth-of-type(3)").style.backgroundSize = "3.75vmax 4.5vmax";
        } 
        if(Game.alternatePlayAs) {
            let color = playerA.pieceColor;
            await Alternate(color); 
        }
        await setTimeout(_ => {Refresh(true);}, 200);
        index = 0;
        } catch (error) {Notify({action: "alert", 
                                header: error.name, 
                                message: error.message + " at Level."})}
    } 
    else {
        let level = $$("#levels #nav div")[Game.level+1];
        if(level.getAttribute("value") == "locked") {
        	level.setAttribute("value", Game.levels[Game.level+1].level.toLowerCase().replace(" level", ""));
            level.style.backgroundImage = general.background;
            level.children[0].innerHTML = Game.levels[Game.level+1].level.replace(" ", "<br/>");
            level.children[1].style.filter = "grayscale(0) invert(0) brightness(1)";
            level.children[1].style.backgroundImage = `none`;
            if(level.children[1].children[0].className === "" || !level.children[1].children[0].className.includes("achieved")) {
                level.children[1].children[0].classList.add("not_achieved");
                level.children[1].children[1].classList.add("not_achieved");
                level.children[1].children[2].classList.add("not_achieved");
            }
        }
    } 
    
    if(storage && index != "version") {
        let levels = $$("#nav div");
        let scores = [];
        levels.forEach((level, index) => {
            if(level.getAttribute("value") !== "locked") {
                let score = 3;
                for(let i = 0; i < level.children[1].children.length; i++) {
                    let label = level.children[1].children[i];
                    if(!label.className.includes("not_achieved")) {
                        score = i;
                        break;
                    } 
                }
                let validForHint = Game.levels[index].validForHint;
                scores.push({score, validForHint});
            } 
        });
        Game.versions[Game.version] = scores;
        storage.setItem("Checkers - versions", JSON.stringify(Game.versions));
        storage.setItem("Checkers - version", Game.version);
    }
    return Prms("done");
} 

const End = (event) => {
    if(event.animationName === "pop-out") {
        let popUpNote = $("#pop-up-note");
        popUpNote.style.display = "none";
    } 
    else if(event.animationName === "fade-out") { 
		try {
            event.target.removeAttribute("onanimationend");
            event.target.classList.remove("captured");
            event.target.parentNode.removeChild(event.target);
            /*if(!$(".captured")) {
            	general.captureFadeTime.end();
            } */
        } catch (error) {}
    }
    else if(event.animationName === "fade-note") {
        event.target.removeAttribute("onanimationend");
        event.target.style.display = "none";
        event.target.classList.remove("fade_note");
    }
    else if(event.animationName === "slide_float_date") {
    	event.target.classList.remove("show_float_date");
    } 
} 

const Home = async () => {
    if(GetValue($("#main-window"), "display") === "none") {
        let length = BackState.state.length;
        if(length > 0) { try {
            let current_state = BackState.state[length-1];
            await BackState.state.pop();
            
            if(current_state.length > 2) {
                await Clicked(current_state[2], current_state[2].parentNode, false);
            } 
            $(current_state[1]).style.display = "none";
            $(current_state[0]).style.display = "grid"; } catch (error) {console.log(error)}
        } 
        await Home();
    }
    
    return true;
}

async function play (accepted = false) {
    if(Lobby != undefined && Lobby.isConnected && Game.mode === "two-player-online" || Game.mode === "single-player") {
        if(GetValue($("#play-window"), "display") == "none" || accepted) {
        	// If game mode is online, request consent from opponent, otherwise just display the play window
            if(Game.mode === "two-player-online" && !accepted) {
                if(Game.alternatePlayAs) {
                    let color = playerA.pieceColor;
                    await Alternate(color);
                }
                setTimeout(async () => {
                    if(Game.rollDice) {
                        Game.firstMove = await RollDice();
                        //Notify(Game.firstMove);
                        Game.whiteTurn = (Game.firstMove)? playerA.pieceColor === "White": playerB.pieceColor === "White";
                    }
                    else {
                        let btns = $$("#item3 button");
                        Game.whiteTurn = (GetValue(btns[0], "background-image") == general.default);
                        Game.firstMove = (Game.whiteTurn && playerA.pieceColor === "White" || !Game.whiteTurn && playerA.pieceColor === "Black")? true: false;
                    }
                	
                    Notify("Play request has been sent to " + playerB.name);
                    let gameSettings = {firstMove: !Game.firstMove, mandatoryCapture: Game.mandatoryCapture, version: Game.version};
                    Publish.send({channel: Lobby.CHANNEL, message: {title: 'RequestPlay', content: gameSettings}});
                    Cancel();
                }, 200);
                return;
            }
            else if(Game.mode === "two-player-online" && accepted) {
                await setTimeout(async () => await Refresh(true), 200);
            } 
            
            if(Game.mode !== "two-player-online") {
                if(Game.alternatePlayAs) {
                    let color = playerA.pieceColor;
                    await Alternate(color);
                } 
                await Refresh(true);
            }
           
            // choosing whether to display the hint button or not
            if(Game.mode === "two-player-online" || Game.level === 0 || Game.levels[Game.level-1].validForHint) {
                $("#play-window .middle_section .horiz_controls:nth-of-type(3)").style.backgroundImage = "var(--hint)";
                $("#play-window .controls_section .controls:nth-of-type(3)").style.backgroundImage = "var(--hint)";
                $("#play-window .controls_section .controls:nth-of-type(3)").style.backgroundSize = "4.5vmax 3.75vmax";
                $("#play-window .middle_section .horiz_controls:nth-of-type(3)").style.backgroundSize = "4.5vmax 3.75vmax";
            } 
            else if(!Game.levels[Game.level-1].validForHint) {
                $("#play-window .middle_section .horiz_controls:nth-of-type(3)").style.backgroundImage = `url(${srcs[srcs.length-2]})`;
                $("#play-window .controls_section .controls:nth-of-type(3)").style.backgroundImage = `url(${srcs[srcs.length-2]})`;
                $("#play-window .controls_section .controls:nth-of-type(3)").style.backgroundSize = "3.75vmax 4.5vmax";
                $("#play-window .middle_section .horiz_controls:nth-of-type(3)").style.backgroundSize = "3.75vmax 4.5vmax";
            }
            
            await Home();
            BackState.state.push(["#main-window", "#play-window"]);
            $("#main-window").style.display = "none";
            $("#play-window").style.display = "grid";
        }
        if(GetValue($("#play-window"), "display") == "grid") {
            AdjustBoard();
            if(Game.mode === "single-player") {
                $("#play-window .header_section h3").innerHTML = `${$("#levels h2").innerHTML}`;
                $(".face_bottom #level").innerHTML = `${Game.version.toUpperCase().slice(0,3)} - ${$("#levels h2").innerHTML}`;
                for(let level of Game.levels) {
                    if(level.level === $("#levels h2").innerHTML) {
                        Game.level = Game.levels.indexOf(level);
                    } 
                } 
            } 
            else {
                $("#play-window .header_section h3").innerHTML = `${playerA.name} VS ${playerB.name}`;
                $(".face_bottom #level").innerHTML = `${Game.version.toUpperCase().slice(0,3)} - ${playerA.name} VS ${playerB.name}`;
            } 
        }
    } 
    else if(Game.mode === "two-player-offline" && playerA.name != "You" && playerA.name !== "" && playerB.name != "AI" && playerB.name !== "") { 
        $("#play-window .header_section h3").innerHTML = `${playerA.name} VS ${playerB.name}`;
        if(Game.alternatePlayAs) {
            let color = playerA.pieceColor;
            await Alternate(color);
        } 
        await Refresh(true);
        
        $("#play-window .middle_section .horiz_controls:nth-of-type(3)").style.backgroundImage = "var(--hint)";
        $("#play-window .controls_section .controls:nth-of-type(3)").style.backgroundImage = "var(--hint)";
        $("#play-window .controls_section .controls:nth-of-type(3)").style.backgroundSize = "4.5vmax 3.75vmax";
        $("#play-window .middle_section .horiz_controls:nth-of-type(3)").style.backgroundSize = "4.5vmax 3.75vmax";
        
        BackState.state.push(["#main-window", "#play-window"]);
        $("#main-window").style.display = "none";
        $("#play-window").style.display = "grid";
    } 
    else {
        if(Game.mode === 'two-player-online')
            Notify("Can't play, you have no opponent. Please wait or invite one or join another channel.");
        else if(Game.mode === 'two-player-offline')
            Notify("Can't play, you haven't filled out players details. Fill them out and try again.");
    }
}

const AdjustBoard = () => {
	general.orientation = screen.orientation.type;
	let offlineMode = Game.mode == "two-player-offline";
	let root = document.documentElement;
    if(BackState.state.length && BackState.state[BackState.state.length-1][0] == ".games_totals") {
    	$(".games_totals").style.transform = "translate(0, 100%)";
    	BackState.state.pop();
    }
    let width = parseInt(GetValue($("#table"), "width")) / Game.boardSize * 0.1;

	if(screen.orientation.type.toLowerCase().includes("landscape")) {
		$("#horiz").style.backgroundImage = general.default;
		$("#vert").style.backgroundImage = general.background;
		document.body.style.backgroundSize = "auto 70vmax";
        
        if(offlineMode) {
        	root.style.setProperty("--z-plane-distance", "0px");
        	root.style.setProperty("--perspective-y", "50%");
        	root.style.setProperty("--shadow-width", "0px");
        	root.style.setProperty("--unrotated-shadow", `${width * 1.3}px`);
        	root.style.setProperty("--angleX", "0deg");
        	root.style.setProperty("--angleZ", "0deg");
            root.style.setProperty("--angleZ" + playerB.pieceColor.slice(0,1), "0deg");
            root.style.setProperty("--angleZ" + playerA.pieceColor.slice(0,1), "0deg");
            $("#play-window .middle_section .face_back").style.boxShadow = "0 7vmin 1vmin 4vmin #0008, 0 0 1vmin 4vmin #000a";
            $("#play-window .middle_section .score").style.display = "none";
            $("#play-window .middle_section .penalties").style.display = "none";
            $("#play-window .middle_section .timer_front_a").classList.add("unrotated");
            $("#play-window .middle_section .timer_front_b").classList.add("unrotated");
        } 
        else {
        	root.style.setProperty("--z-plane-distance", "122px");
        	root.style.setProperty("--perspective-y", "80%");
        	root.style.setProperty("--shadow-width", `${width}px`);
        	root.style.setProperty("--unrotated-shadow", "0px");
        	root.style.setProperty("--angleX", "30deg");
        	root.style.setProperty("--angleZ", "0deg");
            root.style.setProperty("--angleZ" + playerB.pieceColor.slice(0,1), "0deg");
            root.style.setProperty("--angleZ" + playerA.pieceColor.slice(0,1), "0deg");
            $("#play-window .middle_section .face_back").style.boxShadow = "0 -4vmin 2vmin 4vmin #000, 0 4vmin 2vmin 0 #0006";
            $("#play-window .middle_section .timer_front_a").classList.remove("unrotated");
        	$("#play-window .middle_section .timer_front_b").classList.remove("unrotated");
            if(Game.mode == "single-player") {
	            $("#play-window .middle_section .score").style.display = "flex";
	        	$("#play-window .middle_section .penalties").style.display = "flex";
			}
			else {
				$("#play-window .middle_section .score").style.display = "none";
	        	$("#play-window .middle_section .penalties").style.display = "none";
			} 
        } 
    } 
    else if(screen.orientation.type.toLowerCase().includes("portrait")) {
    	$("#horiz").style.backgroundImage = general.background;
		$("#vert").style.backgroundImage = general.default;
    	document.body.style.backgroundSize = "auto 100vmax";
        root.style.setProperty("--shadow-width", "0px");
        root.style.setProperty("--unrotated-shadow", `${width * 1.3}px`);
        root.style.setProperty("--angleX", "0deg");
        root.style.setProperty("--z-plane-distance", "0px");
        root.style.setProperty("--perspective-y", "50%");
        
       
        $("#play-window .middle_section .score").style.display = "none";
	    $("#play-window .middle_section .penalties").style.display = "none";
		$("#play-window .middle_section .timer_front_a").classList.remove("unrotated");
        $("#play-window .middle_section .timer_front_b").classList.remove("unrotated");
        
        if(offlineMode) {
        	root.style.setProperty("--angleZ", "90deg");
            root.style.setProperty("--angleZ" + playerB.pieceColor.slice(0,1), "-90deg");
            root.style.setProperty("--angleZ" + playerA.pieceColor.slice(0,1), "-90deg");
            $("#play-window .controls_section .score_cont").style.display = "none";
            $("#play-window .middle_section .face_back").style.boxShadow = "0 7vmin 1vmin 4vmin #0008, 0 0 1vmin 4vmin #000a";
        }
        else {
        	root.style.setProperty("--angleZ", "0deg");
            root.style.setProperty("--angleZ" + playerB.pieceColor.slice(0,1), "0deg");
            root.style.setProperty("--angleZ" + playerA.pieceColor.slice(0,1), "0deg");
            $("#play-window .middle_section .face_back").style.boxShadow = "0 7vmin 1vmin 4vmin #0008, 0 0 1vmin 4vmin #000a";
            if(Game.mode == "single-player") {
            	$("#play-window .controls_section .score_cont").style.display = "flex";
            }
            else {
            	$("#play-window .controls_section .score_cont").style.display = "none";
            } 
        } 
    } 
} 

const Fullscreen = async (value, isEvent = false) => { 
    try {
	    let isFullScreen = () => {
            if(document.fullscreenElement !== undefined) return document.fullscreenElement;
            if(document.webkitFullscreenElement !== undefined) return document.webkitFullscreenElement;
            if(document.mozFullscreenElement !== undefined) return document.mozFullscreenElement;
            if(document.msFullscreenElement !== undefined) return document.msFullscreenElement;
        }
        let elem = document.documentElement;
        let enterFullscreen = elem.requestFullscreen || elem.webkitRequestFullscreen || elem.mozRequestFullscreen || elem.msRequestFullscreen;
        let exitFullscreen = document.exitFullscreen || document.webkitExitFullscreen || document.mozExitFullscreen || document.msExitFullscreen;
        
	    if(value && !isEvent) {
		    if(enterFullscreen && !isFullScreen()) {
			    $("#item1").style.display = "grid";
        		await enterFullscreen.call(elem, {navigationUI: "hide"});
        		
        		Clicked($("#fs-on"), $("#fs-on").parentNode);
			    general.fullscreen = value;
			    
			    let res = await orientationLocking(document.documentElement, general.orientation);
                if(!res) {
                    $("#item1").style.display = "none";
                } 
        	}
        	else
        		Notify({action: "alert",
					    header: "Fullscreen Error",
					    message: "Your browser doesn't support Fullscreen functionality."});
	    } 
	    else if(!isEvent) {
		    if(exitFullscreen && isFullScreen()) {
			    general.fullscreen = value;
			    $("#item1").style.display = "none";
        		await exitFullscreen.call(document);
        		Clicked($("#fs-off"), $("#fs-off").parentNode);
        	}
	    } 
	    else if(isEvent && !isFullScreen()) {
		    $("#item1").style.display = "none";
		    let btns = $$("#item0 button");
		    btns[0].style.background = general.background;
		    btns[1].style.background = general.default;
		    general.fullscreen = false;
		} 

	} catch (error) {
		if(!general.fullscreen)
		    $("#item1").style.display = "none";
		Notify({action: "alert",
				header: "Fullscreen Error",
				message: "Your browser doesn't support Fullscreen functionality.\n"});
	}
} 

async function orientationLocking (elem, orientation) {
	let res = false;
	try {
		await screen.orientation.lock(orientation).then(_ => {
            res = true;
        }).catch((error) => {
            if(error.name != "NotSupportedError")
                Notify("An error occurred while locking orientation view");
            res = false;
        }); 
    } catch (error) {
        Notify("Locking error: " + error);
    }
    return Prms(res);
}

async function back (undo = false, isComp = false) {
	if(Game.thinking && undo) {
		Notify("Please wait for opponent's move");
		return;
	} 
    if(!undo) {
    	if(GetValue($("#settings-window"), "display") == "grid") {
	        let btns;
			if(general.fullscreen && GetValue($("#item1"), "display") == "grid") {
	        	btns = $$("#item1 button");
		        for(let btn of btns) {
		            if(GetValue(btn, "background-image") == general.default) { 
		                if(btn.id == "horiz" && general.orientation.toLowerCase().includes("portrait")) {
		                    orientationLocking(document.documentElement, "landscape-primary"); 
		                } 
		                else if(btn.id == "vert" && general.orientation.toLowerCase().includes("landscape")) {
		                    orientationLocking(document.documentElement, "portrait-primary");
		                } 
		            } 
		        }
			} 
	        
	        btns = $$("#item3 button");
	        for(let btn of btns) {
	            if(GetValue(btn, "background-image") == general.default) { 
	                if(btn.id != "first-move-roll-dice") {
	                    Game.whiteTurn = btn.id == "first-move-white";
	                    Game.rollDice = false;
	                } 
	                else
	                    Game.rollDice = true;
	                    
	                break;
	            } 
	        }
	        if(storage)
	            storage.setItem("Checkers - first_move", JSON.stringify({rollDice: Game.rollDice, whiteTurn: Game.whiteTurn}));
	        
	        btns = $$("#item5 button");
	        for(let btn of btns) {
	            if(GetValue(btn, "background-image") == general.default) { 
	                Game.mandatoryCapture = btn.id === "must-jump";
	                break;
	            } 
	        }
	        if(storage) 
	            storage.setItem("Checkers - mandatory_capture", JSON.stringify(Game.mandatoryCapture));
	        
	        btns = $$("#item6 button");
	        for(let btn of btns) {
	            if(GetValue(btn, "background-image") === general.default) {
	                if(btn.id === "active") {
	                    Game.helper = true;
	                    Game.capturesHelper = true;
	                    break;
	                } 
	                else if(btn.id === "inactive") {
	                    Game.helper = false;
	                    Game.capturesHelper = false;
	                    break;
	                }
	                else {
	                    Game.capturesHelper = true;
	                    Game.helper = false;
	                    break;
	                } 
	            } 
	        }
	        if(storage)
	            storage.setItem("Checkers - helper", JSON.stringify({helper: Game.helper, capturesHelper: Game.capturesHelper}));
		} 
        
        let length = BackState.state.length;
        if(length > 0) { 
            let current_state = BackState.state[length-1];
            await BackState.state.pop();
            
            if(current_state.length > 2) {
                await Clicked(current_state[2], current_state[2].parentNode);
            }
            else
            	await Clicked();
            if($(current_state[0]).classList.contains("games_totals")) {
            	$(current_state[0]).style.transform = "translate(0, 100%)";
            }
            else {
	            $(current_state[1]).style.display = "none";
	            $(current_state[0]).style.display = "grid"; 
			}
        } 
    } 
    else if(!Game.over) { 
        let moving = $$("#transmitter .outer");
        if(moving.length == 0) {
            let length = BackState.moves.length;
            if(isComp || length > 0 && Game.mode === "two-player-offline" || ((Game.mode == "two-player-online" || Game.mode === "single-player" && Game.undoCount < 5) && length > 1 && (Game.whiteTurn && playerA.pieceColor === "White" || !Game.whiteTurn && playerA.pieceColor === "Black") )) {
            	let move = BackState.moves[length-1];
                await BackState.moves.pop();
                Undo.move(move);
               
                for(let move of BackState.moves) {
                    if(move.length === 3) { 
                        let piece = move[1].piece || move[0].cell.firstChild;
                        if(piece.className.includes(playerA.pieceColor.toLowerCase()))
                            playerA.longestCapture = Math.max(move[2].length, playerA.longestCapture);
                        else
                            playerB.longestCapture = Math.max(move[2].length, playerB.longestCapture);
                    } 
                } 
               
                for(let cell of $$("#table .valid, #table .pre_valid, #table .hint, .helper_empty, .helper_filled")) {
	                cell.classList.remove("valid", "pre_valid", "hint", "helper_empty", "helper_filled");
	            }
				
                Game.whiteTurn = !Game.whiteTurn;
                
                if(!isComp && (Game.mode === "single-player" || Game.mode == "two-player-online") && (Game.whiteTurn && playerB.pieceColor === "White" || !Game.whiteTurn && playerB.pieceColor === "Black")) {
                	if(Game.mode == "two-player-online") {
                		await Publish.send({channel: Lobby.CHANNEL, message: {title: "Undone", content: {} } });
                		await Publish.send({channel: Lobby.CHANNEL, message: {title: "Undone", content: {} } });
                	}
                	else {
	                	Game.validForHint = false;
						Game.undoCount++;
						$$("#play-window .penalties div:first-of-type span")[0].textContent = Game.undoCount;
						$$("#play-window .penalties div:first-of-type span")[1].textContent = Game.undoCount;
						$$("#play-window .penalties div:first-of-type")[0].style.display = "block";
						$$("#play-window .penalties div:first-of-type")[1].style.display = "block"; 
					} 
                     
                    await back(true, true);
                    return;
                }

                // To avoid clushing due to multiple click events will use setTimeout function. 
                clearTimeout(general.timeout);
                general.timeout = setTimeout(async _ => {
                	general.sorted = [];
	                let id = Game.whiteTurn && playerA.pieceColor === "White" || !Game.whiteTurn && playerA.pieceColor === "Black"? playerA.pieceColor.charAt(0): playerB.pieceColor.charAt(0);
	                Game.moves = await AssessAll({id, state: Game.state});
	                
	                await Helper(Game.moves, Copy(Game.state));
                    await UpdatePiecesStatus();
				}, 100);
            } 
            else if((Game.mode == "single-player" || Game.mode == "two-player-online") && length <= 1 && (Game.whiteTurn && playerA.pieceColor == "White" || !Game.whiteTurn && playerA.pieceColor == "Black") || length == 0) {
                Notify("No moves made yet");
            }
            else if(Game.mode == "single-player" && Game.undoCount >= 5) {
            	let elem = general.orientation.toLowerCase().includes("landscape")? $(".horiz_controls:nth-of-type(2)") : $(".controls:nth-of-type(2)");
            	//resetting size
            	clearTimeout(general.timeout);
	            elem.style.backgroundSize = "3vmax 3vmax";
	            //restarting
	            elem.style.backgroundSize = "4vmax 4vmax";
	            general.timeout = setTimeout(() => {
					elem.style.backgroundSize = "3vmax 3vmax";
					Notify("You can't undo more than five (5) times in a game.");
				}, 300);
            } 
            else {
            	Notify("Please wait for opponent's move");
            } 
        }
        else {
            // nothing much here
        }
    }
    else {
        GameOver();
    } 
}

class Undo {
	static moves = [];
	static move = (move) => {
		// To avoid clush during undo will use a queue.
		
		this.moves.push(move);
		if(this.moves.length == 1)
			this.undo();
	}
	static undo = async () => {
		let table = $("#table");
		while(this.moves.length > 0) {
			let move = this.moves[0];
			let king = false;
			if(move.length >= 3) {
				king = await move.some((prop) => prop.king);
				move = [move[0], move.slice(-2,-1)[0], move.slice(-1)[0]];
			} 
			let i = move[1].i;
			let j = move[1].j;
			let m = move[0].i;
			let n = move[0].j;
			let piece = move[1].piece;
			let id = Game.state[i][j];
			await piece.classList.remove("captured");
			if(move[1].king || king) {
	            if(piece.className.includes("white")) {
	                piece.classList.remove("crown_white");
	            } 
	            else {
	                piece.classList.remove("crown_black");
	            } 
	            
	            if(piece.className.includes(playerA.pieceColor.toLowerCase()))
	            playerA.kings--;
	            else
	            playerB.kings--;
	            
	            id = id.replace("K", "M");
			}
			//Updating moves made by each player
			if(piece.className.includes(playerA.pieceColor.toLowerCase()))
            	playerA.moves--;
            else
            	playerB.moves--;
           
            // Undoing draw checker
            Game.drawStateCount = Game.drawStateCount > 0? Game.drawStateCount-1: Game.drawStateCount;
            Game.baseStateCount = Game.baseStateCount > 1? Game.baseStateCount-1: Game.baseStateCount;
            
			table.children[i*Game.boardSize+j].innerHTML = "";
			table.children[m*Game.boardSize+n].appendChild(piece);
			Game.state[i][j] = "EC";
			Game.state[m][n] = id;
			
			if(move.length === 3) {
                for(let caps of move[2]) {
                	await caps[0].classList.remove("captured");
                    i = caps[1];
                    j = caps[2];
                    $("#table").children[i*Game.boardSize+j].appendChild(caps[0]);
                    Game.state[i][j] = caps[3];
                } 
            }
            this.moves.shift();
		} 
	} 
}

const PopState = () => {
	if(BackState.state.length > 0) {
		if(GetValue($("#play-window"), "display") == "grid")
			Exit();
		else
			back();
		history.pushState(null, "", "?window1");
	}
	else if(!document.location.href.includes("window")) {
		Clicked();
		Notify("Press again to exit.");
		setTimeout(() => {
			history.pushState(null, "", "?window1");
		}, 4000);
	}
}


