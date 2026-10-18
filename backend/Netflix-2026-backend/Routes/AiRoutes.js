import { Router } from "express";
import { requireAuth } from "../middleware/requireAuth.js";
import { validateRecommend } from "../middleware/validateRecommend.js";
import { aiLimiter } from "../middleware/aiLimiter.js";
import { recommend } from "../controllers/AiC.js";

const router = Router();
router.post("/recommend", requireAuth, aiLimiter, validateRecommend, recommend);
export default router;
