/**
 * Phase 4.1 R2 storage smoke. Drives the SAME high-level `storage` helper that
 * services use (upload/exists/signedUrl/delete), not the raw S3Client — so a
 * pass here proves the production code path against real Cloudflare R2.
 *
 * Steps:
 *   1. config sanity (endpoint is not the placeholder, creds are non-empty)
 *   2. HeadBucket-equivalent via `initializeMinio` (also exercises Phase 0's
 *      "boot doesn't crash" guarantee in production mode)
 *   3. fileExists on a fresh key → expect false
 *   4. uploadFile (13 bytes)                     ← writes to your bucket
 *   5. fileExists → expect true
 *   6. getSignedUrl + actually fetch it → bytes match
 *   7. deleteFile
 *   8. fileExists → expect false again
 *
 * The smoke key is `__smoke__/r2-smoke-<timestamp>.txt`, scoped to a __smoke__
 * prefix so accidental leftovers are easy to spot/clean. The script cleans up
 * itself in the happy path; on failure the assertion explains which step.
 *
 * Run: tsx src/scripts/smoke-r2.ts
 */
import { env } from '../config/env.js';
import { storage, initializeMinio } from '../config/minio.js';

interface Check { name: string; pass: boolean; detail: string }
const results: Check[] = [];
function check(name: string, pass: boolean, detail: string) {
  results.push({ name, pass, detail });
  console.log(`${pass ? 'PASS' : 'FAIL'}  ${name} — ${detail}`);
}

const TEST_KEY = `__smoke__/r2-smoke-${Date.now()}.txt`;
const TEST_BODY = Buffer.from('phase4-r2-ok\n');

async function main() {
  console.log(`\n[smoke-r2] endpoint=${env.R2_ENDPOINT}  bucket=${env.R2_BUCKET_NAME}  region=${env.R2_REGION}`);
  console.log(`[smoke-r2] key=${TEST_KEY}  body=${TEST_BODY.length}B\n`);

  // 1. config sanity — fail fast if the env still has placeholders
  const endpointOk = !env.R2_ENDPOINT.includes('rotated') && !env.R2_ENDPOINT.includes('example');
  const accessOk = env.R2_ACCESS_KEY_ID.length > 5 && !env.R2_ACCESS_KEY_ID.startsWith('rotated');
  const secretOk = env.R2_SECRET_ACCESS_KEY.length > 5 && !env.R2_SECRET_ACCESS_KEY.startsWith('rotated');
  check('1. R2_ENDPOINT not placeholder', endpointOk, `endpoint=${env.R2_ENDPOINT}`);
  check('1a. R2_ACCESS_KEY_ID looks real', accessOk, `len=${env.R2_ACCESS_KEY_ID.length} prefix=${env.R2_ACCESS_KEY_ID.slice(0, 4)}…`);
  check('1b. R2_SECRET_ACCESS_KEY looks real', secretOk, `len=${env.R2_SECRET_ACCESS_KEY.length}`);
  if (!endpointOk || !accessOk || !secretOk) {
    console.log('\n[smoke-r2] env still has placeholders — aborting before any network call.');
    process.exit(1);
  }

  // 2. connectivity / credentials — initializeMinio HEADs a known-missing key.
  // Catches: wrong endpoint host (DNS fail), bucket doesn't exist (NoSuchBucket),
  // wrong creds (InvalidAccessKeyId/SignatureDoesNotMatch), token without bucket
  // permission. A 404 on the synthetic __health-check__ key is the success path.
  try {
    await initializeMinio();
    check('2. initializeMinio reached R2 (credentials + bucket OK)', true, 'no throw');
  } catch (err) {
    check('2. initializeMinio reached R2 (credentials + bucket OK)', false,
      err instanceof Error ? err.message : String(err));
    process.exit(1);
  }

  // 3. pre-upload: key should not exist
  const existsBefore = await storage.fileExists(TEST_KEY);
  check('3. fileExists on fresh key returns false', existsBefore === false, `existed=${existsBefore}`);

  // 4. upload
  let publicUrl = '';
  try {
    publicUrl = await storage.uploadFile(TEST_KEY, TEST_BODY, 'text/plain');
    check('4. uploadFile succeeded', !!publicUrl && publicUrl.includes(TEST_KEY),
      `publicUrl=${publicUrl}`);
  } catch (err) {
    check('4. uploadFile succeeded', false, err instanceof Error ? err.message : String(err));
    process.exit(1);
  }

  // 5. post-upload exists
  const existsAfter = await storage.fileExists(TEST_KEY);
  check('5. fileExists after upload returns true', existsAfter === true, `exists=${existsAfter}`);

  // 6. signed-URL round-trip — proves the object is actually readable, not just
  // listed. Fetch verifies bytes match what we wrote (catches the "uploaded to
  // wrong bucket / region" class of misconfig that doesn't fail HeadBucket).
  let fetched = Buffer.alloc(0);
  try {
    const signed = await storage.getSignedUrl(TEST_KEY, 60);
    const res = await fetch(signed);
    if (!res.ok) throw new Error(`signed GET ${res.status}`);
    fetched = Buffer.from(await res.arrayBuffer());
    check('6. signed URL fetch matches uploaded bytes',
      fetched.equals(TEST_BODY),
      `got=${fetched.length}B expected=${TEST_BODY.length}B`);
  } catch (err) {
    check('6. signed URL fetch matches uploaded bytes', false,
      err instanceof Error ? err.message : String(err));
    // continue to cleanup
  }

  // 7. delete
  try {
    await storage.deleteFile(TEST_KEY);
    check('7. deleteFile succeeded', true, 'no throw');
  } catch (err) {
    check('7. deleteFile succeeded', false, err instanceof Error ? err.message : String(err));
  }

  // 8. post-delete: gone
  const existsFinal = await storage.fileExists(TEST_KEY);
  check('8. fileExists after delete returns false', existsFinal === false, `exists=${existsFinal}`);

  const passed = results.filter((r) => r.pass).length;
  const failed = results.length - passed;
  console.log(`\n[smoke-r2] ${passed}/${results.length} passed${failed ? ` (${failed} FAILED)` : ''}`);
  process.exit(failed ? 1 : 0);
}

main().catch(async (err) => {
  console.error('\n[smoke-r2] threw:', err);
  // best-effort cleanup so a partial run doesn't leave debris
  try { await storage.deleteFile(TEST_KEY); } catch {}
  process.exit(1);
});
