class Dice {
	static roll () {
		let res = 0;
		let possibleRes = [2,3,7,11];
		while(!possibleRes.includes(res)) {
			res = Math.round(Math.random() * 5 + 1) + Math.round(Math.random() * 5 + 1);
		} 
		
		if(res == 7) 
			return true;
		
		return false;
	} 
} 