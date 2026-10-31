import { geoArea, GeoPermissibleObjects } from 'd3-geo';

export interface StateFeature {
  type: 'Feature';
  properties: { shapeName: string };
  geometry: GeoJSON.Geometry;
}

export interface LgaFeature {
  type: 'Feature';
  properties: { name: string };
  geometry: GeoJSON.Geometry;
}

export function fixRingWinding<T extends { geometry: GeoJSON.Geometry }>(features: T[]): T[] {
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

let statesPromise: Promise<StateFeature[]> | null = null;

export function loadNigeriaStates(): Promise<StateFeature[]> {
  if (!statesPromise) {
    statesPromise = fetch('/nigeria-states.geojson')
      .then((r) => r.json())
      .then((data) => fixRingWinding<StateFeature>(data.features))
      .catch((err) => {
        statesPromise = null;
        throw err;
      });
  }
  return statesPromise;
}

const lgaCache = new Map<string, Promise<LgaFeature[]>>();

export function loadStateLgas(stateKey: string): Promise<LgaFeature[]> {
  let cached = lgaCache.get(stateKey);
  if (!cached) {
    cached = fetch(`/geo/lgas/${stateKey}.json`)
      .then((r) => {
        if (!r.ok) throw new Error(`No LGA data for ${stateKey}`);
        return r.json();
      })
      .then((data) => fixRingWinding<LgaFeature>(data.features))
      .catch((err) => {
        lgaCache.delete(stateKey);
        throw err;
      });
    lgaCache.set(stateKey, cached);
  }
  return cached;
}

export function lgaKey(name: string): string {
  return name.toLowerCase().replace(/[^a-z]/g, '');
}
