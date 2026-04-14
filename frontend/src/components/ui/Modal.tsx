import { ReactNode, useEffect } from 'react';
import { X } from 'lucide-react';

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  children: ReactNode;
  footer?: ReactNode;
  size?: 'sm' | 'md' | 'lg';
}

const sizeClasses = {
  sm: 'max-w-md',
  md: 'max-w-2xl',
  lg: 'max-w-4xl',
};

export const Modal = ({ isOpen, onClose, title, children, footer, size = 'md' }: ModalProps) => {
  useEffect(() => {
    if (isOpen) document.body.style.overflow = 'hidden';
    else document.body.style.overflow = '';
    return () => { document.body.style.overflow = ''; };
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-end sm:items-center justify-center sm:p-4 bg-navy/60 animate-[fadeIn_.2s_ease]"
      onClick={onClose}
    >
      <div
        className={`bg-white sm:rounded-2xl rounded-t-2xl w-full ${sizeClasses[size]} max-h-[92vh] sm:max-h-[90vh] flex flex-col shadow-xl animate-[slideUp_.25s_ease]`}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between px-4 sm:px-6 py-4 border-b border-border flex-shrink-0">
          <h2 className="font-display text-lg sm:text-xl text-navy">{title}</h2>
          <button onClick={onClose} className="text-muted hover:text-ink transition-colors ml-4">
            <X size={20} />
          </button>
        </div>
        <div className="flex-1 overflow-y-auto p-4 sm:p-6">{children}</div>
        {footer && (
          <div className="px-4 sm:px-6 py-4 border-t border-border flex flex-wrap justify-end gap-2 sm:gap-3 flex-shrink-0">{footer}</div>
        )}
      </div>
    </div>
  );
};
