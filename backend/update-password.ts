import { PrismaClient } from './node_modules/@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function updatePassword() {
    try {
        const hashedPassword = await bcrypt.hash('Admin@Viratmns.2710', 12);
        await prisma.account.update({
            where: {
                accountId_providerId: {
                    accountId: 'thevinstitution@gmail.com',
                    providerId: 'credential'
                }
            },
            data: {
                password: hashedPassword
            }
        });
        console.log('Password updated successfully');
    } catch (e) {
        console.error(e);
    } finally {
        await prisma.$disconnect();
    }
}

updatePassword();
