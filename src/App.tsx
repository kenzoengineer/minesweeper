import { useEffect, useState } from "react";
import { Board } from "./Board";
import { HEIGHT, MinesweeperBoard, SEED, setSeed, WIDTH } from "./game";
import { Solver } from "./solver";

const sleep = (ms: number) =>
  new Promise<void>((resolve) => setTimeout(resolve, ms));

// delay between solver steps so the run is watchable
const STEP_DELAY = 50;

function App() {
  const [board, setBoard] = useState<MinesweeperBoard>([]);

  const [solving, setSolving] = useState(false);

  // run the solver loop, re-rendering (with a sleep) after each step so the
  // reveals/flags are visible as they happen
  const solve = async () => {
    if (!board || solving) {
      return;
    }
    setSolving(true);
    // reset the RNG so a given SEED reproduces the same board + run
    setSeed(SEED);
    const solver = new Solver(board);
    while (solver.step()) {
      setBoard([...solver.board]);
      await sleep(STEP_DELAY);
    }
    setSolving(false);
  };

  useEffect(() => {
    // board begins empty, mines are populated after the first click
    const res = [];
    for (let i = 0; i < HEIGHT; i++) {
      res.push(
        Array(WIDTH)
          .fill(null)
          .map((_, j) => {
            return {
              x: j,
              y: i,
              value: 0,
              revealed: false,
              flagged: false,
            };
          }),
      );
    }
    setBoard(res);
  }, []);
  return (
    <>
      <div>
        <Board board={board} />
      </div>
      <div className="flex flex-col">
        <button
          onClick={solve}
          disabled={solving}
          className="w-24 my-2 px-3 py-1 bg-neutral-700 text-white rounded disabled:opacity-50"
        >
          {solving ? "Solving…" : "Solve"}
        </button>
      </div>
    </>
  );
}

export default App;
