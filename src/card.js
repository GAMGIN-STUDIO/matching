import { Player } from "./player.js";

export class Card {

	static gameCards;
	static gamePlayers;
	static gameTurns = 0;
	static revealObject = {
		click: false,
		stop: false
	};
	static cardSize;
	static generalRevealFlag = false;
	static gameMessageTag;

	constructor(theme, odd, admin = false, gameMessageTag) {
		this.back = odd ? "black" : "grey"; // determines the black & grey card pattern
		this.border = true;

		this.face = false;
		this.theme = theme;

		this.id = theme.id;
		this.playerID = '';
		this.holdFlag = false;
		this.adminFlag = admin;
		this.revealFlag = false;

		Card.gameMessageTag = gameMessageTag;
	}

	createCardTag(){
		const cardTag = document.createElement('div');
		cardTag.classList.add('js-card'); // initialized by the VanillaTilt JS library
		cardTag.classList.add('hidden'); // default flip animation class
		cardTag.id = `card-${this.id}`; 
		cardTag.style.width = Card.cardSize;
		cardTag.style.height = Card.cardSize;
		cardTag.style.backgroundColor = this.back;
		cardTag.style.border = this.border ? `2px solid` : 'none';
		cardTag.style.boxSizing = this.border ? 'border-box' : 'content-box';
		cardTag.style.cursor = 'pointer';
		cardTag.dataset.themeColor = this.theme.color;
		cardTag.dataset.themeIcon = this.theme.icon;
		// cardTag.dataset.face = `${this.face}`; // not suitable for storing the card face state
		this.tag = cardTag;
		// icon tag creation
		const iconTag = document.createElement('i');
		iconTag.classList.add(`fa-solid`);
		iconTag.classList.add(this.theme.icon);
		this.tag.style.fontSize = `calc(${Card.cardSize} / 2)`; // icon size management
		this.tag.style.color = this.back; // hide the icon initially -- in admin mode use rather this.adminFlag ? 'white' : this.back; than this.back
		this.tag.appendChild(iconTag);
	}

	initCardListener() {
		if(this.tag instanceof HTMLElement) {
			this.tag.addEventListener('click', () => {
				// if the card is not turned, it means that it doesn't have playerID assignment
				if(
					this.face === false
					&& this.playerID === ''
					&& Card.revealObject.click === false
					&& Player.playerOnTurn.stopTurn === false
				) {
					// check whether the matching card is already revealed on the table
					const sibling = Card.gameCards.find((siblingCard) => {
						return siblingCard.face === true && siblingCard.id === this.id
					});
					// reveal the card and assign the player ID for future comparisons
					this.face = true; // set face to true only after the matching card is found to avoid find in gameCards the same actually turned card without pair
					this.playerID = Player.playerOnTurn.id;	
					this.flipCard();
					this.counterCheck();
					// find out if the sibling card is turned by the same player or not and decide next steps
					if(sibling !== undefined){
						if(sibling.playerID === this.playerID && sibling.holdFlag === true){
							Player.playerOnTurn.points++;
							Player.playerOnTurn.stopTurn = true; // stop player's turn after one card turned with pair with hold card from last turns
							Player.pointsMethod();
							const actualPlayer = Card.gamePlayers.pop();
							Card.gamePlayers.unshift(actualPlayer);
							this.removePairCards();
							Card.gameMessageTag.innerText = 'You found a matching card that belongs to you! You earned 1 point! You can continue your turn!';
						}else if (sibling.playerID !== this.playerID){
							this.removePairCards();
							if((Card.gameTurns > 9 && Card.gamePlayers.length > 2) || (Card.gameTurns > 6 && Card.gamePlayers.length == 2)){
								Player.playerOnTurn.skip++;
								Player.skipMethod();
								Player.playerOnTurn.actualSkip = true;
								Player.actualSkipMethod();
								Card.gameMessageTag.innerText = 'It is matching card, but the first one was not yours. You will be skipped (general & actual skip).';
							}else{
								Card.gameMessageTag.innerText = 'It is matching card, but the first one was not yours. The game has not reached 10 turns yet. You will not be skipped.';
							}
						}else{
							this.removePairCards();	
							Card.gameMessageTag.innerText = 'It is matching card that belongs to you, but the first one was not held on the table. You will not earn points.';
						}
					}else{
						// the card remains on the table
						if(this.isHoldOnTable(Player.playerOnTurn.id)){
							Player.playerOnTurn.stopTurn = true; // stop player's turn also after one card turned without pair but with hold card from last turns
							Card.gameMessageTag.innerText = 'You already have a held card on the table and you found no matching card. You cannot reveal any more cards this turn.';
						}else{
							Card.gameMessageTag.innerText = 'You found no matching card, you can turn one more card or wait rest of the time till end of your turn.';
						};
					}
				}else if(this.face === false && this.playerID === '' && Card.revealObject.click === false && Player.playerOnTurn.stopTurn === true){
					Card.gameMessageTag.innerText = 'You cannot reveal another card to earn points';
				}else if(this.face  === true && this.playerID === Player.playerOnTurn.id && Card.revealObject.click === false){
					// option to turn card back if it's already turned by the same player
					this.face = false;
					this.playerID = '';
					this.holdFlag = false; // always during hiding card
					this.flipCard();
				}else if( this.face === true && this.playerID !== Player.playerOnTurn.id && Card.revealObject.click === false && this.revealFlag === false){
					// invalid player action warning
					Card.gameMessageTag.innerText = 'This card belongs to another player. Please choose a different card!';
				}else if((this.face === false || this.face === true) && this.playerID === '' && Card.revealObject.click === true) {
					// reveal mode management
					if(this.face === false && Player.playerOnTurn.points > 0){
						this.face = true;
						this.revealFlag = true;
						this.flipCard();
						Player.playerOnTurn.points--;
						Player.pointsMethod();
						Card.gameMessageTag.innerText = 'The card has been revealed, but you lose 1 point for using reveal mode!';
						if(Player.playerOnTurn.points == 0){
							Card.revealObject.stop = true; // disable the reveal option in the hiding card moment,, during revealMethod it would be mistake (too early)
							Card.gameMessageTag.innerText = 'To use reveal option for another card you have to earns points again.';
						}
					}else if(this.face === true && Player.playerOnTurn.points >= 0){
						this.face = false;
						this.revealFlag = false;
						this.flipCard();
					}else if(Card.revealObject.stop == true){
						Card.gameMessageTag.innerText = 'To use reveal option for another card, you need to earn points again.';
					}else{
						console.log('Unexpected reveal state');
					}
				}else if(this.face === true && this.playerID === '' && Card.revealObject.click === false && this.revealFlag === true && Player.playerOnTurn.points >= 0) {
					// hide revealed cards when reveal mode is disabled
					this.face = false;
					this.revealFlag = false;
					this.flipCard();
				}else if(this.face === true && this.playerID !== '' && Card.revealObject.click === true && this.holdFlag === true) {
					// attempting to reveal a held card
					Card.gameMessageTag.innerText = 'You cannot use reveal mode on a held card!'
				}else{
					console.log('Unexpected game scenario detected')
				}
			});
		}else{
			throw new Error('Card element not initialized - cannot attach event listener');
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

	static revealMethod() {
		if(this.revealObject.click === false && Player.playerOnTurn.points > 0){
			this.revealObject.click = true;
			Card.gameMessageTag.innerText = 'Reveal mode enabled! You can reveal one extra card during your turn';
			if(this.generalRevealFlag === false){
				this.generalRevealFlag = true;
			}
		}else if(this.revealObject.click === false && Player.playerOnTurn.points === 0){
			Card.gameMessageTag.innerText = "You cannot enable reveal mode - you don't have enough points!!";
		}else{
			this.revealObject.click = false;
			Card.gameMessageTag.innerText = 'Reveal mode disabled!';
		}
		
	}

	flipCard() {
		this.tag.classList.add("flipping");

		setTimeout(()=>{
			if(this.face === false) {
				this.tag.style.backgroundColor = this.back; // hide card face
				this.tag.style.color = this.back; // hide icon 
			}else if(this.face === true){
				this.tag.style.backgroundColor = this.theme.color; // reveal card face
				this.tag.style.color = 'white'; // reveal icon 
			}else {
				throw new Error('Unexpected card state during flipCard method.');
			}
			this.tag.classList.remove("flipping");
		}, 250);
	}

	counterCheck() {
		if(Card.revealObject.click === false){ // for true value of click it would be nonsense to count turns because of reveal option
			Player.playerOnTurn.counter++;
			Player.counterMethod();
			if(Player.playerOnTurn.counter === 2) {
				Player.playerOnTurn.stopTurn = true; // stop player's turn after two cards turned without pair
			}
		}
	}

	removePairCards(){
		for(let i = Card.gameCards.length - 1; i >= 0; i--){
			const pairCard = Card.gameCards[i];
			if(pairCard.id === this.id){
				Card.gameCards.splice(i, 1);
				pairCard.tag.style.opacity = '0'; // hide the pair card
				pairCard.tag.style.pointerEvents = 'none'; // disable click on the pair card
			}
		}
	}

	isHoldOnTable(pID) {
		const isHoldFound =  Card.gameCards.some((card) => {
			return card.face === true && card.playerID === pID && card.holdFlag === true;
		});
		return isHoldFound;
	}

	static useCardSize(size, resize = false) {
		this.cardSize = size;
		if(resize) {
			Card.gameCards.forEach((card) => {
				card.tag.style.width = this.cardSize;
				card.tag.style.height = this.cardSize;
			});
		}
	}

	static autoHideCards(pID = '') {
		Card.gameCards.forEach((card) => {
			if((pID !== '' && card.face === true && card.playerID === pID && card.holdFlag === false) || card.revealFlag === true){
				card.face = false;
				card.playerID = '';
				card.holdFlag = false; // always during hiding card for sure
				card.revealFlag = false; // reset reveal flag for sure
				card.flipCard();
			}
		});
	}
}