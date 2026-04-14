import { useState } from 'react';
import { Link, NavLink, useNavigate } from 'react-router-dom';
import { Menu, X } from 'lucide-react';

const navLinks = [
  { label: 'Home', path: '/' },
  { label: 'Properties', path: '/properties' },
  { label: 'Projects', path: '/projects' },
  { label: 'Sold Projects', path: '/sold-properties' },
  { label: 'About', path: '/about' },
  { label: 'Contact', path: '/contact' },
];

export const PublicNavbar = () => {
  const [mobileOpen, setMobileOpen] = useState(false);
  const navigate = useNavigate();

  return (
    <nav className="sticky top-0 z-50 bg-surface border-b border-border">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-2.5 flex-shrink-0">
            <div className="w-8 h-8 rounded-lg bg-navy flex items-center justify-center text-gold font-display font-bold text-sm">
              O
            </div>
            <span className="font-display text-xl text-navy">
              Owk<em className="text-teal not-italic">az</em>
            </span>
          </Link>

          {/* Desktop links */}
          <div className="hidden md:flex items-center gap-6">
            {navLinks.map((l) => (
              <NavLink
                key={l.path}
                to={l.path}
                end={l.path === '/'}
                className={({ isActive }) =>
                  `text-sm font-medium transition-all px-3 py-1.5 rounded-lg ${
                    isActive
                      ? 'bg-cream text-navy border border-border font-semibold'
                      : 'text-muted hover:text-ink'
                  }`
                }
              >
                {l.label}
              </NavLink>
            ))}
          </div>

          {/* Desktop actions */}
          <div className="hidden md:flex items-center gap-3">
            <button
              onClick={() => navigate('/login')}
              className="px-4 py-2 rounded-lg border border-border text-sm font-semibold text-navy hover:border-navy transition-colors"
            >
              List Property
            </button>
            <button
              onClick={() => navigate('/login')}
              className="px-4 py-2 rounded-lg bg-navy text-white text-sm font-semibold hover:bg-navy-mid transition-colors"
            >
              Sign In
            </button>
          </div>

          {/* Mobile menu button */}
          <button
            className="md:hidden p-2 text-muted hover:text-ink transition-colors"
            onClick={() => setMobileOpen(!mobileOpen)}
          >
            {mobileOpen ? <X size={22} /> : <Menu size={22} />}
          </button>
        </div>
      </div>

      {/* Mobile menu */}
      {mobileOpen && (
        <div className="md:hidden border-t border-border bg-surface px-4 py-4 flex flex-col gap-1">
          {navLinks.map((l) => (
            <NavLink
              key={l.path}
              to={l.path}
              end={l.path === '/'}
              onClick={() => setMobileOpen(false)}
              className={({ isActive }) =>
                `px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${isActive ? 'bg-cream text-teal' : 'text-muted hover:text-ink hover:bg-surface'}`
              }
            >
              {l.label}
            </NavLink>
          ))}
          <div className="mt-3 pt-3 border-t border-border flex flex-col gap-2">
            <button
              onClick={() => { navigate('/login'); setMobileOpen(false); }}
              className="w-full px-4 py-2.5 rounded-lg border border-border text-sm font-semibold text-navy text-center"
            >
              List Property
            </button>
            <button
              onClick={() => { navigate('/login'); setMobileOpen(false); }}
              className="w-full px-4 py-2.5 rounded-lg bg-navy text-white text-sm font-semibold text-center"
            >
              Sign In
            </button>
          </div>
        </div>
      )}
    </nav>
  );
};
