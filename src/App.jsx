import { Routes, Route } from 'react-router-dom';
import HomePage from './pages/HomePage.jsx';
import SearchPage from './pages/SearchPage.jsx';
import PropertyDetailPage from './pages/PropertyDetailPage.jsx';
import MapPage from './pages/MapPage.jsx';
import DashboardPage from './pages/DashboardPage.jsx';

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<HomePage />} />
      <Route path="/search" element={<SearchPage />} />
      <Route path="/property/:id" element={<PropertyDetailPage />} />
      <Route path="/map" element={<MapPage />} />
      <Route path="/dashboard" element={<DashboardPage />} />
    </Routes>
  );
}
