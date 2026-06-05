import { useAuth } from '../../core/auth/AuthContext.jsx';

import LearnerDashboard from './LearnerDashboard.jsx';
import MentorDashboard from './MentorDashboard.jsx';
import AdminDashboard from './AdminDashboard.jsx';

/**
 * Routes /dashboard to the right view based on the user's role.
 */
export default function DashboardRouter() {
  const { user } = useAuth();
  if (user?.role === 'ROLE_MENTOR') return <MentorDashboard />;
  if (user?.role === 'ROLE_ADMIN')  return <AdminDashboard />;
  return <LearnerDashboard />;
}
