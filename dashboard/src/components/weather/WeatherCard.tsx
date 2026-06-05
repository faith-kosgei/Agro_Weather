"use client";
import type { CurrentWeather } from "@/types";
import { Droplets, Wind, Thermometer, Sun } from "lucide-react";

interface Props { weather: CurrentWeather | null; loading: boolean; }

export function WeatherCard({ weather, loading }: Props) {
  if (loading) {
    return (
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[1,2,3,4].map(i => <div key={i} className="skeleton h-28 rounded-xl" />)}
      </div>
    );
  }

  if (!weather) return null;
  const { current } = weather;

  const stats = [
    {
      icon: Thermometer,
      label: "Temperature",
      value: `${current.temp}°C`,
      sub: `Feels like ${current.feels_like}°C`,
      color: "text-orange-400",
      bg: "bg-orange-500/10 border-orange-500/20",
    },
    {
      icon: Droplets,
      label: "Humidity",
      value: `${current.humidity}%`,
      sub: `${current.precip_mm}mm precipitation`,
      color: "text-sky-400",
      bg: "bg-sky-500/10 border-sky-500/20",
    },
    {
      icon: Wind,
      label: "Wind",
      value: `${current.wind_speed} km/h`,
      sub: current.wind_dir,
      color: "text-canopy-300",
      bg: "bg-canopy-500/10 border-canopy-500/20",
    },
    {
      icon: Sun,
      label: "UV Index",
      value: current.uv_index.toString(),
      sub: uvLabel(current.uv_index),
      color: "text-yellow-400",
      bg: "bg-yellow-500/10 border-yellow-500/20",
    },
  ];

  return (
    <div>
      <div className="flex items-center justify-between mb-3">
        <h2 className="text-xs font-mono uppercase tracking-widest text-canopy-500">Current Conditions</h2>
        <div className="flex items-center gap-2">
          <span className="text-xs text-earth-400/70 bg-canopy-700/20 px-2 py-1 rounded-full border border-canopy-700/30">
            {current.condition}
          </span>
          {weather.cached && (
            <span className="text-xs text-canopy-600 font-mono">cached</span>
          )}
        </div>
      </div>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {stats.map(({ icon: Icon, label, value, sub, color, bg }) => (
          <div key={label} className={`rounded-xl border p-4 ${bg}`}>
            <div className={`${color} mb-2`}><Icon size={18} /></div>
            <p className={`text-2xl font-display font-semibold ${color}`}>{value}</p>
            <p className="text-xs text-canopy-400 mt-0.5">{label}</p>
            <p className="text-xs text-canopy-500 mt-1">{sub}</p>
          </div>
        ))}
      </div>
    </div>
  );
}

function uvLabel(uv: number): string {
  if (uv <= 2) return "Low";
  if (uv <= 5) return "Moderate";
  if (uv <= 7) return "High";
  if (uv <= 10) return "Very High";
  return "Extreme";
}
