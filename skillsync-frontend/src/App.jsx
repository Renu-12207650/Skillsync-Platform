import { Routes, Route } from 'react-router-dom';

import Shell from './layout/Shell.jsx';
import { ProtectedRoute, PublicOnly } from './core/auth/guards.jsx';

import LandingPage from './features/landing/LandingPage.jsx';
import LoginPage from './features/auth/LoginPage.jsx';
import RegisterPage from './features/auth/RegisterPage.jsx';
import ForgotPasswordPage from './features/auth/ForgotPasswordPage.jsx';
import ResetPasswordPage from './features/auth/ResetPasswordPage.jsx';

import DashboardRouter from './features/dashboard/DashboardRouter.jsx';
import LearnerDashboard from './features/dashboard/LearnerDashboard.jsx';
import MentorDashboard from './features/dashboard/MentorDashboard.jsx';
import AdminDashboard from './features/dashboard/AdminDashboard.jsx';

import MentorBrowse from './features/mentors/MentorBrowse.jsx';
import MentorProfilePage from './features/mentors/MentorProfilePage.jsx';
import MentorApplyPage from './features/mentors/MentorApplyPage.jsx';

import SessionsPage from './features/sessions/SessionsPage.jsx';
import ProfilePage from './features/profile/ProfilePage.jsx';
import NotificationsPage from './features/notifications/NotificationsPage.jsx';

import AdminConsole from './features/admin/AdminConsole.jsx';
import OnboardingPage from './features/onboarding/OnboardingPage.jsx';
import NotFoundPage from './features/misc/NotFoundPage.jsx';

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<LandingPage />} />

      <Route path="/auth/login"           element={<PublicOnly><LoginPage /></PublicOnly>} />
      <Route path="/auth/register"        element={<PublicOnly><RegisterPage /></PublicOnly>} />
      <Route path="/auth/forgot-password" element={<PublicOnly><ForgotPasswordPage /></PublicOnly>} />
      <Route path="/auth/reset-password"  element={<PublicOnly><ResetPasswordPage /></PublicOnly>} />

      {/* Onboarding sits OUTSIDE the Shell — no sidebar/topbar yet. */}
      <Route path="/onboarding" element={
        <ProtectedRoute><OnboardingPage /></ProtectedRoute>
      } />

      <Route element={<ProtectedRoute><Shell /></ProtectedRoute>}>
        <Route path="/dashboard"          element={<DashboardRouter />} />
        <Route path="/dashboard/learner"  element={<LearnerDashboard />} />
        <Route path="/dashboard/mentor"   element={<MentorDashboard />} />
        <Route path="/dashboard/admin"    element={<AdminDashboard />} />

        <Route path="/mentors"            element={<MentorBrowse />} />
        <Route path="/mentors/apply"      element={<MentorApplyPage />} />
        <Route path="/mentors/:id"        element={<MentorProfilePage />} />

        <Route path="/sessions"           element={<SessionsPage />} />
        <Route path="/profile"            element={<ProfilePage />} />
        <Route path="/notifications"      element={<NotificationsPage />} />

        <Route path="/admin" element={
          <ProtectedRoute roles={['ROLE_ADMIN']}>
            <AdminConsole />
          </ProtectedRoute>
        } />
      </Route>

      <Route path="*" element={<NotFoundPage />} />
    </Routes>
  );
}
