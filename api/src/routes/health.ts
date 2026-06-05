import { Router, type Request, type Response } from "express";
import { prisma } from "../db/client";
import { getUsage } from "../services/weatherClient";
import { logger } from "../services/logger";

export const healthRouter = Router();

healthRouter.get("/", async (_req: Request, res: Response) => {
  const result: {
    status: string;
    database: string;
    upstream: object | null;
    upstreamError?: string;
  } = {
    status: "ok",
    database: "disconnected",
    upstream: null,
  };

  // Check DB
  try {
    await prisma.$queryRaw`SELECT 1`;
    result.database = "connected";
  } catch (err) {
    logger.error({ err }, "DB health check failed");
    result.database = "disconnected";
    result.status = "degraded";
  }

  // Check upstream quota (cached — won't cost quota on every ping)
  try {
    const usage = await getUsage();
    result.upstream = {
      plan: usage.plan,
      requests: {
        used: usage.requests.used,
        limit: usage.requests.limit,
        remaining: usage.requests.limit - usage.requests.used,
      },
      ai_requests: {
        used: usage.ai_requests.used,
        limit: usage.ai_requests.limit,
        remaining: usage.ai_requests.limit - usage.ai_requests.used,
      },
    };
  } catch (err) {
    logger.warn({ err }, "Upstream health check failed");
    result.upstream = null;
    result.upstreamError = "Could not reach WeatherAI API";
    if (result.status === "ok") result.status = "degraded";
  }

  const httpStatus = result.status === "ok" ? 200 : 503;
  res.status(httpStatus).json(result);
});
