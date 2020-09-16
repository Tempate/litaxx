"use strict";
exports.__esModule = true;
exports.Board = void 0;
var move_1 = require("./move");
var Player;
(function (Player) {
    Player[Player["White"] = 0] = "White";
    Player[Player["Black"] = 1] = "Black";
})(Player || (Player = {}));
var StoneType;
(function (StoneType) {
    StoneType[StoneType["Blank"] = 0] = "Blank";
    StoneType[StoneType["Gap"] = 1] = "Gap";
    StoneType[StoneType["White"] = 2] = "White";
    StoneType[StoneType["Black"] = 3] = "Black";
})(StoneType || (StoneType = {}));
var Board = /** @class */ (function () {
    function Board() {
        this.stones = [];
        for (var i = 0; i < 49; i++)
            this.stones.push(StoneType.Blank);
        this.turn = Player.Black;
        this.ply = 0;
        this.fifty_moves_counter = 0;
    }
    Board.prototype.to_fen = function () {
        var fen = "";
        for (var y = 6; y >= 0; y--) {
            for (var x = 0; x < 7; x++) {
                var square = y * 7 + x;
                var stone = this.stones[square];
                switch (stone) {
                    case StoneType.Blank:
                        // If the last character is a number, increase it.
                        // Otherwise, append a 1.
                        if (fen.length == 0 || isNaN(Number(fen.charAt(fen.length - 1)))) {
                            fen += '1';
                        }
                        else {
                            fen = fen.substring(0, fen.length - 1);
                            fen += (Number(fen.charAt(fen.length - 1)) + 1).toString();
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
            fen += '/';
        }
        fen += ' ';
        fen += (this.turn == Player.Black) ? 'x' : 'o';
        fen += ' ';
        fen += this.fifty_moves_counter.toString();
        fen += ' ';
        fen += this.ply.toString();
        return fen;
    };
    Board.prototype.from_fen = function (fen) {
        var fen_parts = fen.split(' ');
        // Load the board state
        var board_fen = fen_parts[0];
        var x = 0;
        var y = 6;
        for (var i = 0; i < board_fen.length; i++) {
            var square = y * 7 + x;
            var fen_char = board_fen.charAt(i);
            switch (fen_char) {
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
                    var blank_stones_count = fen.charCodeAt(i) - Number('0');
                    for (var k = 0; k < blank_stones_count; k++) {
                        this.stones[square + k] = StoneType.Blank;
                    }
                    x += blank_stones_count;
                    break;
                case '/':
                    x = 0;
                    y--;
                    break;
            }
        }
        // Load the turn
        switch (fen_parts[1].charAt(0)) {
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
        this.fifty_moves_counter = Number(fen_parts[2]) - Number('0');
        this.ply = Number(fen_parts[3]) - Number('0');
    };
    Board.prototype.is_legal = function (move) {
        var friendly_stone_type = (this.turn == Player.White) ? StoneType.White : StoneType.Black;
        if (move.type == move_1.MoveType.Null) {
            // Iterate through all blank squares and check that no friendly stone
            // can move or jump to it.
            for (var square = 0; square < this.stones.length; square++) {
                if (this.stones[square] != StoneType.Blank)
                    continue;
                if (this.surrounding_stones(square, friendly_stone_type, 2).length > 0)
                    return false;
            }
            return true;
        }
        // Check that move.to's value is within range
        if (move.to < 0 || move.to >= 49)
            return false;
        // Check that the destination is empty
        if (this.stones[move.to] != StoneType.Blank)
            return false;
        switch (move.type) {
            case move_1.MoveType.Single:
                // Check that there is an adjacent, friendly stone to make the move
                return this.surrounding_stones(move.to, friendly_stone_type, 1).length > 0;
            case move_1.MoveType.Double:
                // Check that move.from's value is within range
                if (move.from < 0 || move.from >= 49)
                    return false;
                // Check that there's a friendly stone at the departure square
                return this.stones[move.from] == friendly_stone_type;
        }
        return false;
    };
    Board.prototype.make = function (move) {
        var _this = this;
        var friendly_stone_type;
        var hostile_stone_type;
        if (this.turn == Player.White) {
            friendly_stone_type = StoneType.White;
            hostile_stone_type = StoneType.Black;
        }
        else {
            friendly_stone_type = StoneType.Black;
            hostile_stone_type = StoneType.White;
        }
        var new_fifty_moves_counter = 0;
        switch (move.type) {
            case move_1.MoveType.Double:
                // Remove the stone that's jumping
                this.stones[move.from] = StoneType.Blank;
                // Increase the fifty-moves counter
                new_fifty_moves_counter = this.fifty_moves_counter + 1;
            // no break
            case move_1.MoveType.Single:
                // Place a friendly stone at the destination
                this.stones[move.to] = friendly_stone_type;
                // Capture all adjacent, hostile stones
                this.surrounding_stones(move.to, hostile_stone_type, 1).forEach(function (square) {
                    _this.stones[square] = friendly_stone_type;
                });
                break;
        }
        // Swap the turn
        if (this.turn == Player.White)
            this.turn = Player.Black;
        else
            this.turn = Player.White;
        // Update the fifty-moves counter
        this.fifty_moves_counter = new_fifty_moves_counter;
        this.ply += 1;
    };
    Board.prototype.reachable_squares = function (coordinate) {
        var square = Board.coordinate_to_square(coordinate);
        return this.surrounding_stones(square, StoneType.Blank, 2);
    };
    // List all the squares in the surroundings of a stone 
    // that contain stones of a given type.
    // The margin indicates how big those surroundings are.
    // For instance, a margin of 1 would comprehend adjacent squares.
    Board.prototype.surrounding_stones = function (square, type, margin) {
        var squares = [];
        var move_to_x = square % 7;
        var move_to_y = Math.floor(square / 7);
        for (var y = Math.max(0, move_to_y - margin); y <= Math.min(6, move_to_y + margin); y++) {
            for (var x = Math.max(0, move_to_x - margin); x <= Math.min(6, move_to_x + margin); x++) {
                var pos = y * 7 + x;
                if (this.stones[pos] == type)
                    squares.push(pos);
            }
        }
        return squares;
    };
    Board.coordinate_to_square = function (coordinate) {
        var x = coordinate.charCodeAt(0) - "a".charCodeAt(0);
        var y = coordinate.charCodeAt(1) - "1".charCodeAt(0);
        return y * 7 + x;
    };
    Board.square_to_coordinate = function (square) {
        var x = square % 7;
        var y = square / 7;
        return String.fromCharCode("a".charCodeAt(0) + x) + String.fromCharCode("1".charCodeAt(0) + y);
    };
    return Board;
}());
exports.Board = Board;
