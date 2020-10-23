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

const { MoveType } = require("../jsataxx/types");

function search(board) {
    const moves = board.legalMoves();

    let bestMoves = [];
    let mostCaptures = -1;

    moves.forEach(move => {
        let captures = board.countCaptures(move);

        if (move.type == MoveType.Single) {
            captures++;
        }
        
        if (captures > mostCaptures) {
            mostCaptures = captures;
            bestMoves = [move];
        } else if (captures == mostCaptures) {
            bestMoves.push(move);
        }
    });

    const randomIndex = Math.floor(Math.random() * bestMoves.length);

    return bestMoves[randomIndex];
}

module.exports = {search};