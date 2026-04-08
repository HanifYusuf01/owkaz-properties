import { Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from './hooks/useAuth';

// Layout
import { DashboardLayout } from './components/layout/DashboardLayout';
import { ProtectedRoute } from './components/layout/ProtectedRoute';

// Auth pages
import { LoginPage } from './pages/LoginPage';
import { RegisterPage } from './pages/RegisterPage';
import { ForgotPasswordPage } from './pages/ForgotPasswordPage';
import { ResetPasswordPage } from './pages/ResetPasswordPage';

// Dashboard pages
import { DashboardPage } from './pages/dashboard/DashboardPage';
import { ApprovalQueuePage } from './pages/dashboard/admin/ApprovalQueuePage';
import { AllListingsPage } from './pages/dashboard/admin/AllListingsPage';
import { SoldProjectsPage } from './pages/dashboard/admin/SoldProjectsPage';
import { InquiriesPage } from './pages/dashboard/admin/InquiriesPage';
import { UsersPage } from './pages/dashboard/admin/UsersPage';
import { MyListingsPage } from './pages/dashboard/agent/MyListingsPage';
import { SubmitPropertyPage } from './pages/dashboard/agent/SubmitPropertyPage';
import { BrowsePage } from './pages/dashboard/buyer/BrowsePage';
import { MyInquiriesPage } from './pages/dashboard/buyer/MyInquiriesPage';
import { NotificationsPage } from './pages/dashboard/NotificationsPage';
import { ProfilePage } from './pages/dashboard/ProfilePage';

import { UserRole } from './types';

function AppContent() {
  const { isLoading } = useAuth();

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-cream">
        <div className="w-8 h-8 border-4 border-teal border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <Routes>
      {/* Public auth routes */}
      <Route path="/login" element={<LoginPage />} />
      <Route path="/register" element={<RegisterPage />} />
      <Route path="/forgot-password" element={<ForgotPasswordPage />} />
      <Route path="/reset-password" element={<ResetPasswordPage />} />

      {/* Dashboard — protected */}
      <Route element={<ProtectedRoute />}>
        <Route element={<DashboardLayout />}>
          <Route path="/dashboard" element={<DashboardPage />} />
          <Route path="/dashboard/notifications" element={<NotificationsPage />} />
          <Route path="/dashboard/profile" element={<ProfilePage />} />

          {/* Admin only */}
          <Route element={<ProtectedRoute allowedRoles={[UserRole.ADMIN]} />}>
            <Route path="/dashboard/approval-queue" element={<ApprovalQueuePage />} />
            <Route path="/dashboard/listings" element={<AllListingsPage />} />
            <Route path="/dashboard/sold" element={<SoldProjectsPage />} />
            <Route path="/dashboard/inquiries" element={<InquiriesPage />} />
            <Route path="/dashboard/users" element={<UsersPage />} />
            <Route path="/dashboard/create-listing" element={<SubmitPropertyPage />} />
          </Route>

          {/* Agent / Owner */}
          <Route element={<ProtectedRoute allowedRoles={[UserRole.AGENT, UserRole.OWNER]} />}>
            <Route path="/dashboard/my-listings" element={<MyListingsPage />} />
            <Route path="/dashboard/submit" element={<SubmitPropertyPage />} />
          </Route>

          {/* Buyer */}
          <Route element={<ProtectedRoute allowedRoles={[UserRole.BUYER]} />}>
            <Route path="/dashboard/browse" element={<BrowsePage />} />
            <Route path="/dashboard/featured" element={<BrowsePage />} />
            <Route path="/dashboard/my-inquiries" element={<MyInquiriesPage />} />
          </Route>
        </Route>
      </Route>

      {/* Fallback */}
      <Route path="/" element={<Navigate to="/dashboard" replace />} />
      <Route path="*" element={<Navigate to="/dashboard" replace />} />
    </Routes>
  );
}

export default function App() {
  return <AppContent />;
}
