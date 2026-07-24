import { useMemo } from "react";
import ChessBoard, { ChessBoardData } from "./ChessBoard";
import { useDimensions } from "../DimensionsContext";

// a full-screen grid of empty squares, sized to the shared window dimensions
const emptyBoard = (width: number, height: number): ChessBoardData => {
  return Array(height)
    .fill(null)
    .map((_, i) =>
      Array(width)
        .fill(null)
        .map((_, j) => ({ x: j, y: i, piece: null })),
    );
};

const Chess = () => {
  const { width, height } = useDimensions();
  const board = useMemo(() => emptyBoard(width, height), [width, height]);

  return (
    <div className="w-screen flex flex-col bg-[#1e262e]">
      <ChessBoard board={board}></ChessBoard>
    </div>
  );
};

export default Chess;
