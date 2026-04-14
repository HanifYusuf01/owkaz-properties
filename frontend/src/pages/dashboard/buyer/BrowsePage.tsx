import { useState } from 'react';
import { useGetPropertiesQuery } from '../../../features/properties/propertiesApi';
import { PropertyCard } from '../../../components/property/PropertyCard';
import { Input } from '../../../components/ui/Input';
import { Select } from '../../../components/ui/Select';
import { Button } from '../../../components/ui/Button';
import { PropertyType } from '../../../types';

export const BrowsePage = () => {
  const [search, setSearch] = useState('');
  const [type, setType] = useState('');
  const [priceMax, setPriceMax] = useState('');
  const [page, setPage] = useState(1);

  const { data, isLoading } = useGetPropertiesQuery({
    search: search || undefined,
    type: type as PropertyType || undefined,
    priceMax: priceMax ? Number(priceMax) : undefined,
    page,
    limit: 12,
  });

  const properties = data?.data ?? [];

  return (
    <div className="space-y-5">
      {/* Filters */}
      <div className="bg-white border border-border rounded-xl p-4 flex gap-3 flex-wrap items-end">
        <div className="flex-1 min-w-[180px]">
          <Input
            placeholder="🔍 Search by name or area..."
            value={search}
            onChange={(e) => { setSearch(e.target.value); setPage(1); }}
          />
        </div>
        <div className="w-40">
          <Select
            placeholder="All Types"
            options={Object.values(PropertyType).map((t) => ({ value: t, label: t }))}
            value={type}
            onChange={(e) => { setType(e.target.value); setPage(1); }}
          />
        </div>
        <div className="w-40">
          <Select
            placeholder="Any Price"
            options={[
              { value: '50000000', label: 'Under ₦50M' },
              { value: '100000000', label: 'Under ₦100M' },
              { value: '200000000', label: 'Under ₦200M' },
            ]}
            value={priceMax}
            onChange={(e) => { setPriceMax(e.target.value); setPage(1); }}
          />
        </div>
        <Button variant="ghost" size="sm" onClick={() => { setSearch(''); setType(''); setPriceMax(''); setPage(1); }}>
          Clear
        </Button>
      </div>

      <div className="text-xs text-muted">{data?.total ?? 0} listing{(data?.total ?? 0) !== 1 ? 's' : ''} found</div>

      {isLoading ? (
        <div className="py-20 text-center text-muted">Loading...</div>
      ) : (
        <>
          <div className="grid grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-5">
            {properties.map((p) => <PropertyCard key={p.id} property={p} />)}
          </div>
          {properties.length === 0 && (
            <div className="py-20 text-center">
              <div className="text-5xl mb-3">🔍</div>
              <h3 className="font-semibold text-navy">No listings found</h3>
              <p className="text-sm text-muted mt-1">Try adjusting your filters.</p>
            </div>
          )}
          {/* Pagination */}
          {data && data.totalPages > 1 && (
            <div className="flex justify-center gap-2">
              <Button variant="ghost" size="sm" disabled={page === 1} onClick={() => setPage(page - 1)}>← Prev</Button>
              <span className="px-4 py-2 text-sm text-muted">Page {page} of {data.totalPages}</span>
              <Button variant="ghost" size="sm" disabled={page === data.totalPages} onClick={() => setPage(page + 1)}>Next →</Button>
            </div>
          )}
        </>
      )}
    </div>
  );
};
