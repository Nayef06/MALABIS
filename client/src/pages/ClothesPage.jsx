import React, { useEffect, useMemo, useRef, useState } from 'react';
import { Icon } from '../components/Icons';
import { ConfirmDialog, EmptyState, Modal, Toast } from '../components/UI';
import { apiFetch } from '../api';
import { prepareImageUpload } from '../prepareImageUpload';
import { addInventoryItem, getInventory, removeInventoryItem, updateInventoryItem } from '../dataCache';
import { useAnimatedReorder } from '../hooks/useAnimatedReorder';
import './ClothesPage.css';

const TYPES = [
  { id: 'shirt', label: 'Tops', singular: 'Top' }, { id: 'pants', label: 'Bottoms', singular: 'Bottom' },
  { id: 'jacket', label: 'Jackets', singular: 'Jacket' }, { id: 'shoes', label: 'Shoes', singular: 'Shoes' },
  { id: 'hat', label: 'Hats', singular: 'Hat' }, { id: 'accessory', label: 'Accessories', singular: 'Accessory' },
];
const COLORS = [
  ['red','#bd716b'],['orange','#cf8e64'],['yellow','#ddc76f'],['green','#8fa27c'],['blue','#86a9bc'],
  ['purple','#aa8daf'],['brown','#936f5d'],['black','#3f3937'],['gray','#aaa8a4'],['white','#f6f1e8'],
];
const TINTS = { red:'#ead1cc',orange:'#edd6c3',yellow:'#efe5bd',green:'#dce3d1',blue:'#d9e5e9',purple:'#e4dce6',brown:'#dfd0c5',black:'#d6d1cc',gray:'#e4e2dd',white:'#f6f2e9' };

function Garment({ item, onFavorite, onDelete, index, selecting, selected, onSelect, deleting }) {
  const canDelete = !item.isFavorited;
  return (
    <article className={`garment ${selected ? 'is-selected' : ''}`} data-reorder-id={item._id} style={{ '--garment-delay': `${Math.min(index * 35, 280)}ms` }}>
      <div className="garment__image-wrap" style={{ '--garment-tint': TINTS[item.color] || '#ebe3d7' }}>
        {item.imageLink ? <img src={item.imageLink} alt={item.name} draggable="false"/> : <Icon name={item.type} size={70}/>} 
        {selecting && <label className={`garment__selection ${canDelete ? '' : 'is-protected'}`} title={canDelete ? `Select ${item.name}` : 'Unfavorite before removing'}>
          <input type="checkbox" checked={selected} onChange={() => onSelect(item)} disabled={!canDelete || deleting} aria-label={`Select ${item.name || 'Unnamed item'}`}/>
        </label>}
      </div>
      <footer className="garment__caption">
        <div><h3>{item.name || 'Unnamed item'}</h3><span>{item.color || 'No color set'}</span></div>
        <div className="garment__actions">
          <button type="button" className={`heart-button ${item.isFavorited ? 'is-loved' : ''}`} onClick={() => onFavorite(item)} disabled={selecting || deleting} aria-label={item.isFavorited ? `Unfavorite ${item.name}` : `Favorite ${item.name}`}><Icon name="heart" size={18}/></button>
          {!selecting && <button type="button" className="garment__delete" onClick={() => canDelete && onDelete([item._id])} disabled={!canDelete || deleting} title={canDelete ? 'Remove from closet' : 'Unfavorite before removing'} aria-label={`Remove ${item.name}`}><Icon name="trash" size={16}/></button>}
        </div>
      </footer>
    </article>
  );
}

function PieceDetails({ file, index, total, onNext, onClose, onAdded }) {
  const [form, setForm] = useState({ name: '', type: '', color: '' });
  const [removeBackground, setRemoveBackground] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState('');
  const [preview, setPreview] = useState('');
  const uploadingRef = useRef(false);
  const fileError = !file.type.startsWith('image/') ? 'Choose an image file for this item.' : '';
  const hasNext = index + 1 < total;

  useEffect(() => {
    if (fileError) return undefined;
    const url = URL.createObjectURL(file);
    setPreview(url);
    return () => URL.revokeObjectURL(url);
  }, [file, fileError]);

  const update = (key, value) => setForm((current) => ({ ...current, [key]: value }));
  const cancel = () => { if (!uploadingRef.current) onNext(); };

  const submit = async (event) => {
    event.preventDefault();
    if (uploadingRef.current || fileError) return;
    if (!form.name.trim() || !form.type || !form.color) { setError('Enter a name and choose a type and color.'); return; }
    uploadingRef.current = true;
    setUploading(true); setError('');
    try {
      const image = await prepareImageUpload(file);
      const body = new FormData();
      body.append('image', image);
      body.append('removeBackground', String(removeBackground));
      body.append('name', form.name.trim());
      body.append('type', form.type);
      body.append('color', form.color);
      const itemResponse = await apiFetch('/api/clothing', { method: 'POST', body });
      if (!itemResponse.ok) throw new Error('Could not add this item. Try again.');
      const { item } = await itemResponse.json();
      onAdded(item);
      onNext();
    } catch (err) { setError(err.message || 'Could not add this item. Try again.'); }
    finally { uploadingRef.current = false; setUploading(false); }
  };

  return (
    <Modal open onClose={cancel} closeDisabled={uploading} closeLabel="Skip this item" eyebrow={`Item ${index + 1} of ${total}`} title="Add item" className="add-piece-sheet">
      <form className="add-piece" onSubmit={submit} aria-busy={uploading}>
        <div className="photo-drop photo-drop--preview">
          {preview ? <img src={preview} alt={`Preview of ${file.name}`}/> : <Icon name="image" size={60}/>}
          <span className="photo-drop__filename" title={file.name}>{file.name}</span>
        </div>
        <div className="add-piece__details">
          {(fileError || error) && <p className="form-error" role="alert">{fileError || error}</p>}
          <div className="field"><label htmlFor="piece-name">Name</label><input className="input" id="piece-name" value={form.name} maxLength="15" onChange={(e) => update('name',e.target.value)} placeholder="White T-shirt" required disabled={uploading} autoFocus/><small>{form.name.length}/15</small></div>
          <div className="field"><label htmlFor="piece-type">Type</label><select className="select" id="piece-type" value={form.type} onChange={(e) => update('type',e.target.value)} required disabled={uploading}><option value="">Choose a type</option>{TYPES.map((type) => <option key={type.id} value={type.id}>{type.singular}</option>)}</select></div>
          <fieldset className="color-field" disabled={uploading}><legend className="field-label">Color</legend><div className="swatches">{COLORS.map(([name,color]) => <button key={name} type="button" className={form.color === name ? 'is-selected' : ''} style={{ '--swatch':color }} onClick={() => update('color',name)} aria-label={name} aria-pressed={form.color === name}/>)}</div></fieldset>
          <label className="background-toggle"><input type="checkbox" checked={removeBackground} onChange={(e) => setRemoveBackground(e.target.checked)} disabled={uploading}/><span><b>Remove background</b><small>Remove the background from the uploaded photo</small></span></label>
          <div className="add-piece__actions">
            <button type="button" className="button button--paper" onClick={cancel} disabled={uploading}>Skip this item</button>
            <button type="submit" className="button button--rose" disabled={uploading || !!fileError}>{uploading ? 'Uploading…' : hasNext ? 'Save & next' : 'Save item'}</button>
          </div>
          {hasNext && <button type="button" className="add-piece__cancel-remaining" onClick={onClose} disabled={uploading}>Cancel remaining uploads</button>}
        </div>
      </form>
    </Modal>
  );
}

function AddPieces({ onClose, onAdded }) {
  const [files, setFiles] = useState([]);
  const [index, setIndex] = useState(0);
  const next = () => {
    if (index + 1 < files.length) setIndex((current) => current + 1);
    else onClose();
  };

  if (files.length) {
    return <PieceDetails key={index} file={files[index]} index={index} total={files.length} onNext={next} onClose={onClose} onAdded={onAdded}/>;
  }

  return (
    <Modal open onClose={onClose} eyebrow="My closet" title="Add items" className="piece-picker-sheet">
      <div className="piece-picker">
        <p>Choose photos, then enter the details for each item.</p>
        <label className="photo-drop photo-drop--multiple">
          <Icon name="image" size={36}/>
          <strong>Choose one or more photos</strong>
          <span>JPG, PNG or WEBP · large photos are resized automatically</span>
          <input type="file" accept="image/*" multiple aria-label="Choose photos of your clothes" onChange={(event) => setFiles(Array.from(event.target.files || []))}/>
        </label>
        <button type="button" className="button button--quiet" onClick={onClose}>Cancel</button>
      </div>
    </Modal>
  );
}

export default function ClothesPage() {
  const [items,setItems] = useState([]); const [loading,setLoading] = useState(true); const [error,setError] = useState('');
  const [filter,setFilter] = useState('all'); const [addOpen,setAddOpen] = useState(false); const [confirmIds,setConfirmIds] = useState(null);
  const [selecting,setSelecting] = useState(false); const [selectedIds,setSelectedIds] = useState(new Set()); const [deleting,setDeleting] = useState(false);
  const selectionRef = useRef(null);
  const { containerRef: railsRef, capture: captureReorder } = useAnimatedReorder();
  const [selectionHeight,setSelectionHeight] = useState(0);
  const [toast,setToast] = useState({ show:false, message:'', type:'success' });
  useEffect(() => { getInventory().then(setItems).catch(() => setError('Could not load your clothes. Try refreshing the page.')).finally(() => setLoading(false)); }, []);
  useEffect(() => { if (!toast.show) return; const id=setTimeout(() => setToast((t)=>({...t,show:false})),2200); return () => clearTimeout(id); }, [toast.show]);
  useEffect(() => {
    const selection = selectionRef.current;
    if (!selection) return;
    const updateHeight = () => setSelectionHeight(selection.getBoundingClientRect().height);
    updateHeight();
    const observer = new ResizeObserver(updateHeight);
    observer.observe(selection);
    return () => observer.disconnect();
  }, [selecting]);

  const grouped = useMemo(() => TYPES.map((type) => ({ ...type, items:items.filter((item) => item.type === type.id && (filter !== 'favorites' || item.isFavorited)) })).filter((group) => group.items.length), [items,filter]);
  const selectableItems = grouped.flatMap((group) => group.items).filter((item) => !item.isFavorited);
  const selectedItems = selectableItems.filter((item) => selectedIds.has(item._id));
  const allSelected = selectableItems.length > 0 && selectedItems.length === selectableItems.length;
  const changeFilter = (value) => { setFilter(value); setSelectedIds(new Set()); };
  const toggleSelection = () => { setSelecting((current) => !current); setSelectedIds(new Set()); };
  const select = (item) => {
    if (item.isFavorited || deleting) return;
    setSelectedIds((current) => {
      const next = new Set(current);
      if (next.has(item._id)) next.delete(item._id); else next.add(item._id);
      return next;
    });
  };
  const favorite = async (item) => {
    captureReorder(item._id);
    const value=!item.isFavorited; setItems((current)=>current.map((piece)=>piece._id===item._id?{...piece,isFavorited:value}:piece));
    try { const response=await apiFetch(`/api/clothing/${item._id}/favorite`,{method:'PATCH',headers:{'Content-Type':'application/json'},body:JSON.stringify({isFavorited:value})}); if(!response.ok) throw new Error(); updateInventoryItem(item._id,{isFavorited:value}); }
    catch { captureReorder(item._id); setItems((current)=>current.map((piece)=>piece._id===item._id?{...piece,isFavorited:!value}:piece)); setToast({show:true,type:'error',message:'Could not update favorites. Try again.'}); }
  };
  const remove = async () => {
    if (!confirmIds?.length || deleting) return;
    setDeleting(true);
    const removedIds = new Set();
    for (const id of confirmIds) {
      try {
        const response = await apiFetch(`/api/clothing/${id}`, { method:'DELETE' });
        if (!response.ok) throw new Error();
        removeInventoryItem(id);
        removedIds.add(id);
      } catch { /* Keep unsuccessful pieces available for another attempt. */ }
    }
    const failedCount = confirmIds.length - removedIds.size;
    setItems((current) => current.filter((item) => !removedIds.has(item._id)));
    setSelectedIds((current) => new Set([...current].filter((id) => !removedIds.has(id))));
    setConfirmIds(null);
    setDeleting(false);
    if (failedCount) {
      const removedMessage = removedIds.size ? `${removedIds.size} ${removedIds.size === 1 ? 'item removed' : 'items removed'}. ` : '';
      setToast({show:true,type:'error',message:`${removedMessage}Could not remove ${failedCount === 1 ? '1 item' : `${failedCount} items`}. Try again.`});
    } else {
      setSelecting(false);
      setSelectedIds(new Set());
      setToast({show:true,type:'success',message:removedIds.size === 1 ? 'Item removed.' : `${removedIds.size} items removed.`});
    }
  };
  const add = (item) => { const cached=addInventoryItem(item); setItems(cached || ((current)=>[...current,item])); setToast({show:true,type:'success',message:'Item added.'}); };

  return (
    <div className={`page closet-page${selecting ? ' is-selecting' : ''}`} style={{ '--closet-selection-height': `${selectionHeight}px` }}>
      <Toast {...toast}/>
      <header className="page-heading closet-heading"><div><h1>My closet</h1></div><p className="page-heading__copy">Manage your clothes by category and mark your favorites.</p><div className="closet-heading__actions"><button type="button" className="button button--paper closet-select" onClick={toggleSelection} disabled={loading || !!error || !items.length || deleting} aria-pressed={selecting}><Icon name={selecting ? 'close' : 'check'} size={18}/>{selecting ? 'Cancel' : 'Select'}</button><button type="button" className="button button--rose closet-add" onClick={()=>setAddOpen(true)} disabled={deleting} aria-label="Add item"><Icon name="plus" size={18}/> Add item</button></div></header>
      <div className="closet-tabs" role="group" aria-label="Filter closet"><button className={filter==='all'?'is-active':''} onClick={()=>changeFilter('all')} disabled={deleting}>All items <span>{items.length}</span></button><button className={filter==='favorites'?'is-active':''} onClick={()=>changeFilter('favorites')} disabled={deleting}><Icon name="heart" size={15}/> Favorites <span>{items.filter((item)=>item.isFavorited).length}</span></button></div>
      {selecting && <div ref={selectionRef} className="closet-selection" role="group" aria-label="Select items to delete" aria-busy={deleting}>
        <div className="closet-selection__summary"><strong role="status">{selectedItems.length} selected</strong><span>Remove items from favorites before deleting them.</span><button type="button" className="icon-button closet-selection__cancel" onClick={toggleSelection} disabled={deleting} aria-label="Cancel selection"><Icon name="close" size={18}/></button></div>
        <div className="button-row"><button type="button" className="button button--quiet closet-selection__all" onClick={() => setSelectedIds(new Set(allSelected ? [] : selectableItems.map((item) => item._id)))} disabled={!selectableItems.length || deleting}>{allSelected ? 'Deselect all' : 'Select all'}</button><button type="button" className="button button--danger" onClick={() => setConfirmIds(selectedItems.map((item) => item._id))} disabled={!selectedItems.length || deleting}><Icon name="trash" size={16}/><span>{deleting ? 'Deleting…' : <>Delete <span className="closet-selection__delete-detail">selected </span>({selectedItems.length})</>}</span></button></div>
      </div>}
      {loading ? <div className="closet-loading"><i/><i/><i/><span>Loading clothes…</span></div> : error ? <EmptyState title="Could not load clothes" copy={error}/> : grouped.length===0 ? <EmptyState title={filter==='favorites'?'No favorites yet':'No clothes yet'} copy={filter==='favorites'?'Select the heart on an item to add it to favorites.':'Upload a photo to add your first item.'} action={filter==='all'?()=>setAddOpen(true):()=>changeFilter('all')} actionLabel={filter==='all'?'Add item':'View all items'}/> : <div className="closet-rails" ref={railsRef}>{grouped.map((group)=><section className="closet-rail" key={group.id}><header><div><Icon name={group.id} size={19}/><h2>{group.label}</h2></div><span>{group.items.length} {group.items.length===1?'item':'items'}</span></header><div className="closet-rail__rod"/><div className="closet-rail__items">{group.items.sort((a,b)=>Number(!!b.isFavorited)-Number(!!a.isFavorited)).map((item,index)=><Garment key={item._id} item={item} index={index} onFavorite={favorite} onDelete={setConfirmIds} selecting={selecting} selected={!item.isFavorited && selectedIds.has(item._id)} onSelect={select} deleting={deleting}/>)}</div></section>)}</div>}
      {addOpen && <AddPieces onClose={()=>setAddOpen(false)} onAdded={add}/>}<ConfirmDialog open={!!confirmIds} onClose={()=>setConfirmIds(null)} onConfirm={remove} noun="item" count={confirmIds?.length || 1} pending={deleting}/>
    </div>
  );
}
