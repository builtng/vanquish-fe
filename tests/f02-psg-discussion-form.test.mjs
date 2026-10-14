import { test } from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';

test('F02: InternalPSGForm renders read-only Counsellor Name field at top and uses discussion wording', () => {
  const formPath = path.resolve(process.cwd(), 'components/InternalPSGForm.jsx');
  assert.ok(fs.existsSync(formPath), 'components/InternalPSGForm.jsx must exist');

  const content = fs.readFileSync(formPath, 'utf8');
  assert.ok(content.includes('Counsellor Name'), 'Must render Counsellor Name field');
  assert.ok(content.includes('readOnly'), 'Counsellor Name field must be read-only');
  assert.ok(content.includes('Your Discussion Notes'), 'Must use Discussion Notes label');
  assert.ok(content.includes('Submit Discussion'), 'Must have Submit Discussion button text');
  assert.ok(!content.includes('Submit Reflection'), 'Must not have Submit Reflection button text');
  assert.ok(!content.includes('Your Reflection'), 'Must not have Your Reflection label');
});

test('F02: psg-form page defaults to built-in form when use_internal_psg_form is not set', () => {
  const pagePath = path.resolve(process.cwd(), 'app/counsellor-portal/pages/psg-form/page.jsx');
  assert.ok(fs.existsSync(pagePath), 'app/counsellor-portal/pages/psg-form/page.jsx must exist');

  const content = fs.readFileSync(pagePath, 'utf8');
  assert.ok(content.includes('settings?.use_internal_psg_form !== "0"'), 'Must default to internal PSG form when not explicitly "0"');
  assert.ok(!content.includes('psg-reflection'), 'Fallback link must not use psg-reflection URL');
});

test('F02: SystemModuleToggleSettings defaults use_internal_psg_form to "1"', () => {
  const settingsPath = path.resolve(process.cwd(), 'components/SystemModuleToggleSettings.jsx');
  assert.ok(fs.existsSync(settingsPath), 'components/SystemModuleToggleSettings.jsx must exist');

  const content = fs.readFileSync(settingsPath, 'utf8');
  assert.ok(content.includes('use_internal_psg_form: "1"'), 'Initial settings must default use_internal_psg_form to "1"');
});
