"use client";

interface RedditFiltersProps {
  statusFilter: string;
  onStatusChange: (value: string | null) => void;
  minRelevance: number;
  onRelevanceChange: (value: number) => void;
}

function PillGroup({
  label,
  options,
  value,
  onChange,
}: {
  label: string;
  options: { label: string; value: string }[];
  value: string;
  onChange: (v: string) => void;
}) {
  return (
    <div className="space-y-2">
      <label className="text-[11px] font-semibold uppercase tracking-[0.1em]" style={{ color: "var(--fg-muted)" }}>{label}</label>
      <div className="flex gap-1.5 flex-wrap">
        {options.map((o) => (
          <button key={o.value} onClick={() => onChange(o.value)}
            className="px-3 py-1.5 rounded-lg text-xs font-medium transition-all duration-200 cursor-pointer"
            style={{
              background: value === o.value ? "var(--accent)" : "var(--bg-glass)",
              color: value === o.value ? "white" : "var(--fg-secondary)",
              border: value === o.value ? "1px solid transparent" : "1px solid var(--border-color)",
            }}
          >{o.label}</button>
        ))}
      </div>
    </div>
  );
}

export function RedditFilters({ statusFilter, onStatusChange, minRelevance, onRelevanceChange }: RedditFiltersProps) {
  return (
    <div className="flex gap-6 flex-wrap">
      <PillGroup label="Status" value={statusFilter}
        onChange={(v) => onStatusChange(v)} options={[
          { label: "All", value: "all" }, { label: "New", value: "new" },
          { label: "Reviewed", value: "reviewed" }, { label: "Responded", value: "responded" },
          { label: "Dismissed", value: "dismissed" },
        ]}
      />
      <PillGroup label="Min Relevance" value={String(minRelevance)}
        onChange={(v) => onRelevanceChange(Number(v))} options={[
          { label: "Any", value: "0" }, { label: "20+", value: "20" },
          { label: "40+", value: "40" }, { label: "60+", value: "60" }, { label: "80+", value: "80" },
        ]}
      />
    </div>
  );
}

