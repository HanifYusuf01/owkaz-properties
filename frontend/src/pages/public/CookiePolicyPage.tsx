import { LegalPageLayout } from '../../components/legal/LegalPageLayout';

export const CookiePolicyPage = () => (
  <LegalPageLayout
    title="Cookie Policy"
    intro="This Cookie Policy explains how Owkaz Properties uses cookies and similar technologies when you visit our site."
    sections={[
      {
        heading: '1. What Are Cookies',
        body: [
          'Cookies are small text files stored on your device that help websites remember information about your visit, such as your preferences and login state.',
        ],
      },
      {
        heading: '2. How We Use Cookies',
        body: [
          'Essential cookies: required to keep you signed in and to remember basic preferences, such as your selected language.',
          'Performance cookies: help us understand how the platform is used so we can improve search, navigation, and overall performance.',
        ],
      },
      {
        heading: '3. Managing Cookies',
        body: [
          'Most browsers let you control or delete cookies through their settings. Disabling essential cookies may affect your ability to sign in or use certain features of Owkaz.',
        ],
      },
      {
        heading: '4. Contact Us',
        body: [
          'If you have questions about this Cookie Policy, contact us at hello@owkaz.ng.',
        ],
      },
    ]}
  />
);
