import React from 'react';
import { NavLink } from 'react-router-dom';
import Brand from './Brand';
import { Icon } from './Icons';

const links = [
  { to: '/clothes', label: 'Closet', icon: 'hanger' },
  { to: '/generator', label: 'Create', icon: 'sparkle' },
  { to: '/outfits', label: 'Lookbook', icon: 'heart' },
];

const Navbar = () => (
  <header className="wardrobe-nav">
    <NavLink className="wardrobe-nav__brand" to="/clothes"><Brand /></NavLink>
    <nav className="wardrobe-nav__links" aria-label="Wardrobe navigation">
      {links.map(({ to, label, icon }) => (
        <NavLink key={to} to={to} className={({ isActive }) => `wardrobe-link ${isActive ? 'is-active' : ''}`}>
          <Icon name={icon} size={18}/><span>{label}</span>
        </NavLink>
      ))}
    </nav>
    <NavLink to="/account" className={({ isActive }) => `wardrobe-nav__account ${isActive ? 'is-active' : ''}`} aria-label="Account settings">
      <Icon name="user" size={20}/><span>My corner</span>
    </NavLink>
  </header>
);

export default Navbar;
