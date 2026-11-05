import { useEffect, useState } from "react";

export default function CustomCursor() {
  const [enabled, setEnabled] = useState(false);
  const [point, setPoint] = useState({ x: -100, y: -100 });
  const [active, setActive] = useState(false);

  useEffect(() => {
    const fine = window.matchMedia("(pointer: fine)").matches;
    const calm = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (!fine || calm) return;
    setEnabled(true);

    const onMove = (event) => {
      setPoint({ x: event.clientX, y: event.clientY });
      setActive(Boolean(event.target?.closest?.("a, button, [data-cursor='hover']")));
    };
    window.addEventListener("pointermove", onMove, { passive: true });
    return () => window.removeEventListener("pointermove", onMove);
  }, []);

  if (!enabled) return null;

  return (
    <div className="pointer-events-none fixed inset-0 z-[90] hidden md:block" aria-hidden="true">
      <div
        className="absolute h-1 w-1 rounded-full bg-ink"
        style={{ transform: `translate3d(${point.x}px, ${point.y}px, 0) translate(-50%, -50%)` }}
      />
      <div
        className={`absolute rounded-full border border-ink/40 transition-all duration-500 ease-out ${
          active ? "h-11 w-11 border-ink/25 bg-ink/5" : "h-7 w-7"
        }`}
        style={{ transform: `translate3d(${point.x}px, ${point.y}px, 0) translate(-50%, -50%)` }}
      />
    </div>
  );
}