import { Player } from "./player.js";

export class Card {

	static gameCards;
	static gamePlayers;
	static gameTurns = 0;
	static revealObject = {
		click: false,
		stop: false
	};

	constructor(theme, windowWidth) {
		this.back = "black";
		this.size = windowWidth / 10;
		this.border = false;

		this.face = false;
		this.theme = theme;

		this.id = theme.id;
		this.playerID = '';
	}

	createCardTag(){
		const cardTag = document.createElement('div');
		cardTag.classList.add('js-card');
		cardTag.id = `card-${this.id}`;
		cardTag.style.width = `${this.size}px`;
		cardTag.style.height = `${this.size}px`;
		cardTag.style.backgroundColor = this.back;
		cardTag.style.border = this.border ? '2px solid black' : 'none';
		cardTag.dataset.themeColor = `${this.theme.color}`;
		cardTag.dataset.themeIcon = `${this.theme.icon}`;
		// cardTag.dataset.face = `${this.face}`; // is not the right way to store face value
		this.tag = cardTag;
	}

	initCardListener() {
		if(this.tag instanceof HTMLElement) {
			this.tag.addEventListener('click', () => {
				// if the card is not turned, it means that it doesn't have playerID assignment
				if(this.face === false && this.playerID === '' && Card.revealObject.click === false && Player.playerOnTurn.stopTurn === false) {
					// check if the card has it's sibling already turned on the table
					const sibling = this.gameCards.find((sibling) => {
						return sibling.face === true && sibling.id === this.id
					});
					// make card turned and add ID proof for future comparsions
					this.face = true;
					this.playerID = Player.playerOnTurn.id;	
					// find out if the sibling card is turned by the same player or not and decide next steps
					if(sibling !== undefined){
						if(sibling.playerID === this.playerID){
							Player.playerOnTurn.points++;
							actualPlayer = this.gamePlayers.pop();
							this.gamePlayers.unshift(actualPlayer);
							this.removePairCards();							
							console.log('You found your own pair card! You earned plus 1 point and you can continue in your your turn!');
						}else if (sibling.playerID !== this.playerID){
							this.removePairCards();
							Player.playerOnTurn.stopTurn = true; // stop player's turn only after finding pair card but not his own
							if(this.gameTurns > 9){
								Player.playerOnTurn.skip++;
								Player.playerOnTurn.actualSkip = true;

								console.log('You found the pair card but first one is NOT yours. You will be skipped (whole and actual skip)');
							}else{
								console.log('You found NOT your pair card, but game not reach 10 turns yet. You will not be skipped.');
							}
						}
					}else{
						console.log('You turned the card without pair actually')
						// card can stay in the game
					}
				}else if(this.face === false && this.playerID === '' && Card.revealObject.click === false && Player.playerOnTurn.stopTurn === true){
					console.log('You cannot turn another card for earn points');
				}else if(this.face  === true && this.playerID === Player.playerOnTurn.id && Card.revealObject.click === false){
					// option to turn card back if it's already turned by the same player
					this.face = false;
					this.playerID = '';
				}else if( this.face === true && this.playerID !== Player.playerOnTurn.id && Card.revealObject.click === false){
					// warning for incompetent player action
					console.log('This card is turned by another player. Please choose another CARD!');
				}else if(this.face === false && this.playerID === '' && Card.revealObject.click === true) {
					// reveal managment
					if(this.face === false){
						this.face = true;
						Player.playerOnTurn.points--;
						console.log('Now you can see the card, but you lose 1 point for this action!');
					}else{
						this.face = false;
						Card.revealObject.stop = true; // stop revel option in the hiding card moment,, during revealLaunch it would be mistake (too early)
						console.log('To use reveal option for another card you have to wait to your next turn');
					}
				}else{
					console.log('different scenario - maybe something went wrong? or unexpected scenario or bug?')
				}
			});
		}else{
			throw new Error('CARD TAG NOT INITIALIZED - Cannot init card listener');
		}
	}

	static getReferenceToCards(reference){
		this.gameCards = reference;
	}

	static getReferenceToPlayers(reference){
		this.gamePlayers = reference;
	}

	static addGameTurn(amount){
		this.gameTurns = amount;
	}

	static revealLaunch() {
		this.revealObject.click = true;
		console.log('You used reveal button! You can click on one card to reveal in addition to your turn');
	}

	removePairCards(){
		Card.gameCards = Card.gameCards.filter((card) => card.id !== this.id);
	}
}