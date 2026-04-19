import { useState, useRef, useEffect } from 'react';
import { Link, NavLink, useNavigate } from 'react-router-dom';
import {
  X, Home, Search, Building2, Info, Phone,
  Bookmark, MessageSquare, User, LogOut, ChevronDown,
  PlusCircle, LayoutDashboard,
} from 'lucide-react';
import { useAppDispatch, useAppSelector } from '../../store';
import { logout } from '../../features/auth/authSlice';
import { UserRole } from '../../types';

const navLinks = [
  { label: 'Home', path: '/' },
  { label: 'Properties', path: '/properties' },
  { label: 'Projects', path: '/projects' },
  { label: 'About', path: '/about' },
  { label: 'Contact', path: '/contact' },
];

const buyerSidebarExplore = [
  { label: 'Home', path: '/', icon: <Home size={16} /> },
  { label: 'Browse Properties', path: '/properties', icon: <Search size={16} /> },
  { label: 'Off-Plan Projects', path: '/projects', icon: <Building2 size={16} /> },
  { label: 'About Us', path: '/about', icon: <Info size={16} /> },
  { label: 'Contact Us', path: '/contact', icon: <Phone size={16} /> },
];

const buyerSidebarAccount = [
  { label: 'Saved Properties', path: '/saved', icon: <Bookmark size={16} /> },
  { label: 'My Inquiries', path: '/my-inquiries', icon: <MessageSquare size={16} /> },
  { label: 'Profile Settings', path: '/profile', icon: <User size={16} /> },
];

export const PublicNavbar = () => {
  const navigate = useNavigate();
  const dispatch = useAppDispatch();
  const user = useAppSelector((s) => s.auth.user);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const isBuyer = user?.role === UserRole.BUYER;
  const isStaff = user && !isBuyer;

  // Open sidebar automatically only on the buyer's first visit after login
  const [sidebarOpen, setSidebarOpen] = useState(() => {
    if (user?.role !== UserRole.BUYER) return false;
    const key = `owkaz_sidebar_welcomed_${user.id}`;
    if (localStorage.getItem(key)) return false;
    localStorage.setItem(key, '1');
    return true;
  });
  const [dropdownOpen, setDropdownOpen] = useState(false);

  // Lock body scroll when buyer sidebar is open
  useEffect(() => {
    if (sidebarOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => { document.body.style.overflow = ''; };
  }, [sidebarOpen]);

  // Close staff dropdown on outside click
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  const handleSignOut = () => {
    dispatch(logout());
    setSidebarOpen(false);
    setDropdownOpen(false);
    navigate('/');
  };

  return (
    <>
      {/* ── BUYER SIDEBAR ── */}
      {isBuyer && (
        <>
          {/* Overlay */}
          {sidebarOpen && (
            <div
              className="fixed inset-0 bg-navy/50 backdrop-blur-sm z-40"
              onClick={() => setSidebarOpen(false)}
            />
          )}

          {/* Sidebar panel */}
          <aside
            className={`fixed left-0 top-0 h-screen w-64 bg-navy flex flex-col z-50 transition-transform duration-300 ${
              sidebarOpen ? 'translate-x-0 shadow-2xl' : '-translate-x-full'
            }`}
          >
            {/* Header */}
            <div className="flex items-center justify-between px-5 py-5 border-b border-white/10 flex-shrink-0">
              <div
                className="flex items-center gap-2 cursor-pointer"
                onClick={() => { navigate('/'); setSidebarOpen(false); }}
              >
                <div className="w-8 h-8 rounded-lg bg-gold/20 border border-gold/30 flex items-center justify-center text-gold font-display font-bold text-sm">O</div>
                <span className="font-display text-lg text-white">Owk<em className="text-gold not-italic">az</em></span>
              </div>
              <button
                onClick={() => setSidebarOpen(false)}
                className="w-8 h-8 rounded-full bg-white/10 flex items-center justify-center text-white/60 hover:text-white hover:bg-white/20 transition-colors"
              >
                <X size={16} />
              </button>
            </div>

            {/* Hello banner */}
            <div className="mx-4 mt-4 mb-2 bg-gradient-to-br from-teal/25 to-gold/15 border border-teal/30 rounded-xl p-4">
              <div className="text-white/50 text-xs mb-1">Hello there,</div>
              <div className="text-white font-semibold text-sm">{user?.name}</div>
              <span className="inline-block mt-1.5 px-2 py-0.5 rounded-full bg-teal text-white text-[9px] font-bold uppercase tracking-widest">
                Buyer
              </span>
            </div>

            {/* Navigation */}
            <nav className="flex-1 overflow-y-auto py-2">
              <div className="px-5 py-2 text-[9px] font-bold uppercase tracking-widest text-white/25">Explore</div>
              {buyerSidebarExplore.map((item) => (
                <NavLink
                  key={item.path}
                  to={item.path}
                  end={item.path === '/'}
                  onClick={() => setSidebarOpen(false)}
                  className={({ isActive }) =>
                    `flex items-center gap-3 px-5 py-2.5 text-sm border-l-[3px] transition-all ${
                      isActive
                        ? 'text-white border-teal bg-white/6 font-semibold'
                        : 'text-white/50 border-transparent hover:text-white/80 hover:bg-white/5'
                    }`
                  }
                >
                  {item.icon}
                  {item.label}
                </NavLink>
              ))}

              <div className="h-px bg-white/8 mx-5 my-2" />

              <div className="px-5 py-2 text-[9px] font-bold uppercase tracking-widest text-white/25">My Account</div>
              {buyerSidebarAccount.map((item) => (
                <NavLink
                  key={item.path}
                  to={item.path}
                  onClick={() => setSidebarOpen(false)}
                  className={({ isActive }) =>
                    `flex items-center gap-3 px-5 py-2.5 text-sm border-l-[3px] transition-all ${
                      isActive
                        ? 'text-white border-teal bg-white/6 font-semibold'
                        : 'text-white/50 border-transparent hover:text-white/80 hover:bg-white/5'
                    }`
                  }
                >
                  {item.icon}
                  {item.label}
                </NavLink>
              ))}
            </nav>

            {/* Footer */}
            <div className="px-5 py-4 border-t border-white/10 flex items-center gap-3 flex-shrink-0">
              <div className="w-9 h-9 rounded-full bg-teal flex items-center justify-center text-white text-sm font-bold flex-shrink-0">
                {user?.name?.charAt(0).toUpperCase()}
              </div>
              <div className="flex-1 min-w-0">
                <div className="text-white text-xs font-semibold truncate">{user?.name}</div>
                <div className="text-white/40 text-[10px] truncate">{user?.email}</div>
              </div>
              <button
                onClick={handleSignOut}
                className="text-white/30 hover:text-white/70 transition-colors flex-shrink-0"
                title="Sign out"
              >
                <LogOut size={15} />
              </button>
            </div>
          </aside>
        </>
      )}

      {/* ── TOP BAR ── */}
      <nav className="sticky top-0 z-30 bg-surface border-b border-border">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16 gap-3">

            {/* Left: hamburger (buyer only) + logo */}
            <div className="flex items-center gap-3">
              {isBuyer && (
                <button
                  onClick={() => setSidebarOpen(true)}
                  className="w-9 h-9 flex flex-col items-center justify-center gap-1.5 rounded-lg bg-navy hover:bg-navy-mid transition-colors flex-shrink-0"
                >
                  <span className="w-4 h-0.5 bg-white rounded-full" />
                  <span className="w-4 h-0.5 bg-white rounded-full" />
                  <span className="w-4 h-0.5 bg-white rounded-full" />
                </button>
              )}
              <Link to="/" className="flex items-center gap-2.5 flex-shrink-0">
                <div className="w-8 h-8 rounded-lg bg-navy flex items-center justify-center text-gold font-display font-bold text-sm">O</div>
                <span className="font-display text-xl text-navy hidden sm:block">
                  Owk<em className="text-teal not-italic">az</em>
                </span>
              </Link>
            </div>

            {/* Center nav links */}
            <div className="hidden md:flex items-center gap-1 flex-1 justify-center">
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

            {/* Right: actions */}
            <div className="flex items-center gap-2 flex-shrink-0">
              {!user && (
                /* Guest */
                <button
                  onClick={() => navigate('/login')}
                  className="px-4 py-2 rounded-lg bg-navy text-white text-sm font-semibold hover:bg-navy-mid transition-colors"
                >
                  Sign In
                </button>
              )}

              {isBuyer && (
                /* Buyer: Hello chip + Sign Out */
                <>
                  <div className="hidden sm:flex items-center gap-2 px-3 py-1.5 rounded-full bg-teal/10 border border-teal/20">
                    <div className="w-6 h-6 rounded-full bg-teal flex items-center justify-center text-white text-[10px] font-bold flex-shrink-0">
                      {user.name?.slice(0, 2).toUpperCase()}
                    </div>
                    <span className="text-xs font-semibold text-navy">
                      Hello, {user.name?.split(' ')[0]}
                    </span>
                  </div>
                  <button
                    onClick={handleSignOut}
                    className="px-3 py-2 rounded-lg bg-navy text-white text-xs font-semibold hover:bg-navy-mid transition-colors"
                  >
                    Sign Out
                  </button>
                </>
              )}

              {isStaff && (
                /* Agent / Owner / Admin: dropdown */
                <>
                  {user && (
                    <button
                      onClick={() => navigate('/list-property')}
                      className="hidden sm:block px-4 py-2 rounded-lg border border-border text-sm font-semibold text-navy hover:border-navy transition-colors"
                    >
                      List Property
                    </button>
                  )}
                  <div className="relative" ref={dropdownRef}>
                    <button
                      onClick={() => setDropdownOpen(!dropdownOpen)}
                      className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-navy/5 border border-border hover:bg-navy/10 transition-colors"
                    >
                      <div className="w-7 h-7 rounded-full bg-teal flex items-center justify-center text-white text-xs font-bold flex-shrink-0">
                        {user?.name?.charAt(0).toUpperCase()}
                      </div>
                      <span className="text-sm font-semibold text-navy max-w-[90px] truncate hidden sm:block">
                        {user?.name?.split(' ')[0]}
                      </span>
                      <ChevronDown size={13} className={`text-muted transition-transform hidden sm:block ${dropdownOpen ? 'rotate-180' : ''}`} />
                    </button>

                    {dropdownOpen && (
                      <div className="absolute right-0 top-full mt-2 w-52 bg-white border border-border rounded-xl shadow-lg overflow-hidden z-50">
                        <div className="px-4 py-3 bg-cream border-b border-border">
                          <div className="text-xs text-muted">Signed in as</div>
                          <div className="font-semibold text-sm text-navy truncate">{user?.name}</div>
                          <span className="inline-block mt-1 px-2 py-0.5 rounded-full bg-teal/10 text-teal text-[10px] font-bold uppercase tracking-wide">
                            {user?.role}
                          </span>
                        </div>
                        <div className="py-1">
                          <button
                            onClick={() => { navigate('/dashboard'); setDropdownOpen(false); }}
                            className="flex items-center gap-2.5 w-full px-4 py-2.5 text-sm text-navy hover:bg-cream transition-colors"
                          >
                            <LayoutDashboard size={15} className="text-muted" /> My Dashboard
                          </button>
                          <button
                            onClick={() => { navigate('/dashboard/submit'); setDropdownOpen(false); }}
                            className="flex items-center gap-2.5 w-full px-4 py-2.5 text-sm text-navy hover:bg-cream transition-colors"
                          >
                            <PlusCircle size={15} className="text-muted" /> List a Property
                          </button>
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
                </>
              )}
            </div>
          </div>
        </div>
      </nav>
    </>
  );
};
