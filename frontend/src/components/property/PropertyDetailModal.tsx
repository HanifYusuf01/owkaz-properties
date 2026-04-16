import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { X, MapPin, Eye, Bed, Bath, Maximize, Bookmark, BookmarkCheck } from 'lucide-react';
import { Property } from '../../types';
import { formatPrice } from '../../utils/format';
import { getImageUrl } from '../../utils/imageUrl';
import { useAppSelector } from '../../store';
import { useCreateInquiryMutation } from '../../features/inquiries/inquiriesApi';
import {
  useGetSavedPropertyIdsQuery,
  useSavePropertyMutation,
  useUnsavePropertyMutation,
} from '../../features/properties/propertiesApi';

interface PropertyDetailModalProps {
  property: Property;
  onClose: () => void;
}

export const PropertyDetailModal = ({ property, onClose }: PropertyDetailModalProps) => {
  const navigate = useNavigate();
  const user = useAppSelector((s) => s.auth.user);

  const [message, setMessage] = useState('I am interested in this property and would like to schedule a viewing.');
  const [sent, setSent] = useState(false);
  const [activeImg, setActiveImg] = useState(0);

  const [createInquiry, { isLoading: isSending }] = useCreateInquiryMutation();
  const [saveProperty] = useSavePropertyMutation();
  const [unsaveProperty] = useUnsavePropertyMutation();
  const { data: savedIds = [] } = useGetSavedPropertyIdsQuery(undefined, { skip: !user });

  const isSaved = savedIds.includes(property.id);
  const images = property.images?.length ? property.images : null;

  const handleInquiry = async () => {
    if (!user) { navigate('/login'); return; }
    await createInquiry({ propertyId: property.id, message, preferredContact: 'email' });
    setSent(true);
  };

  const handleSaveToggle = async () => {
    if (!user) { navigate('/login'); return; }
    if (isSaved) {
      await unsaveProperty(property.id);
    } else {
      await saveProperty(property.id);
    }
  };

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
        <div className="relative h-52 bg-gray-100 overflow-hidden rounded-t-2xl flex-shrink-0">
          {images ? (
            <img
              src={getImageUrl(images[activeImg] ?? images[0])}
              alt={property.title}
              className="w-full h-full object-cover"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center">
              <span className="text-6xl opacity-20">🏠</span>
            </div>
          )}
          {/* Thumbnails row */}
          {images && images.length > 1 && (
            <div className="absolute bottom-2 left-1/2 -translate-x-1/2 flex gap-1.5">
              {images.slice(0, 5).map((_, i) => (
                <button
                  key={i}
                  onClick={() => setActiveImg(i)}
                  className={`w-1.5 h-1.5 rounded-full transition-colors ${i === activeImg ? 'bg-white' : 'bg-white/50'}`}
                />
              ))}
            </div>
          )}
          {/* Close */}
          <button
            onClick={onClose}
            className="absolute top-3 right-3 w-8 h-8 bg-black/50 hover:bg-black/70 rounded-full flex items-center justify-center text-white transition-colors"
          >
            <X size={15} />
          </button>
          {/* Brand */}
          <div className="absolute top-3 left-3 bg-navy/80 backdrop-blur-sm px-2.5 py-1 rounded-lg">
            <span className="font-display text-xs text-white">Owkaz <span className="text-gold">Properties</span></span>
          </div>
        </div>

        {/* Body */}
        <div className="p-5">
          {/* Title & location */}
          <h2 className="font-display text-xl text-navy leading-tight">{property.title}</h2>
          <div className="flex items-center gap-1 text-xs text-muted mt-1">
            <MapPin size={12} />
            <span>{property.area}, {property.lga}, {property.state}</span>
          </div>

          {/* Price row */}
          <div className="flex items-center justify-between mt-4 p-3 bg-cream rounded-xl border border-border">
            <div>
              <div className="font-display text-2xl text-navy">{formatPrice(property.price)}</div>
              <div className="text-[10px] text-muted mt-0.5">Asking price</div>
            </div>
            <button
              onClick={handleSaveToggle}
              className={`flex items-center gap-1.5 text-xs font-semibold px-3 py-2 rounded-lg border transition-colors ${
                isSaved
                  ? 'bg-teal/10 border-teal/30 text-teal'
                  : 'border-border text-muted hover:border-navy hover:text-navy'
              }`}
            >
              {isSaved ? <BookmarkCheck size={14} /> : <Bookmark size={14} />}
              {isSaved ? 'Saved' : 'Save'}
            </button>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-4 gap-2 mt-3">
            {property.beds != null && (
              <div className="bg-white border border-border rounded-xl p-2.5 text-center">
                <Bed size={14} className="mx-auto text-muted mb-1" />
                <div className="font-bold text-navy text-sm">{property.beds}</div>
                <div className="text-[9px] text-muted leading-tight">Bedrooms</div>
              </div>
            )}
            {property.baths != null && (
              <div className="bg-white border border-border rounded-xl p-2.5 text-center">
                <Bath size={14} className="mx-auto text-muted mb-1" />
                <div className="font-bold text-navy text-sm">{property.baths}</div>
                <div className="text-[9px] text-muted leading-tight">Bathrooms</div>
              </div>
            )}
            {property.sqm != null && (
              <div className="bg-white border border-border rounded-xl p-2.5 text-center">
                <Maximize size={14} className="mx-auto text-muted mb-1" />
                <div className="font-bold text-navy text-sm">{property.sqm}</div>
                <div className="text-[9px] text-muted leading-tight">Square Metres</div>
              </div>
            )}
            <div className="bg-white border border-border rounded-xl p-2.5 text-center">
              <Eye size={14} className="mx-auto text-muted mb-1" />
              <div className="font-bold text-navy text-sm">{property.views}</div>
              <div className="text-[9px] text-muted leading-tight">Views</div>
            </div>
          </div>

          {/* Description */}
          {property.description && (
            <div className="mt-4">
              <h3 className="font-semibold text-sm text-navy mb-1.5">Description</h3>
              <p className="text-xs text-muted leading-relaxed line-clamp-4">{property.description}</p>
            </div>
          )}

          {/* Amenities */}
          {property.amenities?.length > 0 && (
            <div className="mt-4">
              <h3 className="font-semibold text-sm text-navy mb-2">Amenities</h3>
              <div className="flex flex-wrap gap-1.5">
                {property.amenities.map((a) => (
                  <span key={a} className="text-[10px] bg-teal/5 border border-teal/20 text-teal px-2 py-0.5 rounded-full">
                    ✓ {a}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* Location note */}
          <div className="mt-4 flex items-center gap-2 p-3 bg-cream rounded-xl border border-border text-xs text-muted">
            <MapPin size={13} className="flex-shrink-0 text-teal" />
            Approximate location · Exact address provided after inquiry
          </div>

          {/* Inquiry section */}
          <div className="mt-4 p-4 bg-teal/5 border border-teal/20 rounded-xl">
            <div className="flex items-center gap-2 mb-2">
              <span className="text-lg">🏡</span>
              <span className="text-sm font-semibold text-navy">Interested in this property?</span>
            </div>
            <p className="text-xs text-muted mb-3 leading-relaxed">
              Submit an inquiry below and our team will contact you within 24 hours. You'll never need to deal with the seller directly.
            </p>
            {sent ? (
              <div className="text-center py-2">
                <div className="text-2xl mb-1">✅</div>
                <div className="text-sm font-semibold text-navy">Enquiry Sent!</div>
                <p className="text-xs text-muted mt-0.5">We'll follow up within 24 hours.</p>
              </div>
            ) : (
              <textarea
                rows={3}
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                className="w-full border border-border rounded-lg px-3 py-2 text-xs focus:outline-none focus:border-teal transition-colors resize-none"
              />
            )}
          </div>

          {/* Action buttons */}
          {!sent && (
            <div className="flex gap-3 mt-4">
              <button
                onClick={handleSaveToggle}
                className={`flex items-center justify-center gap-1.5 flex-1 py-2.5 rounded-xl border text-xs font-semibold transition-colors ${
                  isSaved
                    ? 'bg-teal/10 border-teal/30 text-teal'
                    : 'border-border text-muted hover:border-navy hover:text-navy'
                }`}
              >
                {isSaved ? <BookmarkCheck size={14} /> : <Bookmark size={14} />}
                {isSaved ? 'Saved' : 'Save'}
              </button>
              <button
                onClick={handleInquiry}
                disabled={isSending || !message.trim()}
                className="flex-[2] py-2.5 rounded-xl bg-teal text-white text-xs font-semibold hover:bg-teal-light transition-colors disabled:opacity-60 disabled:cursor-not-allowed"
              >
                {isSending ? 'Sending…' : user ? 'Submit Inquiry' : 'Sign In to Inquire'}
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
