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

const Board = require("./board");

const Move  = require("../../../../jsataxx/move");
const Types = require("../../../../jsataxx/types");


const HIGHLIGHT_DRAW_BUTTON_CLASS = "highlight-draw-button";

// HTML elements
const labels = {
    "color":      document.querySelector("#color"),
    "result":     document.querySelector("#result"),
    "spectators": document.querySelector("#spectators")
};

const buttons = {
    "previous-move": document.querySelector("#previous-move"),
    "next-move":     document.querySelector("#next-move"),
    "resign":        document.querySelector("#resign"),
    "draw":          document.querySelector("#draw")
};

const counters = {
    "white": document.querySelector("#numeric-white-stone-counter"),
    "black": document.querySelector("#numeric-black-stone-counter")
};

function createGame() {
    let board = Board.createHtmlBoard();

    let boardHistory = [], moveHistory = [];
    let indexHistory = 0;

    return {
        board,

        click: function(event) {
            const element = document.elementFromPoint(event.clientX, event.clientY);
            const move = board.click(element);

            // undefined if the click doesn't make a move
            if (move != undefined) {
                moveHistory.push(move);
                
                const result = board.board.result();

                if (result != Types.Result.None) {
                    this.end(result);
                }
            }

            return move;
        },

        // Navigate through the move's history
        keydown: function(event) {
            event = event || window.event;
    
            switch (event.key) {
                case 'ArrowLeft':
                    this.previousMove();
                    break;
                case 'ArrowRight':
                    this.nextMove();
                    break;
            }
        },

        makeMove: function(move) {
            board.make(move);

            board.lowlight();
            board.highlight(move);
            
            moveHistory.push(move);

            if (buttons["draw"].classList.contains(HIGHLIGHT_DRAW_BUTTON_CLASS)) {
                buttons["draw"].classList.remove(HIGHLIGHT_DRAW_BUTTON_CLASS);
            }
        },

        previousMove: function() {
            if (indexHistory <= 0) {
                return;
            }
        
            indexHistory--;
            board.fromFen(boardHistory[indexHistory]);
        
            board.lowlight();
        
            if (indexHistory >= 1) {
                board.highlight(moveHistory[indexHistory - 1]);
            }
        },
        
        nextMove: function() {
            if (indexHistory >= boardHistory.length - 1) {
                return;
            }
        
            indexHistory++;
            board.fromFen(boardHistory[indexHistory]);
        
            board.lowlight();
        
            if (indexHistory >= 1) {
                board.highlight(moveHistory[indexHistory - 1], false);
            }
        },

        setBoardHistory: function(boardHistoryString) {
            boardHistory = boardHistoryString.split(" & ");

            board.fromFen(boardHistory[boardHistory.length - 1]);
            indexHistory = boardHistory.length - 1;
        },

        setMoveHistory: function(moveHistoryString) {
            let moves = moveHistoryString.split(" ");

            moves.forEach(moveString => {
                moveHistory.push(Move.createMoveFromString(moveString));
            });
        },

        setFen: function(fen) {
            boardHistory.push(fen);
        
            // Use the fen to set the board when it's the initial position and
            // when the user was looking at a previous position when the move
            // was played
            if (boardHistory.length == 1 || indexHistory < boardHistory.length - 2) {
                board.fromFen(fen);
            }
        
            indexHistory = boardHistory.length - 1;
        },

        setColor: function(color) {
            // If the color is set, the user is a player 
            // Otherwise, he's an spectator
            board.color = color;
        
            labels["color"].innerHTML = "You are playing " + color;
        
            // Only show resign and draw buttons when the user is a player
            buttons["resign"].classList.remove("d-none");
            buttons["draw"].classList.remove("d-none");
        },

        setTurn: function(turn) {
            const TURN_MARKER_CLASS = "numeric-counter-turn-marker";
            const opponent = (turn === "black") ? "white" : "black";

            if (!counters[turn].classList.contains(TURN_MARKER_CLASS)) {
                counters[turn].classList.add(TURN_MARKER_CLASS);
            }

            counters[opponent].classList.remove(TURN_MARKER_CLASS);
        },

        setSpectators: function(count) {
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
        },

        setDrawOffer: function() {
            if (!buttons["draw"].classList.contains(HIGHLIGHT_DRAW_BUTTON_CLASS)) {
                buttons["draw"].classList.add(HIGHLIGHT_DRAW_BUTTON_CLASS);
                console.log("Set draw offer");
            }
        },

        end: function(result) {
            console.assert(result != Types.Result.None);
            
            labels["color"].innerHTML = "";

            if (!buttons["resign"].classList.contains("d-none")) {
                buttons["resign"].classList.add("d-none");
            }

            if (!buttons["draw"].classList.contains("d-none")) {
                buttons["draw"].classList.add("d-none");
            }

            switch (result) {
                case Types.Result.Draw:
                    labels["result"].innerHTML = "The game was a draw";
                    break;
                case Types.Result.WhiteWin:
                    labels["result"].innerHTML = "White has won the game";
                    break;
                case Types.Result.BlackWin:
                    labels["result"].innerHTML = "Black has won the game";
                    break;
            }
        }
    }
}

let game = createGame();

window.addEventListener('keydown', e => game.keydown(e));

buttons["previous-move"].addEventListener('click', _ => game.previousMove());
buttons["next-move"    ].addEventListener('click', _ => game.nextMove());

module.exports = game;
