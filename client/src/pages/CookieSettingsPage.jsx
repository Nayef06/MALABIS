import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import LegalShell from '../components/LegalShell';
import { defaultCookiePreferences, getCookiePreferences, saveCookiePreferences } from '../cookiePreferences';
import './LegalPage.css';

export default function CookieSettingsPage() {
  const [preferences, setPreferences] = useState(getCookiePreferences);
  const [saved, setSaved] = useState(false);

  const toggle = (key) => setPreferences((current) => ({ ...current, [key]: !current[key] }));
  const save = (value = preferences) => {
    saveCookiePreferences(value);
    setPreferences(value);
    setSaved(true);
    window.setTimeout(() => setSaved(false), 2200);
  };

  return (
    <LegalShell>
      <main id="legal-main" className="legal-page cookie-page" tabIndex={-1}>
        <header className="legal-hero">
          <p className="eyebrow">Your browser, your choice</p>
          <h1>Cookie settings</h1>
          <p>Choose which optional categories Malabis may use. Your selection is saved only in this browser.</p>
          <p className="cookie-policy-link">Read the <Link to="/cookies">Cookie Policy</Link> for storage names, purposes, and lifetimes.</p>
        </header>
        <section className="cookie-paper" aria-label="Cookie preferences">
          <div className="cookie-choice">
            <div><h2>Strictly necessary</h2><p>Keeps you securely signed in and provides core account features. This category cannot be switched off.</p></div>
            <span className="cookie-required">Always on</span>
          </div>
          <label className="cookie-choice">
            <div><h2>Analytics</h2><p>Records your choice for optional browser measurement. No optional analytics tracker is currently active. This does not control operational reports based on existing account records.</p></div>
            <input type="checkbox" checked={preferences.analytics} onChange={() => toggle('analytics')} />
            <span className="toggle" aria-hidden="true" />
          </label>
          <label className="cookie-choice">
            <div><h2>Personalization</h2><p>Records your choice for optional browser preferences beyond core wardrobe features. No separate optional personalization technology is currently active.</p></div>
            <input type="checkbox" checked={preferences.personalization} onChange={() => toggle('personalization')} />
            <span className="toggle" aria-hidden="true" />
          </label>
          <div className="cookie-actions">
            <button className="button button--quiet" type="button" onClick={() => save(defaultCookiePreferences)}>Necessary only</button>
            <button className="button button--rose" type="button" onClick={() => save()}>Save choices</button>
          </div>
          <p className={`cookie-saved ${saved ? 'is-visible' : ''}`} role="status">Your choices are saved on this device.</p>
        </section>
      </main>
    </LegalShell>
  );
}
