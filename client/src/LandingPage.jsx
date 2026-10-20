import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { apiFetch } from './api';
import Brand from './components/Brand';
import { DoodleStar, Icon } from './components/Icons';
import './LandingPage.css';

const pieces = {
  sweatshirt: { name: 'Everyday taupe tee', category: 'Tops' },
  tee: { name: 'The classic black tee', category: 'Tops' },
  jeans: { name: 'Favorite blue jeans', category: 'Bottoms' },
  sneakers: { name: 'White sneakers', category: 'Shoes' },
  sunglasses: { name: 'Black sunglasses', category: 'Accessories' },
  cap: { name: 'Weekend cap', category: 'Accessories' },
};
const looks = [
  { title: 'The everyday favorite', mood: 'Easy, familiar, a little put-together.', top: 'sweatshirt', accessory: 'sunglasses', colors: ['#8d8173', '#648199', '#f4f0e8'] },
  { title: 'Off-duty essentials', mood: 'A coffee run. A long walk. Your kind of day.', top: 'tee', accessory: 'cap', colors: ['#333330', '#648199', '#f4f0e8'] },
  { title: 'A slower Sunday', mood: 'A few favorite pieces. One easy outfit.', top: 'sweatshirt', accessory: 'cap', colors: ['#8d8173', '#648199', '#30302f'] },
];

function PieceImage({ piece, className = '', decorative = false }) {
  return <img className={className} src={`/images/${piece}.webp`} alt={decorative ? '' : pieces[piece].name} draggable="false" />;
}

function OutfitPreview() {
  const [lookIndex, setLookIndex] = useState(0);
  const [savedLooks, setSavedLooks] = useState([]);
  const look = looks[lookIndex];
  const saved = savedLooks.includes(lookIndex);
  const toggleSaved = () => setSavedLooks((current) => saved ? current.filter((item) => item !== lookIndex) : [...current, lookIndex]);
  return (
    <div className="outfit-preview" id="try-an-outfit">
      <div className="outfit-preview__note">a little outfit inspiration <span aria-hidden="true">↘</span></div>
      <div className="outfit-preview__paper">
        <span className="outfit-preview__tape" aria-hidden="true" />
        <div className="outfit-preview__header"><span><Icon name="hanger" size={19} /> The outfit studio</span><span className="sample-label">Interactive preview</span></div>
        <div className="outfit-preview__workspace">
          <aside className="preview-closet" aria-label="Sample wardrobe">
            <span className="preview-closet__label">Your pieces</span>
            {['sweatshirt', 'tee', 'jeans', 'sneakers'].map((piece) => <div className={`preview-closet__item ${look.top === piece ? 'is-selected' : ''}`} key={piece}><PieceImage piece={piece} decorative /><span>{pieces[piece].category}</span></div>)}
            <span className="preview-closet__count">6 sample pieces</span>
          </aside>
          <div className="preview-board">
            <div className="preview-board__heading"><span>LET’S GET DRESSED</span><span>0{lookIndex + 1} / 03</span></div>
            <div className="preview-board__clothes" key={lookIndex}>
              <PieceImage piece={look.top} className={`preview-garment preview-garment--top preview-garment--${look.top}`} />
              <PieceImage piece="jeans" className="preview-garment preview-garment--bottom" />
              <PieceImage piece="sneakers" className="preview-garment preview-garment--shoes" />
              <PieceImage piece={look.accessory} className={`preview-garment preview-garment--accessory preview-garment--${look.accessory}`} />
              <span className="preview-board__scribble">better together</span>
            </div>
            <div className="preview-board__caption">
              <div aria-live="polite" aria-atomic="true"><h3>{look.title}</h3><p>{look.mood}</p></div>
              <div className="preview-swatches" aria-hidden="true">{look.colors.map((color) => <span key={color} style={{ background: color }} />)}</div>
            </div>
          </div>
        </div>
        <div className="outfit-preview__controls">
          <button className="preview-shuffle" onClick={() => setLookIndex((current) => (current + 1) % looks.length)}><Icon name="rotate" size={17} /> Try another outfit</button>
          <button className={`preview-save ${saved ? 'is-saved' : ''}`} onClick={toggleSaved} aria-pressed={saved}><Icon name="heart" size={17} /><span>{saved ? 'Saved in preview' : 'Save this look'}</span></button>
        </div>
      </div>
      <div className="preview-footnote"><Icon name="check" size={14} /><span>Sample clothes, real possibilities. Try it above.</span></div>
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
        <div className="landing__nav-actions"><Link to={signedIn ? '/clothes' : '/login'}>{signedIn ? 'My wardrobe' : 'Log in'}</Link><Link className="button button--rose" to={wardrobeLink}>{signedIn ? 'Open wardrobe' : 'Start your wardrobe'}<Icon name="arrow" size={16} /></Link></div>
      </header>
      <main id="main-content">
        <section className="landing__hero" aria-labelledby="hero-title">
          <div className="landing__intro">
            <p className="landing__eyebrow"><span /> YOUR DIGITAL WARDROBE</p>
            <h1 id="hero-title">Your clothes.<br />A fresh way<br />to <em>get dressed.</em></h1>
            <p className="landing__lede">Turn the clothes you own into outfits you love. Organize your wardrobe, try new combinations, and find your next look — all in one place.</p>
            <div className="landing__cta-row"><Link className="button button--rose" to={wardrobeLink}>{signedIn ? 'Open my wardrobe' : 'Build my wardrobe'}<Icon name="arrow" size={18} /></Link><a className="landing__demo-link" href="#try-an-outfit">Try an outfit <span aria-hidden="true">↗</span></a></div>
            <p className="landing__hero-note">Less “nothing to wear.” More you.</p>
            <div className="landing__benefits"><span><Icon name="hanger" size={18} /> Your own clothes</span><span><Icon name="sparkle" size={18} /> New combinations</span><span><Icon name="heart" size={18} /> Favorite looks</span></div>
          </div>
          <div className="landing__visual"><DoodleStar className="landing__star" /><OutfitPreview /><span className="landing__visual-label">YOUR CLOSET, REIMAGINED.</span></div>
        </section>
        <section className="landing__how" id="how-it-works" aria-labelledby="how-title">
          <div className="landing__section-heading"><div><p className="landing__eyebrow">A LITTLE LESS GUESSWORK</p><h2 id="how-title">From your closet to your next outfit.</h2></div><span className="landing__hand-note">as easy as one, two, three</span></div>
          <div className="landing__steps">
            <article><div className="landing__step-top"><span>01</span><Icon name="image" size={25} /></div><h3>Bring your wardrobe in.</h3><p>Upload photos of your clothes and organize them by type and color. See what you have, all together.</p><span className="landing__step-label">A home for every piece</span></article>
            <article><div className="landing__step-top"><span>02</span><Icon name="sparkle" size={25} /></div><h3>Find a combination you love.</h3><p>Build a look yourself or generate an outfit from your wardrobe. Keep a favorite piece and try something new around it.</p><span className="landing__step-label">Your clothes, new possibilities</span></article>
            <article><div className="landing__step-top"><span>03</span><Icon name="heart" size={25} /></div><h3>Save it. Wear it. Repeat.</h3><p>Keep your favorite outfits in your own lookbook, ready for the next time you wonder what to wear.</p><span className="landing__step-label">Good outfits, remembered</span></article>
          </div>
        </section>
        <section className="landing__wardrobe" id="your-wardrobe" aria-labelledby="wardrobe-title">
          <div className="wardrobe-collection" aria-label="A sample digital wardrobe">
            <div className="wardrobe-collection__heading"><span><Icon name="hanger" size={20} /> A few closet favorites</span><span>THE EVERYDAY EDIT</span></div>
            <div className="wardrobe-collection__grid">{['sweatshirt', 'jeans', 'sneakers'].map((piece, index) => <div className="wardrobe-piece" key={piece}><div><span className="wardrobe-piece__number">0{index + 1}</span><PieceImage piece={piece} /><Icon name="heart" size={15} /></div><p>{pieces[piece].name}</p><span>{pieces[piece].category}</span></div>)}</div>
            <p className="wardrobe-collection__note">The start of so many good outfits.</p>
          </div>
          <div className="landing__wardrobe-copy"><p className="landing__eyebrow">ALREADY YOURS. NEWLY INSPIRED.</p><h2 id="wardrobe-title">There’s more in your<br />wardrobe than you think.</h2><p>That tee you always reach for. Those jeans you forgot about. Bring them into the same space and see your clothes in a new light.</p><Link to={wardrobeLink} className="landing__text-link">Make room for your wardrobe <Icon name="arrow" size={18} /></Link></div>
        </section>
        <section className="landing__closing"><DoodleStar /><p className="landing__eyebrow">YOUR NEXT LOOK IS ALREADY IN YOUR CLOSET</p><h2>Let’s put it together.</h2><p>Start with a few pieces. Find a whole new way to wear them.</p><Link className="button button--rose" to={wardrobeLink}>{signedIn ? 'Open my wardrobe' : 'Create my digital wardrobe'}<Icon name="arrow" size={17} /></Link></section>
      </main>
      <footer className="landing__footer"><div><Brand /><span>Your clothes. Your combinations. Your style.</span></div><nav aria-label="Legal"><Link to="/terms">Terms</Link><Link to="/privacy">Privacy</Link><Link to="/cookies">Cookies</Link><Link to="/cookie-settings">Cookie settings</Link></nav><span className="landing__copyright">© {new Date().getFullYear()} Malabis</span></footer>
    </div>
  );
}
