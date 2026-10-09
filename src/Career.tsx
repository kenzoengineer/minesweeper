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

// splits `cols` tiles into `count` grid columns separated by one-tile gaps, wider columns first
const tileColumns = (cols: number, count: number) => {
  const tiles = cols - (count - 1);
  return Array.from(
    { length: count },
    (_, i) => `${(Math.floor(tiles / count) + (i < tiles % count ? 1 : 0)) * CELL_SIZE}px`,
  ).join(" ");
};

// same palette as the skill markers
const ACCENT_COLORS = ["bg-red-500", "bg-green-500", "bg-blue-500", "bg-yellow-400"];

const Experience = ({ company, location, roles, featured }: ExperienceProps) => {
  return (
    <div
      className={`bg-[#101010] text-white p-5 md:p-10 ${
        featured ? "grid lg:grid-cols-[1fr_auto] lg:grid-rows-[auto_1fr] min-h-64" : "flex flex-col"
      }`}
    >
      <div className={featured ? "" : "mb-4"}>
        <h3 className={`font-bbh-hegarty uppercase ${featured ? "text-5xl sm:text-7xl" : "text-xl"}`}>{company}</h3>
        <p className={featured ? "text-xl" : "text-xs text-neutral-500"}>{location}</p>
      </div>
      {featured ? (
        <>
          <Timeline roles={roles} />

        </>
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
    <ol className="flex flex-row-reverse md:justify-end gap-5 md:gap-10 mt-8 lg:mt-0 lg:col-start-2 lg:row-start-1 lg:row-span-2 self-end">
      {roles.map((role, i) => (
        <li key={role.date} className="flex-1 md:flex-none md:w-[120px] flex flex-col">
          <p className={`text-sm ${i === 0 ? "text-white" : "text-neutral-400"}`}>{role.title}</p>
          <p className="text-xs uppercase tracking-widest text-neutral-500 mt-auto pt-1">{role.date}</p>
          <div className="w-10 h-10 mt-4 flex items-center justify-center bg-neutral-700">
            {i === 0 && <div className="w-1/3 h-1/3 rotate-45 bg-[#ff4040]" />}
          </div>
        </li>
      ))}
    </ol>
  );
};

const Career = () => {
  const { windowWidth, contentCols: cols } = useDimensions();
  const perRow = windowWidth >= 1024 ? 4 : windowWidth >= 640 ? 2 : 1;
  return (
    <div className="flex flex-col gap-10 py-5 md:py-10">
      <Experience {...SENTRY} featured />
      <div className="grid gap-10" style={{ gridTemplateColumns: tileColumns(cols, perRow) }}>
        {PAST_EXPERIENCES.map((exp) => (
          <Experience key={exp.company} {...exp} />
        ))}
      </div>
      <div className="bg-[#101010]" style={{ height: CHESS_ROWS * CELL_SIZE }}>
        <Chess width={cols} height={CHESS_ROWS} />
      </div>
    </div>
  );
};
export default Career;
