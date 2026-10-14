import { test } from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';

test('D04: apiService has uploadTraineeAgreement method for 4-way agreement upload', () => {
  const apiPath = path.resolve(process.cwd(), 'lib/api.js');
  assert.ok(fs.existsSync(apiPath), 'lib/api.js must exist');

  const content = fs.readFileSync(apiPath, 'utf8');
  assert.ok(content.includes('uploadTraineeAgreement(id, file)'), 'uploadTraineeAgreement method must be defined in apiService');
  assert.ok(content.includes('/trainee-applications/${id}/upload-agreement'), 'uploadTraineeAgreement must target /trainee-applications/${id}/upload-agreement');
});

test('D04: Trainee application detail page renders PaperworkToggle with audit metadata display and agreement upload', () => {
  const pagePath = path.resolve(process.cwd(), 'app/dashboard/trainee-applications/[id]/page.jsx');
  assert.ok(fs.existsSync(pagePath), 'Trainee application detail page must exist');

  const content = fs.readFileSync(pagePath, 'utf8');
  assert.ok(content.includes('meta.ticked_by || meta.source'), 'PaperworkToggle must display who or what ticked the item');
  assert.ok(content.includes('meta.ticked_at'), 'PaperworkToggle must display when the item was ticked');
  assert.ok(content.includes('handleAgreementUpload'), 'Page must implement handleAgreementUpload for 4-way agreement');
  assert.ok(content.includes('four_way_agreement'), 'Checklist must track four_way_agreement');
  assert.ok(content.includes('therapy_form'), 'Checklist must track therapy_form');
  assert.ok(content.includes('handlePaperworkUpdate'), 'Admin can still change paperwork status by hand');
});
