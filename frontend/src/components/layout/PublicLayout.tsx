import { Link, Outlet } from 'react-router-dom';
import { Bitcoin, Gem, CircleDollarSign, Zap, Landmark, CreditCard } from 'lucide-react';
import { PublicNavbar } from './PublicNavbar';

export const PublicLayout = () => {
  return (
    <div className="min-h-screen flex flex-col">
      <PublicNavbar />

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
                {([
                  { icon: <Bitcoin size={12} />, label: 'Bitcoin' },
                  { icon: <Gem size={12} />, label: 'Ethereum' },
                  { icon: <CircleDollarSign size={12} />, label: 'USDT' },
                  { icon: <Zap size={12} />, label: 'Solana' },
                  { icon: <Landmark size={12} />, label: 'Bank Transfer' },
                  { icon: <CreditCard size={12} />, label: 'Card' },
                ] as const).map((p) => (
                  <span key={p.label} className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-white/5 border border-white/10 text-[11px] text-white/50">
                    {p.icon} {p.label}
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
