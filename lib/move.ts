import { Board } from './board'

export enum MoveType {
    Single, Double, Null
}

export class Move {
    from: number;
    to: number;

    type: MoveType;

    constructor(to: string, from?: string) {
        this.to = Board.coordinate_to_square(to);

        if (from == undefined) {
            this.type = MoveType.Single;
            this.from = -1;
        } else {
            this.type = MoveType.Double;
            this.from = Board.coordinate_to_square(from);
        }
    }

    toString(): string {
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

let board: Board = new Board();
let squares = board.reachable_squares("g7");

squares.forEach(square => {
    console.log(Board.square_to_coordinate(square));
});