import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { Eye, Loader2, LogOut, RotateCcw, Save } from "lucide-react";
import { Monogram } from "@/components/brand/Logo";
import AdminGate from "@/components/admin/AdminGate";
import BrandPanel from "@/components/admin/BrandPanel";
import HomePanel from "@/components/admin/HomePanel";
import ProjectsPanel from "@/components/admin/ProjectsPanel";
import ServicesPanel from "@/components/admin/ServicesPanel";
import AboutPanel from "@/components/admin/AboutPanel";
import ContactPanel from "@/components/admin/ContactPanel";
import StructurePanel from "@/components/admin/StructurePanel";
import SeoPanel from "@/components/admin/SeoPanel";
import MessagesPanel from "@/components/admin/MessagesPanel";
import MediaPanel from "@/components/admin/MediaPanel";
import WatermarkPanel from "@/components/admin/WatermarkPanel";
import OverviewPanel from "@/components/admin/OverviewPanel";
import { EMPTY_CONTENT } from "@/hooks/useSite";
import { api } from "@/api/platformClient";

const items = (result) => (Array.isArray(result) ? result : result?.items || []);

const TABS = [
  { key: "overview", label: "Overview" },
  { key: "identity", label: "Identity" },
  { key: "home", label: "Home & Hero" },
  { key: "projects", label: "Projects" },
  { key: "services", label: "Services" },
  { key: "about", label: "About" },
  { key: "contact", label: "Contact" },
  { key: "structure", label: "Structure" },
  { key: "seo", label: "SEO" },
  { key: "media", label: "Media" },
  { key: "watermark", label: "Watermark" },
  { key: "messages", label: "Enquiries" },
];

const META_KEYS = ["id", "created_date", "updated_date", "created_by_id", "created_by"];

const clean = (form) => {
  const payload = { ...form };
  META_KEYS.forEach((key) => delete payload[key]);
  return payload;
};

function Dashboard() {
  const queryClient = useQueryClient();
  const [tab, setTab] = useState("overview");
  const [form, setForm] = useState(null);
  const [baseline, setBaseline] = useState("");
  const [busy, setBusy] = useState("");
  const [note, setNote] = useState("");

  const { data, isLoading } = useQuery({
    queryKey: ["admin-content"],
    queryFn: async () => {
      const [contentRes, draftRes] = await Promise.all([
        api.entities.SiteContent.list({ sort: "-created_date", limit: 1 }),
        api.entities.SiteDraft.list({ sort: "-updated_date", limit: 1 }),
      ]);
      return { record: items(contentRes)[0] || null, draft: items(draftRes)[0] || null };
    },
  });

  const { data: newCount } = useQuery({
    queryKey: ["admin-new-count"],
    queryFn: () => api.entities.ContactMessage.count({ status: "new" }),
  });

  useEffect(() => {
    if (!data || form) return;
    const base = { ...EMPTY_CONTENT, ...(data.record || {}) };
    const merged = data.draft?.payload ? { ...base, ...data.draft.payload } : base;
    setForm(merged);
    setBaseline(JSON.stringify(merged));
  }, [data, form]);

  const set = (key, value) => setForm((prev) => ({ ...prev, [key]: value }));

  const dirty = form ? JSON.stringify(form) !== baseline : false;
  const hasDraft = Boolean(data?.draft);

  const saveDraft = async () => {
    setBusy("draft");
    setNote("");
    try {
      const payload = clean(form);
      if (data?.draft?.id) {
        await api.entities.SiteDraft.update(data.draft.id, { payload });
      } else {
        await api.entities.SiteDraft.create({ payload });
      }
      setBaseline(JSON.stringify(form));
      queryClient.invalidateQueries({ queryKey: ["admin-content"] });
      setNote("Draft saved. The live site is unchanged until you publish.");
    } catch (error) {
      setNote("The draft could not be saved. Please try again.");
    } finally {
      setBusy("");
    }
  };

  const publish = async () => {
    setBusy("publish");
    setNote("");
    try {
      const payload = clean(form);
      if (data?.record?.id) {
        await api.entities.SiteContent.update(data.record.id, payload);
      } else {
        await api.entities.SiteContent.create(payload);
      }
      if (data?.draft?.id) {
        await api.entities.SiteDraft.delete(data.draft.id);
      }
      setBaseline(JSON.stringify(form));
      queryClient.invalidateQueries({ queryKey: ["admin-content"] });
      queryClient.invalidateQueries({ queryKey: ["site-content"] });
      setNote("Published. Your changes are now live on the site.");
    } catch (error) {
      setNote("Publishing failed. Please try again.");
    } finally {
      setBusy("");
    }
  };

  const discard = async () => {
    setBusy("discard");
    try {
      if (data?.draft?.id) await api.entities.SiteDraft.delete(data.draft.id);
      const base = { ...EMPTY_CONTENT, ...(data?.record || {}) };
      setForm(base);
      setBaseline(JSON.stringify(base));
      queryClient.invalidateQueries({ queryKey: ["admin-content"] });
      setNote("Draft discarded.");
    } finally {
      setBusy("");
    }
  };

  if (isLoading || !form) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background">
        <Loader2 size={18} className="animate-spin text-stone" />
      </div>
    );
  }

  const panels = {
    overview: <OverviewPanel onNavigate={setTab} />,
    identity: <BrandPanel content={form} set={set} />,
    home: <HomePanel content={form} set={set} />,
    projects: <ProjectsPanel />,
    services: <ServicesPanel />,
    about: <AboutPanel content={form} set={set} />,
    contact: <ContactPanel content={form} set={set} />,
    structure: <StructurePanel content={form} set={set} />,
    seo: <SeoPanel content={form} set={set} />,
    media: <MediaPanel />,
    watermark: <WatermarkPanel content={form} />,
    messages: <MessagesPanel />,
  };

  return (
    <div className="min-h-screen bg-background pb-24">
      <header className="sticky top-0 z-40 border-b border-ink/12 bg-background/95 backdrop-blur">
        <div className="mx-auto flex max-w-[1500px] flex-wrap items-center justify-between gap-3 px-5 py-3 md:px-8">
          <div className="flex items-center gap-3">
            <Monogram className="h-8 w-8 text-ink" />
            <div>
              <div className="text-sm leading-none">{form.brand_name || "SARA INTARCH"}</div>
              <div className="caps mt-1 text-stone">Studio dashboard</div>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <Link
              to="/?preview=1"
              target="_blank"
              className="inline-flex items-center gap-2 border border-ink/20 px-4 py-2.5 caps text-ink hover:border-ink"
            >
              <Eye size={12} /> Preview draft
            </Link>
            <button
              type="button"
              onClick={saveDraft}
              disabled={busy === "draft" || !dirty}
              className="inline-flex items-center gap-2 border border-ink/20 px-4 py-2.5 caps text-ink hover:border-ink disabled:opacity-40"
            >
              {busy === "draft" ? <Loader2 size={12} className="animate-spin" /> : <Save size={12} />}
              Save draft
            </button>
            <button
              type="button"
              onClick={publish}
              disabled={busy === "publish"}
              className="inline-flex items-center gap-2 bg-ink px-5 py-2.5 caps text-ivory hover:bg-mocha disabled:opacity-60"
            >
              {busy === "publish" ? <Loader2 size={12} className="animate-spin" /> : null}
              Publish changes
            </button>
            <button
              type="button"
              onClick={() => api.auth.logout("/")}
              className="p-2.5 text-stone hover:text-ink"
              aria-label="Sign out"
            >
              <LogOut size={14} />
            </button>
          </div>
        </div>
      </header>

      {(dirty || hasDraft || note) && (
        <div className="border-b border-ink/10 bg-sand/60">
          <div className="mx-auto flex max-w-[1500px] flex-wrap items-center justify-between gap-3 px-5 py-2.5 md:px-8">
            <p className="text-[12px] text-ink-soft">
              {note || (hasDraft ? "You have unpublished changes." : "Unsaved edits on this page.")}
            </p>
            {hasDraft ? (
              <button
                type="button"
                onClick={discard}
                disabled={busy === "discard"}
                className="inline-flex items-center gap-2 caps text-stone hover:text-ink"
              >
                <RotateCcw size={11} /> Discard draft
              </button>
            ) : null}
          </div>
        </div>
      )}

      <div className="mx-auto grid max-w-[1500px] gap-10 px-5 py-8 md:px-8 lg:grid-cols-[210px_1fr]">
        <nav className="lg:sticky lg:top-24 lg:self-start">
          <div className="no-scrollbar flex gap-1 overflow-x-auto lg:flex-col">
            {TABS.map((item) => (
              <button
                key={item.key}
                type="button"
                onClick={() => setTab(item.key)}
                className={`shrink-0 px-3 py-2.5 text-left text-[13px] transition-colors ${
                  tab === item.key
                    ? "bg-ink text-ivory"
                    : "text-ink-soft hover:bg-sand/70 hover:text-ink"
                }`}
              >
                <span className="flex items-center gap-2">
                  {item.label}
                  {item.key === "messages" && newCount > 0 ? (
                    <span
                      className={`inline-flex h-4 min-w-4 items-center justify-center px-1 text-[10px] ${
                        tab === item.key ? "bg-ivory text-ink" : "bg-ink text-ivory"
                      }`}
                    >
                      {newCount}
                    </span>
                  ) : null}
                </span>
              </button>
            ))}
          </div>
          <div className="mt-6 hidden border-t border-ink/10 pt-5 lg:block">
            <Link to="/" className="caps text-stone hover:text-ink">
              View live site
            </Link>
          </div>
        </nav>

        <div className="min-w-0">{panels[tab]}</div>
      </div>
    </div>
  );
}

export default function Admin() {
  return (
    <AdminGate>
      <Dashboard />
    </AdminGate>
  );
}