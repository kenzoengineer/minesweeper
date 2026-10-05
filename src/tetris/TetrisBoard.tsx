import { memo } from "react";
import { CELL_SIZE } from "../DimensionsContext";
import { BoardState, SquareState } from "./game";

// copied from the minesweeper palette, indexed by Square.color
const COLORS = [
  "bg-[#7cc7ff]",
  "bg-[#66c266]",
  "bg-[#ff7788]",
  "bg-[#ee88ff]",
  "bg-[#ffaa66]",
  "bg-[#ffdd66]",
  "bg-white",
];

interface TetrisBoardProps {
  width: number,
  height: number,
  state: BoardState,
}

const TetrisBoard = ({ width, height, state }: TetrisBoardProps) => {
  return (
    <div className="flex flex-1 items-center justify-center w-full h-full overflow-hidden">
      <div
        className="relative shrink-0"
        style={{ width: width * CELL_SIZE, height: height * CELL_SIZE }}
      >
        <Grid width={width} height={height} state={state} />
      </div>
    </div>
  );
};

const Grid = memo(({ width, height, state }: { width: number; height: number, state: BoardState }) => {
  return (
    <>
      {Array.from({ length: height }, (_, y) => (
        <div className="flex" key={`row-${y}`}>
          {Array.from({ length: width }, (_, x) => (
            <div
              key={`cell-${x}-${y}`}
              className={`${state[y][x].state === SquareState.empty ? "bg-[#101010]" : COLORS[state[y][x].color]} w-10 h-10 shrink-0`}
            />
          ))}
        </div>
      ))}
    </>
  );
});

export default TetrisBoard;
