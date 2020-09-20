let board = new Board()
board.starting_position()
sync_html_board()

let focused_stone
let color

function clicked_cell(id) {
    const color = (board.turn == Player.Black) ? "black" : "white"

    const square_element = document.getElementById(id)
    const square = parseInt(id.substr(1))

    if (square_element.classList.contains("legal-square"))
        make_move(new Move(square, focused_stone))

    else if (square_element.classList.contains("transparent"))
        make_move(new Move(square))

    else if (square_element.classList.contains(color))
        refresh_legal_squares(square)
}

function make_move(move) {
    focused_stone = null

    if (board.is_legal(move) && board.turn == color) {
        board.make(move)

        switch (move.type) {
            case MoveType.Single:
                break;
            case MoveType.Double:
                const from_element = document.getElementById("s" + move.from.toString())
                const to_element = document.getElementById("s" + move.to.toString())

                const from_coordinates = from_element.getBoundingClientRect()
                const to_coordinates = to_element.getBoundingClientRect()

                from_element.style.left = (to_coordinates.left - from_coordinates.left) + "px"
                from_element.style.top = (to_coordinates.top - from_coordinates.top) + "px"

                break;
        }

        // Inform the server about the played move
        socket.emit("played_move", move.toString())
    }
}

function sync_html_board() {
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

function refresh_legal_squares(square) {

    if (focused_stone) {

        // Remove possible-moves' tagging
        for (let sqr = 0; sqr < 49; sqr++) {
            let element = document.getElementById("s" + sqr)

            if (element.classList.contains("legal-square")) {
                element.classList.remove("legal-square")
                element.classList.add("transparent")
            }
        }
    }

    if (focused_stone == square) {
        focused_stone = null
    } else if (board.turn == color) {

        // Show possible moves for stone
        focused_stone = square

        const squares = board.reachable_squares(Board.square_to_coordinate(square))

        squares.forEach(sqr => {
            let element = document.getElementById("s" + sqr)
            element.classList.remove("transparent")
            element.classList.add("legal-square")
        })
    }
}
