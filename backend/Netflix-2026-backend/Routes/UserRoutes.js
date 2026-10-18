import { Router } from "express";
import { currentUser, login, register } from "../controllers/UserC.js";
import { authLimiter } from "../middleware/authLimiter.js";
import { validateAuth } from "../middleware/validateAuth.js";
import { requireAuth } from "../middleware/requireAuth.js";

const router = Router();
router.post("/register", authLimiter, validateAuth(true), register);
router.post("/login", authLimiter, validateAuth(false), login);
router.get("/me", requireAuth, currentUser);
export default router;
