import { CELL_SIZE, useDimensions } from "./DimensionsContext";
import Chess from "./chess/Chess";

interface Role {
  title: string;
  date: string;
}

interface ExperienceProps {
  company: string;
  location: string;
  roles: Role[];
  featured?: boolean;
}

const SENTRY: ExperienceProps = {
  company: "Sentry",
  location: "San Francisco, CA",
  roles: [
    { title: "Software Engineer ll", date: "Aug 2026" },
    { title: "Software Engineer l", date: "Aug 2025" },
    { title: "Software Engineer Intern", date: "Sept 2024" },
  ],
};

const PAST_EXPERIENCES: ExperienceProps[] = [
  { company: "Vontive", location: "San Francisco, CA", roles: [{ title: "Software Engineer Intern", date: "Jan – Apr 2024" }] },
  { company: "Senstar", location: "Waterloo, ON", roles: [{ title: "Software Developer Intern", date: "Jan – Apr 2023" }] },
  { company: "Shoplogix", location: "Oakville, ON", roles: [{ title: "Software Developer Intern", date: "May – Aug 2022" }] },
  { company: "QBuild", location: "Markham, ON", roles: [{ title: "Application Developer Intern", date: "Sept – Dec 2021" }] },
];

const CHESS_ROWS = Math.round(256 / CELL_SIZE);

const Experience = ({ company, location, roles, featured }: ExperienceProps) => {
  return (
    <div className={`bg-[#101010] text-white flex flex-col p-5 md:p-10 ${featured ? "md:flex-row min-h-64" : ""}`}>
      <div>
        <h3 className={`font-bbh-hegarty uppercase ${featured ? "text-5xl sm:text-7xl" : "text-xl"}`}>{company}</h3>
        <p className={featured ? "text-xl" : "text-xs text-neutral-500"}>{location}</p>
        <div className={`w-full my-2 ${featured ? "h-1 bg-red-500" : "h-0.5 bg-neutral-700"}`} />
      </div>
      {featured ? (
        <Timeline roles={roles} />
      ) : (
        roles.map((role) => (
          <div key={role.date} className="flex flex-col flex-1">
            <p className="text-sm text-neutral-400">{role.title}</p>
            <p className="text-xs uppercase tracking-widest text-neutral-500 mt-auto pt-1">{role.date}</p>
          </div>
        ))
      )}
    </div>
  );
};

const Timeline = ({ roles }: { roles: Role[] }) => {
  return (
    <ol className="w-full mt-8 md:w-1/2 md:mt-0 md:ml-auto md:mr-6 self-center flex flex-row-reverse">
      {roles.map((role, i) => (
        <li key={role.date} className="flex-1 flex flex-col items-center text-center">
          <p className="text-xs uppercase tracking-widest text-neutral-500">{role.date}</p>
          <div className="relative w-full h-2.5 my-3">
            {i < roles.length - 1 && (
              <div className="absolute left-0 right-1/2 top-1/2 h-px bg-neutral-700" />
            )}
            {i > 0 && <div className="absolute left-1/2 right-0 top-1/2 h-px bg-neutral-700" />}
            <div
              className={`absolute left-1/2 top-0 -translate-x-1/2 w-2.5 h-2.5 ${
                i === 0 ? "bg-red-500" : "bg-neutral-500"
              }`}
            />
          </div>
          <p className={`text-sm ${i === 0 ? "text-white" : "text-neutral-400"}`}>{role.title}</p>
        </li>
      ))}
    </ol>
  );
};

const Career = () => {
  const { windowWidth } = useDimensions();
  // matches the p-5 md:p-10 padding on the wrapper below
  const padding = windowWidth >= 768 ? 40 : 20;
  const chessCols = Math.round((windowWidth - 2 * padding) / CELL_SIZE);
  return (
    <div className="bg-[#1f1f1f]">
      <div className="flex flex-col gap-2 p-5 md:p-10">
        <Experience {...SENTRY} featured />
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2">
          {PAST_EXPERIENCES.map((exp) => (
            <Experience key={exp.company} {...exp} />
          ))}
        </div>
        <div
          className="bg-[#101010] self-center"
          style={{ width: chessCols * CELL_SIZE, height: CHESS_ROWS * CELL_SIZE }}
        >
          <Chess width={chessCols} height={CHESS_ROWS} />
        </div>
      </div>
    </div>
  );
};
export default Career;
