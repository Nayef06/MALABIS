import React, { useRef, useState } from 'react';
import { Icon } from './Icons';

const TYPE_POSITIONS = {
  hat: { x: 50, y: 10, scale: .62 }, jacket: { x: 34, y: 33, scale: .92 }, shirt: { x: 52, y: 32, scale: .86 },
  pants: { x: 48, y: 64, scale: .95 }, shoes: { x: 52, y: 88, scale: .72 }, accessory: { x: 77, y: 48, scale: .48 },
};

export function placeItems(items = []) {
  const typeCounts = {};
  return items.filter(Boolean).map((item, index) => {
    const count = typeCounts[item.type] || 0; typeCounts[item.type] = count + 1;
    const base = TYPE_POSITIONS[item.type] || { x: 50, y: 50, scale: .7 };
    return { key: `${item._id || index}-${Date.now()}-${index}`, item, x: base.x + count * 7, y: base.y + count * 5, scale: base.scale, rotate: count % 2 ? 5 : -2, z: index + 1 };
  });
}

export default function OutfitCanvas({ pieces, setPieces, editable = true, emptyCopy = 'Choose a piece to begin', className = '' }) {
  const canvasRef = useRef(null);
  const dragRef = useRef(null);
  const [selected, setSelected] = useState(null);

  const change = (key, updates) => setPieces((current) => current.map((piece) => piece.key === key ? { ...piece, ...updates } : piece));
  const beginDrag = (event, piece) => {
    if (!editable) return;
    event.currentTarget.setPointerCapture?.(event.pointerId); setSelected(piece.key);
    const rect = canvasRef.current.getBoundingClientRect(); dragRef.current = { key:piece.key, pointer:event.pointerId, rect, dx:event.clientX-(rect.left+piece.x/100*rect.width), dy:event.clientY-(rect.top+piece.y/100*rect.height) };
  };
  const drag = (event) => {
    const state=dragRef.current; if(!state||state.pointer!==event.pointerId) return;
    const x=Math.max(4,Math.min(96,(event.clientX-state.rect.left-state.dx)/state.rect.width*100));
    const y=Math.max(4,Math.min(96,(event.clientY-state.rect.top-state.dy)/state.rect.height*100)); change(state.key,{x,y});
  };
  const endDrag = (event) => { if(dragRef.current?.pointer===event.pointerId) dragRef.current=null; };
  const selectedPiece=pieces.find((piece)=>piece.key===selected);
  const nudge = (event,piece) => {
    if(!editable||!['ArrowLeft','ArrowRight','ArrowUp','ArrowDown'].includes(event.key)) return;
    event.preventDefault(); const amount=event.shiftKey?5:1; change(piece.key,{ x:Math.max(3,Math.min(97,piece.x+(event.key==='ArrowRight'?amount:event.key==='ArrowLeft'?-amount:0))), y:Math.max(3,Math.min(97,piece.y+(event.key==='ArrowDown'?amount:event.key==='ArrowUp'?-amount:0))) });
  };
  const control = (updates) => selectedPiece && change(selectedPiece.key,updates);

  return (
    <div className={`outfit-canvas-wrap ${className}`}>
      <div ref={canvasRef} className={`outfit-canvas ${editable ? 'is-editable' : ''}`} onPointerMove={drag} onPointerUp={endDrag} onPointerCancel={endDrag} onClick={()=>editable&&setSelected(null)}>
        <span className="outfit-canvas__tape outfit-canvas__tape--left"/><span className="outfit-canvas__tape outfit-canvas__tape--right"/>
        {pieces.length===0 && <div className="outfit-canvas__empty"><Icon name="sparkle" size={28}/><span>{emptyCopy}</span></div>}
        {pieces.map((piece)=><button key={piece.key} type="button" className={`canvas-piece ${selected===piece.key?'is-selected':''}`} style={{left:`${piece.x}%`,top:`${piece.y}%`,zIndex:piece.z,transform:`translate(-50%,-50%) rotate(${piece.rotate}deg) scale(${piece.scale})`}} onPointerDown={(e)=>beginDrag(e,piece)} onKeyDown={(e)=>nudge(e,piece)} onClick={(e)=>{e.stopPropagation();setSelected(piece.key)}} aria-label={`${piece.item.name}. Drag to move, or use arrow keys.`}><img src={piece.item.imageLink} alt="" draggable="false"/></button>)}
        <span className="outfit-canvas__scribble">made by me</span>
      </div>
      {editable && <div className={`canvas-tools ${selectedPiece?'is-visible':''}`} aria-label="Selected garment controls">
        <span>{selectedPiece?.item.name || 'Select a piece'}</span>
        <button type="button" disabled={!selectedPiece} onClick={()=>control({rotate:selectedPiece.rotate-8})} aria-label="Rotate left"><Icon name="rotate" size={17}/></button>
        <button type="button" disabled={!selectedPiece} onClick={()=>control({scale:Math.max(.3,selectedPiece.scale-.1)})} aria-label="Make smaller"><Icon name="minus" size={17}/></button>
        <button type="button" disabled={!selectedPiece} onClick={()=>control({scale:Math.min(1.5,selectedPiece.scale+.1)})} aria-label="Make larger"><Icon name="plus" size={17}/></button>
        <button type="button" disabled={!selectedPiece} onClick={()=>control({z:Math.max(...pieces.map((p)=>p.z),0)+1})} aria-label="Bring forward"><Icon name="layers" size={17}/></button>
        <button type="button" disabled={!selectedPiece} onClick={()=>{setPieces((current)=>current.filter((piece)=>piece.key!==selectedPiece.key));setSelected(null)}} aria-label="Remove piece"><Icon name="trash" size={17}/></button>
      </div>}
    </div>
  );
}
