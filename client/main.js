const socket = io()

const new_game = document.querySelector('#create-a-game')

new_game.addEventListener('submit', event => {
    event.preventDefault()
    socket.emit('new_game')
})

const join_game = document.querySelector('#join-a-game')
const game_id = document.querySelector('#game-id')

join_game.addEventListener('submit', event => {
    event.preventDefault()
    socket.emit('join_game', game_id.value)
})

socket.on('chat', message => {
    console.log('From server: ', message)
})