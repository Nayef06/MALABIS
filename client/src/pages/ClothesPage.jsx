import React, { useEffect, useState } from 'react';
import '../LandingPage.css';

const CATEGORY_LABELS = {
  shirt: 'Shirts',
  pants: 'Pants',
  shoes: 'Shoes',
  hat: 'Hats',
  jacket: 'Jackets',
  accessory: 'Accessories',
};

const TrashIcon = ({ size = 20 }) => (
  <svg width={size} height={size} viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
    <rect x="5" y="8" width="2" height="7" rx="1" fill="#e53e3e"/>
    <rect x="9" y="8" width="2" height="7" rx="1" fill="#e53e3e"/>
    <rect x="13" y="8" width="2" height="7" rx="1" fill="#e53e3e"/>
    <rect x="3" y="5" width="14" height="2" rx="1" fill="#e53e3e"/>
    <rect x="7" y="2" width="6" height="2" rx="1" fill="#e53e3e"/>
  </svg>
);

const StarIcon = ({ size = 20, filled = false }) => (
  <svg width={size} height={size} viewBox="0 0 20 20" fill={filled ? '#1b2554' : 'none'} stroke="#1b2554" strokeWidth="1.5" xmlns="http://www.w3.org/2000/svg">
    <polygon points="10,2 12.59,7.36 18.51,8.09 14,12.26 15.18,18.09 10,15.1 4.82,18.09 6,12.26 1.49,8.09 7.41,7.36" />
  </svg>
);

const ConfirmPopup = ({ open, onConfirm, onCancel }) => {
  if (!open) return null;
  return (
    <div style={{
      position: 'fixed', top: 0, left: 0, width: '100vw', height: '100vh', background: 'rgba(0,0,0,0.18)', zIndex: 1000,
      display: 'flex', alignItems: 'center', justifyContent: 'center',
    }}>
      <div style={{ background: '#fff', borderRadius: 12, padding: 32, minWidth: 280, boxShadow: '0 4px 24px rgba(0,0,0,0.13)', textAlign: 'center' }}>
        <div style={{ fontWeight: 600, fontSize: 18, marginBottom: 18 }}>Delete this item?</div>
        <div style={{ color: '#5f6f8f', fontSize: 15, marginBottom: 24 }}>This action cannot be undone.</div>
        <div style={{ display: 'flex', gap: 16, justifyContent: 'center' }}>
          <button onClick={onCancel} style={{ padding: '8px 20px', borderRadius: 8, border: '1px solid #d1d5db', background: '#fff', color: '#1b2554', fontWeight: 500, cursor: 'pointer' }}>Cancel</button>
          <button onClick={onConfirm} style={{ padding: '8px 20px', borderRadius: 8, border: 'none', background: '#e53e3e', color: '#fff', fontWeight: 500, cursor: 'pointer' }}>Delete</button>
        </div>
      </div>
    </div>
  );
};

// Utility to get a light tint for a color name
const colorTints = {
  black: '#e5e7eb',
  white: '#f8fafc',
  red: '#fff5f5',
  blue: '#f0f6ff',
  green: '#f3faf7',
  yellow: '#fefce8',
  purple: '#f7f3ff',
  orange: '#fff7ed',
  gray: '#f3f4f6',
  brown: '#f8f5f2',
  // Add more as needed
};
function getColorTint(color) {
  return colorTints[color?.toLowerCase()] || '#e8f0fe';
}

const ClothesPage = () => {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [deletingId, setDeletingId] = useState(null);
  const [confirmId, setConfirmId] = useState(null);

  useEffect(() => {
    const fetchItems = async () => {
      try {
        const res = await fetch('/api/clothing/inventory');
        if (!res.ok) throw new Error('Failed to fetch inventory');
        const data = await res.json();
        setItems(data.items || []);
      } catch (err) {
        setError('Could not load your clothes.');
      } finally {
        setLoading(false);
      }
    };
    fetchItems();
  }, []);

  // Group items by type
  const grouped = items.reduce((acc, item) => {
    if (!acc[item.type]) acc[item.type] = [];
    acc[item.type].push(item);
    return acc;
  }, {});

  const handleDelete = async (id) => {
    setDeletingId(id);
    try {
      const res = await fetch(`/api/clothing/${id}`, { method: 'DELETE' });
      if (!res.ok) throw new Error('Failed to delete');
      setItems(items => items.filter(item => item._id !== id));
    } catch (err) {
      // Optionally show error popup
    } finally {
      setDeletingId(null);
      setConfirmId(null);
    }
  };

  const handleFavorite = async (item) => {
    const newFav = !item.isFavorited;
    // Optimistically update UI
    setItems(items => items.map(i => i._id === item._id ? { ...i, isFavorited: newFav } : i));
    try {
      await fetch(`/api/clothing/${item._id}/favorite`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ isFavorited: newFav }),
      });
    } catch (err) {
      // Optionally show error
    }
  };

  const lightBlue = '#e8f0fe';
  const navy = '#1b2554';
  const cardStyle = {
    position: 'relative',
    display: 'flex',
    flexDirection: 'column',
    background: '#fff',
    borderRadius: 25,
    boxShadow: '0 2px 16px rgba(27,37,84,0.08)',
    padding: 0,
    minWidth: 288,
    maxWidth: 306,
    minHeight: 342,
    marginBottom: 0,
    transition: 'box-shadow 0.25s cubic-bezier(.4,2,.6,1), transform 0.22s cubic-bezier(.4,2,.6,1)',
    cursor: 'pointer',
    overflow: 'hidden',
  };
  const imageBoxStyle = {
    background: lightBlue,
    borderRadius: 22,
    margin: '25px 25px 0 25px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    height: 162,
    flexGrow: 1,
    padding: 0,
  };
  const imageStyle = {
    width: 210,
    height: 210,
    maxWidth: '100%',
    maxHeight: '100%',
    objectFit: 'contain',
    borderRadius: 16,
    background: 'transparent',
    userSelect: 'none',
  };
  const bottomRowStyle = {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    width: '100%',
    padding: '0 25px 16px 25px',
    marginTop: 5,
  };
  const nameStyle = {
    fontWeight: 700,
    fontSize: 20,
    letterSpacing: 1.5,
    color: navy,
    textTransform: 'uppercase',
    textAlign: 'left',
  };
  const iconRowStyle = {
    display: 'flex',
    gap: 16,
    alignItems: 'center',
  };
  const iconBtnStyle = {
    width: 40,
    height: 40,
    borderRadius: '50%',
    background: '#f4f6fa',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    border: 'none',
    cursor: 'pointer',
    transition: 'background 0.18s, transform 0.18s',
    boxShadow: '0 1px 4px rgba(27,37,84,0.06)',
    padding: 0,
  };
  const iconSize = 25;
  const categoryTitleStyle = {
    marginBottom: 36,
    color: '#1b2554',
    fontSize: 44,
    marginLeft: 0,
  };
  const rowStyle = {
    display: 'flex',
    flexDirection: 'row',
    gap: 48,
    alignItems: 'flex-start',
    flexWrap: 'wrap',
  };

  if (loading) return <div className="page-container"><div className="content"><p>Loading...</p></div></div>;
  if (error) return <div className="page-container"><div className="content"><p>{error}</p></div></div>;

  return (
    <div className="page-container" style={{ alignItems: 'flex-start', justifyContent: 'flex-start' }}>
      <ConfirmPopup
        open={!!confirmId}
        onCancel={() => setConfirmId(null)}
        onConfirm={() => handleDelete(confirmId)}
      />
      <div className="content" style={{ maxWidth: '100%', margin: '0', textAlign: 'left', width: '100%' }}>
        {items.length === 0 ? (
          <p>Your inventory is empty.</p>
        ) : (
          Object.keys(CATEGORY_LABELS).map(type => (
            grouped[type] && grouped[type].length > 0 && (
              <div key={type} style={{ marginBottom: 40 }}>
                <h2 style={categoryTitleStyle}>{CATEGORY_LABELS[type]}</h2>
                <div style={rowStyle}>
                  {[...grouped[type]].sort((a, b) => (b.isFavorited ? 1 : 0) - (a.isFavorited ? 1 : 0)).map(item => (
                    <div
                      key={item._id}
                      style={cardStyle}
                      className="clothing-card"
                    >
                      <div style={{ ...imageBoxStyle, background: getColorTint(item.color), marginBottom: 8 }}>
                        {item.imageLink && <img src={item.imageLink} alt={item.name} style={{ ...imageStyle, userSelect: 'none' }} draggable={false} />}
                      </div>
                      <div style={bottomRowStyle}>
                        <div style={nameStyle}>{item.name}</div>
                        <div style={iconRowStyle}>
                          <button
                            style={{ ...iconBtnStyle, background: item.isFavorited ? '#e6eaff' : '#f4f6fa' }}
                            title="Star"
                            tabIndex={-1}
                            onClick={() => handleFavorite(item)}
                          >
                            <StarIcon size={iconSize} filled={!!item.isFavorited} />
                          </button>
                          <button
                            className="trash-btn"
                            onClick={() => !item.isFavorited && setConfirmId(item._id)}
                            style={{
                              ...iconBtnStyle,
                              backgroundColor: item.isFavorited ? '#f3f4f6' : (deletingId === item._id ? '#ffe5e5' : '#f4f6fa'),
                              color: item.isFavorited ? '#cbd5e1' : '#e53e3e',
                              cursor: item.isFavorited ? 'not-allowed' : 'pointer',
                              opacity: item.isFavorited ? 0.5 : 1,
                            }}
                            title={item.isFavorited ? 'Unfavorite to delete' : 'Delete'}
                            disabled={item.isFavorited || deletingId === item._id}
                          >
                            <TrashIcon size={iconSize} />
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )
          ))
        )}
      </div>
    </div>
  );
};

export default ClothesPage; 