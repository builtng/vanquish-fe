import { test } from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';

test('C02: Progress to Next Stage button is removed from client-details page', () => {
  const pagePath = path.resolve(process.cwd(), 'app/dashboard/client-details/[uuid]/page.jsx');
  assert.ok(fs.existsSync(pagePath), 'client-details page must exist');

  const content = fs.readFileSync(pagePath, 'utf8');
  assert.ok(!content.includes('Progress to Next Stage'), 'Progress to Next Stage button must be removed from client-details page');
});

test('C02: Progress to Next Stage button is removed from completed-matches page', () => {
  const pagePath = path.resolve(process.cwd(), 'app/dashboard/completed-matches/page.jsx');
  assert.ok(fs.existsSync(pagePath), 'completed-matches page must exist');

  const content = fs.readFileSync(pagePath, 'utf8');
  assert.ok(!content.includes('Progress to Next Stage'), 'Progress to Next Stage button must be removed from completed-matches page');
});

test('C02: Unused app/client-booking/consultation page is deleted', () => {
  const unusedDir = path.resolve(process.cwd(), 'app/client-booking/consultation');
  assert.ok(!fs.existsSync(unusedDir), 'app/client-booking/consultation directory must be deleted');
});
