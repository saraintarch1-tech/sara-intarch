export default function Eyebrow({ children, tone = "ink", index, className = "" }) {
  const color = tone === "ivory" ? "text-ivory/60" : "text-stone";
  return (
    <span className={`inline-flex items-center gap-3 caps ${color} ${className}`}>
      {index ? <span className={tone === "ivory" ? "text-ivory/40" : "text-stone/70"}>{index}</span> : null}
      <span className={`h-px w-8 ${tone === "ivory" ? "bg-ivory/30" : "bg-ink/25"}`} />
      <span>{children}</span>
    </span>
  );
}