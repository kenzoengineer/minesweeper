import Tetris from "./tetris/Tetris";

interface SkillProps {
  title: string;
  skills: string[];
  color: string;
}

const SKILLS: SkillProps[] = [
  { title: "Full Stack", skills: ["TypeScript, Python, C#", "React, Vue, .NET"], color: "bg-red-500" },
  { title: "Data", skills: ["PostgreSQL", "SQL Server"], color: "bg-green-500" },
  { title: "Infra", skills: ["Java, Rust", "Terraform, GoCD, CircleCI", "Docker, AWS, GCP"], color: "bg-blue-500" },
  { title: "Embedded", skills: ["C, C++", "Unix, Zephyr RTOS", "Nordic, STM32, Arduino"], color: "bg-yellow-400" },
];

const Skill = ({ title, skills, color }: SkillProps) => {
  return (
    <div className="bg-[#101010] text-white flex flex-col flex-1 p-5">
      <div className="flex items-center justify-between">
        <h3 className="font-bbh-hegarty uppercase text-xl">{title}</h3>
        <div className={`w-5 h-5 shrink-0 ${color}`} />
      </div>
      <div className="w-full my-2 h-0.5 bg-neutral-700" />
      {skills.map((skill) => (
        <p key={skill} className="text-sm text-neutral-400">
          {skill}
        </p>
      ))}
    </div>
  );
};

const Skills = () => {
  return (
    <div className="flex flex-col lg:flex-row gap-10 pb-5 md:pb-10">
      <div className="flex flex-col flex-1 gap-10">
        {SKILLS.map((skill) => (
          <Skill key={skill.title} {...skill} />
        ))}
      </div>
      <div className="bg-[#101010] shrink-0">
        <Tetris />
      </div>
    </div>
  );
};

export default Skills;
