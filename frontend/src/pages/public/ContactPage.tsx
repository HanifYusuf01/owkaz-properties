import { useState } from 'react';
import { useSendContactMessageMutation } from '../../features/contact/contactApi';
import { useGetContentQuery } from '../../features/content/contentApi';
import { PAGE_CONTENT } from '../../features/content/pageContentConfig';
import { Locate, Phone, Mail, MessageCircleWarning, CheckCircle2 } from 'lucide-react';
import { googleMapsEmbedUrl, googleMapsSearchUrl } from '../../utils/googleMapsLink';
import { delay } from '../../utils/motion';

const OFFICES = [
  {
    name: 'Abuja Head Office',
    address: 'Plot 12B, Lobito Crescent, Wuse II, Abuja FCT',
    query: ['Plot 12B, Lobito Crescent', 'Wuse II', 'Abuja'],
  },
  {
    name: 'Lagos Branch',
    address: '14 Idowu Martins Street, Victoria Island, Lagos State',
    query: ['14 Idowu Martins Street', 'Victoria Island', 'Lagos'],
  },
];

const SUBJECTS = [
  'General Enquiry',
  'Property Search Help',
  'Listing Support',
  'Agent Partnership',
  'Report an Issue',
  'Other',
];

const CONTACT_INFO = [
  {
    icon: <Locate size={20} />,
    label: 'Head Office',
    value: 'Plot 12B, Lobito Crescent, Wuse II, Abuja FCT',
  },
  {
    icon: <Phone size={20} />,
    label: 'Phone',
    value: '+234 (0) 800 OWKAZ 01',
    sub: 'Mon–Fri, 8am – 6pm WAT',
  },
  {
    icon: <Mail size={20} />,
    label: 'Email',
    value: 'hello@owkaz.ng',
    sub: 'We respond within 24 hours',
  },
  {
    icon: <MessageCircleWarning size={20} />,
    label: 'WhatsApp Support',
    value: '+234 (0) 901 000 0000',
    sub: 'Quick responses, 7 days a week',
  },
];

export const ContactPage = () => {
  const [activeOffice, setActiveOffice] = useState(0);
  const office = OFFICES[activeOffice];
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [subject, setSubject] = useState(SUBJECTS[0]);
  const [message, setMessage] = useState('');
  const [sent, setSent] = useState(false);
  const [error, setError] = useState('');

  const [sendMessage, { isLoading }] = useSendContactMessageMutation();
  const { data: savedContent } = useGetContentQuery('contact');
  const content = { ...PAGE_CONTENT.contact.defaults, ...savedContent };

  const handleSubmit = async (e: React.SyntheticEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError('');
    try {
      await sendMessage({ firstName, lastName, email, phone: phone || undefined, subject, message }).unwrap();
      setSent(true);
    } catch {
      setError('Failed to send message. Please try again or contact us directly.');
    }
  };

  return (
    <div>
      <div className="bg-navy py-16 sm:py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <span className="hero-in inline-block text-[10px] font-bold uppercase tracking-widest text-teal-light" style={delay(0)}>Get In Touch</span>
          <h1 className="hero-in font-display text-4xl sm:text-5xl text-white mt-3 leading-[1.08]" style={delay(120)}>
            {content.heroLine1}<br />{content.heroLine2}
          </h1>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-14">
        <div className="grid lg:grid-cols-2 gap-12">

          <div data-reveal className="reveal">
            <h2 className="font-display text-3xl text-navy mb-2">Let's Have a<br />Conversation</h2>
            <p className="text-muted text-sm leading-relaxed mb-8">
              Whether you have questions about a listing, need guidance on buying or selling, or want to partner with us, our team is ready to help.
            </p>

            <div className="space-y-5">
              {CONTACT_INFO.map((item) => (
                <div key={item.label} className="flex items-start gap-4">
                  <div className="w-10 h-10 rounded-xl bg-cream border border-border flex items-center justify-center text-xl flex-shrink-0">
                    {item.icon}
                  </div>
                  <div>
                    <div className="text-[10px] font-bold uppercase tracking-widest text-muted mb-0.5">{item.label}</div>
                    <div className="text-sm font-semibold text-navy">{item.value}</div>
                    {item.sub && <div className="text-xs text-muted mt-0.5">{item.sub}</div>}
                  </div>
                </div>
              ))}
            </div>

            <div className="mt-8 p-5 bg-cream border border-border rounded-2xl">
              <div className="font-semibold text-navy mb-1">Lagos Branch Office</div>
              <div className="text-sm text-muted leading-relaxed">14 Idowu Martins Street, Victoria Island, Lagos State</div>
              <div className="text-sm text-muted mt-1">+234 (0) 800 OWKAZ 02</div>
            </div>
          </div>

          <div data-reveal style={delay(150)} className="reveal bg-white border border-border rounded-2xl p-6 sm:p-8 shadow-sm">
            {sent ? (
              <div className="text-center py-10">
                <CheckCircle2 size={48} className="mx-auto mb-4 text-teal" />
                <h3 className="font-display text-2xl text-navy mb-2">Message Sent!</h3>
                <p className="text-sm text-muted">
                  Thanks for reaching out. We'll get back to you within 24 hours.
                </p>
                <button
                  onClick={() => setSent(false)}
                  className="mt-6 px-5 py-2.5 rounded-xl border border-border text-sm font-semibold text-navy hover:border-navy transition-colors"
                >
                  Send Another Message
                </button>
              </div>
            ) : (
              <>
                <h3 className="font-display text-2xl text-navy mb-1">Send Us a Message</h3>
                <p className="text-sm text-muted mb-6">Fill the form below and we'll get back to you promptly.</p>

                <form onSubmit={handleSubmit} className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-semibold text-muted mb-1.5">
                        First Name <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="text"
                        required
                        placeholder="Emeka"
                        value={firstName}
                        onChange={(e) => setFirstName(e.target.value)}
                        className="w-full border border-border rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:border-teal transition-colors"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-muted mb-1.5">
                        Last Name <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="text"
                        required
                        placeholder="Okafor"
                        value={lastName}
                        onChange={(e) => setLastName(e.target.value)}
                        className="w-full border border-border rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:border-teal transition-colors"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-muted mb-1.5">
                      Email <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="email"
                      required
                      placeholder="emeka@email.com"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="w-full border border-border rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:border-teal transition-colors"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-muted mb-1.5">Phone</label>
                    <input
                      type="tel"
                      placeholder="+234 800 000 0000"
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      className="w-full border border-border rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:border-teal transition-colors"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-muted mb-1.5">Subject</label>
                    <select
                      value={subject}
                      onChange={(e) => setSubject(e.target.value)}
                      className="w-full border border-border rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:border-teal transition-colors"
                    >
                      {SUBJECTS.map((s) => <option key={s}>{s}</option>)}
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-muted mb-1.5">
                      Message <span className="text-red-500">*</span>
                    </label>
                    <textarea
                      required
                      rows={5}
                      placeholder="Tell us how we can help you…"
                      value={message}
                      onChange={(e) => setMessage(e.target.value)}
                      className="w-full border border-border rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:border-teal transition-colors resize-none"
                    />
                  </div>

                  {error && (
                    <p className="text-xs text-red-500 text-center">{error}</p>
                  )}
                  <button
                    type="submit"
                    disabled={isLoading}
                    className="w-full py-3 rounded-xl bg-navy text-white font-semibold text-sm hover:bg-navy-mid transition-colors disabled:opacity-60 disabled:cursor-not-allowed"
                  >
                    {isLoading ? 'Sending…' : 'Send Message'}
                  </button>
                </form>
              </>
            )}
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-14">
        <div data-reveal className="reveal flex flex-wrap items-center justify-between gap-3 mb-4">
          <div className="flex gap-2">
            {OFFICES.map((o, i) => (
              <button
                key={o.name}
                type="button"
                onClick={() => setActiveOffice(i)}
                className={`px-4 py-2 rounded-lg text-sm font-semibold border transition-colors ${
                  i === activeOffice
                    ? 'bg-navy text-white border-navy'
                    : 'bg-white text-navy border-border hover:border-navy'
                }`}
              >
                {o.name}
              </button>
            ))}
          </div>
          <a
            href={googleMapsSearchUrl(office.query)}
            target="_blank"
            rel="noopener noreferrer"
            className="text-sm font-semibold text-teal hover:underline"
          >
            Open in Google Maps ↗
          </a>
        </div>
        <div className="rounded-2xl overflow-hidden border border-border bg-cream">
          <iframe
            key={office.name}
            title={`${office.name} map`}
            src={googleMapsEmbedUrl(office.query)}
            className="w-full h-72 sm:h-96 block"
            loading="lazy"
            referrerPolicy="no-referrer-when-downgrade"
            allowFullScreen
          />
        </div>
        <p className="mt-3 text-sm text-muted">{office.address}</p>
      </div>
    </div>
  );
};
