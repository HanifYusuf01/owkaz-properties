import { useRef, useState } from 'react';
import { PlusCircle, Pencil, Trash2, Play } from 'lucide-react';
import {
  useGetProjectsQuery,
  useCreateProjectMutation,
  useUpdateProjectMutation,
  useDeleteProjectMutation,
  Project,
} from '../../../features/projects/projectsApi';
import { useUploadImagesMutation, useUploadVideoMutation } from '../../../features/properties/propertiesApi';
import { Button } from '../../../components/ui/Button';
import { Input } from '../../../components/ui/Input';
import { Select } from '../../../components/ui/Select';
import { Modal } from '../../../components/ui/Modal';
import { ConfirmModal } from '../../../components/ui/ConfirmModal';
import { getImageUrl } from '../../../utils/imageUrl';
import { formatPrice } from '../../../utils/format';
import { NIGERIAN_STATES } from '../../../constants/nigerianStates';

const STATUS_OPTIONS = ['ongoing', 'completed', 'pre-launch', 'selling-fast', 'new-launch'] as const;
const STATUS_LABELS: Record<string, string> = {
  ongoing: 'Ongoing', completed: 'Completed',
  'pre-launch': 'Pre-Launch', 'selling-fast': 'Selling Fast', 'new-launch': 'New Launch',
};
const STATUS_COLORS: Record<string, string> = {
  ongoing: 'bg-teal/10 text-teal', completed: 'bg-green-100 text-green-700',
  'pre-launch': 'bg-purple-100 text-purple-700',
  'selling-fast': 'bg-gold/10 text-gold', 'new-launch': 'bg-teal/10 text-teal',
};

const PROJECT_FEATURES = [
  'Swimming Pool', 'Gym', 'Security', 'CCTV', 'Gated Community', 'Playground',
  'Smart Home', 'Generator', 'Solar Power', 'Parking', 'Club House',
  'Tennis Court', 'Basketball Court', 'BQ', 'Elevator', 'Water Treatment',
  'Shopping Mall', 'School Nearby', 'Hospital Nearby',
];

const PROJECT_TYPES = [
  'Gated Residential Estate', 'Blocks of Flat', 'Luxury Apartments',
  'Townhouses', 'Duplex Development', 'Mixed-Use Development',
  'Commercial Complex', 'Affordable Housing',
];

type FormState = {
  name: string;
  type: string;
  location: string;
  lga: string;
  state: string;
  description: string;
  priceFrom: string;
  priceTo: string;
  totalUnits: string;
  availableUnits: string;
  progress: string;
  completionDate: string;
  status: string;
  features: string[];
  existingImages: string[];
  newPhotos: File[];
  existingVideoUrl: string;
  newVideoFile: File | null;
};

const emptyForm: FormState = {
  name: '', type: '', location: '', lga: '', state: '', description: '',
  priceFrom: '', priceTo: '', totalUnits: '', availableUnits: '',
  progress: '0', completionDate: '', status: 'ongoing',
  features: [], existingImages: [], newPhotos: [],
  existingVideoUrl: '', newVideoFile: null,
};

const toFormState = (p: Project): FormState => ({
  name: p.name,
  type: p.type,
  location: p.location,
  lga: p.lga ?? '',
  state: p.state,
  description: p.description ?? '',
  priceFrom: p.priceFrom != null ? String(p.priceFrom) : '',
  priceTo: p.priceTo != null ? String(p.priceTo) : '',
  totalUnits: String(p.totalUnits),
  availableUnits: String(p.availableUnits),
  progress: String(p.progress),
  completionDate: p.completionDate ?? '',
  status: p.status,
  features: p.features ?? [],
  existingImages: p.images ?? [],
  newPhotos: [],
  existingVideoUrl: p.videoUrl ?? '',
  newVideoFile: null,
});

export const ProjectsManagementPage = () => {
  const { data: projects = [], isLoading } = useGetProjectsQuery({});
  const [create, { isLoading: isCreating }] = useCreateProjectMutation();
  const [update, { isLoading: isUpdating }] = useUpdateProjectMutation();
  const [deleteProject] = useDeleteProjectMutation();
  const [uploadImages] = useUploadImagesMutation();
  const [uploadVideo] = useUploadVideoMutation();

  const [modalOpen, setModalOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState<FormState>(emptyForm);
  const [step, setStep] = useState<1 | 2>(1);
  const [previewImageUrls, setPreviewImageUrls] = useState<string[]>([]);
  const [previewVideoUrl, setPreviewVideoUrl] = useState('');
  const [deleteTarget, setDeleteTarget] = useState<{ id: string; name: string } | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [uploadError, setUploadError] = useState('');
  const [isUploading, setIsUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const videoInputRef = useRef<HTMLInputElement>(null);

  const set = <K extends keyof FormState>(key: K, value: FormState[K]) =>
    setForm((prev) => ({ ...prev, [key]: value }));

  const openCreate = () => {
    setEditingId(null); setForm(emptyForm); setUploadError('');
    setStep(1); setPreviewImageUrls([]); setPreviewVideoUrl('');
    setModalOpen(true);
  };

  const openEdit = (p: Project) => {
    setEditingId(p.id); setForm(toFormState(p)); setUploadError('');
    setStep(1); setPreviewImageUrls([]); setPreviewVideoUrl('');
    setModalOpen(true);
  };

  const closeModal = () => { setModalOpen(false); setStep(1); setPreviewImageUrls([]); setPreviewVideoUrl(''); };

  const toggleFeature = (f: string) =>
    set('features', form.features.includes(f) ? form.features.filter((x) => x !== f) : [...form.features, f]);

  const onFilesSelected = (files: FileList | null) => {
    if (!files) return;
    const arr = Array.from(files).filter((f) => f.type.startsWith('image/'));
    const total = form.existingImages.length + form.newPhotos.length;
    set('newPhotos', [...form.newPhotos, ...arr].slice(0, Math.max(0, 20 - total)));
  };

  const removeExisting = (i: number) =>
    set('existingImages', form.existingImages.filter((_, idx) => idx !== i));
  const removeNew = (i: number) =>
    set('newPhotos', form.newPhotos.filter((_, idx) => idx !== i));

  // Step 1 → Step 2: upload assets and advance to preview
  const handlePreview = async () => {
    setUploadError('');
    setIsUploading(true);
    try {
      let newUrls: string[] = [];
      if (form.newPhotos.length > 0) {
        const fd = new FormData();
        form.newPhotos.forEach((f) => fd.append('files', f));
        const { urls } = await uploadImages(fd).unwrap();
        newUrls = urls;
      }

      let videoUrl = form.existingVideoUrl;
      if (form.newVideoFile) {
        const fd = new FormData();
        fd.append('files', form.newVideoFile);
        const { urls } = await uploadVideo(fd).unwrap();
        videoUrl = urls[0] ?? '';
      }

      setPreviewImageUrls(newUrls);
      setPreviewVideoUrl(videoUrl);
      setStep(2);
    } catch {
      setUploadError('Upload failed. Please try again.');
    } finally {
      setIsUploading(false);
    }
  };

  // Step 2 → Save: create or update project
  const handleSave = async () => {
    const allImages = [...form.existingImages, ...previewImageUrls];
    const videoUrl = previewVideoUrl || form.existingVideoUrl || null;

    const payload = {
      name: form.name,
      type: form.type,
      location: form.location,
      lga: form.lga || null,
      state: form.state,
      description: form.description || null,
      priceFrom: form.priceFrom ? Number(form.priceFrom) : null,
      priceTo: form.priceTo ? Number(form.priceTo) : null,
      totalUnits: Number(form.totalUnits) || 0,
      availableUnits: Number(form.availableUnits) || 0,
      progress: Math.min(100, Math.max(0, Number(form.progress) || 0)),
      completionDate: form.completionDate || null,
      status: form.status,
      images: allImages,
      features: form.features,
      videoUrl,
    };

    if (editingId) {
      await update({ id: editingId, data: payload });
    } else {
      await create(payload);
    }
    closeModal();
  };

  const handleDelete = async () => {
    if (!deleteTarget) return;
    setIsDeleting(true);
    try { await deleteProject(deleteTarget.id); }
    finally { setIsDeleting(false); setDeleteTarget(null); }
  };

  const isSaving = isCreating || isUpdating;
  const canPreview = !!form.name && !!form.type && !!form.state;

  const lgaOptions = (NIGERIAN_STATES.find((s) => s.label === form.state)?.lgas ?? [])
    .map((l) => ({ value: l.value, label: l.label }));

  const allPreviewImages = [...form.existingImages, ...previewImageUrls];

  return (
    <div className="space-y-4">
      <div className="flex justify-end">
        <Button onClick={openCreate}>
          <PlusCircle size={15} className="mr-1.5" /> Add Project
        </Button>
      </div>

      <div className="bg-white border border-border rounded-xl overflow-hidden">
        {isLoading ? (
          <div className="py-20 text-center text-muted">Loading...</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-navy">
                <tr>
                  {['Project', 'Type', 'Location', 'Units', 'Progress', 'Status', 'Actions'].map((h) => (
                    <th key={h} className="px-4 py-3 text-left text-[10px] font-semibold uppercase tracking-wide text-white/70 whitespace-nowrap">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {projects.map((p) => (
                  <tr key={p.id} className="hover:bg-surface transition-colors">
                    <td className="px-4 py-3 max-w-[180px]">
                      <div className="font-semibold text-navy truncate">{p.name}</div>
                      {p.completionDate && <div className="text-xs text-muted">Est. {p.completionDate}</div>}
                      {p.videoUrl && <div className="text-[10px] text-teal mt-0.5">▶ Video attached</div>}
                    </td>
                    <td className="px-4 py-3 text-muted whitespace-nowrap max-w-[140px]">
                      <span className="truncate block">{p.type}</span>
                    </td>
                    <td className="px-4 py-3 max-w-[160px]">
                      <div className="text-muted truncate">{p.lga ? `${p.lga}, ` : ''}{p.state}</div>
                      {p.location && <div className="text-xs text-muted/70 truncate">{p.location}</div>}
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap">
                      <div className="text-navy font-medium">{p.availableUnits}<span className="text-muted font-normal"> / {p.totalUnits}</span></div>
                      <div className="text-[10px] text-muted">available</div>
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap">
                      <div className="flex items-center gap-2">
                        <div className="w-16 h-1.5 bg-border rounded-full overflow-hidden">
                          <div className="h-full bg-teal" style={{ width: `${p.progress}%` }} />
                        </div>
                        <span className="text-xs text-muted">{p.progress}%</span>
                      </div>
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap">
                      <span className={`text-[10px] font-bold px-2.5 py-1 rounded-full ${STATUS_COLORS[p.status] ?? 'bg-surface text-muted'}`}>
                        {STATUS_LABELS[p.status] ?? p.status}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex gap-1.5">
                        <Button variant="ghost" size="sm" onClick={() => openEdit(p)}><Pencil size={13} /></Button>
                        <Button variant="danger" size="sm" onClick={() => setDeleteTarget({ id: p.id, name: p.name })}><Trash2 size={13} /></Button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            {projects.length === 0 && (
              <div className="py-16 text-center">
                <div className="text-4xl mb-3">🏗️</div>
                <h3 className="font-semibold text-navy">No projects yet</h3>
                <p className="text-sm text-muted mt-1 mb-4">Add your first development project.</p>
                <Button onClick={openCreate}><PlusCircle size={14} className="mr-1.5" /> Add Project</Button>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Create / Edit modal */}
      <Modal
        isOpen={modalOpen}
        onClose={closeModal}
        title={step === 2 ? `Preview: ${form.name}` : (editingId ? 'Edit Project' : 'Add Project')}
        size="lg"
        footer={
          step === 1 ? (
            <>
              <Button variant="ghost" onClick={closeModal} disabled={isUploading}>Cancel</Button>
              <Button onClick={handlePreview} loading={isUploading} disabled={!canPreview}>
                Preview →
              </Button>
            </>
          ) : (
            <>
              <Button variant="ghost" onClick={() => setStep(1)} disabled={isSaving}>← Back</Button>
              <Button onClick={handleSave} loading={isSaving}>
                {editingId ? 'Save Changes' : 'Create Project'}
              </Button>
            </>
          )
        }
      >
        {step === 1 ? (
          <div className="space-y-5">
            {/* Basic info */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Input label="Project Name *" placeholder="e.g. Emerald Gardens Estate" value={form.name}
                onChange={(e) => set('name', e.target.value)} />

              <div>
                <label className="text-xs font-semibold uppercase tracking-wide text-navy block mb-1.5">Type *</label>
                <select
                  value={form.type}
                  onChange={(e) => set('type', e.target.value)}
                  className="w-full px-3.5 py-2.5 border border-border rounded-lg text-sm text-ink bg-white outline-none transition-colors focus:border-teal"
                >
                  <option value="">Select type...</option>
                  {PROJECT_TYPES.map((t) => <option key={t} value={t}>{t}</option>)}
                </select>
              </div>

              <Select
                label="State *"
                placeholder="Select state..."
                options={NIGERIAN_STATES.map((s) => ({ value: s.label, label: s.label }))}
                value={form.state}
                onChange={(e) => setForm((prev) => ({ ...prev, state: e.target.value, lga: '' }))}
              />

              <Select
                label="LGA"
                placeholder={form.state ? 'Select LGA...' : 'Select a state first'}
                options={lgaOptions}
                value={form.lga}
                onChange={(e) => set('lga', e.target.value)}
                disabled={!form.state}
              />

              <div className="sm:col-span-2">
                <Input label="Area / Neighbourhood" placeholder="e.g. Gwarinpa District, beside Transcorp" value={form.location}
                  onChange={(e) => set('location', e.target.value)} />
              </div>
            </div>

            {/* Pricing & units */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
              <Input label="Price From (₦)" type="number" placeholder="45000000" value={form.priceFrom}
                onChange={(e) => set('priceFrom', e.target.value)} />
              <Input label="Price To (₦)" type="number" placeholder="90000000" value={form.priceTo}
                onChange={(e) => set('priceTo', e.target.value)} />
              <Input label="Total Units" type="number" placeholder="120" value={form.totalUnits}
                onChange={(e) => set('totalUnits', e.target.value)} />
              <Input label="Available Units" type="number" placeholder="34" value={form.availableUnits}
                onChange={(e) => set('availableUnits', e.target.value)} />
            </div>

            {/* Progress & dates */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <Input label="Progress (%)" type="number" placeholder="0–100" value={form.progress}
                onChange={(e) => set('progress', e.target.value)} />
              <Input label="Completion Date" placeholder="e.g. 2026 Q2" value={form.completionDate}
                onChange={(e) => set('completionDate', e.target.value)} />
              <div>
                <label className="text-xs font-semibold uppercase tracking-wide text-navy block mb-1.5">Status</label>
                <select
                  value={form.status}
                  onChange={(e) => set('status', e.target.value)}
                  className="w-full px-3.5 py-2.5 border border-border rounded-lg text-sm text-ink bg-white outline-none transition-colors focus:border-teal"
                >
                  {STATUS_OPTIONS.map((s) => <option key={s} value={s}>{STATUS_LABELS[s]}</option>)}
                </select>
              </div>
            </div>

            {/* Description */}
            <div>
              <label className="text-xs font-semibold uppercase tracking-wide text-navy block mb-1.5">Description</label>
              <textarea
                rows={3}
                placeholder="Brief description of the development project..."
                value={form.description}
                onChange={(e) => set('description', e.target.value)}
                className="w-full px-3.5 py-2.5 border border-border rounded-lg text-sm text-ink bg-white outline-none transition-colors focus:border-teal resize-none"
              />
            </div>

            {/* Features chips */}
            <div>
              <label className="text-xs font-semibold uppercase tracking-wide text-navy block mb-2">Features & Amenities</label>
              <div className="flex flex-wrap gap-2">
                {PROJECT_FEATURES.map((f) => (
                  <button
                    key={f}
                    type="button"
                    onClick={() => toggleFeature(f)}
                    className={`px-3 py-1.5 rounded-full text-xs border transition-all ${
                      form.features.includes(f)
                        ? 'bg-teal text-white border-teal'
                        : 'bg-white text-ink border-border hover:border-teal/50'
                    }`}
                  >
                    {f}
                  </button>
                ))}
              </div>
              {form.features.length > 0 && (
                <p className="text-xs text-muted mt-2">{form.features.length} selected</p>
              )}
            </div>

            {/* Image upload */}
            <div>
              <label className="text-xs font-semibold uppercase tracking-wide text-navy block mb-2">Project Images</label>
              <div
                onClick={() => fileInputRef.current?.click()}
                className="border-2 border-dashed border-gray-300 rounded-xl p-6 text-center cursor-pointer hover:border-teal/60 hover:bg-teal/5 transition-colors"
              >
                <div className="text-3xl mb-1">📷</div>
                <p className="text-sm text-muted font-medium">Click to upload images (max 20)</p>
                <p className="text-xs text-muted mt-0.5">JPG, PNG, WEBP — max 10 MB each</p>
              </div>
              <input
                ref={fileInputRef}
                type="file"
                accept="image/jpeg,image/png,image/webp"
                multiple
                className="hidden"
                onChange={(e) => onFilesSelected(e.target.files)}
              />
              {(form.existingImages.length > 0 || form.newPhotos.length > 0) && (
                <div className="mt-3 grid grid-cols-3 sm:grid-cols-5 gap-2">
                  {form.existingImages.map((url, i) => (
                    <div key={`e-${i}`} className="relative group aspect-square rounded-lg overflow-hidden border border-border">
                      <img src={getImageUrl(url)} alt="" className="w-full h-full object-cover" />
                      <button
                        type="button"
                        onClick={() => removeExisting(i)}
                        className="absolute top-1 right-1 w-5 h-5 rounded-full bg-black/60 text-white text-xs flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                      >×</button>
                    </div>
                  ))}
                  {form.newPhotos.map((file, i) => (
                    <div key={`n-${i}`} className="relative group aspect-square rounded-lg overflow-hidden border border-teal/40">
                      <img src={URL.createObjectURL(file)} alt="" className="w-full h-full object-cover" />
                      <button
                        type="button"
                        onClick={() => removeNew(i)}
                        className="absolute top-1 right-1 w-5 h-5 rounded-full bg-black/60 text-white text-xs flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                      >×</button>
                    </div>
                  ))}
                  {(form.existingImages.length + form.newPhotos.length) < 20 && (
                    <button
                      type="button"
                      onClick={() => fileInputRef.current?.click()}
                      className="aspect-square rounded-lg border-2 border-dashed border-gray-300 flex items-center justify-center text-gray-400 hover:border-teal/60 hover:text-teal transition-colors text-2xl"
                    >+</button>
                  )}
                </div>
              )}
            </div>

            {/* Video upload */}
            <div>
              <label className="text-xs font-semibold uppercase tracking-wide text-navy block mb-2">Project Video</label>
              {(form.existingVideoUrl && !form.newVideoFile) && (
                <div className="flex items-center gap-3 p-3 bg-teal/5 border border-teal/20 rounded-lg mb-2">
                  <Play size={16} className="text-teal flex-shrink-0" />
                  <span className="text-xs text-teal font-medium flex-1 truncate">Current video attached</span>
                  <button
                    type="button"
                    onClick={() => set('existingVideoUrl', '')}
                    className="text-xs text-red-500 hover:text-red-700 flex-shrink-0"
                  >Remove</button>
                </div>
              )}
              {form.newVideoFile ? (
                <div className="flex items-center gap-3 p-3 bg-teal/5 border border-teal/20 rounded-lg">
                  <Play size={16} className="text-teal flex-shrink-0" />
                  <span className="text-xs text-teal font-medium flex-1 truncate">{form.newVideoFile.name}</span>
                  <button
                    type="button"
                    onClick={() => set('newVideoFile', null)}
                    className="text-xs text-red-500 hover:text-red-700 flex-shrink-0"
                  >Remove</button>
                </div>
              ) : (
                <div
                  onClick={() => videoInputRef.current?.click()}
                  className="border-2 border-dashed border-gray-300 rounded-xl p-5 text-center cursor-pointer hover:border-teal/60 hover:bg-teal/5 transition-colors"
                >
                  <div className="text-2xl mb-1">🎬</div>
                  <p className="text-sm text-muted font-medium">Click to upload a status video</p>
                  <p className="text-xs text-muted mt-0.5">MP4, WebM, MOV — max 200 MB</p>
                </div>
              )}
              <input
                ref={videoInputRef}
                type="file"
                accept="video/mp4,video/webm,video/quicktime,video/*"
                className="hidden"
                onChange={(e) => {
                  const file = e.target.files?.[0];
                  if (file) set('newVideoFile', file);
                  e.target.value = '';
                }}
              />
            </div>

            {uploadError && <p className="text-xs text-red-500">{uploadError}</p>}
          </div>
        ) : (
          /* ── Preview Step ── */
          <div className="space-y-5">
            <div className="bg-amber-50 border border-amber-200 rounded-xl p-3 text-xs text-amber-700">
              Review all details below. Click <strong>Create Project</strong> to publish, or <strong>← Back</strong> to make changes.
            </div>

            {/* Images */}
            {allPreviewImages.length > 0 && (
              <div>
                <p className="text-xs font-semibold uppercase tracking-wide text-navy mb-2">Photos ({allPreviewImages.length})</p>
                <div className="grid grid-cols-3 sm:grid-cols-5 gap-2">
                  {allPreviewImages.map((url, i) => (
                    <div key={i} className={`aspect-square rounded-lg overflow-hidden border ${i === 0 ? 'border-teal col-span-1 sm:col-span-2 sm:row-span-2' : 'border-border'}`}>
                      <img src={getImageUrl(url)} alt="" className="w-full h-full object-cover" />
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Video */}
            {previewVideoUrl && (
              <div>
                <p className="text-xs font-semibold uppercase tracking-wide text-navy mb-2">Status Video</p>
                <video
                  src={getImageUrl(previewVideoUrl)}
                  controls
                  className="w-full rounded-xl border border-border max-h-56 bg-black"
                />
              </div>
            )}

            {/* Details grid */}
            <div className="grid grid-cols-2 gap-x-6 gap-y-3 text-sm">
              <div>
                <p className="text-[10px] font-bold uppercase tracking-widest text-muted mb-0.5">Project Name</p>
                <p className="font-semibold text-navy">{form.name}</p>
              </div>
              <div>
                <p className="text-[10px] font-bold uppercase tracking-widest text-muted mb-0.5">Type</p>
                <p className="font-semibold text-navy">{form.type}</p>
              </div>
              <div>
                <p className="text-[10px] font-bold uppercase tracking-widest text-muted mb-0.5">Location</p>
                <p className="font-semibold text-navy">{form.location}{form.lga ? `, ${form.lga}` : ''}, {form.state}</p>
              </div>
              <div>
                <p className="text-[10px] font-bold uppercase tracking-widest text-muted mb-0.5">Status</p>
                <span className={`text-[10px] font-bold px-2.5 py-1 rounded-full ${STATUS_COLORS[form.status] ?? 'bg-surface text-muted'}`}>
                  {STATUS_LABELS[form.status]}
                </span>
              </div>
              <div>
                <p className="text-[10px] font-bold uppercase tracking-widest text-muted mb-0.5">Price Range</p>
                <p className="font-semibold text-navy">
                  {form.priceFrom ? formatPrice(Number(form.priceFrom)) : '—'}
                  {form.priceTo ? ` – ${formatPrice(Number(form.priceTo))}` : ''}
                </p>
              </div>
              <div>
                <p className="text-[10px] font-bold uppercase tracking-widest text-muted mb-0.5">Units</p>
                <p className="font-semibold text-navy">{form.availableUnits} avail / {form.totalUnits} total</p>
              </div>
              <div>
                <p className="text-[10px] font-bold uppercase tracking-widest text-muted mb-0.5">Progress</p>
                <div className="flex items-center gap-2 mt-1">
                  <div className="flex-1 h-2 bg-border rounded-full overflow-hidden">
                    <div className="h-full bg-teal" style={{ width: `${Math.min(100, Number(form.progress) || 0)}%` }} />
                  </div>
                  <span className="text-xs font-semibold text-navy">{form.progress}%</span>
                </div>
              </div>
              {form.completionDate && (
                <div>
                  <p className="text-[10px] font-bold uppercase tracking-widest text-muted mb-0.5">Completion</p>
                  <p className="font-semibold text-navy">{form.completionDate}</p>
                </div>
              )}
            </div>

            {form.description && (
              <div>
                <p className="text-[10px] font-bold uppercase tracking-widest text-muted mb-1">Description</p>
                <p className="text-sm text-ink leading-relaxed">{form.description}</p>
              </div>
            )}

            {form.features.length > 0 && (
              <div>
                <p className="text-[10px] font-bold uppercase tracking-widest text-muted mb-2">Features</p>
                <div className="flex flex-wrap gap-1.5">
                  {form.features.map((f) => (
                    <span key={f} className="px-2.5 py-1 rounded-full text-xs bg-teal/10 text-teal border border-teal/20">{f}</span>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
      </Modal>

      {/* Delete confirm */}
      <ConfirmModal
        isOpen={!!deleteTarget}
        onClose={() => setDeleteTarget(null)}
        onConfirm={handleDelete}
        loading={isDeleting}
        title="Delete Project"
        message={`Permanently delete "${deleteTarget?.name}"? This cannot be undone.`}
        confirmLabel="Delete"
        variant="danger"
      />
    </div>
  );
};
