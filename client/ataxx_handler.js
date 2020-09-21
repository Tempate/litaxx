let board = new Board()
board.starting_position()
sync_html_board()

let focused_stone
let color

function clicked_cell(element) {
    const color_string = (board.turn == Player.Black) ? "black" : "white"

    const square = parseInt(element.id.substr(1))

    if (element.classList.contains("legal-square")) {
        make_move(new Move(square, focused_stone))

    } else if (element.classList.contains(color_string)) {
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
        sync_html_board()

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
            clone_stone(color_type, from_square)

            break;

        case MoveType.Double:
            move_stone(move.from.toString(), move.to.toString())
            break;
    }
}

function move_stone(from, to) {
    const stone = document.getElementById("p" + from)
    const target = document.getElementById("s" + to)

    const target_coordinates = target.getBoundingClientRect()

    stone.style.left = target_coordinates.left + "px"
    stone.style.top = target_coordinates.top + "px"
    stone.id = "p" + to
}

function clone_stone(stone, square) {
    let element = document.getElementById("s" + square)
    let clone = element.cloneNode()

    clone.className = "btn-circle"
    clone.id = "p" + square
    
    switch (stone) {
        case StoneType.Black:
            clone.classList.add("black")
            break
        case StoneType.White:
            clone.classList.add("white")
            break
    }

    const coordinates = element.getBoundingClientRect()
    clone.style.left = coordinates.left + "px"
    clone.style.top = coordinates.top + "px"

    document.body.appendChild(clone)
}

function sync_html_board() {
    for (let i = 0; i < 49; i++) {
        const stone = board.stones[i]

        if (stone == StoneType.Blank)
            continue
        
        let element = document.getElementById("p" + i)
        let color = (stone == StoneType.Black) ? "black" : "white"

        if (element == undefined)
            clone_stone(stone, i)
        else if (!element.classList.contains(color))
            element.className = "btn-circle " + color
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