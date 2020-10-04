/*  This file is part of Litaxx.

    Litaxx is free software: you can redistribute it and/or modify
    it under the terms of the GNU General Public License as published by
    the Free Software Foundation, either version 3 of the License, or
    (at your option) any later version.

    Litaxx is distributed in the hope that it will be useful,
    but WITHOUT ANY WARRANTY; without even the implied warranty of
    MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE. See the
    GNU General Public License for more details.

    You should have received a copy of the GNU General Public License
    along with Litaxx. If not, see <https://www.gnu.org/licenses/>.
*/

const HIGHLIGHTED_SQUARE_CLASS = "highlighted-square";

const STONE_CLASS = {
    "white": "white-stone",
    "black": "black-stone"
};

const boardGrid = document.querySelector(".board-grid");

let focusedSquare, color, turn;


function clickedCell(element) {
    const clickedSquare = parseInt(element.id.substr(1))

    if (indexHistory < boardHistory.length - 1) {
        return;
    }

    if (element.classList.contains(HIGHLIGHTED_SQUARE_CLASS)) {
        playMove(focusedSquare, clickedSquare)

    } else if (element.classList.contains(STONE_CLASS[color]) && turn === color) {
        if (focusedSquare != null) {
            hidePossibleMoves()
        }

        if (focusedSquare == clickedSquare) {
            unfocusSquare();
        } else {
            showPossibleMoves(clickedSquare);
            focusSquare(clickedSquare);
        }
    }
}

function focusSquare(sqr) {
    let square = document.getElementById("s" + sqr);
    square.classList.add("focused-square");

    focusedSquare = sqr;
}

function unfocusSquare() {
    let square = document.getElementById("s" + focusedSquare);
    square.classList.remove("focused-square");

    focusedSquare = null;
}

function playMove(from, to) {
    unfocusSquare();
    hidePossibleMoves();

    socket.emit("played_move", from + "_" + to)
}

function animateMove(from, to) {
    const dist = distance(from, to)

    switch (dist) {
        case 1:
            cloneStone(from, color)
            moveStone(from, to)
            break;
        case 2:
            moveStone(from, to)
            break;
    }

    document.querySelector("#move-sound").play();
}

function cloneStone(square, color) {
    let element = document.getElementById("s" + square);
    let clone = element.cloneNode();

    clone.className = "btn-circle " + STONE_CLASS[color];

    placeStoneInSquare(clone, square);

    // Append the stone to the square so it'll be correctly 
    // positioned if the screen gets resized
    element.appendChild(clone);
}

function moveStone(from, to) {
    const ANIMATION_DURATION_IN_MS = 500;

    const target = document.getElementById("s" + to);
    let stone = document.getElementById("p" + from);

    placeStoneInSquare(stone, to);

    setTimeout(() => {
        target.appendChild(stone);
        stone.style.position = "";

        captureStones(to);

        updateCounters();
    }, ANIMATION_DURATION_IN_MS);
}

function placeStoneInSquare(stone, square) {
    const target = document.getElementById("s" + square);

    const targetCoordinates = target.getBoundingClientRect();
    const boardCoordinates = boardGrid.getBoundingClientRect();

    stone.style.position = "absolute";
    stone.style.left = targetCoordinates.left - boardCoordinates.left + "px";
    stone.style.top = targetCoordinates.top - boardCoordinates.top + "px";

    stone.id = "p" + square;
}

function captureStones(moveTo) {
    let stone = document.getElementById("p" + moveTo)

    for (let sqr = 0; sqr < 49; sqr++) {
        let element = document.getElementById("p" + sqr)

        if (distance(moveTo, sqr) == 1 && element != undefined) {
            element.className = stone.className
        }
    }
}

function fenToHtmlBoard(fen) {
    const board = fen.split(" ")[0]

    let square = 42

    for (let char of board) {
        switch (char) {
            case "x":
                placeStone(square, "black")
                square++
                break
            case "o":
                placeStone(square, "white")
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
                // Remove stones, if there are any, from blank squares


                const bound = square + parseInt(char);

                for (; square < bound; square++) {
                    let element = document.getElementById("p" + square)

                    if (element != undefined) {
                        element.remove();
                    }
                }

                break;
        }
    }
    
    updateCounters();
}

// It makes sure there's a stone of a given color in a square.
// If there isn't a stone at all, it adds one.
// If there is a stone of a different color, it changes it.
function placeStone(square, color) {
    let element = document.getElementById("p" + square);

    if (element == undefined) {
        cloneStone(square, color)
    } else if (!element.classList.contains(color)) {
        element.className = "btn-circle " + STONE_CLASS[color];
    }
}

// Highlight squares that are, at most, at a 2-square-away distance
function showPossibleMoves(square) {
    for (let sqr = 0; sqr < 49; sqr++) {
        const stone = document.getElementById("p" + sqr);
        const dist = distance(square, sqr);

        if (stone == undefined && (dist == 1 || dist == 2)) {
            let element = document.getElementById("s" + sqr);
            element.classList.add(HIGHLIGHTED_SQUARE_CLASS);
        }
    }
}

function hidePossibleMoves() {
    for (let sqr = 0; sqr < 49; sqr++) {
        let element = document.getElementById("s" + sqr);

        if (element.classList.contains(HIGHLIGHTED_SQUARE_CLASS)) {
            element.classList.remove(HIGHLIGHTED_SQUARE_CLASS);
        }
    }
}

function updateCounters() {
    const counter = countStones();

    // Set numeric counters
    document.querySelector("#numeric-black-stone-counter").innerHTML = counter["black"];
    document.querySelector("#numeric-white-stone-counter").innerHTML = counter["white"];

    setBarCounter(counter);
}

function countStones() {
    let counter = {
        "white": 0,
        "black": 0
    };

    for (let square = 0; square < 49; square++) {
        const stone = document.getElementById("p" + square);

        if (!stone) {
            continue;
        } else if (stone.classList.contains(STONE_CLASS["black"])) {
            counter["black"]++;
        } else if (stone.classList.contains(STONE_CLASS["white"])) {
            counter["white"]++;
        }
    }

    return counter;
}

function setBarCounter(counter) {
    const barSquares = document.querySelector(".bar-stone-counter").children;

    for (let square = 0; square < 49; square++) {
        let barSquare = barSquares[square];

        barSquare.classList = "";

        if (square == 24) {
            barSquare.classList.add("bar-stone-counter-halfway-mark");
        }

        if (square < counter["white"]) {
            barSquare.classList.add("bar-stone-counter-white");
        } else if (square >= 49 - counter["black"]) {
            barSquare.classList.add("bar-stone-counter-black");
        } else {
            barSquare.classList.add("bar-stone-counter-blank");
        }
    }
}

function distance(s1, s2) {
    const x1 = s1 % 7
    const x2 = s2 % 7

    const y1 = Math.floor(s1 / 7)
    const y2 = Math.floor(s2 / 7)

    return Math.max(Math.abs(x1 - x2), Math.abs(y1 - y2))
}
