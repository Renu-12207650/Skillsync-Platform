import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from './AuthContext.jsx';
import Spinner from '../../shared/components/Spinner.jsx';

/**
 * Wraps a route subtree and redirects unauthenticated users to /auth/login.
 * Optionally requires one or more roles via the `roles` prop.
 */
export function ProtectedRoute({ children, roles }) {
  const { isAuthenticated, user, bootstrapped } = useAuth();
  const location = useLocation();

  if (!bootstrapped) {
    return (
      <div style={{ minHeight: '60vh', display: 'grid', placeItems: 'center' }}>
        <Spinner size={36} label="Preparing your workspace…" />
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/auth/login" replace state={{ from: location }} />;
  }
  if (roles && roles.length > 0 && !roles.includes(user?.role)) {
    return <Navigate to="/dashboard" replace />;
  }
  return children;
}

/**
 * Wraps the auth screens — if the user is already logged in, push them home.
 */
export function PublicOnly({ children }) {
  const { isAuthenticated } = useAuth();
  if (isAuthenticated) return <Navigate to="/dashboard" replace />;
  return children;
}
