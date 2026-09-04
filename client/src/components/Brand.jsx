import React from 'react';

export default function Brand({ compact = false, light = false }) {
  return (
    <span className={`brand ${compact ? 'brand--compact' : ''} ${light ? 'brand--light' : ''}`} aria-label="Malabis">
      <svg className="brand__mark" viewBox="0 0 40 40" aria-hidden="true">
        <path d="M8 29.5V12.4c0-2.3 2.6-3.7 4.5-2.3l7.5 5.5 7.5-5.5c1.9-1.4 4.5 0 4.5 2.3v17.1"/>
        <path d="M8 26c5.6 1.9 9.6.7 12-4.7 2.4 5.4 6.4 6.6 12 4.7"/>
        <circle cx="20" cy="8" r="1.5" fill="currentColor" stroke="none"/>
      </svg>
      {!compact && <span className="brand__word">malabis</span>}
    </span>
  );
}
