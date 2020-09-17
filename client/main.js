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

let board = new Board()
board.from_fen("x5o/7/7/7/7/7/o5x x 0 0")
update_board()

let piece_square = -1

function clicked(id) {
    const square_element = document.getElementById(id)
    const square = parseInt(id.substr(1))
    const color = (board.turn == Player.Black) ? "black" : "white";

    if (square_element.classList.contains("legal-square")) {
        let move = new Move(square, piece_square)
        board.make(move)

        piece_square = -1
        update_board()
    } else if (square_element.classList.contains("transparent")) {
        let move = new Move(square)

        if (board.is_legal(move)) {
            board.make(move)
            update_board()
        }
    } else if (square_element.classList.contains(color)) {
        update_legal_squares_view(square)
    }
}

function update_board() {
    for (let i = 0; i < 49; i++) {
        const element = document.getElementById("s" + i)
        element.className = "btn-circle"

        switch (board.stones[i]) {
            case StoneType.Blank:
                element.classList.add("transparent")
                break
            case StoneType.Black:
                element.classList.add("black")
                break
            case StoneType.White:
                element.classList.add("white")
                break
        }
    }

    document.getElementById("game-fen").value = board.to_fen()
}

function update_legal_squares_view(square) {

    if (piece_square != -1) {
        for (let sqr = 0; sqr < 49; sqr++) {
            let element = document.getElementById("s" + sqr)

            if (element.classList.contains("legal-square")) {
                element.classList.remove("legal-square")
                element.classList.add("transparent")
            }
        }
    }

    if (piece_square != square) {
        piece_square = square

        const squares = board.reachable_squares(Board.square_to_coordinate(square))

        squares.forEach(sqr => {
            let element = document.getElementById("s" + sqr)
            element.classList.remove("transparent")
            element.classList.add("legal-square")
        })
    } else {
        piece_square = -1
    }
}