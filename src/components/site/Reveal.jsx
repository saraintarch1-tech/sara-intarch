import { motion } from "framer-motion";
import { Image } from "@/components/ui/image";

const EASE = [0.16, 1, 0.3, 1];

export default function Reveal({ children, delay = 0, y = 26, className = "", once = true }) {
  return (
    <motion.div
      className={className}
      initial={{ opacity: 0, y }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once, margin: "-8%" }}
      transition={{ duration: 1.1, delay, ease: EASE }}
    >
      {children}
    </motion.div>
  );
}

export function ImageReveal({ src, alt, className = "", imgClassName = "", delay = 0 }) {
  return (
    <motion.div
      className={`relative overflow-hidden bg-sand ${className}`}
      initial={{ clipPath: "inset(14% 0% 0% 0%)", opacity: 0 }}
      whileInView={{ clipPath: "inset(0% 0% 0% 0%)", opacity: 1 }}
      viewport={{ once: true, margin: "-10%" }}
      transition={{ duration: 1.4, delay, ease: EASE }}
    >
      <motion.div
        initial={{ scale: 1.14 }}
        whileInView={{ scale: 1 }}
        viewport={{ once: true, margin: "-10%" }}
        transition={{ duration: 1.8, delay, ease: EASE }}
        className="h-full w-full"
      >
        <Image src={src} alt={alt} className={`h-full w-full object-cover ${imgClassName}`} />
      </motion.div>
    </motion.div>
  );
}

export function Line({ className = "", tone = "ink" }) {
  return (
    <motion.div
      initial={{ scaleX: 0 }}
      whileInView={{ scaleX: 1 }}
      viewport={{ once: true }}
      transition={{ duration: 1.4, ease: EASE }}
      className={`h-px origin-left ${tone === "ivory" ? "bg-ivory/25" : "bg-ink/15"} ${className}`}
    />
  );
}