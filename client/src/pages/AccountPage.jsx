import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { apiFetch } from '../api';

const EditIcon = () => (
  <svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M2 14.5V18h3.5l10-10-3.5-3.5-10 10zM17.7 6.3a1 1 0 0 0 0-1.4l-2.6-2.6a1 1 0 0 0-1.4 0l-1.8 1.8 4 4 1.8-1.8z" fill="#1b2554"/>
  </svg>
);
const SaveIcon = () => (
  <svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M5 10l4 4 6-6" stroke="#1b2554" strokeWidth="2" fill="none" strokeLinecap="round" strokeLinejoin="round"/>
  </svg>
);
const CancelIcon = () => (
  <svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M6 6l8 8M6 14L14 6" stroke="#e53e3e" strokeWidth="2" strokeLinecap="round"/>
  </svg>
);
const Popup = ({ show, type, children }) => (
  <div
    style={{
      position: 'fixed',
      left: 0,
      right: 0,
      bottom: show ? 40 : 0,
      margin: '0 auto',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      width: 'fit-content',
      minWidth: 160,
      padding: '0.75rem 1.5rem',
      background: type === 'success' ? '#38a169' : '#e53e3e',
      color: '#fff',
      borderRadius: 24,
      boxShadow: '0 4px 16px rgba(0,0,0,0.10)',
      fontWeight: 500,
      fontSize: '1rem',
      opacity: show ? 1 : 0,
      pointerEvents: 'none',
      zIndex: 9999,
      transition: 'opacity 0.4s, bottom 0.4s',
      gap: 8,
    }}
  >
    {type === 'success' ? (
      <svg width="20" height="20" viewBox="0 0 20 20" fill="none"><path d="M5 10l4 4 6-6" stroke="#fff" strokeWidth="2" fill="none" strokeLinecap="round" strokeLinejoin="round"/></svg>
    ) : (
      <svg width="20" height="20" viewBox="0 0 20 20" fill="none"><path d="M6 6l8 8M6 14L14 6" stroke="#fff" strokeWidth="2" strokeLinecap="round"/></svg>
    )}
    {children}
  </div>
);

const iconBtnStyle = {
  background: 'none',
  border: 'none',
  padding: '0.25rem',
  cursor: 'pointer',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
};

const gray = '#a0aec0';

const AccountPage = () => {
  const navigate = useNavigate();
  const [displayName, setDisplayName] = useState('');
  const [editDisplayName, setEditDisplayName] = useState(false);
  const [newDisplayName, setNewDisplayName] = useState('');

  const [editPassword, setEditPassword] = useState(false);
  const [password, setPassword] = useState('');

  const [popup, setPopup] = useState({ show: false, type: 'success', message: '' });

  const [username, setUsername] = useState('');

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const res = await apiFetch('/api/auth/status');
        if (res.ok) {
          const user = await res.json();
          setDisplayName(user.displayName || '');
          setNewDisplayName(user.displayName || '');
          setUsername(user.username || '');
        }
      } catch (err) {
      }
    };
    fetchUser();
  }, []);

  useEffect(() => {
    let timer;
    if (popup.show) {
      timer = setTimeout(() => setPopup(p => ({ ...p, show: false })), 2000);
    }
    return () => clearTimeout(timer);
  }, [popup.show]);

  const handleDisplayNameSave = async () => {
    if (newDisplayName.trim().length < 3) {
      setPopup({ show: true, type: 'error', message: 'Display name must be at least 3 characters.' });
      return;
    }
    try {
      const res = await apiFetch('/api/auth/update-profile', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ displayName: newDisplayName }),
      });
      if (res.ok) {
        setDisplayName(newDisplayName);
        setPopup({ show: true, type: 'success', message: 'Updated' });
        setEditDisplayName(false);
      } else {
        setPopup({ show: true, type: 'error', message: 'Failed to update display name.' });
      }
    } catch {
      setPopup({ show: true, type: 'error', message: 'An error occurred.' });
    }
  };

  const handlePasswordSave = async () => {
    if (password.length < 8) {
      setPopup({ show: true, type: 'error', message: 'Password must be at least 8 characters.' });
      return;
    }
    try {
      const res = await apiFetch('/api/auth/update-profile', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ password }),
      });
      if (res.ok) {
        setPopup({ show: true, type: 'success', message: 'Updated' });
        setPassword('');
        setEditPassword(false);
      } else {
        setPopup({ show: true, type: 'error', message: 'Failed to update password.' });
      }
    } catch {
      setPopup({ show: true, type: 'error', message: 'An error occurred.' });
    }
  };

  const handleLogout = async () => {
    try {
      await apiFetch('/api/auth/logout', { method: 'POST' });
      navigate('/login');
    } catch (err) {
    }
  };

  return (
    <div className="auth-container">
      <Popup show={popup.show} type={popup.type}>{popup.message}</Popup>
      <div className="auth-form">
        <h2>Account Settings</h2>
        <div className="form-group">
          <label htmlFor="displayName">Display Name</label>
          <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
            <input
              id="displayName"
              type="text"
              value={editDisplayName ? newDisplayName : displayName}
              onChange={e => setNewDisplayName(e.target.value)}
              readOnly={!editDisplayName}
              style={{
                flex: 1,
                background: editDisplayName ? '#fff' : '#f7f8fa',
                borderColor: editDisplayName ? '#1b2554' : '#d1d5db',
                color: editDisplayName ? '#1b2554' : gray,
                fontWeight: editDisplayName ? 500 : 400,
                transition: 'color 0.2s',
              }}
            />
            {!editDisplayName ? (
              <button type="button" style={iconBtnStyle} onClick={() => { setEditDisplayName(true); setNewDisplayName(displayName); }} title="Edit">
                <EditIcon />
              </button>
            ) : (
              <>
                <button type="button" style={iconBtnStyle} onClick={handleDisplayNameSave} title="Save">
                  <SaveIcon />
                </button>
                <button type="button" style={iconBtnStyle} onClick={() => { setEditDisplayName(false); setNewDisplayName(displayName); }} title="Cancel">
                  <CancelIcon />
                </button>
              </>
            )}
          </div>
        </div>
        <div className="form-group">
          <label htmlFor="password">Password</label>
          <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
            <input
              id="password"
              type="password"
              value={password}
              onChange={e => setPassword(e.target.value)}
              readOnly={!editPassword}
              placeholder="••••••••••••••"
              style={{
                flex: 1,
                background: editPassword ? '#fff' : '#f7f8fa',
                borderColor: editPassword ? '#1b2554' : '#d1d5db',
                color: editPassword ? '#1b2554' : gray,
                fontWeight: editPassword ? 500 : 400,
                transition: 'color 0.2s',
              }}
            />
            {!editPassword ? (
              <button type="button" style={iconBtnStyle} onClick={() => { setEditPassword(true); setPassword(''); }} title="Edit">
                <EditIcon />
              </button>
            ) : (
              <>
                <button type="button" style={iconBtnStyle} onClick={handlePasswordSave} title="Save">
                  <SaveIcon />
                </button>
                <button type="button" style={iconBtnStyle} onClick={() => { setEditPassword(false); setPassword(''); }} title="Cancel">
                  <CancelIcon />
                </button>
              </>
            )}
          </div>
        </div>
        <button onClick={handleLogout} className="auth-button" style={{ marginTop: 24, background: '#1b2554' }}>Logout</button>
      </div>
    </div>
  );
};

export default AccountPage; 