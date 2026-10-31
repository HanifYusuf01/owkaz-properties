import { geoArea, GeoPermissibleObjects } from 'd3-geo';

export interface StateFeature {
  type: 'Feature';
  properties: { shapeName: string };
  geometry: GeoJSON.Geometry;
}

export function fixRingWinding(features: StateFeature[]): StateFeature[] {
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
      .then((data) => fixRingWinding(data.features))
      .catch((err) => {
        statesPromise = null;
        throw err;
      });
  }
  return statesPromise;
}
