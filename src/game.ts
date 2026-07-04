export const WIDTH = 25;
export const HEIGHT = 25;
export const MINES = 99;

export enum ACTIONS_ENUM {
  none,
  leftClick,
  rightClick,
  chord,
}

// x is up and down, y is left to right
export type CellData = {
  x: number;
  y: number;
  value: number;
  revealed: boolean;
  flagged: boolean;
  new: boolean;
};

export type CellCounts = {
  valid: number;
  revealed: number;
  flagged: number;
};

export type Statistics = {
  leftClicks: number;
  rightClicks: number;
  chords: number;
};

export type MinesweeperBoard = CellData[][];

export const inBound = (x: number, y: number, board: MinesweeperBoard) => {
  if (y < board.length && y >= 0) {
    if (x < board[y].length && x >= 0) {
      return true;
    }
  }
};

// iterate over the (up to 8) in-bound tiles surrounding (x, y)
export function* neighbors(x: number, y: number, board: MinesweeperBoard) {
  for (let i = -1; i < 2; i++) {
    for (let j = -1; j < 2; j++) {
      if (i === 0 && j === 0) {
        continue;
      }
      const nx = x + i;
      const ny = y + j;
      if (inBound(nx, ny, board)) {
        yield { x: nx, y: ny, cell: board[ny][nx] };
      }
    }
  }
}

const setAll = (board: MinesweeperBoard, overrides: Partial<CellData>) => {
  for (let x = 0; x < board.length; x++) {
    for (let y = 0; y < board[x].length; y++) {
      board[y][x] = {
        ...board[y][x],
        ...overrides,
      };
    }
  }
};

// clear the "new" highlight from every tile; call once at the start of an
// action (a click or a solver move), not per reveal
export const clearNew = (board: MinesweeperBoard) => {
  setAll(board, { new: false });
};

// count number of mines
export const minesAround = (x: number, y: number, board: MinesweeperBoard) => {
  let count = 0;
  for (const { cell } of neighbors(x, y, board)) {
    count += cell.value === -1 ? 1 : 0;
  }
  return count;
};

// toggle flag in bound
const fib = (x: number, y: number, board: MinesweeperBoard) => {
  if (!inBound(x, y, board)) {
    return;
  }
  if (board[y][x].revealed) {
    return;
  }
  board[y][x].flagged = !board[y][x].flagged;
  return ACTIONS_ENUM.rightClick;
};

// reveal in bound
const rib = (x: number, y: number, board: MinesweeperBoard) => {
  if (inBound(x, y, board)) {
    board[y][x].revealed = true;
  }
};

// mutate in bound
const mib = (x: number, y: number, board: MinesweeperBoard, by: number) => {
  if (inBound(x, y, board)) {
    if (board[y][x].value >= 0) {
      board[y][x].value += by;
    }
  }
};

// increment around
export const iibAround = (
  x: number,
  y: number,
  board: MinesweeperBoard,
  by: number = 1,
) => {
  for (let i = -1; i < 2; i++) {
    for (let j = -1; j < 2; j++) {
      mib(x + i, y + j, board, by);
    }
  }
};

export const getCounts = (x: number, y: number, board: MinesweeperBoard) => {
  const counts: CellCounts = {
    valid: 0,
    revealed: 0,
    flagged: 0,
  };
  for (const { cell } of neighbors(x, y, board)) {
    counts.valid++;
    if (cell.flagged) {
      counts.flagged++;
    }
    if (cell.revealed) {
      counts.revealed++;
    }
  }
  return counts;
};

export const revealHelper = (
  x: number,
  y: number,
  board: MinesweeperBoard,
  statistics: Statistics,
) => {
  // handle normal case
  if (!board[y][x].revealed) {
    reveal(x, y, board, statistics);
    return ACTIONS_ENUM.leftClick;
  }

  const counts = getCounts(x, y, board);
  if (counts.flagged !== board[y][x].value) {
    return;
  }
  for (const { x: nx, y: ny } of neighbors(x, y, board)) {
    reveal(nx, ny, board, statistics);
  }
  return ACTIONS_ENUM.chord;
};

const reveal = (
  x: number,
  y: number,
  board: MinesweeperBoard,
  statistics: Statistics,
) => {
  if (!inBound(x, y, board)) {
    return;
  }

  if (board[y][x].revealed || board[y][x].flagged) {
    return;
  }

  if (board[y][x].value === -1) {
    if (statistics.leftClicks === 0) {
      iibAround(x, y, board, -1);
      board[y][x].value = minesAround(x, y, board);
      // the board is bounded, we will always break
      // eslint-disable-next-line no-constant-condition
      while (true) {
        const _x = Math.floor(Math.random() * WIDTH);
        const _y = Math.floor(Math.random() * HEIGHT);
        if (board[_y][_x].value != -1 && _x != x && _y != y) {
          board[_y][_x].value = -1;
          iibAround(_x, _y, board);
          break;
        }
      }
    } else {
      for (let a = 0; a < HEIGHT; a++) {
        for (let b = 0; b < WIDTH; b++) {
          board[a][b].revealed = true;
        }
      }
      return;
    }
  }

  rib(x, y, board);

  if (board[y][x].value > 0) {
    board[y][x].new = true;
    return;
  }

  for (const { x: nx, y: ny, cell } of neighbors(x, y, board)) {
    if (cell.revealed) {
      continue;
    }
    reveal(nx, ny, board, statistics);
  }
};

export const flag = (x: number, y: number, board: MinesweeperBoard) => {
  return fib(x, y, board);
};
