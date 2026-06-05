import { PrismaClient } from "@prisma/client";
import { logger } from "../services/logger";

const globalForPrisma = globalThis as unknown as { prisma?: PrismaClient };

export const prisma =
  globalForPrisma.prisma ??
  new PrismaClient({
    log: [
      { level: "warn", emit: "event" },
      { level: "error", emit: "event" },
    ],
  });

prisma.$on("warn" as never, (e: unknown) => logger.warn(e, "Prisma warning"));
prisma.$on("error" as never, (e: unknown) => logger.error(e, "Prisma error"));

if (process.env.NODE_ENV !== "production") globalForPrisma.prisma = prisma;
