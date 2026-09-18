import { LegalPageLayout } from '../../components/legal/LegalPageLayout';

export const TermsOfUsePage = () => (
  <LegalPageLayout
    title="Terms of Use"
    intro="These Terms of Use govern your access to and use of the Owkaz Properties platform. By creating an account or using the site, you agree to these terms."
    sections={[
      {
        heading: '1. Using Owkaz',
        body: [
          'You must be at least 18 years old to create an account. You agree to provide accurate information when registering and to keep your login credentials confidential.',
          'Owkaz is a marketplace connecting buyers, renters, agents, and property owners. We do not own, manage, or guarantee any property listed on the platform.',
        ],
      },
      {
        heading: '2. Listings',
        body: [
          'Agents and owners are responsible for the accuracy of the listings they submit, including price, location, photos, and documentation. All listings are reviewed before going live, but Owkaz does not independently verify property ownership or legal title.',
          'Owkaz reserves the right to remove any listing that is inaccurate, fraudulent, duplicated, or violates these terms.',
        ],
      },
      {
        heading: '3. Prohibited Conduct',
        body: [
          'You agree not to post false or misleading information, impersonate another person or business, or use the platform for any unlawful purpose, including fraud or money laundering.',
        ],
      },
      {
        heading: '4. Transactions',
        body: [
          'Owkaz facilitates introductions between buyers/renters and agents/owners. Any agreement, payment, or contract for a property is between those parties directly. We recommend independent legal and title verification before completing any transaction.',
        ],
      },
      {
        heading: '5. Limitation of Liability',
        body: [
          'Owkaz provides the platform "as is" and is not liable for losses arising from transactions, disputes, or inaccurate listing information provided by users.',
        ],
      },
      {
        heading: '6. Changes to These Terms',
        body: [
          'We may update these Terms of Use from time to time. Continued use of the platform after changes take effect constitutes acceptance of the revised terms.',
        ],
      },
      {
        heading: '7. Contact Us',
        body: [
          'Questions about these terms can be sent to hello@owkaz.ng.',
        ],
      },
    ]}
  />
);
