import { useEffect, useRef } from 'react';
import { createPortal } from 'react-dom';

/**
 * Accessible modal dialog rendered via portal.
 * Closes on ESC, click on backdrop, or programmatically via `onClose`.
 */
export default function Modal({ open, onClose, title, children, size = 'md', footer }) {
  const dialogRef = useRef(null);

  useEffect(() => {
    if (!open) return undefined;
    const onKey = (e) => { if (e.key === 'Escape') onClose?.(); };
    document.addEventListener('keydown', onKey);
    document.body.style.overflow = 'hidden';
    return () => {
      document.removeEventListener('keydown', onKey);
      document.body.style.overflow = '';
    };
  }, [open, onClose]);

  if (!open) return null;

  const widths = { sm: 420, md: 560, lg: 720, xl: 960 };

  return createPortal(
    <div
      className="modal-backdrop"
      role="presentation"
      onClick={(e) => { if (e.target === e.currentTarget) onClose?.(); }}
      style={{
        position: 'fixed',
        inset: 0,
        background: 'rgba(30, 10, 60, 0.45)',
        backdropFilter: 'blur(6px)',
        WebkitBackdropFilter: 'blur(6px)',
        display: 'grid',
        placeItems: 'center',
        zIndex: 100,
        padding: 16,
        animation: 'fade-in 200ms ease both'
      }}
    >
      <div
        ref={dialogRef}
        role="dialog"
        aria-modal="true"
        aria-label={title}
        className="modal-content"
        style={{
          width: '100%',
          maxWidth: widths[size] || 560,
          padding: 28,
          borderRadius: 'var(--radius-xl)',
          maxHeight: 'calc(100vh - 32px)',
          overflowY: 'auto',
          display: 'flex',
          flexDirection: 'column',
          gap: 18,
          background: '#FFFFFF',
          border: '1.5px solid var(--glass-border)',
          boxShadow: 'var(--shadow-lg)'
        }}
      >
        {title && (
          <div className="row between" style={{ alignItems: 'flex-start' }}>
            <h3 style={{ fontFamily: 'var(--font-display)', fontSize: 20, fontWeight: 800, color: 'var(--text-primary)' }}>{title}</h3>
            <button
              type="button"
              aria-label="Close"
              onClick={onClose}
              className="modal-close-btn"
              style={{
                background: 'var(--brand-50)',
                border: '1.5px solid var(--brand-200)',
                color: 'var(--brand-600)',
                fontSize: 18,
                cursor: 'pointer',
                lineHeight: 1,
                width: 34,
                height: 34,
                display: 'grid',
                placeItems: 'center',
                borderRadius: 8,
                flexShrink: 0
              }}
            >
              ×
            </button>
          </div>
        )}
        <div>{children}</div>
        {footer && <div className="row" style={{ justifyContent: 'flex-end', gap: 10 }}>{footer}</div>}
      </div>
    </div>,
    document.body
  );
}
