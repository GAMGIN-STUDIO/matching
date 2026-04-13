import { Player } from "./player.js";

export class Card {

	static gameCards;
	static gamePlayers;
	static gameTurns = 0;

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
				if(this.face === false && this.playerID === '') {
					// check if the card has it's sibling already turned on the table
					const sibling = this.gameCards.find((sibling) => {
						sibling.face === true && sibling.id === this.id
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
							if(this.gameTurns > 9){
								Player.playerOnTurn.skip++;
								Player.playerOnTurn.actualSkip = true;

								console.log('You found the pair card but first one is NOT yours. You will be skipped (whole and actual skip)');
							}else{
								console.log('You found colegeas your pair card, but you will not be skipped until 10 turns of the game.');
							}
						}
						// now the pair must be removed from the table
					}else{
						console.log('You turned the card without pair actually')
						// card can stay in the game
					}
				}else if(this.face  === true && this.playerID === Player.playerOnTurn.id){
					// option to turn card back if it's already turned by the same player
					this.face = false;
					this.playerID = '';
				}else if( this.face === true && this.playerID !== Player.playerOnTurn.id){
					// warning for incompetent player action
					console.log('This card is turned by another player. Please choose another CARD!');
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

	removePairCards(){
		this.gameCards = this.gameCards.filter((card) => card.id !== this.id);
	}
}