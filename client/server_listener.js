socket.on('game_code', code => {
    game_id.value = code
    game_code = code
})

socket.on('fen', fen => {
    board.from_fen(fen)
})

socket.on('color', c => {
    color = (c === "white") ? Player.White : Player.Black
})

socket.on('played_move', move => {
    board.make(Move.fromString(move))
    sync_html_board()
})
