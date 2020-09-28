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
socket.emit('new_game')

const newGame = document.querySelector('#create-a-game')

newGame.addEventListener('click', _ => {
    socket.emit('new_game')
})

const joinGame = document.querySelector('#join-a-game')
const gameId = document.querySelector('#game-id')

gameId.maxLength = 4

function checkGameCode(typedGameCode) {
    let _gameCode = typedGameCode.trim()

    if (_gameCode.length != 4) {
        return false
    }

    _gameCode = _gameCode.toUpperCase()
    
    const isValid = /^[A-Z]{4}$/.test(_gameCode)

    if (!isValid) {
        return false
    }

    return _gameCode
}

function onCodeEntered() {
    const _gameCode = checkGameCode(gameId.value)

    if (_gameCode) {
        socket.emit('join_game', _gameCode)
    } else {
        gameId.value = ""
        gameId.placeholder = "Game code must be 4 letters"
    }
}

gameId.addEventListener('keypress', e => {
    if (e.keyCode === 13) {
        onCodeEntered()
    }
})

joinGame.addEventListener('click', _ => {
    onCodeEntered()
})
