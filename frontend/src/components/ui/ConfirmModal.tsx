import { Trash2, AlertTriangle, CheckCircle2, LucideIcon } from 'lucide-react';
import { Button } from './Button';
import { Modal } from './Modal';

interface ConfirmModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title: string;
  message: string;
  confirmLabel?: string;
  variant?: 'danger' | 'warning' | 'success';
  loading?: boolean;
}

const variantIcon: Record<string, LucideIcon> = {
  danger: Trash2,
  warning: AlertTriangle,
  success: CheckCircle2,
};

const variantIconColor: Record<string, string> = {
  danger: 'text-red-600',
  warning: 'text-amber-600',
  success: 'text-green-600',
};

export const ConfirmModal = ({
  isOpen,
  onClose,
  onConfirm,
  title,
  message,
  confirmLabel = 'Confirm',
  variant = 'danger',
  loading = false,
}: ConfirmModalProps) => (
  <Modal
    isOpen={isOpen}
    onClose={onClose}
    title={title}
    size="sm"
    footer={
      <>
        <Button variant="ghost" onClick={onClose} disabled={loading}>
          Cancel
        </Button>
        <Button variant={variant === 'success' ? 'success' : 'danger'} onClick={onConfirm} loading={loading}>
          {confirmLabel}
        </Button>
      </>
    }
  >
    <div className="flex gap-4 items-start">
      <div className={`w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0
        ${variant === 'danger' ? 'bg-red-100' : variant === 'warning' ? 'bg-amber-100' : 'bg-green-100'}`}>
        {(() => {
          const Icon = variantIcon[variant];
          return <Icon size={18} className={variantIconColor[variant]} />;
        })()}
      </div>
      <p className="text-sm text-ink leading-relaxed pt-2">{message}</p>
    </div>
  </Modal>
);
