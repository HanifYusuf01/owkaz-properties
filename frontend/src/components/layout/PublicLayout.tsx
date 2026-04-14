import { useState } from 'react';
import { Link, NavLink, Outlet, useNavigate } from 'react-router-dom';
import { Menu, X } from 'lucide-react';

export const PublicLayout = () => {
  const [mobileOpen, setMobileOpen] = useState(false);
  const navigate = useNavigate();

  const navLinks = [
    { label: 'Home', path: '/' },
    { label: 'Properties', path: '/properties' },
    { label: 'Projects', path: '/projects' },
    { label: 'Sold Projects', path: '/sold-properties' },
    { label: 'About', path: '/about' },
    { label: 'Contact', path: '/contact' },
  ];

  return (
    <div className="min-h-screen flex flex-col">
      {/* Nav */}
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

      {/* Page content */}
      <main className="flex-1">
        <Outlet />
      </main>

      {/* Footer */}
      <footer className="bg-navy text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-14">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-10">
            {/* Brand */}
            <div>
              <div className="flex items-center gap-2.5 mb-4">
                <div className="w-8 h-8 rounded-lg bg-gold/20 border border-gold/30 flex items-center justify-center text-gold font-display font-bold text-sm">
                  O
                </div>
                <span className="font-display text-xl text-white">
                  Owk<em className="text-gold not-italic">az</em>
                </span>
              </div>
              <p className="text-sm text-white/50 leading-relaxed max-w-[220px]">
                Nigeria's most trusted property platform connecting buyers, sellers, and agents across the country.
              </p>
            </div>

            {/* Properties */}
            <div>
              <div className="text-[10px] font-bold uppercase tracking-widest text-white/30 mb-4">Properties</div>
              <div className="flex flex-col gap-2.5">
                <Link to="/properties" className="text-sm text-white/50 hover:text-white transition-colors">All Listings</Link>
                <Link to="/sold-properties" className="text-sm text-white/50 hover:text-white transition-colors">Sold Projects</Link>
                <Link to="/properties" className="text-sm text-white/50 hover:text-white transition-colors">For Sale</Link>
                <Link to="/properties" className="text-sm text-white/50 hover:text-white transition-colors">For Rent</Link>
                <Link to="/properties" className="text-sm text-white/50 hover:text-white transition-colors">Land & Plots</Link>
              </div>
            </div>

            {/* Company */}
            <div>
              <div className="text-[10px] font-bold uppercase tracking-widest text-white/30 mb-4">Company</div>
              <div className="flex flex-col gap-2.5">
                {['About Us', 'Our Agents', 'Contact', 'Careers'].map((l) => (
                  <span key={l} className="text-sm text-white/50 hover:text-white transition-colors cursor-pointer">{l}</span>
                ))}
              </div>
            </div>

            {/* Support */}
            <div>
              <div className="text-[10px] font-bold uppercase tracking-widest text-white/30 mb-4">Support</div>
              <div className="flex flex-col gap-2.5">
                {['Help Centre', 'List Property', 'Property Guide', 'Market Reports'].map((l) => (
                  <span key={l} className="text-sm text-white/50 hover:text-white transition-colors cursor-pointer">{l}</span>
                ))}
              </div>
            </div>
          </div>

          {/* Payment icons */}
          <div className="mt-10 pt-8 border-t border-white/10">
            <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3">
              <span className="text-[10px] uppercase tracking-widest text-white/30 font-semibold whitespace-nowrap">We Accept</span>
              <div className="flex flex-wrap gap-2">
                {[
                  { symbol: '₿', label: 'Bitcoin' },
                  { symbol: 'Ξ', label: 'Ethereum' },
                  { symbol: '₮', label: 'USDT' },
                  { symbol: '◎', label: 'Solana' },
                  { symbol: '🏦', label: 'Bank Transfer' },
                  { symbol: '💳', label: 'Card' },
                ].map((p) => (
                  <span key={p.label} className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md bg-white/5 border border-white/10 text-[11px] text-white/50">
                    <span>{p.symbol}</span> {p.label}
                  </span>
                ))}
              </div>
            </div>
          </div>

          <div className="mt-6 pt-6 border-t border-white/10 flex flex-col sm:flex-row justify-between items-center gap-4">
            <span className="text-xs text-white/30">© 2025 Owkaz Property Limited. All rights reserved.</span>
            <div className="flex gap-6">
              {['Privacy Policy', 'Terms of Use', 'Cookie Policy'].map((l) => (
                <span key={l} className="text-xs text-white/40 hover:text-white/70 cursor-pointer transition-colors">{l}</span>
              ))}
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
};
