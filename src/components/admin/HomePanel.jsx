import { Grid, ImageUpload, Panel, TextArea, TextInput } from "./AdminUI";

export default function HomePanel({ content, set }) {
  return (
    <Panel
      title="Home & Hero"
      description="The opening screen and the introduction above the selected projects."
    >
      <TextInput
        label="Architect name (under the studio name)"
        value={content.hero_eyebrow || ""}
        onChange={(event) => set("hero_eyebrow", event.target.value)}
        placeholder="ARCH SARA HAMAMI"
        hint="Shown in the hero, framed by two fine rules beneath the studio name."
      />
      <TextInput
        label="Main headline"
        value={content.hero_title || ""}
        onChange={(event) => set("hero_title", event.target.value)}
        placeholder="Designs that bring spaces to life, that tell stories."
        hint="A comma splits the headline into two editorial lines."
      />
      <Grid>
        <TextInput
          label="Button label"
          value={content.hero_cta_label || ""}
          onChange={(event) => set("hero_cta_label", event.target.value)}
          placeholder="Explore Projects"
        />
        <TextInput
          label="Button link"
          value={content.hero_cta_link || ""}
          onChange={(event) => set("hero_cta_link", event.target.value)}
          placeholder="/work"
          hint="Use /work, /contact or an external https link."
        />
      </Grid>
      <TextInput
        label="Hero video URL (optional)"
        value={content.hero_video || ""}
        onChange={(event) => set("hero_video", event.target.value)}
        placeholder="https://…/studio.mp4"
        hint="A direct MP4 link plays instead of the still image."
      />

      <ImageUpload
        label="Hero background"
        value={content.hero_image}
        onChange={(value) => set("hero_image", value)}
        watermark={false}
        aspect="aspect-[16/9]"
        hint="Landscape, at least 2000px wide. A dark overlay is applied automatically."
      />

      <div className="border-t border-ink/10 pt-7">
        <Grid>
          <TextInput
            label="Projects section eyebrow"
            value={content.projects_eyebrow || ""}
            onChange={(event) => set("projects_eyebrow", event.target.value)}
          />
          <TextInput
            label="Projects section title"
            value={content.projects_title || ""}
            onChange={(event) => set("projects_title", event.target.value)}
          />
        </Grid>
        <div className="mt-5">
          <TextArea
            label="Projects section intro"
            rows={3}
            value={content.projects_intro || ""}
            onChange={(event) => set("projects_intro", event.target.value)}
          />
        </div>
      </div>

      <div className="border-t border-ink/10 pt-7">
        <Grid>
          <TextInput
            label="Services eyebrow"
            value={content.services_eyebrow || ""}
            onChange={(event) => set("services_eyebrow", event.target.value)}
          />
          <TextInput
            label="Services title"
            value={content.services_title || ""}
            onChange={(event) => set("services_title", event.target.value)}
          />
        </Grid>
        <div className="mt-5">
          <TextArea
            label="Services intro"
            rows={3}
            value={content.services_intro || ""}
            onChange={(event) => set("services_intro", event.target.value)}
          />
        </div>
      </div>
    </Panel>
  );
}