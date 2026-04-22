import { useNavigate } from 'react-router-dom';
import { useGetAdminPropertiesQuery } from '../../../features/properties/propertiesApi';
import { useGetInquiriesQuery } from '../../../features/inquiries/inquiriesApi';
import { Badge } from '../../../components/ui/Badge';
import { Button } from '../../../components/ui/Button';
import { DataTable, Column } from '../../../components/ui/DataTable';
import { formatPrice, formatDate } from '../../../utils/format';
import { Property, PropertyStatus } from '../../../types';

const StatCard = ({ label, value, color }: { label: string; value: number; color: string }) => (
  <div className="bg-white border border-border rounded-xl p-6 relative overflow-hidden">
    <div className={`absolute right-0 top-0 bottom-0 w-1 rounded-r-xl ${color}`} />
    <span className="font-display text-4xl text-navy block">{value}</span>
    <div className="text-[10px] uppercase tracking-widest text-muted mt-1">{label}</div>
  </div>
);

export const AdminDashboard = () => {
  const navigate = useNavigate();
  const { data: propsData } = useGetAdminPropertiesQuery({ limit: 100 });
  const { data: inquiries = [] } = useGetInquiriesQuery({});

  const properties = propsData?.data ?? [];
  const recentColumns: Column<Property>[] = [
    { key: 'property', header: 'Property', className: 'font-semibold text-navy', cell: (p) => p.title },
    { key: 'type', header: 'Type', className: 'text-muted', cell: (p) => p.type },
    { key: 'provider', header: 'Provider', className: 'text-muted', cell: (p) => p.submittedBy?.name },
    { key: 'price', header: 'Price', className: 'text-navy font-medium', cell: (p) => formatPrice(p.price) },
    { key: 'views', header: 'Views', className: 'text-muted', cell: (p) => p.views },
    { key: 'status', header: 'Status', cell: (p) => <Badge status={p.status} /> },
  ];
  const pending = properties.filter((p) => p.status === PropertyStatus.PENDING);
  const approved = properties.filter((p) => p.status === PropertyStatus.APPROVED);
  const rejected = properties.filter((p) => p.status === PropertyStatus.REJECTED);
  const sold = properties.filter((p) => p.status === PropertyStatus.SOLD);
  const newInquiries = inquiries.filter((i) => i.status === 'new');

  return (
    <div className="space-y-8">
      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard label="Total Listings" value={properties.length} color="bg-navy" />
        <StatCard label="Published" value={approved.length} color="bg-green-500" />
        <StatCard label="Pending Review" value={pending.length} color="bg-amber-500" />
        <StatCard label="Sold" value={sold.length} color="bg-blue-500" />
      </div>

      {/* Two-col grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Pending approvals */}
        <div className="bg-white border border-border rounded-xl overflow-hidden">
          <div className="px-6 py-4 border-b border-border flex items-center justify-between">
            <h3 className="font-display text-lg text-navy">Pending Approvals</h3>
            <Button variant="ghost" size="sm" onClick={() => navigate('/dashboard/approval-queue')}>
              View All
            </Button>
          </div>
          <div>
            {pending.slice(0, 4).map((p) => (
              <div key={p.id} className="px-6 py-4 border-b border-border last:border-0 flex items-center gap-3">
                <div className="w-8 h-8 rounded-lg bg-cream flex items-center justify-center text-lg">🏠</div>
                <div className="flex-1 min-w-0">
                  <div className="font-semibold text-sm text-navy truncate">{p.title}</div>
                  <div className="text-xs text-muted">{p.lga}, {p.state} · {p.submittedBy?.name}</div>
                </div>
                <Badge status="pending" />
              </div>
            ))}
            {pending.length === 0 && (
              <div className="py-12 text-center text-muted text-sm">
                <div className="text-3xl mb-2">✨</div>
                Queue is clear!
              </div>
            )}
          </div>
        </div>

        {/* New inquiries */}
        <div className="bg-white border border-border rounded-xl overflow-hidden">
          <div className="px-6 py-4 border-b border-border flex items-center justify-between">
            <h3 className="font-display text-lg text-navy">New Inquiries</h3>
            <Button variant="ghost" size="sm" onClick={() => navigate('/dashboard/inquiries')}>
              View All
            </Button>
          </div>
          <div>
            {inquiries.slice(0, 4).map((inq) => (
              <div key={inq.id} className="px-6 py-4 border-b border-border last:border-0">
                <div className="font-semibold text-sm text-navy">{inq.property?.title}</div>
                <div className="text-xs text-muted mt-0.5">{inq.buyer?.name} · {formatDate(inq.createdAt)}</div>
                <div className="mt-1.5"><Badge status={inq.status} /></div>
              </div>
            ))}
            {inquiries.length === 0 && (
              <div className="py-12 text-center text-muted text-sm">No inquiries yet</div>
            )}
          </div>
        </div>
      </div>

      {/* Recent table */}
      <div>
        <h3 className="font-display text-lg text-navy mb-3">Recent Listings</h3>
        <DataTable
          columns={recentColumns}
          rows={properties.slice(0, 8)}
          rowKey={(p) => p.id}
          emptyState={<div className="py-16 text-center text-muted text-sm bg-white border border-border rounded-xl">No listings yet</div>}
        />
      </div>
    </div>
  );
};
