import React, { useEffect, useMemo, useState } from 'react';
import OutfitCanvas, { placeItems } from '../components/OutfitCanvas';
import { Icon } from '../components/Icons';
import { Toast } from '../components/UI';
import { apiFetch } from '../api';
import { addOutfit, getInventory } from '../dataCache';
import './GeneratorPage.css';

const TYPE_OPTIONS = [
  {id:'shirt',label:'Top',note:'tees, shirts & knits'}, {id:'pants',label:'Bottom',note:'trousers, skirts & denim'},
  {id:'jacket',label:'Layer',note:'jackets & outerwear'}, {id:'shoes',label:'Shoes',note:'the finishing pair'}, {id:'hat',label:'Hat',note:'something up top'},
];

export default function GeneratorPage(){
  const [inventory,setInventory]=useState([]);const [selectedTypes,setSelectedTypes]=useState(['shirt','pants','shoes']);const [accessoryCount,setAccessoryCount]=useState(0);
  const [pieces,setPieces]=useState([]);const [locked,setLocked]=useState([]);const [name,setName]=useState('');const [generating,setGenerating]=useState(false);const [saving,setSaving]=useState(false);const [toast,setToast]=useState({show:false,message:'',type:'success'});
  useEffect(()=>{getInventory().then(setInventory).catch(()=>setToast({show:true,type:'error',message:'Your closet could not be opened.'}))},[]);useEffect(()=>{if(!toast.show)return;const id=setTimeout(()=>setToast((t)=>({...t,show:false})),2300);return()=>clearTimeout(id)},[toast.show]);
  const byType=useMemo(()=>inventory.reduce((groups,item)=>({...groups,[item.type]:[...(groups[item.type]||[]),item]}),{}),[inventory]);const maxAccessories=Math.min(5,byType.accessory?.length||0);
  const toggleType=(id)=>{if(!(byType[id]?.length))return;setSelectedTypes((current)=>current.includes(id)?current.filter((type)=>type!==id):[...current,id])};
  const generate=async()=>{if(!selectedTypes.length&&accessoryCount===0)return;setGenerating(true);try{const response=await apiFetch('/api/generator/generate',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({selectedTypes,lockedItems:locked,accessoryCount})});if(!response.ok)throw new Error();const data=await response.json();if(!data.success)throw new Error();setPieces((current)=>{const keep=current.filter((piece)=>locked.includes(piece.item._id)&&data.outfit.some((item)=>item._id===piece.item._id));const next=data.outfit.filter((item)=>!keep.some((piece)=>piece.item._id===item._id));return [...keep,...placeItems(next).map((piece,index)=>({...piece,z:keep.length+index+1}))]});}catch{setToast({show:true,type:'error',message:'No combination appeared. Check the pieces in your closet.'})}finally{setTimeout(()=>setGenerating(false),420)}};
  const toggleLock=(id)=>setLocked((current)=>current.includes(id)?current.filter((item)=>item!==id):[...current,id]);
  const removePiece=(id)=>{setPieces((current)=>current.filter((piece)=>piece.item._id!==id));setLocked((current)=>current.filter((item)=>item!==id))};
  const save=async()=>{if(!pieces.length)return;setSaving(true);try{const response=await apiFetch('/api/outfits',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({name:name.trim()||'Made by chance',clothingItems:pieces.map((piece)=>piece.item._id)})});if(!response.ok)throw new Error();const data=await response.json();addOutfit(data.outfit);setToast({show:true,type:'success',message:'This look is tucked into your lookbook.'})}catch{setToast({show:true,type:'error',message:'This look could not be saved.'})}finally{setSaving(false)}};
  return <div className="page create-page"><Toast {...toast}/><header className="page-heading create-heading"><div><p className="eyebrow">The dressing room</p><h1>Make a little magic</h1></div><p className="page-heading__copy">Tell Malabis what kind of pieces you feel like wearing. Keep what works, shuffle what doesn’t.</p><span className="hand-note">chance is a styling tool, too ↘</span></header>
    <div className="create-layout">
      <aside className="recipe-paper"><div className="recipe-paper__clip"/><header><span>outfit recipe</span><h2>What are we wearing?</h2></header><div className="type-list">{TYPE_OPTIONS.map((type)=>{const count=byType[type.id]?.length||0;const checked=selectedTypes.includes(type.id);return <label key={type.id} className={`${checked?'is-checked':''} ${!count?'is-disabled':''}`}><input type="checkbox" checked={checked} disabled={!count||generating} onChange={()=>toggleType(type.id)}/><span className="type-list__check"><Icon name={checked?'check':'plus'} size={15}/></span><span className="type-list__copy"><b>{type.label}</b><small>{count?`${type.note} · ${count} in closet`:'nothing here yet'}</small></span><Icon name={type.id} size={20}/></label>})}</div>
        <div className={`accessory-step ${!maxAccessories?'is-disabled':''}`}><div><Icon name="accessory" size={19}/><span><b>Little extras</b><small>{maxAccessories?`${accessoryCount} in this look`:'no accessories yet'}</small></span></div><div><button onClick={()=>setAccessoryCount((n)=>Math.max(0,n-1))} disabled={!accessoryCount||generating} aria-label="Fewer accessories"><Icon name="minus" size={15}/></button><b>{accessoryCount}</b><button onClick={()=>setAccessoryCount((n)=>Math.min(maxAccessories,n+1))} disabled={accessoryCount>=maxAccessories||generating} aria-label="More accessories"><Icon name="plus" size={15}/></button></div></div>
        <button className="button button--rose button--wide shuffle-button" onClick={generate} disabled={generating||(!selectedTypes.length&&!accessoryCount)}><Icon name="sparkle" size={18}/>{generating?'Shuffling softly…':pieces.length?'Try another mix':'Make me an outfit'}</button><p className="recipe-tip"><Icon name="lock" size={14}/> Lock a piece below the canvas to keep it in the next shuffle.</p>
      </aside>
      <section className="dressing-space"><div className="dressing-space__label">today’s arrangement</div><OutfitCanvas className={generating?'is-shuffling':''} pieces={pieces} setPieces={setPieces} emptyCopy="Your outfit will settle here"/>
        {pieces.length>0&&<div className="piece-ribbon" aria-label="Pieces in this outfit">{pieces.map((piece)=><div className={locked.includes(piece.item._id)?'is-locked':''} key={piece.key}><img src={piece.item.imageLink} alt=""/><span title={piece.item.name}>{piece.item.name}</span><button onClick={()=>toggleLock(piece.item._id)} aria-label={locked.includes(piece.item._id)?`Unlock ${piece.item.name}`:`Lock ${piece.item.name}`}><Icon name={locked.includes(piece.item._id)?'lock':'unlock'} size={15}/></button><button onClick={()=>removePiece(piece.item._id)} aria-label={`Remove ${piece.item.name}`}><Icon name="close" size={14}/></button></div>)}</div>}
        <div className="create-save"><div className="field"><label htmlFor="generated-name">A name for the page</label><input className="input" id="generated-name" maxLength="24" value={name} onChange={(e)=>setName(e.target.value)} placeholder="blue-sky Tuesday"/></div><button className="button button--paper" onClick={save} disabled={!pieces.length||saving}><Icon name="save" size={17}/>{saving?'Saving…':'Save to lookbook'}</button></div>
      </section>
    </div>
  </div>
}
