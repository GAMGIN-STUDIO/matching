import { Card } from "./card.js";
import { Player } from "./player.js";

export class Game {

	constructor(dataThemes) {
		// admin and other managment
		this.admin = true;
		this.access = false;

		// game init managament
		this.themes = dataThemes.themes; 

		// game managment
		this.players = []; 
		this.cards = [];

		// game time managment
		this.gameTime = 3601; // hour in seconds + 1 second for more fluent time display
		this.turnTime = 11; // + 1 second for more fluent time display and 10 seonds turn value show
		this.gameTimeFormatted = "";
		this.turnTimeFormatted = "";

		// responsive managment
		this.windowWidth = window.innerWidth;
 
	}

	// admin and other managment

	accessInit() {
		this.access = this.admin ? false : confirm('Do you want to play with accessibility features enabled?');
	}

	// game init managment

	static async init(access) {
		const res = await fetch("./src/cards/themes.json");
		const json = await res.json();
		return new Game(json, access);
	}

	// GAME MANAGMENT

	// init part and help functions

	playersInit() {
		let numPlayers = null;
		while(numPlayers > 3 || numPlayers < 2 || numPlayers === null) {
			numPlayers = this.admin ? "3" : prompt("Enter the number of players (2-3):");
		}
		for (let i = 0; i < numPlayers; i++) {
			const playerName = this.admin ? `Player ${i+1}` : prompt(`Enter the name of player ${i+1}:`)
			const player = new Player(playerName);
			this.players.push(player);
		}
		this.players = this.shuffle(this.players);
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
				this.cards.push(new Card(theme, this.windowWidth, this.access));
			}
		}catch(error){
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
		this.accessInit();
		this.cardsInit();
	}

	// game cards service

	createTableTag() {
		const tableTag = document.createElement('div');
		tableTag.classList.add('js-table');
		this.tableTag = tableTag;
	}

	cardsService() {
		this.createTableTag();
		for(const card of this.cards) {
			card.createCardTag();
			card.initListener();
			this.tableTag.appendChild(card.tag);
		}
	}

	// game start/end managment

	start() {
		this.gameTimerF();
		this.turnTimerF();
		console.log("game started");
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
	}

	turnTimerF() {
		const interval = setInterval(() => {
			this.turnTime = this.turnTime - 1;
			this.turnTimeToTime();
			if(this.turnTime === 0) {
				clearInterval(interval);
				this.turnTime = 11; // for more fluent time display and 10 seconds turn value show
				this.gameTime = this.gameTime + 1; // compesation for 10 seconds turn value show
				if(this.gameTime > 1){
					this.turnTimerF();
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

	end() {
		console.log("game ended");
	}

}