import { useAppSelector } from '../../store';
import { UserRole } from '../../types';
import { AdminDashboard } from './admin/AdminDashboard';
import { ProviderDashboard } from './agent/ProviderDashboard';
import { BuyerDashboard } from './buyer/BuyerDashboard';

export const DashboardPage = () => {
  const user = useAppSelector((s) => s.auth.user);

  if (user?.role === UserRole.ADMIN) return <AdminDashboard />;
  if (user?.role === UserRole.BUYER) return <BuyerDashboard />;
  return <ProviderDashboard />;
};
