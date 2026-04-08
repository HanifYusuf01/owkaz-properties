import { useNavigate } from 'react-router-dom';
import { useGetMyPropertiesQuery } from '../../../features/properties/propertiesApi';
import { Badge } from '../../../components/ui/Badge';
import { Button } from '../../../components/ui/Button';
import { formatPrice, formatDate } from '../../../utils/format';
import { PropertyStatus } from '../../../types';

export const ProviderDashboard = () => {
  const navigate = useNavigate();
  const { data } = useGetMyPropertiesQuery({ limit: 100 });
  const properties = data?.data ?? [];

  const approved = properties.filter((p) => p.status === PropertyStatus.APPROVED);
  const pending = properties.filter((p) => p.status === PropertyStatus.PENDING);
  const rejected = properties.filter((p) => p.status === PropertyStatus.REJECTED);

  return (
    <div className="space-y-6">
      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: 'Total Submitted', value: properties.length, color: 'bg-navy' },
          { label: 'Published', value: approved.length, color: 'bg-green-500' },
          { label: 'Under Review', value: pending.length, color: 'bg-amber-500' },
          { label: 'Rejected', value: rejected.length, color: 'bg-red-500' },
        ].map((s) => (
          <div key={s.label} className="bg-white border border-border rounded-xl p-6 relative overflow-hidden">
            <div className={`absolute right-0 top-0 bottom-0 w-1 rounded-r-xl ${s.color}`} />
            <span className="font-display text-4xl text-navy block">{s.value}</span>
            <div className="text-[10px] uppercase tracking-widest text-muted mt-1">{s.label}</div>
          </div>
        ))}
      </div>

      {/* Info callout */}
      <div className="bg-sky-50 border border-sky-200 rounded-xl p-4">
        <h5 className="text-xs font-bold uppercase tracking-wide text-sky-800 mb-1">How It Works</h5>
        <p className="text-xs text-sky-700">
          Submit your property → Owkaz admin reviews within 24–48 hrs → Approved listings appear on public marketplace → Buyers contact us, we coordinate with you.
        </p>
      </div>

      {/* My listings */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-display text-xl text-navy">My Listings</h3>
          <Button size="sm" onClick={() => navigate('/dashboard/submit')}>+ Submit Property</Button>
        </div>

        {properties.length === 0 ? (
          <div className="py-20 text-center">
            <div className="text-5xl mb-3">🏠</div>
            <h3 className="font-semibold text-navy">No listings yet</h3>
            <p className="text-sm text-muted mt-1 mb-4">Submit your first property for review.</p>
            <Button onClick={() => navigate('/dashboard/submit')}>Submit Property</Button>
          </div>
        ) : (
          <div className="space-y-3">
            {properties.map((p) => (
              <div key={p.id} className="bg-white border border-border rounded-xl p-5 flex gap-4 items-start">
                <div className="w-12 h-12 rounded-xl bg-cream flex items-center justify-center text-2xl flex-shrink-0">🏠</div>
                <div className="flex-1 min-w-0">
                  <div className="font-bold text-navy">{p.title}</div>
                  <div className="text-xs text-muted mt-0.5">
                    📍 {p.lga}, {p.state} · {formatPrice(p.price)} · Submitted {formatDate(p.createdAt)}
                  </div>
                  {p.status === PropertyStatus.REJECTED && p.rejectionReason && (
                    <div className="mt-2 p-2.5 bg-red-50 border-l-4 border-red-400 rounded text-xs text-red-700">
                      <strong>Rejection reason:</strong> {p.rejectionReason}
                    </div>
                  )}
                </div>
                <div className="flex items-center gap-2 flex-shrink-0">
                  <Badge status={p.status} />
                  {(p.status === PropertyStatus.REJECTED || p.status === PropertyStatus.PENDING) && (
                    <Button variant="ghost" size="sm" onClick={() => navigate(`/dashboard/my-listings`)}>Edit</Button>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
