const Board = require("../lib/board").Board
const Move = require("../lib/move").Move
const Player = require("../lib/types").Player

class Room {
    constructor(io) {
        this.io = io

        this.code = Room.genCode()

        this.board = new Board()
        this.board.starting_position()

        this.players = []
        this.users = []
    }

    join(socket) {
        console.log('Joining game:', this.code)
    
        const user = socket.id
        this.users.push(user)
        
        socket.join(this.code)
        this.io.to(user).emit("game_code", this.code)

        const color = this.setColor(user)
    
        if (color) 
            this.io.to(user).emit("color", color)
        else
            this.io.to(this.code).emit("spectators", this.users.length - 2)

        const fen = this.board.to_fen()
        this.io.to(user).emit("fen", fen)

        this.setTurn()
    }

    makeMove(moveString) {
        const parts = moveString.split("_")
        const from = parseInt(parts[0])
        const to = parseInt(parts[1])

        const move = new Move(to, from)

        if (this.board.is_legal(move)) {
            this.board.make(move)

            this.io.to(this.code).emit("played_move", moveString)
            this.setTurn()
        }
    }

    setColor(user) {
        switch (this.users.length) {
            case 1:
                this.players.push(user)
                return "black"
            case 2:
                this.players.push(user)
                return "white"
            default:
                return null
        }
    }

    setFen(fen) {
        if (this.board.to_fen() === Board.starting_fen) {
            this.board.from_fen(fen)
            this.io.to(this.code).emit("fen", fen)
        }
    }

    setTurn() {
        switch (this.board.turn) {
            case Player.Black:
                this.io.to(this.code).emit("turn", "black")
                break;
            case Player.White:
                this.io.to(this.code).emit("turn", "white")
                break;
        }
    }

    static genCode() {
        let code = ""
    
        for (let i = 0; i < 4; i++)
            code += String.fromCharCode("A".charCodeAt(0) + Number(Math.random() * 26))
    
        return code
    }

    static genRandomColor() {
        return (Math.random() > 0.5) ? "black" : "white"
    }
}

module.exports = {Room}