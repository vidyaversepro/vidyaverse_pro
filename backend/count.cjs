const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
async function main() {
  const count = await prisma.visionariumArticle.count();
  console.log(`Total Articles Count: ${count}`);
}
main().catch(console.error).finally(() => prisma.$disconnect());
