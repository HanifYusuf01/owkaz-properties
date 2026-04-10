import { useState } from 'react';
import { PlusCircle, Pencil, Trash2 } from 'lucide-react';
import {
  useGetProjectsQuery,
  useCreateProjectMutation,
  useUpdateProjectMutation,
  useDeleteProjectMutation,
  Project,
} from '../../../features/projects/projectsApi';
import { Button } from '../../../components/ui/Button';
import { Input } from '../../../components/ui/Input';
import { Modal } from '../../../components/ui/Modal';
import { ConfirmModal } from '../../../components/ui/ConfirmModal';

const STATUS_OPTIONS = ['ongoing', 'completed', 'pre-launch', 'selling-fast', 'new-launch'];

const STATUS_LABELS: Record<string, string> = {
  ongoing: 'Ongoing',
  completed: 'Completed',
  'pre-launch': 'Pre-Launch',
  'selling-fast': 'Selling Fast',
  'new-launch': 'New Launch',
};

const STATUS_COLORS: Record<string, string> = {
  ongoing: 'bg-teal/10 text-teal',
  completed: 'bg-green-100 text-green-700',
  'pre-launch': 'bg-purple-100 text-purple-700',
  'selling-fast': 'bg-gold/10 text-gold',
  'new-launch': 'bg-teal/10 text-teal',
};

type FormState = {
  name: string;
  type: string;
  location: string;
  state: string;
  description: string;
  priceFrom: string;
  priceTo: string;
  totalUnits: string;
  availableUnits: string;
  progress: string;
  completionDate: string;
  status: string;
  features: string; // comma-separated
};

const emptyForm: FormState = {
  name: '', type: '', location: '', state: '', description: '',
  priceFrom: '', priceTo: '', totalUnits: '', availableUnits: '',
  progress: '0', completionDate: '', status: 'ongoing', features: '',
};

const toFormState = (p: Project): FormState => ({
  name: p.name,
  type: p.type,
  location: p.location,
  state: p.state,
  description: p.description ?? '',
  priceFrom: p.priceFrom != null ? String(p.priceFrom) : '',
  priceTo: p.priceTo != null ? String(p.priceTo) : '',
  totalUnits: String(p.totalUnits),
  availableUnits: String(p.availableUnits),
  progress: String(p.progress),
  completionDate: p.completionDate ?? '',
  status: p.status,
  features: p.features?.join(', ') ?? '',
});

const toPayload = (f: FormState) => ({
  name: f.name,
  type: f.type,
  location: f.location,
  state: f.state,
  description: f.description || null,
  priceFrom: f.priceFrom ? Number(f.priceFrom) : null,
  priceTo: f.priceTo ? Number(f.priceTo) : null,
  totalUnits: Number(f.totalUnits) || 0,
  availableUnits: Number(f.availableUnits) || 0,
  progress: Math.min(100, Math.max(0, Number(f.progress) || 0)),
  completionDate: f.completionDate || null,
  status: f.status,
  images: [],
  features: f.features ? f.features.split(',').map((s) => s.trim()).filter(Boolean) : [],
});

export const ProjectsManagementPage = () => {
  const { data: projects = [], isLoading } = useGetProjectsQuery({});
  const [create, { isLoading: isCreating }] = useCreateProjectMutation();
  const [update, { isLoading: isUpdating }] = useUpdateProjectMutation();
  const [deleteProject] = useDeleteProjectMutation();

  const [modalOpen, setModalOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState<FormState>(emptyForm);
  const [deleteTarget, setDeleteTarget] = useState<{ id: string; name: string } | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const set = (key: keyof FormState) => (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) =>
    setForm((prev) => ({ ...prev, [key]: e.target.value }));

  const openCreate = () => {
    setEditingId(null);
    setForm(emptyForm);
    setModalOpen(true);
  };

  const openEdit = (p: Project) => {
    setEditingId(p.id);
    setForm(toFormState(p));
    setModalOpen(true);
  };

  const handleSave = async () => {
    const payload = toPayload(form);
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
                    <td className="px-4 py-3">
                      <div className="font-semibold text-navy">{p.name}</div>
                      {p.completionDate && <div className="text-xs text-muted">Est. {p.completionDate}</div>}
                    </td>
                    <td className="px-4 py-3 text-muted whitespace-nowrap">{p.type}</td>
                    <td className="px-4 py-3 text-muted whitespace-nowrap">{p.location}</td>
                    <td className="px-4 py-3 whitespace-nowrap">
                      <div className="text-navy font-medium">{p.availableUnits}<span className="text-muted font-normal"> / {p.totalUnits}</span></div>
                      <div className="text-[10px] text-muted">available</div>
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap">
                      <div className="flex items-center gap-2">
                        <div className="w-20 h-1.5 bg-border rounded-full overflow-hidden">
                          <div className="h-full bg-teal" style={{ width: `${p.progress}%` }} />
                        </div>
                        <span className="text-xs text-muted">{p.progress}%</span>
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <span className={`text-[10px] font-bold px-2.5 py-1 rounded-full ${STATUS_COLORS[p.status] ?? 'bg-surface text-muted'}`}>
                        {STATUS_LABELS[p.status] ?? p.status}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex gap-1.5">
                        <Button variant="ghost" size="sm" onClick={() => openEdit(p)}>
                          <Pencil size={13} />
                        </Button>
                        <Button variant="danger" size="sm" onClick={() => setDeleteTarget({ id: p.id, name: p.name })}>
                          <Trash2 size={13} />
                        </Button>
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
            <Button onClick={handleSave} loading={isSaving} disabled={!form.name || !form.type || !form.location || !form.state}>
              {editingId ? 'Save Changes' : 'Create Project'}
            </Button>
          </>
        }
      >
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Input label="Project Name *" placeholder="e.g. Emerald Gardens Estate" value={form.name} onChange={set('name')} />
          <Input label="Type *" placeholder="e.g. Gated Residential Estate" value={form.type} onChange={set('type')} />
          <Input label="Location *" placeholder="e.g. Gwarinpa, Abuja FCT" value={form.location} onChange={set('location')} />
          <Input label="State *" placeholder="e.g. FCT Abuja" value={form.state} onChange={set('state')} />
          <Input label="Price From (₦)" type="number" placeholder="e.g. 45000000" value={form.priceFrom} onChange={set('priceFrom')} />
          <Input label="Price To (₦)" type="number" placeholder="e.g. 90000000" value={form.priceTo} onChange={set('priceTo')} />
          <Input label="Total Units" type="number" placeholder="120" value={form.totalUnits} onChange={set('totalUnits')} />
          <Input label="Available Units" type="number" placeholder="34" value={form.availableUnits} onChange={set('availableUnits')} />
          <Input label="Progress (%)" type="number" placeholder="0–100" value={form.progress} onChange={set('progress')} />
          <Input label="Completion Date" placeholder="e.g. 2026 Q2" value={form.completionDate} onChange={set('completionDate')} />
          <div className="sm:col-span-2">
            <label className="block text-xs font-semibold text-muted uppercase tracking-wide mb-1.5">Status</label>
            <select
              value={form.status}
              onChange={set('status')}
              className="w-full border border-border rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:border-teal"
            >
              {STATUS_OPTIONS.map((s) => (
                <option key={s} value={s}>{STATUS_LABELS[s]}</option>
              ))}
            </select>
          </div>
          <div className="sm:col-span-2">
            <label className="block text-xs font-semibold text-muted uppercase tracking-wide mb-1.5">Features (comma-separated)</label>
            <input
              type="text"
              placeholder="e.g. Swimming Pool, Gated Estate, 24/7 Security"
              value={form.features}
              onChange={set('features')}
              className="w-full border border-border rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:border-teal"
            />
          </div>
          <div className="sm:col-span-2">
            <label className="block text-xs font-semibold text-muted uppercase tracking-wide mb-1.5">Description</label>
            <textarea
              rows={3}
              placeholder="Brief description of the development project..."
              value={form.description}
              onChange={set('description')}
              className="w-full border border-border rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:border-teal resize-none"
            />
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
