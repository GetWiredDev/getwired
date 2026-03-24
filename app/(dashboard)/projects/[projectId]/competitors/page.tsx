"use client";

import { useQuery, useAction } from "convex/react";
import { useParams } from "next/navigation";
import { useState } from "react";
import { api } from "@/convex/_generated/api";
import { Id } from "@/convex/_generated/dataModel";
import { Loader2, Search, Globe } from "lucide-react";
import { motion } from "framer-motion";

const stagger = { hidden: {}, show: { transition: { staggerChildren: 0.06 } } };
const fadeUp = { hidden: { opacity: 0, y: 16 }, show: { opacity: 1, y: 0, transition: { duration: 0.4, ease: "easeOut" as const } } };

export default function CompetitorsPage() {
  const params = useParams();
  const projectId = params.projectId as Id<"projects">;
  const project = useQuery(api.projects.getProject, { projectId });
  const competitors = useQuery(api.competitors.listByProject, { projectId });
  const discoverCompetitors = useAction(api.competitors.discoverCompetitors);
  const [isDiscovering, setIsDiscovering] = useState(false);

  const handleDiscover = async () => {
    if (!project) return;
    setIsDiscovering(true);
    try {
      const domain = new URL(project.url).hostname.replace("www.", "");
      await discoverCompetitors({ projectId, domain });
    } catch (e) { console.error("Discovery failed:", e); }
    finally { setIsDiscovering(false); }
  };

  return (
    <motion.div className="space-y-6" variants={stagger} initial="hidden" animate="show">
      <motion.div variants={fadeUp} className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight" style={{ color: "var(--fg)" }}>Competitors</h1>
          <p className="text-sm mt-1" style={{ color: "var(--fg-secondary)" }}>Discover and analyze your competitors</p>
        </div>
        <button onClick={handleDiscover} disabled={isDiscovering}
          className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-medium text-white transition-all duration-200 hover:scale-105 active:scale-[0.98] disabled:opacity-50 cursor-pointer"
          style={{ background: "linear-gradient(135deg, var(--accent), var(--accent-hover))" }}
        >
          {isDiscovering ? <><Loader2 className="h-4 w-4 animate-spin" /> Discovering...</> : <><Search className="h-4 w-4" /> Discover Competitors</>}
        </button>
      </motion.div>

      {competitors === undefined ? (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {[1, 2, 3].map((i) => (
            <div key={i} className="card rounded-2xl p-5 animate-pulse">
              <div className="h-4 rounded-lg w-3/4 mb-3" style={{ background: "var(--border-color)" }} />
              <div className="h-3 rounded-lg w-1/2" style={{ background: "var(--border-subtle)" }} />
            </div>
          ))}
        </div>
      ) : competitors.length === 0 ? (
        <motion.div variants={fadeUp}>
          <div className="card-dashed rounded-2xl p-12 flex flex-col items-center justify-center text-center">
            <div className="h-14 w-14 rounded-2xl flex items-center justify-center mb-5 animate-float" style={{ background: "var(--accent-subtle)" }}>
              <Globe className="h-6 w-6" style={{ color: "var(--accent)" }} />
            </div>
            <h3 className="text-base font-semibold mb-2" style={{ color: "var(--fg)" }}>No competitors found</h3>
            <p className="text-sm max-w-md" style={{ color: "var(--fg-secondary)" }}>
              Click &quot;Discover Competitors&quot; to find domains competing for your keywords.
            </p>
          </div>
        </motion.div>
      ) : (
        <motion.div variants={stagger} className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {competitors.map((comp) => (
            <motion.div key={comp._id} variants={fadeUp}
              className="card rounded-2xl p-5 transition-all duration-300 hover:scale-[1.02] group">
              <div className="flex items-center justify-between mb-3">
                <h3 className="text-sm font-semibold" style={{ color: "var(--fg)" }}>{comp.name ?? comp.domain}</h3>
                {comp.overlapScore != null && (
                  <span className="text-[11px] font-medium px-2 py-0.5 rounded-full" style={{ background: "var(--accent-subtle)", color: "var(--accent)" }}>
                    {comp.overlapScore}% overlap
                  </span>
                )}
              </div>
              <p className="text-xs mb-3" style={{ color: "var(--fg-muted)" }}>{comp.domain}</p>
              {comp.overlapScore != null && (
                <div className="space-y-1.5">
                  <div className="flex justify-between text-[11px]" style={{ color: "var(--fg-muted)" }}>
                    <span>Keyword Overlap</span><span>{comp.overlapScore}%</span>
                  </div>
                  <div className="h-1.5 rounded-full overflow-hidden" style={{ background: "var(--border-color)" }}>
                    <div className="h-full rounded-full transition-all duration-500" style={{ width: `${comp.overlapScore}%`, background: "var(--accent)" }} />
                  </div>
                </div>
              )}
              <p className="text-[11px] mt-3" style={{ color: "var(--fg-muted)" }}>
                Discovered {new Date(comp.discoveredAt).toLocaleDateString()}
              </p>
            </motion.div>
          ))}
        </motion.div>
      )}
    </motion.div>
  );
}

