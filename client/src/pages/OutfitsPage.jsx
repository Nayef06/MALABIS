import React, { useState, useEffect } from 'react';
import './OutfitsPage.css';
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

const ConfirmPopup = ({ open, onConfirm, onCancel, itemType = 'outfit' }) => {
  const [isVisible, setIsVisible] = useState(false);
  const [isAnimating, setIsAnimating] = useState(false);

  useEffect(() => {
    if (open) { setIsVisible(true); setIsAnimating(true); }
    else { setIsAnimating(false); const t = setTimeout(() => setIsVisible(false), 300); return () => clearTimeout(t); }
  }, [open]);

  if (!isVisible) return null;

  return (
    <div style={{
      position: 'fixed', top: 0, left: 0, width: '100vw', height: '100vh',
      background: 'rgba(0,0,0,0.6)', zIndex: 1000,
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      opacity: isAnimating ? 1 : 0, transition: 'opacity 0.3s ease',
    }} onClick={onCancel}>
      <div style={{
        background: 'var(--bg-surface)', borderRadius: 'var(--radius-lg)',
        minWidth: 380, maxWidth: 440, border: '1px solid var(--border)',
        transform: isAnimating ? 'scale(1)' : 'scale(0.95)',
        opacity: isAnimating ? 1 : 0, transition: 'all 0.3s ease',
        textAlign: 'center', overflow: 'hidden',
      }} onClick={e => e.stopPropagation()}>
        <div style={{
          width: 64, height: 64, borderRadius: '50%', background: 'var(--danger-dim)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          margin: '28px auto 20px',
        }}>
          <svg width="28" height="28" viewBox="0 0 24 24" fill="none"><path d="M6 6l8 8M6 14L14 6" stroke="var(--danger)" strokeWidth="2.5" strokeLinecap="round"/></svg>
        </div>
        <div style={{ padding: '0 28px 28px' }}>
          <h3 style={{ fontWeight: 700, fontSize: 20, color: 'var(--text-primary)', margin: '0 0 8px 0' }}>
            Delete this {itemType}?
          </h3>
          <p style={{ color: 'var(--text-secondary)', fontSize: 14, lineHeight: 1.5, margin: '0 0 24px 0' }}>
            This action cannot be undone.
          </p>
          <div style={{ display: 'flex', gap: 12, justifyContent: 'center' }}>
            <button onClick={onCancel} style={{
              padding: '10px 20px', borderRadius: 'var(--radius-sm)',
              border: '1px solid var(--border)', background: 'var(--bg-elevated)',
              color: 'var(--text-secondary)', fontWeight: 600, fontSize: 14,
              cursor: 'pointer', fontFamily: 'inherit',
            }}>Cancel</button>
            <button onClick={onConfirm} style={{
              padding: '10px 20px', borderRadius: 'var(--radius-sm)',
              border: 'none', background: 'var(--danger)',
              color: '#fff', fontWeight: 600, fontSize: 14,
              cursor: 'pointer', fontFamily: 'inherit',
            }}>Delete</button>
          </div>
        </div>
      </div>
    </div>
  );
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
      document.body.classList.add('modal-open');
      apiFetch('/api/clothing/inventory')
        .then(res => res.json())
        .then(data => setClothes(data.items || []))
        .finally(() => setLoading(false));
    } else {
      document.body.classList.remove('modal-open');
    }
    return () => document.body.classList.remove('modal-open');
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

  return open ? (
    <div className="modal-overlay" style={{
      position: 'fixed', top: 0, left: 0, width: '100vw', height: '100vh',
      background: 'rgba(0,0,0,0.5)', zIndex: 1000,
      display: 'flex', alignItems: 'center', justifyContent: 'center',
    }}>
      <div className="outfit-modal" style={{
        background: 'var(--bg-surface)', borderRadius: 'var(--radius-lg)',
        padding: 0, paddingBottom: 40, minWidth: 320, maxWidth: 400, width: '100%',
        maxHeight: '91vh', position: 'relative',
        border: '1px solid var(--border)',
        display: 'flex', flexDirection: 'column', alignItems: 'center', overflowY: 'auto',
      }}>
        {/* Header */}
        <div style={{
          width: '100%', padding: '24px 28px 10px 28px',
          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        }}>
          <div style={{ fontWeight: 700, fontSize: 22, color: 'var(--text-primary)', letterSpacing: '-0.01em' }}>Create Outfit</div>
          <button onClick={onClose} style={{
            background: 'none', border: 'none', fontSize: 24, color: 'var(--text-muted)',
            cursor: 'pointer', borderRadius: '50%', width: 36, height: 36,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            transition: 'background 0.18s',
          }}
          onMouseOver={e => e.currentTarget.style.background = 'var(--bg-elevated)'}
          onMouseOut={e => e.currentTarget.style.background = 'none'}
          aria-label="Close">&times;</button>
        </div>

        {/* Name input */}
        <div style={{
          width: '100%', padding: '0 28px', marginTop: 12, marginBottom: 12,
          background: 'var(--bg-elevated)', borderTop: '1px solid var(--border)',
          borderBottom: '1px solid var(--border)', paddingTop: 16, paddingBottom: 16,
        }}>
          <label style={{ display: 'block', fontWeight: 600, fontSize: 14, color: 'var(--text-secondary)', marginBottom: 8 }}>Outfit Name</label>
          <div style={{ display: 'flex', gap: 10, alignItems: 'center' }}>
            <input type="text" value={fitName} onChange={e => setFitName(e.target.value)}
              placeholder="Enter a name..." maxLength={15}
              style={{
                flex: 1, padding: '12px 16px', borderRadius: 'var(--radius-sm)',
                border: '1px solid var(--border)', fontSize: 16, fontWeight: 500,
                color: 'var(--text-primary)', background: 'var(--bg-surface)',
                outline: 'none', transition: 'all 0.2s', fontFamily: 'inherit',
              }}
              onFocus={e => { e.currentTarget.style.borderColor = 'var(--accent)'; }}
              onBlur={e => { e.currentTarget.style.borderColor = 'var(--border)'; }}
            />
            <button onClick={handleSave} disabled={slots.every(s => !s)}
              style={{
                width: 38, height: 38, borderRadius: '50%',
                background: slots.every(s => !s) ? 'var(--border)' : 'var(--accent)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                border: 'none', cursor: slots.every(s => !s) ? 'not-allowed' : 'pointer',
                transition: 'all 0.2s', color: 'white', flexShrink: 0,
              }} title="Save to My Outfits">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2z" />
                <polyline points="17,21 17,13 7,13 7,21" />
                <polyline points="7,3 7,8 15,8" />
              </svg>
            </button>
          </div>
          <div style={{ fontSize: 12, color: 'var(--text-muted)', marginTop: 4, display: 'flex', justifyContent: 'space-between' }}>
            <span>Give your outfit a name</span>
            <span>{fitName.length}/15</span>
          </div>
        </div>

        {/* Slots */}
        <div style={{
          display: 'flex', flexDirection: 'row', gap: 24, justifyContent: 'center', alignItems: 'center',
          background: 'var(--bg-elevated)', border: '1px solid var(--border)',
          borderRadius: 'var(--radius-lg)', margin: '20px 0 0 0', padding: '20px 14px',
        }}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 20, justifyContent: 'center' }}>
            {[0,1,2].map(idx => (
              <Slot key={idx} item={slots[idx]} onClick={() => handleSlotClick(idx)} onRemove={() => handleRemove(idx)} large accent="var(--accent)" />
            ))}
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 14, justifyContent: 'space-between' }}>
            {[3,4,5,6,7].map(idx => (
              <Slot key={idx} item={slots[idx]} onClick={() => handleSlotClick(idx)} onRemove={() => handleRemove(idx)} accent="var(--accent)" />
            ))}
          </div>
        </div>

        {/* Clothing Picker */}
        {pickerSlot !== null && (
          <div style={{
            position: 'fixed', top: 0, left: 0, width: '100vw', height: '100vh',
            background: 'rgba(0,0,0,0.5)', zIndex: 1200,
            display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 20,
          }}>
            <div style={{
              background: 'var(--bg-surface)', borderRadius: 'var(--radius-lg)',
              border: '1px solid var(--border)',
              width: '90%', maxWidth: 700, maxHeight: '90vh',
              display: 'flex', flexDirection: 'column', overflow: 'hidden',
            }}>
              <div style={{
                padding: '20px 24px', borderBottom: '1px solid var(--border)',
                display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                background: 'var(--bg-elevated)',
              }}>
                <div style={{ fontWeight: 700, fontSize: 20, color: 'var(--text-primary)' }}>Pick a clothing item</div>
                <button onClick={() => setPickerSlot(null)} style={{
                  background: 'none', border: 'none', fontSize: 20, color: 'var(--text-muted)',
                  cursor: 'pointer', borderRadius: '50%', width: 36, height: 36,
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  transition: 'all 0.2s',
                }}
                onMouseEnter={e => e.currentTarget.style.background = 'var(--bg-surface)'}
                onMouseLeave={e => e.currentTarget.style.background = 'none'}
                >&times;</button>
              </div>

              <div style={{ padding: '20px 24px', flex: 1, overflow: 'hidden', display: 'flex', flexDirection: 'column' }}>
                {loading ? (
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: 200, color: 'var(--text-secondary)' }}>Loading...</div>
                ) : (
                  <div style={{ maxHeight: 'calc(90vh - 200px)', overflowY: 'auto', padding: '4px 0' }}>
                    {(() => {
                      const grouped = clothes.reduce((acc, item) => { if (!acc[item.type]) acc[item.type] = []; acc[item.type].push(item); return acc; }, {});
                      return Object.keys(CATEGORY_LABELS).map(type => (
                        grouped[type] && grouped[type].length > 0 && (
                          <div key={type} style={{ marginBottom: 24 }}>
                            <h3 style={{ fontWeight: 700, fontSize: 16, color: 'var(--text-primary)', margin: '0 0 14px 0' }}>{CATEGORY_LABELS[type]}</h3>
                            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(110px, 1fr))', gap: 14 }}>
                              {grouped[type].map(item => (
                                <div key={item._id} style={{
                                  border: '1px solid var(--border)', borderRadius: 'var(--radius-md)',
                                  padding: '12px 10px', cursor: 'pointer', textAlign: 'center',
                                  background: 'var(--bg-elevated)', transition: 'all 0.2s',
                                }}
                                onClick={() => handleClothingPick(item)}
                                onMouseEnter={e => { e.currentTarget.style.borderColor = 'var(--accent)'; e.currentTarget.style.transform = 'translateY(-2px)'; }}
                                onMouseLeave={e => { e.currentTarget.style.borderColor = 'var(--border)'; e.currentTarget.style.transform = 'translateY(0)'; }}
                                >
                                  <div style={{
                                    width: '100%', height: 70, borderRadius: 'var(--radius-sm)',
                                    background: 'var(--bg-surface)', display: 'flex',
                                    alignItems: 'center', justifyContent: 'center', marginBottom: 8, overflow: 'hidden',
                                  }}>
                                    <img src={item.imageLink} alt={item.name} style={{ width: '100%', height: '100%', objectFit: 'cover', borderRadius: 6 }} />
                                  </div>
                                  <div style={{ fontSize: 13, fontWeight: 600, color: 'var(--text-primary)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{item.name}</div>
                                </div>
                              ))}
                            </div>
                          </div>
                        )
                      ));
                    })()}
                    {clothes.length === 0 && (
                      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: 200, color: 'var(--text-secondary)', textAlign: 'center' }}>
                        No clothing items found. Add some items first!
                      </div>
                    )}
                  </div>
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
  const size = large ? 120 : 70;
  return (
    <div className={`outfit-slot ${large ? 'outfit-slot-large' : ''}`}
      onClick={readOnly ? undefined : onClick}
      style={{
        width: size, height: size,
        background: item ? 'var(--bg-surface)' : 'var(--bg-elevated)',
        borderRadius: 'var(--radius-md)', border: `1px solid var(--border)`,
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        position: 'relative', cursor: readOnly ? 'default' : 'pointer',
        overflow: 'hidden', transition: 'background 0.18s',
      }}
    >
      {item ? (
        <>
          <img src={item.imageLink} alt={item.name} style={{ width: large ? 90 : 50, height: large ? 90 : 50, objectFit: 'contain', borderRadius: 10 }} />
          {!readOnly && <button onClick={e => { e.stopPropagation(); onRemove(); }} style={{
            position: 'absolute', top: 3, right: 3, background: 'none',
            color: 'var(--text-muted)', border: 'none', borderRadius: '50%',
            width: 20, height: 20, display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: 13, cursor: 'pointer',
          }}>&times;</button>}
        </>
      ) : (
        <span style={{ color: accent || 'var(--text-muted)', fontSize: large ? 40 : 24, fontWeight: 700 }}>+</span>
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
      const res = await apiFetch('/api/outfits');
      if (!res.ok) throw new Error('Failed to fetch outfits');
      const data = await res.json();
      const sorted = (data.outfits || []).slice().sort((a, b) => {
        const favDiff = (b.isFavorited ? 1 : 0) - (a.isFavorited ? 1 : 0);
        if (favDiff !== 0) return favDiff;
        return (a.name || '').toLowerCase().localeCompare((b.name || '').toLowerCase());
      });
      setOutfits(sorted);
    } catch (err) {
      setOutfits([]);
    }
  };
  useEffect(() => { fetchOutfits(); }, []);

  const handleSaveOutfit = async ({ name, clothingItems }) => {
    try {
      const res = await apiFetch('/api/outfits', {
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
        return (a.name || '').toLowerCase().localeCompare((b.name || '').toLowerCase());
      });
    });
    try {
      await apiFetch(`/api/outfits/${outfit._id}/favorite`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ isFavorited: newFav }),
      });
    } catch (err) {
      fetchOutfits();
    }
  };

  const handleDelete = async (id) => setConfirmId(id);
  const confirmDelete = async () => {
    try {
      await apiFetch(`/api/outfits/${confirmId}`, { method: 'DELETE' });
      setOutfits(outfits => outfits.filter(o => o._id !== confirmId));
      setConfirmId(null);
    } catch (err) {
      setConfirmId(null);
    }
  };

  return (
    <div className="outfits-page">
      <h1 className="outfits-title">My Outfits</h1>
      <div className="outfits-grid">
        {/* Create New Card */}
        <div className="outfit-card outfit-card-new" onClick={() => setShowModal(true)} aria-label="Create Outfit">
          <span style={{ fontSize: 48, color: 'var(--text-muted)', fontWeight: 300 }}>+</span>
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
  (outfit.clothingItems || []).forEach((item, idx) => { if (idx < 8) slots[idx] = item; });
  const largeSlots = [0,1,2].map(idx => slots[idx]).filter(Boolean);
  const smallSlots = [3,4,5,6,7].map(idx => slots[idx]).filter(Boolean);
  const delDisabled = !!outfit.isFavorited;

  return (
    <div className="outfit-card">
      {/* Header */}
      <div className="outfit-card-header">
        <div className="outfit-card-name">{outfit.name || 'Untitled'}</div>
        <div className="outfit-card-actions">
          <button className="outfit-icon-btn" onClick={() => onFavorite(outfit)} aria-label="Favorite"
            style={{ background: outfit.isFavorited ? 'var(--accent-dim)' : 'var(--bg-elevated)' }}>
            <StarIcon size={22} filled={!!outfit.isFavorited} />
          </button>
          <button className="outfit-icon-btn" onClick={() => !delDisabled && onDelete(outfit._id)}
            disabled={delDisabled} aria-label="Delete"
            style={{
              color: delDisabled ? 'var(--text-muted)' : 'var(--danger)',
              opacity: delDisabled ? 0.4 : 1,
              cursor: delDisabled ? 'not-allowed' : 'pointer',
            }}>
            <TrashIcon size={22} />
          </button>
        </div>
      </div>

      {/* Slot Area */}
      <div className="outfit-slot-area">
        {largeSlots.length > 0 && (
          <div style={{ display: 'flex', flexDirection: 'column', flex: 1, alignItems: 'stretch', justifyContent: largeSlots.length > 1 ? 'space-between' : 'center', gap: largeSlots.length > 1 ? 0 : 8 }}>
            {largeSlots.map((item, idx) => (
              <div key={idx} style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <Slot item={item} large readOnly />
              </div>
            ))}
          </div>
        )}
        {smallSlots.length > 0 && (
          <div style={{ display: 'flex', flexDirection: 'column', flex: 1, alignItems: 'stretch', justifyContent: smallSlots.length > 1 ? 'space-between' : 'center', gap: smallSlots.length > 1 ? 0 : 8 }}>
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