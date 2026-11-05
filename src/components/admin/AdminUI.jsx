import { useRef, useState } from "react";
import { ArrowDown, ArrowLeft, ArrowUp, ImagePlus, Loader2, Trash2, X, Link2 } from "lucide-react";
import { Image } from "@/components/ui/image";
import { Switch } from "@/components/ui/switch";
import { uploadToLibrary } from "@/lib/media";
import MediaPicker from "./MediaPicker";

export const inputClass =
  "w-full border border-ink/15 bg-card px-3 py-2.5 text-sm text-ink placeholder:text-stone/60 focus:border-ink focus:outline-none";

export function Panel({ title, description, actions, children }) {
  return (
    <section>
      <div className="flex flex-wrap items-end justify-between gap-4 border-b border-ink/12 pb-5">
        <div>
          <h2 className="font-display text-[1.7rem] leading-none">{title}</h2>
          {description ? (
            <p className="mt-2 max-w-xl text-[13px] leading-relaxed text-ink-soft">{description}</p>
          ) : null}
        </div>
        {actions}
      </div>
      <div className="mt-8 space-y-7">{children}</div>
    </section>
  );
}

export function Grid({ children, cols = 2 }) {
  return (
    <div className={`grid gap-5 ${cols === 3 ? "sm:grid-cols-3" : cols === 1 ? "" : "sm:grid-cols-2"}`}>
      {children}
    </div>
  );
}

export function Field({ label, hint, children }) {
  return (
    <label className="block">
      <span className="caps text-stone">{label}</span>
      <div className="mt-2">{children}</div>
      {hint ? <span className="mt-1.5 block text-[11px] leading-relaxed text-stone">{hint}</span> : null}
    </label>
  );
}

export function TextInput({ label, hint, ...props }) {
  return (
    <Field label={label} hint={hint}>
      <input {...props} className={inputClass} />
    </Field>
  );
}

export function TextArea({ label, hint, rows = 4, ...props }) {
  return (
    <Field label={label} hint={hint}>
      <textarea {...props} rows={rows} className={`${inputClass} resize-y leading-relaxed`} />
    </Field>
  );
}

export function ToggleRow({ label, description, checked, onChange }) {
  return (
    <div className="flex items-center justify-between gap-4 border border-ink/12 bg-card px-4 py-3">
      <div>
        <div className="text-sm">{label}</div>
        {description ? <div className="text-[11px] text-stone">{description}</div> : null}
      </div>
      <Switch checked={Boolean(checked)} onCheckedChange={onChange} />
    </div>
  );
}

function UrlRow({ value, onChange }) {
  const [open, setOpen] = useState(false);
  if (!open) {
    return (
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="inline-flex items-center gap-2 caps text-stone hover:text-ink"
      >
        <Link2 size={11} /> Use a URL instead
      </button>
    );
  }
  return (
    <input
      value={value || ""}
      onChange={(event) => onChange(event.target.value)}
      placeholder="https://…"
      className={`${inputClass} mt-2`}
    />
  );
}

export function ImageUpload({ label, value, onChange, hint, aspect = "aspect-[16/10]", watermark = true }) {
  const inputRef = useRef(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [libraryOpen, setLibraryOpen] = useState(false);

  const upload = async (event) => {
    const file = event.target.files?.[0];
    if (!file) return;
    setBusy(true);
    setError("");
    try {
      onChange(await uploadToLibrary(file, { watermark }));
    } catch (err) {
      setError("Upload failed. Try a smaller image (JPG or PNG).");
    } finally {
      setBusy(false);
      if (inputRef.current) inputRef.current.value = "";
    }
  };

  return (
    <div>
      <span className="caps text-stone">{label}</span>
      <div className={`relative mt-2 overflow-hidden border border-ink/15 bg-sand ${aspect}`}>
        {value ? (
          <Image src={value} alt={label} className="h-full w-full object-cover" />
        ) : (
          <button
            type="button"
            onClick={() => inputRef.current?.click()}
            className="flex h-full w-full flex-col items-center justify-center gap-2 text-stone hover:text-ink"
          >
            <ImagePlus size={20} strokeWidth={1.2} />
            <span className="caps">Upload image</span>
          </button>
        )}
        {busy ? (
          <div className="absolute inset-0 flex items-center justify-center bg-ink/40">
            <Loader2 size={20} className="animate-spin text-ivory" />
          </div>
        ) : null}
      </div>
      <div className="mt-2 flex items-center gap-4">
        <button
          type="button"
          onClick={() => inputRef.current?.click()}
          className="caps text-ink-soft hover:text-ink"
        >
          {value ? "Replace" : "Choose file"}
        </button>
        <button
          type="button"
          onClick={() => setLibraryOpen(true)}
          className="caps text-ink-soft hover:text-ink"
        >
          Library
        </button>
        {value ? (
          <button type="button" onClick={() => onChange("")} className="caps text-stone hover:text-destructive">
            Remove
          </button>
        ) : null}
      </div>
      {hint ? <p className="mt-1 text-[11px] text-stone">{hint}</p> : null}
      {error ? <p className="mt-1 text-[11px] text-destructive">{error}</p> : null}
      <UrlRow value={value} onChange={onChange} />
      <MediaPicker
        open={libraryOpen}
        onClose={() => setLibraryOpen(false)}
        onSelect={(urls) => onChange(urls[0])}
      />
      <input ref={inputRef} type="file" accept="image/*" onChange={upload} className="hidden" />
    </div>
  );
}

export function ImagesUpload({ label, value = [], onChange, hint }) {
  const inputRef = useRef(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [libraryOpen, setLibraryOpen] = useState(false);

  const upload = async (event) => {
    const files = Array.from(event.target.files || []);
    if (!files.length) return;
    setBusy(true);
    setError("");
    try {
      const uploaded = [];
      for (const file of files) {
        uploaded.push(await uploadToLibrary(file));
      }
      onChange([...(value || []), ...uploaded]);
    } catch (err) {
      setError("Some images could not be uploaded. Try smaller files.");
    } finally {
      setBusy(false);
      if (inputRef.current) inputRef.current.value = "";
    }
  };

  const move = (index, direction) => {
    const next = [...value];
    const target = index + direction;
    if (target < 0 || target >= next.length) return;
    [next[index], next[target]] = [next[target], next[index]];
    onChange(next);
  };

  return (
    <div>
      <div className="flex items-center justify-between">
        <span className="caps text-stone">{label}</span>
        <div className="flex items-center gap-4">
          <button
            type="button"
            onClick={() => setLibraryOpen(true)}
            className="inline-flex items-center gap-2 caps text-ink-soft hover:text-ink"
          >
            <Link2 size={12} /> Library
          </button>
          <button
            type="button"
            onClick={() => inputRef.current?.click()}
            className="inline-flex items-center gap-2 caps text-ink-soft hover:text-ink"
          >
            <ImagePlus size={12} /> Add images
          </button>
        </div>
      </div>
      <div className="mt-3 grid grid-cols-2 gap-3 sm:grid-cols-3">
        {(value || []).map((src, i) => (
          <div key={`${src}-${i}`} className="group relative aspect-[4/3] overflow-hidden border border-ink/15 bg-sand">
            <Image src={src} alt={`Image ${i + 1}`} className="h-full w-full object-cover" />
            <div className="absolute inset-x-0 bottom-0 flex items-center justify-between bg-ink/60 px-2 py-1 opacity-0 transition-opacity group-hover:opacity-100">
              <div className="flex gap-1">
                <button type="button" onClick={() => move(i, -1)} className="p-1 text-ivory" aria-label="Move earlier">
                  <ArrowLeft size={11} />
                </button>
                <button type="button" onClick={() => move(i, 1)} className="p-1 text-ivory" aria-label="Move later">
                  <ArrowLeft size={11} className="rotate-180" />
                </button>
              </div>
              <button
                type="button"
                onClick={() => onChange(value.filter((_, index) => index !== i))}
                className="p-1 text-ivory"
                aria-label="Remove image"
              >
                <Trash2 size={11} />
              </button>
            </div>
            <span className="absolute left-1 top-1 bg-ink/60 px-1.5 py-0.5 caps text-[8px] text-ivory">
              {i + 1}
            </span>
          </div>
        ))}
        <button
          type="button"
          onClick={() => inputRef.current?.click()}
          className="flex aspect-[4/3] flex-col items-center justify-center gap-2 border border-dashed border-ink/25 text-stone hover:border-ink hover:text-ink"
        >
          {busy ? <Loader2 size={16} className="animate-spin" /> : <ImagePlus size={16} strokeWidth={1.2} />}
          <span className="caps">{busy ? "Uploading" : "Add"}</span>
        </button>
      </div>
      {hint ? <p className="mt-2 text-[11px] text-stone">{hint}</p> : null}
      {error ? <p className="mt-2 text-[11px] text-destructive">{error}</p> : null}
      <MediaPicker
        open={libraryOpen}
        onClose={() => setLibraryOpen(false)}
        onSelect={(urls) => onChange([...(value || []), ...urls])}
        multiple
      />
      <input ref={inputRef} type="file" accept="image/*" multiple onChange={upload} className="hidden" />
    </div>
  );
}

export function RowCard({ children, className = "" }) {
  return <div className={`border border-ink/12 bg-card p-4 ${className}`}>{children}</div>;
}

export function RowActions({ index, total, onMove, onDelete, extra }) {
  return (
    <div className="flex items-center gap-1">
      {extra}
      <button
        type="button"
        onClick={() => onMove(-1)}
        disabled={index === 0}
        className="p-1.5 text-stone hover:text-ink disabled:opacity-25"
        aria-label="Move up"
      >
        <ArrowUp size={13} />
      </button>
      <button
        type="button"
        onClick={() => onMove(1)}
        disabled={index === total - 1}
        className="p-1.5 text-stone hover:text-ink disabled:opacity-25"
        aria-label="Move down"
      >
        <ArrowDown size={13} />
      </button>
      <button
        type="button"
        onClick={onDelete}
        className="p-1.5 text-stone hover:text-destructive"
        aria-label="Delete"
      >
        <Trash2 size={13} />
      </button>
    </div>
  );
}

export function Pill({ children, tone = "stone" }) {
  const tones = {
    stone: "border-ink/15 text-stone",
    live: "border-emerald-700/30 text-emerald-800",
    draft: "border-amber-700/30 text-amber-800",
  };
  return <span className={`border px-2 py-1 caps ${tones[tone] || tones.stone}`}>{children}</span>;
}

export function CloseButton({ onClick }) {
  return (
    <button type="button" onClick={onClick} className="p-1 text-stone hover:text-ink" aria-label="Close">
      <X size={16} />
    </button>
  );
}