"use client";

import { useQuery } from "convex/react";
import { useParams } from "next/navigation";
import { api } from "@/convex/_generated/api";
import { Id } from "@/convex/_generated/dataModel";
import {
  Key, Users, MessageSquare, TrendingUp, Bot, ExternalLink, Loader2, ArrowRight,
} from "lucide-react";
import Link from "next/link";
import { motion } from "framer-motion";

const stagger = { hidden: {}, show: { transition: { staggerChildren: 0.06 } } };
const fadeUp = {
  hidden: { opacity: 0, y: 16 },
  show: { opacity: 1, y: 0, transition: { duration: 0.4, ease: "easeOut" as const } },
};

export default function ProjectOverviewPage() {
  const params = useParams();
  const projectId = params.projectId as Id<"projects">;
  const project = useQuery(api.projects.getProject, { projectId });
  const keywords = useQuery(api.keywords.listByProject, { projectId });
  const competitors = useQuery(api.competitors.listByProject, { projectId });

  if (project === undefined) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="h-8 w-8 rounded-lg animate-pulse" style={{ background: "var(--accent-subtle)" }} />
      </div>
    );
  }

  const trackedKeywords = keywords?.filter((k) => k.tracked) ?? [];
  const avgDifficulty =
    trackedKeywords.length > 0
      ? Math.round(trackedKeywords.reduce((sum, k) => sum + (k.difficulty ?? 0), 0) /
          trackedKeywords.filter((k) => k.difficulty != null).length || 0)
      : null;
  const avgGeo =
    trackedKeywords.length > 0
      ? Math.round(trackedKeywords.reduce((sum, k) => sum + (k.geoScore ?? 0), 0) /
          trackedKeywords.filter((k) => k.geoScore != null).length || 0)
      : null;

  const stats = [
    { label: "Keywords Tracked", value: trackedKeywords.length, sub: `${keywords?.length ?? 0} total`, icon: Key, gradient: "linear-gradient(135deg, #6c5ce7, #a29bfe)" },
    { label: "Avg Difficulty", value: avgDifficulty != null ? `${avgDifficulty}/100` : "—", icon: TrendingUp, gradient: "linear-gradient(135deg, #fdcb6e, #f39c12)" },
    { label: "GEO Visibility", value: avgGeo != null ? `${avgGeo}%` : "—", icon: Bot, gradient: "linear-gradient(135deg, #00d68f, #00b894)" },
    { label: "Competitors", value: competitors?.length ?? 0, icon: Users, gradient: "linear-gradient(135deg, #fd79a8, #e84393)" },
  ];

  const subNav = [
    { label: "Keywords", href: `/projects/${projectId}/keywords`, icon: Key },
    { label: "Competitors", href: `/projects/${projectId}/competitors`, icon: Users },
    { label: "Reddit", href: `/projects/${projectId}/reddit`, icon: MessageSquare },
    { label: "Knowledge", href: `/projects/${projectId}/knowledge`, icon: Bot },
  ];

  return (
    <motion.div className="space-y-8 max-w-6xl" variants={stagger} initial="hidden" animate="show">
      <motion.div variants={fadeUp}>
        <div className="flex items-center gap-3 mb-1">
          <h1 className="text-2xl font-bold tracking-tight" style={{ color: "var(--fg)" }}>{project.name}</h1>
          <span
            className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-medium capitalize"
            style={{
              background: project.status === "ready" ? "rgba(16,185,129,0.1)" : project.status === "scanning" ? "rgba(245,158,11,0.1)" : "rgba(239,68,68,0.1)",
              color: project.status === "ready" ? "var(--success)" : project.status === "scanning" ? "var(--warning)" : "var(--destructive)",
            }}
          >
            <span className="h-1.5 w-1.5 rounded-full" style={{ background: "currentColor" }} />
            {project.status}
          </span>
        </div>
        <a href={project.url} target="_blank" rel="noopener noreferrer"
          className="text-xs flex items-center gap-1 transition-colors duration-200"
          style={{ color: "var(--fg-muted)" }}
          onMouseEnter={(e) => (e.currentTarget.style.color = "var(--accent)")}
          onMouseLeave={(e) => (e.currentTarget.style.color = "var(--fg-muted)")}
        >
          {project.url} <ExternalLink className="h-3 w-3" />
        </a>
      </motion.div>

      {project.status === "scanning" && (
        <motion.div variants={fadeUp}
          className="card rounded-2xl p-5 flex items-center gap-3"
        >
          <Loader2 className="h-4 w-4 animate-spin" style={{ color: "var(--warning)" }} />
          <p className="text-sm" style={{ color: "var(--fg-secondary)" }}>Scanning website and extracting keywords...</p>
        </motion.div>
      )}

      <motion.div variants={stagger} className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {stats.map((s) => (
          <motion.div key={s.label} variants={fadeUp}
            className="card rounded-2xl p-5 transition-all duration-300 hover:scale-[1.02] group"
          >
            <div className="flex items-center justify-between mb-4">
              <p className="text-[11px] font-semibold uppercase tracking-[0.1em]" style={{ color: "var(--fg-muted)" }}>{s.label}</p>
              <div className="h-8 w-8 rounded-lg flex items-center justify-center transition-transform duration-300 group-hover:scale-110" style={{ background: s.gradient }}>
                <s.icon className="h-4 w-4 text-white" />
              </div>
            </div>
            <p className="text-3xl font-bold tracking-tight" style={{ color: "var(--fg)" }}>{s.value}</p>
            {s.sub && <p className="text-xs mt-1" style={{ color: "var(--fg-muted)" }}>{s.sub}</p>}
          </motion.div>
        ))}
      </motion.div>

      <motion.div variants={stagger} className="grid gap-3 md:grid-cols-2 lg:grid-cols-4">
        {subNav.map((item) => (
          <motion.div key={item.href} variants={fadeUp}>
            <Link href={item.href}>
              <div
                className="glass rounded-xl p-4 flex items-center justify-between transition-all duration-200 cursor-pointer group"
                onMouseEnter={(e) => (e.currentTarget.style.borderColor = "var(--accent)")}
                onMouseLeave={(e) => (e.currentTarget.style.borderColor = "var(--border-color)")}
              >
                <div className="flex items-center gap-3">
                  <item.icon className="h-4 w-4" style={{ color: "var(--fg-muted)" }} />
                  <span className="text-sm font-medium" style={{ color: "var(--fg-secondary)" }}>{item.label}</span>
                </div>
                <ArrowRight className="h-4 w-4 opacity-0 -translate-x-1 group-hover:opacity-100 group-hover:translate-x-0 transition-all duration-200" style={{ color: "var(--accent)" }} />
              </div>
            </Link>
          </motion.div>
        ))}
      </motion.div>
    </motion.div>
  );
}

