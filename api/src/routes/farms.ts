import { Router, type Request, type Response, type NextFunction } from "express";
import { body, param, validationResult } from "express-validator";
import { prisma } from "../db/client";
import { getCurrentWeather, getForecast } from "../services/weatherClient";
import { getCachedWeather, setCachedWeather } from "../services/cache";
import { generateAdvisory } from "../services/advisory";
import { logger } from "../services/logger";
import type { WeatherAICurrentResponse, WeatherAIForecastResponse } from "../types";

export const farmsRouter = Router();

// Validation helpers
const farmValidation = [
  body("name").trim().notEmpty().withMessage("Farm name is required"),
  body("lat").isFloat({ min: -90, max: 90 }).withMessage("Invalid latitude"),
  body("lon").isFloat({ min: -180, max: 180 }).withMessage("Invalid longitude"),
  body("cropType").optional().trim().isString(),
  body("location").optional().trim().isString(),
];

function validate(req: Request, res: Response): boolean {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    res.status(400).json({ error: "Validation failed", details: errors.array() });
    return false;
  }
  return true;
}

// POST /farms — Register a farm
farmsRouter.post(
  "/",
  farmValidation,
  async (req: Request, res: Response, next: NextFunction) => {
    if (!validate(req, res)) return;
    try {
      const { name, lat, lon, cropType, location } = req.body as {
        name: string;
        lat: number;
        lon: number;
        cropType?: string;
        location?: string;
      };

      const farm = await prisma.farm.create({
        data: { name, lat, lon, cropType, location },
      });

      logger.info({ farmId: farm.id }, "Farm registered");
      res.status(201).json(farm);
    } catch (err) {
      next(err);
    }
  }
);

// GET /farms — List all farms
farmsRouter.get("/", async (_req: Request, res: Response, next: NextFunction) => {
  try {
    const farms = await prisma.farm.findMany({
      orderBy: { createdAt: "desc" },
      select: { id: true, name: true, lat: true, lon: true, cropType: true, location: true, createdAt: true },
    });
    res.json({ farms, count: farms.length });
  } catch (err) {
    next(err);
  }
});

// GET /farms/:id — Get single farm
farmsRouter.get(
  "/:id",
  param("id").notEmpty(),
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const farm = await prisma.farm.findUnique({ where: { id: req.params.id } });
      if (!farm) {
        res.status(404).json({ error: "Farm not found" });
        return;
      }
      res.json(farm);
    } catch (err) {
      next(err);
    }
  }
);

// GET /farms/:id/weather — Current weather (cached 30 min)
farmsRouter.get(
  "/:id/weather",
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const farm = await prisma.farm.findUnique({ where: { id: req.params.id } });
      if (!farm) { res.status(404).json({ error: "Farm not found" }); return; }

      const cached = await getCachedWeather<WeatherAICurrentResponse>(farm.id, "current");
      if (cached) {
        res.json({ ...cached, cached: true });
        return;
      }

      const weather = await getCurrentWeather(farm.lat, farm.lon);
      await setCachedWeather(farm.id, "current", weather);

      logger.info({ farmId: farm.id }, "Fetched current weather");
      res.json({ ...weather, cached: false });
    } catch (err) {
      next(err);
    }
  }
);

// GET /farms/:id/forecast — 7-day forecast (cached 30 min)
farmsRouter.get(
  "/:id/forecast",
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const farm = await prisma.farm.findUnique({ where: { id: req.params.id } });
      if (!farm) { res.status(404).json({ error: "Farm not found" }); return; }

      const cached = await getCachedWeather<WeatherAIForecastResponse>(farm.id, "forecast");
      if (cached) {
        res.json({ ...cached, cached: true });
        return;
      }

      const forecast = await getForecast(farm.lat, farm.lon, 7);
      await setCachedWeather(farm.id, "forecast", forecast);

      logger.info({ farmId: farm.id }, "Fetched 7-day forecast");
      res.json({ ...forecast, cached: false });
    } catch (err) {
      next(err);
    }
  }
);

// GET /farms/:id/advisory — Agronomic advisory from forecast
farmsRouter.get(
  "/:id/advisory",
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const farm = await prisma.farm.findUnique({ where: { id: req.params.id } });
      if (!farm) { res.status(404).json({ error: "Farm not found" }); return; }

      // Reuse cached forecast if available
      let forecastData = await getCachedWeather<WeatherAIForecastResponse>(farm.id, "forecast");
      if (!forecastData) {
        forecastData = await getForecast(farm.lat, farm.lon, 7);
        await setCachedWeather(farm.id, "forecast", forecastData);
      }

      const advisory = generateAdvisory(
        farm.id,
        farm.name,
        farm.cropType,
        forecastData.forecast
      );

      logger.info({ farmId: farm.id }, "Advisory generated");
      res.json(advisory);
    } catch (err) {
      next(err);
    }
  }
);

// DELETE /farms/:id
farmsRouter.delete(
  "/:id",
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const farm = await prisma.farm.findUnique({ where: { id: req.params.id } });
      if (!farm) { res.status(404).json({ error: "Farm not found" }); return; }
      await prisma.farm.delete({ where: { id: req.params.id } });
      res.status(204).send();
    } catch (err) {
      next(err);
    }
  }
);
