(function(){function r(e,n,t){function o(i,f){if(!n[i]){if(!e[i]){var c="function"==typeof require&&require;if(!f&&c)return c(i,!0);if(u)return u(i,!0);var a=new Error("Cannot find module '"+i+"'");throw a.code="MODULE_NOT_FOUND",a}var p=n[i]={exports:{}};e[i][0].call(p.exports,function(r){var n=e[i][1][r];return o(n||r)},p,p.exports,r,e,n,t)}return n[i].exports}for(var u="function"==typeof require&&require,i=0;i<t.length;i++)o(t[i]);return o}return r})()({1:[function(require,module,exports){
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
                    unfocusSquare();
                }

                if (previouslyFocusedSquare !== clickedSquare) {
                    focusedSquare = clickedSquare;
                    focusSquare(focusedSquare);
                }
            }
        },

        make: function(move) {
            focusedSquare = null;
            unfocusSquare();

            board.make(move);
            animate(move);

            CounterHandler.updateCounters();
        },

        highlight: function(move, reverse) {
            switch (move.type) {
                case Types.MoveType.Double:
                    highlightSquare(move.from, reverse);
                    // no break
                case Types.MoveType.Single:
                    highlightSquare(move.to, reverse);
                    break;
            }
        }
    }
}

function focusSquare(sqr) {
    let square = document.getElementById("s" + sqr).parentNode;
    square.classList.add(FOCUSED_SQUARE_CLASS);

    showPossibleMoves(sqr);
}

function unfocusSquare() {
    let focusedSquares = document.getElementsByClassName(FOCUSED_SQUARE_CLASS);

    for (let i = 0; i < focusedSquares.length; i++) {
        focusedSquares[i].classList.remove(FOCUSED_SQUARE_CLASS);
    }

    hidePossibleMoves();
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

function highlightSquare(sqr, reverse) {
    const square = document.getElementById("s" + sqr).parentNode;

    if (reverse == false) {
        square.classList.add(MARKED_SQUARE_CLASS);
    } else {
        square.classList.remove(MARKED_SQUARE_CLASS);
    }
}

module.exports = {createHtmlBoard};
},{"../../../../jsataxx/board":5,"../../../../jsataxx/move":6,"../../../../jsataxx/types":7,"./counterHandler":3}],2:[function(require,module,exports){
const ServerHandler = require("./serverHandler");


// Disconnect a user from the room when he unloads the page
window.addEventListener('beforeunload', function(_) {
    ServerHandler.socket.emit('disconnect');
});

window.addEventListener('click', function(e) {
    const element = document.elementFromPoint(e.clientX, e.clientY);

    const move = ServerHandler.board.click(element);

    if (move != undefined) {
        ServerHandler.sendMove(move);
    }
})

// Navigate through the move history
window.addEventListener('keydown', function(e) {
    e = e || window.event;
    
    switch (e.key) {
        case 'ArrowLeft':
            ServerHandler.previousMove();
            break;
        case 'ArrowRight':
            ServerHandler.nextMove();
            break;
    }
});

function resign() {
    ServerHandler.socket.emit('resign');
}

function offerDraw() {
    ServerHandler.socket.emit('offer_draw');
}

},{"./serverHandler":4}],3:[function(require,module,exports){
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

const STONE_CLASS = {
    "white": "white-stone",
    "black": "black-stone"
};

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

module.exports = {updateCounters};
},{}],4:[function(require,module,exports){
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

const Move = require("../../../../jsataxx/move");
const Types = require("../../../../jsataxx/types");

const BoardHandler = require("./boardHandler");

let board = BoardHandler.createHtmlBoard();

const gameId = getParameterFromUrl('gameId');
const socket = io();

socket.emit('join_game', gameId);

let boardHistory = [], moveHistory = [];
let indexHistory = 0;

// HTML elements
let labels = {
    "color":      document.querySelector("#color"),
    "result":     document.querySelector("#result"),
    "spectators": document.querySelector("#spectators")
};

let buttons = {
    "resign": document.querySelector("#resign"),
    "draw":   document.querySelector("#draw")
}

let counters = {
    "white": document.querySelector("#numeric-white-stone-counter"),
    "black": document.querySelector("#numeric-black-stone-counter")
}

socket.on('board_history', boardHistoryString => {
    let boards = boardHistoryString.split(" & ");

    boards.forEach(board => {
        boardHistory.push(board);
    });
});

socket.on('move_history', moveHistoryString => {
    let moves = moveHistoryString.split(" ");

    moves.forEach(moveString => {
        moveHistory.push(Move.createMoveFromString(moveString));
    });
});

socket.on('fen', fen => {
    boardHistory.push(fen);

    // Use the fen to set the board when it's the initial position and
    // when the user was looking at a previous position when the move
    // was played
    if (boardHistory.length == 1 || indexHistory < boardHistory.length - 2) {
        board.fromFen(fen);
    }

    indexHistory = boardHistory.length - 1;
});

socket.on('color', color => {
    // If the color is set, the user is a player 
    // Otherwise, he's an spectator
    board.color = color;

    labels["color"].innerHTML = "You are playing " + color;

    // Only show resign and draw buttons when the user is a player
    buttons["resign"].classList.remove("d-none");
    buttons["draw"].classList.remove("d-none");
})

socket.on('spectators', count => {
    switch (count) {
        case 0:
            labels["spectators"].innerHTML = "";
            break;
        case 1:
            labels["spectators"].innerHTML = "1 spectator";
            break;
        default:
            console.assert(count >= 2);
            labels["spectators"].innerHTML = count + " spectators";
            break;
    }
})

socket.on('played_move', moveString => {
    let move = Move.createMoveFromString(moveString);

    board.make(move);

    if (moveHistory.length > 0) {
        board.highlight(moveHistory.slice(-1), true);
    }

    board.highlight(move, false);
    moveHistory.push(move);

    buttons["draw"].innerHTML = "Offer a draw";
})

socket.on('turn', turn => {
    const TURN_MARKER_CLASS = "numeric-counter-turn-marker";
    const opponent = (turn === "black") ? "white" : "black";

    if (!counters[turn].classList.contains(TURN_MARKER_CLASS)) {
        counters[turn].classList.add(TURN_MARKER_CLASS);
    }

    if (counters[opponent].classList.contains(TURN_MARKER_CLASS)) {
        counters[opponent].classList.remove(TURN_MARKER_CLASS);
    }
})

socket.on('draw_offer', _ => {
    buttons["draw"].innerHTML = "Accept draw";
})

socket.on('game_end', result => {
    labels["color"].innerHTML = ""

    if (result == "draw") {
        labels["result"].innerHTML = "The game was a draw"
    } else {
        labels["result"].innerHTML = result + " has won the game"
    }
})

function getParameterFromUrl(parameter) {
    let pageUrl = window.location.search.substring(1);
    let urlVariables = pageUrl.split('&');

    for (let i = 0; i < urlVariables.length; i++) {
        let parameterName = urlVariables[i].split('=');

        if (parameterName[0] == parameter) {
            return parameterName[1];
        }
    }

    return null;
}

function sendMove(move) {
    moveHistory.push(move);
    socket.emit("played_move", move.toString());
}

function previousMove() {
    if (indexHistory <= 0) {
        return;
    }

    indexHistory--;
    board.fromFen(boardHistory[indexHistory]);

    board.highlight(moveHistory[indexHistory], true);

    if (indexHistory >= 1) {
        board.highlight(moveHistory[indexHistory - 1], false);
    }
}

function nextMove() {
    if (indexHistory >= boardHistory.length - 1) {
        return;
    }

    indexHistory++;
    board.fromFen(boardHistory[indexHistory]);

    if (indexHistory >= 2) {
        board.highlight(moveHistory[indexHistory - 2], true);
    }

    if (indexHistory >= 1) {
        board.highlight(moveHistory[indexHistory - 1], false);
    }
}

module.exports = {board, sendMove, previousMove, nextMove};
},{"../../../../jsataxx/move":6,"../../../../jsataxx/types":7,"./boardHandler":1}],5:[function(require,module,exports){
const Types = require('./types');
const Move = require('./move');

const MoveType  = Types.MoveType
const StoneType = Types.StoneType
const Player    = Types.Player
const Result    = Types.Result

const initialFen = "x5o/7/7/7/7/7/o5x x 0 1";

const single_offsets = [
    [-1,-1],
    [-1,0],
    [-1,1],
    [0,-1],
    [0,1],
    [1,-1],
    [1,0],
    [1,1]
];

const double_offsets = [
    [-2,-2],
    [-2,-1],
    [-2,0],
    [-2,1],
    [-2,2],
    [-1,-2],
    [-1,2],
    [0,-2],
    [0,2],
    [1,-2],
    [1,2],
    [2,-2],
    [2,-1],
    [2,0],
    [2,1],
    [2,2]
];

const move_offsets = single_offsets.concat(double_offsets);


class Board {
    constructor() {
        this.turn = Player.Black;
        this.ply = 0;
        this.fiftyMovesCounter = 0;

        this.stones = new Array(49).fill(StoneType.Blank);
    }

    toFen() {
        let fen = "";

        for (let y = 6; y >= 0; y--) {
            for (let x = 0; x < 7; x++) {
                const square = y * 7 + x;

                switch (this.stones[square]) {
                    case StoneType.Blank:
                        // If the last character is a number, increase it.
                        // Otherwise, append a 1.

                        const lastCharacter = fen.slice(-1)

                        if (!lastCharacter || isNaN(lastCharacter)) { 
                            fen += '1' 
                        } else { 
                            fen = fen.slice(0, -1) + (parseInt(lastCharacter) + 1) 
                        }

                        break;
                    case StoneType.Black:
                        fen += 'x';
                        break;
                    case StoneType.White:
                        fen += 'o';
                        break;
                    case StoneType.Gap:
                        fen += '-';
                        break;
                }
            }

            if (y > 0) {
                fen += '/';
            }
        }

        fen += ' ';
        fen += (this.turn == Player.Black) ? 'x' : 'o';

        fen += ' ';
        fen += this.fiftyMovesCounter.toString();

        fen += ' ';
        fen += this.ply.toString();

        return fen;
    }

    fromFen(fen) {
        const fenParts = fen.split(' ');

        // Load the board state
        const boardFen = fenParts[0];

        let x = 0;
        let y = 6;

        for (let i = 0; i < boardFen.length; i++) {
            const square = y * 7 + x;

            switch (boardFen.charAt(i)) {
                case 'x':
                    this.stones[square] = StoneType.Black;
                    x++;
                    break;
                case 'o':
                    this.stones[square] = StoneType.White;
                    x++;
                    break;
                case '-':
                    this.stones[square] = StoneType.Gap;
                    x++;
                    break;
                case '1':
                case '2':
                case '3':
                case '4':
                case '5':
                case '6':
                case '7':
                    // Add as many blank stones as the number indicates
                    const blankStonesCount = Number(fen.charAt(i));

                    for (let k = 0; k < blankStonesCount; k++) {
                        this.stones[square + k] = StoneType.Blank;
                    }

                    x += blankStonesCount;
                    break;
                case '/':
                    x = 0;
                    y--;
                    break;
            }
        }

        // Load the turn
        switch (fenParts[1].charAt(0)) {
            case 'x':
            case 'X':
            case 'b':
            case 'B':
                this.turn = Player.Black;
                break;
            case 'o':
            case 'O':
            case 'w':
            case 'W':
                this.turn = Player.White;
                break;
        }

        // Load counters
        this.fiftyMovesCounter = Number(fenParts[2]) - Number('0');
        this.ply = Number(fenParts[3]) - Number('0');
    }

    isLegal(move) {
        const stoneType = (this.turn == Player.White) ? StoneType.White : StoneType.Black;

        if (move.type == MoveType.Null) {

            // Iterate through all blank squares and check that no friendly stone
            // can move or jump to it.
            for (let square = 0; square < stones.length; square++) {
                if (this.stones[square] == StoneType.Blank && this.surroundingStones(square, stoneType, 2).length > 0) {
                    return false; 
                }
            }

            return true;
        }

        // Check that move.to's value is within range
        if (move.to < 0 || move.to >= 49) {
            return false;
        }

        // Check that the destination is empty
        if (this.stones[move.to] != StoneType.Blank) {
            return false;
        }

        switch (move.type) {
            case MoveType.Single:

                // Check that there is an adjacent, friendly stone to make the move
                return this.surroundingStones(move.to, stoneType, 1).length > 0;
            
            case MoveType.Double:
                // Check that move.from's value is within range
                if (move.from < 0 || move.from >= 49) {
                    return false;
                }

                // Check that there's a friendly stone at the departure square
                return this.stones[move.from] == stoneType;
        }

        return false;
    }

    make(move) {
        let opponent;
        let friendlyStoneType;
        let hostileStoneType;


        switch (this.turn) {
            case Player.White:
                friendlyStoneType = StoneType.White;
                hostileStoneType = StoneType.Black;

                opponent = Player.Black;

                break;
            case Player.Black:
                friendlyStoneType = StoneType.Black;
                hostileStoneType = StoneType.White;

                opponent = Player.White;

                break;
        }

        let newFiftyMovesCounter = 0;

        switch (move.type) {
            case MoveType.Double:
                // Remove the stone that's jumping
                this.stones[move.from] = StoneType.Blank;

                // Increase the fifty-moves counter
                newFiftyMovesCounter = this.fiftyMovesCounter + 1;

                // no break
            case MoveType.Single:
                // Place a friendly stone at the destination
                this.stones[move.to] = friendlyStoneType;

                // Capture all adjacent, hostile stones
                this.surroundingStones(move.to, hostileStoneType, 1).forEach(square => {
                    this.stones[square] = friendlyStoneType;
                });

                break;
        }

        // Swap the turn
        if (this.hasMoves(opponent)) {
            this.turn = opponent;
        }

        // Update the fifty-moves counter
        this.fiftyMovesCounter = newFiftyMovesCounter;

        this.ply++;
    }

    reachableSquares(square) {
        return this.surroundingStones(square, StoneType.Blank, 2);
    }

    countCaptures(move) {
        console.assert(this.isLegal(move));

        switch (this.turn) {
            case Player.White:
                return this.surroundingStones(move.to, StoneType.Black, 1);
            case Player.Black:
                return this.surroundingStones(move.to, StoneType.White, 1);
        }
    }

    // List all the squares in the surroundings of a stone 
    // that contain stones of a given type.

    // The margin indicates how big those surroundings are.
    // For instance, a margin of 1 would comprehend adjacent squares.
    surroundingStones(square, type, margin) {
        console.assert(square >= 0 && square < 49);
        console.assert(type == StoneType.White || type == StoneType.Black || type == StoneType.Blank || type == StoneType.Gap);
        console.assert(margin >= 1 && margin <= 3);

        let squares = [];

        const moveToX = square % 7;
        const moveToY = Math.floor(square / 7);

        for (let y = Math.max(0, moveToY - margin); y <= Math.min(6, moveToY + margin); y++) {
            for (let x = Math.max(0, moveToX - margin); x <= Math.min(6, moveToX + margin); x++) {
                const pos = y * 7 + x;

                if (pos != square && this.stones[pos] == type) {
                    squares.push(pos);
                }
            }
        }

        return squares;
    }

    // List with the possible moves for a given stone
    stoneMoves(square) {
        console.assert(square >= 0 && square < 49);
        console.assert(this.stones[square] == StoneType.White || this.stones[square] == StoneType.Black);

        return this.reachableSquares(square).map(squareTo => this.createMove(squareTo, square));
    }

    // Detects if a side has available moves
    hasMoves(side) {
        console.assert(side == Player.White || side == Player.Black);

        const stoneType = (side == Player.White) ? StoneType.White : StoneType.Black;

        for (let square = 0; square < 49; square++) {
            if (this.stones[square] == stoneType && this.reachableSquares(square).length > 0) {
                return true;
            }
        }

        return false;
    }

    movesLeft() {
        for (let y = 0; y < 7; y++) {
            for (let x = 0; x < 7; x++) {
                let idx = 7 * y + x;

                if (this.stones[idx] != StoneType.Blank) {
                    continue;
                }

                // See if a stone can move here
                for (let i = 0; i < move_offsets.length; i++) {
                    let nx = x + move_offsets[i][0];
                    let ny = y + move_offsets[i][1];

                    // We went off the edge of the board
                    if (nx < 0 || nx > 6 || ny < 0 || ny > 6) {
                        continue;
                    }

                    let nidx = 7 * ny + nx;

                    if (this.stones[nidx] == StoneType.Black || this.stones[nidx] == StoneType.White) {
                        return true;
                    }
                }
            }    
        }

        return false;
    }

    legalMoves() {
        if (this.result()) {
            return [];
        }

        let moves = [];

        for (let y = 0; y < 7; y++) {
            for (let x = 0; x < 7; x++) {
                let idx = 7 * y + x;

                // Single moves
                if (this.stones[idx] == StoneType.Blank) {
                    for (let i = 0; i < single_offsets.length; i++) {
                        let nx = x + single_offsets[i][0];
                        let ny = y + single_offsets[i][1];

                        // We went off the edge of the board
                        if (nx < 0 || nx > 6 || ny < 0 || ny > 6) {
                            continue;
                        }

                        let nidx = 7 * ny + nx;

                        if ((this.turn == Player.Black && this.stones[nidx] == StoneType.Black) ||
                            (this.turn == Player.White && this.stones[nidx] == StoneType.White)) {
                            moves.push(Move.createMove(idx));
                            break;
                        }
                    }
                }

                // Double moves
                if ((this.turn === Player.Black && this.stones[idx] === StoneType.Black) ||
                    (this.turn === Player.White && this.stones[idx] === StoneType.White)) {
                    for (let i = 0; i < double_offsets.length; i++) {
                        let nx = x + double_offsets[i][0];
                        let ny = y + double_offsets[i][1];

                        // We went off the edge of the board
                        if (nx < 0 || nx > 6 || ny < 0 || ny > 6) {
                            continue;
                        }

                        let nidx = 7 * ny + nx;
                        if (this.stones[nidx] === StoneType.Blank) {
                            moves.push(Move.createMove(nidx, idx));
                        }
                    }
                }
            }    
        }

        // Pass
        if (moves.length == 0) {
            moves.push(Move.createMove());
        }

        return moves;
    }

    // Determine if the game has ended and the proper result
    result() {
        let numBlack = 0;
        let numWhite = 0;

        for (let i = 0; i < 49; i++) {
            if (this.stones[i] == StoneType.White) {
                numWhite++;
            } else if (this.stones[i] == StoneType.Black) {
                numBlack++;
            }
        }

        if (!this.movesLeft() || numBlack == 0 || numWhite == 0) {
            if (numBlack > numWhite) {
                return Result.BlackWin;
            } else if (numWhite > numBlack) {
                return Result.WhiteWin;
            } else {
                return Result.Draw;
            }
        }

        if (this.fiftyMovesCounter >= 100) {
            return Result.Draw;
        }

        return Result.None;
    }

    toString() {
        let boardString = "";

        for (let y = 6; y >= 0; y--) {
            for (let x = 0; x < 7; x++) {
                let idx = 7 * y + x;
                switch (this.stones[idx]) {
                    case StoneType.Blank:
                        boardString += "-";
                        break;
                    case StoneType.Gap:
                        boardString += " ";
                        break;
                    case StoneType.Black:
                        boardString += "x";
                        break;
                    case StoneType.White:
                        boardString += "o";
                        break;
                    default:
                        boardString += "?";
                        break;
                }
            }

            boardString += "\n";
        }

        if (this.turn == Player.Black) {
            boardString += "x";
        } else if (this.turn == Player.White) {
            boardString += "o";
        } else {
            boardString += "?";
        }

        return boardString
    }
}

function copy(dst, src) {
    dst.turn = src.turn;
    dst.ply = src.ply;
    dst.fiftyMovesCounter = src.fiftyMovesCounter;

    for (let i = 0; i < 49; i++) {
        dst.stones[i] = src.stones[i];
    }
}

module.exports = {Board, initialFen, copy}
},{"./move":6,"./types":7}],6:[function(require,module,exports){
const MoveType = require('./types').MoveType
const Util = require('./util')

function createMove(to, from) {
    if (to == undefined) {
        type = MoveType.Null;
    } else if (from == undefined) {
        type = MoveType.Single;
        from = -1;
    } else {
        switch (Util.distance(from, to)) {
            case 1:
                type = MoveType.Single;
                break;
            case 2:
                type = MoveType.Double;
                break;
            default:
                console.assert(false);
        }
    }

    return {
        from,
        to,
        type,

        toString: function() {
            switch (this.type) {
                case MoveType.Single:
                    if (from >= 0 && from < 49) {
                        return Util.squareToCoordinate(from) + Util.squareToCoordinate(to);
                    } else {
                        return Util.squareToCoordinate(to);
                    }
                case MoveType.Double:
                    return Util.squareToCoordinate(from) + Util.squareToCoordinate(to);
                case MoveType.Null:
                    return '0000';
            }
        }
    };
}

function createMoveFromString(moveString) {
    switch (moveString.length) {
        case 2:
            return createMove(Util.coordinateToSquare(moveString));
        case 4:
            return createMove(Util.coordinateToSquare(moveString.substr(2,2)), Util.coordinateToSquare(moveString.substr(0,2)));
    }
}

module.exports = {createMove, createMoveFromString}
},{"./types":7,"./util":8}],7:[function(require,module,exports){
const MoveType = {
    Single: 0,
    Double: 1,
    Null: 2
}

const Player = {
    White: "white",
    Black: "black"
}

const StoneType = {
    White: 0,
    Black: 1,
    Blank: 2,
    Gap: 3
}

const Result = {
    None: 0,
    Draw: 1,
    BlackWin: 2,
    WhiteWin: 3
}

module.exports = {MoveType, Player, StoneType, Result}
},{}],8:[function(require,module,exports){
function coordinateToSquare(coordinate) {
    const x = coordinate.charCodeAt(0) - "a".charCodeAt(0);
    const y = coordinate.charCodeAt(1) - "1".charCodeAt(0);

    return y * 7 + x;
}

function squareToCoordinate(square) {
    const x = square % 7;
    const y = square / 7;

    return String.fromCharCode("a".charCodeAt(0) + x) + String.fromCharCode("1".charCodeAt(0) + y);
}

function distance(s1, s2) {
    const x1 = s1 % 7
    const x2 = s2 % 7

    const y1 = Math.floor(s1 / 7)
    const y2 = Math.floor(s2 / 7)

    return Math.max(Math.abs(x1 - x2), Math.abs(y1 - y2))
}

module.exports = {coordinateToSquare, squareToCoordinate, distance}
},{}]},{},[1,2,3,4]);
