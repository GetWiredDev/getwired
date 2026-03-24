"use client";

import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import { FolderKanban, Bot, TrendingUp, Plus, Sparkles } from "lucide-react";
import Link from "next/link";
import { motion } from "framer-motion";

const stagger = {
  hidden: {},
  show: { transition: { staggerChildren: 0.08 } },
};
const fadeUp = {
  hidden: { opacity: 0, y: 16 },
  show: { opacity: 1, y: 0, transition: { duration: 0.4, ease: "easeOut" as const } },
};

function StatCard({
  label,
  value,
  sub,
  icon: Icon,
  gradient,
}: {
  label: string;
  value: string | number;
  sub?: string;
  icon: React.ElementType;
  gradient: string;
}) {
  return (
    <motion.div variants={fadeUp}>
      <div
        className="card rounded-2xl p-5 transition-all duration-300 hover:scale-[1.02] group"
      >
        <div className="flex items-center justify-between mb-4">
          <p
            className="text-[11px] font-semibold uppercase tracking-[0.1em]"
            style={{ color: "var(--fg-muted)" }}
          >
            {label}
          </p>
          <div
            className="h-8 w-8 rounded-lg flex items-center justify-center transition-transform duration-300 group-hover:scale-110"
            style={{ background: gradient }}
          >
            <Icon className="h-4 w-4 text-white" />
          </div>
        </div>
        <p className="text-3xl font-bold tracking-tight" style={{ color: "var(--fg)" }}>
          {value}
        </p>
        {sub && (
          <p className="text-xs mt-1" style={{ color: "var(--fg-muted)" }}>
            {sub}
          </p>
        )}
      </div>
    </motion.div>
  );
}

export default function DashboardPage() {
  const projects = useQuery(api.projects.listMyProjects);

  return (
    <motion.div
      className="space-y-8 max-w-6xl"
      variants={stagger}
      initial="hidden"
      animate="show"
    >
      <motion.div variants={fadeUp} className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight" style={{ color: "var(--fg)" }}>
            Dashboard
          </h1>
          <p className="text-sm mt-1" style={{ color: "var(--fg-secondary)" }}>
            Your growth intelligence overview
          </p>
        </div>
        <Link
          href="/projects/new"
          className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-medium text-white transition-all duration-200 hover:scale-105 active:scale-[0.98]"
          style={{ background: "linear-gradient(135deg, var(--accent), var(--accent-hover))" }}
        >
          <Plus className="h-4 w-4" />
          New Project
        </Link>
      </motion.div>

      <motion.div variants={stagger} className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        <StatCard
          label="Total Projects"
          value={projects?.length ?? 0}
          icon={FolderKanban}
          gradient="linear-gradient(135deg, #6c5ce7, #a29bfe)"
        />
        <StatCard
          label="Keywords Tracked"
          value="—"
          sub="Create a project to start tracking"
          icon={TrendingUp}
          gradient="linear-gradient(135deg, #00d68f, #00b894)"
        />
        <StatCard
          label="Agent Runs"
          value="—"
          sub="Use the agent to analyze your growth"
          icon={Bot}
          gradient="linear-gradient(135deg, #fdcb6e, #f39c12)"
        />
      </motion.div>

      {projects && projects.length === 0 && (
        <motion.div variants={fadeUp}>
          <div
            className="card-dashed rounded-2xl p-12 flex flex-col items-center justify-center text-center"
          >
            <div
              className="h-16 w-16 rounded-2xl flex items-center justify-center mb-6 animate-float"
              style={{ background: "var(--accent-subtle)" }}
            >
              <Sparkles className="h-7 w-7" style={{ color: "var(--accent)" }} />
            </div>
            <h3 className="text-lg font-semibold mb-2" style={{ color: "var(--fg)" }}>
              No projects yet
            </h3>
            <p className="text-sm max-w-md mb-8" style={{ color: "var(--fg-secondary)" }}>
              Get started by creating your first project. Enter your website URL
              and we&apos;ll extract keywords, find competitors, and surface
              growth opportunities.
            </p>
            <Link
              href="/projects/new"
              className="inline-flex items-center gap-2 px-5 py-3 rounded-xl text-sm font-medium text-white transition-all duration-200 hover:scale-105 active:scale-[0.98]"
              style={{ background: "linear-gradient(135deg, var(--accent), var(--accent-hover))" }}
            >
              <Plus className="h-4 w-4" />
              Create Your First Project
            </Link>
          </div>
        </motion.div>
      )}
    </motion.div>
  );
}

