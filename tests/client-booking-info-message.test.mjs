import { test } from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const rootDir = path.resolve(__dirname, '..');

test('Z04: client-booking page shows booking link notification as informational message', () => {
  const pagePath = path.resolve(rootDir, 'app/client-booking/page.jsx');
  assert.ok(fs.existsSync(pagePath), 'client-booking/page.jsx must exist');

  const content = fs.readFileSync(pagePath, 'utf8');

  // Verify infoMessage state exists
  assert.ok(content.includes('infoMessage'), 'infoMessage state must be defined');

  // Verify booking link detection
  assert.ok(
    content.includes('booking link') && content.includes('setInfoMessage'),
    'Must set informational message when booking link message is returned'
  );

  // Verify informational render (Check Your Email, Mail icon, not AlertCircle with red-500)
  assert.ok(
    content.includes('Check Your Email'),
    'Must display Check Your Email header for informational message'
  );
  assert.ok(
    content.includes('text-blue-600') && content.includes('bg-blue-50'),
    'Must render informational message using blue notification styling'
  );
});

test('J06: lib/constants.js THERAPY_TOPICS contains exactly VQT 25 terms and excludes unmapped terms', async () => {
  const constantsPath = path.resolve(rootDir, 'lib/constants.js');
  assert.ok(fs.existsSync(constantsPath), 'lib/constants.js must exist');

  const { THERAPY_TOPICS, SUPPORT_AREAS } = await import(`file://${constantsPath}`);

  const vqt25 = [
    'Communication problems',
    'Low mood/depression',
    'Low confidence/self-esteem',
    'Fear of intimacy/loneliness',
    'Self-defeating behaviour',
    'Relationship/family problems',
    'People pleasing',
    'Discrimination/racial and cultural identity',
    'Anxiety/panic attacks',
    'High sensitivity',
    'Abuse (physical/emotional/sexual)',
    'Anger management issues',
    'Bereavement and grief',
    'Childhood trauma',
    'Domestic violence',
    'LGBTQ+/gender identity worries',
    'OCD (obsessive compulsive disorder)',
    'Phobias',
    'Self-harm',
    'Suicidal ideation',
    'Addiction and substance misuse',
    'Body image issues',
    'Eating disorders',
    'PTSD (post-traumatic stress disorder)',
    'Work related stress',
  ];

  assert.equal(THERAPY_TOPICS.length, 25, 'THERAPY_TOPICS must have exactly 25 canonical terms');
  assert.deepEqual(THERAPY_TOPICS, vqt25, 'THERAPY_TOPICS must match VQT 25 terms exactly as written');
  assert.deepEqual(SUPPORT_AREAS, THERAPY_TOPICS, 'SUPPORT_AREAS must alias THERAPY_TOPICS');

  // Verify unmapped terms are NOT present
  const excluded = [
    'Health Anxiety',
    'Social Anxiety',
    'Infidelity',
    'Parenting Issues',
    'Stress Management',
  ];

  for (const term of excluded) {
    assert.ok(!THERAPY_TOPICS.includes(term), `Excluded term "${term}" must not be in THERAPY_TOPICS`);
  }
});
