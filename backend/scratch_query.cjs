const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  const count = await prisma.student.count({
    where: {
      photoEnhancedUrl: { not: null }
    }
  });
  console.log('Result:', count);
}

main().finally(() => prisma.$disconnect());
