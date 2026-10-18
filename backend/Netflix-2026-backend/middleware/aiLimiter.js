import { rateLimit } from "express-rate-limit";

// Gemini calls may incur cost; bound each client's requests.
export const aiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: 12,
  standardHeaders: "draft-7",
  legacyHeaders: false,
  message: { message: "Too many recommendations. Please try again later." },
});
