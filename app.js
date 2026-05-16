import { Game } from "./src/game.js";

const admin = false;
const easyStart = admin ? '1' : prompt('Do you want easy start without settings (2 players, max amount of cards - based on screen size, game time 20 min, turn time 10 sec, solid names) - enter: 1 for YES or 0 for NO');
const isEasyStart = easyStart === '1' ? true : false;
const game = await Game.init(isEasyStart);

game.prepare();
game.gameButtonsService();
game.cardsService();
game.mountGame();
game.start();

console.log(game);
