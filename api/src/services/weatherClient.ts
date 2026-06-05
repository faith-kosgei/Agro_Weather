import axios from "axios";
import axiosRetry from "axios-retry";
import NodeCache from "node-cache";
import { logger } from "./logger";
import type {
  WeatherAICurrentResponse,
  WeatherAIForecastResponse,
  WeatherAIUsageResponse,
} from "../types";

const BASE_URL = "https://api.weather-ai.co";

// In-memory cache for usage stats (5-min TTL) — preserves quota
const usageCache = new NodeCache({ stdTTL: 300 });

const client = axios.create({
  baseURL: BASE_URL,
  timeout: 10000,
  headers: {
    Authorization: `Bearer ${process.env.WEATHERAI_API_KEY}`,
    "Content-Type": "application/json",
  },
});

// Exponential backoff on 500/503
axiosRetry(client, {
  retries: 3,
  retryDelay: axiosRetry.exponentialDelay,
  retryCondition: (error) => {
    const status = error.response?.status;
    return status === 500 || status === 503;
  },
  onRetry: (retryCount, error) => {
    logger.warn({ retryCount, status: error.response?.status }, "Retrying WeatherAI request");
  },
});

// Log remaining quota on every response
client.interceptors.response.use((response) => {
  const remaining = response.headers["x-ratelimit-remaining"];
  const limit = response.headers["x-ratelimit-limit"];
  if (remaining !== undefined) {
    logger.info({ remaining, limit }, "WeatherAI quota");
    if (Number(remaining) < 100) {
      logger.warn({ remaining }, "WeatherAI quota running low");
    }
  }
  return response;
});

export async function getCurrentWeather(
  lat: number,
  lon: number
): Promise<WeatherAICurrentResponse> {
  const { data } = await client.get<WeatherAICurrentResponse>("/v1/current", {
    params: { lat, lon, ai: false }, // ai=false to preserve 200 AI quota
  });
  return data;
}

export async function getForecast(
  lat: number,
  lon: number,
  days = 7
): Promise<WeatherAIForecastResponse> {
  const cappedDays = Math.min(days, 7); // free plan max
  const { data } = await client.get<WeatherAIForecastResponse>("/v1/forecast", {
    params: { lat, lon, days: cappedDays, ai: false },
  });
  logger.info({ forecastTopLevelKeys: Object.keys(data as object) }, "WeatherAI forecast response shape");
  return data;
 
}

export async function getUsage(): Promise<WeatherAIUsageResponse> {
  const cached = usageCache.get<WeatherAIUsageResponse>("usage");
  if (cached) {
    logger.debug("Returning cached usage stats");
    return cached;
  }
  const { data } = await client.get<WeatherAIUsageResponse>("/v1/usage");
  usageCache.set("usage", data);
  return data;
}
