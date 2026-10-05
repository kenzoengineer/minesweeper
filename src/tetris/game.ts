import { canFall, fits, generateMove, place, rotateClockwise } from "./optimizer";

export enum SquareState {
  empty = 0,
  placed = 1,
  active = 2,
}

// color indexes into the palette in TetrisBoard
export type Square = { state: SquareState; color: number };

export type BoardState = Square[][];

// 1 where the piece has a square
export type Tetromino = number[][];

export type ActiveContainer = { shape: Tetromino; color: number; x: number; y: number };

type Piece = { shape: Tetromino; color: number };

// colors index into the palette in TetrisBoard, matching the standard tetris colors
const Tetrominos: Record<string, Piece> = {
  o: { shape: [[1,1],[1,1]], color: 1 },
  i: { shape: [[0,0,0,0],[1,1,1,1],[0,0,0,0],[0,0,0,0]], color: 0 },
  t: { shape: [[0, 1, 0], [1, 1, 1],[0,0,0]], color: 2 },
  s: { shape: [[0, 1, 1], [1, 1, 0],[0,0,0]], color: 3 },
  z: { shape: [[1, 1, 0], [0, 1, 1],[0,0,0]], color: 4 },
  j: { shape: [[1,0,0], [1, 1,1], [0,0,0]], color: 5 },
  l: { shape: [[0, 0,1], [1, 1,1], [0,0,0]], color: 6 },
};

// each square is its own object so writing to one cell doesn't touch any other
export const emptyBoard = (width: number, height: number): BoardState =>
  Array.from({ length: height }, () =>
    Array.from({ length: width }, () => ({ state: SquareState.empty, color: 0 })),
  );

// the piece can turn and slide every step, but only falls one row every this many steps
const GRAVITY_EVERY = 3;

export class Tetris {
  // placed squares only; the active piece is drawn on top in step()
  board: BoardState;
  active: ActiveContainer | null = null;
  // where the active piece is heading, picked once when it spawns
  private targetX = 0;
  private rotationsLeft = 0;
  private tick = 0;
  // one of each tetromino in random order; spawn() pops from it and refills when empty
  private bag: Piece[] = [];

  private width: number;

  constructor(width: number, height: number) {
    this.width = width;
    this.board = emptyBoard(width, height);
  }

  // drop the next tetromino from the bag in at the top, centred, and pick where it should land
  private spawn() {
    if (this.bag.length === 0) {
      this.bag = Object.values(Tetrominos);
      // fisher-yates
      for (let i = this.bag.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [this.bag[i], this.bag[j]] = [this.bag[j], this.bag[i]];
      }
    }
    const { shape, color } = this.bag.pop()!;
    this.active = { shape, color, x: Math.floor((this.width - shape[0].length) / 2), y: 0 };
    // spawned into the stack: game over, start a fresh board
    if (!fits(this.board, this.active)) {
      this.board = emptyBoard(this.width, this.board.length);
    }
    const target = generateMove(this.board, this.active);
    this.targetX = target?.move.x ?? this.active.x;
    this.rotationsLeft = target?.rotations ?? 0;
  }

  step(): BoardState {
    this.tick++;
    if (!this.active) {
      this.spawn();
    }

    const state = this.board.map((row) => [...row]);
    if (this.active) {
      const { shape, color, x, y } = this.active;

      // draw active shape
      shape.forEach((row, dy) =>
        row.forEach((square, dx) => {
          if (square) {
            state[y + dy][x + dx] = { state: SquareState.active, color };
          }
        }),
      );

      // turn 90 degrees towards the target rotation, if nothing is in the way
      if (this.rotationsLeft > 0) {
        const turned = { ...this.active, shape: rotateClockwise(this.active.shape) };
        if (fits(this.board, turned)) {
          this.active.shape = turned.shape;
          this.rotationsLeft--;
        }
      }

      // slide one column towards the target, if nothing is in the way
      const shift = { ...this.active, x: this.active.x + Math.sign(this.targetX - this.active.x) };
      if (fits(this.board, shift)) {
        this.active.x = shift.x;
      }

      // gravity; once the piece is lined up with its target it fast drops every step
      const lined = this.rotationsLeft === 0 && this.active.x === this.targetX;
      if (!lined && this.tick % GRAVITY_EVERY !== 0) {
        return state;
      }
      if (canFall(this.board, this.active)) {
        this.active.y++;
      } else {
        this.board = place(this.board, this.active);
        // drop full rows and pad the top with empty ones
        const kept = this.board.filter((row) => row.some((square) => square.state === SquareState.empty));
        this.board = [...emptyBoard(this.width, this.board.length - kept.length), ...kept];
        // the stack reached the top row: game over, start a fresh board
        if (this.board[0].some((square) => square.state !== SquareState.empty)) {
          this.board = emptyBoard(this.width, this.board.length);
        }
        this.active = null;
        return state;
      }
    }
    return state;
  }
}
