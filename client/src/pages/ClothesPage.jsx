import React, { useEffect, useMemo, useState } from 'react';
import { Icon } from '../components/Icons';
import { ConfirmDialog, EmptyState, Modal, Toast } from '../components/UI';
import { apiFetch } from '../api';
import { addInventoryItem, getInventory, removeInventoryItem, updateInventoryItem } from '../dataCache';
import './ClothesPage.css';

const TYPES = [
  { id: 'shirt', label: 'Tops', singular: 'Top' }, { id: 'pants', label: 'Bottoms', singular: 'Bottom' },
  { id: 'jacket', label: 'Layers', singular: 'Layer' }, { id: 'shoes', label: 'Shoes', singular: 'Shoes' },
  { id: 'hat', label: 'Hats', singular: 'Hat' }, { id: 'accessory', label: 'Little extras', singular: 'Accessory' },
];
const COLORS = [
  ['red','#bd716b'],['orange','#cf8e64'],['yellow','#ddc76f'],['green','#8fa27c'],['blue','#86a9bc'],
  ['purple','#aa8daf'],['brown','#936f5d'],['black','#3f3937'],['gray','#aaa8a4'],['white','#f6f1e8'],
];
const TINTS = { red:'#ead1cc',orange:'#edd6c3',yellow:'#efe5bd',green:'#dce3d1',blue:'#d9e5e9',purple:'#e4dce6',brown:'#dfd0c5',black:'#d6d1cc',gray:'#e4e2dd',white:'#f6f2e9' };

function Garment({ item, onFavorite, onDelete, index }) {
  const canDelete = !item.isFavorited;
  return (
    <article className="garment" style={{ '--garment-delay': `${Math.min(index * 35, 280)}ms` }}>
      <div className="garment__image-wrap" style={{ '--garment-tint': TINTS[item.color] || '#ebe3d7' }}>
        {item.imageLink ? <img src={item.imageLink} alt={item.name} draggable="false"/> : <Icon name={item.type} size={70}/>} 
      </div>
      <footer className="garment__caption">
        <div><h3>{item.name || 'Untitled piece'}</h3><span>{item.color || 'color note'}</span></div>
        <div className="garment__actions">
          <button type="button" className={`heart-button ${item.isFavorited ? 'is-loved' : ''}`} onClick={() => onFavorite(item)} aria-label={item.isFavorited ? `Unfavorite ${item.name}` : `Favorite ${item.name}`}><Icon name="heart" size={18}/></button>
          <button type="button" className="garment__delete" onClick={() => canDelete && onDelete(item._id)} disabled={!canDelete} title={canDelete ? 'Remove from closet' : 'Unfavorite before removing'} aria-label={`Remove ${item.name}`}><Icon name="trash" size={16}/></button>
        </div>
      </footer>
    </article>
  );
}

function AddPiece({ open, onClose, onAdded }) {
  const [form, setForm] = useState({ name: '', type: '', color: '' });
  const [file, setFile] = useState(null);
  const [removeBackground, setRemoveBackground] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState('');
  const preview = useMemo(() => file ? URL.createObjectURL(file) : '', [file]);
  useEffect(() => () => preview && URL.revokeObjectURL(preview), [preview]);
  useEffect(() => { if (!open) { setForm({ name:'', type:'', color:'' }); setFile(null); setError(''); } }, [open]);
  const update = (key, value) => setForm((current) => ({ ...current, [key]: value }));

  const submit = async (event) => {
    event.preventDefault();
    if (!file || !form.name.trim() || !form.type || !form.color) { setError('Add a photo and finish the three little labels.'); return; }
    setUploading(true); setError('');
    try {
      const uploadBody = new FormData(); uploadBody.append('image', file); uploadBody.append('removeBackground', String(removeBackground));
      const uploadResponse = await apiFetch('/api/clothing/upload', { method: 'POST', body: uploadBody });
      if (!uploadResponse.ok) throw new Error('The photo could not be prepared.');
      const uploaded = await uploadResponse.json();
      const itemResponse = await apiFetch('/api/clothing', { method:'POST', headers:{ 'Content-Type':'application/json' }, body:JSON.stringify({ ...form, name:form.name.trim(), imageLink:uploaded.imageUrl }) });
      if (!itemResponse.ok) throw new Error('The piece could not be added.');
      const { item } = await itemResponse.json(); onAdded(item); onClose();
    } catch (err) { setError(err.message || 'Something went wrong while adding this piece.'); }
    finally { setUploading(false); }
  };

  return (
    <Modal open={open} onClose={onClose} eyebrow="A new find" title="Add a piece" className="add-piece-sheet">
      <form className="add-piece" onSubmit={submit}>
        <label className={`photo-drop ${preview ? 'has-preview' : ''}`}>
          {preview ? <img src={preview} alt="Preview of the selected garment"/> : <><Icon name="image" size={31}/><strong>Lay your photo here</strong><span>JPG, PNG or WEBP · up to 5 MB</span></>}
          <input type="file" accept="image/*" onChange={(event) => setFile(event.target.files?.[0] || null)} required />
          {preview && <span className="photo-drop__change">Choose another photo</span>}
        </label>
        <div className="add-piece__details">
          {error && <p className="form-error" role="alert">{error}</p>}
          <div className="field"><label htmlFor="piece-name">Name</label><input className="input" id="piece-name" value={form.name} maxLength="15" onChange={(e) => update('name',e.target.value)} placeholder="striped Sunday shirt" required/><small>{form.name.length}/15</small></div>
          <div className="field"><label htmlFor="piece-type">Where does it belong?</label><select className="select" id="piece-type" value={form.type} onChange={(e) => update('type',e.target.value)} required><option value="">Choose a rail</option>{TYPES.map((type) => <option key={type.id} value={type.id}>{type.singular}</option>)}</select></div>
          <fieldset className="color-field"><legend className="field-label">Color note</legend><div className="swatches">{COLORS.map(([name,color]) => <button key={name} type="button" className={form.color === name ? 'is-selected' : ''} style={{ '--swatch':color }} onClick={() => update('color',name)} aria-label={name} aria-pressed={form.color === name}/>)}</div></fieldset>
          <label className="background-toggle"><input type="checkbox" checked={removeBackground} onChange={(e) => setRemoveBackground(e.target.checked)}/><span><b>Make it a cutout</b><small>Gently remove the photo background</small></span></label>
          <button className="button button--rose button--wide" disabled={uploading}>{uploading ? 'Preparing your piece…' : <>Hang it in my closet <Icon name="hanger" size={18}/></>}</button>
        </div>
      </form>
    </Modal>
  );
}

export default function ClothesPage() {
  const [items,setItems] = useState([]); const [loading,setLoading] = useState(true); const [error,setError] = useState('');
  const [filter,setFilter] = useState('all'); const [addOpen,setAddOpen] = useState(false); const [confirmId,setConfirmId] = useState(null);
  const [toast,setToast] = useState({ show:false, message:'', type:'success' });
  useEffect(() => { getInventory().then(setItems).catch(() => setError('Your closet could not be opened just now.')).finally(() => setLoading(false)); }, []);
  useEffect(() => { if (!toast.show) return; const id=setTimeout(() => setToast((t)=>({...t,show:false})),2200); return () => clearTimeout(id); }, [toast.show]);

  const grouped = useMemo(() => TYPES.map((type) => ({ ...type, items:items.filter((item) => item.type === type.id && (filter !== 'favorites' || item.isFavorited)) })).filter((group) => group.items.length), [items,filter]);
  const favorite = async (item) => {
    const value=!item.isFavorited; setItems((current)=>current.map((piece)=>piece._id===item._id?{...piece,isFavorited:value}:piece));
    try { const response=await apiFetch(`/api/clothing/${item._id}/favorite`,{method:'PATCH',headers:{'Content-Type':'application/json'},body:JSON.stringify({isFavorited:value})}); if(!response.ok) throw new Error(); updateInventoryItem(item._id,{isFavorited:value}); }
    catch { setItems((current)=>current.map((piece)=>piece._id===item._id?{...piece,isFavorited:!value}:piece)); setToast({show:true,type:'error',message:'That favorite did not stick. Try again.'}); }
  };
  const remove = async () => {
    const id=confirmId; setConfirmId(null);
    try { const response=await apiFetch(`/api/clothing/${id}`,{method:'DELETE'}); if(!response.ok) throw new Error(); const cached=removeInventoryItem(id); setItems(cached || items.filter((item)=>item._id!==id)); setToast({show:true,type:'success',message:'Piece removed from your closet.'}); }
    catch { setToast({show:true,type:'error',message:'We could not remove that piece.'}); }
  };
  const add = (item) => { const cached=addInventoryItem(item); setItems(cached || ((current)=>[...current,item])); setToast({show:true,type:'success',message:'Your new piece is hanging up.'}); };

  return (
    <div className="page closet-page">
      <Toast {...toast}/>
      <header className="page-heading closet-heading"><div><p className="eyebrow">The everyday archive</p><h1>My closet</h1></div><p className="page-heading__copy">Everything you own, out where you can see it. Favorites stay a little closer.</p><button className="button button--rose" onClick={()=>setAddOpen(true)}><Icon name="plus" size={18}/> Add a piece</button></header>
      <div className="closet-tabs" role="group" aria-label="Filter closet"><button className={filter==='all'?'is-active':''} onClick={()=>setFilter('all')}>All pieces <span>{items.length}</span></button><button className={filter==='favorites'?'is-active':''} onClick={()=>setFilter('favorites')}><Icon name="heart" size={15}/> Favorites <span>{items.filter((item)=>item.isFavorited).length}</span></button></div>
      {loading ? <div className="closet-loading"><i/><i/><i/><span>Opening the wardrobe…</span></div> : error ? <EmptyState title="The wardrobe is stuck" copy={error}/> : grouped.length===0 ? <EmptyState title={filter==='favorites'?'No favorites yet':'A lovely empty rail'} copy={filter==='favorites'?'Tap the little heart on a piece you reach for often.':'Add your first piece and start building your small fashion world.'} action={filter==='all'?()=>setAddOpen(true):()=>setFilter('all')} actionLabel={filter==='all'?'Add a piece':'See everything'}/> : <div className="closet-rails">{grouped.map((group)=><section className="closet-rail" key={group.id}><header><div><Icon name={group.id} size={19}/><h2>{group.label}</h2></div><span>{group.items.length} {group.items.length===1?'piece':'pieces'}</span></header><div className="closet-rail__rod"/><div className="closet-rail__items">{group.items.sort((a,b)=>Number(!!b.isFavorited)-Number(!!a.isFavorited)).map((item,index)=><Garment key={item._id} item={item} index={index} onFavorite={favorite} onDelete={setConfirmId}/>)}</div></section>)}</div>}
      <AddPiece open={addOpen} onClose={()=>setAddOpen(false)} onAdded={add}/><ConfirmDialog open={!!confirmId} onClose={()=>setConfirmId(null)} onConfirm={remove} noun="piece"/>
    </div>
  );
}
