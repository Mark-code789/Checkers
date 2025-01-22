class Moves {
	list = {moves: [], captures: []};
	
	add (i, j, k, l, m, n) {
		// i and j are from coordinates
		// k and l are to coordinates
		// m and n are capture piece coordinates
		// The move is shorted to a bit string for efficiency
		// JS store numbers in 32 bit floating point
		// a number can be defined by 8 bits 
		// hence 32 bits can store 4 numbers
		
		let b = (i << 24) |
				(j << 16) |
				(k << 8) |
				(l << 0);
		let c = (m << 16) |
				(n << 0);
				
		if(m == undefined)
			this.list.moves.push(new Move(b));
		else
			this.list.captures.push(new Move(b, c));
	} 
	async populate (player, board) {
		let {grid, area, piecesPerPlayer, size} = board.state;
		
		let id = player.id;
		let a = 0; // (PLAYER_A.is(player)? 2: 11);
		let b = piecesPerPlayer; // (PLAYER_A.is(player)? 3: piecesPerPlayer);
		
		for(let i = a; i < b; i++) {
			let pos = board.getPos(id, i);
			
			if(pos == -1)
				continue;
				
			let [row, col] = board.posToCoord(pos);
			
			await this.find(player, board, row, col);
		} 
	} 
	
	find (player, board, i, j) {
		let id = player.id
		let opp = Player.invert(player).id;
		let {size, grid} = board.state;
		let r = player.getDirectionInt();
		let index = grid[board.coordToIndex(i, j)];
		
		let isKing = board.isKing(i, j);
		
		/*
			Obstacles 
			c1 - c4 hold the possible captures
			f1 - f4 indicate any obstacle from point of start
			f5 - f8 indicate any second obstacle. Useful when there is a capture
		*/
		let c1 = 0;
		let c2 = 0;
		let c3 = 0;
		let c4 = 0;
		let f1 = 0;
		let f2 = 0;
		let f3 = 0;
		let f4 = 0;
		let f5 = 0;
		let f6 = 0;
		let f7 = 0;
		let f8 = 0;
		
		for(let k = i+r, l = i-r, m = j-1, n = j+1;; k+=r, l-=r, m--, n++) {
			// Out of range check
			if((k > size-1 || k < 0) && 
			   (l > size-1 || l < 0) ||
			   (m > size-1 || m < 0) &&
			   (n > size-1 || n < 0)) 
				break;
				
			// Obstacle check
			if(f1 && f2 && f3 && f4 && f5 && f6 && f7 && f8) 
				break;
				
			let idR, idL, 
				oppR, oppL, 
				maskR, maskL, 
				m1, m2, m3, m4;
				
			/*
				Forward direction
			 */
			if(k < size && k > -1) {
				idL = board.getPosAsBit(id, k, m);
				idR = board.getPosAsBit(id, k, n);
				oppL = board.getPosAsBit(opp, k, m);
				oppR = board.getPosAsBit(opp, k, n);
				maskL = board.getCell(k, m);
				maskR = board.getCell(k, n);
				
				m1 = maskL & oppL; 
				m2 = maskR & oppR;
				m3 = maskL & idL;
				m4 = maskR & idR;
				
				c1 = !c1 && m1? [k, m]: c1;
				c2 = !c2 && m2? [k, n]: c2;
					
				// Superimpose 
				m1 |= m3;
				m2 |= m4;
				
				f5 |= (f1 & m1) | (maskL ^ 1);
				f6 |= (f2 & m2) | (maskR ^ 1);
				
				f1 |= m1 | (maskL ^ 1);
				f2 |= m2 | (maskR ^ 1);
				
				// Invert
				m1 ^= 1;
				m2 ^= 1;
				
				if(m1 && maskL && !f1) {
					if(Math.abs(k-i) == 1 || isKing && !Version.is('american', 'kenyan', 'casino'))
					this.add(i, j, k, m);
				} 
				if(m2 && maskR && !f2) {
					if(Math.abs(k-i) == 1 || isKing && !Version.is('american', 'kenyan', 'casino'))
					this.add(i, j, k, n);
				} 
				
				// Captures 
				if(m1 && maskL && !f5 && c1) {
					if(!isKing && Math.abs(k-i) == 2) 
						this.add(i, j, k, m, ...c1);
					
					if(isKing) {
						if(Version.is('american') && Math.abs(k-i) == 2) 
							this.add(i, j, k, m, ...c1);
						if(Version.is('kenyan', 'casino') && Math.abs(k - c1[0]) == 1)
							this.add(i, j, k, m, ...c1);
						if(Version.is('international', 'pool', 'russian', 'nigerian')) 
							this.add(i, j, k, m, ...c1);
					} 
				} 
				if(m2 && maskR && !f6 && c2) {
					if(!isKing && Math.abs(k-i) == 2) 
						this.add(i, j, k, n, ...c2);
					
					if(isKing) {
						if(Version.is('american') && Math.abs(k-i) == 2) 
							this.add(i, j, k, n, ...c2);
						if(Version.is('kenyan', 'casino') && Math.abs(k - c2[0]) == 1)
							this.add(i, j, k, n, ...c2);
						if(Version.is('international', 'pool', 'russian', 'nigerian'))
							this.add(i, j, k, n, ...c2);
					} 
				} 
				
				if(!isKing && !c1 && !c2 && Version.is('american', 'kenyan')) 
					break;
				else if(!isKing && Version.is('american', 'kenyan')) 
					continue;
			} 
			else {
				f1 = 1;
				f2 = 1;
				f5 = 1;
				f6 = 1;
			} 
			
			
			/*
				Reverse direction
			 */
			if(l < size && l > -1) {
				idL = board.getPosAsBit(id, l, m);
				idR = board.getPosAsBit(id, l, n);
				oppL = board.getPosAsBit(opp, l, m);
				oppR = board.getPosAsBit(opp, l, n);
				maskL = board.getCell(l, m);
				maskR = board.getCell(l, n);
				
				m1 = maskL & oppL; 
				m2 = maskR & oppR;
				m3 = maskL & idL;
				m4 = maskR & idR;
				
				c3 = !c3 && m1? [l, m]: c3;
				c4 = !c4 && m2? [l, n]: c4;
					
				// Superimpose 
				m1 |= m3;
				m2 |= m4;
				
				f7 |= (f3 & m1) | (maskL ^ 1);
				f8 |= (f4 & m2) | (maskR ^ 1);
				
				f3 |= m1 | (maskL ^ 1);
				f4 |= m2 | (maskR ^ 1);
				
				// Invert
				m1 ^= 1;
				m2 ^= 1;
				
				if(m1 && maskL && !f3) {
					if(isKing && (Math.abs(l-i) == 1 || !Version.is('american', 'kenyan', 'casino')))
					this.add(i, j, l, m);
				} 
				if(m2 && maskR && !f4) {
					if(isKing && (Math.abs(l-i) == 1 || !Version.is('american', 'kenyan', 'casino')))
					this.add(i, j, l, n);
				} 
				
				// Captures 
				if(m1 && maskL && !f7 && c3) {
					if(!isKing && Math.abs(l-i) == 2) 
						this.add(i, j, l, m, ...c3);
						
					if(isKing) {
						if(Version.is('american') && Math.abs(l-i) == 2) 
							this.add(i, j, l, m, ...c3);
						if(Version.is('kenyan', 'casino') && Math.abs(l - c3[0]) == 1)
							this.add(i, j, l, m, ...c3);
						if(Version.is('international', 'pool', 'russian', 'nigerian'))
							this.add(i, j, l, m, ...c3);
					} 
				} 
				if(m2 && maskR && !f8 && c4) {
					if(!isKing && Math.abs(l-i) == 2) 
						this.add(i, j, l, n, ...c4);
						
					if(isKing) {
						if(Version.is('american') && Math.abs(l-i) == 2) 
							this.add(i, j, l, n, ...c4);
						if(Version.is('kenyan', 'casino') && Math.abs(l - c4[0]) == 1)
							this.add(i, j, l, n, ...c4);
						if(Version.is('international', 'pool', 'russian', 'nigerian'))
							this.add(i, j, l, n, ...c4);
					} 
				} 
			} 
			else {
				f3 = 1;
				f4 = 1;
				f7 = 1;
				f8 = 1;
			} 
		} 
	} 
}