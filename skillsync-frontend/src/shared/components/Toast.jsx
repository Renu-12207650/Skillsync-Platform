import { createContext, useCallback, useContext, useMemo, useState } from 'react';

const ToastContext = createContext(null);

const TONE_STYLES = {
  success: { border: '#10B981', dot: '#10B981' },
  error:   { border: '#EF4444', dot: '#EF4444' },
  info:    { border: 'var(--brand-500)', dot: 'var(--brand-500)' },
  warning: { border: '#F59E0B', dot: '#F59E0B' }
};

let __toastId = 0;

/**
 * Lightweight toast/notifier so feature code can do useToast().push("Saved").
 */
export function ToastProvider({ children }) {
  const [toasts, setToasts] = useState([]);

  const push = useCallback((message, opts = {}) => {
    const id = ++__toastId;
    const tone = opts.tone || 'info';
    const ttl = opts.ttl ?? 4500;
    setToasts((t) => [...t, { id, tone, message }]);
    if (ttl > 0) {
      setTimeout(() => setToasts((t) => t.filter((x) => x.id !== id)), ttl);
    }
    return id;
  }, []);

  const dismiss = useCallback((id) => setToasts((t) => t.filter((x) => x.id !== id)), []);

  const api = useMemo(() => ({
    push,
    success: (m, o) => push(m, { ...o, tone: 'success' }),
    error:   (m, o) => push(m, { ...o, tone: 'error' }),
    info:    (m, o) => push(m, { ...o, tone: 'info' }),
    warning: (m, o) => push(m, { ...o, tone: 'warning' }),
    dismiss
  }), [push, dismiss]);

  return (
    <ToastContext.Provider value={api}>
      {children}
      <div
        aria-live="polite"
        style={{
          position: 'fixed',
          right: 20,
          bottom: 20,
          display: 'flex',
          flexDirection: 'column',
          gap: 10,
          zIndex: 200,
          maxWidth: 380
        }}
      >
        {toasts.map((t) => (
          <div
            key={t.id}
            className="fade-in"
            role="status"
            style={{
              padding: '13px 16px',
              display: 'flex',
              alignItems: 'center',
              gap: 12,
              borderRadius: 14,
              background: 'var(--bg-raised)',
              border: `1.5px solid ${TONE_STYLES[t.tone].border}`,
              borderLeft: `4px solid ${TONE_STYLES[t.tone].border}`,
              boxShadow: 'var(--shadow-md)',
              color: 'var(--text-primary)'
            }}
          >
            <span
              aria-hidden
              style={{
                width: 8,
                height: 8,
                borderRadius: 999,
                background: TONE_STYLES[t.tone].dot,
                boxShadow: `0 0 10px ${TONE_STYLES[t.tone].dot}`
              }}
            />
            <span style={{ flex: 1, fontSize: 14 }}>{t.message}</span>
            <button
              type="button"
              aria-label="Dismiss"
              onClick={() => dismiss(t.id)}
              style={{ background: 'transparent', border: 0, color: 'var(--text-muted)', cursor: 'pointer' }}
            >
              ×
            </button>
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  );
}

export function useToast() {
  const ctx = useContext(ToastContext);
  if (!ctx) throw new Error('useToast must be used inside <ToastProvider>');
  return ctx;
}
