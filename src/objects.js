'use strict';const _0x4bb3d3=_0x3ba8;(function(_0x319ba8,_0x35300a){const _0x3be46c=_0x3ba8,_0x2adbfc=_0x319ba8();while(!![]){try{const _0x396f4f=parseInt(_0x3be46c(0xe5))/0x1*(-parseInt(_0x3be46c(0xcd))/0x2)+parseInt(_0x3be46c(0xfe))/0x3+-parseInt(_0x3be46c(0xdc))/0x4*(-parseInt(_0x3be46c(0x104))/0x5)+parseInt(_0x3be46c(0xca))/0x6*(parseInt(_0x3be46c(0x10b))/0x7)+-parseInt(_0x3be46c(0xec))/0x8*(parseInt(_0x3be46c(0xc8))/0x9)+parseInt(_0x3be46c(0xf6))/0xa*(parseInt(_0x3be46c(0xe9))/0xb)+-parseInt(_0x3be46c(0xcb))/0xc;if(_0x396f4f===_0x35300a)break;else _0x2adbfc['push'](_0x2adbfc['shift']());}catch(_0xc9af44){_0x2adbfc['push'](_0x2adbfc['shift']());}}}(_0x3857,0xcfba0));class Updates{static ['version']=_0x4bb3d3(0x10f);static [_0x4bb3d3(0x108)]=new Map([[_0x4bb3d3(0x107),[_0x4bb3d3(0x10d),_0x4bb3d3(0x105),_0x4bb3d3(0xe3),'Improved\x20the\x20AI\x20thinking\x20time.','Fixed\x20channel\x20subscription\x20error.',_0x4bb3d3(0x10a)]],[_0x4bb3d3(0xd8),[_0x4bb3d3(0xf1),_0x4bb3d3(0xe1),_0x4bb3d3(0xee),_0x4bb3d3(0xd3)]],[_0x4bb3d3(0xda),[_0x4bb3d3(0xd9)]],[_0x4bb3d3(0x109),['Fixed\x20minor\x20bags.']],[_0x4bb3d3(0x102),[_0x4bb3d3(0x10c),_0x4bb3d3(0xd9)]],[_0x4bb3d3(0x10f),[_0x4bb3d3(0x101),_0x4bb3d3(0x100)]]]);static [_0x4bb3d3(0xf4)]=_0x36f51b=>{const _0x839112=_0x4bb3d3;let _0x522c64=_0x839112(0x110);if(!_0x36f51b)for(let [_0x3d1cb0,_0x366d84]of this['updatesLog']['entries']()){_0x3d1cb0>=currentAppVersion&&(_0x522c64+=_0x839112(0xea)+_0x3d1cb0+_0x839112(0xf3)+_0x366d84[_0x839112(0xd2)](_0x5beb2b=>_0x839112(0xce)+_0x5beb2b+_0x839112(0xd5))['join']('')+'</ul>');}else{let _0x306e6c=this[_0x839112(0x108)][_0x839112(0xe2)](_0x36f51b);_0x306e6c=!_0x306e6c?this['updatesLog'][_0x839112(0xe2)](Array[_0x839112(0x106)](this[_0x839112(0x108)][_0x839112(0xfa)]())[0x0]):_0x306e6c,_0x522c64+=_0x306e6c[_0x839112(0xd2)](_0x1ff659=>_0x839112(0xce)+_0x1ff659+_0x839112(0xd5))[_0x839112(0xe8)]('');}return _0x522c64+=_0x839112(0xef),_0x522c64;};}const Game={'mode':_0x4bb3d3(0xcf),'version':_0x4bb3d3(0xf8),'versions':{'american':[{'score':0x3,'validForHint':!![]}],'kenyan':[{'score':0x3,'validForHint':!![]}],'casino':[{'score':0x3,'validForHint':!![]}],'international':[{'score':0x3,'validForHint':!![]}],'pool':[{'score':0x3,'validForHint':!![]}],'russian':[{'score':0x3,'validForHint':!![]}],'nigerian':[{'score':0x3,'validForHint':!![]}]},'boardSize':0x8,'rowNo':0x3,'level':0x0,'baseStateCount':0x1,'drawStateCount':0x0,'hintCount':0x0,'undoCount':0x0,'path':{'index':0x0},'possibleWin':![],'isComputer':![],'pieceSelected':![],'thinking':![],'alternatePlayAs':![],'whiteTurn':![],'mandatoryCapture':!![],'helper':!![],'capturesHelper':![],'over':![],'validForHint':!![],'prop':null,'levels':[{'level':_0x4bb3d3(0xc7),'validForHint':!![],'score':0x0},{'level':_0x4bb3d3(0xf0),'validForHint':!![],'score':0x0},{'level':_0x4bb3d3(0xd7),'validForHint':!![],'score':0x0},{'level':_0x4bb3d3(0x112),'validForHint':!![],'score':0x0},{'level':'ADVANCED\x20LEVEL','validForHint':!![],'score':0x0},{'level':_0x4bb3d3(0xdd),'validForHint':!![],'score':0x0},{'level':'CANDIDATE\x20MASTER','validForHint':!![],'score':0x0},{'level':_0x4bb3d3(0xdb),'validForHint':!![],'score':0x0},{'level':_0x4bb3d3(0xd6),'validForHint':!![],'score':0x0}],'state':[],'baseState':[],'moves':{},'track':[],'stats':[]},Player=function(){const _0x49d498=_0x4bb3d3;this['name']='',this[_0x49d498(0xeb)]=Game[_0x49d498(0xf2)]/0x2*Game[_0x49d498(0xe6)],this['pieceColor']='',this['kings']=0x0,this[_0x49d498(0x10e)]=0x0,this[_0x49d498(0xc9)]=0x0,this['longestCapture']=0x0;},playerA=new Player(),playerB=new Player();playerA[_0x4bb3d3(0xfc)]=_0x4bb3d3(0xde),playerA[_0x4bb3d3(0xd4)]=_0x4bb3d3(0xfb),playerB['pieceColor']=_0x4bb3d3(0xe4),playerB[_0x4bb3d3(0xd4)]='AI';const general={'orientation':'natural','initialLoading':!![],'fullscreenSupport':![],'fullscreen':![],'default':_0x4bb3d3(0xff),'disabled':_0x4bb3d3(0xf7),'background':_0x4bb3d3(0xe7),'selected':'','level':'','sorted':[],'helperPath':[],'aiPath':[]};class ZobristHash{static [_0x4bb3d3(0xf5)]=[];static ['generateRandom']=_0x2ce929=>{const _0x17a2e1=_0x4bb3d3;return window['crypto'][_0x17a2e1(0xdf)](new BigUint64Array(_0x2ce929));};static [_0x4bb3d3(0xcc)]=_0x42122e=>{let _0x3a6fc2=-0x1;switch(_0x42122e){case'MB':_0x3a6fc2=0x0;break;case'KB':_0x3a6fc2=0x1;break;case'MW':_0x3a6fc2=0x2;break;case'KW':_0x3a6fc2=0x3;break;case'EC':_0x3a6fc2=0x4;break;case'IP':_0x3a6fc2=0x5;break;}return _0x3a6fc2;};static [_0x4bb3d3(0xed)]=()=>{const _0x5a353b=_0x4bb3d3;this[_0x5a353b(0xf5)]=[];for(let _0x4b54e2=0x0;_0x4b54e2<0xa;_0x4b54e2++){this[_0x5a353b(0xf5)][_0x5a353b(0xd1)]([]);for(let _0x53aa07=0x0;_0x53aa07<0xa;_0x53aa07++){this[_0x5a353b(0xf5)][_0x4b54e2][_0x5a353b(0xd1)]([]),this[_0x5a353b(0xf5)][_0x4b54e2][_0x53aa07]=this[_0x5a353b(0xe0)](0x6);}}};static [_0x4bb3d3(0xd0)]=_0x493245=>{const _0x2fddc9=_0x4bb3d3;let _0x291dde=0x0n;for(let _0x24bf91=0x0;_0x24bf91<Game[_0x2fddc9(0xf2)];_0x24bf91++){for(let _0x66e659=0x0;_0x66e659<Game['boardSize'];_0x66e659++){let _0x228b30=_0x493245[_0x24bf91][_0x66e659],_0x310770=this['index'](_0x228b30);Boolean(~_0x310770)&&(_0x291dde^=this[_0x2fddc9(0xf5)][_0x24bf91][_0x66e659][_0x310770]);}}return _0x291dde;};}class TranspositionTable{static [_0x4bb3d3(0xfd)]=0x2*(Game[_0x4bb3d3(0xf2)]/0x2*Game[_0x4bb3d3(0xf2)]*0x2);static [_0x4bb3d3(0xf5)]={};static [_0x4bb3d3(0x111)]=(_0x316902,_0x36789e=![])=>{const _0xd1ac1=_0x4bb3d3;let _0x497308=this[_0xd1ac1(0xf5)][Game[_0xd1ac1(0x103)]],_0x3dc941=_0x316902[_0xd1ac1(0x113)],_0x598a70=Number(_0x3dc941%BigInt(this[_0xd1ac1(0xfd)]));_0x497308[_0x598a70]=_0x316902;};static [_0x4bb3d3(0xf9)]=_0x479fbd=>{const _0x373e9a=_0x4bb3d3;let _0x6683af=this[_0x373e9a(0xf5)][Game[_0x373e9a(0x103)]];!_0x6683af&&(this[_0x373e9a(0xf5)][Game[_0x373e9a(0x103)]]=new Array(this[_0x373e9a(0xfd)]),_0x6683af=this[_0x373e9a(0xf5)][Game[_0x373e9a(0x103)]]);let _0x5cb84b=ZobristHash[_0x373e9a(0xd0)](_0x479fbd),_0x56c79e=Number(_0x5cb84b%BigInt(this['size'])),_0x4d077e=_0x6683af[_0x56c79e];if(_0x4d077e&&_0x4d077e[_0x373e9a(0x113)]==_0x5cb84b)return _0x4d077e;return{'key':_0x5cb84b};};}function _0x3ba8(_0xaee9b2,_0x1e8a21){const _0x385750=_0x3857();return _0x3ba8=function(_0x3ba843,_0x3f03f6){_0x3ba843=_0x3ba843-0xc7;let _0x38c76e=_0x385750[_0x3ba843];return _0x38c76e;},_0x3ba8(_0xaee9b2,_0x1e8a21);}function _0x3857(){const _0x354c7a=['22.15.204.536','MASTER\x20LEVEL','396BQOCxh','EXPERT\x20LEVEL','White','getRandomValues','generateRandom','Fixed\x20fullscreen\x20not\x20changing\x20orientation.','get','Improved\x20internal\x20operations.','Black','7NaceCU','rowNo','linear-gradient(rgba(40,\x2040,\x2040,\x200.9),\x20rgba(0,\x200,\x200,\x200.9))','join','11hypJyh','<li>Version:\x20','pieces','12256lMnhQE','initTable','Fixed\x20game\x20stats\x20behind\x20by\x20a\x20move.','</ul>','EASY\x20LEVEL','Fixed\x20single\x20player\x20draw\x20issue.','boardSize','</li><ul>','getDescription','table','9114850EUcpxj','linear-gradient(rgba(110,\x20110,\x20110,\x200.9),\x20rgba(70,\x2070,\x2070,\x200.9))','american','lookUp','keys','You','pieceColor','size','2137578pRujpX','linear-gradient(rgba(0,\x20152,\x2025,\x200.9),\x20rgba(0,\x20112,\x200,\x200.9))','Removed\x20showing\x20captures\x20helper\x20for\x20online\x20opponent.','Fixed\x20channel\x20subscription\x20timeout\x20issue.','22.15.206.538','version','85745zZyAHJ','Added\x20delete\x20and\x20copy\x20option\x20for\x20chat\x20engine.','from','22.15.200.529','updatesLog','22.15.205.537','Fixed\x20more\x20other\x20errors.','7FwYFVn','Fixed\x20declining\x20updated\x20error.','Added\x20voice\x20notes\x20in\x20the\x20chat\x20engine.','moves','22.15.209.540','<ul>','store','HARD\x20LEVEL','key','BEGINNER\x20LEVEL','4932gBjQYd','captures','4341084vCBpFf','21028236DUYkAE','index','172154tcbdEf','<li>','single-player','computeKey','push','map','Added\x20locking\x20orientation\x20in\x20both\x20primary\x20and\x20secondary.','name','</li>','GRAND\x20MASTER','MEDIUM\x20LEVEL','22.15.201.530','Fixed\x20minor\x20bags.'];_0x3857=function(){return _0x354c7a;};return _0x3857();}