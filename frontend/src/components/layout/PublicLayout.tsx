import { Link, Outlet } from 'react-router-dom';
import {
  Bitcoin, Gem, CircleDollarSign, Zap, Landmark, CreditCard,
  MapPin, Phone, Mail, ExternalLink, MessageCircle,
} from 'lucide-react';
import { PublicNavbar } from './PublicNavbar';
import { FooterClock } from './FooterClock';
import { useGetContentQuery } from '../../features/content/contentApi';
import { PAGE_CONTENT } from '../../features/content/pageContentConfig';
import { useAppSelector } from '../../store';
import { UserRole } from '../../types';

const SOCIAL_PLATFORMS = [
  { key: 'facebookUrl', label: 'Facebook' },
  { key: 'instagramUrl', label: 'Instagram' },
  { key: 'twitterUrl', label: 'X (Twitter)' },
  { key: 'linkedinUrl', label: 'LinkedIn' },
] as const;

export const PublicLayout = () => {
  const { data: footerContent } = useGetContentQuery('footer');
  const social = { ...PAGE_CONTENT.footer.defaults, ...footerContent };
  const whatsappUrl = social.whatsappNumber ? `https://wa.me/${social.whatsappNumber.replace(/\D/g, '')}` : '';
  const isBuyer = useAppSelector((s) => s.auth.user?.role === UserRole.BUYER);

  return (
    <div className="min-h-screen flex flex-col">
      <PublicNavbar />

      {/* Buyers get a permanently docked sidebar on desktop — shift the rest of the page over for it */}
      <div className={`flex-1 flex flex-col ${isBuyer ? 'md:ml-64' : ''}`}>
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
                <img src="/OWKAZ LOGO.png" alt="Owkaz" className="h-12" />
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

            {/* Contact */}
            <div>
              <div className="text-[10px] font-bold uppercase tracking-widest text-white/30 mb-4">Contact Us</div>
              <div className="flex flex-col gap-3">
                <div className="flex items-start gap-2.5 text-sm text-white/50">
                  <MapPin size={15} className="mt-0.5 flex-shrink-0 text-white/30" />
                  <span>Plot 12B, Lobito Crescent, Wuse II, Abuja FCT</span>
                </div>
                <a href="tel:+2348000692901" className="flex items-center gap-2.5 text-sm text-white/50 hover:text-white transition-colors">
                  <Phone size={15} className="flex-shrink-0 text-white/30" />
                  +234 (0) 800 OWKAZ 01
                </a>
                <a href="mailto:hello@owkaz.ng" className="flex items-center gap-2.5 text-sm text-white/50 hover:text-white transition-colors">
                  <Mail size={15} className="flex-shrink-0 text-white/30" />
                  hello@owkaz.ng
                </a>
              </div>

              {(whatsappUrl || SOCIAL_PLATFORMS.some((p) => social[p.key])) && (
                <div className="mt-4">
                  <div className="text-[10px] font-bold uppercase tracking-widest text-white/30 mb-2.5">Follow Us</div>
                  <div className="flex flex-wrap gap-2">
                    {whatsappUrl && (
                      <a
                        href={whatsappUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-white/5 border border-white/10 text-[11px] text-white/60 hover:text-white hover:border-white/20 transition-colors"
                      >
                        <MessageCircle size={12} /> WhatsApp
                      </a>
                    )}
                    {SOCIAL_PLATFORMS.filter((p) => social[p.key]).map((p) => (
                      <a
                        key={p.key}
                        href={social[p.key]}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-white/5 border border-white/10 text-[11px] text-white/60 hover:text-white hover:border-white/20 transition-colors"
                      >
                        <ExternalLink size={12} /> {p.label}
                      </a>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Support */}
            <div>
              <div className="text-[10px] font-bold uppercase tracking-widest text-white/30 mb-4">Support</div>
              <div className="flex flex-col gap-2.5">
                <Link to="/contact" className="text-sm text-white/50 hover:text-white transition-colors">Help Centre</Link>
                <Link to="/list-property" className="text-sm text-white/50 hover:text-white transition-colors">List Property</Link>
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

          {/* Date/time */}
          <div className="mt-6 pt-6 border-t border-white/10">
            <FooterClock />
          </div>

          <div className="mt-6 pt-6 border-t border-white/10 flex flex-col sm:flex-row justify-between items-center gap-4">
            <span className="text-xs text-white/30">© {new Date().getFullYear()} Owkaz Property Limited. All rights reserved.</span>
            <div className="flex gap-6">
              <Link to="/privacy-policy" className="text-xs text-white/40 hover:text-white/70 transition-colors">Privacy Policy</Link>
              <Link to="/terms-of-use" className="text-xs text-white/40 hover:text-white/70 transition-colors">Terms of Use</Link>
              <Link to="/cookie-policy" className="text-xs text-white/40 hover:text-white/70 transition-colors">Cookie Policy</Link>
            </div>
          </div>
        </div>
      </footer>
      </div>
    </div>
  );
};
