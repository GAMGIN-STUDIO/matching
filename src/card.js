import { Player } from "./player.js";

export class Card {
	constructor(theme, windowWidth, access) {
		this.back = "black";
		this.size = windowWidth / 10;
		this.border = false;

		this.face = false;
		this.theme = theme;
		this.access = access;

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

	initListener() {
		if(this.tag instanceof HTMLElement) {
			this.tag.addEventListener('click', () => {
				this.face = !this.face;
				this.playerID = Player.onTurnPlayerID;
			});
		}else{
			throw new Error('CARD TAG NOT INITIALIZED - Cannot init card listener');
		}
	}
}