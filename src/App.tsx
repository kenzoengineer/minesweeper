import { createContext, useCallback, useEffect, useRef, useState } from "react";
import "./App.css";
import { Board } from "./Board";
import {
  CellData,
  HEIGHT,
  iibAround,
  MinesweeperBoard,
  MINES,
  Statistics,
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

type statisticsContextType = {
  statistics: Statistics;
  setStatistics: React.Dispatch<React.SetStateAction<Statistics>>;
};

const iStatisticsContextState = {
  statistics: {
    leftClicks: 0,
    rightClicks: 0,
    chords: 0,
  },
  setStatistics: () => {},
};

type hoverContextType = {
  // called by a Cell when the pointer enters (cell) or leaves (null) it
  setHovered: (cell: CellData | null) => void;
};

const iHoverContextState = {
  setHovered: () => {},
};

export const boardContext = createContext<boardContextType>(iBoardContextState);
export const statisticsContext = createContext<statisticsContextType>(
  iStatisticsContextState,
);
export const hoverContext = createContext<hoverContextType>(iHoverContextState);
function App() {
  const [board, setBoard] = useState<MinesweeperBoard>([]);
  const [statistics, setStatistics] = useState<Statistics>({
    leftClicks: 0,
    rightClicks: 0,
    chords: 0,
  });

  // the tile the pointer is currently over; a ref so hovering doesn't re-render
  const hoveredRef = useRef<CellData | null>(null);
  const setHovered = useCallback((cell: CellData | null) => {
    hoveredRef.current = cell;
  }, []);

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
      const solver = new Solver(next, statistics);
      solver.move_simple(cell);
      setBoard(next);
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [board, statistics]);

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
    console.log(res);
    setBoard(res);
  }, [WIDTH, HEIGHT, MINES]);
  return (
    <div>
      <boardContext.Provider value={{ board, setBoard }}>
        <statisticsContext.Provider value={{ statistics, setStatistics }}>
          <hoverContext.Provider value={{ setHovered }}>
            <Board />
          </hoverContext.Provider>
        </statisticsContext.Provider>
      </boardContext.Provider>
      <div className="flex flex-col">
        <p>Left clicks: {statistics.leftClicks}</p>
        <p>Right clicks: {statistics.rightClicks}</p>
        <p>Chords: {statistics.chords}</p>
      </div>
    </div>
  );
}

export default App;
