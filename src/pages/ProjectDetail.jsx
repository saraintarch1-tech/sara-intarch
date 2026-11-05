import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { ArrowLeft, ArrowUpRight, Play } from "lucide-react";
import { Image } from "@/components/ui/image";
import SiteShell from "@/components/site/SiteShell";
import Eyebrow from "@/components/site/Eyebrow";
import Reveal, { ImageReveal } from "@/components/site/Reveal";
import ProjectCard from "@/components/site/ProjectCard";
import Lightbox from "@/components/site/Lightbox";
import { useProjects, useSiteContent } from "@/hooks/useSite";
import usePageMeta from "@/hooks/usePageMeta";

const paragraphs = (text) =>
  String(text || "")
    .split(/\n{2,}/)
    .map((part) => part.trim())
    .filter(Boolean);

const videoSource = (url = "") => {
  const youtube = url.match(/(?:youtube\.com\/(?:watch\?v=|embed\/)|youtu\.be\/)([\w-]{6,})/);
  if (youtube) return { type: "iframe", src: `https://www.youtube.com/embed/${youtube[1]}` };
  const vimeo = url.match(/vimeo\.com\/(\d+)/);
  if (vimeo) return { type: "iframe", src: `https://player.vimeo.com/video/${vimeo[1]}` };
  return { type: "video", src: url };
};

export default function ProjectDetail() {
  const { slug } = useParams();
  const { content } = useSiteContent();
  const { projects, loading } = useProjects();
  const [viewer, setViewer] = useState(null);

  const project = projects.find((item) => item.slug === slug);

  usePageMeta(
    project ? `${project.title} — ${content.brand_name || "SARA INTARCH"}` : "Project",
    project?.summary || project?.tagline,
    project?.cover_image
  );

  useEffect(() => {
    if (loading || project) return;
    const meta = document.createElement("meta");
    meta.setAttribute("name", "prerender-status-code");
    meta.setAttribute("content", "404");
    document.head.appendChild(meta);
    return () => document.head.removeChild(meta);
  }, [loading, project]);

  if (loading) {
    return (
      <div className="flex h-[100svh] items-center justify-center bg-background">
        <div className="h-8 w-8 animate-spin rounded-full border border-ink/15 border-t-ink" />
      </div>
    );
  }

  if (!project) {
    return (
      <SiteShell content={content}>
        <section className="px-5 pb-32 pt-40 md:px-10 md:pt-52">
          <div className="mx-auto max-w-[900px]">
            <Eyebrow>Not found</Eyebrow>
            <h1 className="mt-8 font-display text-[clamp(2.2rem,5vw,4rem)] leading-[1.05]">
              This project is no longer in the archive.
            </h1>
            <Link to="/work" className="link-line mt-10 inline-block caps text-ink-soft">
              Back to all work
            </Link>
          </div>
        </section>
      </SiteShell>
    );
  }

  const gallery = (project.gallery || []).filter(Boolean);
  const videos = (project.videos || []).filter((video) => video?.url);
  const meta = [
    { label: "Type", value: project.category },
    { label: "Location", value: project.location },
    { label: "Year", value: project.year },
    { label: "Area", value: project.area },
  ].filter((item) => item.value);

  const specs = (project.specifications || []).filter((spec) => spec.label && spec.value);
  const related = projects.filter((item) => item.slug !== project.slug).slice(0, 3);
  const lightboxItems = gallery.map((src, i) => ({
    src,
    caption: `${project.title} — ${String(i + 1).padStart(2, "0")}`,
  }));

  return (
    <SiteShell content={content} tone="light">
      <section className="relative h-[86svh] min-h-[520px] w-full overflow-hidden bg-ink">
        <Image
          src={project.hero_image || project.cover_image}
          alt={`${project.title}${project.location ? `, ${project.location}` : ""}`}
          className="h-full w-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-ink/85 via-ink/20 to-ink/45" />
        <div className="absolute inset-x-0 bottom-0 px-5 pb-12 md:px-10 md:pb-16">
          <div className="mx-auto max-w-[1600px]">
            <Eyebrow tone="ivory">{project.category || "Project"}</Eyebrow>
            <h1 className="mt-6 max-w-[20ch] font-display text-[clamp(2.3rem,5.6vw,4.8rem)] leading-[0.98] text-ivory">
              {project.title}
            </h1>
            <div className="mt-6 flex flex-wrap items-center gap-x-8 gap-y-2 caps text-ivory/60">
              <span>{project.location}</span>
              <span>{project.year}</span>
              {project.area ? <span>{project.area}</span> : null}
            </div>
          </div>
        </div>
      </section>

      <section className="border-b border-ink/12">
        <div className="mx-auto grid max-w-[1600px] grid-cols-2 gap-y-6 px-5 py-8 md:grid-cols-4 md:px-10">
          {meta.map((item) => (
            <div key={item.label}>
              <div className="caps text-stone">{item.label}</div>
              <div className="mt-2 font-display text-lg leading-tight md:text-xl">{item.value}</div>
            </div>
          ))}
        </div>
      </section>

      <section className="px-5 py-20 md:px-10 md:py-28">
        <div className="mx-auto grid max-w-[1600px] gap-12 md:grid-cols-12 md:gap-16">
          <div className="md:col-span-7">
            <Eyebrow index="01">Concept &amp; Design</Eyebrow>
            <Reveal>
              <p className="mt-8 font-serif text-[clamp(1.5rem,2.5vw,2.2rem)] leading-[1.45] text-ink">
                {project.tagline || project.summary}
              </p>
            </Reveal>
            <div className="mt-10 max-w-xl space-y-6 text-[15px] leading-[1.95] text-ink-soft">
              {paragraphs(project.concept).map((text, i) => (
                <Reveal key={i} delay={0.05 * i}>
                  <p>{text}</p>
                </Reveal>
              ))}
            </div>
          </div>

          <aside className="md:col-span-4 md:col-start-9">
            {specs.length > 0 || project.client ? (
              <div className="border-t border-ink/15 pt-6">
                <div className="caps text-stone">Details</div>
                <dl className="mt-5 space-y-4">
                  {project.client ? (
                    <div className="flex justify-between gap-6 border-b border-ink/10 pb-3">
                      <dt className="text-sm text-stone">Client</dt>
                      <dd className="max-w-[60%] text-right text-sm">{project.client}</dd>
                    </div>
                  ) : null}
                  {specs.map((spec, i) => (
                    <div
                      key={`${spec.label}-${i}`}
                      className="flex justify-between gap-6 border-b border-ink/10 pb-3"
                    >
                      <dt className="text-sm text-stone">{spec.label}</dt>
                      <dd className="max-w-[60%] text-right text-sm">{spec.value}</dd>
                    </div>
                  ))}
                </dl>
              </div>
            ) : null}
            {project.status ? (
              <div className="mt-8">
                <div className="caps text-stone">Status</div>
                <p className="mt-2 text-sm">{project.status}</p>
              </div>
            ) : null}
          </aside>
        </div>
      </section>

      {gallery.length > 0 && (
        <section className="px-5 pb-20 md:px-10 md:pb-28">
          <div className="mx-auto max-w-[1600px]">
            <div className="flex items-end justify-between border-t border-ink/12 pt-6">
              <Eyebrow index="02">Renders &amp; Photography</Eyebrow>
              <span className="caps text-stone">{gallery.length} images</span>
            </div>
            <div className="mt-10 grid grid-cols-1 gap-x-8 gap-y-10 md:grid-cols-12">
              {gallery.map((src, i) => {
                const wide = i % 4 === 0;
                return (
                  <button
                    key={`${src}-${i}`}
                    type="button"
                    onClick={() => setViewer({ items: lightboxItems, index: i })}
                    className={`group text-left ${wide ? "md:col-span-12" : "md:col-span-6"}`}
                    aria-label={`Open image ${i + 1} full screen`}
                  >
                    <ImageReveal
                      src={src}
                      alt={`${project.title} — view ${i + 1}`}
                      className={wide ? "aspect-[16/9]" : "aspect-[4/5]"}
                      imgClassName="transition-transform [transition-duration:1800ms] ease-out group-hover:scale-[1.03]"
                    />
                  </button>
                );
              })}
            </div>
          </div>
        </section>
      )}

      {videos.length > 0 && (
        <section className="border-t border-ink/12 px-5 py-20 md:px-10 md:py-28">
          <div className="mx-auto max-w-[1600px]">
            <Eyebrow index="03">Film</Eyebrow>
            <div className="mt-10 grid gap-10 md:grid-cols-2">
              {videos.map((video, i) => {
                const source = videoSource(video.url);
                return (
                  <div key={`${video.url}-${i}`}>
                    <div className="relative aspect-video w-full overflow-hidden bg-ink">
                      {source.type === "iframe" ? (
                        <iframe
                          src={source.src}
                          title={video.title || `${project.title} film`}
                          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                          allowFullScreen
                          className="h-full w-full"
                        />
                      ) : (
                        <video
                          src={source.src}
                          poster={video.poster}
                          controls
                          playsInline
                          className="h-full w-full object-cover"
                        />
                      )}
                    </div>
                    {video.title ? (
                      <div className="mt-4 flex items-center justify-between border-t border-ink/12 pt-3">
                        <span className="font-display text-lg">{video.title}</span>
                        <Play size={12} className="text-stone" />
                      </div>
                    ) : null}
                  </div>
                );
              })}
            </div>
          </div>
        </section>
      )}

      {related.length > 0 && (
        <section className="border-t border-ink/12 px-5 py-20 md:px-10 md:py-28">
          <div className="mx-auto max-w-[1600px]">
            <div className="flex items-end justify-between">
              <Eyebrow>Related projects</Eyebrow>
              <Link to="/work" className="link-line caps text-stone hover:text-ink">
                All work
              </Link>
            </div>
            <div className="mt-12 grid grid-cols-1 gap-10 md:grid-cols-3">
              {related.map((item, i) => (
                <ProjectCard
                  key={item.id || item.slug}
                  project={item}
                  index={i}
                  ratio="portrait"
                  showIndex={false}
                />
              ))}
            </div>
          </div>
        </section>
      )}

      <section className="border-t border-ink/12 px-5 py-10 md:px-10">
        <div className="mx-auto flex max-w-[1600px] items-center justify-between gap-6">
          <Link to="/work" className="group inline-flex items-center gap-3 caps text-ink-soft hover:text-ink">
            <ArrowLeft size={13} className="transition-transform duration-500 group-hover:-translate-x-1" />
            All projects
          </Link>
          <Link to="/contact" className="group inline-flex items-center gap-3 caps text-ink">
            Enquire about a project
            <ArrowUpRight
              size={13}
              className="transition-transform duration-500 group-hover:-translate-y-0.5 group-hover:translate-x-0.5"
            />
          </Link>
        </div>
      </section>

      <Lightbox
        items={viewer?.items || []}
        index={viewer ? viewer.index : null}
        onClose={() => setViewer(null)}
        onNavigate={(next) => setViewer((prev) => (prev ? { ...prev, index: next } : prev))}
      />
    </SiteShell>
  );
}