const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function run() {
    const result = await prisma.$queryRaw`SELECT COUNT(*) as count FROM students WHERE photo_enhanced_url IS NOT NULL`;
    console.log(result);
}

run().finally(() => prisma.$disconnect());
