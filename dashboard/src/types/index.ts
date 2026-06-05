export interface Farm {
  id: string;
  name: string;
  lat: number;
  lon: number;
  cropType: string | null;
  location: string | null;
  createdAt: string;
}

export interface CurrentWeather {
  current: {
    temp: number;
    feels_like: number;
    humidity: number;
    wind_speed: number;
    wind_dir: string;
    condition: string;
    uv_index: number;
    precip_mm: number;
  };
  cached: boolean;
}

export interface ForecastDay {
  date: string;
  temp_max: number;
  temp_min: number;
  condition: string;
  precip_mm: number;
  humidity: number;
  wind_speed: number;
  uv_index: number;
}

export interface ForecastResponse {
  forecast: ForecastDay[];
  cached: boolean;
}

export interface AdvisoryItem {
  day: string;
  condition: string;
  risk: "low" | "medium" | "high";
  advice: string;
}

export interface Advisory {
  farmId: string;
  farmName: string;
  cropType: string | null;
  generatedAt: string;
  advisory: AdvisoryItem[];
  summary: string;
}
