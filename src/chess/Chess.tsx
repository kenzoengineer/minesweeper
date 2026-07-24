import { useState } from "react";
import ChessBoard, { ChessBoardData } from "./ChessBoard";

const emptyBoard = () => {
  return Array(8)
    .fill(null)
    .map((_, i) =>
      Array(8)
        .fill(null)
        .map((_, j) => ({ x: i, y: j, piece: null })),
    );
};

const Chess = () => {
  const [board, setBoard] = useState<ChessBoardData>(emptyBoard());
  return (
    <div className="w-screen h-screen flex flex-col bg-[#1e262e]">
      <ChessBoard board={board}></ChessBoard>
    </div>
  );
};

export default Chess;
