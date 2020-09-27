const Types = require('./types')

const MoveType  = Types.MoveType
const StoneType = Types.StoneType
const Player    = Types.Player

const initialFen = "x5o/7/7/7/7/7/o5x x 0 1";


function createBoard() {
    let stones = [];

    for (let i = 0; i < 49; i++) {
        stones.push(StoneType.Blank);
    }

    let turn = Player.Black;
    let ply = 0;
    let fiftyMovesCounter = 0;

    return {
        initialFen,
        stones,
        turn,

        toFen: function() {
            let fen = "";

            for (let y = 6; y >= 0; y--) {
                for (let x = 0; x < 7; x++) {
                    const square = y * 7 + x;

                    switch (stones[square]) {
                        case StoneType.Blank:
                            // If the last character is a number, increase it.
                            // Otherwise, append a 1.

                            const lastCharacter = fen.slice(-1)
                            
                            if (!lastCharacter || isNaN(lastCharacter)) { 
                                fen += '1' 
                            } else { 
                                fen = fen.slice(0, -1) + (parseInt(lastCharacter) + 1) 
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

                if (y > 0) {
                    fen += '/';
                }
            }

            fen += ' ';
            fen += (turn == Player.Black) ? 'x' : 'o';

            fen += ' ';
            fen += fiftyMovesCounter.toString();
            
            fen += ' ';
            fen += ply.toString();

            return fen;
        },

        fromFen: function(fen) {
            const fenParts = fen.split(' ');

            // Load the board state
            const boardFen = fenParts[0];

            let x = 0;
            let y = 6;

            for (let i = 0; i < boardFen.length; i++) {
                const square = y * 7 + x;

                switch (boardFen.charAt(i)) {
                    case 'x':
                        stones[square] = StoneType.Black;
                        x++;
                        break;
                    case 'o':
                        stones[square] = StoneType.White;
                        x++;
                        break;
                    case '-':
                        stones[square] = StoneType.Gap;
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
                        const blankStonesCount = Number(fen.charAt(i));

                        for (let k = 0; k < blankStonesCount; k++) {
                            stones[square + k] = StoneType.Blank;
                        }

                        x += blankStonesCount;
                        break;
                    case '/':
                        x = 0;
                        y--;
                        break;
                }
            }

            // Load the turn
            switch (fenParts[1].charAt(0)) {
                case 'x':
                case 'X':
                case 'b':
                case 'B':
                    turn = Player.Black;
                    break;
                case 'o':
                case 'O':
                case 'w':
                case 'W':
                    turn = Player.White;
                    break;
            }

            // Load counters
            this.fiftyMovesCounter = Number(fenParts[2]) - Number('0');
            this.ply = Number(fenParts[3]) - Number('0');
        },

        isLegal: function(move) {
            const friendlyStoneType = (this.turn == Player.White) ? StoneType.White : StoneType.Black;

            if (move.type == MoveType.Null) {
    
                // Iterate through all blank squares and check that no friendly stone
                // can move or jump to it.
                for (let square = 0; square < stones.length; square++) {
                    if (stones[square] != StoneType.Blank)
                        continue;
    
                    if (this.surroundingStones(square, friendlyStoneType, 2).length > 0)
                        return false; 
                }
    
                return true;
            }
    
            // Check that move.to's value is within range
            if (move.to < 0 || move.to >= 49)
                return false;
    
            // Check that the destination is empty
            if (stones[move.to] != StoneType.Blank)
                return false;
    
            switch (move.type) {
                case MoveType.Single:
    
                    // Check that there is an adjacent, friendly stone to make the move
                    return this.surroundingStones(move.to, friendlyStoneType, 1).length > 0;
                
                case MoveType.Double:
                    // Check that move.from's value is within range
                    if (move.from < 0 || move.from >= 49)
                        return false;
    
                    // Check that there's a friendly stone at the departure square
                    return stones[move.from] == friendlyStoneType;
            }
    
            return false;
        },

        make: function(move) {
            let friendlyStoneType;
            let hostileStoneType;
    
            if (this.turn == Player.White) {
                friendlyStoneType = StoneType.White;
                hostileStoneType = StoneType.Black;
            } else {
                friendlyStoneType = StoneType.Black;
                hostileStoneType = StoneType.White;
            }
    
            let newFiftyMovesCounter = 0;
    
            switch (move.type) {
                case MoveType.Double:
                    // Remove the stone that's jumping
                    stones[move.from] = StoneType.Blank;
    
                    // Increase the fifty-moves counter
                    newFiftyMovesCounter = fiftyMovesCounter + 1;
    
                    // no break
                case MoveType.Single:
                    // Place a friendly stone at the destination
                    stones[move.to] = friendlyStoneType;
    
                    // Capture all adjacent, hostile stones
                    this.surroundingStones(move.to, hostileStoneType, 1).forEach(square => {
                        stones[square] = friendlyStoneType;
                    });
    
                    break;
            }
    
            // Swap the turn
            this.turn = (this.turn == Player.White) ? Player.Black : Player.White;
    
            // Update the fifty-moves counter
            fiftyMovesCounter = newFiftyMovesCounter;

            ply++;
        },

        reachableSquares: function(coordinate) {
            const square = coordinateToSquare(coordinate);
            return this.surroundingStones(square, StoneType.Blank, 2);
        },

        // List all the squares in the surroundings of a stone 
        // that contain stones of a given type.

        // The margin indicates how big those surroundings are.
        // For instance, a margin of 1 would comprehend adjacent squares.
        surroundingStones: function(square, type, margin) {
            let squares = [];

            const moveToX = square % 7;
            const moveToY = Math.floor(square / 7);

            for (let y = Math.max(0, moveToY - margin); y <= Math.min(6, moveToY + margin); y++) {
                for (let x = Math.max(0, moveToX - margin); x <= Math.min(6, moveToX + margin); x++) {
                    const pos = y * 7 + x;

                    if (pos != square && stones[pos] == type)
                        squares.push(pos);
                }
            }

            return squares;
        },

        //List with the possible moves for a given stone
        stoneMoves: function(square) {
            console.assert(square >= 0 && square < 49)
            console.assert(stones[square] != StoneType.Gap && stones[square] != StoneType.Blank)

            let mvs = []

            const x = square / 7
            const y = square % 7

            for (var i = -2; i <= 2; i++) {
                for (var j = -2; j <= 2; j++) {
                    const newx = x + i
                    const newy = y + j
                    if (newx < 0 || newx >= 7 || newy < 0 || newy >= 7) {
                        continue
                    }

                    const newsqr = 7*newx + newy
                    if (stones[newsqr] == StoneType.Blank) {
                        mvs.push(createMove(newsqr, square))
                    }
                }
            }

            return mvs
        },

        //Detects if a side has available moves
        hasMoves: function(side) {
            //LOL
            if (side == Player.White) {
                for (var i = 0; i < 49; i++) {
                    if (stones[i] == StoneType.White) {
                        const mvs = this.stoneMoves(i)
                        if (mvs.length != 0) {
                            return true
                        }
                    }
                }
            } else {
                for (var i = 0; i < 49; i++) {
                    if (stones[i] == StoneType.Black) {
                        const mvs = this.stoneMoves(i)
                        if (mvs.length != 0) {
                            return true
                        }
                    }
                }
            }

            return false
        },

        toString: function() {
            let boardString = ""
    
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
            
                boardString += row + "\n"
            }
    
            return boardString
        }
    }
}

function coordinateToSquare(coordinate) {
    const x = coordinate.charCodeAt(0) - "a".charCodeAt(0);
    const y = coordinate.charCodeAt(1) - "1".charCodeAt(0);

    return y * 7 + x;
}

function squareToCoordinate(square) {
    const x = square % 7;
    const y = square / 7;

    return String.fromCharCode("a".charCodeAt(0) + x) + String.fromCharCode("1".charCodeAt(0) + y);
}

function distance(s1, s2) {
    const x1 = s1 % 7
    const x2 = s2 % 7

    const y1 = Math.floor(s1 / 7)
    const y2 = Math.floor(s2 / 7)

    return Math.max(Math.abs(x1 - x2), Math.abs(y1 - y2))
}

module.exports = {createBoard, coordinateToSquare, squareToCoordinate, distance, initialFen}