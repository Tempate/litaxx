let board = new Board()
board.starting_position()
sync_html_board()

let focused_stone
let color

function clicked_cell(id) {
    const color_string = (board.turn == Player.Black) ? "black" : "white"

    const square_element = document.getElementById(id)
    const square = parseInt(id.substr(1))

    if (square_element.classList.contains("legal-square")) {
        make_move(new Move(square, focused_stone))

    } else if (square_element.classList.contains(color_string)) {
        if (focused_stone)
            hide_possible_moves()

        if (focused_stone == square) {
            focused_stone = null
        } else if (board.turn == color) {
            show_possible_moves(square)
            focused_stone = square
        }
    }
}

function make_move(move) {
    hide_possible_moves()

    if (board.is_legal(move) && board.turn == color) {
        board.make(move)
        animate_move(move)

        socket.emit("played_move", move.toString())
    }

    focused_stone = null
}

function animate_move(move) {
    switch (move.type) {
        case MoveType.Single:
            let color_string, color_type    

            if (board.turn == Player.Black) {
                color_string = "white"
                color_type = StoneType.White
            } else {
                color_string = "black"
                color_type = StoneType.Black
            }
        
            let from_square

            if (focused_stone) {
                from_square = focused_stone
            } else {
                const possible_stones = board.surrounding_stones(move.to, color_type, 1)
                from_square = possible_stones[Math.floor(Math.random() * possible_stones.length)]
            }

            move_stone(from_square, move.to.toString())

            const from_element = document.getElementById("s" + from_square)
            from_element.classList.add(color_string)
            break;
        case MoveType.Double:
            move_stone(move.from.toString(), move.to.toString(), MoveType.Double)
            break;
    }
}

function move_stone(from, to) {
    const from_element = document.getElementById("s" + from)
    const to_element = document.getElementById("s" + to)

    const from_coordinates = from_element.getBoundingClientRect()
    const to_coordinates = to_element.getBoundingClientRect()

    from_element.style.left = (to_coordinates.left - from_coordinates.left) + "px"
    from_element.style.top = (to_coordinates.top - from_coordinates.top) + "px"
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

function show_possible_moves(square) {
    const squares = board.reachable_squares(Board.square_to_coordinate(square))

    squares.forEach(sqr => {
        let element = document.getElementById("s" + sqr)
        element.classList.remove("transparent")
        element.classList.add("legal-square")
    })
}

function hide_possible_moves(square) {
    for (let sqr = 0; sqr < 49; sqr++) {
        let element = document.getElementById("s" + sqr)

        if (element.classList.contains("legal-square")) {
            element.classList.remove("legal-square")
            element.classList.add("transparent")
        }
    }
}