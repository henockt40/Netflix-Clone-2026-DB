import React, { useEffect, useState } from "react";
import netflixBannerLog from "../../assets/image/logo.png";
import { Play, Info } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useWatchlist } from "../../Routing/WatchlistContext.jsx";
import styles from './Banner.module.css'
import movieInstance from '../../Utility/MovieInstance';
import requests from "../../Utility/requestURLs";

const BANNER_BASE= "https://image.tmdb.org/t/p/original/"

function Banner() {
    const navigate = useNavigate();
    const { toggle, has } = useWatchlist();

    const [bannerImage, setBannerImage] = useState({})

  useEffect(()=>{
    async function fetchBannerImage() {
       try {
         const response = await movieInstance.get(requests.fetchNetflixOriginals);
         const results = Array.isArray(response.data?.results) ? response.data.results : [];
         if (!results.length) return;
         setBannerImage(results[Math.floor(Math.random() * results.length)]);
       } catch (error) {
         // Keep the original CSS banner image when TMDB is temporarily unavailable.
         console.error("Unable to load featured title:", error.message);
       }
    }
    fetchBannerImage()
  },[])


  function truncate (str,n){
    return str?.length > n ? str.substr(0, n-1) + "..." : str
  }
  
  return (
    <div
      className={styles.banner}
      style={{
        backgroundSize: "cover",
        ...(bannerImage.backdrop_path ? { backgroundImage: `url("${BANNER_BASE}${bannerImage.backdrop_path}")` } : {}),
      }}
    >
      <div className={styles.contents}>
        {/* netflix image */}
        <img
          className={styles.logoImg}
          src={netflixBannerLog}
          alt="Netflix logo"
        />

        {/* title */}
        <h1 className={styles.title}>{bannerImage?.original_name || bannerImage?.name || "Featured on Netflix"}</h1>

        {/* description  */}
        <h1 className={styles.description}>
          {truncate(bannerImage?.overview,120)}
        </h1>

        {/* buttons */}
        <div className={styles.buttonContainer}>
          <button className={styles.button} onClick={() => bannerImage?.id && navigate(`/title/tv/${bannerImage.id}`)}>
            <Play size={30} />
            Play
          </button>
          <button className={styles.button} onClick={() => bannerImage?.id && toggle(bannerImage, "tv")}>
            <Info size={30} />
            {bannerImage?.id && has(bannerImage.id, "tv") ? "In My List" : "My List"}
          </button>
        </div>
      </div>
      {/* fading  */}
      <div className={styles.fadeButton}></div>
    </div>
  );
}

export default Banner;
