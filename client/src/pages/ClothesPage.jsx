import React, { useEffect, useState } from 'react';
import '../LandingPage.css';
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

  const backdropStyle = {
    position: 'fixed',
    top: 0,
    left: 0,
    width: '100vw',
    height: '100vh',
    background: 'rgba(0,0,0,0.4)',
    zIndex: 1000,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    opacity: isAnimating ? 1 : 0,
    transition: 'opacity 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
  };

  const modalStyle = {
    background: '#fff',
    borderRadius: 24,
    padding: 0,
    minWidth: 400,
    maxWidth: 480,
    boxShadow: '0 20px 60px rgba(0,0,0,0.25)',
    textAlign: 'center',
    transform: isAnimating ? 'scale(1) translateY(0)' : 'scale(0.9) translateY(20px)',
    opacity: isAnimating ? 1 : 0,
    transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
    border: '2px solid rgba(27,37,84,0.15)',
    overflow: 'hidden',
  };

  const iconStyle = {
    width: 80,
    height: 80,
    borderRadius: '50%',
    background: 'linear-gradient(135deg, #ff6b6b, #ee5a52)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    margin: '32px auto 24px',
    boxShadow: '0 8px 24px rgba(238, 90, 82, 0.3)',
    animation: isAnimating ? 'pulse 2s infinite' : 'none',
  };

  const buttonStyle = {
    padding: '12px 24px',
    borderRadius: 12,
    border: 'none',
    fontWeight: 600,
    fontSize: 16,
    cursor: 'pointer',
    transition: 'all 0.2s cubic-bezier(0.4, 0, 0.2, 1)',
    minWidth: 120,
  };

  const cancelButtonStyle = {
    ...buttonStyle,
    background: '#f8f9fa',
    color: '#6b7280',
    border: '2px solid #e5e7eb',
  };

  const deleteButtonStyle = {
    ...buttonStyle,
    background: 'linear-gradient(135deg, #ff6b6b, #ee5a52)',
    color: '#fff',
    boxShadow: '0 4px 12px rgba(238, 90, 82, 0.3)',
  };

  return (
    <div style={backdropStyle} onClick={onCancel}>
      <div style={modalStyle} onClick={e => e.stopPropagation()}>
        <div style={iconStyle}>
          <svg width="32" height="32" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M12 2C13.1 2 14 2.9 14 4C14 5.1 13.1 6 12 6C10.9 6 10 5.1 10 4C10 2.9 10.9 2 12 2ZM21 9V7L15 1H5C3.9 1 3 1.9 3 3V21C3 22.1 3.9 23 5 23H19C20.1 23 21 22.1 21 21V9ZM19 9H14V4H5V21H19V9Z" fill="white"/>
          </svg>
        </div>
        
        <div style={{ padding: '0 32px 32px' }}>
          <h3 style={{ 
            fontWeight: 700, 
            fontSize: 24, 
            color: '#1b2554', 
            margin: '0 0 12px 0',
            letterSpacing: '-0.5px'
          }}>
            Delete this {itemType}?
          </h3>
          
          <p style={{ 
            color: '#6b7280', 
            fontSize: 16, 
            lineHeight: 1.5,
            margin: '0 0 32px 0'
          }}>
            This action cannot be undone. The {itemType} will be permanently removed from your collection.
          </p>
          
          <div style={{ display: 'flex', gap: 16, justifyContent: 'center' }}>
            <button 
              onClick={onCancel} 
              style={cancelButtonStyle}
              onMouseEnter={e => e.currentTarget.style.background = '#f1f3f4'}
              onMouseLeave={e => e.currentTarget.style.background = '#f8f9fa'}
            >
              Cancel
            </button>
            <button 
              onClick={onConfirm} 
              style={deleteButtonStyle}
              onMouseEnter={e => e.currentTarget.style.transform = 'translateY(-2px)'}
              onMouseLeave={e => e.currentTarget.style.transform = 'translateY(0)'}
            >
              Delete
            </button>
            </div>
          </div>
        </div>
        
        <style>{`
          @keyframes pulse {
            0%, 100% { transform: scale(1); }
            50% { transform: scale(1.05); }
          }
        `}</style>
      </div>
    );
  };

const UploadPopup = ({ open, onClose, onUploadSuccess }) => {
  const [isVisible, setIsVisible] = useState(false);
  const [isAnimating, setIsAnimating] = useState(false);
  const [selectedColor, setSelectedColor] = useState(null);
  const [selectedFile, setSelectedFile] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    type: '',
    color: ''
  });
  const [removeBackground, setRemoveBackground] = useState(true); // Background removal is now enabled

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

  const backdropStyle = {
    position: 'fixed',
    top: 0,
    left: 0,
    width: '100vw',
    height: '100vh',
    background: 'rgba(0,0,0,0.4)',
    zIndex: 1000,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    opacity: isAnimating ? 1 : 0,
    transition: 'opacity 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
  };

  const modalStyle = {
    background: '#fff',
    borderRadius: 24,
    padding: 0,
    minWidth: 600,
    maxWidth: 700,
    boxShadow: '0 20px 60px rgba(0,0,0,0.25)',
    textAlign: 'center',
    transform: isAnimating ? 'scale(1) translateY(0)' : 'scale(0.9) translateY(20px)',
    opacity: isAnimating ? 1 : 0,
    transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
    border: '2px solid rgba(27,37,84,0.15)',
    overflow: 'hidden',
  };

  return (
    <div style={backdropStyle} onClick={onClose}>
      <div style={modalStyle} onClick={e => e.stopPropagation()}>
        <div style={{ 
          display: 'flex', 
          minHeight: '400px',
          width: '100%'
        }}>
          <div style={{ 
            flex: 1, 
            padding: '32px',
            borderRight: '1px solid #e5e7eb',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center'
          }}>
            <h3 style={{ 
              fontWeight: 700, 
              fontSize: 20, 
              color: '#1b2554', 
              margin: '0 0 24px 0',
              letterSpacing: '-0.5px'
            }}>
              Upload Image
            </h3>
            
            <div style={{
              width: '120px',
              height: '120px',
              border: '2px dashed #d1d5db',
              borderRadius: '12px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              marginBottom: '16px',
              background: '#f9fafb',
              cursor: 'pointer',
              transition: 'all 0.2s ease',
              position: 'relative',
              overflow: 'hidden'
            }}
            onMouseEnter={e => e.currentTarget.style.borderColor = '#1b2554'}
            onMouseLeave={e => e.currentTarget.style.borderColor = '#d1d5db'}
            >
              {selectedFile ? (
                <img 
                  src={URL.createObjectURL(selectedFile)} 
                  alt="Preview" 
                  style={{
                    width: '100%',
                    height: '100%',
                    objectFit: 'cover',
                    borderRadius: '10px'
                  }}
                />
              ) : (
                <svg width="32" height="32" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M19 13h-6v6h-2v-6H5v-2h6V5h2v6h6v2z" fill="#9ca3af"/>
                </svg>
              )}
              <input
                type="file"
                accept="image/*"
                style={{
                  position: 'absolute',
                  top: 0,
                  left: 0,
                  width: '100%',
                  height: '100%',
                  opacity: 0,
                  cursor: 'pointer'
                }}
                onChange={(e) => {
                  const file = e.target.files[0];
                  if (file) {
                    setSelectedFile(file);
                  }
                }}
              />
            </div>
            
            <p style={{ 
              color: '#6b7280', 
              fontSize: 14, 
              margin: '0 0 16px 0'
            }}>
              {selectedFile ? selectedFile.name : 'Click to upload image'}
            </p>
            
            {selectedFile && (
              <button 
                style={{
                  padding: '8px 16px',
                  borderRadius: '8px',
                  border: 'none',
                  fontWeight: 600,
                  fontSize: 14,
                  cursor: 'pointer',
                  background: '#dc2626',
                  color: '#fff',
                  boxShadow: '0 2px 8px rgba(220, 38, 38, 0.2)',
                  transition: 'all 0.2s cubic-bezier(0.4, 0, 0.2, 1)',
                  marginBottom: '8px'
                }}
                onMouseEnter={e => e.currentTarget.style.transform = 'translateY(-1px)'}
                onMouseLeave={e => e.currentTarget.style.transform = 'translateY(0)'}
                onClick={() => setSelectedFile(null)}
              >
                Remove
              </button>
            )}
          </div>

          <div style={{ 
            flex: 1, 
            padding: '32px',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'flex-start'
          }}>
            <h3 style={{ 
              fontWeight: 700, 
              fontSize: 20, 
              color: '#1b2554', 
              margin: '0 0 24px 0',
              letterSpacing: '-0.5px'
            }}>
              Item Details
            </h3>
            
            <div style={{ marginBottom: '20px', width: '100%' }}>
              <label style={{ 
                display: 'block', 
                fontSize: '14px', 
                fontWeight: '600', 
                color: '#374151', 
                marginBottom: '8px' 
              }}>
                Name
              </label>
              <input
                type="text"
                placeholder="Enter clothing name"
                maxLength={15}
                value={formData.name}
                onChange={(e) => setFormData({...formData, name: e.target.value})}
                style={{
                  width: '100%',
                  padding: '12px 16px',
                  borderRadius: '8px',
                  border: '2px solid #e5e7eb',
                  fontSize: '14px',
                  outline: 'none',
                  background: '#fff',
                  transition: 'border-color 0.2s ease'
                }}
                onFocus={e => e.target.style.borderColor = '#1b2554'}
                onBlur={e => e.target.style.borderColor = '#e5e7eb'}
              />
            </div>

            <div style={{ marginBottom: '20px', width: '100%' }}>
              <label style={{ 
                display: 'block', 
                fontSize: '14px', 
                fontWeight: '600', 
                color: '#374151', 
                marginBottom: '8px' 
              }}>
                Type
              </label>
              <select 
                value={formData.type}
                onChange={(e) => setFormData({...formData, type: e.target.value})}
                style={{
                  width: '100%',
                  padding: '12px 16px',
                  borderRadius: '8px',
                  border: '2px solid #e5e7eb',
                  fontSize: '14px',
                  outline: 'none',
                  background: '#fff',
                  cursor: 'pointer',
                  transition: 'border-color 0.2s ease'
                }}
                onFocus={e => e.target.style.borderColor = '#1b2554'}
                onBlur={e => e.target.style.borderColor = '#e5e7eb'}
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

            <div style={{ marginBottom: '20px', width: '100%' }}>
              <label style={{ 
                display: 'block', 
                fontSize: '14px', 
                fontWeight: '600', 
                color: '#374151', 
                marginBottom: '8px' 
              }}>
                Color
              </label>
              <div style={{ 
                display: 'flex', 
                gap: '8px', 
                flexWrap: 'wrap' 
              }}>
                {[
                  { name: 'red', color: '#fd151b' },
                  { name: 'orange', color: '#fb5607' },
                  { name: 'yellow', color: '#ffbe0b' },
                  { name: 'green', color: '#8ac926' },
                  { name: 'blue', color: '#70d6ff' },
                  { name: 'purple', color: '#b5179e' },
                  { name: 'brown', color: '#dab785' },
                  { name: 'black', color: '#0c090d' },
                  { name: 'gray', color: '#e6e6ea' },
                  { name: 'white', color: '#f7fff7' }
                ].map(({ name, color }) => (
                  <div
                    key={name}
                    style={{
                      width: '32px',
                      height: '32px',
                      borderRadius: '50%',
                      background: color,
                      border: selectedColor === name ? '3px solid #1b2554' : '2px solid #e5e7eb',
                      cursor: 'pointer',
                      transition: 'all 0.2s ease',
                      position: 'relative'
                    }}
                    onMouseEnter={e => e.currentTarget.style.transform = 'scale(1.1)'}
                    onMouseLeave={e => e.currentTarget.style.transform = 'scale(1)'}
                    onClick={() => {
                      setSelectedColor(name);
                      setFormData({...formData, color: name});
                    }}
                    title={name}
                  >
                    {selectedColor === name && (
                      <div style={{
                        position: 'absolute',
                        top: '-4px',
                        right: '-4px',
                        width: '16px',
                        height: '16px',
                        borderRadius: '50%',
                        background: '#1b2554',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        border: '2px solid #fff'
                      }}>
                        <svg width="8" height="8" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                          <path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z" fill="#fff"/>
                        </svg>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>

            <div style={{ marginBottom: '20px', width: '100%' }}>
              <label style={{ 
                display: 'block', 
                fontSize: '14px', 
                fontWeight: '600', 
                color: '#374151', 
                marginBottom: '8px' 
              }}>
                Background Removal
              </label>
              <div style={{
                display: 'flex',
                alignItems: 'center',
                gap: '12px',
                padding: '12px 16px',
                borderRadius: '8px',
                border: '2px solid #e5e7eb',
                background: '#fff',
                transition: 'border-color 0.2s ease'
              }}
              onMouseEnter={e => e.currentTarget.style.borderColor = '#1b2554'}
              onMouseLeave={e => e.currentTarget.style.borderColor = '#e5e7eb'}
              >
                <div
                  style={{
                    width: '62px',
                    height: '24px',
                    borderRadius: '12px',
                    background: removeBackground ? '#1b2554' : '#e5e7eb',
                    position: 'relative',
                    transition: 'background 0.2s ease',
                    display: 'flex',
                    alignItems: 'center',
                    padding: '2px',
                    cursor: 'pointer',
                  }}
                  onClick={() => setRemoveBackground(!removeBackground)}
                >
                  <div style={{
                    width: '20px',
                    height: '20px',
                    borderRadius: '50%',
                    background: '#fff',
                    transform: removeBackground ? 'translateX(20px)' : 'translateX(0)',
                    transition: 'transform 0.2s ease',
                    boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
                  }} />
                </div>
                <span style={{
                  fontSize: '12px',
                  color: '#6b7280',
                  marginLeft: '8px'
                }}>
                  Remove background from uploaded images
                </span>
              </div>
            </div>

            <div style={{ 
              display: 'flex', 
              gap: '12px', 
              marginTop: 'auto',
              width: '100%'
            }}>
              <button 
                onClick={onClose} 
                style={{
                  flex: 1,
                  padding: '12px 16px',
                  borderRadius: '8px',
                  border: '2px solid #e5e7eb',
                  fontWeight: 600,
                  fontSize: 14,
                  cursor: 'pointer',
                  background: '#fff',
                  color: '#6b7280',
                  transition: 'all 0.2s ease'
                }}
                onMouseEnter={e => e.currentTarget.style.background = '#f9fafb'}
                onMouseLeave={e => e.currentTarget.style.background = '#fff'}
              >
                Cancel
              </button>
              <button 
                disabled={!selectedFile || !formData.name || !formData.type || !formData.color || uploading}
                style={{
                  flex: 1,
                  padding: '12px 16px',
                  borderRadius: '8px',
                  border: 'none',
                  fontWeight: 600,
                  fontSize: 14,
                  cursor: (!selectedFile || !formData.name || !formData.type || !formData.color || uploading) ? 'not-allowed' : 'pointer',
                  background: (!selectedFile || !formData.name || !formData.type || !formData.color || uploading) 
                    ? '#9ca3af' 
                    : 'linear-gradient(135deg, #1b2554 0%, #3b4a6b 100%)',
                  color: '#fff',
                  boxShadow: (!selectedFile || !formData.name || !formData.type || !formData.color || uploading) 
                    ? 'none' 
                    : '0 2px 8px rgba(27, 37, 84, 0.2)',
                  transition: 'all 0.2s cubic-bezier(0.4, 0, 0.2, 1)',
                  opacity: (!selectedFile || !formData.name || !formData.type || !formData.color || uploading) ? 0.6 : 1,
                }}
                onMouseEnter={e => {
                  if (selectedFile && formData.name && formData.type && formData.color && !uploading) {
                    e.currentTarget.style.transform = 'translateY(-1px)';
                  }
                }}
                onMouseLeave={e => e.currentTarget.style.transform = 'translateY(0)'}
                onClick={async () => {
                  if (!selectedFile || !formData.name || !formData.type || !formData.color || uploading) return;
                  
                  setUploading(true);
                  try {
                    const formDataToSend = new FormData();
                    formDataToSend.append('image', selectedFile);
                    formDataToSend.append('removeBackground', removeBackground);
                    
                    const uploadRes = await apiFetch('/api/clothing/upload', {
                      method: 'POST',
                      body: formDataToSend,
                    });
                    
                    if (!uploadRes.ok) {
                      throw new Error('Failed to upload image');
                    }
                    
                    const uploadData = await uploadRes.json();
                    
                    const clothingRes = await apiFetch('/api/clothing', {
                      method: 'POST',
                      headers: { 'Content-Type': 'application/json' },
                      body: JSON.stringify({
                        name: formData.name,
                        type: formData.type,
                        color: formData.color,
                        imageLink: uploadData.imageUrl
                      }),
                    });
                    
                    if (!clothingRes.ok) {
                      throw new Error('Failed to create clothing item');
                    }
                    
                    setSelectedFile(null);
                    setFormData({ name: '', type: '', color: '' });
                    setSelectedColor(null);
                    onClose();
                    if (onUploadSuccess) {
                      onUploadSuccess();
                    }
                  } catch (error) {
                    console.error('Upload error:', error);
                    alert('Failed to upload clothing item. Please try again.');
                  } finally {
                    setUploading(false);
                  }
                }}
              >
                {uploading ? 'Uploading...' : 'Upload'}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

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
        itemType="clothing item"
      />
      <UploadPopup
        open={showUploadPopup}
        onClose={() => setShowUploadPopup(false)}
        onUploadSuccess={refreshItems}
      />
      <div className="content" style={{ maxWidth: '100%', margin: '0', textAlign: 'left', width: '100%' }}>
        <div className="upload-button-container" style={{ 
          marginBottom: 32, 
          display: 'flex', 
          justifyContent: 'flex-start',
          alignItems: 'center'
        }}>
          <button
            style={{
              background: 'linear-gradient(135deg, #1b2554 0%, #3b4a6b 100%)',
              color: '#fff',
              border: 'none',
              borderRadius: 12,
              padding: '12px 24px',
              fontSize: 16,
              fontWeight: 600,
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: 8,
              boxShadow: '0 4px 12px rgba(27, 37, 84, 0.3)',
              transition: 'all 0.2s cubic-bezier(0.4, 0, 0.2, 1)',
            }}
            onMouseEnter={e => e.currentTarget.style.transform = 'translateY(-2px)'}
            onMouseLeave={e => e.currentTarget.style.transform = 'translateY(0)'}
            onClick={() => setShowUploadPopup(true)}
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M12 2C13.1 2 14 2.9 14 4C14 5.1 13.1 6 12 6C10.9 6 10 5.1 10 4C10 2.9 10.9 2 12 2ZM21 9V7L15 1H5C3.9 1 3 1.9 3 3V21C3 22.1 3.9 23 5 23H19C20.1 23 21 22.1 21 21V9ZM19 9H14V4H5V21H19V9Z" fill="currentColor"/>
            </svg>
            Upload Clothing
          </button>
        </div>
        
        {items.length === 0 ? (
          <p>Your inventory is empty.</p>
        ) : (
          Object.keys(CATEGORY_LABELS).map(type => (
            grouped[type] && grouped[type].length > 0 && (
              <div key={type} style={{ marginBottom: 40 }}>
                <h2 className="category-title" style={categoryTitleStyle}>{CATEGORY_LABELS[type]}</h2>
                <div className="clothing-row" style={rowStyle}>
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