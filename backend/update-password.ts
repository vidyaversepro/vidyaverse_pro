import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
    const email = 'study0644@gmail.com';
    const newPassword = 'Virat@2053.';
    const hash = await bcrypt.hash(newPassword, 10);

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
        console.log('Password updated in credential account.');
    } else {
        // Create an account if it doesn't exist
        await prisma.account.create({
            data: {
                id: Math.random().toString(36).substring(7),
                accountId: user.id,
                providerId: 'credential',
                userId: user.id,
                password: hash
            }
        });
        console.log('Created new credential account with password.');
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
