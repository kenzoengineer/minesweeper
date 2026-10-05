import { ActiveContainer, BoardState, Square, Tetromino } from "./game";

/**
 * helper function to count the y position of the highest tile
 * in a column. Remember that 0 is the very top and board.length is the bottom.
 */
const highestTile = (col: number, board: BoardState): number => {
  for (let y = 0; y < board.length; y++) {
    if (board[y][col] !== Square.empty) {
      return y;
    }
  }
  return board.length;
}

/**
 * how many holes, aka empty tiles with tiles above them.
 * lower is better
 */
const countHoles = (board: BoardState): number => {
  let count = 0;
  for (let y = 1; y < board.length; y++) { // skip first row
    for (let x = 0; x < board[y].length; x++) {
      if (board[y][x] === Square.empty && board[y - 1][x] !== Square.empty) {
        count++;
      }
    }
  }
  return count;
};

/**
 * how "bumpy" the board is, summing the deltas between the column heights.
 * lower is better
 */
const countBumpiness = (board: BoardState): number => {
  let accum = 0;
  for (let x = 1; x < board[0].length; x++) { // skip first col
    accum += Math.abs(highestTile(x, board) - highestTile(x - 1, board));
  }
  return accum;
};

/**
 * how tall each column is. this is the opposite of what highestTile returns.
 * lower is better.
 */
const countHeight = (board: BoardState): number => {
  let accum = 0;
  for (let x = 0; x < board[0].length; x++) {
    accum += board.length - highestTile(x, board);
  }
  return accum;
};

/**
 * count how many rows are completed.
 * higher is better.
 */
const countCompleted = (board: BoardState): number => {
  let accum = 0;
  for (let y = 0; y < board.length; y++) {
    if (board[y].every(i => i !== Square.empty)) {
      accum++;
    }
  }
  return accum;
};

// weights from a simulation sweep on 10x15 with the in-game steering
export const scoreBoard = (board: BoardState): number => {
  return (
    countHoles(board)     * 8 +
    countBumpiness(board) * 2 +
    countHeight(board)    * 2.5 -
    countCompleted(board) * 6.5
  );
}

// true if every filled square of the piece is on the board and not on a placed square
export const fits = (board: BoardState, active: ActiveContainer): boolean => {
  const { shape, x, y } = active;
  for (let dy = 0; dy < shape.length; dy++) {
    for (let dx = 0; dx < shape[dy].length; dx++) {
      if (shape[dy][dx] === Square.empty) {
        continue;
      }
      const bx = x + dx;
      const by = y + dy;
      if (by < 0 || by >= board.length || bx < 0 || bx >= board[by].length || board[by][bx] === Square.placed) {
        return false;
      }
    }
  }
  return true;
};

export const canFall = (board: BoardState, active: ActiveContainer): boolean =>
  fits(board, { ...active, y: active.y + 1 });

// a copy of the board with the piece locked in
export const place = (board: BoardState, active: ActiveContainer): BoardState => {
  const next = board.map((row) => [...row]);
  const { shape, x, y } = active;
  for (let dy = 0; dy < shape.length; dy++) {
    for (let dx = 0; dx < shape[dy].length; dx++) {
      if (shape[dy][dx] !== Square.empty) {
        next[y + dy][x + dx] = Square.placed;
      }
    }
  }
  return next;
};

export const rotateClockwise = (shape: Tetromino): Tetromino => {
  const rows = shape.length;
  const cols = shape[0].length;
  const rotated = Array.from({ length: cols }, () => Array<Square>(rows));
  for (let r = 0; r < rows; r++) {
    for (let c = 0; c < cols; c++) {
      rotated[c][rows - 1 - r] = shape[r][c];
    }
  }
  return rotated;
};

/**
 * Generates the best position: for each of the 4 rotations, drop the piece straight
 * down in every column it fits in and keep the landing spot with the lowest score.
 * rotations is how many clockwise turns from the given shape. null if it fits nowhere
 */
export const generateMove = (
  board: BoardState,
  active: ActiveContainer,
): { move: ActiveContainer; rotations: number } | null => {
  let best: { move: ActiveContainer; rotations: number; score: number } | null = null;
  let shape = active.shape;
  for (let rotations = 0; rotations < 4; rotations++, shape = rotateClockwise(shape)) {
    // start left of the board so shapes with empty leading columns can reach x = 0
    for (let x = 1 - shape[0].length; x < board[0].length; x++) {
      const move = { ...active, shape, x };
      if (!fits(board, move)) {
        continue;
      }
      while (canFall(board, move)) {
        move.y++;
      }
      const score = scoreBoard(place(board, move));
      if (!best || score < best.score) {
        best = { move, rotations, score };
      }
    }
  }
  return best && { move: best.move, rotations: best.rotations };
};
