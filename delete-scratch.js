const fs = require('fs');
const path = require('path');

const rootDir = __dirname;

const filesToDelete = [
  // backend root
  'backend/approval-error.json',
  'backend/auth-output.txt',
  'backend/build-output.txt',
  'backend/check-template.ts',
  'backend/compile_errors.txt',
  'backend/current_errors.log',
  'backend/debug-find-all.ts',
  'backend/debug-jobs.ts',
  'backend/debug-sections.ts',
  'backend/debug-slot.ts',
  'backend/debug-students.ts',
  'backend/debug.test.ts',
  'backend/delete-mock-templates.ts',
  'backend/error.txt',
  'backend/extract.cjs',
  'backend/find-rem.mjs',
  'backend/fix-any.js',
  'backend/fix-any.mjs',
  'backend/fix-any2.mjs',
  'backend/fix-any3.mjs',
  'backend/fix1.js',
  'backend/fix1.mjs',
  'backend/fix2.mjs',
  'backend/fix3.mjs',
  'backend/full_schema.sql',
  'backend/list-templates.ts',
  'backend/out.log',
  'backend/out.txt',
  'backend/raw-errors.txt',
  'backend/recover.py',
  'backend/remaining_touched_errors_utf8.txt',
  'backend/remaining_touched_errors.txt',
  'backend/replace-service.cjs',
  'backend/reset-admin.ts',
  'backend/scratch_query.cjs',
  'backend/scratch_query.ts',
  'backend/script.cjs',
  'backend/test_direct.ts',
  'backend/test-api-generate-forms.ts',
  'backend/test-auth.js',
  'backend/test-controller.ts',
  'backend/test-delete-3002.ts',
  'backend/test-delete.ts',
  'backend/test-fail.log',
  'backend/test-findunique.ts',
  'backend/test-generate-forms.ts',
  'backend/test-generate-forms2.ts',
  'backend/test-get-3002.ts',
  'backend/test-login.js',
  'backend/test-output-new.txt',
  'backend/test-output-verbose.txt',
  'backend/test-output.txt',
  'backend/test-templates.ts',
  'backend/ts_errors_any_utf8.txt',
  'backend/ts_errors_any.txt',
  'backend/ts_errors_current.log',
  'backend/ts_errors_final_utf8.log',
  'backend/ts_errors_final.log',
  'backend/ts_errors_fresh.log',
  'backend/ts_errors_latest.log',
  'backend/ts_errors_new.log',
  'backend/ts_errors_rem_utf8.txt',
  'backend/ts_errors_rem.txt',
  'backend/ts_errors_round2.log',
  'backend/ts_errors_utf8.log',
  'backend/ts_errors.log',
  'backend/ts-errors.txt',
  'backend/tsc_output.txt',
  'backend/tsc.log',
  'backend/tsc.txt',
  'backend/update-password.ts',
  'backend/vitest_clean.log',
  'backend/vitest_output.log',
  'backend/vitest_output.txt',
  'backend/vitest_utf8.log',
  'backend/vitest-out.txt',
  'backend/vitest-results.json',
  'backend/vitest.log',
  'backend/package-lock.json',

  // backend src internal
  'backend/src/test-bulk.ts',
  'backend/src/test-preview.ts',

  // frontend root
  'frontend/fix-frontend.mjs',
  'frontend/raw-errors.txt',
  'frontend/rules.txt',
  'frontend/test-browser.js',
  'frontend/ts_errors.txt',
  'frontend/ts-errors.txt',
  'frontend/tsc_errors.txt',
  'frontend/tsc_out.txt',
  'frontend/tsc_output.txt',
  'frontend/type-errors.log',
  'frontend/package-lock.json',

  // root level
  'test-output.txt',
  'ts_errors.log',
  'generate-dump.js', // Delete the dump generator too
  'qc',
  'query',
  'start.bat',
  'VIDYAVERSE Logo Final.png',
  'test_bg.svg'
];

let count = 0;
for (const f of filesToDelete) {
  const fullPath = path.join(rootDir, f);
  if (fs.existsSync(fullPath)) {
    fs.unlinkSync(fullPath);
    count++;
  }
}

// remove scratch dir
const scratchDir = path.join(rootDir, 'backend/scratch');
if (fs.existsSync(scratchDir)) {
  fs.rmSync(scratchDir, { recursive: true, force: true });
}

// PHASE 4
const scriptsToDelete = [
  'backend/scripts/check-user.mts',
  'backend/scripts/debug-approval.ts',
  'backend/scripts/profile-bulk-generation.ts',
  'backend/scripts/test-auth-session.ts',
  'backend/scripts/test-create-user.ts'
];
for (const f of scriptsToDelete) {
  const fullPath = path.join(rootDir, f);
  if (fs.existsSync(fullPath)) {
    fs.unlinkSync(fullPath);
    count++;
  }
}

console.log('Deleted files:', count);
