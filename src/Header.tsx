import { Minesweeper } from "./minesweeper/Minesweeper";

export const Header = () => {
  return (
    <div className="w-screen flex flex-col bg-[#1e262e]">
      <Minesweeper />
      <div
        className="bg-[#1e262e] bg-opacity-85 text-white absolute
        left-1/2 translate-x-[-50%] top-1/2
        translate-y-[-50%] flex flex-col px-10 py-5"
      >
        <h1 className="text-4xl font-bold mb-4">Ken Jiang - 江华栋</h1>
        <pre className="mb-4">
          <p>Software Engineering @ Sentry</p>
          <p>Computer Engineering Alum @ UWaterloo</p>
        </pre>
        <div className="flex gap-4">
          <HeaderLink text="GitHub" link="https://github.com/kenzoengineer" />
          <HeaderLink text="LinkedIn" link="https://linkedin.com/in/kenjiang" />
          <HeaderLink text="Email" link="mailto:ken.jiang@example.com" />
        </div>
      </div>
    </div>
  );
};

const HeaderLink = ({ text, link }: { text: string; link: string }) => {
  return (
    <a
      href={link}
      target="_blank"
      rel="noopener noreferrer"
      className="text-[#6b9ceb] underline"
    >
      {text}
    </a>
  );
};
