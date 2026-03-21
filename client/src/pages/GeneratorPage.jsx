import React, { useState, useEffect, useRef } from 'react';
import './GeneratorPage.css';
import { apiFetch } from '../api';

const CLOTHING_TYPES = [
  { id: 'shirt', label: 'Shirt', icon: '👕' },
  { id: 'pants', label: 'Pants', icon: '👖' },
  { id: 'shoes', label: 'Shoes', icon: '👟' },
  { id: 'jacket', label: 'Jacket', icon: '🧥' },
  { id: 'hat', label: 'Hat', icon: '🧢' },
  { id: 'accessory', label: 'Accessory', icon: '💍' }
];

const TypeSelector = ({ selectedTypes, onToggle, inventoryByType, accessoryCount, setAccessoryCount, maxAccessories, isGenerating }) => {
  const accessoryItems = inventoryByType['accessory'] || [];
  const hasAccessories = accessoryItems.length > 0;
  const actualMaxAccessories = Math.min(5, accessoryItems.length);

  return (
    <div className="type-selector-container" style={{
      display: 'flex', flexDirection: 'column', gap: 12, alignItems: 'flex-start', marginBottom: 24,
    }}>
      {CLOTHING_TYPES.filter(type => type.id !== 'accessory').map(type => {
        const itemCount = inventoryByType[type.id]?.length || 0;
        const disabled = itemCount === 0 || isGenerating;
        const checked = selectedTypes.includes(type.id);
        return (
          <label key={type.id} className="type-selector-item" style={{
            display: 'flex', alignItems: 'center', fontWeight: 500,
            color: disabled ? 'var(--text-muted)' : (checked ? 'var(--text-primary)' : 'var(--text-secondary)'),
            fontSize: '0.95rem', cursor: disabled ? 'not-allowed' : 'pointer',
            opacity: disabled ? 0.5 : 1, gap: 10, borderRadius: 'var(--radius-sm)',
            padding: '6px 10px', background: 'transparent', border: 'none',
            transition: 'background 0.18s, color 0.18s', userSelect: 'none',
          }}>
            <span style={{ position: 'relative', display: 'inline-block', width: 20, height: 20, marginRight: 8 }}>
              <input type="checkbox" checked={checked} onChange={() => onToggle(type.id)} disabled={disabled}
                style={{ opacity: 0, width: 20, height: 20, position: 'absolute', left: 0, top: 0, margin: 0, zIndex: 2, cursor: disabled ? 'not-allowed' : 'pointer' }} />
              <span style={{
                display: 'inline-block', width: 20, height: 20, borderRadius: 5,
                border: checked ? '1.5px solid var(--accent)' : '2px solid var(--border-strong)',
                background: checked ? 'var(--accent)' : 'transparent', transition: 'all 0.18s',
              }}>
                <svg width="20" height="20" viewBox="0 0 22 22" style={{
                  position: 'absolute', top: 0, left: 0, pointerEvents: 'none',
                  opacity: checked ? 1 : 0, transform: checked ? 'scale(1)' : 'scale(0.7)',
                  transition: 'opacity 0.18s, transform 0.18s',
                }}>
                  <polyline points="5.5,12.5 10,17 17,7.5" style={{ fill: 'none', stroke: '#fff', strokeWidth: 2.5, strokeLinecap: 'round', strokeLinejoin: 'round' }} />
                </svg>
              </span>
            </span>
            {type.label}
          </label>
        );
      })}
      <div className="accessories-counter" style={{
        display: 'flex', alignItems: 'center', gap: 10, fontWeight: 500,
        color: hasAccessories ? 'var(--text-secondary)' : 'var(--text-muted)',
        fontSize: '0.95rem', borderRadius: 'var(--radius-sm)', padding: '6px 10px',
        background: accessoryCount > 0 ? 'var(--accent-dim)' : 'transparent',
        border: 'none', transition: 'background 0.18s', opacity: hasAccessories ? 1 : 0.5,
      }}>
        Accessories
        <button onClick={() => setAccessoryCount(Math.max(0, accessoryCount - 1))} style={{
          width: 22, height: 22, borderRadius: 5, border: '1px solid var(--border)',
          background: 'var(--bg-elevated)', color: 'var(--text-secondary)',
          fontWeight: 700, fontSize: 16, cursor: (accessoryCount === 0 || !hasAccessories || isGenerating) ? 'not-allowed' : 'pointer',
          opacity: (accessoryCount === 0 || !hasAccessories || isGenerating) ? 0.4 : 1,
        }} disabled={accessoryCount === 0 || !hasAccessories || isGenerating}>-</button>
        <span style={{ minWidth: 20, textAlign: 'center' }}>{accessoryCount}</span>
        <button onClick={() => setAccessoryCount(Math.min(actualMaxAccessories, accessoryCount + 1))} style={{
          width: 22, height: 22, borderRadius: 5, border: '1px solid var(--border)',
          background: 'var(--bg-elevated)', color: 'var(--text-secondary)',
          fontWeight: 700, fontSize: 16, cursor: (accessoryCount === actualMaxAccessories || !hasAccessories || isGenerating) ? 'not-allowed' : 'pointer',
          opacity: (accessoryCount === actualMaxAccessories || !hasAccessories || isGenerating) ? 0.4 : 1,
        }} disabled={accessoryCount === actualMaxAccessories || !hasAccessories || isGenerating}>+</button>
      </div>
    </div>
  );
};

const OutfitCard = ({ outfit, lockedItems, onLockItem, isGenerating, animatingIds, onSave, outfitName, setOutfitName, accessoryCount, selectedTypes, onRemoveItem }) => {
  const itemOrder = ['hat', 'jacket', 'shirt', 'pants', 'shoes'];
  const selectedMainTypes = itemOrder.filter(type => selectedTypes.includes(type));
  const slots = selectedMainTypes.map(type =>
    (outfit?.clothingItems || []).find(item => item.type === type) || null
  );
  const firstCol = slots.slice(0, 3);
  const secondCol = slots.slice(3);
  const hasSecondCol = secondCol.length > 0;
  const accessories = (outfit?.clothingItems || []).filter(item => item.type === 'accessory').slice(0, 5);

  const totalMainHeight = 684;
  const accessoryBoxHeight = (totalMainHeight - 32) / 5;

  const numMainCols = secondCol.length > 0 ? 2 : 1;
  const hasAccessoriesCol = accessoryCount > 0;
  let cardWidth = 320;
  if (hasAccessoriesCol && numMainCols === 2) cardWidth = 700;
  else if (hasAccessoriesCol) cardWidth = 460;
  else if (numMainCols === 2) cardWidth = 525;

  const renderSlot = (item, isLocked, isAnimating) => (
    <div style={{
      position: 'relative', width: 200, height: 200, borderRadius: 'var(--radius-lg)',
      overflow: 'hidden', border: `3px solid ${isLocked ? 'var(--accent)' : 'var(--border)'}`,
      background: 'var(--bg-surface)', display: 'flex', alignItems: 'center', justifyContent: 'center',
      marginBottom: 6, transform: !isLocked && isAnimating ? 'scale(1.06)' : 'scale(1)',
      transition: 'all 0.3s ease',
    }}>
      <img src={item.imageLink} alt={item.name} style={{ width: '100%', height: '100%', objectFit: 'contain', background: 'var(--bg-elevated)' }} />
      <button onClick={() => onLockItem(item._id)} style={{
        position: 'absolute', top: 8, right: 8, width: 32, height: 32, borderRadius: '50%',
        background: isLocked ? 'var(--accent)' : 'var(--bg-elevated)',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        border: 'none', cursor: 'pointer', transition: 'all 0.2s', fontSize: 16, zIndex: 2,
      }} title={isLocked ? 'Unlock' : 'Lock'}>{isLocked ? '🔒' : '🔓'}</button>
      <button onClick={() => onRemoveItem(item._id)} style={{
        position: 'absolute', top: 8, left: 8, width: 22, height: 22, borderRadius: '50%',
        background: 'transparent', display: 'flex', alignItems: 'center', justifyContent: 'center',
        border: 'none', cursor: 'pointer', fontSize: 16, color: 'var(--text-muted)', zIndex: 2,
      }} title="Remove">×</button>
    </div>
  );

  const renderEmpty = (idx) => (
    <div key={idx} style={{
      width: 200, height: 200, borderRadius: 'var(--radius-lg)',
      background: 'var(--bg-elevated)', border: '3px dashed var(--border)',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      marginBottom: 6, opacity: 0.4,
    }} />
  );

  return (
    <div className="outfit-card" style={{
      position: 'relative', display: 'flex', flexDirection: 'column',
      background: 'var(--bg-surface)', borderRadius: 'var(--radius-lg)',
      border: `1px solid ${isGenerating ? 'var(--accent)' : 'var(--border)'}`,
      minWidth: 340, maxWidth: cardWidth, width: cardWidth,
      transition: 'all 0.3s ease', overflow: 'hidden',
    }}>
      {/* Header with name input + save */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '14px 16px 0 16px', minHeight: 40 }}>
        <div style={{ position: 'relative', flex: 1, marginRight: 10 }}>
          <input type="text" value={outfitName} onChange={e => setOutfitName(e.target.value)}
            placeholder="Name your outfit..." maxLength={15}
            style={{
              fontWeight: 600, fontSize: '1rem', color: 'var(--text-primary)',
              border: '1px solid var(--border)', outline: 'none',
              background: 'var(--bg-elevated)', width: '100%', padding: '10px 16px',
              borderRadius: 'var(--radius-sm)', fontFamily: 'inherit',
              transition: 'border-color 0.18s',
            }}
            onFocus={e => e.target.style.borderColor = 'var(--accent)'}
            onBlur={e => e.target.style.borderColor = 'var(--border)'}
          />
        </div>
        <button onClick={onSave} disabled={isGenerating || !outfitName.trim()} style={{
          width: 34, height: 34, borderRadius: '50%',
          background: (isGenerating || !outfitName.trim()) ? 'var(--border)' : 'var(--accent)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          border: 'none', cursor: (isGenerating || !outfitName.trim()) ? 'not-allowed' : 'pointer',
          transition: 'all 0.2s', color: 'white', flexShrink: 0,
        }} title="Save to My Outfits">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2z" />
            <polyline points="17,21 17,13 7,13 7,21" />
            <polyline points="7,3 7,8 15,8" />
          </svg>
        </button>
      </div>

      {/* Content area */}
      <div className="outfit-card-content" style={{
        display: 'flex', flexDirection: 'row', justifyContent: 'center', alignItems: 'flex-start',
        background: 'var(--bg-elevated)', border: '1px solid var(--border)',
        borderRadius: 'var(--radius-md)', margin: 14, padding: hasSecondCol ? '10px 40px' : '10px 24px',
        gap: 20,
      }}>
        {/* Accessories column */}
        {accessoryCount > 0 && (
          <div className="outfit-accessories-column" style={{ display: 'flex', flexDirection: 'column', gap: 6, marginRight: 12, justifyContent: 'center', height: totalMainHeight }}>
            {[0,1,2,3,4].map(i => {
              const accessory = accessories[i];
              const isLocked = accessory ? lockedItems.includes(accessory._id) : false;
              return (
                <div className="outfit-accessory-item" key={i} style={{
                  position: 'relative', width: accessoryBoxHeight, height: accessoryBoxHeight,
                  borderRadius: 10, background: 'var(--bg-surface)',
                  border: `1px solid ${accessory ? (isLocked ? 'var(--accent)' : 'var(--border)') : 'var(--border)'}`,
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  opacity: accessory ? 1 : 0.25,
                  transform: accessory && !isLocked && animatingIds.includes(accessory._id) ? 'scale(1.06)' : 'scale(1)',
                  transition: 'all 0.3s ease',
                }}>
                  {accessory && (
                    <>
                      <img src={accessory.imageLink} alt={accessory.name} style={{ width: '85%', height: '85%', objectFit: 'contain' }} />
                      <button onClick={() => onLockItem(accessory._id)} style={{
                        position: 'absolute', top: 3, right: 3, width: 18, height: 18, borderRadius: '50%',
                        background: isLocked ? 'var(--accent)' : 'var(--bg-elevated)',
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        border: 'none', cursor: 'pointer', fontSize: 10, zIndex: 2,
                      }}>{isLocked ? '🔒' : '🔓'}</button>
                      <button onClick={() => onRemoveItem(accessory._id)} style={{
                        position: 'absolute', top: 3, left: 3, width: 14, height: 14, borderRadius: '50%',
                        background: 'transparent', display: 'flex', alignItems: 'center', justifyContent: 'center',
                        border: 'none', cursor: 'pointer', fontSize: 9, color: 'var(--text-muted)', zIndex: 2,
                      }}>×</button>
                    </>
                  )}
                </div>
              );
            })}
          </div>
        )}

        {/* Main columns */}
        <div className="outfit-main-columns" style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
          {firstCol.map((item, idx) => item ? (
            <div key={item._id} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
              {renderSlot(item, lockedItems.includes(item._id), animatingIds.includes(item._id))}
            </div>
          ) : renderEmpty(idx))}
        </div>
        {secondCol.length > 0 && (
          <div className="outfit-main-columns" style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
            {secondCol.map((item, idx) => item ? (
              <div key={item._id} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                {renderSlot(item, lockedItems.includes(item._id), animatingIds.includes(item._id))}
              </div>
            ) : renderEmpty(idx))}
          </div>
        )}
      </div>
    </div>
  );
};

const GeneratorPage = () => {
  const [selectedTypes, setSelectedTypes] = useState(['shirt', 'pants', 'shoes']);
  const [generatedOutfit, setGeneratedOutfit] = useState(null);
  const [lockedItems, setLockedItems] = useState([]);
  const [isGenerating, setIsGenerating] = useState(false);
  const [inventory, setInventory] = useState([]);
  const [outfitName, setOutfitName] = useState('');
  const [animatingIds, setAnimatingIds] = useState([]);
  const cyclingIntervalRef = useRef(null);
  const [accessoryCount, setAccessoryCount] = useState(0);
  const [maxAccessories, setMaxAccessories] = useState(5);
  const [showPopup, setShowPopup] = useState(false);
  const [popupMessage, setPopupMessage] = useState('');
  const [popupType, setPopupType] = useState('success');
  const [popupVisible, setPopupVisible] = useState(false);

  useEffect(() => {
    const fetchInventory = async () => {
      try {
        const response = await apiFetch('/api/clothing/inventory');
        if (response.ok) {
          const data = await response.json();
          setInventory(data.items || []);
        }
      } catch (error) {
        console.error('Failed to fetch inventory:', error);
      }
    };
    fetchInventory();
  }, []);

  const handleTypeToggle = (typeId) => {
    setSelectedTypes(prev =>
      prev.includes(typeId) ? prev.filter(id => id !== typeId) : [...prev, typeId]
    );
  };

  const handleLockItem = (itemId) => {
    setLockedItems(prev =>
      prev.includes(itemId) ? prev.filter(id => id !== itemId) : [...prev, itemId]
    );
  };

  const handleRemoveItem = (itemId) => {
    if (generatedOutfit) {
      setGeneratedOutfit(prev => ({
        ...prev,
        clothingItems: prev.clothingItems.filter(item => item._id !== itemId)
      }));
      setLockedItems(prev => prev.filter(id => id !== itemId));
    }
  };

  const generateOutfit = async () => {
    if (selectedTypes.length === 0) return;
    setIsGenerating(true);
    let cycleCount = 0;
    const maxCycles = 8;
    cyclingIntervalRef.current = setInterval(async () => {
      cycleCount++;
      try {
        const response = await apiFetch('/api/generator/generate', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ selectedTypes, lockedItems, accessoryCount }),
        });
        if (response.ok) {
          const data = await response.json();
          if (data.success) {
            setGeneratedOutfit({ name: outfitName, clothingItems: data.outfit, _id: Date.now() });
            setAnimatingIds(data.outfit.filter(item => !lockedItems.includes(item._id)).map(item => item._id));
          }
        }
      } catch (error) {
        console.error('Error generating outfit:', error);
      }
      if (cycleCount >= maxCycles) {
        clearInterval(cyclingIntervalRef.current);
        cyclingIntervalRef.current = null;
        setIsGenerating(false);
        setTimeout(() => setAnimatingIds([]), 300);
      }
    }, 200);
  };

  const saveOutfit = async () => {
    if (!generatedOutfit || generatedOutfit.clothingItems.length === 0) return;
    try {
      const clothingItems = generatedOutfit.clothingItems.map(item => item._id);
      const response = await apiFetch('/api/outfits', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: outfitName || 'Generated Outfit', clothingItems }),
      });
      if (response.ok) {
        setPopupMessage('Outfit saved successfully!');
        setPopupType('success');
        setShowPopup(true);
      } else {
        setPopupMessage('Failed to save outfit');
        setPopupType('error');
        setShowPopup(true);
      }
    } catch (error) {
      console.error('Error saving outfit:', error);
      setPopupMessage('Failed to save outfit');
      setPopupType('error');
      setShowPopup(true);
    }
  };

  const inventoryByType = inventory.reduce((acc, item) => {
    if (!acc[item.type]) acc[item.type] = [];
    acc[item.type].push(item);
    return acc;
  }, {});

  useEffect(() => {
    return () => { if (cyclingIntervalRef.current) clearInterval(cyclingIntervalRef.current); };
  }, []);

  useEffect(() => {
    if (showPopup) {
      setPopupVisible(true);
      const timer = setTimeout(() => setShowPopup(false), 2500);
      return () => clearTimeout(timer);
    } else {
      if (popupVisible) {
        const timeout = setTimeout(() => setPopupVisible(false), 300);
        return () => clearTimeout(timeout);
      }
    }
  }, [showPopup, popupVisible]);

  const isDisabled = selectedTypes.length === 0 || isGenerating;

  return (
    <div className="generator-page">
      {/* Toast popup */}
      {popupVisible && (
        <div style={{
          position: 'fixed', top: 24, left: '50%',
          transform: `translateX(-50%) ${showPopup ? 'translateY(0)' : 'translateY(-12px)'}`,
          background: popupType === 'success' ? 'var(--success)' : 'var(--danger)',
          color: '#fff', padding: '12px 28px', borderRadius: 'var(--radius-sm)',
          fontWeight: 600, fontSize: '0.95rem', zIndex: 9999,
          transition: 'opacity 0.3s, transform 0.3s', opacity: showPopup ? 1 : 0,
        }}>{popupMessage}</div>
      )}

      <div style={{ maxWidth: 1600, margin: '0 auto' }}>
        <div className="generator-container" style={{ display: 'flex', flexDirection: 'row', justifyContent: 'center', alignItems: 'flex-start', gap: 0 }}>
          <div className="generator-card-container" style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 24 }}>
            {generatedOutfit ? (
              <OutfitCard
                outfit={generatedOutfit} lockedItems={lockedItems} onLockItem={handleLockItem}
                isGenerating={isGenerating} animatingIds={animatingIds} onSave={saveOutfit}
                outfitName={outfitName} setOutfitName={setOutfitName}
                accessoryCount={accessoryCount} selectedTypes={selectedTypes}
                onRemoveItem={handleRemoveItem}
              />
            ) : (
              <div className="generator-empty-card" style={{
                background: 'var(--bg-surface)', border: '2px dashed var(--border-strong)',
                borderRadius: 'var(--radius-xl)', padding: 60, textAlign: 'center',
                minWidth: 560, minHeight: 680, display: 'flex', flexDirection: 'column',
                alignItems: 'center', justifyContent: 'center',
              }}>
                <div className="emoji" style={{ fontSize: '5rem', marginBottom: 20 }}>🎨</div>
                <h3 style={{ fontSize: '1.3rem', fontWeight: 600, color: 'var(--text-primary)', marginBottom: 12 }}>
                  Select clothing types to start generating
                </h3>
                <p style={{ fontSize: '1rem', color: 'var(--text-secondary)', lineHeight: 1.6 }}>
                  Choose types and click generate to create outfits!
                </p>
              </div>
            )}
          </div>

          <div className="generator-sidebar" style={{
            minWidth: 300, position: 'absolute', left: '75%', top: '50%',
            transform: 'translateY(-50%)', zIndex: 2,
          }}>
            <TypeSelector
              selectedTypes={selectedTypes} onToggle={handleTypeToggle}
              inventoryByType={inventoryByType} accessoryCount={accessoryCount}
              setAccessoryCount={setAccessoryCount} maxAccessories={maxAccessories}
              isGenerating={isGenerating}
            />
            <button onClick={generateOutfit} disabled={isDisabled} style={{
              width: '100%', padding: '12px 18px', fontSize: '0.95rem', fontWeight: 600,
              background: isDisabled ? 'var(--border)' : 'var(--accent)',
              color: isDisabled ? 'var(--text-muted)' : '#fff',
              border: 'none', borderRadius: 'var(--radius-sm)',
              cursor: isDisabled ? 'not-allowed' : 'pointer',
              transition: 'all 0.2s', marginTop: 12, fontFamily: 'inherit',
            }}>
              {isGenerating ? 'Generating...' : 'Generate Outfit'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default GeneratorPage;