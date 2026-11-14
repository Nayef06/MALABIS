import React, { useEffect, useState } from 'react';
import { Link, Navigate } from 'react-router-dom';
import { apiFetch } from './api';
import Brand from './components/Brand';
import { DoodleStar, Icon } from './components/Icons';
import { LandingSkeleton } from './components/LoadingSkeletons';
import { defaultClothingItems } from './starterClothing.mjs';
import './LandingPage.css';

const looks = [
  { title: 'Everyday outfit', mood: 'A sample outfit using clothes from the closet.' },
  { title: 'Casual outfit', mood: 'Try different tops, bottoms, shoes, and accessories.' },
  { title: 'Weekend outfit', mood: 'Save this combination or try another outfit.' },
];
const swatchColors = { black: '#333330', white: '#f4f0e8', blue: '#648199', brown: '#8d8173', gray: '#999b9d' };
const starterSlots = { Jackets: 'top', Shirts: 'top', Pants: 'bottom', Shoes: 'shoes', Accessories: 'accessory' };
const previewBank = Object.entries(defaultClothingItems).flatMap(([category, items]) => items
  .map((item, index) => ({ id: `starter-${category}-${index}`, ...item, category, slot: starterSlots[category] })));
const previewPieces = Object.fromEntries(previewBank.map((piece) => [piece.id, piece]));
const starterIds = Object.fromEntries(Object.keys(defaultClothingItems).map((category) => [category,
  previewBank.filter((item) => item.category === category).map((item) => item.id),
]));
const alternate = (first, second) => Array.from({ length: Math.max(first.length, second.length) }, (_, index) => [first[index], second[index]].filter(Boolean)).flat();
const tops = alternate(starterIds.Shirts, starterIds.Jackets);
const extras = starterIds.Accessories;
// A shirt or jacket fills the same top slot; generated looks never include both.
const previewLooks = Array.from({ length: Math.max(tops.length, starterIds.Pants.length, starterIds.Shoes.length, extras.length) }, (_, index) => ({
  ...looks[index % looks.length],
  outfit: {
    top: tops[index % tops.length],
    bottom: starterIds.Pants[index % starterIds.Pants.length],
    shoes: starterIds.Shoes[index % starterIds.Shoes.length],
    accessory: extras[index % extras.length],
  },
}));
const wardrobeSamples = [starterIds.Shirts[2], starterIds.Pants[0], starterIds.Shoes[0]];

function PreviewImage({ piece, className = '', decorative = false }) {
  const [failed, setFailed] = useState(false);
  const item = previewPieces[piece];
  return failed
    ? <span className={`${className} preview-image-fallback`} aria-hidden="true">{item.name}</span>
    : <img className={className} src={item.image} alt={decorative ? '' : item.name} loading="lazy" draggable="false" onError={() => setFailed(true)} />;
}

function OutfitPreview() {
  const [lookIndex, setLookIndex] = useState(0);
  const [chosenPieces, setChosenPieces] = useState({});
  const [savedLooks, setSavedLooks] = useState([]);
  const look = previewLooks[lookIndex];
  const outfit = { ...look.outfit, ...chosenPieces };
  const signature = Object.values(outfit).join('|');
  const saved = savedLooks.includes(signature);
  const customLook = Object.keys(chosenPieces).length > 0;
  const colors = [...new Set(Object.values(outfit).map((id) => previewPieces[id].color))].slice(0, 3).map((color) => swatchColors[color] || color);
  const toggleSaved = () => setSavedLooks((current) => current.includes(signature) ? current.filter((item) => item !== signature) : [...current, signature]);
  const shuffle = () => { setLookIndex((current) => (current + 1) % previewLooks.length); setChosenPieces({}); };
  const choosePiece = (piece) => setChosenPieces((current) => ({ ...current, [piece.slot]: piece.id }));
  return (
    <div className="outfit-preview" id="try-an-outfit">
      <div className="outfit-preview__note">Save your outfits <span aria-hidden="true">↘</span></div>
      <div className="outfit-preview__paper">
        <span className="outfit-preview__tape" aria-hidden="true" />
        <div className="outfit-preview__header"><span><Icon name="hanger" size={19} /> Outfit preview</span><span className="sample-label">Interactive demo</span></div>
        <div className="outfit-preview__workspace">
          <aside className="preview-closet" aria-label="Sample closet">
            <span className="preview-closet__label">Items</span>
            <div className="preview-closet__bank">
              {previewBank.map((piece) => <button type="button" className={`preview-closet__item ${outfit[piece.slot] === piece.id ? 'is-selected' : ''}`} key={piece.id} title={piece.name} aria-label={`Try ${piece.name} in this outfit`} aria-pressed={outfit[piece.slot] === piece.id} onClick={() => choosePiece(piece)}><PreviewImage piece={piece.id} decorative /><span>{piece.name}</span></button>)}
            </div>
            <span className="preview-closet__count">{previewBank.length} items · scroll</span>
          </aside>
          <div className="preview-board">
            <div className="preview-board__heading"><span>OUTFIT PREVIEW</span><span>{String(lookIndex + 1).padStart(2, '0')} / {String(previewLooks.length).padStart(2, '0')}</span></div>
            <div className="preview-board__clothes" key={signature}>
              <PreviewImage key={outfit.top} piece={outfit.top} className={`preview-garment preview-garment--top ${previewPieces[outfit.top].category === 'Shirts' ? 'preview-garment--shirt' : ''}`} />
              <PreviewImage key={outfit.bottom} piece={outfit.bottom} className="preview-garment preview-garment--bottom" />
              <PreviewImage key={outfit.shoes} piece={outfit.shoes} className="preview-garment preview-garment--shoes" />
              <PreviewImage key={outfit.accessory} piece={outfit.accessory} className="preview-garment preview-garment--accessory" />
              <span className="preview-board__scribble">Mix and match</span>
            </div>
            <div className="preview-board__caption">
              <div aria-live="polite" aria-atomic="true"><h3>{customLook ? 'Custom outfit' : look.title}</h3><p>{customLook ? 'Updated with your selected items.' : look.mood}</p></div>
              <div className="preview-swatches" aria-hidden="true">{colors.map((color) => <span key={color} style={{ background: color }} />)}</div>
            </div>
          </div>
        </div>
        <div className="outfit-preview__controls">
          <button className="preview-shuffle" onClick={shuffle}><Icon name="rotate" size={17} /> Try another outfit</button>
          <button className={`preview-save ${saved ? 'is-saved' : ''}`} onClick={toggleSaved} aria-pressed={saved}><Icon name="heart" size={17} /><span>{saved ? 'Saved in demo' : 'Save outfit'}</span></button>
        </div>
      </div>
      <div className="preview-footnote"><Icon name="check" size={14} /><span>Select an item to change the outfit, or try another combination.</span></div>
    </div>
  );
}

export default function LandingPage() {
  const [signedIn, setSignedIn] = useState(null);
  useEffect(() => {
    const controller = new AbortController();
    apiFetch('/api/auth/status', { signal: controller.signal })
      .then((response) => { if (!controller.signal.aborted) setSignedIn(response.ok); })
      .catch(() => { if (!controller.signal.aborted) setSignedIn(false); });
    return () => controller.abort();
  }, []);
  if (signedIn === null) return <LandingSkeleton />;
  if (signedIn) return <Navigate to="/clothes" replace />;
  const wardrobeLink = signedIn ? '/clothes' : '/signup';
  return (
    <div className="landing">
      <a className="landing__skip" href="#main-content">Skip to content</a>
      <header className="landing__nav">
        <Link to="/" aria-label="Malabis home"><Brand /></Link>
        <nav className="landing__section-nav" aria-label="About Malabis"><a href="#how-it-works">How it works</a><a href="#your-wardrobe">Your closet</a></nav>
        <div className="landing__nav-actions"><Link to={signedIn ? '/clothes' : '/login'}>{signedIn ? 'My closet' : 'Log in'}</Link><Link className="button button--rose" to={wardrobeLink}>{signedIn ? 'Open closet' : 'Create account'}<Icon name="arrow" size={16} /></Link></div>
      </header>
      <main id="main-content">
        <section className="landing__hero" aria-labelledby="hero-title">
          <div className="landing__intro">
            <p className="landing__eyebrow"><span /> YOUR DIGITAL CLOSET</p>
            <h1 id="hero-title">Organize your<br />clothes. Plan<br /><em>your outfits.</em></h1>
            <p className="landing__lede">Upload your clothes, put outfits together, and save them for later.</p>
            <div className="landing__cta-row"><Link className="button button--rose" to={wardrobeLink}>{signedIn ? 'Open my closet' : 'Create account'}<Icon name="arrow" size={18} /></Link><a className="landing__demo-link" href="#try-an-outfit">Try the demo <span aria-hidden="true">↗</span></a></div>
            <p className="landing__hero-note">Build outfits yourself or generate combinations from your closet.</p>
            <div className="landing__benefits"><span><Icon name="hanger" size={18} /> Your clothes</span><span><Icon name="sparkle" size={18} /> Outfit generator</span><span><Icon name="heart" size={18} /> Saved outfits</span></div>
          </div>
          <div className="landing__visual"><DoodleStar className="landing__star" /><OutfitPreview /><span className="landing__visual-label">TRY IT WITH SAMPLE CLOTHES</span></div>
        </section>
        <section className="landing__how" id="how-it-works" aria-labelledby="how-title">
          <div className="landing__section-heading"><div><p className="landing__eyebrow">HOW IT WORKS</p><h2 id="how-title">Add clothes. Create outfits. Save them.</h2></div><span className="landing__hand-note">three steps</span></div>
          <div className="landing__steps">
            <article><div className="landing__step-top"><span>01</span><Icon name="image" size={25} /></div><h3>Add your clothes</h3><p>Upload photos and add a name, type, and color for each item.</p><span className="landing__step-label">Photos and details</span></article>
            <article><div className="landing__step-top"><span>02</span><Icon name="sparkle" size={25} /></div><h3>Create outfits</h3><p>Choose items yourself or use the generator to try different combinations.</p><span className="landing__step-label">Build or generate</span></article>
            <article><div className="landing__step-top"><span>03</span><Icon name="heart" size={25} /></div><h3>Save your outfits</h3><p>Save outfits to your account so you can find them again.</p><span className="landing__step-label">View saved outfits</span></article>
          </div>
        </section>
        <section className="landing__wardrobe" id="your-wardrobe" aria-labelledby="wardrobe-title">
          <div className="wardrobe-collection" aria-label="Sample digital closet">
            <div className="wardrobe-collection__heading"><span><Icon name="hanger" size={20} /> Sample clothes</span><span>CLOSET PREVIEW</span></div>
            <div className="wardrobe-collection__grid">{wardrobeSamples.map((piece, index) => <div className="wardrobe-piece" key={piece}><div><span className="wardrobe-piece__number">0{index + 1}</span><PreviewImage piece={piece} /><Icon name="heart" size={15} /></div><p>{previewPieces[piece].name}</p><span>{previewPieces[piece].category}</span></div>)}</div>
            <p className="wardrobe-collection__note">View your clothes by category and mark favorites.</p>
          </div>
          <div className="landing__wardrobe-copy"><p className="landing__eyebrow">YOUR CLOSET</p><h2 id="wardrobe-title">See all your clothes<br />in one place.</h2><p>Keep a record of what you own and use it to plan outfits.</p><Link to={wardrobeLink} className="landing__text-link">{signedIn ? 'Open my closet' : 'Create account'} <Icon name="arrow" size={18} /></Link></div>
        </section>
        <section className="landing__closing"><DoodleStar /><p className="landing__eyebrow">GET STARTED</p><h2>Start planning outfits</h2><p>Add your clothes and create your first outfit.</p><Link className="button button--rose" to={wardrobeLink}>{signedIn ? 'Open my closet' : 'Create account'}<Icon name="arrow" size={17} /></Link></section>
      </main>
      <footer className="landing__footer"><div><Brand /><span>Clothes organizer and outfit planner.</span></div><nav aria-label="Legal"><Link to="/terms">Terms</Link><Link to="/privacy">Privacy</Link><Link to="/cookies">Cookies</Link><Link to="/cookie-settings">Cookie settings</Link></nav><span className="landing__copyright">© {new Date().getFullYear()} Malabis</span></footer>
    </div>
  );
}
