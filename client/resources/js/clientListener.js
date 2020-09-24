const socket = io()
socket.emit('new_game')

const new_game = document.querySelector('#create-a-game')

new_game.addEventListener('click', _ => {
    socket.emit('new_game')
})

const join_game = document.querySelector('#join-a-game')
const game_id = document.querySelector('#game-id')

game_id.maxLength = 4

//To accept any game code that consists of 4 letter
function check_game_code(typed_game_code) {
    let prep_game_code = typed_game_code.trim()
    if (prep_game_code.length !== 4)
        return "";
    prep_game_code = prep_game_code.toUpperCase()
    const is_valid = /^[A-Z]{4}$/.test(prep_game_code)
    if (is_valid) {
        return prep_game_code;
    } else {
        return "";
    }
}

function on_code_entered() {
    let _game_code = game_id.value

    const prepped_game_code = check_game_code(_game_code)

    if (prepped_game_code !== "") {
        socket.emit('join_game', prepped_game_code)
    } else {
        game_id.value = ""
        game_id.placeholder = "Game code must be 4 letters"
    }
}

game_id.addEventListener('keypress', e => {
    if (e.keyCode === 13) {
        on_code_entered()
    }
})

join_game.addEventListener('click', _ => {
    on_code_entered()
})
