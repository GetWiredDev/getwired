"use client";

import { ProjectWizard } from "@/components/project-wizard";
import { motion } from "framer-motion";

const fadeUp = {
  hidden: { opacity: 0, y: 16 },
  show: { opacity: 1, y: 0, transition: { duration: 0.4, ease: "easeOut" as const } },
};

export default function NewProjectPage() {
  return (
    <motion.div
      className="space-y-6"
      initial="hidden"
      animate="show"
      variants={{ hidden: {}, show: { transition: { staggerChildren: 0.08 } } }}
    >
      <motion.div variants={fadeUp}>
        <h1 className="text-2xl font-bold tracking-tight" style={{ color: "var(--fg)" }}>
          Create Project
        </h1>
        <p className="text-sm mt-1" style={{ color: "var(--fg-secondary)" }}>
          Set up a new growth intelligence project
        </p>
      </motion.div>
      <motion.div variants={fadeUp}>
        <ProjectWizard />
      </motion.div>
    </motion.div>
  );
}

