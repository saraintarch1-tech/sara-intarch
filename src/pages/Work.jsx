import { useMemo, useState } from "react";
import { Link } from "react-router-dom";
import SiteShell from "@/components/site/SiteShell";
import Eyebrow from "@/components/site/Eyebrow";
import ProjectCard from "@/components/site/ProjectCard";
import FilterBar from "@/components/site/FilterBar";
import Reveal from "@/components/site/Reveal";
import { useProjects, useSiteContent } from "@/hooks/useSite";
import usePageMeta from "@/hooks/usePageMeta";

const LAYOUT = [
  { className: "md:col-span-7", ratio: "portrait" },
  { className: "md:col-span-4 md:col-start-9 md:mt-28", ratio: "wide" },
  { className: "md:col-span-5 md:col-start-2 md:mt-8", ratio: "portrait" },
  { className: "md:col-span-6 md:col-start-7 md:mt-20", ratio: "wide" },
  { className: "md:col-span-4 md:col-start-2", ratio: "square" },
  { className: "md:col-span-7 md:col-start-6 md:mt-12", ratio: "portrait" },
];

export default function Work() {
  const { content } = useSiteContent();
  const { projects, loading } = useProjects();
  const [active, setActive] = useState("All");

  usePageMeta(
    `Work — ${content.brand_name || "SARA INTARCH"}`,
    content.projects_intro || "Selected interior architecture and design projects."
  );

  const options = useMemo(() => {
    const types = Array.from(new Set(projects.map((p) => p.category).filter(Boolean)));
    return ["All", ...types];
  }, [projects]);

  const counts = useMemo(() => {
    const base = { All: projects.length };
    options.slice(1).forEach((type) => {
      base[type] = projects.filter((p) => p.category === type).length;
    });
    return base;
  }, [options, projects]);

  const filtered = useMemo(
    () => (active === "All" ? projects : projects.filter((p) => p.category === active)),
    [projects, active]
  );

  return (
    <SiteShell content={content}>
      <section className="px-5 pt-32 md:px-10 md:pt-44">
        <div className="mx-auto max-w-[1600px]">
          <Eyebrow>The Archive</Eyebrow>
          <div className="mt-10 grid gap-10 md:grid-cols-12 md:items-end">
            <h1 className="md:col-span-7 font-display text-[clamp(2.6rem,6vw,5rem)] leading-[0.98]">
              {content.projects_title || "Selected Work"}
            </h1>
            <p className="md:col-span-4 md:col-start-9 max-w-sm text-[15px] leading-[1.9] text-ink-soft">
              {content.projects_intro ||
                "A curated record of interiors shaped by light, material and restraint."}
            </p>
          </div>
        </div>
      </section>

      <section className="mt-14 px-5 md:px-10">
        <div className="mx-auto max-w-[1600px]">
          <FilterBar
            options={options}
            value={active}
            onChange={setActive}
            counts={counts}
            total={filtered.length}
          />
        </div>
      </section>

      <section className="px-5 pb-28 pt-14 md:px-10 md:pb-36 md:pt-20">
        <div className="mx-auto max-w-[1600px]">
          {loading ? (
            <div className="grid grid-cols-1 gap-8 md:grid-cols-12">
              <div className="md:col-span-7 aspect-[4/5] animate-pulse bg-sand" />
              <div className="md:col-span-4 md:col-start-9 md:mt-28 aspect-[16/10] animate-pulse bg-sand" />
            </div>
          ) : filtered.length === 0 ? (
            <div className="border-t border-ink/12 py-24 text-center">
              <p className="font-display text-3xl">Nothing published here yet.</p>
              <button
                type="button"
                onClick={() => setActive("All")}
                className="link-line mt-6 inline-block caps text-ink-soft"
              >
                View all projects
              </button>
            </div>
          ) : (
            <div key={active} className="grid grid-cols-1 gap-x-8 gap-y-16 md:grid-cols-12 md:gap-y-4">
              {filtered.map((project, i) => (
                <ProjectCard
                  key={project.id || project.slug}
                  project={project}
                  index={i}
                  ratio={LAYOUT[i % LAYOUT.length].ratio}
                  className={LAYOUT[i % LAYOUT.length].className}
                />
              ))}
            </div>
          )}

          <Reveal>
            <div className="mt-24 flex flex-col items-start justify-between gap-6 border-t border-ink/12 pt-8 md:flex-row md:items-center">
              <p className="max-w-md text-sm leading-relaxed text-ink-soft">
                Every project begins with a conversation about how you want to live.
              </p>
              <Link
                to="/contact"
                className="group inline-flex items-center gap-4 border border-ink/25 px-7 py-3.5 caps text-ink transition-colors duration-500 hover:bg-ink hover:text-ivory"
              >
                Start a project
              </Link>
            </div>
          </Reveal>
        </div>
      </section>
    </SiteShell>
  );
}