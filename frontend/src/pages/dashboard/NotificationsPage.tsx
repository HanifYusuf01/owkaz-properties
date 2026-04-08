import {
  useGetNotificationsQuery,
  useMarkNotificationReadMutation,
  useMarkAllNotificationsReadMutation,
} from '../../features/notifications/notificationsApi';
import { Button } from '../../components/ui/Button';
import { formatDate } from '../../utils/format';

export const NotificationsPage = () => {
  const { data: notifications = [], isLoading } = useGetNotificationsQuery();
  const [markRead] = useMarkNotificationReadMutation();
  const [markAllRead] = useMarkAllNotificationsReadMutation();

  const unread = notifications.filter((n) => !n.read).length;

  if (isLoading) return <div className="py-20 text-center text-muted">Loading...</div>;

  return (
    <div className="space-y-4 max-w-2xl">
      <div className="flex items-center justify-between">
        <p className="text-sm text-muted">{unread} unread notification{unread !== 1 ? 's' : ''}</p>
        {unread > 0 && (
          <Button variant="ghost" size="sm" onClick={() => markAllRead()}>Mark all read</Button>
        )}
      </div>

      {notifications.length === 0 && (
        <div className="py-20 text-center">
          <div className="text-5xl mb-3">🔔</div>
          <h3 className="font-semibold text-navy">No notifications</h3>
        </div>
      )}

      <div className="bg-white border border-border rounded-xl divide-y divide-border overflow-hidden">
        {notifications.map((n) => (
          <div
            key={n.id}
            className={`flex gap-3 p-4 transition-colors ${n.read ? '' : 'bg-teal/5'}`}
            onClick={() => !n.read && markRead(n.id)}
          >
            <div className={`w-2 h-2 rounded-full mt-1.5 flex-shrink-0 ${n.read ? 'bg-border' : 'bg-teal'}`} />
            <div className="flex-1">
              <p className="text-sm text-ink">{n.text}</p>
              <p className="text-xs text-muted mt-1">{formatDate(n.createdAt)}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
