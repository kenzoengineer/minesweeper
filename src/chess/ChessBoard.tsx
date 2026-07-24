export type ChessSquare = {
  x: number;
  y: number;
  piece: string | null;
};

export type ChessBoardData = ChessSquare[][];
interface ChessBoardProps {
  board: ChessBoardData;
}

const ChessBoard = ({ board }: ChessBoardProps) => {
  return (
    <div className="w-screen h-screen flex flex-col bg-[#1e262e]">
      {board.map((row, i) => {
        return (
          <div className="flex shrink-0" key={`chessboard-${i}`}>
            {row.map((square, j) => {
              return (
                <Square square={square} key={`chesssquare-${i}-${j}`}></Square>
              );
            })}
          </div>
        );
      })}
    </div>
  );
};

const Square = ({ square }: { square: ChessSquare }) => {
  return (
    <div
      className={`${square.x % 2 === square.y % 2 ? "bg-[#384048]" : "bg-[#4c545c]"}
      w-10 h-10 shrink-0 flex items-center justify-center`}
    >
      {square.piece}
    </div>
  );
};

export default ChessBoard;
