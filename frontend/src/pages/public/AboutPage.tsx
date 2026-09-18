import { useNavigate } from 'react-router-dom';
import { useGetContentQuery } from '../../features/content/contentApi';
import { PAGE_CONTENT } from '../../features/content/pageContentConfig';
import { getImageUrl } from '../../utils/imageUrl';
import { MultilineText } from '../../components/ui/MultilineText';

const VALUES = [
  { icon: '🔍', title: 'Transparency', desc: 'Every listing is verified. Every agent is screened. No hidden fees, no misleading information, ever.' },
  { icon: '🛡️', title: 'Trust & Safety', desc: 'We work hard to protect both buyers and sellers. Our verification process reduces fraud significantly.' },
  { icon: '🌍', title: 'Accessibility', desc: 'Whether you\'re in Abuja, Lagos, Kano, or in the diaspora, Owkaz works for you on any device.' },
  { icon: '⚡', title: 'Innovation', desc: 'We continuously improve our platform with smart search, AI-powered recommendations, and more.' },
  { icon: '🤝', title: 'Community', desc: 'We support local agents and empower small property owners to compete with large developers.' },
  { icon: '📊', title: 'Data-Driven', desc: 'Market reports, price trends, and location insights to help you make the most informed decisions.' },
];

const TESTIMONIALS = [
  {
    text: '"As a developer, Owkaz has been instrumental in reaching the right buyers for our Abuja estate project. The leads are qualified and the platform is professional."',
    name: 'Femi Adegoke',
    role: 'Property Developer · Abuja',
    avatar: '👨🏾‍💼',
  },
  {
    text: '"I found my rental apartment in VI within a week of searching on Owkaz. The listings were accurate and the agent was responsive. Highly recommend."',
    name: 'Nkiruka Okonkwo',
    role: 'Renter · Lagos',
    avatar: '👩🏾',
  },
  {
    text: '"Owkaz is the most straightforward Nigerian property site I\'ve used. Clean interface, real listings, and no fake prices. A cut above the rest."',
    name: 'Babatunde Lawal',
    role: 'Land Investor · Ibadan',
    avatar: '👨🏾',
  },
];

export const AboutPage = () => {
  const navigate = useNavigate();
  const { data: savedContent } = useGetContentQuery('about');
  const content = { ...PAGE_CONTENT.about.defaults, ...savedContent };

  return (
    <div>
      {/* Hero */}
      <div className="bg-navy py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <span className="text-[10px] font-bold uppercase tracking-widest text-teal-light">Our Story</span>
          <h1 className="font-display text-4xl sm:text-7xl text-white mt-3 leading-tight">
            {content.heroLine1} <em className="text-gold not-italic">{content.heroHighlight}</em><br />{content.heroLine2}
          </h1>
          <p className="text-white/60 text-base sm:text-lg mt-4 max-w-xl leading-relaxed">
            {content.heroSubtitle}
          </p>
        </div>
      </div>

      {/* Mission */}
      <section className="py-16 sm:py-24">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-2 gap-14 items-center">
            <div>
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

            {/* Building image card */}
            <div className="relative rounded-3xl overflow-hidden min-h-[320px]">
              <img
                src={content.missionImage.startsWith('/uploads/') ? getImageUrl(content.missionImage) : content.missionImage}
                alt="Owkaz Properties"
                className="w-full h-full object-cover absolute inset-0"
              />
              {/* Overlay with stats */}
              <div className="relative z-10 h-full min-h-[320px] flex flex-col justify-end p-8 bg-gradient-to-t from-navy/80 via-navy/30 to-transparent">
              </div>
            </div>
          </div>

          {/* Values */}
          <div className="mt-20">
            <div className="text-center mb-10">
              <span className="text-[10px] font-bold uppercase tracking-widest text-teal">What Drives Us</span>
              <h2 className="font-display text-3xl sm:text-4xl text-navy mt-3">Our Core Values</h2>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
              {VALUES.map((v) => (
                <div key={v.title} className="bg-white border border-border rounded-2xl p-6 hover:shadow-md transition-shadow">
                  <div className="text-3xl mb-3">{v.icon}</div>
                  <div className="font-semibold text-navy mb-1.5">{v.title}</div>
                  <div className="text-sm text-muted leading-relaxed">{v.desc}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section className="py-16 sm:py-20 bg-surface">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-10">
            <span className="text-[10px] font-bold uppercase tracking-widest text-teal">Client Stories</span>
            <h2 className="font-display text-3xl sm:text-4xl text-navy mt-3">
              Trusted by Thousands<br />Across Nigeria
            </h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {TESTIMONIALS.map((t) => (
              <div key={t.name} className="bg-white border border-border rounded-2xl p-6">
                <div className="text-gold text-lg mb-3">★★★★★</div>
                <p className="text-sm text-muted leading-relaxed mb-5 italic">{t.text}</p>
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-cream flex items-center justify-center text-xl">{t.avatar}</div>
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

      {/* CTA */}
      <section className="py-10 sm:py-14">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="bg-navy rounded-3xl px-8 py-12 sm:px-14 sm:py-16 relative overflow-hidden text-center">
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
                Thousands of Nigerians find, buy, sell, and rent property on Owkaz every day.
              </p>
              <div className="flex flex-wrap gap-3 justify-center">
                <button
                  onClick={() => navigate('/properties')}
                  className="px-6 py-3 rounded-xl bg-teal text-white font-semibold text-sm hover:bg-teal-light transition-colors"
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
