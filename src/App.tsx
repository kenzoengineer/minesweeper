import { useCallback, useEffect, useRef, useState } from "react";
import { Board } from "./Board";
import { MinesweeperBoard, setSeed } from "./game";
import { Solver } from "./solver";
import { useElementSize } from "./hooks/useElementSize";
import { useDebounced } from "./hooks/useDebounced";

// sleep time
const STEP_DELAY = 20;
// hold on a finished board this long before wiping to the next one
const BOARD_PAUSE = 1000;
// taken from Board.tsx
const CELL_SIZE = 40;

const sleep = (ms: number) =>
  new Promise<void>((resolve) => setTimeout(resolve, ms));

// a fresh, mine-free board (mines are placed on the first reveal)
const emptyBoard = (width: number, height: number): MinesweeperBoard => {
  const res: MinesweeperBoard = [];
  for (let i = 0; i < height; i++) {
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

function App() {
  const { ref, size } = useElementSize();
  const debouncedSize = useDebounced(size, 200);
  const width = Math.floor(debouncedSize.width / CELL_SIZE);
  const height = Math.floor(debouncedSize.height / CELL_SIZE);

  const [board, setBoard] = useState<MinesweeperBoard>([]);
  const [solving, setSolving] = useState(false);

  // incremented when the board is resized
  const runIdRef = useRef(0);

  // continuously generate and solve boards until this run is cancelled
  const solve = useCallback(async () => {
    const runId = ++runIdRef.current; // claim this run, cancelling any prior one
    setSolving(true);
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

  return (
    <div className="w-screen h-screen flex flex-col items-center bg-[#1e262e]">
      <Board board={board} ref={ref} />
    </div>
  );
}

export default App;
