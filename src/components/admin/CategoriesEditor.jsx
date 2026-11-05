import { useState } from "react";
import { Plus, X } from "lucide-react";
import { inputClass } from "./AdminUI";

export default function CategoriesEditor({ value = [], onChange, label = "Project types" }) {
  const [draft, setDraft] = useState("");
  const categories = Array.isArray(value) ? value : [];

  const add = () => {
    const name = draft.trim();
    if (!name || categories.includes(name)) {
      setDraft("");
      return;
    }
    onChange([...categories, name]);
    setDraft("");
  };

  return (
    <div>
      <div className="caps text-stone">{label}</div>
      <p className="mt-1 text-[11px] text-stone">
        These appear as suggestions when you file a project, and as the filters on the work page.
      </p>

      <div className="mt-3 flex flex-wrap gap-2">
        {categories.map((category) => (
          <span
            key={category}
            className="inline-flex items-center gap-2 border border-ink/15 bg-card px-3 py-1.5 text-[12px]"
          >
            {category}
            <button
              type="button"
              onClick={() => onChange(categories.filter((item) => item !== category))}
              className="text-stone hover:text-destructive"
              aria-label={`Remove ${category}`}
            >
              <X size={11} />
            </button>
          </span>
        ))}
        {categories.length === 0 ? (
          <span className="text-[12px] text-stone">No types yet.</span>
        ) : null}
      </div>

      <div className="mt-3 flex items-end gap-2 sm:max-w-md">
        <input
          value={draft}
          onChange={(event) => setDraft(event.target.value)}
          onKeyDown={(event) => {
            if (event.key === "Enter") {
              event.preventDefault();
              add();
            }
          }}
          placeholder="Hospitality"
          className={inputClass}
        />
        <button
          type="button"
          onClick={add}
          className="inline-flex shrink-0 items-center gap-2 border border-ink/20 px-4 py-2.5 caps text-ink hover:border-ink"
        >
          <Plus size={12} /> Add
        </button>
      </div>
    </div>
  );
}