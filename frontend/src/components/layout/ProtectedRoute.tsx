import { Navigate, Outlet } from 'react-router-dom';
import { useAppSelector } from '../../store';
import { UserRole } from '../../types';

interface ProtectedRouteProps {
  allowedRoles?: UserRole[];
}

export const ProtectedRoute = ({ allowedRoles }: ProtectedRouteProps) => {
  const { user, accessToken } = useAppSelector((s) => s.auth);

  if (!accessToken) return <Navigate to="/login" replace />;
  if (!user) return null; // still loading

  if (allowedRoles && !allowedRoles.includes(user.role)) {
    return <Navigate to="/dashboard" replace />;
  }

  return <Outlet />;
};
