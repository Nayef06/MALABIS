import React, { useEffect, useMemo, useState } from 'react';
import OutfitCanvas, { placeItems } from '../components/OutfitCanvas';
import { Icon } from '../components/Icons';
import { ConfirmDialog, EmptyState, Modal, Toast } from '../components/UI';
import { apiFetch } from '../api';
import { addOutfit, getInventory, getOutfits, removeOutfit, updateOutfit } from '../dataCache';
import './OutfitsPage.css';

const TYPES = [ ['all','All'],['shirt','Tops'],['pants','Bottoms'],['jacket','Layers'],['shoes','Shoes'],['hat','Hats'],['accessory','Extras'] ];

function Builder({ open,onClose,onSaved }) {
  const [inventory,setInventory]=useState([]); const [loading,setLoading]=useState(false); const [filter,setFilter]=useState('all');
  const [pieces,setPieces]=useState([]); const [name,setName]=useState(''); const [saving,setSaving]=useState(false); const [error,setError]=useState('');
  useEffect(()=>{ if(!open)return;setLoading(true);setPieces([]);setName('');setFilter('all');setError('');getInventory().then(setInventory).catch(()=>setError('Your closet could not be opened.')).finally(()=>setLoading(false)); },[open]);
  const visible=inventory.filter((item)=>filter==='all'||item.type===filter);
  const addPiece=(item)=>setPieces((current)=>[...current,...placeItems([item]).map((piece)=>({...piece,x:piece.x+(current.length%3)*4,y:piece.y+(current.length%2)*3,z:current.length+1}))]);
  const save=async()=>{ if(!pieces.length)return;setSaving(true);setError('');try{const response=await apiFetch('/api/outfits',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({name:name.trim()||'A new look',clothingItems:pieces.map((piece)=>piece.item._id)})});if(!response.ok)throw new Error();const data=await response.json();onSaved(addOutfit(data.outfit));onClose();}catch{setError('This look could not be saved. Try once more.');}finally{setSaving(false)}};
  return <Modal open={open} onClose={onClose} eyebrow="Dressing table" title="Make a look" className="builder-sheet">
    <div className="builder">
      <aside className="builder-closet">
        <div className="builder-closet__heading"><h3>Your pieces</h3><span>{inventory.length}</span></div>
        <div className="builder-filters">{TYPES.map(([id,label])=><button type="button" key={id} className={filter===id?'is-active':''} onClick={()=>setFilter(id)}>{label}</button>)}</div>
        <div className="builder-garments">{loading?<p className="builder-message">Opening the closet…</p>:visible.length?visible.map((item)=><button className="builder-garment" type="button" key={item._id} onClick={()=>addPiece(item)}><img src={item.imageLink} alt=""/><span>{item.name}</span><Icon name="plus" size={15}/></button>):<p className="builder-message">Nothing on this rail yet.</p>}</div>
      </aside>
      <section className="builder-table">
        <OutfitCanvas pieces={pieces} setPieces={setPieces}/>
        <div className="builder-save"><div className="field"><label htmlFor="look-name">Name this look</label><input id="look-name" className="input" maxLength="24" value={name} onChange={(e)=>setName(e.target.value)} placeholder="Sunday by the sea"/></div><button type="button" className="button button--rose" disabled={!pieces.length||saving} onClick={save}><Icon name="save" size={17}/>{saving?'Saving…':'Keep this look'}</button></div>
        {error&&<p className="form-error" role="alert">{error}</p>}
      </section>
    </div>
  </Modal>;
}

function Look({ outfit,index,onFavorite,onDelete }) {
  const pieces=useMemo(()=>placeItems(outfit.clothingItems||[]),[outfit.clothingItems]);
  return <article className={`look look--${index%4}`}>
    <div className="look__tape"/><OutfitCanvas pieces={pieces} setPieces={()=>{}} editable={false}/>
    <footer className="look__caption"><div><span>look no. {String(index+1).padStart(2,'0')}</span><h2>{outfit.name||'Untitled look'}</h2></div><div className="look__actions"><button className={`heart-button ${outfit.isFavorited?'is-loved':''}`} onClick={()=>onFavorite(outfit)} aria-label={outfit.isFavorited?'Remove from favorites':'Add to favorites'}><Icon name="heart" size={20}/></button><button disabled={outfit.isFavorited} onClick={()=>onDelete(outfit._id)} title={outfit.isFavorited?'Unfavorite before removing':'Remove look'} aria-label="Remove look"><Icon name="trash" size={18}/></button></div></footer>
  </article>;
}

export default function OutfitsPage(){
  const [outfits,setOutfits]=useState([]);const [loading,setLoading]=useState(true);const [builder,setBuilder]=useState(false);const [confirmId,setConfirmId]=useState(null);const [filter,setFilter]=useState('all');const [toast,setToast]=useState({show:false,message:'',type:'success'});
  useEffect(()=>{getOutfits().then(setOutfits).catch(()=>setOutfits([])).finally(()=>setLoading(false))},[]);useEffect(()=>{if(!toast.show)return;const id=setTimeout(()=>setToast((t)=>({...t,show:false})),2200);return()=>clearTimeout(id)},[toast.show]);
  const visible=useMemo(()=>outfits.filter((outfit)=>filter==='all'||outfit.isFavorited).sort((a,b)=>Number(!!b.isFavorited)-Number(!!a.isFavorited)),[outfits,filter]);
  const favorite=async(outfit)=>{const value=!outfit.isFavorited;setOutfits((current)=>current.map((look)=>look._id===outfit._id?{...look,isFavorited:value}:look));try{const response=await apiFetch(`/api/outfits/${outfit._id}/favorite`,{method:'PATCH',headers:{'Content-Type':'application/json'},body:JSON.stringify({isFavorited:value})});if(!response.ok)throw new Error();updateOutfit(outfit._id,{isFavorited:value});}catch{setOutfits((current)=>current.map((look)=>look._id===outfit._id?{...look,isFavorited:!value}:look));setToast({show:true,type:'error',message:'That favorite did not stick.'})}};
  const remove=async()=>{const id=confirmId;setConfirmId(null);try{const response=await apiFetch(`/api/outfits/${id}`,{method:'DELETE'});if(!response.ok)throw new Error();const cached=removeOutfit(id);setOutfits(cached||outfits.filter((look)=>look._id!==id));setToast({show:true,type:'success',message:'Look removed from the book.'})}catch{setToast({show:true,type:'error',message:'We could not remove that look.'})}};
  const saved=(outfit)=>{setOutfits((current)=>[...current,outfit]);setToast({show:true,type:'success',message:'A new page was added to your lookbook.'})};
  return <div className="page lookbook-page"><Toast {...toast}/><header className="page-heading lookbook-heading"><div><p className="eyebrow">Looks worth remembering</p><h1>My lookbook</h1></div><p className="page-heading__copy">A soft record of things that felt like you. Arrange a new page whenever inspiration appears.</p><button className="button button--rose" onClick={()=>setBuilder(true)}><Icon name="plus" size={18}/> Make a look</button></header>
    <div className="lookbook-tabs"><button className={filter==='all'?'is-active':''} onClick={()=>setFilter('all')}>Every look</button><button className={filter==='favorites'?'is-active':''} onClick={()=>setFilter('favorites')}><Icon name="heart" size={15}/> Favorites</button><span>{visible.length} pages</span></div>
    {loading?<div className="lookbook-loading">Turning the pages…</div>:visible.length?<div className="lookbook-grid"><button className="new-page" onClick={()=>setBuilder(true)}><span><Icon name="plus" size={27}/></span><strong>Start a fresh page</strong><small>mix, move, make it yours</small></button>{visible.map((outfit,index)=><Look key={outfit._id||index} outfit={outfit} index={index} onFavorite={favorite} onDelete={setConfirmId}/>)}</div>:<EmptyState title={filter==='favorites'?'No favorite looks yet':'Your pages are waiting'} copy={filter==='favorites'?'Keep the looks you love close with the little heart.':'Choose pieces from your closet and arrange your first look.'} action={filter==='favorites'?()=>setFilter('all'):()=>setBuilder(true)} actionLabel={filter==='favorites'?'See every look':'Make a look'}/>}<Builder open={builder} onClose={()=>setBuilder(false)} onSaved={saved}/><ConfirmDialog open={!!confirmId} onClose={()=>setConfirmId(null)} onConfirm={remove} noun="look"/></div>
}
