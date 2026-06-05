import type { Farm, CurrentWeather, ForecastResponse, Advisory } from "@/types";

const BASE = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:4000";

async function apiFetch<T>(path: string, options?: RequestInit): Promise<T> {
  const res = await fetch(`${BASE}${path}`, {
    headers: { "Content-Type": "application/json" },
    ...options,
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({ error: "Unknown error" }));
    throw new Error(err.error ?? `HTTP ${res.status}`);
  }
  return res.json() as Promise<T>;
}

export const api = {
  farms: {
    list: () => apiFetch<{ farms: Farm[]; count: number }>("/farms"),
    get: (id: string) => apiFetch<Farm>(`/farms/${id}`),
    create: (data: Omit<Farm, "id" | "createdAt">) =>
      apiFetch<Farm>("/farms", { method: "POST", body: JSON.stringify(data) }),
    delete: (id: string) =>
      fetch(`${BASE}/farms/${id}`, { method: "DELETE" }),
  },
  weather: {
    current: (id: string) => apiFetch<CurrentWeather>(`/farms/${id}/weather`),
    forecast: (id: string) => apiFetch<ForecastResponse>(`/farms/${id}/forecast`),
    advisory: (id: string) => apiFetch<Advisory>(`/farms/${id}/advisory`),
  },
};
