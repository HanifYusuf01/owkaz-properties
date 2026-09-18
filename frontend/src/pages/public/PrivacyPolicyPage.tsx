import { LegalPageLayout } from '../../components/legal/LegalPageLayout';

export const PrivacyPolicyPage = () => (
  <LegalPageLayout
    title="Privacy Policy"
    intro="Owkaz Properties ('Owkaz', 'we', 'us') respects your privacy. This policy explains what information we collect when you use our platform, how we use it, and the choices you have."
    sections={[
      {
        heading: '1. Information We Collect',
        body: [
          'Account information: your name, email address, phone number, and password when you register as a buyer, agent, or property owner.',
          'Listing information: property details, photos, videos, and location data submitted by agents and owners.',
          'Usage data: pages viewed, searches performed, and general device/browser information collected automatically to help us improve the platform.',
        ],
      },
      {
        heading: '2. How We Use Your Information',
        body: [
          'To create and manage your account, and to let you list, search for, and enquire about properties.',
          'To connect buyers with agents and property owners, and to notify you about the status of your listings or enquiries.',
          'To improve our search, recommendations, and overall service, and to detect and prevent fraud or misuse of the platform.',
        ],
      },
      {
        heading: '3. Sharing of Information',
        body: [
          'We share only the information necessary to complete a transaction — for example, your contact details are shared with an agent when you submit an enquiry on their listing.',
          'We do not sell your personal information to third parties. We may share limited data with service providers who help us operate the platform (such as hosting or payment processors), under confidentiality obligations.',
        ],
      },
      {
        heading: '4. Data Security',
        body: [
          'We use industry-standard measures, including encrypted password storage and secure connections, to protect your information. No online platform can guarantee absolute security, but we work continuously to safeguard your data.',
        ],
      },
      {
        heading: '5. Your Choices',
        body: [
          'You can review and update your account information at any time from your profile settings, and you may request deletion of your account by contacting us.',
        ],
      },
      {
        heading: '6. Contact Us',
        body: [
          'If you have questions about this Privacy Policy, reach us at hello@owkaz.ng.',
        ],
      },
    ]}
  />
);
