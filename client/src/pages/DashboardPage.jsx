import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Navbar from '../components/Navbar';
import '../LandingPage.css';
import './Auth.css';
import { apiFetch } from '../api';

const DashboardPage = () => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchStatus = async () => {
      try {
        const response = await apiFetch('/api/auth/status');
        if (response.ok) {
          const data = await response.json();
          setUser(data);
        } else {
          setError('Not authenticated. Redirecting to login...');
          setTimeout(() => navigate('/login'), 2000);
        }
      } catch (err) {
        setError('An error occurred while fetching the status.');
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchStatus();
  }, [navigate]);

  const handleLogout = async () => {
    try {
      await apiFetch('/api/auth/logout', { method: 'POST' });
      navigate('/login');
    } catch (err) {
      console.error('Failed to log out', err);
    }
  };

  if (loading) {
    return <div className="auth-container"><div>Loading...</div></div>;
  }

  if (error) {
    return <div className="auth-container"><div>{error}</div></div>;
  }

  return (
    <>
      <Navbar />
      <div className="auth-container">
        <div className="auth-form">
          <h2>Welcome, {user.displayName}</h2>
          <div className="dashboard-info">
            <p>Here is your full session data:</p>
            <pre>{JSON.stringify(user, null, 2)}</pre>
          </div>
          <button onClick={handleLogout} className="auth-button">
            Logout
          </button>
        </div>
      </div>
    </>
  );
};

export default DashboardPage; 