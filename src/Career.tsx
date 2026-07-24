import Chess from "./chess/Chess";

const Career = () => {
  return (
    <div className="w-screen flex relative">
      <Chess />
      <div
        className="bg-[#1e262e] bg-opacity-85 text-white absolute
        left-1/2 translate-x-[-50%] top-1/2
        translate-y-[-50%] flex flex-col px-10 py-5 w-max"
      >
        <Experience svg="svgs/sentry.svg" company="Sentry" position="Software Engineer" location="SF" time="Aug '25 - Present" current />
        <Experience svg="svgs/sentry.svg" company="Sentry" position="Software Engineer (Intern)" location="SF" time="Sep '24 - Dec '24" />
        <Experience svg="svgs/vontive.svg" company="Vontive" position="Software Engineer (Intern)" location="SF" time="Jan '24 - Apr '24" />
      </div>
  </div>
); };


interface ExperienceProps {
  company: string,
  position: string,
  location: string,
  time: string,
  svg?: string,
  current?: boolean,
}
const Experience = ({ company, position, location, time, svg, current }: ExperienceProps) => {
  return (<div className="flex-col mb-4">
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
    <p className={`text-xs ${current ? "opacity-80" : "opacity-40"}`}>{location} · ({time})</p>
  </div>);
}

export default Career
