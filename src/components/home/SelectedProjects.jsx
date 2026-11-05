import { Link } from "react-router-dom";
import ProjectCard from "@/components/site/ProjectCard";
import Reveal from "@/components/site/Reveal";
import Eyebrow from "@/components/site/Eyebrow";

const LAYOUT = [
  { className: "md:col-span-7", ratio: "portrait" },
  { className: "md:col-span-4 md:col-start-9 md:mt-28", ratio: "wide" },
  { className: "md:col-span-5 md:col-start-2 md:mt-8", ratio: "portrait" },
  { className: "md:col-span-6 md:col-start-7 md:mt-16", ratio: "wide" },
];

export default function SelectedProjects({ content, projects = [] }) {
  const shown = projects.slice(0, 4);

  return (
    <section
      id="projects"
      className="scroll-mt-24 px-5 pb-24 pt-24 md:px-10 md:pb-32 md:pt-32"
    >
      <div className="mx-auto max-w-[1600px]">
        <div className="grid gap-8 md:grid-cols-12 md:items-end">
          <div className="md:col-span-7">
            <Reveal>
              <Eyebrow>{content?.projects_eyebrow || "Selected Projects"}</Eyebrow>
            </Reveal>
            <Reveal delay={0.08}>
              <h2 className="mt-7 max-w-[18ch] font-display text-[clamp(2.1rem,4.6vw,4rem)] leading-[1.02]">
                {content?.projects_title || "A curated record of interiors"}
              </h2>
            </Reveal>
          </div>
          <div className="md:col-span-4 md:col-start-9">
            <Reveal delay={0.16}>
              <p className="text-[15px] leading-[1.9] text-ink-soft">
                {content?.projects_intro ||
                  "Residential, hospitality and commercial interiors — each one resolved through light, material and proportion."}
              </p>
              <Link
                to="/work"
                className="mt-6 inline-flex items-center gap-3 border-b border-ink/25 pb-1 caps text-ink hover:border-ink"
              >
                All projects
              </Link>
            </Reveal>
          </div>
        </div>

        {shown.length > 0 ? (
          <div className="mt-16 grid grid-cols-1 gap-x-8 gap-y-14 md:mt-20 md:grid-cols-12 md:gap-y-6">
            {shown.map((project, i) => (
              <ProjectCard
                key={project.id || project.slug}
                project={project}
                index={i}
                ratio={LAYOUT[i % LAYOUT.length].ratio}
                className={LAYOUT[i % LAYOUT.length].className}
              />
            ))}
          </div>
        ) : (
          <Reveal delay={0.1}>
            <div className="mt-16 border-t border-ink/12 py-20 text-center">
              <p className="font-display text-3xl text-ink">New work is being photographed.</p>
              <Link to="/contact" className="link-line mt-6 inline-block caps text-ink-soft">
                Enquire about a project
              </Link>
            </div>
          </Reveal>
        )}
      </div>
    </section>
  );
}