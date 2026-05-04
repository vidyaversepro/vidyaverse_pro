import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

const user = await prisma.user.findFirst({
    where: { email: 'thevinstitution@gmail.com' }
});

if (user) {
    console.log('FOUND:', user.id, user.name, user.email);
    const account = await prisma.account.findFirst({ where: { userId: user.id } });
    console.log('ACCOUNT:', account ? 'exists (' + account.providerId + ')' : 'MISSING');
} else {
    console.log('NOT FOUND - user does not exist in database');
    const count = await prisma.user.count();
    console.log('Total users in DB:', count);
}

await prisma.$disconnect();
