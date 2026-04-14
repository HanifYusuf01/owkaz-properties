import { useState } from 'react';
import { useGetSoldPropertiesQuery } from '../../../features/properties/propertiesApi';
import { PropertyCard } from '../../../components/property/PropertyCard';
import { Badge } from '../../../components/ui/Badge';
import { formatPrice, formatDate } from '../../../utils/format';
import { Input } from '../../../components/ui/Input';

export const SoldProjectsPage = () => {
  const [search, setSearch] = useState('');
  const { data, isLoading } = useGetSoldPropertiesQuery({ search: search || undefined, limit: 50 });
  const properties = data?.data ?? [];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-blue-50 border border-blue-200 rounded-xl p-4">
        <h3 className="text-sm font-bold text-blue-800">Sold Projects</h3>
        <p className="text-xs text-blue-600 mt-0.5">
          Properties that have been successfully sold. Total: {data?.total ?? 0}
        </p>
      </div>

      {/* Search */}
      <Input
        placeholder="Search sold properties..."
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        className="max-w-xs"
      />

      {/* Table */}
      {isLoading ? (
        <div className="py-20 text-center text-muted">Loading...</div>
      ) : (
        <div className="bg-white border border-border rounded-xl overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-navy">
                <tr>
                  {['Property', 'Type', 'Listed Price', 'Sale Price', 'Sold Date', 'Provider', 'Status'].map((h) => (
                    <th key={h} className="px-4 py-3 text-left text-[10px] font-semibold uppercase tracking-wide text-white/70">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {properties.map((p) => (
                  <tr key={p.id} className="hover:bg-surface transition-colors">
                    <td className="px-4 py-3">
                      <div className="font-semibold text-navy">{p.title}</div>
                      <div className="text-xs text-muted">📍 {p.area}, {p.lga}</div>
                    </td>
                    <td className="px-4 py-3 text-muted">{p.type}</td>
                    <td className="px-4 py-3 font-medium text-navy">{formatPrice(p.price)}</td>
                    <td className="px-4 py-3 font-semibold text-blue-700">
                      {p.salePrice ? formatPrice(p.salePrice) : '—'}
                    </td>
                    <td className="px-4 py-3 text-muted">
                      {p.soldAt ? formatDate(p.soldAt) : '—'}
                    </td>
                    <td className="px-4 py-3 text-muted">{p.submittedBy?.name}</td>
                    <td className="px-4 py-3"><Badge status={p.status} /></td>
                  </tr>
                ))}
              </tbody>
            </table>
            {properties.length === 0 && (
              <div className="py-20 text-center">
                <div className="text-4xl mb-3">🏷</div>
                <h3 className="font-semibold text-navy">No sold properties yet</h3>
                <p className="text-sm text-muted mt-1">Properties marked as sold will appear here.</p>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Cards view */}
      {properties.length > 0 && (
        <div>
          <h3 className="font-display text-xl text-navy mb-4">Gallery View</h3>
          <div className="grid grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-5">
            {properties.map((p) => (
              <PropertyCard key={p.id} property={p} showStatus />
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
