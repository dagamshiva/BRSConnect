import express from "express";
import cors from "cors";
import helmet from "helmet";
import morgan from "morgan";

import authRoutes from "./routes/authRoutes";
import adminRoutes from "./routes/adminRoutes";
import pollRoutes from "./routes/pollRoutes";
import postRoutes from "./routes/postRoutes";
import reportRoutes from "./routes/reportRoutes";
import segmentRoutes from "./routes/segmentRoutes";
import trendingRoutes from "./routes/trendingRoutes";
import fakeNewsRoutes from "./routes/fakeNewsRoutes";
import userRoutes from "./routes/userRoutes";
import { errorHandler } from "./middlewares/errorHandler";

export const app = express();

app.use(helmet());
app.use(
  cors({
    origin: "*",
  }),
);
app.use(morgan("dev"));
app.use(express.json());

app.use("/api/auth", authRoutes);
app.use("/api/admin", adminRoutes);
app.use("/api/polls", pollRoutes);
app.use("/api/posts", postRoutes);
app.use("/api/reports", reportRoutes);
app.use("/api/segments", segmentRoutes);
app.use("/api/trending", trendingRoutes);
app.use("/api/fake-news", fakeNewsRoutes);
app.use("/api/users", userRoutes);

app.get("/health", (_req, res) => {
  res.json({ status: "ok", timestamp: new Date().toISOString() });
});

app.use(errorHandler);

