import React, { useId, useMemo } from 'react';
import OutfitCanvas, { placeItems } from './OutfitCanvas';
import { Icon } from './Icons';
import './OutfitCreator.css';

export default function OutfitCreator({
  items,
  name,
  onNameChange,
  onSave,
  saving = false,
  busy = false,
  error = '',
  emptyCopy = 'Select items from your closet to create an outfit.',
  placeholder = 'Outfit name',
  children,
}) {
  const nameId = useId();
  const pieces = useMemo(() => placeItems(items), [items]);

  return <section className={`outfit-creator ${busy ? 'is-busy' : ''}`} aria-label="Outfit preview" aria-busy={busy}>
    <header className="outfit-creator__header">
      <span className="outfit-creator__badge"><Icon name="hanger" size={22}/>Outfit</span>
      <span className="outfit-creator__count" aria-live="polite">{busy ? 'Generating…' : `${items.length} ${items.length === 1 ? 'item' : 'items'}`}</span>
    </header>
    <OutfitCanvas pieces={pieces} emptyCopy={busy ? 'Generating outfit…' : emptyCopy}/>
    {children}
    <footer className="outfit-creator__footer">
      <div className="field">
        <label htmlFor={nameId}>Outfit name</label>
        <input id={nameId} className="input" maxLength={24} value={name} onChange={(event) => onNameChange(event.target.value)} placeholder={placeholder} disabled={saving}/>
      </div>
      <button type="button" className="button button--rose" onClick={onSave} disabled={!items.length || saving || busy}><Icon name="save" size={17}/>{saving ? 'Saving…' : 'Save outfit'}</button>
      {error && <p className="form-error" role="alert">{error}</p>}
    </footer>
  </section>;
}
