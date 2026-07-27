import { prisma } from '../../config/database.js';
import { getTenantPrisma } from '../../lib/prisma-tenant.js';
import { logger } from '../../utils/logger.js';
import { NotFoundError } from '../../utils/errors.js';
import { classifyIntent, type Intent } from '../../lib/ai/intent.js';
import { sendTextMessage } from '../../lib/whatsapp/client.js';
import { attendanceService } from '../attendance/attendance.service.js';
import { paymentsService } from '../payments/payments.service.js';
import type { MediaType } from '@prisma/client';

type GuardianRef = { id: string; firstName: string };

export const inboundService = {
  async resolveInstitutionByPhoneNumberId(phoneNumberId: string): Promise<string | null> {
    const inst = await prisma.institution.findFirst({ where: { whatsappPhoneNumberId: phoneNumberId }, select: { id: true } });
    return inst?.id ?? null;
  },

  async findGuardianByPhone(institutionId: string, phone: string): Promise<GuardianRef | null> {
    const digits = phone.replace(/\D/g, '');
    const db = getTenantPrisma(institutionId);
    return db.guardian.findFirst({ where: { whatsappNumber: digits }, select: { id: true, firstName: true } });
  },

  async getPrimaryStudentId(institutionId: string, guardianId: string): Promise<string | null> {
    const db = getTenantPrisma(institutionId);
    const link = await db.guardianStudentLink.findFirst({ where: { guardianId }, orderBy: { isPrimary: 'desc' } });
    return link?.studentId ?? null;
  },

  async getOrCreateConversation(institutionId: string, guardianId: string) {
    const db = getTenantPrisma(institutionId);
    return db.conversation.upsert({
      where: { institutionId_guardianId: { institutionId, guardianId } },
      update: {},
      create: { institutionId, guardianId },
    });
  },

  async logConversationMessage(institutionId: string, conversationId: string, direction: 'inbound' | 'outbound', text: string, intent?: Intent | null) {
    const db = getTenantPrisma(institutionId);
    await db.conversationMessage.create({
      data: { institutionId, conversationId, direction, text: text.slice(0, 2000), intent: intent ?? null },
    });
  },

  /** Record an inbound WhatsApp message row (called by the webhook). */
  async recordInboundMessage(institutionId: string, guardianId: string, waMessageId: string) {
    const db = getTenantPrisma(institutionId);
    await db.message.create({
      data: { institutionId, guardianId, channel: 'whatsapp', waMessageId, direction: 'inbound', status: 'received' },
    });
  },

  /** Full inbound-text flow: classify -> route to data -> reply -> log. */
  async handleInboundText(institutionId: string, guardian: GuardianRef, phone: string, text: string) {
    const conv = await this.getOrCreateConversation(institutionId, guardian.id);
    await this.logConversationMessage(institutionId, conv.id, 'inbound', text);

    const cls = await classifyIntent(text);
    const reply = await this.routeIntent(institutionId, guardian, cls.intent, text);

    await this.logConversationMessage(institutionId, conv.id, 'outbound', reply, cls.intent);
    const db = getTenantPrisma(institutionId);
    await db.conversation.update({
      where: { id: conv.id },
      data: { lastIntent: cls.intent, lastMessageAt: new Date(), messageCount: { increment: 2 } },
    });

    await this.sendReply(institutionId, phone, reply);
    logger.info('[inbound] handled text', { institutionId, intent: cls.intent, source: cls.source });
    return { intent: cls.intent, reply, conversationId: conv.id };
  },

  async sendReply(institutionId: string, phone: string, text: string) {
    const inst = await prisma.institution.findUnique({ where: { id: institutionId }, select: { whatsappPhoneNumberId: true } });
    const result = await sendTextMessage(inst?.whatsappPhoneNumberId ?? '', phone, text);
    const db = getTenantPrisma(institutionId);
    await db.message.create({
      data: {
        institutionId,
        channel: 'whatsapp',
        direction: 'outbound',
        waMessageId: result.waMessageId ?? null,
        status: result.skipped ? 'skipped_no_creds' : result.ok ? 'sent' : 'failed',
      },
    });
    return result;
  },

  // ── Intent routing (grounded in real Vidyaverse data) ──
  async routeIntent(institutionId: string, guardian: GuardianRef, intent: Intent, _text: string): Promise<string> {
    const studentId = await this.getPrimaryStudentId(institutionId, guardian.id);

    switch (intent) {
      case 'attendance_query':
        return this.attendanceReply(institutionId, studentId);
      case 'fee_query':
        return this.feeReply(institutionId, studentId);
      case 'payment_proof':
        return 'आपका भुगतान प्रमाण प्राप्त हुआ। समीक्षा के बाद पुष्टि भेजी जाएगी। 🙏';
      case 'absence_notification':
        return 'धन्यवाद, हमने आपके संदेश को विद्यालय तक पहुँचा दिया है।';
      case 'exam_query':
        return this.examReply(institutionId, studentId);
      case 'emergency':
        await this.escalateToAdmins(institutionId, guardian, _text);
        return 'आपका संदेश प्राथमिकता पर लिया गया है। हमारा स्टाफ़ तुरंत आपसे संपर्क करेगा।';
      case 'complaint':
        await this.escalateToAdmins(institutionId, guardian, _text);
        return 'आपकी शिकायत दर्ज कर ली गई है। हम शीघ्र संपर्क करेंगे।';
      case 'greeting':
        return `नमस्ते ${guardian.firstName} जी! 🙏 आप उपस्थिति, फीस या परीक्षा के बारे में पूछ सकते हैं।`;
      default:
        return 'धन्यवाद! हमें आपका संदेश मिल गया है। हमारा स्टाफ़ जल्द ही आपसे संपर्क करेगा।';
    }
  },

  async attendanceReply(institutionId: string, studentId: string | null): Promise<string> {
    if (!studentId) return 'क्षमा करें, हमें आपके बच्चे का रिकॉर्ड नहीं मिला। कृपया विद्यालय से संपर्क करें।';
    const student = await prisma.student.findUnique({ where: { id: studentId }, select: { name: true } });
    const result = await attendanceService.getStudentAttendance(studentId, institutionId);
    const { total, present, late } = result.stats;
    if (total === 0) return `${student?.name ?? 'आपके बच्चे'} के लिए अभी कोई उपस्थिति रिकॉर्ड नहीं है।`;
    return `${student?.name ?? 'आपके बच्चे'} की उपस्थिति ${result.stats.attendanceRate}% है (${present + late}/${total} दिन उपस्थित)।`;
  },

  async feeReply(institutionId: string, studentId: string | null): Promise<string> {
    if (!studentId) return 'क्षमा करें, हमें आपके बच्चे का रिकॉर्ड नहीं मिला।';
    const db = getTenantPrisma(institutionId);
    const invoices = await db.feeInvoice.findMany({ where: { studentId, status: { in: ['unpaid', 'partial'] } }, orderBy: { dueDate: 'asc' } });
    if (invoices.length === 0) return 'आपके बच्चे की कोई बकाया फीस नहीं है। धन्यवाद! ✅';
    const outstanding = invoices.reduce((sum, i) => sum + (Number(i.netAmount) - Number(i.paidAmount)), 0);
    let link = invoices[0].paymentLinkUrl;
    if (!link) {
      const created = await paymentsService.createPaymentLink(institutionId, invoices[0].id).catch(() => null);
      link = created?.shortUrl ?? null;
    }
    return `आपके बच्चे की बकाया फीस ₹${outstanding.toFixed(2)} है।${link ? ` भुगतान करें: ${link}` : ''}`;
  },

  async examReply(institutionId: string, studentId: string | null): Promise<string> {
    if (!studentId) return 'परीक्षा संबंधी जानकारी के लिए कृपया विद्यालय से संपर्क करें।';
    const db = getTenantPrisma(institutionId);
    const published = await db.marksheet.count({ where: { studentId, status: 'published' } });
    return published > 0
      ? 'आपके बच्चे का परीक्षा परिणाम उपलब्ध है। विवरण के लिए विद्यालय से संपर्क करें या पोर्टल देखें।'
      : 'अभी कोई परिणाम प्रकाशित नहीं हुआ है। प्रकाशित होते ही आपको सूचित किया जाएगा।';
  },

  async escalateToAdmins(institutionId: string, guardian: GuardianRef, text: string) {
    const admins = await prisma.userInstitutionRole.findMany({
      where: { institutionId, role: { in: ['main_admin', 'school_admin'] } },
      select: { userId: true },
    });
    for (const a of admins) {
      await prisma.notification.create({
        data: {
          institutionId,
          userId: a.userId,
          title: 'अभिभावक से तत्काल संदेश',
          message: `${guardian.firstName}: ${text.slice(0, 400)}`,
          type: 'warning',
        },
      });
    }
    logger.warn('[inbound] escalated to admins', { institutionId, admins: admins.length });
  },

  // ── Fee payment claims (parent-uploaded proof) ──
  async createPaymentClaim(params: {
    institutionId: string;
    guardianId: string;
    objectPath: string;
    mediaType: MediaType;
    invoiceId?: string;
    claimAmount?: number;
  }) {
    const db = getTenantPrisma(params.institutionId);
    let invoiceId = params.invoiceId;
    if (!invoiceId) {
      const studentId = await this.getPrimaryStudentId(params.institutionId, params.guardianId);
      if (studentId) {
        const inv = await db.feeInvoice.findFirst({ where: { studentId, status: { in: ['unpaid', 'partial'] } }, orderBy: { dueDate: 'asc' } });
        invoiceId = inv?.id;
      }
    }
    if (!invoiceId) return null;
    return db.feePaymentClaim.create({
      data: {
        institutionId: params.institutionId,
        invoiceId,
        submittedByGuardianId: params.guardianId,
        objectPath: params.objectPath,
        mediaType: params.mediaType,
        claimAmount: params.claimAmount != null ? String(params.claimAmount) : null,
        status: 'pending_review',
      },
    });
  },

  async listClaims(institutionId: string, status?: 'pending_review' | 'approved' | 'rejected') {
    const db = getTenantPrisma(institutionId);
    return db.feePaymentClaim.findMany({ where: status ? { status } : undefined, orderBy: { createdAt: 'desc' }, take: 200 });
  },

  async reviewClaim(institutionId: string, claimId: string, decision: 'approved' | 'rejected', reviewerUserId: string, opts: { amount?: number; rejectionReason?: string } = {}) {
    const db = getTenantPrisma(institutionId);
    const claim = await db.feePaymentClaim.findFirst({ where: { id: claimId } });
    if (!claim) throw new NotFoundError('Claim not found');

    await db.feePaymentClaim.update({
      where: { id: claimId },
      data: {
        status: decision,
        reviewedBy: reviewerUserId,
        reviewedAt: new Date(),
        rejectionReason: decision === 'rejected' ? opts.rejectionReason ?? null : null,
      },
    });

    if (decision === 'approved') {
      const amount = opts.amount ?? Number(claim.claimAmount ?? 0);
      if (amount > 0) {
        await paymentsService.markInvoicePaid({
          institutionId,
          invoiceId: claim.invoiceId,
          amount,
          gatewayPaymentId: `claim_${claimId}`,
          method: 'bank_transfer',
          guardianId: claim.submittedByGuardianId,
        });
      }
    }
    return { ok: true, decision };
  },

  async listConversations(institutionId: string) {
    const db = getTenantPrisma(institutionId);
    return db.conversation.findMany({ orderBy: { lastMessageAt: 'desc' }, take: 100 });
  },
};
