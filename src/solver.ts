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

export type StepResult = "won" | "lost" | "progress" | "stuck";

export class Solver {
  // stack grows down [top, 1, 2, bottom]
  stack: CellData[] = [];
  // tiles currently waiting in the queue, keyed "x,y", to avoid duplicate
  // entries. Unlike a permanent "seen" set, a tile can be re-queued later once
  // a neighbouring flag/reveal changes its situation.
  inQueue = new Set<string>();
  board: MinesweeperBoard = [];
  // when false, the solver only makes forced moves and stops ("stuck") instead
  // of guessing a random tile
  allowGuessing = false;
  statistics: Statistics = {
    leftClicks: 0,
    rightClicks: 0,
    chords: 0,
  };
  constructor(
    board: MinesweeperBoard,
    statistics: Statistics,
    allowGuessing = false,
  ) {
    this.stack = [];
    this.inQueue = new Set();
    this.board = board;
    this.statistics = statistics;
    this.allowGuessing = allowGuessing;
  }

  peek() {
    if (this.stack.length === 0) return null;
    return this.stack[0];
  }

  take() {
    const cell = this.stack.shift();
    if (cell) {
      this.inQueue.delete(`${cell.x},${cell.y}`);
    }
    return cell;
  }

  // push a frontier tile, skipping ones already waiting in the queue
  private enqueue(cell: CellData) {
    const key = `${cell.x},${cell.y}`;
    if (this.inQueue.has(key)) {
      return;
    }
    this.inQueue.add(key);
    this.stack.push(cell);
  }

  // add every tile flagged "new" by the last action to the queue
  private enqueueNew() {
    for (const row of this.board) {
      for (const cell of row) {
        if (cell.new) {
          this.enqueue(cell);
        }
      }
    }
  }

  // a random unrevealed, unflagged tile (a guess), or null if none remain
  private randomHidden(): CellData | null {
    const hidden: CellData[] = [];
    for (const row of this.board) {
      for (const cell of row) {
        if (!cell.revealed && !cell.flagged) {
          hidden.push(cell);
        }
      }
    }
    if (hidden.length === 0) {
      return null;
    }
    return hidden[Math.floor(Math.random() * hidden.length)];
  }

  private anyRevealed() {
    for (const row of this.board) {
      for (const cell of row) {
        if (cell.revealed) {
          return true;
        }
      }
    }
    return false;
  }

  private mineRevealed() {
    for (const row of this.board) {
      for (const cell of row) {
        if (cell.revealed && cell.value === -1) {
          return true;
        }
      }
    }
    return false;
  }

  private allSafeRevealed() {
    for (const row of this.board) {
      for (const cell of row) {
        if (!cell.revealed && cell.value !== -1) {
          return false;
        }
      }
    }
    return true;
  }

  // one iteration of the loop:
  //  - queue empty  -> reveal a random tile (a guess), unless guessing is
  //                    disabled, in which case stop ("stuck"). The mandatory
  //                    opening reveal on an untouched board is always allowed.
  //  - otherwise    -> run move_simple on the next queued tile
  // either way, tiles newly revealed by the action join the queue
  step(): StepResult {
    if (this.mineRevealed()) return "lost";
    if (this.allSafeRevealed()) return "won";

    clearNew(this.board);
    if (this.stack.length === 0) {
      // no forced moves left; only reveal if we're allowed to guess (or this
      // is the mandatory opening on an untouched board)
      if (!this.allowGuessing && this.anyRevealed()) {
        return "stuck";
      }
      const target = this.randomHidden();
      if (!target) return "won";
      revealHelper(target.x, target.y, this.board, this.statistics);
      // mark the game as started; the first reveal was safe, further mine
      // hits are now fatal
      this.statistics.leftClicks++;
    } else {
      const queued = this.take()!;
      // resolve a fresh reference: clearNew replaces cell objects each action
      this.move_simple(this.board[queued.y][queued.x]);
    }
    this.enqueueNew();

    if (this.mineRevealed()) return "lost";
    if (this.allSafeRevealed()) return "won";
    return "progress";
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
      // every hidden neighbour is a mine: flag them
      for (const { cell: c } of neighbors(cell.x, cell.y, this.board)) {
        if (c.flagged || c.revealed) {
          continue;
        }
        flag(c.x, c.y, this.board);
        // flagging c changes the mine math for every revealed number touching
        // it, so mark those "new" to give them another move_simple pass
        for (const { cell: n } of neighbors(c.x, c.y, this.board)) {
          if (n.revealed && n.value > 0) {
            n.new = true;
          }
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
