import { Minesweeper } from "./minesweeper/Minesweeper";

export const Header = () => {
  return (
    <div className="w-screen h-screen flex flex-col bg-[#1e262e]">
      <header className="p-3 text-xl font-bold text-white">
        minesweeper solver
      </header>
      <Minesweeper />
    </div>
  );
};
