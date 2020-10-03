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

const playerColor = document.querySelector('#player-color')
const spectatorCount = document.querySelector('#spectator-count')
const turnIndicator = document.querySelector('#turn')
const winnerIndicator = document.querySelector('#winner')

socket.on('game_code', code => {
    game_code = code

    playerColor.innerHTML = ""
    spectatorCount.innerHTML = ""
})

socket.on('room_doesnt_exist', _ => {
    gameId.value = ""
    gameId.placeholder = "Room doesn\'t exist"
})

socket.on('fen', fen => {
    fenToHtmlBoard(fen)
    updateCounters()
})

socket.on('color', c => {
    color = c
    playerColor.innerHTML = "You are playing " + color
})

socket.on('spectators', count => {
    spectatorCount.innerHTML = count + ((count == 1) ? " spectator" : " spectators")
})

socket.on('played_move', move => {
    const parts = move.split("_")
    const from = parseInt(parts[0])
    const to = parseInt(parts[1])

    animateMove(from, to)
})

socket.on('turn', t => {
    turn = t

    if (turn === color) {
        turnIndicator.innerHTML = "It's your turn to move"
    } else {
        turnIndicator.innerHTML = "It's " + turn + "\'s turn to move"
    }
})

socket.on('game_end', winningSide => {
    playerColor.innerHTML = ""
    turnIndicator.innerHTML = ""

    winnerIndicator.innerHTML = winningSide + " has won the game"
})

window.addEventListener('beforeunload', function(e) {
    socket.emit('disconnect')
})
