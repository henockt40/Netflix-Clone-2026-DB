import { useState } from "react";
import { authRequest } from "../Auth/authApi.js";
import { useAuth } from "../Auth/AuthContext.jsx";
import { useWatchlist } from "./WatchlistContext.jsx";
import MovieCard from "../Components/MovieCard/MovieCard.jsx";
import styles from "./Recommendations.module.css";

const MOODS = [
  { value: "surprise", label: "Surprise me" },
  { value: "funny", label: "Funny" },
  { value: "adventurous", label: "Adventurous" },
  { value: "romantic", label: "Romantic" },
  { value: "mysterious", label: "Mysterious" },
  { value: "scary", label: "Scary" },
  { value: "relaxed", label: "Relaxed" },
];

export default function Recommendations() {
  const { token } = useAuth();
  const { items } = useWatchlist();
  const [mood, setMood] = useState("surprise");
  const [result, setResult] = useState(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");

  async function getRecommendations(event) {
    event.preventDefault();
    setBusy(true);
    setError("");
    setResult(null);
    try {
      const response = await authRequest("/ai/recommend", {
        method: "POST", token,
        body: { mood, favorites: items.slice(0, 12).map((item) => item.title) },
      });
      setResult(response);
    } catch (err) {
      setError(err.message || "Could not get recommendations.");
    } finally { setBusy(false); }
  }

  return <main className={styles.page}>
    <h1>Discover Movies</h1>
    <p className={styles.intro}>Get suggestions for your mood and saved titles. Movies come from TMDB.</p>
    <form onSubmit={getRecommendations} className={styles.form}>
      <label htmlFor="movie-mood">What are you in the mood for?</label>
      <select id="movie-mood" value={mood} onChange={e => setMood(e.target.value)}>
        {MOODS.map((item) => <option key={item.value} value={item.value}>{item.label}</option>)}
      </select>
      <button type="submit" disabled={busy}>{busy ? "Finding movies…" : "Recommend Movies"}</button>
    </form>
    {error && <p role="alert" className={styles.error}>{error}</p>}
    {result && <section aria-live="polite">
      <p className={styles.info}>{result.message} {result.source === "gemini" ? "(AI-ranked)" : "(TMDB)"}</p>
      {result.movies?.length ? <div className={styles.grid}>
        {result.movies.map((movie) => <div key={movie.id} className={styles.item}>
          <MovieCard movie={movie} defaultType="movie" />
          {movie.reason && <p className={styles.reason}>{movie.reason}</p>}
        </div>)}
      </div> : <p>No recommendations available right now.</p>}
    </section>}
  </main>;
}
