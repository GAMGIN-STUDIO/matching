import { Card } from "./card.js";
import { Player } from "./player.js";

export class Game {

	constructor(dataThemes, admin = false) {

		// media queries managment
		this.isTouchOnly =
			window.matchMedia("(pointer: coarse)").matches &&
			!window.matchMedia("(hover: hover)").matches;

		// admin and other managment
		this.admin = admin;
		let gameTime = null;
		let originTurnTime = null;
		if(!this.admin){
			gameTime = Number(prompt('Enter game time in minutes (1-60):'));
			originTurnTime = Number(prompt('Enter turn time in seconds (5-10):'));
			if(					
					(gameTime === null || originTurnTime === null)||
					(Number.isNaN(gameTime) || Number.isNaN(originTurnTime)) ||
					(gameTime < 1 || gameTime > 60) ||
					(originTurnTime < 5 || originTurnTime > 10) ||
					(!Number.isInteger(gameTime) || !Number.isInteger(originTurnTime))
				){
					gameTime = 20; // default game time in minutes
					originTurnTime = 10; // default turn time in seconds
				};
		}else{
			gameTime = 20; // admin game time in minutes
			originTurnTime = 10; // admin turn time in seconds
		}

		// game init managament
		this.themes = dataThemes.themes; 

		// core game managment
		this.players = [];
		this.cards = [];
		this.gridIndex = null; // cols and rows of the table, it will be square

		// mount managment
		this.mountObject = {
			mountPoint: false,
			tableTag: false,
			controlPanelTag: false
		};

		// game time managment
		this.gameTime = (gameTime * 60) + 1; // 20 minutes in seconds + 1 second for more fluent time display
		this.originTurnTime = originTurnTime + 1; // + 1 second for more fluent time display and 10 seonds turn value show
		this.turnTime = this.originTurnTime; 
		this.gameTimeFormatted = "";
		this.turnTimeFormatted = "";    
		this.turns = this.admin ? 10 : 0;

		// game massage tag
		this.gameMessageTag = document.getElementById('game-message');

		// time tags object
		this.timeTagsObject = {
			gameTimeTag: this.getTimeTag('game'),
			turnTimeTag: this.getTimeTag('turn'),
		}
 
		// responsive managment
		this.sizeObject = {
			cardsGap: null, // pixels
			tablePadding: 12, // pixels
			width: window.innerWidth,
			height: window.innerHeight
		};

		// size comfort managment
		this.sizeComfort = {
			border: 400,
			good: 600, 
			comfort: 800
		}

		// header height size
		this.headerHeight = {
			value: 45
		}
		this.headerHeight.style = `${this.headerHeight.value}px`;
		document.querySelector('h1').style.height = this.headerHeight.style;
		document.querySelector('h1').style.lineHeight = this.headerHeight.style;

		// footer - score tag parameters
		this.scoreTagStyles = {
			gap: 40,
			paddingX: 30,
			paddingY: 15
		}

		// control panel height size in column direction
		this.ctrlPanelHeight = {
			value: 55
		}
		this.ctrlPanelHeight.style = `${this.ctrlPanelHeight.value}px`;

		// error managment
		this.isError = false;
 
	}

	// game init managment

	static async init(admin) {
		const res = await fetch("./src/cards/themes.json");
		const json = await res.json();
		return new Game(json, admin);
	}

	// GAME MANAGMENT

	// init part and help functions

	playersInit() {
		try{
			let numPlayers = null;
			while(
					numPlayers === null ||
					Number.isNaN(numPlayers) ||
					numPlayers < 2 ||
					numPlayers > 3 ||
					!Number.isInteger(numPlayers)
			) {
				numPlayers = this.admin ? 2 : Number(prompt("Enter the number of players (2-3):"));
			}
			for (let i = 0; i < numPlayers; i++) {
				const playerName = this.admin ? `Player ${i+1}` : prompt(`Enter the name of player ${i+1}:`)
				const player = new Player(playerName, i+1);
				this.players.push(player);
			}
			this.players = this.shuffle(this.players);
			Card.getReferenceToPlayers(this.players);
			Player.getReferenceToPlayers(this.players);	
		}catch(error){
			this.isError = true;
			console.log(error);
		}
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
			const lowerSize = Math.min(this.sizeObject.width, this.sizeObject.height);
			// amount of cards preparing part
			while(
				this.gridIndex === null || this.sizeControl(lowerSize)
			) {
				this.askForSize(lowerSize)				
			}
			// right value convert to real number
			this.gridIndex = Number(this.gridIndex); // gridI * gridI will be whole table of cards
			// clean themes func and control enough amount themes for game
			const cutIndex = (this.gridIndex * this.gridIndex) / 2; // exact half of choosed cards amount are themes source mimimally needed
			const cleanThemes = this.cleanArray(this.themes); // whole source of themes (not only half of choosed table grid)
			if (cleanThemes.length < cutIndex) {
			throw new Error("Not enough themes for selected grid size");
			}
			// controled grid index use for cards gap computing
			this.sizeObject.cardsGap = 10 + (this.gridIndex - 10);
			// cards themes preparing part
			const preShuffleThemes = this.shuffle(cleanThemes); // each pre selection need to be different
			const preFinishedCardsArray = []; // just need to be filled doubled
			for(let i = 0; i < cutIndex; i++){
				preFinishedCardsArray.push(preShuffleThemes[i]);
			}
			const cardThemes = this.shuffle(this.doubleArray(preFinishedCardsArray)); // after double func it need shuffle again
			let oddFlag = 0; // for black&grey color pattern
			let odd = true; // for black&grey color pattern
			// use cardThemes array (right length, cleaned & contains only pairs) for creating deck of cards
			for (let i = 0; i < cardThemes.length; i++) {
				this.cards.push(new Card(cardThemes[i], odd, this.admin, this.gameMessageTag));
				// part for black&grey color pattern
				oddFlag++;
				if(oddFlag === this.gridIndex){
					oddFlag = 0;
					odd = !odd;
				}
			}
			Card.getReferenceToCards(this.cards);
			
		}catch(error){
			this.isError = true;
			console.log(error);
		}
	}

	sizeControl(lowerSize){
		if(lowerSize >= this.sizeComfort.comfort){
			return this.gridIndex !== "4" && this.gridIndex !== "6" && this.gridIndex !== "8" && this.gridIndex !== "10";
		}else if(lowerSize >= this.sizeComfort.good){
			return this.gridIndex !== "4" && this.gridIndex !== "6" && this.gridIndex !== "8";
		}else if(lowerSize >= this.sizeComfort.border){
			return this.gridIndex !== "4" && this.gridIndex !== "6";
		}else{
			return this.gridIndex !== "4";
		}
	}

	askForSize(lowerSize){
		if(lowerSize >= this.sizeComfort.comfort){
			this.gridIndex = this.admin ? "10" : prompt("Amount of cards - 4 (4x4), 6 (6x6), 8 (8x8), 10 (10x10) :");
		}else if(lowerSize >= this.sizeComfort.good){
			this.gridIndex = this.admin ? "8" : prompt("Amount of cards - 4 (4x4), 6 (6x6), 8 (8x8) :");
		}else if(lowerSize >= this.sizeComfort.border){
			this.gridIndex = this.admin ? "6" : prompt("Amount of cards - 4 (4x4), 6 (6x6) :");
		}else{
			this.gridIndex = this.admin ? "4" : prompt("Amount of cards - you can choose only 4 (4x4), write 4 :");
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
		tableTag.classList.add('js-table');
		this.tableTag = tableTag;
	}

	makeGameSizes(resize = false) {
/* 		if(resize){
			this.sizeObject = {
				cardsGap: 10, // pixels
				tablePadding: 10, // pixels
				tableGridIndex: 10, // cols and rows of the table, it will be square,, NOW IT IS NOT EXISTS
				width: window.innerWidth,
				height: window.innerHeight
			};
		} */

		// table size managment
		let saveSize = Math.min(this.sizeObject.width, this.sizeObject.height) - (2 * this.sizeObject.tablePadding); // savesize for cards, has to be lower about 2 paddings of the table
		const scoreTag = document.querySelector('footer.score');
		scoreTag.style.justifyContent = 'space-between';
		scoreTag.style.padding = `${this.scoreTagStyles.paddingY}px ${this.scoreTagStyles.paddingX}px`;
		if(saveSize >= this.sizeComfort.comfort) {
			saveSize = saveSize - 150; // 150 = just for game buttons (flex direction row)
			document.querySelector('main').style.flexDirection = 'row';
			document.querySelector('main').style.justifyContent = 'center';
			document.querySelector('body').classList.add('desktop'); // main is row but control panel is column
		}else{
			saveSize = saveSize - (this.ctrlPanelHeight.value + this.headerHeight.value); // 100 = for game buttons 40px + cca 60px header with score (flex direciton column)
			this.controlPanelTag.style.height = this.ctrlPanelHeight.style;
			document.querySelector('main').style.flexDirection = 'column';
			document.querySelector('main').style.alignItems = 'center';
			document.querySelector('body').classList.add('mobile'); // main is column but control panel is row
			if(this.sizeObject.width < (500 + (2 * this.scoreTagStyles.paddingX))){ // 500 = cca 380 (player + queue) + cca 120 (time) + some tolerance
				scoreTag.style.flexDirection = 'column';
				scoreTag.style.alignItems = 'center';
				scoreTag.style.justifyContent = 'flex-start';
				scoreTag.style.gap = `${this.scoreTagStyles.gap}px 0px`; // // dynamic gap for rows, but no gap between columns - we are in column direction

			}
		}
		this.tableTag.style.width = `${saveSize}px`;
		this.tableTag.style.height = `${saveSize}px`;
		this.tableTag.style.gap = `${this.sizeObject.cardsGap}px`;
		this.tableTag.style.padding = `${this.sizeObject.tablePadding}px`;
		this.tableTag.style.gridTemplateColumns = `repeat(${this.gridIndex}, 1fr)`;

		// card size managment
		const rawCardSize = Math.round(saveSize / this.gridIndex);
		const cardSize  = rawCardSize - (this.sizeObject.cardsGap);
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
		reskipTag.classList.add('reskip');
		reskipTag.style.cursor = 'pointer';
		this.reskipTag = reskipTag;
	}

	createRevealTag() {
		const revealTag = document.createElement('div');
		revealTag.innerText = "Reveal";
		revealTag.classList.add('reveal');
		revealTag.style.cursor = 'pointer';
		this.revealTag = revealTag;
	}

	initReskipListener() {
		if(this.reskipTag instanceof HTMLElement) {
			this.reskipTag.addEventListener('click', () => {
				// reskip managment
				const player = Player.playerOnTurn;
				if(player.skip > 0 && player.points >= 3) {
					player.skip--;
					Player.skipMethod();
					player.points -= 3;
					Player.pointsMethod();
					this.gameMessageTag.innerText = 'You used reskip button! You lose 3 points but also 1 skip for reward!';
				}else if(player.skip == 0){
					this.gameMessageTag.innerText = "You have no skips, so you can't substract none of it!";
				}else if(player.points < 3){
					this.gameMessageTag.innerText = "You don't have enough points for reskip operation!";
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
				Card.revealMethod();
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

	// players queue service

	createEachPlayerOfQueue() {
		const playersQueueTags = [];
		for(let i = 0; i < this.players.length - 1; i++) {
			const className = (i === 0) ? 'player-II' : 'player-III';
			const playerOfQueueTag = document.createElement('span');
			playerOfQueueTag.classList.add(`${className}`);
			playerOfQueueTag.id = '';
			if(playerOfQueueTag instanceof HTMLElement){
				playersQueueTags.push(playerOfQueueTag);
			}else{
				throw new Error(`PLAYER OF QUEUE TAG NOT CORRECT - ${i+1}. player of queue tag is not correctly created `);
			}
		}
		this.playersQueueTags = playersQueueTags;
	}

	playersQueueServicePlusMount() {
		if(!this.isError) {
			try{
				this.createEachPlayerOfQueue();
				this.playersQueueParentTag = document.querySelector('.players-queue');
				if(this.playersQueueParentTag instanceof HTMLElement) {
					for (const playerOfQueueTag of this.playersQueueTags) {
						if(playerOfQueueTag instanceof HTMLElement) {
							this.playersQueueParentTag.appendChild(playerOfQueueTag);
						}else{
							throw new Error('PLAYER OF QUEUE TAG NOT CORRECT - Cannot launch players queue service');
						}
					}
				}else{
					throw new Error('PARENT QUEUE TAG NOT CORRECT - Cannot launch players queue service');
				}
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
			this.mountObject['mountPoint'] = true; // mountPoint is under double control (mountObject plus error branch)
		}else{
			throw new Error('MOUNT POINT NOT FOUND - Cannot find mount point in the DOM');
		}
	}

	mountTable() {
		try{
			this.mountPoint.appendChild(this.tableTag);
			this.mountObject['tableTag'] = true;
		}catch(error){
			this.isError = true;
			console.log(error);
		}
	}

	mountGameButtons() {
		try{
			this.mountPoint.prepend(this.controlPanelTag);
			this.mountObject['controlPanelTag'] = true;
		}catch(error){
			this.isError = true;
			console.log(error);
		}
	}

	mountGame() {
		if(!this.isError) {
			this.findMountPoint();
			this.mountTable();
			this.mountGameButtons();
			this.playersQueueServicePlusMount();
			this.tiltLaunch();
		}
	}

	allMounted() {
		for(const key in this.mountObject) {
			if(this.mountObject[key] === false) {
				throw new Error(`GAME NOT STARTED - Key component ${key} is not mounted`);
			}
		}
	}

	// game start/end managment

	start() {
		try{
			this.allMounted();
		}catch(error){
			this.isError = true;
			console.log(error);
		}
		if(!this.isError) {
			try{
				this.playerTurn();
				const gameTimer = this.gameTimerF();
				this.turnTimerF(gameTimer);
				this.gameMessageTag.innerText = 'Game started! Good luck!';
			}catch(error){
				this.isError = true;
				console.log(error);
			}
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
					this.gameMessageTag.innerText = "It's time to the next player's turn!";
					this.turnTime = this.originTurnTime; // for more fluent time display and 10 seconds turn value show
					this.gameTime = this.gameTime + 1; // compesation for 10 seconds turn value show
					if(this.gameTime > 1 && !this.isError){
						setTimeout(() => {
							let isSkipped = true;
							while(isSkipped){
								try{
									isSkipped = this.playerTurn();
								}catch(error){
									this.isError = true;
									console.log(error);
									break; // IMPORTANT - if error during while cycle, it would kill browser without break
								}
							}
							const newGameTimer = this.gameTimerF();
							this.turnTimerF(newGameTimer);
						}, 3000);
					}
				}else{
					this.gameMessageTag.innerText = "All cards are removed from the table!";
					this.end();
				}
			}
		}, 1000);
	}

	gameTimeToTime() {
		const minutes = this.timeFormat(Math.floor(this.gameTime / 60));
		const seconds = this.timeFormat(this.gameTime % 60);
		this.gameTimeFormatted = `${minutes}:${seconds}`;
		this.timeTagsObject.gameTimeTag.innerText = `${this.gameTimeFormatted}`;
	}

	turnTimeToTime() {
		if(this.turnTime > 0){
			this.turnTimeFormatted = `${this.timeFormat(this.turnTime)}`;
		}else{
			this.turnTimeFormatted = `${this.timeFormat(this.turnTime)}`;
		}
		this.timeTagsObject.turnTimeTag.innerText = `${this.turnTimeFormatted}`;
	}

	timeFormat(value) {
		return value.toString().padStart(2, '0');		
	}


	getTimeTag(name) {
		if(name === 'game'){
			return document.getElementById('game-time');
		}else if(name === 'turn') {
			return document.getElementById('turn-time');
		}else {
			const errorTag =  document.createElement('span');
			console.log('ERROR - WRONG TIME TAG NAME');
			return errorTag;
		} 
	}

	playerTurn() {
		// last turn hold card managment for last player
		this.holdFunc();
		// turn managment
		this.turns++;
		Card.addGameTurn(this.turns);
		Card.revealObject.click = false;
		Card.revealObject.stop = false;
		// save the player on turn
		const player = this.players.shift();
		// reset all players onTurn property to false
		this.players.forEach(p => p.onTurn = false);
		// set current player onTurn property to true
		player.onTurn = true;
		// set player on turn to static property of Player class for easier access
		Player.setPlayerOnTurn(player, this.playersQueueTags); // at this moment the players array length is equal to number of players in queue
		// push the queued player back to the end
		this.players.push(player);
		// console.log(player);

		// actual skip managment
		if(player.actualSkip === true){
			player.actualSkip = false;
			this.gameMessageTag.innerText = `${player.name}'s turn is skipped!`;
			return true;
		}else{
			this.gameMessageTag.innerText = `You can play`;
			return false;
		}
	}

	end() {
		this.gameMessageTag.innerText = this.findWinner();
	}

	findWinner() {
		const sorted = this.players.sort(
			(a, b) => (a.skip - b.skip) || (b.points - a.points)
		);
		if(sorted[0].skip === sorted[1].skip && sorted[0].points === sorted[1].points){
			return "GAME ENDED - It's a DRAW!";
		}else{
			return `GAME ENDED - Winner is ${sorted[0].name}!`;
		}
	}
							
	holdFunc(){
		if(this.turns > (this.admin ? 10 : 0)){
			if((Player.playerOnTurn.counter === 1 || Player.playerOnTurn.counter === 0) && Player.playerOnTurn.stopTurn === false){
				const toHoldCard = this.cards.find((card) => {
					return card.face === true && card.playerID === Player.playerOnTurn.id;
				});
				if(toHoldCard !== undefined){
					toHoldCard.holdFlag = true;
					this.gameMessageTag.innerText = `${Player.playerOnTurn.name}'s card ${toHoldCard.theme.icon} is holded for next turn!`;
				}
				if(Card.generalRevealFlag === true){
					Card.autoHideCards();
				}
			}else if(Player.playerOnTurn.counter === 2 || (Player.playerOnTurn.counter === 1 && Player.playerOnTurn.stopTurn === true)){
				Card.autoHideCards(Player.playerOnTurn.id);
			}
		}
	}

	// TILT MANAGMENT

	tiltLaunch() {
		if(this.isTouchOnly){
			console.log('Touch-only device was detected - TILT library is deactivated');
		}else{
			//It also supports NodeList
			VanillaTilt.init(document.querySelectorAll(".js-table"),
			{
				/* library don't support rewriting data atributes by js init method, js would be ignored */
				/* All options with defaults */
				reverse:                false,  // reverse the tilt direction
				max:                    2,     // max tilt rotation (degrees)
				startX:                 0,      // the starting tilt on the X axis, in degrees.
				startY:                 0,      // the starting tilt on the Y axis, in degrees.
				perspective:            1000,   // Transform perspective, the lower the more extreme the tilt gets.
				scale:                  1,      // 2 = 200%, 1.5 = 150%, etc..
				speed:                  10,    // Speed of the enter/exit transition
				transition:             true,   // Set a transition on enter/exit.
				axis:                   null,   // What axis should be enabled. Can be "x" or "y"
				reset:                  false,   // If the tilt effect has to be reset on exit.
				"reset-to-start":       false,   // Whether the exit reset will go to [0,0] (default) or [startX, startY]
				easing:                 "cubic-bezier(.03,.98,.52,.99)",    // Easing on enter/exit.
				glare:                  true,  // if it should have a "glare" effect
				"max-glare":            0.05,      // the maximum "glare" opacity (1 = 100%, 0.5 = 50%)
				"glare-prerender":      false,  // false = VanillaTilt creates the glare elements for you, otherwise
															// you need to add .js-tilt-glare>.js-tilt-glare-inner by yourself
				"mouse-event-element":  null,   // css-selector or link to HTML-element what will be listen mouse events
				gyroscope:              true,   // Boolean to enable/disable device orientation detection,
				gyroscopeMinAngleX:     -45,    // This is the bottom limit of the device angle on X axis, meaning that a device rotated at this angle would tilt the element as if the mouse was on the left border of the element;
				gyroscopeMaxAngleX:     45,     // This is the top limit of the device angle on X axis, meaning that a device rotated at this angle would tilt the element as if the mouse was on the right border of the element;
				gyroscopeMinAngleY:     -45,    // This is the bottom limit of the device angle on Y axis, meaning that a device rotated at this angle would tilt the element as if the mouse was on the top border of the element;
				gyroscopeMaxAngleY:     45,     // This is the top limit of the device angle on Y axis, meaning that a device rotated at this angle would tilt the element as if the mouse was on the bottom border of the element;
			});
			console.log('Touch-only device was NOT detected - TILT library is launched');
		}
	}
						

}