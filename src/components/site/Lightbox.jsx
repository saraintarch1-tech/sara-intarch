import { useEffect } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { ArrowLeft, ArrowRight, X } from "lucide-react";
import { Image } from "@/components/ui/image";

export default function Lightbox({ items = [], index, onClose, onNavigate }) {
  const open = index !== null && index !== undefined && index >= 0;

  useEffect(() => {
    if (!open) return;
    const onKey = (event) => {
      if (event.key === "Escape") onClose();
      if (event.key === "ArrowRight") onNavigate((index + 1) % items.length);
      if (event.key === "ArrowLeft") onNavigate((index - 1 + items.length) % items.length);
    };
    window.addEventListener("keydown", onKey);
    document.body.style.overflow = "hidden";
    return () => {
      window.removeEventListener("keydown", onKey);
      document.body.style.overflow = "";
    };
  }, [open, index, items.length, onClose, onNavigate]);

  const item = open ? items[index] : null;

  return (
    <AnimatePresence>
      {open && item ? (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
          className="fixed inset-0 z-[80] flex flex-col bg-[#111214]"
          role="dialog"
          aria-modal="true"
          aria-label="Project image viewer"
        >
          <div className="flex items-center justify-between px-5 py-4 md:px-8">
            <div className="caps text-ivory/50">
              {String(index + 1).padStart(2, "0")} / {String(items.length).padStart(2, "0")}
            </div>
            <button
              type="button"
              onClick={onClose}
              aria-label="Close viewer"
              className="flex h-10 w-10 items-center justify-center border border-ivory/20 text-ivory/70 transition-colors hover:border-ivory/60 hover:text-ivory"
            >
              <X size={16} strokeWidth={1.5} />
            </button>
          </div>

          <div className="relative flex flex-1 items-center justify-center px-5 pb-4 md:px-16">
            <AnimatePresence mode="wait">
              <motion.div
                key={item.src}
                initial={{ opacity: 0, scale: 0.985 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.985 }}
                transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
                className="max-h-full w-full max-w-[1400px]"
              >
                <Image
                  src={item.src}
                  alt={item.caption || "Project image"}
                  className="mx-auto max-h-[76vh] w-auto max-w-full object-contain"
                />
              </motion.div>
            </AnimatePresence>
          </div>

          <div className="flex items-center justify-between gap-6 border-t border-ivory/10 px-5 py-5 md:px-8">
            <div className="caps max-w-[60%] text-ivory/50">{item.caption}</div>
            <div className="flex gap-3">
              <button
                type="button"
                onClick={() => onNavigate((index - 1 + items.length) % items.length)}
                aria-label="Previous image"
                className="flex h-10 w-10 items-center justify-center border border-ivory/20 text-ivory/70 transition-colors hover:border-ivory/60 hover:text-ivory"
              >
                <ArrowLeft size={16} strokeWidth={1.5} />
              </button>
              <button
                type="button"
                onClick={() => onNavigate((index + 1) % items.length)}
                aria-label="Next image"
                className="flex h-10 w-10 items-center justify-center border border-ivory/20 text-ivory/70 transition-colors hover:border-ivory/60 hover:text-ivory"
              >
                <ArrowRight size={16} strokeWidth={1.5} />
              </button>
            </div>
          </div>
        </motion.div>
      ) : null}
    </AnimatePresence>
  );
}