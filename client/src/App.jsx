import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import LandingPage from './LandingPage';
import LoginPage from './pages/LoginPage';
import SignupPage from './pages/SignupPage';
import DashboardPage from './pages/DashboardPage';
import AccountPage from './pages/AccountPage';
import ClothesPage from './pages/ClothesPage';
import OutfitsPage from './pages/OutfitsPage';
import GeneratorPage from './pages/GeneratorPage';
import DevPage from './pages/DevPage';
import Navbar from './components/Navbar';
import './App.css';

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<LandingPage />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/signup" element={<SignupPage />} />
        <Route path="/dashboard" element={
          <>
            <Navbar accountInverted={false} />
            <DashboardPage />
          </>
        } />
        <Route path="/account" element={
          <>
            <Navbar accountInverted={true} />
            <AccountPage />
          </>
        } />
        <Route path="/clothes" element={
          <>
            <Navbar accountInverted={false} />
            <ClothesPage />
          </>
        } />
        <Route path="/outfits" element={
          <>
            <Navbar accountInverted={false} />
            <OutfitsPage />
          </>
        } />
        <Route path="/generator" element={
          <>
            <Navbar accountInverted={false} />
            <GeneratorPage />
          </>
        } />
        <Route path="/dev" element={<DevPage />} />
      </Routes>
    </Router>
  );
}

export default App; 