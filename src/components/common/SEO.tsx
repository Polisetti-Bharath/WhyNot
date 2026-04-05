import React, { useEffect } from 'react';

interface SEOProps {
  title?: string;
  description?: string;
  keywords?: string[];
  ogImage?: string;
  ogType?: 'website' | 'article';
  twitterCard?: 'summary' | 'summary_large_image';
  canonicalUrl?: string;
  structuredData?: object;
}

/**
 * SEO component with meta tags, Open Graph, Twitter cards, and JSON-LD
 * @param title - Page title
 * @param description - Page description
 * @param keywords - SEO keywords
 * @param ogImage - Open Graph image URL
 * @param ogType - Open Graph type
 * @param twitterCard - Twitter card type
 * @param canonicalUrl - Canonical URL
 * @param structuredData - JSON-LD structured data
 */
const SEO: React.FC<SEOProps> = ({
  title = 'WhyNot - Campus Internship & Placement Platform',
  description = 'Turn rejections into opportunities. AI-powered platform for campus placements with smart rejection analysis, one-click applications, and real-time tracking.',
  keywords = [
    'campus placement',
    'internship',
    'rejection analysis',
    'AI career insights',
    'student placement',
    'job application tracking',
  ],
  ogImage = '/og-image.png',
  ogType = 'website',
  twitterCard = 'summary_large_image',
  canonicalUrl,
  structuredData,
}) => {
  const siteUrl = 'https://whynot.app'; // Update with actual domain
  const fullUrl = canonicalUrl ? `${siteUrl}${canonicalUrl}` : siteUrl;
  const fullImageUrl = ogImage.startsWith('http') ? ogImage : `${siteUrl}${ogImage}`;

  const defaultStructuredData = {
    '@context': 'https://schema.org',
    '@type': 'WebApplication',
    name: 'WhyNot',
    applicationCategory: 'EducationalApplication',
    operatingSystem: 'Web',
    description: description,
    url: siteUrl,
    offers: {
      '@type': 'Offer',
      price: '0',
      priceCurrency: 'USD',
    },
    featureList: [
      'AI-powered rejection analysis',
      'One-click job applications',
      'Real-time application tracking',
      'Smart opportunity matching',
    ],
  };

  useEffect(() => {
    // Update title
    document.title = title;

    // Helper function to set or update meta tag
    const setMetaTag = (property: string, content: string, isProperty = false) => {
      const attribute = isProperty ? 'property' : 'name';
      let element = document.querySelector(`meta[${attribute}="${property}"]`);

      if (!element) {
        element = document.createElement('meta');
        element.setAttribute(attribute, property);
        document.head.appendChild(element);
      }

      element.setAttribute('content', content);
    };

    // Primary Meta Tags
    setMetaTag('title', title);
    setMetaTag('description', description);
    setMetaTag('keywords', keywords.join(', '));
    setMetaTag('robots', 'index, follow');
    setMetaTag('language', 'English');
    setMetaTag('revisit-after', '7 days');
    setMetaTag('author', 'WhyNot Team');
    setMetaTag('viewport', 'width=device-width, initial-scale=1.0, maximum-scale=5.0');
    setMetaTag('theme-color', '#bc13fe');

    // Open Graph / Facebook
    setMetaTag('og:type', ogType, true);
    setMetaTag('og:url', fullUrl, true);
    setMetaTag('og:title', title, true);
    setMetaTag('og:description', description, true);
    setMetaTag('og:image', fullImageUrl, true);
    setMetaTag('og:site_name', 'WhyNot', true);

    // Twitter
    setMetaTag('twitter:card', twitterCard, true);
    setMetaTag('twitter:url', fullUrl, true);
    setMetaTag('twitter:title', title, true);
    setMetaTag('twitter:description', description, true);
    setMetaTag('twitter:image', fullImageUrl, true);

    // Canonical URL
    let canonical = document.querySelector('link[rel="canonical"]') as HTMLLinkElement;
    if (!canonical) {
      canonical = document.createElement('link');
      canonical.rel = 'canonical';
      document.head.appendChild(canonical);
    }
    canonical.href = fullUrl;

    // Structured Data (JSON-LD)
    let script = document.querySelector(
      'script[type="application/ld+json"]'
    ) as HTMLScriptElement | null;
    if (!script) {
      script = document.createElement('script');
      (script as HTMLScriptElement).type = 'application/ld+json';
      document.head.appendChild(script);
    }
    script.textContent = JSON.stringify(structuredData || defaultStructuredData);
  }, [
    title,
    description,
    keywords,
    ogImage,
    ogType,
    twitterCard,
    canonicalUrl,
    fullUrl,
    fullImageUrl,
    structuredData,
    defaultStructuredData,
  ]);

  return null;
};

export default SEO;
