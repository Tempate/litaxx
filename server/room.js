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
const { Player } = require("../jsataxx/types")

function createRoom(io) {
    const code = genCode()

    let board = new Board.Board()
    board.fromFen(Board.initialFen)

    let players = []
    let users = []

    return {
        code: code,

        join: function(socket) {
            console.log('Joining game:', code)

            const user = socket.id
            users.push(user)

            socket.join(code)
            io.to(user).emit("game_code", code)

            const color = this.setColor(user)

            if (color) {
                io.to(user).emit("color", color)
            } else {
                io.to(code).emit("spectators", users.length - 2)
            }

            const fen = board.toFen()
            io.to(user).emit("fen", fen)

            this.setTurn()
        },

        leave: function(socket) {
            removeElementFromList(socket.id, users);
            removeElementFromList(socket.id, players);

            if (players.length == 2) {
                io.to(code).emit("spectators", users.length - 2);
            }

            return users.length;
        },

        resign: function(player) {
            const index = players.indexOf(player);

            switch (index) {
                case 0:
                    this.endGame(Player.White);
                    break;
                case 1:
                    this.endGame(Player.Black);
                    break;
            }
        },

        endGame: function(result) {
            console.assert(result !== Types.Result.None);

            users.forEach(user => {
                io.to(user).emit("game_end", result)
                index.users.delete(user)
            })

            index.rooms.delete(code)
        },

        makeMove: function(moveString) {
            const parts = moveString.split("_")
            const from = parseInt(parts[0])
            const to = parseInt(parts[1])

            const move = Move.createMove(to, from)

            if (board.isLegal(move)) {
                board.make(move)

                io.to(code).emit("played_move", moveString)
                io.to(code).emit("fen", board.toFen())
                
                this.setTurn()
            }

            const result = board.result();

            if (result !== Types.Result.None) {
                this.endGame(result)
            }
        },

        getUserCount: function() {
            return users.length;
        },

        setColor: function(user) {
            switch (users.length) {
                case 1:
                    players.push(user);
                    return Player.Black;
                case 2:
                    players.push(user);
                    return Player.White;
                default:
                    return null
            }
        },

        setFen: function(fen) {
            if (board.toFen() === Board.initialFen) {
                board.fromFen(fen)
                io.to(code).emit("fen", fen)
            }
        },

        setTurn: function() {
            io.to(code).emit("turn", board.turn);
        }
    };
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
