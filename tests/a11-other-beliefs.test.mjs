import { test } from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';

const counsellorPagePath = path.resolve('app/counsellor/page.jsx');
const content = fs.readFileSync(counsellorPagePath, 'utf8');

test('FIX A11: Trainee application form Other beliefs conditional box and validation', async (t) => {
  await t.test('1. otherBeliefs input is conditionally rendered when Other is selected', () => {
    assert.ok(
      content.includes('formData.beliefs.includes("Other")'),
      'Should check if beliefs contains "Other" before rendering otherBeliefs'
    );
    assert.ok(
      content.includes('name="otherBeliefs"') || content.includes('id="otherBeliefs"'),
      'Should have otherBeliefs input field'
    );
  });

  await t.test('2. Step 1 validation requires otherBeliefs when Other is selected', () => {
    assert.ok(
      content.includes('stepErrors.otherBeliefs = "Please specify your beliefs"'),
      'Should set error on otherBeliefs when empty and Other is selected'
    );
  });

  await t.test('3. handleBeliefsToggle clears otherBeliefs and error when Other is deselected', () => {
    assert.ok(
      content.includes('isCurrentlySelected && isOther ? "" : prev.otherBeliefs'),
      'Should clear otherBeliefs when Other is deselected'
    );
    assert.ok(
      content.includes('delete newErrors.otherBeliefs'),
      'Should delete otherBeliefs error when Other is deselected'
    );
  });
});
