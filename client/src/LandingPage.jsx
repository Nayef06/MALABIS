import React, { useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { apiFetch } from './api';
import Brand from './components/Brand';
import { DoodleStar, Icon } from './components/Icons';
import './LandingPage.css';

const WardrobeScene = () => (
  <div className="wardrobe-scene" aria-label="An illustrated open wardrobe with a favorite outfit">
    <span className="tape tape--one" /><span className="tape tape--two" />
    <svg className="wardrobe-scene__drawing" viewBox="0 0 700 680" role="img">
      <path className="scene-rug" d="M98 586c78-49 390-55 489 2 76 44-21 83-231 83-197 0-330-40-258-85Z"/>
      <path className="scene-wood" d="M115 92h470v510H115z"/><path className="scene-inside" d="M153 128h394v432H153z"/>
      <path className="scene-line" d="M350 129v431M153 220h394M177 197h151M372 197h151"/><path className="scene-line scene-line--thin" d="M170 579h360M210 602v-42M490 602v-42"/>
      <g className="hanging hanging--shirt">
        <path className="hanger-line" d="m200 190 39-25 39 25M239 165c-11-6-3-21 7-18 6 2 7 8 4 12"/>
        <path className="garment-fill garment-fill--rose" d="m198 197 25-15c5 9 27 9 32 0l25 15-13 31-12-5v111h-64V223l-12 5-13-31 32-15"/><path className="garment-stitch" d="M214 314c15 5 27 5 42 0"/>
      </g>
      <g className="hanging hanging--jacket">
        <path className="hanger-line" d="m390 190 39-25 39 25M429 165c-11-6-3-21 7-18 6 2 7 8 4 12"/>
        <path className="garment-fill garment-fill--blue" d="m385 196 28-14 16 16 16-16 28 14 17 57-23 8-8-24v111h-60V237l-8 24-23-8 17-57"/><path className="garment-stitch" d="m429 198 0 150M404 315l25-8 25 8"/>
      </g>
      <g className="folded-stack"><path className="garment-fill garment-fill--butter" d="M185 405c35-9 78-8 111 1l-5 34H190l-5-35Z"/><path className="garment-fill garment-fill--pistachio" d="M192 444h96l6 35h-108l6-35Z"/><path className="garment-fill garment-fill--lavender" d="M181 482h118l-3 41H184l-3-41Z"/></g>
      <g className="shoe-pair"><path className="garment-fill garment-fill--cream" d="M391 474c18 4 30-6 34-27l26 17c15 10 35 12 44 20 7 6 6 19-3 24H391c-13 0-14-21 0-34Z"/><path className="garment-stitch" d="M393 493h98M436 463l-13 25"/><path className="garment-fill garment-fill--cream" d="M385 517c19 4 30-5 34-24l22 14c17 11 39 12 48 20 7 6 6 18-3 23H385c-13 0-14-20 0-33Z"/></g>
      <circle className="scene-knob" cx="339" cy="388" r="5"/><circle className="scene-knob" cx="361" cy="388" r="5"/>
    </svg>
    <p className="wardrobe-scene__note">today’s little possibility <span>↗</span></p><div className="wardrobe-scene__label">look no. 01</div>
  </div>
);

export default function LandingPage() {
  const navigate = useNavigate();
  useEffect(() => { apiFetch('/api/auth/status').then((response) => response.ok && navigate('/clothes')).catch(() => {}); }, [navigate]);
  return (
    <div className="landing">
      <header className="landing__nav"><Brand /><div className="landing__nav-actions"><Link to="/login">Log in</Link><Link className="button button--rose" to="/signup">Begin your closet</Link></div></header>
      <main className="landing__main">
        <section className="landing__intro">
          <p className="eyebrow">Your wardrobe, somewhere lovely</p>
          <h1>A quiet little world<br/>for the clothes you <em>love.</em></h1>
          <p className="landing__lede">Keep every piece close, play with new combinations, and make getting dressed feel like you again.</p>
          <div className="landing__cta-row"><Link className="button button--rose" to="/signup">Open your wardrobe <Icon name="arrow" size={17}/></Link><span className="hand-note">free to make it yours</span></div>
          <div className="landing__keepsakes"><span><Icon name="hanger" size={17}/> collect</span><span><Icon name="sparkle" size={17}/> compose</span><span><Icon name="heart" size={17}/> remember</span></div>
        </section>
        <section className="landing__visual"><DoodleStar className="landing__star"/><WardrobeScene /></section>
      </main>
      <footer className="landing__footer"><span>malabis / my clothes, my room, my little fashion world</span><span>est. for slow mornings</span></footer>
    </div>
  );
}
