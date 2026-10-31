import { useMemo } from 'react';
import { MapPin } from 'lucide-react';
import { Input } from '../ui/Input';
import { Select } from '../ui/Select';
import { NIGERIAN_STATES } from '../../constants/nigerianStates';
import { useGetPropertiesAreasQuery } from '../../features/properties/propertiesApi';
import { lgaKey } from '../../utils/nigeriaGeo';
import { normalizeStateName } from '../../utils/nigeriaStateNames';

interface LocationValue {
  state: string;
  lga: string;
  area: string;
}

interface LocationFieldsProps extends LocationValue {
  onChange: (patch: Partial<LocationValue>) => void;
  errors?: Partial<Record<keyof LocationValue, string>>;
}

export const LocationFields = ({ state, lga, area, onChange, errors }: LocationFieldsProps) => {
  const { data: knownAreas = [] } = useGetPropertiesAreasQuery();
  const lgas = NIGERIAN_STATES.find((s) => s.label === state)?.lgas ?? [];

  const suggestions = useMemo(() => {
    if (!state || !lga) return [];
    const stateKey = normalizeStateName(state);
    const wanted = lgaKey(lga);
    const merged = new Map<string, { name: string; count: number }>();
    for (const row of knownAreas) {
      if (normalizeStateName(row.state) !== stateKey || lgaKey(row.lga) !== wanted) continue;
      const key = row.area.trim().toLowerCase();
      const existing = merged.get(key);
      merged.set(key, { name: existing?.name ?? row.area.trim(), count: (existing?.count ?? 0) + row.count });
    }
    return [...merged.values()].sort((a, b) => b.count - a.count || a.name.localeCompare(b.name));
  }, [knownAreas, state, lga]);

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <Select
          label="State"
          placeholder="Select state..."
          options={NIGERIAN_STATES.map((s) => ({ value: s.label, label: s.label }))}
          value={state}
          onChange={(e) => onChange({ state: e.target.value, lga: '', area: '' })}
          error={errors?.state}
        />
        <Select
          label="LGA"
          placeholder={state ? 'Select LGA...' : 'Select a state first'}
          options={lgas.map((l) => ({ value: l.value, label: l.label }))}
          value={lga}
          onChange={(e) => onChange({ lga: e.target.value, area: '' })}
          error={errors?.lga}
          disabled={!state}
        />
      </div>
      <div>
        <Input
          label="Area / Neighbourhood"
          placeholder={lga ? `e.g. ${suggestions[0]?.name ?? 'Maitama District'}` : 'Select an LGA first'}
          value={area}
          onChange={(e) => onChange({ area: e.target.value })}
          error={errors?.area}
          disabled={!lga}
        />
        {lga && suggestions.length > 0 && (
          <div className="mt-2 flex flex-wrap items-center gap-1.5">
            <span className="text-[11px] text-muted">Already on Owkaz in {lga}:</span>
            {suggestions.slice(0, 8).map((s) => (
              <button
                key={s.name}
                type="button"
                onClick={() => onChange({ area: s.name })}
                className={`inline-flex items-center gap-1 rounded-full border px-2.5 py-1 text-xs transition-colors ${
                  s.name.toLowerCase() === area.trim().toLowerCase()
                    ? 'border-teal bg-teal/10 text-teal font-semibold'
                    : 'border-border text-navy hover:border-teal hover:text-teal'
                }`}
              >
                <MapPin size={11} />
                {s.name}
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
