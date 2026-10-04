import { Minesweeper } from "./minesweeper/Minesweeper";

const Header = () => {
  return (
    <div className="w-screen flex flex-col bg-[#1f1f1f]">
      <Minesweeper />
      <div
        className=" text-white absolute
        left-0 bottom-0 flex flex-col px-10 py-5"
      >
        <h1 className="font-bbh-hegarty text-9xl">KEN <br/> JIANG</h1>
        <h2>SWE @ Sentry · UWaterloo Alum · Resume</h2>
      </div>
    </div>
  );
};

export default Header;
