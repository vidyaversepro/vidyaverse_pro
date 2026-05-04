import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
    const sections = await prisma.section.findMany({
        where: {
            admissionSlots: { some: {} }
        },
        include: {
            class: true,
            _count: {
                select: { admissionSlots: true, students: true }
            }
        }
    });
    console.log(JSON.stringify(sections, null, 2));
}

main().catch(console.error).finally(() => prisma.$disconnect());
