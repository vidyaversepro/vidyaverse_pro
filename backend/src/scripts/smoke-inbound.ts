/**
 * Phase 3 smoke test — inbound AI pipeline against dev DB + Redis.
 * No Anthropic key => rule-based intent; no WhatsApp creds => replies are
 * composed + logged but the actual send is skipped. Exercises: text intent
 * routing to real data, conversation logging, and the payment-proof claim ->
 * review -> confirmation loop.
 *
 * Run: tsx src/scripts/smoke-inbound.ts
 */
import crypto from 'crypto';
import { prisma } from '../config/database.js';
import { getTenantPrisma } from '../lib/prisma-tenant.js';
import { messagingService } from '../modules/messaging/messaging.service.js';
import { paymentsService } from '../modules/payments/payments.service.js';
import { inboundService } from '../modules/inbound/inbound.service.js';
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
  const inst = await prisma.institution.upsert({
    where: { code: 'VV-SMOKE' },
    update: { enabledServices: ['whatsapp_messaging'], whatsappPhoneNumberId: 'PNID_SMOKE' },
    create: { name: 'Smoke Test School', code: 'VV-SMOKE', enabledFields: {}, customFields: {}, enabledServices: ['whatsapp_messaging'], whatsappPhoneNumberId: 'PNID_SMOKE' },
  });
  const klass = await prisma.class.upsert({ where: { institutionId_name: { institutionId: inst.id, name: 'Class 5' } }, update: {}, create: { institutionId: inst.id, name: 'Class 5' } });
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
    update: { notifyFees: true }, create: { institutionId: inst.id, guardianId: guardian.id, studentId: student.id, isPrimary: true, notifyFees: true },
  });
  await messagingService.provisionDefaultTemplates(inst.id);
  // Ensure an unpaid invoice exists for fee_query + claim
  const invoice = await paymentsService.createInvoice(inst.id, { studentId: student.id, amount: 5000, dueDate: '2026-06-15' });

  const guardianRef = { id: guardian.id, firstName: guardian.firstName };

  // ── Test 1: phone -> institution resolution ──
  const resolved = await inboundService.resolveInstitutionByPhoneNumberId('PNID_SMOKE');
  record('resolve institution by phone_number_id', resolved === inst.id, `resolved=${resolved === inst.id}`);

  // ── Test 2: inbound fee query -> grounded reply ──
  const feeRes = await inboundService.handleInboundText(inst.id, guardianRef, '+919999900001', 'मेरे बच्चे की फीस कितनी बाकी है?');
  record('inbound fee_query routed to data', feeRes.intent === 'fee_query' && feeRes.reply.includes('₹'), `intent=${feeRes.intent}, reply="${feeRes.reply.slice(0, 60)}…"`);

  // ── Test 3: inbound attendance query ──
  const attRes = await inboundService.handleInboundText(inst.id, guardianRef, '+919999900001', 'मेरे बच्चे की उपस्थिति बताइए');
  record('inbound attendance_query routed', attRes.intent === 'attendance_query', `intent=${attRes.intent}, reply="${attRes.reply.slice(0, 50)}…"`);

  // ── Test 4: conversation persisted with messages ──
  const db = getTenantPrisma(inst.id);
  const conv = await db.conversation.findFirst({ where: { guardianId: guardian.id }, include: { messages: true } });
  record('conversation + messages logged', !!conv && conv.messages.length >= 4, `messages=${conv?.messages.length}, lastIntent=${conv?.lastIntent}`);

  // ── Test 5: payment-proof claim creation ──
  const claim = await inboundService.createPaymentClaim({ institutionId: inst.id, guardianId: guardian.id, objectPath: `inbound/${inst.id}/smoke-proof.jpg`, mediaType: 'image' });
  record('payment claim created (pending_review)', !!claim && claim.status === 'pending_review', `claimId=${claim?.id ?? 'none'}, status=${claim?.status}`);

  // ── Test 6: claim approval -> invoice paid + confirmation over the rail ──
  let approvalOk = false;
  let detail = 'no claim';
  if (claim) {
    await inboundService.reviewClaim(inst.id, claim.id, 'approved', crypto.randomUUID(), { amount: 5000 });
    const refreshed = await prisma.feeInvoice.findUnique({ where: { id: invoice.id } });
    const confirmOutbox = await pollUntil(() =>
      prisma.outbox.findFirst({ where: { recipientId: guardian.id, templateCode: 'payment_confirmation', status: 'sent' }, orderBy: { createdAt: 'desc' } }),
    );
    approvalOk = refreshed?.status === 'paid' && !!confirmOutbox;
    detail = `invoice=${refreshed?.status}, confirmation outbox=${confirmOutbox?.status ?? 'none'}`;
  }
  record('claim approval -> paid + confirmation', approvalOk, detail);

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
