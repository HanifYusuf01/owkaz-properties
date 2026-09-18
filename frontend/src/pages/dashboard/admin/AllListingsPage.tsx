import { useRef, useState } from 'react';
import {
  useGetAdminPropertiesQuery,
  useApprovePropertyMutation,
  useRejectPropertyMutation,
  useToggleFeaturedMutation,
  useDeletePropertyMutation,
  useUpdatePropertyMutation,
  useUploadImagesMutation,
} from '../../../features/properties/propertiesApi';
import { Badge } from '../../../components/ui/Badge';
import { Button } from '../../../components/ui/Button';
import { Modal } from '../../../components/ui/Modal';
import { ConfirmModal } from '../../../components/ui/ConfirmModal';
import { Input } from '../../../components/ui/Input';
import { Select } from '../../../components/ui/Select';
import { DataTable, Column } from '../../../components/ui/DataTable';
import { formatPrice } from '../../../utils/format';
import { getImageUrl } from '../../../utils/imageUrl';
import { Property, PropertyStatus, PropertyType } from '../../../types';
import { NIGERIAN_STATES } from '../../../constants/nigerianStates';
import { Pencil, Trash2Icon } from 'lucide-react';
import { AddressSearchInput } from '../../../components/property/AddressSearchInput';

const TABS = [
  { label: 'All', value: '' },
  { label: 'Pending', value: PropertyStatus.PENDING },
  { label: 'Approved', value: PropertyStatus.APPROVED },
  { label: 'Rejected', value: PropertyStatus.REJECTED },
];

const AMENITIES = ['Pool', 'BQ', 'Generator', 'CCTV', 'Gym', 'Elevator', 'Concierge', 'Smart Home', 'Security', 'Parking'];

type ConfirmTarget = { id: string; title: string };

type EditForm = {
  type: PropertyType | '';
  title: string;
  price: string;
  state: string;
  lga: string;
  area: string;
  latitude: number | null;
  longitude: number | null;
  description: string;
  beds: string;
  baths: string;
  sqm: string;
  amenities: string[];
  existingImages: string[];
  newPhotos: File[];
};

function propertyToEdit(p: Property): EditForm {
  return {
    type: p.type,
    title: p.title,
    price: String(p.price),
    state: p.state,
    lga: p.lga,
    area: p.area,
    latitude: p.latitude ?? null,
    longitude: p.longitude ?? null,
    description: p.description,
    beds: p.beds != null ? String(p.beds) : '',
    baths: p.baths != null ? String(p.baths) : '',
    sqm: p.sqm != null ? String(p.sqm) : '',
    amenities: p.amenities ?? [],
    existingImages: p.images ?? [],
    newPhotos: [],
  };
}

const PAGE_SIZE = 10;

export const AllListingsPage = () => {
  const [activeTab, setActiveTab] = useState('');
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);

  const [approveTarget, setApproveTarget] = useState<ConfirmTarget | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<ConfirmTarget | null>(null);
  const [featuredTarget, setFeaturedTarget] = useState<{ id: string; title: string; featured: boolean } | null>(null);
  const [rejectModal, setRejectModal] = useState<ConfirmTarget | null>(null);
  const [reason, setReason] = useState('');
  const [isActing, setIsActing] = useState(false);

  const [editTarget, setEditTarget] = useState<Property | null>(null);
  const [editForm, setEditForm] = useState<EditForm | null>(null);
  const [editError, setEditError] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const editFileRef = useRef<HTMLInputElement>(null);

  const { data, isLoading } = useGetAdminPropertiesQuery({
    status: activeTab || undefined,
    search: search || undefined,
    page,
    limit: PAGE_SIZE,
  });

  const [approve] = useApprovePropertyMutation();
  const [reject] = useRejectPropertyMutation();
  const [toggleFeatured] = useToggleFeaturedMutation();
  const [deleteProperty] = useDeletePropertyMutation();
  const [updateProperty] = useUpdatePropertyMutation();
  const [uploadImages] = useUploadImagesMutation();

  const properties = data?.data ?? [];
  const total = data?.total ?? 0;
  const totalPages = data?.totalPages ?? 1;

  const act = async (fn: () => Promise<unknown>, onDone: () => void) => {
    setIsActing(true);
    try { await fn(); } finally { setIsActing(false); onDone(); }
  };

  const handleApprove = () => approveTarget && act(() => approve(approveTarget.id), () => setApproveTarget(null));
  const handleDelete = () => deleteTarget && act(() => deleteProperty(deleteTarget.id), () => setDeleteTarget(null));
  const handleFeatured = () => featuredTarget && act(() => toggleFeatured(featuredTarget.id), () => setFeaturedTarget(null));
  const handleReject = () => rejectModal && reason.trim()
    && act(() => reject({ id: rejectModal.id, rejectionReason: reason }), () => { setRejectModal(null); setReason(''); });

  const openEdit = (p: Property) => {
    setEditTarget(p);
    setEditForm(propertyToEdit(p));
    setEditError(null);
  };

  const setField = (field: keyof EditForm, value: unknown) =>
    setEditForm((prev) => prev ? { ...prev, [field]: value } : prev);

  const onEditFilesSelected = (files: FileList | null) => {
    if (!files || !editForm) return;
    const arr = Array.from(files).filter((f) => f.type.startsWith('image/'));
    const total = editForm.existingImages.length + editForm.newPhotos.length;
    const allowed = Math.max(0, 20 - total);
    setField('newPhotos', [...editForm.newPhotos, ...arr].slice(0, allowed));
  };

  const handleSaveEdit = async () => {
    if (!editTarget || !editForm) return;
    if (editForm.existingImages.length === 0 && editForm.newPhotos.length === 0) {
      setEditError('At least 1 photo is required');
      return;
    }
    setEditError(null);
    setIsSaving(true);
    try {
      let newUrls: string[] = [];
      if (editForm.newPhotos.length > 0) {
        const fd = new FormData();
        editForm.newPhotos.forEach((f) => fd.append('files', f));
        const { urls } = await uploadImages(fd).unwrap();
        newUrls = urls;
      }

      await updateProperty({
        id: editTarget.id,
        data: {
          type: editForm.type as PropertyType,
          title: editForm.title,
          price: Number(editForm.price),
          state: editForm.state,
          lga: editForm.lga,
          area: editForm.area,
          ...(editForm.latitude != null ? { latitude: editForm.latitude } : {}),
          ...(editForm.longitude != null ? { longitude: editForm.longitude } : {}),
          description: editForm.description,
          beds: editForm.beds ? Number(editForm.beds) : undefined,
          baths: editForm.baths ? Number(editForm.baths) : undefined,
          sqm: editForm.sqm ? Number(editForm.sqm) : undefined,
          amenities: editForm.amenities,
          images: [...editForm.existingImages, ...newUrls],
        },
      }).unwrap();
      setEditTarget(null);
    } catch {
      setEditError('Update failed. Please try again.');
    } finally {
      setIsSaving(false);
    }
  };

  const columns: Column<Property>[] = [
    {
      key: 'property',
      header: 'Property',
      cell: (p) => (
        <>
          <div className="font-semibold text-navy">{p.title}</div>
          <div className="text-xs text-muted whitespace-nowrap">{p.lga}, {p.state}</div>
        </>
      ),
    },
    { key: 'type', header: 'Type', className: 'text-muted whitespace-nowrap', cell: (p) => p.type },
    { key: 'provider', header: 'Provider', className: 'text-muted whitespace-nowrap', cell: (p) => p.submittedBy?.name },
    { key: 'price', header: 'Price', className: 'font-medium text-navy whitespace-nowrap', cell: (p) => formatPrice(p.price) },
    { key: 'views', header: 'Views', className: 'text-muted', cell: (p) => p.views },
    { key: 'status', header: 'Status', cell: (p) => <Badge status={p.status} /> },
    {
      key: 'actions',
      header: 'Actions',
      cell: (p) => (
        <div className="flex gap-1.5 flex-wrap">
          {p.status === PropertyStatus.PENDING && (
            <>
              <Button variant="success" size="sm" onClick={() => setApproveTarget({ id: p.id, title: p.title })}>✓</Button>
              <Button variant="danger" size="sm" onClick={() => setRejectModal({ id: p.id, title: p.title })}>✗</Button>
            </>
          )}
          <Button variant="ghost" size="sm" onClick={() => openEdit(p)} title="Edit listing">
            <Pencil size={13} />
          </Button>
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
      ),
    },
  ];

  return (
    <div className="space-y-4">
      {/* Tabs */}
      <div className="flex gap-1 bg-cream rounded-xl p-1 w-fit overflow-x-auto">
        {TABS.map((tab) => (
          <button
            key={tab.value}
            onClick={() => { setActiveTab(tab.value); setPage(1); }}
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
        onChange={(e) => { setSearch(e.target.value); setPage(1); }}
        className="max-w-xs"
      />

      <DataTable
        columns={columns}
        rows={properties}
        rowKey={(p) => p.id}
        isLoading={isLoading}
        page={page}
        totalPages={totalPages}
        total={total}
        onPageChange={setPage}
        emptyState={<div className="py-16 text-center text-muted text-sm bg-white border border-border rounded-xl">No listings found</div>}
      />

      {/* ── Edit Modal ── */}
      {editTarget && editForm && (
        <Modal
          isOpen
          onClose={() => setEditTarget(null)}
          title={`Edit: ${editTarget.title}`}
          size="lg"
          footer={
            <>
              <Button variant="ghost" onClick={() => setEditTarget(null)} disabled={isSaving}>Cancel</Button>
              <Button onClick={handleSaveEdit} loading={isSaving}>Save Changes</Button>
            </>
          }
        >
          <div className="space-y-5">
            {/* Photos */}
            <div>
              <label className="text-xs font-semibold uppercase tracking-wide text-navy block mb-2">Photos</label>
              <div className="grid grid-cols-3 sm:grid-cols-4 gap-2 mb-2">
                {editForm.existingImages.map((url, i) => (
                  <div key={`e-${i}`} className="relative group aspect-square rounded-lg overflow-hidden border border-border">
                    <img src={getImageUrl(url)} alt="" className="w-full h-full object-cover" />
                    <button
                      type="button"
                      onClick={() => setField('existingImages', editForm.existingImages.filter((_, idx) => idx !== i))}
                      className="absolute top-1 right-1 w-5 h-5 rounded-full bg-black/60 text-white text-xs flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                    >×</button>
                  </div>
                ))}
                {editForm.newPhotos.map((file, i) => (
                  <div key={`n-${i}`} className="relative group aspect-square rounded-lg overflow-hidden border border-teal/40">
                    <img src={URL.createObjectURL(file)} alt="" className="w-full h-full object-cover" />
                    <button
                      type="button"
                      onClick={() => setField('newPhotos', editForm.newPhotos.filter((_, idx) => idx !== i))}
                      className="absolute top-1 right-1 w-5 h-5 rounded-full bg-black/60 text-white text-xs flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                    >×</button>
                  </div>
                ))}
                {(editForm.existingImages.length + editForm.newPhotos.length) < 20 && (
                  <button
                    type="button"
                    onClick={() => editFileRef.current?.click()}
                    className="aspect-square rounded-lg border-2 border-dashed border-gray-300 flex items-center justify-center text-gray-400 hover:border-teal/60 hover:text-teal transition-colors text-2xl"
                  >+</button>
                )}
              </div>
              <input ref={editFileRef} type="file" accept="image/jpeg,image/png,image/webp" multiple className="hidden" onChange={(e) => onEditFilesSelected(e.target.files)} />
              {editError && <p className="text-xs text-red-500">{editError}</p>}
            </div>

            {/* Type selector */}
            <div>
              <label className="text-xs font-semibold uppercase tracking-wide text-navy block mb-2">Property Type</label>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                {(Object.values(PropertyType) as PropertyType[]).map((t) => (
                  <button
                    key={t}
                    type="button"
                    onClick={() => setField('type', t)}
                    className={`py-1.5 px-2 rounded-lg border text-xs font-semibold text-center transition-all ${editForm.type === t ? 'bg-navy text-white border-navy' : 'border-border text-ink hover:border-teal/50'}`}
                  >
                    {t}
                  </button>
                ))}
              </div>
            </div>

            <Input label="Title" value={editForm.title} onChange={(e) => setField('title', e.target.value)} />

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Input label="Price (₦)" type="number" value={editForm.price} onChange={(e) => setField('price', e.target.value)} />
              <Select
                label="State"
                options={NIGERIAN_STATES.map((s) => ({ value: s.label, label: s.label }))}
                value={editForm.state}
                onChange={(e) => setEditForm((prev) => prev ? { ...prev, state: e.target.value, lga: '' } : prev)}
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Select
                label="LGA"
                placeholder={editForm.state ? 'Select LGA...' : 'Select a state first'}
                options={(NIGERIAN_STATES.find((s) => s.label === editForm.state)?.lgas ?? []).map((l) => ({ value: l.value, label: l.label }))}
                value={editForm.lga}
                onChange={(e) => setField('lga', e.target.value)}
                disabled={!editForm.state}
              />
              <Input label="Area" value={editForm.area} onChange={(e) => setField('area', e.target.value)} />
            </div>

            <AddressSearchInput
              latitude={editForm.latitude}
              longitude={editForm.longitude}
              onSelect={({ lat, lng }) => setEditForm((prev) => (prev ? { ...prev, latitude: lat, longitude: lng } : prev))}
            />

            <div className="grid grid-cols-3 gap-3">
              <Input label="Bedrooms" type="number" value={editForm.beds} onChange={(e) => setField('beds', e.target.value)} />
              <Input label="Bathrooms" type="number" value={editForm.baths} onChange={(e) => setField('baths', e.target.value)} />
              <Input label="Size (m²)" type="number" value={editForm.sqm} onChange={(e) => setField('sqm', e.target.value)} />
            </div>

            <div>
              <label className="text-xs font-semibold uppercase tracking-wide text-navy block mb-1.5">Description</label>
              <textarea
                rows={4}
                value={editForm.description}
                onChange={(e) => setField('description', e.target.value)}
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
                    onClick={() => setField('amenities', editForm.amenities.includes(a)
                      ? editForm.amenities.filter((x) => x !== a)
                      : [...editForm.amenities, a])}
                    className={`px-3 py-1.5 rounded-full text-xs border transition-all ${editForm.amenities.includes(a) ? 'bg-teal text-white border-teal' : 'bg-white text-ink border-border hover:border-teal/50'}`}
                  >
                    {a}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </Modal>
      )}

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
