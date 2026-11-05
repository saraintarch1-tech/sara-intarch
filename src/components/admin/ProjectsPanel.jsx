import { useState } from "react";
import { Link } from "react-router-dom";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { Loader2, Plus, Star, Trash2, Eye, EyeOff, ArrowUp, ArrowDown } from "lucide-react";
import { Image } from "@/components/ui/image";
import { Panel, Pill } from "./AdminUI";
import { api } from "@/api/platformClient";

const items = (result) => (Array.isArray(result) ? result : result?.items || []);

export default function ProjectsPanel() {
  const queryClient = useQueryClient();
  const [confirmId, setConfirmId] = useState(null);
  const [busyId, setBusyId] = useState(null);

  const { data, isLoading } = useQuery({
    queryKey: ["admin-projects"],
    queryFn: async () =>
      items(await api.entities.Project.filter({}, { sort: "order", limit: 200 })),
  });

  const projects = data || [];

  const refresh = () => {
    queryClient.invalidateQueries({ queryKey: ["admin-projects"] });
    queryClient.invalidateQueries({ queryKey: ["projects"] });
  };

  const patch = async (project, values) => {
    setBusyId(project.id);
    try {
      await api.entities.Project.update(project.id, values);
      refresh();
    } finally {
      setBusyId(null);
    }
  };

  const reorder = async (index, direction) => {
    const target = index + direction;
    if (target < 0 || target >= projects.length) return;
    const next = [...projects];
    [next[index], next[target]] = [next[target], next[index]];
    setBusyId("order");
    try {
      await api.entities.Project.bulkUpdate(
        next.map((project, i) => ({ id: project.id, order: i + 1 }))
      );
      refresh();
    } finally {
      setBusyId(null);
    }
  };

  const remove = async (project) => {
    setBusyId(project.id);
    try {
      await api.entities.Project.delete(project.id);
      setConfirmId(null);
      refresh();
    } finally {
      setBusyId(null);
    }
  };

  return (
    <Panel
      title="Projects"
      description="Unlimited projects. Each one opens its own page with its images, film and concept text."
      actions={
        <Link
          to="/admin/projects/new"
          className="inline-flex items-center gap-2 bg-ink px-5 py-3 caps text-ivory hover:bg-mocha"
        >
          <Plus size={12} /> New project
        </Link>
      }
    >
      {isLoading ? (
        <div className="flex items-center gap-3 text-sm text-stone">
          <Loader2 size={14} className="animate-spin" /> Loading projects
        </div>
      ) : projects.length === 0 ? (
        <div className="border border-dashed border-ink/20 p-10 text-center">
          <p className="font-display text-2xl">No projects yet</p>
          <p className="mt-2 text-sm text-stone">Add the first project to begin the archive.</p>
          <Link
            to="/admin/projects/new"
            className="mt-6 inline-flex items-center gap-2 bg-ink px-6 py-3 caps text-ivory hover:bg-mocha"
          >
            <Plus size={12} /> New project
          </Link>
        </div>
      ) : (
        <div className="space-y-2">
          {projects.map((project, index) => (
            <div
              key={project.id}
              className="flex flex-col gap-4 border border-ink/12 bg-card p-3 sm:flex-row sm:items-center"
            >
              <div className="h-20 w-28 shrink-0 overflow-hidden bg-sand">
                {project.cover_image ? (
                  <Image
                    src={project.cover_image}
                    alt={project.title}
                    className="h-full w-full object-cover"
                  />
                ) : null}
              </div>

              <div className="min-w-0 flex-1">
                <div className="flex flex-wrap items-center gap-2">
                  <Link
                    to={`/admin/projects/${project.id}`}
                    className="link-line truncate font-display text-lg leading-tight"
                  >
                    {project.title}
                  </Link>
                  {project.featured ? <Pill tone="live">Featured</Pill> : null}
                  {project.published === false ? <Pill tone="draft">Hidden</Pill> : null}
                </div>
                <div className="mt-1 truncate text-[12px] text-stone">
                  {[project.category, project.location, project.year].filter(Boolean).join(" · ") ||
                    "No details yet"}
                </div>
              </div>

              <div className="flex flex-wrap items-center gap-1">
                <button
                  type="button"
                  onClick={() => patch(project, { featured: !project.featured })}
                  className={`p-2 ${project.featured ? "text-amber-700" : "text-stone hover:text-ink"}`}
                  aria-label="Toggle featured"
                  title="Featured on the home page"
                >
                  <Star size={14} fill={project.featured ? "currentColor" : "none"} />
                </button>
                <button
                  type="button"
                  onClick={() => patch(project, { published: project.published === false })}
                  className="p-2 text-stone hover:text-ink"
                  aria-label="Toggle visibility"
                  title={project.published === false ? "Publish" : "Hide"}
                >
                  {project.published === false ? <EyeOff size={14} /> : <Eye size={14} />}
                </button>
                <button
                  type="button"
                  onClick={() => reorder(index, -1)}
                  disabled={index === 0}
                  className="p-2 text-stone hover:text-ink disabled:opacity-25"
                  aria-label="Move up"
                >
                  <ArrowUp size={14} />
                </button>
                <button
                  type="button"
                  onClick={() => reorder(index, 1)}
                  disabled={index === projects.length - 1}
                  className="p-2 text-stone hover:text-ink disabled:opacity-25"
                  aria-label="Move down"
                >
                  <ArrowDown size={14} />
                </button>
                <Link
                  to={`/admin/projects/${project.id}`}
                  className="ml-2 border border-ink/20 px-3 py-2 caps text-ink hover:border-ink"
                >
                  Edit
                </Link>
                {confirmId === project.id ? (
                  <button
                    type="button"
                    onClick={() => remove(project)}
                    className="ml-1 bg-destructive px-3 py-2 caps text-ivory"
                  >
                    {busyId === project.id ? "Deleting" : "Confirm"}
                  </button>
                ) : (
                  <button
                    type="button"
                    onClick={() => setConfirmId(project.id)}
                    className="p-2 text-stone hover:text-destructive"
                    aria-label="Delete project"
                  >
                    <Trash2 size={14} />
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </Panel>
  );
}