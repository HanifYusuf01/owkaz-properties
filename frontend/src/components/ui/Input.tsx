import { InputHTMLAttributes, forwardRef } from 'react';

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
}

export const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ label, error, className = '', ...props }, ref) => {
    return (
      <div className="flex flex-col gap-1.5">
        {label && (
          <label className="text-xs font-semibold uppercase tracking-wide text-navy">
            {label}
          </label>
        )}
        <input
          ref={ref}
          {...props}
          className={`w-full px-3.5 py-2.5 border border-border rounded-lg text-sm text-ink bg-white placeholder-muted outline-none transition-colors focus:border-teal ${error ? 'border-red-400' : ''} ${className}`}
        />
        {error && <p className="text-xs text-red-500">{error}</p>}
      </div>
    );
  },
);

Input.displayName = 'Input';
