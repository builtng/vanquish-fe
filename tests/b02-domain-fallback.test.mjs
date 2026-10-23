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

test('Item 10: SEO generators fall back to https://vqtmanagement.com when env is unset', () => {
  const originalEnv = process.env.NEXT_PUBLIC_SITE_URL;
  delete process.env.NEXT_PUBLIC_SITE_URL;

  try {
    const meta = generateMetadata({ title: 'Test Title' });
    assert.ok(meta.openGraph.url.startsWith('https://vqtmanagement.com'));

    const org = generateOrganizationSchema({});
    assert.equal(org.url, 'https://vqtmanagement.com');

    const service = generateServiceSchema({ name: 'Therapy', url: '/therapy' });
    assert.equal(service.url, 'https://vqtmanagement.com/therapy');

    const webApp = generateWebApplicationSchema({});
    assert.equal(webApp.url, 'https://vqtmanagement.com');

    const breadcrumbs = generateBreadcrumbSchema([{ name: 'Home', url: '/' }]);
    assert.equal(breadcrumbs.itemListElement[0].item, 'https://vqtmanagement.com/');
  } finally {
    if (originalEnv !== undefined) {
      process.env.NEXT_PUBLIC_SITE_URL = originalEnv;
    }
  }
});

test('Item 10: layout.js, robots.js, and sitemap.js specify https://vqtmanagement.com fallback', () => {
  const layoutContent = fs.readFileSync(path.join(rootDir, 'app/layout.js'), 'utf8');
  assert.ok(
    layoutContent.includes("process.env.NEXT_PUBLIC_SITE_URL || 'https://vqtmanagement.com'"),
    'app/layout.js must fall back to https://vqtmanagement.com',
  );

  const robotsContent = fs.readFileSync(path.join(rootDir, 'app/robots.js'), 'utf8');
  assert.ok(
    robotsContent.includes("process.env.NEXT_PUBLIC_SITE_URL || 'https://vqtmanagement.com'"),
    'app/robots.js must fall back to https://vqtmanagement.com',
  );

  const sitemapContent = fs.readFileSync(path.join(rootDir, 'app/sitemap.js'), 'utf8');
  assert.ok(
    sitemapContent.includes("process.env.NEXT_PUBLIC_SITE_URL || 'https://vqtmanagement.com'"),
    'app/sitemap.js must fall back to https://vqtmanagement.com',
  );
});

test('Item 10: api.js and proxy.js fall back to https://api.vqtmanagement.com/api in production', () => {
  const apiContent = fs.readFileSync(path.join(rootDir, 'lib/api.js'), 'utf8');
  assert.ok(
    apiContent.includes('https://api.vqtmanagement.com/api'),
    'frontend/lib/api.js must fall back to https://api.vqtmanagement.com/api in production',
  );

  const proxyContent = fs.readFileSync(path.join(rootDir, 'proxy.js'), 'utf8');
  assert.ok(
    proxyContent.includes('https://api.vqtmanagement.com/api'),
    'frontend/proxy.js must fall back to https://api.vqtmanagement.com/api in production',
  );
});
