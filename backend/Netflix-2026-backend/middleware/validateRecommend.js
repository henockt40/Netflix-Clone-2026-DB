import { MOODS } from "../services/TmdbService.js";

export function validateRecommend(req, res, next) {
  const { mood = "surprise", favorites = [] } = req.body || {};
  if (typeof mood !== "string" || !Object.hasOwn(MOODS, mood)) {
    return res.status(400).json({ message: "Invalid mood. Choose a listed category." });
  }
  if (!Array.isArray(favorites) || favorites.length > 12 ||
      favorites.some(f => !(typeof f === "string" || (f && typeof f === "object" && !Array.isArray(f))))) {
    return res.status(400).json({ message: "favorites must be an array of up to 12 saved movie titles." });
  }
  req.body = { mood, favorites };
  return next();
}
