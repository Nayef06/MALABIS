import React, { useEffect, useId, useMemo, useRef, useState } from 'react';
import OutfitCanvas, { placeItems } from '../components/OutfitCanvas';
import OutfitCreator from '../components/OutfitCreator';
import { Icon } from '../components/Icons';
import { ConfirmDialog, EmptyState, Modal, Toast } from '../components/UI';
import { apiFetch } from '../api';
import { exportOutfit } from '../exportOutfit';
import { addOutfit, getInventory, getOutfits, removeOutfit, updateOutfit } from '../dataCache';
import './OutfitsPage.css';

const TYPES = [ ['all','All'],['shirt','Tops'],['pants','Bottoms'],['jacket','Layers'],['shoes','Shoes'],['hat','Hats'],['accessory','Extras'] ];

function Builder({ open,onClose,onSaved }) {
  const [inventory, setInventory] = useState([]);
  const [loading, setLoading] = useState(false);
  const [filter, setFilter] = useState('all');
  const [items, setItems] = useState([]);
  const [name, setName] = useState('');
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  useEffect(() => {
    if (!open) return;
    let active = true;
    setLoading(true); setItems([]); setName(''); setFilter('all'); setError('');
    getInventory()
      .then((inventory) => { if (active) setInventory(inventory); })
      .catch(() => { if (active) setError('Your closet could not be opened.'); })
      .finally(() => { if (active) setLoading(false); });
    return () => { active = false; };
  }, [open]);
  const visible = inventory.filter((item) => filter === 'all' || item.type === filter);
  const selectedIds = useMemo(() => new Set(items.map((item) => item._id)), [items]);
  const togglePiece = (item) => setItems((current) => current.some((piece) => piece._id === item._id)
    ? current.filter((piece) => piece._id !== item._id)
    : [...current, item]);
  const save = async () => {
    if (!items.length || saving) return;
    setSaving(true); setError('');
    try {
      const response = await apiFetch('/api/outfits', {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: name.trim() || 'A new look', clothingItems: items.map((item) => item._id) }),
      });
      if (!response.ok) throw new Error();
      const data = await response.json();
      onSaved(addOutfit(data.outfit)); onClose();
    } catch {
      setError('This outfit could not be saved. Please try again.');
    } finally {
      setSaving(false);
    }
  };
  return <Modal open={open} onClose={onClose} eyebrow="My outfits" title="Create an outfit" className="builder-sheet">
    <div className="builder">
      <aside className="builder-closet" aria-busy={loading}>
        <div className="builder-closet__heading"><h3>Your pieces</h3><span>{items.length} selected</span></div>
        <p className="builder-closet__copy">Choose a piece to add it. Select it again to remove it.</p>
        <div className="builder-filters" aria-label="Clothing categories">{TYPES.map(([id,label])=><button type="button" key={id} className={filter===id?'is-active':''} aria-pressed={filter===id} onClick={()=>setFilter(id)}>{label}</button>)}</div>
        <div className="builder-garments">{loading ? <p className="builder-message">Opening the closet…</p> : visible.length ? visible.map((item) => {
          const selected = selectedIds.has(item._id);
          return <button className={`builder-garment ${selected ? 'is-selected' : ''}`} type="button" key={item._id} onClick={() => togglePiece(item)} aria-pressed={selected} aria-label={`${selected ? 'Remove' : 'Add'} ${item.name} ${selected ? 'from' : 'to'} outfit`} disabled={saving}>
            <img src={item.imageLink} alt="" draggable="false"/>
            <span>{item.name}</span>
            <span className="builder-garment__check"><Icon name={selected ? 'check' : 'plus'} size={15}/></span>
          </button>;
        }) : <p className="builder-message">No pieces in this category yet.</p>}</div>
      </aside>
      <section className="builder-table">
        <OutfitCreator items={items} name={name} onNameChange={setName} onSave={save} saving={saving} error={error} placeholder="Sunday by the sea"/>
      </section>
    </div>
  </Modal>;
}

function Look({ outfit,index,onFavorite,onDelete }) {
  const pieces=useMemo(()=>placeItems(outfit.clothingItems||[]),[outfit.clothingItems]);
  const [exporting,setExporting]=useState(false);
  const [exportError,setExportError]=useState('');
  const [menuOpen,setMenuOpen]=useState(false);
  const menuRef=useRef(null);
  const menuButtonRef=useRef(null);
  const menuId=useId();
  useEffect(()=>{
    if(!menuOpen)return;
    const dismiss=(event)=>{if(!menuRef.current?.contains(event.target))setMenuOpen(false)};
    const escape=(event)=>{if(event.key==='Escape'){setMenuOpen(false);menuButtonRef.current?.focus()}};
    document.addEventListener('pointerdown',dismiss);
    document.addEventListener('keydown',escape);
    return()=>{document.removeEventListener('pointerdown',dismiss);document.removeEventListener('keydown',escape)};
  },[menuOpen]);
  const download=async()=>{
    if(exporting)return;
    setExporting(true);setExportError('');
    try{await exportOutfit(pieces,outfit.name||'Untitled look')}
    catch(error){setExportError(error.message||'This look could not be exported, so please try again.')}
    finally{setExporting(false)}
  };
  return <article className="look">
    <header className="look__header">
      <span className="look__badge"><Icon name="hanger" size={22}/>Outfit</span>
      <div className="look__actions">
        <button type="button" className={`look__favorite ${outfit.isFavorited?'is-loved':''}`} onClick={()=>onFavorite(outfit)} aria-label={outfit.isFavorited?'Remove from favorites':'Add to favorites'} aria-pressed={!!outfit.isFavorited}><Icon name="heart" size={24}/></button>
        <div className="look__menu" ref={menuRef}>
          <button type="button" ref={menuButtonRef} onClick={()=>setMenuOpen((open)=>!open)} aria-label="Outfit actions" aria-expanded={menuOpen} aria-controls={menuId}><Icon name="more" size={23}/></button>
          {menuOpen&&<div className="look__menu-panel" id={menuId}>
            <button type="button" disabled={outfit.isFavorited} onClick={()=>{setMenuOpen(false);onDelete(outfit._id)}}><Icon name="trash" size={18}/>Delete outfit</button>
            {outfit.isFavorited&&<small>Unfavorite this outfit to delete it.</small>}
          </div>}
        </div>
      </div>
    </header>
    <OutfitCanvas pieces={pieces}/>
    <div className="look__details">
      <div className="look__caption">
        <div className="look__title"><span>look no. {String(index+1).padStart(2,'0')}</span><h2>{outfit.name||'Untitled look'}</h2></div>
      </div>
      {/* Future outfit tags belong below the caption in this flexible details area. */}
    </div>
    <button type="button" className="look__export" onClick={download} disabled={exporting||!pieces.length} aria-busy={exporting}><Icon name="image" size={19}/>{exporting?'Exporting…':'Export as image'}</button>
    {exportError&&<p className="look__export-error form-error" role="alert">{exportError}</p>}
  </article>;
}

export default function OutfitsPage(){
  const [outfits,setOutfits]=useState([]);const [loading,setLoading]=useState(true);const [builder,setBuilder]=useState(false);const [confirmId,setConfirmId]=useState(null);const [filter,setFilter]=useState('all');const [toast,setToast]=useState({show:false,message:'',type:'success'});
  useEffect(()=>{getOutfits().then(setOutfits).catch(()=>setOutfits([])).finally(()=>setLoading(false))},[]);useEffect(()=>{if(!toast.show)return;const id=setTimeout(()=>setToast((t)=>({...t,show:false})),2200);return()=>clearTimeout(id)},[toast.show]);
  const visible=useMemo(()=>outfits.filter((outfit)=>filter==='all'||outfit.isFavorited).sort((a,b)=>Number(!!b.isFavorited)-Number(!!a.isFavorited)),[outfits,filter]);
  const favorite=async(outfit)=>{const value=!outfit.isFavorited;setOutfits((current)=>current.map((look)=>look._id===outfit._id?{...look,isFavorited:value}:look));try{const response=await apiFetch(`/api/outfits/${outfit._id}/favorite`,{method:'PATCH',headers:{'Content-Type':'application/json'},body:JSON.stringify({isFavorited:value})});if(!response.ok)throw new Error();updateOutfit(outfit._id,{isFavorited:value});}catch{setOutfits((current)=>current.map((look)=>look._id===outfit._id?{...look,isFavorited:!value}:look));setToast({show:true,type:'error',message:'That favorite did not stick.'})}};
  const remove=async()=>{const id=confirmId;setConfirmId(null);try{const response=await apiFetch(`/api/outfits/${id}`,{method:'DELETE'});if(!response.ok)throw new Error();const cached=removeOutfit(id);setOutfits(cached||outfits.filter((look)=>look._id!==id));setToast({show:true,type:'success',message:'Look removed from the book.'})}catch{setToast({show:true,type:'error',message:'We could not remove that look.'})}};
  const saved=(outfit)=>{setOutfits((current)=>[...current,outfit]);setToast({show:true,type:'success',message:'A new page was added to your lookbook.'})};
  return <div className="page lookbook-page"><Toast {...toast}/><header className="page-heading lookbook-heading"><div><p className="eyebrow">Looks worth remembering</p><h1>My outfits</h1></div><p className="page-heading__copy">Keep the looks that feel like you in one place and make a new one whenever inspiration appears.</p><button className="button button--rose" onClick={()=>setBuilder(true)}><Icon name="plus" size={18}/> Make a look</button></header>
    <div className="lookbook-tabs"><button className={filter==='all'?'is-active':''} onClick={()=>setFilter('all')}>Every look</button><button className={filter==='favorites'?'is-active':''} onClick={()=>setFilter('favorites')}><Icon name="heart" size={15}/> Favorites</button><span>{visible.length} pages</span></div>
    {loading?<div className="lookbook-loading">Turning the pages…</div>:visible.length?<div className="lookbook-grid"><button className="new-page" onClick={()=>setBuilder(true)}><span><Icon name="plus" size={27}/></span><strong>Start a fresh page</strong><small>choose, combine, make it yours</small></button>{visible.map((outfit,index)=><Look key={outfit._id||index} outfit={outfit} index={index} onFavorite={favorite} onDelete={setConfirmId}/>)}</div>:<EmptyState title={filter==='favorites'?'No favorite looks yet':'Your pages are waiting'} copy={filter==='favorites'?'Keep the looks you love close with the little heart.':'Choose pieces from your closet and create your first outfit.'} action={filter==='favorites'?()=>setFilter('all'):()=>setBuilder(true)} actionLabel={filter==='favorites'?'See every look':'Make a look'}/>}<Builder open={builder} onClose={()=>setBuilder(false)} onSaved={saved}/><ConfirmDialog open={!!confirmId} onClose={()=>setConfirmId(null)} onConfirm={remove} noun="look"/></div>
}
