import { useEffect, useRef, useState } from "react";
import { Bell, RefreshCw, X } from "lucide-react";
import { useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "../../Auth/AuthContext.jsx";
import movieInstance from "../../Utility/MovieInstance.js";
import requests from "../../Utility/requestURLs.js";
import headerStyles from "../Header/Header.module.css";
import styles from "./NotificationCenter.module.css";

// These are TMDB trending-title alerts, not Netflix service notifications.
// Read status is local to this browser and scoped to the logged-in user.
const MAX_ALERTS = 5;

function getReadIds(storageKey) {
  try {
    const value = JSON.parse(localStorage.getItem(storageKey) || "[]");
    return Array.isArray(value) ? value.filter((item) => typeof item === "string") : [];
  } catch {
    return [];
  }
}

function makeAlerts(results) {
  const used = new Set();
  return (Array.isArray(results) ? results : [])
    .filter((movie) => movie && Number.isInteger(movie.id) &&
      (movie.media_type === "movie" || movie.media_type === "tv"))
    .map((movie) => ({
      id: movie.id,
      type: movie.media_type,
      key: `${movie.media_type}:${movie.id}`,
      title: movie.title || movie.name || "Untitled",
      posterPath: movie.poster_path,
    }))
    .filter((movie) => {
      if (used.has(movie.key)) return false;
      used.add(movie.key);
      return true;
    })
    .slice(0, MAX_ALERTS);
}

export default function NotificationCenter() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const containerRef = useRef(null);
  const storageKey = `netflix_2026_trending_read_${user?.id ?? "guest"}`;

  const [open, setOpen] = useState(false);
  const [alerts, setAlerts] = useState([]);
  const [status, setStatus] = useState("loading");
  const [refreshIndex, setRefreshIndex] = useState(0);
  const [readState, setReadState] = useState(() => ({
    key: storageKey, ids: getReadIds(storageKey),
  }));

  // If another member logs in, do not show the previous member's read state.
  useEffect(() => {
    setReadState({ key: storageKey, ids: getReadIds(storageKey) });
  }, [storageKey]);

  useEffect(() => {
    let canceled = false;
    setStatus("loading");
    movieInstance.get(requests.fetchTrending)
      .then(({ data }) => {
        if (canceled) return;
        setAlerts(makeAlerts(data?.results));
        setStatus("ready");
      })
      .catch(() => {
        if (!canceled) setStatus("error");
      });
    return () => { canceled = true; };
  }, [refreshIndex]);

  // Close the popover when navigating, clicking outside, or pressing Escape.
  useEffect(() => { setOpen(false); }, [location.pathname, location.search]);
  useEffect(() => {
    function closeOnOutsideClick(event) {
      if (!containerRef.current?.contains(event.target)) setOpen(false);
    }
    function closeOnEscape(event) {
      if (event.key === "Escape") setOpen(false);
    }
    document.addEventListener("pointerdown", closeOnOutsideClick);
    document.addEventListener("keydown", closeOnEscape);
    return () => {
      document.removeEventListener("pointerdown", closeOnOutsideClick);
      document.removeEventListener("keydown", closeOnEscape);
    };
  }, []);

  const readIds = readState.key === storageKey
    ? readState.ids : getReadIds(storageKey);
  const readSet = new Set(readIds);
  const unreadCount = alerts.filter((alert) => !readSet.has(alert.key)).length;

  function markRead(keys) {
    const nextIds = Array.from(new Set([...readIds, ...keys])).slice(-250);
    try { localStorage.setItem(storageKey, JSON.stringify(nextIds)); } catch { /* unavailable */ }
    setReadState({ key: storageKey, ids: nextIds });
  }

  function openTitle(alert) {
    markRead([alert.key]);
    setOpen(false);
    navigate(`/title/${alert.type}/${alert.id}`);
  }

  return (
    <div className={styles.notificationRoot} ref={containerRef}>
      <button
        type="button"
        className={headerStyles.iconButton}
        onClick={() => setOpen((previous) => !previous)}
        aria-label={`Notifications${unreadCount ? `, ${unreadCount} unread` : ""}`}
        aria-expanded={open}
        aria-controls="netflix-notification-panel"
        aria-haspopup="true"
      >
        <Bell size={20} />
        {unreadCount > 0 && <span className={styles.badge}>{unreadCount}</span>}
      </button>
      {open && (
        <section
          className={styles.panel}
          id="netflix-notification-panel"
          aria-label="Trending movie notifications"
        >
          <div className={styles.panelHeader}>
            <strong>Notifications</strong>
            <button className={styles.closeButton} type="button" aria-label="Close notifications" onClick={() => setOpen(false)}>
              <X size={18} />
            </button>
          </div>
          <p className={styles.subtitle}>Trending on TMDB this week</p>

          {status === "loading" && <p className={styles.feedback} role="status">Loading trending titles…</p>}
          {status === "error" && (
            <div className={styles.feedback} role="status">
              <p>Unable to load notifications. Check your TMDB connection.</p>
              <button type="button" className={styles.actionButton} onClick={() => setRefreshIndex((n) => n + 1)}>
                <RefreshCw size={14} /> Retry
              </button>
            </div>
          )}
          {status === "ready" && !alerts.length && <p className={styles.feedback}>No trending titles available right now.</p>}
          {status === "ready" && alerts.length > 0 && (
            <>
              <ul className={styles.alertList}>
                {alerts.map((alert) => (
                  <li key={alert.key}>
                    <button type="button" className={styles.alertButton} onClick={() => openTitle(alert)}>
                      {alert.posterPath
                        ? <img className={styles.poster} alt="" src={`https://image.tmdb.org/t/p/w92${alert.posterPath}`} loading="lazy" />
                        : <span className={styles.posterPlaceholder} aria-hidden="true" />}
                      <span className={styles.alertText}>
                        <strong>{alert.title}</strong>
                        <small>Trending {alert.type === "tv" ? "TV show" : "movie"}</small>
                      </span>
                      {!readSet.has(alert.key) && <span className={styles.unreadDot} title="Unread" />}
                    </button>
                  </li>
                ))}
              </ul>
              <div className={styles.panelFooter}>
                <button type="button" className={styles.actionButton}
                  disabled={unreadCount === 0} onClick={() => markRead(alerts.map((alert) => alert.key))}>
                  Mark all as read
                </button>
                <button type="button" className={styles.actionButton} onClick={() => setRefreshIndex((n) => n + 1)}>
                  <RefreshCw size={14} /> Refresh
                </button>
              </div>
            </>
          )}
        </section>
      )}
    </div>
  );
}
