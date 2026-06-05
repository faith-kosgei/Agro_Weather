import { generateAdvisory } from "../services/advisory";
import type { WeatherAIForecastDay } from "../types";

const basDay: WeatherAIForecastDay = {
  date: "2026-06-10",
  temp_max: 26,
  temp_min: 16,
  condition: "Partly Cloudy",
  precip_mm: 0,
  humidity: 60,
  wind_speed: 15,
  uv_index: 5,
};

function makeForecast(overrides: Partial<WeatherAIForecastDay>[]): WeatherAIForecastDay[] {
  return overrides.map((o, i) => ({
    ...basDay,
    date: `2026-06-${10 + i}`,
    ...o,
  }));
}

describe("generateAdvisory", () => {
  it("returns low risk and favourable advice on a calm day", () => {
    const result = generateAdvisory("f1", "Test Farm", "maize", makeForecast([{}]));
    expect(result.advisory[0].risk).toBe("low");
    expect(result.advisory[0].advice).toContain("Favourable");
  });

  it("returns high risk on heavy rain day", () => {
    const result = generateAdvisory("f1", "Test Farm", null, makeForecast([{ precip_mm: 45 }]));
    expect(result.advisory[0].risk).toBe("high");
    expect(result.advisory[0].advice).toContain("Heavy rainfall");
  });

  it("returns high risk on extreme wind", () => {
    const result = generateAdvisory("f1", "Test Farm", null, makeForecast([{ wind_speed: 70 }]));
    expect(result.advisory[0].risk).toBe("high");
    expect(result.advisory[0].advice).toContain("Strong winds");
  });

  it("warns about frost risk for maize on cold nights", () => {
    const result = generateAdvisory("f1", "Test Farm", "maize", makeForecast([{ temp_min: 7 }]));
    expect(result.advisory[0].advice).toContain("frost risk on maize");
  });

  it("warns about heat stress for tea on hot days", () => {
    const result = generateAdvisory("f1", "Tea Farm", "tea", makeForecast([{ temp_max: 36 }]));
    expect(result.advisory[0].advice).toContain("tea");
  });

  it("summary flags high risk days correctly", () => {
    const result = generateAdvisory(
      "f1",
      "Test Farm",
      null,
      makeForecast([{ precip_mm: 45 }, { precip_mm: 35 }, {}])
    );
    expect(result.summary).toContain("2 high-risk day(s)");
  });

  it("summary is positive when all days are low risk", () => {
    const result = generateAdvisory("f1", "Test Farm", null, makeForecast([{}, {}, {}]));
    expect(result.summary).toContain("favourable");
  });

  it("includes farmId, farmName, cropType in response", () => {
    const result = generateAdvisory("farm-99", "Kapkimolwa Farm", "tea", makeForecast([{}]));
    expect(result.farmId).toBe("farm-99");
    expect(result.farmName).toBe("Kapkimolwa Farm");
    expect(result.cropType).toBe("tea");
  });
});
