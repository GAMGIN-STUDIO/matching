import { Game } from "./src/game.js";

const game = await Game.init();

game.prepare();
game.cardsService();
game.start();

console.log(game);
