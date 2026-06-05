import { NavLink } from 'react-router-dom';
import Logo from '../shared/components/Logo.jsx';
import { useAuth } from '../core/auth/AuthContext.jsx';

/**
 * Persistent left navigation. Items are filtered by the current user's role.
 */
const ALL_ITEMS = [
  { to: '/dashboard',     label: 'Dashboard',  icon: '◎', roles: ['ROLE_LEARNER', 'ROLE_MENTOR', 'ROLE_ADMIN'] },
  { to: '/mentors',       label: 'Find mentors', icon: '✦', roles: ['ROLE_LEARNER', 'ROLE_MENTOR', 'ROLE_ADMIN'] },
  { to: '/sessions',      label: 'Sessions',   icon: '⌛', roles: ['ROLE_LEARNER', 'ROLE_MENTOR', 'ROLE_ADMIN'] },
  { to: '/notifications', label: 'Notifications', icon: '◔', roles: ['ROLE_LEARNER', 'ROLE_MENTOR', 'ROLE_ADMIN'] },
  { to: '/profile',       label: 'Profile',    icon: '◐', roles: ['ROLE_LEARNER', 'ROLE_MENTOR', 'ROLE_ADMIN'] },
  { to: '/admin',         label: 'Admin',      icon: '◇', roles: ['ROLE_ADMIN'] }
];

export default function Sidebar() {
  const { user, logout } = useAuth();
  const items = ALL_ITEMS.filter((i) => i.roles.includes(user?.role));

  return (
    <aside
      style={{
        height: '100vh',
        width: 'var(--layout-sidebar)',
        background: 'var(--bg-raised)',
        borderRight: '1.5px solid var(--glass-border)',
        padding: '24px 16px',
        display: 'flex',
        flexDirection: 'column',
        gap: 16,
        position: 'sticky',
        top: 0,
        boxShadow: 'var(--shadow-sm)',
        flexShrink: 0,
      }}
    >
      <div style={{ padding: '4px 8px 16px 8px', borderBottom: '1.5px solid var(--glass-border)' }}>
        <Logo />
      </div>

      <nav className="col" style={{ gap: 4, marginTop: 8 }}>
        {items.map((item) => (
          <NavLink
            key={item.to}
            to={item.to}
            end={item.to === '/dashboard'}
            className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}
          >
            <span aria-hidden style={{ width: 22, textAlign: 'center', opacity: 0.85 }}>{item.icon}</span>
            <span>{item.label}</span>
          </NavLink>
        ))}
      </nav>

      <div className="spacer" />

      {user?.role === 'ROLE_LEARNER' && (
        <NavLink
          to="/mentors/apply"
          style={{
            padding: '14px 16px',
            borderRadius: 'var(--radius-lg)',
            background: 'linear-gradient(135deg, var(--brand-600) 0%, var(--brand-400) 100%)',
            color: '#fff',
            textDecoration: 'none',
            display: 'block'
          }}
        >
          <div style={{ fontWeight: 700, marginBottom: 4, fontSize: 13 }}>✦ Become a mentor</div>
          <div style={{ fontSize: 12, color: 'rgba(255,255,255,0.75)' }}>
            Share knowledge, earn reputation.
          </div>
        </NavLink>
      )}

      <button
        type="button"
        onClick={logout}
        className="btn btn-ghost"
        style={{ justifyContent: 'flex-start', width: '100%', color: 'var(--danger)', borderColor: '#FEE2E2' }}
      >
        <span aria-hidden>⏻</span> Sign out
      </button>

      <style>{`
        .nav-link {
          display: flex;
          align-items: center;
          gap: 12px;
          padding: 11px 14px;
          border-radius: 12px;
          color: var(--text-muted);
          text-decoration: none;
          font-weight: 600;
          font-size: 14px;
          transition: background 160ms ease, color 160ms ease, box-shadow 160ms ease;
          min-height: 44px;
        }
        .nav-link:hover {
          background: var(--brand-50);
          color: var(--brand-600);
        }
        .nav-link.active {
          background: var(--brand-600);
          color: #fff;
          box-shadow: var(--shadow-md);
        }
        .nav-link.active span { opacity: 1 !important; }

        /* Tablet (768px - 1023px): Icon-only sidebar */
        @media (max-width: 1023px) {
          aside { padding: 16px 10px !important; width: 72px !important; }
          .nav-link {
            justify-content: center;
            padding: 12px;
          }
          .nav-link span:last-child { display: none; }
          .nav-link span[aria-hidden] {
            width: auto !important;
            font-size: 20px;
          }
          aside > div:first-child { display: none; }
          aside > .col { gap: 8px !important; }
          aside > a[href='/mentors/apply'] { display: none !important; }
          aside > button { justify-content: center !important; padding: 12px !important; }
          aside > button span:last-child { display: none; }
        }

        /* Mobile (< 768px): Completely hide sidebar */
        @media (max-width: 767px) {
          aside { display: none !important; }
        }

        /* Dark mode sidebar — Flacto navy */
        [data-theme='dark'] aside {
          background: #060809 !important;
          border-right-color: rgba(0,168,128,0.18) !important;
          box-shadow: 2px 0 24px rgba(0,0,0,0.70) !important;
        }
        [data-theme='dark'] .nav-link { color: #4E7A73; }
        [data-theme='dark'] .nav-link:hover { background: rgba(0,168,128,0.10); color: #00A880; }
        [data-theme='dark'] .nav-link.active { background: rgba(0,168,128,0.16); color: #00A880; box-shadow: 0 0 0 1px rgba(0,168,128,0.30); }
      `}</style>
    </aside>
  );
}
