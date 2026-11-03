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
  assert.ok(content.includes('professional_membership'), 'Form must include the professional membership field');
  assert.ok(content.includes('disclaimer'), 'Form must include the disclaimer declaration');
  assert.ok(content.includes('signature'), 'Form must include digital signature field');
  assert.ok(content.includes('submitPersonalTherapyConfirmation'), 'Form must call apiService.submitPersonalTherapyConfirmation');
});

test('D04: frontend/lib/api.js defines submitPersonalTherapyConfirmation and getTherapyFormData', () => {
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
  assert.ok(
    content.includes('getTherapyFormData(token)'),
    'apiService must expose getTherapyFormData method'
  );
  assert.ok(
    content.includes('/therapy-form/'),
    'getTherapyFormData must call /therapy-form/{token}'
  );
});

test('Item 11 Security: therapy-form verifies token, shows trainee first name only, and handles invalid link', () => {
  const filePath = path.join(rootDir, 'app/therapy-form/page.jsx');
  const content = fs.readFileSync(filePath, 'utf8');

  // Reads token from search params
  assert.ok(
    content.includes('searchParams.get("token")'),
    'Must read token query param from searchParams'
  );

  // Calls getTherapyFormData with token
  assert.ok(
    content.includes('getTherapyFormData(cleanToken)'),
    'Must verify token with apiService.getTherapyFormData'
  );

  // Sets error message for bad token
  assert.ok(
    content.includes('This link is no longer valid. Please contact help@vanquishtherapies.co.uk.'),
    'Must display exact 422 error message for bad or expired token'
  );

  // Submits token with payload
  assert.ok(
    content.includes('token: token'),
    'Must submit the single-use token in the confirmation payload'
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

test('Therapy form: the plain /therapy-form link (no token) shows the form instead of "Verification Link Invalid"', () => {
  const filePath = path.join(rootDir, 'app/therapy-form/page.jsx');
  const content = fs.readFileSync(filePath, 'utf8');

  assert.ok(content.includes('setTokenStatus("open")'), 'A missing token must open the form, not the invalid screen');
  assert.ok(content.includes("Trainee Counsellor's Full First &amp; Last Name"), 'Form must ask for the trainee name');
  assert.ok(content.includes("Trainee Counsellor's Email Address"), 'Open link must ask for the trainee email');
  assert.ok(content.includes('token: token || undefined'), 'Open link must not send an empty token');
});

test('Therapy form: wording matches the JotForm "Confirmation of Personal Therapy" word for word', () => {
  const filePath = path.join(rootDir, 'app/therapy-form/page.jsx');
  const content = fs.readFileSync(filePath, 'utf8').replace(/&amp;/g, '&').replace(/\s+/g, ' ');

  const jotformWording = [
    'Confirmation of Personal Therapy',
    'Please send this form to your Personal Counsellor/Psychotherapist for completion and signature. This form needs to be submitted before your induction. Regrettably, failure to comply will result in the inability to assign clients to you and/or your placement offer may be withdrawn.',
    "Trainee Counsellor's Full First & Last Name (Aliases/Nick names will not be accepted):",
    "Personal Counsellor's/Psychotherapist's Information",
    'Practice Name & Website',
    'Email and Contact Number',
    'Professional Membership Name and Number',
    'Highest Qualifications and Modality',
    'Date of first session',
    'Please mention how many personal therapy sessions has the Trainee Counsellor had with you to date?',
    'Have the sessions with you taken place during the time the Trainee Counsellor has been actively participating in their counselling course?',
    'Has the Trainee Counsellor completed all of their required personal therapy hours?',
    'Sessions with me have concluded; to my knowledge the trainee counsellor may continue their personal therapy with another therapist.',
    'Do you have any concerns regarding the Trainee Counsellor’s suitability to work with clients?',
    'No, to the best of my knowledge, I have no concerns regarding the Trainee Counsellor’s ability to work safely, ethically, and appropriately with clients on placement.',
    'Yes, I have concerns (please provide details below)',
    'Please provide further information or specify any concerns:',
    'I confirm the Trainee Counsellor on placement, as named above, is attending ongoing counselling/psychotherapy sessions with me, I will notify Vanquish Therapies should the sessions terminate prematurely.',
    'I confirm the Trainee Counsellor has completed all mandatory personal therapy hours required as part of their training course since the commencement date mentioned above.',
    'I confirm that my work with the Trainee Counsellor has concluded. To my knowledge, the Trainee Counsellor may continue to fulfil their personal therapy requirements with an alternative therapist.',
    "Counsellor's/Psychotherapist's Signature:",
    'Date of signing',
  ];

  for (const text of jotformWording) {
    assert.ok(content.includes(text), `Missing JotForm wording: ${text}`);
  }
});
