"use client";

import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import { Plus, Globe, ExternalLink } from "lucide-react";
import Link from "next/link";
import { motion } from "framer-motion";

const stagger = { hidden: {}, show: { transition: { staggerChildren: 0.06 } } };
const fadeUp = {
  hidden: { opacity: 0, y: 16 },
  show: { opacity: 1, y: 0, transition: { duration: 0.4, ease: "easeOut" as const } },
};

function StatusDot({ status }: { status: string }) {
  const colors: Record<string, string> = {
    ready: "var(--success)",
    scanning: "var(--warning)",
    failed: "var(--destructive)",
  };
  return (
    <span className="relative flex h-2 w-2">
      {status === "scanning" && (
        <span
          className="absolute inline-flex h-full w-full rounded-full opacity-75 animate-ping"
          style={{ background: colors[status] ?? "var(--fg-muted)" }}
        />
      )}
      <span
        className="relative inline-flex rounded-full h-2 w-2"
        style={{ background: colors[status] ?? "var(--fg-muted)" }}
      />
    </span>
  );
}

export default function ProjectsPage() {
  const projects = useQuery(api.projects.listMyProjects);

  return (
    <motion.div className="space-y-8 max-w-6xl" variants={stagger} initial="hidden" animate="show">
      <motion.div variants={fadeUp} className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight" style={{ color: "var(--fg)" }}>Projects</h1>
          <p className="text-sm mt-1" style={{ color: "var(--fg-secondary)" }}>
            Manage your growth intelligence projects
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

      {projects === undefined ? (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {[1, 2, 3].map((i) => (
            <div
              key={i}
              className="card rounded-2xl p-5 animate-pulse"
            >
              <div className="h-4 rounded-lg w-3/4 mb-4" style={{ background: "var(--border-color)" }} />
              <div className="h-3 rounded-lg w-1/2" style={{ background: "var(--border-subtle)" }} />
            </div>
          ))}
        </div>
      ) : projects.length === 0 ? (
        <motion.div variants={fadeUp}>
          <div
            className="card-dashed rounded-2xl p-12 flex flex-col items-center justify-center text-center"
          >
            <div className="h-14 w-14 rounded-2xl flex items-center justify-center mb-5 animate-float"
              style={{ background: "var(--accent-subtle)" }}
            >
              <Globe className="h-6 w-6" style={{ color: "var(--accent)" }} />
            </div>
            <h3 className="text-base font-semibold mb-1.5" style={{ color: "var(--fg)" }}>No projects yet</h3>
            <p className="text-sm max-w-md mb-6" style={{ color: "var(--fg-secondary)" }}>
              Create your first project to start analyzing growth opportunities.
            </p>
            <Link
              href="/projects/new"
              className="inline-flex items-center gap-2 px-5 py-3 rounded-xl text-sm font-medium text-white transition-all duration-200 hover:scale-105"
              style={{ background: "linear-gradient(135deg, var(--accent), var(--accent-hover))" }}
            >
              <Plus className="h-4 w-4" /> Create Project
            </Link>
          </div>
        </motion.div>
      ) : (
        <motion.div variants={stagger} className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {projects.map((project) => (
            <motion.div key={project._id} variants={fadeUp}>
              <Link href={`/projects/${project._id}`}>
                <div
                  className="card rounded-2xl p-5 transition-all duration-300 hover:scale-[1.02] cursor-pointer group"
                >
                  <div className="flex items-center justify-between mb-3">
                    <h3 className="text-sm font-semibold" style={{ color: "var(--fg)" }}>
                      {project.name}
                    </h3>
                    <div className="flex items-center gap-1.5">
                      <StatusDot status={project.status} />
                      <span
                        className="text-[11px] font-medium capitalize"
                        style={{ color: "var(--fg-muted)" }}
                      >
                        {project.status}
                      </span>
                    </div>
                  </div>
                  <div className="flex items-center gap-1.5 text-xs" style={{ color: "var(--fg-muted)" }}>
                    <ExternalLink className="h-3 w-3 shrink-0" />
                    <span className="truncate">{project.url}</span>
                  </div>
                  {project.scannedAt && (
                    <p className="text-[11px] mt-3" style={{ color: "var(--fg-muted)" }}>
                      Scanned {new Date(project.scannedAt).toLocaleDateString()}
                    </p>
                  )}
                </div>
              </Link>
            </motion.div>
          ))}
        </motion.div>
      )}
    </motion.div>
  );
}

