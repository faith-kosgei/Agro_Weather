import { prisma } from "../db/client";
import { logger } from "./logger";

const CACHE_TTL_MINUTES = 30;

export async function getCachedWeather<T>(
  farmId: string,
  type: "current" | "forecast"
): Promise<T | null> {
  try {
    const cached = await prisma.weatherCache.findUnique({
      where: { farmId_type: { farmId, type } },
    });

    if (!cached) return null;

    if (new Date() > cached.expiresAt) {
      logger.debug({ farmId, type }, "Cache expired");
      return null;
    }

    logger.debug({ farmId, type }, "Cache hit");
    return cached.data as T;
  } catch (err) {
    logger.error({ err }, "Cache read error");
    return null;
  }
}

export async function setCachedWeather<T>(
  farmId: string,
  type: "current" | "forecast",
  data: T
): Promise<void> {
  const expiresAt = new Date(Date.now() + CACHE_TTL_MINUTES * 60 * 1000);
  try {
    await prisma.weatherCache.upsert({
      where: { farmId_type: { farmId, type } },
      update: { data: data as object, fetchedAt: new Date(), expiresAt },
      create: { farmId, type, data: data as object, expiresAt },
    });
    logger.debug({ farmId, type, expiresAt }, "Cache set");
  } catch (err) {
    logger.error({ err }, "Cache write error");
  }
}
