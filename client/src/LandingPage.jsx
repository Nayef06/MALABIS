import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import './LandingPage.css';
import { Link } from 'react-router-dom';
import LogoFull from './assets/LogoFull.png';
import asset from './assets/ewar.png';
import bg from './assets/bg4.png';
import icon from './assets/logo.png';
import { apiFetch } from './api';

const MobileLanding = () => (
  <div className="mobile-landing-custom">
    <div className="mobile-landing-logo">
      <img src={icon} alt="Malabis Icon" style={{ width: 64, height: 64 }} />
    </div>
    <h2 style={{ color: '#1b2554', fontWeight: 700, fontSize: '1.5rem', margin: '1.2rem 0 0.7rem 0' }}>
      Welcome to Malabis
    </h2>
    <p style={{ color: '#5f6f8f', fontSize: '1rem', margin: '0 0 1.2rem 0', lineHeight: 1.5 }}>
      Your wardrobe, reimagined for mobile.<br />Sign up or log in to get started!
    </p>
    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.7rem', width: '100%', alignItems: 'center', justifyContent: 'center' }}>
      <Link to="/signup">
        <button className="get-started-btn">Get Started for Free →</button>
      </Link>
      <Link to="/login">
        <button className="creator-btn">I'm Already a Creator</button>
      </Link>
    </div>
  </div>
);

const LandingPage = () => {
  const navigate = useNavigate();
  const [isMobile, setIsMobile] = useState(window.innerWidth < 770);

  useEffect(() => {
    const checkAuthStatus = async () => {
      try {
        const response = await apiFetch('/api/auth/status');
        if (response.ok) {
          navigate('/clothes');
        }
      } catch (error) {
        console.error('Error checking authentication status:', error);
      }
    };
    checkAuthStatus();
  }, [navigate]);

  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth < 770);
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  useEffect(() => {
    document.body.classList.add('no-scroll');
    document.documentElement.classList.add('no-scroll');
    return () => {
      document.body.classList.remove('no-scroll');
      document.documentElement.classList.remove('no-scroll');
    };
  }, []);

  return (
    <div
      className="landing-page"
      style={{
        backgroundImage: `url(${bg})`,
      }}
    >
      <nav className="navbar">
        <div className="navbar-logo">
          <img src={LogoFull} alt="Logo" />
        </div>
        <div className="navbar-buttons">
          <Link to="/login">
            <button className="login-btn">Log in</button>
          </Link>
          <Link to="/signup">
            <button className="signup-btn">Sign Up</button>
          </Link>
        </div>
      </nav>
      {isMobile ? (
        <MobileLanding />
      ) : (
        <main className="main-content">
          <div className="text-section">
            <div className="mobile-logo-section">
              <img src={icon} alt="Malabis Icon" className="mobile-logo-icon" />
            </div>
            <h1>
              Organize your wardrobe and <span>create outfits</span>
            </h1>
            <p>
              Upload every piece you own, keep your wardrobe organized, experiment
              freely, and discover new combinations that elevate your style—all in
              one seamless space
            </p>
            <div className="action-buttons">
              <Link to="/signup">
                <button className="get-started-btn">Get Started for Free →</button>
              </Link>
              <Link to="/login">
                <button className="creator-btn">I'm Already a Creator</button>
              </Link>
            </div>
          </div>
          <div className="image-section">
            <img src={asset} alt="Wardrobe" />
          </div>
        </main>
      )}
    </div>
  );
};

export default LandingPage;
