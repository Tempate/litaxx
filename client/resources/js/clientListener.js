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
