import { useEffect, useState } from "react";
import { Link, useNavigate, useParams, useSearchParams } from "react-router-dom";
import movieInstance from "../Utility/MovieInstance";
import requests from "../Utility/requestURLs";
import SlideShow from "../Components/SlideShow/SlideShow";
import MovieCard from "../Components/MovieCard/MovieCard";
import { useAuth } from "../Auth/AuthContext.jsx";
import { useWatchlist } from "./WatchlistContext.jsx";

const apiKey = import.meta.env.VITE_TMDB_API_KEY;
const pageStyle = { minHeight: "65vh", color: "#fff", background: "#000", padding: "110px 3% 70px" };
const movieImage = "https://image.tmdb.org/t/p/w780";

function useMovies(url) {
  const [data, setData] = useState([]);
  const [status, setStatus] = useState("loading");
  useEffect(() => {
    if (!url) { setData([]); setStatus("ready"); return; }
    let canceled = false;
    setStatus("loading");
    movieInstance.get(url)
      .then(({ data: result }) => { if (!canceled) { setData(result.results || []); setStatus("ready"); } })
      .catch(() => { if (!canceled) { setData([]); setStatus("error"); } });
    return () => { canceled = true; };
  }, [url]);
  return { data, status };
}

export function CollectionPage({ category }) {
  const settings = {
    tv: { title: "TV Shows", url: requests.fetchNetflixOriginals, type: "tv" },
    movies: { title: "Movies", url: requests.fetchTopRatedMovies, type: "movie" },
    new: { title: "New & Popular", url: requests.fetchTrending, type: "movie" },
  }[category];
  const { data, status } = useMovies(settings.url);
  return <main style={pageStyle}>
    <h1>{settings.title}</h1>
    {status === "loading" && <p>Loading titles…</p>}
    {status === "error" && <p>Unable to load titles. Check the TMDB API key and connection.</p>}
    {status === "ready" && <SlideShow title={settings.title} movies={data} defaultType={settings.type} />}
  </main>;
}

export function SearchPage() {
  const [params] = useSearchParams();
  const query = (params.get("q") || "").trim();
  const url = query ? `/search/multi?api_key=${apiKey}&query=${encodeURIComponent(query)}&include_adult=false` : "";
  const { data, status } = useMovies(url);
  const results = data.filter((item) => (item.media_type === "movie" || item.media_type === "tv") && item.id);
  return <main style={pageStyle}>
    <h1>Search results {query && `for “${query}”`}</h1>
    {!query && <p>Use the search icon above and enter a movie or TV show title.</p>}
    {query && status === "loading" && <p>Searching…</p>}
    {query && status === "error" && <p>Search failed. Please check the TMDB API key.</p>}
    {query && status === "ready" && !results.length && <p>No titles found.</p>}
    {results.length > 0 && <CardGrid movies={results} />}
  </main>;
}

function CardGrid({ movies }) {
  return <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(290px, 1fr))", gap: "10px 0" }}>
    {movies.map((movie) => <MovieCard key={`${movie.media_type || "movie"}-${movie.id}`} movie={movie} defaultType={movie.media_type || "movie"} />)}
  </div>;
}

export function MyListPage() {
  const { items } = useWatchlist();
  return <main style={pageStyle}>
    <h1>My List</h1>
    <p style={{ color: "#aaa" }}>Saved on this browser for your account (not stored in MySQL).</p>
    {items.length ? <CardGrid movies={items} /> : <p>Your list is empty. Use the + button on a movie card to add a title.</p>}
  </main>;
}

const languages = [{ code: "en", label: "English" }, { code: "ko", label: "Korean" },
  { code: "hi", label: "Hindi" }, { code: "fr", label: "French" }, { code: "es", label: "Spanish" }];

export function LanguagePage() {
  const { language } = useParams();
  const chosen = languages.find((item) => item.code === language);
  const url = chosen ? `/discover/movie?api_key=${apiKey}&with_original_language=${chosen.code}&sort_by=popularity.desc` : "";
  const { data, status } = useMovies(url);
  return <main style={pageStyle}>
    <h1>Browse by Language</h1>
    <nav style={{ display: "flex", flexWrap: "wrap", gap: "16px", margin: "25px 0" }}>
      {languages.map((item) => <Link key={item.code} to={`/languages/${item.code}`} style={{ color: "white", textDecoration: chosen?.code === item.code ? "underline" : "none" }}>{item.label}</Link>)}
    </nav>
    {!chosen && <p>Select a language to explore popular movies.</p>}
    {status === "loading" && <p>Loading movies…</p>}
    {status === "error" && <p>Unable to load movies for this language.</p>}
    {chosen && status === "ready" && <CardGrid movies={data} />}
  </main>;
}

export function DetailsPage() {
  const { type, id } = useParams();
  const navigate = useNavigate();
  const { add, remove, has } = useWatchlist();
  const [movie, setMovie] = useState(null);
  const [error, setError] = useState("");
  const valid = ["tv", "movie"].includes(type) && /^\d+$/.test(id || "");
  useEffect(() => {
    if (!valid) return;
    let canceled = false;
    setMovie(null); setError("");
    movieInstance.get(`/${type}/${id}?api_key=${apiKey}&append_to_response=videos`)
      .then(({ data }) => { if (!canceled) setMovie(data); })
      .catch(() => { if (!canceled) setError("Could not load this title. Check your TMDB API key."); });
    return () => { canceled = true; };
  }, [type, id, valid]);
  const saved = movie && has(movie.id, type);
  const trailer = movie?.videos?.results?.find((video) => video.site === "YouTube" && video.type === "Trailer" && /^[a-zA-Z0-9_-]+$/.test(video.key));
  return <main style={pageStyle}>
    <button onClick={() => navigate(-1)} style={{ color: "white", background: "none", border: "none", cursor: "pointer" }}>← Back</button>
    {!valid && <p>Invalid movie or TV title link.</p>}
    {valid && error && <p>{error}</p>}
    {valid && !movie && !error && <p>Loading title details…</p>}
    {movie && <article style={{ maxWidth: "1000px", margin: "24px auto" }}>
      {movie.backdrop_path && <img src={`${movieImage}${movie.backdrop_path}`} alt={movie.title || movie.name} style={{ width: "100%", borderRadius: "8px", maxHeight: "490px", objectFit: "cover" }} />}
      <h1>{movie.title || movie.name}</h1>
      <p>{movie.overview || "No description available."}</p>
      <p style={{ color: "#bbb" }}>{movie.release_date || movie.first_air_date || ""} · {type === "tv" ? "TV Series" : "Movie"} · Rating {movie.vote_average?.toFixed(1) || "N/A"}</p>
      <button style={{ background: "#e50914", padding: "12px 18px", border: 0, color: "#fff", cursor: "pointer", borderRadius: "4px" }}
        onClick={() => saved ? remove(movie, type) : add(movie, type)}>{saved ? "Remove from My List" : "+ My List"}</button>
      {trailer && <section style={{ marginTop: "35px" }}><h2>Official trailer</h2>
        <iframe title="Movie trailer" src={`https://www.youtube-nocookie.com/embed/${trailer.key}`}
          style={{ width: "100%", maxWidth: "760px", aspectRatio: "16 / 9", border: 0 }}
          referrerPolicy="strict-origin-when-cross-origin" allowFullScreen />
      </section>}
    </article>}
  </main>;
}

export function SimplePage({ kind }) {
  const { user } = useAuth();
  return <main style={pageStyle}>
    <h1>{kind === "account" ? "Account" : "Help Center"}</h1>
    {kind === "account" ? <p>Signed in as {user?.fullName || user?.email || "Netflix member"}.</p>
      : <p>Need help? Return to <Link style={{ color: "white" }} to="/">Home</Link> or try the search icon to find a title.</p>}
  </main>;
}
