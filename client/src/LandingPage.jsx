import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import './LandingPage.css';
import { Link } from 'react-router-dom';
import LogoFull from './assets/LogoFull.png';
import asset from './assets/ewar.png';
import bg from './assets/bg4.png';
import icon from './assets/logo.png';


const LandingPage = () => {
  const navigate = useNavigate();

  useEffect(() => {
    const checkAuthStatus = async () => {
      try {
        const response = await fetch('/api/auth/status');
        if (response.ok) {
          navigate('/clothes');
        }
      } catch (error) {
        console.error('Error checking authentication status:', error);
      }
    };

    checkAuthStatus();
  }, [navigate]);

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
    </div>
  );
};

export default LandingPage;
