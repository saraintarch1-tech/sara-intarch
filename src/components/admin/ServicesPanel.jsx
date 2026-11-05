import { useEffect, useState } from "react";
import { Loader2, Plus, Save } from "lucide-react";
import { Panel, RowActions, RowCard, inputClass } from "./AdminUI";
import { api } from "@/api/platformClient";

const items = (result) => (Array.isArray(result) ? result : result?.items || []);

const blank = () => ({ title: "", description: "", published: true, _new: true });

export default function ServicesPanel() {
  const [rows, setRows] = useState([]);
  const [removed, setRemoved] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [status, setStatus] = useState("");

  useEffect(() => {
    let alive = true;
    api.entities.Service.list({ sort: "order", limit: 100 })
      .then((result) => alive && setRows(items(result)))
      .finally(() => alive && setLoading(false));
    return () => {
      alive = false;
    };
  }, []);

  const update = (index, patch) =>
    setRows((prev) => prev.map((row, i) => (i === index ? { ...row, ...patch } : row)));

  const move = (index, direction) => {
    setRows((prev) => {
      const next = [...prev];
      const target = index + direction;
      if (target < 0 || target >= next.length) return prev;
      [next[index], next[target]] = [next[target], next[index]];
      return next;
    });
  };

  const save = async () => {
    setSaving(true);
    setStatus("");
    try {
      const existing = rows.filter((row) => row.id);
      if (existing.length) {
        await api.entities.Service.bulkUpdate(
          existing.map((row, i) => ({
            id: row.id,
            title: row.title,
            description: row.description,
            published: row.published !== false,
            order: rows.findIndex((item) => item === row),
          }))
        );
      }
      const created = rows.filter((row) => !row.id && row.title.trim());
      if (created.length) {
        await api.entities.Service.bulkCreate(
          created.map((row) => ({
            title: row.title,
            description: row.description,
            published: row.published !== false,
            order: rows.findIndex((item) => item === row),
          }))
        );
      }
      if (removed.length) {
        await api.entities.Service.deleteMany({ id: { $in: removed } });
      }
      const refreshed = items(await api.entities.Service.list({ sort: "order", limit: 100 }));
      setRows(refreshed);
      setRemoved([]);
      setStatus("Saved");
    } catch (error) {
      setStatus("Could not save. Please try again.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <Panel
      title="Services"
      description="The list shown on the home page. Reorder, hide or delete freely."
      actions={
        <button
          type="button"
          onClick={save}
          disabled={saving}
          className="inline-flex items-center gap-2 bg-ink px-5 py-3 caps text-ivory hover:bg-mocha disabled:opacity-60"
        >
          {saving ? <Loader2 size={12} className="animate-spin" /> : <Save size={12} />}
          {saving ? "Saving" : "Save services"}
        </button>
      }
    >
      {loading ? (
        <div className="flex items-center gap-3 text-sm text-stone">
          <Loader2 size={14} className="animate-spin" /> Loading services
        </div>
      ) : (
        <div className="space-y-3">
          {rows.map((row, index) => (
            <RowCard key={row.id || `new-${index}`}>
              <div className="flex items-start gap-3">
                <span className="caps pt-2 text-stone">{String(index + 1).padStart(2, "0")}</span>
                <div className="flex-1 space-y-3">
                  <input
                    value={row.title || ""}
                    onChange={(event) => update(index, { title: event.target.value })}
                    className={inputClass}
                    placeholder="Service title"
                  />
                  <textarea
                    value={row.description || ""}
                    onChange={(event) => update(index, { description: event.target.value })}
                    rows={2}
                    className={`${inputClass} resize-y`}
                    placeholder="One or two sentences describing the service."
                  />
                  <label className="flex items-center gap-2 text-[11px] text-stone">
                    <input
                      type="checkbox"
                      checked={row.published !== false}
                      onChange={(event) => update(index, { published: event.target.checked })}
                    />
                    Visible on the site
                  </label>
                </div>
                <RowActions
                  index={index}
                  total={rows.length}
                  onMove={(direction) => move(index, direction)}
                  onDelete={() => {
                    if (row.id) setRemoved((prev) => [...prev, row.id]);
                    setRows((prev) => prev.filter((_, i) => i !== index));
                  }}
                />
              </div>
            </RowCard>
          ))}

          <button
            type="button"
            onClick={() => setRows((prev) => [...prev, blank()])}
            className="inline-flex w-full items-center justify-center gap-2 border border-dashed border-ink/25 py-3 caps text-ink-soft hover:border-ink hover:text-ink"
          >
            <Plus size={12} /> Add service
          </button>

          {status ? (
            <p className="text-[11px] text-stone">
              {status} — services are live immediately and are saved separately from the page draft.
            </p>
          ) : null}
        </div>
      )}
    </Panel>
  );
}