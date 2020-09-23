const MoveType = require('./types').MoveType
const Board = require('./board').Board

class Move {
    constructor(to, from) {
        this.to = to

        if (from == undefined) {
            this.type = MoveType.Single
            this.from = -1
        } else {
            if (Board.distance(from, to) == 1) {
                this.type = MoveType.Single
                this.from = -1
            } else {
                this.type = MoveType.Double
                this.from = from
            }
        }
    }

    toString() {
        switch (this.type) {
            case MoveType.Single:
                return Board.square_to_coordinate(this.to)
            case MoveType.Double:
                return Board.square_to_coordinate(this.from) + Board.square_to_coordinate(this.to)
            case MoveType.Null:
                return '0000'
        }
    }

    static fromString(move_string) {

        switch (move_string.length) {
            case 2:
                return new Move(Board.coordinate_to_square(move_string))
            case 4:
                return new Move(Board.coordinate_to_square(move_string.substr(2,2)), Board.coordinate_to_square(move_string.substr(0,2)))
        }
    }
}

module.exports = {Move}