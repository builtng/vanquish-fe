import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const rootDir = path.resolve(__dirname, '..');

import {
  generateMetadata,
  generateOrganizationSchema,
  generateServiceSchema,
  generateWebApplicationSchema,
  generateBreadcrumbSchema,
} from '../lib/seo.js';

test('Fix 8 (B02 prep): SEO generators fall back to https://vanquish0.vercel.app when env is unset', () => {
  const originalEnv = process.env.NEXT_PUBLIC_SITE_URL;
  delete process.env.NEXT_PUBLIC_SITE_URL;

  try {
    const meta = generateMetadata({ title: 'Test Title' });
    assert.ok(meta.openGraph.url.startsWith('https://vanquish0.vercel.app'));

    const org = generateOrganizationSchema({});
    assert.equal(org.url, 'https://vanquish0.vercel.app');

    const service = generateServiceSchema({ name: 'Therapy', url: '/therapy' });
    assert.equal(service.url, 'https://vanquish0.vercel.app/therapy');

    const webApp = generateWebApplicationSchema({});
    assert.equal(webApp.url, 'https://vanquish0.vercel.app');

    const breadcrumbs = generateBreadcrumbSchema([{ name: 'Home', url: '/' }]);
    assert.equal(breadcrumbs.itemListElement[0].item, 'https://vanquish0.vercel.app/');
  } finally {
    if (originalEnv !== undefined) {
      process.env.NEXT_PUBLIC_SITE_URL = originalEnv;
    }
  }
});

test('Fix 8 (B02 prep): layout.js, robots.js, and sitemap.js specify https://vanquish0.vercel.app fallback', () => {
  const layoutContent = fs.readFileSync(path.join(rootDir, 'app/layout.js'), 'utf8');
  assert.ok(
    layoutContent.includes("process.env.NEXT_PUBLIC_SITE_URL || 'https://vanquish0.vercel.app'"),
    'app/layout.js must fall back to https://vanquish0.vercel.app',
  );

  const robotsContent = fs.readFileSync(path.join(rootDir, 'app/robots.js'), 'utf8');
  assert.ok(
    robotsContent.includes("process.env.NEXT_PUBLIC_SITE_URL || 'https://vanquish0.vercel.app'"),
    'app/robots.js must fall back to https://vanquish0.vercel.app',
  );

  const sitemapContent = fs.readFileSync(path.join(rootDir, 'app/sitemap.js'), 'utf8');
  assert.ok(
    sitemapContent.includes("process.env.NEXT_PUBLIC_SITE_URL || 'https://vanquish0.vercel.app'"),
    'app/sitemap.js must fall back to https://vanquish0.vercel.app',
  );
});
