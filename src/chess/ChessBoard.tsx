import { memo } from "react";
import { CELL_SIZE } from "../DimensionsContext";
import { Piece } from "./game";

interface ChessBoardProps {
  width: number;
  height: number;
  pieces: Piece[];
}

const ChessBoard = ({ width, height, pieces }: ChessBoardProps) => {
  return (
    <div className="flex flex-col flex-1 items-center w-full max-h-full overflow-auto">
      <div
        className="relative shrink-0"
        style={{ width: width * CELL_SIZE, height: height * CELL_SIZE }}
      >
        <Grid width={width} height={height} />
        {pieces.map((piece, i) => (
          <Marker piece={piece} key={`piece-${i}`} />
        ))}
      </div>
    </div>
  );
};

const Grid = memo(({ width, height }: { width: number; height: number }) => {
  return (
    <>
      {Array.from({ length: height }, (_, y) => (
        <div className="flex" key={`row-${y}`}>
          {Array.from({ length: width }, (_, x) => (
            <div
              key={`cell-${x}-${y}`}
              className={`${x % 2 === y % 2 ? "bg-[#384048]" : "bg-[#4c545c]"} w-10 h-10 shrink-0`}
            />
          ))}
        </div>
      ))}
    </>
  );
});

// absolutely positioned pieces
const Marker = ({ piece }: { piece: Piece }) => {
  return (
    <div
      className="absolute transition-all duration-75 left-0 top-0 w-10 h-10 flex items-center justify-center"
      style={{
        transform: `translate(${piece.x * CELL_SIZE}px, ${piece.y * CELL_SIZE}px)`,
      }}
    >
      <div className={`w-4 h-4 ${piece.hunter ? "bg-white" : "bg-black"}`} />
    </div>
  );
};

export default ChessBoard;
