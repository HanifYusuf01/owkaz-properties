import { useNavigate } from 'react-router-dom';
import { Bed, Bath, Maximize, MapPin } from 'lucide-react';
import { Property } from '../../types';
import { formatPrice } from '../../utils/format';
import { getImageUrl } from '../../utils/imageUrl';
import { Badge } from '../ui/Badge';

interface PropertyCardProps {
  property: Property;
  showStatus?: boolean;
  actions?: React.ReactNode;
  onCardClick?: (property: Property) => void;
}

export const PropertyCard = ({ property, showStatus = false, actions, onCardClick }: PropertyCardProps) => {
  const navigate = useNavigate();

  return (
    <div
      className="bg-white border border-border rounded-2xl overflow-hidden cursor-pointer hover:-translate-y-1 hover:shadow-lg transition-all duration-200"
      onClick={() => onCardClick ? onCardClick(property) : navigate(`/properties/${property.id}`)}
    >
      {/* Image */}
      <div className="relative h-48 bg-gray-100 overflow-hidden flex items-center justify-center">
        {property.images?.[0] ? (
          <img src={getImageUrl(property.images[0])} alt={property.title} className="w-full h-full object-cover" />
        ) : (
          <span className="text-6xl opacity-20">🏠</span>
        )}
        <div className="absolute top-3 left-3 flex gap-2">
          {property.isOwkaz && <Badge status="admin" className="text-[10px]" />}
          {property.featured && <span className="bg-gold text-white text-[10px] font-bold px-2 py-0.5 rounded-full uppercase">Featured</span>}
        </div>
        <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-navy/80 to-transparent p-4">
          <div className="font-display text-xl text-white">{formatPrice(property.price)}</div>
          <div className="text-white/60 text-[10px] uppercase tracking-wide">Asking Price</div>
        </div>
      </div>

      {/* Info */}
      <div className="p-4">
        <div className="flex items-start justify-between gap-2 mb-2">
          <h3 className="font-semibold text-sm text-navy leading-snug">{property.title}</h3>
          {showStatus && <Badge status={property.status} />}
        </div>
        <div className="flex items-center gap-1 text-xs text-muted mb-3">
          <MapPin size={12} />
          <span>{property.area}, {property.lga}</span>
        </div>
        <div className="flex gap-4 pt-3 border-t border-border">
          {property.beds != null && (
            <span className="flex items-center gap-1 text-xs text-muted">
              <Bed size={13} /> <strong className="text-navy">{property.beds}</strong> Beds
            </span>
          )}
          {property.baths != null && (
            <span className="flex items-center gap-1 text-xs text-muted">
              <Bath size={13} /> <strong className="text-navy">{property.baths}</strong> Baths
            </span>
          )}
          {property.sqm != null && (
            <span className="flex items-center gap-1 text-xs text-muted">
              <Maximize size={13} /> <strong className="text-navy">{property.sqm}</strong> m²
            </span>
          )}
        </div>
        {actions && <div className="mt-3 pt-3 border-t border-border" onClick={(e) => e.stopPropagation()}>{actions}</div>}
      </div>
    </div>
  );
};
