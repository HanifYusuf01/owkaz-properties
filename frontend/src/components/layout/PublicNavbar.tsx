import { useState, useRef, useEffect } from 'react';
import { Link, NavLink, useNavigate } from 'react-router-dom';
import { Menu, X, Bookmark, MessageSquare, User, LogOut, ChevronDown, Home, PlusCircle } from 'lucide-react';
import { useAppDispatch, useAppSelector } from '../../store';
import { logout } from '../../features/auth/authSlice';
import { UserRole } from '../../types';

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
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const navigate = useNavigate();
  const dispatch = useAppDispatch();
  const user = useAppSelector((s) => s.auth.user);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const isAgent = user?.role === UserRole.AGENT || user?.role === UserRole.OWNER || user?.role === UserRole.ADMIN;
  const isBuyer = user?.role === UserRole.BUYER;

  // Close dropdown on outside click
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  const handleListProperty = () => {
    navigate('/list-property');
  };

  const handleSignOut = () => {
    dispatch(logout());
    setDropdownOpen(false);
    navigate('/');
  };

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

          {/* Desktop nav links */}
          <div className="hidden md:flex items-center gap-1">
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
            {user && (
              <button
                onClick={handleListProperty}
                className="px-4 py-2 rounded-lg border border-border text-sm font-semibold text-navy hover:border-navy transition-colors"
              >
                List Property
              </button>
            )}

            {user ? (
              /* Logged-in user dropdown */
              <div className="relative" ref={dropdownRef}>
                <button
                  onClick={() => setDropdownOpen(!dropdownOpen)}
                  className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-navy/5 border border-border hover:bg-navy/10 transition-colors"
                >
                  <div className="w-7 h-7 rounded-full bg-teal flex items-center justify-center text-white text-xs font-bold flex-shrink-0">
                    {user.name?.charAt(0).toUpperCase()}
                  </div>
                  <span className="text-sm font-semibold text-navy max-w-[100px] truncate">
                    {user.name?.split(' ')[0]}
                  </span>
                  <ChevronDown size={14} className={`text-muted transition-transform ${dropdownOpen ? 'rotate-180' : ''}`} />
                </button>

                {dropdownOpen && (
                  <div className="absolute right-0 top-full mt-2 w-52 bg-white border border-border rounded-xl shadow-lg overflow-hidden z-50">
                    {/* Header */}
                    <div className="px-4 py-3 bg-cream border-b border-border">
                      <div className="text-xs text-muted">Signed in as</div>
                      <div className="font-semibold text-sm text-navy truncate">{user.name}</div>
                      <span className="inline-block mt-1 px-2 py-0.5 rounded-full bg-teal/10 text-teal text-[10px] font-bold uppercase tracking-wide">
                        {user.role}
                      </span>
                    </div>

                    <div className="py-1">
                      {/* Buyer pages */}
                      {isBuyer && (
                        <>
                          <button
                            onClick={() => { navigate('/saved'); setDropdownOpen(false); }}
                            className="flex items-center gap-2.5 w-full px-4 py-2.5 text-sm text-navy hover:bg-cream transition-colors"
                          >
                            <Bookmark size={15} className="text-muted" /> Saved Properties
                          </button>
                          <button
                            onClick={() => { navigate('/my-inquiries'); setDropdownOpen(false); }}
                            className="flex items-center gap-2.5 w-full px-4 py-2.5 text-sm text-navy hover:bg-cream transition-colors"
                          >
                            <MessageSquare size={15} className="text-muted" /> My Inquiries
                          </button>
                        </>
                      )}

                      {/* Agent/Owner/Admin pages */}
                      {isAgent && (
                        <>
                          <button
                            onClick={() => { navigate('/dashboard/submit'); setDropdownOpen(false); }}
                            className="flex items-center gap-2.5 w-full px-4 py-2.5 text-sm text-navy hover:bg-cream transition-colors"
                          >
                            <PlusCircle size={15} className="text-muted" /> List a Property
                          </button>
                          <button
                            onClick={() => { navigate('/dashboard'); setDropdownOpen(false); }}
                            className="flex items-center gap-2.5 w-full px-4 py-2.5 text-sm text-navy hover:bg-cream transition-colors"
                          >
                            <Home size={15} className="text-muted" /> My Dashboard
                          </button>
                        </>
                      )}

                      <button
                        onClick={() => { navigate('/dashboard/profile'); setDropdownOpen(false); }}
                        className="flex items-center gap-2.5 w-full px-4 py-2.5 text-sm text-navy hover:bg-cream transition-colors"
                      >
                        <User size={15} className="text-muted" /> Profile Settings
                      </button>

                      <div className="h-px bg-border mx-2 my-1" />

                      <button
                        onClick={handleSignOut}
                        className="flex items-center gap-2.5 w-full px-4 py-2.5 text-sm text-red-600 hover:bg-red-50 transition-colors"
                      >
                        <LogOut size={15} /> Sign Out
                      </button>
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <button
                onClick={() => navigate('/login')}
                className="px-4 py-2 rounded-lg bg-navy text-white text-sm font-semibold hover:bg-navy-mid transition-colors"
              >
                Sign In
              </button>
            )}
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
          {/* User greeting */}
          {user && (
            <div className="flex items-center gap-3 px-3 py-3 mb-2 bg-cream rounded-xl border border-border">
              <div className="w-9 h-9 rounded-full bg-teal flex items-center justify-center text-white text-sm font-bold flex-shrink-0">
                {user.name?.charAt(0).toUpperCase()}
              </div>
              <div>
                <div className="text-sm font-semibold text-navy">{user.name}</div>
                <span className="inline-block px-2 py-0.5 rounded-full bg-teal/10 text-teal text-[10px] font-bold uppercase tracking-wide">
                  {user.role}
                </span>
              </div>
            </div>
          )}

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
            {user ? (
              <>
                {isBuyer && (
                  <>
                    <button
                      onClick={() => { navigate('/saved'); setMobileOpen(false); }}
                      className="flex items-center gap-2 w-full px-3 py-2.5 rounded-lg text-sm font-medium text-navy hover:bg-cream text-left"
                    >
                      <Bookmark size={15} /> Saved Properties
                    </button>
                    <button
                      onClick={() => { navigate('/my-inquiries'); setMobileOpen(false); }}
                      className="flex items-center gap-2 w-full px-3 py-2.5 rounded-lg text-sm font-medium text-navy hover:bg-cream text-left"
                    >
                      <MessageSquare size={15} /> My Inquiries
                    </button>
                  </>
                )}
                {isAgent && (
                  <button
                    onClick={() => { navigate('/dashboard'); setMobileOpen(false); }}
                    className="flex items-center gap-2 w-full px-3 py-2.5 rounded-lg text-sm font-medium text-navy hover:bg-cream text-left"
                  >
                    <Home size={15} /> My Dashboard
                  </button>
                )}
                <button
                  onClick={() => { handleListProperty(); setMobileOpen(false); }}
                  className="w-full px-4 py-2.5 rounded-lg border border-border text-sm font-semibold text-navy text-center"
                >
                  List Property
                </button>
                <button
                  onClick={() => { handleSignOut(); setMobileOpen(false); }}
                  className="w-full px-4 py-2.5 rounded-lg bg-red-50 border border-red-200 text-sm font-semibold text-red-600 text-center"
                >
                  Sign Out
                </button>
              </>
            ) : (
              <button
                onClick={() => { navigate('/login'); setMobileOpen(false); }}
                className="w-full px-4 py-2.5 rounded-lg bg-navy text-white text-sm font-semibold text-center"
              >
                Sign In
              </button>
            )}
          </div>
        </div>
      )}
    </nav>
  );
};
