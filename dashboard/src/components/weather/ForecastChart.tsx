"use client";
import type { ForecastResponse } from "@/types";
import {
  ResponsiveContainer, ComposedChart, Area, Line, Bar,
  XAxis, YAxis, CartesianGrid, Tooltip, Legend,
} from "recharts";

interface Props { forecast: ForecastResponse | null; loading: boolean; }

export function ForecastChart({ forecast, loading }: Props) {
  if (loading) return <div className="skeleton h-72 rounded-xl" />;
  if (!forecast) return null;

  const data = forecast.forecast.map((d) => ({
    day: new Date(d.date).toLocaleDateString("en-KE", { weekday: "short", day: "numeric" }),
    "Max °C": d.temp_max,
    "Min °C": d.temp_min,
    "Rain mm": d.precip_mm,
    Humidity: d.humidity,
  }));

  return (
    <div className="bg-canopy-700/10 border border-canopy-700/30 rounded-xl p-5">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-xs font-mono uppercase tracking-widest text-canopy-500">7-Day Forecast</h2>
        {forecast.cached && <span className="text-xs text-canopy-600 font-mono">cached</span>}
      </div>

      <ResponsiveContainer width="100%" height={240}>
        <ComposedChart data={data} margin={{ top: 4, right: 8, bottom: 0, left: -16 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="#1f3326" vertical={false} />
          <XAxis dataKey="day" tick={{ fill: "#52a362", fontSize: 11, fontFamily: "DM Mono" }} axisLine={false} tickLine={false} />
          <YAxis yAxisId="temp" tick={{ fill: "#52a362", fontSize: 11 }} axisLine={false} tickLine={false} />
          <YAxis yAxisId="rain" orientation="right" tick={{ fill: "#60a5d4", fontSize: 11 }} axisLine={false} tickLine={false} />
          <Tooltip
            contentStyle={{ background: "#111d14", border: "1px solid #24472c", borderRadius: 8, fontSize: 12 }}
            labelStyle={{ color: "#c49a5a", fontFamily: "DM Mono" }}
            itemStyle={{ color: "#e8dcc8" }}
          />
          <Legend wrapperStyle={{ fontSize: 11, color: "#52a362", paddingTop: 12 }} />
          <Area yAxisId="temp" type="monotone" dataKey="Max °C" fill="#3d7a4a33" stroke="#3d7a4a" strokeWidth={2} dot={false} />
          <Line yAxisId="temp" type="monotone" dataKey="Min °C" stroke="#52a36266" strokeWidth={1.5} dot={false} strokeDasharray="4 2" />
          <Bar yAxisId="rain" dataKey="Rain mm" fill="#3b82f640" stroke="#3b82f6" strokeWidth={1} radius={[3,3,0,0]} />
        </ComposedChart>
      </ResponsiveContainer>
    </div>
  );
}
