export class Player {

	constructor(name) {
		this.name = name;
		this.skip = 0;
		this.points = 0;
		this.playerID = this.generatePlayerID();
	}

	generatePlayerID(length = 8){
		
		const time = new Date().toLocaleTimeString('cs-CZ', {
			hour: '2-digit',
			minute: '2-digit',
			second: '2-digit'
		}).replace(/\:/g, "s");
		const date = new Date().toLocaleDateString('cs-CZ', {
			day: '2-digit',
			month: '2-digit',
			year: 'numeric'
		}).replace(/\s/g, "").replace(/\./g, "s");
		const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';	
		let result = '';
		for (let i = 0; i < length; i++) {
			result += chars.charAt(Math.floor(Math.random() * chars.length));
		}

		return  date + "s" + time + "s" + result;
	}

	addSkip() {
		this.skip++;
	}

	addPoints() {
		this.points++;
	}
}