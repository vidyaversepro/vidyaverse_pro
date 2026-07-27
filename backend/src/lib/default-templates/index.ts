/**
 * Registry of curated default templates (HTML/Handlebars) per ServiceType.
 * Single source for: lazy-seeding defaults, the in-app preview, and lint.
 * Branding keys are supplied separately by buildBrandingContext().
 */
import { ID_CARD_HTML } from './id-card.js';
import { MARKSHEET_HTML } from './marksheet.js';
import { CERTIFICATE_HTML } from './certificate.js';
import { HALL_TICKET_HTML } from './hall-ticket.js';
import { TRANSFER_CERTIFICATE_HTML } from './transfer-certificate.js';
import { LIBRARY_CARD_HTML } from './library-card.js';
import { VISITING_CARD_HTML } from './visiting-card.js';

export interface DefaultTemplate {
    name: string;
    html: string;
    widthMm: number;
    heightMm: number;
    orientation: 'portrait' | 'landscape';
    /** Type-specific sample data for preview/lint (branding merged in by caller). */
    sample: Record<string, any>;
}

export const DEFAULT_TEMPLATES: Record<string, DefaultTemplate> = {
    id_card: {
        name: 'Student ID Card — Standard', html: ID_CARD_HTML, widthMm: 85.6, heightMm: 53.98, orientation: 'landscape',
        sample: {
            studentName: 'आरव शर्मा · Aarav Sharma', admissionNo: 'VG0-2620-0001', className: 'XI - A',
            dob: '14/03/2012', bloodGroup: 'B+', fatherName: 'राजेश शर्मा / Rajesh Sharma', phone: '+91 98765 43210',
            academicYear: '2026-2027', validUntil: '31/03/2027', photoUrl: '', qrCode: '',
        },
    },
    marksheet: {
        name: 'Marksheet — Standard', html: MARKSHEET_HTML, widthMm: 210, heightMm: 297, orientation: 'portrait',
        sample: {
            examName: 'वार्षिक परीक्षा · Annual Examination', academicYear: '2026-2027',
            student: { name: 'आरव शर्मा · Aarav Sharma', admissionNumber: 'VG0-2620-0001', fatherName: 'राजेश शर्मा', motherName: 'सुनीता शर्मा', dob: '2012-03-14' },
            class: { name: 'XI' }, section: { name: 'A' }, stream: { name: 'Science' },
            subjects: ['हिंदी / Hindi', 'English', 'गणित / Mathematics', 'विज्ञान / Science', 'सामाजिक विज्ञान / Social Science', 'संस्कृत / Sanskrit', 'कंप्यूटर / Computer'].map((subjectName, i) => {
                const marksObtained = 62 + ((i * 8) % 36);
                return { subjectName, maxMarks: 100, marksObtained, percentage: marksObtained, grade: marksObtained >= 81 ? 'A' : marksObtained >= 71 ? 'B+' : 'B' };
            }),
            results: { totalMarks: 0, maxMarks: 700, percentage: 0, grade: 'A', result: 'उत्तीर्ण · PASS', marksheetNumber: 'MS-2026-VG-0001' },
        },
    },
    certificate: {
        name: 'Certificate — Standard', html: CERTIFICATE_HTML, widthMm: 297, heightMm: 210, orientation: 'landscape',
        sample: {
            certificateTitle: 'MERIT', studentName: 'आरव शर्मा · Aarav Sharma', className: 'XI-A', academicYear: '2026-2027',
            place: 'Surat', issueDate: '14/06/2026', certificateNumber: 'CRT-2026-VG-0001',
            bodyHtml: 'of Class <b>XI-A</b> has secured <b>First Position</b> in the Annual Examination 2026-27 with distinction, and is hereby awarded this Certificate of Merit in recognition of outstanding academic excellence.',
        },
    },
    hall_ticket: {
        name: 'Hall Ticket — Standard', html: HALL_TICKET_HTML, widthMm: 210, heightMm: 297, orientation: 'portrait',
        sample: {
            studentName: 'आरव शर्मा · Aarav Sharma', rollNo: '11A-07', admissionNumber: 'VG0-2620-0001', className: 'XI - A',
            examName: 'वार्षिक परीक्षा · Annual Examination', academicYear: '2026-2027', examCenter: 'Main Campus, Rander',
            schedule: [
                { date: '03/03/2027', day: 'सोम / Mon', subject: 'हिंदी / Hindi', time: '10:00 – 13:00' },
                { date: '05/03/2027', day: 'बुध / Wed', subject: 'English', time: '10:00 – 13:00' },
                { date: '07/03/2027', day: 'शुक्र / Fri', subject: 'गणित / Mathematics', time: '10:00 – 13:00' },
                { date: '10/03/2027', day: 'सोम / Mon', subject: 'विज्ञान / Science', time: '10:00 – 13:00' },
            ],
        },
    },
    transfer_certificate: {
        name: 'Transfer Certificate — Standard', html: TRANSFER_CERTIFICATE_HTML, widthMm: 210, heightMm: 297, orientation: 'portrait',
        sample: {
            studentName: 'आरव शर्मा · Aarav Sharma', fatherName: 'राजेश शर्मा / Rajesh Sharma', motherName: 'सुनीता शर्मा / Sunita Sharma',
            dob: '14/03/2012', dobWords: 'Fourteenth March Two Thousand Twelve', admissionNumber: 'VG0-2620-0001', admissionDate: '01/04/2020',
            leavingDate: '31/03/2026', className: 'XI', lastClassStudied: 'XI - A (Science)', conduct: 'Excellent / उत्तम',
            reason: 'अभिभावक का स्थानांतरण / Parent relocation', remarks: 'All dues cleared. No disciplinary record.',
            tcNumber: 'TC-2026-VG-0001', place: 'Surat', issueDate: '14/06/2026', academicYear: '2025-2026',
        },
    },
    library_card: {
        name: 'Library Card — Standard', html: LIBRARY_CARD_HTML, widthMm: 85.6, heightMm: 53.98, orientation: 'landscape',
        sample: { studentName: 'AARAV SHARMA', libraryId: 'LIB-2026-0042', admissionNumber: 'VG0-2620-0001', className: 'XI - A', validUntil: '31/03/2027' },
    },
    visiting_card: {
        name: 'Visiting Card — Standard', html: VISITING_CARD_HTML, widthMm: 85.6, heightMm: 53.98, orientation: 'landscape',
        sample: { name: 'Virat Sharma', designation: 'Principal · प्रधानाचार्य', phone: '+91 98765 43210', email: 'principal@viratgurukul.in', website: 'www.viratgurukul.in' },
    },
};

export function getDefaultTemplate(serviceType: string): DefaultTemplate | null {
    return DEFAULT_TEMPLATES[serviceType] || null;
}

/** Type-specific sample data (compute derived totals for marksheet). */
export function getSampleData(serviceType: string): Record<string, any> {
    const def = DEFAULT_TEMPLATES[serviceType];
    if (!def) return {};
    const sample = JSON.parse(JSON.stringify(def.sample));
    if (serviceType === 'marksheet' && Array.isArray(sample.subjects)) {
        const total = sample.subjects.reduce((s: number, x: any) => s + (x.marksObtained || 0), 0);
        sample.results.totalMarks = total;
        sample.results.percentage = Math.round((total / sample.results.maxMarks) * 10000) / 100;
    }
    return sample;
}
