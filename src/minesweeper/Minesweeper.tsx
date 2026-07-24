import { useCallback, useEffect, useRef, useState } from "react";
import { Board } from "./Board";
import { MinesweeperBoard, setSeed } from "./game";
import { Solver } from "./solver";
import { useDimensions } from "../DimensionsContext";

// sleep time
const STEP_DELAY = 20;
// hold on a finished board this long before wiping to the next one
const BOARD_PAUSE = 1000;

const sleep = (ms: number) =>
  new Promise<void>((resolve) => setTimeout(resolve, ms));

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

export const Minesweeper = () => {
  const { width, height } = useDimensions();

  const [board, setBoard] = useState<MinesweeperBoard>([]);

  // incremented when the board is resized
  const runIdRef = useRef(0);

  // continuously generate and solve boards until this run is cancelled
  const solve = useCallback(async () => {
    const runId = ++runIdRef.current; // claim this run, cancelling any prior one
    while (runIdRef.current === runId) {
      // wipe to a fresh board and solve it
      const fresh = emptyBoard(width, height);
      setBoard(fresh);
      setSeed(Math.floor(Math.random() * 1000) + 1);
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
