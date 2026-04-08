import { Bell, Menu } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useAppSelector } from '../../store';
import { useGetNotificationsQuery } from '../../features/notifications/notificationsApi';

interface TopbarProps {
  title: string;
  onMenuClick: () => void;
}

export const Topbar = ({ title, onMenuClick }: TopbarProps) => {
  const navigate = useNavigate();
  const user = useAppSelector((s) => s.auth.user);
  const { data: notifications = [] } = useGetNotificationsQuery(undefined, { skip: !user });
  const unread = notifications.filter((n) => !n.read).length;

  return (
    <header className="sticky top-0 z-40 bg-white border-b border-border px-4 sm:px-8 py-4 flex items-center gap-3">
      {/* Hamburger — mobile only */}
      <button
        onClick={onMenuClick}
        className="md:hidden p-1.5 -ml-1 text-muted hover:text-ink transition-colors"
        aria-label="Open menu"
      >
        <Menu size={22} />
      </button>

      <h1 className="font-display text-xl sm:text-2xl text-navy flex-1 truncate">{title}</h1>

      <div className="flex items-center gap-3">
        <button
          onClick={() => navigate('/dashboard/notifications')}
          className="relative p-2 text-muted hover:text-ink transition-colors"
        >
          <Bell size={20} />
          {unread > 0 && (
            <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full border-2 border-white" />
          )}
        </button>
        <div className="w-9 h-9 rounded-full bg-teal flex items-center justify-center text-white font-bold text-sm flex-shrink-0">
          {user?.name?.charAt(0) ?? '?'}
        </div>
      </div>
    </header>
  );
};
