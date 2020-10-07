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

const socket = io()

const gameId = getUrlParameter('gameId');

let boardHistory = [], moveHistory = [];
let indexHistory;

function getUrlParameter(parameter) {
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

socket.emit('join_game', gameId);

let labels = {
    "color":      document.querySelector("#color"),
    "turn":       document.querySelector("#turn"),
    "result":     document.querySelector("#result"),
    "spectators": document.querySelector("#spectators")
};

let buttons = {
    "resign": document.querySelector("#resign"),
    "draw":   document.querySelector("#draw")
}

socket.on('game_code', code => {
    game_code = code

    labels["color"].innerHTML = ""
    labels["spectators"].innerHTML = ""
})

socket.on('room_doesnt_exist', _ => {
    gameId.value = ""
    gameId.placeholder = "Room doesn\'t exist"
})

socket.on('fen', fen => {
    boardHistory.push(fen);

    if (boardHistory.length == 1 || indexHistory < boardHistory.length - 2) {
        fenToHtmlBoard(fen);
    }

    indexHistory = boardHistory.length - 1;
    updateCounters();
})

socket.on('color', c => {
    color = c;
    labels["color"].innerHTML = "You are playing " + color;

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
            labels["spectators"].innerHTML = count + " spectators";
            break;
    }
})

socket.on('played_move', move => {
    const parts = move.split("_")
    const from = parseInt(parts[0])
    const to = parseInt(parts[1])

    animateMove(from, to);

    if (moveHistory.length > 0) {
        const previousMove = moveHistory[moveHistory.length - 1];
        unmarkSquare(previousMove[0]);

        if (previousMove.length == 2) {     
            unmarkSquare(previousMove[1]);   
        }
    }

    switch (distance(from, to)) {
        case 1:
            moveHistory.push([to]);
            markSquare(to);
            break;
        case 2:
            moveHistory.push([from, to]);
            markSquare(from);
            markSquare(to);
    }

    buttons["draw"].innerHTML = "Offer a draw";
})

socket.on('turn', t => {
    turn = t

    if (turn === color) {
        labels["turn"].innerHTML = "It's your turn to move"
    } else {
        labels["turn"].innerHTML = "It's " + turn + "\'s turn to move"
    }
})

let drawButton = document.querySelector("#draw-button");

socket.on('draw_offer', _ => {
    buttons["draw"].innerHTML = "Accept draw";
})

socket.on('game_end', result => {
    labels["color"].innerHTML = ""
    labels["turn"].innerHTML = ""

    if (result == "draw") {
        labels["result"].innerHTML = "The game was a draw"
    } else {
        labels["result"].innerHTML = result + " has won the game"
    }
})
