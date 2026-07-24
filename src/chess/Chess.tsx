import { useEffect, useState } from "react";
import ChessBoard, { ChessBoardData } from "./ChessBoard";
import { useDimensions } from "../DimensionsContext";
import { Chaser } from "./chaser";
import { bfs, Piece } from "./game";
import { sleep } from "../utils";

// a full-screen grid of empty squares, sized to the shared window dimensions
const emptyBoard = (width: number, height: number): ChessBoardData => {
  return Array(height)
    .fill(null)
    .map((_, i) =>
      Array(width)
        .fill(null)
        .map((_, j) => ({ x: i, y: j, piece: null })),
    );
};

const Chess = () => {
  const { width, height } = useDimensions();
  const [board, setBoard] = useState<ChessBoardData>(emptyBoard(width, height));
  const [pieces, setPieces] = useState<Piece[]>([]);
  useEffect(() => {
    runLoop();
  }, []);

  const runLoop = async () => {
    const chaser = new Chaser(board);
    while (true) {
      const newPieces = chaser.step();
      setPieces(newPieces);
      await sleep(1000);
    }
  }

  return (
    <div className="w-screen flex flex-col bg-[#1e262e]">
      <ChessBoard pieces={pieces} board={board}></ChessBoard>
    </div>
  );
};

export default Chess;
