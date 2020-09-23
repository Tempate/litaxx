const socket = io()
socket.emit('new_game')

const new_game = document.querySelector('#create-a-game')

new_game.addEventListener('click', _ => {
    socket.emit('new_game')
})

const join_game = document.querySelector('#join-a-game')
const game_id = document.querySelector('#game-id')

join_game.addEventListener('click', _ => {
    let _game_code = game_id.value

    if (/^[A-Z]{4}$/.test(_game_code)) {
        socket.emit('join_game', _game_code)
    } else {
        game_id.value = ""
        game_id.placeholder = "Game code must be 4 capital letters"
    }
})
