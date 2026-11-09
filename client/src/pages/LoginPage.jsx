import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import AuthShell from '../components/AuthShell';
import { Icon } from '../components/Icons';
import { apiFetch } from '../api';
import { clearDataCache } from '../dataCache';
import './Auth.css';

export default function LoginPage() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (event) => {
    event.preventDefault(); setError(''); setSubmitting(true);
    try {
      const response = await apiFetch('/api/auth/login', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ username, password }) });
      if (!response.ok) throw new Error('Incorrect username or password.');
      clearDataCache(); navigate('/clothes');
    } catch (err) { setError(err.message || 'Could not log in. Try again.'); }
    finally { setSubmitting(false); }
  };

  return (
    <AuthShell eyebrow="Malabis" title="Log in" note="Log in to manage your clothes and saved outfits.">
      <form className="auth-fields" onSubmit={handleSubmit}>
        {error && <p className="form-error" role="alert">{error}</p>}
        <div className="field"><label htmlFor="username">Username</label><input className="input" id="username" value={username} onChange={(e) => setUsername(e.target.value)} autoComplete="username" required /></div>
        <div className="field"><label htmlFor="password">Password</label><input className="input" id="password" type="password" value={password} onChange={(e) => setPassword(e.target.value)} autoComplete="current-password" required /></div>
        <button className="button button--rose button--wide" disabled={submitting}>{submitting ? 'Logging in…' : <>Log in <Icon name="arrow" size={17}/></>}</button>
        <p className="auth-switch">Need an account? <Link to="/signup">Create account</Link></p>
      </form>
    </AuthShell>
  );
}
