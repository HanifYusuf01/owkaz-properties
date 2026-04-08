import { PropertyStatus, UserRole, InquiryStatus, UserStatus } from '../../types';

const statusStyles: Record<string, string> = {
  pending: 'bg-amber-100 text-amber-700',
  approved: 'bg-green-100 text-green-700',
  rejected: 'bg-red-100 text-red-700',
  sold: 'bg-blue-100 text-blue-700',
  new: 'bg-sky-100 text-sky-700',
  in_progress: 'bg-amber-100 text-amber-700',
  responded: 'bg-green-100 text-green-700',
  closed: 'bg-gray-100 text-gray-600',
  active: 'bg-green-100 text-green-700',
  suspended: 'bg-red-100 text-red-700',
  admin: 'bg-purple-100 text-purple-700',
  agent: 'bg-orange-100 text-orange-700',
  owner: 'bg-blue-100 text-blue-700',
  buyer: 'bg-teal-100 text-teal-700',
};

interface BadgeProps {
  status: string;
  className?: string;
}

export const Badge = ({ status, className = '' }: BadgeProps) => {
  const style = statusStyles[status] ?? 'bg-gray-100 text-gray-700';
  return (
    <span
      className={`inline-block px-2.5 py-0.5 rounded-full text-xs font-semibold uppercase tracking-wide ${style} ${className}`}
    >
      {status.replace(/_/g, ' ')}
    </span>
  );
};
