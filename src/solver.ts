import {
  CellData,
  clearNew,
  flag,
  getCounts,
  MinesweeperBoard,
  neighbors,
  revealHelper,
  Statistics,
} from "./game";

export class Solver {
  // stack grows down [top, 1, 2, bottom]
  stack = [];
  board: MinesweeperBoard = [];
  statistics: Statistics = {
    leftClicks: 0,
    rightClicks: 0,
    chords: 0,
  };
  constructor(board: MinesweeperBoard, statistics: Statistics) {
    this.stack = [];
    this.board = board;
    this.statistics = statistics;
  }

  peek() {
    if (this.stack.length === 0) return null;
    return this.stack[0];
  }

  take() {
    return this.stack.shift();
  }

  // tries to perform a move in this order:
  // 1. flag all tiles if unrevealed == number of mines
  // 2. clear all tiles if flags == number of mines
  // 3. do nothing (TODO)
  move_simple(cell: CellData) {
    clearNew(this.board);
    const { valid, revealed, flagged } = getCounts(cell.x, cell.y, this.board);
    // remaining tiles == mine count
    if (cell.value == valid - revealed) {
      // flag all revealed
      for (const { cell: c } of neighbors(cell.x, cell.y, this.board)) {
        if (!c.flagged) {
          flag(c.x, c.y, this.board);
        }
      }
    }

    // mines == flagged
    if (cell.value == flagged) {
      for (const { cell: c } of neighbors(cell.x, cell.y, this.board)) {
        if (!c.flagged) {
          revealHelper(c.x, c.y, this.board, this.statistics);
        }
      }
    }

    // no-op
  }
}
