import { Grid, Panel, TextArea, TextInput } from "./AdminUI";

export default function ContactPanel({ content, set }) {
  return (
    <Panel
      title="Contact & Social"
      description="Everything a visitor can use to reach the studio. Empty fields are hidden automatically."
    >
      <Grid>
        <TextInput
          label="Section eyebrow"
          value={content.contact_eyebrow || ""}
          onChange={(event) => set("contact_eyebrow", event.target.value)}
          placeholder="Enquiries"
        />
        <TextInput
          label="Section title"
          value={content.contact_title || ""}
          onChange={(event) => set("contact_title", event.target.value)}
          placeholder="Let's begin a conversation"
        />
      </Grid>
      <TextArea
        label="Introduction"
        rows={3}
        value={content.contact_intro || ""}
        onChange={(event) => set("contact_intro", event.target.value)}
      />

      <div className="border-t border-ink/10 pt-7">
        <Grid>
          <TextInput
            label="Email"
            type="email"
            value={content.email || ""}
            onChange={(event) => set("email", event.target.value)}
            placeholder="studio@saraintarch.com"
          />
          <TextInput
            label="Phone"
            value={content.phone || ""}
            onChange={(event) => set("phone", event.target.value)}
            placeholder="+31 20 000 0000"
          />
          <TextInput
            label="WhatsApp number"
            value={content.whatsapp || ""}
            onChange={(event) => set("whatsapp", event.target.value)}
            placeholder="+31612345678"
            hint="Digits with country code — a wa.me link is created automatically."
          />
          <TextInput
            label="Instagram URL"
            value={content.instagram || ""}
            onChange={(event) => set("instagram", event.target.value)}
            placeholder="https://instagram.com/saraintarch"
          />
          <TextInput
            label="Instagram handle"
            value={content.instagram_handle || ""}
            onChange={(event) => set("instagram_handle", event.target.value)}
            placeholder="@saraintarch"
          />
          <TextInput
            label="Behance URL"
            value={content.behance || ""}
            onChange={(event) => set("behance", event.target.value)}
            placeholder="https://behance.net/saraintarch"
          />
          <TextInput
            label="LinkedIn URL"
            value={content.linkedin || ""}
            onChange={(event) => set("linkedin", event.target.value)}
            placeholder="https://linkedin.com/in/…"
          />
          <TextInput
            label="Address"
            value={content.address || ""}
            onChange={(event) => set("address", event.target.value)}
            placeholder="Keizersgracht 100"
          />
          <TextInput
            label="City"
            value={content.city || ""}
            onChange={(event) => set("city", event.target.value)}
            placeholder="Amsterdam"
          />
          <TextInput
            label="Country"
            value={content.country || ""}
            onChange={(event) => set("country", event.target.value)}
            placeholder="Netherlands"
          />
        </Grid>
      </div>
    </Panel>
  );
}