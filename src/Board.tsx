import { CellData, MinesweeperBoard } from "./game";

const OVERRIDE = false;

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

const Cell = ({ value }: { value: CellData }) => {
  const displayedValue = value.flagged
    ? DISPLAY["-2"]
    : !(value.revealed || OVERRIDE)
      ? ""
      : value.value === -1
        ? DISPLAY["-1"]
        : value.value;

  return (
    <div
      className={`w-10 h-10 text-2xl font-bold flex items-center justify-center ${
        value.revealed
          ? "border-neutral-500 border-[1px]"
          : "border-t-white border-l-white border-r-neutral-500 border-b-neutral-500 border-2"
      } bg-neutral-400 ${COLORS[value.value]}`}
    >
      {displayedValue}
    </div>
  );
};

export const Board = ({ board }: { board: MinesweeperBoard }) => {
  return (
    <div className="flex flex-col">
      {board.map((row, i) => {
        return (
          <div className="flex" key={`board-${i}`}>
            {row.map((cell, j) => {
              return <Cell value={cell} key={`cell-${i}-${j}`}></Cell>;
            })}
          </div>
        );
      })}
    </div>
  );
};
