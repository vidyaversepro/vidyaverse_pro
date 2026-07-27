/**
 * Phase 2 smoke test — fees + payments end-to-end against dev DB + Redis.
 * No Razorpay creds => payment link is a dev placeholder and WhatsApp sends are
 * skipped, but the full flow (invoice -> link -> reminder over the rail ->
 * simulated webhook -> mark paid -> confirmation) is exercised.
 *
 * Run: tsx src/scripts/smoke-payments.ts
 */
import { prisma } from '../config/database.js';
import { messagingService } from '../modules/messaging/messaging.service.js';
import { paymentsService } from '../modules/payments/payments.service.js';
import { waOutboxQueue } from '../config/queue.js';
import { waOutboxWorker } from '../workers/waOutboxWorker.js';

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
  // ── Setup (reuse the VV-SMOKE tenant) ──
  const inst = await prisma.institution.upsert({
    where: { code: 'VV-SMOKE' },
    update: { enabledServices: ['whatsapp_messaging'] },
    create: { name: 'Smoke Test School', code: 'VV-SMOKE', enabledFields: {}, customFields: {}, enabledServices: ['whatsapp_messaging'] },
  });
  const klass = await prisma.class.upsert({
    where: { institutionId_name: { institutionId: inst.id, name: 'Class 5' } },
    update: {}, create: { institutionId: inst.id, name: 'Class 5' },
  });
  let section = await prisma.section.findFirst({ where: { classId: klass.id, name: 'A' } });
  section ??= await prisma.section.create({ data: { institutionId: inst.id, classId: klass.id, name: 'A' } });
  let student = await prisma.student.findFirst({ where: { institutionId: inst.id, name: 'Aarav Sharma' } });
  student ??= await prisma.student.create({ data: { institutionId: inst.id, sectionId: section.id, name: 'Aarav Sharma', customData: {} } });
  const guardian = await prisma.guardian.upsert({
    where: { institutionId_whatsappNumber: { institutionId: inst.id, whatsappNumber: '919999900001' } },
    update: {}, create: { institutionId: inst.id, firstName: 'Sunita', whatsappNumber: '919999900001', role: 'mother', source: 'manual' },
  });
  await prisma.guardianStudentLink.upsert({
    where: { guardianId_studentId: { guardianId: guardian.id, studentId: student.id } },
    update: { notifyFees: true },
    create: { institutionId: inst.id, guardianId: guardian.id, studentId: student.id, isPrimary: true, notifyFees: true },
  });
  await messagingService.provisionDefaultTemplates(inst.id);

  // ── Test 1: invoice creation + netAmount computation ──
  const invoice = await paymentsService.createInvoice(inst.id, {
    studentId: student.id, amount: 5000, discount: 200, lateFee: 100, dueDate: '2026-06-15',
  });
  const net = Number(invoice.netAmount);
  record('invoice netAmount computed', net === 4900, `amount=5000 discount=200 lateFee=100 => net=${net} (expected 4900)`);

  // ── Test 2: payment link ──
  const link = await paymentsService.createPaymentLink(inst.id, invoice.id);
  record('payment link generated', !!link.shortUrl, `shortUrl=${link.shortUrl} skipped=${link.skipped}`);

  // ── Test 3: fee reminder over the rail ──
  const reminder = await paymentsService.sendFeeReminder(inst.id, invoice.id);
  const reminderOutbox = await pollUntil(() =>
    prisma.outbox.findFirst({ where: { recipientId: guardian.id, templateCode: 'fee_reminder', status: 'sent' }, orderBy: { createdAt: 'desc' } }),
  );
  const reminderMsg = reminderOutbox ? await prisma.message.findFirst({ where: { outboxId: reminderOutbox.id } }) : null;
  record('fee reminder pipeline', reminder.sent === 1 && !!reminderOutbox && !!reminderMsg, `sent=${reminder.sent}, outbox=${reminderOutbox?.status}, msg=${reminderMsg?.status}`);

  // ── Test 4: webhook -> mark paid -> confirmation ──
  const paid = await paymentsService.markInvoicePaid({
    institutionId: inst.id, invoiceId: invoice.id, amount: 4900,
    gatewayProvider: 'razorpay', gatewayPaymentId: `pay_smoke_${Date.now()}`, gatewayOrderId: link.linkId, method: 'upi', guardianId: guardian.id,
  });
  const refreshed = await prisma.feeInvoice.findUnique({ where: { id: invoice.id } });
  const payment = await prisma.feePayment.findFirst({ where: { invoiceId: invoice.id } });
  const confirmOutbox = await pollUntil(() =>
    prisma.outbox.findFirst({ where: { recipientId: guardian.id, templateCode: 'payment_confirmation', status: 'sent' }, orderBy: { createdAt: 'desc' } }),
  );
  const confirmMsg = confirmOutbox ? await prisma.message.findFirst({ where: { outboxId: confirmOutbox.id } }) : null;
  record(
    'payment + confirmation pipeline',
    paid.ok === true && refreshed?.status === 'paid' && !!payment && !!confirmOutbox && !!confirmMsg,
    `invoice=${refreshed?.status}, payment=${payment?.status}, confirm outbox=${confirmOutbox?.status}, msg=${confirmMsg?.status}`,
  );

  const passed = results.filter((r) => r.pass).length;
  console.log(`\n=== ${passed}/${results.length} checks passed ===\n`);
  return passed === results.length;
}

main()
  .then(async (ok) => {
    await waOutboxWorker.close();
    await waOutboxQueue.close();
    await prisma.$disconnect();
    process.exit(ok ? 0 : 1);
  })
  .catch(async (err) => {
    console.error('SMOKE TEST ERROR:', err);
    await prisma.$disconnect().catch(() => {});
    process.exit(1);
  });
