import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';

const emailMgmtPath = path.resolve('app/dashboard/email-management/page.jsx');
const content = fs.readFileSync(emailMgmtPath, 'utf8');

test('Q19: Email Management shows qc_* templates with clear names', () => {
  // Check that getTemplateName is defined and handles qc_ and trainee_ templates
  assert.ok(content.includes('getTemplateName'), 'page.jsx should define getTemplateName');
  assert.ok(content.includes('Qualified Counsellor:'), 'page.jsx should format qc_ templates as Qualified Counsellor:');
  assert.ok(content.includes('Trainee:'), 'page.jsx should format trainee_ templates as Trainee:');

  // Check that getTemplateName is used in the sidebar button
  assert.ok(content.includes('{getTemplateName(template)}'), 'Sidebar should use getTemplateName(template)');

  // Check that getTemplateName is used in the edit header
  assert.ok(content.includes('Edit {getTemplateName(selectedTemplate)}'), 'Header should use getTemplateName(selectedTemplate)');
});
