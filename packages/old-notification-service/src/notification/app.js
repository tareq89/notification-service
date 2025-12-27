// src/app.js
import express from "express";
import cors from "cors";
import morgan from "morgan";
import { env } from "./config/env.js";
import healthRoutes from "./routes/health.routes.js";
import { errorHandler } from "./middlewares/error.middleware.js";

const app = express();

// Core middlewares
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

if (env.nodeEnv !== "test") {
  app.use(morgan("dev"));
}

// Routes
app.use("/health", healthRoutes);

// 404
app.use((req, res) => {
  res.status(404).json({ message: "Route not found" });
});

// Error handler (last)
app.use(errorHandler);

export default app;
