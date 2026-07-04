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

export class Solver {
  // LIFO stack; top of the stack is the last element (push/pop)
  stack: CellData[] = [];
  // tiles currently waiting in the queue, keyed "x,y", to avoid duplicate
  // entries. Unlike a permanent "seen" set, a tile can be re-queued later once
  // a neighbouring flag/reveal changes its situation.
  inQueue = new Set<string>();
  board: MinesweeperBoard = [];
  constructor(board: MinesweeperBoard) {
    this.stack = [];
    this.inQueue = new Set();
    this.board = board;
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

  // Advance the solver until it changes the board. Returns true if it made a
  // move (a flag/reveal), false if no more progress is possible (queue drained).
  // No-op queue entries are consumed silently so every `true` is a real move.
  step(): boolean {
    // mandatory opening reveal to bootstrap an untouched board
    if (this.stack.length === 0 && !this.anyRevealed()) {
      const target = this.randomHidden();
      if (!target) return false;
      clearNew(this.board);
      clearWorking(this.board);
      revealHelper(target.x, target.y, this.board, this);
      return true;
    }

    // pop queued numbers until one actually does something
    while (this.stack.length > 0) {
      clearNew(this.board);
      clearWorking(this.board);
      const before = this.progressCount();
      const queued = this.take()!;
      // resolve a fresh reference: clearNew replaces cell objects each action
      this.board[queued.y][queued.x].working = true;
      this.move_simple(this.board[queued.y][queued.x]);
      if (this.progressCount() > before) {
        return true;
      }
    }

    return false;
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
