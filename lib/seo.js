/**
 * SEO utility functions for generating metadata and structured data
 */

/**
 * Generate page metadata
 * @param {Object} options - Metadata options
 * @returns {Object} Metadata object
 */
export function generateMetadata({
  title,
  description,
  keywords = [],
  image = '/og-image.jpg',
  url = '',
  type = 'website',
  noindex = false,
}) {
  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://vanquish.com';
  const fullUrl = url ? `${baseUrl}${url}` : baseUrl;
  const fullImageUrl = image.startsWith('http') ? image : `${baseUrl}${image}`;

  return {
    title,
    description,
    keywords: keywords.length > 0 ? keywords.join(', ') : undefined,
    openGraph: {
      title,
      description,
      url: fullUrl,
      siteName: 'Vanquish',
      images: [
        {
          url: fullImageUrl,
          width: 1200,
          height: 630,
          alt: title,
        },
      ],
      type,
      locale: 'en_GB',
    },
    twitter: {
      card: 'summary_large_image',
      title,
      description,
      images: [fullImageUrl],
    },
    alternates: {
      canonical: fullUrl,
    },
    robots: {
      index: !noindex,
      follow: !noindex,
    },
  };
}

/**
 * Generate structured data (JSON-LD) for Organization
 * @param {Object} options - Organization details
 * @returns {Object} JSON-LD object
 */
export function generateOrganizationSchema({
  name = 'Vanquish',
  url = process.env.NEXT_PUBLIC_SITE_URL || 'https://vanquish.com',
  logo = '/logo.png',
  description = 'Professional therapy management system',
  contactPoint = {},
  sameAs = [],
}) {
  return {
    '@context': 'https://schema.org',
    '@type': 'Organization',
    name,
    url,
    logo: logo.startsWith('http') ? logo : `${url}${logo}`,
    description,
    ...(contactPoint.email && {
      contactPoint: {
        '@type': 'ContactPoint',
        ...contactPoint,
      },
    }),
    ...(sameAs.length > 0 && { sameAs }),
  };
}

/**
 * Generate structured data for Service
 * @param {Object} options - Service details
 * @returns {Object} JSON-LD object
 */
export function generateServiceSchema({
  name,
  description,
  provider = 'Vanquish',
  areaServed = 'GB',
  serviceType = 'Therapy',
  url,
}) {
  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://vanquish.com';
  
  return {
    '@context': 'https://schema.org',
    '@type': 'Service',
    name,
    description,
    provider: {
      '@type': 'Organization',
      name: provider,
    },
    areaServed: {
      '@type': 'Country',
      name: areaServed,
    },
    serviceType,
    ...(url && { url: url.startsWith('http') ? url : `${baseUrl}${url}` }),
  };
}

/**
 * Generate structured data for WebApplication
 * @param {Object} options - Application details
 * @returns {Object} JSON-LD object
 */
export function generateWebApplicationSchema({
  name = 'Vanquish',
  description = 'Professional therapy management system',
  url = process.env.NEXT_PUBLIC_SITE_URL || 'https://vanquish.com',
  applicationCategory = 'HealthApplication',
  operatingSystem = 'Web',
  offers = {},
}) {
  return {
    '@context': 'https://schema.org',
    '@type': 'WebApplication',
    name,
    description,
    url,
    applicationCategory,
    operatingSystem,
    ...(Object.keys(offers).length > 0 && {
      offers: {
        '@type': 'Offer',
        ...offers,
      },
    }),
  };
}

/**
 * Generate BreadcrumbList structured data
 * @param {Array} items - Breadcrumb items [{name, url}]
 * @returns {Object} JSON-LD object
 */
export function generateBreadcrumbSchema(items) {
  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://vanquish.com';
  
  return {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: items.map((item, index) => ({
      '@type': 'ListItem',
      position: index + 1,
      name: item.name,
      item: item.url.startsWith('http') ? item.url : `${baseUrl}${item.url}`,
    })),
  };
}

/**
 * Generate FAQPage structured data
 * @param {Array} faqs - FAQ items [{question, answer}]
 * @returns {Object} JSON-LD object
 */
export function generateFAQSchema(faqs) {
  return {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: faqs.map((faq) => ({
      '@type': 'Question',
      name: faq.question,
      acceptedAnswer: {
        '@type': 'Answer',
        text: faq.answer,
      },
    })),
  };
}

