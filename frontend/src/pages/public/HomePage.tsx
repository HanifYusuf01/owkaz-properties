import { useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, CheckCircle, Users, Lock, Phone, ArrowRight, Bitcoin, Gem, CircleDollarSign, Zap, Landmark, CreditCard, MapPin, BedDouble, Building2 } from 'lucide-react';
import {
  useGetFeaturedPropertiesQuery,
  useGetPropertiesQuery,
  useGetPropertiesPriceRangeQuery,
  useGetSavedPropertyIdsQuery,
  useSavePropertyMutation,
  useUnsavePropertyMutation,
} from '../../features/properties/propertiesApi';
import { PropertyCard } from '../../components/property/PropertyCard';
import { PriceRangeDropdown } from '../../components/property/PriceRangeDropdown';
import { MultilineText } from '../../components/ui/MultilineText';
import { formatPrice, formatCompactPrice } from '../../utils/format';
import { getImageUrl } from '../../utils/imageUrl';
import { useGetPublicStatsQuery } from '../../features/stats/statsApi';
import { useGetContentQuery } from '../../features/content/contentApi';
import { useGetPartnersQuery } from '../../features/partners/partnersApi';
import { useGetLocationsQuery } from '../../features/locations/locationsApi';
import { useGetHeroSlidesQuery } from '../../features/heroSlides/heroSlidesApi';
import { useAppSelector } from '../../store';
import { Property } from '../../types';
import { PAGE_CONTENT } from '../../features/content/pageContentConfig';

const SEARCH_TABS = ['Buy', 'Rent', 'Shortlet', 'Land'];

const FEATURES = [
  { icon: <CheckCircle size={22} className="text-teal" />, titleKey: 'feature1Title', descKey: 'feature1Desc' },
  { icon: <Users size={22} className="text-teal" />, titleKey: 'feature2Title', descKey: 'feature2Desc' },
  { icon: <Lock size={22} className="text-teal" />, titleKey: 'feature3Title', descKey: 'feature3Desc' },
  { icon: <Phone size={22} className="text-teal" />, titleKey: 'feature4Title', descKey: 'feature4Desc' },
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

// Keeps a property grid's column count matched to how many cards are actually shown,
// so a partial row (e.g. 3 cards in what would otherwise be a 4-col grid) never leaves dead space.
const GRID_COLS_LG: Record<number, string> = {
  1: 'lg:grid-cols-1',
  2: 'lg:grid-cols-2',
  3: 'lg:grid-cols-3',
  4: 'lg:grid-cols-4',
};

export const HomePage = () => {
  const navigate = useNavigate();
  const user = useAppSelector((s) => s.auth.user);
  const { data: savedIds = [] } = useGetSavedPropertyIdsQuery(undefined, { skip: !user });
  const [saveProperty] = useSavePropertyMutation();
  const [unsaveProperty] = useUnsavePropertyMutation();
  const handleToggleSave = (property: Property) => {
    if (!user) { navigate('/login'); return; }
    if (savedIds.includes(property.id)) unsaveProperty(property.id);
    else saveProperty(property.id);
  };
  const [activeTab, setActiveTab] = useState('Buy');
  const [activeType, setActiveType] = useState('House');
  const [searchQuery, setSearchQuery] = useState('');
  const [liveQuery, setLiveQuery] = useState('');
  const [showLiveResults, setShowLiveResults] = useState(false);
  const searchBoxRef = useRef<HTMLDivElement>(null);
  const stickySearchBoxRef = useRef<HTMLDivElement>(null);
  const stickyPriceRef = useRef<HTMLDivElement>(null);

  const [stickyVisible, setStickyVisible] = useState(false);
  const [stickyType, setStickyType] = useState('');
  const [stickyBeds, setStickyBeds] = useState('');
  const [stickyPriceMin, setStickyPriceMin] = useState('');
  const [stickyPriceMax, setStickyPriceMax] = useState('');
  const [stickyPriceOpen, setStickyPriceOpen] = useState(false);
  const [heroPriceMin, setHeroPriceMin] = useState('');
  const [heroPriceMax, setHeroPriceMax] = useState('');

  const { data: priceBounds } = useGetPropertiesPriceRangeQuery();
  const { data: featuredProperties = [] } = useGetFeaturedPropertiesQuery();
  const { data: recentData } = useGetPropertiesQuery({ limit: 8 });
  const recentProperties = recentData?.data ?? [];
  const { data: publicStats } = useGetPublicStatsQuery();
  const { data: homeContentData } = useGetContentQuery('home');
  const content = { ...PAGE_CONTENT.home.defaults, ...homeContentData };
  const { data: partners = [] } = useGetPartnersQuery();
  const { data: locations = [] } = useGetLocationsQuery();
  const { data: heroSlides = [] } = useGetHeroSlidesQuery();
  const [activeHeroSlide, setActiveHeroSlide] = useState(0);

  // Auto-rotate hero background images
  useEffect(() => {
    if (heroSlides.length < 2) return;
    const interval = setInterval(() => setActiveHeroSlide((i) => (i + 1) % heroSlides.length), 6000);
    return () => clearInterval(interval);
  }, [heroSlides.length]);

  // Live search: debounce so results populate under the field as the user types
  useEffect(() => {
    const timeout = setTimeout(() => setLiveQuery(searchQuery), 300);
    return () => clearTimeout(timeout);
  }, [searchQuery]);

  const { data: liveResults } = useGetPropertiesQuery(
    { search: liveQuery, limit: 5 },
    { skip: liveQuery.trim().length < 2 },
  );

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      const target = e.target as Node;
      const insideHero = searchBoxRef.current?.contains(target);
      const insideSticky = stickySearchBoxRef.current?.contains(target);
      if (!insideHero && !insideSticky) {
        setShowLiveResults(false);
      }
      if (!stickyPriceRef.current?.contains(target)) {
        setStickyPriceOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleSearch = () => {
    const params = new URLSearchParams();
    params.set('search', searchQuery);
    if (heroPriceMin) params.set('priceMin', heroPriceMin);
    if (heroPriceMax) params.set('priceMax', heroPriceMax);
    navigate(`/properties?${params.toString()}`);
  };

  // Reveal a compact search header once the hero's own search card scrolls out of view.
  // The sticky header (and its dropdown) is desktop-only (`hidden md:flex`), so this must
  // stay false on mobile — otherwise a keyboard-triggered auto-scroll past 480px flips it
  // true, hiding the hero's own live-results dropdown with no sticky one to replace it.
  useEffect(() => {
    const onScroll = () => setStickyVisible(window.scrollY > 480 && window.innerWidth >= 768);
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  const handleStickySearch = () => {
    const params = new URLSearchParams();
    const keyword = searchQuery || stickyType;
    if (keyword) params.set('search', keyword);
    if (stickyBeds) params.set('beds', stickyBeds === '5+' ? '5' : stickyBeds);
    if (stickyPriceMin) params.set('priceMin', stickyPriceMin);
    if (stickyPriceMax) params.set('priceMax', stickyPriceMax);
    navigate(`/properties?${params.toString()}`);
  };

  return (
    <div>
      {/* ── STICKY SEARCH HEADER (appears once the hero scrolls out of view) ── */}
      <div
        className={`fixed top-0 left-0 right-0 z-40 bg-white border-b border-border shadow-sm transition-transform duration-300 ${
          stickyVisible ? 'translate-y-0' : '-translate-y-full pointer-events-none'
        }`}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center gap-3">
          <button onClick={() => navigate('/')} className="flex items-center flex-shrink-0">
            <img src="/OWKAZ LOGO.png" alt="Owkaz" className="h-10" />
          </button>

          <div ref={stickySearchBoxRef} className="hidden md:flex relative items-center flex-1 gap-1 bg-surface border border-border rounded-xl px-2 py-1.5 max-w-2xl mx-auto">
            <div className="flex items-center gap-1.5 px-2 flex-1 min-w-0">
              <MapPin size={14} className="text-muted flex-shrink-0" />
              <input
                type="text"
                placeholder="Location"
                value={searchQuery}
                onChange={(e) => { setSearchQuery(e.target.value); setShowLiveResults(true); }}
                onFocus={() => setShowLiveResults(true)}
                onKeyDown={(e) => e.key === 'Enter' && handleStickySearch()}
                className="w-full bg-transparent text-sm text-ink placeholder:text-muted focus:outline-none"
              />
            </div>

            {stickyVisible && showLiveResults && liveQuery.trim().length >= 2 && (
              <div className="absolute left-0 right-0 top-full mt-2 bg-white border border-border rounded-xl shadow-2xl overflow-hidden z-20 text-left">
                {liveResults && liveResults.data.length > 0 ? (
                  <>
                    {liveResults.data.map((p) => (
                      <button
                        key={p.id}
                        onClick={() => navigate(`/properties/${p.id}`)}
                        className="w-full flex items-center justify-between gap-3 px-4 py-2.5 text-left hover:bg-cream transition-colors"
                      >
                        <div className="min-w-0">
                          <div className="text-sm text-navy truncate">{p.title}</div>
                          <div className="text-xs text-muted truncate">{p.area}, {p.lga}, {p.state}</div>
                        </div>
                        <div className="text-xs font-semibold text-teal flex-shrink-0">{formatPrice(p.price)}</div>
                      </button>
                    ))}
                    <button
                      onClick={handleStickySearch}
                      className="w-full px-4 py-2.5 text-center text-xs font-semibold text-teal hover:bg-cream transition-colors border-t border-border"
                    >
                      See all results for "{searchQuery}"
                    </button>
                  </>
                ) : (
                  <div className="px-4 py-3 text-sm text-muted">No matching properties yet.</div>
                )}
              </div>
            )}
            <div className="w-px h-5 bg-border flex-shrink-0" />
            <div className="flex items-center gap-1.5 px-2 flex-shrink-0">
              <Building2 size={14} className="text-muted" />
              <select
                value={stickyType}
                onChange={(e) => setStickyType(e.target.value)}
                className="bg-transparent text-sm text-ink focus:outline-none max-w-[100px]"
              >
                <option value="">Type</option>
                {PROPERTY_TYPES.map((t) => (
                  <option key={t.label} value={t.label}>{t.label}</option>
                ))}
              </select>
            </div>
            <div className="w-px h-5 bg-border flex-shrink-0" />
            <div className="flex items-center gap-1.5 px-2 flex-shrink-0">
              <BedDouble size={14} className="text-muted" />
              <select
                value={stickyBeds}
                onChange={(e) => setStickyBeds(e.target.value)}
                className="bg-transparent text-sm text-ink focus:outline-none"
              >
                <option value="">Beds / Baths</option>
                <option value="1">1+</option>
                <option value="2">2+</option>
                <option value="3">3+</option>
                <option value="4">4+</option>
                <option value="5+">5+</option>
              </select>
            </div>
            <div className="w-px h-5 bg-border flex-shrink-0" />
            <div ref={stickyPriceRef} className="relative flex items-center gap-1.5 px-2 flex-shrink-0">
              <span className="text-muted text-xs font-semibold">₦</span>
              <button
                type="button"
                onClick={() => setStickyPriceOpen((v) => !v)}
                className="bg-transparent text-sm text-ink focus:outline-none max-w-[110px] truncate text-left"
              >
                {stickyPriceMin || stickyPriceMax
                  ? `${stickyPriceMin ? formatCompactPrice(Number(stickyPriceMin)) : 'Any'} – ${stickyPriceMax ? formatCompactPrice(Number(stickyPriceMax)) : 'Any'}`
                  : 'Price Range'}
              </button>

              {stickyPriceOpen && priceBounds && priceBounds.max > priceBounds.min && (
                <div className="absolute left-0 right-0 top-full mt-2 w-72 bg-white border border-border rounded-xl shadow-2xl p-4 z-20 text-left">
                  <PriceRangeDropdown
                    min={priceBounds.min}
                    max={priceBounds.max}
                    valueMin={stickyPriceMin}
                    valueMax={stickyPriceMax}
                    onChangeMin={setStickyPriceMin}
                    onChangeMax={setStickyPriceMax}
                  />
                </div>
              )}
            </div>
            <button
              onClick={handleStickySearch}
              className="w-9 h-9 rounded-lg bg-teal text-white flex items-center justify-center hover:bg-teal-light transition-colors flex-shrink-0"
              aria-label="Search"
            >
              <Search size={16} />
            </button>
          </div>

          <button
            onClick={() => navigate('/properties')}
            className="md:hidden flex-1 flex items-center gap-2 bg-surface border border-border rounded-xl px-3 py-2 text-sm text-muted"
          >
            <Search size={14} /> Search properties…
          </button>

          <button
            onClick={() => navigate('/login')}
            className="px-4 py-2 rounded-lg bg-navy text-white text-sm font-semibold hover:bg-navy-mid transition-colors flex-shrink-0"
          >
            Sign In
          </button>
        </div>
      </div>

      {/* ── HERO ── */}
      <section className="bg-navy relative overflow-hidden min-h-[600px]">
        {/* Background slider — faded so it doesn't overshadow the hero content */}
        {heroSlides.length > 0 && (
          <div className="absolute inset-0">
            {heroSlides.map((slide, i) => (
              <div
                key={slide.id}
                className="absolute inset-0 bg-cover bg-center transition-opacity duration-[1500ms] ease-in-out"
                style={{
                  backgroundImage: `url(${getImageUrl(slide.imageUrl)})`,
                  opacity: i === activeHeroSlide ? 0.5 : 0,
                }}
              />
            ))}
            <div className="absolute inset-0 bg-navy/65" />
          </div>
        )}
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
              <h1 className="font-display text-4xl sm:text-6xl lg:text-7xl text-white leading-tight mb-6">
                {content.heroLine1}{' '}
                <span className="text-gold italic">{content.heroHighlight}</span>
                <br />
                <span><MultilineText text={content.heroLine2} /></span>
              </h1>
              <p className="text-white/60 text-xs sm:text-lg leading-relaxed mb-8 max-w-lg">
                {content.heroSubtitle}
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
                  { num: (publicStats?.activeListings ?? 0).toLocaleString(), label: 'Active Listings' },
                  { num: (publicStats?.happyClients ?? 0).toLocaleString(), label: 'Happy Clients' },
                  { num: (publicStats?.verifiedAgents ?? 0).toLocaleString(), label: 'Verified Agents' },
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
                <div ref={searchBoxRef} className="relative">
                  <label className="block text-[10px] font-bold text-white/40 uppercase tracking-widest mb-1.5">Location</label>
                  <input
                    type="text"
                    placeholder="e.g. Maitama, Abuja or VI Lagos…"
                    value={searchQuery}
                    onChange={(e) => { setSearchQuery(e.target.value); setShowLiveResults(true); }}
                    onFocus={() => setShowLiveResults(true)}
                    onKeyDown={(e) => { if (e.key === 'Enter') handleSearch(); }}
                    className="w-full bg-white/10 border border-white/20 rounded-lg px-3 py-2.5 text-sm text-white placeholder:text-white/30 focus:outline-none focus:border-teal transition-colors"
                  />

                  {!stickyVisible && showLiveResults && liveQuery.trim().length >= 2 && (
                    <div className="absolute left-0 right-0 top-full mt-2 bg-navy border border-white/20 rounded-xl shadow-2xl overflow-hidden z-20">
                      {liveResults && liveResults.data.length > 0 ? (
                        <>
                          {liveResults.data.map((p) => (
                            <button
                              key={p.id}
                              onClick={() => navigate(`/properties/${p.id}`)}
                              className="w-full flex items-center justify-between gap-3 px-4 py-2.5 text-left hover:bg-white/10 transition-colors"
                            >
                              <div className="min-w-0">
                                <div className="text-sm text-white truncate">{p.title}</div>
                                <div className="text-xs text-white/40 truncate">{p.area}, {p.lga}, {p.state}</div>
                              </div>
                              <div className="text-xs font-semibold text-teal-light flex-shrink-0">{formatPrice(p.price)}</div>
                            </button>
                          ))}
                          <button
                            onClick={handleSearch}
                            className="w-full px-4 py-2.5 text-center text-xs font-semibold text-teal-light hover:bg-white/10 transition-colors border-t border-white/10"
                          >
                            See all results for "{searchQuery}"
                          </button>
                        </>
                      ) : (
                        <div className="px-4 py-3 text-sm text-white/40">No matching properties yet.</div>
                      )}
                    </div>
                  )}
                </div>

                {priceBounds && priceBounds.max > priceBounds.min && (
                  <PriceRangeDropdown
                    dark
                    min={priceBounds.min}
                    max={priceBounds.max}
                    valueMin={heroPriceMin}
                    valueMax={heroPriceMax}
                    onChangeMin={setHeroPriceMin}
                    onChangeMax={setHeroPriceMax}
                  />
                )}

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
              <div key={f.titleKey} className="flex flex-col items-center text-center">
                <div className="w-14 h-14 flex items-center justify-center bg-white border border-border rounded-xl mb-4 shadow-sm">
                  {f.icon}
                </div>
                <div className="font-semibold text-sm text-navy mb-1">{content[f.titleKey]}</div>
                <div className="text-xs text-muted leading-relaxed">{content[f.descKey]}</div>
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
                <Bitcoin size={12} /> {content.cryptoBadge}
              </span>
              <h2 className="font-display text-2xl sm:text-3xl text-white">
                {content.cryptoTitle}
              </h2>
              <p className="text-white/60 text-sm mt-2 max-w-md">
                {content.cryptoSubtitle}
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

      {/* ── PARTNERS ── */}
      {partners.length > 0 && (
        <div className="py-12 sm:py-14 border-b border-border">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-8">
              <span className="text-[10px] font-bold uppercase tracking-widest text-teal">Trusted By</span>
              <h2 className="font-display text-2xl sm:text-3xl text-navy mt-2">Our Partners</h2>
            </div>
            <div className="flex flex-wrap items-center justify-center gap-x-12 gap-y-8">
              {partners.map((partner) => {
                const logo = (
                  <img
                    src={getImageUrl(partner.logoUrl)}
                    alt={partner.name}
                    title={partner.name}
                    className="h-10 sm:h-12 max-w-[140px] object-contain grayscale opacity-60 hover:grayscale-0 hover:opacity-100 transition-all duration-200"
                  />
                );
                return partner.websiteUrl ? (
                  <a key={partner.id} href={partner.websiteUrl} target="_blank" rel="noopener noreferrer">
                    {logo}
                  </a>
                ) : (
                  <div key={partner.id}>{logo}</div>
                );
              })}
            </div>
          </div>
        </div>
      )}

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

          {(() => {
            const displayed = (featuredProperties.length > 0 ? featuredProperties : recentProperties).slice(0, 4);
            if (displayed.length === 0) {
              return (
                <div className="py-16 text-center text-muted">
                  <div className="text-5xl mb-3">🏠</div>
                  <p className="text-sm">No featured properties at the moment.</p>
                </div>
              );
            }
            const colsClass = GRID_COLS_LG[Math.min(displayed.length, 4)];
            return (
              <div className={`grid grid-cols-1 sm:grid-cols-2 ${colsClass} gap-5`}>
                {displayed.map((p) => (
                  <PropertyCard
                    key={p.id}
                    property={p}
                    isSaved={savedIds.includes(p.id)}
                    onToggleSave={handleToggleSave}
                  />
                ))}
              </div>
            );
          })()}
        </div>
      </section>

      {/* ── LOCATIONS ── */}
      {locations.length > 0 && (
        <section className="py-16 sm:py-20">
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

            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
              {locations.map((loc) => (
                <button
                  key={loc.id}
                  onClick={() => navigate(`/properties?search=${loc.name}`)}
                  className="relative rounded-2xl overflow-hidden group shadow-sm hover:shadow-xl transition-shadow duration-300 h-40"
                >
                  <img
                    src={getImageUrl(loc.imageUrl)}
                    alt={loc.name}
                    className="absolute inset-0 w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-navy/85 via-navy/15 to-transparent group-hover:from-navy/90 transition-colors" />
                  <div className="absolute bottom-0 left-0 right-0 p-4 text-left">
                    <div className="flex items-center gap-1 text-white font-display text-lg">
                      <MapPin size={14} className="text-gold flex-shrink-0" />
                      {loc.name}
                    </div>
                    <div className="text-white/70 text-xs mt-0.5">
                      {loc.propertyCount.toLocaleString()} {loc.propertyCount === 1 ? 'listing' : 'listings'}
                    </div>
                  </div>
                </button>
              ))}

              {/* CTA tile */}
              <button
                onClick={() => navigate('/properties')}
                className="relative rounded-2xl overflow-hidden h-40 bg-gradient-to-br from-navy to-navy-mid flex flex-col items-center justify-center gap-2 shadow-sm hover:shadow-xl hover:opacity-95 transition-all duration-300"
              >
                <div className="w-10 h-10 rounded-full bg-white/10 flex items-center justify-center text-white">
                  <ArrowRight size={18} />
                </div>
                <div className="text-white font-semibold text-sm">View All Cities</div>
              </button>
            </div>
          </div>
        </section>
      )}

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
                <MultilineText text={content.ctaHeading} />
              </h2>
              <p className="text-white/60 text-lg mb-8 max-w-md">
                {content.ctaSubtitle}
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
