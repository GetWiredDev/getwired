"use client";

import { useState, useRef, useEffect } from "react";
import { useQuery, useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import { Id } from "@/convex/_generated/dataModel";
import { Bell, CheckCheck, TrendingUp, MessageSquare, Users, AlertTriangle } from "lucide-react";
import { AnimatePresence, motion } from "framer-motion";

const ALERT_ICONS: Record<string, React.ElementType> = {
  reddit_mention: MessageSquare, rank_change: TrendingUp, trend_spike: AlertTriangle, new_competitor: Users,
};

interface AlertsPopoverProps { projectId: Id<"projects">; }

export function AlertsPopover({ projectId }: AlertsPopoverProps) {
  const alerts = useQuery(api.monitoring.getUnreadAlerts, { projectId });
  const markRead = useMutation(api.monitoring.markAlertRead);
  const markAllRead = useMutation(api.monitoring.markAllRead);
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  const unreadCount = alerts?.length ?? 0;

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  return (
    <div ref={ref} className="relative">
      <button onClick={() => setOpen(!open)} className="relative p-2 rounded-lg transition-colors duration-200 cursor-pointer"
        style={{ color: "var(--fg-secondary)" }}
        onMouseEnter={(e) => (e.currentTarget.style.background = "var(--bg-glass-hover)")}
        onMouseLeave={(e) => (e.currentTarget.style.background = "transparent")}
      >
        <Bell className="h-4 w-4" />
        {unreadCount > 0 && (
          <span className="absolute -top-0.5 -right-0.5 h-4 min-w-4 rounded-full flex items-center justify-center text-[9px] font-bold text-white px-1"
            style={{ background: "var(--destructive)" }}
          >{unreadCount > 9 ? "9+" : unreadCount}</span>
        )}
      </button>
      <AnimatePresence>
        {open && (
          <motion.div initial={{ opacity: 0, y: -4, scale: 0.96 }} animate={{ opacity: 1, y: 0, scale: 1 }} exit={{ opacity: 0, y: -4, scale: 0.96 }}
            transition={{ duration: 0.15 }}
            className="absolute top-full right-0 mt-2 w-80 rounded-xl p-4 z-50"
            style={{ background: "var(--bg-card)", border: "1px solid var(--border-color)", boxShadow: "var(--shadow-lg)" }}
          >
            <div className="flex items-center justify-between mb-3">
              <h4 className="font-semibold text-sm" style={{ color: "var(--fg)" }}>Alerts</h4>
              {unreadCount > 0 && (
                <button onClick={() => markAllRead({ projectId })} className="flex items-center gap-1 text-xs cursor-pointer" style={{ color: "var(--accent)" }}>
                  <CheckCheck className="h-3 w-3" /> Mark all read
                </button>
              )}
            </div>
            <div className="max-h-[300px] overflow-y-auto space-y-1">
              {unreadCount === 0 ? (
                <p className="text-sm text-center py-6" style={{ color: "var(--fg-muted)" }}>No new alerts</p>
              ) : alerts?.map((alert) => {
                const Icon = ALERT_ICONS[alert.type] ?? Bell;
                return (
                  <div key={alert._id} onClick={() => markRead({ alertId: alert._id })}
                    className="flex gap-2 rounded-lg p-2.5 cursor-pointer transition-colors duration-150"
                    onMouseEnter={(e) => (e.currentTarget.style.background = "var(--bg-card-hover)")}
                    onMouseLeave={(e) => (e.currentTarget.style.background = "transparent")}
                  >
                    <Icon className="h-4 w-4 mt-0.5 shrink-0" style={{ color: "var(--fg-muted)" }} />
                    <div className="min-w-0">
                      <p className="text-sm font-medium leading-tight" style={{ color: "var(--fg)" }}>{alert.title}</p>
                      <p className="text-xs line-clamp-2" style={{ color: "var(--fg-muted)" }}>{alert.description}</p>
                      <p className="text-[11px] mt-1" style={{ color: "var(--fg-muted)" }}>{new Date(alert.createdAt).toLocaleDateString()}</p>
                    </div>
                  </div>
                );
              })}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

