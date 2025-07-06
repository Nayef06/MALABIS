import React, { useState, useEffect } from 'react';
import '../LandingPage.css';
import './OutfitsPage.css';

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
const ConfirmPopup = ({ open, onConfirm, onCancel, itemType = 'outfit' }) => {
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

const cardStyle = {
  position: 'relative',
  display: 'flex',
  flexDirection: 'column',
  background: '#fff',
  borderRadius: 25,
  boxShadow: '0 2px 16px rgba(27,37,84,0.08)',
  padding: 0,
  minWidth: 288,
  maxWidth: '100%',
  minHeight: 342,
  marginBottom: 0,
  transition: 'box-shadow 0.25s cubic-bezier(.4,2,.6,1), transform 0.22s cubic-bezier(.4,2,.6,1)',
  overflow: 'hidden',
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
const iconBtnDeleteHover = {
  background: '#ffe5e5',
  transform: 'scale(1.15)',
};
const iconBtnDeleteDisabled = {
  background: '#f4f6fa',
  cursor: 'not-allowed',
  opacity: 0.5,
  pointerEvents: 'none',
};
const iconRowStyle = {
  display: 'flex',
  gap: 16,
  alignItems: 'center',
  position: 'absolute',
  top: 18,
  right: 18,
  zIndex: 2,
};

function OutfitSlotModal({ open, onClose, onSave }) {
  const [slots, setSlots] = useState(Array(8).fill(null));
  const [pickerSlot, setPickerSlot] = useState(null); 
  const [clothes, setClothes] = useState([]);
  const [loading, setLoading] = useState(false);
  const [fitName, setFitName] = useState('');

  useEffect(() => {
    if (open) {
      setSlots(Array(8).fill(null));
      setPickerSlot(null);
      setFitName('');
      setLoading(true);
      fetch('/api/clothing/inventory')
        .then(res => res.json())
        .then(data => setClothes(data.items || []))
        .finally(() => setLoading(false));
    }
  }, [open]);

  const handleSlotClick = (idx) => setPickerSlot(idx);
  const handleClothingPick = (item) => {
    setSlots(slots => slots.map((s, i) => i === pickerSlot ? item : s));
    setPickerSlot(null);
  };
  const handleRemove = (idx) => setSlots(slots => slots.map((s, i) => i === idx ? null : s));
  const handleSave = () => {
    const clothingItems = slots.filter(Boolean).map(item => item._id);
    if (clothingItems.length === 0) return;
    onSave({ name: fitName || 'New Outfit', clothingItems });
  };

  const navy = '#1b2554';
  const navyLight = '#232b53';
  const slotAreaBg = '#fff';
  const slotAreaBorder = '1.5px solid #e3e7ef';
  //const accent = '#7b8cff';
  const accent = '#232b53';
  return open ? (
    <div style={{
      position: 'fixed', top: 0, left: 0, width: '100vw', height: '100vh', background: 'rgba(0,0,0,0.18)', zIndex: 1000,
      display: 'flex', alignItems: 'center', justifyContent: 'center',
    }}>
      <div style={{
        background: '#fff',
        borderRadius: 25,
        padding: 0,
        minWidth: 440,
        minHeight: 580,
        position: 'relative',
        boxShadow: '0 8px 32px rgba(27,37,84,0.13)',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        overflow: 'hidden',
        border: '1.5px solid #e3e7ef',
      }}>
        <div style={{
          width: '100%',
          background: 'none',
          padding: '28px 36px 10px 36px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
        }}>
          <div style={{ fontWeight: 700, fontSize: 26, color: navy, letterSpacing: 1 }}>Create Outfit</div>
          <button
            onClick={onClose}
            style={{
              background: 'none',
              border: 'none',
              fontSize: 28,
              color: '#232b53',
              cursor: 'pointer',
              borderRadius: '50%',
              width: 38,
              height: 38,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              transition: 'background 0.18s',
            }}
            onMouseOver={e => e.currentTarget.style.background = '#f4f6fa'}
            onMouseOut={e => e.currentTarget.style.background = 'none'}
            aria-label="Close"
          >
            &times;
          </button>
        </div>
        <div style={{ 
          width: '100%', 
          padding: '0 36px', 
          marginTop: 16, 
          marginBottom: 16,
          background: 'linear-gradient(135deg, #f8fafc 0%, #f1f5f9 100%)',
          borderTop: '1px solid #e5e7eb',
          borderBottom: '1px solid #e5e7eb',
          paddingTop: 20,
          paddingBottom: 20
        }}>
          <div style={{ marginBottom: 8 }}>
            <label style={{
              display: 'block',
              fontWeight: 600,
              fontSize: 16,
              color: '#1b2554',
              marginBottom: 8,
              letterSpacing: '-0.3px'
            }}>
              Outfit Name
            </label>
            <input
              type="text"
              value={fitName}
              onChange={e => setFitName(e.target.value)}
              placeholder="Enter a name for your outfit..."
              style={{
                width: '100%',
                padding: '16px 20px',
                borderRadius: 12,
                border: '2px solid #e3e7ef',
                fontSize: 18,
                fontWeight: 500,
                color: navy,
                background: '#fff',
                outline: 'none',
                marginBottom: 0,
                marginTop: 0,
                boxSizing: 'border-box',
                transition: 'all 0.2s cubic-bezier(0.4, 0, 0.2, 1)',
                boxShadow: '0 2px 8px rgba(0,0,0,0.04)',
              }}
              maxLength={10}
              onFocus={e => {
                e.currentTarget.style.borderColor = '#1b2554';
                e.currentTarget.style.boxShadow = '0 4px 16px rgba(27,37,84,0.1)';
              }}
              onBlur={e => {
                e.currentTarget.style.borderColor = '#e3e7ef';
                e.currentTarget.style.boxShadow = '0 2px 8px rgba(0,0,0,0.04)';
              }}
            />
            <div style={{
              fontSize: 14,
              color: '#6b7280',
              marginTop: 6,
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center'
            }}>
              <span>Give your outfit a memorable name</span>
              <span>{fitName.length}/10</span>
            </div>
          </div>
        </div>
        <div style={{
          display: 'flex', flexDirection: 'row', gap: 32, justifyContent: 'center', alignItems: 'center',
          background: slotAreaBg,
          border: slotAreaBorder,
          borderRadius: 22,
          margin: '24px 0 0 0',
          padding: '24px 18px',
          minHeight: 320,
          boxSizing: 'border-box',
          boxShadow: '0 2px 8px rgba(27,37,84,0.06)',
        }}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 24, justifyContent: 'center' }}>
            {[0,1,2].map(idx => (
              <Slot key={idx} item={slots[idx]} onClick={() => handleSlotClick(idx)} onRemove={() => handleRemove(idx)} large accent={accent} />
            ))}
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 18, justifyContent: 'space-between' }}>
            {[3,4,5,6,7].map(idx => (
              <Slot key={idx} item={slots[idx]} onClick={() => handleSlotClick(idx)} onRemove={() => handleRemove(idx)} accent={accent} />
            ))}
          </div>
        </div>
        <button
          onClick={handleSave}
          disabled={slots.every(s => !s)}
          style={{
            margin: '32px 0 24px 0',
            padding: '16px 48px',
            borderRadius: 16,
            background: slots.every(s => !s) ? '#e5e7eb' : 'linear-gradient(135deg, #1b2554 0%, #232b53 100%)',
            color: slots.every(s => !s) ? '#9ca3af' : '#fff',
            fontWeight: 700,
            fontSize: 18,
            border: 'none',
            cursor: slots.every(s => !s) ? 'not-allowed' : 'pointer',
            opacity: slots.every(s => !s) ? 0.6 : 1,
            boxShadow: slots.every(s => !s) ? '0 2px 4px rgba(0,0,0,0.05)' : '0 4px 16px rgba(27,37,84,0.25), 0 2px 8px rgba(27,37,84,0.15)',
            transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
            transform: slots.every(s => !s) ? 'none' : 'translateY(0)',
            position: 'relative',
            overflow: 'hidden',
          }}
          onMouseOver={e => { 
            if (!slots.every(s => !s)) {
              e.currentTarget.style.transform = 'translateY(-2px)';
              e.currentTarget.style.boxShadow = '0 8px 24px rgba(27,37,84,0.35), 0 4px 12px rgba(27,37,84,0.2)';
            }
          }}
          onMouseOut={e => { 
            if (!slots.every(s => !s)) {
              e.currentTarget.style.transform = 'translateY(0)';
              e.currentTarget.style.boxShadow = '0 4px 16px rgba(27,37,84,0.25), 0 2px 8px rgba(27,37,84,0.15)';
            }
          }}
          onMouseDown={e => {
            if (!slots.every(s => !s)) {
              e.currentTarget.style.transform = 'translateY(0)';
            }
          }}
        >
          <span style={{ position: 'relative', zIndex: 1 }}>Save Outfit</span>
        </button>
        {pickerSlot !== null && (
          <div style={{ 
            position: 'fixed', 
            top: 0, 
            left: 0, 
            width: '100vw', 
            height: '100vh', 
            background: 'rgba(0,0,0,0.4)', 
            zIndex: 1200,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '20px'
          }}>
            <div style={{ 
              background: '#fff', 
              borderRadius: 24, 
              boxShadow: '0 20px 60px rgba(0,0,0,0.25)', 
              padding: 0, 
              zIndex: 1201, 
              width: '90%',
              maxWidth: 800,
              maxHeight: '90vh',
              display: 'flex',
              flexDirection: 'column',
              border: '2px solid rgba(27,37,84,0.15)',
              overflow: 'hidden'
            }}>
              <div style={{
                padding: '24px 32px 16px 32px',
                borderBottom: '1px solid #e5e7eb',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                background: 'linear-gradient(135deg, #f8fafc 0%, #f1f5f9 100%)'
              }}>
                <div style={{ 
                  fontWeight: 700, 
                  fontSize: 24, 
                  color: '#1b2554',
                  letterSpacing: '-0.5px'
                }}>
                  Pick a clothing item
                </div>
                <button 
                  onClick={() => setPickerSlot(null)} 
                  style={{ 
                    background: 'none', 
                    border: 'none', 
                    fontSize: 24,
                    color: '#6b7280',
                    cursor: 'pointer', 
                    borderRadius: '50%',
                    width: 40,
                    height: 40,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    transition: 'all 0.2s',
                  }}
                  onMouseEnter={e => e.currentTarget.style.background = '#f3f4f6'}
                  onMouseLeave={e => e.currentTarget.style.background = 'none'}
                >
                  &times;
                </button>
              </div>

              <div style={{ 
                padding: '24px 32px 32px 32px',
                flex: 1,
                overflow: 'hidden',
                display: 'flex',
                flexDirection: 'column'
              }}>
                {loading ? (
                  <div style={{ 
                    display: 'flex', 
                    alignItems: 'center', 
                    justifyContent: 'center', 
                    height: '200px',
                    fontSize: 18,
                    color: '#6b7280'
                  }}>
                    Loading your clothing items...
                  </div>
                ) : (
                  <>
                    <div style={{ 
                      maxHeight: 'calc(90vh - 200px)',
                      overflowY: 'auto',
                      padding: '8px 0'
                    }}>
                      {(() => {
                        const grouped = clothes.reduce((acc, item) => {
                          if (!acc[item.type]) acc[item.type] = [];
                          acc[item.type].push(item);
                          return acc;
                        }, {});

                        return Object.keys(CATEGORY_LABELS).map(type => (
                          grouped[type] && grouped[type].length > 0 && (
                            <div key={type} style={{ marginBottom: 32 }}>
                              <h3 style={{
                                fontWeight: 700,
                                fontSize: 20,
                                color: '#1b2554',
                                margin: '0 0 20px 0',
                                padding: '0 4px',
                                letterSpacing: '-0.5px'
                              }}>
                                {CATEGORY_LABELS[type]}
                              </h3>
                              <div style={{ 
                                display: 'grid', 
                                gridTemplateColumns: 'repeat(auto-fill, minmax(120px, 1fr))',
                                gap: 20
                              }}>
                                {grouped[type].map(item => (
                                  <div 
                                    key={item._id} 
                                    style={{ 
                                      border: '2px solid #e5e7eb',
                                      borderRadius: 16,
                                      padding: '16px 12px',
                                      cursor: 'pointer', 
                                      textAlign: 'center', 
                                      background: '#fff',
                                      transition: 'all 0.2s cubic-bezier(0.4, 0, 0.2, 1)',
                                      boxShadow: '0 2px 8px rgba(0,0,0,0.06)',
                                    }}
                                    onClick={() => handleClothingPick(item)}
                                    onMouseEnter={e => {
                                      e.currentTarget.style.transform = 'translateY(-4px)';
                                      e.currentTarget.style.boxShadow = '0 8px 24px rgba(0,0,0,0.15)';
                                      e.currentTarget.style.borderColor = '#1b2554';
                                    }}
                                    onMouseLeave={e => {
                                      e.currentTarget.style.transform = 'translateY(0)';
                                      e.currentTarget.style.boxShadow = '0 2px 8px rgba(0,0,0,0.06)';
                                      e.currentTarget.style.borderColor = '#e5e7eb';
                                    }}
                                  >
                                    <div style={{
                                      width: '100%',
                                      height: '80px',
                                      borderRadius: 12,
                                      background: '#f8fafc',
                                      display: 'flex',
                                      alignItems: 'center',
                                      justifyContent: 'center',
                                      marginBottom: '12px',
                                      overflow: 'hidden'
                                    }}>
                                      <img 
                                        src={item.imageLink} 
                                        alt={item.name} 
                                        style={{ 
                                          width: '100%', 
                                          height: '100%', 
                                          objectFit: 'cover',
                                          borderRadius: 8
                                        }} 
                                      />
                                    </div>
                                    <div style={{ 
                                      fontSize: 14, 
                                      fontWeight: 600,
                                      color: '#1b2554',
                                      lineHeight: 1.3,
                                      overflow: 'hidden',
                                      textOverflow: 'ellipsis',
                                      whiteSpace: 'nowrap'
                                    }}>
                                      {item.name}
                                    </div>
                                  </div>
                                ))}
                              </div>
                            </div>
                          )
                        ));
                      })()}
                    </div>
                    
                    {clothes.length === 0 && (
                      <div style={{
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        height: '200px',
                        fontSize: 18,
                        color: '#6b7280',
                        textAlign: 'center'
                      }}>
                        No clothing items found. Add some items to your inventory first!
                      </div>
                    )}
                  </>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  ) : null;
}

function Slot({ item, onClick, onRemove, large, readOnly, accent }) {
  const emptyBg = '#f8fafc';
  const filledBg = '#fff';
  const border = '1.5px solid #e3e7ef';
  const size = large ? 140 : 80;
  return (
    <div 
      className={`outfit-slot ${large ? 'outfit-slot-large' : ''}`}
      onClick={readOnly ? undefined : onClick} 
      style={{
        width: size,
        height: size,
        background: item ? filledBg : emptyBg,
        borderRadius: 24,
        marginRight: 0,
        marginLeft: 0,
        marginBottom: 0,
        marginTop: 0,
        boxShadow: '0 2px 8px rgba(27,37,84,0.10)',
        border: border,
        display: 'flex', alignItems: 'center', justifyContent: 'center', position: 'relative', cursor: readOnly ? 'default' : 'pointer', overflow: 'hidden',
        transition: 'background 0.18s',
      }}
    >
      {item ? (
        <>
          <img src={item.imageLink} alt={item.name} style={{ width: large ? 100 : 56, height: large ? 100 : 56, objectFit: 'contain', borderRadius: 12 }} />
          {!readOnly && <button onClick={e => { e.stopPropagation(); onRemove(); }} style={{ position: 'absolute', top: 4, right: 4, background: '#fff', border: 'none', borderRadius: '50%', width: 22, height: 22, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 14, cursor: 'pointer', boxShadow: '0 1px 4px rgba(27,37,84,0.10)' }}>&times;</button>}
        </>
      ) : (
        <span style={{ color: accent || '#b0b0b0', fontSize: large ? 48 : 28, fontWeight: 700 }}>+</span>
      )}
    </div>
  );
}

const OutfitsPage = () => {
  const [showModal, setShowModal] = useState(false);
  const [outfits, setOutfits] = useState([]);
  const [confirmId, setConfirmId] = useState(null);
  const fetchOutfits = async () => {
    try {
      const res = await fetch('/api/outfits');
      if (!res.ok) throw new Error('Failed to fetch outfits');
      const data = await res.json();
      const sorted = (data.outfits || []).slice().sort((a, b) => {
        const favDiff = (b.isFavorited ? 1 : 0) - (a.isFavorited ? 1 : 0);
        if (favDiff !== 0) return favDiff;
        
        const nameA = (a.name || 'Untitled').toLowerCase();
        const nameB = (b.name || 'Untitled').toLowerCase();
        return nameA.localeCompare(nameB);
      });
      setOutfits(sorted);
    } catch (err) {
      setOutfits([]);
    }
  };
  useEffect(() => { fetchOutfits(); }, []);

  const handleSaveOutfit = async ({ name, clothingItems }) => {
    try {
      const res = await fetch('/api/outfits', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, clothingItems }),
      });
      if (!res.ok) throw new Error('Failed to save outfit');
      setShowModal(false);
      fetchOutfits();
    } catch (err) {
      alert('Could not save outfit.');
    }
  };

  const handleFavorite = async (outfit) => {
    const newFav = !outfit.isFavorited;
    setOutfits(outfits => {
      const updated = outfits.map(o => o._id === outfit._id ? { ...o, isFavorited: newFav } : o);
      return updated.sort((a, b) => {
        const favDiff = (b.isFavorited ? 1 : 0) - (a.isFavorited ? 1 : 0);
        if (favDiff !== 0) return favDiff;
        
        const nameA = (a.name || 'Untitled').toLowerCase();
        const nameB = (b.name || 'Untitled').toLowerCase();
        return nameA.localeCompare(nameB);
      });
    });
    try {
      await fetch(`/api/outfits/${outfit._id}/favorite`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ isFavorited: newFav }),
      });
    } catch (err) {
      fetchOutfits();
    }
  };

  const handleDelete = async (id) => {
    setConfirmId(id);
  };
  const confirmDelete = async () => {
    try {
      await fetch(`/api/outfits/${confirmId}`, { method: 'DELETE' });
      setOutfits(outfits => outfits.filter(o => o._id !== confirmId));
      setConfirmId(null);
    } catch (err) {
      setConfirmId(null);
    }
  };

  return (
    <div className="page-container" style={{ display: 'block', paddingLeft: 32, paddingRight: 16, paddingTop: 100 }}>
      <h1 style={{ textAlign: 'left', margin: 0, marginBottom: 32 }}>My Outfits</h1>
      <div style={{ 
        display: 'grid', 
        gridTemplateColumns: 'repeat(auto-fill, minmax(288px, 1fr))',
        gap: 24,
        maxWidth: '100%'
      }}>
        <div
          onClick={() => setShowModal(true)}
          style={{
            ...cardStyle,
            minWidth: 288,
            minHeight: 342,
            alignItems: 'center',
            justifyContent: 'center',
            cursor: 'pointer',
            color: '#b0b0b0',
            fontSize: 64,
            border: '2px dashed #b0b0b0',
            background: '#fff',
          }}
          aria-label="Create Outfit"
        >
          +
        </div>
        {outfits.map((outfit, i) => (
          <OutfitCard key={outfit._id || i} outfit={outfit} onFavorite={handleFavorite} onDelete={handleDelete} />
        ))}
      </div>
      <OutfitSlotModal open={showModal} onClose={() => setShowModal(false)} onSave={handleSaveOutfit} />
      <ConfirmPopup open={!!confirmId} onConfirm={confirmDelete} onCancel={() => setConfirmId(null)} itemType="outfit" />
    </div>
  );
};

function OutfitCard({ outfit, onFavorite, onDelete }) {
  const slots = Array(8).fill(null);
  (outfit.clothingItems || []).forEach((item, idx) => {
    if (idx < 8) slots[idx] = item;
  });
  const largeSlots = [0,1,2].map(idx => slots[idx]).filter(Boolean);
  const smallSlots = [3,4,5,6,7].map(idx => slots[idx]).filter(Boolean);
  const slotAreaBg = '#f4f6fa';
  const slotAreaBorder = '1.5px solid #e3e7ef';
  const [delHover, setDelHover] = useState(false);
  const delDisabled = !!outfit.isFavorited;
  const [cardHover, setCardHover] = useState(false);
  const cardHoverStyle = cardHover ? {
    boxShadow: '0 8px 32px rgba(27,37,84,0.13)',
    transform: 'translateY(-6px) scale(1.03)',
    zIndex: 2,
  } : {};
  return (
    <div
      className="outfit-card"
      style={{
        ...cardStyle,
        minWidth: 288,
        minHeight: 342,
        position: 'relative',
        padding: 0,
        overflow: 'visible',
        display: 'flex',
        flexDirection: 'column',
        transition: 'box-shadow 0.25s cubic-bezier(.4,2,.6,1), transform 0.22s cubic-bezier(.4,2,.6,1)',
        ...cardHoverStyle,
      }}
      onMouseEnter={() => setCardHover(true)}
      onMouseLeave={() => setCardHover(false)}
    >
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '18px 18px 0 18px', minHeight: 48 }}>
        <div style={{ fontWeight: 700, fontSize: 20, color: '#1b2554', textTransform: 'capitalize', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', maxWidth: 120 }}>
          {outfit.name || 'Untitled'}
        </div>
        <div style={{ display: 'flex', gap: 10, alignItems: 'center' }}>
          <button 
            style={{ ...iconBtnStyle, background: outfit.isFavorited ? '#e6eaff' : '#f4f6fa' }} 
            onClick={() => onFavorite(outfit)} 
            aria-label="Favorite"
            title="Star"
          >
            <StarIcon size={25} filled={!!outfit.isFavorited} />
          </button>
          <button
            style={{
              ...iconBtnStyle,
              ...(delDisabled ? iconBtnDeleteDisabled : (delHover ? iconBtnDeleteHover : {})),
            }}
            onClick={() => !delDisabled && onDelete(outfit._id)}
            aria-label="Delete"
            disabled={delDisabled}
            onMouseEnter={() => setDelHover(true)}
            onMouseLeave={() => setDelHover(false)}
          >
            <TrashIcon />
          </button>
        </div>
      </div>
      <div className="outfit-slot-area" style={{
        display: 'flex', flexDirection: 'row', gap: 18, justifyContent: 'center', alignItems: 'stretch',
        background: slotAreaBg,
        border: slotAreaBorder,
        borderRadius: 22,
        margin: '18px',
        padding: '18px 10px',
        flex: 1,
        minHeight: 220,
        boxSizing: 'border-box',
        boxShadow: '0 2px 8px rgba(27,37,84,0.06)',
      }}>
        {largeSlots.length > 0 && (
          <div style={{ display: 'flex', flexDirection: 'column', flex: 1, alignItems: 'stretch', justifyContent: largeSlots.length > 1 ? 'space-between' : 'center', gap: largeSlots.length > 1 ? 0 : 10 }}>
            {largeSlots.map((item, idx) => (
              <div key={idx} style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <Slot item={item} large readOnly />
              </div>
            ))}
          </div>
        )}
        {smallSlots.length > 0 && (
          <div style={{ display: 'flex', flexDirection: 'column', flex: 1, alignItems: 'stretch', justifyContent: smallSlots.length > 1 ? 'space-between' : 'center', gap: smallSlots.length > 1 ? 0 : 10 }}>
            {smallSlots.map((item, idx) => (
              <div key={idx} style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <Slot item={item} readOnly />
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

export default OutfitsPage; 