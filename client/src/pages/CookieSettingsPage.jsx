import React, { useState } from 'react';
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
      <main className="legal-page cookie-page">
        <header className="legal-hero">
          <p className="eyebrow">Your browser, your choice</p>
          <h1>Cookie settings</h1>
          <p>Choose which optional categories Malabis may use. Your selection is saved only in this browser.</p>
        </header>
        <section className="cookie-paper" aria-label="Cookie preferences">
          <div className="cookie-choice">
            <div><h2>Strictly necessary</h2><p>Keeps you securely signed in and provides core account features. This category cannot be switched off.</p></div>
            <span className="cookie-required">Always on</span>
          </div>
          <label className="cookie-choice">
            <div><h2>Analytics</h2><p>Allows privacy-conscious measurement to help us understand which features are useful. No analytics cookie is currently set.</p></div>
            <input type="checkbox" checked={preferences.analytics} onChange={() => toggle('analytics')} />
            <span className="toggle" aria-hidden="true" />
          </label>
          <label className="cookie-choice">
            <div><h2>Personalization</h2><p>Allows optional browser-based preferences beyond the settings required to operate your wardrobe.</p></div>
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
