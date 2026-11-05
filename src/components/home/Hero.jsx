import { useRef } from "react";
import { Link } from "react-router-dom";
import { motion, useScroll, useTransform } from "framer-motion";
import { ArrowDown } from "lucide-react";
import { Image } from "@/components/ui/image";
import { Monogram } from "@/components/brand/Logo";

const EASE = [0.16, 1, 0.3, 1];

const fadeUp = {
  hidden: { opacity: 0, y: 28 },
  show: (i) => ({
    opacity: 1,
    y: 0,
    transition: { duration: 1.2, delay: 0.18 * i, ease: EASE },
  }),
};

export default function Hero({ content }) {
  const ref = useRef(null);
  const { scrollY } = useScroll();
  const y = useTransform(scrollY, [0, 900], [0, 150]);
  const scale = useTransform(scrollY, [0, 900], [1.02, 1.14]);
  const textFade = useTransform(scrollY, [0, 600], [1, 0.15]);

  const place = [content?.city, content?.country].filter(Boolean).join(", ");

  const title = content?.hero_title || "Designs that bring spaces to life, that tell stories.";
  const commaAt = title.indexOf(", ");
  const titleLines =
    commaAt > -1 ? [title.slice(0, commaAt + 1), title.slice(commaAt + 2)] : [title];

  return (
    <section ref={ref} id="hero" className="relative h-[100svh] min-h-[560px] overflow-hidden bg-ink">
      <motion.div style={{ y, scale }} className="absolute inset-0">
        {content?.hero_video ? (
          <video
            src={content.hero_video}
            poster={content?.hero_image}
            autoPlay
            muted
            loop
            playsInline
            className="h-full w-full object-cover"
          />
        ) : content?.hero_image ? (
          <Image
            src={content.hero_image}
            alt={content?.brand_name || "Interior architecture"}
            className="h-full w-full object-cover"
          />
        ) : (
          <div className="h-full w-full bg-mocha" />
        )}
      </motion.div>

      <div className="absolute inset-0 bg-gradient-to-b from-ink/55 via-ink/30 to-ink/70" />
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,transparent_25%,rgba(30,24,20,0.45)_100%)]" />

      <motion.div
        style={{ opacity: textFade }}
        className="relative z-10 flex h-full flex-col items-center justify-center px-5 text-center text-ivory"
      >
        <motion.div variants={fadeUp} custom={0} initial="hidden" animate="show">
          <Monogram className="h-12 w-12 text-ivory/90 md:h-16 md:w-16" />
        </motion.div>

        <motion.h2
          variants={fadeUp}
          custom={1}
          initial="hidden"
          animate="show"
          className="mt-6 font-display text-[1.15rem] leading-none md:text-[1.6rem]"
          style={{ letterSpacing: "0.42em", marginRight: "-0.42em" }}
        >
          {content?.brand_name || "SARA INTARCH"}
        </motion.h2>

        <motion.div
          variants={fadeUp}
          custom={2}
          initial="hidden"
          animate="show"
          className="mt-6 flex items-center gap-4 md:gap-5"
        >
          <span className="h-px w-8 bg-ivory/35 md:w-14" />
          <span
            className="text-[12px] uppercase text-ivory/90 md:text-[14px]"
            style={{ letterSpacing: "0.32em", marginRight: "-0.32em", fontWeight: 300 }}
          >
            {content?.hero_eyebrow || "ARCH SARA HAMAMI"}
          </span>
          <span className="h-px w-8 bg-ivory/35 md:w-14" />
        </motion.div>

        <motion.h1
          variants={fadeUp}
          custom={3}
          initial="hidden"
          animate="show"
          className="mt-9 max-w-[32ch] font-display text-[clamp(1.55rem,4.5vw,4rem)] leading-[1.1]"
        >
          {titleLines.map((line, i) => (
            <span key={i} className="block">
              {line}
            </span>
          ))}
        </motion.h1>

        <motion.div variants={fadeUp} custom={4} initial="hidden" animate="show" className="mt-10">
          <Link
            to={content?.hero_cta_link || "/work"}
            className="group inline-flex items-center gap-4 border border-ivory/45 px-8 py-4 caps text-ivory transition-colors duration-700 hover:bg-ivory hover:text-ink"
          >
            {content?.hero_cta_label || "Explore Projects"}
            <span className="h-px w-6 bg-current transition-all duration-700 group-hover:w-10" />
          </Link>
        </motion.div>
      </motion.div>

      <div className="absolute inset-x-0 bottom-0 z-10 flex items-end justify-between px-5 pb-6 md:px-10 md:pb-8">
        <span className="caps hidden text-ivory/50 sm:block">{place || "Studio"}</span>
        <a
          href="#projects"
          className="group mx-auto flex flex-col items-center gap-2 text-ivory/60 sm:mx-0"
          aria-label="Scroll to projects"
        >
          <span className="caps">Scroll</span>
          <span className="relative h-10 w-px overflow-hidden bg-ivory/20">
            <span className="absolute inset-x-0 top-0 h-1/2 animate-scroll-hint bg-ivory/80" />
          </span>
        </a>
        <span className="caps hidden text-ivory/50 sm:block">
          {String(new Date().getFullYear())}
        </span>
      </div>
    </section>
  );
}