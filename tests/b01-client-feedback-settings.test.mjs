import { test } from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';

test('B01: ClientFeedbackSettings component exists and handles settings', () => {
  const componentPath = path.resolve(process.cwd(), 'components/ClientFeedbackSettings.jsx');
  assert.ok(fs.existsSync(componentPath), 'ClientFeedbackSettings.jsx must exist');

  const content = fs.readFileSync(componentPath, 'utf8');
  assert.ok(content.includes('feedback_form_enabled'), 'Must handle feedback_form_enabled');
  assert.ok(content.includes('feedback_form_session_number'), 'Must handle feedback_form_session_number');
  assert.ok(content.includes('feedback_form_url'), 'Must handle feedback_form_url');
  assert.ok(content.includes('/dashboard/email-management'), 'Must link to email management for editing template');
});

test('B01: Settings page includes ClientFeedbackSettings card', () => {
  const settingsPath = path.resolve(process.cwd(), 'app/dashboard/settings/page.jsx');
  const content = fs.readFileSync(settingsPath, 'utf8');

  assert.ok(content.includes('ClientFeedbackSettings'), 'Settings page must import and render ClientFeedbackSettings');
  assert.ok(content.includes('Client Feedback Settings'), 'Settings page must display Client Feedback Settings header');
});
