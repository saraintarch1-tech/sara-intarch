import { useEffect, useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { AnimatePresence, motion } from "framer-motion";
import { Menu, X } from "lucide-react";
import Logo from "@/components/brand/Logo";

const FALLBACK_LINKS = [
  { label: "Work", path: "/work", visible: true },
  { label: "Services", path: "/#services", visible: true },
  { label: "About", path: "/#about", visible: true },
  { label: "Contact", path: "/contact", visible: true },
];

export default function Navbar({ content, tone = "dark" }) {
  const { pathname } = useLocation();
  const [scrolled, setScrolled] = useState(false);
  const [open, setOpen] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 48);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    setOpen(false);
  }, [pathname]);

  useEffect(() => {
    document.body.style.overflow = open ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [open]);

  const links = (content?.nav_items?.length ? content.nav_items : FALLBACK_LINKS).filter(
    (item) => item.visible !== false
  );
  const light = tone === "light" && !scrolled && !open;

  return (
    <>
      <header
        className={`fixed inset-x-0 top-0 z-50 transition-all duration-700 ${
          scrolled && !open
            ? "border-b border-ink/10 bg-background/92 backdrop-blur-md"
            : "border-b border-transparent"
        }`}
      >
        <div className="mx-auto flex h-[68px] max-w-[1600px] items-center justify-between px-5 md:h-24 md:px-10">
          <Link to="/" aria-label={content?.brand_name || "SARA INTARCH"} className="relative z-10">
            <Logo
              name={content?.brand_name}
              tagline={content?.brand_tagline}
              logoUrl={content?.logo_url}
              size="sm"
              tone={light ? "ivory" : "ink"}
            />
          </Link>

          <nav className="hidden items-center gap-9 md:flex">
            {links.map((item) => (
              <Link
                key={`${item.label}-${item.path}`}
                to={item.path}
                className={`link-line caps ${
                  light ? "text-ivory/85 hover:text-ivory" : "text-ink-soft hover:text-ink"
                }`}
              >
                {item.label}
              </Link>
            ))}
            <Link
              to="/contact"
              className={`border px-6 py-3 caps transition-colors duration-500 ${
                light
                  ? "border-ivory/40 text-ivory hover:bg-ivory hover:text-ink"
                  : "border-ink/25 text-ink hover:bg-ink hover:text-ivory"
              }`}
            >
              Start a project
            </Link>
          </nav>

          <button
            type="button"
            onClick={() => setOpen((value) => !value)}
            className={`relative z-10 -mr-2 flex h-10 w-10 items-center justify-center md:hidden ${
              light ? "text-ivory" : "text-ink"
            }`}
            aria-label={open ? "Close menu" : "Open menu"}
            aria-expanded={open}
          >
            {open ? <X size={20} strokeWidth={1.2} /> : <Menu size={20} strokeWidth={1.2} />}
          </button>
        </div>
      </header>

      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.4 }}
            className="fixed inset-0 z-40 flex flex-col justify-between bg-background px-6 pb-10 pt-28 md:hidden"
          >
            <nav className="flex flex-col gap-1">
              {links.map((item, i) => (
                <motion.div
                  key={`${item.label}-${item.path}`}
                  initial={{ opacity: 0, y: 16 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.08 * i, duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
                >
                  <Link
                    to={item.path}
                    onClick={() => setOpen(false)}
                    className="flex items-baseline justify-between border-b border-ink/10 py-4 font-display text-3xl"
                  >
                    {item.label}
                    <span className="caps text-stone">0{i + 1}</span>
                  </Link>
                </motion.div>
              ))}
              <Link
                to="/contact"
                onClick={() => setOpen(false)}
                className="mt-8 bg-ink px-6 py-4 text-center caps text-ivory"
              >
                Start a project
              </Link>
            </nav>
            <div className="space-y-2">
              {content?.email ? <p className="text-sm text-ink-soft">{content.email}</p> : null}
              {content?.instagram_handle ? (
                <a href={content.instagram} target="_blank" rel="noreferrer" className="caps text-stone">
                  {content.instagram_handle}
                </a>
              ) : null}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}