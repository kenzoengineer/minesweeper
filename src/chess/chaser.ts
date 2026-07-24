import { ChessBoardData } from "./ChessBoard";
import { Knight, Piece, Rook } from "./game";

export class Chaser {
  board: ChessBoardData;
  hunters: Piece[];
  victims: Piece[];

  private width: number;
  private height: number;

  constructor(board: ChessBoardData) {
    this.board = board;
    this.width = board[0]?.length ?? 0;
    this.height = board.length;

    this.hunters = [new Knight(0, 0, true)];
    this.victims = [new Rook(this.width - 1, this.height - 1, false)];
  }

  step(): Piece[] {
    for (let i = 0; i < this.hunters.length; i++) {
      const hunter = this.hunters[i];
      const victim = this.victims[i];
      const { x, y } = hunter.moveTowards(
        hunter.x,
        hunter.y,
        victim.x,
        victim.y,
        this.width,
        this.height,
      );
      hunter.x = x;
      hunter.y = y;

      // caught! respawn the victim somewhere else on the board
      if (hunter.x == victim.x && hunter.y == victim.y) {
        do {
          victim.x = Math.floor(Math.random() * this.width);
          victim.y = Math.floor(Math.random() * this.height);
        } while (victim.x === hunter.x && victim.y === hunter.y);
      }
    }
    return [...this.hunters, ...this.victims];
  }
}
