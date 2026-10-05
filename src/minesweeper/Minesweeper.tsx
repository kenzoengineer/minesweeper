import { useCallback, useEffect, useRef, useState } from "react";
import { Board } from "./Board";
import { MinesweeperBoard, setSeed } from "./game";
import { Solver } from "./solver";
import { useDimensions } from "../DimensionsContext";
import { sleep } from "../utils";

// sleep time
const STEP_DELAY = 20;
// hold on a finished board this long before wiping to the next one
const BOARD_PAUSE = 1000;
// only show boards the solver gets at least this far through
const MIN_SOLVED = 0.75;
// give up looking for a good seed after this many and show the best one found
const MAX_ATTEMPTS = 50;

// a fresh, mine-free board (mines are placed on the first reveal)
const emptyBoard = (width: number, height: number): MinesweeperBoard => {
  const res: MinesweeperBoard = [];
  // fill it an extra 2 so we fill for sure
  for (let i = 0; i < height + 2; i++) {
    res.push(
      Array(width)
        .fill(null)
        .map((_, j) => ({
          x: j,
          y: i,
          value: 0,
          revealed: false,
          flagged: false,
        })),
    );
  }
  return res;
};

// instantly solve a board and return the fraction solved
const solvedFraction = (seed: number, width: number, height: number) => {
  setSeed(seed);
  const solver = new Solver(emptyBoard(width, height));
  while (solver.step());
  let done = 0;
  let total = 0;
  for (const row of solver.board) {
    for (const cell of row) {
      total++;
      if (cell.revealed || cell.flagged) done++;
    }
  }
  return done / total;
};

export const Minesweeper = () => {
  const { width, height } = useDimensions();

  const [board, setBoard] = useState<MinesweeperBoard>([]);

  // incremented when the board is resized
  const runIdRef = useRef(0);

  // continuously generate and solve boards until this run is cancelled
  const solve = useCallback(async () => {
    const runId = ++runIdRef.current; // claim this run, cancelling any prior one
    while (runIdRef.current === runId) {
      // pre-generate up to MAX_ATTEMPTS boards and return the most solved
      let best = { seed: 0, fraction: -1 };
      for (let attempt = 0; attempt < MAX_ATTEMPTS && best.fraction < MIN_SOLVED; attempt++) {
        const seed = Math.floor(Math.random() * 1000) + 1;
        const fraction = solvedFraction(seed, width, height);
        if (fraction > best.fraction) best = { seed, fraction };
        await sleep(0);
        if (runIdRef.current !== runId) return;
      }

      // replay the chosen seed with the step delay
      const fresh = emptyBoard(width, height);
      setBoard(fresh);
      setSeed(best.seed);
      const solver = new Solver(fresh);
      while (solver.step()) {
        if (runIdRef.current !== runId) return; // cancelled mid-solve
        setBoard([...solver.board]);
        await sleep(STEP_DELAY);
      }
      if (runIdRef.current !== runId) return;
      // hold on the finished board one beat before wiping to the next
      await sleep(BOARD_PAUSE);
    }
  }, [width, height]);

  // auto-start on mount; restart whenever the (debounced) board size changes
  useEffect(() => {
    if (width > 0 && height > 0) {
      solve();
    }
    return () => {
      runIdRef.current += 1; // cancel the running loop on resize / unmount
    };
  }, [solve, width, height]);

  return <Board board={board} />;
};
