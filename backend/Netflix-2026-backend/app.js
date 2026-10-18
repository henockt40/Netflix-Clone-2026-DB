import "dotenv/config";
import express from "express";
import cors from "cors";
import helmet from "helmet";
import allRoutes from "./AllRoutes.js";
import { notFound, errorHandler } from "./middleware/errorHandler.js";
import { pool } from "./db/db.js";

const app = express();
app.disable("x-powered-by");
app.use(helmet());
app.use(cors({
  origin: (process.env.CLIENT_ORIGIN || "http://localhost:5173")
    .split(",").map(origin => origin.trim()),
}));
app.use(express.json({ limit: "16kb" }));
app.use("/api", allRoutes);
app.use(notFound);
app.use(errorHandler);

if (!process.env.JWT_SECRET || process.env.JWT_SECRET.length < 32 || process.env.JWT_SECRET.startsWith("REPLACE_")) {
  console.error("Set JWT_SECRET in backend/.env to a random secret of at least 32 characters.");
  process.exit(1);
}

try {
  await pool.query("SELECT id FROM users LIMIT 0");
  const port = Number(process.env.PORT || 3777);
  app.listen(port, () => console.log(`Netflix API running at http://localhost:${port}`));
} catch (error) {
  console.error(`Database startup failed: ${error.message}`);
  console.error("Start MySQL, run db/schema.sql, and check .env in this backend folder.");
  process.exit(1);
}
