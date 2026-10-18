import { recommendMovies } from "../services/RecommendationService.js";

export async function recommend(req, res, next) {
  try {
    const result = await recommendMovies({ mood: req.body.mood, favorites: req.body.favorites });
    return res.json(result);
  } catch (error) { next(error); }
}
