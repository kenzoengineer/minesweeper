import { useEffect, useState } from "react";
import { Board } from "./Board";
import { MinesweeperBoard, setSeed } from "./game";
import { Solver } from "./solver";
import { useElementSize } from "./hooks/useElementSize";

// sleep time
const STEP_DELAY = 50;
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
  const width = Math.floor(size.width / CELL_SIZE);
  const height = Math.floor(size.height / CELL_SIZE);

  const [board, setBoard] = useState<MinesweeperBoard>([]);
  const [solving, setSolving] = useState(false);

  // resize side effect
  useEffect(() => {
    if (size.width > 0 && size.height > 0) {
      setBoard(emptyBoard(width, height));
    }
  }, [size.width, size.height]);

  // keep solving boards
  const solveLoop = async () => {
    // eslint-disable-next-line no-constant-condition
    while (true) {
      await solve();
      await sleep(3000);
    }
  };

  // solve the board
  const solve = async () => {
    if (solving) {
      return;
    }
    setSolving(true);
    setSeed(Math.floor(Math.random() * 1000) + 1);
    const solver = new Solver(emptyBoard(width, height));
    while (solver.step() && solving) {
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
