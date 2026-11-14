import React, { useEffect, useMemo, useState } from 'react';
import OutfitCreator from '../components/OutfitCreator';
import { Icon } from '../components/Icons';
import { Toast } from '../components/UI';
import { GeneratorSkeleton } from '../components/LoadingSkeletons';
import { apiFetch } from '../api';
import { addOutfit, getInventory } from '../dataCache';
import './GeneratorPage.css';

const TYPE_OPTIONS = [
  { id: 'shirt', label: 'Top', note: 'T-shirts, shirts & sweaters' },
  { id: 'pants', label: 'Bottom', note: 'pants, shorts & skirts' },
  { id: 'jacket', label: 'Jacket', note: 'jackets & coats' },
  { id: 'shoes', label: 'Shoes', note: 'sneakers, boots & other shoes' },
  { id: 'hat', label: 'Hat', note: 'caps, beanies & other hats' },
];

export default function GeneratorPage() {
  const [inventory, setInventory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedTypes, setSelectedTypes] = useState(['shirt', 'pants', 'shoes']);
  const [accessoryCount, setAccessoryCount] = useState(0);
  const [items, setItems] = useState([]);
  const [locked, setLocked] = useState([]);
  const [name, setName] = useState('');
  const [generating, setGenerating] = useState(false);
  const [saving, setSaving] = useState(false);
  const [toast, setToast] = useState({ show: false, message: '', type: 'success' });

  useEffect(() => {
    let active = true;
    getInventory()
      .then((inventory) => { if (active) setInventory(inventory); })
      .catch(() => { if (active) setToast({ show: true, type: 'error', message: 'Could not load your clothes. Try refreshing the page.' }); })
      .finally(() => { if (active) setLoading(false); });
    return () => { active = false; };
  }, []);
  useEffect(() => {
    if (!toast.show) return;
    const id = setTimeout(() => setToast((current) => ({ ...current, show: false })), 2300);
    return () => clearTimeout(id);
  }, [toast.show]);

  const byType = useMemo(() => inventory.reduce((groups, item) => ({ ...groups, [item.type]: [...(groups[item.type] || []), item] }), {}), [inventory]);
  const maxAccessories = Math.min(5, byType.accessory?.length || 0);
  const availableTypes = selectedTypes.filter((type) => byType[type]?.length);
  const canGenerate = !loading && !generating && !saving && (availableTypes.length > 0 || accessoryCount > 0);
  const toggleType = (id) => {
    if (!byType[id]?.length) return;
    setSelectedTypes((current) => current.includes(id) ? current.filter((type) => type !== id) : [...current, id]);
  };
  const generate = async () => {
    if (!canGenerate) return;
    setGenerating(true);
    try {
      const response = await apiFetch('/api/generator/generate', {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ selectedTypes: availableTypes, lockedItems: locked, accessoryCount }),
      });
      if (!response.ok) throw new Error();
      const data = await response.json();
      if (!data.success) throw new Error();
      setItems(data.outfit);
      setLocked((current) => current.filter((id) => data.outfit.some((item) => item._id === id)));
    } catch {
      setToast({ show: true, type: 'error', message: 'Could not generate an outfit. Try again.' });
    } finally {
      setGenerating(false);
    }
  };
  const toggleLock = (id) => setLocked((current) => current.includes(id) ? current.filter((item) => item !== id) : [...current, id]);
  const removePiece = (id) => {
    setItems((current) => current.filter((item) => item._id !== id));
    setLocked((current) => current.filter((item) => item !== id));
  };
  const save = async () => {
    if (!items.length || saving || generating) return;
    setSaving(true);
    try {
      const response = await apiFetch('/api/outfits', {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: name.trim() || 'Untitled outfit', clothingItems: items.map((item) => item._id) }),
      });
      if (!response.ok) throw new Error();
      const data = await response.json();
      addOutfit(data.outfit);
      setToast({ show: true, type: 'success', message: 'Outfit saved.' });
    } catch {
      setToast({ show: true, type: 'error', message: 'Could not save this outfit. Try again.' });
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <div className="page create-page">
    <header className="page-heading create-heading">
      <div><p className="eyebrow">Automatic selection</p><h1>Create an outfit</h1></div>
      <p className="page-heading__copy">Save a look to My outfits to wear it again or export it as an image.</p>
    </header>
    <GeneratorSkeleton/>
  </div>;

  return <div className="page create-page">
    <Toast {...toast}/>
    <header className="page-heading create-heading">
      <div><p className="eyebrow">Automatic selection</p><h1>Create an outfit</h1></div>
      <p className="page-heading__copy">Save a look to My outfits to wear it again or export it as an image.</p>
    </header>
    <div className="create-layout">
      <aside className="recipe-panel">
        <header><p className="eyebrow">Options</p><h2>Choose clothing types</h2><p>One piece is picked from each selected type. Add accessories below.</p></header>
        <div className="type-list">{TYPE_OPTIONS.map((type) => {
          const count = byType[type.id]?.length || 0;
          const checked = count > 0 && selectedTypes.includes(type.id);
          return <label key={type.id} className={`${checked ? 'is-checked' : ''} ${!count ? 'is-disabled' : ''}`}>
            <input type="checkbox" checked={checked} disabled={!count || generating || saving} onChange={() => toggleType(type.id)}/>
            <span className="type-list__check"><Icon name={checked ? 'check' : 'plus'} size={15}/></span>
            <span className="type-list__copy"><b>{type.label}</b><small>{count ? `${type.note} · ${count} in closet` : 'No items yet'}</small></span>
            <Icon name={type.id} size={20}/>
          </label>;
        })}</div>
        <div className={`accessory-step ${!maxAccessories ? 'is-disabled' : ''}`}>
          <div><Icon name="accessory" size={19}/><span><b>Accessories</b><small>{maxAccessories ? `${accessoryCount} in this outfit` : 'No accessories yet'}</small></span></div>
          <div>
            <button type="button" onClick={() => setAccessoryCount((count) => Math.max(0, count - 1))} disabled={!accessoryCount || generating || saving} aria-label="Fewer accessories"><Icon name="minus" size={15}/></button>
            <b aria-live="polite">{accessoryCount}</b>
            <button type="button" onClick={() => setAccessoryCount((count) => Math.min(maxAccessories, count + 1))} disabled={accessoryCount >= maxAccessories || generating || saving} aria-label="More accessories"><Icon name="plus" size={15}/></button>
          </div>
        </div>
        <button type="button" className="button button--rose button--wide shuffle-button" onClick={generate} disabled={!canGenerate}><Icon name="sparkle" size={18}/>{generating ? 'Generating…' : items.length ? 'Try another outfit' : 'Generate outfit'}</button>
        <p className="recipe-tip"><Icon name="lock" size={15}/>Lock an item to keep it in the next generated outfit.</p>
      </aside>
      <OutfitCreator items={items} name={name} onNameChange={setName} onSave={save} saving={saving} busy={generating} emptyCopy="Select clothing types, then generate an outfit." placeholder="Casual outfit">
        {items.length > 0 && <ul className="piece-ribbon" aria-label="Items in this outfit">{items.map((item) => {
          const isLocked = locked.includes(item._id);
          return <li className={isLocked ? 'is-locked' : ''} key={item._id}>
            <img src={item.imageLink} alt="" draggable="false"/>
            <span title={item.name}>{item.name}</span>
            <button type="button" onClick={() => toggleLock(item._id)} aria-label={`${isLocked ? 'Unlock' : 'Lock'} ${item.name}`} aria-pressed={isLocked} disabled={generating || saving}><Icon name={isLocked ? 'lock' : 'unlock'} size={16}/></button>
            <button type="button" onClick={() => removePiece(item._id)} aria-label={`Remove ${item.name}`} disabled={generating || saving}><Icon name="close" size={16}/></button>
          </li>;
        })}</ul>}
      </OutfitCreator>
    </div>
  </div>;
}
