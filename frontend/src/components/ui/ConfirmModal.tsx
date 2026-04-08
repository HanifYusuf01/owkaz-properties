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

const variantIcon: Record<string, string> = {
  danger: '🗑️',
  warning: '⚠️',
  success: '✓',
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
      <div className={`w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0 text-lg
        ${variant === 'danger' ? 'bg-red-100' : variant === 'warning' ? 'bg-amber-100' : 'bg-green-100'}`}>
        {variantIcon[variant]}
      </div>
      <p className="text-sm text-ink leading-relaxed pt-2">{message}</p>
    </div>
  </Modal>
);
