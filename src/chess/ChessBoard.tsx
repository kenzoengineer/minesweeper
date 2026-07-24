import { Piece } from "./game";

export type ChessSquare = {
  x: number;
  y: number;
  piece: string | null;
};

export type ChessBoardData = ChessSquare[][];
interface ChessBoardProps {
  pieces: Piece[];
  board: ChessBoardData;
}

const ChessBoard = ({ pieces, board }: ChessBoardProps) => {
  return (
    <div className="flex flex-col flex-1 items-center w-full max-h-full overflow-auto">
      {board.map((row, i) => {
        return (
          <div className="flex shrink-0" key={`chessboard-${i}`}>
            {row.map((square, j) => {
              return (
                <>
                  <Square square={square} pieces={pieces}  key={`chesssquare-${i}-${j}`} />
                </>
              );
            })}
          </div>
        );
      })}
    </div>
  );
};

const Square = ({ square, pieces }: { square: ChessSquare, pieces: Piece[] }) => {
  return (
    <div
      className={`${square.x % 2 === square.y % 2 ? "bg-[#384048]" : "bg-[#4c545c]"}
      w-10 h-10 shrink-0 flex items-center justify-center`}
    >
      {returnAtSquare(square.x, square.y, pieces)}
    </div>
  );
};

const returnAtSquare = (x: number, y: number, pieces: Piece[]) => {
  for (const piece of pieces) {
    if (piece.x == x && piece.y == y) {
      return (<div className={`w-4 h-4 ${piece.hunter ? "bg-white" : "bg-black"}`} ></div>);
    }
  }
  return null;
}

export default ChessBoard;
