import { useEffect, useState } from "react";
import { Check, Loader2, Search, X } from "lucide-react";
import { Image } from "@/components/ui/image";
import { api } from "@/api/platformClient";

const items = (result) => (Array.isArray(result) ? result : result?.items || []);

export default function MediaPicker({ open, onClose, onSelect, multiple = false }) {
  const [assets, setAssets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [term, setTerm] = useState("");
  const [picked, setPicked] = useState([]);

  useEffect(() => {
    if (!open) return;
    setPicked([]);
    setLoading(true);
    api.entities.MediaAsset.list({ sort: "-created_date", limit: 200 })
      .then((result) => setAssets(items(result)))
      .finally(() => setLoading(false));
  }, [open]);

  if (!open) return null;

  const query = term.trim().toLowerCase();
  const visible = query
    ? assets.filter((asset) => (asset.name || "").toLowerCase().includes(query))
    : assets;

  const toggle = (asset) => {
    if (!multiple) {
      onSelect([asset.url]);
      onClose();
      return;
    }
    setPicked((prev) =>
      prev.includes(asset.url) ? prev.filter((url) => url !== asset.url) : [...prev, asset.url]
    );
  };

  return (
    <div className="fixed inset-0 z-[80] flex items-center justify-center bg-ink/60 p-4">
      <div className="flex max-h-[86vh] w-full max-w-4xl flex-col border border-ink/15 bg-background">
        <div className="flex items-center justify-between gap-4 border-b border-ink/12 px-5 py-4">
          <div>
            <h3 className="font-display text-xl leading-none">Media library</h3>
            <p className="mt-1 text-[11px] text-stone">
              Choose a file you have already uploaded.
            </p>
          </div>
          <button type="button" onClick={onClose} className="p-1 text-stone hover:text-ink" aria-label="Close">
            <X size={16} />
          </button>
        </div>

        <div className="border-b border-ink/12 px-5 py-3">
          <div className="flex items-center gap-2 border border-ink/15 bg-card px-3 py-2">
            <Search size={13} className="text-stone" />
            <input
              value={term}
              onChange={(event) => setTerm(event.target.value)}
              placeholder="Search by file name"
              className="w-full bg-transparent text-sm focus:outline-none"
            />
          </div>
        </div>

        <div className="min-h-0 flex-1 overflow-y-auto p-5">
          {loading ? (
            <div className="flex items-center gap-2 text-sm text-stone">
              <Loader2 size={14} className="animate-spin" /> Loading library
            </div>
          ) : visible.length === 0 ? (
            <p className="py-10 text-center text-sm text-stone">
              {assets.length ? "No files match that name." : "The library is empty. Upload an image first."}
            </p>
          ) : (
            <div className="grid grid-cols-3 gap-3 sm:grid-cols-4">
              {visible.map((asset) => {
                const active = picked.includes(asset.url);
                return (
                  <button
                    key={asset.id}
                    type="button"
                    onClick={() => toggle(asset)}
                    className={`group relative aspect-square overflow-hidden border ${
                      active ? "border-ink" : "border-ink/12 hover:border-ink/40"
                    }`}
                  >
                    {asset.kind === "video" ? (
                      <video src={asset.url} className="h-full w-full object-cover" muted />
                    ) : (
                      <Image src={asset.url} alt={asset.name || "Media"} className="h-full w-full object-cover" />
                    )}
                    {active ? (
                      <span className="absolute right-1 top-1 bg-ink p-1 text-ivory">
                        <Check size={11} />
                      </span>
                    ) : null}
                    <span className="absolute inset-x-0 bottom-0 truncate bg-ink/65 px-1.5 py-1 text-[9px] text-ivory">
                      {asset.name || "Untitled"}
                    </span>
                  </button>
                );
              })}
            </div>
          )}
        </div>

        {multiple ? (
          <div className="flex items-center justify-between gap-3 border-t border-ink/12 px-5 py-3">
            <span className="caps text-stone">{picked.length} selected</span>
            <button
              type="button"
              disabled={!picked.length}
              onClick={() => {
                onSelect(picked);
                onClose();
              }}
              className="bg-ink px-5 py-2.5 caps text-ivory disabled:opacity-40"
            >
              Add selected
            </button>
          </div>
        ) : null}
      </div>
    </div>
  );
}