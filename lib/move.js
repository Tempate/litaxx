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