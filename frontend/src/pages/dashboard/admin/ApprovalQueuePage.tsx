import { useState } from 'react';
import {
  useGetAdminPropertiesQuery,
  useApprovePropertyMutation,
  useRejectPropertyMutation,
  useUpdatePropertyMutation,
} from '../../../features/properties/propertiesApi';
import { Badge } from '../../../components/ui/Badge';
import { Button } from '../../../components/ui/Button';
import { Modal } from '../../../components/ui/Modal';
import { ConfirmModal } from '../../../components/ui/ConfirmModal';
import { Input } from '../../../components/ui/Input';
import { Select } from '../../../components/ui/Select';
import { formatPrice, formatDate } from '../../../utils/format';
import { getImageUrl } from '../../../utils/imageUrl';
import { Property, PropertyStatus, PropertyType } from '../../../types';
import { NIGERIAN_STATES } from '../../../constants/nigerianStates';

const AMENITIES = ['Pool', 'BQ', 'Generator', 'CCTV', 'Gym', 'Elevator', 'Concierge', 'Smart Home', 'Security', 'Parking'];

type ReviewForm = {
  type: PropertyType | '';
  title: string;
  price: string;
  state: string;
  lga: string;
  area: string;
  description: string;
  beds: string;
  baths: string;
  sqm: string;
  amenities: string[];
  images: string[];
};

function propertyToForm(p: Property): ReviewForm {
  return {
    type: p.type,
    title: p.title,
    price: String(p.price),
    state: p.state,
    lga: p.lga,
    area: p.area,
    description: p.description,
    beds: p.beds != null ? String(p.beds) : '',
    baths: p.baths != null ? String(p.baths) : '',
    sqm: p.sqm != null ? String(p.sqm) : '',
    amenities: p.amenities ?? [],
    images: p.images ?? [],
  };
}

export const ApprovalQueuePage = () => {
  const { data, isLoading } = useGetAdminPropertiesQuery({ status: PropertyStatus.PENDING, limit: 50 });
  const [approve] = useApprovePropertyMutation();
  const [reject] = useRejectPropertyMutation();
  const [updateProperty] = useUpdatePropertyMutation();

  const [approveTarget, setApproveTarget] = useState<{ id: string; title: string } | null>(null);
  const [rejectModal, setRejectModal] = useState<{ id: string; title: string } | null>(null);
  const [reason, setReason] = useState('');
  const [isActing, setIsActing] = useState(false);

  const [viewProperty, setViewProperty] = useState<Property | null>(null);
  const [reviewForm, setReviewForm] = useState<ReviewForm | null>(null);
  const [viewImageIdx, setViewImageIdx] = useState(0);
  const [rejectFromView, setRejectFromView] = useState(false);
  const [viewReason, setViewReason] = useState('');

  const pending = data?.data ?? [];

  const openView = (p: Property) => {
    setViewProperty(p);
    setReviewForm(propertyToForm(p));
    setViewImageIdx(0);
    setRejectFromView(false);
    setViewReason('');
  };

  const setForm = (field: keyof ReviewForm, value: unknown) =>
    setReviewForm((prev) => prev ? { ...prev, [field]: value } : prev);

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

  const handleApproveFromView = async () => {
    if (!viewProperty || !reviewForm) return;
    setIsActing(true);
    try {
      // Save any edits first, then approve
      await updateProperty({
        id: viewProperty.id,
        data: {
          type: reviewForm.type as PropertyType,
          title: reviewForm.title,
          price: Number(reviewForm.price),
          state: reviewForm.state,
          lga: reviewForm.lga,
          area: reviewForm.area,
          description: reviewForm.description,
          beds: reviewForm.beds ? Number(reviewForm.beds) : undefined,
          baths: reviewForm.baths ? Number(reviewForm.baths) : undefined,
          sqm: reviewForm.sqm ? Number(reviewForm.sqm) : undefined,
          amenities: reviewForm.amenities,
          images: reviewForm.images,
        },
      }).unwrap();
      await approve(viewProperty.id).unwrap();
      setViewProperty(null);
    } finally {
      setIsActing(false);
    }
  };

  const handleRejectFromView = async () => {
    if (!viewProperty || !viewReason.trim()) return;
    setIsActing(true);
    try {
      await reject({ id: viewProperty.id, rejectionReason: viewReason }).unwrap();
      setViewProperty(null);
    } finally {
      setIsActing(false);
    }
  };

  if (isLoading) return <div className="text-center py-20 text-muted">Loading...</div>;

  return (
    <div className="space-y-4">
      <div className="bg-amber-50 border border-amber-200 rounded-xl p-4">
        <h5 className="text-xs font-bold uppercase tracking-wide text-amber-800 mb-1">Review Checklist</h5>
        <p className="text-xs text-amber-700">
          Before approving: verify image quality, confirm pricing in NGN, ensure no phone/email embedded in text, check all fields are complete. Review any uploaded supporting documents (CofO, survey plans, etc.).
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
          <div className="w-12 h-12 rounded-xl bg-cream flex items-center justify-center text-2xl flex-shrink-0">
            {p.images?.[0]
              ? <img src={getImageUrl(p.images[0])} alt="" className="w-full h-full object-cover rounded-xl" />
              : '🏠'}
          </div>
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
          <div className="flex flex-wrap gap-2 sm:flex-shrink-0">
            <Button variant="ghost" size="sm" onClick={() => openView(p)}>
              View
            </Button>
            <Button variant="success" size="sm" onClick={() => setApproveTarget({ id: p.id, title: p.title })}>
              ✓ Approve
            </Button>
            <Button variant="danger" size="sm" onClick={() => setRejectModal({ id: p.id, title: p.title })}>
              ✗ Reject
            </Button>
          </div>
        </div>
      ))}

      {/* ── View / Review Modal ── */}
      {viewProperty && reviewForm && (
        <Modal
          isOpen
          onClose={() => setViewProperty(null)}
          title={`Review: ${viewProperty.title}`}
          size="lg"
          footer={
            rejectFromView ? (
              <>
                <Button variant="ghost" onClick={() => setRejectFromView(false)} disabled={isActing}>Back</Button>
                <Button variant="danger" onClick={handleRejectFromView} loading={isActing} disabled={!viewReason.trim()}>
                  Confirm Rejection
                </Button>
              </>
            ) : (
              <>
                <Button variant="ghost" onClick={() => setViewProperty(null)} disabled={isActing}>Close</Button>
                <Button variant="danger" onClick={() => setRejectFromView(true)} disabled={isActing}>
                  ✗ Reject
                </Button>
                <Button variant="success" onClick={handleApproveFromView} loading={isActing}>
                  ✓ Approve
                </Button>
              </>
            )
          }
        >
          {rejectFromView ? (
            <div className="space-y-3">
              <p className="text-sm text-muted">Provide a reason that will be shown to the agent.</p>
              <Input
                label="Rejection Reason"
                placeholder="Explain why this listing is being rejected..."
                value={viewReason}
                onChange={(e) => setViewReason(e.target.value)}
              />
            </div>
          ) : (
            <div className="space-y-5">
              {/* Image gallery */}
              {reviewForm.images.length > 0 && (
                <div>
                  <div className="aspect-video rounded-xl overflow-hidden bg-gray-100 mb-2">
                    <img
                      src={getImageUrl(reviewForm.images[viewImageIdx])}
                      alt=""
                      className="w-full h-full object-cover"
                    />
                  </div>
                  {reviewForm.images.length > 1 && (
                    <div className="flex gap-2 overflow-x-auto pb-1">
                      {reviewForm.images.map((img, i) => (
                        <button
                          key={i}
                          onClick={() => setViewImageIdx(i)}
                          className={`flex-shrink-0 w-16 h-16 rounded-lg overflow-hidden border-2 transition-colors ${i === viewImageIdx ? 'border-teal' : 'border-border'}`}
                        >
                          <img src={getImageUrl(img)} alt="" className="w-full h-full object-cover" />
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              )}

              {/* Supporting documents */}
              {viewProperty.documents && viewProperty.documents.length > 0 ? (
                <div className="border border-border rounded-xl overflow-hidden">
                  <div className="bg-amber-50 border-b border-amber-200 px-4 py-2.5 flex items-center gap-2">
                    <svg className="w-4 h-4 text-amber-600 flex-shrink-0" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"/>
                    </svg>
                    <span className="text-xs font-bold text-amber-800 uppercase tracking-wide">
                      Supporting Documents ({viewProperty.documents.length})
                    </span>
                  </div>
                  <div className="divide-y divide-border">
                    {viewProperty.documents.map((doc, i) => {
                      const filename = doc.split('/').pop() ?? doc;
                      const isPdf = filename.toLowerCase().endsWith('.pdf');
                      const docUrl = getImageUrl(doc);
                      return (
                        <div key={i} className="flex items-center gap-3 px-4 py-3">
                          <div className={`w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 ${isPdf ? 'bg-red-50' : 'bg-blue-50'}`}>
                            {isPdf ? (
                              <svg className="w-4 h-4 text-red-500" fill="currentColor" viewBox="0 0 24 24">
                                <path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8l-6-6zm-1 1.5L18.5 9H13V3.5zM8.5 17a.5.5 0 01-.5-.5v-1a.5.5 0 011 0v1a.5.5 0 01-.5.5zm3-3h-3v-1h3v1zm0-2h-3v-1h3v1zm4 5h-3v-1h3v1zm0-2h-3v-1h3v1zm0-2h-3v-1h3v1z"/>
                              </svg>
                            ) : (
                              <svg className="w-4 h-4 text-blue-500" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                                <rect x="3" y="3" width="18" height="18" rx="2"/><circle cx="8.5" cy="8.5" r="1.5"/><polyline points="21 15 16 10 5 21"/>
                              </svg>
                            )}
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="text-xs font-semibold text-navy truncate">{filename}</div>
                            <div className="text-[10px] text-muted">{isPdf ? 'PDF Document' : 'Image'}</div>
                          </div>
                          <a
                            href={docUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="flex-shrink-0 text-xs font-semibold text-teal hover:underline"
                          >
                            Open ↗
                          </a>
                        </div>
                      );
                    })}
                  </div>
                </div>
              ) : (
                <div className="flex items-center gap-2 px-4 py-3 bg-surface border border-border rounded-xl">
                  <svg className="w-4 h-4 text-muted flex-shrink-0" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"/>
                  </svg>
                  <span className="text-xs text-muted">No supporting documents uploaded</span>
                </div>
              )}

              {/* Submitted by */}
              <div className="flex items-center gap-3 p-3 bg-surface rounded-lg">
                <div className="w-8 h-8 rounded-full bg-teal flex items-center justify-center text-white text-xs font-bold">
                  {viewProperty.submittedBy?.name?.charAt(0)}
                </div>
                <div>
                  <p className="text-xs font-semibold text-navy">{viewProperty.submittedBy?.name}</p>
                  <p className="text-xs text-muted">Submitted {formatDate(viewProperty.createdAt)}</p>
                </div>
              </div>

              <p className="text-xs text-muted font-semibold uppercase tracking-wide">— You may edit fields below before approving —</p>

              {/* Editable type */}
              <div>
                <label className="text-xs font-semibold uppercase tracking-wide text-navy block mb-2">Property Type</label>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                  {(Object.values(PropertyType) as PropertyType[]).map((t) => (
                    <button
                      key={t}
                      type="button"
                      onClick={() => setForm('type', t)}
                      className={`py-1.5 px-2 rounded-lg border text-xs font-semibold text-center transition-all ${reviewForm.type === t ? 'bg-navy text-white border-navy' : 'border-border text-ink hover:border-teal/50'}`}
                    >
                      {t}
                    </button>
                  ))}
                </div>
              </div>

              <Input label="Title" value={reviewForm.title} onChange={(e) => setForm('title', e.target.value)} />

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <Input label="Price (₦)" type="number" value={reviewForm.price} onChange={(e) => setForm('price', e.target.value)} />
                <Select
                  label="State"
                  options={NIGERIAN_STATES.map((s) => ({ value: s.label, label: s.label }))}
                  value={reviewForm.state}
                  onChange={(e) => setReviewForm((prev) => prev ? { ...prev, state: e.target.value, lga: '' } : prev)}
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <Select
                  label="LGA"
                  placeholder={reviewForm.state ? 'Select LGA...' : 'Select a state first'}
                  options={(NIGERIAN_STATES.find((s) => s.label === reviewForm.state)?.lgas ?? []).map((l) => ({ value: l.value, label: l.label }))}
                  value={reviewForm.lga}
                  onChange={(e) => setForm('lga', e.target.value)}
                  disabled={!reviewForm.state}
                />
                <Input label="Area" value={reviewForm.area} onChange={(e) => setForm('area', e.target.value)} />
              </div>

              <div className="grid grid-cols-3 gap-3 sm:gap-4">
                <Input label="Bedrooms" type="number" value={reviewForm.beds} onChange={(e) => setForm('beds', e.target.value)} />
                <Input label="Bathrooms" type="number" value={reviewForm.baths} onChange={(e) => setForm('baths', e.target.value)} />
                <Input label="Size (m²)" type="number" value={reviewForm.sqm} onChange={(e) => setForm('sqm', e.target.value)} />
              </div>

              <div>
                <label className="text-xs font-semibold uppercase tracking-wide text-navy block mb-1.5">Description</label>
                <textarea
                  rows={4}
                  value={reviewForm.description}
                  onChange={(e) => setForm('description', e.target.value)}
                  className="w-full px-3.5 py-2.5 border border-border rounded-lg text-sm text-ink bg-white outline-none transition-colors focus:border-teal resize-none"
                />
              </div>

              <div>
                <label className="text-xs font-semibold uppercase tracking-wide text-navy block mb-2">Amenities</label>
                <div className="flex flex-wrap gap-2">
                  {AMENITIES.map((a) => (
                    <button
                      key={a}
                      type="button"
                      onClick={() => setForm('amenities', reviewForm.amenities.includes(a) ? reviewForm.amenities.filter((x) => x !== a) : [...reviewForm.amenities, a])}
                      className={`px-3 py-1.5 rounded-full text-xs border transition-all ${reviewForm.amenities.includes(a) ? 'bg-teal text-white border-teal' : 'bg-white text-ink border-border hover:border-teal/50'}`}
                    >
                      {a}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          )}
        </Modal>
      )}

      {/* Approve Confirm (from list) */}
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

      {/* Reject Modal (from list) */}
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
