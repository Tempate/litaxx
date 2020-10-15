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

const Board = require("../jsataxx/board")
const Move = require("../jsataxx/move")
const Types = require("../jsataxx/types")

const index = require('../index')


function createRoom(io) {
    const code = genCode()

    let startingPosition = Board.initialFen;
    let moveHistory = [];

    let board = new Board.Board()
    board.fromFen(startingPosition)

    let players = []
    let users = []

    let drawOfferingPlayer = null;

    return {
        code: code,

        join: function(socket) {
            const user = socket.id;

            socket.join(code);
            users.push(user);

            // If the color is set, the client will recognize the user as a player
            // Otherwise, it'll increase the spectator count
            const color = this.setColor(user);

            if (color === Types.Player.White || color === Types.Player.Black) {
                io.to(user).emit("color", color);
            } else {
                io.to(code).emit("spectators", users.length - 2);
            }

            const fen = board.toFen()
            io.to(user).emit("fen", fen)

            this.setTurn()
        },

        leave: function(socket) {
            removeElementFromList(socket.id, users);
            removeElementFromList(socket.id, players);

            switch (players.length) {
                case 0:
                    this.delete();
                    break;
                default:
                    io.to(code).emit("spectators", users.length - 2);
                    break;
            }

            return users.length;
        },

        delete: function() {
            users.forEach(user => {
                index.users.delete(user)
            })

            index.rooms.delete(code)
        },

        makeMove: function(moveString, player) {
            const move = Move.createMoveFromString(moveString);

            if (board.isLegal(move)) {
                board.make(move);

                moveHistory.push(move);

                // Don't send the move to the player who played it
                users.forEach(user => {
                    if (user !== player) {
                        io.to(user).emit("played_move", moveString);
                    }
                });

                // Send the board's fen to all users
                io.to(code).emit("fen", board.toFen())
                
                this.setTurn()
            }

            const result = board.result();

            if (result !== Types.Result.None) {
                this.endGame(result)
            }

            drawOfferingPlayer = null;
        },

        offerDraw: function(player) {
            const index = players.indexOf(player);

            if (index == -1) {
                return;
            } else if (drawOfferingPlayer == 1 - index) {
                this.endGame(Types.Result.Draw);
            } else if (players.length == 2) {
                drawOfferingPlayer = index;
                io.to(players[1 - index]).emit("draw_offer");
            }
        },

        resign: function(player) {
            const index = players.indexOf(player);

            switch (index) {
                case 0:
                    this.endGame(Types.Player);
                    break;
                case 1:
                    this.endGame(Types.Player.Black);
                    break;
            }
        },

        endGame: function(result) {
            console.assert(result !== Types.Result.None);

            io.to(code).emit("game_end", result);
            this.delete();
        },

        getUserCount: function() {
            return users.length;
        },

        setColor: function(user) {
            switch (users.length) {
                case 1:
                    players.push(user);
                    return Types.Player.Black;
                case 2:
                    players.push(user);
                    return Types.Player.White;
                default:
                    return null;
            }
        },

        setFen: function(fen) {
            if (players.length == 1) {
                startingPosition = fen;
                board.fromFen(fen);
            }
        },

        setTurn: function() {
            io.to(code).emit("turn", board.turn);
        }
    };
}

function moveHistoryToString(moveHistory) {
    let moveHistoryString = "";

    if (moveHistory.length == 0) {
        return moveHistoryString;
    }

    moveHistory.forEach(move => {
        moveHistoryString += move.toString() + " ";
    });

    // Remove the last space
    return moveHistoryString.slice(0, -1);
}

function genCode() {
    let code = ""

    for (let i = 0; i < 4; i++) {
        code += String.fromCharCode("A".charCodeAt(0) + Number(Math.random() * 26))
    }

    return code
}

function removeElementFromList(element, list) {
    const index = list.indexOf(element);

    if (index > -1) {
        list.splice(index, 1);
    }
}

module.exports = createRoom
