import { useNavigate } from 'react-router-dom';
import { Check, UserPlus, ClipboardList, Camera, Rocket, Lock, Phone, Mail } from 'lucide-react';
import { SubmitPropertyPage } from '../dashboard/agent/SubmitPropertyPage';
import { useAppSelector } from '../../store';

const STEPS = [
  {
    n: 1,
    icon: <UserPlus size={22} className="text-teal" />,
    title: 'Create Account',
    desc: "Sign up as an agent or property owner. Already done if you're here!",
  },
  {
    n: 2,
    icon: <ClipboardList size={22} className="text-teal" />,
    title: 'Fill Details',
    desc: 'Location, price, LGA, title, and description for your listing.',
  },
  {
    n: 3,
    icon: <Camera size={22} className="text-teal" />,
    title: 'Upload Photos',
    desc: 'High-quality photos dramatically increase buyer interest.',
  },
  {
    n: 4,
    icon: <Rocket size={22} className="text-teal" />,
    title: 'Go Live',
    desc: 'Owkaz reviews and approves. Your listing goes visible immediately.',
  },
];

const PLANS = [
  {
    name: 'Basic',
    price: 'Free',
    period: 'always',
    featured: false,
    features: [
      '1 Active Listing',
      '5 Photos per listing',
      'Standard Placement',
      'Featured Badge',
    ],
    cta: 'Get Started Free',
    ctaStyle: 'border border-border text-navy hover:bg-cream',
  },
  {
    name: 'Professional',
    price: '₦25,000',
    period: 'per year',
    featured: true,
    features: [
      '10 Listings',
      '20 Photos per listing',
      'Priority Placement',
      'Featured Badge',
      'Analytics',
    ],
    cta: 'Start Professional',
    ctaStyle: 'bg-teal text-white hover:bg-teal-light',
  },
  {
    name: 'Agency',
    price: '₦75,000',
    period: 'per year',
    featured: false,
    features: [
      'Unlimited Listings',
      'Unlimited Photos + Video',
      'Top Search Placement',
      'Featured Badge',
      'Dedicated Account Manager',
    ],
    cta: 'Contact Sales',
    ctaStyle: 'bg-gold text-white hover:opacity-90',
  },
];

export const ListPropertyPage = () => {
  const navigate = useNavigate();
  const user = useAppSelector((s) => s.auth.user);

  if (!user) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center px-4">
        <div className="text-center max-w-sm">
          <div className="w-16 h-16 rounded-full bg-navy/5 border border-border flex items-center justify-center mx-auto mb-4">
            <Lock size={28} className="text-navy" />
          </div>
          <h2 className="font-display text-2xl text-navy mb-2">Sign In Required</h2>
          <p className="text-muted text-sm mb-6">You need to be signed in to list a property on Owkaz.</p>
          <button
            onClick={() => navigate('/login')}
            className="px-6 py-3 rounded-xl bg-navy text-white text-sm font-semibold hover:bg-navy-mid transition-colors"
          >
            Sign In
          </button>
        </div>
      </div>
    );
  }

  return (
    <div>
      {/* ── Hero ── */}
      <div className="bg-gradient-to-br from-navy to-navy-mid py-16 sm:py-20 relative overflow-hidden text-center">
        <div
          className="absolute inset-0 opacity-[0.04]"
          style={{
            backgroundImage:
              'linear-gradient(rgba(255,255,255,.5) 1px,transparent 1px),linear-gradient(90deg,rgba(255,255,255,.5) 1px,transparent 1px)',
            backgroundSize: '48px 48px',
          }}
        />
        <div className="relative max-w-2xl mx-auto px-4 sm:px-6">
          <span className="inline-block text-[10px] font-bold uppercase tracking-widest text-teal-light mb-4">
            For Agents &amp; Owners
          </span>
          <h1 className="font-display text-3xl sm:text-5xl text-white mb-4 leading-tight">
            List Your Property<br />on Owkaz
          </h1>
          <p className="text-white/60 text-base leading-relaxed">
            Reach thousands of serious buyers and renters across Nigeria.
          </p>
        </div>
      </div>

      {/* ── Steps ── */}
      <div className="bg-cream border-b border-border py-14">
        <div className="max-w-4xl mx-auto px-4 sm:px-6">
          <div className="text-center mb-10">
            <span className="text-[10px] font-bold uppercase tracking-widest text-teal">Simple Process</span>
            <h2 className="font-display text-2xl sm:text-3xl text-navy mt-2">List in 4 Easy Steps</h2>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
            {STEPS.map((s) => (
              <div key={s.n} className="bg-white border border-border rounded-2xl p-5 relative">
                <div className="absolute -top-3 left-5 w-6 h-6 rounded-full bg-teal text-white text-xs font-bold flex items-center justify-center">
                  {s.n}
                </div>
                <div className="w-10 h-10 rounded-xl bg-teal/10 border border-teal/20 flex items-center justify-center mb-3 mt-1">
                  {s.icon}
                </div>
                <div className="font-bold text-sm text-navy mb-1">{s.title}</div>
                <div className="text-xs text-muted leading-relaxed">{s.desc}</div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* ── Plans ── */}
      <div className="py-14">
        <div className="max-w-4xl mx-auto px-4 sm:px-6">
          <div className="text-center mb-10">
            <span className="text-[10px] font-bold uppercase tracking-widest text-teal">Pricing</span>
            <h2 className="font-display text-2xl sm:text-3xl text-navy mt-2">Choose Your Plan</h2>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
            {PLANS.map((plan) => (
              <div
                key={plan.name}
                className={`rounded-2xl border-2 p-6 relative transition-all ${
                  plan.featured
                    ? 'border-teal bg-navy shadow-xl'
                    : 'border-border bg-white hover:border-teal hover:shadow-md'
                }`}
              >
                {plan.featured && (
                  <div className="absolute -top-3.5 left-1/2 -translate-x-1/2 bg-teal text-white text-[10px] font-bold uppercase tracking-widest px-3 py-1 rounded-full whitespace-nowrap">
                    Most Popular
                  </div>
                )}
                <div className={`text-[10px] font-bold uppercase tracking-widest mb-3 ${plan.featured ? 'text-teal-light' : 'text-teal'}`}>
                  {plan.name}
                </div>
                <div className={`font-display text-4xl leading-none mb-1 ${plan.featured ? 'text-white' : 'text-navy'}`}>
                  {plan.price}
                </div>
                <div className={`text-sm mb-6 ${plan.featured ? 'text-white/50' : 'text-muted'}`}>
                  {plan.period}
                </div>
                <div className="flex flex-col gap-2.5 mb-6">
                  {plan.features.map((f) => (
                    <div key={f} className={`flex items-center gap-2 text-sm ${plan.featured ? 'text-white/80' : 'text-ink'}`}>
                      <Check size={14} className={plan.featured ? 'text-teal-light flex-shrink-0' : 'text-teal flex-shrink-0'} />
                      {f}
                    </div>
                  ))}
                </div>
                <button
                  className={`w-full py-2.5 rounded-xl text-sm font-semibold transition-colors ${plan.ctaStyle}`}
                  onClick={() => {
                    if (plan.name === 'Agency') {
                      navigate('/contact');
                    } else {
                      document.getElementById('listing-form')?.scrollIntoView({ behavior: 'smooth' });
                    }
                  }}
                >
                  {plan.cta}
                </button>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* ── Contact note ── */}
      <div className="bg-cream border-y border-border py-8">
        <div className="max-w-4xl mx-auto px-4 sm:px-6">
          <div className="flex flex-col sm:flex-row items-center justify-center gap-6 text-sm text-muted">
            <div className="flex items-center gap-2">
              <Phone size={14} className="text-teal" />
              Need help? Call our listing team
            </div>
            <div className="flex items-center gap-2">
              <Mail size={14} className="text-teal" />
              listings@owkaz.com
            </div>
          </div>
        </div>
      </div>

      {/* ── Listing Form ── */}
      <div id="listing-form" className="bg-white py-14">
        <div className="max-w-4xl mx-auto px-4 sm:px-6">
          <div className="text-center mb-10">
            <span className="text-[10px] font-bold uppercase tracking-widest text-teal">Submit</span>
            <h2 className="font-display text-2xl sm:text-3xl text-navy mt-2">Create Your Listing</h2>
          </div>
          <SubmitPropertyPage />
        </div>
      </div>
    </div>
  );
};
