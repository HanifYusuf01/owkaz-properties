import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, CheckCircle, Users, Lock, Phone, ArrowRight } from 'lucide-react';
import {
  useGetFeaturedPropertiesQuery,
  useGetPropertiesQuery,
} from '../../features/properties/propertiesApi';
import { formatPrice } from '../../utils/format';
import { PropertyCard } from '../../components/property/PropertyCard';

const SEARCH_TABS = ['Buy', 'Rent', 'Shortlet', 'Land'];

const LOCATIONS = [
  { name: 'Abuja', emoji: '🏙️', count: '4,200+', grad: 'from-navy to-teal' },
  { name: 'Lagos', emoji: '🌊', count: '5,800+', grad: 'from-teal to-teal-light' },
  { name: 'Port Harcourt', emoji: '⛽', count: '1,100+', grad: 'from-navy-mid to-navy' },
  { name: 'Ibadan', emoji: '🏛️', count: '880+', grad: 'from-teal to-navy' },
  { name: 'Kano', emoji: '🕌', count: '420+', grad: 'from-navy to-navy-mid' },
];

const FEATURES = [
  {
    icon: <CheckCircle size={22} className="text-teal" />,
    title: 'Verified Listings',
    desc: 'Every property undergoes strict verification before going live on our platform.',
  },
  {
    icon: <Users size={22} className="text-teal" />,
    title: 'Expert Agents',
    desc: 'Connect directly with 250+ licensed real estate professionals across Nigeria.',
  },
  {
    icon: <Lock size={22} className="text-teal" />,
    title: 'Secure Transactions',
    desc: 'Safe, transparent processes with legal documentation support throughout.',
  },
  {
    icon: <Phone size={22} className="text-teal" />,
    title: '24/7 Support',
    desc: 'Our team is always available to answer your property questions and inquiries.',
  },
];

const TESTIMONIALS = [
  {
    text: '"Owkaz made finding our dream home incredibly easy. The search filters are precise and the agent we connected with was professional and prompt."',
    name: 'Chukwuemeka Okafor',
    role: 'Homebuyer · Abuja',
    avatar: '👨🏾',
  },
  {
    text: '"Listed my property on Owkaz and had serious inquiries within 48 hours. The platform\'s reach is unmatched. Sold in 3 weeks!"',
    name: 'Amaka Nwosu-Eze',
    role: 'Property Seller · Lagos',
    avatar: '👩🏾',
  },
  {
    text: '"As a diaspora investor, I was worried about property scams. Owkaz\'s verified listings and thorough documentation gave me peace of mind."',
    name: 'Adebayo Oluwaseun',
    role: 'Investor · London / Lagos',
    avatar: '👨🏾‍💼',
  },
];

export const HomePage = () => {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('Buy');
  const [searchQuery, setSearchQuery] = useState('');

  const { data: featuredProperties = [] } = useGetFeaturedPropertiesQuery();
  const { data: recentData } = useGetPropertiesQuery({ limit: 8 });
  const recentProperties = recentData?.data ?? [];

  const handleSearch = () => {
    navigate(`/properties?search=${encodeURIComponent(searchQuery)}`);
  };

  return (
    <div>
      {/* ── HERO ── */}
      <section className="bg-navy relative overflow-hidden">
        {/* Grid overlay */}
        <div
          className="absolute inset-0 opacity-[0.04]"
          style={{
            backgroundImage: 'linear-gradient(rgba(255,255,255,.5) 1px,transparent 1px),linear-gradient(90deg,rgba(255,255,255,.5) 1px,transparent 1px)',
            backgroundSize: '48px 48px',
          }}
        />
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 sm:py-24">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            {/* Left */}
            <div>
              <div className="inline-flex items-center gap-2 bg-white/10 rounded-full px-4 py-1.5 mb-6">
                <span className="w-2 h-2 rounded-full bg-teal-light animate-pulse" />
                <span className="text-white/80 text-xs font-medium">Nigeria's Premier Property Platform</span>
              </div>
              <h1 className="font-display text-4xl sm:text-5xl lg:text-6xl text-white leading-tight mb-5">
                Find Your <span className="text-gold">Perfect</span><br />Property in Nigeria
              </h1>
              <p className="text-white/60 text-base sm:text-lg leading-relaxed mb-8 max-w-lg">
                From Abuja to Lagos, explore thousands of verified listings — residential, commercial, and land — with trusted agents ready to guide you.
              </p>
              <div className="flex flex-wrap gap-3 mb-10">
                <button
                  onClick={() => navigate('/properties')}
                  className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-teal text-white font-semibold text-sm hover:bg-teal-light transition-colors"
                >
                  <Search size={16} /> Browse Properties
                </button>
                <button
                  onClick={() => navigate('/login')}
                  className="inline-flex items-center gap-2 px-6 py-3 rounded-xl border border-white/20 text-white font-semibold text-sm hover:bg-white/10 transition-colors"
                >
                  List Your Property
                </button>
              </div>
              <div className="flex gap-8">
                {[
                  { num: '12,400+', label: 'Active Listings' },
                  { num: '3,800+', label: 'Happy Clients' },
                  { num: '250+', label: 'Verified Agents' },
                ].map((s) => (
                  <div key={s.label}>
                    <div className="font-display text-2xl text-gold">{s.num}</div>
                    <div className="text-white/50 text-xs mt-0.5">{s.label}</div>
                  </div>
                ))}
              </div>
            </div>

            {/* Search card */}
            <div className="bg-white rounded-2xl p-6 shadow-2xl">
              {/* Tabs */}
              <div className="flex gap-1 bg-cream rounded-xl p-1 mb-5">
                {SEARCH_TABS.map((t) => (
                  <button
                    key={t}
                    onClick={() => setActiveTab(t)}
                    className={`flex-1 py-2 rounded-lg text-xs font-semibold transition-all ${
                      activeTab === t ? 'bg-white text-navy shadow-sm' : 'text-muted hover:text-navy'
                    }`}
                  >
                    {t}
                  </button>
                ))}
              </div>

              <div className="space-y-4">
                <div>
                  <label className="block text-xs font-semibold text-muted uppercase tracking-wide mb-1.5">Location</label>
                  <input
                    type="text"
                    placeholder="e.g. Maitama, Abuja or VI Lagos…"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full border border-border rounded-lg px-3 py-2.5 text-sm text-ink placeholder:text-muted/60 focus:outline-none focus:border-teal transition-colors"
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-semibold text-muted uppercase tracking-wide mb-1.5">Min Price (₦)</label>
                    <select className="w-full border border-border rounded-lg px-3 py-2.5 text-sm text-ink focus:outline-none focus:border-teal">
                      <option>Any</option>
                      <option>5,000,000</option>
                      <option>10,000,000</option>
                      <option>20,000,000</option>
                      <option>50,000,000</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-muted uppercase tracking-wide mb-1.5">Max Price (₦)</label>
                    <select className="w-full border border-border rounded-lg px-3 py-2.5 text-sm text-ink focus:outline-none focus:border-teal">
                      <option>Any</option>
                      <option>50,000,000</option>
                      <option>100,000,000</option>
                      <option>200,000,000</option>
                      <option>500,000,000+</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-muted uppercase tracking-wide mb-1.5">Bedrooms</label>
                  <select className="w-full border border-border rounded-lg px-3 py-2.5 text-sm text-ink focus:outline-none focus:border-teal">
                    <option>Any</option>
                    <option>1 Bedroom</option>
                    <option>2 Bedrooms</option>
                    <option>3 Bedrooms</option>
                    <option>4 Bedrooms</option>
                    <option>5+ Bedrooms</option>
                  </select>
                </div>

                <button
                  onClick={handleSearch}
                  className="w-full flex items-center justify-center gap-2 bg-navy text-white font-semibold text-sm py-3 rounded-xl hover:bg-navy-mid transition-colors"
                >
                  <Search size={16} /> Search Properties
                </button>
              </div>

              {/* Type chips */}
              <div className="flex flex-wrap gap-2 mt-4 pt-4 border-t border-border">
                {['🏠 House', '🏢 Apartment', '🏪 Commercial', '🌳 Land', '🏨 Shortlet'].map((chip) => (
                  <button
                    key={chip}
                    onClick={() => navigate('/properties')}
                    className="px-3 py-1 rounded-full text-xs font-medium border border-border text-muted hover:border-teal hover:text-teal transition-colors"
                  >
                    {chip}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── FEATURES STRIP ── */}
      <div className="bg-surface border-y border-border">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-6">
            {FEATURES.map((f) => (
              <div key={f.title} className="flex gap-3">
                <div className="mt-0.5 flex-shrink-0">{f.icon}</div>
                <div>
                  <div className="font-semibold text-sm text-navy mb-0.5">{f.title}</div>
                  <div className="text-xs text-muted leading-relaxed">{f.desc}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* ── FEATURED PROPERTIES ── */}
      <section className="py-16 sm:py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-10">
            <div>
              <span className="text-[10px] font-bold uppercase tracking-widest text-teal">Featured Listings</span>
              <h2 className="font-display text-3xl sm:text-4xl text-navy mt-2">
                Handpicked Properties<br />Just for You
              </h2>
              <p className="text-muted text-sm mt-2 max-w-md">
                Premium, verified properties selected by our expert team for their value and quality.
              </p>
            </div>
            <button
              onClick={() => navigate('/properties')}
              className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg border border-border text-sm font-semibold text-navy hover:border-navy transition-colors flex-shrink-0"
            >
              View All Properties <ArrowRight size={14} />
            </button>
          </div>

          {featuredProperties.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
              {featuredProperties.slice(0, 4).map((p) => (
                <PropertyCard key={p.id} property={p} />
              ))}
            </div>
          ) : recentProperties.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
              {recentProperties.slice(0, 4).map((p) => (
                <PropertyCard key={p.id} property={p} />
              ))}
            </div>
          ) : (
            <div className="py-16 text-center text-muted">
              <div className="text-5xl mb-3">🏠</div>
              <p className="text-sm">No featured properties at the moment.</p>
            </div>
          )}
        </div>
      </section>

      {/* ── LOCATIONS ── */}
      <section className="py-16 sm:py-20 bg-surface">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-10">
            <div>
              <span className="text-[10px] font-bold uppercase tracking-widest text-teal">Explore by Location</span>
              <h2 className="font-display text-3xl sm:text-4xl text-navy mt-2">
                Properties Across<br />Nigeria
              </h2>
            </div>
            <button
              onClick={() => navigate('/properties')}
              className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg border border-border text-sm font-semibold text-navy hover:border-navy transition-colors flex-shrink-0"
            >
              See All Cities <ArrowRight size={14} />
            </button>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4">
            {LOCATIONS.map((loc) => (
              <button
                key={loc.name}
                onClick={() => navigate(`/properties?search=${loc.name}`)}
                className={`relative rounded-2xl overflow-hidden h-36 bg-gradient-to-br ${loc.grad} flex flex-col items-center justify-center gap-1 hover:opacity-90 transition-opacity group`}
              >
                <div className="text-4xl group-hover:scale-110 transition-transform">{loc.emoji}</div>
                <div className="text-white font-display text-lg">{loc.name}</div>
                <div className="text-white/60 text-xs">{loc.count} listings</div>
              </button>
            ))}
          </div>
        </div>
      </section>

      {/* ── TESTIMONIALS ── */}
      <section className="py-16 sm:py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="mb-10">
            <span className="text-[10px] font-bold uppercase tracking-widest text-teal">Client Stories</span>
            <h2 className="font-display text-3xl sm:text-4xl text-navy mt-2">
              What Our Clients<br />Are Saying
            </h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {TESTIMONIALS.map((t) => (
              <div key={t.name} className="bg-white border border-border rounded-2xl p-6">
                <div className="text-gold text-lg mb-3">★★★★★</div>
                <p className="text-sm text-muted leading-relaxed mb-5 italic">{t.text}</p>
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-cream flex items-center justify-center text-xl">{t.avatar}</div>
                  <div>
                    <div className="text-sm font-semibold text-navy">{t.name}</div>
                    <div className="text-xs text-muted">{t.role}</div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── CTA BANNER ── */}
      <section className="py-10 sm:py-14">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="bg-navy rounded-3xl px-8 py-12 sm:px-14 sm:py-16 relative overflow-hidden">
            <div
              className="absolute inset-0 opacity-[0.04]"
              style={{
                backgroundImage: 'linear-gradient(rgba(255,255,255,.5) 1px,transparent 1px),linear-gradient(90deg,rgba(255,255,255,.5) 1px,transparent 1px)',
                backgroundSize: '40px 40px',
              }}
            />
            <div className="relative">
              <span className="text-[10px] font-bold uppercase tracking-widest text-teal-light">Ready to Get Started?</span>
              <h2 className="font-display text-3xl sm:text-4xl text-white mt-2 mb-3">
                Your Next Property<br />is One Search Away
              </h2>
              <p className="text-white/60 text-sm mb-8 max-w-md">
                Whether you're buying, renting, or selling — Owkaz has you covered across Nigeria.
              </p>
              <div className="flex flex-wrap gap-3">
                <button
                  onClick={() => navigate('/properties')}
                  className="px-6 py-3 rounded-xl bg-teal text-white font-semibold text-sm hover:bg-teal-light transition-colors"
                >
                  Find a Property
                </button>
                <button
                  onClick={() => navigate('/login')}
                  className="px-6 py-3 rounded-xl border border-white/20 text-white font-semibold text-sm hover:bg-white/10 transition-colors"
                >
                  List Yours Today
                </button>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};
