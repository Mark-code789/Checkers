'use strict';const _0x11d862=_0x17cd;(function(_0x1ebaec,_0x497e0d){const _0x41f24a=_0x17cd,_0x232d5d=_0x1ebaec();while(!![]){try{const _0x3f3ca6=-parseInt(_0x41f24a(0x165))/0x1*(-parseInt(_0x41f24a(0x17b))/0x2)+-parseInt(_0x41f24a(0x17c))/0x3+parseInt(_0x41f24a(0x186))/0x4*(parseInt(_0x41f24a(0x16d))/0x5)+-parseInt(_0x41f24a(0x16e))/0x6+-parseInt(_0x41f24a(0x181))/0x7+parseInt(_0x41f24a(0x170))/0x8*(parseInt(_0x41f24a(0x190))/0x9)+-parseInt(_0x41f24a(0x187))/0xa*(parseInt(_0x41f24a(0x167))/0xb);if(_0x3f3ca6===_0x497e0d)break;else _0x232d5d['push'](_0x232d5d['shift']());}catch(_0x3b543c){_0x232d5d['push'](_0x232d5d['shift']());}}}(_0x802d,0xe9441));const appVersion=_0x11d862(0x17a),versionDescription=_0x11d862(0x168),Game={'mode':_0x11d862(0x18f),'version':'american','versions':{'american':[{'score':0x3,'validForHint':!![]}],'kenyan':[{'score':0x3,'validForHint':!![]}],'casino':[{'score':0x3,'validForHint':!![]}],'international':[{'score':0x3,'validForHint':!![]}],'pool':[{'score':0x3,'validForHint':!![]}],'russian':[{'score':0x3,'validForHint':!![]}],'nigerian':[{'score':0x3,'validForHint':!![]}]},'boardSize':0x8,'rowNo':0x3,'level':0x0,'baseStateCount':0x1,'drawStateCount':0x0,'hintCount':0x0,'undoCount':0x0,'path':{'index':0x0},'possibleWin':![],'isComputer':![],'pieceSelected':![],'thinking':![],'alternatePlayAs':![],'whiteTurn':![],'mandatoryCapture':!![],'helper':!![],'capturesHelper':![],'over':![],'validForHint':!![],'prop':null,'levels':[{'level':'BEGINNER\x20LEVEL','validForHint':!![],'score':0x0},{'level':_0x11d862(0x173),'validForHint':!![],'score':0x0},{'level':_0x11d862(0x16f),'validForHint':!![],'score':0x0},{'level':_0x11d862(0x18b),'validForHint':!![],'score':0x0},{'level':'ADVANCED\x20LEVEL','validForHint':!![],'score':0x0},{'level':_0x11d862(0x172),'validForHint':!![],'score':0x0},{'level':_0x11d862(0x18d),'validForHint':!![],'score':0x0},{'level':'MASTER\x20LEVEL','validForHint':!![],'score':0x0},{'level':_0x11d862(0x17e),'validForHint':!![],'score':0x0}],'state':[],'baseState':[],'moves':{},'track':[],'stats':[]},Player=function(){const _0x4a119d=_0x11d862;this[_0x4a119d(0x169)]='',this['pieces']=Game['boardSize']/0x2*Game[_0x4a119d(0x17d)],this['pieceColor']='',this[_0x4a119d(0x17f)]=0x0,this[_0x4a119d(0x16b)]=0x0,this[_0x4a119d(0x174)]=0x0,this[_0x4a119d(0x18c)]=0x0;},playerA=new Player(),playerB=new Player();function _0x17cd(_0x2e39b2,_0x4bc754){const _0x802d13=_0x802d();return _0x17cd=function(_0x17cdaa,_0x1d550f){_0x17cdaa=_0x17cdaa-0x164;let _0x567fd3=_0x802d13[_0x17cdaa];return _0x567fd3;},_0x17cd(_0x2e39b2,_0x4bc754);}playerA[_0x11d862(0x18e)]=_0x11d862(0x166),playerA[_0x11d862(0x169)]=_0x11d862(0x182),playerB[_0x11d862(0x18e)]='Black',playerB[_0x11d862(0x169)]='AI';const general={'orientation':_0x11d862(0x18a),'initialLoading':!![],'fullscreenSupport':![],'fullscreen':![],'default':'linear-gradient(rgba(0,\x20152,\x2025,\x200.9),\x20rgba(0,\x20112,\x200,\x200.9))','disabled':_0x11d862(0x16a),'background':'linear-gradient(rgba(40,\x2040,\x2040,\x200.9),\x20rgba(0,\x200,\x200,\x200.9))','selected':'','level':'','sorted':[],'helperPath':[],'aiPath':[]};class ZobristHash{static [_0x11d862(0x164)]=[];static [_0x11d862(0x16c)]=_0xe40fce=>{const _0x11e1a0=_0x11d862;return window[_0x11e1a0(0x176)][_0x11e1a0(0x171)](new BigUint64Array(_0xe40fce));};static [_0x11d862(0x179)]=_0x5f035f=>{let _0x507896=-0x1;switch(_0x5f035f){case'MB':_0x507896=0x0;break;case'KB':_0x507896=0x1;break;case'MW':_0x507896=0x2;break;case'KW':_0x507896=0x3;break;case'EC':_0x507896=0x4;break;case'IP':_0x507896=0x5;break;}return _0x507896;};static [_0x11d862(0x183)]=()=>{const _0x506d93=_0x11d862;this[_0x506d93(0x164)]=[];for(let _0x5bd819=0x0;_0x5bd819<0xa;_0x5bd819++){this[_0x506d93(0x164)][_0x506d93(0x189)]([]);for(let _0x4ee0af=0x0;_0x4ee0af<0xa;_0x4ee0af++){this[_0x506d93(0x164)][_0x5bd819][_0x506d93(0x189)]([]),this['table'][_0x5bd819][_0x4ee0af]=this[_0x506d93(0x16c)](0x6);}}};static [_0x11d862(0x175)]=_0x4dde4f=>{const _0x1ac55b=_0x11d862;let _0x3d6a86=0x0n;for(let _0x4ab108=0x0;_0x4ab108<Game[_0x1ac55b(0x185)];_0x4ab108++){for(let _0x484f0e=0x0;_0x484f0e<Game[_0x1ac55b(0x185)];_0x484f0e++){let _0x2eac17=_0x4dde4f[_0x4ab108][_0x484f0e],_0x56d57d=this['index'](_0x2eac17);Boolean(~_0x56d57d)&&(_0x3d6a86^=this['table'][_0x4ab108][_0x484f0e][_0x56d57d]);}}return _0x3d6a86;};}class TranspositionTable{static ['size']=0x2*(Game[_0x11d862(0x185)]/0x2*Game[_0x11d862(0x185)]*0x2);static [_0x11d862(0x164)]={};static [_0x11d862(0x177)]=(_0x103abb,_0x5ec6ba=![])=>{const _0xf7a30f=_0x11d862;let _0x587253=this[_0xf7a30f(0x164)][Game[_0xf7a30f(0x180)]],_0x3e8c62=_0x103abb[_0xf7a30f(0x178)],_0x32fdfb=Number(_0x3e8c62%BigInt(this[_0xf7a30f(0x188)]));_0x587253[_0x32fdfb]=_0x103abb;};static [_0x11d862(0x184)]=_0x4d2bde=>{const _0x20a495=_0x11d862;let _0x4a922e=this[_0x20a495(0x164)][Game[_0x20a495(0x180)]];!_0x4a922e&&(this[_0x20a495(0x164)][Game[_0x20a495(0x180)]]=new Array(this['size']),_0x4a922e=this[_0x20a495(0x164)][Game[_0x20a495(0x180)]]);let _0x1cf21c=ZobristHash[_0x20a495(0x175)](_0x4d2bde),_0x1109b3=Number(_0x1cf21c%BigInt(this[_0x20a495(0x188)])),_0x2e423f=_0x4a922e[_0x1109b3];if(_0x2e423f&&_0x2e423f['key']==_0x1cf21c)return _0x2e423f;return{'key':_0x1cf21c};};}function _0x802d(){const _0x3e123d=['size','push','natural','HARD\x20LEVEL','longestCapture','CANDIDATE\x20MASTER','pieceColor','single-player','214857DZytez','table','1ZVZTUh','White','22ZpgFLt','<ul><li>Added\x20voice\x20notes\x20in\x20the\x20chat\x20engine.</li><li>Added\x20delete\x20and\x20copy\x20option\x20for\x20chat\x20engine.</li><li>Improved\x20internal\x20operations.</li><li>Improved\x20the\x20AI\x20thinking\x20time.</li><li>Fixed\x20channel\x20subscription\x20error.</li><li>Fixed\x20more\x20other\x20errors.</li><li>Discover\x20by\x20yourself</li></ul>','name','linear-gradient(rgba(110,\x20110,\x20110,\x200.9),\x20rgba(70,\x2070,\x2070,\x200.9))','moves','generateRandom','100pcNBbJ','2528598fAcKxk','MEDIUM\x20LEVEL','568TJTJGZ','getRandomValues','EXPERT\x20LEVEL','EASY\x20LEVEL','captures','computeKey','crypto','store','key','index','22.15.200.529','2874358cJVdKu','1048896PAkBCF','rowNo','GRAND\x20MASTER','kings','version','209426UbjhyV','You','initTable','lookUp','boardSize','199964CXnWpQ','11877710OtYiFf'];_0x802d=function(){return _0x3e123d;};return _0x802d();}