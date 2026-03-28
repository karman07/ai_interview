/**
 * SEO Utilities for the Ai for job
 */

export const seoConfig = {
  defaultTitle: 'AI for Job | AI-Powered Interview Practice Platform',
  titleTemplate: '%s | AI for Job',
  defaultDescription: 'Master your job interviews with AI-powered mock interviews, resume analysis, and personalized feedback. Practice coding, behavioral, and technical interviews with real-time AI assistance.',
  siteUrl: 'https://aiforjob.ai',
  defaultImage: 'https://aiforjob.ai/og-image.png',
  twitterHandle: '@aiforjob',
  companyName: 'AI for Job',
};

export const generatePageTitle = (pageTitle?: string): string => {
  if (!pageTitle) return seoConfig.defaultTitle;
  return `${pageTitle} | AI for Job`;
};

export const generatePageUrl = (path: string): string => {
  const cleanPath = path.startsWith('/') ? path : `/${path}`;
  return `${seoConfig.siteUrl}${cleanPath}`;
};

export const structuredData = {
  organization: {
    '@context': 'https://schema.org',
    '@type': 'Organization',
    name: seoConfig.companyName,
    url: seoConfig.siteUrl,
    logo: `${seoConfig.siteUrl}/logo.png`,
    description: seoConfig.defaultDescription,
    sameAs: [
      // Add social media profiles here
    ],
  },
  
  website: {
    '@context': 'https://schema.org',
    '@type': 'WebSite',
    name: seoConfig.companyName,
    url: seoConfig.siteUrl,
    potentialAction: {
      '@type': 'SearchAction',
      target: {
        '@type': 'EntryPoint',
        urlTemplate: `${seoConfig.siteUrl}/search?q={search_term_string}`,
      },
      'query-input': 'required name=search_term_string',
    },
  },
  
  service: {
    '@context': 'https://schema.org',
    '@type': 'Service',
    name: 'Ai for job Practice',
    provider: {
      '@type': 'Organization',
      name: seoConfig.companyName,
    },
    serviceType: 'Interview Preparation Platform',
    areaServed: 'Worldwide',
    description: 'AI-powered interview practice platform with resume analysis, mock interviews, and personalized feedback',
  },
  
  product: {
    '@context': 'https://schema.org',
    '@type': 'Product',
    name: 'Ai for job',
    description: seoConfig.defaultDescription,
    brand: {
      '@type': 'Brand',
      name: seoConfig.companyName,
    },
    offers: {
      '@type': 'AggregateOffer',
      priceCurrency: 'USD',
      availability: 'https://schema.org/OnlineOnly',
    },
  },

  faqPage: (faqs: Array<{ question: string; answer: string }>) => ({
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: faqs.map(faq => ({
      '@type': 'Question',
      name: faq.question,
      acceptedAnswer: {
        '@type': 'Answer',
        text: faq.answer,
      },
    })),
  }),

  course: (courseData: {
    name: string;
    description: string;
    provider: string;
  }) => ({
    '@context': 'https://schema.org',
    '@type': 'Course',
    name: courseData.name,
    description: courseData.description,
    provider: {
      '@type': 'Organization',
      name: courseData.provider,
    },
  }),
};

export const getStructuredData = (type: keyof typeof structuredData, data?: any) => {
  const schema = typeof structuredData[type] === 'function' 
    ? structuredData[type](data)
    : structuredData[type];
  
  return JSON.stringify(schema);
};
