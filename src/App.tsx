import { createContext, useCallback, useRef, useState } from "react";
import { Board } from "./Board";
import {
  CellData,
  HEIGHT,
  MinesweeperBoard,
  SEED,
  setSeed as seedRandom,
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

export const boardContext = createContext<boardContextType>(iBoardContextState);
export const hoverContext = createContext<hoverContextType>(iHoverContextState);

// how many seeds to scan before giving up looking for an anomaly
const SCAN_LIMIT = 1000;

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

// solve a fresh board for the given seed with the given reduction radius
const solved = (seed: number, far: boolean): MinesweeperBoard => {
  const board = emptyBoard();
  seedRandom(seed);
  const solver = new Solver(board, far);
  while (solver.step()) {
    // run to completion
  }
  return board;
};

// true if the two boards ended up in a different state
const differ = (a: MinesweeperBoard, b: MinesweeperBoard) => {
  for (let y = 0; y < a.length; y++) {
    for (let x = 0; x < a[y].length; x++) {
      if (
        a[y][x].revealed !== b[y][x].revealed ||
        a[y][x].flagged !== b[y][x].flagged
      ) {
        return true;
      }
    }
  }
  return false;
};

// one-line summary of how far a solved board got
const summarize = (b: MinesweeperBoard) => {
  let safe = 0;
  let revealedSafe = 0;
  let flagged = 0;
  for (const row of b) {
    for (const cell of row) {
      if (cell.value !== -1) safe++;
      if (cell.revealed && cell.value !== -1) revealedSafe++;
      if (cell.flagged) flagged++;
    }
  }
  const done = safe > 0 && revealedSafe === safe;
  return `${done ? "SOLVED" : "stuck"} · ${revealedSafe}/${safe} safe revealed · ${flagged} flagged`;
};

function App() {
  const [seed, setSeed] = useState(SEED);
  const [boardNear, setBoardNear] = useState<MinesweeperBoard>(() =>
    solved(SEED, false),
  );
  const [boardFar, setBoardFar] = useState<MinesweeperBoard>(() =>
    solved(SEED, true),
  );
  const [message, setMessage] = useState("");

  // the tile the pointer is currently over; a ref so hovering doesn't re-render
  const hoveredRef = useRef<CellData | null>(null);
  const setHovered = useCallback((cell: CellData | null) => {
    hoveredRef.current = cell;
  }, []);

  // scan forward from the current seed until the two solvers disagree
  const findAnomaly = () => {
    for (let s = seed + 1; s <= seed + SCAN_LIMIT; s++) {
      const near = solved(s, false);
      const far = solved(s, true);
      if (differ(near, far)) {
        setSeed(s);
        setBoardNear(near);
        setBoardFar(far);
        setMessage(`anomaly at seed ${s}`);
        return;
      }
    }
    // none found; jump ahead so another click keeps scanning
    setSeed(seed + SCAN_LIMIT);
    setMessage(`no anomaly in seeds ${seed + 1}..${seed + SCAN_LIMIT}`);
  };

  return (
    <>
      <div className="flex gap-8 p-4 overflow-x-auto">
        <div>
          <h2 className="font-bold mb-2">neighbors (distance 1)</h2>
          <boardContext.Provider
            value={{ board: boardNear, setBoard: setBoardNear }}
          >
            <hoverContext.Provider value={{ setHovered }}>
              <Board />
            </hoverContext.Provider>
          </boardContext.Provider>
          <p className="mt-2">{summarize(boardNear)}</p>
        </div>
        <div>
          <h2 className="font-bold mb-2">farNeighbors (distance 2)</h2>
          <boardContext.Provider
            value={{ board: boardFar, setBoard: setBoardFar }}
          >
            <hoverContext.Provider value={{ setHovered }}>
              <Board />
            </hoverContext.Provider>
          </boardContext.Provider>
          <p className="mt-2">{summarize(boardFar)}</p>
        </div>
      </div>
      <div className="flex items-center gap-4 m-4">
        <button
          onClick={findAnomaly}
          className="px-3 py-1 bg-neutral-700 text-white rounded"
        >
          Find next anomaly
        </button>
        <span>seed {seed}</span>
        <span>{message}</span>
      </div>
    </>
  );
}

export default App;
