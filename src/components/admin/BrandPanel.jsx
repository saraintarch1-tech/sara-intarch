import { Field, Grid, ImageUpload, Panel, TextArea, TextInput } from "./AdminUI";
import { ACCENTS, FONTS } from "@/lib/theme";

export default function BrandPanel({ content, set }) {
  return (
    <Panel
      title="Identity"
      description="The name, logo and typographic voice used across the site, footer and browser tab."
    >
      <Grid>
        <TextInput
          label="Studio name"
          value={content.brand_name || ""}
          onChange={(event) => set("brand_name", event.target.value)}
          placeholder="SARA INTARCH"
        />
        <TextInput
          label="Descriptor"
          value={content.brand_tagline || ""}
          onChange={(event) => set("brand_tagline", event.target.value)}
          placeholder="Interior Architecture Studio"
        />
      </Grid>

      <div className="grid gap-5 sm:grid-cols-2">
        <ImageUpload
          label="Logo image (optional)"
          value={content.logo_url}
          onChange={(value) => set("logo_url", value)}
          aspect="aspect-[16/7]"
          hint="If empty, the built-in SH monogram and SARA INTARCH wordmark are used."
        />
        <div className="space-y-5">
          <Field label="Accent colour" hint="Used for hovers, rules and fine details.">
            <div className="grid grid-cols-4 gap-2">
              {Object.entries(ACCENTS).map(([key, accent]) => (
                <button
                  key={key}
                  type="button"
                  onClick={() => set("accent", key)}
                  className={`border p-2 text-left transition-colors ${
                    content.accent === key ? "border-ink" : "border-ink/15 hover:border-ink/40"
                  }`}
                >
                  <span
                    className="block h-6 w-full"
                    style={{ backgroundColor: accent.swatch }}
                    aria-hidden="true"
                  />
                  <span className="mt-2 block text-[10px] leading-tight text-ink-soft">
                    {accent.label}
                  </span>
                </button>
              ))}
            </div>
          </Field>

          <Field label="Display typeface">
            <select
              value={content.display_font || "italiana"}
              onChange={(event) => set("display_font", event.target.value)}
              className="w-full border border-ink/15 bg-card px-3 py-2.5 text-sm focus:border-ink focus:outline-none"
            >
              {Object.entries(FONTS).map(([key, font]) => (
                <option key={key} value={key}>
                  {font.label}
                </option>
              ))}
            </select>
          </Field>
        </div>
      </div>

      <div className="max-w-[220px]">
        <ImageUpload
          label="Browser icon"
          value={content.favicon_url}
          onChange={(value) => set("favicon_url", value)}
          aspect="aspect-square"
          hint="A square mark shown in tabs and bookmarks."
        />
      </div>

      <Grid>
        <TextArea
          label="Footer note"
          rows={3}
          value={content.footer_note || ""}
          onChange={(event) => set("footer_note", event.target.value)}
          hint="The short paragraph beside the logo in the footer."
        />
        <TextInput
          label="Copyright line"
          value={content.footer_copyright || ""}
          onChange={(event) => set("footer_copyright", event.target.value)}
          placeholder="© 2026 SARA INTARCH"
        />
      </Grid>
    </Panel>
  );
}