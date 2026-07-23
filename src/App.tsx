import { useEffect, useRef, useState } from "react";
import { Board } from "./Board";
import { MinesweeperBoard, setSeed } from "./game";
import { Solver } from "./solver";
import { useElementSize } from "./hooks/useElementSize";
import { useDebounced } from "./hooks/useDebounced";

// sleep time
const STEP_DELAY = 20;
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

  // resize side effect
  useEffect(() => {
    if (debouncedSize.width > 0 && debouncedSize.height > 0) {
      // invalidate run
      runIdRef.current += 1;
      setBoard(emptyBoard(width, height));
    }
  }, [debouncedSize.width, debouncedSize.height]);

  // solve the board
  const solve = async () => {
    if (solving) {
      return;
    }
    setSolving(true);
    setSeed(Math.floor(Math.random() * 1000) + 1);

    // const board = emptyBoard(width, height);
    // setBoard(board);

    const solver = new Solver(board);
    const current = runIdRef.current;
    while (solver.step() && current === runIdRef.current) {
      setBoard([...solver.board]);
      await sleep(STEP_DELAY);
    }
    setSolving(false);
    solve();
  };

  return (
    <div className="w-screen h-screen flex flex-col items-center bg-[#1e262e]">
      <button
        onClick={solve}
        disabled={solving}
        className="w-24 my-2 px-3 py-1 bg-neutral-700 text-white rounded disabled:opacity-50"
      >
        {solving ? "Solving…" : "Solve"}
      </button>
      <Board board={board} ref={ref} />
    </div>
  );
}

export default App;
