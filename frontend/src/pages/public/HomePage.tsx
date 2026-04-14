import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, CheckCircle, Users, Lock, Phone, ArrowRight, Bitcoin, Gem, CircleDollarSign, Zap, Landmark, CreditCard } from 'lucide-react';
import {
  useGetFeaturedPropertiesQuery,
  useGetPropertiesQuery,
} from '../../features/properties/propertiesApi';
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
    desc: 'Safe, transparent processes with legal documentation support. Pay via bank transfer, card, or crypto.',
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

const PROPERTY_TYPES = [
  { label: 'House', emoji: '🏠' },
  { label: 'Apartment', emoji: '🏢' },
  { label: 'Commercial', emoji: '🏪' },
  { label: 'Land', emoji: '🌳' },
  { label: 'Shortlet', emoji: '🏨' },
];

export const HomePage = () => {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('Buy');
  const [activeType, setActiveType] = useState('House');
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
      <section className="bg-navy relative overflow-hidden min-h-[600px]">
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
              <h1 className="font-display text-5xl sm:text-6xl lg:text-7xl text-white leading-tight mb-6">
                Find Your{' '}
                <span className="text-gold italic">Perfect</span>
                <br />Property in<br />Nigeria
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
              <div className="flex gap-10">
                {[
                  { num: '12,400+', label: 'Active Listings' },
                  { num: '3,800+', label: 'Happy Clients' },
                  { num: '250+', label: 'Verified Agents' },
                ].map((s) => (
                  <div key={s.label}>
                    <div className="font-display text-3xl font-bold text-white">{s.num}</div>
                    <div className="text-white/50 text-xs mt-0.5">{s.label}</div>
                  </div>
                ))}
              </div>
            </div>

            {/* Search card — glass */}
            <div className="bg-white/10 backdrop-blur-md border border-white/20 rounded-2xl p-6 shadow-2xl" style={{ boxShadow: '0 8px 32px rgba(0,0,0,0.3), inset 0 1px 0 rgba(255,255,255,0.1)' }}>
              {/* Tabs */}
              <div className="flex gap-1 mb-5">
                {SEARCH_TABS.map((t) => (
                  <button
                    key={t}
                    onClick={() => setActiveTab(t)}
                    className={`flex-1 py-2 rounded-lg text-sm font-semibold transition-all ${
                      activeTab === t
                        ? 'bg-white text-navy shadow-sm'
                        : 'text-white/50 hover:text-white'
                    }`}
                  >
                    {t}
                  </button>
                ))}
              </div>

              <div className="space-y-4">
                <div>
                  <label className="block text-[10px] font-bold text-white/40 uppercase tracking-widest mb-1.5">Location</label>
                  <input
                    type="text"
                    placeholder="e.g. Maitama, Abuja or VI Lagos…"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full bg-white/10 border border-white/20 rounded-lg px-3 py-2.5 text-sm text-white placeholder:text-white/30 focus:outline-none focus:border-teal transition-colors"
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-[10px] font-bold text-white/40 uppercase tracking-widest mb-1.5">Min Price (₦)</label>
                    <select className="w-full bg-white/10 border border-white/20 rounded-lg px-3 py-2.5 text-sm text-white focus:outline-none focus:border-teal appearance-none">
                      <option value="" className="bg-navy text-white">Any</option>
                      <option value="5000000" className="bg-navy text-white">₦5M</option>
                      <option value="10000000" className="bg-navy text-white">₦10M</option>
                      <option value="20000000" className="bg-navy text-white">₦20M</option>
                      <option value="50000000" className="bg-navy text-white">₦50M</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-[10px] font-bold text-white/40 uppercase tracking-widest mb-1.5">Max Price (₦)</label>
                    <select className="w-full bg-white/10 border border-white/20 rounded-lg px-3 py-2.5 text-sm text-white focus:outline-none focus:border-teal appearance-none">
                      <option value="" className="bg-navy text-white">Any</option>
                      <option value="50000000" className="bg-navy text-white">₦50M</option>
                      <option value="100000000" className="bg-navy text-white">₦100M</option>
                      <option value="200000000" className="bg-navy text-white">₦200M</option>
                      <option value="500000000" className="bg-navy text-white">₦500M+</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-[10px] font-bold text-white/40 uppercase tracking-widest mb-1.5">Bedrooms</label>
                  <select className="w-full bg-white/10 border border-white/20 rounded-lg px-3 py-2.5 text-sm text-white focus:outline-none focus:border-teal appearance-none">
                    <option value="" className="bg-navy text-white">Any</option>
                    <option value="1" className="bg-navy text-white">1 Bedroom</option>
                    <option value="2" className="bg-navy text-white">2 Bedrooms</option>
                    <option value="3" className="bg-navy text-white">3 Bedrooms</option>
                    <option value="4" className="bg-navy text-white">4 Bedrooms</option>
                    <option value="5" className="bg-navy text-white">5+ Bedrooms</option>
                  </select>
                </div>

                <button
                  onClick={handleSearch}
                  className="w-full flex items-center justify-center gap-2 bg-teal text-white font-semibold text-sm py-3 rounded-xl hover:bg-teal-light transition-colors"
                >
                  <Search size={16} /> Search Properties
                </button>
              </div>

              {/* Type chips */}
              <div className="flex flex-wrap gap-2 mt-4">
                {PROPERTY_TYPES.map(({ label, emoji }) => (
                  <button
                    key={label}
                    onClick={() => { setActiveType(label); navigate(`/properties?search=${label}`); }}
                    className={`px-3 py-1.5 rounded-full text-xs font-semibold border transition-colors ${
                      activeType === label
                        ? 'bg-teal border-teal text-white'
                        : 'border-white/20 text-white/60 hover:border-white/40 hover:text-white'
                    }`}
                  >
                    {emoji} {label}
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
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-8">
            {FEATURES.map((f) => (
              <div key={f.title} className="flex flex-col items-center text-center">
                <div className="w-14 h-14 flex items-center justify-center bg-white border border-border rounded-xl mb-4 shadow-sm">
                  {f.icon}
                </div>
                <div className="font-semibold text-sm text-navy mb-1">{f.title}</div>
                <div className="text-xs text-muted leading-relaxed">{f.desc}</div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* ── PAYMENT METHODS ── */}
      <div className="bg-gradient-to-r from-navy via-navy-mid to-teal py-12 sm:py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col items-center text-center gap-6">
            {/* Heading */}
            <div>
              <span className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-gold/20 border border-gold/30 text-gold text-[10px] font-bold uppercase tracking-widest mb-3">
                <Bitcoin size={12} /> New — Crypto Payments
              </span>
              <h2 className="font-display text-2xl sm:text-3xl text-white">
                Pay Your Way — Including Crypto
              </h2>
              <p className="text-white/60 text-sm mt-2 max-w-md">
                Owkaz accepts cryptocurrency alongside traditional payment methods, making it easier for local and diaspora buyers to invest.
              </p>
            </div>

            {/* Coin chips */}
            <div className="flex flex-wrap justify-center gap-3">
              {([
                { icon: <Bitcoin size={20} />, label: 'Bitcoin', sub: 'BTC', color: 'bg-orange-500/20 border-orange-400/40 text-orange-300' },
                { icon: <Gem size={20} />, label: 'Ethereum', sub: 'ETH', color: 'bg-purple-500/20 border-purple-400/40 text-purple-300' },
                { icon: <CircleDollarSign size={20} />, label: 'Tether', sub: 'USDT', color: 'bg-green-500/20 border-green-400/40 text-green-300' },
                { icon: <Zap size={20} />, label: 'Solana', sub: 'SOL', color: 'bg-violet-500/20 border-violet-400/40 text-violet-300' },
                { icon: <Landmark size={20} />, label: 'Bank Transfer', sub: 'NGN / USD', color: 'bg-white/10 border-white/20 text-white/70' },
                { icon: <CreditCard size={20} />, label: 'Card', sub: 'Visa / Mastercard', color: 'bg-white/10 border-white/20 text-white/70' },
              ] as const).map((c) => (
                <div
                  key={c.label}
                  className={`flex items-center gap-2.5 px-4 py-2.5 rounded-xl border text-sm font-semibold ${c.color}`}
                >
                  {c.icon}
                  <div className="text-left">
                    <div className="leading-tight">{c.label}</div>
                    <div className="text-[10px] font-normal opacity-70">{c.sub}</div>
                  </div>
                </div>
              ))}
            </div>

            <p className="text-white/40 text-xs">
              Crypto transactions are processed securely. Contact us for wallet details after property selection.
            </p>
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
            <div className="flex items-center flex-col">
              <span className="text-[12px] font-bold uppercase tracking-widest text-teal-light">Ready to Get Started?</span>
              <h2 className="font-display text-3xl sm:text-6xl text-white mt-2 mb-3">
                Your Next Property<br />is One Search Away
              </h2>
              <p className="text-white/60 text-lg mb-8 max-w-md">
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
