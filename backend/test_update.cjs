const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
    try {
        const section = await prisma.section.update({
            where: {
                id: '045a8de1-828a-494e-9d34-539ce0eafe65',
                institutionId: '0ea3b292-ba4d-4e2e-9103-a13e637dbfc5'
            },
            data: { name: 'A' }
        });
        console.log("Success:", section);
    } catch (e) {
        console.error("Error:", e);
    }
}

main().finally(() => prisma.$disconnect());
