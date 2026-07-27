import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();
async function main() {
  const user = await prisma.$queryRaw`SELECT id, email FROM users WHERE email = 'study0644@gmail.com'`;
  console.log('USER:', user);
  const student = await prisma.$queryRaw`SELECT id, user_id, parent_email, name FROM students WHERE parent_email = 'study0644@gmail.com'`;
  console.log('STUDENT:', student);
}
main();
