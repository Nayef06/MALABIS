import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Icon } from '../components/Icons';
import { Modal, Toast } from '../components/UI';
import { apiFetch } from '../api';
import { clearDataCache, getProfile, updateProfile } from '../dataCache';
import packageJson from '../../package.json';
import './AccountPage.css';

export default function AccountPage() {
  const [user, setUser] = useState({ username: '', displayName: '' });
  const [name, setName] = useState('');
  const [password, setPassword] = useState('');
  const [editing, setEditing] = useState(null);
  const [saving, setSaving] = useState(false);
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [deleteText, setDeleteText] = useState('');
  const [deleting, setDeleting] = useState(false);
  const [deleteError, setDeleteError] = useState('');
  const [toast, setToast] = useState({ show: false, message: '', type: 'success' });
  const navigate = useNavigate();

  useEffect(() => {
    getProfile().then((data) => { setUser(data); setName(data.displayName || ''); })
      .catch(() => setToast({ show: true, type: 'error', message: 'Your details could not be loaded.' }));
  }, []);
  useEffect(() => {
    if (!toast.show) return undefined;
    const id = setTimeout(() => setToast((current) => ({ ...current, show: false })), 2200);
    return () => clearTimeout(id);
  }, [toast.show]);

  const save = async (kind) => {
    const body = kind === 'name' ? { displayName: name.trim() } : { password };
    if (kind === 'name' && body.displayName.length < 3) return setToast({ show: true, type: 'error', message: 'Your display name needs at least 3 characters.' });
    if (kind === 'password' && password.length < 8) return setToast({ show: true, type: 'error', message: 'Your password needs at least 8 characters.' });
    setSaving(true);
    try {
      const response = await apiFetch('/api/auth/update-profile', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body) });
      if (!response.ok) throw new Error();
      if (kind === 'name') setUser(updateProfile({ displayName: name.trim() })); else setPassword('');
      setEditing(null);
      setToast({ show: true, type: 'success', message: kind === 'name' ? 'Your name was updated.' : 'Your password was changed.' });
    } catch { setToast({ show: true, type: 'error', message: 'That change could not be saved.' }); }
    finally { setSaving(false); }
  };

  const logout = async () => {
    try { await apiFetch('/api/auth/logout', { method: 'POST' }); }
    finally { clearDataCache(); navigate('/login'); }
  };

  const deleteAccount = async () => {
    if (deleteText !== 'DELETE') return;
    setDeleting(true); setDeleteError('');
    try {
      const response = await apiFetch('/api/auth/account', { method: 'DELETE' });
      if (!response.ok) throw new Error();
      clearDataCache();
      navigate('/', { replace: true });
    } catch { setDeleteError('Your account could not be deleted. Please try again.'); setDeleting(false); }
  };

  return <div className="page account-page">
    <Toast {...toast} />
    <Modal open={deleteOpen} onClose={() => !deleting && setDeleteOpen(false)} eyebrow="A permanent goodbye" title="Delete your account?" className="confirm-sheet delete-account-sheet">
      <div className="confirm-sheet__body">
        <p>This permanently removes your profile, clothes, and saved outfits. This action cannot be undone.</p>
        <label className="field" htmlFor="delete-confirmation"><span className="field-label">Type DELETE to confirm</span><input id="delete-confirmation" className="input" value={deleteText} onChange={(event) => setDeleteText(event.target.value)} autoComplete="off" /></label>
        {deleteError && <p className="form-error" role="alert">{deleteError}</p>}
        <div className="button-row"><button className="button button--quiet" type="button" onClick={() => setDeleteOpen(false)} disabled={deleting}>Keep my account</button><button className="button button--danger" type="button" onClick={deleteAccount} disabled={deleteText !== 'DELETE' || deleting}>{deleting ? 'Deleting…' : 'Delete forever'}</button></div>
      </div>
    </Modal>
    <header className="page-heading account-heading"><div><p className="eyebrow">A corner that is only yours</p><h1>My corner</h1></div><p className="page-heading__copy">Keep the practical things tidy here. The rest of Malabis stays devoted to getting dressed.</p></header>
    <div className="account-layout"><aside className="account-portrait"><div className="account-portrait__initial">{(user.displayName || user.username || 'M').slice(0, 1).toUpperCase()}</div><span className="account-portrait__tape" /><h2>{user.displayName || 'Your name'}</h2><p>@{user.username || 'username'}</p><small>wardrobe keeper</small></aside>
      <section className="settings-list"><header><span>personal details</span><p>Simple, private, and easy to change.</p></header>
        <div className="setting-row"><div className="setting-row__label"><Icon name="user" /><span><b>Display name</b><small>The name you see around your wardrobe</small></span></div>{editing === 'name' ? <div className="setting-row__edit"><input className="input" value={name} onChange={(event) => setName(event.target.value)} aria-label="Display name" autoFocus /><button className="icon-button" onClick={() => save('name')} disabled={saving} aria-label="Save display name"><Icon name="check" /></button><button className="icon-button" onClick={() => { setEditing(null); setName(user.displayName || ''); }} aria-label="Cancel"><Icon name="close" /></button></div> : <div className="setting-row__value"><span>{user.displayName || '—'}</span><button className="text-link" onClick={() => setEditing('name')}><Icon name="edit" size={15} /> Edit</button></div>}</div>
        <div className="setting-row"><div className="setting-row__label"><Icon name="lock" /><span><b>Password</b><small>At least eight characters, kept to yourself</small></span></div>{editing === 'password' ? <div className="setting-row__edit"><input className="input" type="password" value={password} onChange={(event) => setPassword(event.target.value)} aria-label="New password" placeholder="New password" autoFocus /><button className="icon-button" onClick={() => save('password')} disabled={saving} aria-label="Save password"><Icon name="check" /></button><button className="icon-button" onClick={() => { setEditing(null); setPassword(''); }} aria-label="Cancel"><Icon name="close" /></button></div> : <div className="setting-row__value"><span>••••••••••••</span><button className="text-link" onClick={() => setEditing('password')}><Icon name="edit" size={15} /> Change</button></div>}</div>
        <div className="setting-row"><div className="setting-row__label"><Icon name="cookie" /><span><b>Cookie preferences</b><small>Optional choices are saved only in this browser</small></span></div><div className="setting-row__value"><span>Necessary cookies are always on</span><Link className="text-link" to="/cookie-settings">Manage</Link></div></div>
        <div className="setting-row setting-row--danger"><div className="setting-row__label"><Icon name="trash" /><span><b>Delete account</b><small>Permanently remove your wardrobe and profile</small></span></div><div className="setting-row__value"><span>This cannot be undone</span><button className="text-link text-link--danger" onClick={() => { setDeleteText(''); setDeleteError(''); setDeleteOpen(true); }}>Delete</button></div></div>
        <footer className="settings-footer"><div><span>Malabis v{import.meta.env.VITE_BUILD_SHA || packageJson.version}</span><small><Link to="/terms">Terms</Link> · <Link to="/privacy">Privacy</Link> · Your wardrobe data belongs to your account.</small></div><button className="button button--quiet" onClick={logout}><Icon name="logout" size={17} /> Log out</button></footer>
      </section>
    </div>
  </div>;
}
