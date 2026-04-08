import { useState } from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import { Sidebar } from './Sidebar';
import { Topbar } from './Topbar';

const pageTitles: Record<string, string> = {
  '/dashboard': 'Dashboard',
  '/dashboard/approval-queue': 'Approval Queue',
  '/dashboard/listings': 'All Listings',
  '/dashboard/sold': 'Sold Projects',
  '/dashboard/inquiries': 'Inquiries',
  '/dashboard/users': 'User Management',
  '/dashboard/create-listing': 'Create Listing',
  '/dashboard/my-listings': 'My Listings',
  '/dashboard/submit': 'Submit Property',
  '/dashboard/notifications': 'Notifications',
  '/dashboard/profile': 'Profile',
  '/dashboard/browse': 'Browse Properties',
  '/dashboard/featured': 'Featured Properties',
  '/dashboard/saved': 'Saved Properties',
  '/dashboard/my-inquiries': 'My Inquiries',
};

export const DashboardLayout = () => {
  const location = useLocation();
  const title = pageTitles[location.pathname] ?? 'Owkaz';
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <div className="flex min-h-screen bg-cream">
      {/* Mobile overlay */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-40 md:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />

      <div className="flex-1 flex flex-col min-h-screen md:ml-60">
        <Topbar title={title} onMenuClick={() => setSidebarOpen(true)} />
        <main className="flex-1 p-4 sm:p-6 lg:p-8">
          <Outlet />
        </main>
      </div>
    </div>
  );
};
