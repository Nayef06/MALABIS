import React from 'react';

const base = {
  fill: 'none',
  stroke: 'currentColor',
  strokeWidth: 1.7,
  strokeLinecap: 'round',
  strokeLinejoin: 'round',
};

export const Icon = ({ name, size = 20, className = '' }) => {
  const paths = {
    hanger: <><path d="M5 10.5 12 6l7 4.5"/><path d="M12 6c-1.8-1.1-.5-3.3 1-3.3 1.2 0 1.8.7 1.8 1.6"/><path d="M4 11.3h16"/></>,
    sparkle: <><path d="M12 2c.5 5 2.5 7 7 7-4.5.1-6.5 2.2-7 7-.5-4.8-2.5-6.9-7-7 4.5 0 6.5-2 7-7Z"/><path d="M19 16.5c.2 1.7.9 2.4 2.5 2.5-1.6.1-2.3.8-2.5 2.5-.2-1.7-.9-2.4-2.5-2.5 1.6-.1 2.3-.8 2.5-2.5Z"/></>,
    heart: <path d="M20.8 5.8c-1.8-3-6.2-2.6-8.8.8-2.6-3.4-7-3.8-8.8-.8C.6 10.3 6.5 15.4 12 20c5.5-4.6 11.4-9.7 8.8-14.2Z"/>,
    plus: <><path d="M12 5v14M5 12h14"/></>,
    user: <><circle cx="12" cy="8" r="3.5"/><path d="M5.5 20c.4-4 2.6-6 6.5-6s6.1 2 6.5 6"/></>,
    shirt: <path d="m8 4-5 3 2 4 2-1v10h10V10l2 1 2-4-5-3c-.6 1.3-1.8 2-4 2S8.6 5.3 8 4Z"/>,
    pants: <path d="M7 3h10l1 17h-5l-1-10-1 10H6L7 3Z"/>,
    shoes: <path d="M3 14c3.4.3 5-1.3 5.5-5l3 2c1.6 1.1 3 2 5.5 2.5 2.1.5 3 1.4 3 3.5H4c-1.4 0-2-.9-1-3Z"/>,
    jacket: <><path d="m8 4-4 3 2 5 2-1v9h8v-9l2 1 2-5-4-3-4 3-4-3Z"/><path d="M12 7v13"/></>,
    hat: <><path d="M7 13c0-4 1.5-7 5-7s5 3 5 7"/><path d="M4 14c4 1.5 12 1.5 16 0"/></>,
    accessory: <><circle cx="12" cy="12" r="6"/><circle cx="12" cy="12" r="2"/><path d="m12 6 2-3h-4l2 3Z"/></>,
    trash: <><path d="M4 7h16M9 3h6l1 4H8l1-4ZM7 7l1 14h8l1-14M10 11v6M14 11v6"/></>,
    close: <><path d="m6 6 12 12M18 6 6 18"/></>,
    lock: <><rect x="5" y="10" width="14" height="11" rx="2"/><path d="M8 10V7a4 4 0 0 1 8 0v3"/></>,
    unlock: <><rect x="5" y="10" width="14" height="11" rx="2"/><path d="M8 10V7a4 4 0 0 1 7.5-2"/></>,
    save: <><path d="M5 3h11l3 3v15H5V3Z"/><path d="M8 3v6h7V3M8 21v-7h8v7"/></>,
    edit: <><path d="m14 5 5 5L9 20H4v-5L14 5Z"/><path d="m12 7 5 5"/></>,
    arrow: <><path d="M5 12h14M14 7l5 5-5 5"/></>,
    rotate: <><path d="M19 8V3l-2 2a8 8 0 1 0 2 8"/></>,
    layers: <><path d="m12 3 9 5-9 5-9-5 9-5Z"/><path d="m3 12 9 5 9-5M3 16l9 5 9-5"/></>,
    minus: <path d="M5 12h14"/>,
    menu: <><path d="M4 7h16M4 12h16M4 17h16"/></>,
    check: <path d="m5 12 4 4L19 6"/>,
    logout: <><path d="M10 4H4v16h6M14 8l4 4-4 4M8 12h10"/></>,
    image: <><rect x="3" y="4" width="18" height="16" rx="2"/><circle cx="9" cy="9" r="2"/><path d="m4 17 5-5 4 4 2-2 5 4"/></>,
  };

  return (
    <svg className={className} width={size} height={size} viewBox="0 0 24 24" aria-hidden="true" {...base}>
      {paths[name] || paths.sparkle}
    </svg>
  );
};

export const DoodleStar = ({ className = '' }) => (
  <svg className={className} viewBox="0 0 50 50" aria-hidden="true">
    <path d="m25 3 4.4 16.3L46 24l-16.6 4.7L25 47l-4.4-18.3L4 24l16.6-4.7L25 3Z" fill="none" stroke="currentColor" strokeWidth="1.5"/>
  </svg>
);
