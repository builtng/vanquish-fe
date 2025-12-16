/**
 * Structured Data Component
 * Renders JSON-LD structured data for SEO
 */

export default function StructuredData({ data }) {
  if (!data) return null;

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(data) }}
    />
  );
}

