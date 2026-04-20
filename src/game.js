import { Card } from "./card.js";
import { Player } from "./player.js";

export class Game {

	constructor(dataThemes) {
		// admin and other managment
		this.admin = true;

		// game init managament
		this.themes = dataThemes.themes; 

		// core game managment
		this.players = [];
		this.cards = [];

		// game time managment
		this.gameTime = 3601; // hour in seconds + 1 second for more fluent time display
		this.turnTime = 11; // + 1 second for more fluent time display and 10 seonds turn value show
		this.gameTimeFormatted = "";
		this.turnTimeFormatted = "";    
		this.turns = 0;

		// game buttons managment
		this.revealClick = false;
 
		// responsive managment
		this.sizeObject = {
			cardsGap: 4, // pixels
			tableGridIndex: 10, // cols and rows of the table, it will be square
			width: window.innerWidth,
			height: window.innerHeight
		};

		// error managment
		this.isError = false;
 
	}

	// game init managment

	static async init() {
		const res = await fetch("./src/cards/themes.json");
		const json = await res.json();
		return new Game(json);
	}

	// GAME MANAGMENT

	// init part and help functions

	playersInit() {
		let numPlayers = null;
		while(numPlayers > 3 || numPlayers < 2 || numPlayers === null) {
			numPlayers = this.admin ? 3 : Number(prompt("Enter the number of players (2-3):"));
		}
		for (let i = 0; i < numPlayers; i++) {
			const playerName = this.admin ? `Player ${i+1}` : prompt(`Enter the name of player ${i+1}:`)
			const player = new Player(playerName, i+1);
			this.players.push(player);
		}
		this.players = this.shuffle(this.players);
		Card.getReferenceToPlayers(this.players);
	}

	doubleArray(array) {
		return [...array, ...array];
	}

	shuffle(array) {
		for (let i = array.length - 1; i > 0; i--) {
			const j = Math.floor(Math.random() * (i + 1));
		
			[array[i], array[j]] = [array[j], array[i]];
		}
		return array;
	}

	cardsInit() {
		try{
			const cleanThemes = this.cleanArray(this.themes);
			const cardThemes = this.shuffle(this.doubleArray(cleanThemes));
			for(const theme of cardThemes) {
				this.cards.push(new Card(theme, this.sizeObject));
			}
			Card.getReferenceToCards(this.cards);
		}catch(error){
			this.isError = true;
			console.log(error);
		}
	}

	cleanArray(array) {
		const validation = this.checkArrayIDs(array);
		if(validation.status) {
			const seenIds = new Set();
			const seenColors = new Set();
			const seenIcons = new Set();
			const unique = [];
			for (const item of array) {
				if (
					!seenIds.has(item.id) &&
					!seenColors.has(item.color) &&
					!seenIcons.has(item.icon)
				) {
					// each property of item must be unique = each item is unique, if not, it is ignored
					unique.push(item);
					seenIds.add(item.id);
					seenColors.add(item.color);
					seenIcons.add(item.icon);
				}
			}
			return unique;
		}else{
			throw new Error(`CARDS NOT INITIALIZED - Invalid theme ID: ${validation.invalidID === "" ? "Empty string ID" : validation.invalidID}`);
		}
	}



	checkArrayIDs(array) {
		for(const item of array) {
			const tID = typeof item.id;
			if((tID !== "number" && tID !== "string") ||
				(tID === "string" && item.id.length === 0) ||
				(tID === "number" && item.id < 0)
			) {
				return {
					invalidID: item.id,
					status: false
				};
			}
		}
		return {
			invalidID: null,
			status: true
		};
	}

	prepare() {
		this.playersInit();
		this.cardsInit();
	}

	// game cards service and launch

	createTableTag() {
		const tableTag = document.createElement('section');
		tableTag.classList.add('table');
		this.tableTag = tableTag;
	}

	makeGameSizes(resize = false) {
		if(resize){
			this.sizeObject = {
				cardsGap: 4, // pixels
				tableGridIndex: 10, // cols and rows of the table, it will be square
				width: window.innerWidth,
				height: window.innerHeight
			};
		}
		// table size managment
		let saveSize = Math.min(this.sizeObject.width, this.sizeObject.height);
		if(saveSize >= 800) {
			saveSize = saveSize - 150; // 150 for game buttons (flex direction row), lower saveSize will be flex direction column
			document.querySelector('main').style.flexDirection = 'row';
		}else{
			document.querySelector('main').style.flexDirection = 'column';
		}
		this.tableTag.width = `${saveSize}px`;
		this.tableTag.height = `${saveSize}px`;
		// card size managment
		const rawCardSize = Math.round(saveSize / this.sizeObject.tableGridIndex);
		const cardSize  = rawCardSize - (this.sizeObject.cardsGap * 2); // gap * 2 cause of both cross-side directions
		resize ? Card.useCardSize(`${cardSize}px`, true) : Card.useCardSize(`${cardSize}px`);
	}

	cardsService() {
		if(!this.isError) {
			this.createTableTag();
			this.makeGameSizes();
			try{
				if(this.tableTag instanceof HTMLElement) {
					for(const card of this.cards) {
						card.createCardTag();
						card.initCardListener();
						this.tableTag.appendChild(card.tag);
					}
				}else{
					throw new Error('TABLE TAG NOT CORRECT - Cannot launch appending cards');
				}
			}catch(error){
				this.isError = true;
				console.log(error);
			}
		}
	}

	// game buttons service and launch

	createControlPanelTag() {
		const controlPanelTag = document.createElement('section');
		controlPanelTag.classList.add('control-panel');
		this.controlPanelTag = controlPanelTag;
	}

	createReskipTag() {
		const reskipTag = document.createElement('div');
		reskipTag.innerText = "Reskip";
		this.reskipTag = reskipTag;
	}

	createRevealTag() {
		const revealTag = document.createElement('div');
		revealTag.innerText = "Reveal";
		this.revealTag = revealTag;
	}

	initReskipListener() {
		if(this.reskipTag instanceof HTMLElement) {
			this.reskipTag.addEventListener('click', () => {
				// reskip managment
				const player = Player.playerOnTurn;
				if(player.skip > 0 && player.points >= 3) {
					player.skip--;
					player.points -= 3;
					console.log('You used reskip button! You lose 3 points but also 1 skip for reward!');
				}
			})
		}else{
			throw new Error('RESKIP TAG NOT INITIALIZED - Cannot init reskip listener');
		}
	}

	initRevealListener() {
		if(this.revealTag instanceof HTMLElement) {
			this.revealTag.addEventListener('click', () => {
				// reveal managment
				if(Card.revealObject.stop === false){
					Card.revealLaunch();
				}
			})
		}else{
			throw new Error('REVEAL TAG NOT INITIALIZED - Cannot init reveal listener');
		}
	}

	gameButtonsService() {
		if(!this.isError) {
			// reskip & reveal buttons managment
			this.createReskipTag();
			this.createRevealTag();
			this.createControlPanelTag();
			try{
				this.initReskipListener();
				this.initRevealListener();
				this.controlPanelTag.appendChild(this.revealTag);
				this.controlPanelTag.appendChild(this.reskipTag);
			}catch(error){
				this.isError = true;
				console.log(error);
			}
		}
	}

	// game mount managment - mounting game components (table with cards and game buttons) to the DOM

	findMountPoint() {
		const mountPoint = document.querySelector('main');
		if(mountPoint instanceof HTMLElement) {
			this.mountPoint = mountPoint;
		}else{
			throw new Error('MOUNT POINT NOT FOUND - Cannot find mount point in the DOM');
		}
	}

	mountTable() {
		try{
			this.findMountPoint();
			this.mountPoint.appendChild(this.tableTag);
		}catch(error){
			this.isError = true;
			console.log(error);
		}
	}

	mountGameButtons() {
		try{
			this.findMountPoint();
			this.mountPoint.appendChild(this.controlPanelTag);
		}catch(error){
			this.isError = true;
			console.log(error);
		}
	}

	// game start/end managment

	start() {
		this.mountTable();
		this.mountGameButtons();
		if(!this.isError) {
			this.playerTurn();
			const gameTimer = this.gameTimerF();
			this.turnTimerF(gameTimer);
			console.log("game started");
		}
	}

	gameTimerF() {
		const interval = setInterval(() => {
			this.gameTime = this.gameTime - 1;
			this.gameTimeToTime();
			if(this.gameTime === 0) {
				clearInterval(interval);
				this.end();
			}
		}, 1000);
		return interval
	}

	turnTimerF(gameTimer) {
		const interval = setInterval(() => {
			this.turnTime = this.turnTime - 1;
			this.turnTimeToTime();
			if(this.turnTime === 0) {
				clearInterval(gameTimer);
				clearInterval(interval);
				if(this.cards.length > 0){
					console.log("It's time to the next player's turn!");
				}else{
					console.log("All cards are removed from the table!");
					this.end();
				}
				this.turnTime = 11; // for more fluent time display and 10 seconds turn value show
				this.gameTime = this.gameTime + 1; // compesation for 10 seconds turn value show
				if(this.gameTime > 1){
					setTimeout(() => {
						let isSkipped = true;
						while(isSkipped){
							isSkipped = this.playerTurn();
						}
						const newGameTimer = this.gameTimerF();
						this.turnTimerF(newGameTimer);
					}, 3000);
				}
			}
		}, 1000);
	}

	gameTimeToTime() {
		const minutes = this.timeFormat(Math.floor(this.gameTime / 60));
		const seconds = this.timeFormat(this.gameTime % 60);
		this.gameTimeFormatted = `${minutes}:${seconds}`;
		console.log(this.gameTimeFormatted);
	}

	turnTimeToTime() {
		if(this.turnTime > 0){
			this.turnTimeFormatted = `turn time: ${this.timeFormat(this.turnTime)}`;
		}else{
			this.turnTimeFormatted = `turn time: ${this.timeFormat(this.turnTime)} - ENDED`;
		}
		console.log(this.turnTimeFormatted);
	}

	timeFormat(value) {
		return value.toString().padStart(2, '0');		
	}

	playerTurn() {
		// last turn hold card managment for last player
		this.holdFunc();
		// turn managment
		this.turns++;
		Card.addGameTurn(this.turns);
		Card.revealClick = false;
		// save the player on turn
		const player = this.players.shift();
		// reset all players onTurn property to false
		this.players.forEach(p => p.onTurn = false);
		// set current player onTurn property to true
		player.onTurn = true;
		// set player on turn to static property of Player class for easier access
		Player.setPlayerOnTurn(player);
		// push the queued player back to the end
		this.players.push(player);
		console.log(player);

		// actual skip managment
		if(player.actualSkip === true){
			player.actualSkip = false;
			alert(`${player.name}'s turn will be skipped!`);
			return true;
		}else{
			alert(`Next turn: ${player.name}`);
			return false;
		}
	}

	end() {
		console.log("game ended");
		console.log(`Winner is ${this.findWinner()}`);
	}

	findWinner() {
		const sorted = this.players.sort(
			(a, b) => (a.skip - b.skip) || (b.points - a.points)
		);
		return sorted[0].name;
	}
							
	holdFunc(){
		if(this.turns > 0){
			if(Player.playerOnTurn.counter === 1 || Player.playerOnTurn.counter === 0){
				const toHoldCard = this.cards.find((card) => {
					return card.face === true && card.playerID === Player.playerOnTurn.id;
				});
				if(toHoldCard !== undefined){
					toHoldCard.holdFlag = true;
					console.log(`${Player.playerOnTurn.name}'s card ${toHoldCard.theme.icon} is holded for next turn!`);
				}
			}else if(Player.playerOnTurn.counter === 2){
				this.autoHideCards(Player.playerOnTurn.id);
			}
		}
	}

	autoHideCards(pID) {
		this.cards.forEach((card) => {
			if(card.face === true && card.playerID === pID){
				card.face = false;
				card.playerID = '';
				card.holdFlag = false; // always during hiding card for sure
			}
		});
	}
						

}