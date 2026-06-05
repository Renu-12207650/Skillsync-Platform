import { useEffect, useState } from 'react';
import { useLocation } from 'react-router-dom';

import { useAuth } from '../../core/auth/AuthContext.jsx';
import NikkiBot from './NikkiBot.jsx';
import ElaichiBot from './ElaichiBot.jsx';

/**
 * Floating chat bubble pinned to the bottom-right of the post-login Shell.
 * Click to expand a drawer with two tabs:
 *  - Nikki  (in-app helper, FAQ + contact admins)
 *  - Elaichi (general AI assistant via /chatbot/ask)
 */
export default function ChatbotWidget() {
  const { isAuthenticated } = useAuth();
  const { pathname } = useLocation();
  const [open, setOpen]   = useState(false);
  const [tab,  setTab]    = useState('nikki');

  // Close drawer on Esc.
  useEffect(() => {
    function onKey(e) { if (e.key === 'Escape') setOpen(false); }
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, []);

  if (!isAuthenticated || pathname.startsWith('/auth/')) return null;

  return (
    <>
      {/* Floating launcher */}
      {!open && (
        <button
          type="button"
          aria-label="Open SkillSync help"
          onClick={() => setOpen(true)}
          className="chatbot-launcher"
          style={{
            position: 'fixed',
            bottom: 22,
            right: 22,
            zIndex: 50,
            width: 56,
            height: 56,
            borderRadius: '50%',
            border: 'none',
            cursor: 'pointer',
            background: 'linear-gradient(135deg, var(--brand-600) 0%, var(--brand-400) 100%)',
            boxShadow: '0 8px 28px rgba(0,122,100,0.45)',
            border: '2px solid rgba(255,255,255,0.15)',
            color: '#fff',
            fontSize: 24,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center'
          }}
        >
          💬
        </button>
      )}

      {/* Drawer */}
      {open && (
        <div
          role="dialog"
          aria-label="SkillSync chat"
          className="chatbot-drawer"
          style={{
            position: 'fixed',
            bottom: 22,
            right: 22,
            zIndex: 50,
            width: 'min(380px, calc(100vw - 32px))',
            height: 'min(560px, calc(100vh - 100px))',
            background: 'var(--bg-raised)',
            border: '1.5px solid var(--glass-border)',
            borderRadius: 20,
            boxShadow: 'var(--shadow-lg)',
            display: 'flex',
            flexDirection: 'column',
            overflow: 'hidden'
          }}
        >
          {/* Header */}
          <div
            className="row between"
            style={{
              alignItems: 'center',
              padding: '10px 14px',
              borderBottom: '1.5px solid var(--glass-border)'
            }}
          >
            <div className="row" style={{ gap: 6 }}>
              <TabButton active={tab === 'nikki'} onClick={() => setTab('nikki')}>
                Nikki
                <span style={{ fontSize: 11, color: 'var(--text-muted)', marginLeft: 4 }}>
                  app help
                </span>
              </TabButton>
              <TabButton active={tab === 'elaichi'} onClick={() => setTab('elaichi')}>
                Elaichi
                <span style={{ fontSize: 11, color: 'var(--text-muted)', marginLeft: 4 }}>
                  AI
                </span>
              </TabButton>
            </div>
            <button
              type="button"
              aria-label="Close chat"
              onClick={() => setOpen(false)}
              style={{
                background: 'transparent',
                border: 'none',
                color: 'var(--text-secondary)',
                fontSize: 20,
                cursor: 'pointer',
                lineHeight: 1
              }}
            >
              ×
            </button>
          </div>

          {/* Body */}
          <div style={{ flex: 1, overflow: 'hidden' }}>
            {tab === 'nikki'   && <NikkiBot />}
            {tab === 'elaichi' && <ElaichiBot />}
          </div>
        </div>
      )}
    </>
  );
}

function TabButton({ active, onClick, children }) {
  return (
    <button
      type="button"
      className="chip"
      onClick={onClick}
      aria-pressed={active}
      style={{
        background: active ? 'var(--brand-50)' : 'transparent',
        borderColor: active ? 'var(--brand-200)' : 'var(--glass-border)',
        color: active ? 'var(--brand-600)' : 'var(--text-muted)'
      }}
    >
      {children}
    </button>
  );
}

/* Responsive styles injected into document */
const responsiveStyles = `
  @media (max-width: 767px) {
    /* Reposition chatbot launcher above bottom nav */
    .chatbot-launcher {
      bottom: 90px !important;
      right: 16px !important;
      width: 48px !important;
      height: 48px !important;
    }
    /* Expand chatbot drawer on mobile */
    .chatbot-drawer {
      bottom: 80px !important;
      right: 16px !important;
      width: calc(100vw - 32px) !important;
      height: calc(100vh - 160px) !important;
    }
  }
`;

if (typeof document !== 'undefined') {
  const styleId = 'chatbot-responsive';
  if (!document.getElementById(styleId)) {
    const style = document.createElement('style');
    style.id = styleId;
    style.textContent = responsiveStyles;
    document.head.appendChild(style);
  }
}
