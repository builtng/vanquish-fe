import { test } from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';

test('C05: payment-success page uses help@vanquishtherapies.co.uk support email', () => {
  const filePath = path.resolve(process.cwd(), 'app/payment-success/page.jsx');
  assert.ok(fs.existsSync(filePath), 'payment-success/page.jsx must exist');

  const content = fs.readFileSync(filePath, 'utf8');
  assert.ok(content.includes('help@vanquishtherapies.co.uk'), 'Must use help@vanquishtherapies.co.uk');
  assert.ok(!content.includes('support@vanquishtherapies.co.uk'), 'Must not use support@vanquishtherapies.co.uk');
});

test('C05: client-booking page uses help@vanquishtherapies.co.uk support email', () => {
  const filePath = path.resolve(process.cwd(), 'app/client-booking/page.jsx');
  assert.ok(fs.existsSync(filePath), 'client-booking/page.jsx must exist');

  const content = fs.readFileSync(filePath, 'utf8');
  assert.ok(content.includes('help@vanquishtherapies.co.uk'), 'Must use help@vanquishtherapies.co.uk');
  assert.ok(!content.includes('support@vanquishtherapies.co.uk'), 'Must not use support@vanquishtherapies.co.uk');
});
