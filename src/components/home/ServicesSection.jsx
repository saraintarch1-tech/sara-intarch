import Eyebrow from "@/components/site/Eyebrow";
import Reveal, { Line } from "@/components/site/Reveal";

export default function ServicesSection({ content, services = [] }) {
  if (!services.length) return null;

  return (
    <section
      id="services"
      className="scroll-mt-24 border-t border-ink/12 bg-sand/40 px-5 py-24 md:px-10 md:py-32"
    >
      <div className="mx-auto grid max-w-[1600px] gap-14 md:grid-cols-12 md:gap-10">
        <div className="md:col-span-4">
          <div className="md:sticky md:top-32">
            <Reveal>
              <Eyebrow>{content?.services_eyebrow || "Services"}</Eyebrow>
            </Reveal>
            <Reveal delay={0.08}>
              <h2 className="mt-6 font-display text-[clamp(2rem,3.6vw,3.2rem)] leading-[1.05]">
                {content?.services_title || "What we design"}
              </h2>
            </Reveal>
            <Reveal delay={0.14}>
              <p className="mt-6 max-w-xs text-[14px] leading-[1.9] text-ink-soft">
                {content?.services_intro ||
                  "From the first sketch to the final render, every stage is handled in-house."}
              </p>
            </Reveal>
          </div>
        </div>

        <div className="md:col-span-7 md:col-start-6">
          <div className="border-t border-ink/15">
            {services.map((service, i) => (
              <Reveal key={service.id || service.title} delay={0.04 * i}>
                <article className="group border-b border-ink/15">
                  <div className="grid grid-cols-[auto_1fr] gap-6 py-7 transition-colors duration-500 md:gap-10 md:py-9">
                    <span className="caps pt-2 text-stone">
                      {String(i + 1).padStart(2, "0")}
                    </span>
                    <div>
                      <h3 className="font-display text-[clamp(1.4rem,2.2vw,2rem)] leading-tight transition-transform duration-700 group-hover:translate-x-1">
                        {service.title}
                      </h3>
                      {service.description ? (
                        <p className="mt-3 max-w-lg text-[14px] leading-[1.9] text-ink-soft">
                          {service.description}
                        </p>
                      ) : null}
                    </div>
                  </div>
                </article>
              </Reveal>
            ))}
          </div>
          <Line className="mt-10" />
        </div>
      </div>
    </section>
  );
}