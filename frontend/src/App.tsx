import { Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from './hooks/useAuth';

// Layout
import { DashboardLayout } from './components/layout/DashboardLayout';
import { PublicLayout } from './components/layout/PublicLayout';
import { AuthLayout } from './components/layout/AuthLayout';
import { ProtectedRoute } from './components/layout/ProtectedRoute';

// Public pages
import { HomePage } from './pages/public/HomePage';
import { PropertiesPage } from './pages/public/PropertiesPage';
import { SoldPropertiesPage } from './pages/public/SoldPropertiesPage';
import { PropertyDetailPage } from './pages/public/PropertyDetailPage';
import { AboutPage } from './pages/public/AboutPage';
import { ContactPage } from './pages/public/ContactPage';
import { ProjectsPage } from './pages/public/ProjectsPage';
import { ProjectDetailPage } from './pages/public/ProjectDetailPage';
import { ListPropertyPage } from './pages/public/ListPropertyPage';
import { BuyerProfilePage } from './pages/public/BuyerProfilePage';

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
import { ProjectsManagementPage } from './pages/dashboard/admin/ProjectsManagementPage';
import { InquiriesPage } from './pages/dashboard/admin/InquiriesPage';
import { UsersPage } from './pages/dashboard/admin/UsersPage';
import { MyListingsPage } from './pages/dashboard/agent/MyListingsPage';
import { SubmitPropertyPage } from './pages/dashboard/agent/SubmitPropertyPage';
import { BrowsePage } from './pages/dashboard/buyer/BrowsePage';
import { MyInquiriesPage } from './pages/dashboard/buyer/MyInquiriesPage';
import { SavedPropertiesPage } from './pages/dashboard/buyer/SavedPropertiesPage';
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
      {/* Public marketing site */}
      <Route element={<PublicLayout />}>
        <Route path="/" element={<HomePage />} />
        <Route path="/properties" element={<PropertiesPage />} />
        <Route path="/sold-properties" element={<SoldPropertiesPage />} />
        <Route path="/properties/:id" element={<PropertyDetailPage />} />
        <Route path="/projects" element={<ProjectsPage />} />
        <Route path="/projects/:id" element={<ProjectDetailPage />} />
        <Route path="/about" element={<AboutPage />} />
        <Route path="/contact" element={<ContactPage />} />
        <Route path="/list-property" element={<ListPropertyPage />} />

        {/* Buyer pages — require auth, live in public layout */}
        <Route element={<ProtectedRoute allowedRoles={[UserRole.BUYER]} />}>
          <Route path="/saved" element={<div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8"><h1 className="font-display text-2xl text-navy mb-6">Saved Properties</h1><SavedPropertiesPage /></div>} />
          <Route path="/my-inquiries" element={<div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8"><h1 className="font-display text-2xl text-navy mb-6">My Inquiries</h1><MyInquiriesPage /></div>} />
          <Route path="/profile" element={<BuyerProfilePage />} />
        </Route>
      </Route>

      {/* Public auth routes */}
      <Route element={<AuthLayout />}>
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />
        <Route path="/forgot-password" element={<ForgotPasswordPage />} />
        <Route path="/reset-password" element={<ResetPasswordPage />} />
      </Route>

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
            <Route path="/dashboard/projects" element={<ProjectsManagementPage />} />
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
            <Route path="/dashboard/saved" element={<SavedPropertiesPage />} />
            <Route path="/dashboard/my-inquiries" element={<MyInquiriesPage />} />
          </Route>
        </Route>
      </Route>

      {/* Fallback */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}

export default function App() {
  return <AppContent />;
}
