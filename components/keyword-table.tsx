"use client";

import { useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import { Doc } from "@/convex/_generated/dataModel";
import { Trash2, TrendingUp, TrendingDown, Minus } from "lucide-react";

function TrendIcon({ direction }: { direction?: string }) {
  if (direction === "rising") return <TrendingUp className="h-4 w-4" style={{ color: "var(--success)" }} />;
  if (direction === "declining") return <TrendingDown className="h-4 w-4" style={{ color: "var(--destructive)" }} />;
  return <Minus className="h-4 w-4" style={{ color: "var(--fg-muted)" }} />;
}

function Toggle({ checked, onChange }: { checked: boolean; onChange: () => void }) {
  return (
    <button onClick={onChange} className="relative inline-flex h-5 w-9 items-center rounded-full transition-colors duration-200 cursor-pointer"
      style={{ background: checked ? "var(--accent)" : "var(--border-color)" }}
    >
      <span className="inline-block h-3.5 w-3.5 rounded-full bg-white transition-transform duration-200"
        style={{ transform: checked ? "translateX(18px)" : "translateX(3px)" }}
      />
    </button>
  );
}

export function KeywordTable({ keywords }: { keywords: Doc<"keywords">[] }) {
  const toggleTracked = useMutation(api.keywords.toggleTracked);
  const deleteKeyword = useMutation(api.keywords.deleteKeyword);

  const heads = ["Keyword", "Source", "Volume", "Difficulty", "Trend", "SEO Rank", "GEO Score", "Tracked", ""];

  return (
    <div className="card rounded-xl overflow-hidden">
      <table className="w-full text-sm">
        <thead>
          <tr style={{ background: "var(--bg-glass)", borderBottom: "1px solid var(--border-color)" }}>
            {heads.map((h) => (
              <th key={h} className="px-4 py-3 text-left text-[11px] font-semibold uppercase tracking-[0.1em]"
                style={{ color: "var(--fg-muted)" }}
              >{h}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {keywords.length === 0 ? (
            <tr><td colSpan={9} className="text-center py-12 text-sm" style={{ color: "var(--fg-muted)" }}>
              No keywords found. Scan your website or add keywords manually.
            </td></tr>
          ) : keywords.map((kw) => (
            <tr key={kw._id} className="transition-colors duration-150"
              style={{ borderBottom: "1px solid var(--border-subtle)" }}
              onMouseEnter={(e) => (e.currentTarget.style.background = "var(--bg-card-hover)")}
              onMouseLeave={(e) => (e.currentTarget.style.background = "transparent")}
            >
              <td className="px-4 py-3 font-medium" style={{ color: "var(--fg)" }}>{kw.keyword}</td>
              <td className="px-4 py-3">
                <span className="inline-flex px-2 py-0.5 rounded-md text-[11px] font-medium"
                  style={{ background: "var(--accent-subtle)", color: "var(--accent)" }}
                >{kw.source}</span>
              </td>
              <td className="px-4 py-3 text-right" style={{ color: "var(--fg-secondary)" }}>{kw.searchVolume?.toLocaleString() ?? "—"}</td>
              <td className="px-4 py-3 text-right" style={{ color: "var(--fg-secondary)" }}>{kw.difficulty != null ? `${kw.difficulty}/100` : "—"}</td>
              <td className="px-4 py-3"><TrendIcon direction={kw.trendDirection} /></td>
              <td className="px-4 py-3 text-right" style={{ color: "var(--fg-secondary)" }}>{kw.seoRank ?? "—"}</td>
              <td className="px-4 py-3 text-right" style={{ color: "var(--fg-secondary)" }}>{kw.geoScore != null ? `${kw.geoScore}/100` : "—"}</td>
              <td className="px-4 py-3"><Toggle checked={kw.tracked ?? false} onChange={() => toggleTracked({ keywordId: kw._id })} /></td>
              <td className="px-4 py-3">
                <button onClick={() => deleteKeyword({ keywordId: kw._id })}
                  className="p-1.5 rounded-lg transition-colors duration-150 cursor-pointer"
                  style={{ color: "var(--fg-muted)" }}
                  onMouseEnter={(e) => { e.currentTarget.style.color = "var(--destructive)"; e.currentTarget.style.background = "var(--bg-card-hover)"; }}
                  onMouseLeave={(e) => { e.currentTarget.style.color = "var(--fg-muted)"; e.currentTarget.style.background = "transparent"; }}
                >
                  <Trash2 className="h-4 w-4" />
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

