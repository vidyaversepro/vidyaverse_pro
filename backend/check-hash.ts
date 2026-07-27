import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
    const acc = await prisma.account.findFirst({
        where: { password: { not: null }, email: { not: 'study0644@gmail.com' } } as any, // Oops, email is on user
    });
    if (acc) {
        console.log('Sample hash:', acc.password);
    } else {
        const u = await prisma.user.findFirst({
            where: { accounts: { some: { password: { not: null }, providerId: 'credential' } } },
            include: { accounts: true }
        });
        if (u) {
            const a = u.accounts.find(x => x.password);
            console.log('Sample hash:', a?.password);
        }
    }
}

main()
    .catch(console.error)
    .finally(() => prisma.$disconnect());
