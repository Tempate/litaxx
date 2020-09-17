const MoveType = {
    Single: 0,
    Double: 1,
    Null: 2
}

class Move {
    from;
    to;

    type;

    constructor(to, from) {
        this.to = Board.coordinate_to_square(to);

        if (from == undefined) {
            this.type = MoveType.Single;
            this.from = -1;
        } else {
            this.type = MoveType.Double;
            this.from = Board.coordinate_to_square(from);
        }
    }

    toString() {
        switch (this.type) {
            case MoveType.Single:
                return Board.square_to_coordinate(this.to);
            case MoveType.Double:
                return Board.square_to_coordinate(this.from) + Board.square_to_coordinate(this.to);
            case MoveType.Null:
                return '0000';
        }
    }
}