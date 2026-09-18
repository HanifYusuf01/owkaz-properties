import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { X, MapPin, ChevronLeft, ChevronRight, Play } from 'lucide-react';
import { Project } from '../../features/projects/projectsApi';
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
  ongoing: 'Ongoing',
  completed: 'Completed',
  'pre-launch': 'Pre-Launch',
  'selling-fast': 'Selling Fast',
  'new-launch': 'New Launch',
};

interface ProjectDetailModalProps {
  project: Project;
  onClose: () => void;
}

export const ProjectDetailModal = ({ project, onClose }: ProjectDetailModalProps) => {
  const navigate = useNavigate();
  const [activeImg, setActiveImg] = useState(0);
  const [showVideo, setShowVideo] = useState(false);

  const images = project.images?.length ? project.images : [];
  const hasImages = images.length > 0;
  const hasMultiple = images.length > 1;

  const prev = () => setActiveImg((i) => (i === 0 ? images.length - 1 : i - 1));
  const next = () => setActiveImg((i) => (i === images.length - 1 ? 0 : i + 1));

  return (
    <div
      className="fixed inset-0 z-50 bg-black/60 flex items-center justify-center p-4"
      onClick={onClose}
    >
      <div
        className="bg-white rounded-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        {/* ── Image Carousel ── */}
        <div className="relative h-60 bg-gradient-to-br from-navy to-teal overflow-hidden rounded-t-2xl flex-shrink-0">
          {hasImages ? (
            <img
              key={activeImg}
              src={getImageUrl(images[activeImg])}
              alt={`${project.name} image ${activeImg + 1}`}
              className="w-full h-full object-cover transition-opacity duration-200"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center opacity-20">
              <svg width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="1.2">
                <rect x="3" y="3" width="18" height="18" rx="2"/><circle cx="8.5" cy="8.5" r="1.5"/>
                <polyline points="21 15 16 10 5 21"/>
              </svg>
            </div>
          )}

          {/* Prev / Next arrows */}
          {hasMultiple && (
            <>
              <button
                onClick={(e) => { e.stopPropagation(); prev(); }}
                className="absolute left-2 top-1/2 -translate-y-1/2 w-8 h-8 rounded-full bg-black/40 hover:bg-black/60 flex items-center justify-center text-white transition-colors backdrop-blur-sm"
              >
                <ChevronLeft size={18} />
              </button>
              <button
                onClick={(e) => { e.stopPropagation(); next(); }}
                className="absolute right-2 top-1/2 -translate-y-1/2 w-8 h-8 rounded-full bg-black/40 hover:bg-black/60 flex items-center justify-center text-white transition-colors backdrop-blur-sm"
              >
                <ChevronRight size={18} />
              </button>
            </>
          )}

          {/* Image counter */}
          {hasMultiple && (
            <div className="absolute top-3 right-10 bg-black/50 backdrop-blur-sm text-white text-[10px] font-semibold px-2 py-1 rounded-full">
              {activeImg + 1} / {images.length}
            </div>
          )}

          {/* Dot indicators */}
          {hasMultiple && (
            <div className="absolute bottom-3 left-1/2 -translate-x-1/2 flex gap-1.5">
              {images.map((_, i) => (
                <button
                  key={i}
                  onClick={(e) => { e.stopPropagation(); setActiveImg(i); }}
                  className={`rounded-full transition-all ${
                    i === activeImg ? 'w-4 h-1.5 bg-white' : 'w-1.5 h-1.5 bg-white/50'
                  }`}
                />
              ))}
            </div>
          )}

          {/* Progress bar */}
          <div className="absolute bottom-0 left-0 right-0 h-1 bg-white/20">
            <div className="h-full bg-gold transition-all" style={{ width: `${project.progress}%` }} />
          </div>

          {/* Video button */}
          {project.videoUrl && (
            <button
              onClick={(e) => { e.stopPropagation(); setShowVideo(true); }}
              className="absolute bottom-4 left-3 flex items-center gap-1.5 bg-black/60 hover:bg-black/80 text-white text-[10px] font-semibold px-3 py-1.5 rounded-lg backdrop-blur-sm transition-colors"
            >
              <Play size={11} /> Watch Video
            </button>
          )}

          {/* Status badge */}
          <div className={`absolute top-3 left-3 px-2.5 py-1 rounded-full text-[10px] font-bold border ${STATUS_STYLES[project.status] ?? 'bg-surface text-muted border-border'}`}>
            {STATUS_LABELS[project.status] ?? project.status}
          </div>

          {/* Close */}
          <button
            onClick={onClose}
            className="absolute top-3 right-3 w-8 h-8 bg-black/50 hover:bg-black/70 rounded-full flex items-center justify-center text-white transition-colors"
          >
            <X size={15} />
          </button>
        </div>

        {/* Thumbnail strip */}
        {hasMultiple && (
          <div className="flex gap-2 px-4 pt-3 overflow-x-auto scrollbar-none">
            {images.map((img, i) => (
              <button
                key={i}
                onClick={() => setActiveImg(i)}
                className={`flex-shrink-0 w-14 h-10 rounded-lg overflow-hidden border-2 transition-all ${
                  i === activeImg ? 'border-teal' : 'border-transparent opacity-60 hover:opacity-100'
                }`}
              >
                <img
                  src={getImageUrl(img)}
                  alt=""
                  className="w-full h-full object-cover"
                />
              </button>
            ))}
          </div>
        )}

        {/* Body */}
        <div className="p-5">
          <div className="text-xs text-muted mb-1">{project.type}</div>
          <h2 className="font-display text-xl text-navy leading-tight">{project.name}</h2>
          <div className="flex items-center gap-1 text-xs text-muted mt-1">
            <MapPin size={12} />
            <span>{project.location}{project.lga ? `, ${project.lga}` : ''}, {project.state}</span>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-3 gap-2 mt-4">
            <div className="bg-cream rounded-xl p-3 text-center">
              <div className="font-bold text-navy text-lg">{project.totalUnits}</div>
              <div className="text-[10px] text-muted">Total Units</div>
            </div>
            <div className="bg-cream rounded-xl p-3 text-center">
              <div className={`font-bold text-lg ${project.availableUnits === 0 ? 'text-muted' : 'text-teal'}`}>
                {project.availableUnits}
              </div>
              <div className="text-[10px] text-muted">Available</div>
            </div>
            <div className="bg-cream rounded-xl p-3 text-center">
              <div className="font-bold text-navy text-lg">{project.progress}%</div>
              <div className="text-[10px] text-muted">Complete</div>
            </div>
          </div>

          {/* Progress bar */}
          <div className="mt-3">
            <div className="flex justify-between text-[10px] text-muted mb-1">
              <span>Construction Progress</span>
              <span>{project.progress}%</span>
            </div>
            <div className="h-2 bg-surface rounded-full overflow-hidden">
              <div className="h-full bg-teal rounded-full transition-all" style={{ width: `${project.progress}%` }} />
            </div>
          </div>

          {/* Price & completion */}
          <div className="flex items-center justify-between mt-4 p-3 bg-cream rounded-xl border border-border">
            <div>
              <div className="text-[10px] text-muted">Price from</div>
              <div className="font-display text-xl text-navy">
                {project.priceFrom
                  ? `${formatPrice(project.priceFrom)}${project.priceTo ? ` to ${formatPrice(project.priceTo)}` : '+'}`
                  : 'Contact for pricing'}
              </div>
            </div>
            {project.completionDate && (
              <div className="text-right">
                <div className="text-[10px] text-muted">Completion</div>
                <div className="font-semibold text-navy text-sm">{project.completionDate}</div>
              </div>
            )}
          </div>

          {/* Description */}
          {project.description && (
            <div className="mt-4">
              <h3 className="font-semibold text-sm text-navy mb-1.5">About This Project</h3>
              <p className="text-xs text-muted leading-relaxed">{project.description}</p>
            </div>
          )}

          {/* Video player */}
          {project.videoUrl && (
            <div className="mt-4">
              {showVideo ? (
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <h3 className="font-semibold text-sm text-navy flex items-center gap-1.5">
                      <Play size={14} className="text-teal" /> Project Status Video
                    </h3>
                    <button onClick={() => setShowVideo(false)} className="text-xs text-muted hover:text-navy">Hide</button>
                  </div>
                  <video
                    src={getImageUrl(project.videoUrl)}
                    controls
                    autoPlay
                    className="w-full rounded-xl border border-border max-h-56 bg-black"
                  />
                </div>
              ) : (
                <button
                  onClick={() => setShowVideo(true)}
                  className="w-full flex items-center gap-3 p-3 bg-navy/5 hover:bg-navy/10 border border-border rounded-xl transition-colors"
                >
                  <div className="w-9 h-9 rounded-full bg-navy flex items-center justify-center flex-shrink-0">
                    <Play size={14} className="text-white ml-0.5" />
                  </div>
                  <div className="text-left">
                    <p className="text-xs font-semibold text-navy">Watch Status Video</p>
                    <p className="text-[10px] text-muted">See the latest construction update</p>
                  </div>
                </button>
              )}
            </div>
          )}

          {/* Features */}
          {project.features?.length > 0 && (
            <div className="mt-4">
              <h3 className="font-semibold text-sm text-navy mb-2">Features &amp; Facilities</h3>
              <div className="flex flex-wrap gap-1.5">
                {project.features.map((f) => (
                  <span key={f} className="text-[10px] bg-teal/5 border border-teal/20 text-teal px-2 py-0.5 rounded-full">
                    ✓ {f}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* Location note */}
          <div className="mt-4 flex items-center gap-2 p-3 bg-cream rounded-xl border border-border text-xs text-muted">
            <MapPin size={13} className="flex-shrink-0 text-teal" />
            {project.location}{project.lga ? `, ${project.lga}` : ''}, {project.state}
          </div>

          {/* CTA */}
          <div className="flex gap-3 mt-4">
            <button
              onClick={() => { onClose(); navigate('/contact'); }}
              className="flex-1 py-2.5 rounded-xl bg-navy text-white text-xs font-semibold hover:bg-navy-mid transition-colors"
            >
              Enquire Now
            </button>
            <button
              onClick={onClose}
              className="flex-1 py-2.5 rounded-xl border border-border text-xs font-semibold text-muted hover:border-navy hover:text-navy transition-colors"
            >
              Close
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
