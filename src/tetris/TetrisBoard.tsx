import { memo } from "react";
import { CELL_SIZE } from "../DimensionsContext";
import { BoardState, SquareState } from "./game";

// standard tetris colors, indexed by Square.color
const COLORS = [
  "bg-cyan-400", // i
  "bg-yellow-400", // o
  "bg-purple-500", // t
  "bg-green-500", // s
  "bg-red-500", // z
  "bg-blue-500", // j
  "bg-orange-500", // l
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
