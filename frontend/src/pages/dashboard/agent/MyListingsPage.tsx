import { useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  useGetMyPropertiesQuery,
  useMarkPropertySoldMutation,
  useDeletePropertyMutation,
  useUpdatePropertyMutation,
  useUploadImagesMutation,
} from '../../../features/properties/propertiesApi';
import {
  useGetPropertyNotesQuery,
  useAddPropertyNoteMutation,
} from '../../../features/propertyNotes/propertyNotesApi';
import { Badge } from '../../../components/ui/Badge';
import { Button } from '../../../components/ui/Button';
import { Modal } from '../../../components/ui/Modal';
import { ConfirmModal } from '../../../components/ui/ConfirmModal';
import { Input } from '../../../components/ui/Input';
import { Select } from '../../../components/ui/Select';
import { DocumentViewer } from '../../../components/ui/DocumentViewer';
import { DataTable, Column } from '../../../components/ui/DataTable';
import { formatPrice, formatDate } from '../../../utils/format';
import { getImageUrl } from '../../../utils/imageUrl';
import { Property, PropertyStatus, PropertyType } from '../../../types';
import { NIGERIAN_STATES } from '../../../constants/nigerianStates';
import { Trash2Icon } from 'lucide-react';
import { useAppSelector } from '../../../store';

const PropertyNotesSection = ({ propertyId }: { propertyId: string }) => {
  const currentUser = useAppSelector((s) => s.auth.user);
  const { data: notes = [], isLoading } = useGetPropertyNotesQuery(propertyId);
  const [addNote, { isLoading: isSending }] = useAddPropertyNoteMutation();
  const [noteText, setNoteText] = useState('');
  const bottomRef = useRef<HTMLDivElement>(null);

  const handleSend = async () => {
    const content = noteText.trim();
    if (!content) return;
    await addNote({ propertyId, content });
    setNoteText('');
    setTimeout(() => bottomRef.current?.scrollIntoView({ behavior: 'smooth' }), 100);
  };

  return (
    <div className="mt-4 border border-border rounded-xl overflow-hidden">
      <div className="bg-navy/5 px-4 py-2.5 border-b border-border">
        <h4 className="text-xs font-bold uppercase tracking-wide text-navy">Notes from Admin</h4>
      </div>
      <div className="max-h-48 overflow-y-auto p-3 space-y-2 bg-white">
        {isLoading && <p className="text-xs text-muted text-center py-3">Loading notes...</p>}
        {!isLoading && notes.length === 0 && (
          <p className="text-xs text-muted text-center py-3">No notes yet. You can leave a note for the admin here.</p>
        )}
        {notes.map((note) => {
          const isMe = note.user.id === currentUser?.id;
          return (
            <div key={note.id} className={`flex gap-2 ${isMe ? 'flex-row-reverse' : ''}`}>
              <div className="w-6 h-6 rounded-full bg-teal flex items-center justify-center text-white text-[10px] font-bold flex-shrink-0">
                {note.user.name?.charAt(0)}
              </div>
              <div className={`max-w-[75%] ${isMe ? 'items-end' : 'items-start'} flex flex-col gap-0.5`}>
                <div className={`px-3 py-1.5 rounded-xl text-xs leading-relaxed ${isMe ? 'bg-teal text-white rounded-tr-sm' : 'bg-surface text-ink rounded-tl-sm'}`}>
                  {note.content}
                </div>
                <span className="text-[10px] text-muted">{note.user.name} · {formatDate(note.createdAt)}</span>
              </div>
            </div>
          );
        })}
        <div ref={bottomRef} />
      </div>
      <div className="p-3 border-t border-border bg-white flex gap-2">
        <input
          type="text"
          value={noteText}
          onChange={(e) => setNoteText(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && !e.shiftKey && handleSend()}
          placeholder="Add a note for the admin..."
          className="flex-1 px-3 py-1.5 border border-border rounded-lg text-xs text-ink outline-none focus:border-teal transition-colors"
        />
        <button
          onClick={handleSend}
          disabled={!noteText.trim() || isSending}
          className="px-3 py-1.5 rounded-lg bg-teal text-white text-xs font-semibold hover:bg-teal/90 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
        >
          Send
        </button>
      </div>
    </div>
  );
};

const AMENITIES = ['Pool', 'BQ', 'Generator', 'CCTV', 'Gym', 'Elevator', 'Concierge', 'Smart Home', 'Security', 'Parking'];

const PROPERTY_TYPES: PropertyType[] = [
  PropertyType.APARTMENT,
  PropertyType.BLOCK_OF_FLATS,
  PropertyType.FULLY_DETACHED,
  PropertyType.SEMI_DETACHED,
  PropertyType.TERRACED,
  PropertyType.DUPLEX,
];

type EditForm = {
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
  existingImages: string[];
  newPhotos: File[];
};

const emptyEdit: EditForm = {
  type: '', title: '', price: '', state: '', lga: '', area: '',
  description: '', beds: '', baths: '', sqm: '', amenities: [],
  existingImages: [], newPhotos: [],
};

const PAGE_SIZE = 10;

export const MyListingsPage = () => {
  const navigate = useNavigate();
  const [page, setPage] = useState(1);
  const { data, isLoading } = useGetMyPropertiesQuery({ page, limit: PAGE_SIZE });
  const [markSold] = useMarkPropertySoldMutation();
  const [deleteProperty] = useDeletePropertyMutation();
  const [updateProperty] = useUpdatePropertyMutation();
  const [uploadImages] = useUploadImagesMutation();

  const [soldModal, setSoldModal] = useState<{ id: string; title: string } | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<{ id: string; title: string } | null>(null);
  const [viewProperty, setViewProperty] = useState<Property | null>(null);
  const [editTarget, setEditTarget] = useState<Property | null>(null);
  const [editForm, setEditForm] = useState<EditForm>(emptyEdit);
  const [editErrors, setEditErrors] = useState<Record<string, string>>({});
  const [editUploading, setEditUploading] = useState(false);
  const [salePrice, setSalePrice] = useState('');
  const [isActing, setIsActing] = useState(false);
  const [viewImageIdx, setViewImageIdx] = useState(0);
  const editFileRef = useRef<HTMLInputElement>(null);

  const properties = data?.data ?? [];
  const total = data?.total ?? 0;
  const totalPages = data?.totalPages ?? 1;

  const setEdit = (field: keyof EditForm, value: unknown) =>
    setEditForm((prev) => ({ ...prev, [field]: value }));

  const openEdit = (p: Property) => {
    setEditTarget(p);
    setEditForm({
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
      existingImages: p.images ?? [],
      newPhotos: [],
    });
    setEditErrors({});
  };

  const validateEdit = (): Record<string, string> => {
    const e: Record<string, string> = {};
    if (!editForm.type) e.type = 'Select a property type';
    if (!editForm.title || editForm.title.length < 5) e.title = 'Title must be at least 5 characters';
    if (!editForm.price || Number(editForm.price) <= 0) e.price = 'Enter a valid price';
    if (!editForm.state) e.state = 'State is required';
    if (!editForm.lga) e.lga = 'LGA is required';
    if (!editForm.area) e.area = 'Area is required';
    if (!editForm.description || editForm.description.length < 20) e.description = 'Description must be at least 20 characters';
    if (editForm.existingImages.length === 0 && editForm.newPhotos.length === 0) e.images = 'At least 1 photo is required';
    return e;
  };

  const handleEditSubmit = async () => {
    if (!editTarget) return;
    const errs = validateEdit();
    if (Object.keys(errs).length) { setEditErrors(errs); return; }

    setEditUploading(true);
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
      setEditErrors({ submit: 'Update failed. Please try again.' });
    } finally {
      setEditUploading(false);
    }
  };

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

  const onEditFilesSelected = (files: FileList | null) => {
    if (!files) return;
    const arr = Array.from(files).filter((f) => f.type.startsWith('image/'));
    const total = editForm.existingImages.length + editForm.newPhotos.length;
    const allowed = Math.max(0, 20 - total);
    setEdit('newPhotos', [...editForm.newPhotos, ...arr].slice(0, allowed));
  };

  const columns: Column<Property>[] = [
    {
      key: 'property',
      header: 'Property',
      cell: (p) => (
        <>
          <div className="font-semibold text-navy">{p.title}</div>
          {p.status === PropertyStatus.REJECTED && p.rejectionReason && (
            <div className="text-xs text-red-500 mt-0.5">❌ {p.rejectionReason}</div>
          )}
        </>
      ),
    },
    {
      key: 'price',
      header: 'Price',
      className: 'font-medium text-navy whitespace-nowrap',
      cell: (p) => formatPrice(p.price),
    },
    {
      key: 'submitted',
      header: 'Submitted',
      className: 'text-muted whitespace-nowrap',
      cell: (p) => formatDate(p.createdAt),
    },
    {
      key: 'status',
      header: 'Status',
      cell: (p) => <Badge status={p.status} />,
    },
    {
      key: 'actions',
      header: 'Actions',
      cell: (p) => (
        <div className="flex gap-1.5 flex-wrap">
          <Button variant="ghost" size="sm" onClick={() => { setViewImageIdx(0); setViewProperty(p); }}>
            View
          </Button>
          {p.status === PropertyStatus.APPROVED && (
            <Button variant="ghost" size="sm" onClick={() => setSoldModal({ id: p.id, title: p.title })}>
              Mark Sold
            </Button>
          )}
          {(p.status === PropertyStatus.REJECTED || p.status === PropertyStatus.PENDING) && (
            <Button variant="ghost" size="sm" onClick={() => openEdit(p)}>
              Edit & Resubmit
            </Button>
          )}
          <Button variant="danger" size="sm" onClick={() => setDeleteTarget({ id: p.id, title: p.title })}>
            <Trash2Icon size={14} />
          </Button>
        </div>
      ),
    },
  ];

  return (
    <div className="space-y-4">
      <div className="flex justify-end">
        <Button onClick={() => navigate('/dashboard/submit')}>+ Submit Property</Button>
      </div>

      <DataTable
        columns={columns}
        rows={properties}
        rowKey={(p) => p.id}
        isLoading={isLoading}
        page={page}
        totalPages={totalPages}
        total={total}
        onPageChange={setPage}
        emptyState={
          <div className="py-20 text-center">
            <div className="text-5xl mb-3">🏠</div>
            <h3 className="font-semibold text-navy">No listings yet</h3>
            <p className="text-sm text-muted mt-1 mb-4">Submit your first property for review.</p>
            <Button onClick={() => navigate('/dashboard/submit')}>Submit Property</Button>
          </div>
        }
      />


      {/* ── View Modal ── */}
      {viewProperty && (
        <Modal isOpen onClose={() => setViewProperty(null)} title={viewProperty.title} size="lg">
          {/* Image gallery */}
          {viewProperty.images?.length > 0 && (
            <div className="mb-5">
              <div className="aspect-video rounded-xl overflow-hidden bg-gray-100 mb-2">
                <img
                  src={getImageUrl(viewProperty.images[viewImageIdx])}
                  alt=""
                  className="w-full h-full object-cover"
                />
              </div>
              {viewProperty.images.length > 1 && (
                <div className="flex gap-2 overflow-x-auto pb-1">
                  {viewProperty.images.map((img, i) => (
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

          <div className="grid grid-cols-2 gap-x-4 sm:gap-x-8 gap-y-4 text-sm mb-4">
            <div><p className="text-[10px] font-bold uppercase tracking-widest text-muted mb-0.5">Status</p><Badge status={viewProperty.status} /></div>
            <div><p className="text-[10px] font-bold uppercase tracking-widest text-muted mb-0.5">Type</p><p className="font-semibold text-navy">{viewProperty.type}</p></div>
            <div><p className="text-[10px] font-bold uppercase tracking-widest text-muted mb-0.5">Price</p><p className="font-semibold text-navy">{formatPrice(viewProperty.price)}</p></div>
            <div><p className="text-[10px] font-bold uppercase tracking-widest text-muted mb-0.5">Location</p><p className="font-semibold text-navy">{viewProperty.area}, {viewProperty.lga}, {viewProperty.state}</p></div>
            {viewProperty.beds != null && <div><p className="text-[10px] font-bold uppercase tracking-widest text-muted mb-0.5">Bedrooms</p><p className="font-semibold text-navy">{viewProperty.beds}</p></div>}
            {viewProperty.baths != null && <div><p className="text-[10px] font-bold uppercase tracking-widest text-muted mb-0.5">Bathrooms</p><p className="font-semibold text-navy">{viewProperty.baths}</p></div>}
            {viewProperty.sqm != null && <div><p className="text-[10px] font-bold uppercase tracking-widest text-muted mb-0.5">Size</p><p className="font-semibold text-navy">{viewProperty.sqm} m²</p></div>}
            <div><p className="text-[10px] font-bold uppercase tracking-widest text-muted mb-0.5">Submitted</p><p className="font-semibold text-navy">{formatDate(viewProperty.createdAt)}</p></div>
          </div>

          {viewProperty.amenities?.length > 0 && (
            <div className="mb-4">
              <p className="text-[10px] font-bold uppercase tracking-widest text-muted mb-2">Amenities</p>
              <div className="flex flex-wrap gap-2">
                {viewProperty.amenities.map((a) => (
                  <span key={a} className="px-3 py-1 text-xs bg-teal/10 text-teal rounded-full font-medium">{a}</span>
                ))}
              </div>
            </div>
          )}

          <div>
            <p className="text-[10px] font-bold uppercase tracking-widest text-muted mb-1">Description</p>
            <p className="text-sm text-ink leading-relaxed">{viewProperty.description}</p>
          </div>

          {(viewProperty.documents?.length ?? 0) > 0 && (
            <div className="mt-4">
              <p className="text-[10px] font-bold uppercase tracking-widest text-muted mb-2">Supporting Documents</p>
              <DocumentViewer documents={viewProperty.documents ?? []} />
            </div>
          )}

          {viewProperty.status === PropertyStatus.REJECTED && viewProperty.rejectionReason && (
            <div className="mt-4 p-3 bg-red-50 border border-red-200 rounded-lg text-sm text-red-600">
              <span className="font-semibold">Rejection reason:</span> {viewProperty.rejectionReason}
            </div>
          )}

          {/* Agent–Admin notes */}
          <PropertyNotesSection propertyId={viewProperty.id} />
        </Modal>
      )}

      {/* ── Edit & Resubmit Modal ── */}
      {editTarget && (
        <Modal
          isOpen
          onClose={() => setEditTarget(null)}
          title={`Edit & Resubmit: ${editTarget.title}`}
          size="lg"
          footer={
            <>
              <Button variant="ghost" onClick={() => setEditTarget(null)} disabled={editUploading}>Cancel</Button>
              <Button onClick={handleEditSubmit} loading={editUploading}>Resubmit for Approval</Button>
            </>
          }
        >
          <div className="space-y-5">
            {/* Type */}
            <div>
              <label className="text-xs font-semibold uppercase tracking-wide text-navy block mb-2">Property Type</label>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                {PROPERTY_TYPES.map((t) => (
                  <button
                    key={t}
                    type="button"
                    onClick={() => setEdit('type', t)}
                    className={`py-2 px-3 rounded-lg border text-xs font-semibold text-center transition-all ${editForm.type === t ? 'bg-navy text-white border-navy' : 'border-border text-ink hover:border-teal/50'}`}
                  >
                    {t}
                  </button>
                ))}
              </div>
              {editErrors.type && <p className="text-xs text-red-500 mt-1">{editErrors.type}</p>}
            </div>

            <Input label="Listing Title" value={editForm.title} onChange={(e) => setEdit('title', e.target.value)} error={editErrors.title} />

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Input label="Asking Price (₦)" type="number" value={editForm.price} onChange={(e) => setEdit('price', e.target.value)} error={editErrors.price} />
              <Select
                label="State"
                options={NIGERIAN_STATES.map((s) => ({ value: s.label, label: s.label }))}
                value={editForm.state}
                onChange={(e) => setEditForm((prev) => ({ ...prev, state: e.target.value, lga: '' }))}
                error={editErrors.state}
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Select
                label="LGA"
                placeholder={editForm.state ? 'Select LGA...' : 'Select a state first'}
                options={(NIGERIAN_STATES.find((s) => s.label === editForm.state)?.lgas ?? []).map((l) => ({ value: l.value, label: l.label }))}
                value={editForm.lga}
                onChange={(e) => setEdit('lga', e.target.value)}
                error={editErrors.lga}
                disabled={!editForm.state}
              />
              <Input label="Area / Neighbourhood" value={editForm.area} onChange={(e) => setEdit('area', e.target.value)} error={editErrors.area} />
            </div>

            <div className="grid grid-cols-3 gap-3 sm:gap-4">
              <Input label="Bedrooms" type="number" value={editForm.beds} onChange={(e) => setEdit('beds', e.target.value)} />
              <Input label="Bathrooms" type="number" value={editForm.baths} onChange={(e) => setEdit('baths', e.target.value)} />
              <Input label="Size (m²)" type="number" value={editForm.sqm} onChange={(e) => setEdit('sqm', e.target.value)} />
            </div>

            <div>
              <label className="text-xs font-semibold uppercase tracking-wide text-navy block mb-1.5">Description</label>
              <textarea
                rows={4}
                value={editForm.description}
                onChange={(e) => setEdit('description', e.target.value)}
                className={`w-full px-3.5 py-2.5 border rounded-lg text-sm text-ink bg-white outline-none transition-colors focus:border-teal resize-none ${editErrors.description ? 'border-red-400' : 'border-border'}`}
              />
              {editErrors.description && <p className="text-xs text-red-500 mt-1">{editErrors.description}</p>}
            </div>

            <div>
              <label className="text-xs font-semibold uppercase tracking-wide text-navy block mb-2">Amenities</label>
              <div className="flex flex-wrap gap-2">
                {AMENITIES.map((a) => (
                  <button
                    key={a}
                    type="button"
                    onClick={() => setEdit('amenities', editForm.amenities.includes(a) ? editForm.amenities.filter((x) => x !== a) : [...editForm.amenities, a])}
                    className={`px-3 py-1.5 rounded-full text-xs border transition-all ${editForm.amenities.includes(a) ? 'bg-teal text-white border-teal' : 'bg-white text-ink border-border hover:border-teal/50'}`}
                  >
                    {a}
                  </button>
                ))}
              </div>
            </div>

            {/* Images */}
            <div>
              <label className="text-xs font-semibold uppercase tracking-wide text-navy block mb-2">Photos</label>
              <div className="grid grid-cols-3 sm:grid-cols-4 gap-2 mb-3">
                {/* Existing images */}
                {editForm.existingImages.map((url, i) => (
                  <div key={`e-${i}`} className="relative group aspect-square rounded-lg overflow-hidden border border-border">
                    <img src={getImageUrl(url)} alt="" className="w-full h-full object-cover" />
                    <button
                      type="button"
                      onClick={() => setEdit('existingImages', editForm.existingImages.filter((_, idx) => idx !== i))}
                      className="absolute top-1 right-1 w-5 h-5 rounded-full bg-black/60 text-white text-xs flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                    >×</button>
                  </div>
                ))}
                {/* New photos */}
                {editForm.newPhotos.map((file, i) => (
                  <div key={`n-${i}`} className="relative group aspect-square rounded-lg overflow-hidden border border-teal/40">
                    <img src={URL.createObjectURL(file)} alt="" className="w-full h-full object-cover" />
                    <button
                      type="button"
                      onClick={() => setEdit('newPhotos', editForm.newPhotos.filter((_, idx) => idx !== i))}
                      className="absolute top-1 right-1 w-5 h-5 rounded-full bg-black/60 text-white text-xs flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                    >×</button>
                  </div>
                ))}
                {/* Add more */}
                {(editForm.existingImages.length + editForm.newPhotos.length) < 20 && (
                  <button
                    type="button"
                    onClick={() => editFileRef.current?.click()}
                    className="aspect-square rounded-lg border-2 border-dashed border-gray-300 flex items-center justify-center text-gray-400 hover:border-teal/60 hover:text-teal transition-colors text-2xl"
                  >+</button>
                )}
              </div>
              <input ref={editFileRef} type="file" accept="image/jpeg,image/png,image/webp" multiple className="hidden" onChange={(e) => onEditFilesSelected(e.target.files)} />
              {editErrors.images && <p className="text-xs text-red-500">{editErrors.images}</p>}
              {editErrors.submit && <p className="text-xs text-red-500 mt-2">{editErrors.submit}</p>}
            </div>
          </div>
        </Modal>
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
