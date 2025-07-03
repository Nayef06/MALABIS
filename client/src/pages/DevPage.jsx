import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Navbar from '../components/Navbar';
import '../LandingPage.css';

const DevPage = () => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();
  const [form, setForm] = useState({
    type: '',
    color: '',
    name: '',
    imageLink: '',
  });
  const [status, setStatus] = useState({ success: null, message: '' });

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const res = await fetch('/api/auth/status');
        if (res.ok) {
          const userData = await res.json();
          setUser(userData);
        } else {
          navigate('/login');
        }
      } catch {
        navigate('/login');
      } finally {
        setLoading(false);
      }
    };
    fetchUser();
  }, [navigate]);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setStatus({ success: null, message: '' });
    try {
      const res = await fetch('/api/clothing', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      });
      if (res.ok) {
        setStatus({ success: true, message: 'Clothing item uploaded!' });
        setForm({ type: '', color: '', name: '', imageLink: '' });
      } else {
        const data = await res.json();
        setStatus({ success: false, message: data.errors ? data.errors.map(e => e.msg).join(', ') : 'Failed to upload.' });
      }
    } catch (err) {
      setStatus({ success: false, message: 'Error uploading item.' });
    }
  };

  if (loading) return <div className="auth-container"><div>Loading...</div></div>;
  if (!user || user.username !== 'nayef') {
    return <div className="auth-container"><div>Not authorized.</div></div>;
  }

  return (
    <>
      <Navbar accountInverted={false} />
      <div className="auth-container">
        <div className="auth-form">
          <h2>Welcome to the Dev Page!</h2>
          <p>Only visible to nayef.</p>
          <form onSubmit={handleSubmit} style={{ marginTop: 24 }}>
            <div className="form-group">
              <label>Type</label>
              <select name="type" value={form.type} onChange={handleChange} required>
                <option value="">Select type</option>
                <option value="shirt">Shirt</option>
                <option value="pants">Pants</option>
                <option value="shoes">Shoes</option>
                <option value="hat">Hat</option>
                <option value="jacket">Jacket</option>
                <option value="accessory">Accessory</option>
              </select>
            </div>
            <div className="form-group">
              <label>Color</label>
              <select name="color" value={form.color} onChange={handleChange} required>
                <option value="">Select color</option>
                <option value="red">Red</option>
                <option value="blue">Blue</option>
                <option value="green">Green</option>
                <option value="yellow">Yellow</option>
                <option value="black">Black</option>
                <option value="white">White</option>
                <option value="purple">Purple</option>
                <option value="orange">Orange</option>
                <option value="gray">Gray</option>
                <option value="brown">Brown</option>
              </select>
            </div>
            <div className="form-group">
              <label>Name</label>
              <input name="name" value={form.name} onChange={handleChange} maxLength={10} required />
            </div>
            <div className="form-group">
              <label>Image Link</label>
              <input name="imageLink" value={form.imageLink} onChange={handleChange} required />
            </div>
            <button type="submit" className="auth-button" style={{ marginTop: 12 }}>Upload Clothing Item</button>
          </form>
          {status.message && (
            <div style={{ marginTop: 16, color: status.success ? 'green' : 'red', textAlign: 'center' }}>{status.message}</div>
          )}
        </div>
      </div>
    </>
  );
};

export default DevPage; 