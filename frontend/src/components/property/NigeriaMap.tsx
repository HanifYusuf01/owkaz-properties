import { useEffect, useMemo, useState } from 'react';
import { geoArea, geoMercator, geoPath, GeoPermissibleObjects } from 'd3-geo';
import { normalizeStateName } from '../../utils/nigeriaStateNames';

interface StateFeature {
  type: 'Feature';
  properties: { shapeName: string };
  geometry: GeoJSON.Geometry;
}

interface NigeriaMapProps {
  stateCounts: { state: string; count: number }[];
  onSelectState: (stateName: string) => void;
}

const WIDTH = 620;
const HEIGHT = 620;

/**
 * The geoBoundaries dataset traces back to Esri shapefiles, which wind polygon rings
 * clockwise — the opposite of the GeoJSON RFC7946 (and d3-geo) convention. Left as-is,
 * d3 reads each state as "the whole globe minus this shape" (geoArea ≈ 4π), so every
 * path's bounds collapse to the full canvas and only the last-painted state is visible.
 * Detect that (area > half the sphere) and reverse the rings to fix it.
 */
function fixRingWinding(features: StateFeature[]): StateFeature[] {
  return features.map((f) => {
    if (geoArea(f as unknown as GeoPermissibleObjects) <= Math.PI) return f;

    const geom = f.geometry;
    const reverseRings = (rings: number[][][]) => rings.map((ring) => [...ring].reverse());
    if (geom.type === 'Polygon') {
      return { ...f, geometry: { ...geom, coordinates: reverseRings(geom.coordinates) } };
    }
    if (geom.type === 'MultiPolygon') {
      return { ...f, geometry: { ...geom, coordinates: geom.coordinates.map(reverseRings) } };
    }
    return f;
  });
}

export const NigeriaMap = ({ stateCounts, onSelectState }: NigeriaMapProps) => {
  const [features, setFeatures] = useState<StateFeature[] | null>(null);
  const [hovered, setHovered] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    fetch('/nigeria-states.geojson')
      .then((r) => r.json())
      .then((data) => { if (!cancelled) setFeatures(fixRingWinding(data.features)); });
    return () => { cancelled = true; };
  }, []);

  const countByState = useMemo(() => {
    const map = new Map<string, number>();
    for (const { state, count } of stateCounts) {
      const key = normalizeStateName(state);
      map.set(key, (map.get(key) ?? 0) + count);
    }
    return map;
  }, [stateCounts]);

  const pathGen = useMemo(() => {
    if (!features) return null;
    const projection = geoMercator().fitSize(
      [WIDTH, HEIGHT],
      { type: 'FeatureCollection', features } as unknown as GeoPermissibleObjects,
    );
    return geoPath(projection);
  }, [features]);

  if (!features || !pathGen) {
    return (
      <div className="flex items-center justify-center h-96 text-muted text-sm">
        Loading map…
      </div>
    );
  }

  return (
    <div>
      <svg viewBox={`0 0 ${WIDTH} ${HEIGHT}`} className="w-full h-auto select-none">
        {features.map((f) => {
          const name = f.properties.shapeName;
          const count = countByState.get(normalizeStateName(name)) ?? 0;
          const hasListings = count > 0;
          const isHovered = hovered === name;

          return (
            <path
              key={name}
              d={pathGen(f as unknown as GeoPermissibleObjects) ?? ''}
              fill={hasListings ? (isHovered ? '#0E7C6E' : '#12A08E') : (isHovered ? '#D8D2C6' : '#E5E0D8')}
              stroke="#ffffff"
              strokeWidth={1}
              className="cursor-pointer transition-colors duration-150"
              onMouseEnter={() => setHovered(name)}
              onMouseLeave={() => setHovered(null)}
              onClick={() => onSelectState(name)}
            >
              <title>{name}{hasListings ? ` — ${count} listing${count !== 1 ? 's' : ''}` : ' — no listings yet'}</title>
            </path>
          );
        })}
      </svg>

      <div className="flex items-center gap-5 justify-center mt-4 text-xs text-muted">
        <span className="flex items-center gap-1.5"><span className="w-3 h-3 rounded-sm bg-[#12A08E] inline-block" /> Has listings</span>
        <span className="flex items-center gap-1.5"><span className="w-3 h-3 rounded-sm bg-[#E5E0D8] inline-block" /> No listings yet</span>
      </div>
    </div>
  );
};
