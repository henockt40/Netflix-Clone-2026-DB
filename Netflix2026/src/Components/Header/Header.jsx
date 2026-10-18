import React, { useEffect, useState } from "react";
import logo from "../../assets/image/logo.png";
import { Link, useNavigate } from "react-router-dom";
import { Search, User, ChevronDown, Menu, X } from "lucide-react";
import NotificationCenter from "../NotificationCenter/NotificationCenter.jsx";
import styles from "./Header.module.css";
import { useAuth } from "../../Auth/AuthContext.jsx";

function Header() {
  const { logout } = useAuth();
  const navigate = useNavigate();
  const [searchText, setSearchText] = useState("");
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  function submitSearch() {
    const term = searchText.trim();
    if (!isSearchOpen) {
      setIsSearchOpen(true);
    } else if (term) {
      navigate(`/search?q=${encodeURIComponent(term)}`);
    } else {
      setIsSearchOpen(false);
    }
  }
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [isProfileOn, setIsProfileOn] = useState(false);

  //   for blur
  // window.addEventListener() is a side effect.
  // useEffect sets up a scroll listener when the component appears, updates state based on scroll position, and removes the listener when the component disappears.
  // window.scrollY = how many pixels the page has been scrolled vertically.

  const [isScrolled, setIsScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > 50) {
        setIsScrolled(true);
      } else {
        setIsScrolled(false);
      }
    };
    window.addEventListener("scroll", handleScroll);
    // the cleanup code using return
    // When the component is removed from the page(UI), React removes the scroll listener so it doesn't keep listening unnecessarily.
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <header className={`${styles.header} ${isScrolled ? styles.scrolled : ""}`}>
      <div className={styles.container}>
        {/* Logo */}
        <Link to="/" aria-label="Netflix Home"><img className={styles.logo} src={logo} alt="Netflix" /></Link>

        {/* Mobile navigation is available without changing the original desktop header. */}
        <button type="button" className={styles.mobileMenuButton} aria-label={isMenuOpen ? "Close navigation" : "Open navigation"}
          aria-expanded={isMenuOpen} aria-controls="netflix-main-nav" onClick={() => setIsMenuOpen(!isMenuOpen)}>
          {isMenuOpen ? <X size={22} /> : <Menu size={22} />}
        </button>
        {/* navigation links */}
        <nav id="netflix-main-nav" className={`${styles.nav} ${isMenuOpen ? styles.navOpen : ""}`} onClick={(event) => {
          if (event.target.closest("a")) setIsMenuOpen(false);
        }}>
          <Link className={styles.navLink} to="/">
            Home
          </Link>
          <Link className={styles.navLink} to="/tv">
            Tv Shows
          </Link>
          <Link className={styles.navLink} to="/movies">
            Movies
          </Link>
          <Link className={styles.navLink} to="/new">
            New & Popular
          </Link>
          <Link className={styles.navLink} to="/discover">
            AI Picks
          </Link>
          <Link className={styles.navLink} to="/my-list">
            My List
          </Link>
          <Link className={styles.navLink} to="/languages">
            Browse by Language
          </Link>
        </nav>

        {/* right side section */}
        <div className={styles.rightSection}>
          {/* search */}
          <div className={styles.searchContainer}>
            <button
              onClick={submitSearch}
              aria-label="Search movies and TV shows"
              className={styles.searchButton}
            >
              <Search size={20} />
            </button>

            {/* this is conditional rendering using the && operator.
                it is like this 
                    if (isSearchOpen) {
                    return <input ... />;
                    } 
               && in JSX is basically a short way to say "render this only when this condition is true."
               condition && something
               If condition is true, JavaScript evaluates/returns something.
               If condition is false, it stops there.
          */}

            {isSearchOpen && (
              <input
                type="search"
                placeholder="movie title"
                value={searchText}
                onChange={(event) => setSearchText(event.target.value)}
                onKeyDown={(event) => { if (event.key === "Enter") submitSearch(); }}
                className={styles.searchInput}
              />
            )}
          </div>

          {/* Trending notifications; original icon and header layout are retained. */}
          <NotificationCenter />

          {/* profile */}
          <div className={styles.profileContainer}>
            <button
              onClick={() => setIsProfileOn(!isProfileOn)}
              className={styles.profileButton}
            >
              {/* user icon */}
              <div className={styles.profileAvatar}>
                <User size={20} />
              </div>
              <ChevronDown size={20} />

              {/* dropdown icon */}
            </button>
            {isProfileOn && (
              <div className={styles.profileMenu}>
                <Link to="/account" className={styles.profileMenuItem}>Account</Link>
                <Link to="/help" className={styles.profileMenuItem}>Help Center</Link>
                <hr className={styles.profileMenuDivider} />
                <button type="button" className={styles.profileMenuItem} onClick={logout}>Sign Out</button>
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  );
}

export default Header;
