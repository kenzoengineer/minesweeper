import { useState } from "react";
import Chess from "./chess/Chess";

const Career = () => {
  const [open, setOpen] = useState(false);
  return (
    <div className="w-screen flex relative">
      <Chess />
      <div
        className={`bg-[#1e262e] bg-opacity-85 text-white absolute
        left-1/2 translate-x-[-50%] top-1/2 transition-all
        translate-y-[-50%] flex flex-col items-center px-10 py-5 w-max ${open ? "min-h-96" : "min-h-64"}`}
      >
        <div className="flex max-lg:flex-col">
          <div className="flex flex-col items-center">
            <Experience
              svg="svgs/sentry.svg"
              company="Sentry"
              position="Software Engineer"
              location="San Francisco"
              time="Aug '25 - Present"
              current
            />
            <Experience
              svg="svgs/sentry.svg"
              company="Sentry"
              position="Software Engineer (Intern)"
              location="San Francisco"
              time="Sep '24 - Dec '24"
            />
            <Experience
              svg="svgs/vontive.svg"
              company="Vontive"
              position="Software Engineer (Intern)"
              location="San Francisco"
              time="Jan '24 - Apr '24"
            />
            <div
              className={`overflow-hidden transition-all duration-500 ${open ? "max-h-96 opacity-100" : "max-h-0 opacity-0"}`}
            >
              <Experience
                svg="svgs/senstar.svg"
                company="Senstar"
                position="Software Developer (Intern)"
                location="Waterloo"
                time="Jan '23 - Apr '23"
              />
              <Experience
                svg="svgs/shoplogix.svg"
                company="Shoplogix"
                position="Software Developer (Intern)"
                location="Oakville"
                time="May '22 - Aug '22"
              />
              <Experience
                svg="svgs/qbuild.svg"
                company="QBuild"
                position="Application Developer (Intern)"
                location="Markham"
                time="Sep '21 - Dec '21"
              />
            </div>
          </div>
          <div className="lg:w-1 max-lg:h-1 bg-white lg:mx-8 max-lg:my-8" />
          <div className="flex flex-col max-lg:max-w-[60vw] justify-center">
            <Section
              title="Full Stack"
              contents={[
                "Javascript/Typescript",
                "Python",
                "React",
                "C#",
                "PostgreSQL",
              ]}
            />
            <Section
              title="Systems"
              contents={[
                "Rust",
                "Java",
                "C",
                "Terraform",
                "Docker",
                "Kubernetes",
                "GCP",
              ]}
            />
            <Section
              title="For Fun"
              contents={[
                "Photoshop",
                "Premiere Pro",
                "After Effects",
                "Blender",
                "FFXIV",
              ]}
            />
          </div>
        </div>
        <button
          className="w-fit opacity-80"
          onClick={() => {
            setOpen(!open);
          }}
        >
          {open ? "Less ⇑" : "More ⇓"}
        </button>
      </div>
    </div>
  );
};

interface ExperienceProps {
  company: string;
  position: string;
  location: string;
  time: string;
  svg?: string;
  current?: boolean;
}
const Experience = ({
  company,
  position,
  location,
  time,
  svg,
  current,
}: ExperienceProps) => {
  return (
    <div className="flex-col mb-4">
      <div className="flex items-center gap-2">
        {svg && (
          <img
            src={`${import.meta.env.BASE_URL}${svg}`}
            alt={`${company} logo`}
            className="h-6 w-6 object-contain"
          />
        )}
        <h1 className="text-xl">{company}</h1>
      </div>
      <p className="text-sm">{position}</p>
      <p className={`text-xs ${current ? "opacity-80" : "opacity-40"}`}>
        {location} · ({time})
      </p>
    </div>
  );
};

interface SectionProps {
  title: string;
  contents: string[];
}

const Section = ({ title, contents }: SectionProps) => {
  return (
    <div className="mb-4">
      <h1 className="text-xl">{title}</h1>
      <p className="text-sm opacity-80">{contents.join(" · ")}</p>
    </div>
  );
};

export default Career;
