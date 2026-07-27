/**
 * Shared branding context for ALL printable documents.
 * Returns the flat, unified branding vocabulary every default template expects,
 * with logo/signature/seal inlined as data URIs and the principal resolved from
 * institution_authorities (preferring PRINCIPAL, else lowest displayOrder).
 *
 * Reuse this in every document service's templateData so branding is identical
 * across ID cards, marksheets, certificates, etc.
 */
import { prisma } from '../config/database.js';
import { toDataUri } from './asset-inline.js';

const ROLE_LABELS: Record<string, string> = {
    PRINCIPAL: 'Principal', VICE_CHANCELLOR: 'Vice Chancellor', HOD: 'Head of Department',
    REGISTRAR: 'Registrar', DEAN: 'Dean', DIRECTOR: 'Director', COORDINATOR: 'Coordinator', TEACHER: 'Teacher',
};

export interface BrandingContext {
    institutionName: string;
    institutionAddress: string;
    institutionLogo: string;
    principalSignature: string;
    principalName: string;
    principalTitle: string;
    schoolSeal: string;
}

export async function buildBrandingContext(institutionId: string, tx: any = prisma): Promise<BrandingContext> {
    const inst = await tx.institution.findUnique({
        where: { id: institutionId },
        select: { name: true, address: true, logoUrl: true, signatureUrl: true, sealUrl: true, signatureTitle: true },
    });
    const authorities = await tx.institutionAuthority.findMany({
        where: { institutionId },
        orderBy: { displayOrder: 'asc' },
        select: { name: true, designation: true, roleType: true, signatureUrl: true },
    });
    const principal =
        authorities.find((a: { roleType: string }) => a.roleType === 'PRINCIPAL') || authorities[0] || null;

    const [institutionLogo, principalSignature, schoolSeal] = await Promise.all([
        toDataUri(inst?.logoUrl),
        toDataUri(principal?.signatureUrl || inst?.signatureUrl),
        toDataUri(inst?.sealUrl),
    ]);

    return {
        institutionName: inst?.name || '',
        institutionAddress: inst?.address || '',
        institutionLogo,
        principalSignature,
        principalName: principal?.name || '',
        principalTitle:
            principal?.designation || (principal ? ROLE_LABELS[principal.roleType] : '') ||
            inst?.signatureTitle || 'Principal',
        schoolSeal,
    };
}
