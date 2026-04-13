export class Player {

	static playerOnTurn;

	constructor(name, index) {
		this.name = name;
		this.actualSkip = false;
		this.skip = 0;
		this.points = 0;
		this.id = index  + 'aa' + this.generatePlayerID();
		this.onTurn = false;
	}

	generatePlayerID(length = 8){
		const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz'; // 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789'
		let result = '';
		for (let i = 0; i < length; i++) {
			result += chars.charAt(Math.floor(Math.random() * chars.length));
		}
		return result;
	}

	addSkip() {
		this.skip++;
	}

	addPoints() {
		this.points++;
	}

	static setPlayerOnTurn(player) {
		this.playerOnTurn = player;
		console.log("static player property: " + this.playerOnTurn.id);
	}

}