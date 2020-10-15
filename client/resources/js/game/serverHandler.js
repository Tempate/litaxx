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

const Move = require("../../../../jsataxx/move");
const Types = require("../../../../jsataxx/types");

const BoardHandler = require("./boardHandler");

let board = BoardHandler.createHtmlBoard();

const gameId = getParameterFromUrl('gameId');
const socket = io();

socket.emit('join_game', gameId);

let boardHistory = [], moveHistory = [];
let indexHistory = 0;

// HTML elements
let labels = {
    "color":      document.querySelector("#color"),
    "result":     document.querySelector("#result"),
    "spectators": document.querySelector("#spectators")
};

let buttons = {
    "resign": document.querySelector("#resign"),
    "draw":   document.querySelector("#draw")
}

let counters = {
    "white": document.querySelector("#numeric-white-stone-counter"),
    "black": document.querySelector("#numeric-black-stone-counter")
}

socket.on('board_history', boardHistoryString => {
    let boards = boardHistoryString.split(" & ");

    boards.forEach(board => {
        boardHistory.push(board);
    });
});

socket.on('move_history', moveHistoryString => {
    let moves = moveHistoryString.split(" ");

    moves.forEach(moveString => {
        moveHistory.push(Move.createMoveFromString(moveString));
    });
});

socket.on('fen', fen => {
    boardHistory.push(fen);

    // Use the fen to set the board when it's the initial position and
    // when the user was looking at a previous position when the move
    // was played
    if (boardHistory.length == 1 || indexHistory < boardHistory.length - 2) {
        board.fromFen(fen);
    }

    indexHistory = boardHistory.length - 1;
});

socket.on('color', color => {
    // If the color is set, the user is a player 
    // Otherwise, he's an spectator
    board.color = color;

    labels["color"].innerHTML = "You are playing " + color;

    // Only show resign and draw buttons when the user is a player
    buttons["resign"].classList.remove("d-none");
    buttons["draw"].classList.remove("d-none");
})

socket.on('spectators', count => {
    switch (count) {
        case 0:
            labels["spectators"].innerHTML = "";
            break;
        case 1:
            labels["spectators"].innerHTML = "1 spectator";
            break;
        default:
            console.assert(count >= 2);
            labels["spectators"].innerHTML = count + " spectators";
            break;
    }
})

socket.on('played_move', moveString => {
    let move = Move.createMoveFromString(moveString);

    board.make(move);

    if (moveHistory.length > 0) {
        board.highlight(moveHistory.slice(-1), true);
    }

    board.highlight(move, false);
    moveHistory.push(move);

    buttons["draw"].innerHTML = "Offer a draw";
})

socket.on('turn', turn => {
    const TURN_MARKER_CLASS = "numeric-counter-turn-marker";
    const opponent = (turn === "black") ? "white" : "black";

    if (!counters[turn].classList.contains(TURN_MARKER_CLASS)) {
        counters[turn].classList.add(TURN_MARKER_CLASS);
    }

    if (counters[opponent].classList.contains(TURN_MARKER_CLASS)) {
        counters[opponent].classList.remove(TURN_MARKER_CLASS);
    }
})

socket.on('draw_offer', _ => {
    buttons["draw"].innerHTML = "Accept draw";
})

socket.on('game_end', result => {
    labels["color"].innerHTML = ""

    if (result == "draw") {
        labels["result"].innerHTML = "The game was a draw"
    } else {
        labels["result"].innerHTML = result + " has won the game"
    }
})

function getParameterFromUrl(parameter) {
    let pageUrl = window.location.search.substring(1);
    let urlVariables = pageUrl.split('&');

    for (let i = 0; i < urlVariables.length; i++) {
        let parameterName = urlVariables[i].split('=');

        if (parameterName[0] == parameter) {
            return parameterName[1];
        }
    }

    return null;
}

function sendMove(move) {
    moveHistory.push(move);
    socket.emit("played_move", move.toString());
}

function previousMove() {
    if (indexHistory <= 0) {
        return;
    }

    indexHistory--;
    board.fromFen(boardHistory[indexHistory]);

    board.highlight(moveHistory[indexHistory], true);

    if (indexHistory >= 1) {
        board.highlight(moveHistory[indexHistory - 1], false);
    }
}

function nextMove() {
    if (indexHistory >= boardHistory.length - 1) {
        return;
    }

    indexHistory++;
    board.fromFen(boardHistory[indexHistory]);

    if (indexHistory >= 2) {
        board.highlight(moveHistory[indexHistory - 2], true);
    }

    if (indexHistory >= 1) {
        board.highlight(moveHistory[indexHistory - 1], false);
    }
}

module.exports = {board, sendMove, previousMove, nextMove};