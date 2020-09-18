const socket = io()
socket.emit('new_game')

create_game_listener()
join_game_listener()
game_code_listener()

function create_game_listener() {
    const new_game = document.querySelector('#create-a-game')

    new_game.addEventListener('click', event => {
        socket.emit('new_game')
    })
}

function join_game_listener() {
    const join_game = document.querySelector('#join-a-game')
    const game_id = document.querySelector('#game-id')

    join_game.addEventListener('click', event => {
        let _game_code = game_id.value

        if (/^[A-Z]{4}$/.test(_game_code)) {
            socket.emit('join_game', _game_code)
        } else {
            game_id.value = ""
            game_id.placeholder = "Game code must be 4 capital letters"
        }
    })
}

function game_code_listener() {
    const game_id = document.querySelector('#game-id')

    socket.on('game_code', code => {
        game_id.value = code
        game_code = code
    })
}

function played_move_listener() {
    socket.on('played_move', move => {
        client.board.make(Move.fromString(move))
        client.sync_html_board()
    })
}

