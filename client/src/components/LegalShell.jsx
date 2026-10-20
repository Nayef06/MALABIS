import React from 'react';
import { Link, NavLink } from 'react-router-dom';
import Brand from './Brand';

export default function LegalShell({ children }) {
  return (
    <div className="legal-shell">
      <a className="legal-skip" href="#legal-main">Skip to content</a>
      <header className="legal-nav">
        <Link to="/" aria-label="Malabis home"><Brand /></Link>
        <nav aria-label="Legal pages">
          <NavLink to="/terms">Terms</NavLink>
          <NavLink to="/privacy">Privacy</NavLink>
          <NavLink to="/cookies">Cookies</NavLink>
          <NavLink to="/cookie-settings">Cookie settings</NavLink>
        </nav>
      </header>
      {children}
      <footer className="legal-footer">
        <span>© {new Date().getFullYear()} Malabis<span className="legal-footer__note">Your wardrobe. Thoughtfully organized.</span></span>
        <div><Link to="/terms">Terms of Service</Link><Link to="/privacy">Privacy Policy</Link><Link to="/cookies">Cookie Policy</Link><Link to="/cookie-settings">Cookie settings</Link></div>
      </footer>
    </div>
  );
}
