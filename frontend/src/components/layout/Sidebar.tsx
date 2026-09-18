import { NavLink, Link } from 'react-router-dom';
import {
  LayoutDashboard, Home, CheckSquare, MessageSquare, Users, PlusCircle,
  Bell, User, Star, Search, Bookmark, LogOut, DollarSign, X, Building2, Globe, ArrowLeftCircle,
} from 'lucide-react';
import { UserRole } from '../../types';
import { useAppDispatch, useAppSelector } from '../../store';
import { logout } from '../../features/auth/authSlice';
import { Avatar } from '../ui/Avatar';

interface NavItem {
  label: string;
  path: string;
  icon: React.ReactNode;
  badge?: number;
}

interface NavSection {
  title: string;
  items: NavItem[];
}

const roleColors: Record<UserRole, string> = {
  admin: 'bg-purple-500/20 text-purple-300',
  agent: 'bg-orange-500/20 text-orange-300',
  owner: 'bg-blue-500/20 text-blue-300',
  buyer: 'bg-teal-500/20 text-teal-300',
};

interface SidebarProps {
  isOpen: boolean;
  onClose: () => void;
}

export const Sidebar = ({ isOpen, onClose }: SidebarProps) => {
  const dispatch = useAppDispatch();
  const user = useAppSelector((s) => s.auth.user);
  const role = user?.role ?? UserRole.BUYER;

  const navConfig: Record<UserRole, NavSection[]> = {
    admin: [
      {
        title: 'Overview',
        items: [
          { label: 'Dashboard', path: '/dashboard', icon: <LayoutDashboard size={16} /> },
          { label: 'Approval Queue', path: '/dashboard/approval-queue', icon: <CheckSquare size={16} /> },
        ],
      },
      {
        title: 'Manage',
        items: [
          { label: 'All Listings', path: '/dashboard/listings', icon: <Home size={16} /> },
          { label: 'Sold Projects', path: '/dashboard/sold', icon: <DollarSign size={16} /> },
          { label: 'Projects', path: '/dashboard/projects', icon: <Building2 size={16} /> },
          { label: 'Inquiries', path: '/dashboard/inquiries', icon: <MessageSquare size={16} /> },
          { label: 'Users', path: '/dashboard/users', icon: <Users size={16} /> },
        ],
      },
      {
        title: 'Publishing',
        items: [
          { label: 'Create Listing', path: '/dashboard/create-listing', icon: <PlusCircle size={16} /> },
          { label: 'Site Content', path: '/dashboard/site-content', icon: <Globe size={16} /> },
        ],
      },
    ],
    agent: [
      {
        title: 'Overview',
        items: [
          { label: 'Dashboard', path: '/dashboard', icon: <LayoutDashboard size={16} /> },
        ],
      },
      {
        title: 'Listings',
        items: [
          { label: 'My Listings', path: '/dashboard/my-listings', icon: <Home size={16} /> },
          { label: 'Submit Property', path: '/dashboard/submit', icon: <PlusCircle size={16} /> },
        ],
      },
      {
        title: 'Account',
        items: [
          { label: 'Notifications', path: '/dashboard/notifications', icon: <Bell size={16} /> },
          { label: 'Profile', path: '/dashboard/profile', icon: <User size={16} /> },
        ],
      },
    ],
    owner: [
      {
        title: 'Overview',
        items: [
          { label: 'Dashboard', path: '/dashboard', icon: <LayoutDashboard size={16} /> },
        ],
      },
      {
        title: 'Properties',
        items: [
          { label: 'My Properties', path: '/dashboard/my-listings', icon: <Home size={16} /> },
          { label: 'Submit Property', path: '/dashboard/submit', icon: <PlusCircle size={16} /> },
        ],
      },
      {
        title: 'Account',
        items: [
          { label: 'Notifications', path: '/dashboard/notifications', icon: <Bell size={16} /> },
          { label: 'Profile', path: '/dashboard/profile', icon: <User size={16} /> },
        ],
      },
    ],
    buyer: [
      {
        title: 'Explore',
        items: [
          { label: 'Browse Listings', path: '/dashboard/browse', icon: <Search size={16} /> },
          { label: 'Featured', path: '/dashboard/featured', icon: <Star size={16} /> },
        ],
      },
      {
        title: 'My Activity',
        items: [
          { label: 'Saved Properties', path: '/dashboard/saved', icon: <Bookmark size={16} /> },
          { label: 'My Inquiries', path: '/dashboard/my-inquiries', icon: <MessageSquare size={16} /> },
        ],
      },
      {
        title: 'Account',
        items: [
          { label: 'Profile', path: '/dashboard/profile', icon: <User size={16} /> },
        ],
      },
    ],
  };

  const sections = navConfig[role] ?? [];

  return (
    <aside
      className={`fixed left-0 top-0 h-screen w-60 bg-navy flex flex-col z-50 transition-transform duration-300
        ${isOpen ? 'translate-x-0' : '-translate-x-full'} md:translate-x-0`}
    >
      {/* Brand */}
      <div className="px-6 py-7 border-b border-white/10 flex items-start justify-between">
        <div>
          <Link to="/">
            <img src="/OWKAZ LOGO.png" alt="Owkaz" className="h-8" />
          </Link>
          <span className={`mt-2 inline-block px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-widest ${roleColors[role]}`}>
            {role}
          </span>
        </div>
        <button
          onClick={onClose}
          className="md:hidden text-white/40 hover:text-white mt-1 transition-colors"
        >
          <X size={18} />
        </button>
      </div>

      {/* Navigation */}
      <nav className="flex-1 overflow-y-auto py-4">
        {sections.map((section) => (
          <div key={section.title}>
            <p className="px-6 py-3 text-[9px] font-semibold uppercase tracking-widest text-white/25">
              {section.title}
            </p>
            {section.items.map((item) => (
              <NavLink
                key={item.path}
                to={item.path}
                end={item.path === '/dashboard'}
                onClick={onClose}
                className={({ isActive }) =>
                  `flex items-center gap-2.5 px-6 py-2.5 text-[13px] border-l-[3px] transition-all duration-150 ${
                    isActive
                      ? 'text-white border-gold bg-white/6'
                      : 'text-white/50 border-transparent hover:text-white/80 hover:bg-white/4'
                  }`
                }
              >
                {item.icon}
                <span>{item.label}</span>
                {item.badge != null && item.badge > 0 && (
                  <span className="ml-auto bg-gold text-navy text-[9px] font-bold px-1.5 py-0.5 rounded-full">
                    {item.badge}
                  </span>
                )}
              </NavLink>
            ))}
          </div>
        ))}
      </nav>

      {/* Footer */}
      <Link
        to="/"
        className="px-6 py-3 border-t border-white/10 flex items-center gap-2.5 text-white/50 hover:text-white transition-colors text-xs font-semibold"
      >
        <ArrowLeftCircle size={16} /> Back to Website
      </Link>
      <div className="px-6 py-4 border-t border-white/10 flex items-center gap-3">
        <Avatar name={user?.name} avatarUrl={user?.avatarUrl} className="w-9 h-9 text-sm" />
        <div className="flex-1 min-w-0">
          <div className="text-white text-xs font-semibold truncate">{user?.name}</div>
          <div className="text-white/40 text-[10px] truncate">{user?.email}</div>
        </div>
        <button
          onClick={() => dispatch(logout())}
          className="text-white/30 hover:text-white/70 transition-colors"
          title="Sign out"
        >
          <LogOut size={16} />
        </button>
      </div>
    </aside>
  );
};
