'use strict' 

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
var storage = null;
try {
    storage = localStorage;
    //storage.clear();
} catch (error) {}
// srcs to load the resources needed
// images srcs
let srcs = ["american flag.jpeg",
            "kenyan flag.jpeg",
            "casino flag.jpeg", 
            "international flags.jpeg",
            "pool flag.jpeg",
            "russian flag.jpeg",
            "nigerian flag.jpeg",
            "background.jpeg", 
            "black cell.jpeg", 
            "white cell.jpeg",
            "hint.png", 
            "menu.png", 
            "restart.png", 
            "undo.png", 
            "about.png",
            "black piece.png",
            "white piece.png", 
            "black crown.png", 
            "white crown.png",
            "send.png", 
            "cancel.png",
            "alert.png",
            "confirm.png", 
            "winner.png",
            "loser.png", 
            "draw.png",
            "load.png",
            "dice roll.png",
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
                    "--bg", 
                    "--black-cell", 
                    "--white-cell", 
                    "--hint",
                    "--menu", 
                    "--restart", 
                    "--undo", 
                    "--about",
                    "--black-piece", 
                    "--white-piece", 
                    "--black-crown", 
                    "--white-crown",
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
let i, bar, label, width;
try {
	i = 0;
	label = document.querySelector("#load-window p");
	bar = document.querySelector(".bar"); // Loading bar
	width = parseInt(window.getComputedStyle(bar, null).getPropertyValue("width"));
} catch {}

load(srcs[i]);

async function load (src) { try {
    if(src.includes(".mp3"))
        src = "./src/audio/" + src;
    else
        src = "./src/images/" + src;
    let response = await fetch(src);
    if(response.status === 200) {
        let blob = await response.blob();
        if(blob.size > 0) {
            if(!src.includes(".mp3")) {
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
                src = await URL.createObjectURL(blob);
                let audio = new Audio(src);
                Sound[soundProps[i - srcs.length]] = audio;
            } 
            bar.children[0].style.width = ((i+1) * width / (srcs.length + sounds.length)) + "px";
            label.innerHTML = (parseInt(window.getComputedStyle(bar.children[0], null).getPropertyValue("width")) / width * 100).toFixed(0) + "%";
            i++;
            if(i < srcs.length) {
                load(srcs[i]);
            }
            else if(i < srcs.length + sounds.length) {
                load(sounds[i - srcs.length]);
            }
            else {
                setTimeout(LoadingDone, 100);
            } 
        }
        else {
            alert("BUFFERING ERROR!\nFailed to buffer fetched data to an array data.");
        } 
    }
    else {
        alert("LOADING ERROR!\nFailed to load AppShellFiles - " + src + ". Either you have bad network or you have lost internet connection.");
    } 
    } catch (error) {alert("load error: " + error.message)}
} 

var other = {
    initialX: 0,
    initialY: 0,
    currentX: 0,
    currentY: 0,
    xOffset: 0,
    yOffset: 0,
    active: false, 
    
    orientation: 'natural',
    initialLoading: true,
    fullscreenSupport: false,
    fullscreen: false, 
    default: "linear-gradient(rgba(0, 152, 25, 0.9), rgba(0, 112, 0, 0.9))", 
    disabled: "linear-gradient(rgba(110, 110, 110, 0.9), rgba(70, 70, 70, 0.9))", 
    background: "linear-gradient(rgba(40, 40, 40, 0.9), rgba(0, 0, 0, 0.9))", 
    selected: "", 
    level: "",
    capturePath: [], 
    helperPath: [], 
    aiPath: []
}

async function LoadingDone () {
	imageProps = null;
	soundProps = null;
	sounds = null;
	bar = null;
	width = null;
	i = null;
	srcs.slice(6, srcs.length - 8);
	//HashTable.initTable();
	
    document.documentElement.style.setProperty("--star", `url(${srcs[srcs.length-1]})`);
    document.body.style.backgroundImage = `var(--bg)`;
    $("#load-window").style.display = "none";
    $("#main-window").style.display = "grid";
    $("#item1").style.display = "none";
   
    document.addEventListener("fullscreenchange", _ => Fullscreen(true, true), false);
    document.addEventListener("msFullscreenchange", _ => Fullscreen(true, true), false);
    document.addEventListener("mozFullscreenchange", _ => Fullscreen(true, true), false);
    document.addEventListener("webkitFullscreenchange", _ => Fullscreen(true, true), false);
    
    $("#chat-icon").addEventListener("touchstart", DragStart, false);
    $("#chat-icon").addEventListener("touchend", DragEnd, false);
    $("#chat-icon").addEventListener("touchmove", Drag, false);
    $("#chat-icon").addEventListener("click", DragEnd, false);
   
    $("#chat-icon").addEventListener("mousedown", DragStart, false);
    $("#chat-icon").addEventListener("mouseup", DragEnd, false);
    $("#chat-icon").addEventListener("mousemove", Drag, false);
    
    Disable($("#two-players-window #playerB .white"), other.disabled, "#B4B4B4");
    other.selected = $("#main .default");
    other.level = $("#nav .default");
    //check if has notch
    other.notch = await HasNotch();
   
    if(!storage || !JSON.parse(storage.getItem("NotifiedUpdateV6.8"))) {
        Notify({action: "alert",
                header: "What's New! Version 6.8", 
                message: "<ul><li>- Fixed bugs.</li><li>- Improved internal stability.</li></ul><br><br>If you experience any errors kindly contact me using the contact option in the settings window."});
        if(storage) {
            //storage.clear();
            storage.setItem("NotifiedUpdateV6.8", "true");
        } 
    } 
    
    let btns = $$("#main-window #levels #nav div");
    let btn = null;
    let p = null;
    
    if(storage === null || storage.getItem("versions") === null) {
        for(btn of btns) {
            p = btn.children[1];
            if(btn.children[0].innerHTML != "LOCKED") {
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
            storage.setItem("versions", JSON.stringify(Game.versions));
            storage.setItem("version", Game.version);
        } 
    }
    else {
        try {
            Game.versions = JSON.parse(storage.getItem("versions"));
            let version = storage.getItem("version");
            Game.version = version;
            for(let h2 of $$(".version h2")) {
                if(h2.innerHTML.includes(version.toUpperCase())) {
                    version = h2.parentNode;
                    break;
                } 
            }
            Version(version, undefined, false);
        } catch (error) {alert("Version Initialization Error: " + error.message + "\nVersion: " + storage.getItem("version"))}
        
        Game.stats = JSON.parse(storage.getItem("stats")) || [];
        
        let length = Game.stats.length;
        let mainSec = $("#games-window #games");
        try {
            for(let i = 0; i < length; i++) {
                let no = i;
                let stat = Game.stats[no];
                let subSec = $$$("section");
                subSec.classList.add("sub_item");
                p = $$$("p");
                p.innerHTML = `${stat.playerName[0]} [${stat.pieceColor[0]}] VS ${stat.playerName[1]} [${stat.pieceColor[1]}] ${(stat.level != undefined)? "<br/><br/> " + stat.version + ": " + stat.level: ""}`;
                let btn = $$$("button");
                btn.classList.add("default", "middle_top");
                btn.innerHTML = "SEE STATS";
                btn.addEventListener("click", () => GetStats(no), false);
                subSec.appendChild(p);
                subSec.appendChild(btn);
                mainSec.appendChild(subSec);
            }
        } catch (error) {/*alert(error + "" + JSON.parse(storage.getItem("stats")).length);*/}
      
        // Mute
        let muted = JSON.parse(storage.getItem("muted"));
        if(muted == false) {
            Mute(JSON.parse(muted));
            $("#unmute").style.background = other.default;
            $("#mute").style.background = other.background;
        }
        else if(muted == true) {
            Mute(JSON.parse(muted));
            $("#mute").style.background = other.default;
            $("#unmute").style.background = other.background;
        }
        else {
            storage.setItem("muted", JSON.stringify(Sound.muted));
        }
        
        // First Move 
        let firstMove = JSON.parse(storage.getItem("first_move"));
        if(firstMove) {
            Game.whiteTurn = firstMove.whiteTurn;
            Game.rollDice = firstMove.rollDice;
            btns = $$("#item3 button");
            if(firstMove.rollDice == true) {
                btns[0].style.background = other.background;
                btns[1].style.background = other.background;
                btns[2].style.background = other.default;
            }
            else if(firstMove.rollDice == false) {
                if(firstMove.whiteTurn) {
                    btns[0].style.background = other.default;
                    btns[1].style.background = other.background;
                }
                else {
                    btns[0].style.background = other.background;
                    btns[1].style.background = other.default;
                } 
                btns[2].style.background = other.background;
            }
        } 
        else {
            storage.setItem("first_move", JSON.stringify({whiteTurn: Game.whiteTurn, rollDice: Game.rollDice}));
        }
       
        // Play As
        let playAs = JSON.parse(storage.getItem("play_as"));
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
            storage.setItem("play_as", JSON.stringify({playerA: playerA.pieceColor, playerB: playerB.pieceColor, alternate: Game.alternatePlayAs}));
        } 
       
        // Mandatory Capture
        let mandatoryCapture = JSON.parse(storage.getItem("mandatory_capture"));
        if(mandatoryCapture) {
            Game.mandatoryCapture = mandatoryCapture;
            btns = $$("#item5 button");
            if(mandatoryCapture == true) {
                btns[0].style.background = other.default;
                btns[1].style.background = other.background;
            }
            else if(firstMove.rollDice == false) {
                btns[0].style.background = other.background;
                btns[1].style.background = other.default;
            }
        } 
        else {
            storage.setItem("mandatory_capture", JSON.stringify(Game.mandatoryCapture));
        }
       
        // Helper 
        let helper = JSON.parse(storage.getItem("helper"));
        if(helper) {
            Game.helper= helper.helper;
            Game.capturesHelper = helper.capturesHelper;
            btns = $$("#item6 button");
            if(helper.capturesHelper == true && helper.helper == true) {
                btns[0].style.background = other.default;
                btns[1].style.background = other.background;
                btns[2].style.background = other.background;
            }
            else if(helper.capturesHelper == false && helper.helper == false) {
                btns[0].style.background = other.background;
                btns[1].style.background = other.default;
                btns[2].style.background = other.background;
            }
            else if(helper.capturesHelper == true && helper.helper == false) {
                btns[0].style.background = other.background;
                btns[1].style.background = other.background;
                btns[2].style.background = other.default;
            } 
        } 
        else {
            storage.setItem("helper", JSON.stringify({helper: Game.helper, capturesHelper: Game.capturesHelper}));
        }
    }
    
    if(deferredEvent)
        $(".install").classList.add("show_install_prompt");
    
    window.addEventListener("orientationchange", () => {
        setTimeout(() => {play(true);}, 300);
    });
    
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

const DragStart = (e) => {
    if (e.type === "touchstart") {
        other.initialX = e.touches[0].clientX - other.xOffset;
        other.initialY = e.touches[0].clientY - other.yOffset;
    } else {
        other.initialX = e.clientX - other.xOffset;
        other.initialY = e.clientY - other.yOffset;
    }
    
    let dragItem = $("#chat-icon");
    if(e.target === dragItem) {
        other.active = true;
    } 
}

const DragEnd = async (e) => {
    if(e.type === "touchend") {
        e.target.style.transition = "transform 0.5s ease";
        if(other.currentX < (65 - window.innerWidth)/2) {
            await SetTranslate((65 - window.innerWidth), other.currentY, e.target);
            other.currentX = (65 - window.innerWidth);
        }
        if(other.currentX > (65 - window.innerWidth)/2) {
            await SetTranslate(5, other.currentY, e.target);
            other.currentX = 5;
        }
        if(other.currentY < -5) {
            await SetTranslate(other.currentX, -5, e.target);
            other.currentY = -5;
        }
        if(other.currentY > (window.innerHeight - 65)) {
            await SetTranslate(other.currentX, (window.innerHeight - 65), e.target);
            other.currentY = (window.innerHeight - 65);
        }
        e.target.style.transition = "transform 0s ease";
        other.initialX = other.currentX;
        other.initialY = other.currentY;
        other.xOffset = other.currentX;
        other.yOffset = other.currentY;
        
        other.active = false;
    }
    else
        ShowChat();
}

const Drag = (e) => {
    if(other.active) {
        e.preventDefault();
        
        if (e.type === "touchmove") {
            other.currentX = e.touches[0].clientX - other.initialX;
            other.currentY = e.touches[0].clientY - other.initialY;
        } else {
            other.currentX = e.clientX - other.initialX;
            other.currentY = e.clientY - other.initialY;
        }
       
        other.xOffset = other.currentX;
        other.yOffset = other.currentY;
       
        SetTranslate(other.currentX, other.currentY, e.target);
    } 
}

const SetTranslate = (x, y, elem) => {
    elem.style.transform = "translate3d(" + x + "px, " + y + "px, 0)";
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
    
const HasNotch = () => {
    let proceed = false;
    let top = 0;
    if(CSS.supports("padding-top: constant(safe-area-inset-top)")) {
        proceed = true;
        top = parseInt(GetValue(document.documentElement, "--satc"));
    } 
    else if(CSS.supports("padding-top: env(safe-area-inset-top)")) {
        proceed = true;
        top = parseInt(GetValue(document.documentElement, "--sat"));
    } 
    
    let vh = document.documentElement.clientHeight || window.innerHeight || window.screen.availHeight;
    if(proceed) {
        if(top > 0) //for iPhone X
        return {has: true, top};
        else {
            if(window.screen.height - vh >= 84 || window.screen.height - vh >= 30)
            return {has: true, top: 30};
        } 
    } 
    else {
        if(window.screen.height - vh >= 84 || window.screen.height - vh >= 30)
            return {has: true, top: 30};
    } 
    return {has: false, top: 0};
} 

const LoadBoard = async (playerAPieceColor, playerBPieceColor) => {
	let board = $("#table");
	let frame = $$(".frame");
	let ftc, frc, fbc, flc;
	let tre = board.rows;
	let isEmpty = Game.state.length === 0? true: false;
	let chars = "ABCDEFGHIJKLMNOPQRST";
	let count = 0;
    for(let i = 0; i < Game.boardSize; i++) {
        let tr = tre[i] || await board.insertRow(-1);
        if(!tr.classList.contains('tr')) 
            tr.classList.add("tr");
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
            
           
            
            let td = tr.cells[j] || await tr.insertCell(-1);
            if(!td.classList.contains('cell')) 
                td.classList.add("cell");
            
            if(Game.version != "nigerian" && (j%2 == 1 && i%2 == 0 || j%2 == 0 && i%2 == 1) || Game.version === "nigerian" && (j%2 == 0 && i%2 == 0 || j%2 == 1 && i%2 == 1)) {
                if(!td.classList.contains('cell_black')) {
                    td.classList.add("cell_black");
                    td.setAttribute('onclick', `ValidateMove({cell: this, i: ${i}, j: ${j}})`);
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
	                    td.appendChild(div);
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
	                    td.appendChild(div);
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
						td.appendChild(div);
					}
					else if(Game.state[i][j].includes("W")) {
						let div = $$$("div");
						div.classList.add("piece_white");
						if(Game.state[i][j] == "KW")
						div.classList.add("crown_white");
						td.appendChild(div);
					} 
				} 
            }
            else {
                if(!td.classList.contains('cell_white')) {
                    td.classList.add("cell_white");
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
    return Prms("done");
} 

const Refresh = async (restart = false, color = playerA.pieceColor, gameState = []) => {
    // remove all the temporary css classes 
    let cells = $$("#table tr td");
    for(let cell of cells) {
        cell.className = "";
        cell.innerHTML = "";
        cell.removeAttribute("onclick");
        cell.style.pointerEvents = "auto";
    }
   
    for(let p of $$(".frame p")) {
        p.innerHTML = "";
        p.style.display = "flex";
    } 
    let table = $("#table");
    
    if(table.rows.length > 0) {
        for(i = 0; i < table.rows.length; i++) {
            if(i < Game.boardSize) {
                for(let j = Game.boardSize; j < table.rows.length; j++) 
                    table.rows[i].deleteCell(-1);
            }
            else if(i >= Game.boardSize)
                table.deleteRow(-1);
        } 
    } 
   
    // reset all the game states and players states 
    BackState.moves = [];
    Game.state = /*[["NA", "MB", "NA", "EC", "NA", "EC", "NA", "EC"],
				  ["MB", "NA", "MB", "NA", "EC", "NA", "MB", "NA"],
				  ["NA", "KB", "NA", "EC", "NA", "EC", "NA", "EC"],
				  ["EC", "NA", "EC", "NA", "MB", "NA", "MB", "NA"],
				  ["NA", "EC", "NA", "MW", "NA", "EC", "NA", "EC"],
				  ["EC", "NA", "MW", "NA", "MW", "NA", "MW", "NA"],
				  ["NA", "MW", "NA", "EC", "NA", "EC", "NA", "EC"],
				  ["MW", "NA", "EC", "NA", "MW", "NA", "MW", "NA"]];*/gameState;
    Game.track = [];
    Game.possibleCaptures = [];
    Game.possibleMoves = [];
    Game.over = false;
    Game.isComputer = false;
    Game.pieceSelected = false;
    Game.validForHint = true;
    Game.prop = null;
    Game.count = 1;
    Game.countMoves = 0;
    other.aiPath = [];
    other.helperPath = [];
    other.capturePath = [];
    playerA.kings = 0;
    playerA.moves = 0;
    playerA.captures = 0;
    playerA.longestCapture = 0;
    playerB.kings = 0;
    playerB.moves = 0;
    playerB.captures = 0;
    playerB.longestCapture = 0;
    $("#transmitter").style.display = "none";
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
            Game.possibleMoves = await Iterate({id, state: Game.state, func: AssesMoves});
            await Helper(Game.possibleMoves, Copy(Game.state));
        }
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
            Game.whiteTurn = (GetValue(btns[0], "background-image") == other.default);
        } 
        await LoadBoard(playerA.pieceColor, playerB.pieceColor);
        await UpdatePiecesStatus();
        Game.baseState = Copy(Game.state);
        if(Game.mode === "single-player") {
            let hint_label = $("#play-window .footer_section p label:last-of-type");
            hint_label.style.backgroundImage = "none";
            hint_label.classList.remove("not_valid_for_hint");
            if(screen.orientation.type.toLowerCase().includes("landscape")) {
                let versions = ["american", "kenyan", "casino", "international", "pool", "russian", "nigerian"];
                setTimeout(_ => Notify({action: "pop-up-alert",
                        header: Game.version.toUpperCase() + " CHECKERS<br>" + Game.levels[Game.level].level.toUpperCase(), 
                        icon: srcs[versions.indexOf(Game.version)],
                        iconType: "flag", 
                        delay: 1500}), 1000);
            } 
            if(Game.whiteTurn && playerB.pieceColor === "White" || !Game.whiteTurn && playerB.pieceColor === "Black") {
                setTimeout(_ => aiStart(), 100);
            }
            else if(Game.helper) {
                let id = playerA.pieceColor.slice(0,1);
                Game.possibleCaptures = await Iterate({id, state: Game.state, func: AssesCaptures});
                let moves = Game.possibleCaptures;
                if(Game.mandatoryCapture && Game.possibleCaptures.length == 0) {
                    Game.possibleMoves = await Iterate({id, state: Game.state, func: AssesMoves});
                    moves = Game.possibleMoves;
                }
                else if(!Game.mandatoryCapture) {
                    Game.possibleMoves = await Iterate({id, state: Game.state, func: AssesMoves});
                    moves = moves.concat(Game.possibleMoves);
                } 
                await Helper(moves, Copy(Game.state));
            } 
        }
        else if(Game.helper && Game.mode === "two-player-offline") {
            let id = (Game.whiteTurn && playerA.pieceColor === "White" || !Game.whiteTurn && playerA.pieceColor === "Black")? playerA.pieceColor.slice(0,1): playerB.pieceColor.slice(0,1);
            Game.possibleMoves = await Iterate({id, state: Game.state, func: AssesMoves});
            await Helper(Game.possibleMoves, Copy(Game.state));
        }
        else if(Game.helper && (Game.whiteTurn && playerA.pieceColor === "White" || !Game.whiteTurn && playerA.pieceColor === "Black")) {
            let id = playerA.pieceColor.slice(0,1);
            Game.possibleMoves = await Iterate({id, state: Game.state, func: AssesMoves});
            await Helper(Game.possibleMoves, Copy(Game.state));
        } 
        
        if(Game.rollDice) {
            if(Game.mode === "single-player") {
                Cancel();
                if(res) 
                setTimeout(_ => Notify({action: "pop-up-alert", 
                        header: "YOU WIN!<br>PLAY FIRST.", 
                        icon: Icons.diceIcon, 
                        iconType: "dice", 
                        delay: 1500}), 500);
                else if(!res) 
                setTimeout(_ => Notify({action: "pop-up-alert", 
                        header: "YOU LOSE!<br>OPPONENT FIRST.", 
                        icon: Icons.diceIcon, 
                        iconType: "dice", 
                        delay: 1500}), 500);
            } 
            else {
                let name;
                if(res) 
                    name = playerA.name;
                else
                    name = playerB.name;
                    
                name += "!";
                    
                setTimeout(_ => Notify({action: "pop-up-alert", 
                        header: "YOU WIN!<br>PLAY FIRST.", 
                        icon: Icons.diceIcon, 
                        iconType: "dice",
                        delay: 1500}), 500);
            } 
        } 
    } 
        
    async function aiStart () {
    	for(let cell of $$("#table .valid, #table .pre_valid, #table .hint, .helper_empty, .helper_filled")) { 
            cell.classList.remove("valid");
            cell.classList.remove("pre_valid");
            cell.classList.remove("hint");
            cell.classList.remove("helper_empty");
            cell.classList.remove("helper_filled");
        } 
        let state = Game.state;
    	let id = playerB.pieceColor.substring(0,1);
        Game.possibleCaptures = await Iterate({id, state, func: AssesCaptures});
        let moves = Game.possibleCaptures;
        
        if(Game.mandatoryCapture && Game.possibleCaptures.length == 0) {
            Game.possibleMoves = await Iterate({id, state, func: AssesMoves});
            moves = Game.possibleMoves;
        }
        else if(!Game.mandatoryCapture) {
            Game.possibleMoves = await Iterate({id, state, func: AssesMoves});
            moves = moves.concat(Game.possibleMoves);
        }
        await Helper(moves, Copy(Game.state));
        /*let ai = new AI({moves: moves, depth: 5, state});
        console.log(JSON.stringify(moves));
        console.log(JSON.stringify(await ai.filter(moves, state)));
        //await ai.makeMove();
        return;*/
        let chosen = (Math.random()*(moves.length - 1)).toFixed(0);
        let bestMove = moves[chosen];
        let i = parseInt(bestMove.cell.slice(0,1));
        let j = parseInt(bestMove.cell.slice(1,2));
        let m = parseInt(bestMove.empty.slice(0,1));
        let n = parseInt(bestMove.empty.slice(1,2));
        setTimeout( async () => {
            await ValidateMove({cell: $("#table").rows[i].cells[j], i, j, isComputer: true});
            await ValidateMove({cell: $("#table").rows[m].cells[n], i: m, j: n, isComputer: true});
        }, 250);
        return Prms("");
    } 
} 

const Alternate = async (color = playerA.pieceColor) => {
    playerA.pieceColor = color;
    if(playerA.pieceColor == "White") {
        playerA.pieceColor = 'Black';
        playerB.pieceColor = 'White';
        
        if(playerA.pieceColor == 'White') {
            await Alternate();
        } 
    } 
    else if(playerA.pieceColor == "Black") {
        playerA.pieceColor = 'White';
        playerB.pieceColor = 'Black';
        
        if(playerA.pieceColor == 'Black') {
            await Alternate();
        } 
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

// Game object 
const Game = {
    mode: "single-player",
    version: "american",
    versions: {american: [{score: 3, validForHint: true}],
               kenyan: [{score: 3, validForHint: true}],
               casino: [{score: 3, validForHint: true}],
               international: [{score: 3, validForHint: true}],
               pool: [{score: 3, validForHint: true}],
               russian: [{score: 3, validForHint: true}],
               nigerian: [{score: 3, validForHint: true}]
               }, 
    boardSize: 8,
    rowNo: 3,
    level: 0,
    count: 1,
    countMoves: 0,
    top: -5,
    path: {index: 0},
    isComputer: false, 
    pieceSelected: false, 
    thinking: false,
    alternatePlayAs: false, 
    whiteTurn: false,
    mandatoryCapture: true, 
    helper: true, 
    capturesHelper: false, 
    over: false, 
    validForHint: true, 
    prop: null, 
    levels: [{level: "BEGINNER LEVEL", validForHint: true, score: 0}, 
             {level: "EASY LEVEL", validForHint: true, score: 0}, 
             {level: "MEDIUM LEVEL", validForHint: true, score: 0}, 
             {level: "HARD LEVEL", validForHint: true, score: 0}, 
             {level: "ADVANCED LEVEL", validForHint: true, score: 0}, 
             {level: "EXPERT LEVEL", validForHint: true, score: 0}, 
             {level: "CANDIDATE MASTER", validForHint: true, score: 0}, 
             {level: "MASTER LEVEL", validForHint: true, score: 0}, 
             {level: "GRAND MASTER", validForHint: true, score: 0}], 
    state: [], 
    baseState: [], 
    possibleMoves: [], 
    possibleCaptures: [], 
    track: [], 
    stats: []
} 

const Player = function () {
    this.name = "";
    this.pieces = (Game.boardSize / 2) * Game.rowNo;
    this.pieceColor = "";
    this.kings = 0;
    this.moves = 0;
    this.captures = 0;
    this.longestCapture = 0;
} 
const playerA = new Player();
const playerB = new Player();
// Initializing players details 
playerA.pieceColor = "White";
playerA.name = "You";
playerB.pieceColor = "Black";
playerB.name = "AI";

function Copy (obj) {
    if(obj == undefined || obj == null)
        throw new Error("Argument object can not be undefined or null");
    return JSON.parse(JSON.stringify(obj));
} 
function Prms (value) {
    if(value == undefined || value == null)
        throw new Error("Argument object can not be undefined or null");
	return new Promise(resolve => {return resolve(value)});
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

const GetPosition = function (child, parent = document.body) {
    parent = child.parentNode;
    
    let childTop = parseInt(GetValue(child, "margin-top")), //+ (0.75 * (Game.boardSize - parent.parentNode.rowIndex - 1)), 
        childLeft  = parseInt(GetValue(child, "margin-left")), //+ (0.75 * (Game.boardSize - parent.cellIndex - 1)), 
        parentTop = getOffset(true, parent.parentNode.rowIndex),
        parentLeft  = getOffset(false, parent.parentNode.rowIndex, parent.cellIndex), 
        apparentTop = parentTop + childTop, 
        apparentLeft  = parentLeft + childLeft;
        
    //apparentTop = apparentTop / $("#table").clientHeight * 100;
    //apparentLeft = apparentLeft / $("#table").clientWidth * 100;
    
    this.top = apparentTop; 
    this.left = apparentLeft;
    
    //alert(apparentTop + "\n" + apparentLeft + "\nTable size: " + $("#table").clientHeight);
   
    function getOffset(isRow, m, n) {
        let rows = $("#table").rows;
        let offset = 0;
        let length = 0;
        let i = 0;
        if(isRow) {
            while(i < Game.boardSize) {
                if(i < m) 
                    offset += rows[i].clientHeight;
                length += rows[i].clientHeight;
                i++;
            } 
        }
        else {
            let cells = rows[m].cells;
            while(i < Game.boardSize) {
                if(i < n) 
                    offset += cells[i].clientWidth;
                length += rows[i].clientHeight;
                i++;
            } 
        }
        
        // due to unexplained reasons, chrome total length of the cells is greater by 2 pixels on the actual width of the table 
        if(length > $("#table").clientWidth && screen.orientation.type.toLowerCase().includes("portrait")) {
            if(isRow) {
                offset = length / Game.boardSize * m;
                offset -= m > Game.boardSize / 2? 0.5 * (m - (Game.boardSize / 2)): 0;
            } 
            else {
                offset = length / Game.boardSize * n;
                offset -= n > Game.boardSize / 2? 0.5 * (n - (Game.boardSize / 2)): 0;
            } 
        }
        else if(screen.orientation.type.toLowerCase().includes("landscape")) {
            //offset += 0.5;
        } 
        return offset;
    } 
} 

class Move {
    scene = $("#transmitter");
    moving = $$("#transmitter .outer");
    root = document.documentElement;
    constructor (prop) {
        if(this.moving.length === 0 && prop.select) {
            this.select(prop);
            return;
        }
        else if(this.moving.length === 0 && prop.movePiece) {
            this.makePath(prop);
            return;
        } 
        else if(this.moving.length === 0 && prop.capture) { 
        	this.select(prop);
        	return;
        }
        else if(this.moving.length === 0 && prop.captureMove) {
        	return this.captures(prop);
        }
    }
   
    captures = async function (prop) {
        let final = false;
    	let validMove = false;
    	// Remove Helper cells for filtering purposes 
    	for(let cell of $$("#table .helper_empty, #table .pre_valid")) {
    		cell.classList.remove("helper_empty");
    		cell.classList.remove("pre_valid");
    	} 
    	for(let sort of prop.sorted) {
    		for(let move of sort) {
    			let empty = `${prop.i}${prop.j}`;
    			if((!Game.path.sort || JSON.stringify(Game.path.sort.slice(0, Game.path.sort.indexOf(move))) == JSON.stringify(sort.slice(0, sort.indexOf(move)))) && move.empty == empty) {
    				Game.path = {sort, index: sort.indexOf(move)};
    				validMove = true;
				    for(let move2 of sort.slice(0, sort.indexOf(move) + 1)) {
					    let cell = $("#table").rows[parseInt(move2.empty.slice(0,1))].cells[parseInt(move2.empty.slice(1,2))];
					    cell.classList.remove("helper_empty");
					    cell.classList.remove("pre_valid");
					    cell.classList.remove("invalid");
			            cell.classList.add("valid");
					    cell.style.pointerEvents = "none";
					    if(cell.lastChild)
						    cell.removeChild(cell.lastChild);
				    }
    				$$(".controls")[1].style.pointerEvents = "none";
                    $$(".controls")[2].style.pointerEvents = "none";
                    $$(".horiz_controls")[1].style.pointerEvents = "none";
                    $$(".horiz_controls")[2].style.pointerEvents = "none";
				    
    				if(sort.indexOf(move) != sort.length-1) {
    					let clone = Game.prop.cell.lastChild.cloneNode(true);
        				clone.style.opacity = "0.5";
			            prop.cell.appendChild(clone);
					    Game.prop.cell.style.pointerEvents = "none";
    				} 
    				else {
					    final = true;
    				} 
    			}
    			//Filter helper cells
    			if(!(Game.mode == "single-player" && (Game.whiteTurn && playerB.pieceColor == "White" || !Game.whiteTurn && playerB.pieceColor == "Black")) && (!Game.path.sort || (Game.helper || Game.capturesHelper) && sort.indexOf(move) > Game.path.index && JSON.stringify(Game.path.sort.slice(0, Game.path.sort.indexOf(move))) == JSON.stringify(sort.slice(0, sort.indexOf(move))))) {
    				let m = parseInt(move.empty.slice(0,1));
				    let n = parseInt(move.empty.slice(1,2));
				    let cell = $("#table").rows[m].cells[n];
				    if(Game.helper || Game.capturesHelper) 
					    cell.classList.add("helper_empty");
				    else
					    cell.classList.add("pre_valid");
    			} 
    		}
		    if(final) {
			    for(let move of Game.path.sort) {
				    let i = parseInt(move.empty.slice(0,1));
				    let j = parseInt(move.empty.slice(1,2));
				    let cell1 = $("#table").rows[i].cells[j];
				    let clone = cell1.lastChild;
				    if(!cell1.lastChild) {
					    clone = Game.prop.cell.lastChild.cloneNode(true);
					    clone.style.opacity = "0";
		            	cell1.appendChild(clone);
				    } 
				    
				    let m = parseInt(move.cell.slice(0,1));
				    let n = parseInt(move.cell.slice(1,2));
				    let cell2 = $("#table").rows[m].cells[n];
				    cell2.style.pointerEvents = "none";
				    
				    await this.select({cell: cell2, i: m, j: n}, true);
				    let track2 = await this.makePath({cell: cell1, piece: clone, i, j}, true);
				    track2.a = parseInt(move.capture.slice(0,1));
				    track2.b = parseInt(move.capture.slice(1,2));
				    Game.track.push([Game.prop, track2]);
			    }
			    // removing valid cell states
			    for(let move of Game.path.sort) {
				    let i = parseInt(move.empty.slice(0,1));
				    let j = parseInt(move.empty.slice(1,2));
				    let cell1 = $("#table").rows[i].cells[j];
				    cell1.classList.remove("valid");
			    } 
			    Move.startMoving();
			    break;
		    } 
    	}
    	
    	if(validMove && Game.mode === "two-player-online" && (Game.whiteTurn && playerA.pieceColor === "White" || !Game.whiteTurn && playerA.pieceColor === "Black") ) {
            Publish.send({channel: Lobby.CHANNEL, message: {title: "Moved", content: {i: prop.i, j: prop.j} } });
        }
    	return validMove;
    } 
   
    static startMoving = async function (n = 0) {
   	 Game.prop = Game.track[n][0];
   	 let prop = Game.track[n][1];
   	 prop.n = n;
   	 if(n == Game.track.length-1) {
   		 Game.path = {index: 0};
   		 prop.final = true;
   	 } 
   	 new Move({}).attachToScene(prop, true);
    }
        
        
    select = async function (prop, capture = false) { //try {
    	//publish for selecting both ordinary and capture moves
        if(!capture && Game.mode === "two-player-online" && (Game.whiteTurn && playerA.pieceColor === "White" || !Game.whiteTurn && playerA.pieceColor === "Black") ) {
            Publish.send({channel: Lobby.CHANNEL, message: {title: "Moved", content: {i: prop.i, j: prop.j} } });
        }
        
        if(this.moving.length > 0) {
            await Move.detachFromScene();
        } 
       
        if(!capture)
	        for(let cell of $$("#table .valid, #table .pre_valid, #table .hint, .helper_empty, .helper_filled")) {
	            cell.classList.remove("valid");
	            cell.classList.remove("pre_valid");
	            cell.classList.remove("hint");
	            cell.classList.remove("helper_empty");
	            cell.classList.remove("helper_filled");
	        } 
        
        
        this.scene.style.display = "table";
        let piece = prop.cell.lastChild;
        let pos = new GetPosition(piece, $("#table"));
        let x1 = pos.left;
        let y1 = pos.top;
        let h1 = piece.offsetHeight; 
        let w1 = piece.offsetWidth; 
        this.scene.style.display = "none";
        Game.pieceSelected = true;
        Game.isComputer = prop.isComputer;
        Game.prop = {cell: prop.cell, x1, y1, h1, w1, i: prop.i, j: prop.j};
        
        prop.cell.classList.add("valid");
        return Prms(true);
        //} catch (error) {Notify({action: "alert", header: "Error 0!", message: error});} 
    } 
    
    makePath = function (prop, capture = false) { //try {
    	// publish for ordinary moves
    	if(!capture && Game.mode === "two-player-online" && (Game.whiteTurn && playerA.pieceColor === "White" || !Game.whiteTurn && playerA.pieceColor === "Black") ) {
            Publish.send({channel: Lobby.CHANNEL, message: {title: "Moved", content: {i: prop.i, j: prop.j} } });
        } 
        this.scene.style.display = "table";
        if(!capture) {
            for(let cell of $$("#table .hint"))
                cell.classList.remove("hint");
        	Game.prop.cell.classList.remove("valid");
        } 
        let clone = prop.cell.lastChild || Game.prop.cell.lastChild.cloneNode(true);
        if(prop.cell.children.length == 0) {
	        clone.style.opacity = "0.5";
	        prop.cell.appendChild(clone);
		} 
        
        let pos = new GetPosition(clone, $("#table"));
        let x2 = pos.left - Game.prop.x1;
        let y2 = pos.top - Game.prop.y1;
        this.scene.style.display = "none";
        if(!capture)
            this.attachToScene({cell1: Game.prop.cell, cell2: prop.cell, x2, y2, i: prop.i, j: prop.j});
        else {
        	return {cell1: Game.prop.cell, cell2: prop.cell, x2, y2, i: prop.i, j: prop.j};
        } 
        //} catch (error) {Notify({action: "alert", header: "Error 1!", message: error});} 
    } 
    
    attachToScene = async function (prop, capture = false) { //try {
        let piece = Game.prop.cell.lastChild;
        Game.prop.cell.removeChild(piece);
        piece.classList.add("outer");
        piece.style.height = Game.prop.h1.toFixed(16) + "px";
        piece.style.width = Game.prop.w1.toFixed(16) + "px";
        piece.style.margin = "0px";
        piece.style.top = `${Game.prop.y1}px`;
        piece.style.left = `${Game.prop.x1}px`;
        piece.style.boxShadow = piece.classList.contains("piece_black")? `0 var(--shadow-width) 0 0 #1A1A1A, 0 calc(var(--shadow-width) + 2px) 5px 0 #502C00`: `0 var(--shadow-width) 0 0 #999999, 0 calc(var(--shadow-width) + 2px) 5px 0 #502C00`;
        this.root.style.setProperty('--ept', prop.y2.toFixed(16) + "px");
        this.root.style.setProperty('--epl', prop.x2.toFixed(16) + "px");
        let id = Game.state[Game.prop.i][Game.prop.j].substring(1,2);
        let angle = parseInt(GetValue(this.root, "--angleZ" + id));
        this.root.style.setProperty("--angleZP", angle + "deg");
        
        let mt = 0.35;
    	let increase = mt * 0.25;
    	let no_of_cells = Math.abs(Game.prop.i - prop.i);
    	for(let i = 1; i < no_of_cells; i++) {
    		mt += increase;
    	} 
    	this.root.style.setProperty("--mt", mt + "s");
        
       
        if(screen.orientation.type.toLowerCase().includes("landscape")) {
        	mt += mt * 0.25;
        	this.root.style.setProperty("--mt", mt + "s");
        } 
        
        prop.cell2.removeChild(prop.cell2.lastChild);
        
        other.prop = prop;
        //capture = capture;
        
        piece.setAttribute('onanimationend', `Move.detachFromScene(${capture})`);
        this.scene.appendChild(piece);
        this.scene.style.display = "table";
        //await new Sleep().wait(0.001);
        piece.classList.add("move");
        
        //} catch (error) {Notify({action: "alert", header: "Error 2!", message: error});} 
    } 
    
    static detachFromScene = async function (capture) { 
        let prop = other.prop;
        let scene = $("#transmitter");
        let root = document.documentElement;
        Game.pieceSelected = false;
        //try {
        if(Game.prop != null && prop != null) {
            for(let cell of $$("#table .valid, #table .pre_valid, #table .hint, .helper_empty, .helper_filled")) {
                cell.classList.remove("valid");
                cell.classList.remove("pre_valid");
                cell.classList.remove("hint");
                cell.classList.remove("helper_empty");
                cell.classList.remove("helper_filled");
            } 
            other.helperPath = [];
            let piece = scene.lastChild;
            scene.removeChild(piece);
            scene.style.display = "none";
            piece.classList.remove("move", "outer"); 
            piece.removeAttribute("onanimationend");
           
            prop.cell2.appendChild(piece);
            piece.style.height = "var(--piece_size)";
            piece.style.width  = "var(--piece_size)";
            piece.style.margin = "auto";
            piece.style.marginTop = "calc(calc(100% - var(--piece_size)) / 2 - var(--shadow-width))";
            piece.style.boxShadow = piece.classList.contains("piece_black")? `0 var(--shadow-width) 0 0 #1A1A1A, 0 calc(var(--shadow-width) + 2px) 3px 0 var(--shadow-color)`: `0 var(--shadow-width) 0 0 #999999, 0 calc(var(--shadow-width) + 2px) 3px 0 var(--shadow-color)`;
            
            if(screen.orientation.type.toLowerCase().includes("landscape")) {
                root.style.setProperty("--piece_size", "80%");
            }
            else {
                root.style.setProperty("--piece_size", "85%");
            }
            
            prop.cell = prop.cell2;
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
                
                // Updating players kings made stats
                if(piece.className.includes(playerA.pieceColor.toLowerCase()))
                playerA.kings++;
                else
                playerB.kings++;
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
                        prop.cell1.classList.add("valid");
                        prop.cell2.classList.add("valid");
					} 
                    if(prop.king) {
                        AudioPlayer.play("king", 1);
                    } 
                    else {
                        AudioPlayer.play("click", 0.8);
                    } 
                    if(Game.possibleCaptures.length) {
                    	if(!Game.mandatoryCapture) {
                    		Game.possibleMoves = await Iterate({id, state: Game.state, func: AssesMoves});
                    		await Helper(Game.possibleMoves.concat(Game.possibleCaptures), Copy(Game.state));
                    		await Helper(Game.possibleCaptures, Copy(Game.state));
                    	}
                    	else
                    		Helper(Game.possibleCaptures, Copy(Game.state));
                    }
                    else if(Game.mode == "two-player-offline" || (Game.mode === "single-player" || Game.mode === "two-player-online") && Game.whiteTurn && playerA.pieceColor === "White" || !Game.whiteTurn && playerA.pieceColor === "Black") {
                    	Helper(Game.possibleMoves, Copy(Game.state));
                    }
                    
                    if(Game.mode === "single-player" && (Game.whiteTurn && playerB.pieceColor === "White" || !Game.whiteTurn && playerB.pieceColor === "Black") ) {
                        UpdatePiecesStatus("thinking...");
                        setTimeout( async () => { //try {
                            let id = playerB.pieceColor.substring(0,1);
                            let state = Copy(Game.state);
                            let moves = Game.possibleCaptures;
                            if(Game.mandatoryCapture && moves.length == 0) {
                                moves = Game.possibleMoves;
                            } 
                            else if(!Game.mandatoryCapture) {
                                moves = moves.concat(Game.possibleMoves);
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
                    $$(".controls")[1].style.pointerEvents = "auto";
                    $$(".controls")[2].style.pointerEvents = "auto";
                    $$(".horiz_controls")[1].style.pointerEvents = "auto";
                    $$(".horiz_controls")[2].style.pointerEvents = "auto";
                    
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
                        for(let track of Game.track) {
                            //marking the moves made
                            if(Game.helper || Game.capturesHelper) {
                                track[0].cell.classList.add("valid");
                                track[1].cell.classList.add("valid");
							} 
                            track[0].cell.style.pointerEvents = "auto";
                            track[1].cell.style.pointerEvents = "auto";
                            // Getting the table position to aid undo in the array
                            i = track[1].a;
                            j = track[1].b;
                            let capturedPiece = $("#table").rows[i].cells[j].firstChild;
                            
                            id = (capturedPiece.className.includes("white"))? "W": "B";
                            id = ((capturedPiece.className.includes("crown"))? "K": "M") + id;
                            // storing information for undo purposes 
                            captures.push([capturedPiece, i, j, id]);
                            
                            // adding fading animation effect to the captured piece
                            capturedPiece.setAttribute("onanimationend", "End(event)");
                            capturedPiece.classList.add("captured");
                        } 
                        
                        BackState.moves.push([Game.track[0][0], prop, captures]);
                        
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
                            
                        Game.track = [];
                        if(Game.possibleCaptures.length) {
                        	if(!Game.mandatoryCapture) {
                        		Game.possibleMoves = await Iterate({id, state: Game.state, func: AssesMoves});
                        		await Helper(Game.possibleMoves.concat(Game.possibleCaptures), Copy(Game.state));
                        		await Helper(Game.possibleCaptures, Copy(Game.state));
                        	}
                        	else
                        		Helper(Game.possibleCaptures, Copy(Game.state));
                        }
                        else if(Game.mode == "two-player-offline" || (Game.mode === "single-player" || Game.mode === "two-player-online") && Game.whiteTurn && playerA.pieceColor === "White" || !Game.whiteTurn && playerA.pieceColor === "Black") {
                        	Helper(Game.possibleMoves, Copy(Game.state));
                        }
                        
                        if(Game.mode === "single-player" && (Game.whiteTurn && playerB.pieceColor === "White" || !Game.whiteTurn && playerB.pieceColor === "Black") ) {
                            UpdatePiecesStatus("thinking...");
                            setTimeout( async () => { //try {
                                let id = playerB.pieceColor.substring(0,1);
                                let state = Copy(Game.state);
                                let moves = Game.possibleCaptures;
                                if(Game.mandatoryCapture && moves.length == 0) {
                                    moves = Game.possibleMoves;
                                } 
                                else if(!Game.mandatoryCapture) {
                                    moves = moves.concat(Game.possibleMoves);
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
        return;
        //} catch (error) {Notify({action: "alert", header: "Error 3!", message: error});} 
    } 
    
    static isOver = async function (id) {
        Game.possibleCaptures = await Iterate({id, state: Game.state, func: AssesCaptures});
        
        if(Game.possibleCaptures.length > 0) {
            if(Game.mandatoryCapture) 
            await UpdatePiecesStatus("Mandatory Capture!");
            else
            await UpdatePiecesStatus("Captures Available!");
            Game.countMoves = playerA.moves;
        } 
        else {
            //Calling this method to update the players pieces to help ascertain if game is over
            await UpdatePiecesStatus();
            // Checking if its a draw
            if((playerA.moves - Game.countMoves) == 2) { 
                if(JSON.stringify(Game.baseState) == JSON.stringify(Game.state)) {
                    if(Game.count === 2) {
                        GameOver(true);
                        return;
                    } 
                    else 
                        Game.count++;
                } 
                else {
                    Game.count = 1;
                    Game.baseState = Copy(Game.state);
                } 
                Game.countMoves = playerA.moves;
            } 
            // Checking if game is over
            Game.possibleMoves = await Iterate({id, state: Game.state, func: AssesMoves});
            if(playerA.pieces === 0 || playerB.pieces === 0 || Game.possibleMoves.length === 0) {
                GameOver();
                return Prms(true);
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
      
    if(!Game.over) {
    	let isEmpty = prop.cell.lastChild && prop.cell.lastChild.className.includes("captured") || prop.cell.children.length == 0;
        let valid = isEmpty && Game.pieceSelected || !isEmpty && (Game.mode === "two-player-offline" && (Game.whiteTurn && prop.cell.lastChild.className.includes("piece_white") || !Game.whiteTurn && prop.cell.lastChild.className.includes("piece_black")) || prop.isComputer && prop.cell.lastChild.className.includes(playerB.pieceColor.toLowerCase()) || Game.whiteTurn && prop.cell.lastChild.className.includes("piece_white") && playerA.pieceColor == "White" || !Game.whiteTurn && prop.cell.lastChild.className.includes("piece_black") && playerA.pieceColor == "Black");
        
        if(valid) {
            let id = Game.state[prop.i][prop.j];
            let posId = `${prop.i}${prop.j}`; //posId for position identifier
            
            if(Game.possibleCaptures.length > 0 && !isEmpty) {
                for(let type of Game.possibleCaptures) {
                    if(type.cell == posId) {
                        prop.capture = true;
                        new Move(prop) ;
                        if(other.helperPath.length > 0) { 
                            let indices = [], 
                                startIndex = -1,
                                lastIndex = -1;
                            for(let cell of other.helperPath) {
                                if(cell.source) 
                                indices.push(other.helperPath.indexOf(cell));
                            } 
                            for(let index of indices) {
                                if(startIndex != -1 && other.helperPath[index].cell !== type.cell) {
                                    lastIndex = index
                                    break;
                                } 
                                if(startIndex == -1 && other.helperPath[index].cell === type.cell) {
                                    startIndex = index;
                                } 
                            } 
                            lastIndex = (lastIndex === -1)? other.helperPath.length: lastIndex;
                            other.capturePath = Copy(other.helperPath.slice(startIndex, lastIndex));
                            if(Game.helper || Game.capturesHelper) 
	                            if((Game.mode == "two-player-offline" || Game.mode == "two-player-online") || Game.mode == "single-player" && Game.whiteTurn && playerA.pieceColor === "White" || !Game.whiteTurn && playerA.pieceColor === "Black") {
		                            for(let cell of other.capturePath) {
		                                $("#table").rows[cell.m].cells[cell.n].classList.add("helper_empty");
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
           else if(Game.possibleCaptures.length > 0 && isEmpty && Game.isComputer == prop.isComputer) {
           	prop.sorted = await SortCaptures(other.capturePath);
           	prop.captureMove = true;
           	let validMove = await new Move(prop) ;
           	if(validMove) return;
           } 
            
           if(!isEmpty) {
                Game.possibleMoves = await AssesMoves({id, i: prop.i, j: prop.j, state: Game.state});
                if(Game.possibleMoves.length > 0) {
                	prop.select = true;
                    new Move(prop) ;
                    if(Game.helper && other.aiPath.length == 0) {
                        for(let move of Game.possibleMoves) {
                            let m = parseInt(move.empty.slice(0,1));
                            let n = parseInt(move.empty.slice(1,2));
                            $("#table").rows[m].cells[n].classList.add("hint");
                        } 
                    } 
                    return;
                } 
            } 
            else if(Game.isComputer == prop.isComputer) {
                for(let type of Game.possibleMoves) {
                    if(type.empty == posId && type.cell == `${Game.prop.i}${Game.prop.j}`) {
                    	prop.movePiece = true;
                        new Move(prop) ;
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
            let label = $$("#play-window .footer_section p label");
            if(Game.validForHint) {
               let threshold = Math.floor((Game.boardSize / 2 * Game.rowNo) / 4);
               if(playerA.pieces < threshold) {
                   label[0].classList.remove("not_achieved", "achieved");
                   label[1].classList.remove("not_achieved", "achieved");
                   label[2].classList.remove("not_achieved", "achieved");
                   label[0].classList.add("not_achieved");
                   label[1].classList.add("not_achieved");
                   label[2].classList.add("not_achieved");
               }
               else if(playerA.pieces >= threshold && playerA.pieces < threshold * 2) {
                   label[0].classList.remove("not_achieved", "achieved");
                   label[1].classList.remove("not_achieved", "achieved");
                   label[2].classList.remove("not_achieved", "achieved");
                   label[0].classList.add("achieved");
                   label[1].classList.add("not_achieved");
                   label[2].classList.add("not_achieved");
               }
               else if(playerA.pieces >= threshold * 2 && playerA.pieces < threshold * 3) {
                   label[0].classList.remove("not_achieved", "achieved");
                   label[1].classList.remove("not_achieved", "achieved");
                   label[2].classList.remove("not_achieved", "achieved");
                   label[0].classList.add("achieved");
                   label[1].classList.add("achieved");
                   label[2].classList.add("not_achieved");
               }
               else if(playerA.pieces >= threshold * 3) {
                   label[0].classList.remove("not_achieved", "achieved");
                   label[1].classList.remove("not_achieved", "achieved");
                   label[2].classList.remove("not_achieved", "achieved");
                   label[0].classList.add("achieved");
                   label[1].classList.add("achieved");
                   label[2].classList.add("achieved");
               }
            }
            else {
                label[0].classList.remove("not_achieved", "achieved");
                label[1].classList.remove("not_achieved", "achieved");
                label[2].classList.remove("not_achieved", "achieved");
                label[0].classList.add("not_achieved");
                label[1].classList.add("not_achieved");
               label[2].classList.add("not_achieved");
            } } catch (error) {Notify(error + "");}
            barA.innerHTML = `${playerA.pieceColor}: ${playerA.pieces}        ${playerB.pieceColor}: ${playerB.pieces}`
            barB.innerHTML = `${playerA.pieceColor}: ${playerA.pieces}        ${playerB.pieceColor}: ${playerB.pieces}`
        } 
        else {
            barA.innerHTML = `${playerA.name} (${playerA.pieceColor.toUpperCase()}): ${playerA.pieces}        ${playerB.name} (${playerB.pieceColor.toUpperCase()}): ${playerB.pieces}`;
            barB.innerHTML = `${playerA.pieceColor.toUpperCase()}: ${playerA.pieces}        ${playerB.pieceColor.toUpperCase()}: ${playerB.pieces}`;
        }
    } 
    
    function countPieces () {
        let id1 = playerA.pieceColor.slice(0,1);
        let id2 = playerB.pieceColor.slice(0,1);
        playerA.pieces = playerB.pieces = 0;
        
        for(let row of Game.state) {
            for(let id of row) {
                if(id.includes(id1)) 
                playerA.pieces++;
                else if(id.includes(id2))
                playerB.pieces++;
            } 
        } 
    } 
} 

const GameOver = async (isDraw = false) => { try {
    /** Based on the property whiteTurn of the Game object, we can compare it against the player's piece color to identify whose turn was. 
      * The player identified is the loser
      */
    let name = (Game.whiteTurn && playerA.pieceColor.includes("White") || !Game.whiteTurn && playerA.pieceColor.includes("Black"))? playerA.name: playerB.name;
    isDraw = (playerA.pieces === playerB.pieces && playerA.pieces === Game.boardSize / 2 * Game.rowNo)? true: isDraw;
    other.pressed = false;
    
    if(Game.mode === "single-player") {
        if(!Game.over && !isDraw) {
            if(name === playerA.name) {
                AudioPlayer.play("game_lose", 1);
            } 
            else {
                AudioPlayer.play("game_win", 1);
            } 
        } 
        if(name === playerA.name && !isDraw)
            Notify({action: "confirm", 
                    header: "YOU LOSE!", 
                    message: "Oops!<br>Too bad. You are better than this.", 
                    type: "MENU/REPLAY", 
                    icon: Icons.loserIcon, 
                    iconType: "loser", 
                    onResponse: GameOverOption});
        else if(isDraw) {
            if(playerA.pieces != Game.boardSize / 2 * Game.rowNo) {
                Notify({action: "other", 
                        header: "DRAW!", 
                        message: "If you don't accept, press continue", 
                        type: "MENU/CONTINUE/REPLAY", 
                        icon: Icons.drawIcon, 
                        iconType: "draw", 
                        onResponse: GameOverOption});
            } 
            else {
                Notify({action: "confirm", 
                    header: "DRAW!", 
                    message: "Good game!<br>But you can do better. ", 
                    type: "MENU/REPLAY", 
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
            Notify({action: (level < Game.levels.length-1)? "other": "confirm", 
                    header: "YOU WIN!", 
                    message: "Congratulations!<br>" + (level < Game.levels.length-1? ` You can now proceed to ${Game.levels[Game.level + 1].level.toLowerCase().replace(/^\w/, t => t.toUpperCase())}.`: ` That was a good play. you can try other versions.`),
                    type: (level < Game.levels.length-1)? "MENU/REPLAY/NEXT LEVEL": "MENU/REPLAY", 
                    icon: Icons.winnerIcon,
                    iconType: "winner", 
                    onResponse: GameOverOption});
        }
    } 
    else if(Game.mode === "two-player-offline") {
        if(!Game.over && !isDraw)
            AudioPlayer.play("game_win", 1);
        
        if(!isDraw) {
            Notify({action: "confirm", 
                    header: (name === playerA.name)? playerB.name.toUpperCase(): playerA.name.toUpperCase() + " WINS!", 
                    message: "Congratulations! Keep it up.",
                    type: "MENU/REPLAY", 
                    icon: Icons.winnerIcon,
                    iconType: "winner", 
                    onResponse: GameOverOption});
        }
        else if(!isDraw) {
            if(playerA.pieces != playerB.pieces) {
                Notify({action: "other", 
                        header: "DRAW!", 
                        message: "If you don't accept, press continue", 
                        type: "MENU/CONTINUE/REPLAY", 
                        icon: Icons.drawIcon,
                        iconType: "draw", 
                        onResponse: GameOverOption});
            } 
            else {
                Notify({action: "confirm", 
                    header: "DRAW!", 
                    message: "You people really don't wanna give in to each other.<br>What about trying again?", 
                    type: "MENU/REPLAY", 
                    icon: Icons.drawIcon,
                    iconType: "draw", 
                    onResponse: GameOverOption});
            } 
        }
    } 
    else if(Game.mode === "two-player-online") {
        if(!Game.over && !isDraw) {
            if(name === playerA.name) {
                AudioPlayer.play("game_lose", 1);
            } 
            else {
                AudioPlayer.play("game_win", 1);
            } 
        } 
        if(name === playerA.name && !isDraw)
            Notify({action: "confirm", 
                    header: "YOU LOSE!", 
                    message: "You might want to rematch :-)", 
                    type: "MENU/REPLAY", 
                    icon: Icons.loserIcon, 
                    iconType: "loser", 
                    onResponse: GameOverOption});
        else if(isDraw) {
            if(playerA.pieces != playerB.pieces) {
                Notify({action: "other", 
                        header: "DRAW!", 
                        message: "If you don't accept, press continue.", 
                        type: "MENU/CONTINUE/REPLAY", 
                        icon: Icons.drawIcon,
                        iconType: "draw", 
                        onResponse: GameOverOption});
            } 
            else {
                Notify({action: "confirm", 
                    header: "DRAW!", 
                    message: "You might want to rematch :-)", 
                    type: "MENU/REPLAY", 
                    icon: Icons.drawIcon,
                    iconType: "draw", 
                    onResponse: GameOverOption});
            } 
        } 
        else 
            Notify({action: "confirm", 
                    header: "YOU WIN!", 
                    message: "Congratulations! Keep it up.",
                    type: "MENU/REPLAY", 
                    icon: Icons.winnerIcon,
                    iconType: "winner", 
                    onResponse: GameOverOption});
    }
    
    if(!Game.over) {
        await UpdatePiecesStatus("Game Over!");
        Game.levels[Game.level].validForHint = Game.validForHint;
        playerA.captures = Game.boardSize / 2 * Game.rowNo - playerB.pieces;
        playerB.captures = Game.boardSize / 2 * Game.rowNo - playerA.pieces;
        // Caching stats
        Game.stats.push({playerName: [playerA.name, playerB.name],
                         pieceColor: [playerA.pieceColor.toUpperCase(), playerB.pieceColor.toUpperCase()],
                         gameStatus: [(name === playerA.name)? "LOST": "WON", (name === playerB.name)? "LOST": "WON"], 
                         piecesRemaining: [playerA.pieces, playerB.pieces], 
                         kingsMade: [playerA.kings, playerB.kings], 
                         movesMade: [playerA.moves, playerB.moves],
                         capturesMade: [playerA.captures, playerB.captures], 
                         longestCapture: [playerA.longestCapture, playerB.longestCapture]
                        });
        // Updating Games window 
        let length = Game.stats.length;
        let mainSec = $("#games-window #games");   
        let subSec = $$$("section");
        subSec.classList.add("sub_item");
        let p = $$$("p");
        p.innerHTML = `${playerA.name} [${playerA.pieceColor.toUpperCase()}] VS ${playerB.name} [${playerB.pieceColor.toUpperCase()}] ${(Game.mode === "single-player")? "<br/><br/> " + Game.version.substring(0,3).toUpperCase() + ": " + Game.levels[Game.level].level: ""}`;
        let btn = $$$("button");
        btn.classList.add("default", "middle_top");
        btn.innerHTML = "SEE STATS";
        btn.addEventListener("click", () => GetStats(length - 1), false);
        subSec.appendChild(p);
        subSec.appendChild(btn);
        mainSec.appendChild(subSec);
       
        try {
            if(Game.mode === "single-player") {
                Game.stats[length-1].level = Game.levels[Game.level].level;
                Game.stats[length-1].version = Game.version.substring(0,3).toUpperCase();
            }
            
            storage.setItem("stats", JSON.stringify(Game.stats));
        } catch (error) {} 
    } 
    
    if(!isDraw || playerA.pieces === playerB.pieces && playerA.pieces === Game.boardSize / 2 * Game.rowNo)
    Game.over = true;
    Game.isDraw = isDraw;
    
    async function GameOverOption (choice) {
        if(!other.pressed) {
            if(choice === "MENU") {
                if(Game.isDraw) {
                    Game.stats[Game.stats.length-1].gameStatus[0] = "DRAW";
                    Game.stats[Game.stats.length-1].gameStatus[1] = "DRAW";
                } 
                Cancel();
                back();
                return;
            } 
            else if(choice === "REPLAY") {
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
                        Game.whiteTurn = (GetValue(btns[0], "background-image") == other.default);
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
                
                await setTimeout(_ => {Refresh(true);}, 200);
                Cancel();
                return;
            } 
            else if(choice === "NEXT LEVEL") {
                await Level(true);
                Cancel();
            } 
            else if(choice === "CONTINUE") {
                Game.count = 1;
                Game.countMoves = playerA.moves;
                Game.baseState = Copy(Game.state);
                if(Game.mode === "single-player" && (Game.whiteTurn && playerB.pieceColor.includes("W") || !Game.whiteTurn && playerB.pieceColor.includes("B")) ) {
                    let id = playerB.pieceColor.substring(0,1);
                    let state = Copy(Game.state);
                    let moves = await Iterate({id, state, func: AssesMoves});
                    let ai = new AI({state, moves, depth: Game.level});
                    await ai.makeMove(false);
                } 
                Cancel();
            }
            other.pressed = true;
        }
        else
            return;
    }
    } catch (error) {Notify({action: "alert",
                             header: error.name,
                             message: error.message + " at GameOver"})}
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
    if(elem != undefined && !elem.innerHTML.includes("LOCKED") || elem != undefined && !click) {
        let btns = parent.children;
        for(let btn of btns) {
            if(parent.id !== "vc" && btn.tagName.toLowerCase() == "div" || parent.id !== "vc" && btn.tagName.toLowerCase() == "button") {
                btn.style.background = other.background;
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
            
            if(elem.innerHTML == "SINGLE PLAYER") 
                $("#main-window #levels h2").style.color = "#000";
            else
                $("#main-window #levels h2").style.color = "#6C6C6C";
        } 
        
        //setting background to green
        if(parent.id !== "vc") 
            elem.style.background = other.default; //"rgba(0, 152, 25, 0.9)";
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
            
            if(elem.innerHTML === "SINGLE PLAYER" || parent.id === "nav") {
                if(parent.id === "nav") other.level = elem;
                await Enable($("#main-window #levels #nav"), other.background, "#fff");
            } 
            else {
                await Disable($("#main-window #levels #nav"), other.disabled, "#B4B4B4");
            }
        }
    }
    else if(elem != undefined && elem.innerHTML.includes("LOCKED")) {
        //resetting size
        clearTimeout(other.timeout);
        elem.children[1].style.backgroundSize = "calc(calc(.2 * var(--W) ) - 5px)";
        //restarting
        let size = GetValue(elem.children[1], "background-size");
        elem.children[1].style.backgroundSize = (parseInt(size) + 8) + "px";
        other.timeout = setTimeout(() => {
			elem.children[1].style.backgroundSize = "calc(calc(.2 * var(--W) ) - 5px)";
			Notify("To unlock this level, you must win the previous level.");
		}, 300);
        return;
    } 
    
    if(other.initialLoading && click) {
    	AudioPlayer.initializeAudios();
    	other.initialLoading = false;
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
            if(GetValue(child, "background-image") === other.default) { 
                other.selected = child;
                //other.classList.remove("default");
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
        if(parent.id != "nav" && child === other.selected || child === other.level) {
            child.style.background = other.default;
        } 
        else if(child.tagName.toLowerCase() != "p" && child.tagName.toLowerCase() != "h2") {
            child.style.background = bgColor;
            child.style.color = color;
        } 
        
        if(child.children.length > 0) {
            if(child.children[0].innerHTML === "LOCKED") {
                child.style.background = other.disabled;
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
        await Scroll(other.level, {block: "nearest", inline: "center", behavior: "smooth"}, other.level.parentNode);
    }
    
    } catch (error) {Notify(error + "")} 
} 

const Mute = (mute) => {
    Sound.muted = mute;
    if(storage) {
        storage.setItem("muted", JSON.stringify(mute));
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
        let playerA_name = $("#offline #playerA #playerA-name").value.trim();
        let playerB_name = $("#offline #playerB #playerB-name").value.trim();
        if(playerA_name != "" && playerB_name != "") {
            //player 1 name
            playerA.name = playerA_name.replace(/^\w|\s\w/g, t => t.toUpperCase());
        
            //player 2 name
            playerB.name = playerB_name.replace(/^\w|\s\w/g, t => t.toUpperCase());
            
            Notify("Names submitted successfully!");
        } 
        else {
        	if(playerA_name == "") {
                $("#offline #playerA #playerA-name").focus();
            	Notify("Please fill out player 1 name.");
            } 
            else if(playerB_name == "") {
                $("#offline #playerB #playerB-name").focus();
            	Notify("Please fill out player 2 name.");
            } 
        } 
    } 
} 

const AboutOnline = () => {
    Notify({action: "alert", 
            header: "HOW TO CONNECT ONLINE CHANNEL", 
            message: "To successfully play the online match, you are required to enter the name of the channel you wish to join in the text field provided and submit it. If the channel is full, you will be required to create new one of your own preference. After successful creation, share the channel name with your opponent to invite him/her.<span>Note</span><ul><li>Any full channel contains only two players at any particular time.</li><li>Leaving the channel while the game is still on, will cost you the game.</li><li>You can not join more than one channel at any time.</li><li>If both players leave the channel, it will be closed</li></ul>"});
}

const Restart = async (option) => {
	if(Game.thinking) {
		Notify("Please wait for opponent's move");
		return;
	} 
    if(!Game.over) {
        Notify({action: "confirm", 
                header: "Restart Game!", 
                message: "Do you really want to restart this game?",
                type: "CANCEL/RESTART", 
                onResponse: RestartOption});
        
        async function RestartOption (choice) {
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
                        Game.whiteTurn = (GetValue(btns[0], "background-image") == other.default);
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
        if(Game.mode === "two-player-offline" || Game.mode === "two-player-online" && (Game.whiteTurn && playerA.pieceColor === "White" || !Game.whiteTurn && playerA.pieceColor === "Black") || Game.mode === "single-player" && (Game.level === 0 || Game.levels[Game.level-1].validForHint)) {
        	if(Game.mode === "single-player") {
				Game.validForHint = false;
				let hint_label = $("#play-window .footer_section p label:last-of-type");
                hint_label.style.backgroundImage = "var(--hint)";
                if(!hint_label.classList.contains("not_valid_for_hint"))
                    hint_label.classList.add("not_valid_for_hint");
				UpdatePiecesStatus();
		    }
		    else if(Game.mode === "two-player-online") {
			    Publish.send({channel: Lobby.CHANNEL, message: {title: "Hint"}});
			} 
	        elem.style.backgroundSize = "3.75vmax 3.75vmax";
	        elem.style.backgroundImage = `url('${Icons.loadIcon}')`;
			elem.style.pointerEvents = "none";
			other.hintPath = [];
			await setTimeout( () => getHint(elem, state), 100);
		}
		else if (Game.mode === "single-player") { 
            //resetting size
            clearTimeout(other.timeout);
            elem.style.backgroundSize = "3.75vmax 4.5vmax";
            //restarting
            elem.style.backgroundSize = "4.95vmax 5.7vmax";
            other.timeout = setTimeout(() => {
				elem.style.backgroundSize = "3.75vmax 4.5vmax";
				Notify("Please win the previous level without using the hint and undo buttons");
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
        let moves = await Iterate({id, state, func: AssesCaptures});
        if(moves.length === 0)
            moves = await Iterate({id, state, func: AssesMoves});
        let level = Game.mode != "single-player"? 5: Game.level;
        let ai = new AI({state, moves, depth: (level < 4? 4: level)});
        await ai.makeMove(true);
       
        let cell = other.aiPath[0];
        await ValidateMove({cell: $("#table").rows[cell.i].cells[cell.j], i: cell.i, j: cell.j});
        
        for(cell of other.aiPath) {
            $("#table").rows[cell.m].cells[cell.n].classList.remove("helper_empty");
            $("#table").rows[cell.m].cells[cell.n].classList.add("hint");
        }
        AudioPlayer.play("notification", 0.1);
        other.aiPath = [];
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
                message: "The current game process will be lost!",
                type: "CANCEL/EXIT", 
                onResponse: Option });
        Clicked();
                
        function Option (choice)  {
            if(choice == "EXIT") {
                if(Game.mode === "two-player-online") {
                    Publish.send({channel: Lobby.CHANNEL, message: {title: "ExitedGame", content: playerA.name} });
                } 
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
                header: `<img style="height: 100%; width: 50px; margin-right: 15px;" src=${src}> ${version}`, 
                message});
    } 
    else
    GameOver();
} 


const Helper = async (moves, state, isMultJump = false) => { 
    for(let cell of $$("#table .valid, #table .pre_valid, #table .hint, #table .helper_empty, #table .helper_filled")) {
        cell.classList.remove("hint");
        cell.classList.remove("helper_empty");
        cell.classList.remove("helper_filled");
    } 
    // check if moves is an attack move or not
    if(moves[0].capture === undefined && !isMultJump) {
    	if(!(Game.mode == "single-player" && (Game.whiteTurn && playerB.pieceColor == "White" || !Game.whiteTurn && playerB.pieceColor == "Black")) && Game.helper) 
	        for(let move of moves) {
	            let i = parseInt(move.cell.slice(0,1));
	            let j = parseInt(move.cell.slice(1,2));
	            let m = parseInt(move.empty.slice(0,1));
	            let n = parseInt(move.empty.slice(1,2));
	            $("#table").rows[i].cells[j].classList.add("pre_valid");
	        }
		return;
    }
    
    for(let k = 0; k < moves.length; k++) {
    	let move = moves[k];
        let i = parseInt(move.cell.slice(0,1));
        let j = parseInt(move.cell.slice(1,2));
        let m = parseInt(move.empty.slice(0,1));
        let n = parseInt(move.empty.slice(1,2));
        let crowned = false;
        if(!isMultJump) 
        	other.helperPath.push({i, j, m, n, cell: move.cell, capture: move.capture, empty: move.empty, source: true});
        else
        	other.helperPath.push({i, j, m, n, cell: move.cell, capture: move.capture, empty: move.empty, source: false});
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
            if(!crowned || crowned && (Game.version === "russian" || Game.version === "kenyan" || Game.version == "casino" || Game.version === "international" || Game.version === "nigerian")) {
            	id = crowned && (Game.version === "kenyan" || Game.version === "casino" || Game.version == "casino" || Game.version === "international" || Game.version === "nigerian")? id.replace("K", "M"): id;
            	cloneState[m][n] = id;
            	moves2 = await AssesCaptures({id, i: m, j: n, state: cloneState});
                
				if(moves2.length > 0) {
					await Helper(moves2, cloneState, true);
				} 
				else if(crowned)
					id = id.replace("M", "K"); 
            } 
            
            cloneState[m][n] = id;
    	} 
    }
    
    if(isMultJump) {
        return Prms(true);
    }
   
    if((Game.helper || Game.capturesHelper) && Game.mandatoryCapture && (Game.mode == "two-player-offline" || (Game.mode == "single-player" || Game.mode == "two-player-online") && Game.whiteTurn && playerA.pieceColor === "White" || !Game.whiteTurn && playerA.pieceColor === "Black")) {
	    let i = other.helperPath[0].i,
	        j = other.helperPath[0].j, 
	        isSingleCell = true;
	        
	    for(let cell of other.helperPath) {
	        if(cell.source && (cell.i !== i || cell.j !== j)) {
	            isSingleCell = false;
	            break;
	        }
	    } 
	    
	    if(isSingleCell) {
			if(Game.mode != "two-player-online")
	        	await ValidateMove({cell: $("#table").rows[i].cells[j], i, j});
			else
				$("#table").rows[i].cells[j].classList.add("helper_filled");
	        return;
	    } 
	    else if(Game.helper || Game.capturesHelper) {
	        for(let cell of other.helperPath) {
	            if(cell.source)
	            $("#table").rows[cell.i].cells[cell.j].classList.add("helper_filled");
	        } 
	        return;
	    }
	} 
} 

const PlayAs = (elem) => { 
    if(elem.parentNode.id == "playerA") {
        if(elem.innerHTML != "ALTERNATE") {
            let num = elem.classList.length - 1;
            Disable($(`#playerB .${elem.classList[num]}`), other.disabled, "#B4B4B4");
            Enable($(`#playerB button:not(.${elem.classList[num]})`), other.default, "#fff");
            let btns = $$("#item4 button");
            for(let btn of btns) {
            	if(btn.innerHTML === elem.innerHTML) {
            	    Clicked(btn, btn.parentNode);
                    break;
            	} 
            }
        }
        else {
            Game.alternatePlayAs = true;
            let btns = $$("#item4 button")[2];
            Clicked(btns, btns.parentNode, false);
           
            btns = $$("#playerB button");
            for(let btn of btns) {
               if(GetValue(btn, "background-image") === other.default) {
                   Disable(btn, other.disabled, "#B4B4B4");
                   break;
               } 
            } 
        } 
    } 
    if(elem.innerHTML != "ALTERNATE") {
        Game.alternatePlayAs = false;
        let playAsWhite = (elem.innerHTML == "WHITE");
        playerA.pieceColor = (playAsWhite)? "White": "Black";
        playerB.pieceColor = (playAsWhite)? "Black": "White";
        
        if(elem.parentNode.id !== "playerA") {
            let btns = $$("#playerA button");
            for(let btn of btns) {
            	if(btn.innerHTML === elem.innerHTML) {
            	    Clicked(btn, btn.parentNode, false);
                    let num = btn.classList.length - 1;
                    Disable($(`#playerB .${btn.classList[num]}`), other.disabled, "#B4B4B4");
                    Enable($(`#playerB button:not(.${btn.classList[num]})`), other.default, "#fff");
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
           if(GetValue(btn, "background-image") === other.default) {
               Disable(btn, other.disabled, "#B4B4B4");
               break;
           } 
        } 
    }
    if(storage)
        storage.setItem("play_as", JSON.stringify({playerA: playerA.pieceColor, playerB: playerB.pieceColor, alternate: Game.alternatePlayAs}));
} 

const Contact = () => {
    window.location.href = "mailto:marxeto8@gmail.com? &subject=Checkers%20Support%20Feedback";
} 

const Attribute = () => {
    Notify({action: "alert", 
            header: "ATTRIBUTES", 
            message: "<span>Audio</span><ul><li>Special thanks goes to zapslat.com for powering audio in this game. Checkout the link below for more info.<br/><a href='https://www.zapsplat.com/sound-effect-categories/'>www.zapslat.com</a></li></ul><span>Online Gaming</span><ul><li>This one goes to PubNub for enabling instant communication between internet connected devices.</li></ul>"});
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
			Cancel();
			$("#games").innerHTML = "";
		    Game.stats = [];
		    Notify("Games cleared successfully");
		    if(storage) {
			    storage.removeItem("stats");
		    } 
		} 
    } 
} 

const GetStats = (no) => { try {
    let props = $$(".figures");
    let stats = Game.stats[no];
    props[0].innerHTML = stats.pieceColor[0];
    props[1].innerHTML = stats.pieceColor[1];
    props[2].innerHTML = stats.gameStatus[0];
    props[3].innerHTML = stats.gameStatus[1];
    props[4].innerHTML = stats.piecesRemaining[0];
    props[5].innerHTML = stats.piecesRemaining[1];
    props[6].innerHTML = stats.kingsMade[0];
    props[7].innerHTML = stats.kingsMade[1];
    props[8].innerHTML = stats.movesMade[0];
    props[9].innerHTML = stats.movesMade[1];
    props[10].innerHTML = stats.capturesMade[0];
    props[11].innerHTML = stats.capturesMade[1];
    props[12].innerHTML = stats.longestCapture[0];
    props[13].innerHTML = stats.longestCapture[1];
    Clicked();
    
    BackState.state.push(["#games-window", "#stats-window"]);
    $("#games-window").style.display = "none";
    $("#stats-window").style.display = "grid";
    } catch (error) {alert(error + "\n" + no + "\nGet starts error")}
} 

const Mode = async (type, click = true) => {
    if(type == 2) {
        Game.mode = "two-player-offline";
        playerA.name = $("#playerA-name").value;
        playerB.name = $("#playerB-name").value;
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
        if(GetValue(mode, "background-image") === other.default) { 
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
        other.Handler0 = null;
        other.Handler1 = null;
        other.Handler2 = null;
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
        note_main.style.gridTemplateRows = "15px auto auto auto";
        note_main.style.gridTemplateColumns = "75px auto";
        note_main.style.gridRowGap = "5px";
        note_main.style.padding = "10px";
        note_image.style.padding = "10px";
        note_image.style.gridArea = "1 / 1 / 3 / 2";
        note_head.style.textAlign = "left";
        note_head.style.fontWeight = "700";
        note_head.style.alignItems = "center";
        note_head.style.gridArea = "2 / 2 / 3 / 3";
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
            note_image.style.height = "60px";
            note_image.style.width = "60px";
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
            note_image.style.gridArea = "1 / 1 / 2 / 2";
           
            note_close_button.style.display = "none";
            note_head.style.textAlign = "center";
            note_head.style.fontWeight = "400";
            note_head.style.alignItems = "center";
            note_head.style.gridArea = "1 / 2 / 2 / 3";
            note_body.style.display = "none";
            note_image.src = data.icon;
            note_image.style.height = "60px";
            note_image.style.width = data.iconType == "dice"? "60px": "100px";
            note_buttons[0].style.display = "none";
            note_buttons[1].style.display = "none";
            note_buttons[2].style.display = "none";
            let delay = data.delay || 1000;
            setTimeout(Cancel, delay);
        } 
        else if(data.action === "alert_special") {
            note_image.src = Icons.loadIcon;
            note_image.style.height = "60px";
            note_image.style.width = "60px";
            note_buttons[0].style.display = "none";
            note_buttons[1].style.display = "none";
            note_buttons[2].style.display = "none";
            note_close_button.style.pointerEvents = "none";
        } 
        else if(data.action == "confirm") {
            note_image.style.height = "60px";
            note_image.style.width = "60px";
            if(data.icon === undefined) 
                note_image.src = Icons.confirmIcon;
            else {
                if(data.iconType == "winner")
                note_image.style.height = "80px";
                else if(data.iconType == "draw")
                note_image.style.width = "80px";
                note_image.src = data.icon;
            } 
            
            note_buttons[0].style.display = "none";
            note_buttons[1].style.display = "inline-block";
            note_buttons[2].style.display = "inline-block";
            note_buttons[1].innerHTML = data.type.split("/")[0];
            note_buttons[2].innerHTML = data.type.split("/")[1];
            const Handler1 = `Confirm("${note_buttons[1].innerHTML}", ${data.onResponse})`;
            const Handler2 = `Confirm("${note_buttons[2].innerHTML}", ${data.onResponse})`;
            note_buttons[1].setAttribute("onclick", Handler1);
            note_buttons[2].setAttribute("onclick", Handler2);
            note_close_button.setAttribute("onclick", Handler1);
            
            note_close_button.style.pointerEvents = "auto";
        }
        else if(data.action == "other") {
            note_image.src = data.icon;
            if(data.iconType == "winner") {
                note_image.style.width = "60px";
                note_image.style.height = "80px";
            } 
            else if(data.iconType == "draw") {
                note_image.style.width = "80px";
                note_image.style.height = "60px";
            } 
            
            note_buttons[0].style.display = "inline-block";
            note_buttons[1].style.display = "inline-block";
            note_buttons[2].style.display = "inline-block";
            note_buttons[0].innerHTML = data.type.split("/")[0];
            note_buttons[1].innerHTML = data.type.split("/")[1];
            note_buttons[2].innerHTML = data.type.split("/")[2];
            const Handler0 = `Confirm("${note_buttons[0].innerHTML}", ${data.onResponse})`;
            const Handler1 = `Confirm("${note_buttons[1].innerHTML}", ${data.onResponse})`;
            const Handler2 = `Confirm("${note_buttons[2].innerHTML}", ${data.onResponse})`;
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
        levels.forEach((level, index) => {
            if(level.children[0].innerHTML !== "LOCKED") {
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
        let version = elem.children[1].innerHTML.toLowerCase().split(/<br>/g)[0];
        Game.version = version;
        $(".header_div:last-of-type h2").innerHTML = Game.version.toUpperCase() + " CHECKERS";
        await Clicked(elem, elem.parentNode, click);
        
        
        if(storage) {
            storage.setItem("versions", JSON.stringify(Game.versions));
            storage.setItem("version", version);
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
                await Clicked(levels[Game.versions[Game.version].length-1], levels[Game.versions[Game.version].length-1].parentNode, false);
            }
            else {
                other.level = levels[Game.versions[Game.version].length-1];
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
            level.children[0].innerHTML = "LOCKED";
            level.children[1].style.filter = "grayscale(0) invert(0) brightness(1)";
            level.style.backgroundImage = other.disabled;
            level.children[1].style.backgroundImage = `url(${srcs[srcs.length-2]})`;

            for(let label of level.children[1].children) {
                label.classList.remove("achieved", "not_achieved");
            } 
        }
       
        if(Game.mode !== "single-player") {
            await Disable(level.parentNode, other.disabled, "#B4B4B4");
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
        Game.level;
    } 
}

const RestartLevels = async () => { try {
	await Notify({action: "alert_special", 
			header: "Please Wait!", 
			message: "Resetting levels..."});
	
	Object.keys(Game.versions).map((key) => {
		Game.versions[key] = [{score: 3, validForHint: true}];
	});
	if(storage) {
        storage.setItem("versions", JSON.stringify(Game.versions));
        storage.setItem("version", Game.version);
    }
    let version = Game.version;
    for(let h2 of $$(".version h2")) {
        if(h2.innerHTML.includes(version.toUpperCase())) {
            version = h2.parentNode;
            break;
        } 
    }
    await Version(version, undefined, false);
    Cancel();
    } catch(error) {alert("Restart Error!\n" + error.message)}
} 

const Level = async (elem, index, click = true) => {
    if(typeof elem === "object") {
        await Clicked(elem, elem.parentNode, click);
        if(!elem.innerHTML.includes("LOCKED")) {
            try {
                let level = index;
                storage.setItem("currentLevel", (level).toString());
            } catch (error) {} 
            Game.level = index;
        }
    } 
    else if(elem) { try {
        let level = $$("#levels #nav div")[Game.level+1];
        await Clicked(level, level.parentNode, false);
        $("#play-window .header_section h3").innerHTML = `${$("#levels h2").innerHTML}`;
        $(".face_bottom #level").innerHTML = `${$("#levels h2").innerHTML}`;
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
        if(level.children[0].innerHTML === "LOCKED") {
            level.style.backgroundImage = other.background;
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
            if(level.children[0].innerHTML !== "LOCKED") {
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
        storage.setItem("versions", JSON.stringify(Game.versions));
        storage.setItem("version", Game.version);
    }
    return Prms("done");
} 

const End = (event) => {
    if(event.animationName === "pop-out") {
        let popUpNote = $("#pop-up-note");
        popUpNote.style.display = "none";
    } 
    else if(event.animationName === "fade-out") { try {
            event.target.removeAttribute("onanimationend");
            event.target.classList.remove("captured");
            event.target.parentNode.removeChild(event.target);
        } catch (error) {}
    }
    else if(event.animationName === "fade-note") {
        event.target.removeAttribute("onanimationend");
        event.target.style.display = "none";
        event.target.classList.remove("fade_note");
    } 
} 

const AdjustScreen = (orientation, exitFullscreen = false) => { try {
    let vh = document.documentElement.clientHeight || window.innerHeight || window.screen.availHeight;
    let h = window.screen.height;
   
    if(!exitFullscreen) {
	    if(orientation.includes("portrait")) {
	        if(other.notch.has && h == vh)
	            document.documentElement.style.setProperty("--border-top",  `${other.notch.top}px` );
	    } 
	    else if(orientation.includes("landscape")) {
	        document.documentElement.style.setProperty("--border-top", "0");
	    } 
    }
    else {
    	document.documentElement.style.setProperty("--border-top", "0");
    } 
    } catch (error) {alert (error)}
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
            $(current_state[0]).style.display = "grid"; } catch (error) {document.write(error)}
        } 
        await Home();
    }
    
    return true;
}

async function play (isAutoRotate = false, accepted = false) {
    if(isAutoRotate && other.fullscreen) {
        AdjustScreen(screen.orientation.type.toLowerCase());
    } 
    if(Lobby != undefined && Lobby.isConnected && Game.mode === "two-player-online" || Game.mode === "single-player") {
        if(GetValue($("#play-window"), "display") == "none" && !isAutoRotate || accepted) {
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
                        Game.whiteTurn = (GetValue(btns[0], "background-image") == other.default);
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
                $("#play-window .footer_section p").style.display = "none";
                await setTimeout(async () => await Refresh(true), 200);
            } 
            
            if(Game.mode !== "two-player-online") {
                $("#play-window .footer_section p").style.display = "flex";
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
            let board = $(".board");
            let root = document.documentElement;
            root.style.setProperty("--angleZ", "0deg");
            root.style.setProperty("--angleZ" + playerB.pieceColor.slice(0,1), "0deg");
            
            if(Game.mode === "single-player") {
                $("#play-window .header_section h3").innerHTML = `${$("#levels h2").innerHTML}`;
                $(".face_bottom #level").innerHTML = `${$("#levels h2").innerHTML}`;
                for(let level of Game.levels) {
                    if(level.level === $("#levels h2").innerHTML) {
                        Game.level = Game.levels.indexOf(level);
                    } 
                } 
            } 
            else {
                $("#play-window .header_section h3").innerHTML = `${playerA.name} VS ${playerB.name}`;
                $(".face_bottom #level").innerHTML = `${playerA.name} VS ${playerB.name}`;
            } 
            
            if(screen.orientation.type.toLowerCase().includes("landscape")) {
                let vh = document.documentElement.clientHeight || window.innerHeight || window.screen.availHeight;
                let vw = document.documentElement.clientWidth || window.innerWidth || window.screen.availWidth;
                let height = Math.max(vh, vw);
                let width = Math.min(vh, vw);
                let ratio = Math.round(width/height);
                let top = -5;
                let bg_top = -15.5; 
                top += ((ratio > 0)? (ratio - 2.5): 0);
                bg_top += ((ratio > 0)? (ratio - 3): 0);
               
                Game.top = top;
                root.style.setProperty("--top", `${top}vh`);
                $(".perspective_background").style.top = `${bg_top}vh`;
                
                let shadowWidth = (width * 2.5)/276;
                root.style.setProperty("--angleX", "33deg"); 
                root.style.setProperty("--length", "112vmin");
                root.style.setProperty("--shadow-width", `${shadowWidth}px`);
                root.style.setProperty("--piece_size", "80%");
                
            } 
            else if(screen.orientation.type.toLowerCase().includes("portrait")) {
                //Game.top = 0;
                root.style.setProperty("--top", `0vmin`);
                
                root.style.setProperty("--angleX", "0deg"); 
                root.style.setProperty("--length", "calc(100vmin - 10px)");
                root.style.setProperty("--shadow-width", "0px");
                root.style.setProperty("--piece_size", "85%");
            } 
        }
    } 
    else if(Game.mode === "two-player-offline" && playerA.name != "You" && playerA.name !== "" && playerB.name != "AI" && playerB.name !== "") { try {
        let board = $(".board");
        let root = document.documentElement;
        $("#play-window .header_section h3").innerHTML = `${playerA.name} VS ${playerB.name}`;
        root.style.setProperty("--top", `0vh`);
        root.style.setProperty("--angleX", "0deg"); 
        root.style.setProperty("--length", "calc(100vmin - 10px)");
        root.style.setProperty("--shadow-width", "0px");
        root.style.setProperty("--piece_size", "85%");
        
        if(screen.orientation.type.toLowerCase().includes("landscape")) {
            root.style.setProperty("--angleZ", "0deg");
            root.style.setProperty("--angleZ" + playerB.pieceColor.slice(0,1), "180deg");
        } 
        else if(screen.orientation.type.toLowerCase().includes("portrait")) {
            root.style.setProperty("--angleZ", "90deg");
            root.style.setProperty("--angleZ" + playerB.pieceColor.slice(0,1), "180deg");
        } 
        
        if(!isAutoRotate) {
            $("#play-window .footer_section p").style.display = "none";
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
        } catch (error) {document.write (error);} 
    } 
    else if(!isAutoRotate) {
        if(Game.mode === 'two-player-online')
            Notify("Can't play, you have no opponent. Please wait or invite one or join another channel.");
        else if(Game.mode === 'two-player-offline')
            Notify("Can't play, you haven't filled out players details. Fill them out and try again.");
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
        		AdjustScreen(screen.orientation.type.toLowerCase());
			    other.fullscreen = value;
			    
			    let res = await orientationLocking(document.documentElement, other.orientation);
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
			    other.fullscreen = value;
			    $("#item1").style.display = "none";
        		await exitFullscreen.call(document);
        		AdjustScreen("", true);
        		Clicked($("#fs-off"), $("#fs-off").parentNode);
        	}
	    } 
	    else if(isEvent && !isFullScreen()) {
		    $("#item1").style.display = "none";
		    let btns = $$("#item0 button");
		    btns[0].style.background = other.background;
		    btns[1].style.background = other.default;
		    other.fullscreen = false;
		} 

	} catch (error) {
		if(!other.fullscreen)
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
            let viewBtns = $$("#item1 button");
            if(screen.orientation.type.toLowerCase().includes("portrait")) {
                viewBtns[1].style.background = other.default;
                viewBtns[0].style.background = other.background;
                other.orientation = "portrait";
            } 
            else if(screen.orientation.type.toLowerCase().includes("landscape")) {
                viewBtns[0].style.background = other.default;
                viewBtns[1].style.background = other.background;
                other.orientation = "landscape";
            }
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
			if(other.fullscreen && GetValue($("#item1"), "display") == "grid") {
	        	btns = $$("#item1 button");
		        for(let btn of btns) {
		            if(GetValue(btn, "background-image") == other.default) { 
		                if(btn.innerHTML == "HORIZ." && screen.orientation.type.toLowerCase().includes("portrait")) {
		                    orientationLocking(document.documentElement, "landscape-primary"); 
		                    other.orientation = "landscape-primary";
		                } 
		                else if(btn.innerHTML == "VERT." && screen.orientation.type.toLowerCase().includes("landscape")) {
		                    orientationLocking(document.documentElement, "portrait-primary");
		                    other.orientation = "portrait-primary";
		                } 
						AdjustScreen(other.orientation);
		            } 
		        }
			} 
	        
	        btns = $$("#item3 button");
	        for(let btn of btns) {
	            if(GetValue(btn, "background-image") == other.default) { 
	                if(btn.innerHTML != "ROLL DICE") {
	                    Game.whiteTurn = btn.innerHTML == "WHITE";
	                    Game.rollDice = false;
	                } 
	                else
	                    Game.rollDice = true;
	                    
	                break;
	            } 
	        }
	        if(storage)
	            storage.setItem("first_move", JSON.stringify({rollDice: Game.rollDice, whiteTurn: Game.whiteTurn}));
	        
	        btns = $$("#item5 button");
	        for(let btn of btns) {
	            if(GetValue(btn, "background-image") == other.default) { 
	                Game.mandatoryCapture = btn.innerHTML === "ON";
	                break;
	            } 
	        }
	        if(storage) 
	            storage.setItem("mandatory_capture", JSON.stringify(Game.mandatoryCapture));
	        
	        btns = $$("#item6 button");
	        for(let btn of btns) {
	            if(GetValue(btn, "background-image") === other.default) {
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
	            storage.setItem("helper", JSON.stringify({helper: Game.helper, capturesHelper: Game.capturesHelper}));
		} 
        
        let length = BackState.state.length;
        if(length > 0) { try {
            let current_state = BackState.state[length-1];
            await BackState.state.pop();
            
            if(current_state.length > 2) {
                await Clicked(current_state[2], current_state[2].parentNode);
            }
            else
            	await Clicked();
            $(current_state[1]).style.display = "none";
            $(current_state[0]).style.display = "grid"; } catch (error) {document.write(error)}
        } 
    } 
    else if(!Game.over) { 
        let moving = $$("#transmitter .outer");
        if(moving.length == 0) {
            let length = BackState.moves.length;
            if(isComp || length > 0 && Game.mode === "two-player-offline" || ((Game.mode == "two-player-online" || Game.mode === "single-player") && length > 1 && (Game.whiteTurn && playerA.pieceColor === "White" || !Game.whiteTurn && playerA.pieceColor === "Black") )) {
            	let move = BackState.moves[length-1];
                await BackState.moves.pop();
                Undo.move(move);
               
                for(let move of BackState.moves) {
                    if(move.length === 3) { try {
                        let piece = move[1].piece || move[0].cell.firstChild;
                        if(piece.className.includes(playerA.pieceColor.toLowerCase()))
                            playerA.longestCapture = Math.max(move[2].length, playerA.longestCapture);
                        else
                            playerB.longestCapture = Math.max(move[2].length, playerB.longestCapture);
						} catch (error) {console.log(move[1].piece)}
                    } 
                } 
               
                for(let cell of $$("#table .valid, #table .pre_valid, #table .hint, .helper_empty, .helper_filled")) {
	                cell.classList.remove("valid");
	                cell.classList.remove("pre_valid");
	                cell.classList.remove("hint");
	                cell.classList.remove("helper_empty");
	                cell.classList.remove("helper_filled");
	            }
				
                Game.whiteTurn = !Game.whiteTurn;
                
                if(!isComp && (Game.mode === "single-player" || Game.mode == "two-player-online") && (Game.whiteTurn && playerB.pieceColor === "White" || !Game.whiteTurn && playerB.pieceColor === "Black")) {
                	if(Game.mode == "two-player-online") {
                		Publish.send({channel: Lobby.CHANNEL, message: {title: "Undone", content: {} } });
                		Publish.send({channel: Lobby.CHANNEL, message: {title: "Undone", content: {} } });
                	}
                	else {
	                	Game.validForHint = false;
	                    let hint_label = $("#play-window .footer_section p label:last-of-type");
	                    hint_label.style.backgroundImage = "var(--undo)";
	                    if(!hint_label.classList.contains("not_valid_for_hint"))
	                        hint_label.classList.add("not_valid_for_hint");
					} 
                     
                    await back(true, true);
                    return;
                }

                // To avoid clushing due to multiple click events will use setTimeout function. 
                clearTimeout(other.timeout);
                other.timeout = setTimeout(async _ => {
                	other.helperPath = [];
	                let id = Game.whiteTurn && playerA.pieceColor === "White" || !Game.whiteTurn && playerA.pieceColor === "Black"? playerA.pieceColor.charAt(0): playerB.pieceColor.charAt(0);
	                Game.possibleCaptures = await Iterate({id, state: Game.state, func: AssesCaptures});
	                Game.possibleMoves = await Iterate({id, state: Game.state, func: AssesMoves});
	                if(Game.possibleCaptures.length) {
	                	if(!Game.mandatoryCapture) {
	                		await Helper(Game.possibleMoves.concat(Game.possibleCaptures), Copy(Game.state));
	                		await Helper(Game.possibleCaptures, Copy(Game.state));
	                	}
	                	else
	                		await Helper(Game.possibleCaptures, Copy(Game.state));
	                }
	                else if(Game.mode == "two-player-offline" || (Game.mode === "single-player" || Game.mode === "two-player-online") && Game.whiteTurn && playerA.pieceColor === "White" || !Game.whiteTurn && playerA.pieceColor === "Black") {
	                	await Helper(Game.possibleMoves, Copy(Game.state));
	                }
                    await UpdatePiecesStatus();
				}, 100);
            } 
            else if((Game.mode == "single-player" || Game.mode == "two-player-online") && length <= 1 && (Game.whiteTurn && playerA.pieceColor == "White" || !Game.whiteTurn && playerA.pieceColor == "Black") || length == 0) {
                Notify("No moves made yet");
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
			let i = move[1].i;
			let j = move[1].j;
			let m = move[0].i;
			let n = move[0].j;
			let piece = move[1].piece;
			let id = Game.state[i][j];
			await piece.classList.remove("captured");
			if(move[1].king) {
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
            
			try{table.rows[i].cells[j].removeChild(piece);} catch(error) {};
			table.rows[m].cells[n].appendChild(piece);
			Game.state[i][j] = "EC";
			Game.state[m][n] = id;
			
			if(move.length === 3) {
                for(let caps of move[2]) {
                	await caps[0].classList.remove("captured");
                    i = caps[1];
                    j = caps[2];
                    $("#table").rows[i].cells[j].appendChild(caps[0]);
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


