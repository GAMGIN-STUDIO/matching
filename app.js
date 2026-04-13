import { Game } from "./src/game.js";

const game = await Game.init();

game.prepare();
game.cardsService();
game.gameButtonsService();
game.start();

console.log(game);
