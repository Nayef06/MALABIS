import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import AuthShell from '../components/AuthShell';
import { Icon } from '../components/Icons';
import { apiFetch } from '../api';
import './Auth.css';

export default function SignupPage() {
  const [form, setForm] = useState({ username: '', displayName: '', password: '' });
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const navigate = useNavigate();
  const update = (key) => (event) => setForm((value) => ({ ...value, [key]: event.target.value }));

  const handleSubmit = async (event) => {
    event.preventDefault(); setError(''); setSubmitting(true);
    try {
      const response = await apiFetch('/api/auth/signup', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(form) });
      if (!response.ok) { const data = await response.json().catch(() => ({})); throw new Error(data.error || 'We could not make that account. Try a different username.'); }
      navigate('/login');
    } catch (err) { setError(err.message); }
    finally { setSubmitting(false); }
  };

  return (
    <AuthShell eyebrow="A room of your own" title="Make it yours." note="Start with a few details. We’ll leave plenty of space for your style.">
      <form className="auth-fields" onSubmit={handleSubmit}>
        {error && <p className="form-error" role="alert">{error}</p>}
        <div className="field"><label htmlFor="displayName">What should we call you?</label><input className="input" id="displayName" value={form.displayName} onChange={update('displayName')} autoComplete="name" minLength="3" required /></div>
        <div className="field"><label htmlFor="username">Username</label><input className="input" id="username" value={form.username} onChange={update('username')} autoComplete="username" required /></div>
        <div className="field"><label htmlFor="password">Password</label><input className="input" id="password" type="password" value={form.password} onChange={update('password')} autoComplete="new-password" minLength="8" required /><small>At least 8 characters</small></div>
        <button className="button button--rose button--wide" disabled={submitting}>{submitting ? 'Making space…' : <>Begin my closet <Icon name="arrow" size={17}/></>}</button>
        <p className="auth-switch">Already have a corner here? <Link to="/login">Log in</Link></p>
      </form>
    </AuthShell>
  );
}
