import {
  CellData,
  clearNew,
  clearWorking,
  flag,
  getCounts,
  MinesweeperBoard,
  neighbors,
  revealHelper,
} from "./game";

// "progress" changed the board (flag/reveal); "noop" advanced the queue but
// changed nothing — the UI can skip the step delay for a "noop"
export type StepResult = "won" | "lost" | "progress" | "stuck" | "noop";

export class Solver {
  // LIFO stack; top of the stack is the last element (push/pop)
  stack: CellData[] = [];
  // tiles currently waiting in the queue, keyed "x,y", to avoid duplicate
  // entries. Unlike a permanent "seen" set, a tile can be re-queued later once
  // a neighbouring flag/reveal changes its situation.
  inQueue = new Set<string>();
  board: MinesweeperBoard = [];
  // when false, the solver only makes forced moves and stops ("stuck") instead
  // of guessing a random tile
  allowGuessing = false;
  constructor(board: MinesweeperBoard, allowGuessing = false) {
    this.stack = [];
    this.inQueue = new Set();
    this.board = board;
    this.allowGuessing = allowGuessing;
  }

  peek() {
    if (this.stack.length === 0) return null;
    return this.stack[this.stack.length - 1];
  }

  take() {
    const cell = this.stack.pop();
    if (cell) {
      this.inQueue.delete(`${cell.x},${cell.y}`);
    }
    return cell;
  }

  // push a frontier tile. If it's already queued, promote it to the top
  enqueue(cell: CellData) {
    const key = `${cell.x},${cell.y}`;

    // promotion
    if (this.inQueue.has(key)) {
      const idx = this.stack.findIndex((c) => `${c.x},${c.y}` === key);
      if (idx !== -1) {
        this.stack.splice(idx, 1);
        this.stack.push(cell);
      }
      return;
    }

    this.inQueue.add(key);
    this.stack.push(cell);
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

  // count of cells that are revealed or flagged. This only ever grows, so
  // comparing it before/after an action tells us whether the action did
  // anything (a flag, a reveal, or a chord that cleared tiles).
  private progressCount() {
    let n = 0;
    for (const row of this.board) {
      for (const cell of row) {
        if (cell.revealed || cell.flagged) {
          n++;
        }
      }
    }
    return n;
  }

  // one iteration of the loop:
  //  - queue empty  -> reveal a random tile (a guess), unless guessing is
  //                    disabled, in which case stop ("stuck"). The mandatory
  //                    opening reveal on an untouched board is always allowed.
  //  - otherwise    -> run move_simple on the next queued tile
  // after the action, every number with a forced move is (re)queued
  step(): StepResult {
    if (this.mineRevealed()) return "lost";
    if (this.allSafeRevealed()) return "won";

    clearNew(this.board);
    clearWorking(this.board);

    const before = this.progressCount();
    if (this.stack.length === 0) {
      // no forced moves left; only reveal if we're allowed to guess (or this
      // is the mandatory opening on an untouched board)
      if (!this.allowGuessing && this.anyRevealed()) {
        return "stuck";
      }
      const target = this.randomHidden();
      if (!target) return "won";
      revealHelper(target.x, target.y, this.board, this);
    } else {
      const queued = this.take()!;
      this.board[queued.y][queued.x].working = true;
      // resolve a fresh reference: clearNew replaces cell objects each action
      this.move_simple(this.board[queued.y][queued.x]);
    }
    //this.enqueueActionable();

    if (this.mineRevealed()) return "lost";
    if (this.allSafeRevealed()) return "won";
    // nothing changed on the board -> a no-op the UI can fast-forward past
    return this.progressCount() > before ? "progress" : "noop";
  }

  // tries to perform a move in this order:
  // 1. flag all tiles if unrevealed == number of mines
  // 2. clear all tiles if flags == number of mines
  // 3. do nothing
  // TODO add pattern recognition
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
        // flagging c changes the mine math for every revealed number touching it
        for (const { cell: n } of neighbors(c.x, c.y, this.board)) {
          if (n.revealed && n.value > 0) {
            n.new = true;
            this.enqueue(n);
          }
        }
      }
    }

    // mines == flagged
    if (cell.value == flagged) {
      for (const { cell: c } of neighbors(cell.x, cell.y, this.board)) {
        if (!c.flagged) {
          revealHelper(c.x, c.y, this.board, this);
        }
      }
    }

    // no-op
  }
}
