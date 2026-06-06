import "dotenv/config";
import express from "express";
import { farmsRouter } from "./routes/farms";
import { healthRouter } from "./routes/health";
import { errorHandler } from "./middleware/errorHandler";
import { logger } from "./services/logger";


const app = express();
const PORT = process.env.PORT;

app.use(express.json());



// Request logging
app.use((req, _res, next) => {
  logger.info({ method: req.method, path: req.path }, "Incoming request");
  next();
});

// Routes
app.use("/health", healthRouter);
app.use("/farms", farmsRouter);

app.get("/", (_req, res) => {
  res.json({
    status: "ok",
    message: "Agro-Weather API running"
  });
});

// 404
app.use((_req, res) => {
  res.status(404).json({ error: "Route not found" });
});

// Error handler — must be last
app.use(errorHandler);

app.listen(PORT, () => {
  logger.info({ port: PORT }, "Agro-Weather API running");
});


export { app };
