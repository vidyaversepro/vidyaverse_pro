import { service } from './src/modules/student/service.js';
import { prisma } from './src/config/database.js';

async function main() {
    console.log("Creating self-contained test data...");

    // Cleanup any existing
    const debugCode = 'DBG999';
    await prisma.institution.deleteMany({ where: { code: debugCode } });

    const institution = await prisma.institution.create({
        data: {
            name: 'Debug Inst',
            code: debugCode,
            contactEmail: 'debug@test.com',
            address: 'Test Address'
        }
    });

    const cls = await prisma.class.create({
        data: {
            institutionId: institution.id,
            name: '10th'
        }
    });

    const section = await prisma.section.create({
        data: {
            institutionId: institution.id,
            classId: cls.id,
            name: 'A',
            expectedStudentCount: 50
        }
    });

    console.log("Running generateSectionForms on section", section.id, "expected: 50");
    try {
        await service.generateSectionForms(section.id, section.institutionId);
        console.log("SUCCESS!");
    } catch (e: any) {
        console.error("\n\n=== PRISMA ERROR DUMP ===");
        console.error(e.message);
        console.error("=========================\n\n");
    } finally {
        await prisma.admissionSlot.deleteMany({ where: { sectionId: section.id } });
        await prisma.section.delete({ where: { id: section.id } });
        await prisma.class.delete({ where: { id: cls.id } });
        await prisma.institution.delete({ where: { id: institution.id } });
        await prisma.$disconnect();
    }
}

main();
