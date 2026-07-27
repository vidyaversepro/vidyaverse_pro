import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
    const user = await prisma.user.findUnique({ where: { email: 'study0644@gmail.com' } });
    if (!user) return console.log('User not found');
    
    const student = await prisma.student.findUnique({ where: { userId: user.id } });
    console.log('Linked Student:', student);

    const roles = await prisma.userInstitutionRole.findMany({ where: { userId: user.id } });
    console.log('Institution Roles:', roles);
}

main().finally(() => prisma.$disconnect());
