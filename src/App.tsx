import { useState } from "react";
import { Board } from "./Board";
import { HEIGHT, MinesweeperBoard, setSeed, WIDTH } from "./game";
import { Solver } from "./solver";

const sleep = (ms: number) =>
  new Promise<void>((resolve) => setTimeout(resolve, ms));

// the seed!
let seed = 1;
// delay between solver steps so the run is watchable
const STEP_DELAY = 50;

// a fresh, mine-free board (mines are placed on the first reveal)
const emptyBoard = (): MinesweeperBoard => {
  const res: MinesweeperBoard = [];
  for (let i = 0; i < HEIGHT; i++) {
    res.push(
      Array(WIDTH)
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
  const [board, setBoard] = useState<MinesweeperBoard>(emptyBoard());
  const [solving, setSolving] = useState(false);

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
    const solver = new Solver(emptyBoard());
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
      <Board board={board} />
    </div>
  );
}

export default App;
