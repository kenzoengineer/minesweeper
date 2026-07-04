import { useContext } from "react";
import { boardContext, hoverContext } from "./App";
import { CellData, clearNew, flag, revealHelper } from "./game";

const OVERRIDE = false;

interface ICell {
  x: number;
  y: number;
  value: CellData;
}

const COLORS: Record<string, string> = {
  "0": "text-neutral-400",
  "1": "text-sky-600",
  "2": "text-green-800",
  "3": "text-red-600",
  "4": "text-indigo-800",
  "5": "text-rose-800",
  "6": "text-cyan-800",
  "7": "text-black",
  "8": "text-neutral-500",
  "-1": "text-white",
};

const DISPLAY: Record<string, string> = {
  "-1": "💣",
  "-2": "🚩",
};

const Cell = ({ x, y, value }: ICell) => {
  const { board, setBoard } = useContext(boardContext);
  const { setHovered } = useContext(hoverContext);
  const leftclick = () => {
    let temp = [...board!];
    clearNew(temp);
    revealHelper(x, y, temp);
    setBoard(temp);
  };

  const rightClick = (e: React.MouseEvent<HTMLDivElement>) => {
    e.preventDefault();
    let temp = [...board!];
    flag(x, y, temp);
    setBoard(temp);
  };

  const displayedValue = value.flagged
    ? DISPLAY["-2"]
    : !(value.revealed || OVERRIDE)
    ? ""
    : value.value === -1
    ? DISPLAY["-1"]
    : value.value;

  return (
    <div
      onClick={leftclick}
      onContextMenu={rightClick}
      onMouseEnter={() => setHovered(value)}
      onMouseLeave={() => setHovered(null)}
      className={`w-10 h-10 text-2xl font-bold flex items-center justify-center ${
        value.revealed
          ? "border-neutral-500 border-[1px]"
          : "border-t-white border-l-white border-r-neutral-500 border-b-neutral-500 border-2"
      } bg-neutral-400 ${COLORS[value.value]} ${
        value.new && "shadow-inner shadow-red-900"
      }`}
    >
      {displayedValue}
    </div>
  );
};

export const Board = () => {
  const { board } = useContext(boardContext);
  return (
    <div className="flex flex-col">
      {board!.map((row, i) => {
        return (
          <div className="flex">
            {row.map((cell, j) => {
              return <Cell value={cell} x={j} y={i}></Cell>;
            })}
          </div>
        );
      })}
    </div>
  );
};
