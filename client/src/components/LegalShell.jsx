import React from 'react';
import { Link } from 'react-router-dom';
import Brand from './Brand';

export default function LegalShell({ children }) {
  return (
    <div className="legal-shell">
      <header className="legal-nav">
        <Link to="/" aria-label="Malabis home"><Brand /></Link>
        <nav aria-label="Legal pages">
          <Link to="/terms">Terms</Link>
          <Link to="/privacy">Privacy</Link>
          <Link to="/cookie-settings">Cookie settings</Link>
        </nav>
      </header>
      {children}
      <footer className="legal-footer">
        <span>Malabis</span>
        <div><Link to="/terms">Terms of Service</Link><Link to="/privacy">Privacy Policy</Link><Link to="/cookie-settings">Cookie settings</Link></div>
      </footer>
    </div>
  );
}
