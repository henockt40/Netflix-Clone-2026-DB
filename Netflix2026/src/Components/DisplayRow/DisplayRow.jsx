import React, { useEffect, useState } from 'react'
import styles from "./DisplayRow.module.css";
import SlideShow from '../SlideShow/SlideShow';
import requests from "../../Utility/requestURLs";
import movieInstance from '../../Utility/MovieInstance';



function DisplayRow() {

 const [movies, setMovies] = useState({
   trending: [],
   netflixOriginals: [],
   topRated: [],
   action: [],
   comedy: [],
   horror: [],
   romance: [],
   documentaries: [],
 });

 const [loadError, setLoadError] = useState(false);
 useEffect(()=>{
  fetchMovies()
 },[])

 const fetchMovies = async ()=>{
   try {
     const responses = await Promise.allSettled([
       movieInstance.get(requests.fetchTrending),
       movieInstance.get(requests.fetchNetflixOriginals),
       movieInstance.get(requests.fetchTopRatedMovies),
       movieInstance.get(requests.fetchActionMovies),
       movieInstance.get(requests.fetchComedyMovies),
       movieInstance.get(requests.fetchHorrorMovies),
       movieInstance.get(requests.fetchRomanceMovies),
       movieInstance.get(requests.fetchDocumentaries),
     ])

     const categories = ["trending", "netflixOriginals", "topRated", "action", "comedy", "horror", "romance", "documentaries"];
     const next = {};
     responses.forEach((result, index) => {
       next[categories[index]] = result.status === "fulfilled" && Array.isArray(result.value.data?.results)
         ? result.value.data.results : [];
     });
     setMovies(next);
     setLoadError(responses.every((item) => item.status === "rejected"));
   } catch (error) {
    console.log(error);
   }
 }



  return (
    <div className={styles.mainWrapper}>
      {loadError && <p role="status" style={{ color: "#ddd", padding: "12px" }}>Unable to load movie categories. Check your TMDB API key and connection.</p>}
      <SlideShow title="Netflix Trending" movies={movies.trending} />
      <SlideShow title="Popular on Netflix" movies={movies.topRated} />
      <SlideShow title="Action " movies={movies.action} />
      <SlideShow title="Comedy" movies={movies.comedy} />
      <SlideShow title="Romance " movies={movies.romance} />
      <SlideShow title="Horror Movies" movies={movies.horror} />
    </div>
  );
}

export default DisplayRow  
   