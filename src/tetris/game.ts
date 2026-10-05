import { canFall, place } from "./optimizer";

export enum Square {
  empty = 0,
  placed = 1,
  active = 2,
}

export type BoardState = Square[][];

export type Tetromino = Square[][];

export type ActiveContainer = { shape: Tetromino; x: number; y: number };

const Tetrominos: Record<string, Tetromino> = {
  o: [[2,2],[2,2]],
  i: [[0,0,0,0],[2,2,2,2],[0,0,0,0],[0,0,0,0]],
  t: [[0, 2, 0], [2, 2, 2],[0,0,0]],
  s: [[0, 2, 2], [2, 2, 0],[0,0,0]],
  z: [[2, 2, 0], [0, 2, 2],[0,0,0]],
  j: [[2,0,0], [2, 2,2], [0,0,0]],
  l: [[0, 0,2], [2, 2,2], [0,0,0]],
};

// each row is its own array so writing to one cell doesn't touch every row
export const emptyBoard = (width: number, height: number): BoardState =>
  Array.from({ length: height }, () => Array<Square>(width).fill(Square.empty));

export class Tetris {
  // placed squares only; the active piece is drawn on top in step()
  board: BoardState;
  active: ActiveContainer | null = null;

  private width: number;

  constructor(width: number, height: number) {
    this.width = width;
    this.board = emptyBoard(width, height);
  }

  // drop a random tetromino in at the top, centred
  private spawn() {
    const shapes = Object.values(Tetrominos);
    const shape = shapes[Math.floor(Math.random() * shapes.length)];
    this.active = { shape, x: Math.floor((this.width - shape[0].length) / 2), y: 0 };
  }

  private canRotate(shape: ActiveContainer) {
    const tetromino = shape.shape;
    const rotatedTetromino = this.rotateClockwise(tetromino);
    for (let dy = 0; dy < rotatedTetromino.length; dy++) {
      for (let dx = 0; dx < rotatedTetromino[dy].length; dx++) {
        if (rotatedTetromino[dy][dx] !== Square.empty) {
          // todo: check if rotation puts us outside x too
          if (shape.y + dy + 1 >= this.board.length ||
            this.board[shape.y + dy][shape.x + dx] === Square.placed) {
            return false;
          }
        }
      }
    }
    return true;
  }

  private rotateClockwise(shape: Tetromino) {
      const rows = shape.length;
      const cols = shape[0].length;

      // Create a new array with swapped dimensions
      const rotated = Array.from({ length: cols }, () => Array(rows));

      for (let r = 0; r < rows; r++) {
          for (let c = 0; c < cols; c++) {
              rotated[c][rows - 1 - r] = shape[r][c];
          }
      }

      return rotated;
  }

  step(): BoardState {
    if (!this.active) {
      this.spawn();
    }

    const state = this.board.map((row) => [...row]);
    if (this.active) {
      const { shape, x, y } = this.active;

      // draw shape
      shape.forEach((row, dy) =>
        row.forEach((square, dx) => {
          if (square !== Square.empty) {
            state[y + dy][x + dx] = Square.active;
          }
        }),
      );

      // gravity
      if (canFall(this.board, this.active)) {
        this.active.y++;
      } else {
        this.board = place(this.board, this.active);
        this.active = null;
        return state;
      }

      // rotate
      if (this.active && this.canRotate(this.active)) {
        this.active.shape = this.rotateClockwise(this.active.shape);
      }
    }
    return state;
  }
}
