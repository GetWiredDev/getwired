"use client";

import { useUser } from "@clerk/nextjs";
import { motion } from "framer-motion";

const fadeUp = { hidden: { opacity: 0, y: 16 }, show: { opacity: 1, y: 0, transition: { duration: 0.4, ease: "easeOut" as const } } };

export default function SettingsPage() {
  const { user } = useUser();

  return (
    <motion.div className="space-y-8 max-w-2xl" initial="hidden" animate="show" variants={{ hidden: {}, show: { transition: { staggerChildren: 0.08 } } }}>
      <motion.div variants={fadeUp}>
        <h1 className="text-2xl font-bold tracking-tight" style={{ color: "var(--fg)" }}>Settings</h1>
        <p className="text-sm mt-1" style={{ color: "var(--fg-secondary)" }}>Manage your account and preferences</p>
      </motion.div>

      <motion.div variants={fadeUp} className="card rounded-2xl p-6">
        <h2 className="text-base font-semibold mb-1" style={{ color: "var(--fg)" }}>Account</h2>
        <p className="text-xs mb-5" style={{ color: "var(--fg-muted)" }}>Your account information</p>
        <div className="space-y-4">
          {[
            { label: "Name", value: user?.fullName ?? "—" },
            { label: "Email", value: user?.primaryEmailAddress?.emailAddress ?? "—" },
          ].map((item) => (
            <div key={item.label} className="flex justify-between items-center py-2" style={{ borderBottom: "1px solid var(--border-subtle)" }}>
              <span className="text-sm" style={{ color: "var(--fg-muted)" }}>{item.label}</span>
              <span className="text-sm font-medium" style={{ color: "var(--fg)" }}>{item.value}</span>
            </div>
          ))}
        </div>
      </motion.div>

      <motion.div variants={fadeUp} className="card rounded-2xl p-6">
        <h2 className="text-base font-semibold mb-1" style={{ color: "var(--fg)" }}>Scheduled Jobs</h2>
        <p className="text-xs mb-5" style={{ color: "var(--fg-muted)" }}>Automated tasks running in the background</p>
        <div className="space-y-4">
          {[
            { name: "Keyword Analysis", schedule: "Daily at 6:00 AM UTC" },
            { name: "Reddit Scan", schedule: "Every 4 hours" },
            { name: "Weekly Digest", schedule: "Mondays at 8:00 AM UTC" },
          ].map((job) => (
            <div key={job.name} className="flex items-center justify-between py-2" style={{ borderBottom: "1px solid var(--border-subtle)" }}>
              <div>
                <p className="text-sm font-medium" style={{ color: "var(--fg)" }}>{job.name}</p>
                <p className="text-xs" style={{ color: "var(--fg-muted)" }}>{job.schedule}</p>
              </div>
              <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-medium"
                style={{ background: "rgba(16,185,129,0.1)", color: "var(--success)" }}
              >
                <span className="h-1.5 w-1.5 rounded-full" style={{ background: "currentColor" }} />
                Active
              </span>
            </div>
          ))}
        </div>
      </motion.div>
    </motion.div>
  );
}

