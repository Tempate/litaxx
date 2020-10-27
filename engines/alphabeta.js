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

//This file implements a simplified alpha-beta algorithm

const Types = require("../jsataxx/types");
const Board = require("../jsataxx/board")

const filename = "alphabeta.js"

const minsInf = -10000;
const lost = -1000;

function search(board, depth) {
    const moves = board.legalMoves();

    let bestMove = moves[0];
    let bestScore = minsInf;

    let alpha = minsInf;

    let nb = new Board.Board();
    moves.forEach(move => {
        Board.copy(nb, board);
        nb.make(move);
        let score = -ab(nb, depth-1, minsInf, -alpha);

        if (score > bestScore) {
            bestMove = move;
            bestScore = score;
            if (score > alpha) {
                alpha = score;
            }
        }
    });

    return bestMove;
}

function ab(board, depth, alpha, beta) {
    if (depth <= 0) {
        return eval(board);
    }

    const moves = board.legalMoves();

    //If we have no remeaning moves, the game has finished,
    //either we have no pieces, there are no more blanks to move to
    //or we cant jump to any place, either way, return the result
    if (moves.length === 0) {
        return -finalEval(board, depth);
    }

    let best = minsInf;

    let nb = new Board.Board();

    for (var i = 0; i < moves.length; i++) {
        Board.copy(nb, board);

        nb.make(moves[i]);

        let val = -ab(nb, depth-1, -beta, -alpha);

        if (val > best) {
            best = val;
            if (val > alpha) {
                alpha = val;
                if (val >= beta) {
                    break;
                }
            }
        }
    }

    return best;
}

//Once there are no moves, evaluate the board
//TODO: Currently blind to long draws, that is
// if player A has more pieces but cant move, and player B has a loop,
// it will assume player A has won, but player B can achieve a draw
// can be solved with a min() somewhere
function finalEval(board, depth) {
    let stoneCount = countPieces(board);
    let diff = stoneCount[0] - stoneCount[1];
    let blanksMatter = 0, res;

    if (stoneCount[0]*stoneCount[1] > 0) {
        blanksMatter = 1;
    }

    if (stoneCount[0] > stoneCount[1]) {
        res = -lost;
    } else {
        res = lost;
    }

    if (board.turn == Types.Player.White) {
        return res - blanksMatter*stoneCount[2];
    } else {
        return -res + blanksMatter*stoneCount[2];
    }
}

//Extremely simple evaluation function
function eval(board) {
    let stoneCount = countPieces(board);
    let diff = stoneCount[0] - stoneCount[1];

    if (board.turn == Types.Player.White) {
        return diff;
    } else {
        return -diff;
    }
}

function countPieces(board) {
    let white = 0, black = 0, blanks = 0;

    board.stones.forEach(stone => {
        if (stone == Types.StoneType.White){
            white++;
        } else if (stone == Types.StoneType.Black) {
            black++;
        } else if (stone == Types.StoneType.Blank) {
            blanks++;
        }
    });

    return [white, black, blanks];
}

module.exports = {search, testPositions};

function testPositions() {
    const positions = [
        "ooooooo/ooooooo/ooooooo/ooooo1o/xxxxxxx/xxxxxxx/xxxxxx1 o",
        "7/7/7/3o3/7/7/x6 o 0",
        "7/7/7/3o3/7/7/x6 x 0"
    ];

    const moves = [
        "f4",
        "d4b2",
        "a1c3"
    ];

    console.assert(positions.length === moves.length);

    let b = new Board.Board();
    for (var i = 0; i < positions.length; i++) {
        b.fromFen(positions[i]);
        let best = search(b, 3);
        console.assert(best.toString() == moves[i]);
    }

    console.log(filename + ": Test run successfully")
}

testPositions()