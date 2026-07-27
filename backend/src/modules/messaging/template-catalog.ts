import type { TemplateCategory } from '@prisma/client';

/**
 * Starter catalog of Hindi-first WhatsApp templates provisioned for an
 * institution when the messaging service is enabled. `placeholders` lists the
 * variable keys per component, in the order they fill the template's {{n}} slots.
 *
 * NOTE: In production each template must be approved by Meta and its
 * `metaTemplateName`/`metaTemplateId` synced. We provision them ready-to-use for
 * development; the production onboarding flow submits them for approval.
 */
export interface CatalogTemplate {
  code: string;
  category: TemplateCategory;
  language: string;
  bodyText: string;
  placeholders: Record<string, string[]>;
  buttonConfig?: Record<string, unknown> | null;
}

export const DEFAULT_TEMPLATE_CATALOG: CatalogTemplate[] = [
  {
    code: 'attendance_absent',
    category: 'utility',
    language: 'hi',
    bodyText:
      'नमस्ते {{1}} जी, आपका बच्चा {{2}} आज ({{3}}) स्कूल में अनुपस्थित रहा। यदि यह जानकारी ग़लत है तो विद्यालय से संपर्क करें।',
    placeholders: { body: ['guardian_name', 'child_name', 'date'] },
  },
  {
    code: 'digest_daily',
    category: 'utility',
    language: 'hi',
    bodyText:
      'नमस्ते {{1}} जी, आपके बच्चों के लिए आज {{2}} नई सूचनाएँ हैं:\n{{3}}',
    placeholders: { body: ['guardian_name', 'count', 'summary'] },
  },
  {
    code: 'fee_reminder',
    category: 'utility',
    language: 'hi',
    bodyText:
      'नमस्ते {{1}} जी, {{2}} की फीस ₹{{3}} बकाया है। कृपया नीचे दिए लिंक से भुगतान करें।',
    placeholders: { body: ['guardian_name', 'child_name', 'amount'], button: ['payment_link'] },
    buttonConfig: { type: 'url', index: 0 },
  },
  {
    code: 'result_published',
    category: 'utility',
    language: 'hi',
    bodyText:
      'नमस्ते {{1}} जी, {{2}} का {{3}} परीक्षा परिणाम घोषित हो गया है। विवरण के लिए विद्यालय से संपर्क करें।',
    placeholders: { body: ['guardian_name', 'child_name', 'exam_name'] },
  },
  {
    code: 'exam_schedule',
    category: 'utility',
    language: 'hi',
    bodyText:
      'नमस्ते {{1}} जी, {{2}} की {{3}} परीक्षा {{4}} से शुरू होगी। कृपया तैयारी सुनिश्चित करें।',
    placeholders: { body: ['guardian_name', 'child_name', 'exam_name', 'start_date'] },
  },
  {
    code: 'general_announcement',
    category: 'utility',
    language: 'hi',
    bodyText: 'नमस्ते {{1}} जी, विद्यालय की ओर से सूचना: {{2}}',
    placeholders: { body: ['guardian_name', 'message'] },
  },
  {
    code: 'payment_confirmation',
    category: 'utility',
    language: 'hi',
    bodyText:
      'नमस्ते {{1}} जी, {{2}} की फीस ₹{{3}} का भुगतान प्राप्त हो गया है (रसीद: {{4}})। धन्यवाद!',
    placeholders: { body: ['guardian_name', 'child_name', 'amount', 'invoice_number'] },
  },
  {
    code: 'transport_alert',
    category: 'utility',
    language: 'hi',
    bodyText: 'नमस्ते {{1}} जी, परिवहन सूचना: {{2}}',
    placeholders: { body: ['guardian_name', 'message'] },
  },
  {
    code: 'health_alert',
    category: 'utility',
    language: 'hi',
    bodyText: 'नमस्ते {{1}} जी, आपके बच्चे को स्कूल के स्वास्थ्य कक्ष में देखा गया है। कृपया विद्यालय से संपर्क करें।',
    placeholders: { body: ['guardian_name'] },
  },
];
