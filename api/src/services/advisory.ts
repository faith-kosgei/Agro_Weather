import type { WeatherAIForecastDay } from "../types";
import type { AdvisoryItem, FarmAdvisoryResponse } from "../types";

function assessRisk(day: WeatherAIForecastDay): "low" | "medium" | "high" {
  if (day.precip_mm > 30 || day.wind_speed > 60 || day.temp_max > 38) return "high";
  if (day.precip_mm > 15 || day.wind_speed > 40 || day.temp_max > 33) return "medium";
  return "low";
}

function buildAdvice(day: WeatherAIForecastDay, cropType: string | null): string {
  const advices: string[] = [];

  if (day.precip_mm > 30) {
    advices.push("Heavy rainfall expected — avoid field operations and delay fertiliser application.");
  } else if (day.precip_mm > 15) {
    advices.push("Moderate rain forecast — good conditions for irrigation scheduling, delay spraying.");
  } else if (day.precip_mm < 2 && day.temp_max > 30) {
    advices.push("Dry and hot — consider irrigation if soil moisture is low.");
  }

  if (day.wind_speed > 60) {
    advices.push("Strong winds expected — do not spray pesticides or herbicides.");
  } else if (day.wind_speed > 40) {
    advices.push("Moderate winds — light spraying operations may be affected.");
  }

  if (day.uv_index >= 8) {
    advices.push("High UV — schedule outdoor work early morning or late afternoon.");
  }

  if (day.temp_max > 35 && cropType?.toLowerCase().includes("tea")) {
    advices.push("Heat stress risk for tea — ensure shade and adequate soil moisture.");
  }

  if (day.temp_min < 10 && cropType?.toLowerCase().includes("maize")) {
    advices.push("Cold night temperatures — monitor for frost risk on maize.");
  }

  if (advices.length === 0) {
    advices.push("Favourable conditions — good day for general farm activities.");
  }

  return advices.join(" ");
}

export function generateAdvisory(
  farmId: string,
  farmName: string,
  cropType: string | null,
  forecast: WeatherAIForecastDay[]
): FarmAdvisoryResponse {
  const advisory: AdvisoryItem[] = forecast.map((day) => ({
    day: day.date,
    condition: day.condition,
    risk: assessRisk(day),
    advice: buildAdvice(day, cropType),
  }));

  const highRiskDays = advisory.filter((a) => a.risk === "high").length;
  const mediumRiskDays = advisory.filter((a) => a.risk === "medium").length;

  let summary: string;
  if (highRiskDays > 0) {
    summary = `${highRiskDays} high-risk day(s) in the 7-day outlook. Review alerts carefully before planning field operations.`;
  } else if (mediumRiskDays > 2) {
    summary = `Mixed conditions ahead with ${mediumRiskDays} moderate-risk days. Plan operations around the better windows.`;
  } else {
    summary = "Generally favourable conditions over the next 7 days. Good week for farm activities.";
  }

  return {
    farmId,
    farmName,
    cropType,
    generatedAt: new Date().toISOString(),
    advisory,
    summary,
  };
}
