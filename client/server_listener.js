const player_color = document.querySelector('#player-color')
const spectator_count = document.querySelector('#spectator-count')

socket.on('game_code', code => {
    game_id.value = code
    game_code = code

    player_color.innerHTML = ""
    spectator_count.innerHTML = ""
})

socket.on('fen', fen => {
    board.from_fen(fen)
    sync_html_board()
})

socket.on('color', c => {
    player_color.innerHTML = "You are playing " + c

    color = (c === "white") ? Player.White : Player.Black
})

socket.on('spectators', count => {
    spectator_count.innerHTML = count.toString() + ((count == 1) ? " spectator" : " spectators")
})

socket.on('played_move', move_string => {
    const move = Move.fromString(move_string)

    board.make(move)
    animate_move(move)
    sync_html_board()
})
