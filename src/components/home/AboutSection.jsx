import { Link } from "react-router-dom";
import Eyebrow from "@/components/site/Eyebrow";
import Reveal, { ImageReveal } from "@/components/site/Reveal";

const paragraphs = (text) =>
  String(text || "")
    .split(/\n{2,}/)
    .map((part) => part.trim())
    .filter(Boolean);

export default function AboutSection({ content }) {
  const body = paragraphs(content?.about_body);
  const stats = (content?.about_stats || []).filter((stat) => stat?.value || stat?.label);

  return (
    <section id="about" className="scroll-mt-24 px-5 py-24 md:px-10 md:py-32">
      <div className="mx-auto grid max-w-[1600px] gap-12 md:grid-cols-12 md:gap-16">
        <div className="md:col-span-5">
          <ImageReveal
            src={content?.about_image}
            alt={content?.brand_name || "SARA INTARCH studio"}
            className="aspect-[4/5] w-full"
          />
          <div className="mt-5 flex items-center justify-between">
            <span className="caps text-stone">{content?.brand_tagline}</span>
            <span className="caps text-stone">
              {[content?.city, content?.country].filter(Boolean).join(" · ")}
            </span>
          </div>
        </div>

        <div className="md:col-span-6 md:col-start-7 md:pt-10">
          <Reveal>
            <Eyebrow>{content?.about_eyebrow || "The Studio"}</Eyebrow>
          </Reveal>
          <Reveal delay={0.08}>
            <h2 className="mt-7 max-w-[20ch] font-display text-[clamp(2.1rem,4.4vw,3.8rem)] leading-[1.03]">
              {content?.about_title || "Quiet, considered, built to last"}
            </h2>
          </Reveal>
          <div className="mt-8 max-w-xl space-y-6 text-[15px] leading-[1.95] text-ink-soft">
            {body.length ? (
              body.map((text, i) => (
                <Reveal key={i} delay={0.06 * i}>
                  <p>{text}</p>
                </Reveal>
              ))
            ) : (
              <p>
                The studio works between architecture and atmosphere — shaping interiors that feel
                calm the moment you enter them.
              </p>
            )}
          </div>

          {stats.length ? (
            <Reveal delay={0.1}>
              <dl className="mt-10 grid grid-cols-2 gap-6 border-t border-ink/15 pt-6 sm:grid-cols-3">
                {stats.map((stat, i) => (
                  <div key={i}>
                    <dt className="font-display text-[2rem] leading-none">{stat.value}</dt>
                    <dd className="mt-2 caps text-stone">{stat.label}</dd>
                  </div>
                ))}
              </dl>
            </Reveal>
          ) : null}

          {content?.about_quote ? (
            <Reveal delay={0.12}>
              <blockquote className="mt-10 border-l border-ink/20 pl-6 font-serif text-[1.35rem] italic leading-[1.6] text-ink">
                “{content.about_quote}”
              </blockquote>
            </Reveal>
          ) : null}

          <Reveal delay={0.18}>
            <div className="mt-10 flex items-center justify-between border-t border-ink/15 pt-5">
              <span className="font-serif text-xl italic text-ink">
                {content?.about_signature || content?.brand_name}
              </span>
              <Link to="/contact" className="link-line caps text-ink-soft hover:text-ink">
                Work with us
              </Link>
            </div>
          </Reveal>
        </div>
      </div>
    </section>
  );
}