import { createContext, useCallback, useEffect, useRef, useState } from "react";
import "./App.css";
import { Board } from "./Board";
import {
  CellData,
  HEIGHT,
  iibAround,
  MinesweeperBoard,
  MINES,
  WIDTH,
} from "./game";
import { Solver } from "./solver";

type boardContextType = {
  board: MinesweeperBoard | null;
  setBoard: React.Dispatch<React.SetStateAction<MinesweeperBoard>>;
};

const iBoardContextState = {
  board: null,
  setBoard: () => {},
};

type hoverContextType = {
  // called by a Cell when the pointer enters (cell) or leaves (null) it
  setHovered: (cell: CellData | null) => void;
};

const iHoverContextState = {
  setHovered: () => {},
};

const sleep = (ms: number) =>
  new Promise<void>((resolve) => setTimeout(resolve, ms));

// delay between solver steps so the run is watchable
const STEP_DELAY = 50;

export const boardContext = createContext<boardContextType>(iBoardContextState);
export const hoverContext = createContext<hoverContextType>(iHoverContextState);
function App() {
  const [board, setBoard] = useState<MinesweeperBoard>([]);

  // the tile the pointer is currently over; a ref so hovering doesn't re-render
  const hoveredRef = useRef<CellData | null>(null);
  const setHovered = useCallback((cell: CellData | null) => {
    hoveredRef.current = cell;
  }, []);

  const [solving, setSolving] = useState(false);

  // run the solver loop, re-rendering (with a sleep) after each step so the
  // reveals/flags are visible as they happen
  const solve = async () => {
    if (!board || solving) {
      return;
    }
    setSolving(true);
    const solver = new Solver(board);
    while (true) {
      const result = solver.step();
      setBoard([...solver.board]);
      if (result !== "progress") {
        break;
      }
      await sleep(STEP_DELAY);
    }
    setSolving(false);
  };

  // press "z" while hovering a tile to run the solver on it
  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key !== "z") {
        return;
      }
      const cell = hoveredRef.current;
      if (!cell || !board) {
        return;
      }
      const next = [...board];
      const solver = new Solver(next);
      solver.move_simple(cell);
      setBoard(next);
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [board]);

  useEffect(() => {
    let res = [];
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
              new: false,
            };
          }),
      );
    }

    let minesLeft = MINES;
    if (WIDTH * HEIGHT < MINES) {
      minesLeft = WIDTH * HEIGHT;
    }
    while (minesLeft > 0) {
      const x = Math.floor(Math.random() * WIDTH);
      const y = Math.floor(Math.random() * HEIGHT);
      if (res[y][x].value != -1) {
        res[y][x].value = -1;
        iibAround(x, y, res);
        minesLeft--;
      }
    }
    setBoard(res);
  }, [WIDTH, HEIGHT, MINES]);
  return (
    <div>
      <boardContext.Provider value={{ board, setBoard }}>
        <hoverContext.Provider value={{ setHovered }}>
          <Board />
        </hoverContext.Provider>
      </boardContext.Provider>
      <div className="flex flex-col">
        <button
          onClick={solve}
          disabled={solving}
          className="w-24 my-2 px-3 py-1 bg-neutral-700 text-white rounded disabled:opacity-50"
        >
          {solving ? "Solving…" : "Solve"}
        </button>
      </div>
    </div>
  );
}

export default App;
