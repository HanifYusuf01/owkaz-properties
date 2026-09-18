import { lazy, Suspense, useState, useEffect, useCallback } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { ArrowLeft, Bed, Bath, Maximize, MapPin, Eye, View, X, ChevronLeft, ChevronRight, Play, Bookmark, BookmarkCheck } from 'lucide-react';

const PanoramaViewer = lazy(() =>
  import('../../components/property/PanoramaViewer').then((m) => ({ default: m.PanoramaViewer }))
);
import {
  useGetPropertyByIdQuery,
  useGetSavedPropertyIdsQuery,
  useSavePropertyMutation,
  useUnsavePropertyMutation,
} from '../../features/properties/propertiesApi';
import { useCreateInquiryMutation } from '../../features/inquiries/inquiriesApi';
import { useAppSelector } from '../../store';
import { formatPrice, formatDate } from '../../utils/format';
import { getImageUrl } from '../../utils/imageUrl';
import { PropertyStatus } from '../../types';
import { googleMapsSearchUrl, googleMapsEmbedUrl } from '../../utils/googleMapsLink';
import { INQUIRY_SUGGESTIONS } from '../../constants/inquirySuggestions';

export const PropertyDetailPage = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const user = useAppSelector((s) => s.auth.user);

  const { data: property, isLoading } = useGetPropertyByIdQuery(id!, { skip: !id });
  const [createInquiry, { isLoading: isSending }] = useCreateInquiryMutation();
  const [saveProperty] = useSavePropertyMutation();
  const [unsaveProperty] = useUnsavePropertyMutation();
  const { data: savedIds = [] } = useGetSavedPropertyIdsQuery(undefined, { skip: !user });
  const isSaved = property ? savedIds.includes(property.id) : false;

  const [name, setName] = useState(user?.name ?? '');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState(user?.email ?? '');
  const [message, setMessage] = useState('I am interested in this property and would like to schedule a viewing.');
  const [sent, setSent] = useState(false);
  const [activeImg, setActiveImg] = useState(0);
  const [showPanorama, setShowPanorama] = useState(false);
  const [showVideo, setShowVideo] = useState(false);
  const [lightboxOpen, setLightboxOpen] = useState(false);
  const [lightboxIdx, setLightboxIdx] = useState(0);

  const openLightbox = (idx: number) => { setLightboxIdx(idx); setLightboxOpen(true); };
  const closeLightbox = useCallback(() => setLightboxOpen(false), []);
  const lightboxPrev = useCallback(() => setLightboxIdx((i) => (i === 0 ? (property?.images?.length ?? 1) - 1 : i - 1)), [property]);
  const lightboxNext = useCallback(() => setLightboxIdx((i) => (i === (property?.images?.length ?? 1) - 1 ? 0 : i + 1)), [property]);

  useEffect(() => {
    if (!lightboxOpen) return;
    const handler = (e: KeyboardEvent) => {
      if (e.key === 'Escape') closeLightbox();
      if (e.key === 'ArrowLeft') lightboxPrev();
      if (e.key === 'ArrowRight') lightboxNext();
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [lightboxOpen, closeLightbox, lightboxPrev, lightboxNext]);

  const handleInquiry = async () => {
    if (!user) { navigate('/login'); return; }
    if (!property) return;
    const inquiry = await createInquiry({ propertyId: property.id, message, preferredContact: 'email' }).unwrap();
    setSent(true);
    navigate('/my-inquiries', { state: { openInquiryId: inquiry.id } });
  };

  const handleSaveToggle = async () => {
    if (!user) { navigate('/login'); return; }
    if (!property) return;
    if (isSaved) await unsaveProperty(property.id);
    else await saveProperty(property.id);
  };

  if (isLoading) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 text-center">
        <div className="w-8 h-8 border-4 border-teal border-t-transparent rounded-full animate-spin mx-auto" />
      </div>
    );
  }

  if (!property) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 text-center">
        <div className="text-5xl mb-3">🏚️</div>
        <h2 className="font-display text-2xl text-navy mb-2">Property Not Found</h2>
        <p className="text-muted text-sm mb-6">This property may have been removed or is no longer available.</p>
        <button
          onClick={() => navigate('/properties')}
          className="px-5 py-2.5 rounded-xl bg-navy text-white text-sm font-semibold"
        >
          Browse Properties
        </button>
      </div>
    );
  }

  const images = property.images?.length ? property.images : null;
  const isSold = property.status === PropertyStatus.SOLD;
  const mapLocation =
    property.latitude != null && property.longitude != null
      ? { lat: property.latitude, lng: property.longitude }
      : [property.area, property.lga, property.state];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Back */}
      <button
        onClick={() => navigate(isSold ? '/sold-properties' : '/properties')}
        className="inline-flex items-center gap-1.5 text-sm text-muted hover:text-navy transition-colors mb-6"
      >
        <ArrowLeft size={16} />
        Back to {isSold ? 'Sold Properties' : 'Properties'}
      </button>

      {/* Gallery */}
      <div className="grid grid-cols-3 gap-3 rounded-2xl overflow-hidden h-64 sm:h-80 mb-8">
        {/* Main image */}
        <div
          className="col-span-2 relative bg-gray-100 flex items-center justify-center overflow-hidden cursor-pointer group"
          onClick={() => images && openLightbox(activeImg)}
        >
          {images ? (
            <img
              src={getImageUrl(images[activeImg] ?? images[0])}
              alt={property.title}
              className="w-full h-full object-cover group-hover:scale-[1.02] transition-transform duration-300"
            />
          ) : (
            <span className="text-8xl opacity-20">🏠</span>
          )}
          {/* Expand hint */}
          {images && (
            <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors flex items-center justify-center">
              <div className="opacity-0 group-hover:opacity-100 transition-opacity bg-black/60 text-white text-xs font-semibold px-3 py-1.5 rounded-lg">
                View Gallery
              </div>
            </div>
          )}
          {isSold && (
            <div className="absolute top-3 left-3 bg-gold text-white text-xs font-bold px-3 py-1 rounded-full uppercase">
              Sold
            </div>
          )}
          {property.featured && !isSold && (
            <div className="absolute top-3 left-3 bg-gold text-white text-xs font-bold px-3 py-1 rounded-full uppercase">
              Featured
            </div>
          )}
          {property.panoramaUrl && (
            <button
              onClick={(e) => { e.stopPropagation(); setShowPanorama(true); }}
              className="absolute bottom-3 right-3 flex items-center gap-1.5 bg-black/70 hover:bg-black/90 text-white text-xs font-semibold px-3 py-2 rounded-lg border border-white/20 transition-colors backdrop-blur-sm"
            >
              <View size={14} />
              360° View
            </button>
          )}
        </div>
        {/* Thumbnails */}
        <div className="flex flex-col gap-3">
          {images ? (
            <>
              <div
                className="flex-1 relative bg-gray-100 overflow-hidden cursor-pointer group"
                onClick={() => openLightbox(1 < images.length ? 1 : 0)}
              >
                <img
                  src={getImageUrl(images[1] ?? images[0])}
                  alt=""
                  className="w-full h-full object-cover group-hover:opacity-90 transition-opacity"
                />
              </div>
              <div
                className="flex-1 relative bg-gray-100 overflow-hidden cursor-pointer group"
                onClick={() => openLightbox(2 < images.length ? 2 : 0)}
              >
                <img
                  src={getImageUrl(images[2] ?? images[0])}
                  alt=""
                  className="w-full h-full object-cover group-hover:opacity-90 transition-opacity"
                />
                {images.length > 3 && (
                  <div className="absolute inset-0 bg-navy/60 hover:bg-navy/50 transition-colors flex items-center justify-center text-white font-semibold text-sm">
                    +{images.length - 3} Photos
                  </div>
                )}
              </div>
            </>
          ) : (
            <>
              <div className="flex-1 bg-gray-100" />
              <div className="flex-1 bg-gray-100" />
            </>
          )}
        </div>
      </div>

      {/* 360° banner — shown when panorama is available */}
      {property.panoramaUrl && (
        <div className="mb-8 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 bg-gradient-to-r from-navy to-teal rounded-2xl px-5 py-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-white/10 border border-white/20 flex items-center justify-center flex-shrink-0">
              <View size={18} className="text-white" />
            </div>
            <div>
              <div className="text-white font-semibold text-sm">Virtual 360° Tour Available</div>
              <div className="text-white/60 text-xs">Explore every corner of this property interactively</div>
            </div>
          </div>
          <button
            onClick={() => setShowPanorama(true)}
            className="flex-shrink-0 w-full sm:w-auto flex items-center justify-center gap-1.5 bg-white text-navy text-xs font-bold px-4 py-2.5 rounded-xl hover:bg-cream transition-colors"
          >
            <View size={13} /> Launch 360° View
          </button>
        </div>
      )}

      {/* Content layout */}
      <div className="grid lg:grid-cols-[1fr_380px] gap-8">
        {/* Main content */}
        <div>
          {/* Badges */}
          <div className="flex flex-wrap gap-2 mb-4">
            {isSold && (
              <span className="bg-gold/10 text-gold text-xs font-bold px-3 py-1 rounded-full border border-gold/20">
                Sold
              </span>
            )}
            {property.featured && (
              <span className="bg-gold/10 text-gold text-xs font-bold px-3 py-1 rounded-full border border-gold/20">
                Featured
              </span>
            )}
            <span className="bg-teal/10 text-teal text-xs font-bold px-3 py-1 rounded-full border border-teal/20">
              ✓ Verified
            </span>
            <span className="bg-cream text-muted text-xs font-semibold px-3 py-1 rounded-full border border-border">
              {property.type}
            </span>
          </div>

          <div className="flex items-start justify-between gap-3 mb-3">
            <h1 className="font-display text-2xl sm:text-3xl text-navy">{property.title}</h1>
            <button
              onClick={handleSaveToggle}
              className={`flex items-center gap-1.5 text-xs font-semibold px-3.5 py-2.5 rounded-lg border transition-colors flex-shrink-0 ${
                isSaved
                  ? 'bg-teal/10 border-teal/30 text-teal'
                  : 'border-border text-muted hover:border-navy hover:text-navy'
              }`}
            >
              {isSaved ? <BookmarkCheck size={15} /> : <Bookmark size={15} />}
              {isSaved ? 'Saved' : 'Save'}
            </button>
          </div>

          <div className="flex items-center gap-1.5 text-sm text-muted mb-5">
            <MapPin size={15} />
            <span>{property.area}, {property.lga}, {property.state}</span>
          </div>

          {/* Price row */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6 p-4 bg-cream rounded-2xl border border-border">
            <div>
              <div className="font-display text-3xl text-navy">
                {isSold && property.salePrice ? formatPrice(property.salePrice) : formatPrice(property.price)}
              </div>
              <div className="text-xs text-muted mt-0.5">
                {isSold ? 'Final sale price' : 'Asking price · Price negotiable'}
              </div>
              {isSold && property.price !== property.salePrice && property.salePrice && (
                <div className="text-xs text-muted mt-1">
                  Listed at <span className="line-through">{formatPrice(property.price)}</span>
                </div>
              )}
            </div>
            <div className="flex items-center gap-1.5 text-xs text-muted">
              <Eye size={14} />
              <span>{property.views} views</span>
            </div>
          </div>

          {/* Specs grid */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-8">
            {property.beds != null && (
              <div className="bg-white border border-border rounded-xl p-4 text-center">
                <div className="text-2xl mb-1">🛏️</div>
                <div className="font-bold text-navy text-lg">{property.beds}</div>
                <div className="text-xs text-muted">Bedrooms</div>
              </div>
            )}
            {property.baths != null && (
              <div className="bg-white border border-border rounded-xl p-4 text-center">
                <div className="text-2xl mb-1">🚿</div>
                <div className="font-bold text-navy text-lg">{property.baths}</div>
                <div className="text-xs text-muted">Bathrooms</div>
              </div>
            )}
            {property.sqm != null && (
              <div className="bg-white border border-border rounded-xl p-4 text-center">
                <div className="text-2xl mb-1">📐</div>
                <div className="font-bold text-navy text-lg">{property.sqm}</div>
                <div className="text-xs text-muted">sqm Total</div>
              </div>
            )}
            <div className="bg-white border border-border rounded-xl p-4 text-center">
              <div className="text-2xl mb-1">📍</div>
              <div className="font-bold text-navy text-sm leading-tight">{property.state}</div>
              <div className="text-xs text-muted">State</div>
            </div>
          </div>

          {/* Description */}
          {property.description && (
            <div className="mb-8">
              <h2 className="font-display text-xl text-navy mb-3">Property Description</h2>
              <p className="text-sm text-muted leading-relaxed">{property.description}</p>
            </div>
          )}

          {/* Amenities */}
          {property.amenities?.length > 0 && (
            <div className="mb-8">
              <h2 className="font-display text-xl text-navy mb-3">Amenities & Features</h2>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                {property.amenities.map((a) => (
                  <div key={a} className="flex items-center gap-2 text-sm text-muted">
                    <span className="w-5 h-5 rounded-full bg-teal/10 text-teal flex items-center justify-center text-xs font-bold flex-shrink-0">
                      ✓
                    </span>
                    {a}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Property video */}
          {property.videoUrl && (
            <div className="mb-8">
              {showVideo ? (
                <div>
                  <div className="flex items-center justify-between mb-3">
                    <h2 className="font-display text-xl text-navy flex items-center gap-2">
                      <Play size={18} className="text-teal" /> Property Video
                    </h2>
                    <button onClick={() => setShowVideo(false)} className="text-xs text-muted hover:text-navy">
                      Hide
                    </button>
                  </div>
                  <video
                    src={getImageUrl(property.videoUrl)}
                    controls
                    autoPlay
                    className="w-full rounded-2xl border border-border bg-black max-h-80"
                  />
                </div>
              ) : (
                <button
                  onClick={() => setShowVideo(true)}
                  className="w-full flex items-center gap-3 p-4 bg-navy rounded-2xl hover:bg-navy-mid transition-colors"
                >
                  <div className="w-10 h-10 rounded-full bg-white/10 flex items-center justify-center flex-shrink-0">
                    <Play size={16} className="text-white ml-0.5" />
                  </div>
                  <div className="text-left">
                    <div className="text-white font-semibold text-sm">Watch Property Video</div>
                    <div className="text-white/50 text-xs">See a walkthrough of this property</div>
                  </div>
                </button>
              )}
            </div>
          )}

          {/* Location */}
          <div className="mb-8">
            <h2 className="font-display text-xl text-navy mb-3">Location</h2>
            <div className="rounded-2xl border border-border overflow-hidden">
              <div className="flex items-center justify-between gap-3 p-4 bg-cream">
                <div className="flex items-center gap-1.5 text-sm text-ink min-w-0">
                  <MapPin size={15} className="text-teal flex-shrink-0" />
                  <span className="truncate">{property.area}, {property.lga}, {property.state}</span>
                </div>
                <a
                  href={googleMapsSearchUrl(mapLocation)}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1.5 px-3 py-2 rounded-lg bg-navy text-white text-xs font-semibold hover:bg-navy-mid transition-colors flex-shrink-0"
                >
                  Open in Google Maps
                </a>
              </div>
              <iframe
                title="Property location"
                src={googleMapsEmbedUrl(mapLocation)}
                className="w-full h-64 border-0"
                loading="lazy"
              />
            </div>
          </div>

          {/* Property details table */}
          <div className="mb-8">
            <h2 className="font-display text-xl text-navy mb-3">Property Details</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {[
                { label: 'Property Type', value: property.type },
                { label: 'Status', value: property.status },
                { label: 'State', value: property.state },
                { label: 'LGA', value: property.lga },
                { label: 'Area', value: property.area },
                { label: 'Listing ID', value: `OWK-${property.id.slice(0, 6).toUpperCase()}`, mono: true },
                ...(property.publishedAt ? [{ label: 'Listed', value: formatDate(property.publishedAt) }] : []),
                ...(isSold && property.soldAt ? [{ label: 'Sold On', value: formatDate(property.soldAt) }] : []),
              ].map((row) => (
                <div key={row.label} className="bg-cream rounded-xl p-3 flex justify-between items-center">
                  <span className="text-xs text-muted">{row.label}</span>
                  <span className={`text-xs font-semibold text-navy ${row.mono ? 'font-mono' : ''}`}>
                    {row.value}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Contact widget */}
        <div className="lg:sticky lg:top-24 h-fit">
          <div className="bg-white border border-border rounded-2xl overflow-hidden shadow-sm">
            <div className="bg-navy p-5">
              <div className="font-display text-2xl text-white">
                {isSold && property.salePrice ? formatPrice(property.salePrice) : formatPrice(property.price)}
              </div>
              <div className="text-white/50 text-xs mt-1">
                {isSold ? 'This property has been sold' : 'Request a Viewing or Information'}
              </div>
            </div>

            <div className="p-5">
              {/* Owkaz branding */}
              <div className="flex items-center gap-3 bg-cream rounded-xl p-3 mb-4">
                <img src="/OWKAZ LOGO.png" alt="Owkaz" className="h-6" />
                <div>
                  <div className="text-sm font-semibold text-navy">Owkaz Properties</div>
                  <div className="text-xs text-muted">Enquiries managed by Owkaz</div>
                </div>
              </div>
              <p className="text-xs text-muted mb-4 leading-relaxed">
                All buyer enquiries are handled securely by Owkaz. Listing owner details are shared only after your enquiry is matched and verified.
              </p>

              {isSold ? (
                <div className="text-center py-4">
                  <div className="text-3xl mb-2">🏷️</div>
                  <div className="text-sm font-semibold text-navy">Property Sold</div>
                  <p className="text-xs text-muted mt-1 mb-4">
                    This property is no longer available, but we have many similar properties.
                  </p>
                  <button
                    onClick={() => navigate('/properties')}
                    className="w-full py-2.5 rounded-xl bg-navy text-white text-sm font-semibold hover:bg-navy-mid transition-colors"
                  >
                    Browse Available Properties
                  </button>
                </div>
              ) : sent ? (
                <div className="text-center py-4">
                  <div className="text-3xl mb-2">✅</div>
                  <div className="text-sm font-semibold text-navy">Enquiry Sent!</div>
                  <p className="text-xs text-muted mt-1">
                    Owkaz will follow up with you within 24 hours.
                  </p>
                </div>
              ) : (
                <div className="space-y-3">
                  <div>
                    <label className="block text-xs font-semibold text-muted mb-1">Your Name</label>
                    <input
                      type="text"
                      placeholder="Full name"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      className="w-full border border-border rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:border-teal transition-colors"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-muted mb-1">Phone Number</label>
                    <input
                      type="tel"
                      placeholder="+234 800 000 0000"
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      className="w-full border border-border rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:border-teal transition-colors"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-muted mb-1">Email Address</label>
                    <input
                      type="email"
                      placeholder="you@email.com"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="w-full border border-border rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:border-teal transition-colors"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-muted mb-1">Message</label>
                    <div className="flex flex-wrap gap-1.5 mb-2">
                      {INQUIRY_SUGGESTIONS.map((s) => (
                        <button
                          key={s}
                          type="button"
                          onClick={() => setMessage(s)}
                          className="px-2.5 py-1 rounded-full border border-border text-[11px] text-muted hover:border-teal hover:text-teal transition-colors"
                        >
                          {s}
                        </button>
                      ))}
                    </div>
                    <textarea
                      rows={3}
                      value={message}
                      onChange={(e) => setMessage(e.target.value)}
                      className="w-full border border-border rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:border-teal transition-colors resize-none"
                    />
                  </div>

                  {user ? (
                    <button
                      onClick={handleInquiry}
                      disabled={isSending || !message.trim()}
                      className="w-full py-3 rounded-xl bg-teal text-white text-sm font-semibold hover:bg-teal-light transition-colors disabled:opacity-60 disabled:cursor-not-allowed"
                    >
                      {isSending ? 'Sending…' : 'Send Enquiry'}
                    </button>
                  ) : (
                    <button
                      onClick={() => navigate('/login')}
                      className="w-full py-3 rounded-xl bg-navy text-white text-sm font-semibold hover:bg-navy-mid transition-colors"
                    >
                      Sign In to Send Enquiry
                    </button>
                  )}

                  <div className="grid grid-cols-2 gap-2">
                    <button className="py-2.5 rounded-xl border border-border text-xs font-semibold text-muted hover:border-navy hover:text-navy transition-colors">
                      📞 Call Owkaz
                    </button>
                    <button className="py-2.5 rounded-xl border border-border text-xs font-semibold text-muted hover:border-teal hover:text-teal transition-colors">
                      💬 WhatsApp
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Reference card */}
          <div className="mt-4 bg-cream border border-border rounded-xl p-4">
            <div className="text-[10px] font-bold uppercase tracking-widest text-muted mb-2">Listing Reference</div>
            <div className="font-mono text-sm text-navy bg-white px-3 py-2 rounded-lg border border-border">
              OWK-{property.id.slice(0, 6).toUpperCase()}
            </div>
            {property.publishedAt && (
              <div className="text-xs text-muted mt-2">
                Listed: {formatDate(property.publishedAt)}
              </div>
            )}
          </div>
        </div>
      </div>
      {/* Panorama 360° modal */}
      {showPanorama && property.panoramaUrl && (
        <Suspense fallback={
          <div className="fixed inset-0 z-[100] bg-black flex items-center justify-center">
            <div className="w-10 h-10 border-4 border-teal border-t-transparent rounded-full animate-spin" />
          </div>
        }>
          <PanoramaViewer src={property.panoramaUrl} onClose={() => setShowPanorama(false)} />
        </Suspense>
      )}

      {/* Lightbox */}
      {lightboxOpen && images && (
        <div
          className="fixed inset-0 z-[200] bg-black/95 flex items-center justify-center"
          onClick={closeLightbox}
        >
          {/* Close */}
          <button
            onClick={closeLightbox}
            className="absolute top-4 right-4 w-10 h-10 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center text-white transition-colors z-10"
          >
            <X size={20} />
          </button>

          {/* Counter */}
          <div className="absolute top-4 left-1/2 -translate-x-1/2 bg-black/60 text-white text-xs font-semibold px-3 py-1.5 rounded-full z-10">
            {lightboxIdx + 1} / {images.length}
          </div>

          {/* Prev */}
          {images.length > 1 && (
            <button
              onClick={(e) => { e.stopPropagation(); lightboxPrev(); }}
              className="absolute left-4 w-10 h-10 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center text-white transition-colors z-10"
            >
              <ChevronLeft size={22} />
            </button>
          )}

          {/* Image */}
          <div className="relative max-w-5xl max-h-[85vh] w-full mx-16" onClick={(e) => e.stopPropagation()}>
            <img
              key={lightboxIdx}
              src={getImageUrl(images[lightboxIdx])}
              alt={`${property.title} ${lightboxIdx + 1}`}
              className="w-full max-h-[85vh] object-contain"
            />
          </div>

          {/* Next */}
          {images.length > 1 && (
            <button
              onClick={(e) => { e.stopPropagation(); lightboxNext(); }}
              className="absolute right-4 w-10 h-10 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center text-white transition-colors z-10"
            >
              <ChevronRight size={22} />
            </button>
          )}

          {/* Dot indicators */}
          {images.length > 1 && (
            <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-1.5 z-10">
              {images.map((_, i) => (
                <button
                  key={i}
                  onClick={(e) => { e.stopPropagation(); setLightboxIdx(i); }}
                  className={`rounded-full transition-all ${i === lightboxIdx ? 'w-5 h-2 bg-white' : 'w-2 h-2 bg-white/40 hover:bg-white/70'}`}
                />
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
};
