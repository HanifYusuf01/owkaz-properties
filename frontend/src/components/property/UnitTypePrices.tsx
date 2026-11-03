import { UnitType } from '../../features/projects/projectsApi';
import { formatPrice } from '../../utils/format';

interface UnitTypePricesProps {
  unitTypes: UnitType[];
  className?: string;
}

export const UnitTypePrices = ({ unitTypes, className = '' }: UnitTypePricesProps) => (
  <ul className={`divide-y divide-border ${className}`}>
    {unitTypes.map((u, i) => (
      <li key={`${u.name}-${i}`} className="flex items-baseline justify-between gap-4 py-2 text-sm">
        <span className="text-navy font-medium">
          {u.name}
          {u.availableUnits != null && (
            <span className="ml-2 text-[11px] font-normal text-muted">
              {u.availableUnits === 0 ? 'Sold out' : `${u.availableUnits} left`}
            </span>
          )}
        </span>
        <span className="font-display text-navy whitespace-nowrap">{formatPrice(Number(u.price))}</span>
      </li>
    ))}
  </ul>
);
