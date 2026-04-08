import { SelectHTMLAttributes, forwardRef } from 'react';

interface SelectProps extends SelectHTMLAttributes<HTMLSelectElement> {
  label?: string;
  error?: string;
  options: { value: string; label: string }[];
  placeholder?: string;
}

export const Select = forwardRef<HTMLSelectElement, SelectProps>(
  ({ label, error, options, placeholder, className = '', ...props }, ref) => {
    return (
      <div className="flex flex-col gap-1.5">
        {label && (
          <label className="text-xs font-semibold uppercase tracking-wide text-navy">
            {label}
          </label>
        )}
        <select
          ref={ref}
          {...props}
          className={`w-full px-3.5 py-2.5 border border-border rounded-lg text-sm text-ink bg-white outline-none transition-colors focus:border-teal disabled:opacity-50 disabled:cursor-not-allowed disabled:bg-gray-50 ${error ? 'border-red-400' : ''} ${className}`}
        >
          {placeholder && <option value="">{placeholder}</option>}
          {options.map((opt) => (
            <option key={opt.value} value={opt.value}>
              {opt.label}
            </option>
          ))}
        </select>
        {error && <p className="text-xs text-red-500">{error}</p>}
      </div>
    );
  },
);

Select.displayName = 'Select';
