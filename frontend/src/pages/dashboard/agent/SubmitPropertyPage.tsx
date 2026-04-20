import { useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useCreatePropertyMutation, useUploadImagesMutation, useUploadDocumentsMutation } from '../../../features/properties/propertiesApi';
import { Input } from '../../../components/ui/Input';
import { Select } from '../../../components/ui/Select';
import { Button } from '../../../components/ui/Button';
import { PropertyType } from '../../../types';
import { NIGERIAN_STATES } from '../../../constants/nigerianStates';

const PROPERTY_TYPES: { type: PropertyType; emoji: string }[] = [
  { type: PropertyType.APARTMENT,       emoji: '🏢' },
  { type: PropertyType.BLOCK_OF_FLATS,  emoji: '🏗️' },
  { type: PropertyType.FULLY_DETACHED,  emoji: '🏡' },
  { type: PropertyType.SEMI_DETACHED,   emoji: '🏘️' },
  { type: PropertyType.TERRACED,        emoji: '🏚️' },
  { type: PropertyType.DUPLEX,          emoji: '🏠' },
];

const AMENITIES = ['Pool', 'BQ', 'Generator', 'CCTV', 'Gym', 'Elevator', 'Concierge', 'Smart Home', 'Security', 'Parking'];

const STEPS = [
  { n: 1, label: 'TYPE' },
  { n: 2, label: 'DETAILS' },
  { n: 3, label: 'SPECS & MEDIA' },
  { n: 4, label: 'REVIEW' },
];

// ─── Stepper Header ───────────────────────────────────────────────────────────

function StepHeader({ current }: { current: number }) {
  return (
    <div className="flex items-center justify-center mb-8 px-2">
      {STEPS.map((s, i) => (
        <div key={s.n} className="flex items-center">
          {/* connector */}
          {i > 0 && (
            <div className={`h-px w-12 sm:w-20 ${current > s.n - 1 ? 'bg-teal' : 'bg-gray-200'}`} />
          )}
          <div className="flex flex-col items-center gap-1.5">
            <div
              className={`w-10 h-10 rounded-full flex items-center justify-center text-sm font-bold transition-colors
                ${current > s.n
                  ? 'bg-teal text-white'
                  : current === s.n
                  ? 'bg-navy text-white'
                  : 'bg-white border-2 border-gray-200 text-gray-400'
                }`}
            >
              {current > s.n
                ? <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={3} viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" /></svg>
                : s.n}
            </div>
            <span className={`text-[10px] font-bold tracking-widest ${current === s.n ? 'text-navy' : current > s.n ? 'text-teal' : 'text-gray-400'}`}>
              {s.label}
            </span>
          </div>
        </div>
      ))}
    </div>
  );
}

// ─── Types ────────────────────────────────────────────────────────────────────

type FormState = {
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
  photos: File[];
  photoUrls: string[];
  panoramaFile: File | null;
  panoramaUrl: string;
  documents: File[];
  documentUrls: string[];
};

const initial: FormState = {
  type: '', title: '', price: '', state: '', lga: '', area: '', description: '',
  beds: '', baths: '', sqm: '', amenities: [], photos: [], photoUrls: [],
  panoramaFile: null, panoramaUrl: '', documents: [], documentUrls: [],
};

// ─── Main Component ───────────────────────────────────────────────────────────

export const SubmitPropertyPage = () => {
  const navigate = useNavigate();
  const [step, setStep] = useState(1);
  const [form, setForm] = useState<FormState>(initial);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [uploading, setUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const panoramaInputRef = useRef<HTMLInputElement>(null);
  const docInputRef = useRef<HTMLInputElement>(null);

  const [createProperty, { isLoading: submitting }] = useCreatePropertyMutation();
  const [uploadImages] = useUploadImagesMutation();
  const [uploadDocuments] = useUploadDocumentsMutation();

  const set = (field: keyof FormState, value: unknown) =>
    setForm((prev) => ({ ...prev, [field]: value }));

  // ── Validation per step ──
  const validate = (s: number): Record<string, string> => {
    const e: Record<string, string> = {};
    if (s === 1 && !form.type) e.type = 'Please select a property type';
    if (s === 2) {
      if (!form.title || form.title.length < 5) e.title = 'Title must be at least 5 characters';
      if (!form.price || Number(form.price) <= 0) e.price = 'Enter a valid price';
      if (!form.state) e.state = 'State is required';
      if (!form.lga) e.lga = 'LGA is required';
      if (!form.area) e.area = 'Area is required';
      if (!form.description || form.description.length < 20) e.description = 'Description must be at least 20 characters';
    }
    if (s === 3 && form.photos.length < 1) e.photos = 'Please upload at least 1 photo';
    return e;
  };

  const next = async () => {
    const errs = validate(step);
    if (Object.keys(errs).length) { setErrors(errs); return; }
    setErrors({});

    // Upload photos, panorama, and documents when leaving step 3
    if (step === 3) {
      setUploading(true);
      try {
        // Regular photos
        if (form.photos.length > 0 && form.photoUrls.length === 0) {
          const fd = new FormData();
          form.photos.forEach((f) => fd.append('files', f));
          const { urls } = await uploadImages(fd).unwrap();
          set('photoUrls', urls);
        }
        // Panorama
        if (form.panoramaFile && !form.panoramaUrl) {
          const fd = new FormData();
          fd.append('files', form.panoramaFile);
          const { urls } = await uploadImages(fd).unwrap();
          set('panoramaUrl', urls[0] ?? '');
        }
        // Supporting documents
        if (form.documents.length > 0 && form.documentUrls.length === 0) {
          const fd = new FormData();
          form.documents.forEach((f) => fd.append('files', f));
          const { urls } = await uploadDocuments(fd).unwrap();
          set('documentUrls', urls);
        }
      } catch {
        setErrors({ photos: 'Upload failed. Please try again.' });
        setUploading(false);
        return;
      }
      setUploading(false);
    }

    setStep((s) => s + 1);
  };

  const back = () => { setErrors({}); setStep((s) => s - 1); };

  const onFilesSelected = (files: FileList | null) => {
    if (!files) return;
    const arr = Array.from(files).filter((f) => f.type.startsWith('image/'));
    set('photos', [...form.photos, ...arr].slice(0, 20));
    set('photoUrls', []); // reset URLs so they re-upload on next advance
  };

  const removePhoto = (i: number) => {
    set('photos', form.photos.filter((_, idx) => idx !== i));
    set('photoUrls', []);
  };

  const toggleAmenity = (a: string) =>
    set('amenities', form.amenities.includes(a)
      ? form.amenities.filter((x) => x !== a)
      : [...form.amenities, a]);

  const onSubmit = async () => {
    try {
      await createProperty({
        title: form.title,
        type: form.type as PropertyType,
        price: Number(form.price),
        state: form.state,
        lga: form.lga,
        area: form.area,
        beds: form.beds ? Number(form.beds) : undefined,
        baths: form.baths ? Number(form.baths) : undefined,
        sqm: form.sqm ? Number(form.sqm) : undefined,
        amenities: form.amenities,
        description: form.description,
        images: form.photoUrls,
        ...(form.documentUrls.length > 0 ? { documents: form.documentUrls } : {}),
        ...(form.panoramaUrl ? { panoramaUrl: form.panoramaUrl } : {}),
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
      } as any).unwrap();
      navigate('/dashboard/my-listings');
    } catch {
      setErrors({ submit: 'Submission failed. Please try again.' });
    }
  };

  // ─────────────────────────────────────────────────────────────────────────────

  return (
    <div className="max-w-2xl mx-auto">
      {/* Agency fee disclaimer */}
      <div className="mb-6 rounded-xl border border-amber-200 bg-amber-50 px-4 py-3.5 flex gap-3">
        <span className="text-amber-500 mt-0.5 flex-shrink-0">
          <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m21.73 18-8-14a2 2 0 0 0-3.48 0l-8 14A2 2 0 0 0 4 21h16a2 2 0 0 0 1.73-3Z"/><line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/></svg>
        </span>
        <div>
          <p className="text-sm font-semibold text-amber-800">Agency Fee — 5%</p>
          <p className="text-xs text-amber-700 mt-0.5 leading-relaxed">
            Owkaz Properties charges a <strong>5% agency fee</strong> on every successful sale or rental transaction facilitated through the platform. This fee covers listing promotion, buyer coordination, and transaction support.
          </p>
        </div>
      </div>

      <StepHeader current={step} />

      {/* ── Step 1: Type ── */}
      {step === 1 && (
        <div className="bg-white border border-border rounded-2xl overflow-hidden">
          <div className="px-6 py-5 border-b border-border">
            <h3 className="font-display text-xl text-navy">Select Property Type</h3>
          </div>
          <div className="p-6 grid grid-cols-2 sm:grid-cols-3 gap-4">
            {PROPERTY_TYPES.map(({ type, emoji }) => (
              <button
                key={type}
                type="button"
                onClick={() => { set('type', type); setErrors({}); }}
                className={`flex flex-col items-center gap-3 p-6 rounded-xl border-2 transition-all text-center
                  ${form.type === type
                    ? 'border-teal bg-teal/5'
                    : 'border-border hover:border-teal/40 bg-white'
                  }`}
              >
                <span className="text-4xl">{emoji}</span>
                <span className="font-semibold text-sm text-navy leading-tight">{type}</span>
              </button>
            ))}
          </div>
          {errors.type && <p className="text-xs text-red-500 px-6 pb-4">{errors.type}</p>}
          <div className="px-6 pb-6 flex justify-end">
            <Button onClick={next} size="lg">Next →</Button>
          </div>
        </div>
      )}

      {/* ── Step 2: Details ── */}
      {step === 2 && (
        <div className="bg-white border border-border rounded-2xl overflow-hidden">
          <div className="px-6 py-5 border-b border-border">
            <h3 className="font-display text-xl text-navy">Property Details</h3>
          </div>
          <div className="p-6 space-y-5">
            <Input
              label="Listing Title"
              placeholder="e.g. 4-Bed Fully Detached House in Lekki"
              value={form.title}
              onChange={(e) => set('title', e.target.value)}
              error={errors.title}
            />
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Input
                label="Asking Price (₦)"
                type="number"
                placeholder="e.g. 85000000"
                value={form.price}
                onChange={(e) => set('price', e.target.value)}
                error={errors.price}
              />
              <Select
                label="State"
                placeholder="Select state..."
                options={NIGERIAN_STATES.map((s) => ({ value: s.label, label: s.label }))}
                value={form.state}
                onChange={(e) => {
                  setForm((prev) => ({ ...prev, state: e.target.value, lga: '' }));
                }}
                error={errors.state}
              />
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Select
                label="LGA"
                placeholder={form.state ? 'Select LGA...' : 'Select a state first'}
                options={
                  (NIGERIAN_STATES.find((s) => s.label === form.state)?.lgas ?? [])
                    .map((l) => ({ value: l.value, label: l.label }))
                }
                value={form.lga}
                onChange={(e) => set('lga', e.target.value)}
                error={errors.lga}
                disabled={!form.state}
              />
              <Input
                label="Area / Neighbourhood"
                placeholder="e.g. Maitama District"
                value={form.area}
                onChange={(e) => set('area', e.target.value)}
                error={errors.area}
              />
            </div>
            <div>
              <label className="text-xs font-semibold uppercase tracking-wide text-navy block mb-1.5">Description</label>
              <textarea
                rows={5}
                placeholder="Describe the property..."
                value={form.description}
                onChange={(e) => set('description', e.target.value)}
                className={`w-full px-3.5 py-2.5 border rounded-lg text-sm text-ink bg-white outline-none transition-colors focus:border-teal resize-none ${errors.description ? 'border-red-400' : 'border-border'}`}
              />
              {errors.description && <p className="text-xs text-red-500 mt-1">{errors.description}</p>}
            </div>
            <div className="flex items-start gap-3 p-4 bg-red-50 border-l-4 border-red-400 rounded-lg">
              <span className="text-red-500 mt-0.5">⚠️</span>
              <div>
                <p className="text-xs font-bold uppercase tracking-wide text-red-700 mb-0.5">Important</p>
                <p className="text-xs text-red-700">Do NOT include any phone numbers, email addresses, or WhatsApp links anywhere in your listing. Violations will result in immediate rejection.</p>
              </div>
            </div>
          </div>
          <div className="px-6 pb-6 flex justify-between">
            <Button variant="ghost" onClick={back}>← Back</Button>
            <Button onClick={next} size="lg">Next →</Button>
          </div>
        </div>
      )}

      {/* ── Step 3: Specs & Media ── */}
      {step === 3 && (
        <div className="bg-white border border-border rounded-2xl overflow-hidden">
          <div className="px-6 py-5 border-b border-border">
            <h3 className="font-display text-xl text-navy">Specifications & Media</h3>
          </div>
          <div className="p-6 space-y-6">
            <div className="grid grid-cols-3 sm:grid-cols-3 gap-4">
              <Input label="Bedrooms" type="number" placeholder="e.g. 4" value={form.beds} onChange={(e) => set('beds', e.target.value)} />
              <Input label="Bathrooms" type="number" placeholder="e.g. 3" value={form.baths} onChange={(e) => set('baths', e.target.value)} />
              <Input label="Size (m²)" type="number" placeholder="e.g. 250" value={form.sqm} onChange={(e) => set('sqm', e.target.value)} />
            </div>

            <div>
              <label className="text-xs font-semibold uppercase tracking-wide text-navy block mb-3">Amenities</label>
              <div className="flex flex-wrap gap-2">
                {AMENITIES.map((a) => (
                  <button
                    key={a}
                    type="button"
                    onClick={() => toggleAmenity(a)}
                    className={`px-4 py-1.5 rounded-full text-sm border transition-all
                      ${form.amenities.includes(a)
                        ? 'bg-teal text-white border-teal'
                        : 'bg-white text-ink border-border hover:border-teal/50'
                      }`}
                  >
                    {a}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className="text-xs font-semibold uppercase tracking-wide text-navy block mb-3">Photos</label>

              {/* Upload zone */}
              <div
                onClick={() => fileInputRef.current?.click()}
                className={`border-2 border-dashed rounded-xl p-8 text-center cursor-pointer transition-colors hover:border-teal/60
                  ${errors.photos ? 'border-red-400 bg-red-50' : 'border-gray-300 bg-gray-50 hover:bg-teal/5'}`}
              >
                <div className="text-4xl mb-2">📷</div>
                <p className="text-sm text-muted font-medium">Click to upload images (min. 1, max. 20)</p>
                <p className="text-xs text-muted mt-1">JPG, PNG — max 5 MB per image</p>
              </div>
              <input
                ref={fileInputRef}
                type="file"
                accept="image/jpeg,image/png,image/webp"
                multiple
                className="hidden"
                onChange={(e) => onFilesSelected(e.target.files)}
              />
              {errors.photos && <p className="text-xs text-red-500 mt-1">{errors.photos}</p>}

              {/* Photo previews */}
              {form.photos.length > 0 && (
                <div className="mt-4 grid grid-cols-3 sm:grid-cols-4 gap-3">
                  {form.photos.map((file, i) => (
                    <div key={i} className="relative group aspect-square rounded-lg overflow-hidden border border-border">
                      <img
                        src={URL.createObjectURL(file)}
                        alt=""
                        className="w-full h-full object-cover"
                      />
                      <button
                        type="button"
                        onClick={() => removePhoto(i)}
                        className="absolute top-1 right-1 w-5 h-5 rounded-full bg-black/60 text-white text-xs flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                      >
                        ×
                      </button>
                    </div>
                  ))}
                  {form.photos.length < 20 && (
                    <button
                      type="button"
                      onClick={() => fileInputRef.current?.click()}
                      className="aspect-square rounded-lg border-2 border-dashed border-gray-300 flex items-center justify-center text-gray-400 hover:border-teal/60 hover:text-teal transition-colors text-2xl"
                    >
                      +
                    </button>
                  )}
                </div>
              )}
            </div>

            {/* 360° Panorama upload */}
            <div className="border-t border-border pt-6">
              <div className="flex items-center gap-2 mb-3">
                <label className="text-xs font-semibold uppercase tracking-wide text-navy">360° Panorama Image</label>
                <span className="text-[10px] bg-teal/10 text-teal px-2 py-0.5 rounded-full font-semibold">Optional</span>
              </div>
              <p className="text-xs text-muted mb-3">Upload a single equirectangular (spherical) image to enable immersive 360° virtual tours for buyers.</p>
              {form.panoramaFile ? (
                <div className="flex items-center gap-3 p-3 bg-teal/5 border border-teal/20 rounded-xl">
                  <div className="w-16 h-10 rounded-lg overflow-hidden bg-gray-100 flex-shrink-0">
                    <img src={URL.createObjectURL(form.panoramaFile)} alt="" className="w-full h-full object-cover" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="text-xs font-semibold text-navy truncate">{form.panoramaFile.name}</div>
                    <div className="text-[10px] text-muted">Ready to upload</div>
                  </div>
                  <button
                    type="button"
                    onClick={() => { set('panoramaFile', null); set('panoramaUrl', ''); }}
                    className="text-xs text-red-500 hover:underline flex-shrink-0"
                  >Remove</button>
                </div>
              ) : (
                <div
                  onClick={() => panoramaInputRef.current?.click()}
                  className="border-2 border-dashed border-gray-300 rounded-xl p-5 text-center cursor-pointer hover:border-teal/60 hover:bg-teal/5 transition-colors"
                >
                  <div className="text-2xl mb-1">🌐</div>
                  <p className="text-sm text-muted font-medium">Click to upload panorama image</p>
                  <p className="text-xs text-muted mt-0.5">Equirectangular JPG/PNG — max 20 MB</p>
                </div>
              )}
              <input
                ref={panoramaInputRef}
                type="file"
                accept="image/jpeg,image/png"
                className="hidden"
                onChange={(e) => {
                  const file = e.target.files?.[0];
                  if (file) { set('panoramaFile', file); set('panoramaUrl', ''); }
                }}
              />
            </div>

            {/* Supporting Documents */}
            <div className="border-t border-border pt-6">
              <div className="flex items-center gap-2 mb-1">
                <label className="text-xs font-semibold uppercase tracking-wide text-navy">Supporting Documents</label>
                <span className="text-[10px] bg-amber-100 text-amber-700 px-2 py-0.5 rounded-full font-semibold">Optional but Recommended</span>
              </div>
              <p className="text-xs text-muted mb-3">Upload documents to verify authenticity — e.g. Certificate of Occupancy (CofO), Survey Plan, Deed of Assignment, Building Approval, etc.</p>
              <div
                onClick={() => docInputRef.current?.click()}
                className="border-2 border-dashed border-gray-300 rounded-xl p-5 text-center cursor-pointer hover:border-teal/60 hover:bg-teal/5 transition-colors"
              >
                <svg className="w-8 h-8 mx-auto mb-2 text-muted" fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M19.5 14.25v-2.625a3.375 3.375 0 00-3.375-3.375h-1.5A1.125 1.125 0 0113.5 7.125v-1.5a3.375 3.375 0 00-3.375-3.375H8.25m2.25 0H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 00-9-9z"/></svg>
                <p className="text-sm text-muted font-medium">Click to upload documents</p>
                <p className="text-xs text-muted mt-0.5">PDF, JPG, PNG — max 10 MB each</p>
              </div>
              <input
                ref={docInputRef}
                type="file"
                accept=".pdf,image/jpeg,image/png"
                multiple
                className="hidden"
                onChange={(e) => {
                  if (!e.target.files) return;
                  const arr = Array.from(e.target.files);
                  set('documents', [...form.documents, ...arr].slice(0, 10));
                  set('documentUrls', []);
                }}
              />
              {form.documents.length > 0 && (
                <div className="mt-3 space-y-2">
                  {form.documents.map((doc, i) => (
                    <div key={i} className="flex items-center gap-3 p-3 bg-cream border border-border rounded-lg">
                      <svg className="w-5 h-5 text-teal flex-shrink-0" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"/></svg>
                      <div className="flex-1 min-w-0">
                        <div className="text-xs font-semibold text-navy truncate">{doc.name}</div>
                        <div className="text-[10px] text-muted">{(doc.size / 1024).toFixed(0)} KB</div>
                      </div>
                      <button
                        type="button"
                        onClick={() => set('documents', form.documents.filter((_, idx) => idx !== i))}
                        className="text-xs text-red-500 hover:underline flex-shrink-0"
                      >
                        Remove
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
          <div className="px-6 pb-6 flex justify-between">
            <Button variant="ghost" onClick={back}>← Back</Button>
            <Button onClick={next} loading={uploading} size="lg">Review →</Button>
          </div>
        </div>
      )}

      {/* ── Step 4: Review ── */}
      {step === 4 && (
        <div className="bg-white border border-border rounded-2xl overflow-hidden">
          <div className="px-6 py-5 border-b border-border">
            <h3 className="font-display text-xl text-navy">Review & Submit</h3>
          </div>
          <div className="p-6 space-y-0">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-8 gap-y-5">
              <ReviewField label="Type" value={form.type} />
              <ReviewField label="Price" value={`₦${Number(form.price).toLocaleString()}`} />
              <ReviewField label="Title" value={form.title} />
              <ReviewField label="Location" value={`${form.state}, ${form.area}`} />
              <ReviewField label="LGA" value={form.lga} />
              <ReviewField label="Size" value={form.sqm ? `${form.sqm} m²` : '—'} />
              <ReviewField label="Bedrooms" value={form.beds || '—'} />
              <ReviewField label="Bathrooms" value={form.baths || '—'} />
            </div>

            {form.amenities.length > 0 && (
              <div className="pt-5">
                <p className="text-[10px] font-bold uppercase tracking-widest text-muted mb-2">Amenities</p>
                <div className="flex flex-wrap gap-2">
                  {form.amenities.map((a) => (
                    <span key={a} className="px-3 py-1 text-xs bg-teal/10 text-teal rounded-full font-medium">{a}</span>
                  ))}
                </div>
              </div>
            )}

            {form.photoUrls.length > 0 && (
              <div className="pt-5">
                <p className="text-[10px] font-bold uppercase tracking-widest text-muted mb-2">Photos ({form.photoUrls.length})</p>
                <div className="grid grid-cols-3 sm:grid-cols-5 gap-2">
                  {form.photos.slice(0, 5).map((file, i) => (
                    <div key={i} className="aspect-square rounded-lg overflow-hidden border border-border">
                      <img src={URL.createObjectURL(file)} alt="" className="w-full h-full object-cover" />
                    </div>
                  ))}
                  {form.photos.length > 5 && (
                    <div className="aspect-square rounded-lg border border-border bg-gray-50 flex items-center justify-center text-xs text-muted font-semibold">
                      +{form.photos.length - 5}
                    </div>
                  )}
                </div>
              </div>
            )}

            {form.documents.length > 0 && (
              <div className="pt-5">
                <p className="text-[10px] font-bold uppercase tracking-widest text-muted mb-2">Supporting Documents ({form.documents.length})</p>
                <div className="space-y-1.5">
                  {form.documents.map((doc, i) => (
                    <div key={i} className="flex items-center gap-2 text-xs text-navy">
                      <svg className="w-4 h-4 text-teal flex-shrink-0" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"/></svg>
                      {doc.name}
                    </div>
                  ))}
                </div>
              </div>
            )}

            <div className="mt-5 flex items-start gap-3 p-4 bg-green-50 border-l-4 border-green-400 rounded-lg">
              <span className="text-lg">✅</span>
              <div>
                <p className="text-xs font-bold uppercase tracking-wide text-green-800 mb-0.5">What Happens Next</p>
                <p className="text-xs text-green-700">After submission, your listing enters our review queue. The Owkaz team will review within 24–48 hours. You'll be notified when it's approved or if any changes are needed.</p>
              </div>
            </div>

            {errors.submit && (
              <p className="text-xs text-red-500 mt-3">{errors.submit}</p>
            )}
          </div>
          <div className="px-6 pb-6 flex justify-between">
            <Button variant="ghost" onClick={back}>← Back</Button>
            <Button variant="gold" onClick={onSubmit} loading={submitting} size="lg">
              Submit for Approval ✓
            </Button>
          </div>
        </div>
      )}
    </div>
  );
};

function ReviewField({ label, value }: { label: string; value: string | number }) {
  return (
    <div>
      <p className="text-[10px] font-bold uppercase tracking-widest text-muted mb-1">{label}</p>
      <p className="text-sm font-semibold text-navy">{value}</p>
    </div>
  );
}
