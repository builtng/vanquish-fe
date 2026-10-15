import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';

test('FIX A07: Trainee application form heading is centred across the page width matching Low Cost and Mid Range forms', () => {
  const counsellorPagePath = path.resolve('app/counsellor/page.jsx');
  const lowCostPagePath = path.resolve('app/low-cost-intake/page.jsx');
  const midRangePagePath = path.resolve('app/mid-range-intake/page.jsx');

  const counsellorContent = fs.readFileSync(counsellorPagePath, 'utf8');
  const lowCostContent = fs.readFileSync(lowCostPagePath, 'utf8');
  const midRangeContent = fs.readFileSync(midRangePagePath, 'utf8');

  // Must have centred flex-col container
  const expectedContainerClass = 'flex flex-col items-center justify-center mb-4 md:mb-6 text-center';
  assert.ok(
    counsellorContent.includes(expectedContainerClass),
    'Trainee form must use flex flex-col items-center justify-center mb-4 md:mb-6 text-center'
  );
  assert.ok(
    lowCostContent.includes(expectedContainerClass),
    'Low cost form must use flex flex-col items-center justify-center mb-4 md:mb-6 text-center'
  );
  assert.ok(
    midRangeContent.includes(expectedContainerClass),
    'Mid range form must use flex flex-col items-center justify-center mb-4 md:mb-6 text-center'
  );

  // Logo must be centred inline-flex
  const expectedLogoContainer = 'inline-flex items-center justify-center mb-4';
  assert.ok(
    counsellorContent.includes(expectedLogoContainer),
    'Trainee form logo must be wrapped in inline-flex items-center justify-center mb-4'
  );

  // Heading must be 2xl md:3xl font-bold
  assert.ok(
    counsellorContent.includes('className="text-2xl md:text-3xl font-bold"'),
    'Trainee form h1 must have className text-2xl md:text-3xl font-bold'
  );

  // Must not have the old beside-logo layout
  assert.ok(
    !counsellorContent.includes('flex items-center gap-3 md:gap-4'),
    'Trainee form header must not position heading beside logo using flex items-center gap-3'
  );
});
