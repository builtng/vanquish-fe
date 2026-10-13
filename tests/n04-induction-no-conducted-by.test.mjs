import test from 'node:test';
import assert from 'node:assert';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const projectRoot = path.resolve(__dirname, '..');

test('FIX N04: Induction acceptance page does not contain "Conducted by"', () => {
  const acceptPagePath = path.join(projectRoot, 'app/induction/accept/[token]/page.jsx');
  assert.ok(fs.existsSync(acceptPagePath), 'Accept induction page exists');
  const content = fs.readFileSync(acceptPagePath, 'utf8');

  // Verify "Conducted by" is completely absent
  assert.strictEqual(
    content.includes('Conducted by'),
    false,
    'app/induction/accept/[token]/page.jsx must NOT contain "Conducted by"'
  );
  assert.strictEqual(
    content.toLowerCase().includes('conducted by'),
    false,
    'app/induction/accept/[token]/page.jsx must NOT contain case-insensitive "conducted by"'
  );

  // Verify Date & Time formatting is preserved
  assert.ok(
    content.includes('formatDateTime(induction.scheduled_at, induction.scheduled_end_at)'),
    'app/induction/accept/[token]/page.jsx must format scheduled_at and scheduled_end_at'
  );
});
