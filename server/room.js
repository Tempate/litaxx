const Board = require("../lib/board")
const Move = require("../lib/move")
const Player = require("../lib/types").Player

function createRoom(io) {
    const code = genCode()

    let board = Board.createBoard()
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
        
        makeMove: function(moveString) {
            const parts = moveString.split("_")
            const from = parseInt(parts[0])
            const to = parseInt(parts[1])
        
            const move = Move.createMove(to, from)
        
            if (board.isLegal(move)) {
                board.make(move)
        
                io.to(code).emit("played_move", moveString)
                this.setTurn()
            }
        },
        
        setColor: function(user) {
            switch (users.length) {
                case 1:
                    players.push(user)
                    return "black"
                case 2:
                    players.push(user)
                    return "white"
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
            console.log(board.turn)

            switch (board.turn) {
                case Player.Black:
                    io.to(code).emit("turn", "black")
                    break;
                case Player.White:
                    io.to(code).emit("turn", "white")
                    break;
            }
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

module.exports = createRoom