export class Player {

	static playerOnTurn;
	static gamePlayers;

	constructor(name, index) {
		this.name = name;
		this.actualSkip = false;
		this.skip = 0;
		this.points = 0;
		this.id = index  + 'aa' + this.generatePlayerID();
		this.onTurn = false;
		this.stopTurn = false;
		this.counter = 0;
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

	writePlayerOnTurn(playerOnTurnTag, playerID) {
		const playerTag = document.querySelector(`${playerID}`);
		if(playerOnTurnTag.matches(`#${playerID}` && playerID === Player.playerOnTurn.id)){
			playerTag.classList.add('active');
			document.querySelector('#name').innerText = Player.playerOnTurn.name;
			document.querySelector('#points').innerText = Player.playerOnTurn.points;
			document.querySelector('#skip').innerText = Player.playerOnTurn.skip;
			document.querySelector('#actual-skip').innerText = Player.playerOnTurn.actualSkip ? 'Yes' : 'No';;
			document.querySelector('#counter').innerText = Player.playerOnTurn.counter;
		}else{
			throw new Error('Player tag parameters do not match the palyer on turn');
		}
	}

	writePlayersQueue(){
		// player who will be on turn after the actual player on turn
		const playerII = document.querySelector('.player-II');
		playerII.innerText = this.gamePlayers(0).name; // at this moment the player is on the first place in the array on index 0
		playerII.id = this.gamePlayers(0).id;
		// player who will be on turn after the palyerII 
		const playerIII = document.querySelector('.player-III');
		playerIII.innerText = this.gamePlayers(1).name; // at this moment the player is on the second place in the array on index 1
		playerIII.id = this.gamePlayers(1).id;

	}

	static setPlayerOnTurn(player) {
		this.playerOnTurn = player;
		this.playerOnTurn.stopTurn = false; // reset stopTurn for next turns
		this.playerOnTurn.counter = 0; // reset counter for next turns
		const playerOnTurnTag = document.querySelector('.js-player');
		if(playerOnTurnTag instanceof HTMLElement) {
			playerOnTurnTag.id = `${this.playerOnTurn.id}`;
			writePlayerOnTurn(playerOnTurnTag, this.playerOnTurn.id);
		}else {
			throw new Error('Player tag is not found in the DOM');
		}
	}

	static getReferenceToPlayers(reference){
		this.gamePlayers = reference;
	}

}