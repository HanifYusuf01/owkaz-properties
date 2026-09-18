import { useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { ArrowLeft, MapPin, ChevronLeft, ChevronRight, Play, X } from 'lucide-react';
import { useGetProjectByIdQuery } from '../../features/projects/projectsApi';
import { formatPrice } from '../../utils/format';
import { getImageUrl } from '../../utils/imageUrl';

const STATUS_STYLES: Record<string, string> = {
  ongoing: 'bg-teal/20 text-teal border-teal/30',
  completed: 'bg-green-500/20 text-green-700 border-green-300',
  'pre-launch': 'bg-purple-500/20 text-purple-700 border-purple-300',
  'selling-fast': 'bg-gold/20 text-gold border-gold/30',
  'new-launch': 'bg-teal/20 text-teal border-teal/30',
};
const STATUS_LABELS: Record<string, string> = {
  ongoing: 'Ongoing', completed: 'Completed',
  'pre-launch': 'Pre-Launch', 'selling-fast': 'Selling Fast', 'new-launch': 'New Launch',
};

export const ProjectDetailPage = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { data: project, isLoading } = useGetProjectByIdQuery(id!, { skip: !id });

  const [activeImg, setActiveImg] = useState(0);
  const [lightboxOpen, setLightboxOpen] = useState(false);
  const [showVideo, setShowVideo] = useState(false);

  if (isLoading) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 text-center">
        <div className="w-8 h-8 border-4 border-teal border-t-transparent rounded-full animate-spin mx-auto" />
      </div>
    );
  }

  if (!project) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 text-center">
        <div className="text-5xl mb-3">🏗️</div>
        <h2 className="font-display text-2xl text-navy mb-2">Project Not Found</h2>
        <p className="text-muted text-sm mb-6">This project may have been removed or is no longer available.</p>
        <button
          onClick={() => navigate('/projects')}
          className="px-5 py-2.5 rounded-xl bg-navy text-white text-sm font-semibold"
        >
          Back to Projects
        </button>
      </div>
    );
  }

  const images = project.images?.length ? project.images : [];
  const hasImages = images.length > 0;

  const prev = () => setActiveImg((i) => (i === 0 ? images.length - 1 : i - 1));
  const next = () => setActiveImg((i) => (i === images.length - 1 ? 0 : i + 1));
  const openLightbox = (idx: number) => { setActiveImg(idx); setLightboxOpen(true); };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Back */}
      <button
        onClick={() => navigate('/projects')}
        className="inline-flex items-center gap-1.5 text-sm text-muted hover:text-navy transition-colors mb-6"
      >
        <ArrowLeft size={16} />
        Back to Projects
      </button>

      {/* Hero gallery */}
      <div className="relative rounded-2xl overflow-hidden bg-gray-100 mb-8">
        {/* Main image */}
        <div
          className="relative h-72 sm:h-96 cursor-pointer group"
          onClick={() => hasImages && openLightbox(activeImg)}
        >
          {hasImages ? (
            <img
              key={activeImg}
              src={getImageUrl(images[activeImg])}
              alt={`${project.name} image ${activeImg + 1}`}
              className="w-full h-full object-cover transition-opacity duration-200"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-navy to-teal opacity-30">
              <svg width="80" height="80" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="1.2">
                <rect x="3" y="3" width="18" height="18" rx="2"/><circle cx="8.5" cy="8.5" r="1.5"/>
                <polyline points="21 15 16 10 5 21"/>
              </svg>
            </div>
          )}

          {/* Hover hint */}
          {hasImages && (
            <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors flex items-center justify-center">
              <div className="opacity-0 group-hover:opacity-100 transition-opacity bg-black/60 text-white text-xs font-semibold px-3 py-1.5 rounded-lg">
                View Gallery
              </div>
            </div>
          )}

          {/* Image counter */}
          {images.length > 1 && (
            <div className="absolute top-4 right-4 bg-black/50 backdrop-blur-sm text-white text-xs font-semibold px-2.5 py-1 rounded-full">
              {activeImg + 1} / {images.length}
            </div>
          )}

          {/* Status badge */}
          <div className={`absolute top-4 left-4 px-3 py-1 rounded-full text-xs font-bold border ${STATUS_STYLES[project.status] ?? 'bg-surface text-muted border-border'}`}>
            {STATUS_LABELS[project.status] ?? project.status}
          </div>

          {/* Progress bar */}
          <div className="absolute bottom-0 left-0 right-0 h-1.5 bg-black/20">
            <div className="h-full bg-gold transition-all" style={{ width: `${project.progress}%` }} />
          </div>

          {/* Video button */}
          {project.videoUrl && (
            <button
              onClick={(e) => { e.stopPropagation(); setShowVideo(true); }}
              className="absolute bottom-4 right-4 flex items-center gap-2 bg-black/70 hover:bg-black/90 text-white text-xs font-semibold px-4 py-2 rounded-xl border border-white/20 transition-colors backdrop-blur-sm"
            >
              <Play size={13} /> Watch Status Video
            </button>
          )}
        </div>

        {/* Arrow navigation */}
        {images.length > 1 && (
          <>
            <button
              onClick={(e) => { e.stopPropagation(); prev(); }}
              className="absolute left-3 top-1/2 -translate-y-1/2 w-9 h-9 rounded-full bg-black/40 hover:bg-black/60 flex items-center justify-center text-white transition-colors backdrop-blur-sm"
            >
              <ChevronLeft size={20} />
            </button>
            <button
              onClick={(e) => { e.stopPropagation(); next(); }}
              className="absolute right-3 top-1/2 -translate-y-1/2 w-9 h-9 rounded-full bg-black/40 hover:bg-black/60 flex items-center justify-center text-white transition-colors backdrop-blur-sm"
            >
              <ChevronRight size={20} />
            </button>
          </>
        )}
      </div>

      {/* Thumbnail strip */}
      {images.length > 1 && (
        <div className="flex gap-2 mb-8 overflow-x-auto pb-1">
          {images.map((img, i) => (
            <button
              key={i}
              onClick={() => setActiveImg(i)}
              className={`flex-shrink-0 w-20 h-14 rounded-lg overflow-hidden border-2 transition-all ${
                i === activeImg ? 'border-teal' : 'border-transparent opacity-60 hover:opacity-100'
              }`}
            >
              <img src={getImageUrl(img)} alt="" className="w-full h-full object-cover" />
            </button>
          ))}
        </div>
      )}

      {/* Content grid */}
      <div className="grid lg:grid-cols-[1fr_340px] gap-8">
        {/* Left column */}
        <div>
          <p className="text-xs font-bold uppercase tracking-widest text-teal mb-1">{project.type}</p>
          <h1 className="font-display text-3xl sm:text-4xl text-navy leading-tight mb-2">{project.name}</h1>
          <div className="flex items-center gap-1.5 text-sm text-muted mb-6">
            <MapPin size={15} />
            <span>{project.location}{project.lga ? `, ${project.lga}` : ''}, {project.state}</span>
          </div>

          {/* Progress */}
          <div className="mb-6">
            <div className="flex justify-between text-xs text-muted mb-1.5">
              <span>Construction Progress</span>
              <span className="font-semibold text-navy">{project.progress}%</span>
            </div>
            <div className="h-2.5 bg-surface rounded-full overflow-hidden">
              <div className="h-full bg-gold rounded-full transition-all" style={{ width: `${project.progress}%` }} />
            </div>
          </div>

          {/* Stats row */}
          <div className="grid grid-cols-3 gap-3 mb-8">
            <div className="bg-cream border border-border rounded-xl p-4 text-center">
              <div className="font-bold text-navy text-2xl">{project.totalUnits}</div>
              <div className="text-xs text-muted mt-0.5">Total Units</div>
            </div>
            <div className="bg-cream border border-border rounded-xl p-4 text-center">
              <div className={`font-bold text-2xl ${project.availableUnits === 0 ? 'text-muted' : 'text-teal'}`}>
                {project.availableUnits}
              </div>
              <div className="text-xs text-muted mt-0.5">Available</div>
            </div>
            <div className="bg-cream border border-border rounded-xl p-4 text-center">
              <div className="font-bold text-navy text-2xl">{project.progress}%</div>
              <div className="text-xs text-muted mt-0.5">Complete</div>
            </div>
          </div>

          {/* Video player */}
          {project.videoUrl && (
            <div className="mb-8">
              {showVideo ? (
                <div>
                  <div className="flex items-center justify-between mb-3">
                    <h2 className="font-display text-xl text-navy flex items-center gap-2">
                      <Play size={18} className="text-teal" /> Status Video
                    </h2>
                    <button onClick={() => setShowVideo(false)} className="text-xs text-muted hover:text-navy">
                      Hide
                    </button>
                  </div>
                  <video
                    src={getImageUrl(project.videoUrl)}
                    controls
                    autoPlay
                    className="w-full rounded-2xl border border-border bg-black max-h-80"
                  />
                </div>
              ) : (
                <button
                  onClick={() => setShowVideo(true)}
                  className="w-full flex items-center gap-4 p-4 bg-navy/5 hover:bg-navy/10 border border-border rounded-2xl transition-colors"
                >
                  <div className="w-12 h-12 rounded-full bg-navy flex items-center justify-center flex-shrink-0">
                    <Play size={18} className="text-white ml-0.5" />
                  </div>
                  <div className="text-left">
                    <p className="font-semibold text-navy">Watch Status Video</p>
                    <p className="text-xs text-muted mt-0.5">See the latest construction update from the developer</p>
                  </div>
                </button>
              )}
            </div>
          )}

          {/* Description */}
          {project.description && (
            <div className="mb-8">
              <h2 className="font-display text-xl text-navy mb-3">About This Project</h2>
              <p className="text-sm text-muted leading-relaxed">{project.description}</p>
            </div>
          )}

          {/* Features */}
          {project.features?.length > 0 && (
            <div className="mb-8">
              <h2 className="font-display text-xl text-navy mb-3">Features & Facilities</h2>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                {project.features.map((f) => (
                  <div key={f} className="flex items-center gap-2 text-sm text-muted">
                    <span className="w-5 h-5 rounded-full bg-teal/10 text-teal flex items-center justify-center text-xs font-bold flex-shrink-0">
                      ✓
                    </span>
                    {f}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Location */}
          <div className="flex items-start gap-2 p-4 bg-cream rounded-xl border border-border text-sm text-muted">
            <MapPin size={15} className="text-teal flex-shrink-0 mt-0.5" />
            <span>{project.location}{project.lga ? `, ${project.lga}` : ''}, {project.state}</span>
          </div>
        </div>

        {/* Right sidebar */}
        <div className="space-y-4">
          {/* Price card */}
          <div className="bg-white border border-border rounded-2xl p-5 sticky top-6">
            <div className="mb-4">
              <p className="text-xs text-muted">{project.priceTo ? 'Price Range' : 'Starting from'}</p>
              <div className="font-display text-2xl text-navy mt-1">
                {project.priceFrom
                  ? formatPrice(project.priceFrom)
                  : 'Contact for pricing'}
              </div>
              {project.priceTo && (
                <div className="text-sm text-muted">up to {formatPrice(project.priceTo)}</div>
              )}
            </div>

            {project.completionDate && (
              <div className="flex items-center justify-between py-3 border-t border-border text-sm">
                <span className="text-muted">Est. Completion</span>
                <span className="font-semibold text-navy">{project.completionDate}</span>
              </div>
            )}

            <div className="flex items-center justify-between py-3 border-t border-border text-sm">
              <span className="text-muted">Units Available</span>
              <span className={`font-semibold ${project.availableUnits === 0 ? 'text-muted' : 'text-teal'}`}>
                {project.availableUnits === 0 ? 'Sold Out' : `${project.availableUnits} of ${project.totalUnits}`}
              </span>
            </div>

            <div className="flex items-center justify-between py-3 border-t border-border text-sm">
              <span className="text-muted">Status</span>
              <span className={`text-xs font-bold px-2.5 py-1 rounded-full border ${STATUS_STYLES[project.status] ?? 'bg-surface text-muted border-border'}`}>
                {STATUS_LABELS[project.status] ?? project.status}
              </span>
            </div>

            <button
              onClick={() => navigate('/contact')}
              className="mt-5 w-full py-3 rounded-xl bg-navy text-white text-sm font-semibold hover:bg-navy-mid transition-colors"
            >
              Enquire About This Project
            </button>
            <button
              onClick={() => navigate('/contact')}
              className="mt-2 w-full py-3 rounded-xl border border-border text-sm font-semibold text-muted hover:border-navy hover:text-navy transition-colors"
            >
              Schedule a Site Visit
            </button>
          </div>
        </div>
      </div>

      {/* Lightbox */}
      {lightboxOpen && hasImages && (
        <div
          className="fixed inset-0 z-50 bg-black/90 flex items-center justify-center p-4"
          onClick={() => setLightboxOpen(false)}
        >
          <button
            onClick={() => setLightboxOpen(false)}
            className="absolute top-4 right-4 w-10 h-10 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center text-white transition-colors"
          >
            <X size={20} />
          </button>
          <button
            onClick={(e) => { e.stopPropagation(); prev(); }}
            className="absolute left-4 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center text-white transition-colors"
          >
            <ChevronLeft size={22} />
          </button>
          <img
            src={getImageUrl(images[activeImg])}
            alt=""
            className="max-w-full max-h-full object-contain rounded-xl"
            onClick={(e) => e.stopPropagation()}
          />
          <button
            onClick={(e) => { e.stopPropagation(); next(); }}
            className="absolute right-4 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center text-white transition-colors"
          >
            <ChevronRight size={22} />
          </button>
          <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-1.5">
            {images.map((_, i) => (
              <button
                key={i}
                onClick={(e) => { e.stopPropagation(); setActiveImg(i); }}
                className={`rounded-full transition-all ${i === activeImg ? 'w-5 h-1.5 bg-white' : 'w-1.5 h-1.5 bg-white/40'}`}
              />
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
