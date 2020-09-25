const MoveType = require('./types').MoveType
const Board = require('./board')

function createMove(to, from) {
    if (from == undefined) {
        type = MoveType.Single
        from = -1
    } else {
        if (Board.distance(from, to) == 1) {
            type = MoveType.Single
            from = -1
        } else {
            type = MoveType.Double
        }
    }

    return {
        from,
        to,
        type,

        toString: function() {
            switch (type) {
                case MoveType.Single:
                    return Board.squareToCoordinate(to)
                case MoveType.Double:
                    return Board.squareToCoordinate(from) + Board.squareToCoordinate(to)
                case MoveType.Null:
                    return '0000'
            }
        }
    };
}

function createMoveFromString(moveString) {
    switch (moveString.length) {
        case 2:
            return createMove(Board.coordinateToSquare(moveString))
        case 4:
            return createMove(Board.coordinateToSquare(moveString.substr(2,2)), Board.coordinateToSquare(moveString.substr(0,2)))
    }
}

module.exports = {createMove, createMoveFromString}