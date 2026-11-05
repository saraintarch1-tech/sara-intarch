import { Fragment } from "react";
import SiteShell from "@/components/site/SiteShell";
import Hero from "@/components/home/Hero";
import SelectedProjects from "@/components/home/SelectedProjects";
import ServicesSection from "@/components/home/ServicesSection";
import AboutSection from "@/components/home/AboutSection";
import ContactSection from "@/components/home/ContactSection";
import { useProjects, useServices, useSiteContent } from "@/hooks/useSite";
import { DEFAULT_SECTIONS } from "@/lib/theme";
import usePageMeta from "@/hooks/usePageMeta";

export default function Home() {
  const { content, loading } = useSiteContent();
  const { projects } = useProjects();
  const { services } = useServices();

  usePageMeta(content.seo_title, content.seo_description, content.og_image || content.hero_image);

  const sections = [...(content.sections?.length ? content.sections : DEFAULT_SECTIONS)]
    .filter((section) => section.visible !== false)
    .sort((a, b) => (a.order || 0) - (b.order || 0));

  const ordered = projects.filter((project) => project.featured);
  const display = ordered.length ? ordered : projects;

  const blocks = {
    hero: <Hero content={content} />,
    projects: <SelectedProjects content={content} projects={display} />,
    services: <ServicesSection content={content} services={services} />,
    about: <AboutSection content={content} />,
    contact: <ContactSection content={content} services={services} />,
  };

  return (
    <SiteShell content={content} tone="light">
      {loading ? (
        <div className="flex h-[100svh] items-center justify-center bg-background">
          <span className="caps text-stone">SARA INTARCH</span>
        </div>
      ) : (
        sections.map((section) => (
          <Fragment key={section.key}>{blocks[section.key] || null}</Fragment>
        ))
      )}
    </SiteShell>
  );
}