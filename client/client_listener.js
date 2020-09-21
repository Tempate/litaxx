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

const game_fen = document.querySelector('#game-fen')

game_fen.addEventListener('change', _ => {
    const boards_fen = board.to_fen()

    if (boards_fen === Board.starting_fen) {
        board.from_fen(game_fen.value)
        sync_html_board()
        
        socket.emit('fen', game_fen.value)
    } else {
        game_fen.value = boards_fen
    }
})