import { useEffect, useRef, useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { Loader2, RotateCcw, ShieldCheck } from "lucide-react";
import { Panel, Field, ToggleRow } from "./AdminUI";
import {
  WATERMARK_PATTERNS,
  paintWatermark,
  toneFor,
  watermarkSettings,
} from "@/lib/watermark";
import {
  applyWatermark,
  countWatermarked,
  loadWatermarkSettings,
  restoreOriginals,
  saveWatermarkSettings,
} from "@/lib/watermarkStore";

export default function WatermarkPanel({ content }) {
  const queryClient = useQueryClient();
  const canvasRef = useRef(null);
  const [settings, setSettings] = useState(null);
  const [busy, setBusy] = useState("");
  const [progress, setProgress] = useState(null);
  const [note, setNote] = useState("");

  const { data: total } = useQuery({
    queryKey: ["watermark-count"],
    queryFn: () => countWatermarked(),
  });

  useEffect(() => {
    loadWatermarkSettings().then(setSettings);
  }, []);

  const source = content?.hero_image || content?.about_image || "";

  useEffect(() => {
    if (!settings || !source || !canvasRef.current) return;
    const canvas = canvasRef.current;
    const image = new window.Image();
    image.crossOrigin = "anonymous";
    image.onload = () => {
      const ratio = window.devicePixelRatio || 1;
      const width = Math.round(canvas.clientWidth * ratio);
      const height = Math.round(width * 0.62);
      canvas.width = width;
      canvas.height = height;
      const ctx = canvas.getContext("2d");
      ctx.drawImage(image, 0, 0, width, height);
      paintWatermark(ctx, width, height, settings, toneFor(image));
    };
    image.src = source;
  }, [settings, source]);

  const set = (key, value) => setSettings((prev) => watermarkSettings({ ...prev, [key]: value }));

  const save = async () => {
    setBusy("save");
    setNote("");
    try {
      setSettings(await saveWatermarkSettings(settings));
      setNote("Settings saved. New uploads use them straight away.");
    } catch (error) {
      setNote("The settings could not be saved.");
    } finally {
      setBusy("");
    }
  };

  const apply = async () => {
    setBusy("apply");
    setNote("");
    setProgress({ done: 0, total: 0 });
    try {
      const active = await saveWatermarkSettings(settings);
      setSettings(active);
      const result = await applyWatermark({ settings: active, onProgress: setProgress });
      await queryClient.invalidateQueries();
      queryClient.invalidateQueries({ queryKey: ["watermark-count"] });
      setNote(
        result.baked === 0
          ? "Every image already carries the current watermark."
          : `${result.baked} image${result.baked === 1 ? "" : "s"} watermarked and published.`
      );
    } catch (error) {
      setNote("The watermark pass stopped early. Run it again to finish the rest.");
    } finally {
      setBusy("");
      setProgress(null);
    }
  };

  const restore = async () => {
    setBusy("restore");
    setNote("");
    try {
      const result = await restoreOriginals();
      await queryClient.invalidateQueries();
      setNote(
        `Originals restored${result.kept ? `, ${result.kept} image(s) stay watermarked because their original is private` : ""}.`
      );
    } catch (error) {
      setNote("The originals could not be restored.");
    } finally {
      setBusy("");
    }
  };

  if (!settings) {
    return (
      <div className="flex items-center gap-3 text-sm text-stone">
        <Loader2 size={14} className="animate-spin" /> Loading watermark settings
      </div>
    );
  }

  return (
    <Panel
      title="Watermark"
      description="A discreet repeated copyright mark, ARCH SARA HAMAMI, baked into the image files themselves — it survives screenshots, downloads and re-sharing."
      actions={
        <div className="flex flex-wrap gap-2">
          <button
            type="button"
            onClick={save}
            disabled={Boolean(busy)}
            className="border border-ink/20 px-4 py-2.5 caps text-ink hover:border-ink disabled:opacity-40"
          >
            {busy === "save" ? <Loader2 size={11} className="animate-spin" /> : null} Save settings
          </button>
          <button
            type="button"
            onClick={apply}
            disabled={Boolean(busy)}
            className="inline-flex items-center gap-2 bg-ink px-5 py-2.5 caps text-ivory hover:bg-mocha disabled:opacity-60"
          >
            {busy === "apply" ? <Loader2 size={11} className="animate-spin" /> : <ShieldCheck size={11} />}
            {busy === "apply" ? "Applying" : "Apply to all images"}
          </button>
        </div>
      }
    >
      <ToggleRow
        label="Watermark new uploads"
        description="Every image uploaded from now on is published as a watermarked copy. The untouched original is kept in private storage."
        checked={settings.enabled}
        onChange={(value) => set("enabled", value)}
      />

      <div className="grid gap-7 lg:grid-cols-[1.15fr_1fr]">
        <div>
          <canvas ref={canvasRef} className="w-full border border-ink/10 bg-sand" />
          <p className="mt-2 caps text-stone">
            Live preview · {total || 0} watermarked file{total === 1 ? "" : "s"}
          </p>
        </div>

        <div className="space-y-6">
          <Field label={`Opacity · ${settings.opacity}%`}>
            <input
              type="range"
              min="4"
              max="14"
              step="1"
              value={settings.opacity}
              onChange={(event) => set("opacity", Number(event.target.value))}
              className="w-full accent-ink"
            />
          </Field>

          <Field label={`Size · ${settings.scale}% of image width`}>
            <input
              type="range"
              min="1.5"
              max="6"
              step="0.5"
              value={settings.scale}
              onChange={(event) => set("scale", Number(event.target.value))}
              className="w-full accent-ink"
            />
          </Field>

          <div>
            <span className="caps text-stone">Pattern</span>
            <div className="mt-2 flex gap-1">
              {WATERMARK_PATTERNS.map((option) => (
                <button
                  key={option.value}
                  type="button"
                  onClick={() => set("pattern", option.value)}
                  className={`px-3 py-2 caps ${
                    settings.pattern === option.value
                      ? "bg-ink text-ivory"
                      : "border border-ink/15 text-ink-soft hover:border-ink"
                  }`}
                >
                  {option.label}
                </button>
              ))}
            </div>
          </div>

          <button
            type="button"
            onClick={restore}
            disabled={Boolean(busy)}
            className="inline-flex items-center gap-2 caps text-stone hover:text-ink disabled:opacity-40"
          >
            {busy === "restore" ? <Loader2 size={11} className="animate-spin" /> : <RotateCcw size={11} />}
            Restore originals
          </button>
        </div>
      </div>

      {progress ? (
        <p className="text-[12px] text-ink-soft">
          Watermarking {progress.done} of {progress.total || "…"}
        </p>
      ) : null}
      {note ? <p className="border-t border-ink/10 pt-4 text-[12px] text-ink-soft">{note}</p> : null}

      <p className="border-t border-ink/10 pt-4 text-[11px] leading-relaxed text-stone">
        Changing opacity, size or pattern only takes effect once you run “Apply to all images”. Each
        pass re-renders from the original file, so the mark never doubles up.
      </p>
    </Panel>
  );
}