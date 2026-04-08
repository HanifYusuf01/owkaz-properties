import { useState } from 'react';
import {
  useGetAdminPropertiesQuery,
  useApprovePropertyMutation,
  useRejectPropertyMutation,
} from '../../../features/properties/propertiesApi';
import { Badge } from '../../../components/ui/Badge';
import { Button } from '../../../components/ui/Button';
import { Modal } from '../../../components/ui/Modal';
import { ConfirmModal } from '../../../components/ui/ConfirmModal';
import { Input } from '../../../components/ui/Input';
import { formatPrice, formatDate } from '../../../utils/format';
import { PropertyStatus } from '../../../types';

export const ApprovalQueuePage = () => {
  const { data, isLoading } = useGetAdminPropertiesQuery({ status: PropertyStatus.PENDING, limit: 50 });
  const [approve] = useApprovePropertyMutation();
  const [reject] = useRejectPropertyMutation();

  const [approveTarget, setApproveTarget] = useState<{ id: string; title: string } | null>(null);
  const [rejectModal, setRejectModal] = useState<{ id: string; title: string } | null>(null);
  const [reason, setReason] = useState('');
  const [isActing, setIsActing] = useState(false);

  const pending = data?.data ?? [];

  const handleApprove = async () => {
    if (!approveTarget) return;
    setIsActing(true);
    try { await approve(approveTarget.id); }
    finally { setIsActing(false); setApproveTarget(null); }
  };

  const handleReject = async () => {
    if (!rejectModal || !reason.trim()) return;
    setIsActing(true);
    try { await reject({ id: rejectModal.id, rejectionReason: reason }); }
    finally { setIsActing(false); setRejectModal(null); setReason(''); }
  };

  if (isLoading) return <div className="text-center py-20 text-muted">Loading...</div>;

  return (
    <div className="space-y-4">
      <div className="bg-amber-50 border border-amber-200 rounded-xl p-4">
        <h5 className="text-xs font-bold uppercase tracking-wide text-amber-800 mb-1">Review Checklist</h5>
        <p className="text-xs text-amber-700">
          Before approving: verify image quality, confirm pricing in NGN, ensure no phone/email embedded in text, check all fields are complete.
        </p>
      </div>

      {pending.length === 0 && (
        <div className="text-center py-20">
          <div className="text-5xl mb-3">✨</div>
          <h3 className="font-semibold text-navy">Queue is clear!</h3>
          <p className="text-sm text-muted mt-1">All listings have been reviewed.</p>
        </div>
      )}

      {pending.map((p) => (
        <div key={p.id} className="bg-white border border-border rounded-xl p-4 sm:p-5 flex flex-col sm:flex-row gap-4 sm:items-start hover:border-teal transition-colors">
          <div className="w-12 h-12 rounded-xl bg-cream flex items-center justify-center text-2xl flex-shrink-0">🏠</div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="font-bold text-navy">{p.title}</span>
              <Badge status="pending" />
            </div>
            <div className="text-xs text-muted mt-1">
              📍 {p.area}, {p.lga} · {formatPrice(p.price)} · by {p.submittedBy?.name} · {formatDate(p.createdAt)}
            </div>
            <div className="text-xs text-muted mt-0.5">
              {p.beds} beds · {p.baths} baths · {p.sqm} m²
            </div>
            {p.description && (
              <p className="text-xs text-ink mt-2 line-clamp-2">{p.description}</p>
            )}
          </div>
          <div className="flex gap-2 sm:flex-shrink-0">
            <Button variant="success" size="sm" onClick={() => setApproveTarget({ id: p.id, title: p.title })}>
              ✓ Approve
            </Button>
            <Button variant="danger" size="sm" onClick={() => setRejectModal({ id: p.id, title: p.title })}>
              ✗ Reject
            </Button>
          </div>
        </div>
      ))}

      {/* Approve Confirm */}
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

      {/* Reject Modal */}
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
          placeholder="Explain why this listing is being rejected..."
          value={reason}
          onChange={(e) => setReason(e.target.value)}
        />
      </Modal>
    </div>
  );
};
