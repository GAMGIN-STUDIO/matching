import { Game } from "./src/game.js";

const game = await Game.init();

game.prepare();
game.cardsService();
game.gameButtonsService();
game.mountGame();
// game.start();

console.log(game);
