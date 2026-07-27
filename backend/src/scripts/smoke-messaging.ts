/**
 * Phase 1 smoke test — drives the real WhatsApp rail end-to-end against the dev
 * DB + Redis. With no WhatsApp creds the Cloud API call is skipped, so a "sent"
 * outbox + a Message row with status 'skipped_no_creds' proves the whole pipeline
 * (enqueue -> BullMQ -> outbox worker -> record, and buffer -> digest worker).
 *
 * Run: tsx src/scripts/smoke-messaging.ts
 */
import { prisma } from '../config/database.js';
import { messagingService } from '../modules/messaging/messaging.service.js';
import { waOutboxQueue, digestFlushQueue } from '../config/queue.js';
// Importing the workers starts them (in-process), so queued jobs get processed.
import { waOutboxWorker } from '../workers/waOutboxWorker.js';
import { digestWorker } from '../workers/digestWorker.js';

async function pollUntil<T>(fn: () => Promise<T | null | undefined>, timeoutMs = 15000, intervalMs = 500): Promise<T | null> {
  const start = Date.now();
  while (Date.now() - start < timeoutMs) {
    const r = await fn();
    if (r) return r;
    await new Promise((res) => setTimeout(res, intervalMs));
  }
  return null;
}

const results: Array<{ name: string; pass: boolean; detail: string }> = [];
function record(name: string, pass: boolean, detail: string) {
  results.push({ name, pass, detail });
  console.log(`${pass ? 'PASS' : 'FAIL'}  ${name} — ${detail}`);
}

async function main() {
  const [instCount, studentCount, guardianCount] = await Promise.all([
    prisma.institution.count(),
    prisma.student.count(),
    prisma.guardian.count(),
  ]);
  console.log(`\nExisting data: ${instCount} institutions, ${studentCount} students, ${guardianCount} guardians\n`);

  // ── Setup (idempotent, isolated under code VV-SMOKE) ──
  const inst = await prisma.institution.upsert({
    where: { code: 'VV-SMOKE' },
    update: { enabledServices: ['whatsapp_messaging'] },
    create: {
      name: 'Smoke Test School',
      code: 'VV-SMOKE',
      enabledFields: {},
      customFields: {},
      enabledServices: ['whatsapp_messaging'],
    },
  });

  const klass = await prisma.class.upsert({
    where: { institutionId_name: { institutionId: inst.id, name: 'Class 5' } },
    update: {},
    create: { institutionId: inst.id, name: 'Class 5' },
  });

  let section = await prisma.section.findFirst({ where: { classId: klass.id, name: 'A' } });
  section ??= await prisma.section.create({
    data: { institutionId: inst.id, classId: klass.id, name: 'A' },
  });

  let student = await prisma.student.findFirst({ where: { institutionId: inst.id, name: 'Aarav Sharma' } });
  student ??= await prisma.student.create({
    data: { institutionId: inst.id, sectionId: section.id, name: 'Aarav Sharma', customData: {} },
  });

  const guardian = await prisma.guardian.upsert({
    where: { institutionId_whatsappNumber: { institutionId: inst.id, whatsappNumber: '919999900001' } },
    update: {},
    create: {
      institutionId: inst.id,
      firstName: 'Sunita',
      whatsappNumber: '919999900001',
      role: 'mother',
      preferredLanguage: 'hi',
      source: 'manual',
    },
  });

  await prisma.guardianStudentLink.upsert({
    where: { guardianId_studentId: { guardianId: guardian.id, studentId: student.id } },
    update: { notifyAttendance: true },
    create: { institutionId: inst.id, guardianId: guardian.id, studentId: student.id, isPrimary: true, notifyAttendance: true },
  });

  // ── Test 0: gating + template provisioning ──
  const enabled = await messagingService.isMessagingEnabled(inst.id);
  record('messaging gate enabled', enabled, `isMessagingEnabled=${enabled}`);

  const prov = await messagingService.provisionDefaultTemplates(inst.id);
  const templates = await messagingService.listTemplates(inst.id);
  record('templates provisioned', templates.length >= 6, `provisioned=${prov.provisioned}, present=${templates.length}`);

  // ── Test 1: direct send through outbox worker ──
  const enq = await messagingService.enqueueMessage({
    institutionId: inst.id,
    recipientType: 'guardian',
    recipientId: guardian.id,
    templateCode: 'general_announcement',
    variables: { guardian_name: guardian.firstName, message: 'स्मोक टेस्ट सूचना' },
    idempotencyKey: `smoke-direct-${Date.now()}`,
  });

  const sentOutbox = await pollUntil(() =>
    prisma.outbox.findFirst({ where: { id: enq.outboxId, status: 'sent' } }),
  );
  const directMsg = sentOutbox
    ? await prisma.message.findFirst({ where: { outboxId: sentOutbox.id } })
    : null;
  record(
    'direct send pipeline',
    !!sentOutbox && !!directMsg,
    sentOutbox ? `outbox=sent, message.status=${directMsg?.status}` : 'outbox never reached sent',
  );

  // ── Test 2: digest batching (buffer -> flush -> batched send) ──
  await messagingService.bufferDigestEvent(inst.id, guardian.id, {
    type: 'attendance_absent',
    studentId: student.id,
    childName: student.name,
    text: `${student.name} आज अनुपस्थित रहा`,
  });
  await digestFlushQueue.add('smoke-flush', {});

  const digestOutbox = await pollUntil(() =>
    prisma.outbox.findFirst({
      where: { recipientId: guardian.id, templateCode: 'digest_daily', status: 'sent' },
      orderBy: { createdAt: 'desc' },
    }),
  );
  const digestMsg = digestOutbox
    ? await prisma.message.findFirst({ where: { outboxId: digestOutbox.id } })
    : null;
  record(
    'digest batching pipeline',
    !!digestOutbox && !!digestMsg,
    digestOutbox ? `digest outbox=sent, message.status=${digestMsg?.status}` : 'digest never produced a send',
  );

  // ── Summary ──
  const passed = results.filter((r) => r.pass).length;
  console.log(`\n=== ${passed}/${results.length} checks passed ===\n`);
  return passed === results.length;
}

main()
  .then(async (ok) => {
    await waOutboxWorker.close();
    await digestWorker.close();
    await waOutboxQueue.close();
    await digestFlushQueue.close();
    await prisma.$disconnect();
    process.exit(ok ? 0 : 1);
  })
  .catch(async (err) => {
    console.error('SMOKE TEST ERROR:', err);
    await prisma.$disconnect().catch(() => {});
    process.exit(1);
  });
