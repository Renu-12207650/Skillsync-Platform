import { useEffect, useLayoutEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import { Link, useNavigate } from 'react-router-dom';

import Avatar from '../shared/components/Avatar.jsx';
import { useAuth } from '../core/auth/AuthContext.jsx';
import notificationService from '../core/services/notificationService.js';
import authService from '../core/services/authService.js';
import { timeAgo } from '../shared/utils/format.js';
import ThemeToggle from '../shared/components/ThemeToggle.jsx';

const POLL_MS = Number(import.meta.env.VITE_NOTIFICATION_POLL_INTERVAL || 30000);

/**
 * Top app bar — global search, notifications bell, profile dropdown.
 */
export default function Topbar() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const [unreadCount, setUnreadCount] = useState(0);
  const [openBell, setOpenBell] = useState(false);
  const [items, setItems] = useState([]);
  const [openProfile, setOpenProfile] = useState(false);
  const [isDeveloper, setIsDeveloper] = useState(false);
  const [bellMenuStyle, setBellMenuStyle] = useState(null);
  const [profileMenuStyle, setProfileMenuStyle] = useState(null);
  const profileRef = useRef(null);
  const bellRef = useRef(null);
  const bellMenuRef = useRef(null);
  const profileMenuRef = useRef(null);

  useEffect(() => {
    let active = true;
    authService.isDeveloper()
      .then((flag) => { if (active) setIsDeveloper(!!flag); })
      .catch(() => {});
    return () => { active = false; };
  }, []);

  // Poll for unread count.
  useEffect(() => {
    let active = true;
    async function fetchCount() {
      try {
        const c = await notificationService.unreadCount();
        if (active) setUnreadCount(Number(c) || 0);
      } catch { /* notification-service may not be running */ }
    }
    fetchCount();
    const t = setInterval(fetchCount, POLL_MS);
    return () => { active = false; clearInterval(t); };
  }, []);

  // Close popovers on outside click.
  useEffect(() => {
    function onDoc(e) {
      const clickedProfile = profileRef.current?.contains(e.target) || profileMenuRef.current?.contains(e.target);
      const clickedBell = bellRef.current?.contains(e.target) || bellMenuRef.current?.contains(e.target);
      if (!clickedProfile) setOpenProfile(false);
      if (!clickedBell) setOpenBell(false);
    }
    document.addEventListener('mousedown', onDoc);
    return () => document.removeEventListener('mousedown', onDoc);
  }, []);

  useLayoutEffect(() => {
    function updateBellMenu() {
      if (!openBell || !bellRef.current) return;
      const rect = bellRef.current.getBoundingClientRect();
      setBellMenuStyle({
        position: 'fixed',
        top: Math.round(rect.bottom + 8),
        right: Math.round(window.innerWidth - rect.right),
        width: 360,
        maxHeight: 460,
        overflowY: 'auto',
        padding: 12,
        borderRadius: 16,
        zIndex: 9999,
        boxShadow: 'var(--shadow-lg)'
      });
    }

    function updateProfileMenu() {
      if (!openProfile || !profileRef.current) return;
      const rect = profileRef.current.getBoundingClientRect();
      setProfileMenuStyle({
        position: 'fixed',
        top: Math.round(rect.bottom + 8),
        right: Math.round(window.innerWidth - rect.right),
        minWidth: 240,
        padding: 8,
        borderRadius: 14,
        zIndex: 9999,
        boxShadow: 'var(--shadow-lg)'
      });
    }

    updateBellMenu();
    updateProfileMenu();
    window.addEventListener('resize', updateBellMenu);
    window.addEventListener('resize', updateProfileMenu);
    window.addEventListener('scroll', updateBellMenu, true);
    window.addEventListener('scroll', updateProfileMenu, true);
    return () => {
      window.removeEventListener('resize', updateBellMenu);
      window.removeEventListener('resize', updateProfileMenu);
      window.removeEventListener('scroll', updateBellMenu, true);
      window.removeEventListener('scroll', updateProfileMenu, true);
    };
  }, [openBell, openProfile]);

  async function openBellMenu() {
    setOpenBell((o) => !o);
    if (!openBell) {
      try {
        const all = await notificationService.myAll();
        setItems(Array.isArray(all) ? all.slice(0, 8) : []);
      } catch { setItems([]); }
    }
  }

  async function markRead(id) {
    try {
      await notificationService.markAsRead(id);
      setItems((cur) => cur.map((n) => n.id === id ? { ...n, read: true } : n));
      setUnreadCount((c) => Math.max(0, c - 1));
    } catch { /* ignore */ }
  }

  return (
    <header
      className="topbar-shell"
      style={{
        padding: '0 24px',
        height: 'var(--layout-topbar)',
        display: 'flex',
        alignItems: 'center',
        gap: 16,
        position: 'sticky',
        top: 0,
        zIndex: 100,
      }}
    >
      <div className="search" style={{ flex: 1, maxWidth: 460 }}>
        <div style={{ position: 'relative' }}>
          <span style={{ position: 'absolute', left: 14, top: '50%', transform: 'translateY(-50%)', color: 'var(--brand-400)', fontSize: 16, pointerEvents: 'none' }}>⌕</span>
          <input
            type="search"
            placeholder="Search mentors, skills, sessions…"
            className="input"
            style={{ paddingLeft: 38, background: 'var(--bg-deep)', border: '1.5px solid var(--glass-border)', borderRadius: 'var(--radius-pill)' }}
            onFocus={() => navigate('/mentors')}
            aria-label="Search"
          />
        </div>
      </div>

      <div className="spacer" />

      <ThemeToggle compact />

      {/* Notification bell */}
      <div ref={bellRef} style={{ position: 'relative' }}>
        <button
          type="button"
          aria-label={`Notifications${unreadCount ? `, ${unreadCount} unread` : ''}`}
          onClick={openBellMenu}
          className="btn btn-ghost"
          style={{ padding: '10px 14px', position: 'relative' }}
        >
          <span aria-hidden>🔔</span>
          {unreadCount > 0 && (
            <span
              style={{
                position: 'absolute',
                top: 6, right: 8,
                minWidth: 18, height: 18,
                padding: '0 5px',
                borderRadius: 999,
                background: 'var(--danger)',
                color: '#fff',
                fontSize: 11,
                fontWeight: 700,
                display: 'grid',
                placeItems: 'center'
              }}
            >
              {unreadCount > 9 ? '9+' : unreadCount}
            </span>
          )}
        </button>
        {openBell && bellMenuStyle && createPortal(
          <div ref={bellMenuRef} className="topbar-menu topbar-menu-notifications" style={bellMenuStyle} onMouseDown={(e) => e.stopPropagation()}>
            <div className="row between" style={{ marginBottom: 8 }}>
              <strong>Notifications</strong>
              <Link to="/notifications" style={{ fontSize: 12 }}>View all</Link>
            </div>
            {items.length === 0 ? (
              <div className="empty" style={{ padding: '24px 4px' }}>You&apos;re all caught up.</div>
            ) : (
              <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'flex', flexDirection: 'column', gap: 4 }}>
                {items.map((n) => (
                  <li key={n.id}>
                    <button
                      type="button"
                      onClick={() => !n.read && markRead(n.id)}
                      style={{
                        display: 'flex',
                        flexDirection: 'column',
                        alignItems: 'flex-start',
                        gap: 4,
                        width: '100%',
                        textAlign: 'left',
                        background: n.read ? 'var(--bg-deep)' : 'var(--brand-50)',
                        border: '1.5px solid',
                        borderColor: n.read ? 'var(--glass-border)' : 'var(--brand-200)',
                        borderRadius: 12,
                        padding: 12,
                        cursor: n.read ? 'default' : 'pointer',
                        color: 'inherit'
                      }}
                    >
                      <div style={{ fontWeight: 600, fontSize: 13 }}>{n.title || n.type || 'Notification'}</div>
                      <div style={{ fontSize: 12, color: 'var(--text-secondary)' }}>{n.message}</div>
                      <div style={{ fontSize: 11, color: 'var(--text-muted)' }}>{timeAgo(n.createdAt)}</div>
                    </button>
                  </li>
                ))}
              </ul>
            )}
          </div>,
          document.body
        )}
      </div>

      {/* Profile menu */}
      <div ref={profileRef} style={{ position: 'relative' }}>
        <button
          type="button"
          onClick={() => setOpenProfile((o) => !o)}
          className="btn btn-ghost"
          style={{ padding: 6, paddingRight: 14, gap: 10 }}
          aria-haspopup="menu"
          aria-expanded={openProfile}
        >
          <Avatar size="sm" name={user?.fullName} src={user?.profile?.profileImageUrl} />
          <span style={{ fontSize: 13, fontWeight: 600 }}>{user?.fullName?.split(' ')[0] || 'You'}</span>
        </button>
        {openProfile && profileMenuStyle && createPortal(
          <div ref={profileMenuRef} role="menu" className="topbar-menu topbar-menu-profile" style={profileMenuStyle} onMouseDown={(e) => e.stopPropagation()}>
            <div style={{ padding: '10px 12px', borderBottom: '1px solid var(--glass-border)', marginBottom: 6 }}>
              <div style={{ fontWeight: 700 }}>{user?.fullName}</div>
              <div style={{ fontSize: 12, color: 'var(--text-secondary)' }}>{user?.email}</div>
              {isDeveloper && (
                <div style={{ fontSize: 11, color: 'var(--brand-300)', marginTop: 4, textTransform: 'uppercase', letterSpacing: '0.08em', fontWeight: 700 }}>
                  Developer · super admin
                </div>
              )}
            </div>
            <Link to="/profile" role="menuitem" className="menu-item" onClick={() => setOpenProfile(false)}>
              View profile
            </Link>
            <Link to="/notifications" role="menuitem" className="menu-item" onClick={() => setOpenProfile(false)}>
              Notifications
            </Link>
            {isDeveloper && (
              <>
                <div style={{ height: 1, background: 'var(--glass-border)', margin: '6px 8px' }} />
                <div style={{ padding: '4px 12px', fontSize: 11, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.08em' }}>
                  View as
                </div>
                <Link to="/dashboard/learner" role="menuitem" className="menu-item" onClick={() => setOpenProfile(false)}>
                  Learner dashboard
                </Link>
                <Link to="/dashboard/mentor" role="menuitem" className="menu-item" onClick={() => setOpenProfile(false)}>
                  Mentor dashboard
                </Link>
                <Link to="/dashboard/admin" role="menuitem" className="menu-item" onClick={() => setOpenProfile(false)}>
                  Admin dashboard
                </Link>
                <Link to="/admin" role="menuitem" className="menu-item" onClick={() => setOpenProfile(false)}>
                  Admin console
                </Link>
                <div style={{ height: 1, background: 'var(--glass-border)', margin: '6px 8px' }} />
              </>
            )}
            <button
              type="button"
              role="menuitem"
              className="menu-item"
              onClick={() => { setOpenProfile(false); logout(); }}
              style={{ color: 'var(--danger)' }}
            >
              Sign out
            </button>
          </div>,
          document.body
        )}
      </div>

      <style>{`
        .topbar-menu {
          background: var(--bg-raised);
          border: 1.5px solid var(--glass-border);
          color: var(--text-primary);
          box-shadow: var(--shadow-md);
        }
        [data-theme='dark'] .topbar-menu {
          background: #0A0D10;
          border-color: rgba(0,168,128,0.22);
          box-shadow: 0 12px 40px rgba(0,0,0,0.80);
        }
        .menu-item {
          display: block;
          width: 100%;
          padding: 10px 14px;
          border-radius: 10px;
          color: var(--text-primary);
          text-decoration: none !important;
          font-size: 14px;
          font-weight: 600;
          cursor: pointer;
          transition: background 140ms ease, color 140ms ease;
          text-align: left;
          background: transparent;
          border: 0;
          min-height: 42px;
        }
        .menu-item:hover { background: var(--brand-50); color: var(--brand-600); }
        .menu-item:active { background: var(--brand-100); }
        [data-theme='dark'] .menu-item { color: var(--text-secondary); }
        [data-theme='dark'] .menu-item:hover { background: rgba(0,168,128,0.10); color: #00A880; }

        /* Tablet adjustments */
        @media (max-width: 1023px) {
          header { padding: 0 16px !important; }
          header .search { max-width: 320px; }
        }

        /* Mobile adjustments */
        @media (max-width: 767px) {
          header {
            padding: 0 12px !important;
            gap: 8px !important;
          }
          header .search { max-width: none; flex: 1; }
          header .search input { padding: 10px 14px 10px 36px; }
          header button span:last-child { display: none; }
          .topbar-menu-notifications {
            width: calc(100vw - 32px) !important;
            right: 16px !important;
            left: 16px !important;
          }
        }
      `}</style>
    </header>
  );
}
