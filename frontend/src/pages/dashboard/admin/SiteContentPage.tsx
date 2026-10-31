import { useEffect, useRef, useState } from 'react';
import { Save, Trash2, Upload, ExternalLink, MapPin, Search } from 'lucide-react';
import { useGetContentQuery, useUpdateContentMutation } from '../../../features/content/contentApi';
import { PAGE_CONTENT } from '../../../features/content/pageContentConfig';
import {
  useGetPartnersQuery,
  useCreatePartnerMutation,
  useDeletePartnerMutation,
} from '../../../features/partners/partnersApi';
import {
  useGetLocationsQuery,
  useCreateLocationMutation,
  useDeleteLocationMutation,
} from '../../../features/locations/locationsApi';
import {
  useGetHeroSlidesQuery,
  useCreateHeroSlideMutation,
  useDeleteHeroSlideMutation,
} from '../../../features/heroSlides/heroSlidesApi';
import { useUploadImagesMutation, useGetPropertiesQuery, useGetPropertyPreviewQuery } from '../../../features/properties/propertiesApi';
import { Button } from '../../../components/ui/Button';
import { Input } from '../../../components/ui/Input';
import { getImageUrl } from '../../../utils/imageUrl';
import { formatPrice } from '../../../utils/format';

const PAGE_KEYS = Object.keys(PAGE_CONTENT);

const resolveImg = (path: string) => (path?.startsWith('/uploads/') ? getImageUrl(path) : path);

const PageEditor = ({ page }: { page: string }) => {
  const config = PAGE_CONTENT[page];
  const { data: savedContent, isLoading } = useGetContentQuery(page);
  const [updateContent, { isLoading: isSaving }] = useUpdateContentMutation();
  const [uploadImages, { isLoading: isUploadingImage }] = useUploadImagesMutation();
  const [form, setForm] = useState<Record<string, string>>(config.defaults);
  const [savedAt, setSavedAt] = useState<number | null>(null);
  const [uploadingKey, setUploadingKey] = useState<string | null>(null);

  useEffect(() => {
    setForm({ ...config.defaults, ...savedContent });
    setSavedAt(null);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [page, savedContent]);

  const set = (key: string, value: string) => setForm((f) => ({ ...f, [key]: value }));

  const handleSave = async () => {
    await updateContent({ page, content: form }).unwrap();
    setSavedAt(Date.now());
  };

  const handleImageUpload = async (key: string, file: File) => {
    setUploadingKey(key);
    try {
      const fd = new FormData();
      fd.append('files', file);
      const { urls } = await uploadImages(fd).unwrap();
      set(key, urls[0]);
    } finally {
      setUploadingKey(null);
    }
  };

  if (isLoading) {
    return <div className="text-sm text-muted">Loading current content…</div>;
  }

  return (
    <div className="space-y-8">
      {config.groups.map((group) => (
        <div key={group.title} className="bg-white border border-border rounded-2xl p-5">
          <h2 className="font-semibold text-navy mb-4">{group.title}</h2>
          <div className="grid sm:grid-cols-2 gap-4">
            {group.fields.map((f) => (
              <div key={f.key} className={f.type !== 'text' ? 'sm:col-span-2' : ''}>
                <label className="text-xs font-semibold uppercase tracking-wide text-navy block mb-1.5">
                  {f.label}
                </label>
                {f.type === 'multiline' ? (
                  <textarea
                    value={form[f.key] ?? ''}
                    onChange={(e) => set(f.key, e.target.value)}
                    rows={3}
                    className="w-full px-3.5 py-2.5 border border-border rounded-lg text-sm text-ink bg-white placeholder-muted outline-none transition-colors focus:border-teal resize-y"
                  />
                ) : f.type === 'image' ? (
                  <div className="flex items-center gap-4">
                    <img
                      src={resolveImg(form[f.key] ?? '')}
                      alt={f.label}
                      className="w-28 h-20 object-cover rounded-lg border border-border flex-shrink-0 bg-surface"
                    />
                    <label className="flex-1">
                      <input
                        type="file"
                        accept="image/png,image/jpeg,image/webp"
                        className="hidden"
                        onChange={(e) => {
                          const file = e.target.files?.[0];
                          if (file) handleImageUpload(f.key, file);
                        }}
                      />
                      <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-border bg-surface text-xs font-semibold text-navy cursor-pointer hover:border-teal transition-colors">
                        <Upload size={12} />
                        {uploadingKey === f.key ? 'Uploading…' : 'Replace photo'}
                      </span>
                    </label>
                  </div>
                ) : (
                  <Input value={form[f.key] ?? ''} onChange={(e) => set(f.key, e.target.value)} />
                )}
              </div>
            ))}
          </div>
        </div>
      ))}

      <div className="flex items-center gap-3">
        <Button onClick={handleSave} loading={isSaving || isUploadingImage}>
          <Save size={16} /> Save Changes
        </Button>
        {savedAt && Date.now() - savedAt < 4000 && (
          <span className="text-xs text-green-600 font-medium">Saved. Live on the site now.</span>
        )}
      </div>
    </div>
  );
};

const HeroSlidesEditor = () => {
  const { data: slides = [] } = useGetHeroSlidesQuery();
  const [createHeroSlide, { isLoading: isCreatingSlide }] = useCreateHeroSlideMutation();
  const [deleteHeroSlide] = useDeleteHeroSlideMutation();
  const [uploadImages, { isLoading: isUploadingSlide }] = useUploadImagesMutation();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleAddSlide = async (file: File) => {
    const fd = new FormData();
    fd.append('files', file);
    const { urls } = await uploadImages(fd).unwrap();
    await createHeroSlide({ imageUrl: urls[0], order: slides.length }).unwrap();
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  return (
    <div className="mt-12">
      <h2 className="font-display text-xl text-navy mb-1">Hero Background Images</h2>
      <p className="text-sm text-muted mb-4">
        Faded background photos that slowly rotate behind the homepage hero text. Leave empty to keep the plain navy background.
      </p>

      <div className="bg-white border border-border rounded-2xl p-5 mb-5">
        <label className="text-xs font-semibold uppercase tracking-wide text-navy block mb-1.5">Add photo</label>
        <input
          ref={fileInputRef}
          type="file"
          accept="image/png,image/jpeg,image/webp"
          onChange={(e) => {
            const file = e.target.files?.[0];
            if (file) handleAddSlide(file);
          }}
          disabled={isCreatingSlide || isUploadingSlide}
          className="w-full text-sm text-muted file:mr-3 file:px-3 file:py-1.5 file:rounded-lg file:border file:border-border file:bg-surface file:text-xs file:font-semibold file:text-navy"
        />
        {(isCreatingSlide || isUploadingSlide) && <p className="text-xs text-muted mt-2">Uploading…</p>}
      </div>

      {slides.length > 0 ? (
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-3">
          {slides.map((slide) => (
            <div key={slide.id} className="relative bg-white border border-border rounded-xl overflow-hidden group">
              <img src={resolveImg(slide.imageUrl)} alt="Hero background" className="w-full h-24 object-cover" />
              <button
                onClick={() => deleteHeroSlide(slide.id)}
                className="absolute top-2 right-2 p-1.5 rounded-lg bg-navy/70 text-white hover:bg-red-600 transition-colors"
                aria-label="Remove background image"
              >
                <Trash2 size={14} />
              </button>
            </div>
          ))}
        </div>
      ) : (
        <p className="text-sm text-muted">No background images added yet.</p>
      )}
    </div>
  );
};

const SpotlightEditor = () => {
  const { data: saved } = useGetContentQuery('spotlight');
  const [updateContent, { isLoading: isSaving }] = useUpdateContentMutation();
  const selectedId = saved?.propertyId ?? '';
  const { data: selected, isError: selectedMissing } = useGetPropertyPreviewQuery(selectedId, { skip: !selectedId });
  const [term, setTerm] = useState('');
  const [query, setQuery] = useState('');
  const [savedAt, setSavedAt] = useState<number | null>(null);
  const { data: results } = useGetPropertiesQuery({ limit: 8, search: query || undefined });

  useEffect(() => {
    const timeout = setTimeout(() => setQuery(term.trim()), 300);
    return () => clearTimeout(timeout);
  }, [term]);

  const choose = async (propertyId: string) => {
    await updateContent({ page: 'spotlight', content: { propertyId } }).unwrap();
    setSavedAt(Date.now());
  };

  const hasPin = (p: { latitude?: number | null; longitude?: number | null }) => p.latitude != null && p.longitude != null;

  return (
    <div className="mt-12">
      <h2 className="font-display text-xl text-navy mb-1">Homepage story: Nigeria to your front door</h2>
      <p className="text-sm text-muted mb-4">
        Pick the property the homepage story ends on. The map zooms to its state and area, then opens into its photo.
        Leave it on Automatic to feature the state with the most listings.
      </p>

      <div className="bg-white border border-border rounded-2xl p-5 mb-5">
        <div className="text-xs font-semibold uppercase tracking-wide text-navy mb-2">Currently featured</div>
        {selectedId && selected ? (
          <div className="flex items-center gap-3">
            {selected.images?.[0] && <img src={resolveImg(selected.images[0])} alt="" className="w-16 h-12 rounded-lg object-cover flex-shrink-0" />}
            <div className="min-w-0 flex-1">
              <div className="text-sm font-semibold text-navy truncate">{selected.title}</div>
              <div className="text-xs text-muted truncate">{selected.area}, {selected.state} · {formatPrice(selected.price)}</div>
              {!hasPin(selected) && (
                <div className="text-xs text-amber-700 mt-1">
                  This listing has no map pin yet, so the story will zoom to its area without a pin. Add an exact location when editing the listing.
                </div>
              )}
            </div>
            <Button variant="secondary" size="sm" onClick={() => choose('')} disabled={isSaving}>Use automatic</Button>
          </div>
        ) : selectedId && selectedMissing ? (
          <div className="flex items-center gap-3">
            <p className="text-sm text-amber-700 flex-1">
              The property you chose is no longer live, so the homepage is using Automatic.
            </p>
            <Button variant="secondary" size="sm" onClick={() => choose('')} disabled={isSaving}>Clear</Button>
          </div>
        ) : (
          <div className="text-sm text-navy">
            <span className="inline-block rounded-full bg-teal/10 text-teal text-xs font-semibold px-2.5 py-0.5 mr-2">Automatic</span>
            Uses the state with the most listings.
          </div>
        )}
        {savedAt && !isSaving && <p className="text-xs text-teal mt-3">Saved. The homepage now shows this choice.</p>}
        {isSaving && <p className="text-xs text-muted mt-3">Saving…</p>}
      </div>

      <div className="bg-white border border-border rounded-2xl p-5">
        <label className="text-xs font-semibold uppercase tracking-wide text-navy block mb-1.5">Choose a property</label>
        <div className="relative mb-3">
          <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted" />
          <input
            value={term}
            onChange={(e) => setTerm(e.target.value)}
            placeholder="Search by title, area, LGA or state"
            className="w-full border border-border rounded-lg pl-9 pr-3 py-2.5 text-sm focus:outline-none focus:border-teal transition-colors"
          />
        </div>
        {results && results.data.length > 0 ? (
          <ul className="divide-y divide-border">
            {results.data.map((p) => (
              <li key={p.id} className="flex items-center gap-3 py-2.5">
                {p.images?.[0] ? (
                  <img src={resolveImg(p.images[0])} alt="" className="w-14 h-10 rounded-md object-cover flex-shrink-0" />
                ) : (
                  <div className="w-14 h-10 rounded-md bg-cream flex-shrink-0" />
                )}
                <div className="min-w-0 flex-1">
                  <div className="text-sm font-medium text-navy truncate">{p.title}</div>
                  <div className="text-xs text-muted truncate flex items-center gap-1">
                    <MapPin size={11} /> {p.area}, {p.state} · {formatPrice(p.price)}
                    {hasPin(p) && <span className="ml-1 text-teal font-medium">· map pin</span>}
                  </div>
                </div>
                <Button size="sm" variant={p.id === selectedId ? 'secondary' : 'primary'} onClick={() => choose(p.id)} disabled={isSaving || p.id === selectedId}>
                  {p.id === selectedId ? 'Featured' : 'Feature'}
                </Button>
              </li>
            ))}
          </ul>
        ) : (
          <p className="text-sm text-muted">{results ? 'No listings match that search.' : 'Loading listings…'}</p>
        )}
      </div>
    </div>
  );
};

const PartnersEditor = () => {
  const { data: partners = [] } = useGetPartnersQuery();
  const [createPartner, { isLoading: isCreatingPartner }] = useCreatePartnerMutation();
  const [deletePartner] = useDeletePartnerMutation();
  const [uploadImages, { isLoading: isUploadingLogo }] = useUploadImagesMutation();
  const [partnerName, setPartnerName] = useState('');
  const [partnerUrl, setPartnerUrl] = useState('');
  const [logoFile, setLogoFile] = useState<File | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleAddPartner = async () => {
    if (!partnerName.trim() || !logoFile) return;
    const fd = new FormData();
    fd.append('files', logoFile);
    const { urls } = await uploadImages(fd).unwrap();
    await createPartner({
      name: partnerName.trim(),
      logoUrl: urls[0],
      websiteUrl: partnerUrl.trim() || undefined,
    }).unwrap();
    setPartnerName('');
    setPartnerUrl('');
    setLogoFile(null);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  return (
    <div className="mt-12">
      <h2 className="font-display text-xl text-navy mb-1">Partners</h2>
      <p className="text-sm text-muted mb-4">Logos shown in the "Our Partners" section on the homepage.</p>

      <div className="bg-white border border-border rounded-2xl p-5 mb-5">
        <div className="grid sm:grid-cols-3 gap-4 items-end">
          <div>
            <label className="text-xs font-semibold uppercase tracking-wide text-navy block mb-1.5">Name</label>
            <Input value={partnerName} onChange={(e) => setPartnerName(e.target.value)} placeholder="Partner name" />
          </div>
          <div>
            <label className="text-xs font-semibold uppercase tracking-wide text-navy block mb-1.5">Website (optional)</label>
            <Input value={partnerUrl} onChange={(e) => setPartnerUrl(e.target.value)} placeholder="https://…" />
          </div>
          <div>
            <label className="text-xs font-semibold uppercase tracking-wide text-navy block mb-1.5">Logo</label>
            <input
              ref={fileInputRef}
              type="file"
              accept="image/png,image/jpeg,image/webp"
              onChange={(e) => setLogoFile(e.target.files?.[0] ?? null)}
              className="w-full text-sm text-muted file:mr-3 file:px-3 file:py-1.5 file:rounded-lg file:border file:border-border file:bg-surface file:text-xs file:font-semibold file:text-navy"
            />
          </div>
        </div>
        <Button
          className="mt-4"
          size="sm"
          onClick={handleAddPartner}
          loading={isCreatingPartner || isUploadingLogo}
          disabled={!partnerName.trim() || !logoFile}
        >
          <Upload size={14} /> Add Partner
        </Button>
      </div>

      {partners.length > 0 ? (
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-3">
          {partners.map((p) => (
            <div key={p.id} className="flex items-center gap-3 bg-white border border-border rounded-xl p-3">
              <img src={getImageUrl(p.logoUrl)} alt={p.name} className="h-10 w-16 object-contain flex-shrink-0" />
              <div className="min-w-0 flex-1">
                <div className="text-sm font-semibold text-navy truncate">{p.name}</div>
                {p.websiteUrl && (
                  <a
                    href={p.websiteUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-xs text-teal hover:underline flex items-center gap-1 truncate"
                  >
                    <ExternalLink size={10} /> {p.websiteUrl}
                  </a>
                )}
              </div>
              <button
                onClick={() => deletePartner(p.id)}
                className="text-muted hover:text-red-600 transition-colors flex-shrink-0"
                aria-label={`Remove ${p.name}`}
              >
                <Trash2 size={16} />
              </button>
            </div>
          ))}
        </div>
      ) : (
        <p className="text-sm text-muted">No partners added yet.</p>
      )}
    </div>
  );
};

const LocationsEditor = () => {
  const { data: locations = [] } = useGetLocationsQuery();
  const [createLocation, { isLoading: isCreatingLocation }] = useCreateLocationMutation();
  const [deleteLocation] = useDeleteLocationMutation();
  const [uploadImages, { isLoading: isUploadingPhoto }] = useUploadImagesMutation();
  const [locationName, setLocationName] = useState('');
  const [photoFile, setPhotoFile] = useState<File | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleAddLocation = async () => {
    if (!locationName.trim() || !photoFile) return;
    const fd = new FormData();
    fd.append('files', photoFile);
    const { urls } = await uploadImages(fd).unwrap();
    await createLocation({
      name: locationName.trim(),
      imageUrl: urls[0],
      order: locations.length,
    }).unwrap();
    setLocationName('');
    setPhotoFile(null);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  return (
    <div className="mt-12">
      <h2 className="font-display text-xl text-navy mb-1">Locations</h2>
      <p className="text-sm text-muted mb-4">
        Cities shown in "Explore by Location" on the homepage. Listing counts are computed live from actual properties in that state, LGA, or area.
      </p>

      <div className="bg-white border border-border rounded-2xl p-5 mb-5">
        <div className="grid sm:grid-cols-2 gap-4 items-end">
          <div>
            <label className="text-xs font-semibold uppercase tracking-wide text-navy block mb-1.5">City / State name</label>
            <Input value={locationName} onChange={(e) => setLocationName(e.target.value)} placeholder="e.g. Ibadan" />
          </div>
          <div>
            <label className="text-xs font-semibold uppercase tracking-wide text-navy block mb-1.5">Photo</label>
            <input
              ref={fileInputRef}
              type="file"
              accept="image/png,image/jpeg,image/webp"
              onChange={(e) => setPhotoFile(e.target.files?.[0] ?? null)}
              className="w-full text-sm text-muted file:mr-3 file:px-3 file:py-1.5 file:rounded-lg file:border file:border-border file:bg-surface file:text-xs file:font-semibold file:text-navy"
            />
          </div>
        </div>
        <Button
          className="mt-4"
          size="sm"
          onClick={handleAddLocation}
          loading={isCreatingLocation || isUploadingPhoto}
          disabled={!locationName.trim() || !photoFile}
        >
          <Upload size={14} /> Add Location
        </Button>
      </div>

      {locations.length > 0 ? (
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-3">
          {locations.map((loc) => (
            <div key={loc.id} className="flex items-center gap-3 bg-white border border-border rounded-xl p-3">
              <img src={getImageUrl(loc.imageUrl)} alt={loc.name} className="h-12 w-16 object-cover rounded-lg flex-shrink-0" />
              <div className="min-w-0 flex-1">
                <div className="text-sm font-semibold text-navy truncate">{loc.name}</div>
                <div className="text-xs text-muted">
                  {loc.propertyCount.toLocaleString()} {loc.propertyCount === 1 ? 'listing' : 'listings'}
                </div>
              </div>
              <button
                onClick={() => deleteLocation(loc.id)}
                className="text-muted hover:text-red-600 transition-colors flex-shrink-0"
                aria-label={`Remove ${loc.name}`}
              >
                <Trash2 size={16} />
              </button>
            </div>
          ))}
        </div>
      ) : (
        <p className="text-sm text-muted">No locations added yet.</p>
      )}
    </div>
  );
};

export const SiteContentPage = () => {
  const [activePage, setActivePage] = useState(PAGE_KEYS[0]);

  return (
    <div className="max-w-4xl">
      <div className="mb-6">
        <h1 className="font-display text-2xl text-navy">Site Content</h1>
        <p className="text-sm text-muted mt-1">
          Edit the text and photos shown across the public site, and manage the partner logos on the homepage.
        </p>
      </div>

      <div className="flex flex-wrap gap-2 mb-6 border-b border-border pb-4">
        {PAGE_KEYS.map((key) => (
          <button
            key={key}
            onClick={() => setActivePage(key)}
            className={`px-3.5 py-1.5 rounded-lg text-sm font-semibold transition-colors ${
              activePage === key ? 'bg-navy text-white' : 'bg-surface text-muted hover:text-navy'
            }`}
          >
            {PAGE_CONTENT[key].label}
          </button>
        ))}
      </div>

      <PageEditor key={activePage} page={activePage} />

      {activePage === 'home' && (
        <>
          <SpotlightEditor />
          <HeroSlidesEditor />
          <LocationsEditor />
          <PartnersEditor />
        </>
      )}
    </div>
  );
};
