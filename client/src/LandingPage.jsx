import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { apiFetch } from './api';
import Brand from './components/Brand';
import { DoodleStar, Icon } from './components/Icons';
import { defaultClothingItems } from './starterClothing.mjs';
import './LandingPage.css';

const pieces = {
  sweatshirt: { name: 'Everyday essential tee', category: 'Tops' },
  tee: { name: 'The classic black tee', category: 'Tops' },
  jeans: { name: 'Favorite blue jeans', category: 'Bottoms' },
  sneakers: { name: 'White sneakers', category: 'Shoes' },
  sunglasses: { name: 'Black sunglasses', category: 'Accessories' },
  cap: { name: 'Weekend cap', category: 'Accessories' },
};
const looks = [
  { title: 'The everyday favorite', mood: 'An easy, familiar look that feels put together.', top: 'tee', accessory: 'sunglasses', colors: ['#333330', '#648199', '#f4f0e8'] },
  { title: 'Off-duty essentials', mood: 'Made for a coffee run or a long walk on your kind of day.', top: 'tee', accessory: 'cap', colors: ['#333330', '#648199', '#f4f0e8'] },
  { title: 'A slower Sunday', mood: 'A few favorite pieces come together in one easy outfit.', top: 'starter-Jackets-1', accessory: 'cap', colors: ['#333330', '#648199', '#30302f'] },
];
const sampleColors = { sweatshirt: 'brown', tee: 'black', jeans: 'blue', sneakers: 'white', sunglasses: 'black', cap: 'black' };
const swatchColors = { black: '#333330', white: '#f4f0e8', yellow: '#dfbc52', blue: '#648199', brown: '#8d8173', red: '#b34341', gray: '#999b9d' };
const starterSlots = { Hats: 'accessory', Jackets: 'top', Shirts: 'top', Pants: 'bottom', Shoes: 'shoes', Accessories: 'accessory' };
const excludedPreviewPieces = new Set(['BUCKET HAT', 'RING', 'FEAR OF GOD', 'BASIC T', 'JEANS', 'AF1', 'SUNGLASSES', 'YANKEES CAP']);
const excludedSamplePieces = new Set(['sweatshirt']);
const previewStarterPieces = Object.entries(defaultClothingItems).flatMap(([category, items]) => items
  .map((item, index) => ({ id: `starter-${category}-${index}`, name: item.name, category, color: item.color, image: item.image, slot: starterSlots[category] }))
  .filter((item) => !excludedPreviewPieces.has(item.name)));
const previewBank = [
  ...Object.entries(pieces).filter(([id]) => !excludedSamplePieces.has(id)).map(([id, piece]) => ({ id, ...piece, color: sampleColors[id], image: `/images/${id}.webp`, slot: { tee: 'top', jeans: 'bottom', sneakers: 'shoes', sunglasses: 'accessory', cap: 'accessory' }[id] })),
  ...previewStarterPieces,
];
const previewPieces = Object.fromEntries(previewBank.map((piece) => [piece.id, piece]));
const starterIds = Object.fromEntries(Object.keys(defaultClothingItems).map((category) => [category,
  previewStarterPieces.filter((item) => item.category === category).map((item) => item.id),
]));
const alternate = (first, second) => Array.from({ length: Math.max(first.length, second.length) }, (_, index) => [first[index], second[index]].filter(Boolean)).flat();
const tops = alternate(starterIds.Shirts, starterIds.Jackets);
const extras = alternate(starterIds.Accessories, starterIds.Hats);
// A shirt or jacket fills the same top slot; generated looks never include both.
const generatedOutfits = Array.from({ length: Math.max(tops.length, starterIds.Pants.length, starterIds.Shoes.length, extras.length) }, (_, index) => ({
  top: tops[index % tops.length],
  bottom: starterIds.Pants[index % starterIds.Pants.length],
  shoes: starterIds.Shoes[index % starterIds.Shoes.length],
  accessory: extras[index % extras.length],
}));
const previewLooks = [
  { ...looks[0], outfit: { top: looks[0].top, bottom: 'jeans', shoes: 'sneakers', accessory: looks[0].accessory } },
  ...generatedOutfits.map((outfit, index) => ({ ...looks[(index + 1) % looks.length], outfit })),
  ...looks.slice(1).map((look) => ({ ...look, outfit: { top: look.top, bottom: 'jeans', shoes: 'sneakers', accessory: look.accessory } })),
];

function PieceImage({ piece, className = '', decorative = false }) {
  return <img className={className} src={`/images/${piece}.webp`} alt={decorative ? '' : pieces[piece].name} draggable="false" />;
}

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
  const colors = customLook || (lookIndex > 0 && lookIndex <= generatedOutfits.length)
    ? [...new Set(Object.values(outfit).map((id) => previewPieces[id].color))].slice(0, 3).map((color) => swatchColors[color] || color)
    : look.colors;
  const toggleSaved = () => setSavedLooks((current) => current.includes(signature) ? current.filter((item) => item !== signature) : [...current, signature]);
  const shuffle = () => { setLookIndex((current) => (current + 1) % previewLooks.length); setChosenPieces({}); };
  const choosePiece = (piece) => setChosenPieces((current) => ({ ...current, [piece.slot]: piece.id }));
  return (
    <div className="outfit-preview" id="try-an-outfit">
      <div className="outfit-preview__note">a little outfit inspiration <span aria-hidden="true">↘</span></div>
      <div className="outfit-preview__paper">
        <span className="outfit-preview__tape" aria-hidden="true" />
        <div className="outfit-preview__header"><span><Icon name="hanger" size={19} /> The outfit studio</span><span className="sample-label">Interactive preview</span></div>
        <div className="outfit-preview__workspace">
          <aside className="preview-closet" aria-label="Sample wardrobe">
            <span className="preview-closet__label">Your pieces</span>
            <div className="preview-closet__bank">
              {previewBank.map((piece) => <button type="button" className={`preview-closet__item ${outfit[piece.slot] === piece.id ? 'is-selected' : ''}`} key={piece.id} title={piece.name} aria-label={`Try ${piece.name} in this outfit`} aria-pressed={outfit[piece.slot] === piece.id} onClick={() => choosePiece(piece)}><PreviewImage piece={piece.id} decorative /><span>{piece.name}</span></button>)}
            </div>
            <span className="preview-closet__count">{previewBank.length} pieces · scroll</span>
          </aside>
          <div className="preview-board">
            <div className="preview-board__heading"><span>LET’S GET DRESSED</span><span>{String(lookIndex + 1).padStart(2, '0')} / {String(previewLooks.length).padStart(2, '0')}</span></div>
            <div className="preview-board__clothes" key={signature}>
              <PreviewImage key={outfit.top} piece={outfit.top} className={`preview-garment preview-garment--top ${outfit.top === 'tee' ? 'preview-garment--tee' : ''}`} />
              <PreviewImage key={outfit.bottom} piece={outfit.bottom} className="preview-garment preview-garment--bottom" />
              <PreviewImage key={outfit.shoes} piece={outfit.shoes} className="preview-garment preview-garment--shoes" />
              <PreviewImage key={outfit.accessory} piece={outfit.accessory} className={`preview-garment preview-garment--accessory ${outfit.accessory === 'cap' ? 'preview-garment--cap' : ''}`} />
              <span className="preview-board__scribble">better together</span>
            </div>
            <div className="preview-board__caption">
              <div aria-live="polite" aria-atomic="true"><h3>{customLook ? 'Your own mix' : look.title}</h3><p>{customLook ? 'Put together with a piece from the wardrobe.' : look.mood}</p></div>
              <div className="preview-swatches" aria-hidden="true">{colors.map((color) => <span key={color} style={{ background: color }} />)}</div>
            </div>
          </div>
        </div>
        <div className="outfit-preview__controls">
          <button className="preview-shuffle" onClick={shuffle}><Icon name="rotate" size={17} /> Try another outfit</button>
          <button className={`preview-save ${saved ? 'is-saved' : ''}`} onClick={toggleSaved} aria-pressed={saved}><Icon name="heart" size={17} /><span>{saved ? 'Saved in preview' : 'Save this look'}</span></button>
        </div>
      </div>
      <div className="preview-footnote"><Icon name="check" size={14} /><span>Explore the sample clothes above to see how they work together.</span></div>
    </div>
  );
}

export default function LandingPage() {
  const [signedIn, setSignedIn] = useState(false);
  useEffect(() => {
    const controller = new AbortController();
    apiFetch('/api/auth/status', { signal: controller.signal }).then((response) => setSignedIn(response.ok)).catch(() => {});
    return () => controller.abort();
  }, []);
  const wardrobeLink = signedIn ? '/clothes' : '/signup';
  return (
    <div className="landing">
      <a className="landing__skip" href="#main-content">Skip to content</a>
      <header className="landing__nav">
        <Link to="/" aria-label="Malabis home"><Brand /></Link>
        <nav className="landing__section-nav" aria-label="Explore Malabis"><a href="#how-it-works">How it works</a><a href="#your-wardrobe">Made for your clothes</a></nav>
        <div className="landing__nav-actions"><Link to={signedIn ? '/clothes' : '/login'}>{signedIn ? 'My wardrobe' : 'Log in'}</Link><Link className="button button--rose" to={wardrobeLink}>{signedIn ? 'Open wardrobe' : 'Start a new wardrobe'}<Icon name="arrow" size={16} /></Link></div>
      </header>
      <main id="main-content">
        <section className="landing__hero" aria-labelledby="hero-title">
          <div className="landing__intro">
            <p className="landing__eyebrow"><span /> YOUR DIGITAL WARDROBE</p>
            <h1 id="hero-title">Get dressed<br />in ways that<br /><em>feel like you.</em></h1>
            <p className="landing__lede">Turn the clothes you own into outfits you love by organizing your wardrobe, trying new combinations, and finding your next look in one place.</p>
            <div className="landing__cta-row"><Link className="button button--rose" to={wardrobeLink}>{signedIn ? 'Open my wardrobe' : 'Build my wardrobe'}<Icon name="arrow" size={18} /></Link><a className="landing__demo-link" href="#try-an-outfit">Try an outfit <span aria-hidden="true">↗</span></a></div>
            <p className="landing__hero-note">A little more possibility every time you open your closet.</p>
            <div className="landing__benefits"><span><Icon name="hanger" size={18} /> Your own clothes</span><span><Icon name="sparkle" size={18} /> New combinations</span><span><Icon name="heart" size={18} /> Favorite looks</span></div>
          </div>
          <div className="landing__visual"><DoodleStar className="landing__star" /><OutfitPreview /><span className="landing__visual-label">A NEW VIEW OF YOUR EVERYDAY CLOSET</span></div>
        </section>
        <section className="landing__how" id="how-it-works" aria-labelledby="how-title">
          <div className="landing__section-heading"><div><p className="landing__eyebrow">A LITTLE LESS GUESSWORK</p><h2 id="how-title">How your clothes become your next outfit</h2></div><span className="landing__hand-note">as easy as one, two, three</span></div>
          <div className="landing__steps">
            <article><div className="landing__step-top"><span>01</span><Icon name="image" size={25} /></div><h3>A place for every piece you own</h3><p>Upload photos of your clothes, organize them by type and color, and see everything you have in one place.</p><span className="landing__step-label">Sorted by type and color</span></article>
            <article><div className="landing__step-top"><span>02</span><Icon name="sparkle" size={25} /></div><h3>New outfits from familiar pieces</h3><p>Build an outfit yourself or generate a new combination around a favorite piece from your wardrobe.</p><span className="landing__step-label">Your clothes, new possibilities</span></article>
            <article><div className="landing__step-top"><span>03</span><Icon name="heart" size={25} /></div><h3>A lookbook for your favorite outfits</h3><p>Keep your favorite outfits in your own lookbook, ready for the next time you wonder what to wear.</p><span className="landing__step-label">Good outfits, remembered</span></article>
          </div>
        </section>
        <section className="landing__wardrobe" id="your-wardrobe" aria-labelledby="wardrobe-title">
          <div className="wardrobe-collection" aria-label="A sample digital wardrobe">
            <div className="wardrobe-collection__heading"><span><Icon name="hanger" size={20} /> A few closet favorites</span><span>THE EVERYDAY EDIT</span></div>
            <div className="wardrobe-collection__grid">{['sweatshirt', 'jeans', 'sneakers'].map((piece, index) => <div className="wardrobe-piece" key={piece}><div><span className="wardrobe-piece__number">0{index + 1}</span><PieceImage piece={piece} /><Icon name="heart" size={15} /></div><p>{pieces[piece].name}</p><span>{pieces[piece].category}</span></div>)}</div>
            <p className="wardrobe-collection__note">A few familiar pieces can become so many different outfits.</p>
          </div>
          <div className="landing__wardrobe-copy"><p className="landing__eyebrow">NEW IDEAS FOR THE CLOTHES YOU OWN</p><h2 id="wardrobe-title">There’s more in your<br />wardrobe than you think.</h2><p>Bring the tee you always reach for and the jeans you forgot about into the same space, then see how well they work together.</p><Link to={wardrobeLink} className="landing__text-link">Make room for your wardrobe <Icon name="arrow" size={18} /></Link></div>
        </section>
        <section className="landing__closing"><DoodleStar /><p className="landing__eyebrow">YOUR NEXT LOOK IS ALREADY IN YOUR CLOSET</p><h2>See what your wardrobe can do</h2><p>Start with a few pieces and discover new ways to wear what you already have.</p><Link className="button button--rose" to={wardrobeLink}>{signedIn ? 'Open my wardrobe' : 'Create my digital wardrobe'}<Icon name="arrow" size={17} /></Link></section>
      </main>
      <footer className="landing__footer"><div><Brand /><span>More ways to wear what you own.</span></div><nav aria-label="Legal"><Link to="/terms">Terms</Link><Link to="/privacy">Privacy</Link><Link to="/cookies">Cookies</Link><Link to="/cookie-settings">Cookie settings</Link></nav><span className="landing__copyright">© {new Date().getFullYear()} Malabis</span></footer>
    </div>
  );
}
