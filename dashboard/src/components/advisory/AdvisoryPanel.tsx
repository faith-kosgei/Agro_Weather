"use client";
import type { Advisory } from "@/types";
import { AlertTriangle, CheckCircle, AlertCircle, Clock } from "lucide-react";
import clsx from "clsx";

interface Props { advisory: Advisory | null; loading: boolean; }

const RISK_CONFIG = {
  low:    { icon: CheckCircle,  label: "Low Risk",    classes: "border-green-800/40 bg-green-900/10",  badge: "bg-green-900/40 text-green-400 border-green-700/40",  dot: "bg-green-500" },
  medium: { icon: AlertCircle,  label: "Moderate",    classes: "border-yellow-800/40 bg-yellow-900/10", badge: "bg-yellow-900/40 text-yellow-400 border-yellow-700/40", dot: "bg-yellow-500" },
  high:   { icon: AlertTriangle,"label": "High Risk", classes: "border-red-800/40 bg-red-900/10",       badge: "bg-red-900/40 text-red-400 border-red-700/40",         dot: "bg-red-500" },
};

export function AdvisoryPanel({ advisory, loading }: Props) {
  if (loading) return (
    <div className="space-y-2">
      <div className="skeleton h-16 rounded-xl" />
      {[1,2,3].map(i => <div key={i} className="skeleton h-20 rounded-xl" />)}
    </div>
  );

  if (!advisory) return null;

  const highCount = advisory.advisory.filter(a => a.risk === "high").length;
  const summaryColor = highCount > 0 ? "text-red-300 bg-red-900/20 border-red-800/40"
    : "text-earth-300 bg-canopy-700/20 border-canopy-700/40";

  return (
    <div>
      <div className="flex items-center justify-between mb-3">
        <h2 className="text-xs font-mono uppercase tracking-widest text-canopy-500">Agronomic Advisory</h2>
        <div className="flex items-center gap-1.5 text-xs text-canopy-500 font-mono">
          <Clock size={11} />
          {new Date(advisory.generatedAt).toLocaleTimeString("en-KE", { hour: "2-digit", minute: "2-digit" })}
        </div>
      </div>

      {/* Summary banner */}
      <div className={clsx("rounded-xl border px-4 py-3 mb-4 text-sm", summaryColor)}>
        {advisory.summary}
      </div>

      {/* Day-by-day */}
      <div className="space-y-2">
        {advisory.advisory.map((item) => {
          const cfg = RISK_CONFIG[item.risk];
          const Icon = cfg.icon;
          return (
            <div
              key={item.day}
              className={clsx("rounded-xl border px-4 py-3 flex gap-3 items-start", cfg.classes)}
            >
              <Icon size={15} className={clsx("mt-0.5 flex-shrink-0",
                item.risk === "low" ? "text-green-400" : item.risk === "medium" ? "text-yellow-400" : "text-red-400"
              )} />
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1">
                  <span className="text-xs font-mono text-canopy-400">
                    {new Date(item.day).toLocaleDateString("en-KE", { weekday: "short", month: "short", day: "numeric" })}
                  </span>
                  <span className="text-xs text-canopy-500">·</span>
                  <span className="text-xs text-canopy-400">{item.condition}</span>
                  <span className={clsx("ml-auto text-xs px-2 py-0.5 rounded-full border font-medium", cfg.badge)}>
                    {cfg.label}
                  </span>
                </div>
                <p className="text-sm text-earth-300/90 leading-relaxed">{item.advice}</p>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
