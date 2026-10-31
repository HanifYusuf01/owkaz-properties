import { useNavigate } from 'react-router-dom';
import { Search, ShieldCheck, Globe, Zap, Handshake, BarChart3, Star } from 'lucide-react';
import { useGetContentQuery } from '../../features/content/contentApi';
import { PAGE_CONTENT } from '../../features/content/pageContentConfig';
import { getImageUrl } from '../../utils/imageUrl';
import { MultilineText } from '../../components/ui/MultilineText';
import { Avatar } from '../../components/ui/Avatar';
import { delay } from '../../utils/motion';

const VALUES = [
  { icon: Search, title: 'Transparency', desc: 'Every listing is verified. Every agent is screened. No hidden fees, no misleading information, ever.' },
  { icon: ShieldCheck, title: 'Trust & Safety', desc: 'We work hard to protect both buyers and sellers. Our verification process reduces fraud significantly.' },
  { icon: Globe, title: 'Accessibility', desc: 'Whether you\'re in Abuja, Lagos, Kano, or in the diaspora, Owkaz works for you on any device.' },
  { icon: Zap, title: 'Innovation', desc: 'We continuously improve our platform with faster search, sharper filters, and better listing tools.' },
  { icon: Handshake, title: 'Community', desc: 'We support local agents and help small property owners compete with large developers.' },
  { icon: BarChart3, title: 'Data-Driven', desc: 'Market reports, price trends, and location insights to help you make the most informed decisions.' },
];

const TESTIMONIALS = [
  {
    text: '"As a developer, Owkaz has been instrumental in reaching the right buyers for our Abuja estate project. The leads are qualified and the platform is professional."',
    name: 'Femi Adegoke',
    role: 'Property Developer · Abuja',
  },
  {
    text: '"I found my rental apartment in VI within a week of searching on Owkaz. The listings were accurate and the agent was responsive. Highly recommend."',
    name: 'Nkiruka Okonkwo',
    role: 'Renter · Lagos',
  },
  {
    text: '"Owkaz is the most straightforward Nigerian property site I\'ve used. Clean interface, real listings, and no fake prices. A cut above the rest."',
    name: 'Babatunde Lawal',
    role: 'Land Investor · Ibadan',
  },
];

export const AboutPage = () => {
  const navigate = useNavigate();
  const { data: savedContent } = useGetContentQuery('about');
  const content = { ...PAGE_CONTENT.about.defaults, ...savedContent };

  return (
    <div>
      <div className="bg-navy py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <span className="hero-in inline-block text-[10px] font-bold uppercase tracking-widest text-teal-light" style={delay(0)}>Our Story</span>
          <h1 className="hero-in font-display text-4xl sm:text-6xl text-white mt-3 leading-[1.08]" style={delay(120)}>
            {content.heroLine1} <em className="text-gold not-italic">{content.heroHighlight}</em><br />{content.heroLine2}
          </h1>
          <p className="hero-in text-white/70 text-base sm:text-lg mt-4 max-w-xl leading-relaxed" style={delay(240)}>
            {content.heroSubtitle}
          </p>
        </div>
      </div>

      <section className="py-16 sm:py-24">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-2 gap-14 items-center">
            <div data-reveal className="reveal">
              <span className="text-[10px] font-bold uppercase tracking-widest text-teal">Our Mission</span>
              <h2 className="font-display text-3xl sm:text-4xl text-navy mt-3 leading-tight">
                <MultilineText text={content.missionTitle} />
              </h2>
              <p className="text-muted text-sm leading-relaxed mt-4">
                {content.missionBody1}
              </p>
              <p className="text-muted text-sm leading-relaxed mt-4">
                {content.missionBody2}
              </p>
              <div className="flex flex-wrap gap-3 mt-8">
                <button
                  onClick={() => navigate('/properties')}
                  className="px-5 py-2.5 rounded-xl bg-navy text-white text-sm font-semibold hover:bg-navy-mid transition-colors"
                >
                  Browse Properties
                </button>
                <button
                  onClick={() => navigate('/contact')}
                  className="px-5 py-2.5 rounded-xl border border-border text-sm font-semibold text-navy hover:border-navy transition-colors"
                >
                  Get in Touch
                </button>
              </div>
            </div>

            <div data-reveal style={delay(150)} className="reveal relative rounded-3xl overflow-hidden min-h-[320px]">
              <img
                src={content.missionImage.startsWith('/uploads/') ? getImageUrl(content.missionImage) : content.missionImage}
                alt="Owkaz Properties"
                className="w-full h-full object-cover absolute inset-0"
              />
              <div className="relative z-10 h-full min-h-[320px] flex flex-col justify-end p-8 bg-gradient-to-t from-navy/80 via-navy/30 to-transparent">
              </div>
            </div>
          </div>

          <div className="mt-20">
            <div data-reveal className="reveal text-center mb-10">
              <span className="text-[10px] font-bold uppercase tracking-widest text-teal">What Drives Us</span>
              <h2 className="font-display text-3xl sm:text-4xl text-navy mt-3">Our Core Values</h2>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
              {VALUES.map((v, i) => (
                <div
                  key={v.title}
                  data-reveal
                  style={delay(i * 80)}
                  className="reveal bg-white border border-border rounded-2xl p-6 hover:-translate-y-1 hover:shadow-lg transition-all duration-300"
                >
                  <div className="text-teal mb-3"><v.icon size={30} strokeWidth={1.75} /></div>
                  <div className="font-semibold text-navy mb-1.5">{v.title}</div>
                  <div className="text-sm text-muted leading-relaxed">{v.desc}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      <section className="py-16 sm:py-20 bg-surface">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div data-reveal className="reveal text-center mb-10">
            <span className="text-[10px] font-bold uppercase tracking-widest text-teal">Client Stories</span>
            <h2 className="font-display text-3xl sm:text-4xl text-navy mt-3">
              Trusted by Clients<br />Across Nigeria
            </h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {TESTIMONIALS.map((t, i) => (
              <div
                key={t.name}
                data-reveal
                style={delay(i * 110)}
                className="reveal bg-white border border-border rounded-2xl p-6 hover:-translate-y-1 hover:shadow-lg transition-all duration-300"
              >
                <div className="flex gap-0.5 text-gold mb-3">
                  {[0, 1, 2, 3, 4].map((i) => (
                    <Star key={i} size={18} className="fill-current" />
                  ))}
                </div>
                <p className="text-sm text-muted leading-relaxed mb-5">{t.text}</p>
                <div className="flex items-center gap-3">
                  <Avatar name={t.name} className="w-10 h-10 text-base" />
                  <div>
                    <div className="text-sm font-semibold text-navy">{t.name}</div>
                    <div className="text-xs text-muted">{t.role}</div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="py-10 sm:py-14">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div data-reveal className="reveal bg-navy rounded-3xl px-8 py-12 sm:px-14 sm:py-16 relative overflow-hidden text-center">
            <div
              className="absolute inset-0 opacity-[0.04]"
              style={{
                backgroundImage: 'linear-gradient(rgba(255,255,255,.5) 1px,transparent 1px),linear-gradient(90deg,rgba(255,255,255,.5) 1px,transparent 1px)',
                backgroundSize: '40px 40px',
              }}
            />
            <div className="relative">
              <h2 className="font-display text-3xl sm:text-4xl text-white mb-3">Join the Owkaz Community</h2>
              <p className="text-white/60 text-sm mb-8 max-w-md mx-auto">
                Nigerians find, buy, sell, and rent property on Owkaz.
              </p>
              <div className="flex flex-wrap gap-3 justify-center">
                <button
                  onClick={() => navigate('/properties')}
                  className="px-6 py-3 rounded-xl bg-teal text-white font-semibold text-sm hover:bg-teal-light hover:-translate-y-0.5 active:translate-y-0 transition-all"
                >
                  Find a Property
                </button>
                <button
                  onClick={() => navigate('/login')}
                  className="px-6 py-3 rounded-xl border border-white/20 text-white font-semibold text-sm hover:bg-white/10 transition-colors"
                >
                  List Your Property
                </button>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};
