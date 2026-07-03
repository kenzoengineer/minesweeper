import { createContext, useEffect, useState } from "react";
import "./App.css";
import { Board } from "./Board";

const WIDTH = 25;
const HEIGHT = 25;
const MINES = 99;

export enum ACTIONS_ENUM {
  none,
  leftClick,
  rightClick,
  chord,
}

const inBound = (x: number, y: number, board: CellData[][]) => {
  if (y < board.length && y >= 0) {
    if (x < board[y].length && x >= 0) {
      return true;
    }
  }
};

const setAll = (board: CellData[][], overrides: Partial<CellData>) => {
  for (let x = 0; x < board.length; x++) {
    for (let y = 0; y < board[x].length; y++) {
      board[y][x] = {
        ...board[y][x],
        ...overrides,
      };
    }
  }
};

// count number of mines
const minesAround = (x: number, y: number, board: CellData[][]) => {
  let count = 0;
  for (let i = -1; i < 2; i++) {
    for (let j = -1; j < 2; j++) {
      if (i === 0 && j === 0) {
        continue;
      }
      if (inBound(x + i, y + j, board)) {
        count += board[y + j][x + i].value === -1 ? 1 : 0;
      }
    }
  }
  return count;
};

// toggle flag in bound
const fib = (x: number, y: number, board: CellData[][]) => {
  if (!inBound(x, y, board)) {
    return;
  }
  if (board[y][x].revealed) {
    return;
  }
  board[y][x].flagged = !board[y][x].flagged;
  return ACTIONS_ENUM.rightClick;
};

// reveal in bound
const rib = (x: number, y: number, board: CellData[][]) => {
  if (inBound(x, y, board)) {
    board[y][x].revealed = true;
  }
};

// mutate in bound
const mib = (x: number, y: number, board: CellData[][], by: number) => {
  if (inBound(x, y, board)) {
    if (board[y][x].value >= 0) {
      board[y][x].value += by;
    }
  }
};

// increment around
const iibAround = (
  x: number,
  y: number,
  board: CellData[][],
  by: number = 1
) => {
  for (let i = -1; i < 2; i++) {
    for (let j = -1; j < 2; j++) {
      mib(x + i, y + j, board, by);
    }
  }
};

export type CellCounts = {
  valid: number;
  revealed: number;
  flagged: number;
};
const getCounts = (x: number, y: number, board: CellData[][]) => {
  const counts: CellCounts = {
    valid: 0,
    revealed: 0,
    flagged: 0,
  };
  for (let i = -1; i < 2; i++) {
    for (let j = -1; j < 2; j++) {
      if (i === 0 && j === 0) {
        continue;
      }
      if (inBound(x + i, y + j, board)) {
        counts.valid++;
        if (board[y + j][x + i].flagged) {
          counts.flagged++;
        }
        if (board[y + j][x + i].revealed) {
          counts.revealed++;
        }
      }
    }
  }
  return counts;
};

export const revealHelper = (
  x: number,
  y: number,
  board: CellData[][],
  statistics: Statistics
) => {
  setAll(board, { new: false });
  // handle normal case
  if (!board[y][x].revealed) {
    reveal(x, y, board, statistics);
    return ACTIONS_ENUM.leftClick;
  }

  const counts = getCounts(x, y, board);
  if (counts.flagged !== board[y][x].value) {
    return;
  }
  for (let i = -1; i < 2; i++) {
    for (let j = -1; j < 2; j++) {
      if (i === 0 && j === 0) {
        continue;
      }
      reveal(x + i, y + j, board, statistics);
    }
  }
  return ACTIONS_ENUM.chord;
};

const reveal = (
  x: number,
  y: number,
  board: CellData[][],
  statistics: Statistics
) => {
  if (!inBound(x, y, board)) {
    return;
  }

  if (board[y][x].revealed || board[y][x].flagged) {
    return;
  }

  if (board[y][x].value === -1) {
    if (statistics.leftClicks === 0) {
      iibAround(x, y, board, -1);
      board[y][x].value = minesAround(x, y, board);
      while (true) {
        const _x = Math.floor(Math.random() * WIDTH);
        const _y = Math.floor(Math.random() * HEIGHT);
        if (board[_y][_x].value != -1 && _x != x && _y != y) {
          board[_y][_x].value = -1;
          iibAround(_x, _y, board);
          break;
        }
      }
    } else {
      for (let a = 0; a < HEIGHT; a++) {
        for (let b = 0; b < WIDTH; b++) {
          board[a][b].revealed = true;
        }
      }
      return;
    }
  }

  rib(x, y, board);

  if (board[y][x].value > 0) {
    board[y][x].new = true;
    return;
  }

  for (let i = -1; i < 2; i++) {
    for (let j = -1; j < 2; j++) {
      if (!inBound(x + i, y + j, board) || board[y + j][x + i].revealed) {
        continue;
      }
      reveal(x + i, y + j, board, statistics);
    }
  }
};

export const flag = (x: number, y: number, board: CellData[][]) => {
  return fib(x, y, board);
};

export type CellData = {
  value: number;
  revealed: boolean;
  flagged: boolean;
  new: boolean;
};

type boardContextType = {
  board: CellData[][] | null;
  setBoard: React.Dispatch<React.SetStateAction<CellData[][]>>;
};

const iBoardContextState = {
  board: null,
  setBoard: () => {},
};

export type Statistics = {
  leftClicks: number;
  rightClicks: number;
  chords: number;
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

export const boardContext = createContext<boardContextType>(iBoardContextState);
export const statisticsContext = createContext<statisticsContextType>(
  iStatisticsContextState
);
function App() {
  const [board, setBoard] = useState<CellData[][]>([]);
  const [statistics, setStatistics] = useState<Statistics>({
    leftClicks: 0,
    rightClicks: 0,
    chords: 0,
  });

  useEffect(() => {
    let res = [];
    for (let i = 0; i < HEIGHT; i++) {
      res.push(
        Array(WIDTH)
          .fill(null)
          .map(() => {
            return {
              value: 0,
              revealed: false,
              flagged: false,
              new: false,
            };
          })
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
        <statisticsContext.Provider value={{ statistics, setStatistics }}>
          <Board />
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
