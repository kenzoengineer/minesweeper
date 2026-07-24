import { useCallback, useEffect, useRef, useState } from "react";
import ChessBoard, { ChessBoardData } from "./ChessBoard";
import { useDimensions } from "../DimensionsContext";
import { Chaser } from "./chaser";
import { Piece } from "./game";
import { sleep } from "../utils";

// ms between hunter moves
const STEP_DELAY = 50;

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
  const [board, setBoard] = useState<ChessBoardData>([]);
  const [pieces, setPieces] = useState<Piece[]>([]);

  // incremented to cancel the running loop on resize / unmount
  const runIdRef = useRef(0);

  const runLoop = useCallback(async () => {
    const runId = ++runIdRef.current; // claim this run, cancelling any prior one

    const grid = emptyBoard(width, height);
    setBoard(grid);

    const chaser = new Chaser(grid);
    while (runIdRef.current === runId) {
      setPieces(chaser.step());
      await sleep(STEP_DELAY);
    }
  }, [width, height]);

  // auto-start on mount; restart whenever the (shared) board size changes
  useEffect(() => {
    if (width > 0 && height > 0) {
      runLoop();
    }
    return () => {
      runIdRef.current += 1; // cancel the running loop on resize / unmount
    };
  }, [runLoop, width, height]);

  return (
    <div className="w-screen flex flex-col bg-[#1e262e]">
      <ChessBoard pieces={pieces} board={board}></ChessBoard>
    </div>
  );
};

export default Chess;
