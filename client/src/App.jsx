import { BrowserRouter as Router, Navigate, Outlet, Route, Routes } from 'react-router-dom';
import LandingPage from './LandingPage';
import LoginPage from './pages/LoginPage';
import SignupPage from './pages/SignupPage';
import DashboardPage from './pages/DashboardPage';
import AccountPage from './pages/AccountPage';
import ClothesPage from './pages/ClothesPage';
import OutfitsPage from './pages/OutfitsPage';
import GeneratorPage from './pages/GeneratorPage';

import Navbar from './components/Navbar';
import './App.css';

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
        <Route element={<WardrobeShell />}>
          <Route path="/dashboard" element={<DashboardPage />} />
          <Route path="/account" element={<AccountPage />} />
          <Route path="/clothes" element={<ClothesPage />} />
          <Route path="/outfits" element={<OutfitsPage />} />
          <Route path="/generator" element={<GeneratorPage />} />
        </Route>
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </Router>
  );
}

export default App; 
