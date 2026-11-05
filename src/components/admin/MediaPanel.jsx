import { useMemo, useRef, useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { Copy, Loader2, Search, Trash2, Upload } from "lucide-react";
import { Image } from "@/components/ui/image";
import { Panel } from "./AdminUI";
import { api } from "@/api/platformClient";
import { uploadToLibrary } from "@/lib/media";

const items = (result) => (Array.isArray(result) ? result : result?.items || []);

const FILTERS = [
  { key: "all", label: "All" },
  { key: "image", label: "Images" },
  { key: "video", label: "Videos" },
];

export default function MediaPanel() {
  const queryClient = useQueryClient();
  const inputRef = useRef(null);
  const [busy, setBusy] = useState(false);
  const [term, setTerm] = useState("");
  const [kind, setKind] = useState("all");
  const [confirmId, setConfirmId] = useState(null);
  const [copied, setCopied] = useState("");

  const { data, isLoading } = useQuery({
    queryKey: ["admin-media"],
    queryFn: async () =>
      items(await api.entities.MediaAsset.list({ sort: "-created_date", limit: 300 })),
  });

  const assets = data || [];

  const visible = useMemo(() => {
    const query = term.trim().toLowerCase();
    return assets.filter((asset) => {
      if (kind !== "all" && asset.kind !== kind) return false;
      if (!query) return true;
      return (asset.name || "").toLowerCase().includes(query);
    });
  }, [assets, kind, term]);

  const upload = async (event) => {
    const files = Array.from(event.target.files || []);
    if (!files.length) return;
    setBusy(true);
    try {
      for (const file of files) {
        await uploadToLibrary(file);
      }
      queryClient.invalidateQueries({ queryKey: ["admin-media"] });
    } finally {
      setBusy(false);
      if (inputRef.current) inputRef.current.value = "";
    }
  };

  const remove = async (asset) => {
    await api.entities.MediaAsset.delete(asset.id);
    setConfirmId(null);
    queryClient.invalidateQueries({ queryKey: ["admin-media"] });
  };

  const copy = async (asset) => {
    try {
      await navigator.clipboard.writeText(asset.url);
      setCopied(asset.id);
      setTimeout(() => setCopied(""), 1600);
    } catch (error) {
      setCopied("");
    }
  };

  return (
    <Panel
      title="Media library"
      description="Every upload lands here. Copy a link to reuse it anywhere, or open any image field and pick from the library."
      actions={
        <button
          type="button"
          onClick={() => inputRef.current?.click()}
          className="inline-flex items-center gap-2 bg-ink px-5 py-3 caps text-ivory hover:bg-mocha"
        >
          {busy ? <Loader2 size={12} className="animate-spin" /> : <Upload size={12} />}
          {busy ? "Uploading" : "Upload files"}
        </button>
      }
    >
      <div className="flex flex-wrap items-center gap-3">
        <div className="flex min-w-[220px] flex-1 items-center gap-2 border border-ink/15 bg-card px-3 py-2">
          <Search size={13} className="text-stone" />
          <input
            value={term}
            onChange={(event) => setTerm(event.target.value)}
            placeholder="Search the library"
            className="w-full bg-transparent text-sm focus:outline-none"
          />
        </div>
        <div className="flex gap-1">
          {FILTERS.map((filter) => (
            <button
              key={filter.key}
              type="button"
              onClick={() => setKind(filter.key)}
              className={`px-3 py-2 caps ${
                kind === filter.key ? "bg-ink text-ivory" : "border border-ink/15 text-ink-soft hover:border-ink"
              }`}
            >
              {filter.label}
            </button>
          ))}
        </div>
        <span className="caps text-stone">{assets.length} files</span>
      </div>

      {isLoading ? (
        <div className="flex items-center gap-3 text-sm text-stone">
          <Loader2 size={14} className="animate-spin" /> Loading media
        </div>
      ) : visible.length === 0 ? (
        <div className="border border-dashed border-ink/20 p-10 text-center">
          <p className="font-display text-2xl">Nothing here yet</p>
          <p className="mt-2 text-sm text-stone">
            Upload images or films to keep every asset in one place.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
          {visible.map((asset) => (
            <div key={asset.id} className="border border-ink/12 bg-card">
              <div className="relative aspect-square overflow-hidden bg-sand">
                {asset.kind === "video" ? (
                  <video src={asset.url} className="h-full w-full object-cover" muted controls />
                ) : (
                  <Image src={asset.url} alt={asset.name || "Media"} className="h-full w-full object-cover" />
                )}
              </div>
              <div className="p-2.5">
                <p className="truncate text-[12px]" title={asset.name}>
                  {asset.name || "Untitled"}
                </p>
                <div className="mt-2 flex items-center justify-between">
                  <button
                    type="button"
                    onClick={() => copy(asset)}
                    className="inline-flex items-center gap-1 caps text-stone hover:text-ink"
                  >
                    <Copy size={11} /> {copied === asset.id ? "Copied" : "Copy link"}
                  </button>
                  {confirmId === asset.id ? (
                    <button
                      type="button"
                      onClick={() => remove(asset)}
                      className="caps text-destructive"
                    >
                      Confirm
                    </button>
                  ) : (
                    <button
                      type="button"
                      onClick={() => setConfirmId(asset.id)}
                      className="p-1 text-stone hover:text-destructive"
                      aria-label="Delete file"
                    >
                      <Trash2 size={12} />
                    </button>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      <p className="border-t border-ink/10 pt-4 text-[11px] leading-relaxed text-stone">
        Deleting a file here removes it from the library only. Images already placed in a project keep
        working — remove them from the project itself to retire a photograph.
      </p>

      <input
        ref={inputRef}
        type="file"
        accept="image/*,video/mp4"
        multiple
        onChange={upload}
        className="hidden"
      />
    </Panel>
  );
}