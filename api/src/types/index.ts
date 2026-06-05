export interface WeatherAICurrentResponse {
  current: {
    temp: number;
    feels_like: number;
    humidity: number;
    wind_speed: number;
    wind_dir: string;
    condition: string;
    icon: string;
    uv_index: number;
    precip_mm: number;
  };
  ai_summary?: string;
  location: {
    lat: number;
    lon: number;
  };
}

export interface WeatherAIForecastDay {
  date: string;
  temp_max: number;
  temp_min: number;
  condition: string;
  precip_mm: number;
  humidity: number;
  wind_speed: number;
  uv_index: number;
}

export interface WeatherAIForecastResponse {
  current: WeatherAICurrentResponse["current"];
  forecast: WeatherAIForecastDay[];
  ai_summary?: string;
  location: { lat: number; lon: number };
}

export interface WeatherAIUsageResponse {
  plan: string;
  requests: { used: number; limit: number };
  ai_requests: { used: number; limit: number };
  period_start: string;
  period_end: string;
}

export interface AdvisoryItem {
  day: string;
  condition: string;
  risk: "low" | "medium" | "high";
  advice: string;
}

export interface FarmAdvisoryResponse {
  farmId: string;
  farmName: string;
  cropType: string | null;
  generatedAt: string;
  advisory: AdvisoryItem[];
  summary: string;
}

export interface ApiError {
  error: string;
  code?: string;
  details?: unknown;
}
