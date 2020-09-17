const Player = {
    White: 0,
    Black: 1 
}

const StoneType = {
    Blank: 0,
    Gap: 1,
    White: 2,
    Black: 3
}

class Board {
    stones;
    turn;

    ply;
    fifty_moves_counter;

    constructor() {
        this.stones = [];

        for (let i = 0; i < 49; i++)
            this.stones.push(StoneType.Blank);

        this.turn = Player.Black;
        this.ply = 0;
        this.fifty_moves_counter = 0;
    }

    to_fen() {
        let fen = "";

        for (let y = 6; y >= 0; y--) {
            for (let x = 0; x < 7; x++) {
                const square = y * 7 + x;
                const stone = this.stones[square];

                switch (stone) {
                    case StoneType.Blank:
                        // If the last character is a number, increase it.
                        // Otherwise, append a 1.

                        if (fen.length == 0 || isNaN(Number(fen.charAt(fen.length - 1)))) {
                            fen += '1';
                        } else {
                            fen = fen.substring(0, fen.length - 1) + (Number(fen.charAt(fen.length - 1)) + 1).toString();
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

            if (y > 0)
                fen += '/';
        }

        fen += ' ';
        fen += (this.turn == Player.Black) ? 'x' : 'o';

        fen += ' ';
        fen += this.fifty_moves_counter.toString();
        
        fen += ' ';
        fen += this.ply.toString();

        return fen;
    }

    from_fen(fen) {
        const fen_parts = fen.split(' ');

        // Load the board state
        const board_fen = fen_parts[0];

        let x = 0;
        let y = 6;

        for (let i = 0; i < board_fen.length; i++) {
            const square = y * 7 + x;

            switch (board_fen.charAt(i)) {
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
                    const blank_stones_count = Number(fen.charAt(i));

                    for (let k = 0; k < blank_stones_count; k++) {
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
    }

    is_legal(move) {
        const friendly_stone_type = (this.turn == Player.White) ? StoneType.White : StoneType.Black;

        if (move.type == MoveType.Null) {

            // Iterate through all blank squares and check that no friendly stone
            // can move or jump to it.
            for (let square = 0; square < this.stones.length; square++) {
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
            case MoveType.Single:

                // Check that there is an adjacent, friendly stone to make the move
                return this.surrounding_stones(move.to, friendly_stone_type, 1).length > 0;
            
            case MoveType.Double:
                // Check that move.from's value is within range
                if (move.from < 0 || move.from >= 49)
                    return false;

                // Check that there's a friendly stone at the departure square
                return this.stones[move.from] == friendly_stone_type;
        }

        return false;
    }

    make(move) {
        let friendly_stone_type;
        let hostile_stone_type;

        if (this.turn == Player.White) {
            friendly_stone_type = StoneType.White;
            hostile_stone_type = StoneType.Black;
        } else {
            friendly_stone_type = StoneType.Black;
            hostile_stone_type = StoneType.White;
        }

        let new_fifty_moves_counter = 0;

        switch (move.type) {
            case MoveType.Double:
                // Remove the stone that's jumping
                this.stones[move.from] = StoneType.Blank;

                // Increase the fifty-moves counter
                new_fifty_moves_counter = this.fifty_moves_counter + 1;

                // no break
            case MoveType.Single:
                // Place a friendly stone at the destination
                this.stones[move.to] = friendly_stone_type;

                // Capture all adjacent, hostile stones
                this.surrounding_stones(move.to, hostile_stone_type, 1).forEach(square => {
                    this.stones[square] = friendly_stone_type;
                });

                break;
        }

        // Swap the turn
        this.turn = (this.turn == Player.White) ? Player.Black : Player.White;

        // Update the fifty-moves counter
        this.fifty_moves_counter = new_fifty_moves_counter;

        this.ply++;
    }

    reachable_squares(coordinate) {
        const square = Board.coordinate_to_square(coordinate);
        return this.surrounding_stones(square, StoneType.Blank, 2);
    }

    // List all the squares in the surroundings of a stone 
    // that contain stones of a given type.

    // The margin indicates how big those surroundings are.
    // For instance, a margin of 1 would comprehend adjacent squares.
    surrounding_stones(square, type, margin) {
        let squares = [];

        const move_to_x = square % 7;
        const move_to_y = Math.floor(square / 7);

        for (let y = Math.max(0, move_to_y - margin); y <= Math.min(6, move_to_y + margin); y++) {
            for (let x = Math.max(0, move_to_x - margin); x <= Math.min(6, move_to_x + margin); x++) {
                const pos = y * 7 + x;

                if (pos != square && this.stones[pos] == type)
                    squares.push(pos);
            }
        }

        return squares;
    }

    toString() {
        let board_string = ""

        for (let y = 6; y >= 0; y--) {
            let row = ""
        
            for (let x = 0; x < 7; x++) {
                const square = y * 7 + x

                switch (board.stones[square]) {
                    case StoneType.Blank:
                        row += "_";
                        break;
                    case StoneType.Gap:
                        row += "*";
                        break;
                    case StoneType.Black:
                        row += "x";
                        break;
                    case StoneType.White:
                        row += "o";
                        break;
                }

                row += " ";
            }
        
            board_string += row + "\n"
        }

        return board_string
    }

    static coordinate_to_square(coordinate) {
        const x = coordinate.charCodeAt(0) - "a".charCodeAt(0);
        const y = coordinate.charCodeAt(1) - "1".charCodeAt(0);
    
        return y * 7 + x;
    }
    
    static square_to_coordinate(square) {
        const x = square % 7;
        const y = square / 7;
    
        return String.fromCharCode("a".charCodeAt(0) + x) + String.fromCharCode("1".charCodeAt(0) + y);
    }
}