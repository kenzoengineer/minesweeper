import { memo } from "react";
import { CELL_SIZE } from "../DimensionsContext";
import { BoardState } from "./game";

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
              className={`${state[y][x] == 0 ? (x % 2 === y % 2 ? "bg-[#101010]" : "bg-[#1f1f1f]") : "bg-white"} w-10 h-10 shrink-0`}
            />
          ))}
        </div>
      ))}
    </>
  );
});

export default TetrisBoard;
