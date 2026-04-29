import { Game } from "./src/game.js";

const game = await Game.init();

game.prepare();
game.gameButtonsService();
game.cardsService();
game.mountGame();
game.start();

console.log(game);
