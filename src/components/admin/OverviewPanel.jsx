import { useQuery } from "@tanstack/react-query";
import { ArrowRight, Loader2 } from "lucide-react";
import { Panel, Pill } from "./AdminUI";
import { api } from "@/api/platformClient";

const items = (result) => (Array.isArray(result) ? result : result?.items || []);

const formatDate = (value) => {
  if (!value) return "";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "";
  return date.toLocaleDateString(undefined, { day: "numeric", month: "short", year: "numeric" });
};

function Stat({ label, value, hint, onClick }) {
  const content = (
    <>
      <div className="font-display text-[2.4rem] leading-none">{value}</div>
      <div className="mt-2 caps text-stone">{label}</div>
      {hint ? <div className="mt-1 text-[11px] text-stone">{hint}</div> : null}
    </>
  );

  if (!onClick) {
    return <div className="border border-ink/12 bg-card p-5">{content}</div>;
  }
  return (
    <button
      type="button"
      onClick={onClick}
      className="border border-ink/12 bg-card p-5 text-left transition-colors hover:border-ink"
    >
      {content}
    </button>
  );
}

export default function OverviewPanel({ onNavigate }) {
  const { data, isLoading } = useQuery({
    queryKey: ["admin-overview"],
    queryFn: async () => {
      const [projectsRes, servicesRes, mediaCount, messagesRes] = await Promise.all([
        api.entities.Project.filter({}, { sort: "-updated_date", limit: 200 }),
        api.entities.Service.list({ sort: "order", limit: 100 }),
        api.entities.MediaAsset.count({}),
        api.entities.ContactMessage.list({ sort: "-created_date", limit: 8 }),
      ]);
      return {
        projects: items(projectsRes),
        services: items(servicesRes),
        media: mediaCount,
        messages: items(messagesRes),
      };
    },
  });

  if (isLoading || !data) {
    return (
      <Panel title="Overview">
        <div className="flex items-center gap-3 text-sm text-stone">
          <Loader2 size={14} className="animate-spin" /> Gathering the numbers
        </div>
      </Panel>
    );
  }

  const published = data.projects.filter((project) => project.published !== false);
  const drafts = data.projects.filter((project) => project.published === false);
  const featured = data.projects.filter((project) => project.featured);
  const newEnquiries = data.messages.filter((message) => message.status === "new");

  const activity = [
    ...data.projects.slice(0, 5).map((project) => ({
      id: `p-${project.id}`,
      title: project.title,
      kind: project.published === false ? "Draft project" : "Project updated",
      date: project.updated_date || project.created_date,
    })),
    ...data.messages.slice(0, 5).map((message) => ({
      id: `m-${message.id}`,
      title: message.name,
      kind: "Enquiry received",
      date: message.created_date,
    })),
  ]
    .sort((a, b) => new Date(b.date || 0) - new Date(a.date || 0))
    .slice(0, 8);

  return (
    <Panel
      title="Overview"
      description="Everything on the site, at a glance."
      actions={
        <button
          type="button"
          onClick={() => onNavigate?.("projects")}
          className="inline-flex items-center gap-2 bg-ink px-5 py-3 caps text-ivory hover:bg-mocha"
        >
          Manage projects <ArrowRight size={12} />
        </button>
      }
    >
      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
        <Stat
          label="Total projects"
          value={data.projects.length}
          hint={`${featured.length} featured on the home page`}
          onClick={() => onNavigate?.("projects")}
        />
        <Stat
          label="Published"
          value={published.length}
          hint="Visible to visitors"
          onClick={() => onNavigate?.("projects")}
        />
        <Stat
          label="Drafts"
          value={drafts.length}
          hint="Hidden from the public site"
          onClick={() => onNavigate?.("projects")}
        />
        <Stat
          label="Media files"
          value={data.media}
          hint="Images and films in the library"
          onClick={() => onNavigate?.("media")}
        />
        <Stat
          label="Services"
          value={data.services.length}
          hint="Listed on the home page"
          onClick={() => onNavigate?.("services")}
        />
        <Stat
          label="New enquiries"
          value={newEnquiries.length}
          hint={`${data.messages.length} recent messages`}
          onClick={() => onNavigate?.("messages")}
        />
      </div>

      <div className="border-t border-ink/10 pt-7">
        <div className="flex items-center justify-between">
          <div className="caps text-stone">Recent activity</div>
          <button
            type="button"
            onClick={() => onNavigate?.("messages")}
            className="caps text-ink-soft hover:text-ink"
          >
            Open inbox
          </button>
        </div>
        <div className="mt-4 space-y-2">
          {activity.length === 0 ? (
            <p className="text-[13px] text-stone">No activity yet.</p>
          ) : (
            activity.map((entry) => (
              <div
                key={entry.id}
                className="flex flex-wrap items-center justify-between gap-3 border border-ink/12 bg-card px-4 py-3"
              >
                <div className="min-w-0">
                  <div className="truncate text-sm">{entry.title}</div>
                  <div className="caps mt-1 text-stone">{entry.kind}</div>
                </div>
                <div className="flex items-center gap-3">
                  <span className="text-[11px] text-stone">{formatDate(entry.date)}</span>
                  {entry.kind === "Draft project" ? <Pill tone="draft">Hidden</Pill> : null}
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </Panel>
  );
}