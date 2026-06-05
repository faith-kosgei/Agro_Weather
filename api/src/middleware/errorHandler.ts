import type { Request, Response, NextFunction } from "express";
import { logger } from "../services/logger";
import axios from "axios";

export function errorHandler(
  err: unknown,
  _req: Request,
  res: Response,
  _next: NextFunction
): void {
  // WeatherAI upstream errors
  if (axios.isAxiosError(err)) {
    const status = err.response?.status;
    const upstreamData = err.response?.data;

    logger.error({ status, upstreamData }, "Upstream WeatherAI error");

    if (status === 401) {
      res.status(502).json({ error: "Invalid or missing WeatherAI API key", code: "UPSTREAM_AUTH" });
      return;
    }
    if (status === 403) {
      res.status(403).json({ error: "This feature is not available on the free plan", code: "PLAN_LIMIT" });
      return;
    }
    if (status === 429) {
      res.status(429).json({ error: "WeatherAI monthly quota exceeded", code: "QUOTA_EXCEEDED" });
      return;
    }
    if (status === 400) {
      res.status(400).json({ error: "Bad request to upstream API", code: "UPSTREAM_BAD_REQUEST" });
      return;
    }

    res.status(502).json({ error: "Upstream weather service error", code: "UPSTREAM_ERROR" });
    return;
  }

  logger.error({ err }, "Unhandled error");
  res.status(500).json({ error: "Internal server error", code: "INTERNAL_ERROR" });
}
