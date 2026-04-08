import { useGetMyInquiriesQuery } from '../../../features/inquiries/inquiriesApi';
import { Badge } from '../../../components/ui/Badge';
import { formatDate } from '../../../utils/format';

export const MyInquiriesPage = () => {
  const { data: inquiries = [], isLoading } = useGetMyInquiriesQuery();

  if (isLoading) return <div className="py-20 text-center text-muted">Loading...</div>;

  if (inquiries.length === 0) {
    return (
      <div className="py-20 text-center">
        <div className="text-5xl mb-3">💬</div>
        <h3 className="font-semibold text-navy">No inquiries yet</h3>
        <p className="text-sm text-muted mt-1">Browse listings and submit inquiries on properties you're interested in.</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {inquiries.map((inq) => (
        <div key={inq.id} className="bg-white border border-border rounded-xl p-5 flex gap-4">
          <div className="w-10 h-10 rounded-xl bg-cream flex items-center justify-center text-xl flex-shrink-0">💬</div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="font-bold text-sm text-navy">{inq.property?.title}</span>
              <Badge status={inq.status} />
            </div>
            <div className="text-xs text-muted mt-0.5">
              Submitted {formatDate(inq.createdAt)} · Prefers {inq.preferredContact}
            </div>
            <p className="text-xs text-ink mt-2 pt-2 border-t border-border">{inq.message}</p>
          </div>
        </div>
      ))}
    </div>
  );
};
