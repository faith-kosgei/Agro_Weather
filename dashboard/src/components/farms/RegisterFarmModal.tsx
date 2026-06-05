"use client";
import { useState } from "react";
import type { Farm } from "@/types";
import { X, Loader2 } from "lucide-react";

interface Props {
  onClose: () => void;
  onSubmit: (data: Omit<Farm, "id" | "createdAt">) => Promise<void>;
}

const SAMPLE_FARMS = [
  { name: "Kapkimolwa Tea Farm", lat: -0.7833, lon: 35.3667, cropType: "tea", location: "Bomet Central" },
  { name: "Eldoret Maize Plot", lat: 0.5143, lon: 35.2698, cropType: "maize", location: "Uasin Gishu" },
  { name: "Nakuru Wheat Farm", lat: -0.3031, lon: 36.0800, cropType: "wheat", location: "Nakuru County" },
];

export function RegisterFarmModal({ onClose, onSubmit }: Props) {
  const [form, setForm] = useState({ name: "", lat: "", lon: "", cropType: "", location: "" });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fill = (sample: typeof SAMPLE_FARMS[0]) => {
    setForm({
      name: sample.name,
      lat: String(sample.lat),
      lon: String(sample.lon),
      cropType: sample.cropType,
      location: sample.location,
    });
  };

  const handleSubmit = async () => {
    if (!form.name || !form.lat || !form.lon) {
      setError("Name, latitude and longitude are required.");
      return;
    }
    setLoading(true);
    setError(null);
    try {
      await onSubmit({
        name: form.name,
        lat: parseFloat(form.lat),
        lon: parseFloat(form.lon),
        cropType: form.cropType || null,
        location: form.location || null,
      });
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to register farm");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm">
      <div className="w-full max-w-md bg-[#111d14] border border-canopy-700/40 rounded-2xl shadow-2xl p-6 animate-fade-up">
        <div className="flex items-center justify-between mb-5">
          <h2 className="font-display text-lg font-semibold text-earth-300">Register a Farm</h2>
          <button onClick={onClose} className="p-1.5 rounded-lg hover:bg-canopy-700/30 text-canopy-400">
            <X size={16} />
          </button>
        </div>

        {/* Quick fill samples */}
        <div className="mb-4">
          <p className="text-xs text-canopy-500 mb-2">Quick fill:</p>
          <div className="flex gap-2 flex-wrap">
            {SAMPLE_FARMS.map((s) => (
              <button
                key={s.name}
                onClick={() => fill(s)}
                className="text-xs px-2.5 py-1 rounded-full border border-canopy-700/40 text-canopy-400 hover:border-canopy-500 hover:text-canopy-300 transition-all"
              >
                {s.name.split(" ")[0]}
              </button>
            ))}
          </div>
        </div>

        <div className="space-y-3">
          {[
            { key: "name", label: "Farm Name", placeholder: "e.g. Kapkimolwa Tea Farm", required: true },
            { key: "lat", label: "Latitude", placeholder: "e.g. -0.7833", required: true },
            { key: "lon", label: "Longitude", placeholder: "e.g. 35.3667", required: true },
            { key: "cropType", label: "Crop Type", placeholder: "e.g. tea, maize, wheat", required: false },
            { key: "location", label: "Location Name", placeholder: "e.g. Bomet Central", required: false },
          ].map(({ key, label, placeholder, required }) => (
            <div key={key}>
              <label className="block text-xs text-canopy-400 mb-1">
                {label} {required && <span className="text-earth-500">*</span>}
              </label>
              <input
                type="text"
                value={form[key as keyof typeof form]}
                onChange={(e) => setForm((f) => ({ ...f, [key]: e.target.value }))}
                placeholder={placeholder}
                className="w-full bg-canopy-700/20 border border-canopy-700/40 rounded-lg px-3 py-2 text-sm text-earth-200 placeholder-canopy-600 focus:outline-none focus:border-canopy-500 transition-colors"
              />
            </div>
          ))}
        </div>

        {error && <p className="mt-3 text-xs text-red-400">{error}</p>}

        <div className="flex gap-3 mt-5">
          <button
            onClick={onClose}
            className="flex-1 py-2.5 rounded-lg border border-canopy-700/40 text-canopy-400 text-sm hover:bg-canopy-700/20 transition-all"
          >
            Cancel
          </button>
          <button
            onClick={handleSubmit}
            disabled={loading}
            className="flex-1 py-2.5 rounded-lg bg-canopy-500 text-white text-sm font-medium hover:bg-canopy-400 disabled:opacity-50 transition-all flex items-center justify-center gap-2"
          >
            {loading ? <><Loader2 size={14} className="animate-spin" />Registering…</> : "Register Farm"}
          </button>
        </div>
      </div>
    </div>
  );
}
