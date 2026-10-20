import { BrowserRouter as Router, Navigate, Outlet, Route, Routes } from 'react-router-dom';
import LandingPage from './LandingPage';
import LoginPage from './pages/LoginPage';
import SignupPage from './pages/SignupPage';
import DashboardPage from './pages/DashboardPage';
import AccountPage from './pages/AccountPage';
import ClothesPage from './pages/ClothesPage';
import OutfitsPage from './pages/OutfitsPage';
import GeneratorPage from './pages/GeneratorPage';
import LegalPage from './pages/LegalPage';
import CookieSettingsPage from './pages/CookieSettingsPage';

import Navbar from './components/Navbar';
import './App.css';

// Analytics is a local-only page; a clean deployment does not include its files.
const localPages = import.meta.glob('./pages/AnalyticsPage.jsx', { eager: true, import: 'default' });
const AnalyticsPage = localPages['./pages/AnalyticsPage.jsx'];

const WardrobeShell = () => (
  <div className="app-shell">
    <Navbar />
    <main className="app-main"><Outlet /></main>
  </div>
);

function App() {
  return (
    <Router future={{ v7_startTransition: true, v7_relativeSplatPath: true }}>
      <Routes>
        <Route path="/" element={<LandingPage />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/signup" element={<SignupPage />} />
        <Route path="/terms" element={<LegalPage type="terms" />} />
        <Route path="/privacy" element={<LegalPage type="privacy" />} />
        <Route path="/cookies" element={<LegalPage type="cookies" />} />
        <Route path="/cookie-policy" element={<Navigate to="/cookies" replace />} />
        <Route path="/cookie-settings" element={<CookieSettingsPage />} />
        <Route element={<WardrobeShell />}>
          <Route path="/dashboard" element={<DashboardPage />} />
          <Route path="/account" element={<AccountPage />} />
          <Route path="/clothes" element={<ClothesPage />} />
          <Route path="/outfits" element={<OutfitsPage />} />
          <Route path="/generator" element={<GeneratorPage />} />
          {AnalyticsPage && <Route path="/analytics" element={<AnalyticsPage />} />}
        </Route>
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </Router>
  );
}

export default App; 
