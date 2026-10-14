import { test } from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';

test('N03: counsellor messages page displays Staff Support exclusively', () => {
  const pagePath = path.resolve(process.cwd(), 'app/counsellor-portal/messages/page.jsx');
  assert.ok(fs.existsSync(pagePath), 'counsellor messages page.jsx must exist');

  const content = fs.readFileSync(pagePath, 'utf8');

  // Must use Staff Support
  assert.ok(content.includes('Staff Support'), 'Must include Staff Support');
  assert.ok(content.includes('name: \'Staff Support\''), 'Must set chat name to Staff Support');
  assert.ok(content.includes('body.append("subject", "Staff Support")'), 'Must default subject to Staff Support');

  // Must not contain Admin Support
  assert.ok(!content.includes('Admin Support'), 'Must not contain Admin Support');
});

test('N03: NewMessageNotifier displays Staff Support for counsellor role', () => {
  const notifierPath = path.resolve(process.cwd(), 'components/NewMessageNotifier.jsx');
  assert.ok(fs.existsSync(notifierPath), 'NewMessageNotifier.jsx must exist');

  const content = fs.readFileSync(notifierPath, 'utf8');
  assert.ok(
    content.includes('user?.role === "counsellor"\n      ? "Staff Support"'),
    'Must display Staff Support for counsellors in message notifications'
  );
});

test('N03: counsellor client detail page links to Message Staff Support', () => {
  const clientPagePath = path.resolve(process.cwd(), 'app/counsellor-portal/clients/[id]/page.jsx');
  assert.ok(fs.existsSync(clientPagePath), 'counsellor client detail page must exist');

  const content = fs.readFileSync(clientPagePath, 'utf8');
  assert.ok(content.includes('Message Staff Support'), 'Must link with Message Staff Support');
  assert.ok(!content.includes('Message Admin Team'), 'Must not include Message Admin Team');
});
