import React from 'react';
import './LoadingSkeletons.css';

export function Skeleton({ className = '' }) {
  return <span className={`skeleton ${className}`} aria-hidden="true" />;
}

export function LandingSkeleton() {
  return <div className="landing landing-skeleton" role="status" aria-label="Loading home page">
    <div className="landing__nav"><Skeleton className="skeleton-brand"/><div className="skeleton-inline"><Skeleton className="skeleton-nav-link"/><Skeleton className="skeleton-nav-link"/></div><div className="skeleton-inline"><Skeleton className="skeleton-nav-link"/><Skeleton className="skeleton-button"/></div></div>
    <div className="landing__hero"><div className="skeleton-stack"><Skeleton className="skeleton-eyebrow"/><Skeleton className="skeleton-hero-line"/><Skeleton className="skeleton-hero-line"/><Skeleton className="skeleton-hero-line skeleton-hero-line--short"/><Skeleton className="skeleton-copy"/><Skeleton className="skeleton-copy skeleton-copy--short"/><div className="skeleton-inline"><Skeleton className="skeleton-button"/><Skeleton className="skeleton-nav-link"/></div></div><div className="skeleton-landing-preview"><Skeleton className="skeleton-preview-header"/><div className="skeleton-preview-body"><div className="skeleton-preview-rail">{Array.from({ length: 4 }, (_, index) => <Skeleton key={index} className="skeleton-preview-item"/>)}</div><Skeleton className="skeleton-preview-canvas"/></div><Skeleton className="skeleton-preview-footer"/></div></div>
  </div>;
}

export function DashboardSkeleton() {
  return <div className="page welcome-page" role="status" aria-label="Loading dashboard"><section className="welcome-note"><Skeleton className="skeleton-eyebrow"/><Skeleton className="skeleton-welcome-title"/><Skeleton className="skeleton-copy"/><Skeleton className="skeleton-copy skeleton-copy--short"/><div className="button-row"><Skeleton className="skeleton-button"/><Skeleton className="skeleton-button"/></div><span className="welcome-note__tape"/></section></div>;
}

export function AccountSkeleton() {
  return <div className="account-layout" role="status" aria-label="Loading account details"><aside className="account-portrait"><Skeleton className="skeleton-portrait"/><Skeleton className="skeleton-account-name"/><Skeleton className="skeleton-account-handle"/><span className="account-portrait__tape"/></aside><section className="settings-list"><header><Skeleton className="skeleton-account-label"/><Skeleton className="skeleton-account-detail"/></header>{Array.from({ length: 4 }, (_, index) => <div className="setting-row skeleton-setting-row" key={index}><div className="skeleton-setting-label"><Skeleton className="skeleton-setting-icon"/><div><Skeleton className="skeleton-account-label"/><Skeleton className="skeleton-account-detail"/></div></div><Skeleton className="skeleton-setting-value"/></div>)}</section></div>;
}

function ClosetGarmentSkeleton() {
  return <div className="skeleton-garment"><Skeleton className="skeleton-garment-image"/><Skeleton className="skeleton-garment-name"/><Skeleton className="skeleton-garment-detail"/></div>;
}

export function ClosetSkeleton() {
  return <div className="closet-rails" role="status" aria-label="Loading clothes">{Array.from({ length: 2 }, (_, index) => <section className="closet-rail skeleton-closet-rail" key={index}><header><Skeleton className="skeleton-rail-heading"/><Skeleton className="skeleton-rail-count"/></header><div className="closet-rail__rod"/><div className="closet-rail__items">{Array.from({ length: 4 }, (_, itemIndex) => <ClosetGarmentSkeleton key={itemIndex}/>)}</div></section>)}</div>;
}

function LookSkeleton() {
  return <article className="look skeleton-look"><div className="skeleton-look-header"><Skeleton className="skeleton-look-badge"/><Skeleton className="skeleton-look-actions"/></div><Skeleton className="skeleton-look-canvas"/><div className="skeleton-look-details"><Skeleton className="skeleton-eyebrow"/><Skeleton className="skeleton-look-title"/></div><Skeleton className="skeleton-look-button"/></article>;
}

export function OutfitsSkeleton() {
  return <div className="lookbook-grid" role="status" aria-label="Loading outfits">{Array.from({ length: 3 }, (_, index) => <LookSkeleton key={index}/>)}</div>;
}

export function OutfitCanvasSkeleton() {
  return <div className="skeleton-canvas-wrap" role="status" aria-label="Generating outfit"><Skeleton className="skeleton-canvas-piece skeleton-canvas-piece--top"/><Skeleton className="skeleton-canvas-piece skeleton-canvas-piece--bottom"/><Skeleton className="skeleton-canvas-piece skeleton-canvas-piece--shoes"/></div>;
}

export function OutfitCreatorSkeleton() {
  return <section className="outfit-creator skeleton-creator" role="status" aria-label="Loading outfit preview"><div className="skeleton-look-header"><Skeleton className="skeleton-look-badge"/><Skeleton className="skeleton-rail-count"/></div><Skeleton className="skeleton-look-canvas"/><div className="skeleton-creator-footer"><Skeleton className="skeleton-account-detail"/><Skeleton className="skeleton-look-button"/></div></section>;
}

export function GeneratorSkeleton() {
  return <div className="create-layout" role="status" aria-label="Loading outfit generator"><aside className="recipe-panel skeleton-recipe"><Skeleton className="skeleton-eyebrow"/><Skeleton className="skeleton-recipe-title"/><Skeleton className="skeleton-copy"/><div className="skeleton-recipe-list">{Array.from({ length: 5 }, (_, index) => <div className="skeleton-recipe-row" key={index}><Skeleton className="skeleton-setting-icon"/><div><Skeleton className="skeleton-account-label"/><Skeleton className="skeleton-account-detail"/></div></div>)}</div><Skeleton className="skeleton-look-button"/></aside><OutfitCreatorSkeleton/></div>;
}

export function BuilderSkeleton() {
  return <div className="builder-skeleton" role="status" aria-label="Loading clothes for outfit builder">{Array.from({ length: 9 }, (_, index) => <div className="builder-garment skeleton-builder-garment" key={index}><Skeleton className="skeleton-builder-image"/><Skeleton className="skeleton-builder-label"/></div>)}</div>;
}
