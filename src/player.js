export class Player {

	static playerOnTurn;
	static gamePlayers;

	constructor(name, index) {
		this.name = name;
		this.actualSkip = false;
		this.skip = 0;
		this.points = 0;
		this.id = 'aa' + index  + 'aa' + this.generatePlayerID();
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

	static writePlayerOnTurn(playerOnTurnTag, playerID) {
		// const playerTag = document.querySelector(`${playerID}`);
		if(playerOnTurnTag.id === playerID && Player.playerOnTurn.id === playerID){
			// playerTag.classList.add('active');
			document.querySelector('#name').innerText = Player.playerOnTurn.name;
			document.querySelector('#points').innerText = Player.playerOnTurn.points;
			document.querySelector('#skip').innerText = Player.playerOnTurn.skip;
			document.querySelector('#actual-skip').innerText = Player.playerOnTurn.actualSkip ? 'Yes' : 'No';
			document.querySelector('#counter').innerText = Player.playerOnTurn.counter;
		}else{
			throw new Error('Player tag parameters do not match the player on turn');
		}
	}

	static pointsMethod(){
		document.querySelector('#points').innerText = Player.playerOnTurn.points;
	}
	
	static skipMethod() {
		document.querySelector('#skip').innerText = Player.playerOnTurn.skip;
	}

	static actualSkipMethod() {
		document.querySelector('#actual-skip').innerText = Player.playerOnTurn.actualSkip ? 'Yes' : 'No';
	}

	static counterMethod() {
		document.querySelector('#counter').innerText = Player.playerOnTurn.counter;
	}

	static writePlayersQueue(playersQueueTags){
		for(let i = 0; i < playersQueueTags.length; i++){
			if(playersQueueTags[i] instanceof HTMLElement){
				// player who will be on turn after the actual player on turn (and player who will be on turn after the palyerII)
				playersQueueTags[i].innerText = this.gamePlayers[i].name; // at this moment the player is on the first place in the array on index 0 (and at this moment the player is on the second place in the array on index 1)
				playersQueueTags[i].id = this.gamePlayers[i].id;
			}else {
				throw new Error('Player queue tags are not found in the DOM (NOT MOUNTED)');
			}
		}
	}

	static setPlayerOnTurn(player, playersQueueTags) {
		this.playerOnTurn = player;
		this.playerOnTurn.stopTurn = false; // reset stopTurn for next turns
		this.playerOnTurn.counter = 0; // reset counter for next turns
		const playerOnTurnTag = document.querySelector('.js-player');
		if(playerOnTurnTag instanceof HTMLElement) {
			playerOnTurnTag.id = `${this.playerOnTurn.id}`;
			this.writePlayerOnTurn(playerOnTurnTag, this.playerOnTurn.id);
			this.writePlayersQueue(playersQueueTags);
		}else {
			throw new Error('Player tag is not found in the DOM');
		}
	}

	static getReferenceToPlayers(reference){
		this.gamePlayers = reference;
	}

}