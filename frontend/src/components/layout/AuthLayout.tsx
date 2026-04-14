import { Outlet } from 'react-router-dom';
import { PublicNavbar } from './PublicNavbar';

export const AuthLayout = () => {
  return (
    <div className="min-h-screen flex flex-col">
      <PublicNavbar />
      <div className="flex-1">
        <Outlet />
      </div>
    </div>
  );
};
