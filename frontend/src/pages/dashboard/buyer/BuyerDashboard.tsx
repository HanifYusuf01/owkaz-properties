import { useNavigate } from 'react-router-dom';
import { useGetPropertiesQuery } from '../../../features/properties/propertiesApi';
import { useGetMyInquiriesQuery } from '../../../features/inquiries/inquiriesApi';
import { PropertyCard } from '../../../components/property/PropertyCard';

export const BuyerDashboard = () => {
  const navigate = useNavigate();
  const { data: propsData } = useGetPropertiesQuery({ featured: true, limit: 3 });
  const { data: inquiries = [] } = useGetMyInquiriesQuery();

  const featured = propsData?.data ?? [];

  return (
    <div className="space-y-8">
      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-3 gap-4">
        <div className="bg-white border border-border rounded-xl p-6 relative overflow-hidden">
          <div className="absolute right-0 top-0 bottom-0 w-1 rounded-r-xl bg-navy" />
          <span className="font-display text-4xl text-navy block">{propsData?.total ?? 0}</span>
          <div className="text-[10px] uppercase tracking-widest text-muted mt-1">Available Properties</div>
        </div>
        <div className="bg-white border border-border rounded-xl p-6 relative overflow-hidden">
          <div className="absolute right-0 top-0 bottom-0 w-1 rounded-r-xl bg-teal" />
          <span className="font-display text-4xl text-navy block">{inquiries.length}</span>
          <div className="text-[10px] uppercase tracking-widest text-muted mt-1">My Inquiries</div>
        </div>
        <div
          className="bg-white border border-border rounded-xl p-6 relative overflow-hidden cursor-pointer hover:border-teal transition-colors"
          onClick={() => navigate('/dashboard/browse')}
        >
          <div className="absolute right-0 top-0 bottom-0 w-1 rounded-r-xl bg-gold" />
          <span className="font-display text-4xl text-navy block">→</span>
          <div className="text-[10px] uppercase tracking-widest text-muted mt-1">Browse All</div>
        </div>
      </div>

      {/* Callout */}
      <div className="bg-green-50 border border-green-200 rounded-xl p-4">
        <h5 className="text-xs font-bold uppercase tracking-wide text-green-800 mb-1">✅ Safe & Curated Marketplace</h5>
        <p className="text-xs text-green-700">
          Every listing on Owkaz is reviewed by our team. Inquire on any property and our agents will coordinate everything — you'll never need to contact a seller directly.
        </p>
      </div>

      {/* Featured listings */}
      <div>
        <h3 className="font-display text-xl text-navy mb-4">Featured Listings</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {featured.map((p) => <PropertyCard key={p.id} property={p} />)}
        </div>
        {featured.length === 0 && (
          <div className="py-12 text-center text-muted text-sm">No featured listings at the moment</div>
        )}
      </div>
    </div>
  );
};
