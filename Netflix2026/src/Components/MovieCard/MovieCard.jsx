import React from "react";
import { Link } from "react-router-dom";
import { useWatchlist } from "../../Routing/WatchlistContext.jsx";
import styles from "./MovieCard.module.css";
// react icons contains icons from many different icon libraries.
import { FaCirclePlay } from "react-icons/fa6";
// The /fa6 path tells React to load icons from the Font Awesome version 6 set.

import { BsPlusCircle } from "react-icons/bs";
// The /bs path tells React to load icons from the Bootstrap Icons set.

import { GoCheckCircleFill } from "react-icons/go";
// The /go path tells React to load icons from the GitHub Octicons icon set.

import { IoIosArrowDropdownCircle } from "react-icons/io";
// The /io path tells React to load icons from the Ionicons icon set.

const Image_Base = "https://image.tmdb.org/t/p/w500"

function MovieCard({ movie, defaultType = "movie" }) {
  const { add, remove, has } = useWatchlist();
  const type = movie?.media_type === "tv" || movie?.media_type === "movie" ? movie.media_type : defaultType;
  const detailsPath = `/title/${type}/${movie?.id}`;
  const title = movie?.title || movie?.name || "Movie";
  const saved = has(movie?.id, type);
  let genres = ["Adventure", "Action", "Thriller"];

  return (
    <div className={styles.cardWrapper}>
      {/* poster image */}
      <Link to={detailsPath} aria-label={`View ${title} details`}>
      <img
        className={styles.poster}
        src={`${Image_Base}${movie?.poster_path}`}
        alt={title}
      />
      </Link>

      {/* hover card  */}
      <div className={styles.hoverCard}>
        {/* img */}
        <Link to={detailsPath} aria-label={`View ${title} details`}>
        <img
          className={styles.hoverImage}
          src={`${Image_Base}${movie?.poster_path}`}
          alt={title}
        />
        </Link>

        {/* badge */}
        <div className={styles.badge}>Recently Added</div>

        {/* button row */}
        <div className={styles.buttonsRow}>
          <Link to={detailsPath} aria-label={`View ${title}`} title="Open details">
            <FaCirclePlay className={styles.circleButton} color="white" size={40} />
          </Link>
          <button type="button" aria-label={`Add ${title} to My List`} title="Add to My List"
            onClick={() => add(movie, type)} style={{ background: "none", border: 0, padding: 0, cursor: "pointer" }}>
            <BsPlusCircle className={styles.circleButton} color="white" size={40} />
          </button>
          <button type="button" aria-label={`Remove ${title} from My List`} title={saved ? "Remove from My List" : "Not in My List"}
            onClick={() => remove(movie, type)} style={{ background: "none", border: 0, padding: 0, cursor: "pointer" }}>
            <GoCheckCircleFill className={styles.circleButton} color={saved ? "#46d369" : "white"} size={40} />
          </button>
          <Link to={detailsPath} aria-label={`More about ${title}`} title="More information" style={{ marginLeft: "auto" }}>
            <IoIosArrowDropdownCircle className={styles.circleButtonSmall} color="white" size={40} />
          </Link>
        </div>

        {/* metadata row */}
        <div className={styles.metaRow}>
          <span className={styles.tag}>U/A 16+</span>
          <span className={styles.tag}>Movie</span>
          <span className={styles.tag}>HD</span>
        </div>

        {/* genres */}
        {/* looping through the genres array and displaying each genre with a • between them.

        g → the current item
        index → the position of that item in the array
        key → in React helps React identify each item in a list uniquely.

        */}
        <div className={styles.genres}>
          {genres.map((g, index) => {
            return (
              <span key={index}>
                {g}
                {index < genres.length - 1 && (
                  <span className={styles.dot}>•</span>
                )}
              </span>
            );
          })}
        </div>
      </div>
    </div>
  );
}

export default MovieCard;
