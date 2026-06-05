import { NavLink } from 'react-router-dom';
import { useAuth } from '../core/auth/AuthContext.jsx';

/**
 * Mobile bottom navigation bar - shows on screens < 768px
 * Provides quick access to main app sections when sidebar is hidden
 */
const ALL_ITEMS = [
  { to: '/dashboard',     label: 'Home',       icon: '◎', roles: ['ROLE_LEARNER', 'ROLE_MENTOR', 'ROLE_ADMIN'] },
  { to: '/mentors',       label: 'Mentors',    icon: '✦', roles: ['ROLE_LEARNER', 'ROLE_MENTOR', 'ROLE_ADMIN'] },
  { to: '/sessions',      label: 'Sessions',   icon: '⌛', roles: ['ROLE_LEARNER', 'ROLE_MENTOR', 'ROLE_ADMIN'] },
  { to: '/notifications', label: 'Alerts',     icon: '◔', roles: ['ROLE_LEARNER', 'ROLE_MENTOR', 'ROLE_ADMIN'] },
  { to: '/profile',       label: 'Profile',    icon: '◐', roles: ['ROLE_LEARNER', 'ROLE_MENTOR', 'ROLE_ADMIN'] },
];

export default function MobileBottomNav() {
  const { user } = useAuth();
  const items = ALL_ITEMS.filter((i) => i.roles.includes(user?.role));

  return (
    <nav className="mobile-bottom-nav" aria-label="Mobile navigation">
      {items.map((item) => (
        <NavLink
          key={item.to}
          to={item.to}
          end={item.to === '/dashboard'}
          className={({ isActive }) => `mobile-nav-item ${isActive ? 'active' : ''}`}
        >
          <span className="icon" aria-hidden>{item.icon}</span>
          <span>{item.label}</span>
        </NavLink>
      ))}
    </nav>
  );
}
