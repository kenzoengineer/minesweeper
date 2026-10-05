import { ActiveContainer, BoardState, Square } from "./game";

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

export const scoreBoard = (board: BoardState): number => {
  return (
    countHoles(board) +
    countBumpiness(board) +
    countHeight(board) -
    countCompleted(board) * 3 // weigh this more
  );
}

// true if every filled square of the piece is on the board and not on a placed square
const fits = (board: BoardState, active: ActiveContainer): boolean => {
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

/**
 * Generates the best position: drop the piece straight down in every column it
 * fits in and keep the landing spot with the lowest score. null if it fits nowhere
 */
export const generateMove = (board: BoardState, active: ActiveContainer): ActiveContainer | null => {
  let best: { move: ActiveContainer; score: number } | null = null;
  // start left of the board so shapes with empty leading columns can reach x = 0
  for (let x = 1 - active.shape[0].length; x < board[0].length; x++) {
    const move = { ...active, x };
    if (!fits(board, move)) {
      continue;
    }
    while (canFall(board, move)) {
      move.y++;
    }
    const score = scoreBoard(place(board, move));
    if (!best || score < best.score) {
      best = { move, score };
    }
  }
  return best?.move ?? null;
};
