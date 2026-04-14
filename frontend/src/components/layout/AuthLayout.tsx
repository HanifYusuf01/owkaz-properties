import { Link, Outlet } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';

export const AuthLayout = () => {
  return (
    <div className="min-h-screen flex flex-col">
      {/* Minimal auth navbar */}
      <nav className="sticky top-0 z-50 bg-surface border-b border-border">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-14">
            {/* Logo */}
            <Link to="/" className="flex items-center gap-2.5 flex-shrink-0">
              <div className="w-7 h-7 rounded-lg bg-navy flex items-center justify-center text-gold font-display font-bold text-xs">
                O
              </div>
              <span className="font-display text-lg text-navy">
                Owk<em className="text-teal not-italic">az</em>
              </span>
            </Link>

            {/* Back to home */}
            <Link
              to="/"
              className="inline-flex items-center gap-1.5 text-sm text-muted hover:text-navy transition-colors font-medium"
            >
              <ArrowLeft size={15} />
              Back to Home
            </Link>
          </div>
        </div>
      </nav>

      {/* Auth page content */}
      <div className="flex-1">
        <Outlet />
      </div>
    </div>
  );
};
