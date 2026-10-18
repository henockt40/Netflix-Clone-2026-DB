import { Navigate, Route, Routes } from "react-router-dom";
import Header from "./Components/Header/Header";
import Banner from "./Components/Banner/Banner";
import DisplayRow from "./Components/DisplayRow/DisplayRow";
import Footer from "./Components/Footer/Footer";
import Recommendations from "./Routing/Recommendations.jsx";
import { WatchlistProvider } from "./Routing/WatchlistContext.jsx";
import {
  CollectionPage,
  DetailsPage,
  LanguagePage,
  MyListPage,
  SearchPage,
  SimplePage,
} from "./Routing/Pages.jsx";

export default function App() {
  return (
    <WatchlistProvider>
      <Header />
      <Routes>
        <Route path="/" element={<><Banner /><DisplayRow /></>} />
        <Route path="/tv" element={<CollectionPage category="tv" />} />
        <Route path="/movies" element={<CollectionPage category="movies" />} />
        <Route path="/new" element={<CollectionPage category="new" />} />
        <Route path="/my-list" element={<MyListPage />} />
        <Route path="/discover" element={<Recommendations />} />
        <Route path="/languages" element={<LanguagePage />} />
        <Route path="/languages/:language" element={<LanguagePage />} />
        <Route path="/search" element={<SearchPage />} />
        <Route path="/title/:type/:id" element={<DetailsPage />} />
        <Route path="/account" element={<SimplePage kind="account" />} />
        <Route path="/help" element={<SimplePage kind="help" />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
      <Footer />
    </WatchlistProvider>
  );
}
