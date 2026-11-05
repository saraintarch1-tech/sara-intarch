import { ArrowDown, ArrowUp, Eye, EyeOff, Plus, Trash2 } from "lucide-react";
import { Panel, RowCard, inputClass } from "./AdminUI";
import CategoriesEditor from "./CategoriesEditor";
import { DEFAULT_SECTIONS, SECTION_LABELS } from "@/lib/theme";

const swap = (list, index, direction) => {
  const next = [...list];
  const target = index + direction;
  if (target < 0 || target >= next.length) return next;
  [next[index], next[target]] = [next[target], next[index]];
  return next;
};

export default function StructurePanel({ content, set }) {
  const nav = content.nav_items || [];
  const sections = [...(content.sections?.length ? content.sections : DEFAULT_SECTIONS)].sort(
    (a, b) => (a.order || 0) - (b.order || 0)
  );

  const updateNav = (index, patch) => {
    const next = nav.map((item, i) => (i === index ? { ...item, ...patch } : item));
    set("nav_items", next);
  };

  const updateSections = (next) =>
    set(
      "sections",
      next.map((section, i) => ({ ...section, order: i + 1 }))
    );

  return (
    <Panel
      title="Structure"
      description="Choose the order of the menu, and which sections appear on the home page."
    >
      <div>
        <div className="flex items-center justify-between">
          <div className="caps text-stone">Menu items</div>
          <button
            type="button"
            onClick={() =>
              set("nav_items", [...nav, { label: "New link", path: "/", visible: true }])
            }
            className="inline-flex items-center gap-2 caps text-ink-soft hover:text-ink"
          >
            <Plus size={12} /> Add link
          </button>
        </div>
        <p className="mt-1 text-[11px] text-stone">
          Use /work, /contact, or /#services to jump to a section on the home page.
        </p>

        <div className="mt-4 space-y-3">
          {nav.map((item, index) => (
            <RowCard key={`${item.path}-${index}`}>
              <div className="flex flex-col gap-3 sm:flex-row sm:items-end">
                <div className="flex-1">
                  <input
                    value={item.label || ""}
                    onChange={(event) => updateNav(index, { label: event.target.value })}
                    className={inputClass}
                    placeholder="Label"
                  />
                </div>
                <div className="flex-1">
                  <input
                    value={item.path || ""}
                    onChange={(event) => updateNav(index, { path: event.target.value })}
                    className={inputClass}
                    placeholder="/work"
                  />
                </div>
                <div className="flex items-center gap-1 pb-1">
                  <button
                    type="button"
                    onClick={() => updateNav(index, { visible: item.visible === false })}
                    className="p-2 text-stone hover:text-ink"
                    aria-label="Toggle visibility"
                  >
                    {item.visible === false ? <EyeOff size={14} /> : <Eye size={14} />}
                  </button>
                  <button
                    type="button"
                    onClick={() => set("nav_items", swap(nav, index, -1))}
                    disabled={index === 0}
                    className="p-2 text-stone hover:text-ink disabled:opacity-25"
                    aria-label="Move up"
                  >
                    <ArrowUp size={14} />
                  </button>
                  <button
                    type="button"
                    onClick={() => set("nav_items", swap(nav, index, 1))}
                    disabled={index === nav.length - 1}
                    className="p-2 text-stone hover:text-ink disabled:opacity-25"
                    aria-label="Move down"
                  >
                    <ArrowDown size={14} />
                  </button>
                  <button
                    type="button"
                    onClick={() => set("nav_items", nav.filter((_, i) => i !== index))}
                    className="p-2 text-stone hover:text-destructive"
                    aria-label="Remove link"
                  >
                    <Trash2 size={14} />
                  </button>
                </div>
              </div>
            </RowCard>
          ))}
          {nav.length === 0 ? (
            <p className="text-[13px] text-stone">
              Default links (Work, Services, About, Contact) are shown until you add your own.
            </p>
          ) : null}
        </div>
      </div>

      <div className="border-t border-ink/10 pt-7">
        <div className="caps text-stone">Home page sections</div>
        <p className="mt-1 text-[11px] text-stone">
          Turn a section off to hide it, or move it to change the reading order of the page.
        </p>
        <div className="mt-4 space-y-2">
          {sections.map((section, index) => (
            <div
              key={section.key}
              className="flex items-center justify-between gap-4 border border-ink/12 bg-card px-4 py-3"
            >
              <div>
                <div className="text-sm">
                  {section.label || SECTION_LABELS[section.key] || section.key}
                </div>
                <div className="text-[11px] text-stone">Position {index + 1}</div>
              </div>
              <div className="flex items-center gap-1">
                <button
                  type="button"
                  onClick={() => updateSections(swap(sections, index, -1))}
                  disabled={index === 0}
                  className="p-2 text-stone hover:text-ink disabled:opacity-25"
                  aria-label="Move up"
                >
                  <ArrowUp size={14} />
                </button>
                <button
                  type="button"
                  onClick={() => updateSections(swap(sections, index, 1))}
                  disabled={index === sections.length - 1}
                  className="p-2 text-stone hover:text-ink disabled:opacity-25"
                  aria-label="Move down"
                >
                  <ArrowDown size={14} />
                </button>
                <button
                  type="button"
                  onClick={() =>
                    updateSections(
                      sections.map((item, i) =>
                        i === index ? { ...item, visible: item.visible === false } : item
                      )
                    )
                  }
                  className={`flex items-center gap-2 px-2 py-1 caps ${
                    section.visible === false ? "text-stone" : "text-ink"
                  }`}
                >
                  {section.visible === false ? "Hidden" : "Visible"}
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="border-t border-ink/10 pt-7">
        <CategoriesEditor
          value={content.categories || []}
          onChange={(next) => set("categories", next)}
        />
      </div>
    </Panel>
  );
}