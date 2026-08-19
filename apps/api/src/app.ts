import cors from "cors";
import express from "express";
import { router } from "./routes";
import { errorHandler } from "./middleware/errorHandler";

export const app = express();

app.use(
  cors({
    origin: process.env.FRONTEND_URL || "http://localhost",
    credentials: true,
    methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization", "x-admin-password"],
  }),
);

app.use(express.json());

app.use("/api", router);

app.use(errorHandler);
