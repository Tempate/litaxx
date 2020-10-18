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

const Board = require('../../../../jsataxx/board');
const Move  = require('../../../../jsataxx/move');
const Types = require('../../../../jsataxx/types');
const { updateCounters } = require('./counterHandler');

const CounterHandler = require('./counterHandler');

const HIGHLIGHTED_SQUARE_CLASS = "highlighted-square";
const FOCUSED_SQUARE_CLASS = "focused-square";
const MARKED_SQUARE_CLASS = "marked-square";

const STONE_CLASS = {
    "white": "white-stone",
    "black": "black-stone"
};

function createHtmlBoard() {
    let board = new Board.Board();

    let focusedSquare;
    let color;

    return {
        color, 

        fromFen: function(fen) {
            board.fromFen(fen);
        
            for (let square = 0; square < 49; square++) {
                switch(board.stones[square]) {
                    case Types.StoneType.Black:
                        setStone(square, "black");
                        break;
                    case Types.StoneType.White:
                        setStone(square, "white");
                        break;
                    case Types.StoneType.Blank:
                        // Check if there's a stone in its square and remove it if so
                        let element = document.getElementById("p" + square);
        
                        if (element != undefined) {
                            element.remove();
                        }
        
                        break;
                }
            }
            
            CounterHandler.updateCounters();
        },

        click: function(element) {
            const clickedSquare = parseInt(element.id.substr(1));

            if (element.classList.contains(HIGHLIGHTED_SQUARE_CLASS)) {
                const move = Move.createMove(clickedSquare, focusedSquare);
                
                this.make(move);

                return move;

            } else if (element.classList.contains(STONE_CLASS[this.color]) && board.turn === this.color) {
                const previouslyFocusedSquare = focusedSquare;

                // If there was a move previously focused, remove it
                if (previouslyFocusedSquare != null) {
                    focusedSquare = null;
                    this.lowlight();
                }

                if (previouslyFocusedSquare !== clickedSquare) {
                    focusedSquare = clickedSquare;
                    focusSquare(focusedSquare);
                }
            }
        },

        make: function(move) {
            focusedSquare = null;
            
            this.lowlight();
            this.highlight(move);

            board.make(move);
            animate(move);

            CounterHandler.updateCounters();
        },

        highlight: function(move) {
            switch (move.type) {
                case Types.MoveType.Double:
                    highlightSquare(move.from);
                    // no break
                case Types.MoveType.Single:
                    highlightSquare(move.to);
                    break;
            }
        },

        lowlight: function() {
            // Remove focused-square highlighting
            let focusedSquares = document.getElementsByClassName(FOCUSED_SQUARE_CLASS);
        
            for (let i = 0; i < focusedSquares.length; i++) {
                focusedSquares[i].classList.remove(FOCUSED_SQUARE_CLASS);
            }
        
            // Remove focused-move highlighting
            let highlightedSquares = document.getElementsByClassName(MARKED_SQUARE_CLASS);
        
            for (let i = 0; i < highlightedSquares.length; i++) {
                highlightedSquares[i].classList.remove(MARKED_SQUARE_CLASS);
            }
        
            hidePossibleMoves();
        }
    }
}

function focusSquare(sqr) {
    let square = document.getElementById("s" + sqr).parentNode;
    square.classList.add(FOCUSED_SQUARE_CLASS);

    showPossibleMoves(sqr);
}

// Highlight blank squares that are, at most, at a 2-square-away distance
function showPossibleMoves(square) {
    const board = new Board.Board();
    
    board.reachableSquares(square).forEach(square => {
        const stone = document.getElementById("p" + square);

        if (stone == undefined) {
            let element = document.getElementById("s" + square);
            element.classList.add(HIGHLIGHTED_SQUARE_CLASS);
        }
    });
}

function hidePossibleMoves() {
    for (let sqr = 0; sqr < 49; sqr++) {
        let element = document.getElementById("s" + sqr);

        if (element.classList.contains(HIGHLIGHTED_SQUARE_CLASS)) {
            element.classList.remove(HIGHLIGHTED_SQUARE_CLASS);
        }
    }
}

function animate(move) {
    switch (move.type) {
        case Types.MoveType.Single:
            cloneStone(move.from, move.color);
            // no break
        case Types.MoveType.Double:
            moveStone(move.from, move.to);
            break;
    }

    document.querySelector("#move-sound").play();
}

function cloneStone(square, color) {
    let element = document.getElementById("s" + square);
    let clone = element.cloneNode();

    clone.className = "btn-circle " + STONE_CLASS[color];

    placeStone(clone, square);

    // Append the stone to the square so it'll be correctly 
    // positioned if the screen gets resized
    element.appendChild(clone);
}

function moveStone(from, to) {
    const ANIMATION_DURATION_IN_MS = 500;

    const target = document.querySelector("#s" + to);
    let stone = document.querySelector("#p" + from);

    placeStone(stone, to);

    setTimeout(() => {
        target.appendChild(stone);
        stone.style.position = "";

        captureStones(to);
        updateCounters();
    }, ANIMATION_DURATION_IN_MS);
}

function placeStone(stone, square) {
    const target = document.getElementById("s" + square);
    const grid = document.querySelector('.board-grid');

    const boardCoordinates = grid.getBoundingClientRect();
    const targetCoordinates = target.getBoundingClientRect();

    stone.style.position = "absolute";
    stone.style.left = targetCoordinates.left - boardCoordinates.left + "px";
    stone.style.top = targetCoordinates.top - boardCoordinates.top + "px";

    stone.id = "p" + square;
}

function captureStones(square) {
    const board = new Board.Board();
    const adjacentSquares = board.surroundingStones(square, Types.StoneType.Blank, 1);

    let stone = document.getElementById("p" + square);

    adjacentSquares.forEach(sqr => {
        let element = document.getElementById("p" + sqr);

        if (element != undefined) {
            element.className = stone.className;
        }
    });
}

// It makes sure there's a stone of a given color in a square.
// If there isn't a stone at all, it adds one.
// If there is a stone of a different color, it changes it.
function setStone(square, color) {
    let element = document.getElementById("p" + square);

    if (element == undefined) {
        cloneStone(square, color)
    } else if (!element.classList.contains(color)) {
        element.className = "btn-circle " + STONE_CLASS[color];
    }
}

function highlightSquare(sqr) {
    const square = document.querySelector("#s" + sqr).parentNode;

    if (!square.classList.contains(MARKED_SQUARE_CLASS)) {
        square.classList.add(MARKED_SQUARE_CLASS);
    }
}

module.exports = {createHtmlBoard};