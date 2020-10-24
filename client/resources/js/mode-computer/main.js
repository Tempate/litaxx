/*  This file is part of Litaxx.

    Litaxx is free software: you can redistribute it and/or modify
    it under the terms of the GNU General Public License as published by
    the Free Software Foundation, either version 3 of the License, or
    (at your option) any later version.

    Litaxx is distributed in the hope that it will be useful,
    but WITHOUT ANY WARRANTY; without even the implied warranty of
    MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE. See the
    GNU General Public License for more details.

    You should have received a copy of the GNU General Public License
    along with Litaxx. If not, see <https://www.gnu.org/licenses/>.
*/

const Board = require('../../../../jsataxx/board');
const Types = require('../../../../jsataxx/types');

const MostCaptures = require("../../../../engines/mostCaptures");

let game = require("../ataxx/game");

const HUMAN  = "black";
const ENGINE = "white";

game.setFen(Board.initialFen);
game.setColor(HUMAN);

window.addEventListener('click', function(e) {
    const move = game.click(e);

    if (move != undefined && game.board.board.turn === ENGINE) {
        playMostCapturingMove();
    }
});

function playMostCapturingMove() {
    const move = MostCaptures.search(game.board.board);

    setTimeout(() => {
        game.board.make(move);
        game.board.lowlight();
        game.board.highlight(move);

        if (game.board.board.turn === ENGINE) {
            playMostCapturingMove();
        }
    }, 500);
}