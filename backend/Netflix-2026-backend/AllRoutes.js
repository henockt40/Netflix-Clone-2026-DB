import { Router } from "express";
import userRoutes from "./Routes/UserRoutes.js";
import aiRoutes from "./Routes/AiRoutes.js";

// Central router keeps the exact API paths already used by the final React auth code.
const allRoutes = Router();
allRoutes.get("/health", (_req, res) => res.json({ status: "ok", service: "netflix-auth" }));
allRoutes.use("/auth", userRoutes);
allRoutes.use("/ai", aiRoutes);

export default allRoutes;
