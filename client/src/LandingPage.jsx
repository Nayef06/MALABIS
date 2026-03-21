import React, { useEffect, useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import './LandingPage.css';
import LogoFull from './assets/LogoFull.png';
import asset from './assets/ewar.png';
import icon from './assets/logo.png';
import { apiFetch } from './api';

const MobileLanding = () => (
  <div className="mobile-landing-custom">
    <div className="mobile-landing-logo">
      <img src={icon} alt="Malabis Icon" style={{ width: 56, height: 56 }} />
    </div>
    <h2 style={{ color: 'var(--text-primary)', fontWeight: 700, fontSize: '1.5rem', margin: '1.5rem 0 0.75rem 0', letterSpacing: '-0.01em' }}>
      Welcome to Malabis
    </h2>
    <p style={{ color: 'var(--text-secondary)', fontSize: '1rem', margin: '0 0 1.5rem 0', lineHeight: 1.6 }}>
      Your wardrobe, reimagined.<br />Sign up or log in to get started.
    </p>
    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', width: '100%', alignItems: 'center' }}>
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
    <div className="landing-page">
      <nav className="navbar">
        <div className="navbar-logo">
          <img src={LogoFull} alt="Malabis" />
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
          <section className="text-section">
            <div className="mobile-logo-section">
              <img src={icon} alt="Malabis Icon" className="mobile-logo-icon" />
            </div>
            <h1>
              Organize your wardrobe and <span>create outfits</span>
            </h1>
            <p>
              Upload every piece you own, keep your wardrobe organized, experiment
              freely, and discover new combinations that elevate your style—all in
              one seamless space.
            </p>
            <div className="action-buttons">
              <Link to="/signup">
                <button className="get-started-btn">Get Started for Free →</button>
              </Link>
              <Link to="/login">
                <button className="creator-btn">I'm Already a Creator</button>
              </Link>
            </div>
          </section>
          <div className="image-section">
            <img src={asset} alt="Wardrobe" />
          </div>
        </main>
      )}
    </div>
  );
};

export default LandingPage;
