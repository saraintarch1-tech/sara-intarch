import { useEffect, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { useQueryClient } from "@tanstack/react-query";
import { ArrowLeft, CopyPlus, Loader2, Plus, Trash2 } from "lucide-react";
import AdminGate from "@/components/admin/AdminGate";
import {
  Field,
  Grid,
  ImageUpload,
  Panel,
  TextArea,
  TextInput,
  ToggleRow,
  inputClass,
} from "@/components/admin/AdminUI";
import GalleryEditor from "@/components/admin/GalleryEditor";
import { api } from "@/api/platformClient";
import { slugify, useSiteContent } from "@/hooks/useSite";

const EMPTY = {
  title: "",
  slug: "",
  category: "",
  location: "",
  year: "",
  area: "",
  client: "",
  status: "",
  tagline: "",
  summary: "",
  concept: "",
  specifications: [],
  cover_image: "",
  hero_image: "",
  gallery: [],
  videos: [],
  featured: false,
  published: true,
  order: 0,
};

function Editor() {
  const { content } = useSiteContent();
  const { id } = useParams();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const isNew = !id || id === "new";

  const [form, setForm] = useState(EMPTY);
  const [loading, setLoading] = useState(!isNew);
  const [busy, setBusy] = useState("");
  const [error, setError] = useState("");
  const [confirming, setConfirming] = useState(false);

  useEffect(() => {
    if (isNew) return;
    let alive = true;
    api.entities.Project.get(id)
      .then((record) => alive && setForm({ ...EMPTY, ...record }))
      .catch(() => alive && setError("That project could not be loaded."))
      .finally(() => alive && setLoading(false));
    return () => {
      alive = false;
    };
  }, [id, isNew]);

  const set = (key, value) => setForm((prev) => ({ ...prev, [key]: value }));

  const onTitle = (value) =>
    setForm((prev) => ({
      ...prev,
      title: value,
      slug: prev.slug && prev.slug !== slugify(prev.title) ? prev.slug : slugify(value),
    }));

  const save = async (event) => {
    event?.preventDefault();
    if (!form.title.trim()) {
      setError("Give the project a title before saving.");
      return;
    }
    setBusy("save");
    setError("");
    try {
      const payload = { ...form };
      ["id", "created_date", "updated_date", "created_by", "created_by_id"].forEach(
        (key) => delete payload[key]
      );
      payload.title = form.title.trim();
      payload.slug = (form.slug || slugify(form.title)).trim();
      payload.order = Number(form.order) || 0;
      payload.specifications = (form.specifications || []).filter(
        (spec) => spec.label || spec.value
      );
      payload.gallery = (form.gallery || []).filter(Boolean);
      payload.videos = (form.videos || []).filter((video) => video.url);

      if (isNew) {
        await api.entities.Project.create(payload);
      } else {
        await api.entities.Project.update(id, payload);
      }
      queryClient.invalidateQueries({ queryKey: ["projects"] });
      queryClient.invalidateQueries({ queryKey: ["admin-projects"] });
      navigate("/admin");
    } catch (err) {
      setError("The project could not be saved. Please try again.");
    } finally {
      setBusy("");
    }
  };

  const duplicate = async () => {
    if (!form.title.trim()) {
      setError("Give the project a title before duplicating it.");
      return;
    }
    setBusy("duplicate");
    setError("");
    try {
      const payload = { ...form };
      ["id", "created_date", "updated_date", "created_by", "created_by_id"].forEach(
        (key) => delete payload[key]
      );
      const base = form.slug || slugify(form.title);
      let slug = `${base}-copy`;
      const taken = await api.entities.Project.filter({ slug });
      if ((Array.isArray(taken) ? taken : taken?.items || []).length) {
        slug = `${base}-copy-${Date.now().toString().slice(-4)}`;
      }
      payload.title = `${form.title} copy`;
      payload.slug = slug;
      payload.published = false;
      payload.featured = false;
      const created = await api.entities.Project.create(payload);
      queryClient.invalidateQueries({ queryKey: ["admin-projects"] });
      navigate(`/admin/projects/${created.id}`);
    } catch (err) {
      setError("The project could not be duplicated.");
    } finally {
      setBusy("");
    }
  };

  const remove = async () => {
    setBusy("delete");
    try {
      await api.entities.Project.delete(id);
      queryClient.invalidateQueries({ queryKey: ["projects"] });
      queryClient.invalidateQueries({ queryKey: ["admin-projects"] });
      navigate("/admin");
    } catch (err) {
      setError("The project could not be deleted.");
      setBusy("");
    }
  };

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background">
        <Loader2 size={18} className="animate-spin text-stone" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background pb-24">
      <header className="sticky top-0 z-40 border-b border-ink/12 bg-background/95 backdrop-blur">
        <div className="mx-auto flex max-w-[1400px] flex-wrap items-center justify-between gap-3 px-5 py-3 md:px-8">
          <Link to="/admin" className="inline-flex items-center gap-2 caps text-stone hover:text-ink">
            <ArrowLeft size={12} /> Projects
          </Link>
          <div className="flex items-center gap-2">
            {!isNew ? (
              <button
                type="button"
                onClick={duplicate}
                disabled={busy === "duplicate"}
                className="inline-flex items-center gap-2 border border-ink/20 px-4 py-2.5 caps text-ink hover:border-ink disabled:opacity-50"
              >
                <CopyPlus size={12} /> Duplicate
              </button>
            ) : null}
            {!isNew ? (
              <a
                href={`/work/${form.slug || slugify(form.title)}`}
                target="_blank"
                rel="noreferrer"
                className="border border-ink/20 px-4 py-2.5 caps text-ink hover:border-ink"
              >
                View live
              </a>
            ) : null}
            <button
              type="button"
              onClick={save}
              disabled={busy === "save"}
              className="inline-flex items-center gap-2 bg-ink px-5 py-2.5 caps text-ivory hover:bg-mocha disabled:opacity-60"
            >
              {busy === "save" ? <Loader2 size={12} className="animate-spin" /> : null}
              {busy === "save" ? "Saving" : "Save project"}
            </button>
          </div>
        </div>
      </header>

      <form onSubmit={save} className="mx-auto max-w-[1400px] px-5 py-10 md:px-8">
        <div className="caps text-stone">{isNew ? "New project" : "Editing project"}</div>
        <h1 className="mt-3 font-display text-[clamp(1.9rem,4vw,2.9rem)] leading-none">
          {form.title || "Untitled project"}
        </h1>

        {error ? (
          <p className="mt-6 border border-destructive/30 bg-destructive/5 px-4 py-3 text-sm text-destructive">
            {error}
          </p>
        ) : null}

        <div className="mt-10 grid gap-10 lg:grid-cols-12">
          <div className="space-y-10 lg:col-span-8">
            <Panel title="Project details">
              <Grid>
                <TextInput
                  label="Title"
                  value={form.title}
                  onChange={(event) => onTitle(event.target.value)}
                  placeholder="Villa Ambra"
                />
                <TextInput
                  label="Web address"
                  value={form.slug}
                  onChange={(event) => set("slug", event.target.value)}
                  placeholder="villa-ambra"
                  hint="Appears as /work/your-slug"
                />
                <div>
                  <TextInput
                    label="Type"
                    value={form.category}
                    onChange={(event) => set("category", event.target.value)}
                    placeholder="Residential"
                    hint="e.g. Residential, Hospitality, Retail, Workplace."
                    list="project-types"
                  />
                  <datalist id="project-types">
                    {(content.categories || []).map((type) => (
                      <option key={type} value={type} />
                    ))}
                  </datalist>
                </div>
                <TextInput
                  label="Location"
                  value={form.location}
                  onChange={(event) => set("location", event.target.value)}
                  placeholder="Amsterdam, Netherlands"
                />
                <TextInput
                  label="Year"
                  value={form.year}
                  onChange={(event) => set("year", event.target.value)}
                  placeholder="2025"
                />
                <TextInput
                  label="Area"
                  value={form.area}
                  onChange={(event) => set("area", event.target.value)}
                  placeholder="240 m²"
                />
                <TextInput
                  label="Client"
                  value={form.client}
                  onChange={(event) => set("client", event.target.value)}
                  placeholder="Private"
                />
                <TextInput
                  label="Status"
                  value={form.status}
                  onChange={(event) => set("status", event.target.value)}
                  placeholder="Completed"
                />
              </Grid>
            </Panel>

            <Panel title="Concept & story">
              <TextInput
                label="Pull line"
                value={form.tagline}
                onChange={(event) => set("tagline", event.target.value)}
                placeholder="A travertine interior that follows the light."
              />
              <TextArea
                label="Short summary"
                rows={3}
                value={form.summary}
                onChange={(event) => set("summary", event.target.value)}
                hint="Used under the title in search results and sharing cards."
              />
              <TextArea
                label="Concept & design description"
                rows={10}
                value={form.concept}
                onChange={(event) => set("concept", event.target.value)}
                hint="Separate paragraphs with a blank line."
              />
            </Panel>

            <Panel title="Imagery">
              <div className="grid gap-6 sm:grid-cols-2">
                <ImageUpload
                  label="Cover image"
                  value={form.cover_image}
                  onChange={(value) => set("cover_image", value)}
                  aspect="aspect-[4/5]"
                  hint="Used in the project grids."
                />
                <ImageUpload
                  label="Hero image"
                  value={form.hero_image}
                  onChange={(value) => set("hero_image", value)}
                  aspect="aspect-[16/9]"
                  hint="Full-width image at the top of the project page."
                />
              </div>
              <GalleryEditor
                label="Gallery images"
                value={form.gallery || []}
                onChange={(value) => set("gallery", value)}
                onSetCover={(src) => set("cover_image", src)}
                hint="Upload as many as you like — the first and every fourth image display full width."
              />
            </Panel>

            <Panel title="Film">
              {(form.videos || []).map((video, index) => (
                <div key={index} className="border border-ink/12 bg-card p-4">
                  <div className="flex items-start justify-between gap-4">
                    <span className="caps text-stone">Video {index + 1}</span>
                    <button
                      type="button"
                      onClick={() =>
                        set(
                          "videos",
                          form.videos.filter((_, i) => i !== index)
                        )
                      }
                      className="p-1 text-stone hover:text-destructive"
                      aria-label="Remove video"
                    >
                      <Trash2 size={13} />
                    </button>
                  </div>
                  <div className="mt-3 space-y-4">
                    <TextInput
                      label="Title"
                      value={video.title || ""}
                      onChange={(event) =>
                        set(
                          "videos",
                          form.videos.map((item, i) =>
                            i === index ? { ...item, title: event.target.value } : item
                          )
                        )
                      }
                      placeholder="Walkthrough film"
                    />
                    <TextInput
                      label="Video URL"
                      value={video.url || ""}
                      onChange={(event) =>
                        set(
                          "videos",
                          form.videos.map((item, i) =>
                            i === index ? { ...item, url: event.target.value } : item
                          )
                        )
                      }
                      placeholder="https://youtube.com/watch?v=… or a direct .mp4"
                    />
                    <ImageUpload
                      label="Poster (optional)"
                      value={video.poster}
                      onChange={(value) =>
                        set(
                          "videos",
                          form.videos.map((item, i) =>
                            i === index ? { ...item, poster: value } : item
                          )
                        )
                      }
                      aspect="aspect-video"
                    />
                  </div>
                </div>
              ))}
              <button
                type="button"
                onClick={() => set("videos", [...(form.videos || []), { title: "", url: "" }])}
                className="inline-flex w-full items-center justify-center gap-2 border border-dashed border-ink/25 py-3 caps text-ink-soft hover:border-ink hover:text-ink"
              >
                <Plus size={12} /> Add video
              </button>
            </Panel>

            <Panel title="Specifications">
              {(form.specifications || []).map((spec, index) => (
                <div key={index} className="flex items-end gap-3">
                  <div className="flex-1">
                    <Field label="Label">
                      <input
                        value={spec.label || ""}
                        onChange={(event) =>
                          set(
                            "specifications",
                            form.specifications.map((item, i) =>
                              i === index ? { ...item, label: event.target.value } : item
                            )
                          )
                        }
                        className={inputClass}
                        placeholder="Material"
                      />
                    </Field>
                  </div>
                  <div className="flex-1">
                    <Field label="Value">
                      <input
                        value={spec.value || ""}
                        onChange={(event) =>
                          set(
                            "specifications",
                            form.specifications.map((item, i) =>
                              i === index ? { ...item, value: event.target.value } : item
                            )
                          )
                        }
                        className={inputClass}
                        placeholder="Travertine, oak, linen"
                      />
                    </Field>
                  </div>
                  <button
                    type="button"
                    onClick={() =>
                      set(
                        "specifications",
                        form.specifications.filter((_, i) => i !== index)
                      )
                    }
                    className="mb-2 p-2 text-stone hover:text-destructive"
                    aria-label="Remove specification"
                  >
                    <Trash2 size={13} />
                  </button>
                </div>
              ))}
              <button
                type="button"
                onClick={() => set("specifications", [...(form.specifications || []), { label: "", value: "" }])}
                className="inline-flex w-full items-center justify-center gap-2 border border-dashed border-ink/25 py-3 caps text-ink-soft hover:border-ink hover:text-ink"
              >
                <Plus size={12} /> Add specification
              </button>
            </Panel>
          </div>

          <aside className="lg:col-span-4">
            <div className="space-y-4 lg:sticky lg:top-24">
              <ToggleRow
                label="Featured"
                description="Shown on the home page"
                checked={form.featured}
                onChange={(checked) => set("featured", checked)}
              />
              <ToggleRow
                label="Published"
                description="Visible on the site"
                checked={form.published !== false}
                onChange={(checked) => set("published", checked)}
              />
              <TextInput
                label="Sort order"
                type="number"
                value={form.order}
                onChange={(event) => set("order", event.target.value)}
                hint="Lower numbers appear first."
              />

              <button
                type="submit"
                disabled={busy === "save"}
                className="inline-flex w-full items-center justify-center gap-2 bg-ink px-5 py-3 caps text-ivory hover:bg-mocha disabled:opacity-60"
              >
                {busy === "save" ? <Loader2 size={12} className="animate-spin" /> : null}
                Save project
              </button>

              {!isNew ? (
                confirming ? (
                  <div className="border border-destructive/30 bg-destructive/5 p-3">
                    <p className="text-[12px] text-destructive">Delete this project permanently?</p>
                    <div className="mt-3 flex gap-2">
                      <button
                        type="button"
                        onClick={remove}
                        disabled={busy === "delete"}
                        className="flex-1 bg-destructive px-3 py-2 caps text-ivory"
                      >
                        {busy === "delete" ? "Deleting" : "Delete"}
                      </button>
                      <button
                        type="button"
                        onClick={() => setConfirming(false)}
                        className="flex-1 border border-ink/20 px-3 py-2 caps text-ink"
                      >
                        Cancel
                      </button>
                    </div>
                  </div>
                ) : (
                  <button
                    type="button"
                    onClick={() => setConfirming(true)}
                    className="inline-flex w-full items-center justify-center gap-2 border border-ink/15 px-5 py-3 caps text-stone hover:border-destructive hover:text-destructive"
                  >
                    <Trash2 size={12} /> Delete project
                  </button>
                )
              ) : null}
            </div>
          </aside>
        </div>
      </form>
    </div>
  );
}

export default function AdminProject() {
  return (
    <AdminGate>
      <Editor />
    </AdminGate>
  );
}