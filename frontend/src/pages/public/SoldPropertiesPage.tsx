import { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { Search, SlidersHorizontal, X } from 'lucide-react';
import { useGetPublicSoldPropertiesQuery, useGetPropertiesPriceRangeQuery } from '../../features/properties/propertiesApi';
import { formatPrice, formatDate } from '../../utils/format';
import { getImageUrl } from '../../utils/imageUrl';
import { useGetContentQuery } from '../../features/content/contentApi';
import { PAGE_CONTENT } from '../../features/content/pageContentConfig';
import { PriceRangeDropdown } from '../../components/property/PriceRangeDropdown';

const BED_OPTIONS = ['Any', '1', '2', '3', '4', '5+'];

interface FilterPanelProps {
  searchInput: string;
  setSearchInput: (v: string) => void;
  priceMin: string;
  setPriceMin: (v: string) => void;
  priceMax: string;
  setPriceMax: (v: string) => void;
  priceBounds: { min: number; max: number } | undefined;
  beds: string;
  setBeds: (v: string) => void;
  onApply: () => void;
  onReset: () => void;
}

const FilterPanel = ({
  searchInput, setSearchInput,
  priceMin, setPriceMin,
  priceMax, setPriceMax,
  priceBounds,
  beds, setBeds,
  onApply, onReset,
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
    </div>

    {/* Sale Price */}
    <div>
      <div className="text-[10px] font-bold uppercase tracking-widest text-muted mb-2">Sale Price Range (₦)</div>
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

export const SoldPropertiesPage = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { data: savedContent } = useGetContentQuery('sold');
  const content = { ...PAGE_CONTENT.sold.defaults, ...savedContent };

  const [searchInput, setSearchInput] = useState(searchParams.get('search') ?? '');
  const [debouncedSearch, setDebouncedSearch] = useState(searchInput);
  const [beds, setBeds] = useState('Any');
  const [priceMin, setPriceMin] = useState('');
  const [priceMax, setPriceMax] = useState('');
  const [debouncedPriceMin, setDebouncedPriceMin] = useState('');
  const [debouncedPriceMax, setDebouncedPriceMax] = useState('');
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

  const { data, isLoading } = useGetPublicSoldPropertiesQuery({
    search: debouncedSearch || undefined,
    beds: beds !== 'Any' ? (beds === '5+' ? 5 : Number(beds)) : undefined,
    priceMin: debouncedPriceMin ? Number(debouncedPriceMin.replace(/,/g, '')) : undefined,
    priceMax: debouncedPriceMax ? Number(debouncedPriceMax.replace(/,/g, '')) : undefined,
    page,
    limit: LIMIT,
  });
  const { data: priceBounds } = useGetPropertiesPriceRangeQuery({ sold: true });

  const properties = data?.data ?? [];
  const total = data?.total ?? 0;
  const totalPages = data?.totalPages ?? 1;

  const handleApply = () => {
    setDebouncedSearch(searchInput);
    setDebouncedPriceMin(priceMin);
    setDebouncedPriceMax(priceMax);
    setPage(1);
    setSidebarOpen(false);
  };

  const handleReset = () => {
    setSearchInput('');
    setDebouncedSearch('');
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
    beds, setBeds,
    onApply: handleApply,
    onReset: handleReset,
  };

  return (
    <div>
      {/* Page header */}
      <div className="bg-navy py-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <span className="text-[10px] font-bold uppercase tracking-widest text-gold">Sold Projects</span>
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
                <strong className="text-navy">{total.toLocaleString()}</strong> sold properties
              </div>
              <button
                onClick={() => setSidebarOpen(true)}
                className="lg:hidden flex items-center gap-2 px-3 py-2 rounded-lg border border-border text-xs font-semibold text-navy"
              >
                <SlidersHorizontal size={14} /> Filters
              </button>
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
                <div className="text-5xl mb-3">🏷️</div>
                <h3 className="font-semibold text-navy text-lg">No sold properties found</h3>
                <p className="text-sm text-muted mt-1 mb-4">Try adjusting your filters or search terms.</p>
                <button onClick={handleReset} className="px-5 py-2.5 rounded-xl bg-navy text-white text-sm font-semibold">
                  Clear Filters
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-5">
                {properties.map((p) => (
                  <div
                    key={p.id}
                    className="bg-white border border-border rounded-2xl overflow-hidden cursor-pointer hover:-translate-y-1 hover:shadow-lg transition-all duration-200"
                    onClick={() => navigate(`/properties/${p.id}`)}
                  >
                    {/* Image */}
                    <div className="relative h-48 bg-gradient-to-br from-navy-mid to-teal overflow-hidden flex items-center justify-center">
                      {p.images?.[0] ? (
                        <img src={getImageUrl(p.images[0])} alt={p.title} className="w-full h-full object-cover" />
                      ) : (
                        <span className="text-6xl opacity-20">🏠</span>
                      )}
                      {/* Sold ribbon */}
                      <div className="absolute top-0 right-0 bg-gold text-white text-[10px] font-bold px-3 py-1 rounded-bl-lg uppercase tracking-wide">
                        Sold
                      </div>
                      <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-navy/80 to-transparent p-4">
                        <div className="font-display text-xl text-white">
                          {p.salePrice ? formatPrice(p.salePrice) : formatPrice(p.price)}
                        </div>
                        <div className="text-white/60 text-[10px] uppercase tracking-wide">
                          {p.salePrice ? 'Final Sale Price' : 'Listed Price'}
                        </div>
                      </div>
                    </div>

                    {/* Info */}
                    <div className="p-4">
                      <h3 className="font-semibold text-sm text-navy leading-snug mb-1">{p.title}</h3>
                      <div className="text-xs text-muted mb-1">📍 {p.area}, {p.lga}, {p.state}</div>
                      {p.soldAt && (
                        <div className="text-xs text-muted mb-3">
                          Sold on <span className="font-medium text-navy">{formatDate(p.soldAt)}</span>
                        </div>
                      )}
                      <div className="flex gap-4 pt-3 border-t border-border">
                        {p.beds != null && (
                          <span className="text-xs text-muted">🛏 <strong className="text-navy">{p.beds}</strong> Beds</span>
                        )}
                        {p.baths != null && (
                          <span className="text-xs text-muted">🚿 <strong className="text-navy">{p.baths}</strong> Baths</span>
                        )}
                        {p.sqm != null && (
                          <span className="text-xs text-muted">📐 <strong className="text-navy">{p.sqm}</strong> m²</span>
                        )}
                      </div>
                    </div>
                  </div>
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
    </div>
  );
};
