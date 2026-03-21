import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import './Navbar.css';
import LogoFull from '../assets/LogoFull.png';

const AccountIcon = ({ inverted }) => (
  <svg width="36" height="36" viewBox="0 0 40 40" fill="none" xmlns="http://www.w3.org/2000/svg">
    <circle cx="20" cy="20" r="19" stroke={inverted ? 'var(--accent)' : 'var(--text-secondary)'} strokeWidth="1.5" fill={inverted ? 'var(--accent-dim)' : 'none'} />
    <circle cx="20" cy="16" r="6" stroke={inverted ? 'var(--accent)' : 'var(--text-secondary)'} strokeWidth="1.5" fill="none" />
    <path d="M10 32c0-5.523 4.477-10 10-10s10 4.477 10 10" stroke={inverted ? 'var(--accent)' : 'var(--text-secondary)'} strokeWidth="1.5" fill="none" />
  </svg>
);

const Navbar = ({ accountInverted }) => {
  const navigate = useNavigate();
  const location = useLocation();
  
  const isActive = (path) => location.pathname === path;

  return (
    <nav className="navbar">
      <div className="navbar-logo">
        <img src={LogoFull} alt="Malabis" />
      </div>

      <div className="navbar-tabs">
        <button
          className={`nav-tab ${isActive('/clothes') ? 'nav-tab-active' : ''}`}
          onClick={() => navigate('/clothes')}
        >
          Clothes
        </button>
        <button
          className={`nav-tab ${isActive('/outfits') ? 'nav-tab-active' : ''}`}
          onClick={() => navigate('/outfits')}
        >
          Outfits
        </button>
        <button
          className={`nav-tab ${isActive('/generator') ? 'nav-tab-active' : ''}`}
          onClick={() => navigate('/generator')}
        >
          Generator
        </button>
      </div>

      <div className="navbar-buttons">
        <button
          className="account-btn"
          onClick={() => navigate('/account')}
          aria-label="Account"
        >
          <AccountIcon inverted={accountInverted} />
        </button>
      </div>
    </nav>
  );
};

export default Navbar;