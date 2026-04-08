import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  useGetMyPropertiesQuery,
  useMarkPropertySoldMutation,
  useDeletePropertyMutation,
} from '../../../features/properties/propertiesApi';
import { Badge } from '../../../components/ui/Badge';
import { Button } from '../../../components/ui/Button';
import { Modal } from '../../../components/ui/Modal';
import { ConfirmModal } from '../../../components/ui/ConfirmModal';
import { Input } from '../../../components/ui/Input';
import { formatPrice, formatDate } from '../../../utils/format';
import { PropertyStatus } from '../../../types';
import { Trash2Icon } from 'lucide-react';

export const MyListingsPage = () => {
  const navigate = useNavigate();
  const { data, isLoading } = useGetMyPropertiesQuery({ limit: 50 });
  const [markSold] = useMarkPropertySoldMutation();
  const [deleteProperty] = useDeletePropertyMutation();

  const [soldModal, setSoldModal] = useState<{ id: string; title: string } | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<{ id: string; title: string } | null>(null);
  const [salePrice, setSalePrice] = useState('');
  const [isActing, setIsActing] = useState(false);

  const properties = data?.data ?? [];

  const handleMarkSold = async () => {
    if (!soldModal) return;
    setIsActing(true);
    try { await markSold({ id: soldModal.id, salePrice: salePrice ? Number(salePrice) : undefined }); }
    finally { setIsActing(false); setSoldModal(null); setSalePrice(''); }
  };

  const handleDelete = async () => {
    if (!deleteTarget) return;
    setIsActing(true);
    try { await deleteProperty(deleteTarget.id); }
    finally { setIsActing(false); setDeleteTarget(null); }
  };

  if (isLoading) return <div className="py-20 text-center text-muted">Loading...</div>;

  return (
    <div className="space-y-4">
      <div className="flex justify-end">
        <Button onClick={() => navigate('/dashboard/submit')}>+ Submit Property</Button>
      </div>

      {properties.length === 0 ? (
        <div className="py-20 text-center">
          <div className="text-5xl mb-3">🏠</div>
          <h3 className="font-semibold text-navy">No listings yet</h3>
          <p className="text-sm text-muted mt-1 mb-4">Submit your first property for review.</p>
          <Button onClick={() => navigate('/dashboard/submit')}>Submit Property</Button>
        </div>
      ) : (
        <div className="bg-white border border-border rounded-xl overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-navy">
                <tr>
                  {['Property', 'Price', 'Submitted', 'Status', 'Actions'].map((h) => (
                    <th key={h} className="px-4 py-3 text-left text-[10px] font-semibold uppercase tracking-wide text-white/70 whitespace-nowrap">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {properties.map((p) => (
                  <tr key={p.id} className="hover:bg-surface transition-colors">
                    <td className="px-4 py-3">
                      <div className="font-semibold text-navy">{p.title}</div>
                      {p.status === PropertyStatus.REJECTED && p.rejectionReason && (
                        <div className="text-xs text-red-500 mt-0.5">❌ {p.rejectionReason}</div>
                      )}
                    </td>
                    <td className="px-4 py-3 font-medium text-navy whitespace-nowrap">{formatPrice(p.price)}</td>
                    <td className="px-4 py-3 text-muted whitespace-nowrap">{formatDate(p.createdAt)}</td>
                    <td className="px-4 py-3"><Badge status={p.status} /></td>
                    <td className="px-4 py-3">
                      <div className="flex gap-1.5 flex-wrap">
                        {p.status === PropertyStatus.APPROVED && (
                          <Button variant="ghost" size="sm" onClick={() => setSoldModal({ id: p.id, title: p.title })}>
                            Mark Sold
                          </Button>
                        )}
                        {(p.status === PropertyStatus.REJECTED || p.status === PropertyStatus.PENDING) && (
                          <Button variant="ghost" size="sm">Edit & Resubmit</Button>
                        )}
                        <Button variant="danger" size="sm" onClick={() => setDeleteTarget({ id: p.id, title: p.title })}>
                          <Trash2Icon size={14} />
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Mark Sold */}
      <Modal
        isOpen={!!soldModal}
        onClose={() => setSoldModal(null)}
        title={`Mark as Sold: ${soldModal?.title}`}
        size="sm"
        footer={
          <>
            <Button variant="ghost" onClick={() => setSoldModal(null)} disabled={isActing}>Cancel</Button>
            <Button onClick={handleMarkSold} loading={isActing}>Confirm Sale</Button>
          </>
        }
      >
        <Input
          label="Sale Price (optional)"
          type="number"
          placeholder="Enter final sale price in ₦"
          value={salePrice}
          onChange={(e) => setSalePrice(e.target.value)}
        />
      </Modal>

      {/* Delete */}
      <ConfirmModal
        isOpen={!!deleteTarget}
        onClose={() => setDeleteTarget(null)}
        onConfirm={handleDelete}
        loading={isActing}
        title="Delete Listing"
        message={`Permanently delete "${deleteTarget?.title}"? This cannot be undone.`}
        confirmLabel="Delete"
        variant="danger"
      />
    </div>
  );
};
