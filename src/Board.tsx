import { forwardRef } from "react";
import { CellData, MinesweeperBoard } from "./game";

const COLORS: Record<string, string> = {
  "0": "bg-[#384048]",
  "1": "bg-[#7cc7ff]",
  "2": "bg-[#66c266]",
  "3": "bg-[#ff7788]",
  "4": "bg-[#ee88ff]",
  "5": "bg-[#f472b6]",
  "6": "bg-[#60a5fa]",
  "7": "bg-black",
  "8": "bg-neutral-500",
  "-1": "bg-white",
};

const Cell = ({ value }: { value: CellData }) => {
  return (
    <div
      className={`w-10 h-10 shrink-0 flex items-center justify-center ${
        value.revealed
          ? "border-[#1e262e] border-[1px] bg-[#384048]"
          : "border-t-[#707880] border-l-[#707880] border-r-[#222a32] border-b-[#222a32] border-4 bg-[#4c545c]"
      }`}
    >
      {value.flagged ? (
        <div className="rounded-full text-[#f65454] ">▶&#xFE0E;</div>
      ) : !value.revealed ? (
        <div />
      ) : (
        <div
          className={`w-3 h-3 rounded-full opacity-55 ${COLORS[value.value]}`}
        />
      )}
    </div>
  );
};

export const Board = forwardRef<HTMLDivElement, { board: MinesweeperBoard }>(
  ({ board }, ref) => {
    return (
      <div
        className="flex flex-col flex-1 w-full max-h-full overflow-auto"
        ref={ref}
      >
        {board.map((row, i) => {
          return (
            <div className="flex shrink-0" key={`board-${i}`}>
              {row.map((cell, j) => {
                return <Cell value={cell} key={`cell-${i}-${j}`}></Cell>;
              })}
            </div>
          );
        })}
      </div>
    );
  },
);
