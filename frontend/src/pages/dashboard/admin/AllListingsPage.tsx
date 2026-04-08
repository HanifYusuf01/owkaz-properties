import { useState } from 'react';
import {
  useGetAdminPropertiesQuery,
  useApprovePropertyMutation,
  useRejectPropertyMutation,
  useToggleFeaturedMutation,
  useDeletePropertyMutation,
} from '../../../features/properties/propertiesApi';
import { Badge } from '../../../components/ui/Badge';
import { Button } from '../../../components/ui/Button';
import { Modal } from '../../../components/ui/Modal';
import { ConfirmModal } from '../../../components/ui/ConfirmModal';
import { Input } from '../../../components/ui/Input';
import { formatPrice } from '../../../utils/format';
import { PropertyStatus } from '../../../types';
import { Trash2Icon } from 'lucide-react';

const TABS = [
  { label: 'All', value: '' },
  { label: 'Pending', value: PropertyStatus.PENDING },
  { label: 'Approved', value: PropertyStatus.APPROVED },
  { label: 'Rejected', value: PropertyStatus.REJECTED },
];

type ConfirmTarget = { id: string; title: string };

export const AllListingsPage = () => {
  const [activeTab, setActiveTab] = useState('');
  const [search, setSearch] = useState('');

  const [approveTarget, setApproveTarget] = useState<ConfirmTarget | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<ConfirmTarget | null>(null);
  const [featuredTarget, setFeaturedTarget] = useState<{ id: string; title: string; featured: boolean } | null>(null);
  const [rejectModal, setRejectModal] = useState<ConfirmTarget | null>(null);
  const [reason, setReason] = useState('');
  const [isActing, setIsActing] = useState(false);

  const { data, isLoading } = useGetAdminPropertiesQuery({
    status: activeTab || undefined,
    search: search || undefined,
    limit: 50,
  });

  const [approve] = useApprovePropertyMutation();
  const [reject] = useRejectPropertyMutation();
  const [toggleFeatured] = useToggleFeaturedMutation();
  const [deleteProperty] = useDeletePropertyMutation();

  const properties = data?.data ?? [];

  const act = async (fn: () => Promise<unknown>, onDone: () => void) => {
    setIsActing(true);
    try { await fn(); } finally { setIsActing(false); onDone(); }
  };

  const handleApprove = () => approveTarget && act(() => approve(approveTarget.id), () => setApproveTarget(null));
  const handleDelete = () => deleteTarget && act(() => deleteProperty(deleteTarget.id), () => setDeleteTarget(null));
  const handleFeatured = () => featuredTarget && act(() => toggleFeatured(featuredTarget.id), () => setFeaturedTarget(null));
  const handleReject = () => rejectModal && reason.trim()
    && act(() => reject({ id: rejectModal.id, rejectionReason: reason }), () => { setRejectModal(null); setReason(''); });

  return (
    <div className="space-y-4">
      {/* Tabs */}
      <div className="flex gap-1 bg-cream rounded-xl p-1 w-fit overflow-x-auto">
        {TABS.map((tab) => (
          <button
            key={tab.value}
            onClick={() => setActiveTab(tab.value)}
            className={`px-3 sm:px-4 py-2 rounded-lg text-xs sm:text-sm font-semibold transition-all whitespace-nowrap ${
              activeTab === tab.value ? 'bg-white text-navy shadow-sm' : 'text-muted hover:text-navy'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Search */}
      <Input
        placeholder="Search listings..."
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        className="max-w-xs"
      />

      {/* Table */}
      <div className="bg-white border border-border rounded-xl overflow-hidden">
        {isLoading ? (
          <div className="py-20 text-center text-muted">Loading...</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-navy">
                <tr>
                  {['Property', 'Type', 'Provider', 'Price', 'Views', 'Status', 'Actions'].map((h) => (
                    <th key={h} className="px-4 py-3 text-left text-[10px] font-semibold uppercase tracking-wide text-white/70 whitespace-nowrap">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {properties.map((p) => (
                  <tr key={p.id} className="hover:bg-surface transition-colors">
                    <td className="px-4 py-3">
                      <div className="font-semibold text-navy">{p.title}</div>
                      <div className="text-xs text-muted whitespace-nowrap">{p.lga}, {p.state}</div>
                    </td>
                    <td className="px-4 py-3 text-muted whitespace-nowrap">{p.type}</td>
                    <td className="px-4 py-3 text-muted whitespace-nowrap">{p.submittedBy?.name}</td>
                    <td className="px-4 py-3 font-medium text-navy whitespace-nowrap">{formatPrice(p.price)}</td>
                    <td className="px-4 py-3 text-muted">{p.views}</td>
                    <td className="px-4 py-3"><Badge status={p.status} /></td>
                    <td className="px-4 py-3">
                      <div className="flex gap-1.5 flex-wrap">
                        {p.status === PropertyStatus.PENDING && (
                          <>
                            <Button variant="success" size="sm" onClick={() => setApproveTarget({ id: p.id, title: p.title })}>✓</Button>
                            <Button variant="danger" size="sm" onClick={() => setRejectModal({ id: p.id, title: p.title })}>✗</Button>
                          </>
                        )}
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => setFeaturedTarget({ id: p.id, title: p.title, featured: p.featured })}
                          title={p.featured ? 'Remove from featured' : 'Add to featured'}
                        >
                          {p.featured ? '★' : '☆'}
                        </Button>
                        <Button variant="danger" size="sm" onClick={() => setDeleteTarget({ id: p.id, title: p.title })}>
                          <Trash2Icon size={14} />
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            {properties.length === 0 && (
              <div className="py-16 text-center text-muted text-sm">No listings found</div>
            )}
          </div>
        )}
      </div>

      {/* Approve */}
      <ConfirmModal
        isOpen={!!approveTarget}
        onClose={() => setApproveTarget(null)}
        onConfirm={handleApprove}
        loading={isActing}
        title="Approve Listing"
        message={`Approve "${approveTarget?.title}"? It will go live on the marketplace immediately.`}
        confirmLabel="Approve"
        variant="success"
      />

      {/* Delete */}
      <ConfirmModal
        isOpen={!!deleteTarget}
        onClose={() => setDeleteTarget(null)}
        onConfirm={handleDelete}
        loading={isActing}
        title="Delete Listing"
        message={`Permanently delete "${deleteTarget?.title}"? This action cannot be undone.`}
        confirmLabel="Delete"
        variant="danger"
      />

      {/* Featured toggle */}
      <ConfirmModal
        isOpen={!!featuredTarget}
        onClose={() => setFeaturedTarget(null)}
        onConfirm={handleFeatured}
        loading={isActing}
        title={featuredTarget?.featured ? 'Remove from Featured' : 'Add to Featured'}
        message={featuredTarget?.featured
          ? `Remove "${featuredTarget?.title}" from the featured section?`
          : `Feature "${featuredTarget?.title}" on the marketplace homepage?`}
        confirmLabel={featuredTarget?.featured ? 'Remove' : 'Feature'}
        variant={featuredTarget?.featured ? 'warning' : 'success'}
      />

      {/* Reject */}
      <Modal
        isOpen={!!rejectModal}
        onClose={() => setRejectModal(null)}
        title={`Reject: ${rejectModal?.title}`}
        size="sm"
        footer={
          <>
            <Button variant="ghost" onClick={() => setRejectModal(null)} disabled={isActing}>Cancel</Button>
            <Button variant="danger" onClick={handleReject} loading={isActing} disabled={!reason.trim()}>
              Confirm Rejection
            </Button>
          </>
        }
      >
        <Input
          label="Rejection Reason"
          placeholder="Explain why..."
          value={reason}
          onChange={(e) => setReason(e.target.value)}
        />
      </Modal>
    </div>
  );
};
