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

let game = require("../ataxx/game");

const socket = io();

socket.emit('join_game', (parameter => {
    let pageUrl = window.location.search.substring(1);
    let urlVariables = pageUrl.split('&');

    for (let i = 0; i < urlVariables.length; i++) {
        let parameterName = urlVariables[i].split('=');

        if (parameterName[0] == parameter) {
            return parameterName[1];
        }
    }

    return null;
})("gameId"));

socket.on('board_history', boardHistory => game.setBoardHistory(boardHistory));
socket.on('move_history', moveHistory => game.setMoveHistory(moveHistory));

socket.on('spectators', count => game.setSpectators(count));
socket.on('color', color => game.setColor(color));
socket.on('turn', turn => game.setTurn(turn));
socket.on('fen', fen => game.setFen(fen));

socket.on('move', move => game.makeMove(Move.createMoveFromString(move)));

socket.on('offer_draw', _ => game.setDrawOffer());
socket.on('end', result => game.end(result));


// Disconnect a user from the room when he unloads the page
window.addEventListener('beforeunload', _ => socket.emit('disconnect'));

// A stone or highlighted square got clicked
window.addEventListener('click', e => {
    const move = game.click(e);

    if (move != undefined) {
        socket.emit("move", move.toString());
    }
});


document.querySelector("#draw"  ).addEventListener('click', _ => socket.emit("offer_draw"));
document.querySelector("#resign").addEventListener('click', _ => socket.emit("resign"));