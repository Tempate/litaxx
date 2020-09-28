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

const player_color = document.querySelector('#player-color')
const spectator_count = document.querySelector('#spectator-count')
const turn_indicator = document.querySelector('#turn')
const gameIdDisplay = document.querySelector('#game-id-display')

socket.on('game_code', code => {
    gameIdDisplay.innerHTML = code
    game_code = code

    player_color.innerHTML = ""
    spectator_count.innerHTML = ""
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
    player_color.innerHTML = "You are playing " + color
})

socket.on('spectators', count => {
    spectator_count.innerHTML = count + ((count == 1) ? " spectator" : " spectators")
})

socket.on('played_move', move => {
    const parts = move.split("_")
    const from = parseInt(parts[0])
    const to = parseInt(parts[1])
    
    animateMove(from, to)
})

socket.on('turn', t => {
    turn = t

    if (turn === color)
        turn_indicator.innerHTML = "It's your turn to move"
    else
        turn_indicator.innerHTML = "It's " + turn + " turn to move"
})