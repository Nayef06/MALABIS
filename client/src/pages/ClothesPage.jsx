import React, { useEffect, useState } from 'react';
import './ClothesPage.css';
import { apiFetch } from '../api';

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
    <rect x="5" y="8" width="2" height="7" rx="1" fill="currentColor"/>
    <rect x="9" y="8" width="2" height="7" rx="1" fill="currentColor"/>
    <rect x="13" y="8" width="2" height="7" rx="1" fill="currentColor"/>
    <rect x="3" y="5" width="14" height="2" rx="1" fill="currentColor"/>
    <rect x="7" y="2" width="6" height="2" rx="1" fill="currentColor"/>
  </svg>
);

const StarIcon = ({ size = 20, filled = false }) => (
  <svg width={size} height={size} viewBox="0 0 20 20" fill={filled ? 'var(--accent)' : 'none'} stroke="var(--accent)" strokeWidth="1.5" xmlns="http://www.w3.org/2000/svg">
    <polygon points="10,2 12.59,7.36 18.51,8.09 14,12.26 15.18,18.09 10,15.1 4.82,18.09 6,12.26 1.49,8.09 7.41,7.36" />
  </svg>
);

const ConfirmPopup = ({ open, onConfirm, onCancel, itemType = 'item' }) => {
  const [isVisible, setIsVisible] = useState(false);
  const [isAnimating, setIsAnimating] = useState(false);

  useEffect(() => {
    if (open) {
      setIsVisible(true);
      setIsAnimating(true);
    } else {
      setIsAnimating(false);
      const timer = setTimeout(() => setIsVisible(false), 300);
      return () => clearTimeout(timer);
    }
  }, [open]);

  if (!isVisible) return null;

  return (
    <div style={{
      position: 'fixed', top: 0, left: 0, width: '100vw', height: '100vh',
      background: 'rgba(0,0,0,0.6)', zIndex: 1000,
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      opacity: isAnimating ? 1 : 0,
      transition: 'opacity 0.3s ease',
    }} onClick={onCancel}>
      <div style={{
        background: 'var(--bg-surface)', borderRadius: 'var(--radius-lg)',
        padding: 0, minWidth: 380, maxWidth: 440,
        border: '1px solid var(--border)',
        transform: isAnimating ? 'scale(1)' : 'scale(0.95)',
        opacity: isAnimating ? 1 : 0,
        transition: 'all 0.3s ease', textAlign: 'center', overflow: 'hidden',
      }} onClick={e => e.stopPropagation()}>
        <div style={{
          width: 64, height: 64, borderRadius: '50%',
          background: 'var(--danger-dim)', display: 'flex',
          alignItems: 'center', justifyContent: 'center',
          margin: '28px auto 20px',
        }}>
          <svg width="28" height="28" viewBox="0 0 24 24" fill="none"><path d="M6 6l8 8M6 14L14 6" stroke="var(--danger)" strokeWidth="2.5" strokeLinecap="round"/></svg>
        </div>
        <div style={{ padding: '0 28px 28px' }}>
          <h3 style={{ fontWeight: 700, fontSize: 20, color: 'var(--text-primary)', margin: '0 0 8px 0' }}>
            Delete this {itemType}?
          </h3>
          <p style={{ color: 'var(--text-secondary)', fontSize: 14, lineHeight: 1.5, margin: '0 0 24px 0' }}>
            This action cannot be undone. The {itemType} will be permanently removed.
          </p>
          <div style={{ display: 'flex', gap: 12, justifyContent: 'center' }}>
            <button onClick={onCancel} style={{
              padding: '10px 20px', borderRadius: 'var(--radius-sm)',
              border: '1px solid var(--border)', background: 'var(--bg-elevated)',
              color: 'var(--text-secondary)', fontWeight: 600, fontSize: 14,
              cursor: 'pointer', transition: 'all 0.2s', fontFamily: 'inherit',
            }}>Cancel</button>
            <button onClick={onConfirm} style={{
              padding: '10px 20px', borderRadius: 'var(--radius-sm)',
              border: 'none', background: 'var(--danger)',
              color: '#fff', fontWeight: 600, fontSize: 14,
              cursor: 'pointer', transition: 'all 0.2s', fontFamily: 'inherit',
            }}>Delete</button>
          </div>
        </div>
      </div>
    </div>
  );
};

const UploadPopup = ({ open, onClose, onUploadSuccess }) => {
  const [isVisible, setIsVisible] = useState(false);
  const [isAnimating, setIsAnimating] = useState(false);
  const [selectedColor, setSelectedColor] = useState(null);
  const [selectedFile, setSelectedFile] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [windowWidth, setWindowWidth] = useState(window.innerWidth);
  const [formData, setFormData] = useState({ name: '', type: '', color: '' });
  const [removeBackground, setRemoveBackground] = useState(true);

  useEffect(() => {
    const handleResize = () => setWindowWidth(window.innerWidth);
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  useEffect(() => {
    if (open) {
      setIsVisible(true);
      setIsAnimating(true);
    } else {
      setIsAnimating(false);
      const timer = setTimeout(() => {
        setIsVisible(false);
        setSelectedFile(null);
        setFormData({ name: '', type: '', color: '' });
        setSelectedColor(null);
        setUploading(false);
      }, 300);
      return () => clearTimeout(timer);
    }
  }, [open]);

  if (!isVisible) return null;

  const isMobile = windowWidth < 768;
  const isDisabled = !selectedFile || !formData.name || !formData.type || !formData.color || uploading;

  return (
    <div style={{
      position: 'fixed', top: 0, left: 0, width: '100vw', height: '100vh',
      background: 'rgba(0,0,0,0.6)', zIndex: 1000,
      display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 20,
      opacity: isAnimating ? 1 : 0, transition: 'opacity 0.3s ease',
    }} onClick={onClose}>
      <div style={{
        background: 'var(--bg-surface)', borderRadius: 'var(--radius-lg)',
        minWidth: isMobile ? '90vw' : 560, maxWidth: isMobile ? '90vw' : 660,
        maxHeight: isMobile ? '85vh' : '90vh',
        border: '1px solid var(--border)',
        transform: isAnimating ? 'scale(1)' : 'scale(0.95)',
        opacity: isAnimating ? 1 : 0,
        transition: 'all 0.3s ease', overflow: 'hidden',
      }} onClick={e => e.stopPropagation()}>
        <div style={{
          display: 'flex', flexDirection: isMobile ? 'column' : 'row',
          width: '100%', overflow: 'auto',
          maxHeight: isMobile ? '85vh' : '90vh',
        }}>
          {/* Image Upload Column */}
          <div style={{
            flex: 1, padding: isMobile ? 20 : 28,
            borderRight: isMobile ? 'none' : '1px solid var(--border)',
            borderBottom: isMobile ? '1px solid var(--border)' : 'none',
            display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
          }}>
            <h3 style={{ fontWeight: 700, fontSize: 18, color: 'var(--text-primary)', margin: '0 0 20px 0' }}>
              Upload Image
            </h3>
            <div style={{
              width: 110, height: 110,
              border: '2px dashed var(--border-strong)', borderRadius: 'var(--radius-md)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              marginBottom: 12, background: 'var(--bg-elevated)',
              cursor: 'pointer', transition: 'all 0.2s', position: 'relative', overflow: 'hidden',
            }}>
              {selectedFile ? (
                <img src={URL.createObjectURL(selectedFile)} alt="Preview" style={{
                  width: '100%', height: '100%', objectFit: 'cover', borderRadius: 10,
                }} />
              ) : (
                <svg width="28" height="28" viewBox="0 0 24 24" fill="none"><path d="M19 13h-6v6h-2v-6H5v-2h6V5h2v6h6v2z" fill="var(--text-muted)"/></svg>
              )}
              <input type="file" accept="image/*" style={{
                position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', opacity: 0, cursor: 'pointer',
              }} onChange={e => { const file = e.target.files[0]; if (file) setSelectedFile(file); }} />
            </div>
            <p style={{ color: 'var(--text-muted)', fontSize: 13, margin: '0 0 12px 0' }}>
              {selectedFile ? selectedFile.name : 'Click to upload image'}
            </p>
            {selectedFile && (
              <button style={{
                padding: '6px 14px', borderRadius: 'var(--radius-sm)', border: 'none',
                fontWeight: 600, fontSize: 13, cursor: 'pointer',
                background: 'var(--danger)', color: '#fff', transition: 'all 0.2s',
                fontFamily: 'inherit',
              }} onClick={() => setSelectedFile(null)}>Remove</button>
            )}
          </div>

          {/* Details Column */}
          <div style={{
            flex: 1, padding: isMobile ? 20 : 28,
            display: 'flex', flexDirection: 'column',
            alignItems: isMobile ? 'center' : 'flex-start', overflow: 'auto',
          }}>
            <h3 style={{ fontWeight: 700, fontSize: 18, color: 'var(--text-primary)', margin: '0 0 20px 0' }}>
              Item Details
            </h3>

            {/* Name */}
            <div style={{ marginBottom: 16, width: '100%' }}>
              <label style={{ display: 'block', fontSize: 13, fontWeight: 600, color: 'var(--text-secondary)', marginBottom: 6 }}>Name</label>
              <input type="text" placeholder="Enter clothing name" maxLength={15}
                value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})}
                style={{
                  width: '100%', padding: '10px 14px', borderRadius: 'var(--radius-sm)',
                  border: '1px solid var(--border)', fontSize: 14, outline: 'none',
                  background: 'var(--bg-elevated)', color: 'var(--text-primary)',
                  transition: 'border-color 0.2s', fontFamily: 'inherit',
                }}
                onFocus={e => e.target.style.borderColor = 'var(--accent)'}
                onBlur={e => e.target.style.borderColor = 'var(--border)'}
              />
            </div>

            {/* Type */}
            <div style={{ marginBottom: 16, width: '100%' }}>
              <label style={{ display: 'block', fontSize: 13, fontWeight: 600, color: 'var(--text-secondary)', marginBottom: 6 }}>Type</label>
              <select value={formData.type} onChange={e => setFormData({...formData, type: e.target.value})}
                style={{
                  width: '100%', padding: '10px 14px', borderRadius: 'var(--radius-sm)',
                  border: '1px solid var(--border)', fontSize: 14, outline: 'none',
                  background: 'var(--bg-elevated)', color: 'var(--text-primary)',
                  cursor: 'pointer', transition: 'border-color 0.2s',
                  appearance: 'none', fontFamily: 'inherit',
                  backgroundImage: `url("data:image/svg+xml;charset=UTF-8,%3csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' fill='none' stroke='%238888a0' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'%3e%3cpolyline points='6,9 12,15 18,9'%3e%3c/polyline%3e%3c/svg%3e")`,
                  backgroundRepeat: 'no-repeat', backgroundPosition: 'right 12px center', backgroundSize: '16px', paddingRight: 36,
                }}
                onFocus={e => e.target.style.borderColor = 'var(--accent)'}
                onBlur={e => e.target.style.borderColor = 'var(--border)'}
              >
                <option value="">Select type</option>
                <option value="shirt">Shirt</option>
                <option value="pants">Pants</option>
                <option value="shoes">Shoes</option>
                <option value="hat">Hat</option>
                <option value="jacket">Jacket</option>
                <option value="accessory">Accessory</option>
              </select>
            </div>

            {/* Color */}
            <div style={{ marginBottom: 16, width: '100%' }}>
              <label style={{ display: 'block', fontSize: 13, fontWeight: 600, color: 'var(--text-secondary)', marginBottom: 6 }}>Color</label>
              <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', justifyContent: isMobile ? 'center' : 'flex-start' }}>
                {[
                  { name: 'red', color: '#fd151b' },
                  { name: 'orange', color: '#fb5607' },
                  { name: 'yellow', color: '#ffbe0b' },
                  { name: 'green', color: '#8ac926' },
                  { name: 'blue', color: '#70d6ff' },
                  { name: 'purple', color: '#b5179e' },
                  { name: 'brown', color: '#dab785' },
                  { name: 'black', color: '#2a2a32' },
                  { name: 'gray', color: '#6b6b7a' },
                  { name: 'white', color: '#e8e8ec' },
                ].map(({ name, color }) => (
                  <div key={name} style={{
                    width: 30, height: 30, borderRadius: '50%', background: color,
                    border: selectedColor === name ? '3px solid var(--accent)' : '2px solid var(--border)',
                    cursor: 'pointer', transition: 'all 0.2s', position: 'relative',
                  }}
                  onClick={() => { setSelectedColor(name); setFormData({...formData, color: name}); }}
                  title={name}
                  >
                    {selectedColor === name && (
                      <div style={{
                        position: 'absolute', top: -4, right: -4, width: 14, height: 14,
                        borderRadius: '50%', background: 'var(--accent)',
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        border: '2px solid var(--bg-surface)',
                      }}>
                        <svg width="7" height="7" viewBox="0 0 24 24" fill="none"><path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z" fill="#fff"/></svg>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>

            {/* Background Removal Toggle (desktop only) */}
            {!isMobile && (
              <div style={{ marginBottom: 16, width: '100%' }}>
                <label style={{ display: 'block', fontSize: 13, fontWeight: 600, color: 'var(--text-secondary)', marginBottom: 6 }}>Background Removal</label>
                <div style={{
                  display: 'flex', alignItems: 'center', gap: 12, padding: '10px 14px',
                  borderRadius: 'var(--radius-sm)', border: '1px solid var(--border)',
                  background: 'var(--bg-elevated)', transition: 'border-color 0.2s',
                }}>
                  <div style={{
                    width: 44, height: 22, borderRadius: 11,
                    background: removeBackground ? 'var(--accent)' : 'var(--border)',
                    position: 'relative', transition: 'background 0.2s', cursor: 'pointer',
                    display: 'flex', alignItems: 'center', padding: 2,
                  }} onClick={() => setRemoveBackground(!removeBackground)}>
                    <div style={{
                      width: 18, height: 18, borderRadius: '50%', background: '#fff',
                      transform: removeBackground ? 'translateX(22px)' : 'translateX(0)',
                      transition: 'transform 0.2s',
                    }} />
                  </div>
                  <span style={{ fontSize: 12, color: 'var(--text-muted)' }}>
                    Remove background from uploaded images
                  </span>
                </div>
              </div>
            )}

            {/* Actions */}
            <div style={{ display: 'flex', gap: 10, marginTop: 'auto', width: '100%' }}>
              <button onClick={onClose} style={{
                flex: 1, padding: '10px 14px', borderRadius: 'var(--radius-sm)',
                border: '1px solid var(--border)', fontWeight: 600, fontSize: 14,
                cursor: 'pointer', background: 'var(--bg-elevated)', color: 'var(--text-secondary)',
                transition: 'all 0.2s', fontFamily: 'inherit',
              }}>Cancel</button>
              <button disabled={isDisabled} style={{
                flex: 1, padding: '10px 14px', borderRadius: 'var(--radius-sm)',
                border: 'none', fontWeight: 600, fontSize: 14,
                cursor: isDisabled ? 'not-allowed' : 'pointer',
                background: isDisabled ? 'var(--border)' : 'var(--accent)',
                color: '#fff', transition: 'all 0.2s', fontFamily: 'inherit',
                opacity: isDisabled ? 0.5 : 1,
              }} onClick={async () => {
                if (isDisabled) return;
                setUploading(true);
                try {
                  const formDataToSend = new FormData();
                  formDataToSend.append('image', selectedFile);
                  formDataToSend.append('removeBackground', removeBackground);
                  const uploadRes = await apiFetch('/api/clothing/upload', { method: 'POST', body: formDataToSend });
                  if (!uploadRes.ok) throw new Error('Failed to upload image');
                  const uploadData = await uploadRes.json();
                  const clothingRes = await apiFetch('/api/clothing', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ name: formData.name, type: formData.type, color: formData.color, imageLink: uploadData.imageUrl }),
                  });
                  if (!clothingRes.ok) throw new Error('Failed to create clothing item');
                  setSelectedFile(null);
                  setFormData({ name: '', type: '', color: '' });
                  setSelectedColor(null);
                  onClose();
                  if (onUploadSuccess) onUploadSuccess();
                } catch (error) {
                  console.error('Upload error:', error);
                  alert('Failed to upload clothing item. Please try again.');
                } finally {
                  setUploading(false);
                }
              }}>{uploading ? 'Uploading...' : 'Upload'}</button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

const ClothesPage = () => {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [deletingId, setDeletingId] = useState(null);
  const [confirmId, setConfirmId] = useState(null);
  const [showUploadPopup, setShowUploadPopup] = useState(false);

  const refreshItems = async () => {
    try {
      const res = await apiFetch('/api/clothing/inventory');
      if (!res.ok) throw new Error('Failed to fetch inventory');
      const data = await res.json();
      setItems(data.items || []);
    } catch (err) {
      setError('Could not load your clothes.');
    }
  };

  useEffect(() => {
    const fetchItems = async () => {
      try {
        const res = await apiFetch('/api/clothing/inventory');
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

  const grouped = items.reduce((acc, item) => {
    if (!acc[item.type]) acc[item.type] = [];
    acc[item.type].push(item);
    return acc;
  }, {});

  const handleDelete = async (id) => {
    setDeletingId(id);
    try {
      const res = await apiFetch(`/api/clothing/${id}`, { method: 'DELETE' });
      if (!res.ok) throw new Error('Failed to delete');
      setItems(items => items.filter(item => item._id !== id));
    } catch (err) {
    } finally {
      setDeletingId(null);
      setConfirmId(null);
    }
  };

  const handleFavorite = async (item) => {
    const newFav = !item.isFavorited;
    setItems(items => items.map(i => i._id === item._id ? { ...i, isFavorited: newFav } : i));
    try {
      await apiFetch(`/api/clothing/${item._id}/favorite`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ isFavorited: newFav }),
      });
    } catch (err) {
    }
  };

  if (loading) return <div className="clothes-page"><p className="clothes-empty">Loading...</p></div>;
  if (error) return <div className="clothes-page"><p className="clothes-empty">{error}</p></div>;

  return (
    <div className="clothes-page">
      <ConfirmPopup open={!!confirmId} onCancel={() => setConfirmId(null)} onConfirm={() => handleDelete(confirmId)} itemType="clothing item" />
      <UploadPopup open={showUploadPopup} onClose={() => setShowUploadPopup(false)} onUploadSuccess={refreshItems} />

      <div className="clothes-content">
        <div className="clothes-header">
          <button className="upload-btn" onClick={() => setShowUploadPopup(true)}>
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none"><path d="M19 13h-6v6h-2v-6H5v-2h6V5h2v6h6v2z" fill="currentColor"/></svg>
            Upload Clothing
          </button>
        </div>

        {items.length === 0 ? (
          <p className="clothes-empty">Your inventory is empty.</p>
        ) : (
          Object.keys(CATEGORY_LABELS).map(type => (
            grouped[type] && grouped[type].length > 0 && (
              <section key={type} className="clothes-category">
                <h2 className="clothes-category-title">{CATEGORY_LABELS[type]}</h2>
                <div className="clothes-grid">
                  {[...grouped[type]].sort((a, b) => (b.isFavorited ? 1 : 0) - (a.isFavorited ? 1 : 0)).map(item => (
                    <article key={item._id} className="clothes-card">
                      <div className="clothes-card-image">
                        {item.imageLink && <img src={item.imageLink} alt={item.name} draggable={false} />}
                      </div>
                      <div className="clothes-card-footer">
                        <span className="clothes-card-name">{item.name}</span>
                        <div className="clothes-card-actions">
                          <button className="clothes-icon-btn" title="Star" onClick={() => handleFavorite(item)}
                            style={{ background: item.isFavorited ? 'var(--accent-dim)' : 'var(--bg-elevated)' }}>
                            <StarIcon size={22} filled={!!item.isFavorited} />
                          </button>
                          <button className="clothes-icon-btn clothes-icon-btn-delete" title={item.isFavorited ? 'Unfavorite to delete' : 'Delete'}
                            onClick={() => !item.isFavorited && setConfirmId(item._id)}
                            disabled={item.isFavorited || deletingId === item._id}
                            style={{
                              color: item.isFavorited ? 'var(--text-muted)' : 'var(--danger)',
                              opacity: item.isFavorited ? 0.4 : 1,
                              cursor: item.isFavorited ? 'not-allowed' : 'pointer',
                            }}>
                            <TrashIcon size={22} />
                          </button>
                        </div>
                      </div>
                    </article>
                  ))}
                </div>
              </section>
            )
          ))
        )}
      </div>
    </div>
  );
};

export default ClothesPage;