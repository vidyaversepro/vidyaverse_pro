import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

async function run() {
  const student = await prisma.student.findFirst({
    where: { name: { contains: 'Aarav' } }
  });
  console.log(JSON.stringify(student, null, 2));
}

run()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
