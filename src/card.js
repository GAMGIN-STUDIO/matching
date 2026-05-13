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
		this.back = odd ? "black" : "grey"; // condition for black&white color pattern decision
		this.border = false;

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
		cardTag.classList.add('js-card'); // initialized by js VanillaTilt object 
		cardTag.classList.add('hidden'); // origin flipping class
		cardTag.id = `card-${this.id}`; 
		cardTag.style.width = Card.cardSize;
		cardTag.style.height = Card.cardSize;
		cardTag.style.backgroundColor = this.back;
		cardTag.style.border = this.border ? '2px solid red' : 'none';
		cardTag.style.cursor = 'pointer';
		cardTag.dataset.themeColor = this.theme.color;
		cardTag.dataset.themeIcon = this.theme.icon;
		// cardTag.dataset.face = `${this.face}`; // is not the right way to store face value
		this.tag = cardTag;
		// icon tag creation
		const iconTag = document.createElement('i');
		iconTag.classList.add(`fa-solid`);
		iconTag.classList.add(this.theme.icon);
		this.tag.style.fontSize = `calc(${Card.cardSize} / 2)`; // icon size management
		this.tag.style.color = this.adminFlag ? 'white' : this.back; // hide initial icon 
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
					// check if the card has it's sibling already turned on the table
					const sibling = Card.gameCards.find((siblingCard) => {
						return siblingCard.face === true && siblingCard.id === this.id
					});
					// make card turned and add ID proof for future comparsions
					this.face = true; // face true only after sibling is finded to avoid find in gameCards the same actually turned card without pair
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
							Card.gameMessageTag.innerText = 'You found your own pair card! You earned plus 1 point and you can continue in your turn!';
						}else if (sibling.playerID !== this.playerID){
							this.removePairCards();
							if((Card.gameTurns > 9 && Card.gamePlayers.length > 2) || (Card.gameTurns > 6 && Card.gamePlayers.length == 2)){
								Player.playerOnTurn.skip++;
								Player.skipMethod();
								Player.playerOnTurn.actualSkip = true;
								Player.actualSkipMethod();
								Card.gameMessageTag.innerText = 'You found the pair card but first one is NOT yours. You will be skipped (general and actual skip)';
							}else{
								Card.gameMessageTag.innerText = 'You found pair card, which is NOT yours, but game not reach 10 turns yet. You will not be skipped.';
							}
						}else{
							this.removePairCards();	
							Card.gameMessageTag.innerText = 'You found pair card, which is yours, but first one was not hold on the table. You will not earn points';
						}
					}else{
						// card can stay in the game
						if(this.isHoldOnTable(Player.playerOnTurn.id)){
							Player.playerOnTurn.stopTurn = true; // stop player's turn also after one card turned without pair but with hold card from last turns
							Card.gameMessageTag.innerText = 'You have active hold card on the table and you turned the card without pair actually, no more cards you will may turn';
						}else{
							Card.gameMessageTag.innerText = 'You turned the card without pair actually, you can turn one more card or wait rest of the time till next players turn';
						};
					}
				}else if(this.face === false && this.playerID === '' && Card.revealObject.click === false && Player.playerOnTurn.stopTurn === true){
					Card.gameMessageTag.innerText = 'You cannot turn another card for earn points';
				}else if(this.face  === true && this.playerID === Player.playerOnTurn.id && Card.revealObject.click === false){
					// option to turn card back if it's already turned by the same player
					this.face = false;
					this.playerID = '';
					this.holdFlag = false; // always during hiding card
					this.flipCard();
				}else if( this.face === true && this.playerID !== Player.playerOnTurn.id && Card.revealObject.click === false && this.revealFlag === false){
					// warning for incompetent player action
					Card.gameMessageTag.innerText = 'This card is turned by another player. Please choose another CARD!';
				}else if((this.face === false || this.face === true) && this.playerID === '' && Card.revealObject.click === true) {
					// reveal managment
					if(this.face === false && Player.playerOnTurn.points > 0){
						this.face = true;
						this.revealFlag = true;
						this.flipCard();
						Player.playerOnTurn.points--;
						Player.pointsMethod();
						Card.gameMessageTag.innerText = 'Now you can see the card, but you lose 1 point for this action!';
						if(Player.playerOnTurn.points == 0){
							Card.revealObject.stop = true; // stop revel option in the hiding card moment,, during revealMethod it would be mistake (too early)
							Card.gameMessageTag.innerText = 'To use reveal option for another card you have to earns points again';
						}
					}else if(this.face === true && Player.playerOnTurn.points >= 0){
						this.face = false;
						this.revealFlag = false;
						this.flipCard();
					}else if(Card.revealObject.stop == true){
						Card.gameMessageTag.innerText = 'To use reveal option for another card you have to earns points again';
					}else{
						console.log('unexpected case')
					}
				}else if(this.face === true && this.playerID === '' && Card.revealObject.click === false && this.revealFlag === true && Player.playerOnTurn.points >= 0) {
					// option for hiding revealed cards in turned OFF reveal mode
					this.face = false;
					this.revealFlag = false;
					this.flipCard();
				}else if(this.face === true && this.playerID !== '' && Card.revealObject.click === true && this.holdFlag === true) {
					// revealing the holding card
					Card.gameMessageTag.innerText = 'You cannot use revealing on card, which is used to holding!'
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

	static revealMethod() {
		if(this.revealObject.click === false && Player.playerOnTurn.points > 0){
			this.revealObject.click = true;
			Card.gameMessageTag.innerText = 'You turn ON the reveal mode! You can click on one card to reveal in addition to your turn';
			if(this.generalRevealFlag === false){
				this.generalRevealFlag = true;
			}
		}else if(this.revealObject.click === false && Player.playerOnTurn.points === 0){
			Card.gameMessageTag.innerText = "You cannout turn ON the reveal mode - you don't have enough points!!";
		}else{
			this.revealObject.click = false;
			Card.gameMessageTag.innerText = 'You turn OFF the reveal mode!';
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
				throw new Error('Unexpected card state during flipCard method');
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