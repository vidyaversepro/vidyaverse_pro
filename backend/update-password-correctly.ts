import { PrismaClient } from '@prisma/client';
import { hashPassword } from 'better-auth/crypto';

const prisma = new PrismaClient();

async function main() {
    const email = 'study0644@gmail.com';
    const newPassword = 'Virat@2053.';
    const hash = await hashPassword(newPassword);

    const user = await prisma.user.findUnique({
        where: { email },
        include: { accounts: true }
    });

    if (!user) {
        console.log('User not found');
        return;
    }

    const credentialAccount = user.accounts.find(a => a.providerId === 'credential');

    if (credentialAccount) {
        await prisma.account.update({
            where: { id: credentialAccount.id },
            data: { password: hash }
        });
        console.log('Password updated with valid better-auth hash.');
    }
}

main()
    .catch(e => {
        console.error(e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
