import { ImageUpload, Panel, TextArea, TextInput } from "./AdminUI";

export default function SeoPanel({ content, set }) {
  const title = content.seo_title || content.brand_name || "SARA INTARCH";
  const description =
    content.seo_description ||
    "Interior architecture studio shaping calm, light-filled spaces across residential, hospitality and workplace interiors.";

  return (
    <Panel
      title="Search & Sharing"
      description="How the site appears on Google and when a link is shared."
    >
      <TextInput
        label="SEO title"
        value={content.seo_title || ""}
        onChange={(event) => set("seo_title", event.target.value)}
        placeholder="SARA INTARCH — Interior Architecture"
        hint="Around 60 characters reads best in search results."
      />
      <TextArea
        label="Meta description"
        rows={3}
        value={content.seo_description || ""}
        onChange={(event) => set("seo_description", event.target.value)}
        placeholder="Interior architecture studio shaping calm, light-filled spaces…"
        hint="Around 155 characters."
      />
      <ImageUpload
        label="Social sharing image"
        value={content.og_image}
        onChange={(value) => set("og_image", value)}
        watermark={false}
        aspect="aspect-[16/9]"
        hint="Shown when the link is shared on WhatsApp, Instagram or LinkedIn. 1200 × 630 works well."
      />

      <div className="border-t border-ink/10 pt-7">
        <div className="caps text-stone">Preview</div>
        <div className="mt-4 max-w-xl border border-ink/12 bg-card p-5">
          <div className="text-[11px] text-stone">saraintarch.com</div>
          <div className="mt-1 truncate font-serif text-lg text-blue-900">{title}</div>
          <p className="mt-1 line-clamp-2 text-[13px] leading-relaxed text-ink-soft">
            {description}
          </p>
        </div>
      </div>
    </Panel>
  );
}