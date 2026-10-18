import { getCandidateMovies, MOODS } from "./TmdbService.js";
import { rankMoviesWithGemini } from "./GeminiService.js";

export function safeFavorites(value) {
  if (!Array.isArray(value)) return [];
  return value.slice(0, 12).map((v) => {
    if (typeof v === "string") return v.slice(0, 80);
    if (v && typeof v === "object") return String(v.title || v.name || "").slice(0, 80);
    return "";
  }).map(s => s.trim()).filter(Boolean);
}

export function mergeGeminiChoices(candidates, choices) {
  const approved = new Map(candidates.map(item => [item.id, item]));
  const recommendations = [];
  const seen = new Set();
  for (const choice of Array.isArray(choices) ? choices : []) {
    const id = Number(choice?.id);
    const movie = approved.get(id);
    if (!movie || seen.has(id)) continue;
    seen.add(id);
    const reason = typeof choice.reason === "string" ? choice.reason.slice(0, 180) : "";
    recommendations.push({ ...movie, reason });
    if (recommendations.length >= 8) break;
  }
  // Unavailable / invalid AI IDs never enter the response. Fill with verified TMDB titles.
  for (const movie of candidates) {
    if (recommendations.length >= 8) break;
    if (!seen.has(movie.id)) recommendations.push({ ...movie, reason: "Popular on TMDB" });
  }
  return recommendations;
}

export async function recommendMovies({ mood = "surprise", favorites = [] }) {
  if (!Object.hasOwn(MOODS, mood)) {
    const error = new Error("Choose a valid mood.");
    error.status = 400;
    throw error;
  }
  const candidates = await getCandidateMovies(mood);
  if (!candidates.length) return { source: "tmdb", movies: [], message: "No matching movies available." };
  if (!process.env.GEMINI_API_KEY?.trim()) {
    return {
      source: "tmdb", movies: candidates.slice(0, 8),
      message: "TMDB recommendations (set GEMINI_API_KEY for AI ranking).",
    };
  }
  try {
    const choices = await rankMoviesWithGemini({ mood, favorites: safeFavorites(favorites), candidates });
    if (!Array.isArray(choices) || !choices.length) throw new Error("No Gemini rankings were returned.");
    return { source: "gemini", movies: mergeGeminiChoices(candidates, choices), message: "Personalized suggestions ranked by Gemini." };
  } catch (error) {
    console.warn("Gemini unavailable; using TMDB suggestions:", error.message);
    return { source: "tmdb", movies: candidates.slice(0, 8), message: "Gemini unavailable; showing TMDB suggestions." };
  }
}
