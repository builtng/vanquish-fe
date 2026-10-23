import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const rootDir = path.resolve(__dirname, '..');

test('D04: frontend/app/therapy-form/page.jsx renders an internal form without JotForm iframe or links', () => {
  const filePath = path.join(rootDir, 'app/therapy-form/page.jsx');
  assert.ok(fs.existsSync(filePath), 'app/therapy-form/page.jsx must exist');

  const content = fs.readFileSync(filePath, 'utf8');

  // Must not reference JotForm
  assert.ok(!content.includes('jotform.com'), 'therapy-form/page.jsx must not reference jotform.com');
  assert.ok(!content.includes('Open in JotForm'), 'therapy-form/page.jsx must not have Open in JotForm button');
  assert.ok(!content.includes('<iframe'), 'therapy-form/page.jsx must not embed any iframe');

  // Must have internal form fields
  assert.ok(content.includes('trainee_email'), 'Form must include trainee_email field');
  assert.ok(content.includes('therapist_name'), 'Form must include therapist_name field');
  assert.ok(content.includes('therapist_email'), 'Form must include therapist_email field');
  assert.ok(content.includes('professional_body'), 'Form must include professional_body selector');
  assert.ok(content.includes('membership_number'), 'Form must include membership_number field');
  assert.ok(content.includes('confirmed'), 'Form must include clinical confirmation declaration');
  assert.ok(content.includes('signature'), 'Form must include digital signature field');
  assert.ok(content.includes('submitPersonalTherapyConfirmation'), 'Form must call apiService.submitPersonalTherapyConfirmation');
});

test('D04: frontend/lib/api.js defines submitPersonalTherapyConfirmation', () => {
  const apiPath = path.join(rootDir, 'lib/api.js');
  const content = fs.readFileSync(apiPath, 'utf8');

  assert.ok(
    content.includes('submitPersonalTherapyConfirmation(data)'),
    'apiService must expose submitPersonalTherapyConfirmation method'
  );
  assert.ok(
    content.includes('/trainee-applications/confirm-personal-therapy'),
    'submitPersonalTherapyConfirmation must call /trainee-applications/confirm-personal-therapy'
  );
});

test('D04: Admin trainee application detail page uses Personal Therapy Confirmation label', () => {
  const pagePath = path.join(rootDir, 'app/dashboard/trainee-applications/[id]/page.jsx');
  const content = fs.readFileSync(pagePath, 'utf8');

  assert.ok(
    content.includes('label="Personal Therapy Confirmation"'),
    'Admin trainee application detail page must display "Personal Therapy Confirmation" without "(JotForm)"'
  );
  assert.ok(
    !content.includes('Personal Therapy Form (JotForm)'),
    'Must not have legacy "(JotForm)" label'
  );
});
