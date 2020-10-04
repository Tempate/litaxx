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

const boardGrid = document.querySelector(".board-grid");

let moveSound = document.querySelector("#move-sound")
let focusedStone, color, turn;

let boardCoordinates = boardGrid.getBoundingClientRect();
window.addEventListener("resize", () => boardCoordinates = boardGrid.getBoundingClientRect());


function clickedCell(element) {
    const clickedSquare = parseInt(element.id.substr(1))

    if (indexHistory < boardHistory.length - 1) {
        return;
    }

    if (element.classList.contains("highlight")) {
        emitMove(focusedStone, clickedSquare)

    } else if (element.classList.contains(color) && turn === color) {
        if (focusedStone != null) {
            hidePossibleMoves()
        }

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
            cloneStone(from, color)
            moveStone(from, to)
            break;
        case 2:
            moveStone(from, to)
            break;
    }

    moveSound.play();
}

function moveStone(from, to) {
    const ANIMATION_DURATION_IN_MS = 500;

    const stone = document.getElementById("p" + from)
    const target = document.getElementById("s" + to)

    const targetCoordinates = target.getBoundingClientRect();

    stone.style.position = "absolute";

    stone.style.left = targetCoordinates.left - boardCoordinates.left + "px"
    stone.style.top = targetCoordinates.top - boardCoordinates.top + "px"
    stone.id = "p" + to

    setTimeout(() => {
        target.appendChild(stone)
        stone.style.position = "";
        captureStones(to)
        updateCounters()
    }, ANIMATION_DURATION_IN_MS);
}

function cloneStone(square, colour) {
    let element = document.getElementById("s" + square)
    let clone = element.cloneNode()

    clone.id = "p" + square
    clone.className = "btn-circle " + colour

    const coordinates = element.getBoundingClientRect()

    clone.style.left = coordinates.left - boardCoordinates.left + "px"
    clone.style.top = coordinates.top - boardCoordinates.top + "px"

    // Append the stone to the square so it'll be correctly 
    // positioned if the screen gets resized
    element.appendChild(clone);
}

function setOrCloneStone(square, color) {
    let element = document.getElementById("p" + square)

    if (element == undefined) {
        cloneStone(square, color)
    } else if (!element.classList.contains(color)) {
        element.className = "btn-circle " + color
    }
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
    
    updateCounters();
}

function showPossibleMoves(square) {
    for (let sqr = 0; sqr < 49; sqr++) {
        const stone = document.getElementById("p" + sqr);
        const dist = distance(square, sqr);

        if (stone == undefined && (dist == 1 || dist == 2)) {
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
    let blackCount = 0, whiteCount = 0;

    for (let square = 0; square < 49; square++) {
        const stone = document.getElementById("p" + square);

        if (!stone) {
            continue;
        } else if (stone.classList.contains("black")) {
            blackCount++;
        } else if (stone.classList.contains("white")) {
            whiteCount++;
        }
    }

    document.querySelector("#black-stone-counter").innerHTML = blackCount;
    document.querySelector("#white-stone-counter").innerHTML = whiteCount;

    // Render the bar counter
    // It needs to be run when opening the page
    const stoneParent = document.querySelector(".stone-counter");
    const childrenCollection = stoneParent.children;

    // Go forward to set the white stones and backwards to set the black ones
    for (let square = 0; square < 49; square++) {
        let element = childrenCollection[square];

        element.classList = "";

        if (square == 24) {
            element.classList.add("red-counter");
        }

        if (square < whiteCount) {
            element.classList.add("stone-counter-white");
        } else if (square >= 49 - blackCount) {
            element.classList.add("stone-counter-black");
        } else {
            element.classList.add("stone-counter-blank");
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
