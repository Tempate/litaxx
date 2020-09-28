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