import { useCallback, useEffect, useRef, useState } from "react";
import TetrisBoard from "./TetrisBoard";
import { BoardState, emptyBoard, Tetris as TetrisGame } from "./game";
import { sleep } from "../utils";

const WIDTH = 10;
const HEIGHT = 15;
// ms between game steps
const STEP_DELAY = 100;

const Tetris = () => {
  const [boardState, setBoardState] = useState<BoardState>(() => emptyBoard(WIDTH, HEIGHT));

  // incremented to cancel the running loop on unmount
  const runIdRef = useRef(0);

  const runLoop = useCallback(async () => {
    const runId = ++runIdRef.current; // claim this run, cancelling any prior one

    const game = new TetrisGame(WIDTH, HEIGHT);
    while (runIdRef.current === runId) {
      setBoardState(game.step());
      await sleep(STEP_DELAY);
    }
  }, []);

  // auto-start on mount
  useEffect(() => {
    runLoop();
    return () => {
      runIdRef.current += 1; // cancel the running loop on unmount
    };
  }, [runLoop]);

  return (
    <div className="bg-[#1f1f1f]">
      <TetrisBoard width={WIDTH} height={HEIGHT} state={boardState} />
    </div>
  );
};

export default Tetris;
