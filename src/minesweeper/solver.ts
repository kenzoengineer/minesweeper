import {
  CellData,
  farNeighbors,
  flag,
  getCounts,
  MinesweeperBoard,
  neighbors,
  random,
  revealHelper,
} from "./game";

export class Solver {
  // LIFO stack; top of the stack is the last element (push/pop)
  stack: CellData[] = [];
  // cells currently in the stack, keyed "x,y"
  inStack = new Set<string>();
  board: MinesweeperBoard = [];
  constructor(board: MinesweeperBoard) {
    this.stack = [];
    this.inStack = new Set();
    this.board = board;
  }

  peek() {
    if (this.stack.length === 0) return null;
    return this.stack[this.stack.length - 1];
  }

  pop() {
    const cell = this.stack.pop();
    if (cell) {
      this.inStack.delete(`${cell.x},${cell.y}`);
    }
    return cell;
  }

  // push a frontier tile. If it's already on the stack, promote it to the top
  push(cell: CellData) {
    const key = `${cell.x},${cell.y}`;

    // promotion
    if (this.inStack.has(key)) {
      const idx = this.stack.findIndex((c) => `${c.x},${c.y}` === key);
      if (idx !== -1) {
        this.stack.splice(idx, 1);
        this.stack.push(cell);
      }
      return;
    }

    this.inStack.add(key);
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
    return hidden[Math.floor(random() * hidden.length)];
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
  // move (a flag/reveal), false if no more progress is possible (stack drained).
  // No-op stack entries are consumed silently so every `true` is a real move.
  step(): boolean {
    // mandatory opening reveal to bootstrap an untouched board
    if (this.stack.length === 0 && !this.anyRevealed()) {
      const target = this.randomHidden();
      if (!target) return false;
      revealHelper(target.x, target.y, this.board, this);
      return true;
    }

    // pop numbers off the stack until one actually does something
    while (this.stack.length > 0) {
      const before = this.progressCount();
      const top = this.pop()!;
      this.move_simple(top);
      if (this.progressCount() > before) {
        return true;
      }
    }

    return false;
  }

  // tries to perform a move in this order:
  // 1. flag all tiles if unrevealed == number of mines
  // 2. clear all tiles if flags == number of mines
  // 3. generalized reduction
  move_simple(cell: CellData) {
    const { valid, revealed, flagged } = getCounts(cell.x, cell.y, this.board);
    // 1. remaining tiles == mine count
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
            this.push(n);
          }
        }
      }
      return;
    }

    // 2. hidden == flagged
    if (cell.value == flagged) {
      for (const { cell: c } of neighbors(cell.x, cell.y, this.board)) {
        if (!c.flagged) {
          revealHelper(c.x, c.y, this.board, this);
        }
      }
      return;
    }

    // 3. gen reduction
    this.move_pair(cell);
  }

  private getHiddenUnflaggedCellNeighbours(cell: CellData) {
    const set: Set<CellData> = new Set();
    for (const { cell: c } of neighbors(cell.x, cell.y, this.board)) {
      if (!c.flagged && !c.revealed) {
        set.add(c);
      }
    }
    return set;
  }

  // generalized reduction:
  // adjacent cells A and B will share some neighbouring cells
  // denoted below as x
  // a x x b
  // a A B b
  // a x x b
  // if A neighbours are a strict subset of B neighbours,
  // we can reduce B's number by A's number. this surfaces in
  // the 1-1 and 1-2 rules
  // x x b    1 1 b
  // 1 1 - -> 1 1 - -> b must be 0 as 1 - 1 = 0
  // - - -    - - -
  //
  // x x b    1 1 b
  // 1 2 - -> 1 2 - -> b must be 1 as 2 - 1 = 1
  // - - -    - - -
  // step 1: for A, make a set (alpha) of all unrevealed, unflagged tiles
  // step 2: look in a direction, this is cell B
  // step 3: if alpha is a subset of B's neighbours, reduce.
  // step 4: if the reduction results in a simple case, flag or reveal
  move_pair(cell: CellData) {
    // 1. all of A's unrevealed, unflagged tiles
    const setA = this.getHiddenUnflaggedCellNeighbours(cell);
    // all neighbours are flagged and/or revealed
    if (setA.size == 0) return;
    const { flagged: AFlaggedMineCount } = getCounts(
      cell.x,
      cell.y,
      this.board,
    );
    const AEffectiveMineCount = cell.value - AFlaggedMineCount;

    // 2. any revealed number within distance 2 can share hidden cells with A,
    // so it's a candidate partner for a subset reduction
    for (const { cell: BNeighbour } of farNeighbors(
      cell.x,
      cell.y,
      this.board,
    )) {
      if (this.tryReducePair(setA, AEffectiveMineCount, BNeighbour)) {
        return;
      }
    }
  }

  // try reducing A against a single partner B, in both directions.
  // returns true if it changed the board
  private tryReducePair(
    setA: Set<CellData>,
    AEffectiveMineCount: number,
    BNeighbour: CellData,
  ): boolean {
    // skip hidden and empty cells
    if (!BNeighbour.revealed || BNeighbour.value == 0) return false;

    const setB = this.getHiddenUnflaggedCellNeighbours(BNeighbour);
    // all neighbours are flagged and/or revealed
    if (setB.size == 0) return false;

    const { flagged: BFlaggedCount } = getCounts(
      BNeighbour.x,
      BNeighbour.y,
      this.board,
    );
    const BEffectiveMineCount = BNeighbour.value - BFlaggedCount;

    // do it both ways; || stops at the first that acts
    return (
      this.performReduction(
        setA,
        AEffectiveMineCount,
        setB,
        BEffectiveMineCount,
      ) ||
      this.performReduction(
        setB,
        BEffectiveMineCount,
        setA,
        AEffectiveMineCount,
      )
    );
  }

  private performReduction(
    setA: Set<CellData>,
    AEffectiveMineCount: number,
    setB: Set<CellData>,
    BEffectiveMineCount: number,
  ): boolean {
    // 3. if A is a strict subset of B, then we want to continue
    if (setA.isSubsetOf(setB)) {
      // B / A
      const setDiff = setB.difference(setA);

      // if B has no remaining hidden cells then no point doing anything
      // e.g. - x x -
      //      - A B -
      if (setDiff.size == 0) return false;

      // 4a. 1 1 safe pattern, clear all mines
      if (BEffectiveMineCount - AEffectiveMineCount == 0) {
        for (const toClear of setDiff) {
          revealHelper(toClear.x, toClear.y, this.board, this);
        }
        return true;
      }
      // 4b. 1 2 flag pattern, flag all mines
      if (BEffectiveMineCount - AEffectiveMineCount == setDiff.size) {
        for (const toClear of setDiff) {
          flag(toClear.x, toClear.y, this.board);
          // flagging toClear changes the mine math for every revealed number touching it
          for (const { cell: n } of neighbors(
            toClear.x,
            toClear.y,
            this.board,
          )) {
            if (n.revealed && n.value > 0) {
              this.push(n);
            }
          }
        }
        return true;
      }
    }
    return false;
  }
}
