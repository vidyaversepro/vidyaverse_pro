const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
    const section = await prisma.section.findUnique({where: {id: '045a8de1-828a-494e-9d34-539ce0eafe65'}});
    console.log(section);
}

main().finally(() => prisma.$disconnect());
