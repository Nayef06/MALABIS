import React from 'react';
import { Icon } from './Icons';
import './OutfitCanvas.css';

const LOOKBOOK_POSITIONS = {
  hat: { x: 82, y: 12, scale: .6 }, jacket: { x: 26, y: 25, scale: 1.32 }, shirt: { x: 63, y: 25, scale: 1.28 },
  pants: { x: 34, y: 70, scale: 1.575 }, shoes: { x: 72, y: 88, scale: 1 }, accessory: { x: 84, y: 44, scale: .52 },
};

export function placeItems(items = []) {
  const available = items.filter(Boolean);
  const accessoryCount = available.filter((item) => item.type === 'accessory').length;
  const hasJacket = available.some((item) => item.type === 'jacket');
  const hasLayeredTop = hasJacket && available.some((item) => item.type === 'shirt');
  const centerStack = !hasLayeredTop && available.every((item) => ['shirt', 'jacket', 'pants'].includes(item.type));
  const typeCounts = {};
  return available.map((item, index) => {
    const count = typeCounts[item.type] || 0; typeCounts[item.type] = count + 1;
    const base = LOOKBOOK_POSITIONS[item.type] || { x: 50, y: 50, scale: .7 };
    let { x, y, scale } = base;
    if (item.type === 'shirt' && !hasJacket) x = 35;
    // Center simple stacks, and balance shoes in the open space beside the garments.
    if (centerStack) x = 50;
    if (item.type === 'shoes' && accessoryCount === 0) y = hasLayeredTop ? 70 : 50;
    if (item.type === 'accessory') {
      // Keep up to five accessories in their own column beside the larger garments.
      y = accessoryCount === 1 ? 48 : 40 + count * Math.min(16, 36 / (accessoryCount - 1));
      scale = accessoryCount > 3 ? .44 : .52;
    } else {
      x += count * 3;
      y += count * 3;
    }
    return { key: `${item._id || index}-${index}`, item, x, y, scale, rotate: 0, z: index + 1 };
  });
}

export default function OutfitCanvas({ pieces, emptyCopy = 'Choose a piece to begin', className = '' }) {
  return (
    <div className={`outfit-canvas-wrap ${className}`}>
      <div className="outfit-canvas">
        {pieces.length === 0 && <div className="outfit-canvas__empty"><Icon name="hanger" size={32}/><span>{emptyCopy}</span></div>}
        {pieces.map((piece) => <div key={piece.key} className="canvas-piece" style={{ left: `${piece.x}%`, top: `${piece.y}%`, zIndex: piece.z, transform: `translate(-50%,-50%) scale(${piece.scale})` }}><img src={piece.item.imageLink} alt={piece.item.name} draggable="false"/></div>)}
      </div>
    </div>
  );
}
