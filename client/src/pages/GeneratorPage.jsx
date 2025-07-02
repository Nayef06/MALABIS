import React, { useState, useEffect, useRef } from 'react';
import '../LandingPage.css';

const CLOTHING_TYPES = [
  { id: 'shirt', label: 'Shirt', icon: '👕' },
  { id: 'pants', label: 'Pants', icon: '👖' },
  { id: 'shoes', label: 'Shoes', icon: '👟' },
  { id: 'jacket', label: 'Jacket', icon: '🧥' },
  { id: 'hat', label: 'Hat', icon: '🧢' },
  { id: 'accessory', label: 'Accessory', icon: '💍' }
];

const CompactCheckbox = ({ checked, onChange, label, itemCount, disabled }) => (
  <label style={{
    display: 'flex',
    alignItems: 'center',
    padding: '12px 16px',
    background: checked ? '#1b2554' : '#fff',
    border: `2px solid ${checked ? '#1b2554' : '#e3e7ef'}`,
    borderRadius: '8px',
    cursor: disabled ? 'not-allowed' : 'pointer',
    transition: 'all 0.2s ease',
    opacity: disabled ? 0.5 : 1,
    marginBottom: '8px'
  }}
  onMouseOver={e => {
    if (!disabled && !checked) {
      e.currentTarget.style.borderColor = '#1b2554';
      e.currentTarget.style.background = '#f4f6fa';
    }
  }}
  onMouseOut={e => {
    if (!disabled && !checked) {
      e.currentTarget.style.borderColor = '#e3e7ef';
      e.currentTarget.style.background = '#fff';
    }
  }}
  >
    <input
      type="checkbox"
      checked={checked}
      onChange={onChange}
      disabled={disabled}
      style={{ display: 'none' }}
    />
    <div style={{
      width: '16px',
      height: '16px',
      borderRadius: '4px',
      border: `2px solid ${checked ? '#fff' : '#d1d5db'}`,
      background: checked ? '#fff' : 'transparent',
      marginRight: '10px',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      position: 'relative'
    }}>
      {checked && (
        <div style={{
          width: '6px',
          height: '6px',
          borderRadius: '1px',
          background: '#1b2554'
        }} />
      )}
    </div>
    <div style={{ flex: 1 }}>
      <div style={{
        fontWeight: '600',
        fontSize: '0.9rem',
        color: checked ? '#fff' : '#1b2554',
        marginBottom: '1px'
      }}>
        {label}
      </div>
      <div style={{
        fontSize: '0.7rem',
        color: checked ? 'rgba(255,255,255,0.8)' : '#5f6f8f'
      }}>
        {itemCount > 0 ? `${itemCount} items` : 'No items'}
      </div>
    </div>
  </label>
);

const ItemSlot = ({ item, type, isLocked, onLock, isCycling, availableItems }) => {
  if (!item) return null;
  
  return (
    <div style={{
      position: 'relative',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      gap: '12px'
    }}>
      <div style={{
        position: 'relative',
        width: 160,
        height: 160,
        borderRadius: 16,
        overflow: 'hidden',
        border: `3px solid ${isLocked ? '#38a169' : '#e3e7ef'}`,
        background: '#f4f6fa',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        transform: isCycling ? 'scale(1.1)' : 'scale(1)',
        transition: 'all 0.3s ease',
        boxShadow: isCycling ? '0 8px 24px rgba(27,37,84,0.25)' : '0 4px 12px rgba(27,37,84,0.1)'
      }}>
        <img 
          src={item.imageLink} 
          alt={item.name}
          style={{
            width: '100%',
            height: '100%',
            objectFit: 'cover'
          }}
        />
        {isLocked && (
          <div style={{
            position: 'absolute',
            top: 8,
            right: 8,
            background: '#38a169',
            color: 'white',
            borderRadius: '50%',
            width: 32,
            height: 32,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: 16,
            boxShadow: '0 4px 8px rgba(56,161,105,0.4)'
          }}>
            🔒
          </div>
        )}
      </div>
      
      <div style={{
        fontSize: '1.1rem',
        color: '#5f6f8f',
        textAlign: 'center',
        maxWidth: '140px',
        fontWeight: '600'
      }}>
        {item.name}
      </div>
      
      <button
        onClick={onLock}
        style={{
          width: 36,
          height: 36,
          borderRadius: '50%',
          background: isLocked ? '#38a169' : '#f4f6fa',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          border: 'none',
          cursor: 'pointer',
          transition: 'all 0.2s ease',
          fontSize: 18
        }}
        title={isLocked ? 'Unlock item' : 'Lock item'}
      >
        {isLocked ? '🔒' : '🔓'}
      </button>
    </div>
  );
};

const TypeSelector = ({ selectedTypes, onToggle, inventoryByType, accessoryCount, setAccessoryCount, maxAccessories, isGenerating }) => {
  const accessoryItems = inventoryByType['accessory'] || [];
  const hasAccessories = accessoryItems.length > 0;
  const actualMaxAccessories = Math.min(5, accessoryItems.length);
  
  return (
    <div style={{
      display: 'flex',
      flexDirection: 'column',
      gap: '16px',
      alignItems: 'flex-start',
      marginBottom: 32
    }}>
      {CLOTHING_TYPES.filter(type => type.id !== 'accessory').map(type => {
        const itemCount = inventoryByType[type.id]?.length || 0;
        const disabled = itemCount === 0 || isGenerating;
        const checked = selectedTypes.includes(type.id);
        return (
          <label key={type.id} style={{
            display: 'flex',
            alignItems: 'center',
            fontWeight: 500,
            color: disabled ? '#bfc6d1' : (checked ? '#42506a' : '#7a869a'),
            fontSize: '1rem',
            cursor: disabled ? 'not-allowed' : 'pointer',
            opacity: disabled ? 0.6 : 1,
            gap: 10,
            borderRadius: 8,
            padding: '6px 10px',
            background: 'transparent',
            border: 'none',
            transition: 'background 0.18s, color 0.18s',
            userSelect: 'none',
          }}>
            <span style={{
              position: 'relative',
              display: 'inline-block',
              width: 22,
              height: 22,
              marginRight: 10,
            }}>
              <input
                type="checkbox"
                checked={checked}
                onChange={() => onToggle(type.id)}
                disabled={disabled}
                style={{
                  opacity: 0,
                  width: 22,
                  height: 22,
                  position: 'absolute',
                  left: 0,
                  top: 0,
                  margin: 0,
                  zIndex: 2,
                  cursor: disabled ? 'not-allowed' : 'pointer',
                }}
              />
              <span
                style={{
                  display: 'inline-block',
                  width: 22,
                  height: 22,
                  borderRadius: 6,
                  border: checked ? '1.5px solid #1b2554' : '2px solid #bfc6d1',
                  background: checked ? '#1b2554' : 'transparent',
                  boxSizing: 'border-box',
                  transition: 'border-color 0.18s, box-shadow 0.18s, background 0.18s',
                  boxShadow: checked ? '0 0 0 2px #e3e7ef44' : 'none',
                }}
              >
                <svg
                  width="22"
                  height="22"
                  viewBox="0 0 22 22"
                  style={{
                    position: 'absolute',
                    top: 0,
                    left: 0,
                    pointerEvents: 'none',
                    opacity: checked ? 1 : 0,
                    transform: checked ? 'scale(1)' : 'scale(0.7)',
                    transition: 'opacity 0.18s, transform 0.18s',
                  }}
                >
                  <polyline
                    points="5.5,12.5 10,17 17,7.5"
                    style={{
                      fill: 'none',
                      stroke: checked ? '#fff' : '#42506a',
                      strokeWidth: 2.5,
                      strokeLinecap: 'round',
                      strokeLinejoin: 'round',
                    }}
                  />
                </svg>
              </span>
            </span>
            {type.label}
          </label>
        );
      })}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        gap: 10,
        fontWeight: 500,
        color: hasAccessories ? '#42506a' : '#bfc6d1',
        fontSize: '1rem',
        borderRadius: 8,
        padding: '6px 10px',
        background: accessoryCount > 0 ? '#f5f7fa' : 'transparent',
        border: 'none',
        transition: 'background 0.18s, color 0.18s',
        opacity: hasAccessories ? 1 : 0.6
      }}>
        Accessories
        <button
          onClick={() => setAccessoryCount(Math.max(0, accessoryCount - 1))}
          style={{
            width: 24,
            height: 24,
            borderRadius: 6,
            border: '1.5px solid #e3e7ef',
            background: '#f5f7fa',
            color: '#42506a',
            fontWeight: 700,
            fontSize: 18,
            cursor: (accessoryCount === 0 || !hasAccessories || isGenerating) ? 'not-allowed' : 'pointer',
            opacity: (accessoryCount === 0 || !hasAccessories || isGenerating) ? 0.5 : 1,
            marginRight: 2
          }}
          disabled={accessoryCount === 0 || !hasAccessories || isGenerating}
          tabIndex={-1}
        >
          -
        </button>
        <span style={{ minWidth: 24, textAlign: 'center', display: 'inline-block' }}>{accessoryCount}</span>
        <button
          onClick={() => setAccessoryCount(Math.min(actualMaxAccessories, accessoryCount + 1))}
          style={{
            width: 24,
            height: 24,
            borderRadius: 6,
            border: '1.5px solid #e3e7ef',
            background: '#f5f7fa',
            color: '#42506a',
            fontWeight: 700,
            fontSize: 18,
            cursor: (accessoryCount === actualMaxAccessories || !hasAccessories || isGenerating) ? 'not-allowed' : 'pointer',
            opacity: (accessoryCount === actualMaxAccessories || !hasAccessories || isGenerating) ? 0.5 : 1,
            marginLeft: 2
          }}
          disabled={accessoryCount === actualMaxAccessories || !hasAccessories || isGenerating}
          tabIndex={-1}
        >
          +
        </button>
      </div>
    </div>
  );
};

const OutfitCard = ({ outfit, lockedItems, onLockItem, isGenerating, animatingIds, onSave, outfitName, setOutfitName, accessoryCount, selectedTypes }) => {
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
  if (hasAccessoriesCol && numMainCols === 2) {
    cardWidth = 700; 
  } else if (hasAccessoriesCol) {
    cardWidth = 460;
  } else if (numMainCols === 2) {
    cardWidth = 525;
  }

  return (
    <div style={{
      position: 'relative',
      display: 'flex',
      flexDirection: 'column',
      background: '#fff',
      borderRadius: 22,
      boxShadow: isGenerating ? '0 8px 32px rgba(27,37,84,0.15)' : '0 2px 16px rgba(27,37,84,0.08)',
      padding: 0,
      minWidth: 340,
      maxWidth: cardWidth,
      width: cardWidth,
      minHeight: 0,
      marginBottom: 0,
      transition: 'all 0.3s cubic-bezier(.4,2,.6,1)',
      overflow: 'hidden',
      transform: isGenerating ? 'scale(1.01)' : 'scale(1)'
    }}>
      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: '16px 18px 0 18px',
        minHeight: 40,
        position: 'relative'
      }}>
        <div style={{ position: 'relative', flex: 1, marginRight: 12 }}>
          <input
            type="text"
            value={outfitName}
            onChange={e => setOutfitName(e.target.value)}
            placeholder="Name your outfit..."
            style={{
              fontWeight: 600,
              fontSize: '1.13rem',
              color: '#1b2554',
              border: '1.5px solid #e3e7ef',
              outline: 'none',
              background: '#f7f9fc',
              width: '100%',
              padding: '12px 20px',
              borderRadius: 16,
              marginTop: 2,
              marginBottom: 2,
              boxSizing: 'border-box',
              transition: 'border-color 0.18s, box-shadow 0.18s',
              boxShadow: 'none',
            }}
            onFocus={e => {
              e.target.style.borderColor = '#42506a';
              e.target.style.boxShadow = '0 0 0 2px #bfc6d133';
            }}
            onBlur={e => {
              e.target.style.borderColor = '#e3e7ef';
              e.target.style.boxShadow = 'none';
            }}
            maxLength={40}
          />
        </div>
        <button
          onClick={onSave}
          disabled={isGenerating || !outfitName.trim()}
          style={{
            width: 36,
            height: 36,
            borderRadius: '50%',
            background: isGenerating || !outfitName.trim() ? '#e3e7ef' : '#38a169',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            border: 'none',
            cursor: isGenerating || !outfitName.trim() ? 'not-allowed' : 'pointer',
            transition: 'all 0.2s ease',
            fontSize: 18,
            color: 'white',
            marginLeft: 4
          }}
          title="Save to My Outfits"
        >
          💾
        </button>
      </div>
      <div style={{
        display: 'flex',
        flexDirection: 'row',
        justifyContent: 'center',
        alignItems: 'flex-start',
        background: '#f4f6fa',
        border: '2px solid #e3e7ef',
        borderRadius: 18,
        margin: '16px',
        padding: hasSecondCol ? '12px 64px' : '12px 32px',
        boxSizing: 'border-box',
        boxShadow: '0 2px 8px rgba(27,37,84,0.06)',
        gap: 24
      }}>
        {accessoryCount > 0 && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8, marginRight: 16, justifyContent: 'center', height: 684 }}>
            {[0,1,2,3,4].map(i => {
              const accessory = accessories[i];
              const isLocked = accessory ? lockedItems.includes(accessory._id) : false;
              return (
                <div key={i} style={{
                  position: 'relative',
                  width: accessoryBoxHeight,
                  height: accessoryBoxHeight,
                  borderRadius: 12,
                  background: '#fff',
                  border: `2px solid ${accessory ? (isLocked ? '#38a169' : '#e3e7ef') : '#e3e7ef'}`,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  boxShadow: '0 2px 8px rgba(27,37,84,0.06)',
                  opacity: accessory ? 1 : 0.3,
                  transform: accessory && !isLocked && animatingIds.includes(accessory._id) ? 'scale(1.08)' : 'scale(1)',
                  transition: 'all 0.3s ease'
                }}>
                  {accessory && (
                    <>
                      <img
                        src={accessory.imageLink}
                        alt={accessory.name}
                        style={{ width: '90%', height: '90%', objectFit: 'contain' }}
                      />
                      <button
                        onClick={() => onLockItem(accessory._id)}
                        style={{
                          position: 'absolute',
                          top: 4,
                          right: 4,
                          width: 20,
                          height: 20,
                          borderRadius: '50%',
                          background: isLocked ? '#38a169' : '#f4f6fa',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          border: 'none',
                          cursor: 'pointer',
                          transition: 'all 0.2s ease',
                          fontSize: 12,
                          boxShadow: isLocked ? '0 2px 4px rgba(56,161,105,0.4)' : 'none',
                          zIndex: 2
                        }}
                        title={isLocked ? 'Unlock accessory' : 'Lock accessory'}
                      >
                        {isLocked ? '🔒' : '🔓'}
                      </button>
                    </>
                  )}
                </div>
              );
            })}
          </div>
        )}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
          {firstCol.map((item, idx) => {
            if (!item) {
              return (
                <div key={idx} style={{
                  width: 220,
                  height: 220,
                  borderRadius: 20,
                  background: '#f4f6fa',
                  border: '4px dashed #e3e7ef',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  marginBottom: 8,
                  opacity: 0.5
                }} />
              );
            }
            const isLocked = lockedItems.includes(item._id);
            return (
              <div key={item._id} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                <div style={{
                  position: 'relative',
                  width: 220,
                  height: 220,
                  borderRadius: 20,
                  overflow: 'hidden',
                  border: `4px solid ${isLocked ? '#38a169' : '#e3e7ef'}`,
                  background: '#fff',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  boxShadow: '0 4px 16px rgba(27,37,84,0.10)',
                  marginBottom: 8,
                  transform: !isLocked && animatingIds.includes(item._id) ? 'scale(1.08)' : 'scale(1)',
                  transition: 'all 0.3s ease',
                }}>
                  <img 
                    src={item.imageLink} 
                    alt={item.name}
                    style={{
                      width: '100%',
                      height: '100%',
                      objectFit: 'contain',
                      background: '#f4f6fa'
                    }}
                  />
                  <button
                    onClick={() => onLockItem(item._id)}
                    style={{
                      position: 'absolute',
                      top: 10,
                      right: 10,
                      width: 36,
                      height: 36,
                      borderRadius: '50%',
                      background: isLocked ? '#38a169' : '#f4f6fa',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      border: 'none',
                      cursor: 'pointer',
                      transition: 'all 0.2s ease',
                      fontSize: 20,
                      boxShadow: isLocked ? '0 4px 8px rgba(56,161,105,0.4)' : 'none',
                      zIndex: 2
                    }}
                    title={isLocked ? 'Unlock item' : 'Lock item'}
                  >
                    {isLocked ? '🔒' : '🔓'}
                  </button>
                </div>
              </div>
            );
          })}
        </div>
        {secondCol.length > 0 && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            {secondCol.map((item, idx) => {
              if (!item) {
                return (
                  <div key={idx} style={{
                    width: 220,
                    height: 220,
                    borderRadius: 20,
                    background: '#f4f6fa',
                    border: '4px dashed #e3e7ef',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    marginBottom: 8,
                    opacity: 0.5
                  }} />
                );
              }
              const isLocked = lockedItems.includes(item._id);
              return (
                <div key={item._id} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                  <div style={{
                    position: 'relative',
                    width: 220,
                    height: 220,
                    borderRadius: 20,
                    overflow: 'hidden',
                    border: `4px solid ${isLocked ? '#38a169' : '#e3e7ef'}`,
                    background: '#fff',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    boxShadow: '0 4px 16px rgba(27,37,84,0.10)',
                    marginBottom: 8,
                    transform: !isLocked && animatingIds.includes(item._id) ? 'scale(1.08)' : 'scale(1)',
                    transition: 'all 0.3s ease',
                  }}>
                    <img 
                      src={item.imageLink} 
                      alt={item.name}
                      style={{
                        width: '100%',
                        height: '100%',
                        objectFit: 'contain',
                        background: '#f4f6fa'
                      }}
                    />
                    <button
                      onClick={() => onLockItem(item._id)}
                      style={{
                        position: 'absolute',
                        top: 10,
                        right: 10,
                        width: 36,
                        height: 36,
                        borderRadius: '50%',
                        background: isLocked ? '#38a169' : '#f4f6fa',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        border: 'none',
                        cursor: 'pointer',
                        transition: 'all 0.2s ease',
                        fontSize: 20,
                        boxShadow: isLocked ? '0 4px 8px rgba(56,161,105,0.4)' : 'none',
                        zIndex: 2
                      }}
                      title={isLocked ? 'Unlock item' : 'Lock item'}
                    >
                      {isLocked ? '🔒' : '🔓'}
                    </button>
                  </div>
                </div>
              );
            })}
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
        const response = await fetch('/api/clothing/inventory');
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
      prev.includes(typeId)
        ? prev.filter(id => id !== typeId)
        : [...prev, typeId]
    );
  };

  const handleLockItem = (itemId) => {
    setLockedItems(prev =>
      prev.includes(itemId)
        ? prev.filter(id => id !== itemId)
        : [...prev, itemId]
    );
  };

  const generateOutfit = async () => {
    if (selectedTypes.length === 0) return;
    setIsGenerating(true);
    let cycleCount = 0;
    const maxCycles = 8;
    cyclingIntervalRef.current = setInterval(async () => {
      cycleCount++;
      try {
        const response = await fetch('/api/generator/generate', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            selectedTypes,
            lockedItems,
            accessoryCount
          }),
        });
        if (response.ok) {
          const data = await response.json();
          if (data.success) {
            setGeneratedOutfit({
              name: outfitName,
              clothingItems: data.outfit,
              _id: Date.now()
            });
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
      const response = await fetch('/api/outfits', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name: outfitName || 'Generated Outfit',
          clothingItems
        }),
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
    return () => {
      if (cyclingIntervalRef.current) {
        clearInterval(cyclingIntervalRef.current);
      }
    };
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

  return (
    <div className="page-container" style={{ padding: '32px', paddingTop: '100px', userSelect: 'none' }}>
      {popupVisible && (
        <div style={{
          position: 'fixed',
          top: 32,
          left: '50%',
          transform: `translateX(-50%) ${showPopup ? 'translateY(0)' : 'translateY(-16px)'}`,
          background: popupType === 'success' ? '#38a169' : '#e53e3e',
          color: 'white',
          padding: '16px 32px',
          borderRadius: 12,
          boxShadow: '0 4px 24px rgba(27,37,84,0.12)',
          fontWeight: 600,
          fontSize: '1.1rem',
          zIndex: 9999,
          transition: 'opacity 0.3s, transform 0.3s',
          opacity: showPopup ? 1 : 0
        }}>
          {popupMessage}
        </div>
      )}
      <div style={{ maxWidth: '1600px', margin: '0 auto' }}>
        
        <div style={{ display: 'flex', flexDirection: 'row', justifyContent: 'center', alignItems: 'flex-start', gap: 0 }}>
          <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '32px' }}>
            {generatedOutfit ? (
              <>
                <OutfitCard
                  outfit={generatedOutfit}
                  lockedItems={lockedItems}
                  onLockItem={handleLockItem}
                  isGenerating={isGenerating}
                  animatingIds={animatingIds}
                  onSave={saveOutfit}
                  outfitName={outfitName}
                  setOutfitName={setOutfitName}
                  accessoryCount={accessoryCount}
                  selectedTypes={selectedTypes}
                />
              </>
            ) : (
              <div style={{
                background: '#f4f6fa',
                border: '3px dashed #e3e7ef',
                borderRadius: '30px',
                padding: '80px',
                textAlign: 'center',
                minWidth: '640px',
                minHeight: '760px',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center'
              }}>
                <div style={{ fontSize: '6rem', marginBottom: '24px' }}>🎨</div>
                <h3 style={{
                  fontSize: '1.5rem',
                  fontWeight: '600',
                  color: '#1b2554',
                  marginBottom: '16px'
                }}>
                  Select clothing types to start generating
                </h3>
                <p style={{
                  fontSize: '1.1rem',
                  color: '#5f6f8f',
                  lineHeight: '1.6'
                }}>
                  Choose the types you want and click generate to create outfits!
                </p>
              </div>
            )}
          </div>
          <div style={{ minWidth: 320, position: 'absolute', left: '75%', top: '50%', transform: 'translateY(-50%)', zIndex: 2 }}>
            <TypeSelector
              selectedTypes={selectedTypes}
              onToggle={handleTypeToggle}
              inventoryByType={inventoryByType}
              accessoryCount={accessoryCount}
              setAccessoryCount={setAccessoryCount}
              maxAccessories={maxAccessories}
              isGenerating={isGenerating}
            />
            <button
              onClick={generateOutfit}
              disabled={selectedTypes.length === 0 || isGenerating}
              style={{
                width: '100%',
                padding: '14px 20px',
                fontSize: '1rem',
                fontWeight: '600',
                background: selectedTypes.length === 0 ? '#e3e7ef' : '#1b2554',
                color: selectedTypes.length === 0 ? '#5f6f8f' : 'white',
                border: 'none',
                borderRadius: '10px',
                cursor: selectedTypes.length === 0 ? 'not-allowed' : 'pointer',
                transition: 'all 0.2s ease',
                marginTop: 16
              }}
              onMouseOver={e => {
                if (selectedTypes.length > 0 && !isGenerating) {
                  e.currentTarget.style.background = '#0d1229';
                }
              }}
              onMouseOut={e => {
                if (selectedTypes.length > 0 && !isGenerating) {
                  e.currentTarget.style.background = '#1b2554';
                }
              }}
            >
              {isGenerating ? 'Generating...' : 'Generate Outfit'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default GeneratorPage; 