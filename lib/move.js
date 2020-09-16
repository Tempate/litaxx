"use strict";
exports.__esModule = true;
exports.Move = exports.MoveType = void 0;
var board_1 = require("./board");
var MoveType;
(function (MoveType) {
    MoveType[MoveType["Single"] = 0] = "Single";
    MoveType[MoveType["Double"] = 1] = "Double";
    MoveType[MoveType["Null"] = 2] = "Null";
})(MoveType = exports.MoveType || (exports.MoveType = {}));
var Move = /** @class */ (function () {
    function Move(to, from) {
        this.to = board_1.Board.coordinate_to_square(to);
        if (from == undefined) {
            this.type = MoveType.Single;
            this.from = -1;
        }
        else {
            this.type = MoveType.Double;
            this.from = board_1.Board.coordinate_to_square(from);
        }
    }
    Move.prototype.toString = function () {
        switch (this.type) {
            case MoveType.Single:
                return board_1.Board.square_to_coordinate(this.to);
            case MoveType.Double:
                return board_1.Board.square_to_coordinate(this.from) + board_1.Board.square_to_coordinate(this.to);
            case MoveType.Null:
                return '0000';
        }
    };
    return Move;
}());
exports.Move = Move;
var board = new board_1.Board();
var squares = board.reachable_squares("g7");
squares.forEach(function (square) {
    console.log(board_1.Board.square_to_coordinate(square));
});
