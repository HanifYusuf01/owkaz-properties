import { useState } from 'react';
import { useGetSavedPropertiesQuery } from '../../../features/properties/propertiesApi';
import { PropertyCard } from '../../../components/property/PropertyCard';
import { PropertyDetailModal } from '../../../components/property/PropertyDetailModal';
import { Property } from '../../../types';

export const SavedPropertiesPage = () => {
  const { data: properties = [], isLoading } = useGetSavedPropertiesQuery();
  const [selectedProperty, setSelectedProperty] = useState<Property | null>(null);

  return (
    <div className="space-y-5">
      <div className="text-xs text-muted">
        {properties.length} saved propert{properties.length !== 1 ? 'ies' : 'y'}
      </div>

      {isLoading ? (
        <div className="grid grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-5">
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
        <div className="py-24 text-center">
          <div className="text-5xl mb-3">🔖</div>
          <h3 className="font-semibold text-navy text-lg">No saved properties</h3>
          <p className="text-sm text-muted mt-1">
            Browse listings and tap the save button to bookmark properties you like.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-5">
          {properties.map((p) => (
            <PropertyCard
              key={p.id}
              property={p}
              onCardClick={setSelectedProperty}
            />
          ))}
        </div>
      )}

      {selectedProperty && (
        <PropertyDetailModal
          property={selectedProperty}
          onClose={() => setSelectedProperty(null)}
        />
      )}
    </div>
  );
};
