import React, { useEffect } from 'react';
import { Icon } from './Icons';

export function Modal({ open, onClose, title, eyebrow, children, className = '' }) {
  useEffect(() => {
    if (!open) return undefined;
    const onKey = (event) => event.key === 'Escape' && onClose();
    document.addEventListener('keydown', onKey);
    document.body.classList.add('modal-open');
    return () => {
      document.removeEventListener('keydown', onKey);
      document.body.classList.remove('modal-open');
    };
  }, [open, onClose]);

  if (!open) return null;
  return (
    <div className="modal-backdrop" role="presentation" onMouseDown={onClose}>
      <section className={`modal-sheet ${className}`} role="dialog" aria-modal="true" aria-labelledby="modal-title" onMouseDown={(event) => event.stopPropagation()}>
        <header className="modal-sheet__header">
          <div>
            {eyebrow && <p className="eyebrow">{eyebrow}</p>}
            <h2 id="modal-title">{title}</h2>
          </div>
          <button className="icon-button" type="button" onClick={onClose} aria-label="Close dialog"><Icon name="close" /></button>
        </header>
        {children}
      </section>
    </div>
  );
}

export function ConfirmDialog({ open, onClose, onConfirm, noun = 'item', count = 1, pending = false }) {
  const subject = count === 1 ? `this ${noun}` : `these ${count} ${noun}s`;
  return (
    <Modal open={open} onClose={() => { if (!pending) onClose(); }} eyebrow="Are you sure you want to" title={`Remove ${subject}?`} className="confirm-sheet">
      <div className="confirm-sheet__body">
        <p>Removing {subject} from your Malabis collection cannot be undone.</p>
        <div className="button-row">
          <button className="button button--quiet" type="button" onClick={onClose} disabled={pending}>{count === 1 ? 'Keep it' : 'Keep them'}</button>
          <button className="button button--danger" type="button" onClick={onConfirm} disabled={pending}>{pending ? 'Removing…' : count === 1 ? 'Remove' : `Remove ${count} ${noun}s`}</button>
        </div>
      </div>
    </Modal>
  );
}

export function Toast({ message, type = 'success', show }) {
  if (!show) return null;
  return <div className={`toast toast--${type}`} role="status"><Icon name={type === 'success' ? 'check' : 'close'} size={17}/>{message}</div>;
}

export function EmptyState({ title, copy, action, actionLabel }) {
  return (
    <div className="empty-state">
      <span className="empty-state__hanger"><Icon name="hanger" size={34}/></span>
      <h2>{title}</h2>
      <p>{copy}</p>
      {action && <button type="button" className="text-link" onClick={action}>{actionLabel}<Icon name="arrow" size={16}/></button>}
    </div>
  );
}
