import { Navigate, Outlet } from 'react-router-dom';
import { useAppSelector } from '../../store';
import { UserRole } from '../../types';

interface ProtectedRouteProps {
  allowedRoles?: UserRole[];
}

export const ProtectedRoute = ({ allowedRoles }: ProtectedRouteProps) => {
  const { user, accessToken } = useAppSelector((s) => s.auth);

  if (!accessToken) return <Navigate to="/login" replace />;
  if (!user) return (
    <div className="min-h-screen flex items-center justify-center bg-cream">
      <div className="w-8 h-8 border-4 border-teal border-t-transparent rounded-full animate-spin" />
    </div>
  );

  if (allowedRoles && !allowedRoles.includes(user.role)) {
    return <Navigate to="/dashboard" replace />;
  }

  return <Outlet />;
};
