import { createContext, useContext, useEffect, useState } from "react";
import { useAuth } from "../Auth/AuthContext.jsx";

const WatchlistContext = createContext(null);

function readItems(key) {
  try {
    const items = JSON.parse(localStorage.getItem(key) || "[]");
    return Array.isArray(items) ? items : [];
  } catch {
    return [];
  }
}

export function WatchlistProvider({ children }) {
  const { user } = useAuth();
  const key = `netflix_2026_list_${user?.id ?? "guest"}`;
  const [items, setItems] = useState(() => readItems(key));

  useEffect(() => setItems(readItems(key)), [key]);

  function save(next) {
    setItems(next);
    try { localStorage.setItem(key, JSON.stringify(next)); } catch { /* storage disabled */ }
  }

  function has(id, type) {
    return items.some((item) => String(item.id) === String(id) && item.media_type === type);
  }

  function add(movie, type) {
    if (!movie?.id || has(movie.id, type)) return;
    save([...items, { id: movie.id, media_type: type, title: movie.title || movie.name || "Untitled",
      poster_path: movie.poster_path ?? null, backdrop_path: movie.backdrop_path ?? null }]);
  }

  function remove(movie, type) {
    save(items.filter((item) => !(String(item.id) === String(movie?.id) && item.media_type === type)));
  }

  function toggle(movie, type) {
    if (has(movie?.id, type)) remove(movie, type);
    else add(movie, type);
  }

  return <WatchlistContext.Provider value={{ items, has, add, remove, toggle }}>{children}</WatchlistContext.Provider>;
}

export function useWatchlist() {
  const value = useContext(WatchlistContext);
  if (!value) throw new Error("useWatchlist must be used inside WatchlistProvider");
  return value;
}
