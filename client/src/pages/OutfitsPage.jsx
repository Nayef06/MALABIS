import React, { useState, useEffect } from 'react';
import '../LandingPage.css';

// Reuse icons and confirm popup from ClothesPage
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
        <div style={{ fontWeight: 600, fontSize: 18, marginBottom: 18 }}>Delete this outfit?</div>
        <div style={{ color: '#5f6f8f', fontSize: 15, marginBottom: 24 }}>This action cannot be undone.</div>
        <div style={{ display: 'flex', gap: 16, justifyContent: 'center' }}>
          <button onClick={onCancel} style={{ padding: '8px 20px', borderRadius: 8, border: '1px solid #d1d5db', background: '#fff', color: '#1b2554', fontWeight: 500, cursor: 'pointer' }}>Cancel</button>
          <button onClick={onConfirm} style={{ padding: '8px 20px', borderRadius: 8, border: 'none', background: '#e53e3e', color: '#fff', fontWeight: 500, cursor: 'pointer' }}>Delete</button>
        </div>
      </div>
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
  maxWidth: 306,
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
  const [pickerSlot, setPickerSlot] = useState(null); // index of slot being filled
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

  // Card-like theme
  const navy = '#1b2554';
  const navyLight = '#232b53';
  const slotAreaBg = '#fff';
  const slotAreaBorder = '1.5px solid #e3e7ef';
  const accent = '#7b8cff';
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
        {/* Header with title and close */}
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
              color: '#7b8cff',
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
        {/* Name input */}
        <div style={{ width: '100%', padding: '0 36px', marginTop: 8, marginBottom: 8 }}>
          <input
            type="text"
            value={fitName}
            onChange={e => setFitName(e.target.value)}
            placeholder="Outfit name..."
            style={{
              width: '100%',
              padding: '12px 16px',
              borderRadius: 10,
              border: '1.5px solid #e3e7ef',
              fontSize: 18,
              fontWeight: 500,
              color: navy,
              background: '#f7f8fa',
              outline: 'none',
              marginBottom: 0,
              marginTop: 0,
              boxSizing: 'border-box',
              transition: 'border 0.18s',
            }}
            maxLength={32}
          />
        </div>
        {/* Slot system area */}
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
          {/* Left column: 3 large slots */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 24, justifyContent: 'center' }}>
            {[0,1,2].map(idx => (
              <Slot key={idx} item={slots[idx]} onClick={() => handleSlotClick(idx)} onRemove={() => handleRemove(idx)} large accent={accent} />
            ))}
          </div>
          {/* Right column: 5 small slots */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 18, justifyContent: 'space-between' }}>
            {[3,4,5,6,7].map(idx => (
              <Slot key={idx} item={slots[idx]} onClick={() => handleSlotClick(idx)} onRemove={() => handleRemove(idx)} accent={accent} />
            ))}
          </div>
        </div>
        {/* Save button */}
        <button
          onClick={handleSave}
          disabled={slots.every(s => !s)}
          style={{
            margin: '32px 0 24px 0',
            padding: '16px 44px',
            borderRadius: 12,
            background: navy,
            color: '#fff',
            fontWeight: 700,
            fontSize: 20,
            border: 'none',
            cursor: slots.every(s => !s) ? 'not-allowed' : 'pointer',
            opacity: slots.every(s => !s) ? 0.5 : 1,
            boxShadow: '0 2px 8px rgba(27,37,84,0.10)',
            transition: 'background 0.18s, box-shadow 0.18s',
          }}
          onMouseOver={e => { if (!slots.every(s => !s)) e.currentTarget.style.background = navyLight; }}
          onMouseOut={e => { if (!slots.every(s => !s)) e.currentTarget.style.background = navy; }}
        >
          Save Outfit
        </button>
        {/* Clothing picker */}
        {pickerSlot !== null && (
          <div style={{ position: 'absolute', top: 80, left: '50%', transform: 'translateX(-50%)', background: '#fff', borderRadius: 16, boxShadow: '0 2px 16px rgba(0,0,0,0.18)', padding: 24, zIndex: 1100, minWidth: 340 }}>
            <div style={{ fontWeight: 600, fontSize: 18, marginBottom: 12 }}>Pick a clothing item</div>
            {loading ? <div>Loading...</div> : (
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 16, maxHeight: 260, overflowY: 'auto' }}>
                {clothes.map(item => (
                  <div key={item._id} style={{ border: '1px solid #eee', borderRadius: 10, padding: 8, cursor: 'pointer', width: 80, textAlign: 'center', background: '#f7f8fa' }} onClick={() => handleClothingPick(item)}>
                    <img src={item.imageLink} alt={item.name} style={{ width: 56, height: 56, objectFit: 'cover', borderRadius: 8, background: '#fff' }} />
                    <div style={{ fontSize: 12, marginTop: 4 }}>{item.name}</div>
                  </div>
                ))}
              </div>
            )}
            <button onClick={() => setPickerSlot(null)} style={{ marginTop: 16, background: 'none', border: 'none', color: accent, fontWeight: 500, cursor: 'pointer' }}>Cancel</button>
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
    <div onClick={readOnly ? undefined : onClick} style={{
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
    }}>
      {item ? (
        <>
          <img src={item.imageLink} alt={item.name} style={{ width: large ? 100 : 56, height: large ? 100 : 56, objectFit: 'cover', borderRadius: 12 }} />
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
      // Sort: favorited outfits first
      const sorted = (data.outfits || []).slice().sort((a, b) => (b.isFavorited ? 1 : 0) - (a.isFavorited ? 1 : 0));
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
    let updated;
    setOutfits(outfits => {
      updated = outfits.map(o => o._id === outfit._id ? { ...o, isFavorited: newFav } : o);
      // Move favorited to top
      return newFav
        ? [updated.find(o => o._id === outfit._id), ...updated.filter(o => o._id !== outfit._id)]
        : updated.filter(o => o._id === outfit._id ? false : true).concat(updated.find(o => o._id === outfit._id));
    });
    try {
      await fetch(`/api/outfits/${outfit._id}/favorite`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ isFavorited: newFav }),
      });
      fetchOutfits();
    } catch (err) {}
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
    <div className="page-container" style={{ display: 'block', paddingLeft: 32, paddingTop: 100 }}>
      <h1 style={{ textAlign: 'left', margin: 0, marginBottom: 32 }}>My Outfits</h1>
      <div style={{ display: 'flex', gap: 24, flexWrap: 'wrap' }}>
        <div
          onClick={() => setShowModal(true)}
          style={{
            ...cardStyle,
            minWidth: 288,
            maxWidth: 306,
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
      <ConfirmPopup open={!!confirmId} onConfirm={confirmDelete} onCancel={() => setConfirmId(null)} />
    </div>
  );
};

function OutfitCard({ outfit, onFavorite, onDelete }) {
  const slots = Array(8).fill(null);
  (outfit.clothingItems || []).forEach((item, idx) => {
    if (idx < 8) slots[idx] = item;
  });
  // Split into large and small slots
  const largeSlots = [0,1,2].map(idx => slots[idx]).filter(Boolean);
  const smallSlots = [3,4,5,6,7].map(idx => slots[idx]).filter(Boolean);
  // Soft modern background
  const slotAreaBg = '#f4f6fa';
  const slotAreaBorder = '1.5px solid #e3e7ef';
  // Delete button hover/disabled state
  const [delHover, setDelHover] = useState(false);
  const delDisabled = !!outfit.isFavorited;
  // Card hover state
  const [cardHover, setCardHover] = useState(false);
  const cardHoverStyle = cardHover ? {
    boxShadow: '0 8px 32px rgba(27,37,84,0.13)',
    transform: 'translateY(-6px) scale(1.03)',
    zIndex: 2,
  } : {};
  return (
    <div
      style={{
        ...cardStyle,
        minWidth: 288,
        maxWidth: 306,
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
      {/* Title row with star and delete */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '18px 18px 0 18px', minHeight: 48 }}>
        <div style={{ fontWeight: 700, fontSize: 20, color: '#1b2554', textTransform: 'capitalize', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', maxWidth: 120 }}>
          {outfit.name || 'Untitled'}
        </div>
        <div style={{ display: 'flex', gap: 10, alignItems: 'center' }}>
          <button style={iconBtnStyle} onClick={() => onFavorite(outfit)} aria-label="Favorite">
            <StarIcon filled={!!outfit.isFavorited} />
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
      {/* Slot system area */}
      <div style={{
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
        {/* Only show columns if they have filled slots */}
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