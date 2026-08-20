import express from "express";
import cors from "cors";
import dotenv from "dotenv";

import authRoutes from "./routes/authRoutes";
import urlRoutes from "./routes/urlRoutes";
import { redirectToLongUrl } from "./controllers/urlController";

dotenv.config();

const app = express();

app.use(cors());
app.use(express.json());

// Health check — useful later for confirming EC2/Docker deployment is alive.
app.get("/health", (_req, res) => {
  res.json({ status: "ok" });
});

app.use("/api/auth", authRoutes);
app.use("/api/urls", urlRoutes);

// Public redirect route. Kept at the root level (not under /api) so short
// links look like http://yourdomain.com/abc1234 instead of /api/abc1234.
app.get("/:shortCode", redirectToLongUrl);

const PORT = process.env.PORT || 4000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
