export interface ContentField {
  key: string;
  label: string;
  type: 'text' | 'multiline' | 'image';
}

export interface ContentFieldGroup {
  title: string;
  fields: ContentField[];
}

export interface PageContentConfig {
  label: string;
  groups: ContentFieldGroup[];
  defaults: Record<string, string>;
}

export const PAGE_CONTENT: Record<string, PageContentConfig> = {
  home: {
    label: 'Home',
    defaults: {
      heroLine1: 'Find Your',
      heroHighlight: 'Perfect',
      heroLine2: 'Property in\nNigeria',
      heroSubtitle: 'From Abuja to Lagos, explore thousands of verified listings across residential, commercial, and land, with trusted agents ready to guide you.',
      feature1Title: 'Verified Listings',
      feature1Desc: 'Every property undergoes strict verification before going live on our platform.',
      feature2Title: 'Expert Agents',
      feature2Desc: 'Connect directly with 250+ licensed real estate professionals across Nigeria.',
      feature3Title: 'Secure Transactions',
      feature3Desc: 'Safe, transparent processes with legal documentation support. Pay via bank transfer, card, or crypto.',
      feature4Title: '24/7 Support',
      feature4Desc: 'Our team is always available to answer your property questions and inquiries.',
      cryptoBadge: 'New: Crypto Payments',
      cryptoTitle: 'Pay Your Way, Crypto Included',
      cryptoSubtitle: 'Owkaz accepts cryptocurrency alongside traditional payment methods, making it easier for local and diaspora buyers to invest.',
      ctaHeading: 'Your Next Property\nis One Search Away',
      ctaSubtitle: "Whether you're buying, renting, or selling, Owkaz has you covered across Nigeria.",
    },
    groups: [
      {
        title: 'Hero Section',
        fields: [
          { key: 'heroLine1', label: 'Heading — line 1', type: 'text' },
          { key: 'heroHighlight', label: 'Heading — highlighted word', type: 'text' },
          { key: 'heroLine2', label: 'Heading — remaining lines (new line to break)', type: 'multiline' },
          { key: 'heroSubtitle', label: 'Subtitle', type: 'multiline' },
        ],
      },
      {
        title: 'Feature Cards',
        fields: [
          { key: 'feature1Title', label: 'Card 1 — Title', type: 'text' },
          { key: 'feature1Desc', label: 'Card 1 — Description', type: 'multiline' },
          { key: 'feature2Title', label: 'Card 2 — Title', type: 'text' },
          { key: 'feature2Desc', label: 'Card 2 — Description', type: 'multiline' },
          { key: 'feature3Title', label: 'Card 3 — Title', type: 'text' },
          { key: 'feature3Desc', label: 'Card 3 — Description', type: 'multiline' },
          { key: 'feature4Title', label: 'Card 4 — Title', type: 'text' },
          { key: 'feature4Desc', label: 'Card 4 — Description', type: 'multiline' },
        ],
      },
      {
        title: 'Crypto Banner',
        fields: [
          { key: 'cryptoBadge', label: 'Badge text', type: 'text' },
          { key: 'cryptoTitle', label: 'Heading', type: 'text' },
          { key: 'cryptoSubtitle', label: 'Subtitle', type: 'multiline' },
        ],
      },
      {
        title: 'Bottom CTA Banner',
        fields: [
          { key: 'ctaHeading', label: 'Heading (new line to break)', type: 'multiline' },
          { key: 'ctaSubtitle', label: 'Subtitle', type: 'multiline' },
        ],
      },
    ],
  },

  about: {
    label: 'About',
    defaults: {
      heroLine1: 'Built for',
      heroHighlight: "Nigeria's",
      heroLine2: 'Property Market',
      heroSubtitle: 'Owkaz was founded with one mission: to make property search and listing in Nigeria transparent, trustworthy, and easy for everyone, from first-time homebuyers to seasoned investors.',
      missionTitle: 'Making Real Estate\nAccessible to All Nigerians',
      missionBody1: 'We believe every Nigerian deserves access to quality property information without the fear of fraud or misinformation. Our platform connects verified agents, honest landlords, and genuine buyers in a secure digital environment.',
      missionBody2: "From the bustling corridors of Victoria Island to the serene developments of Maitama, and the commercial hubs of Port Harcourt, Owkaz is your trusted guide through Nigeria's dynamic property landscape.",
      missionImage: '/owkaz-building.jpg',
    },
    groups: [
      {
        title: 'Hero Section',
        fields: [
          { key: 'heroLine1', label: 'Heading — line 1', type: 'text' },
          { key: 'heroHighlight', label: 'Heading — highlighted word', type: 'text' },
          { key: 'heroLine2', label: 'Heading — line 2', type: 'text' },
          { key: 'heroSubtitle', label: 'Subtitle', type: 'multiline' },
        ],
      },
      {
        title: 'Mission Section',
        fields: [
          { key: 'missionTitle', label: 'Heading (new line to break)', type: 'multiline' },
          { key: 'missionBody1', label: 'Paragraph 1', type: 'multiline' },
          { key: 'missionBody2', label: 'Paragraph 2', type: 'multiline' },
          { key: 'missionImage', label: 'Photo', type: 'image' },
        ],
      },
    ],
  },

  contact: {
    label: 'Contact',
    defaults: {
      heroLine1: "We're Here to Help",
      heroLine2: 'You Find Your Next Home',
    },
    groups: [
      {
        title: 'Hero Section',
        fields: [
          { key: 'heroLine1', label: 'Heading — line 1', type: 'text' },
          { key: 'heroLine2', label: 'Heading — line 2', type: 'text' },
        ],
      },
    ],
  },

  properties: {
    label: 'Properties',
    defaults: {
      heroTitle: 'All Properties',
      heroSubtitle: 'Explore verified properties across Nigeria',
    },
    groups: [
      {
        title: 'Hero Section',
        fields: [
          { key: 'heroTitle', label: 'Heading', type: 'text' },
          { key: 'heroSubtitle', label: 'Subtitle', type: 'text' },
        ],
      },
    ],
  },

  sold: {
    label: 'Sold Properties',
    defaults: {
      heroTitle: 'Sold Properties',
      heroSubtitle: 'Properties successfully sold through Owkaz',
    },
    groups: [
      {
        title: 'Hero Section',
        fields: [
          { key: 'heroTitle', label: 'Heading', type: 'text' },
          { key: 'heroSubtitle', label: 'Subtitle', type: 'text' },
        ],
      },
    ],
  },

  footer: {
    label: 'Footer & Social',
    defaults: {
      facebookUrl: '',
      instagramUrl: '',
      twitterUrl: '',
      linkedinUrl: '',
      whatsappNumber: '',
    },
    groups: [
      {
        title: 'Social Media Links',
        fields: [
          { key: 'facebookUrl', label: 'Facebook URL', type: 'text' },
          { key: 'instagramUrl', label: 'Instagram URL', type: 'text' },
          { key: 'twitterUrl', label: 'X (Twitter) URL', type: 'text' },
          { key: 'linkedinUrl', label: 'LinkedIn URL', type: 'text' },
          { key: 'whatsappNumber', label: 'WhatsApp Number (e.g. 2349010000000)', type: 'text' },
        ],
      },
    ],
  },

  projects: {
    label: 'Projects',
    defaults: {
      heroLine1: 'Premium Property',
      heroLine2: 'Projects Across Nigeria',
      heroSubtitle: "From gated estates in Abuja to luxury apartments in Lagos, Owkaz curates and markets Nigeria's finest residential and commercial developments.",
    },
    groups: [
      {
        title: 'Hero Section',
        fields: [
          { key: 'heroLine1', label: 'Heading — line 1', type: 'text' },
          { key: 'heroLine2', label: 'Heading — line 2', type: 'text' },
          { key: 'heroSubtitle', label: 'Subtitle', type: 'multiline' },
        ],
      },
    ],
  },
};
