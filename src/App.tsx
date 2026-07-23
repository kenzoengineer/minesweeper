import { useEffect, useState } from "react";
import { Board } from "./Board";
import { MinesweeperBoard, setSeed } from "./game";
import { Solver } from "./solver";
import { useElementSize } from "./hooks/useElementSize";

const sleep = (ms: number) =>
  new Promise<void>((resolve) => setTimeout(resolve, ms));

// the seed!
let seed = 1;
// sleep time
const STEP_DELAY = 50;

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
  const [board, setBoard] = useState<MinesweeperBoard>([]);
  const [solving, setSolving] = useState(false);

  // Initialize board when size is available
  useEffect(() => {
    if (size.width > 0 && size.height > 0) {
      // Assuming cell size of ~20px for calculation
      const cellSize = 40;
      const width = Math.floor(size.width / cellSize);
      const height = Math.floor(size.height / cellSize);
      setBoard(emptyBoard(width, height));
    }
  }, [size.width, size.height]);

  const solveLoop = async () => {
    // eslint-disable-next-line no-constant-condition
    while (true) {
      await solve();
      await sleep(3000);
    }
  };

  // run the solver loop, re-rendering (with a sleep) after each step so the
  // reveals/flags are visible as they happen
  const solve = async () => {
    if (solving) {
      return;
    }
    setSolving(true);
    // fresh random seed + fresh empty board, so every run generates and solves
    // a brand-new board
    seed = Math.floor(Math.random() * 1000) + 1;
    setSeed(seed);
    const cellSize = 40;
    const width = Math.floor(size.width / cellSize);
    const height = Math.floor(size.height / cellSize);
    const solver = new Solver(emptyBoard(width, height));
    while (solver.step()) {
      setBoard([...solver.board]);
      await sleep(STEP_DELAY);
    }
    setSolving(false);
  };

  return (
    <div className="w-screen h-screen flex flex-col items-center bg-neutral-400 font-jersey">
      <button
        onClick={solveLoop}
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
