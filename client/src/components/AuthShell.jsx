import React from 'react';
import { Link } from 'react-router-dom';
import Brand from './Brand';
import { Icon } from './Icons';

export default function AuthShell({ eyebrow, title, note, children }) {
  return (
    <main className="auth-page">
      <Link to="/" className="auth-page__brand"><Brand /></Link>
      <section className="auth-room" aria-hidden="true">
        <p className="auth-room__note">a closet is a diary<br/>you get to wear</p>
        <div className="auth-mirror"><span><Icon name="sparkle" size={30}/></span></div>
        <div className="auth-chair"><i/><b/></div>
        <div className="auth-dress"><span/><i/></div>
        <div className="auth-rug" />
      </section>
      <section className="auth-paper">
        <div className="auth-paper__pin" />
        <p className="eyebrow">{eyebrow}</p>
        <h1>{title}</h1>
        <p className="auth-paper__note">{note}</p>
        {children}
      </section>
    </main>
  );
}
