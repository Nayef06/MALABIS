import React, { useState, useEffect } from 'react';
import Draggable from 'react-draggable';
import '../LandingPage.css';

const CATEGORY_LABELS = {
  shirt: 'Shirts',
  pants: 'Pants',
  shoes: 'Shoes',
  hat: 'Hats',
  jacket: 'Jackets',
  accessory: 'Accessories',
};

const DEFAULT_SIZE = 120;
const MAX_SIZE = DEFAULT_SIZE * 2;
const DRAG_OUT_OF_BOUNDS = 30;

const OutfitsPage = () => {
  const [showModal, setShowModal] = useState(false);
  const [clothingItems, setClothingItems] = useState([]);
  const [fitItems, setFitItems] = useState([]); // {item, x, y, size}
  const [selectedFitId, setSelectedFitId] = useState(null); // _id of selected item
  const [resizingIdx, setResizingIdx] = useState(null); // index of item being resized
  const [isMobile, setIsMobile] = useState(false);
  const [savedOutfits, setSavedOutfits] = useState([]);
  const [saving, setSaving] = useState(false);
  const [outfitName, setOutfitName] = useState("");

  useEffect(() => {
    fetch('/api/clothing/inventory')
      .then(res => res.json())
      .then(data => setClothingItems(data.items || []));
  }, []);

  useEffect(() => {
    const checkMobile = () => setIsMobile(window.innerWidth <= 600);
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  // Fetch saved outfits
  useEffect(() => {
    fetch('/api/outfits')
      .then(res => res.json())
      .then(data => setSavedOutfits(data.outfits || []));
  }, []);

  // Add item to fit area at default position/size
  const handleAddToFit = (item) => {
    if (!fitItems.some(f => f.item._id === item._id)) {
      setFitItems([...fitItems, { item, x: 40, y: 40, size: DEFAULT_SIZE }]);
    }
  };

  // Remove item from fit area
  const handleRemoveFromFit = (id) => {
    setFitItems(fitItems.filter(f => f.item._id !== id));
    if (selectedFitId === id) setSelectedFitId(null);
  };

  // Handle drag
  const handleDrag = (idx, e, data) => {
    setFitItems(fitItems => fitItems.map((f, i) => i === idx ? { ...f, x: data.x, y: data.y } : f));
  };

  // Handle resize (even less sensitive, 20px steps, only after 20px movement)
  const handleResize = (idx, delta) => {
    setFitItems(fitItems => fitItems.map((f, i) => {
      if (i !== idx) return f;
      const step = Math.floor(Math.abs(delta) / 20) * 20 * Math.sign(delta);
      if (step === 0) return f;
      return { ...f, size: Math.max(60, f.size + step) };
    }));
  };

  // Group clothing items by type
  const grouped = clothingItems.reduce((acc, item) => {
    if (!acc[item.type]) acc[item.type] = [];
    acc[item.type].push(item);
    return acc;
  }, {});

  // When an image is clicked, bring it to the front by moving it to the end of fitItems
  const handleSelectFitItem = (id) => {
    setSelectedFitId(id);
    setFitItems(fitItems => {
      const idx = fitItems.findIndex(f => f.item._id === id);
      if (idx === -1) return fitItems;
      const item = fitItems[idx];
      const newArr = fitItems.slice(0, idx).concat(fitItems.slice(idx + 1)).concat([item]);
      return newArr;
    });
  };

  const handleSaveOutfit = async () => {
    if (!outfitName.trim() || fitItems.length === 0) return;
    setSaving(true);
    const clothingItems = fitItems.map(f => ({
      clothingItem: f.item._id,
      x: f.x,
      y: f.y,
      size: f.size,
    }));
    try {
      const res = await fetch('/api/outfits', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: outfitName, clothingItems }),
      });
      if (res.ok) {
        setShowModal(false);
        setFitItems([]);
        setOutfitName("");
        // Refresh saved outfits
        const data = await res.json();
        setSavedOutfits(prev => [data.outfit, ...prev]);
      }
    } finally {
      setSaving(false);
    }
  };

  const sideWhiteBorder = 12;

  return (
    <div className="page-container" style={{ display: 'block', paddingLeft: 32, paddingTop: 100 }}>
      <h1 style={{ textAlign: 'left', margin: 0, marginBottom: 32 }}>My Outfits</h1>
      {/* Saved Outfits Cards */}
      <div style={{
        display: 'flex',
        gap: 16,
        flexWrap: 'wrap',
        marginBottom: 32,
        maxWidth: (240 + 16) * 5 - 16, // 5 cards + 4 gaps
      }}>
        {/* New Fit Button as Card */}
        <div
          onClick={() => setShowModal(true)}
          style={{
            width: 240,
            height: 420,
            background: '#fff',
            border: '2px dashed #b0b0b0',
            borderRadius: 18,
            boxShadow: '0 4px 16px rgba(0,0,0,0.10)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            cursor: 'pointer',
            fontSize: 64,
            color: '#b0b0b0',
            transition: 'box-shadow 0.2s',
            marginBottom: 0,
            position: 'relative',
          }}
          aria-label="Create Outfit"
        >
          +
        </div>
        {savedOutfits.map(outfit => {
          // Card size and editor size (identical)
          const cardW = 240, cardH = 420, editorW = 260, editorH = 400;
          const scale = Math.min(cardW / editorW, cardH / editorH);
          const offsetX = (cardW - editorW * scale) / 2;
          const offsetY = (cardH - editorH * scale) / 2;
          return (
            <div key={outfit._id} style={{
              width: 240,
              height: 420,
              background: '#fff',
              border: '1.5px solid #eee',
              borderRadius: 18,
              boxShadow: '0 4px 16px rgba(0,0,0,0.10)',
              position: 'relative',
              overflow: 'hidden',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'flex-start',
              paddingLeft: sideWhiteBorder,
              paddingRight: sideWhiteBorder,
              boxSizing: 'border-box',
            }}>
              <div style={{ fontWeight: 700, fontSize: 18, margin: '10px 0 4px 0', textAlign: 'center', width: '100%' }}>{outfit.name}</div>
              <div style={{ position: 'relative', width: 240 - 2 * sideWhiteBorder, height: cardH - 32, background: '#f7f8fa', borderRadius: 12, overflow: 'hidden', margin: '0 auto' }}>
                {outfit.clothingItems && outfit.clothingItems.map((f, idx) => {
                  return (
                    <img
                      key={f.clothingItem}
                      src={f.clothingItem?.imageLink || (f.clothingItem?.imageLink === undefined && clothingItems.find(ci => ci._id === f.clothingItem)?.imageLink) || ''}
                      alt=""
                      style={{
                        position: 'absolute',
                        left: f.x * scale + offsetX,
                        top: f.y * scale + offsetY,
                        width: f.size * scale,
                        height: f.size * scale,
                        objectFit: 'contain',
                        borderRadius: 10,
                        background: 'none',
                        border: 'none',
                      }}
                    />
                  );
                })}
              </div>
            </div>
          );
        })}
      </div>
      {showModal && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          width: '100vw',
          height: '100vh',
          background: 'rgba(0,0,0,0.3)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 1000,
        }}>
          <div style={{
            background: '#fff',
            padding: isMobile ? '12px' : '32px',
            borderRadius: '12px',
            minWidth: isMobile ? '95vw' : '900px',
            minHeight: isMobile ? '90vh' : '600px',
            position: 'relative',
            boxShadow: '0 2px 16px rgba(0,0,0,0.15)',
            display: 'flex',
            flexDirection: isMobile ? 'column' : 'row',
            gap: isMobile ? 12 : 32,
            maxWidth: '95vw',
            width: isMobile ? '95vw' : undefined,
            height: isMobile ? '90vh' : undefined,
          }}>
            <button
              onClick={() => setShowModal(false)}
              style={{
                position: 'absolute',
                top: '12px',
                right: '12px',
                background: 'transparent',
                border: 'none',
                fontSize: '20px',
                cursor: 'pointer',
              }}
              aria-label="Close"
            >
              &times;
            </button>
            {/* Left: Current Fit (drag area) */}
            <div style={{
              flex: isMobile ? 'none' : '0 0 264px',
              maxWidth: isMobile ? '100%' : 264,
              minWidth: isMobile ? '0' : 264,
              borderRight: isMobile ? 'none' : '1px solid #eee',
              borderBottom: isMobile ? '1px solid #eee' : 'none',
              paddingRight: isMobile ? 0 : 24,
              paddingBottom: isMobile ? 16 : 0,
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              maxHeight: isMobile ? undefined : 520,
              overflow: isMobile ? 'visible' : 'hidden',
              position: 'relative',
              width: isMobile ? '100%' : undefined,
              background: '#fff',
              paddingLeft: sideWhiteBorder,
              paddingRight: sideWhiteBorder,
              boxSizing: 'border-box',
            }}>
              <div style={{ fontWeight: 600, marginBottom: 16 }}>Current Fit</div>
              <div style={{
                position: 'relative',
                width: isMobile ? '100%' : 240,
                height: isMobile ? 220 : 400,
                background: '#f7f8fa',
                borderRadius: 16,
                border: '1px solid #e0e0e0',
                overflow: 'hidden',
                margin: '0 auto',
              }}>
                {fitItems.length === 0 ? (
                  <div style={{ color: '#bbb', fontSize: 16, textAlign: 'center', marginTop: 40 }}>Drag items here</div>
                ) : (
                  fitItems.map((f, idx) => (
                    <Draggable
                      key={f.item._id}
                      position={{ x: f.x, y: f.y }}
                      onDrag={(e, data) => handleDrag(idx, e, data)}
                      bounds={{
                        left: -DRAG_OUT_OF_BOUNDS,
                        top: -DRAG_OUT_OF_BOUNDS,
                        right: 260 - f.size + DRAG_OUT_OF_BOUNDS,
                        bottom: 400 - f.size + DRAG_OUT_OF_BOUNDS,
                      }}
                      disabled={resizingIdx === idx}
                    >
                      <div
                        style={{
                          position: 'absolute',
                          width: f.size,
                          height: f.size,
                          zIndex: idx + 2,
                          userSelect: 'none',
                          background: 'none',
                          boxShadow: 'none',
                          border: 'none',
                        }}
                      >
                        <img
                          src={f.item.imageLink}
                          alt=""
                          style={{
                            width: '100%',
                            height: '100%',
                            objectFit: 'contain',
                            borderRadius: 0,
                            background: 'none',
                            border: 'none',
                            boxShadow: 'none',
                          }}
                          draggable={false}
                          onClick={() => handleSelectFitItem(f.item._id)}
                          onTouchEnd={() => handleSelectFitItem(f.item._id)}
                        />
                        {/* Show controls only if selected */}
                        {selectedFitId === f.item._id && (
                          <>
                            {/* Resize handle */}
                            <button
                              onMouseDown={e => {
                                e.stopPropagation();
                                setResizingIdx(idx);
                                const startY = e.clientY;
                                const startSize = f.size;
                                const idxCopy = idx;
                                function move(ev) {
                                  let newSize = startSize + (ev.clientY - startY);
                                  newSize = Math.max(60, Math.min(newSize, MAX_SIZE));
                                  setFitItems(fitItems => fitItems.map((item, i) => i === idxCopy ? { ...item, size: newSize } : item));
                                }
                                function up() {
                                  window.removeEventListener('mousemove', move);
                                  window.removeEventListener('mouseup', up);
                                  setResizingIdx(null);
                                }
                                window.addEventListener('mousemove', move);
                                window.addEventListener('mouseup', up);
                              }}
                              onTouchStart={e => {
                                e.stopPropagation();
                                setResizingIdx(idx);
                                const startY = e.touches[0].clientY;
                                const startSize = f.size;
                                const idxCopy = idx;
                                function move(ev) {
                                  if (!ev.touches || ev.touches.length === 0) return;
                                  let newSize = startSize + (ev.touches[0].clientY - startY);
                                  newSize = Math.max(60, Math.min(newSize, MAX_SIZE));
                                  setFitItems(fitItems => fitItems.map((item, i) => i === idxCopy ? { ...item, size: newSize } : item));
                                }
                                function end() {
                                  window.removeEventListener('touchmove', move);
                                  window.removeEventListener('touchend', end);
                                  setResizingIdx(null);
                                }
                                window.addEventListener('touchmove', move, { passive: false });
                                window.addEventListener('touchend', end);
                              }}
                              style={{
                                position: 'absolute',
                                bottom: 4,
                                right: 4,
                                width: 22,
                                height: 22,
                                borderRadius: '50%',
                                background: '#e0e0e0',
                                border: 'none',
                                cursor: 'nwse-resize',
                                zIndex: 3,
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                fontSize: 16,
                              }}
                              title="Resize"
                            >
                              ↔
                            </button>
                            {/* Remove button */}
                            <button
                              onClick={e => { e.stopPropagation(); handleRemoveFromFit(f.item._id); }}
                              onTouchStart={e => { e.stopPropagation(); handleRemoveFromFit(f.item._id); }}
                              style={{
                                position: 'absolute',
                                top: 4,
                                right: 4,
                                width: 22,
                                height: 22,
                                borderRadius: '50%',
                                background: '#fff',
                                border: '1px solid #ccc',
                                color: '#e53e3e',
                                cursor: 'pointer',
                                zIndex: 3,
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                fontSize: 15,
                              }}
                              title="Remove"
                            >
                              ×
                            </button>
                          </>
                        )}
                      </div>
                    </Draggable>
                  ))
                )}
              </div>
              {/* Save Outfit Controls */}
              <div style={{ marginTop: 18, width: '100%', display: 'flex', flexDirection: isMobile ? 'column' : 'row', alignItems: 'center', gap: 8, justifyContent: 'center' }}>
                <input
                  type="text"
                  placeholder="Outfit name"
                  value={outfitName}
                  onChange={e => setOutfitName(e.target.value)}
                  style={{ padding: 8, borderRadius: 8, border: '1px solid #ccc', fontSize: 15, width: isMobile ? '100%' : 160 }}
                  maxLength={32}
                />
                <button
                  onClick={handleSaveOutfit}
                  disabled={saving || !outfitName.trim() || fitItems.length === 0}
                  style={{ padding: '8px 18px', borderRadius: 8, border: 'none', background: '#1b2554', color: '#fff', fontWeight: 600, fontSize: 15, cursor: saving || !outfitName.trim() || fitItems.length === 0 ? 'not-allowed' : 'pointer', opacity: saving || !outfitName.trim() || fitItems.length === 0 ? 0.6 : 1 }}
                >
                  {saving ? 'Saving...' : 'Save Outfit'}
                </button>
              </div>
            </div>
            {/* Right: Add Items (just images, click to add) */}
            <div style={{
              flex: 1,
              minWidth: 0,
              paddingLeft: isMobile ? 0 : 24,
              paddingTop: isMobile ? 16 : 0,
              display: 'flex',
              flexDirection: 'column',
              alignItems: isMobile ? 'center' : 'flex-start',
              overflowY: 'auto',
              maxHeight: isMobile ? undefined : 520,
              width: isMobile ? '100%' : undefined,
            }}>
              <div style={{ fontWeight: 600, marginBottom: 16 }}>Add Items</div>
              {Object.keys(CATEGORY_LABELS).map(type => (
                grouped[type] && grouped[type].length > 0 && (
                  <div key={type} style={{ marginBottom: 18, width: '100%' }}>
                    <div style={{ fontWeight: 500, color: '#1b2554', marginBottom: 8, fontSize: 18 }}>{CATEGORY_LABELS[type]}</div>
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: 18 }}>
                      {grouped[type].map(item => (
                        <img
                          key={item._id}
                          src={item.imageLink}
                          alt=""
                          style={{
                            width: 90,
                            height: 90,
                            objectFit: 'contain',
                            borderRadius: 10,
                            marginBottom: 8,
                            cursor: fitItems.some(f => f.item._id === item._id) ? 'not-allowed' : 'pointer',
                            opacity: fitItems.some(f => f.item._id === item._id) ? 0.3 : 1,
                            border: 'none',
                            background: 'none',
                            boxShadow: 'none',
                          }}
                          onClick={() => !fitItems.some(f => f.item._id === item._id) && handleAddToFit(item)}
                          title={fitItems.some(f => f.item._id === item._id) ? 'Already in fit' : 'Add to fit'}
                        />
                      ))}
                    </div>
                  </div>
                )
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default OutfitsPage; 