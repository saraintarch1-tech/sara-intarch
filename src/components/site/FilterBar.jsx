export default function FilterBar({ options = [], value, onChange, counts = {}, total }) {
  return (
    <div className="no-scrollbar -mx-5 overflow-x-auto border-y border-ink/12 md:mx-0">
      <div className="flex min-w-max items-center gap-8 px-5 py-4 md:px-0">
        {options.map((option) => {
          const active = option === value;
          return (
            <button
              key={option}
              type="button"
              onClick={() => onChange(option)}
              className={`group relative whitespace-nowrap py-1 caps transition-colors duration-500 ${
                active ? "text-ink" : "text-stone hover:text-ink-soft"
              }`}
            >
              <span className="flex items-baseline gap-2">
                {option}
                {counts[option] !== undefined ? (
                  <span className={active ? "text-stone" : "text-stone/50"}>{counts[option]}</span>
                ) : null}
              </span>
              <span
                className={`absolute inset-x-0 -bottom-0.5 h-px bg-ink transition-transform duration-500 ${
                  active ? "scale-x-100" : "scale-x-0 group-hover:scale-x-100"
                } origin-left`}
              />
            </button>
          );
        })}
        {total !== undefined ? (
          <span className="ml-auto pl-8 caps text-stone/60">{total} projects</span>
        ) : null}
      </div>
    </div>
  );
}