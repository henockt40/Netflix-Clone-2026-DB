import React from 'react';
import styles from './SlideShow.module.css';
import MovieCard from '../MovieCard/MovieCard';
import { Swiper, SwiperSlide } from 'swiper/react';
import 'swiper/css';
import 'swiper/css/navigation';
import { Navigation } from 'swiper/modules';

function SlideShow({ title, movies, defaultType = "movie" }) {
  return (
    <div>
      <h2 className={styles.title}>{title}</h2>
      <div className={styles.Row}>
        <Swiper
          modules={[Navigation]}
          navigation
          slidesPerView={1}
          spaceBetween={12}
          breakpoints={{
            480: { slidesPerView: 2, spaceBetween: 14 },
            768: { slidesPerView: 3, spaceBetween: 20 },
            1100: { slidesPerView: 4, spaceBetween: 35 },
            1440: { slidesPerView: 5, spaceBetween: 55 },
          }}
        >
          {movies?.map((movie) => (
            <SwiperSlide key={`${movie.media_type || defaultType}-${movie.id}`}>
              <MovieCard movie={movie} defaultType={defaultType} />
            </SwiperSlide>
          ))}
        </Swiper>
      </div>
    </div>
  );
}

export default SlideShow;
