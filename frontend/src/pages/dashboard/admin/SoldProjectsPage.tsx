import { useState } from 'react';
import { useGetSoldPropertiesQuery } from '../../../features/properties/propertiesApi';
import { PropertyCard } from '../../../components/property/PropertyCard';
import { Badge } from '../../../components/ui/Badge';
import { DataTable, Column } from '../../../components/ui/DataTable';
import { formatPrice, formatDate } from '../../../utils/format';
import { Input } from '../../../components/ui/Input';
import { Property } from '../../../types';

const PAGE_SIZE = 10;

export const SoldProjectsPage = () => {
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const { data, isLoading } = useGetSoldPropertiesQuery({ search: search || undefined, page, limit: PAGE_SIZE });
  const properties = data?.data ?? [];
  const total = data?.total ?? 0;
  const totalPages = data?.totalPages ?? 1;

  const columns: Column<Property>[] = [
    {
      key: 'property',
      header: 'Property',
      cell: (p) => (
        <>
          <div className="font-semibold text-navy">{p.title}</div>
          <div className="text-xs text-muted">📍 {p.area}, {p.lga}</div>
        </>
      ),
    },
    { key: 'type', header: 'Type', className: 'text-muted', cell: (p) => p.type },
    { key: 'listed', header: 'Listed Price', className: 'font-medium text-navy', cell: (p) => formatPrice(p.price) },
    {
      key: 'sale',
      header: 'Sale Price',
      className: 'font-semibold text-blue-700',
      cell: (p) => (p.salePrice ? formatPrice(p.salePrice) : '—'),
    },
    {
      key: 'sold-date',
      header: 'Sold Date',
      className: 'text-muted',
      cell: (p) => (p.soldAt ? formatDate(p.soldAt) : '—'),
    },
    { key: 'provider', header: 'Provider', className: 'text-muted', cell: (p) => p.submittedBy?.name },
    { key: 'status', header: 'Status', cell: (p) => <Badge status={p.status} /> },
  ];

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
        onChange={(e) => { setSearch(e.target.value); setPage(1); }}
        className="max-w-xs"
      />

      <DataTable
        columns={columns}
        rows={properties}
        rowKey={(p) => p.id}
        isLoading={isLoading}
        page={page}
        totalPages={totalPages}
        total={total}
        onPageChange={setPage}
        emptyState={
          <div className="py-20 text-center bg-white border border-border rounded-xl">
            <div className="text-4xl mb-3">🏷</div>
            <h3 className="font-semibold text-navy">No sold properties yet</h3>
            <p className="text-sm text-muted mt-1">Properties marked as sold will appear here.</p>
          </div>
        }
      />

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
