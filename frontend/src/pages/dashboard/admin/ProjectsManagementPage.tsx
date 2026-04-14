import { useRef, useState } from 'react';
import { PlusCircle, Pencil, Trash2 } from 'lucide-react';
import {
  useGetProjectsQuery,
  useCreateProjectMutation,
  useUpdateProjectMutation,
  useDeleteProjectMutation,
  Project,
} from '../../../features/projects/projectsApi';
import { useUploadImagesMutation } from '../../../features/properties/propertiesApi';
import { Button } from '../../../components/ui/Button';
import { Input } from '../../../components/ui/Input';
import { Select } from '../../../components/ui/Select';
import { Modal } from '../../../components/ui/Modal';
import { ConfirmModal } from '../../../components/ui/ConfirmModal';
import { getImageUrl } from '../../../utils/imageUrl';
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
};

const emptyForm: FormState = {
  name: '', type: '', location: '', lga: '', state: '', description: '',
  priceFrom: '', priceTo: '', totalUnits: '', availableUnits: '',
  progress: '0', completionDate: '', status: 'ongoing',
  features: [], existingImages: [], newPhotos: [],
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
});

export const ProjectsManagementPage = () => {
  const { data: projects = [], isLoading } = useGetProjectsQuery({});
  const [create, { isLoading: isCreating }] = useCreateProjectMutation();
  const [update, { isLoading: isUpdating }] = useUpdateProjectMutation();
  const [deleteProject] = useDeleteProjectMutation();
  const [uploadImages] = useUploadImagesMutation();

  const [modalOpen, setModalOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState<FormState>(emptyForm);
  const [deleteTarget, setDeleteTarget] = useState<{ id: string; name: string } | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [uploadError, setUploadError] = useState('');
  const fileInputRef = useRef<HTMLInputElement>(null);

  const set = <K extends keyof FormState>(key: K, value: FormState[K]) =>
    setForm((prev) => ({ ...prev, [key]: value }));

  const openCreate = () => { setEditingId(null); setForm(emptyForm); setUploadError(''); setModalOpen(true); };
  const openEdit = (p: Project) => { setEditingId(p.id); setForm(toFormState(p)); setUploadError(''); setModalOpen(true); };

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

  const handleSave = async () => {
    setUploadError('');
    let newUrls: string[] = [];
    if (form.newPhotos.length > 0) {
      try {
        const fd = new FormData();
        form.newPhotos.forEach((f) => fd.append('files', f));
        const { urls } = await uploadImages(fd).unwrap();
        newUrls = urls;
      } catch {
        setUploadError('Image upload failed. Please try again.');
        return;
      }
    }

    const payload = {
      name: form.name,
      type: form.type,
      location: form.location,
      lga: form.lga || undefined,
      state: form.state,
      description: form.description || undefined,
      priceFrom: form.priceFrom ? Number(form.priceFrom) : undefined,
      priceTo: form.priceTo ? Number(form.priceTo) : undefined,
      totalUnits: Number(form.totalUnits) || 0,
      availableUnits: Number(form.availableUnits) || 0,
      progress: Math.min(100, Math.max(0, Number(form.progress) || 0)),
      completionDate: form.completionDate || undefined,
      status: form.status,
      images: [...form.existingImages, ...newUrls],
      features: form.features,
    };

    if (editingId) {
      await update({ id: editingId, data: payload });
    } else {
      await create(payload);
    }
    setModalOpen(false);
  };

  const handleDelete = async () => {
    if (!deleteTarget) return;
    setIsDeleting(true);
    try { await deleteProject(deleteTarget.id); }
    finally { setIsDeleting(false); setDeleteTarget(null); }
  };

  const isSaving = isCreating || isUpdating;
  const canSave = !!form.name && !!form.type && !!form.state;

  const lgaOptions = (NIGERIAN_STATES.find((s) => s.label === form.state)?.lgas ?? [])
    .map((l) => ({ value: l.value, label: l.label }));

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
        onClose={() => setModalOpen(false)}
        title={editingId ? 'Edit Project' : 'Add Project'}
        size="lg"
        footer={
          <>
            <Button variant="ghost" onClick={() => setModalOpen(false)} disabled={isSaving}>Cancel</Button>
            <Button onClick={handleSave} loading={isSaving} disabled={!canSave}>
              {editingId ? 'Save Changes' : 'Create Project'}
            </Button>
          </>
        }
      >
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

            {/* Drop zone */}
            <div
              onClick={() => fileInputRef.current?.click()}
              className="border-2 border-dashed border-gray-300 rounded-xl p-6 text-center cursor-pointer hover:border-teal/60 hover:bg-teal/5 transition-colors"
            >
              <div className="text-3xl mb-1">📷</div>
              <p className="text-sm text-muted font-medium">Click to upload images (max 20)</p>
              <p className="text-xs text-muted mt-0.5">JPG, PNG, WEBP — max 5 MB each</p>
            </div>
            <input
              ref={fileInputRef}
              type="file"
              accept="image/jpeg,image/png,image/webp"
              multiple
              className="hidden"
              onChange={(e) => onFilesSelected(e.target.files)}
            />
            {uploadError && <p className="text-xs text-red-500 mt-1">{uploadError}</p>}

            {/* Thumbnails */}
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
        </div>
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
