import { Plus, Trash2 } from "lucide-react";
import { Grid, ImageUpload, Panel, TextArea, TextInput, inputClass } from "./AdminUI";

export default function AboutPanel({ content, set }) {
  const stats = content.about_stats || [];

  const updateStat = (index, patch) =>
    set(
      "about_stats",
      stats.map((stat, i) => (i === index ? { ...stat, ...patch } : stat))
    );

  return (
    <Panel title="About" description="The studio statement, philosophy and the portrait that introduces it.">
      <Grid>
        <TextInput
          label="Eyebrow"
          value={content.about_eyebrow || ""}
          onChange={(event) => set("about_eyebrow", event.target.value)}
          placeholder="The Studio"
        />
        <TextInput
          label="Signature"
          value={content.about_signature || ""}
          onChange={(event) => set("about_signature", event.target.value)}
          placeholder="Sara — Founder"
        />
      </Grid>

      <TextInput
        label="Heading"
        value={content.about_title || ""}
        onChange={(event) => set("about_title", event.target.value)}
        placeholder="Quiet, considered, built to last"
      />

      <TextArea
        label="Body"
        rows={8}
        value={content.about_body || ""}
        onChange={(event) => set("about_body", event.target.value)}
        hint="Separate paragraphs with a blank line."
      />

      <TextArea
        label="Pull quote"
        rows={2}
        value={content.about_quote || ""}
        onChange={(event) => set("about_quote", event.target.value)}
        hint="Shown in italic serif beside a fine rule. Leave empty to hide it."
      />

      <div>
        <div className="flex items-center justify-between">
          <div className="caps text-stone">Statistics & achievements</div>
          <button
            type="button"
            onClick={() => set("about_stats", [...stats, { value: "", label: "" }])}
            className="inline-flex items-center gap-2 caps text-ink-soft hover:text-ink"
          >
            <Plus size={12} /> Add figure
          </button>
        </div>
        <p className="mt-1 text-[11px] text-stone">
          A short row of numbers under the studio statement, for example “12 Years of practice”.
        </p>

        <div className="mt-3 space-y-2">
          {stats.map((stat, index) => (
            <div key={index} className="flex items-end gap-2">
              <input
                value={stat.value || ""}
                onChange={(event) => updateStat(index, { value: event.target.value })}
                className={`${inputClass} w-24 shrink-0`}
                placeholder="12"
              />
              <input
                value={stat.label || ""}
                onChange={(event) => updateStat(index, { label: event.target.value })}
                className={inputClass}
                placeholder="Years of practice"
              />
              <button
                type="button"
                onClick={() => set("about_stats", stats.filter((_, i) => i !== index))}
                className="mb-2 p-2 text-stone hover:text-destructive"
                aria-label="Remove figure"
              >
                <Trash2 size={13} />
              </button>
            </div>
          ))}
          {stats.length === 0 ? (
            <p className="text-[12px] text-stone">No figures yet — the row stays hidden.</p>
          ) : null}
        </div>
      </div>

      <ImageUpload
        label="Portrait or studio image"
        value={content.about_image}
        onChange={(value) => set("about_image", value)}
        watermark={false}
        aspect="aspect-[4/5]"
        hint="A vertical image works best here."
      />
    </Panel>
  );
}