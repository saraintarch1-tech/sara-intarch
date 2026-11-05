import { Link } from "react-router-dom";
import { ArrowUpRight } from "lucide-react";
import { Image } from "@/components/ui/image";
import Reveal from "./Reveal";

const RATIOS = {
  portrait: "aspect-[4/5]",
  tall: "aspect-[3/4]",
  wide: "aspect-[16/10]",
  square: "aspect-square",
  landscape: "aspect-[3/2]",
};

export default function ProjectCard({
  project,
  index = 0,
  ratio = "portrait",
  className = "",
  showIndex = true,
}) {
  if (!project) return null;
  const meta = [project.category, project.location, project.year].filter(Boolean);
  const source = project.cover_image || project.hero_image;

  return (
    <Reveal className={className} delay={0.05}>
      <Link to={`/work/${project.slug}`} className="group block">
        <div className={`relative overflow-hidden bg-sand ${RATIOS[ratio] || RATIOS.portrait}`}>
          {source ? (
            <Image
              src={source}
              alt={`${project.title}${project.location ? `, ${project.location}` : ""}`}
              loading="lazy"
              className="h-full w-full object-cover transition-transform [transition-duration:1600ms] [transition-timing-function:cubic-bezier(0.16,1,0.3,1)] group-hover:scale-[1.05]"
            />
          ) : (
            <div className="flex h-full w-full items-center justify-center caps text-stone">
              Image coming soon
            </div>
          )}
          <div className="absolute inset-0 bg-gradient-to-t from-ink/70 via-ink/0 to-ink/0 opacity-0 transition-opacity duration-700 group-hover:opacity-100" />
          <div className="absolute inset-x-0 bottom-0 flex translate-y-3 items-center justify-between px-5 pb-5 opacity-0 transition-all duration-700 group-hover:translate-y-0 group-hover:opacity-100">
            <span className="caps text-ivory">View project</span>
            <ArrowUpRight size={16} strokeWidth={1.2} className="text-ivory" />
          </div>
        </div>

        <div className="mt-5 flex items-start justify-between gap-6 border-t border-ink/12 pt-4">
          <div>
            <h3 className="font-display text-[1.45rem] leading-tight text-ink">{project.title}</h3>
            <p className="mt-1.5 text-[12px] tracking-[0.02em] text-ink-soft">{meta.join(" · ")}</p>
          </div>
          {showIndex ? (
            <span className="caps shrink-0 pt-2 text-stone">{String(index + 1).padStart(2, "0")}</span>
          ) : null}
        </div>
      </Link>
    </Reveal>
  );
}