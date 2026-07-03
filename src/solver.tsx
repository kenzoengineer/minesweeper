class Solver {
  // stack grows down [top, 1, 2, bottom]
  stack = [];
  constructor() {
    this.stack = [];
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
  move_simple() {}
}
