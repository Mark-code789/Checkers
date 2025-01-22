class Move {
	constructor (moveId, captureId) {
		this.moveId = moveId;
		this.captureId = captureId;
		this.kingAfter = false;
		this.kingBefore = false;
		this.i = moveId >> 24 & 0xFF;
		this.j = moveId >> 16 & 0xFF;
		this.m = moveId >> 8 & 0xFF;
		this.n = moveId >> 0 & 0xFF;
	}
	getId (id) {
		if(id == 'move') 
			return this.moveId;
		else if(id == 'capture') 
			return this.captureId;
	} 
	getIds () {
		return [this.moveId, this.captureId];
	} 
	getFromRow () {
		return this.moveId >> 24 & 0xFF;
	}
	getFromCol () {
		return this.moveId >> 16 & 0xFF;
	}
	getToRow () {
		return this.moveId >> 8 & 0xFF;
	}
	getToCol () {
		return this.moveId >> 0 & 0xFF;
	}
	getCapturedRow () {
		return this.captureId && this.captureId >> 16 & 0xFF;
	}
	getCapturedCol () {
		return this.captureId && this.captureId >> 0 & 0xFF;
	}
	isCapture () {
		return this.captureId? 1: 0;
	}
	isKing () {
		return this.kingAfter;
	}
	wasKing () {
		return this.kingBefore;
	}
	setIsKing (state = true) {
		this.kingAfter = state;
	}
	setWasKing (state = true) {
		this.kingBefore = state;
	}
}