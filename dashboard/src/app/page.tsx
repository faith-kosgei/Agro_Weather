"use client";
import { useState, useEffect, useCallback } from "react";
import { api } from "@/lib/api";
import type { Farm, CurrentWeather, ForecastResponse, Advisory } from "@/types";
import { FarmSidebar } from "@/components/farms/FarmSidebar";
import { RegisterFarmModal } from "@/components/farms/RegisterFarmModal";
import { WeatherCard } from "@/components/weather/WeatherCard";
import { ForecastChart } from "@/components/weather/ForecastChart";
import { AdvisoryPanel } from "@/components/advisory/AdvisoryPanel";
import { Sprout, Plus, Wifi, WifiOff } from "lucide-react";

export default function DashboardPage() {
  const [farms, setFarms] = useState<Farm[]>([]);
  const [selectedFarm, setSelectedFarm] = useState<Farm | null>(null);
  const [weather, setWeather] = useState<CurrentWeather | null>(null);
  const [forecast, setForecast] = useState<ForecastResponse | null>(null);
  const [advisory, setAdvisory] = useState<Advisory | null>(null);
  const [showRegister, setShowRegister] = useState(false);
  const [loading, setLoading] = useState({ farms: true, weather: false });
  const [error, setError] = useState<string | null>(null);

  const loadFarms = useCallback(async () => {
    try {
      const data = await api.farms.list();
      setFarms(data.farms);
      if (data.farms.length > 0 && !selectedFarm) {
        setSelectedFarm(data.farms[0]);
      }
    } catch {
      setError("Could not connect to API. Is the backend running?");
    } finally {
      setLoading((l) => ({ ...l, farms: false }));
    }
  }, [selectedFarm]);

  useEffect(() => { loadFarms(); }, []);

  useEffect(() => {
    if (!selectedFarm) return;
    setWeather(null); setForecast(null); setAdvisory(null);
    setLoading((l) => ({ ...l, weather: true }));

    Promise.all([
      api.weather.current(selectedFarm.id),
      api.weather.forecast(selectedFarm.id),
      api.weather.advisory(selectedFarm.id),
    ])
      .then(([w, f, a]) => { setWeather(w); setForecast(f); setAdvisory(a); })
      .catch(() => setError("Failed to fetch weather data"))
      .finally(() => setLoading((l) => ({ ...l, weather: false })));
  }, [selectedFarm]);

  const handleRegister = async (data: Omit<Farm, "id" | "createdAt">) => {
    const farm = await api.farms.create(data);
    setFarms((prev) => [farm, ...prev]);
    setSelectedFarm(farm);
    setShowRegister(false);
  };

  const handleDelete = async (id: string) => {
    await api.farms.delete(id);
    const updated = farms.filter((f) => f.id !== id);
    setFarms(updated);
    setSelectedFarm(updated[0] ?? null);
  };

  return (
    <div className="flex h-screen overflow-hidden bg-[#0b1510]">
      {/* Sidebar */}
      <aside className="w-72 flex-shrink-0 border-r border-canopy-700/40 flex flex-col bg-[#0f1a12]">
        {/* Logo */}
        <div className="px-5 py-5 border-b border-canopy-700/40 flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-canopy-500 flex items-center justify-center">
            <Sprout size={16} className="text-white" />
          </div>
          <div>
            <p className="font-display font-semibold text-earth-300 text-sm leading-tight">Agro-Weather</p>
            <p className="text-xs text-canopy-400/70 font-mono">Intelligence API</p>
          </div>
        </div>

        {/* Add farm button */}
        <div className="px-4 py-3">
          <button
            onClick={() => setShowRegister(true)}
            className="w-full flex items-center gap-2 px-3 py-2.5 rounded-lg border border-dashed border-canopy-600/50 text-canopy-400 text-sm hover:border-canopy-400 hover:text-canopy-300 hover:bg-canopy-700/20 transition-all"
          >
            <Plus size={14} />
            Register Farm
          </button>
        </div>

        {/* Farm list */}
        <div className="flex-1 overflow-y-auto px-4 pb-4">
          {loading.farms ? (
            <div className="space-y-2">
              {[1,2,3].map(i => <div key={i} className="skeleton h-16 w-full" />)}
            </div>
          ) : (
            <FarmSidebar
              farms={farms}
              selectedId={selectedFarm?.id ?? null}
              onSelect={setSelectedFarm}
              onDelete={handleDelete}
            />
          )}
        </div>

        {/* API status */}
        <div className="px-5 py-3 border-t border-canopy-700/40 flex items-center gap-2">
          {error
            ? <><WifiOff size={12} className="text-red-400" /><span className="text-xs text-red-400">API offline</span></>
            : <><Wifi size={12} className="text-canopy-400" /><span className="text-xs text-canopy-400">Connected</span></>
          }
        </div>
      </aside>

      {/* Main content */}
      <main className="flex-1 overflow-y-auto">
        {!selectedFarm ? (
          <EmptyState onRegister={() => setShowRegister(true)} />
        ) : (
          <div className="p-6 space-y-6 animate-fade-up">
            {/* Farm header */}
            <div className="flex items-start justify-between">
              <div>
                <h1 className="font-display text-2xl font-semibold text-earth-300">
                  {selectedFarm.name}
                </h1>
                <p className="text-canopy-400 text-sm mt-0.5">
                  {selectedFarm.location ?? `${selectedFarm.lat.toFixed(4)}, ${selectedFarm.lon.toFixed(4)}`}
                  {selectedFarm.cropType && (
                    <span className="ml-2 px-2 py-0.5 rounded-full bg-canopy-700/40 text-canopy-300 text-xs border border-canopy-600/30">
                      {selectedFarm.cropType}
                    </span>
                  )}
                </p>
              </div>
              <p className="text-xs text-canopy-500 font-mono mt-1">{selectedFarm.id}</p>
            </div>

            {/* Top row: current weather */}
            <WeatherCard weather={weather} loading={loading.weather} />

            {/* Forecast chart */}
            <ForecastChart forecast={forecast} loading={loading.weather} />

            {/* Advisory */}
            <AdvisoryPanel advisory={advisory} loading={loading.weather} />
          </div>
        )}
      </main>

      {showRegister && (
        <RegisterFarmModal
          onClose={() => setShowRegister(false)}
          onSubmit={handleRegister}
        />
      )}
    </div>
  );
}

function EmptyState({ onRegister }: { onRegister: () => void }) {
  return (
    <div className="h-full flex flex-col items-center justify-center gap-4 text-center px-8">
      <div className="w-16 h-16 rounded-2xl bg-canopy-700/30 flex items-center justify-center border border-canopy-600/30">
        <Sprout size={28} className="text-canopy-400" />
      </div>
      <div>
        <h2 className="font-display text-xl text-earth-300 font-semibold">No farms yet</h2>
        <p className="text-canopy-400 text-sm mt-1 max-w-xs">
          Register your first farm to start tracking weather conditions and advisory insights.
        </p>
      </div>
      <button
        onClick={onRegister}
        className="px-5 py-2.5 rounded-lg bg-canopy-500 text-white text-sm font-medium hover:bg-canopy-400 transition-colors"
      >
        Register First Farm
      </button>
    </div>
  );
}
