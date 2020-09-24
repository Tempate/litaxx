let focusedStone
let color
let turn

function clickedCell(element) {
    const clickedSquare = parseInt(element.id.substr(1))

    if (element.classList.contains("highlight")) {
        emitMove(focusedStone, clickedSquare)

    } else if (element.classList.contains(color) && turn === color) {
        if (focusedStone)
            hidePossibleMoves()

        if (focusedStone == clickedSquare) {
            focusedStone = null
        } else {
            showPossibleMoves(clickedSquare)
            focusedStone = clickedSquare
        }
    }
}

function emitMove(from, to) {
    focusedStone = null
    hidePossibleMoves()

    socket.emit("played_move", from + "_" + to)
}

function animateMove(from, to) {
    const dist = distance(from, to)

    switch (dist) {
        case 1:
            moveStone(from, to)
            cloneStone(from, color)
            break;
        case 2:
            moveStone(from, to)
            break;
    }

    let stone = document.getElementById("p" + to)

    for (let sqr = 0; sqr < 49; sqr++) {
        let element = document.getElementById("p" + sqr)

        if (distance(to, sqr) == 1 && element != undefined) {
            element.className = stone.className
        }
    }
}

function moveStone(from, to) {
    const stone = document.getElementById("p" + from)
    const target = document.getElementById("s" + to)

    const target_coordinates = target.getBoundingClientRect()

    stone.style.left = target_coordinates.left + "px"
    stone.style.top = target_coordinates.top + "px"
    stone.id = "p" + to
}

function cloneStone(square, color) {
    let element = document.getElementById("s" + square)
    let clone = element.cloneNode()

    clone.className = "btn-circle"
    clone.id = "p" + square
    clone.classList.add(color)

    const coordinates = element.getBoundingClientRect()
    clone.style.left = coordinates.left + "px"
    clone.style.top = coordinates.top + "px"

    document.body.appendChild(clone)
}

function setOrCloneStone(square, color) {
    let element = document.getElementById("p" + square)

    if (element == undefined) {
        cloneStone(square, color)
    } else if (!element.classList.contains(color)) {
        element.className = "btn-circle " + color
    }
}

function fenToHtmlBoard(fen) {
    const board = fen.split(" ")[0]

    let square = 42

    for (let char of board) {
        switch (char) {
            case "x":
                setOrCloneStone(square, "black")
                square++
                break
            case "o":
                setOrCloneStone(square, "white")
                square++
                break
            case "/":
                square -= 14
                break
            case "1":
            case "2":
            case "3":
            case "4":
            case "5":
            case "6":
            case "7":
                const bound = square + parseInt(char)
    
                while (square < bound) {
                    let element = document.getElementById("p" + square)
    
                    if (element != undefined)
                        element.remove()
    
                    square++
                }

                break
        }
    }
}

function showPossibleMoves(square) {
    for (let sqr = 0; sqr < 49; sqr++) {
        const dist = distance(square, sqr)

        if (dist == 1 || dist == 2) {
            let element = document.getElementById("s" + sqr)
            element.classList.remove("transparent")
            element.classList.add("highlight")
        }
    }
}

function hidePossibleMoves() {
    for (let sqr = 0; sqr < 49; sqr++) {
        let element = document.getElementById("s" + sqr)

        if (element.classList.contains("highlight")) {
            element.classList.remove("highlight")
            element.classList.add("transparent")
        }
    }
}

function updateCounters() {
    updateCounter("black")
    updateCounter("white")
}

function updateCounter(color) {
    let count = 0
    
    for (let sqr = 0; sqr < 49; sqr++) {
        const stone = document.getElementById("p" + sqr)

        if (stone && stone.classList.contains(color)) {
            count++
        }
    }

    let counter = document.getElementById(color + "-stone-counter")
    counter.innerHTML = count

    return 
}

function distance(s1, s2) {
    const x1 = s1 % 7
    const x2 = s2 % 7

    const y1 = Math.floor(s1 / 7)
    const y2 = Math.floor(s2 / 7)

    return Math.max(Math.abs(x1 - x2), Math.abs(y1 - y2))
}
