"use client";

import { TrendingUp, TrendingDown, Minus } from "lucide-react";

interface TrendSparklineProps {
  direction?: "rising" | "stable" | "declining";
  className?: string;
}

export function TrendSparkline({ direction, className }: TrendSparklineProps) {
  if (!direction) {
    return <Minus className={`h-4 w-4 ${className ?? ""}`} style={{ color: "var(--fg-muted)" }} />;
  }

  if (direction === "rising") {
    return (
      <div className={`flex items-center gap-1 ${className ?? ""}`} style={{ color: "var(--success)" }}>
        <TrendingUp className="h-4 w-4" />
        <span className="text-xs font-medium">Rising</span>
      </div>
    );
  }

  if (direction === "declining") {
    return (
      <div className={`flex items-center gap-1 ${className ?? ""}`} style={{ color: "var(--destructive)" }}>
        <TrendingDown className="h-4 w-4" />
        <span className="text-xs font-medium">Declining</span>
      </div>
    );
  }

  return (
    <div className={`flex items-center gap-1 ${className ?? ""}`} style={{ color: "var(--fg-muted)" }}>
      <Minus className="h-4 w-4" />
      <span className="text-xs font-medium">Stable</span>
    </div>
  );
}

