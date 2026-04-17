import { Navigate } from 'react-router-dom';
import { useAppSelector } from '../../store';
import { UserRole } from '../../types';
import { AdminDashboard } from './admin/AdminDashboard';
import { ProviderDashboard } from './agent/ProviderDashboard';

export const DashboardPage = () => {
  const user = useAppSelector((s) => s.auth.user);

  if (user?.role === UserRole.BUYER) return <Navigate to="/" replace />;
  if (user?.role === UserRole.ADMIN) return <AdminDashboard />;
  return <ProviderDashboard />;
};
