import { Minesweeper } from "./minesweeper/Minesweeper";

export const Header = () => {
  return (
    <div className="w-screen h-screen flex flex-col bg-[#1e262e] roboto-mono">
      <Minesweeper />
      <div className="bg-[#1e262e] bg-opacity-75 text-white absolute
        left-1/2 translate-x-[-50%] top-1/2
        translate-y-[-50%] flex flex-col px-10 py-5">
        <h1 className="text-4xl font-bold mb-4">Ken Jiang - 江华栋</h1>
        <pre>

          <p>Software Engineering       @ Sentry</p>
          <p>Computer Engineering Alum  @ UWaterloo</p>
        </pre>
        </div>
    </div>
  );
};
