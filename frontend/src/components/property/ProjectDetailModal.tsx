import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { X, MapPin } from 'lucide-react';
import { Project } from '../../features/projects/projectsApi';
import { formatPrice } from '../../utils/format';

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

  return (
    <div
      className="fixed inset-0 z-50 bg-black/60 flex items-center justify-center p-4"
      onClick={onClose}
    >
      <div
        className="bg-white rounded-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Image */}
        <div className="relative h-52 bg-gradient-to-br from-navy to-teal overflow-hidden rounded-t-2xl flex-shrink-0">
          {project.images?.[activeImg] ? (
            <img
              src={project.images[activeImg]}
              alt={project.name}
              className="w-full h-full object-cover"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center">
              <span className="text-6xl opacity-20">🏗️</span>
            </div>
          )}
          {/* Progress bar */}
          <div className="absolute bottom-0 left-0 right-0 h-1.5 bg-white/20">
            <div className="h-full bg-gold transition-all" style={{ width: `${project.progress}%` }} />
          </div>
          {/* Thumbnail dots */}
          {project.images?.length > 1 && (
            <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-1.5">
              {project.images.slice(0, 5).map((_, i) => (
                <button
                  key={i}
                  onClick={() => setActiveImg(i)}
                  className={`w-1.5 h-1.5 rounded-full transition-colors ${i === activeImg ? 'bg-white' : 'bg-white/50'}`}
                />
              ))}
            </div>
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
                  ? `${formatPrice(project.priceFrom)}${project.priceTo ? ` – ${formatPrice(project.priceTo)}` : '+'}`
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

          {/* Features */}
          {project.features?.length > 0 && (
            <div className="mt-4">
              <h3 className="font-semibold text-sm text-navy mb-2">Features & Facilities</h3>
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
