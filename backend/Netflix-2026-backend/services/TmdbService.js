const TMDB_ROOT = "https://api.themoviedb.org/3";

export const MOODS = Object.freeze({
  surprise: { label: "Surprise me", genre: "" },
  adventurous: { label: "Adventurous", genre: "28" },
  funny: { label: "Funny", genre: "35" },
  romantic: { label: "Romantic", genre: "10749" },
  mysterious: { label: "Mysterious", genre: "9648" },
  scary: { label: "Scary", genre: "27" },
  relaxed: { label: "Relaxed", genre: "18" },
});

async function tmdbGet(path, params) {
  const apiKey = process.env.TMDB_API_KEY;
  if (!apiKey || apiKey.includes("your_")) {
    const error = new Error("Set TMDB_API_KEY in the backend .env to enable recommendations.");
    error.status = 503;
    throw error;
  }
  const url = new URL(`${TMDB_ROOT}${path}`);
  url.searchParams.set("api_key", apiKey);
  url.searchParams.set("language", "en-US");
  for (const [key, value] of Object.entries(params)) {
    if (value) url.searchParams.set(key, value);
  }
  const response = await fetch(url, { signal: AbortSignal.timeout(8000) });
  if (!response.ok) {
    const error = new Error(`TMDB could not supply recommendations (HTTP ${response.status}).`);
    error.status = 502;
    throw error;
  }
  const data = await response.json();
  return Array.isArray(data.results) ? data.results : [];
}

export async function getCandidateMovies(mood) {
  const moodConfig = MOODS[mood] ?? MOODS.surprise;
  const requests = [
    tmdbGet("/discover/movie", {
      sort_by: "popularity.desc", include_adult: "false", with_genres: moodConfig.genre,
    }),
    tmdbGet("/trending/movie/week", {}),
  ];
  // One failed feed does not suppress the other feed.
  const results = await Promise.allSettled(requests);
  const successes = results.filter((r) => r.status === "fulfilled");
  if (!successes.length) throw results[0].reason;
  const unique = new Map();
  for (const result of successes) {
    for (const movie of result.value) {
      if (!Number.isSafeInteger(movie.id) || !movie.poster_path || movie.adult) continue;
      if (!unique.has(movie.id)) unique.set(movie.id, {
        id: movie.id,
        media_type: "movie",
        title: movie.title || "Movie",
        overview: movie.overview || "",
        poster_path: movie.poster_path,
        backdrop_path: movie.backdrop_path || null,
        vote_average: movie.vote_average,
        release_date: movie.release_date || "",
      });
    }
  }
  return [...unique.values()].slice(0, 35);
}
