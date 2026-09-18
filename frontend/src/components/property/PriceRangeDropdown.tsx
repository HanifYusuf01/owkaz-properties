import { formatCompactPrice } from '../../utils/format';
import { generatePriceSteps } from '../../utils/priceSteps';

interface PriceRangeDropdownProps {
  min: number;
  max: number;
  valueMin: string;
  valueMax: string;
  onChangeMin: (v: string) => void;
  onChangeMax: (v: string) => void;
  /** Use on dark backgrounds (e.g. the homepage hero). */
  dark?: boolean;
  /** 'stacked' = separately labeled Min/Max fields. 'inline' = one row with a "to" divider. */
  variant?: 'stacked' | 'inline';
}

export const PriceRangeDropdown = ({
  min, max, valueMin, valueMax, onChangeMin, onChangeMax, dark = false, variant = 'stacked',
}: PriceRangeDropdownProps) => {
  if (max <= min) return null;

  const steps = generatePriceSteps(min, max);
  const minOptions = Array.from(new Set([min, ...steps])).filter((v) => !valueMax || v < Number(valueMax));
  const maxOptions = Array.from(new Set([...steps, max])).filter((v) => !valueMin || v > Number(valueMin));

  const selectClass = dark
    ? 'w-full bg-white/10 border border-white/20 rounded-lg px-3 py-2.5 text-sm text-white focus:outline-none focus:border-teal appearance-none'
    : 'min-w-0 w-full border border-border rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:border-teal transition-colors bg-white';
  const optionClass = dark ? 'bg-navy text-white' : '';

  const minSelect = (
    <select value={valueMin} onChange={(e) => onChangeMin(e.target.value)} className={selectClass}>
      <option value="" className={optionClass}>Any</option>
      {minOptions.map((v) => (
        <option key={v} value={v} className={optionClass}>{formatCompactPrice(v)}</option>
      ))}
    </select>
  );

  const maxSelect = (
    <select value={valueMax} onChange={(e) => onChangeMax(e.target.value)} className={selectClass}>
      <option value="" className={optionClass}>Any</option>
      {maxOptions.map((v) => (
        <option key={v} value={v} className={optionClass}>{formatCompactPrice(v)}</option>
      ))}
    </select>
  );

  if (variant === 'inline') {
    return (
      <div className="grid grid-cols-[1fr_16px_1fr] items-center gap-1">
        {minSelect}
        <span className={`text-center text-xs ${dark ? 'text-white/40' : 'text-muted'}`}>–</span>
        {maxSelect}
      </div>
    );
  }

  const labelClass = dark
    ? 'block text-[10px] font-bold text-white/40 uppercase tracking-widest mb-1.5'
    : 'text-[10px] font-bold uppercase tracking-widest text-muted mb-2 block';

  return (
    <div className="grid grid-cols-2 gap-3">
      <div>
        <label className={labelClass}>Min Price (₦)</label>
        {minSelect}
      </div>
      <div>
        <label className={labelClass}>Max Price (₦)</label>
        {maxSelect}
      </div>
    </div>
  );
};
