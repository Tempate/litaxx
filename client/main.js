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

function clicked(id) {
    const square = parseInt(id.substr(1));
    const board = new Board();
    const squares = board.reachable_squares(Board.square_to_coordinate(square));

    squares.forEach(sqr => {
        let element = document.getElementById("s" + sqr);

        if (element.classList.contains("transparent")) {
            element.classList.remove("transparent");
            element.classList.add("legal-square");
        } else if (element.classList.contains("legal-square")) {
            element.classList.remove("legal-square");
            element.classList.add("transparent");
        }
    });
}