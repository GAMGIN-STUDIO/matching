import { Game } from "./src/game.js";

const admin = true; // for better game development
const game = await Game.init(admin);

game.prepare();
game.gameButtonsService();
game.cardsService();
game.mountGame();
game.start();

console.log(game);
