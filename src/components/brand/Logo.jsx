import { useId } from "react";

/**
 * SARA INTARCH monogram: an architectural arch holding an "S" that settles
 * into an "H" — the two initials of Sara Hamami drawn as one composition.
 */
export function Monogram({ className = "h-10 w-10", strokeWidth = 2, title }) {
  const id = useId();
  return (
    <svg
      viewBox="0 0 100 100"
      className={className}
      fill="none"
      stroke="currentColor"
      strokeWidth={strokeWidth}
      strokeLinecap="square"
      aria-hidden={title ? undefined : true}
      role={title ? "img" : undefined}
    >
      {title ? <title>{title}</title> : null}
      <g id={id}>
        <path d="M20 86V48a30 30 0 0 1 60 0v38" />
        <path d="M50 12v10" opacity="0.55" />
        <path d="M60 32.5C60 29.2 54.2 27.5 49.5 27.5C43.7 27.5 39.4 29.6 39.4 32.4C39.4 35.2 43.4 36.4 48.9 37.4C55.2 38.6 60.6 39.9 60.6 43.1C60.6 46.2 55.6 48.3 49.7 48.3C44 48.3 39.1 46.6 38.6 43.1" />
        <path d="M38.5 52v25" opacity="0.92" />
        <path d="M61.5 52v25" opacity="0.92" />
        <path d="M38.5 64.5h23" opacity="0.92" />
      </g>
    </svg>
  );
}

export default function Logo({
  name = "SARA INTARCH",
  tagline = "Interior Architecture Studio",
  logoUrl,
  tone = "ink",
  size = "md",
  stacked = false,
  className = "",
}) {
  const [first, ...rest] = String(name || "").split(" ");
  const second = rest.join(" ");
  const color = tone === "ivory" ? "text-ivory" : "text-ink";
  const mark = size === "lg" ? "h-16 w-16 md:h-20 md:w-20" : size === "sm" ? "h-7 w-7" : "h-9 w-9";

  if (logoUrl) {
    return (
      <img
        src={logoUrl}
        alt={name}
        className={`${size === "lg" ? "h-20 md:h-24" : size === "sm" ? "h-7" : "h-10"} w-auto object-contain ${className}`}
      />
    );
  }

  return (
    <span className={`inline-flex items-center gap-3 ${color} ${className}`}>
      <Monogram className={`${mark} shrink-0`} title={name} />
      <span className={stacked ? "flex flex-col" : "flex flex-col leading-none"}>
        <span
          className={`font-display leading-none ${
            size === "lg" ? "text-[2.1rem] md:text-[2.9rem]" : size === "sm" ? "text-[0.95rem]" : "text-[1.35rem]"
          }`}
          style={{ letterSpacing: "0.18em" }}
        >
          {first || name}
        </span>
        {second ? (
          <span
            className={`caps mt-1 ${size === "lg" ? "text-[11px]" : "text-[8px]"} ${
              tone === "ivory" ? "text-ivory/65" : "text-stone"
            }`}
            style={{ letterSpacing: "0.44em" }}
          >
            {second}
          </span>
        ) : tagline ? (
          <span className={`caps mt-1 text-[8px] ${tone === "ivory" ? "text-ivory/65" : "text-stone"}`}>
            {tagline}
          </span>
        ) : null}
      </span>
    </span>
  );
}