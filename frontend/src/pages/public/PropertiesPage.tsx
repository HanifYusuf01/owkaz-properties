import { useEffect, useState } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { Search, SlidersHorizontal, X, Map as MapIcon } from 'lucide-react';
import {
  useGetPropertiesQuery,
  useGetPropertiesPriceRangeQuery,
  useGetPropertiesStateCountsQuery,
  useGetSavedPropertyIdsQuery,
  useSavePropertyMutation,
  useUnsavePropertyMutation,
} from '../../features/properties/propertiesApi';
import { useGetContentQuery } from '../../features/content/contentApi';
import { PAGE_CONTENT } from '../../features/content/pageContentConfig';
import { PropertyCard } from '../../components/property/PropertyCard';
import { PriceRangeDropdown } from '../../components/property/PriceRangeDropdown';
import { NigeriaMap } from '../../components/property/NigeriaMap';
import { normalizeStateName } from '../../utils/nigeriaStateNames';
import { useAppSelector } from '../../store';
import { Property } from '../../types';

const PROPERTY_TYPES = ['House / Duplex', 'Apartment / Flat', 'Bungalow', 'Commercial', 'Land / Plot'];
const BED_OPTIONS = ['Any', '1', '2', '3', '4', '5+'];

interface FilterPanelProps {
  searchInput: string;
  setSearchInput: (v: string) => void;
  priceMin: string;
  setPriceMin: (v: string) => void;
  priceMax: string;
  setPriceMax: (v: string) => void;
  priceBounds: { min: number; max: number } | undefined;
  selectedTypes: string[];
  toggleType: (t: string) => void;
  beds: string;
  setBeds: (v: string) => void;
  onApply: () => void;
  onReset: () => void;
  onOpenMap: () => void;
}

const FilterPanel = ({
  searchInput, setSearchInput,
  priceMin, setPriceMin,
  priceMax, setPriceMax,
  priceBounds,
  selectedTypes, toggleType,
  beds, setBeds,
  onApply, onReset, onOpenMap,
}: FilterPanelProps) => (
  <div className="space-y-6">
    <div className="flex items-center justify-between">
      <span className="font-semibold text-navy text-sm">Filters</span>
      <button onClick={onReset} className="text-xs text-teal hover:underline">Reset All</button>
    </div>

    {/* Location */}
    <div>
      <div className="text-[10px] font-bold uppercase tracking-widest text-muted mb-2">Location</div>
      <div className="relative">
        <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted pointer-events-none" />
        <input
          type="text"
          placeholder="State, city or area…"
          value={searchInput}
          onChange={(e) => setSearchInput(e.target.value)}
          className="w-full border border-border rounded-lg pl-8 pr-3 py-2.5 text-sm focus:outline-none focus:border-teal transition-colors"
        />
      </div>
      <button
        onClick={onOpenMap}
        className="mt-2 w-full flex items-center justify-center gap-1.5 px-3 py-2 rounded-lg border border-border text-xs font-semibold text-navy hover:border-teal hover:text-teal transition-colors"
      >
        <MapIcon size={13} /> Browse by Map
      </button>
    </div>

    {/* Price */}
    <div>
      <div className="text-[10px] font-bold uppercase tracking-widest text-muted mb-2">Price Range (₦)</div>
      {priceBounds && priceBounds.max > priceBounds.min ? (
        <PriceRangeDropdown
          variant="inline"
          min={priceBounds.min}
          max={priceBounds.max}
          valueMin={priceMin}
          valueMax={priceMax}
          onChangeMin={setPriceMin}
          onChangeMax={setPriceMax}
        />
      ) : (
        <div className="grid grid-cols-[1fr_16px_1fr] items-center gap-1">
          <input
            type="text"
            placeholder="Min"
            value={priceMin}
            onChange={(e) => setPriceMin(e.target.value)}
            className="min-w-0 w-full border border-border rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:border-teal transition-colors"
          />
          <span />
          <input
            type="text"
            placeholder="Max"
            value={priceMax}
            onChange={(e) => setPriceMax(e.target.value)}
            className="min-w-0 w-full border border-border rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:border-teal transition-colors"
          />
        </div>
      )}
    </div>

    {/* Property Type */}
    <div>
      <div className="text-[10px] font-bold uppercase tracking-widest text-muted mb-2">Property Type</div>
      <div className="space-y-2">
        {PROPERTY_TYPES.map((t) => (
          <label key={t} className="flex items-center gap-2.5 cursor-pointer group">
            <input
              type="checkbox"
              checked={selectedTypes.includes(t)}
              onChange={() => toggleType(t)}
              className="w-4 h-4 rounded accent-teal"
            />
            <span className="text-sm text-muted group-hover:text-ink transition-colors">{t}</span>
          </label>
        ))}
      </div>
    </div>

    {/* Bedrooms */}
    <div>
      <div className="text-[10px] font-bold uppercase tracking-widest text-muted mb-2">Bedrooms</div>
      <div className="flex flex-wrap gap-2">
        {BED_OPTIONS.map((b) => (
          <button
            key={b}
            onClick={() => setBeds(b)}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold border transition-all ${
              beds === b ? 'bg-navy text-white border-navy' : 'border-border text-muted hover:border-navy hover:text-navy'
            }`}
          >
            {b}
          </button>
        ))}
      </div>
    </div>

    <button
      onClick={onApply}
      className="w-full py-3 rounded-xl bg-navy text-white text-sm font-semibold hover:bg-navy-mid transition-colors"
    >
      Apply Filters
    </button>
  </div>
);

export const PropertiesPage = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { data: savedContent } = useGetContentQuery('properties');
  const content = { ...PAGE_CONTENT.properties.defaults, ...savedContent };
  const user = useAppSelector((s) => s.auth.user);
  const { data: savedIds = [] } = useGetSavedPropertyIdsQuery(undefined, { skip: !user });
  const [saveProperty] = useSavePropertyMutation();
  const [unsaveProperty] = useUnsavePropertyMutation();
  const handleToggleSave = (property: Property) => {
    if (!user) { navigate('/login'); return; }
    if (savedIds.includes(property.id)) unsaveProperty(property.id);
    else saveProperty(property.id);
  };

  const [searchInput, setSearchInput] = useState(searchParams.get('search') ?? '');
  const [debouncedSearch, setDebouncedSearch] = useState(searchInput);
  const [selectedTypes, setSelectedTypes] = useState<string[]>([]);
  const [beds, setBeds] = useState(searchParams.get('beds') === '5' ? '5+' : (searchParams.get('beds') ?? 'Any'));
  const [priceMin, setPriceMin] = useState(searchParams.get('priceMin') ?? '');
  const [priceMax, setPriceMax] = useState(searchParams.get('priceMax') ?? '');
  const [debouncedPriceMin, setDebouncedPriceMin] = useState(priceMin);
  const [debouncedPriceMax, setDebouncedPriceMax] = useState(priceMax);
  const [sort, setSort] = useState('newest');
  const [page, setPage] = useState(1);
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const LIMIT = 12;

  // Live search: debounce free-text inputs so results populate as the user types
  useEffect(() => {
    const timeout = setTimeout(() => {
      setDebouncedSearch(searchInput);
      setDebouncedPriceMin(priceMin);
      setDebouncedPriceMax(priceMax);
      setPage(1);
    }, 350);
    return () => clearTimeout(timeout);
  }, [searchInput, priceMin, priceMax]);

  const { data, isLoading } = useGetPropertiesQuery({
    search: debouncedSearch || undefined,
    beds: beds !== 'Any' ? (beds === '5+' ? 5 : Number(beds)) : undefined,
    priceMin: debouncedPriceMin ? Number(debouncedPriceMin.replace(/,/g, '')) : undefined,
    priceMax: debouncedPriceMax ? Number(debouncedPriceMax.replace(/,/g, '')) : undefined,
    page,
    limit: LIMIT,
  });
  const { data: priceBounds } = useGetPropertiesPriceRangeQuery();
  const { data: stateCounts = [] } = useGetPropertiesStateCountsQuery();
  const [mapOpen, setMapOpen] = useState(false);

  const properties = data?.data ?? [];
  const total = data?.total ?? 0;
  const totalPages = data?.totalPages ?? 1;

  const toggleType = (t: string) =>
    setSelectedTypes((prev) => (prev.includes(t) ? prev.filter((x) => x !== t) : [...prev, t]));

  const handleApply = () => {
    setDebouncedSearch(searchInput);
    setDebouncedPriceMin(priceMin);
    setDebouncedPriceMax(priceMax);
    setPage(1);
    setSidebarOpen(false);
  };

  const handleSelectState = (stateName: string) => {
    const term = normalizeStateName(stateName) === 'fct' ? 'FCT' : stateName;
    setSearchInput(term);
    setDebouncedSearch(term);
    setPage(1);
    setMapOpen(false);
  };

  const handleReset = () => {
    setSearchInput('');
    setDebouncedSearch('');
    setSelectedTypes([]);
    setBeds('Any');
    setPriceMin('');
    setPriceMax('');
    setDebouncedPriceMin('');
    setDebouncedPriceMax('');
    setPage(1);
  };

  const filterProps: FilterPanelProps = {
    searchInput, setSearchInput,
    priceMin, setPriceMin,
    priceMax, setPriceMax,
    priceBounds,
    selectedTypes, toggleType,
    beds, setBeds,
    onApply: handleApply,
    onReset: handleReset,
    onOpenMap: () => setMapOpen(true),
  };

  return (
    <div>
      {/* Page header */}
      <div className="bg-navy py-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <span className="text-[10px] font-bold uppercase tracking-widest text-teal-light">Browse Listings</span>
          <h1 className="font-display text-3xl sm:text-4xl text-white mt-1">{content.heroTitle}</h1>
          <p className="text-white/50 text-sm mt-2">{content.heroSubtitle}</p>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex gap-8">
          {/* Desktop Sidebar */}
          <aside className="hidden lg:block w-72 flex-shrink-0">
            <div className="bg-white border border-border rounded-2xl p-5 sticky top-24">
              <FilterPanel {...filterProps} />
            </div>
          </aside>

          {/* Mobile sidebar overlay */}
          {sidebarOpen && (
            <div className="lg:hidden fixed inset-0 z-50 flex">
              <div className="absolute inset-0 bg-black/40" onClick={() => setSidebarOpen(false)} />
              <div className="relative bg-white w-80 max-w-full h-full overflow-y-auto p-5 ml-auto shadow-xl">
                <button
                  onClick={() => setSidebarOpen(false)}
                  className="absolute top-4 right-4 text-muted hover:text-ink"
                >
                  <X size={20} />
                </button>
                <FilterPanel {...filterProps} />
              </div>
            </div>
          )}

          {/* Main */}
          <div className="flex-1 min-w-0">
            {/* Toolbar */}
            <div className="flex items-center justify-between gap-3 mb-6">
              <div className="text-sm text-muted">
                <strong className="text-navy">{total.toLocaleString()}</strong> properties found
              </div>
              <div className="flex items-center gap-3">
                <select
                  value={sort}
                  onChange={(e) => setSort(e.target.value)}
                  className="border border-border rounded-lg px-3 py-2 text-xs text-ink focus:outline-none focus:border-teal hidden sm:block"
                >
                  <option value="newest">Newest First</option>
                  <option value="price_asc">Price: Low to High</option>
                  <option value="price_desc">Price: High to Low</option>
                </select>
                <button
                  onClick={() => setSidebarOpen(true)}
                  className="lg:hidden flex items-center gap-2 px-3 py-2 rounded-lg border border-border text-xs font-semibold text-navy"
                >
                  <SlidersHorizontal size={14} /> Filters
                </button>
              </div>
            </div>

            {isLoading ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-5">
                {Array.from({ length: 6 }).map((_, i) => (
                  <div key={i} className="bg-white border border-border rounded-2xl overflow-hidden animate-pulse">
                    <div className="h-48 bg-surface" />
                    <div className="p-4 space-y-3">
                      <div className="h-4 bg-surface rounded w-3/4" />
                      <div className="h-3 bg-surface rounded w-1/2" />
                    </div>
                  </div>
                ))}
              </div>
            ) : properties.length === 0 ? (
              <div className="py-20 text-center">
                <div className="flex justify-center mb-3"><Search size={64} /></div>
                <h3 className="font-semibold text-navy text-lg">No properties found</h3>
                <p className="text-sm text-muted mt-1 mb-4">Try adjusting your filters or search terms.</p>
                <button onClick={handleReset} className="px-5 py-2.5 rounded-xl bg-navy text-white text-sm font-semibold">
                  Clear Filters
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-5">
                {properties.map((p) => (
                  <PropertyCard
                    key={p.id}
                    property={p}
                    isSaved={savedIds.includes(p.id)}
                    onToggleSave={handleToggleSave}
                  />
                ))}
              </div>
            )}

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="flex items-center justify-center gap-2 mt-10">
                <button
                  disabled={page === 1}
                  onClick={() => setPage(page - 1)}
                  className="px-3 py-2 rounded-lg border border-border text-sm font-semibold text-muted hover:border-navy hover:text-navy disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
                >
                  ←
                </button>
                {Array.from({ length: Math.min(totalPages, 7) }, (_, i) => {
                  const p_num = i + 1;
                  return (
                    <button
                      key={p_num}
                      onClick={() => setPage(p_num)}
                      className={`w-9 h-9 rounded-lg border text-sm font-semibold transition-colors ${
                        page === p_num
                          ? 'bg-navy text-white border-navy'
                          : 'border-border text-muted hover:border-navy hover:text-navy'
                      }`}
                    >
                      {p_num}
                    </button>
                  );
                })}
                <button
                  disabled={page === totalPages}
                  onClick={() => setPage(page + 1)}
                  className="px-3 py-2 rounded-lg border border-border text-sm font-semibold text-muted hover:border-navy hover:text-navy disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
                >
                  →
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Map modal */}
      {mapOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/50" onClick={() => setMapOpen(false)} />
          <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto p-6">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h2 className="font-display text-xl text-navy">Browse by State</h2>
                <p className="text-xs text-muted mt-0.5">Click a state to see its listings.</p>
              </div>
              <button
                onClick={() => setMapOpen(false)}
                className="text-muted hover:text-ink transition-colors"
                aria-label="Close map"
              >
                <X size={20} />
              </button>
            </div>
            <NigeriaMap stateCounts={stateCounts} onSelectState={handleSelectState} />
          </div>
        </div>
      )}
    </div>
  );
};
