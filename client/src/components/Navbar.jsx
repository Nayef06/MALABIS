import React from 'react';
import { useNavigate } from 'react-router-dom';
import '../LandingPage.css';
import LogoFull from '../assets/LogoFull.png';

const AccountIcon = ({ inverted }) => (
  <svg width="40" height="40" viewBox="0 0 40 40" fill="none" xmlns="http://www.w3.org/2000/svg">
    <circle cx="20" cy="20" r="19" stroke={inverted ? 'white' : '#1b2554'} strokeWidth="2" fill={inverted ? '#1b2554' : 'white'} />
    <circle cx="20" cy="16" r="6" stroke={inverted ? 'white' : '#1b2554'} strokeWidth="2" fill={inverted ? '#1b2554' : 'white'} />
    <path d="M10 32c0-5.523 4.477-10 10-10s10 4.477 10 10" stroke={inverted ? 'white' : '#1b2554'} strokeWidth="2" fill={inverted ? '#1b2554' : 'white'} />
  </svg>
);

const Navbar = ({ accountInverted }) => {
  const navigate = useNavigate();
  return (
    <nav className="navbar">
      <div className="navbar-logo">
        <img src={LogoFull} alt="Logo" />
      </div>
      <div className="navbar-buttons">
        <button
          className="account-btn"
          style={{ background: 'none', border: 'none', padding: 0, cursor: 'pointer' }}
          onClick={() => navigate('/account')}
        >
          <AccountIcon inverted={accountInverted} />
        </button>
      </div>
    </nav>
  );
};

export default Navbar; 