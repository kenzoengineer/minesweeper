import { IconType } from "react-icons";
import {
  FaChessKnight,
  FaChessRook,
  FaChessBishop,
  FaChessKing,
} from "react-icons/fa";

type coord = {
  x: number;
  y: number;
};

export abstract class Piece {
  constructor(
    public x: number,
    public y: number,
    public hunter: boolean,
    public speed: number,
    public icon: IconType,
  ) {}
  // squares this piece can move to, ignoring other pieces. enemies is the
  // opposing side, for pieces that care about check
  abstract legalMoves(width: number, height: number, enemies: Piece[]): coord[];
  abstract moveRandomLegal(steps: number, width: number, height: number): void;
  // whether this piece attacks (x, y), ignoring anything in the way
  abstract attacks(x: number, y: number): boolean;

  // how far (x, y) is from the target; straight-line by default
  distance(x: number, y: number, tx: number, ty: number): number {
    return (tx - x) ** 2 + (ty - y) ** 2;
  }

  // take the legal move closest to the target, skipping squares other pieces are on
  moveTowards(target: Piece, pieces: Piece[], enemies: Piece[], width: number, height: number): void {
    const moves = this.legalMoves(width, height, enemies).sort(
      (a, b) =>
        this.distance(a.x, a.y, target.x, target.y) - this.distance(b.x, b.y, target.x, target.y),
    );
    const move = moves.find(
      ({ x, y }) => !pieces.some((p) => p !== target && p.x === x && p.y === y),
    );
    if (move) {
      this.x = move.x;
      this.y = move.y;
    }
  }
}

const ROOK_DIRECTIONS = [
  [-1, 0],
  [1, 0],
  [0, -1],
  [0, 1],
];
const BISHOP_DIRECTIONS = [
  [-1, -1],
  [1, 1],
  [1, -1],
  [-1, 1],
];
const KING_DIRECTIONS = [...ROOK_DIRECTIONS, ...BISHOP_DIRECTIONS];

// check every direction, starting randomly, and only accept if it moved
const stepRandom = (
  piece: Piece,
  directions: number[][],
  steps: number,
  width: number,
  height: number,
): void => {
  const start = Math.floor(Math.random() * directions.length);
  for (let k = 0; k < directions.length; k++) {
    const [dx, dy] = directions[(start + k) % directions.length];
    const nx = piece.x + dx * steps;
    const ny = piece.y + dy * steps;
    if (nx >= 0 && nx < width && ny >= 0 && ny < height) {
      piece.x = nx;
      piece.y = ny;
      return;
    }
  }
};

export class Rook extends Piece {
  constructor(x: number, y: number, hunter: boolean) {
    super(x, y, hunter, 5, FaChessRook);
  }

  legalMoves(width: number, height: number): coord[] {
    const moves: coord[] = [];
    for (let x = 0; x < width; x++) {
      if (x !== this.x) moves.push({ x, y: this.y });
    }
    for (let y = 0; y < height; y++) {
      if (y !== this.y) moves.push({ x: this.x, y });
    }
    return moves;
  }

  moveRandomLegal(steps: number, width: number, height: number): void {
    stepRandom(this, ROOK_DIRECTIONS, steps, width, height);
  }

  attacks(x: number, y: number): boolean {
    return (x === this.x) !== (y === this.y);
  }
}

export class Knight extends Piece {
  constructor(x: number, y: number, hunter: boolean) {
    super(x, y, hunter, 1, FaChessKnight);
  }
  legalMoves(width: number, height: number): coord[] {
    return MOVE_ARRAY.map(([dx, dy]) => ({ x: this.x + dx, y: this.y + dy })).filter(
      ({ x, y }) => x >= 0 && y >= 0 && x < width && y < height,
    );
  }

  // knight moves between two squares on an open board
  distance(x: number, y: number, tx: number, ty: number): number {
    let dx = Math.abs(tx - x);
    let dy = Math.abs(ty - y);
    if (dx < dy) [dx, dy] = [dy, dx];
    if (dx === 1 && dy === 0) return 3;
    if (dx === 2 && dy === 2) return 4;
    const delta = dx - dy;
    return dy > delta
      ? delta - 2 * Math.floor((delta - dy) / 3)
      : delta - 2 * Math.floor((delta - dy) / 4);
  }

  // TODO
  moveRandomLegal(_steps: number, _width: number, _height: number): void {}

  attacks(x: number, y: number): boolean {
    return Math.abs((x - this.x) * (y - this.y)) === 2;
  }
}

const MOVE_ARRAY = [
  [-1, -2],
  [-1, 2],
  [1, 2],
  [1, -2],
  [-2, -1],
  [-2, 1],
  [2, -1],
  [2, 1],
];

export class Bishop extends Piece {
  constructor(x: number, y: number, hunter: boolean) {
    super(x, y, hunter, 1, FaChessBishop);
  }

  legalMoves(width: number, height: number): coord[] {
    const moves: coord[] = [];
    for (const [dx, dy] of BISHOP_DIRECTIONS) {
      for (let x = this.x + dx, y = this.y + dy; x >= 0 && y >= 0 && x < width && y < height; x += dx, y += dy) {
        moves.push({ x, y });
      }
    }
    return moves;
  }

  moveRandomLegal(steps: number, width: number, height: number): void {
    stepRandom(this, BISHOP_DIRECTIONS, steps, width, height);
  }

  attacks(x: number, y: number): boolean {
    const dx = Math.abs(x - this.x);
    return dx > 0 && dx === Math.abs(y - this.y);
  }
}

export class King extends Piece {
  constructor(x: number, y: number, hunter: boolean) {
    super(x, y, hunter, 5, FaChessKing);
  }

  // neighbouring squares that aren't in check
  legalMoves(width: number, height: number, enemies: Piece[]): coord[] {
    return KING_DIRECTIONS.map(([dx, dy]) => ({ x: this.x + dx, y: this.y + dy })).filter(
      ({ x, y }) =>
        x >= 0 && y >= 0 && x < width && y < height && !enemies.some((e) => e.attacks(x, y)),
    );
  }

  moveRandomLegal(steps: number, width: number, height: number): void {
    stepRandom(this, KING_DIRECTIONS, steps, width, height);
  }

  attacks(x: number, y: number): boolean {
    return Math.max(Math.abs(x - this.x), Math.abs(y - this.y)) === 1;
  }
}
