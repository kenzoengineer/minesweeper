import { FaEnvelope, FaLinkedin, FaSquareGithub } from "react-icons/fa6";
import { Minesweeper } from "./minesweeper/Minesweeper";

const LINKS = [
  { label: "LinkedIn", href: "https://www.linkedin.com/in/ken-jiang/", icon: FaLinkedin },
  { label: "GitHub", href: "https://github.com/kenzoengineer", icon: FaSquareGithub },
  { label: "Email", href: "mailto:kenzoengineer@gmail.com", icon: FaEnvelope },
];

const Header = () => {
  return (
    <div className="w-screen flex flex-col bg-[#1f1f1f]">
      <Minesweeper />
      <div
        className=" text-white absolute
        left-0 bottom-0 flex flex-col px-5 py-5 md:px-10"
      >
        <h1 className="font-bbh-hegarty text-7xl sm:text-9xl">KEN <br/> JIANG</h1>
        <h2 className="flex items-center gap-1.5">
          SWE @ Sentry · UWaterloo Alum
          {LINKS.map(({ label, href, icon: Icon }) => (
            <span key={label} className="flex items-center gap-1.5">
              ·
              <a
                href={href}
                aria-label={label}
                target={href.startsWith("mailto:") ? undefined : "_blank"}
                rel="noreferrer"
                className="hover:text-red-500 transition-colors"
              >
                <Icon />
              </a>
            </span>
          ))}
        </h2>
        <a
          href={`${import.meta.env.BASE_URL}ken-jiang-resume.pdf`}
          target="_blank"
          rel="noreferrer"
          className="w-fit underline underline-offset-4 hover:text-red-500 transition-colors"
        >
          Resume
        </a>
      </div>
    </div>
  );
};

export default Header;
