const player_color = document.querySelector('#player-color')
const spectator_count = document.querySelector('#spectator-count')

socket.on('game_code', code => {
    game_id.value = code
    game_code = code

    player_color.innerHTML = ""
    spectator_count.innerHTML = ""
})

socket.on('fen', fen => {
    fenToHtmlBoard(fen)
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
